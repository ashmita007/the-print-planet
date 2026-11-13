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


from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
import shutil
import tempfile

TEST_MEDIA = tempfile.mkdtemp(prefix='pp-test-media-')


@override_settings(MEDIA_ROOT=TEST_MEDIA)
class BulkOrderAuthorizationTests(TestCase):
    """Each buyer sees and talks on their own orders only."""

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEST_MEDIA, ignore_errors=True)

    def setUp(self):
        self.api = APIClient()
        self.alice = User.objects.create_user('alice', 'alice@acme.com', 'AlicePass!2026')
        self.bob = User.objects.create_user('bob', 'bob@globex.com', 'BobPass!2026')
        self.owner = User.objects.create_user('owner', 'owner@pp.in', 'OwnerPass!2026', is_staff=True)
        self.alice_token = Token.objects.create(user=self.alice).key
        self.bob_token = Token.objects.create(user=self.bob).key
        self.owner_token = Token.objects.create(user=self.owner).key
        self.alice_order = BulkOrder.objects.create(
            user=self.alice, organization_name='Acme', contact_person='Alice',
            email='alice@acme.com', phone='9876543210', estimated_quantity=500,
            requirements='500 lanyards',
            attachment=SimpleUploadedFile('artwork.pdf', b'%PDF-1.4 alice', content_type='application/pdf'),
        )
        self.alice_order.attachment_url = f"/api/v1/bulk-orders/my-orders/{self.alice_order.order_number}/attachment/"
        self.alice_order.save()

    def as_user(self, token):
        self.api.credentials(HTTP_AUTHORIZATION=f'Token {token}')

    def submit_payload(self, **extra):
        data = {
            'organization_type': 'corporate', 'organization_name': 'Initech',
            'contact_person': 'Peter Gibbons', 'email': 'peter@initech.com',
            'phone': '9123456780', 'city': 'Bangalore', 'state': 'Karnataka',
            'category_type': 'corporate_lanyards', 'estimated_quantity': 1000,
            'requirements': 'Need 1000 lanyards',
        }
        data.update(extra)
        return data

    def test_anonymous_cannot_read_orders(self):
        self.assertEqual(self.api.get('/api/v1/bulk-orders/my-orders/').status_code, 401)
        self.assertEqual(self.api.get(f'/api/v1/bulk-orders/my-orders/{self.alice_order.order_number}/').status_code, 401)

    def test_other_user_cannot_read_or_message_order(self):
        self.as_user(self.bob_token)
        self.assertEqual(self.api.get('/api/v1/bulk-orders/my-orders/').data['count'], 0)
        url = f'/api/v1/bulk-orders/my-orders/{self.alice_order.order_number}/'
        self.assertEqual(self.api.get(url).status_code, 404)
        self.assertEqual(self.api.post(url + 'messages/', {'message': 'hi'}).status_code, 404)
        self.assertEqual(self.api.get(url + 'attachment/').status_code, 404)

    def test_matching_email_does_not_grant_access(self):
        # Bob changes his account email to Alice's order email: still no access.
        self.bob.email = 'alice@acme.com'
        self.bob.save()
        self.as_user(self.bob_token)
        self.assertEqual(self.api.get('/api/v1/bulk-orders/my-orders/').data['count'], 0)

    def test_owner_of_order_has_full_access(self):
        self.as_user(self.alice_token)
        res = self.api.get('/api/v1/bulk-orders/my-orders/')
        self.assertEqual(res.data['count'], 1)
        self.assertEqual(res.data['summary_metrics']['total'], 1)
        url = f'/api/v1/bulk-orders/my-orders/{self.alice_order.order_number}/'
        self.assertEqual(self.api.get(url).status_code, 200)
        dl = self.api.get(url + 'attachment/')
        self.assertEqual(dl.status_code, 200)
        self.assertEqual(b''.join(dl.streaming_content), b'%PDF-1.4 alice')

    def test_client_message_with_attachment_is_private(self):
        self.as_user(self.alice_token)
        url = f'/api/v1/bulk-orders/my-orders/{self.alice_order.order_number}/messages/'
        res = self.api.post(url, {'message': '', 'attachment': SimpleUploadedFile('proof.png', b'png-bytes')},
                            format='multipart')
        self.assertEqual(res.status_code, 201)
        msg_url = res.data['attachment_url']
        self.assertTrue(msg_url.startswith('/api/v1/bulk-orders/messages/'))
        self.assertEqual(self.api.get(msg_url).status_code, 200)
        self.as_user(self.bob_token)
        self.assertEqual(self.api.get(msg_url).status_code, 404)
        self.as_user(self.owner_token)
        self.assertEqual(self.api.get(msg_url).status_code, 200)

    def test_client_cannot_inject_attachment_link_or_bad_file(self):
        self.as_user(self.alice_token)
        url = f'/api/v1/bulk-orders/my-orders/{self.alice_order.order_number}/messages/'
        res = self.api.post(url, {'message': 'see', 'attachment_url': 'javascript:alert(1)'}, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['attachment_url'], '')
        bad = self.api.post(url, {'message': 'x', 'attachment': SimpleUploadedFile('run.exe', b'MZ')}, format='multipart')
        self.assertEqual(bad.status_code, 400)

    def test_raw_media_path_blocked(self):
        res = self.client.get(f'/media/{self.alice_order.attachment.name}')
        self.assertEqual(res.status_code, 403)

    def test_client_cannot_use_owner_endpoints(self):
        self.as_user(self.alice_token)
        self.assertEqual(self.api.get('/api/v1/owner/bulk-orders/').status_code, 403)
        self.assertEqual(self.api.get('/api/v1/bulk-orders/owner/backup/download/').status_code, 403)

    def test_owner_backup_download_works(self):
        self.as_user(self.owner_token)
        res = self.api.get('/api/v1/bulk-orders/owner/backup/download/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('spreadsheetml', res['Content-Type'])

    def test_anonymous_submit_creates_own_account(self):
        res = self.api.post('/api/v1/bulk-orders/submit/', self.submit_payload(password='Initech#Lanyard9'), format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertTrue(res.data['token'])
        new_user = User.objects.get(email='peter@initech.com')
        self.assertEqual(BulkOrder.objects.get(order_number=res.data['order_number']).user, new_user)
        self.as_user(res.data['token'])
        self.assertEqual(self.api.get('/api/v1/bulk-orders/my-orders/').data['count'], 1)

    def test_anonymous_submit_with_existing_email_links_to_user(self):
        res = self.api.post('/api/v1/bulk-orders/submit/', self.submit_payload(email='alice@acme.com'), format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(BulkOrder.objects.filter(user=self.alice).count(), 2)
        self.assertFalse(res.data['token'])  # typing someone's email must not sign you in as them
        self.assertIsNone(res.data['user'])

    def test_invalid_order_does_not_create_account(self):
        res = self.api.post('/api/v1/bulk-orders/submit/',
                            self.submit_payload(email='not-an-email', password='Initech#Lanyard9'), format='json')
        self.assertEqual(res.status_code, 400)
        self.assertFalse(User.objects.filter(email='peter@initech.com').exists())

    def test_signed_in_submit_belongs_to_signed_in_user(self):
        self.as_user(self.bob_token)
        res = self.api.post('/api/v1/bulk-orders/submit/', self.submit_payload(email='alice@acme.com'), format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(BulkOrder.objects.get(order_number=res.data['order_number']).user, self.bob)
        self.as_user(self.alice_token)
        self.assertEqual(self.api.get('/api/v1/bulk-orders/my-orders/').data['count'], 1)
