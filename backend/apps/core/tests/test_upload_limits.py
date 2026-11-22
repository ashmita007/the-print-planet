"""Large JSON bodies for the catalogue import must work on Django's default body limit."""
import json

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient


@override_settings(DEBUG=True)
class LargeImportBodyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        admin = get_user_model().objects.create_superuser('owner_big', 'big@example.com', 'pw-test-12345')
        self.client.force_authenticate(admin)
        # Roughly 4 MB of JSON, above Django's 2.5 MB DATA_UPLOAD_MAX_MEMORY_SIZE default.
        self.rows = [
            {'name': f'Bulk product {i}', 'category': 'Bulk', 'price': '10', 'description': 'x' * 400}
            for i in range(8000)
        ]
        self.assertGreater(len(json.dumps({'rows': self.rows})), 3 * 1024 * 1024)

    def test_validate_accepts_large_json_body(self):
        res = self.client.post('/api/v1/owner/import/validate/', {'products': self.rows}, format='json')
        self.assertEqual(res.status_code, 200, getattr(res, 'data', res.content[:200]))

    def test_execute_accepts_large_json_body(self):
        res = self.client.post('/api/v1/owner/import/execute/', {'rows': self.rows, 'strategy': 'skip'}, format='json')
        self.assertEqual(res.status_code, 200, getattr(res, 'data', res.content[:200]))

    def test_other_endpoints_keep_default_limit(self):
        res = self.client.post('/api/v1/owner/categories/', {'name': 'x' * (3 * 1024 * 1024)}, format='json')
        self.assertEqual(res.status_code, 400)
