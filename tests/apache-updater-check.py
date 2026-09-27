import fcntl
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import tarfile
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('updater', 'deploy/update-apache.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def make_release(root, source, base='/MSA/'):
    root.mkdir(parents=True)
    files = {'index.html': '<html>home</html>', '404.html': '<html>404</html>',
             'basics/pairwise.html': '<html>pairwise</html>',
             'assets/app.' + source[:8] + '.js': 'source=' + source,
             'release.json': json.dumps({'schema': 1, 'source': source, 'base': base})}
    for name, content in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
    (root / 'FILES.sha256').write_text(''.join(hashlib.sha256((root / n).read_bytes()).hexdigest() + '  ' + n + '\n' for n in sorted(files)))


class Fixture(module.Updater):
    def __init__(self, root, archive, revision):
        super().__init__(str(root))
        self.archive = archive
        self.revision = revision
        self.fail_network = False
        self.fail_health = False
        self.downloads = 0

    def latest(self):
        if self.fail_network:
            raise RuntimeError('simulated network failure')
        return self.revision

    def download(self, url, target):
        self.downloads += 1
        shutil.copyfile(self.archive, target)

    def health(self, release):
        if self.fail_health:
            raise RuntimeError('simulated HTTP health failure')
        assert Path(self.root, '.htaccess').read_bytes() == self.config(self.revision)


class UpdateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='msa-apache-test-')
        self.top = Path(self.temp.name)
        self.root = self.top / 'MSA'
        make_release(self.root, 'a' * 40)
        (self.root / '.deploy').mkdir()
        (self.root / '.htaccess').write_text('DirectoryIndex index.html\n')
        self.original = (self.root / '.htaccess').read_bytes()
        self.archive = self.top / 'site.tar.gz'
        self.candidate = self.top / 'candidate'
        self.revision = 'b' * 40
        make_release(self.candidate, 'c' * 40)
        self.pack()
        self.updater = Fixture(self.root, self.archive, self.revision)

    def pack(self):
        with tarfile.open(self.archive, 'w:gz') as bundle:
            bundle.add(self.candidate, arcname='new-msa-website-' + self.revision)

    def tearDown(self):
        self.temp.cleanup()

    def test_update_no_change_and_lock(self):
        self.updater.run()
        state = json.loads((self.root / '.deploy/state.json').read_text())
        self.assertEqual(state['site'], self.revision)
        self.assertTrue((self.root / '.deploy/baseline/index.html').is_file())
        self.assertTrue((self.root / ('assets/app.' + 'a' * 8 + '.js')).is_file())
        self.assertTrue((self.root / ('assets/app.' + 'c' * 8 + '.js')).is_file())
        self.updater.run()
        self.assertEqual(self.updater.downloads, 1)
        with open(self.root / '.deploy/update.lock', 'a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            self.updater.run()
        self.assertIn('SKIP', (self.root / '.deploy/update.log').read_text())
        (self.root / '.deploy/paused').touch()
        self.updater.run()
        self.assertIn('PAUSED', (self.root / '.deploy/update.log').read_text())

    def test_network_and_checksum_failure(self):
        self.updater.fail_network = True
        with self.assertRaises(RuntimeError):
            self.updater.run()
        self.updater.fail_network = False
        (self.candidate / 'index.html').write_text('tampered')
        self.pack()
        with self.assertRaisesRegex(ValueError, 'Checksum mismatch'):
            self.updater.run()
        self.assertEqual((self.root / '.htaccess').read_bytes(), self.original)
        self.assertFalse((self.root / '.deploy/state.json').exists())

    def test_health_failure_rolls_back_existing_release(self):
        self.updater.run()
        before = (self.root / '.htaccess').read_bytes()
        before_state = (self.root / '.deploy/state.json').read_bytes()
        self.revision = 'd' * 40
        self.pack()
        self.updater.revision = self.revision
        self.updater.fail_health = True
        with self.assertRaises(RuntimeError):
            self.updater.run()
        self.assertEqual((self.root / '.htaccess').read_bytes(), before)
        self.assertEqual((self.root / '.deploy/state.json').read_bytes(), before_state)

    def test_reject_wrong_base_unlisted_file_and_collision(self):
        shutil.rmtree(self.candidate)
        make_release(self.candidate, 'c' * 40, base='/')
        with self.assertRaisesRegex(ValueError, 'prefix'):
            self.updater.verify(str(self.candidate))
        (self.candidate / 'extra.txt').write_text('extra')
        with self.assertRaisesRegex(ValueError, 'exactly'):
            self.updater.verify(str(self.candidate))
        collision = self.root / ('assets/app.' + 'c' * 8 + '.js')
        collision.write_text('unrelated')
        with self.assertRaisesRegex(ValueError, 'collision'):
            self.updater.share_assets(str(self.candidate))

    def test_reject_archive_links_and_escape(self):
        for name, kind in [('new-msa-website-' + self.revision + '/../escape', tarfile.REGTYPE),
                           ('new-msa-website-' + self.revision + '/link', tarfile.SYMTYPE),
                           ('new-msa-website-' + self.revision + '/.htaccess', tarfile.REGTYPE)]:
            with tarfile.open(self.archive, 'w:gz') as bundle:
                member = tarfile.TarInfo(name)
                member.type = kind
                if kind == tarfile.SYMTYPE:
                    member.linkname = '/etc/passwd'
                bundle.addfile(member, io.BytesIO(b''))
            with self.assertRaises(ValueError):
                self.updater.run()
            self.assertEqual((self.root / '.htaccess').read_bytes(), self.original)


unittest.main()
