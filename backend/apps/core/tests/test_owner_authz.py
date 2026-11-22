"""Every owner endpoint must reject anonymous callers (401) and non-admin users (403)."""
import re

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import get_resolver
from rest_framework.test import APIClient

ROUTE_KWARG = re.compile(r'<(?:(\w+):)?\w+>')
REGEX_GROUP = re.compile(r'\(\?P<\w+>[^)]*\)')


def _owner_paths():
    """Concrete URLs for every pattern under an 'owner/' prefix, with path kwargs filled in."""
    found = set()

    def walk(patterns, prefix):
        for p in patterns:
            raw = str(p.pattern)
            if hasattr(p, 'url_patterns'):
                walk(p.url_patterns, prefix + raw)
                continue
            full = prefix + raw
            # The router's API root page lists route names only; it is public by design.
            if 'owner/' not in full or 'format' in full or full == 'api/v1/owner/':
                continue
            full = ROUTE_KWARG.sub(lambda m: '1' if m.group(1) == 'int' else 'x', full)
            full = REGEX_GROUP.sub('1', full).replace('^', '').replace('$', '')
            if '\\' in full or '(' in full:
                continue
            found.add('/' + full)

    walk(get_resolver().url_patterns, '')
    return sorted(found)


class OwnerEndpointAuthzTests(TestCase):
    def setUp(self):
        self.paths = _owner_paths()
        self.api = APIClient()
        self.user = get_user_model().objects.create_user('plain_buyer', 'buyer@example.com', 'pw-test-12345')

    def _status(self, client, path):
        res = client.get(path)
        if res.status_code == 405:
            res = client.post(path, {}, format='json')
        return res.status_code

    def test_found_the_owner_endpoints(self):
        self.assertGreater(len(self.paths), 20)

    def test_anonymous_gets_401(self):
        for path in self.paths:
            with self.subTest(path=path):
                self.assertEqual(self._status(self.api, path), 401)

    def test_non_admin_gets_403(self):
        self.api.force_authenticate(self.user)
        for path in self.paths:
            with self.subTest(path=path):
                self.assertEqual(self._status(self.api, path), 403)
