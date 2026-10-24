from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.catalog.models import Category, Product, ProductImage


class CatalogApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_superuser(
            username='admin_test',
            email='admin@test.com',
            password='AdminPassword123!'
        )
        self.category = Category.objects.create(
            name='Test Lanyard Rolls',
            slug='test-lanyard-rolls',
            description='Test category description',
            display_order=1,
            is_active=True
        )
        self.product = Product.objects.create(
            name='20MM Royal Blue Satin Lanyard Roll',
            slug='20mm-royal-blue-satin-lanyard-roll',
            sku='LAN-TEST-01',
            category=self.category,
            material='Polyester Satin',
            dimensions='20 mm x 100 m',
            color='Royal Blue',
            price=300.00,
            price_display='₹ 300 / Roll',
            specifications={'Roll Length': '100 m', 'Lanyard Width': '20 mm'},
            is_featured=True,
            is_active=True
        )
        self.image = ProductImage.objects.create(
            product=self.product,
            secure_url='https://example.com/test.png',
            alt_text='Royal Blue Roll',
            is_primary=True
        )

    def test_public_category_list(self):
        response = self.client.get('/api/v1/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['slug'], 'test-lanyard-rolls')

    def test_public_category_detail(self):
        response = self.client.get(f'/api/v1/categories/{self.category.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'TEST LANYARD ROLLS')

    def test_public_product_list(self):
        response = self.client.get('/api/v1/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)

    def test_public_product_detail(self):
        response = self.client.get(f'/api/v1/products/{self.product.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['sku'], 'LAN-TEST-01')
        self.assertEqual(response.data['specifications']['Roll Length'], '100 m')
        self.assertIn('primary_image', response.data or 'images')

    def test_public_product_search(self):
        response = self.client.get('/api/v1/products/?search=Royal+Blue')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['sku'], 'LAN-TEST-01')

    def test_public_global_search(self):
        response = self.client.get('/api/v1/search/?q=Lanyard')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('products', response.data)
        self.assertIn('categories', response.data)

    def test_unauthorized_user_cannot_create_product(self):
        response = self.client.post('/api/v1/owner/products/', {
            'name': 'Hacker Product',
            'sku': 'HACK-01',
            'category': self.category.id
        })
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_owner_can_create_and_delete_product(self):
        self.client.force_authenticate(user=self.owner)
        create_resp = self.client.post('/api/v1/owner/products/', {
            'name': 'New Executive Badge Holder',
            'sku': 'HLD-NEW-01',
            'category': self.category.id,
            'material': 'Polycarbonate',
            'price': 45.00
        })
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        new_id = create_resp.data['id']

        # Delete product
        del_resp = self.client.delete(f'/api/v1/owner/products/{new_id}/')
        self.assertEqual(del_resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_bulk_import_validation_and_execution(self):
        self.client.force_authenticate(user=self.owner)
        payload = {
            'products': [
                {
                    'name': 'Bulk Test Product A',
                    'sku': 'BLK-TEST-A',
                    'category_slug': 'test-lanyard-rolls',
                    'category_name': 'Test Lanyard Rolls',
                    'price': 150.0,
                    'material': 'Nylon'
                },
                {
                    'name': '20MM Royal Blue Satin Lanyard Roll',
                    'sku': 'LAN-TEST-01',  # duplicate SKU
                    'category_slug': 'test-lanyard-rolls',
                    'category_name': 'Test Lanyard Rolls',
                    'price': 320.0
                }
            ]
        }
        val_resp = self.client.post('/api/v1/owner/import/validate/', payload, format='json')
        self.assertEqual(val_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(val_resp.data['total_rows'], 2)
        self.assertEqual(val_resp.data['new_count'], 1)
        self.assertEqual(val_resp.data['existing_count'], 1)

        # Execute import with skip strategy
        exec_resp = self.client.post('/api/v1/owner/import/execute/', {
            'rows': payload['products'],
            'strategy': 'skip'
        }, format='json')
        self.assertEqual(exec_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(exec_resp.data['imported_count'], 1)
        self.assertEqual(exec_resp.data['skipped_count'], 1)
