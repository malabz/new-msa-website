#!/usr/bin/env python
"""MSA publisher compatible with Python 2.6 and current Python 3.

Only the fixed site directory is writable. HTTPS uses our isolated static curl.
The class accepts a different root for the local failure/rollback test harness.
"""
from __future__ import print_function
import errno
import fcntl
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time

ROOT = '/www/web/malab_cloudfood_me/public_html/MSA'
SHA = re.compile(r'^[0-9a-f]{40}$')


def read(path):
    with open(path, 'rb') as stream:
        return stream.read()


def digest(path):
    h = hashlib.sha256()
    with open(path, 'rb') as stream:
        while True:
            block = stream.read(65536)
            if not block:
                break
            h.update(block)
    return h.hexdigest()


def atomic(path, data):
    parent = os.path.dirname(path)
    fd, temporary = tempfile.mkstemp(prefix='.msa-', dir=parent)
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temporary, 0o644)
        os.rename(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def safe_name(name):
    if not name or name.startswith('/') or '\\' in name:
        raise ValueError('Unsafe path')
    if any(ord(c) < 32 for c in name):
        raise ValueError('Control character in path')
    for part in name.split('/'):
        if part in ('', '.', '..', '.htaccess', '.deploy', '_releases'):
            raise ValueError('Reserved or unsafe path: %s' % name)
        if part.startswith('.') and part != '.nojekyll':
            raise ValueError('Hidden path: %s' % name)
    return name


class Updater(object):
    def __init__(self, root):
        self.root = root
        self.private = os.path.join(root, '.deploy')
        self.releases = os.path.join(root, '_releases')
        self.curl = os.path.join(self.private, 'bin', 'curl')
        self.ca = os.path.join(self.private, 'bin', 'cacert.pem')
        self.work = None

    def log(self, message):
        line = '%s %s\n' % (time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), message)
        with open(os.path.join(self.private, 'update.log'), 'a') as stream:
            stream.write(line)
        print(line.rstrip())

    def download(self, url, target):
        subprocess.check_call([self.curl, '--fail', '--silent', '--show-error',
            '--location', '--proto', '=https', '--proto-redir', '=https',
            '--tlsv1.2', '--cacert', self.ca, '--connect-timeout', '10',
            '--max-time', '60', '--retry', '1', '--retry-delay', '3',
            '--max-filesize', '33554432', '--user-agent', 'MSA-site-updater',
            '--output', target, url])

    def latest(self):
        target = os.path.join(self.work, 'ref.json')
        self.download('https://api.github.com/repos/malabz/new-msa-website/git/ref/heads/site', target)
        if os.path.getsize(target) > 1048576:
            raise ValueError('Oversized ref response')
        data = json.loads(read(target).decode('utf-8'))
        revision = data['object']['sha']
        if data['object']['type'] != 'commit' or not SHA.match(revision):
            raise ValueError('Invalid site ref')
        return revision

    def unpack(self, archive, destination, revision):
        prefix = 'new-msa-website-%s' % revision
        seen = set()
        total = 0
        bundle = tarfile.open(archive, 'r:gz')
        try:
            members = bundle.getmembers()
            if len(members) > 4096:
                raise ValueError('Too many archive entries')
            # Validate every header before extracting anything.
            for member in members:
                name = member.name.rstrip('/')
                if name == prefix and member.isdir():
                    continue
                if not name.startswith(prefix + '/'):
                    raise ValueError('Unexpected archive prefix')
                relative = safe_name(name[len(prefix) + 1:])
                if relative in seen or not (member.isfile() or member.isdir()):
                    raise ValueError('Duplicate, link or special archive entry')
                seen.add(relative)
                total += member.size
                if total > 67108864:
                    raise ValueError('Archive expands beyond limit')
            for member in members:
                name = member.name.rstrip('/')
                if name == prefix:
                    continue
                target = os.path.join(destination, name[len(prefix) + 1:])
                if member.isdir():
                    if not os.path.isdir(target):
                        os.makedirs(target, 0o755)
                    continue
                parent = os.path.dirname(target)
                if not os.path.isdir(parent):
                    os.makedirs(parent, 0o755)
                with open(target, 'wb') as output:
                    source = bundle.extractfile(member)
                    try:
                        shutil.copyfileobj(source, output)
                    finally:
                        source.close()
                os.chmod(target, 0o644)
        finally:
            bundle.close()

    def verify(self, directory):
        manifest = read(os.path.join(directory, 'FILES.sha256')).decode('utf-8')
        expected = {}
        for line in manifest.splitlines():
            match = re.match(r'^([0-9a-f]{64})  (.+)$', line)
            if not match:
                raise ValueError('Invalid checksum record')
            name = safe_name(match.group(2))
            if name in expected or name == 'FILES.sha256':
                raise ValueError('Duplicate checksum record')
            expected[name] = match.group(1)
        actual = set()
        for parent, dirs, files in os.walk(directory):
            for name in dirs + files:
                if os.path.islink(os.path.join(parent, name)):
                    raise ValueError('Release contains a symlink')
            for name in files:
                relative = os.path.relpath(os.path.join(parent, name), directory)
                if relative != 'FILES.sha256':
                    actual.add(safe_name(relative))
        if actual != set(expected):
            raise ValueError('Manifest does not cover exactly the release files')
        for name, checksum in expected.items():
            if digest(os.path.join(directory, name)) != checksum:
                raise ValueError('Checksum mismatch: %s' % name)
        for name in ('index.html', '404.html', 'release.json', 'basics/pairwise.html'):
            if name not in expected or not os.path.getsize(os.path.join(directory, name)):
                raise ValueError('Missing required file: %s' % name)
        release = json.loads(read(os.path.join(directory, 'release.json')).decode('utf-8'))
        if release.get('schema') != 1 or release.get('base') != '/MSA/' or not SHA.match(release.get('source', '')):
            raise ValueError('Invalid source or deployment prefix')
        return release

    def share_assets(self, release):
        source = os.path.join(release, 'assets')
        if not os.path.isdir(source):
            raise ValueError('No assets directory')
        for parent, dirs, files in os.walk(source):
            relative = os.path.relpath(parent, source)
            target = os.path.join(self.root, 'assets', relative)
            if os.path.realpath(target) != os.path.abspath(target):
                raise ValueError('Asset destination contains a symlink')
            if not os.path.isdir(target):
                os.makedirs(target, 0o755)
            for name in files:
                original = os.path.join(parent, name)
                destination = os.path.join(target, name)
                if os.path.lexists(destination):
                    if os.path.islink(destination) or not os.path.isfile(destination) or digest(original) != digest(destination):
                        raise ValueError('Immutable asset collision: %s' % name)
                else:
                    atomic(destination, read(original))

    def snapshot_initial(self):
        baseline = os.path.join(self.private, 'baseline')
        if os.path.isdir(baseline):
            self.verify(baseline)
            return
        stage = os.path.join(self.work, 'baseline')
        os.mkdir(stage, 0o755)
        records = read(os.path.join(self.root, 'FILES.sha256')).decode('utf-8').splitlines()
        names = ['FILES.sha256']
        for line in records:
            match = re.match(r'^[0-9a-f]{64}  (.+)$', line)
            if not match:
                raise ValueError('Invalid initial manifest')
            names.append(safe_name(match.group(1)))
        for name in names:
            original = os.path.join(self.root, name)
            if os.path.realpath(original) != original:
                raise ValueError('Symlink in initial deployment')
            destination = os.path.join(stage, name)
            parent = os.path.dirname(destination)
            if not os.path.isdir(parent):
                os.makedirs(parent, 0o755)
            shutil.copyfile(original, destination)
        self.verify(stage)
        atomic(os.path.join(self.private, 'initial.htaccess'), read(os.path.join(self.root, '.htaccess')))
        os.rename(stage, baseline)

    def config(self, revision):
        assert SHA.match(revision)
        return ('''# Managed by MSA updater: %s
DirectoryIndex index.html
Options -Indexes
ErrorDocument 404 /MSA/404.html
RewriteEngine On
RewriteBase /MSA/
RewriteRule ^\\.deploy(?:/|$) - [F,L]
RewriteRule ^_releases/ - [L]
RewriteRule ^assets/ - [L]
RewriteRule ^$ _releases/%s/index.html [L]
RewriteRule ^(.*)$ _releases/%s/$1 [L]
''' % (revision, revision, revision)).encode('ascii')

    def health(self, release):
        nonce = str(int(time.time()))
        for route, expected in (('', 200), ('basics/pairwise.html', 200),
                                ('release.json', 200), ('msa-health-missing-' + nonce + '.html', 404)):
            target = os.path.join(self.work, 'health-body')
            status = subprocess.check_output([self.curl, '--silent', '--show-error',
                '--noproxy', '*', '--connect-timeout', '5', '--max-time', '15',
                '--header', 'Host: lab.malab.cn', '--header', 'Cache-Control: no-cache',
                '--output', target, '--write-out', '%{http_code}',
                'http://127.0.0.1/MSA/' + route + '?msa_check=' + nonce])
            if int(status) != expected:
                raise ValueError('Health HTTP %s: %s' % (status, route))
            if route == 'release.json' and json.loads(read(target).decode('utf-8')) != release:
                raise ValueError('Served release does not match candidate')
            if route == '' and b'<html' not in read(target).lower():
                raise ValueError('Homepage is not HTML')

    def activate(self, revision, release):
        config = os.path.join(self.root, '.htaccess')
        previous = read(config)
        atomic(os.path.join(self.private, 'previous.htaccess'), previous)
        previous_state = os.path.join(self.private, 'state.json')
        if os.path.isfile(previous_state):
            atomic(os.path.join(self.private, 'previous-state.json'), read(previous_state))
        try:
            atomic(config, self.config(revision))
            self.health(release)
            state = {'site': revision, 'source': release['source'], 'activatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
            atomic(previous_state, (json.dumps(state, sort_keys=True) + '\n').encode('utf-8'))
        except BaseException:
            atomic(config, previous)
            self.log('ROLLBACK restored previous Apache directory configuration')
            raise

    def run(self):
        os.umask(0o022)
        if os.path.realpath(self.root) != self.root or os.path.islink(self.private):
            raise ValueError('Deployment root must not be a symlink')
        if not os.path.isdir(self.private):
            raise ValueError('Deployment control directory is missing')
        with open(os.path.join(self.private, 'update.lock'), 'a') as lock:
            try:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except IOError as exc:
                if exc.errno not in (errno.EACCES, errno.EAGAIN):
                    raise
                self.log('SKIP another update holds the lock')
                return
            if os.path.exists(os.path.join(self.private, 'paused')):
                self.log('PAUSED no update requested')
                return
            self.work = tempfile.mkdtemp(prefix='incoming-', dir=self.private)
            try:
                revision = self.latest()
                state_file = os.path.join(self.private, 'state.json')
                if os.path.isfile(state_file):
                    state = json.loads(read(state_file).decode('utf-8'))
                    if state.get('site') == revision and read(os.path.join(self.root, '.htaccess')) == self.config(revision):
                        self.log('UNCHANGED site=%s' % revision)
                        return
                archive = os.path.join(self.work, 'site.tar.gz')
                self.download('https://codeload.github.com/malabz/new-msa-website/tar.gz/' + revision, archive)
                stage = os.path.join(self.work, 'stage')
                os.mkdir(stage, 0o755)
                self.unpack(archive, stage, revision)
                release = self.verify(stage)
                self.snapshot_initial()
                if os.path.islink(self.releases):
                    raise ValueError('Release directory cannot be a symlink')
                if not os.path.isdir(self.releases):
                    os.mkdir(self.releases, 0o755)
                destination = os.path.join(self.releases, revision)
                if os.path.lexists(destination):
                    if os.path.islink(destination):
                        raise ValueError('Release cannot be a symlink')
                    if self.verify(destination) != release:
                        raise ValueError('Existing release mismatch')
                else:
                    os.rename(stage, destination)
                self.share_assets(destination)
                self.activate(revision, release)
                self.log('UPDATED site=%s source=%s' % (revision, release['source']))
            except Exception as exc:
                self.log('FAILED %s' % exc)
                raise
            finally:
                # Only remove this invocation's private temporary directory.
                shutil.rmtree(self.work)
                self.work = None


# Python 2.6 lacks subprocess.check_output.
if not hasattr(subprocess, 'check_output'):
    def check_output(args):
        child = subprocess.Popen(args, stdout=subprocess.PIPE)
        output = child.communicate()[0]
        if child.returncode:
            raise subprocess.CalledProcessError(child.returncode, args)
        return output
    subprocess.check_output = check_output


if __name__ == '__main__':
    if len(sys.argv) != 1:
        sys.exit('This production entrypoint takes no arguments.')
    try:
        Updater(ROOT).run()
    except Exception as error:
        print('MSA update failed: %s' % error, file=sys.stderr)
        sys.exit(1)
