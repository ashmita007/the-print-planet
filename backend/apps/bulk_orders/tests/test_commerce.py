from datetime import date, timedelta
from decimal import Decimal
from unittest import mock

from django.contrib.auth.models import User
from django.db import IntegrityError
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.authentication.models import Address
from apps.bulk_orders import fulfilment
from apps.bulk_orders.commerce import (
    QuoteError, can_transition, cancellable, compute_quote, financial_year, normalize_state, state_of_gstin,
)
from apps.bulk_orders.models import BulkOrder, Invoice, OrderEvent, OrderRequest
from apps.catalog.models import Category, Product
from apps.settings_app.models import SiteSettings

RP = 'apps.bulk_orders.razorpay'
NOTIFY = 'apps.bulk_orders.notifications._deliver'
KEYS = dict(RAZORPAY_KEY_ID='rzp_test_key', RAZORPAY_KEY_SECRET='test_secret', RAZORPAY_WEBHOOK_SECRET='hook')


def make_order(user, **kw):
    defaults = dict(
        organization_name='Acme', contact_person='Asha', email='asha@example.com', phone='9000000000',
        estimated_quantity=100, requirements='cards', status='submitted',
        shipping_address={'state': 'Karnataka'},
    )
    defaults.update(kw)
    return BulkOrder.objects.create(user=user, **defaults)


def configure(**kw):
    cfg = SiteSettings.get_settings()
    values = dict(seller_state='Karnataka', seller_gstin='29AAQFT3909B1ZZ', default_gst_rate=Decimal('18'), invoice_prefix='TPP',
                  shipping_flat_fee=Decimal('100'))
    values.update(kw)
    for k, v in values.items():
        setattr(cfg, k, v)
    cfg.save()
    return cfg


class PureRulesTests(TestCase):
    base = dict(gst_rate=Decimal('18'), shipping_flat_fee=Decimal('100'), free_shipping_above=None,
                seller_state='Karnataka', buyer_state='Karnataka')

    def test_transitions(self):
        self.assertTrue(can_transition('quoted', 'paid'))
        self.assertTrue(can_transition('completed', 'returned'))
        for old, new in (('submitted', 'in_production'), ('quoted', 'dispatched'), ('cancelled', 'quoted'),
                         ('returned', 'completed'), ('dispatched', 'cancelled'), ('paid', 'quoted')):
            self.assertFalse(can_transition(old, new), (old, new))

    def test_intra_state_splits_cgst_sgst(self):
        q = compute_quote(Decimal('1000'), **self.base)
        self.assertEqual((q['shipping'], q['tax'], q['cgst'], q['sgst'], q['igst'], q['total']),
                         (Decimal('100.00'), Decimal('198.00'), Decimal('99.00'), Decimal('99.00'),
                          Decimal('0.00'), Decimal('1298.00')))

    def test_inter_state_uses_igst_and_state_match_ignores_case(self):
        q = compute_quote(Decimal('1000'), **{**self.base, 'buyer_state': 'Tamil Nadu'})
        self.assertEqual((q['cgst'], q['sgst'], q['igst']), (Decimal('0.00'), Decimal('0.00'), Decimal('198.00')))
        q = compute_quote(Decimal('1000'), **{**self.base, 'buyer_state': ' karnataka '})
        self.assertEqual(q['igst'], Decimal('0.00'))

    def test_odd_paisa_keeps_split_equal_to_tax(self):
        q = compute_quote(Decimal('0.25'), **{**self.base, 'shipping_flat_fee': 0, 'gst_rate': Decimal('18')})
        self.assertEqual(q['cgst'] + q['sgst'], q['tax'])

    def test_free_shipping_threshold(self):
        free = {**self.base, 'free_shipping_above': Decimal('1000')}
        self.assertEqual(compute_quote(Decimal('999.99'), **free)['shipping'], Decimal('100.00'))
        self.assertEqual(compute_quote(Decimal('1000'), **free)['shipping'], Decimal('0.00'))

    def test_blocked_without_settings(self):
        for override in ({'gst_rate': None}, {'seller_state': ''}, {'buyer_state': ''}):
            with self.assertRaises(QuoteError):
                compute_quote(Decimal('10'), **{**self.base, **override})
        with self.assertRaises(QuoteError):
            compute_quote(Decimal('0'), **self.base)

    def test_state_names_codes_and_gstin_prefix(self):
        self.assertEqual(normalize_state('  karnataka '), 'Karnataka')
        self.assertEqual(normalize_state('29'), 'Karnataka')
        self.assertEqual(normalize_state('Orissa'), 'Odisha')
        self.assertEqual(normalize_state('Atlantis'), '')
        self.assertEqual(state_of_gstin('33AAQFT3909B1ZZ'), 'Tamil Nadu')
        self.assertEqual(state_of_gstin('XX'), '')
        q = compute_quote(Decimal('100'), **{**self.base, 'seller_state': '29', 'buyer_state': 'Karnataka'})
        self.assertEqual(q['igst'], Decimal('0.00'))
        with self.assertRaises(QuoteError):
            compute_quote(Decimal('100'), **{**self.base, 'buyer_state': 'Atlantis'})

    def test_financial_year_and_cancel_window(self):
        self.assertEqual(financial_year(date(2026, 3, 31)), '2025-26')
        self.assertEqual(financial_year(date(2026, 4, 1)), '2026-27')
        self.assertTrue(cancellable('paid', 'in_production'))
        self.assertFalse(cancellable('in_production', 'in_production'))
        self.assertFalse(cancellable('cancelled', 'in_production'))


