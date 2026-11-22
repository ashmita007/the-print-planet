from unittest import mock

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.bulk_orders import razorpay, secret_box
from apps.bulk_orders.models import PaymentGatewaySettings

URL = '/api/v1/bulk-orders/owner/payment-settings/'
SECRET = 'AbCdEfGhIjKlMnOp1234'


@override_settings(RAZORPAY_KEY_ID='', RAZORPAY_KEY_SECRET='', RAZORPAY_WEBHOOK_SECRET='',
                   FRONTEND_URL='https://shop.example', SECRET_KEY='test-server-secret-for-payment-keys')
class PaymentSettingsTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_superuser('boss', 'boss@example.com', 'pw-123456')
        self.api = APIClient()
        self.api.force_authenticate(self.owner)

    def save(self, **data):
        with mock.patch('apps.bulk_orders.razorpay.check_keys') as check:
            res = self.api.put(URL, data, format='json')
        return res, check

    def test_secrets_are_encrypted_and_never_returned(self):
        res, check = self.save(key_id='rzp_test_Abc123XYZ', key_secret=SECRET, webhook_secret='hook-1', enabled=True)
        self.assertEqual(res.status_code, 200, res.data)
        check.assert_called_once_with('rzp_test_Abc123XYZ', SECRET)

        saved = PaymentGatewaySettings.load()
        self.assertNotIn(SECRET, saved.key_secret_encrypted)
        self.assertEqual(secret_box.decrypt(saved.key_secret_encrypted), SECRET)
        body = str(self.api.get(URL).data)
        self.assertNotIn(SECRET, body)
        self.assertNotIn('hook-1', body)
        data = self.api.get(URL).data
        self.assertEqual((data['key_secret_last4'], data['mode'], data['active_source']), ('1234', 'test', 'admin'))
        self.assertEqual(data['webhook_url'], 'https://shop.example/api/v1/bulk-orders/payments/razorpay/webhook/')
        self.assertEqual(razorpay.credentials(), ('rzp_test_Abc123XYZ', SECRET, 'hook-1', 'admin'))

    def test_blank_secret_keeps_the_saved_one(self):
        self.save(key_id='rzp_test_Abc123XYZ', key_secret=SECRET, enabled=True)
        res, check = self.save(key_id='rzp_test_Abc123XYZ', key_secret='', enabled=True)
        self.assertEqual(res.status_code, 200)
        check.assert_called_once_with('rzp_test_Abc123XYZ', SECRET)
        self.assertEqual(secret_box.decrypt(PaymentGatewaySettings.load().key_secret_encrypted), SECRET)

    def test_rejects_bad_keys_and_enabling_without_working_keys(self):
        self.assertEqual(self.save(key_id='sk_live_nope', key_secret=SECRET)[0].status_code, 400)
        self.assertEqual(self.save(key_id='rzp_test_Abc123XYZ', key_secret='short')[0].status_code, 400)
        self.assertEqual(self.save(key_id='rzp_test_Abc123XYZ', enabled=True)[0].status_code, 400)
        with mock.patch('apps.bulk_orders.razorpay.check_keys', side_effect=razorpay.RazorpayError('401')):
            res = self.api.put(URL, {'key_id': 'rzp_test_Abc123XYZ', 'key_secret': SECRET, 'enabled': True}, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertFalse(PaymentGatewaySettings.objects.exists())
        self.assertFalse(razorpay.is_configured())

    def test_disabled_admin_keys_fall_back_to_environment(self):
        self.save(key_id='rzp_test_Abc123XYZ', key_secret=SECRET, enabled=False)
        self.assertFalse(razorpay.is_configured())
        with override_settings(RAZORPAY_KEY_ID='rzp_test_env', RAZORPAY_KEY_SECRET='env-secret'):
            self.assertEqual(razorpay.credentials()[3], 'environment')

    def test_changed_server_secret_makes_saved_keys_unusable_not_wrong(self):
        self.save(key_id='rzp_test_Abc123XYZ', key_secret=SECRET, enabled=True)
        with override_settings(SECRET_KEY='a-different-server-secret'):
            self.assertFalse(razorpay.is_configured())
            self.assertTrue(self.api.get(URL).data['secrets_unreadable'])

    def test_clear_secrets_turns_payments_off(self):
        self.save(key_id='rzp_test_Abc123XYZ', key_secret=SECRET, enabled=True)
        res, _ = self.save(clear_secrets=True)
        self.assertFalse(res.data['enabled'])
        self.assertFalse(res.data['has_key_secret'])

    def test_key_test_endpoint_does_not_save(self):
        with mock.patch('apps.bulk_orders.razorpay.check_keys') as check:
            res = self.api.post(f'{URL}test/', {'key_id': 'rzp_live_Abc123XYZ', 'key_secret': SECRET}, format='json')
        self.assertEqual(res.data, {'ok': True, 'mode': 'live'})
        check.assert_called_once()
        self.assertFalse(PaymentGatewaySettings.objects.exists())

    def test_only_admins_can_use_settings_and_payments_list(self):
        user = User.objects.create_user('buyer', 'b@example.com', 'pw-123456')
        api = APIClient()
        api.force_authenticate(user)
        self.assertEqual(api.get(URL).status_code, 403)
        self.assertEqual(api.put(URL, {'key_id': 'rzp_test_Abc123XYZ'}, format='json').status_code, 403)
        self.assertEqual(api.get('/api/v1/bulk-orders/owner/payments/').status_code, 403)
        self.assertEqual(APIClient().get(URL).status_code, 401)
        self.assertEqual(self.api.get('/api/v1/bulk-orders/owner/payments/').status_code, 200)

    def test_refuses_to_store_secrets_under_development_secret_key(self):
        with override_settings(SECRET_KEY='the-print-planet-production-secret-key-2026'):
            self.assertEqual(self.save(key_id='rzp_test_Abc123XYZ', key_secret=SECRET)[0].status_code, 400)
        with override_settings(SECRET_KEY='django-insecure-public-dev-key'):
            res, _ = self.save(key_id='rzp_test_Abc123XYZ', key_secret=SECRET)
            self.assertEqual(res.status_code, 400)
            self.assertFalse(self.api.get(URL).data['can_store_secrets'])
        self.assertFalse(PaymentGatewaySettings.objects.exists())

    def test_webhook_secret_falls_back_to_environment(self):
        self.save(key_id='rzp_test_Abc123XYZ', key_secret=SECRET, enabled=True)
        self.assertFalse(self.api.get(URL).data['webhook_ready'])
        with override_settings(RAZORPAY_WEBHOOK_SECRET='env-hook'):
            self.assertEqual(razorpay.credentials()[2], 'env-hook')
            self.assertTrue(self.api.get(URL).data['webhook_ready'])

    def test_webhook_url_uses_request_host_without_frontend_url(self):
        with override_settings(FRONTEND_URL=''):
            url = self.api.get(URL, HTTP_HOST='shop.test').data['webhook_url']
        self.assertEqual(url, 'http://shop.test/api/v1/bulk-orders/payments/razorpay/webhook/')

