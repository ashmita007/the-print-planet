from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.authentication.models import Address
from apps.bulk_orders.models import BulkOrder, BulkOrderMessage, OrderEvent, OrderRequest, QuotePayment
from apps.enquiries.models import Enquiry

LIST = '/api/v1/owner/customers/'


def make_order(user, number, **kw):
    defaults = dict(order_number=number, user=user, organization_type='corporate', organization_name='Acme',
                    contact_person='Asha', email=user.email, phone='9000000000', estimated_quantity=10,
                    requirements='x')
    defaults.update(kw)
    return BulkOrder.objects.create(**defaults)


class OwnerCustomersTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user('boss', 'boss@example.com', 'pw-123456', is_staff=True)
        self.asha = User.objects.create_user('asha', 'Asha@Example.com', 'pw-123456', first_name='Asha', last_name='Rao')
        self.ravi = User.objects.create_user('ravi', 'ravi@example.com', 'pw-123456')
        self.idle = User.objects.create_user('idle', 'idle@example.com', 'pw-123456')
        self.enq_only = User.objects.create_user('enq', 'enq@example.com', 'pw-123456')

        self.o1 = make_order(self.asha, 'PP-CORP-2026-1001', status='paid', quoted_amount=Decimal('1000'),
                             paid_amount=Decimal('1000'), paid_at=timezone.now(), organization_name='Old Co')
        self.o2 = make_order(self.asha, 'PP-CORP-2026-1002', status='quoted', quoted_amount=Decimal('500'),
                             organization_name='New Co', phone='9111111111')
        BulkOrder.objects.filter(pk=self.o1.pk).update(created_at=timezone.now() - timedelta(days=5))
        self.o_ravi = make_order(self.ravi, 'PP-CORP-2026-2001', status='paid', quoted_amount=Decimal('777'),
                                 paid_amount=Decimal('777'), paid_at=timezone.now())

        BulkOrderMessage.objects.create(order=self.o1, sender_type='client', sender_name='Asha', message='hello')
        BulkOrderMessage.objects.create(order=self.o1, sender_type='owner', sender_name='Support', message='hi')
        BulkOrderMessage.objects.create(order=self.o_ravi, sender_type='client', sender_name='Ravi', message='SECRET-RAVI')
        OrderEvent.objects.create(order=self.o1, status='quoted', actor='owner')
        OrderEvent.objects.create(order=self.o1, status='reviewing', actor='owner', note='internal only', internal=True)
        qp = QuotePayment.objects.create(order=self.o1, razorpay_order_id='order_a', amount_paise=100000,
                                         razorpay_payment_id='pay_a', captured_at=timezone.now())
        OrderRequest.objects.create(order=self.o1, kind='cancel', status='approved',
                                    refund_amount=Decimal('1000'), razorpay_refund_id='rfnd_1')
        self.qp = qp

        Enquiry.objects.create(full_name='Asha', email='ASHA@example.com', phone='9', message='enq mine')
        Enquiry.objects.create(full_name='Enq', email='enq@example.com', phone='8', message='enq only')
        Enquiry.objects.create(full_name='Stranger', email='stranger@example.com', phone='7', message='NOT-MINE')
        Address.objects.create(user=self.asha, full_name='Asha', phone='9', line1='l1', city='c', state='s', pincode='560001')
        Address.objects.create(user=self.ravi, full_name='Ravi', phone='9', line1='RAVI-ADDR', city='c', state='s', pincode='560001')

        self.api = APIClient()
        self.api.force_authenticate(self.admin)

    def test_authz(self):
        anon = APIClient()
        for url in (LIST, f'{LIST}{self.asha.pk}/'):
            self.assertEqual(anon.get(url).status_code, 401)
            client = APIClient()
            client.force_authenticate(self.asha)
            self.assertEqual(client.get(url).status_code, 403)

    def test_list_aggregation(self):
        data = self.api.get(LIST).json()
        rows = {r['email'].lower(): r for r in data['results']}
        self.assertEqual(set(rows), {'asha@example.com', 'ravi@example.com', 'enq@example.com'})
        asha = rows['asha@example.com']
        self.assertEqual((asha['orders_count'], asha['paid_total']), (2, 1000.0))
        self.assertEqual((asha['company'], asha['phone'], asha['name']), ('New Co', '9111111111', 'Asha Rao'))
        self.assertEqual(rows['ravi@example.com']['paid_total'], 777.0)
        enq = rows['enq@example.com']
        self.assertEqual((enq['orders_count'], enq['paid_total']), (0, 0.0))
        self.assertTrue(enq['last_activity'])

    def test_list_search(self):
        found = self.api.get(LIST, {'search': 'old co'}).json()['results']
        self.assertEqual([r['email'].lower() for r in found], ['asha@example.com'])
        self.assertEqual(self.api.get(LIST, {'search': 'nobody-here'}).json()['count'], 0)

    def test_detail_contents_and_isolation(self):
        with self.assertNumQueries(8):
            body = self.api.get(f'{LIST}{self.asha.pk}/').json()
        self.assertEqual([o['order_number'] for o in body['orders']], ['PP-CORP-2026-1002', 'PP-CORP-2026-1001'])
        paid = body['orders'][1]
        self.assertEqual([m['message'] for m in paid['messages']], ['hello', 'hi'])
        self.assertEqual([e['internal'] for e in paid['timeline']], [False, True])
        self.assertEqual(body['profile']['paid_total'], 1000.0)
        self.assertEqual([e['message'] for e in body['enquiries']], ['enq mine'])
        self.assertEqual(len(body['payments']), 1)
        self.assertEqual(body['refunds'][0]['razorpay_refund_id'], 'rfnd_1')
        self.assertEqual(len(body['addresses']), 1)
        text = str(body)
        for leak in ('SECRET-RAVI', 'NOT-MINE', 'RAVI-ADDR', 'enq only'):
            self.assertNotIn(leak, text)

    def test_detail_query_count_does_not_grow(self):
        for i in range(5):
            o = make_order(self.asha, f'PP-CORP-2026-30{i}')
            BulkOrderMessage.objects.create(order=o, sender_type='client', sender_name='A', message='m')
            OrderEvent.objects.create(order=o, status='quoted')
        with self.assertNumQueries(8):
            self.api.get(f'{LIST}{self.asha.pk}/')

    def test_staff_user_detail_is_404(self):
        self.assertEqual(self.api.get(f'{LIST}{self.admin.pk}/').status_code, 404)