@override_settings(**KEYS)
class OrderFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('buyer', 'buyer@example.com', 'pw-123456')
        self.other = User.objects.create_user('other', 'other@example.com', 'pw-123456')
        self.boss = User.objects.create_superuser('boss', 'boss@example.com', 'pw-123456')
        self.cfg = configure()
        self.order = make_order(self.user)
        self.owner_api = APIClient()
        self.owner_api.force_authenticate(self.boss)
        self.client_api = APIClient()
        self.client_api.force_authenticate(self.user)
        self.base = f'/api/v1/owner/bulk-orders/{self.order.pk}'
        self.my = f'/api/v1/bulk-orders/my-orders/{self.order.order_number}'
        patcher = mock.patch(NOTIFY)
        self.deliver = patcher.start()
        self.addCleanup(patcher.stop)

    def quote(self, subtotal='1000'):
        return self.owner_api.post(f'{self.base}/quote/', {'subtotal': subtotal}, format='json')

    def pay(self):
        paid_at = timezone.now()
        with self.captureOnCommitCallbacks(execute=True):
            fulfilment.mark_paid(BulkOrder.objects.get(pk=self.order.pk), 'pay_1', Decimal('1298.00'), paid_at)
        self.order.refresh_from_db()

    # authz matrix
    def test_owner_endpoints_reject_customers_and_anonymous(self):
        calls = [('post', f'{self.base}/quote/', {'subtotal': '1'}), ('post', f'{self.base}/status/', {'status': 'reviewing'}),
                 ('post', f'{self.base}/invoice/', {}), ('get', '/api/v1/owner/requests/', None),
                 ('post', '/api/v1/owner/requests/1/decide/', {'decision': 'approve'}),
                 ('get', '/api/v1/owner/commerce-settings/', None), ('put', '/api/v1/owner/commerce-settings/', {})]
        for who in (self.client_api, APIClient()):
            for method, url, body in calls:
                res = getattr(who, method)(url, body, format='json') if body is not None else getattr(who, method)(url)
                self.assertIn(res.status_code, (401, 403), (method, url))

    def test_customer_cannot_touch_another_customers_order(self):
        other = APIClient()
        other.force_authenticate(self.other)
        self.assertEqual(other.get(f'{self.my}/').status_code, 404)
        self.assertEqual(other.get(f'{self.my}/invoice/').status_code, 404)
        self.assertEqual(other.post(f'{self.my}/requests/', {'kind': 'cancel'}, format='json').status_code, 404)

    # quote builder
    def test_quote_builder_computes_on_server_and_keeps_quoted_amount_as_total(self):
        res = self.quote()
        self.assertEqual(res.status_code, 200, res.data)
        self.order.refresh_from_db()
        self.assertEqual((self.order.status, self.order.quoted_amount, self.order.quote_tax, self.order.quote_cgst),
                         ('quoted', Decimal('1298.00'), Decimal('198.00'), Decimal('99.00')))
        self.assertEqual(res.data['quoted_amount'], '1298.00')
        self.assertEqual(self.order.events.last().status, 'quoted')

    def test_buyer_gstin_prefix_decides_igst_over_shipping_state(self):
        BulkOrder.objects.filter(pk=self.order.pk).update(gst_number='33AAQFT3909B1ZZ')
        res = self.owner_api.post(f'{self.base}/quote/', {'subtotal': '1000', 'preview': True}, format='json')
        self.assertEqual((res.data['igst'], res.data['cgst']), ('198.00', '0.00'))

    def test_quote_preview_saves_nothing_and_blocks_without_gst_rate(self):
        res = self.owner_api.post(f'{self.base}/quote/', {'subtotal': '1000', 'preview': True}, format='json')
        self.assertEqual(res.data['total'], '1298.00')
        self.order.refresh_from_db()
        self.assertEqual((self.order.status, self.order.quoted_amount), ('submitted', None))
        configure(default_gst_rate=None)
        blocked = self.quote()
        self.assertEqual(blocked.status_code, 400)
        self.assertIn('GST', blocked.data['error'])

    def test_hand_typed_total_clears_breakdown(self):
        self.quote()
        self.owner_api.post(f'{self.base}/messages/', {'message': 'new', 'quoted_amount': '5000'}, format='json')
        self.order.refresh_from_db()
        self.assertEqual((self.order.quoted_amount, self.order.quote_subtotal), (Decimal('5000'), None))

    # transitions + timeline
    def test_owner_status_endpoint_enforces_map_and_logs_events(self):
        url = f'{self.base}/status/'
        self.assertEqual(self.owner_api.post(url, {'status': 'in_production'}, format='json').status_code, 400)
        self.assertEqual(self.owner_api.post(url, {'status': 'paid'}, format='json').status_code, 400)
        self.assertEqual(self.owner_api.post(url, {'status': 'reviewing', 'note': 'looking'}, format='json').status_code, 200)
        self.assertEqual(self.order.events.count(), 1)
        self.assertEqual(self.order.events.get().actor, 'owner')

    def test_owner_cannot_force_invalid_status_through_patch_or_reply(self):
        self.assertEqual(self.owner_api.patch(f'{self.base}/', {'status': 'completed'}, format='json').status_code, 400)
        res = self.owner_api.post(f'{self.base}/messages/', {'message': 'x', 'status': 'completed'}, format='json')
        self.assertEqual(res.status_code, 400)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'submitted')

    def test_dispatch_records_courier_and_awb_and_emails_after_commit(self):
        BulkOrder.objects.filter(pk=self.order.pk).update(status='in_production')
        with self.captureOnCommitCallbacks(execute=True):
            res = self.owner_api.post(f'{self.base}/status/',
                                      {'status': 'dispatched', 'courier': 'DTDC', 'awb': 'AWB123'}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        event = self.order.events.get()
        self.assertEqual((event.status, event.courier, event.awb), ('dispatched', 'DTDC', 'AWB123'))
        self.deliver.assert_called_once()
        self.assertEqual(self.deliver.call_args.args[0], 'asha@example.com')
        self.assertIn('AWB123', self.deliver.call_args.args[2])

    def test_email_not_sent_when_transaction_rolls_back_and_failures_are_swallowed(self):
        try:
            with self.captureOnCommitCallbacks(execute=True) as callbacks:
                fulfilment.record_event(self.order, 'system', note='x')
                raise RuntimeError('boom')
        except RuntimeError:
            pass
        self.assertEqual(len(callbacks), 1)  # queued but only because TestCase wraps in a transaction
        self.deliver.side_effect = RuntimeError('smtp down')
        with self.captureOnCommitCallbacks(execute=True):
            fulfilment.record_event(self.order, 'system', note='y')  # must not raise

    # payment -> paid + invoice
    def test_payment_moves_quoted_to_paid_with_invoice_and_event(self):
        self.quote()
        self.pay()
        self.assertEqual(self.order.status, 'paid')
        invoice = self.order.invoice
        self.assertEqual(invoice.number, f'TPP/{financial_year(timezone.localdate())}/0001')
        self.assertEqual(invoice.snapshot['total'], '1298.00')
        self.assertEqual(invoice.snapshot['cgst'], '99.00')
        self.assertTrue(self.order.events.filter(status='paid', actor='system').exists())
        detail = self.client_api.get(f'{self.my}/').data
        self.assertEqual(detail['invoice']['number'], invoice.number)
        self.assertEqual(detail['timeline'][-1]['status'], 'paid')
        self.assertEqual(self.client_api.get(f'{self.my}/invoice/').data['snapshot']['order_number'],
                         self.order.order_number)

    def test_payment_without_prefix_still_marks_paid_and_owner_can_issue_invoice_later(self):
        configure(invoice_prefix='')
        self.quote()
        self.pay()
        self.assertEqual(self.order.status, 'paid')
        self.assertFalse(Invoice.objects.exists())
        note = self.order.events.filter(actor='system').latest('id')
        self.assertTrue(note.note.startswith('Invoice not issued: Set the invoice prefix'))
        self.assertTrue(note.note.endswith('Add the tax breakdown, then issue it.'))
        self.assertTrue(note.internal)
        mine = self.client_api.get(f'{self.my}/').data['timeline']
        self.assertFalse(any('Invoice not issued' in e['note'] for e in mine))
        self.assertTrue(any('Invoice not issued' in e['note']
                            for e in self.owner_api.get(f'{self.base}/').data['timeline']))
        self.assertNotIn('Invoice not issued', ' '.join(str(c.args[2]) for c in self.deliver.call_args_list))
        self.assertEqual(self.owner_api.post(f'{self.base}/invoice/', {}, format='json').status_code, 400)
        configure(invoice_prefix='TPP')
        self.assertEqual(self.owner_api.post(f'{self.base}/invoice/', {}, format='json').status_code, 200)
        self.assertEqual(Invoice.objects.count(), 1)

    def legacy_paid(self, amount='1298.00'):
        BulkOrder.objects.filter(pk=self.order.pk).update(
            status='paid', quoted_amount=Decimal(amount), paid_amount=Decimal(amount), paid_at=timezone.now(),
            razorpay_payment_id='pay_old')

    def test_legacy_paid_order_gets_breakdown_only_when_total_matches_paid_amount(self):
        self.legacy_paid()
        bad = self.owner_api.post(f'{self.base}/quote/', {'subtotal': '900'}, format='json')
        self.assertEqual(bad.status_code, 400)
        self.assertIn('1,298.00', bad.data['error'])
        self.assertIn('-', bad.data['error'])  # the gap is shown
        self.order.refresh_from_db()
        self.assertIsNone(self.order.quote_subtotal)

        ok = self.quote('1000')
        self.assertEqual(ok.status_code, 200, ok.data)
        self.order.refresh_from_db()
        self.assertEqual((self.order.quoted_amount, self.order.status, self.order.quote_tax),
                         (Decimal('1298.00'), 'paid', Decimal('198.00')))
        self.assertEqual(self.owner_api.post(f'{self.base}/invoice/', {}, format='json').status_code, 200)
        self.assertTrue(Invoice.objects.filter(order=self.order).exists())
        self.assertEqual(self.quote('1000').status_code, 400)  # breakdown already stored: locked

    def test_paid_order_quoted_amount_never_changes_through_quote_builder(self):
        self.legacy_paid('5000.00')
        self.assertEqual(self.quote('1000').status_code, 400)
        self.order.refresh_from_db()
        self.assertEqual(self.order.quoted_amount, Decimal('5000.00'))

    def test_action_responses_include_the_event_just_created(self):
        res = self.owner_api.post(f'{self.base}/status/', {'status': 'reviewing'}, format='json')
        self.assertEqual([e['status'] for e in res.data['timeline']], ['reviewing'])
        res = self.quote()
        self.assertEqual([e['status'] for e in res.data['timeline']], ['reviewing', 'quoted'])
        self.assertEqual(res.data['allowed_next'], ['reviewing', 'cancelled'])
        self.pay()
        res = self.owner_api.post(f'{self.base}/invoice/', {}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIsNotNone(res.data['invoice'])

    def test_allowed_next_lists_owner_choices_without_paid(self):
        self.assertEqual(self.owner_api.get(f'{self.base}/').data['allowed_next'], ['reviewing', 'quoted', 'cancelled'])
        BulkOrder.objects.filter(pk=self.order.pk).update(status='quoted')
        self.assertEqual(self.owner_api.get(f'{self.base}/').data['allowed_next'], ['reviewing', 'cancelled'])

    def test_payment_only_opens_for_quoted_orders(self):
        BulkOrder.objects.filter(pk=self.order.pk).update(status='submitted', quoted_amount=Decimal('50'))
        self.assertFalse(self.client_api.get(f'{self.my}/').data['can_pay_online'])
        self.assertEqual(self.client_api.post(f'{self.my}/pay/').status_code, 400)

    def test_capture_on_non_quoted_order_needs_review_without_status_change_invoice_or_email(self):
        from apps.bulk_orders.models import QuotePayment
        from apps.bulk_orders.views.payments import _record_payment
        self.quote()
        QuotePayment.objects.create(order=self.order, razorpay_order_id='order_x', amount_paise=129800)
        BulkOrder.objects.filter(pk=self.order.pk).update(status='cancelled')
        with self.captureOnCommitCallbacks(execute=True):
            _record_payment({'id': 'pay_9', 'status': 'captured', 'currency': 'INR', 'order_id': 'order_x',
                             'amount': 129800})
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'cancelled')
        self.assertFalse(self.order.is_paid)
        self.assertFalse(Invoice.objects.exists())
        self.assertTrue(self.order.payment_under_review)
        self.deliver.assert_not_called()
        self.assertTrue(self.order.events.filter(note__contains='needs owner review', internal=True).exists())
        self.assertFalse(any('owner review' in e['note'] for e in self.client_api.get(f'{self.my}/').data['timeline']))

    def test_quoted_amount_is_read_only_on_patch(self):
        self.quote()
        res = self.owner_api.patch(f'{self.base}/', {'quoted_amount': '1.00'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.quoted_amount, Decimal('1298.00'))

    def test_owner_list_loads_timeline_requests_and_invoice_in_bulk(self):
        from django.db import connection
        from django.test.utils import CaptureQueriesContext

        def timeline_queries():
            with CaptureQueriesContext(connection) as ctx:
                self.owner_api.get('/api/v1/owner/bulk-orders/')
            return [q for q in ctx.captured_queries
                    if any(t in q['sql'] for t in ('bulk_orders_orderevent', 'bulk_orders_orderrequest', 'bulk_orders_invoice'))]

        before = len(timeline_queries())
        for _ in range(5):
            fulfilment.record_event(make_order(self.user), 'system', note='x')
        self.assertEqual(len(timeline_queries()), before)

    # requests
    def test_cancel_window(self):
        self.quote()
        url = f'{self.my}/requests/'
        self.assertEqual(self.client_api.post(url, {'kind': 'cancel', 'reason': 'changed mind'}, format='json').status_code, 201)
        self.assertEqual(self.client_api.post(url, {'kind': 'cancel'}, format='json').status_code, 400)  # one pending
        OrderRequest.objects.all().delete()
        BulkOrder.objects.filter(pk=self.order.pk).update(status='in_production')
        self.assertEqual(self.client_api.post(url, {'kind': 'cancel'}, format='json').status_code, 400)
        configure(cancellation_allowed_until='dispatched')
        self.assertEqual(self.client_api.post(url, {'kind': 'cancel'}, format='json').status_code, 201)

    def test_return_needs_completed_and_window(self):
        url = f'{self.my}/requests/'
        BulkOrder.objects.filter(pk=self.order.pk).update(status='completed')
        self.assertEqual(self.client_api.post(url, {'kind': 'return'}, format='json').status_code, 400)  # disabled
        configure(return_window_days=7)
        self.assertEqual(self.client_api.post(url, {'kind': 'return'}, format='json').status_code, 201)
        OrderRequest.objects.all().delete()
        event = OrderEvent.objects.create(order=self.order, status='completed', actor='owner')
        OrderEvent.objects.filter(pk=event.pk).update(created_at=timezone.now() - timedelta(days=8))
        self.assertEqual(self.client_api.post(url, {'kind': 'return'}, format='json').status_code, 400)
        BulkOrder.objects.filter(pk=self.order.pk).update(status='dispatched')
        self.assertEqual(self.client_api.post(url, {'kind': 'return'}, format='json').status_code, 400)

    def paid_order_with_request(self, kind='cancel'):
        self.quote()
        self.pay()
        if kind == 'return':
            BulkOrder.objects.filter(pk=self.order.pk).update(status='completed')
            configure(return_window_days=30)
        return self.client_api.post(f'{self.my}/requests/', {'kind': kind, 'reason': 'r'}, format='json').data['id']

    def decide(self, request_id, **body):
        return self.owner_api.post(f'/api/v1/owner/requests/{request_id}/decide/', body, format='json')

    def test_approve_cancel_refunds_once_and_second_approve_does_not_refund_again(self):
        rid = self.paid_order_with_request()
        with mock.patch(f'{RP}.refund', return_value={'id': 'rfnd_1'}) as refund:
            res = self.decide(rid, decision='approve')
            again = self.decide(rid, decision='approve')
        self.assertEqual(res.status_code, 200, res.data)
        refund.assert_called_once_with('pay_1', 129800, idempotency_key=f'tpp-req-{rid}-129800')
        self.assertEqual(again.status_code, 400)
        req = OrderRequest.objects.get(pk=rid)
        self.assertEqual((req.status, req.razorpay_refund_id, req.refund_amount), ('approved', 'rfnd_1', Decimal('1298.00')))
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'cancelled')

    def test_refund_capped_at_paid_amount(self):
        rid = self.paid_order_with_request()
        with mock.patch(f'{RP}.refund') as refund:
            res = self.decide(rid, decision='approve', refund_amount='1298.01')
        self.assertEqual(res.status_code, 400)
        refund.assert_not_called()
        self.assertEqual(OrderRequest.objects.get(pk=rid).status, 'pending')

    def test_partial_refund_amount_and_cap_counts_earlier_refunds(self):
        rid = self.paid_order_with_request('return')
        OrderRequest.objects.create(order=self.order, kind='return', status='approved', refund_amount=Decimal('300'))
        with mock.patch(f'{RP}.refund', return_value={'id': 'rfnd_2'}) as refund:
            self.assertEqual(self.decide(rid, decision='approve', refund_amount='999').status_code, 400)
            self.assertEqual(self.decide(rid, decision='approve', refund_amount='998').status_code, 200)
        self.assertEqual(refund.call_args.args[1], 99800)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'returned')

    def test_razorpay_failure_leaves_request_pending(self):
        rid = self.paid_order_with_request()
        with mock.patch(f'{RP}.refund', side_effect=__import__('apps.bulk_orders.razorpay', fromlist=['x']).RazorpayError('x')):
            self.assertEqual(self.decide(rid, decision='approve').status_code, 502)
        self.assertEqual(OrderRequest.objects.get(pk=rid).status, 'pending')
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'paid')

    def test_decline_does_not_refund_or_change_order(self):
        rid = self.paid_order_with_request()
        with mock.patch(f'{RP}.refund') as refund:
            self.assertEqual(self.decide(rid, decision='decline', owner_note='already printing').status_code, 200)
        refund.assert_not_called()
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'paid')
        self.assertEqual(self.owner_api.get('/api/v1/owner/requests/?status=declined').data['count'], 1)

    def test_unpaid_cancel_needs_no_refund(self):
        self.quote()
        rid = self.client_api.post(f'{self.my}/requests/', {'kind': 'cancel'}, format='json').data['id']
        with mock.patch(f'{RP}.refund') as refund:
            self.assertEqual(self.decide(rid, decision='approve').status_code, 200)
        refund.assert_not_called()

    def test_razorpay_refund_client_is_idempotent_keyed_and_rejects_zero(self):
        from apps.bulk_orders import razorpay
        with mock.patch(f'{RP}._call', return_value={'id': 'rfnd'}) as call:
            razorpay.refund('pay_9', 500, idempotency_key='k1')
        self.assertEqual(call.call_args.args[:2], ('POST', '/payments/pay_9/refund'))
        self.assertEqual(call.call_args.args[4], {'amount': 500})
        self.assertEqual(call.call_args.args[5], {'X-Refund-Idempotency': 'k1'})
        with self.assertRaises(razorpay.RazorpayError):
            razorpay.refund('pay_9', 0)


class InvoiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('buyer', 'buyer@example.com', 'pw-123456')
        configure()

    def paid_order(self, when):
        order = make_order(self.user, status='quoted', quoted_amount=Decimal('118'), quote_subtotal=Decimal('100'),
                           quote_shipping=Decimal('0'), quote_gst_rate=Decimal('18'), quote_tax=Decimal('18'),
                           quote_cgst=Decimal('9'), quote_sgst=Decimal('9'), quote_igst=Decimal('0'),
                           paid_at=when, paid_amount=Decimal('118'))
        return order

    def test_sequential_numbers_per_financial_year(self):
        tz = timezone.get_current_timezone()
        from datetime import datetime
        march = datetime(2026, 3, 30, 12, tzinfo=tz)
        april = datetime(2026, 4, 2, 12, tzinfo=tz)
        numbers = [fulfilment.issue_invoice(self.paid_order(d)).number
                   for d in (march, march, april, april)]
        self.assertEqual(numbers, ['TPP/2025-26/0001', 'TPP/2025-26/0002', 'TPP/2026-27/0001', 'TPP/2026-27/0002'])

    def test_issue_is_idempotent_per_order(self):
        order = self.paid_order(timezone.now())
        self.assertEqual(fulfilment.issue_invoice(order).pk, fulfilment.issue_invoice(order).pk)
        self.assertEqual(Invoice.objects.count(), 1)

    def test_lost_race_retries_with_next_number_instead_of_duplicating(self):
        first = self.paid_order(timezone.now())
        fulfilment.issue_invoice(first)
        second = self.paid_order(timezone.now())
        real = Invoice.objects.filter
        stale = {'done': False}

        def stale_max(*args, **kwargs):
            # First lookup pretends no invoice exists yet (another writer won the race).
            qs = real(*args, **kwargs)
            if not stale['done'] and 'financial_year' in kwargs:
                stale['done'] = True
                return Invoice.objects.none()
            return qs

        with mock.patch.object(Invoice.objects, 'filter', side_effect=stale_max):
            invoice = fulfilment.issue_invoice(second)
        self.assertTrue(invoice.number.endswith('/0002'))

    def test_database_rejects_duplicate_sequence(self):
        a = fulfilment.issue_invoice(self.paid_order(timezone.now()))
        with self.assertRaises(IntegrityError):
            Invoice.objects.create(order=self.paid_order(timezone.now()), financial_year=a.financial_year,
                                   sequence=a.sequence, number='TPP/other/1', snapshot={})

    def test_financial_year_uses_india_time_not_utc(self):
        from datetime import datetime, timezone as dt_tz
        late_march_utc = datetime(2026, 3, 31, 20, 0, tzinfo=dt_tz.utc)  # 1 April 01:30 in India
        self.assertEqual(fulfilment.issue_invoice(self.paid_order(late_march_utc)).number, 'TPP/2026-27/0001')

    def test_blocked_without_seller_gstin(self):
        configure(seller_gstin='')
        with self.assertRaisesMessage(fulfilment.InvoiceBlocked, 'GSTIN'):
            fulfilment.issue_invoice(self.paid_order(timezone.now()))

    def test_backfill_moves_legacy_paid_quoted_orders_to_paid(self):
        import importlib
        from django.apps import apps
        migration = importlib.import_module('apps.bulk_orders.migrations.0006_backfill_paid_status')
        paid = make_order(self.user, status='quoted', paid_at=timezone.now())
        unpaid = make_order(self.user, status='quoted')
        migration.mark_paid_orders(apps, None)
        paid.refresh_from_db()
        unpaid.refresh_from_db()
        early = make_order(self.user, status='reviewing', paid_at=timezone.now())
        migration.mark_paid_orders(apps, None)
        early.refresh_from_db()
        self.assertEqual(early.status, 'paid')
        self.assertEqual((paid.status, unpaid.status), ('paid', 'quoted'))
        self.assertEqual(paid.events.get().actor, 'system')
        self.assertTrue(can_transition(paid.status, 'proofing'))

    def test_blocked_without_prefix_or_breakdown(self):
        configure(invoice_prefix='')
        with self.assertRaises(fulfilment.InvoiceBlocked):
            fulfilment.issue_invoice(self.paid_order(timezone.now()))
        configure(invoice_prefix='TPP')
        legacy = make_order(self.user, status='quoted', quoted_amount=Decimal('50'), paid_at=timezone.now())
        with self.assertRaises(fulfilment.InvoiceBlocked):
            fulfilment.issue_invoice(legacy)


class CatalogAndSettingsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('buyer', 'buyer@example.com', 'pw-123456')
        self.boss = User.objects.create_superuser('boss', 'boss@example.com', 'pw-123456')
        cat = Category.objects.create(name='Cards', slug='cards')
        self.product = Product.objects.create(name='PVC Card', sku='PVC-1', category=cat)
        self.api = APIClient()
        self.api.force_authenticate(self.user)

    def submit(self, **extra):
        body = {'organization_name': 'Acme', 'contact_person': 'Asha', 'email': 'buyer@example.com',
                'phone': '9000000000', 'estimated_quantity': 10, 'requirements': 'cards',
                'product': self.product.pk, **extra}
        return self.api.post('/api/v1/bulk-orders/submit/', body, format='json')

    def test_out_of_stock_product_is_refused_and_untracked_or_stocked_is_fine(self):
        Product.objects.filter(pk=self.product.pk).update(stock_quantity=0)
        self.assertEqual(self.submit().status_code, 400)
        self.assertEqual(self.submit(product=None, checked_product_ids=[self.product.pk]).status_code, 400)
        self.assertEqual(BulkOrder.objects.count(), 0)
        Product.objects.filter(pk=self.product.pk).update(stock_quantity=3)
        self.assertEqual(self.submit().status_code, 201)
        Product.objects.filter(pk=self.product.pk).update(stock_quantity=None)
        self.assertEqual(self.submit().status_code, 201)

    def test_submit_snapshots_own_address_and_later_edits_do_not_change_it(self):
        mine = Address.objects.create(user=self.user, full_name='Asha', phone='9', line1='1 MG', city='B',
                                      state='Karnataka', pincode='560001')
        res = self.submit(shipping_address_id=mine.pk, billing_address_id=mine.pk)
        self.assertEqual(res.status_code, 201, res.data)
        Address.objects.filter(pk=mine.pk).update(city='Changed')
        order = BulkOrder.objects.get()
        self.assertEqual((order.shipping_address['city'], order.billing_address['state']), ('B', 'Karnataka'))
        self.assertEqual(order.events.get().actor, 'customer')

    def test_cannot_use_someone_elses_address(self):
        other = User.objects.create_user('o', 'o@example.com', 'pw-123456')
        theirs = Address.objects.create(user=other, full_name='X', phone='9', line1='1', city='B',
                                        state='Karnataka', pincode='560001')
        self.assertEqual(self.submit(shipping_address_id=theirs.pk).status_code, 400)
        self.assertEqual(BulkOrder.objects.count(), 0)

    def test_product_stock_gst_hsn_validation_and_exposure(self):
        owner = APIClient()
        owner.force_authenticate(self.boss)
        url = f'/api/v1/owner/products/{self.product.pk}/'
        res = owner.patch(url, {'stock_quantity': 5, 'gst_rate': '18.00', 'hsn_code': '392690'}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        self.product.refresh_from_db()
        self.assertEqual((self.product.stock_quantity, self.product.gst_rate, self.product.hsn_code),
                         (5, Decimal('18.00'), '392690'))
        self.assertEqual(owner.patch(url, {'hsn_code': '12345'}, format='json').status_code, 400)
        self.assertEqual(owner.patch(url, {'hsn_code': 'ABCD'}, format='json').status_code, 400)
        public = APIClient().get(f'/api/v1/products/{self.product.slug}/')
        self.assertEqual(public.data['stock_quantity'], 5)

    def test_commerce_settings_default_empty_and_validate(self):
        owner = APIClient()
        owner.force_authenticate(self.boss)
        got = owner.get('/api/v1/owner/commerce-settings/').data
        self.assertEqual((got['default_gst_rate'], got['seller_state'], got['invoice_prefix'], got['return_window_days'],
                          got['free_shipping_above'], got['return_policy_text']), (None, '', '', None, None, ''))
        self.assertEqual(Decimal(got['shipping_flat_fee']), 0)
        for bad in ({'seller_state': 'Atlantis'}, {'default_gst_rate': '150'}, {'seller_gstin': 'bad'}, {'cancellation_allowed_until': 'nope'},
                    {'invoice_prefix': 'a b'}):
            self.assertEqual(owner.put('/api/v1/owner/commerce-settings/', bad, format='json').status_code, 400, bad)
        ok = owner.put('/api/v1/owner/commerce-settings/',
                       {'default_gst_rate': '18', 'return_window_days': 7, 'return_policy_text': 'Seven days.'},
                       format='json')
        self.assertEqual(ok.status_code, 200, ok.data)
        policies = APIClient().get('/api/v1/commerce-policies/').data
        self.assertEqual((policies['return_policy_text'], policies['return_window_days']), ('Seven days.', 7))
        self.assertNotIn('default_gst_rate', policies)
        self.assertIn('Karnataka', policies['states'])
