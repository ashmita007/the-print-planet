import io
import urllib.error
from unittest import mock

from django.test import SimpleTestCase

from apps.catalog.management.commands import sync_sqlite_cloud as sync

FAKE_URL = 'cloudinary://key123:secret456@democloud'


class _Resp(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class BackupPrivacyTests(SimpleTestCase):
    def test_requires_configured_credentials(self):
        with mock.patch.dict('os.environ', {'CLOUDINARY_BACKUP_URL': '', 'CLOUDINARY_URL': ''}), \
                self.settings(CLOUDINARY_URL=''):
            with self.assertRaises(RuntimeError):
                sync.configure_cloudinary()

    def test_backup_url_is_preferred(self):
        with mock.patch.dict('os.environ', {'CLOUDINARY_BACKUP_URL': FAKE_URL, 'CLOUDINARY_URL': ''}):
            self.assertEqual(sync.configure_cloudinary(), 'democloud')

    def test_falls_back_to_legacy_public_copy_only_on_404(self):
        calls = []

        def fake_open(req, **kwargs):
            calls.append(req.full_url)
            if 'private' in req.full_url or 'api.cloudinary' in req.full_url:
                raise urllib.error.HTTPError(req.full_url, 404, 'missing', {}, None)
            return _Resp(b'legacy-bytes')

        with mock.patch.dict('os.environ', {'CLOUDINARY_BACKUP_URL': FAKE_URL}), \
                mock.patch('urllib.request.urlopen', side_effect=fake_open):
            data = sync.fetch_backup(sync.DB_BACKUP_ID, ctx=None, timeout=1)
        self.assertEqual(data, b'legacy-bytes')
        self.assertEqual(calls[-1], f'https://res.cloudinary.com/democloud/raw/upload/{sync.DB_BACKUP_ID}')

    def test_other_errors_do_not_fall_back(self):
        def fake_open(req, **kwargs):
            raise urllib.error.HTTPError(req.full_url, 500, 'down', {}, None)

        with mock.patch.dict('os.environ', {'CLOUDINARY_BACKUP_URL': FAKE_URL}), \
                mock.patch('urllib.request.urlopen', side_effect=fake_open) as opened:
            with self.assertRaises(urllib.error.HTTPError):
                sync.fetch_backup(sync.DB_BACKUP_ID, ctx=None, timeout=1)
        self.assertEqual(opened.call_count, 1)

    def test_upload_never_deletes_anything(self):
        with mock.patch.dict('os.environ', {'CLOUDINARY_BACKUP_URL': FAKE_URL}), \
                mock.patch('cloudinary.uploader.upload') as up, mock.patch('cloudinary.uploader.destroy') as destroy:
            sync.upload_private_backup(b'data', sync.DB_BACKUP_ID)
        self.assertEqual(up.call_args.kwargs['type'], 'private')
        destroy.assert_not_called()


class PurgePublicTests(SimpleTestCase):
    def run_purge(self, payload):
        out = io.StringIO()
        with mock.patch.dict('os.environ', {'CLOUDINARY_BACKUP_URL': FAKE_URL}), \
                mock.patch('urllib.request.urlopen', return_value=_Resp(payload)), \
                mock.patch('cloudinary.uploader.destroy', return_value={'result': 'ok'}) as destroy:
            cmd = sync.Command(stdout=out)
            try:
                cmd.purge_public_copies()
            except Exception as exc:  # noqa: BLE001 - the test inspects the error type
                return destroy, exc
        return destroy, None

    @staticmethod
    def sqlite_bytes(products):
        import os
        import sqlite3
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, 'db.sqlite3')
            conn = sqlite3.connect(path)
            conn.execute('CREATE TABLE catalog_product (id INTEGER PRIMARY KEY)')
            conn.executemany('INSERT INTO catalog_product VALUES (?)', [(i,) for i in range(products)])
            conn.commit()
            conn.close()
            with open(path, 'rb') as f:
                return f.read()

    def test_keeps_public_copies_when_private_is_not_sqlite(self):
        destroy, exc = self.run_purge(b'not a database')
        self.assertIsInstance(exc, sync.CommandError)
        destroy.assert_not_called()

    def test_keeps_public_copies_when_private_has_no_products(self):
        destroy, exc = self.run_purge(self.sqlite_bytes(0))
        self.assertIsInstance(exc, sync.CommandError)
        destroy.assert_not_called()

    def test_deletes_public_copies_after_verifying_private(self):
        destroy, exc = self.run_purge(self.sqlite_bytes(3))
        self.assertIsNone(exc)
        self.assertEqual(destroy.call_count, 2)
        self.assertTrue(all(c.kwargs['type'] == 'upload' for c in destroy.call_args_list))
