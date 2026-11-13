"""End-to-end checks for the owner Excel (.xlsx) catalogue import."""
import datetime
import io
import json

import openpyxl
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Category, Product

XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


def _xlsx(rows, title_rows=0):
    wb = openpyxl.Workbook()
    ws = wb.active
    for _ in range(title_rows):
        ws.append(['The Print Planet price list'])
    for r in rows:
        ws.append(r)
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


@override_settings(DEBUG=True)
class ExcelImportTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        admin = get_user_model().objects.create_superuser('owner_t', 'o@example.com', 'pw-test-12345')
        self.client.force_authenticate(admin)

    def _validate(self, content, name='catalogue.xlsx'):
        upload = SimpleUploadedFile(name, content, content_type=XLSX)
        return self.client.post('/api/v1/owner/import/validate/', {'file': upload}, format='multipart')

    def _execute(self, rows, strategy='skip'):
        # Same JSON round trip as the owner screen: validate response -> browser -> execute.
        return self.client.post(
            '/api/v1/owner/import/execute/', json.dumps({'rows': rows, 'strategy': strategy}),
            content_type='application/json',
        )

    def test_owner_style_sheet_imports(self):
        content = _xlsx([
            ['Product Name', 'Category', 'SKU', 'Price', 'MOQ', 'Material', 'Updated On'],
            ['Clear ID Card Holder Vertical', 'ID Card Holder', 1001, 3.5, '100 pcs', 'PVC', datetime.datetime(2026, 11, 1)],
            ['20 mm Satin Lanyard Roll', 'Lanyard Rolls', 'LAN-20', '₹ 1,250', 1, None, datetime.date(2026, 11, 2)],
            [None, None, None, None, None, None, None],
        ])
        res = self._validate(content)
        self.assertEqual(res.status_code, 200, res.content[:500])
        body = res.json()
        self.assertEqual(body['valid_count'], 2, body)

        res = self._execute(body['rows'])
        self.assertEqual(res.status_code, 200, res.content[:500])
        self.assertTrue(Product.objects.filter(sku='1001', name__icontains='holder').exists())
        lanyard = Product.objects.get(sku='LAN-20')
        self.assertEqual(float(lanyard.price), 1250.0)

    def test_header_row_below_title_rows(self):
        content = _xlsx([
            ['Product Name', 'Category', 'SKU', 'Price'],
            ['Yoyo Reel', 'Accessories', 'YOYO-1', 12],
        ], title_rows=2)
        res = self._validate(content)
        self.assertEqual(res.status_code, 200, res.content[:500])
        self.assertEqual(res.json()['valid_count'], 1, res.json())

    def test_export_then_reimport_round_trip(self):
        cat = Category.objects.create(name='Machines', slug='machines')
        Product.objects.create(name='DCT250 Lanyard Heat Press', slug='dct250', sku='DCT250', category=cat, price=1000)
        export = self.client.get('/api/v1/owner/export/excel/')
        self.assertEqual(export.status_code, 200)
        content = b''.join(export.streaming_content) if hasattr(export, 'streaming_content') else export.content
        res = self._validate(content)
        self.assertEqual(res.status_code, 200, res.content[:500])
        body = res.json()
        self.assertGreaterEqual(body['valid_count'], 1, body)
        res = self._execute(body['rows'], strategy='update')
        self.assertEqual(res.status_code, 200, res.content[:500])

    def test_common_price_list_headers(self):
        content = _xlsx([
            ['S.No', 'Item Name', 'Item Code', 'Rate', 'Group'],
            [1, 'Badge Reel Yoyo', 'BR-01', '₹ 18', 'Accessories'],
        ])
        res = self._validate(content)
        self.assertEqual(res.status_code, 200, res.content[:500])
        body = res.json()
        self.assertEqual(body['valid_count'], 1, body)
        self.assertEqual(body['preview'][0]['sku'], 'BR-01')
        self._execute(body['rows'])
        p = Product.objects.get(sku='BR-01')
        self.assertEqual(p.name, 'Badge Reel Yoyo')
        self.assertEqual(float(p.price), 18.0)

    def test_old_xls_gets_clear_message(self):
        res = self._validate(b'not really xls', name='old.xls')
        self.assertEqual(res.status_code, 400)
        self.assertIn('.xlsx', res.json()['error'])

    def test_sheet_without_name_column_explains_why(self):
        res = self._validate(_xlsx([['Foo', 'Bar'], [1, 2]]))
        self.assertEqual(res.status_code, 400)
        self.assertIn('Product Name', res.json()['error'])
