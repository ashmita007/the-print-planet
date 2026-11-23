from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from apps.authentication.models import Address

URL = '/api/v1/account/addresses/'
GOOD = {'label': 'Office', 'full_name': 'Asha', 'phone': '9000000000', 'line1': '1 MG Road',
        'city': 'Bengaluru', 'state': 'Karnataka', 'pincode': '560001'}


class AddressApiTests(TestCase):
    def setUp(self):
        self.a = User.objects.create_user('a', 'a@example.com', 'pw-123456')
        self.b = User.objects.create_user('b', 'b@example.com', 'pw-123456')
        self.api = APIClient()
        self.api.force_authenticate(self.a)

    def test_requires_login(self):
        self.assertIn(APIClient().get(URL).status_code, (401, 403))

    def test_crud_and_only_owner_sees_rows(self):
        res = self.api.post(URL, GOOD, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        mine = res.data['id']
        theirs = Address.objects.create(user=self.b, **GOOD).pk

        self.assertEqual([r['id'] for r in self.api.get(URL).data], [mine])
        for method in ('get', 'patch', 'delete'):
            self.assertEqual(getattr(self.api, method)(f'{URL}{theirs}/').status_code, 404)
        self.assertEqual(self.api.patch(f'{URL}{mine}/', {'city': 'Mysuru'}, format='json').data['city'], 'Mysuru')
        self.assertEqual(self.api.delete(f'{URL}{mine}/').status_code, 204)
        self.assertTrue(Address.objects.filter(pk=theirs).exists())

    def test_validation(self):
        for bad in ({'state': 'Atlantis'}, {'pincode': '5600'}, {'pincode': 'abcdef'}, {'gstin': '123'}):
            self.assertEqual(self.api.post(URL, {**GOOD, **bad}, format='json').status_code, 400, bad)
        ok = self.api.post(URL, {**GOOD, 'gstin': '29aaqft3909b1zz'}, format='json')
        self.assertEqual(ok.status_code, 201, ok.data)
        self.assertEqual(ok.data['gstin'], '29AAQFT3909B1ZZ')
        alias = self.api.post(URL, {**GOOD, 'state': 'orissa'}, format='json')
        self.assertEqual(alias.data['state'], 'Odisha')

    def test_one_default_per_kind(self):
        first = self.api.post(URL, {**GOOD, 'is_default_shipping': True}, format='json').data['id']
        self.api.post(URL, {**GOOD, 'is_default_shipping': True}, format='json')
        self.assertFalse(Address.objects.get(pk=first).is_default_shipping)
