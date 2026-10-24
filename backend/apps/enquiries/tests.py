from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.enquiries.models import Enquiry
from apps.catalog.models import Category, Product


class EnquiryApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_superuser(
            username='admin_enq',
            email='admin_enq@test.com',
            password='Password123!'
        )
        self.category = Category.objects.create(name='Holders', slug='holders')
        self.product = Product.objects.create(
            name='V2 ID Card Holder',
            slug='v2-id-card-holder',
            sku='HLD-V2-CLR',
            category=self.category
        )

    def test_public_enquiry_submission(self):
        payload = {
            'full_name': 'Ramesh Kumar',
            'company_name': 'Tech Solutions Pvt Ltd',
            'email': 'ramesh@techsolutions.com',
            'phone': '+91 98765 43210',
            'product': self.product.id,
            'requested_quantity': 500,
            'message': 'Need quotation for 500 pcs urgent delivery to Mumbai.'
        }
        response = self.client.post('/api/v1/enquiries/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Enquiry.objects.count(), 1)
        enq = Enquiry.objects.first()
        self.assertEqual(enq.full_name, 'Ramesh Kumar')
        self.assertEqual(enq.status, 'new')

    def test_enquiry_validation_phone_required(self):
        payload = {
            'full_name': 'Test User',
            'email': 'test@example.com',
            'phone': '123',  # too short
            'message': 'Quote please'
        }
        response = self.client.post('/api/v1/enquiries/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_user_cannot_view_enquiries(self):
        response = self.client.get('/api/v1/owner/enquiries/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_owner_can_manage_enquiries(self):
        enq = Enquiry.objects.create(
            full_name='Buyer Alpha',
            email='alpha@test.com',
            phone='+91 99999 88888',
            message='Need 1000 lanyard rolls'
        )
        self.client.force_authenticate(user=self.owner)
        list_resp = self.client.get('/api/v1/owner/enquiries/')
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)

        # Update status and admin notes
        update_resp = self.client.patch(f'/api/v1/owner/enquiries/{enq.id}/', {
            'status': 'quoted',
            'admin_notes': 'Sent formal proforma invoice via email.'
        })
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)
        enq.refresh_from_db()
        self.assertEqual(enq.status, 'quoted')
        self.assertEqual(enq.admin_notes, 'Sent formal proforma invoice via email.')

    def test_file_upload_validation_safe_pdf(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        pdf_content = b"%PDF-1.4 sample pdf content for quote"
        upload = SimpleUploadedFile("specs.pdf", pdf_content, content_type="application/pdf")
        payload = {
            'full_name': 'Corporate Buyer',
            'email': 'buyer@corporate.com',
            'phone': '+91 98765 00000',
            'message': 'See attached specs for lanyards',
            'attachment': upload
        }
        response = self.client.post('/api/v1/enquiries/', payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        enq = Enquiry.objects.get(email='buyer@corporate.com')
        self.assertTrue(bool(enq.attachment))
        self.assertTrue(enq.attachment_url.startswith('/api/v1/owner/enquiries/'))

    def test_file_upload_validation_rejects_dangerous_files(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        exe_file = SimpleUploadedFile("malicious.exe", b"MZ\x90\x00executable", content_type="application/octet-stream")
        payload = {
            'full_name': 'Attacker',
            'email': 'attacker@bad.com',
            'phone': '+91 98765 00000',
            'message': 'Dangerous payload',
            'attachment': exe_file
        }
        response = self.client.post('/api/v1/enquiries/', payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('attachment', response.data)

    def test_direct_media_enquiry_download_blocked(self):
        response = self.client.get('/media/enquiries/2026/10/secret.pdf')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_authenticated_attachment_download(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        pdf_file = SimpleUploadedFile("artwork.pdf", b"%PDF-1.4 sample vector", content_type="application/pdf")
        enq = Enquiry.objects.create(
            full_name='Artwork Buyer',
            email='art@buyer.com',
            phone='+91 91234 56789',
            message='Vector artwork',
            attachment=pdf_file
        )

        # Unauthenticated request fails
        unauth_resp = self.client.get(f'/api/v1/owner/enquiries/{enq.id}/attachment/')
        self.assertIn(unauth_resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        # Authenticated owner request succeeds
        self.client.force_authenticate(user=self.owner)
        auth_resp = self.client.get(f'/api/v1/owner/enquiries/{enq.id}/attachment/')
        self.assertEqual(auth_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(auth_resp['X-Content-Type-Options'], 'nosniff')

