from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


class AuthenticationApiTests(TestCase):
    def setUp(self):
        cache.clear()  # the auth throttle (30/min) is shared across tests
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


from datetime import timedelta
from unittest.mock import patch

from django.test import override_settings
from django.utils import timezone


class PasswordResetSecurityTests(TestCase):
    def setUp(self):
        cache.clear()  # the auth throttle (30/min) is shared across tests
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
        with patch('apps.authentication.otp._new_code', return_value='123456'):
            self.client.post('/api/v1/auth/register/', {
                'full_name': 'Jane Buyer', 'email': 'jane@buyer.com', 'phone': '1', 'password': 'Jane#Buyer2026'})
        self.client.post('/api/v1/auth/verify-email/', {'email': 'jane@buyer.com', 'code': '123456'})
        user = User.objects.get(email='jane@buyer.com')
        self.client.force_authenticate(user=user)
        res = self.client.get('/api/v1/auth/me/')
        self.assertEqual(res.data['first_name'], 'Jane')
        self.assertEqual(res.data['role'], 'client')


PW = 'Buyer#Strong2026'


def register(client, email='buyer@school.in', code='123456', **extra):
    data = {'full_name': 'Asha Rao', 'company_name': 'Green School', 'email': email, 'phone': '9876543210', 'password': PW}
    data.update(extra)
    with patch('apps.authentication.otp._new_code', return_value=code):
        return client.post('/api/v1/auth/register/', data)


class EmailOTPRegistrationTests(TestCase):
    def setUp(self):
        cache.clear()  # the auth throttle (30/min) is shared across tests
        self.client = APIClient()

    def test_register_creates_inactive_account_without_token(self):
        res = register(self.client)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(res.data['verification_required'])
        self.assertNotIn('token', res.data)
        user = User.objects.get(email='buyer@school.in')
        self.assertFalse(user.is_active)
        self.assertEqual(user.email_otps.count(), 1)
        self.assertNotEqual(user.email_otps.first().code_hash, '123456')

    @override_settings(DEBUG=False)
    def test_code_never_in_response_outside_debug(self):
        res = register(self.client)
        self.assertNotIn('debug_otp', res.data)

    def test_correct_code_activates_and_signs_in(self):
        register(self.client)
        res = self.client.post('/api/v1/auth/verify-email/', {'email': 'buyer@school.in', 'code': '123 456'})
        self.assertEqual(res.status_code, 200)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['role'], 'client')
        self.assertTrue(User.objects.get(email='buyer@school.in').is_active)
        again = self.client.post('/api/v1/auth/verify-email/', {'email': 'buyer@school.in', 'code': '123456'})
        self.assertEqual(again.status_code, 400)

    def test_wrong_code_counts_down_then_locks(self):
        register(self.client)
        for left in (4, 3, 2, 1):
            res = self.client.post('/api/v1/auth/verify-email/', {'email': 'buyer@school.in', 'code': '000000'})
            self.assertEqual(res.data['attempts_left'], left)
        res = self.client.post('/api/v1/auth/verify-email/', {'email': 'buyer@school.in', 'code': '000000'})
        self.assertEqual(res.data['code'], 'otp_locked')
        res = self.client.post('/api/v1/auth/verify-email/', {'email': 'buyer@school.in', 'code': '123456'})
        self.assertEqual(res.status_code, 400)  # even the right code is refused once locked
        self.assertFalse(User.objects.get(email='buyer@school.in').is_active)

    def test_expired_code_refused(self):
        register(self.client)
        User.objects.get(email='buyer@school.in').email_otps.update(expires_at=timezone.now() - timedelta(seconds=1))
        res = self.client.post('/api/v1/auth/verify-email/', {'email': 'buyer@school.in', 'code': '123456'})
        self.assertEqual(res.data['code'], 'otp_expired')

    def test_resend_cooldown_and_new_code_replaces_old(self):
        register(self.client)
        res = self.client.post('/api/v1/auth/resend-otp/', {'email': 'buyer@school.in'})
        self.assertEqual(res.status_code, 429)
        User.objects.get(email='buyer@school.in').email_otps.update(created_at=timezone.now() - timedelta(minutes=2))
        with patch('apps.authentication.otp._new_code', return_value='654321'):
            res = self.client.post('/api/v1/auth/resend-otp/', {'email': 'buyer@school.in'})
        self.assertEqual(res.status_code, 200)
        old = self.client.post('/api/v1/auth/verify-email/', {'email': 'buyer@school.in', 'code': '123456'})
        self.assertEqual(old.status_code, 400)
        new = self.client.post('/api/v1/auth/verify-email/', {'email': 'buyer@school.in', 'code': '654321'})
        self.assertEqual(new.status_code, 200)

    def test_resend_unknown_email_is_generic(self):
        res = self.client.post('/api/v1/auth/resend-otp/', {'email': 'nobody@x.in'})
        self.assertEqual(res.status_code, 200)

    def test_login_before_verification_points_to_code_step(self):
        register(self.client)
        res = self.client.post('/api/v1/auth/login/', {'username': 'buyer@school.in', 'password': PW})
        self.assertEqual(res.status_code, 403)
        self.assertEqual(res.data['code'], 'email_unverified')
        self.assertNotIn('token', res.data)
        wrong = self.client.post('/api/v1/auth/login/', {'username': 'buyer@school.in', 'password': 'nope-nope-1'})
        self.assertEqual(wrong.status_code, 401)  # no hint without the right password

    def test_verified_email_cannot_register_again(self):
        register(self.client)
        self.client.post('/api/v1/auth/verify-email/', {'email': 'buyer@school.in', 'code': '123456'})
        res = register(self.client)
        self.assertEqual(res.status_code, 400)

    def test_guest_enquiries_link_only_after_verification(self):
        from apps.enquiries.models import Enquiry
        enquiry = Enquiry.objects.create(full_name='Asha', email='buyer@school.in', phone='9876543210', message='Need 500 cards')
        register(self.client)
        enquiry.refresh_from_db()
        self.assertIsNone(enquiry.user_id)
        self.client.post('/api/v1/auth/verify-email/', {'email': 'buyer@school.in', 'code': '123456'})
        enquiry.refresh_from_db()
        self.assertEqual(enquiry.user.email, 'buyer@school.in')

    def test_disabled_account_is_not_treated_as_pending(self):
        register(self.client)
        self.client.post('/api/v1/auth/verify-email/', {'email': 'buyer@school.in', 'code': '123456'})
        User.objects.filter(email='buyer@school.in').update(is_active=False)  # owner switched it off
        self.assertEqual(register(self.client).status_code, 400)
        res = self.client.post('/api/v1/auth/forgot-password/', {'email': 'buyer@school.in'})
        self.assertEqual(res.status_code, 200)
        self.assertNotIn('debug_reset_token', res.data)


