"""Public product endpoints and the owner product ViewSet."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product


def make_product(category, name, sku, **extra):
    return Product.objects.create(name=name, slug=name.lower().replace(' ', '-'), sku=sku, category=category, **extra)


class PublicProductTests(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.cards = Category.objects.create(name='Zz Cards', slug='zz-cards')
        self.lanyards = Category.objects.create(name='Zz Lanyards', slug='zz-lanyards')
        self.card = make_product(self.cards, 'Zz Blank Card', 'ZZ-CARD-1', material='Zzpvc', is_featured=True)
        self.lanyard = make_product(self.lanyards, 'Zz Satin Lanyard', 'ZZ-LAN-1', material='Zzsatin', color='Zzblue')
        make_product(self.cards, 'Zz Hidden Card', 'ZZ-CARD-2', is_active=False)

    def _names(self, res):
        return sorted(p['name'] for p in res.data['results'])

    def test_list_returns_only_active_products(self):
        res = self.api.get('/api/v1/products/', {'search': 'zz', 'page_size': 100})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(self._names(res), ['Zz Blank Card', 'Zz Satin Lanyard'])

    def test_filter_by_category_slug(self):
        res = self.api.get('/api/v1/products/', {'category': 'zz-lanyards'})
        self.assertEqual(self._names(res), ['Zz Satin Lanyard'])

    def test_filter_by_search_and_attributes(self):
        self.assertEqual(self._names(self.api.get('/api/v1/products/', {'search': 'zzsatin'})), ['Zz Satin Lanyard'])
        self.assertEqual(self._names(self.api.get('/api/v1/products/', {'color': 'zzblue'})), ['Zz Satin Lanyard'])
        self.assertEqual(self._names(self.api.get('/api/v1/products/', {'featured': 'true', 'search': 'zz'})), ['Zz Blank Card'])

    def test_search_without_match_is_empty(self):
        res = self.api.get('/api/v1/products/', {'search': 'nothing-like-this'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['results'], [])

    def test_detail_by_slug(self):
        res = self.api.get('/api/v1/products/zz-satin-lanyard/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['sku'], 'ZZ-LAN-1')

    def test_detail_404_for_unknown_and_inactive(self):
        self.assertEqual(self.api.get('/api/v1/products/no-such-product/').status_code, 404)
        self.assertEqual(self.api.get('/api/v1/products/zz-hidden-card/').status_code, 404)


class OwnerProductTests(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.api.force_authenticate(get_user_model().objects.create_superuser('owner_v', 'ov@example.com', 'pw-test-12345'))
        self.cat = Category.objects.create(name='Zz Owner Cards', slug='zz-owner-cards')

    def _payload(self, **extra):
        return {'name': 'New Card', 'sku': 'NEW-1', 'category': self.cat.id, **extra}

    def test_create_generates_slug(self):
        res = self.api.post('/api/v1/owner/products/', self._payload(price='12.50'), format='json')
        self.assertEqual(res.status_code, 201, res.data)
        product = Product.objects.get(sku='NEW-1')
        self.assertEqual(product.slug, 'new-card')
        self.assertEqual(str(product.price), '12.50')

    def test_create_rejects_missing_name_and_duplicate_sku(self):
        res = self.api.post('/api/v1/owner/products/', {'sku': 'X-1', 'category': self.cat.id}, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('name', res.data)
        make_product(self.cat, 'Existing', 'NEW-1')
        res = self.api.post('/api/v1/owner/products/', self._payload(), format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('sku', res.data)

    def test_update_changes_fields(self):
        product = make_product(self.cat, 'Old Name', 'OLD-1')
        res = self.api.patch(f'/api/v1/owner/products/{product.id}/', {'name': 'Fresh Name', 'is_active': False}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        product.refresh_from_db()
        self.assertEqual(product.name, 'Fresh Name')
        self.assertFalse(product.is_active)

    def test_update_rejects_invalid_price(self):
        product = make_product(self.cat, 'Old Name', 'OLD-1')
        res = self.api.patch(f'/api/v1/owner/products/{product.id}/', {'price': 'not-a-number'}, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('price', res.data)

    def test_delete_removes_product(self):
        product = make_product(self.cat, 'Doomed', 'DEL-1')
        res = self.api.delete(f'/api/v1/owner/products/{product.id}/')
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Product.objects.filter(pk=product.pk).exists())

    def test_delete_unknown_is_404(self):
        self.assertEqual(self.api.delete('/api/v1/owner/products/999999/').status_code, 404)


class OwnerExportTests(TestCase):
    def test_export_returns_xlsx_workbook(self):
        api = APIClient()
        api.force_authenticate(get_user_model().objects.create_superuser('owner_x', 'ox@example.com', 'pw-test-12345'))
        res = api.get('/api/v1/owner/export/excel/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('spreadsheetml', res['Content-Type'])
        self.assertTrue(res.content.startswith(b'PK'))
