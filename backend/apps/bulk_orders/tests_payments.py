import hashlib
import hmac
import json
from decimal import Decimal
from unittest import mock

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.bulk_orders.models import BulkOrder, BulkOrderMessage, QuotePayment

KEYS = dict(RAZORPAY_KEY_ID='rzp_test_key', RAZORPAY_KEY_SECRET='test_secret', RAZORPAY_WEBHOOK_SECRET='hook_secret')
RP = 'apps.bulk_orders.razorpay'


def sign(secret, message):
    return hmac.new(secret.encode(), message.encode() if isinstance(message, str) else message, hashlib.sha256).hexdigest()


def captured(rp_order_id='order_rp1', amount=1234550, payment_id='pay_1', status='captured'):
    return {'id': payment_id, 'status': status, 'order_id': rp_order_id, 'currency': 'INR', 'amount': amount}


def verify_body(rp_order_id='order_rp1', payment_id='pay_1'):
    return {'razorpay_order_id': rp_order_id, 'razorpay_payment_id': payment_id,
            'razorpay_signature': sign('test_secret', f'{rp_order_id}|{payment_id}')}


@override_settings(**KEYS)
class QuotePaymentTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('buyer', 'buyer@example.com', 'pw-123456')
        self.other = User.objects.create_user('other', 'other@example.com', 'pw-123456')
        self.order = BulkOrder.objects.create(
            order_number='PP-CORP-2026-1001', user=self.user, organization_type='corporate',
            organization_name='Acme', contact_person='Asha', email='buyer@example.com', phone='9000000000',
            estimated_quantity=500, status='quoted', quoted_amount=Decimal('12345.50'),
        )
        self.api = APIClient()
        self.api.force_authenticate(self.user)
        self.base = f'/api/v1/bulk-orders/my-orders/{self.order.order_number}'

    def start(self):
        with mock.patch(f'{RP}.create_order', return_value={'id': 'order_rp1'}) as create:
            res = self.api.post(f'{self.base}/pay/')
        return res, create

    def test_pay_creates_order_for_server_quote_and_reuses_it(self):
        res, create = self.start()
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual((res.data['amount'], res.data['razorpay_order_id'], res.data['key_id']),
                         (1234550, 'order_rp1', 'rzp_test_key'))
        create.assert_called_once()
        self.assertEqual(create.call_args.args[0], 1234550)

        _, create_again = self.start()
        create_again.assert_not_called()

    def test_changed_quote_gets_a_new_razorpay_order(self):
        self.start()
        BulkOrder.objects.filter(pk=self.order.pk).update(quoted_amount=Decimal('100'))
        with mock.patch(f'{RP}.create_order', return_value={'id': 'order_rp2'}) as create:
            res = self.api.post(f'{self.base}/pay/')
        self.assertEqual((res.data['amount'], res.data['razorpay_order_id']), (10000, 'order_rp2'))
        create.assert_called_once()

    def test_other_users_and_unquoted_or_cancelled_orders_cannot_pay(self):
        other = APIClient()
        other.force_authenticate(self.other)
        self.assertEqual(other.post(f'{self.base}/pay/').status_code, 404)

        for changes in ({'quoted_amount': None}, {'status': 'cancelled'}):
            BulkOrder.objects.filter(pk=self.order.pk).update(**changes)
            self.assertEqual(self.api.post(f'{self.base}/pay/').status_code, 400)
            BulkOrder.objects.filter(pk=self.order.pk).update(quoted_amount=Decimal('12345.50'), status='quoted')

    @override_settings(RAZORPAY_KEY_ID='', RAZORPAY_KEY_SECRET='')
    def test_pay_is_unavailable_without_keys(self):
        self.assertEqual(self.api.post(f'{self.base}/pay/').status_code, 503)
        self.assertFalse(self.api.get(f'{self.base}/').data['can_pay_online'])

    def test_verify_marks_paid_once_after_razorpay_confirms(self):
        self.start()
        body = verify_body()
        with mock.patch(f'{RP}.fetch_payment', return_value=captured()):
            self.assertEqual(self.api.post(f'{self.base}/pay/verify/', body).data, {'paid': True})
            self.api.post(f'{self.base}/pay/verify/', body)

        self.order.refresh_from_db()
        self.assertEqual((self.order.paid_amount, self.order.razorpay_payment_id), (Decimal('12345.50'), 'pay_1'))
        self.assertEqual(BulkOrderMessage.objects.filter(order=self.order, sender_type='system').count(), 1)
        detail = self.api.get(f'{self.base}/').data
        self.assertTrue(detail['is_paid'])
        self.assertFalse(detail['can_pay_online'])
        self.assertEqual(self.api.post(f'{self.base}/pay/').status_code, 400)

    def test_verify_captures_authorized_payment(self):
        self.start()
        with mock.patch(f'{RP}.fetch_payment', return_value=captured(status='authorized')), \
                mock.patch(f'{RP}.capture_payment', return_value=captured()) as capture:
            self.assertEqual(self.api.post(f'{self.base}/pay/verify/', verify_body()).data, {'paid': True})
        capture.assert_called_once_with('pay_1', 1234550)

    def test_verify_rejects_bad_signature_bad_body_and_wrong_amount(self):
        self.start()
        bad = {**verify_body(), 'razorpay_signature': 'forged'}
        self.assertEqual(self.api.post(f'{self.base}/pay/verify/', bad).status_code, 400)
        self.assertEqual(self.api.post(f'{self.base}/pay/verify/', [1, 2], format='json').status_code, 400)

        with mock.patch(f'{RP}.fetch_payment', return_value=captured(amount=100)):
            self.assertEqual(self.api.post(f'{self.base}/pay/verify/', verify_body()).status_code, 502)
        self.order.refresh_from_db()
        self.assertFalse(self.order.is_paid)

    def hook(self, payload, signature=None):
        body = json.dumps(payload)
        return APIClient().post('/api/v1/bulk-orders/payments/razorpay/webhook/', body, content_type='application/json',
                                HTTP_X_RAZORPAY_SIGNATURE=signature or sign('hook_secret', body))

    def test_webhook_marks_paid_and_rejects_bad_signature(self):
        self.start()
        event = {'event': 'payment.captured', 'payload': {'payment': {'entity': captured()}}}
        self.assertEqual(self.hook(event, signature='forged').status_code, 400)
        self.assertEqual(self.hook(event).status_code, 200)
        self.order.refresh_from_db()
        self.assertTrue(self.order.is_paid)

    def test_webhook_ignores_uncaptured_and_malformed_events(self):
        self.start()
        for event in ({'event': 'order.paid', 'payload': {'payment': {'entity': captured(status='authorized')}}},
                      {'event': 'payment.captured', 'payload': []}, ['not', 'a', 'dict'],
                      {'event': 'payment.captured', 'payload': {'payment': {'entity': captured(rp_order_id='order_x')}}}):
            self.assertEqual(self.hook(event).status_code, 200)
        self.order.refresh_from_db()
        self.assertFalse(self.order.is_paid)

    def test_payment_on_an_older_quote_is_kept_for_review_not_lost(self):
        self.start()  # Razorpay order for 12345.50
        BulkOrder.objects.filter(pk=self.order.pk).update(quoted_amount=Decimal('100'))
        with mock.patch(f'{RP}.create_order', return_value={'id': 'order_rp2'}):
            self.api.post(f'{self.base}/pay/')

        # The customer completes the checkout that was opened for the old amount.
        with mock.patch(f'{RP}.fetch_payment', return_value=captured()):
            res = self.api.post(f'{self.base}/pay/verify/', verify_body())

        self.assertEqual(res.data, {'paid': False})
        self.assertIsNotNone(QuotePayment.objects.get(razorpay_order_id='order_rp1').captured_at)
        self.order.refresh_from_db()
        self.assertFalse(self.order.is_paid)
        self.assertIn('does not match the current quote',
                      BulkOrderMessage.objects.filter(order=self.order, sender_type='system').get().message)
        # No second charge while the owner reviews it.
        self.assertFalse(self.api.get(f'{self.base}/').data['can_pay_online'])
        self.assertEqual(self.api.post(f'{self.base}/pay/').status_code, 400)

    def test_owner_reply_with_a_new_quote_works_when_payments_are_on(self):
        owner = User.objects.create_superuser('boss2', 'boss2@example.com', 'pw-123456')
        api = APIClient()
        api.force_authenticate(owner)
        res = api.post(f'/api/v1/bulk-orders/owner/orders/{self.order.pk}/messages/',
                       {'message': 'Revised quote', 'quoted_amount': '999.99'}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertTrue(res.data['order']['can_pay_online'])
        self.order.refresh_from_db()
        self.assertEqual(self.order.quoted_amount, Decimal('999.99'))

    def test_owner_cannot_change_a_paid_quote(self):
        BulkOrder.objects.filter(pk=self.order.pk).update(paid_amount=Decimal('12345.50'), paid_at='2026-11-22T10:00Z')
        owner = User.objects.create_superuser('boss', 'boss@example.com', 'pw-123456')
        api = APIClient()
        api.force_authenticate(owner)
        url = f'/api/v1/bulk-orders/owner/orders/{self.order.pk}/'
        self.assertEqual(api.patch(url, {'quoted_amount': '1.00'}, format='json').status_code, 400)
        self.assertEqual(api.patch(url, {'status': 'in_production'}, format='json').status_code, 200)
        reply = api.post(f'{url}messages/', {'message': 'New price', 'quoted_amount': '1.00'}, format='json')
        self.assertEqual(reply.status_code, 400)