class PasswordResetFlowTests(TestCase):
    def setUp(self):
        cache.clear()  # the auth throttle (30/min) is shared across tests
        self.client = APIClient()
        self.user = User.objects.create_user('asha', 'asha@school.in', PW, first_name='Asha')

    def _link(self):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode
        return urlsafe_base64_encode(force_bytes(self.user.pk)), default_token_generator.make_token(self.user)

    def test_forgot_password_sends_branded_email_with_link(self):
        with patch('apps.enquiries.services._send_email_via_https', return_value=True) as send:
            res = self.client.post('/api/v1/auth/forgot-password/', {'email': 'ASHA@school.in'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(send.call_count, 1)
        to, subject, text, html = send.call_args[0][:4]
        self.assertEqual(to, 'asha@school.in')
        self.assertIn('/account/reset-password?uid=', text)
        self.assertIn('Set a new password', html)
        self.assertIn('60 minutes', text)

    def test_unknown_email_sends_nothing(self):
        with patch('apps.enquiries.services._send_email_via_https', return_value=True) as send:
            res = self.client.post('/api/v1/auth/forgot-password/', {'email': 'ghost@school.in'})
        self.assertEqual(res.status_code, 200)
        send.assert_not_called()

    def test_reset_link_works_once(self):
        uid, token = self._link()
        res = self.client.post('/api/v1/auth/reset-password/', {'uid': uid, 'token': token, 'new_password': 'Fresh#Pass2026'})
        self.assertEqual(res.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('Fresh#Pass2026'))
        again = self.client.post('/api/v1/auth/reset-password/', {'uid': uid, 'token': token, 'new_password': 'Other#Pass2026'})
        self.assertEqual(again.status_code, 400)

    def test_reset_link_expires(self):
        uid, token = self._link()
        with patch('django.contrib.auth.tokens.PasswordResetTokenGenerator._now',
                   return_value=timezone.now().replace(tzinfo=None) + timedelta(hours=2)):
            res = self.client.post('/api/v1/auth/reset-password/', {'uid': uid, 'token': token, 'new_password': 'Fresh#Pass2026'})
        self.assertEqual(res.status_code, 400)

    def test_reset_activates_unverified_signup(self):
        register(self.client, email='new@school.in')
        self.user = User.objects.get(email='new@school.in')
        uid, token = self._link()
        res = self.client.post('/api/v1/auth/reset-password/', {'uid': uid, 'token': token, 'new_password': 'Fresh#Pass2026'})
        self.assertEqual(res.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
        login = self.client.post('/api/v1/auth/login/', {'username': 'new@school.in', 'password': 'Fresh#Pass2026'})
        self.assertEqual(login.status_code, 200)


class BulkOrderAccountTakeoverTests(TestCase):
    def test_existing_email_without_password_gets_no_token(self):
        cache.clear()
        User.objects.create_superuser('boss', 'boss@pp.in', 'BossPass!2026')
        client = APIClient()
        res = client.post('/api/v1/bulk-orders/submit/', {
            'organization_name': 'X', 'organization_type': 'school', 'contact_person': 'X', 'email': 'boss@pp.in',
            'phone': '9876543210', 'city': 'Bengaluru', 'state': 'Karnataka', 'category_type': 'pvc_cards',
            'estimated_quantity': 100, 'requirements': 'cards',
        })
        self.assertFalse((res.data or {}).get('token'))
        self.assertFalse((res.data or {}).get('user'))
