from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


class AuthenticationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.password = 'SuperSecretOwner123!'
        self.owner = User.objects.create_superuser(
            username='siteowner',
            email='owner@test.com',
            password=self.password
        )
        self.regular_user = User.objects.create_user(
            username='regular',
            email='regular@test.com',
            password=self.password
        )

    def test_owner_login_success(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'siteowner',
            'password': self.password
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'siteowner')

    def test_owner_login_via_email(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'owner@test.com',
            'password': self.password
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_client_user_login_succeeds(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'regular',
            'password': self.password
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'client')
        self.assertIn('token', response.data)

    def test_auth_me_endpoint(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'siteowner')
        self.assertTrue(response.data['is_staff'])

    def test_owner_change_password(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post('/api/v1/auth/change-password/', {
            'current_password': self.password,
            'new_password': 'BrandNewPassword456!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.owner.refresh_from_db()
        self.assertTrue(self.owner.check_password('BrandNewPassword456!'))


from django.test import override_settings


class PasswordResetSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User.objects.create_superuser('boss', 'boss@pp.in', 'BossPass!2026')

    @override_settings(DEBUG=False)
    def test_reset_token_never_returned_for_owner(self):
        res = self.client.post('/api/v1/auth/forgot-password/', {'email': 'boss@pp.in'})
        self.assertEqual(res.status_code, 200)
        self.assertNotIn('debug_reset_token', res.data)
        self.assertNotIn('uid', res.data)

    def test_register_rejects_weak_password(self):
        res = self.client.post('/api/v1/auth/register/', {
            'full_name': 'Weak User', 'email': 'weak@x.com', 'phone': '1', 'password': '12345678'})
        self.assertEqual(res.status_code, 400)

    def test_me_returns_profile_and_role(self):
        self.client.post('/api/v1/auth/register/', {
            'full_name': 'Jane Buyer', 'email': 'jane@buyer.com', 'phone': '1', 'password': 'Jane#Buyer2026'})
        user = User.objects.get(email='jane@buyer.com')
        self.client.force_authenticate(user=user)
        res = self.client.get('/api/v1/auth/me/')
        self.assertEqual(res.data['first_name'], 'Jane')
        self.assertEqual(res.data['role'], 'client')
