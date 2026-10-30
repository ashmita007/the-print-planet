from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from apps.bulk_orders.models import BulkOrder, BulkOrderMessage


class BulkOrdersApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner_user = User.objects.create_user(
            username='admin_owner',
            email='admin@theprintplanet.co.in',
            password='Password123!',
            is_staff=True,
            is_superuser=True
        )
        self.owner_token = Token.objects.create(user=self.owner_user)

        self.client_user = User.objects.create_user(
            username='client_buyer',
            email='buyer@corporate.com',
            password='ClientPassword123!',
            first_name='John',
            last_name='Corporate'
        )
        self.client_token = Token.objects.create(user=self.client_user)

        self.order = BulkOrder.objects.create(
            order_number='BORD-TEST-001',
            user=self.client_user,
            organization_name='Acme Corp',
            organization_type='corporate',
            contact_person='John Corporate',
            email='buyer@corporate.com',
            phone='+91 9876543210',
            estimated_quantity=2000,
            category_type='corporate_lanyards',
            specifications={'tier': 'Tier 2: Business Enterprise'},
            requirements='2000 pcs satin lanyard with lobster hook',
            status='submitted'
        )

    def test_client_orders_list(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        res = self.client.get('/api/v1/bulk-orders/my-orders/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['count'], 1)
        self.assertEqual(res.data['results'][0]['order_number'], 'BORD-TEST-001')

    def test_owner_orders_endpoint(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.owner_token.key}')
        res = self.client.get('/api/v1/owner/bulk-orders/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['count'], 1)
        self.assertEqual(res.data['results'][0]['order_number'], 'BORD-TEST-001')

    def test_owner_reply_to_bulk_order(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.owner_token.key}')
        res = self.client.post(f'/api/v1/owner/bulk-orders/{self.order.id}/messages/', {
            'message': 'Quotation prepared: Rs 28/unit for 2000 pcs',
            'status': 'quoted',
            'quoted_amount': 56000
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'quoted')
        self.assertEqual(float(self.order.quoted_amount), 56000.0)
        self.assertEqual(self.order.messages.filter(sender_type='owner').count(), 1)
