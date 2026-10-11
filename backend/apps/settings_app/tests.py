from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.settings_app.models import SiteSettings, HomePageSection


class SettingsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_superuser(
            username='admin_settings',
            email='settings@test.com',
            password='AdminPassword123!'
        )

    def test_public_site_settings(self):
        response = self.client.get('/api/v1/site-settings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['business_name'], 'The Print Planet')

    def test_owner_can_update_site_settings(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.patch('/api/v1/owner/site-settings/', {
            'tagline': 'Updated Tagline For Testing',
            'phone': '+91 99999 11111'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['tagline'], 'Updated Tagline For Testing')
        self.assertEqual(response.data['phone'], '+91 99999 11111')

    def test_owner_stats_dashboard(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.get('/api/v1/owner/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('metrics', response.data)
        self.assertIn('total_products', response.data['metrics'])
        self.assertIn('total_categories', response.data['metrics'])
