import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const reader = fileURLToPath(new URL('../examples/hosts/read-pinned-guide.sh', import.meta.url));
const origin = 'https://example.invalid/fictional/profile.git';

test('host reader returns only ordinary documentation bytes from the selected Git snapshot', t => {
  const checkout = realpathSync(mkdtempSync(join(tmpdir(), 'fictional host ')));
  t.after(() => rmSync(checkout, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-C', checkout, ...args], { encoding: 'utf8' }).trim();
  git('init', '--quiet');
  git('remote', 'add', 'origin', origin);
  mkdirSync(join(checkout, 'docs'));
  writeFileSync(join(checkout, 'AGENTS.md'), 'reviewed\n');
  symlinkSync('../AGENTS.md', join(checkout, 'docs', 'link.md'));
  git('add', '--all');
  const commit = () => git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@invalid',
    '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'fictional guidance');
  commit();
  const pin = git('rev-parse', 'HEAD');
  writeFileSync(join(checkout, 'AGENTS.md'), 'later revision\n');
  git('add', 'AGENTS.md');
  commit();
  git('replace', pin, 'HEAD');
  writeFileSync(join(checkout, 'AGENTS.md'), 'dirty worktree\n');

  const read = (directory, remote, revision, path) => spawnSync('sh',
    [reader, directory, remote, revision, path], {
      encoding: 'utf8', env: { ...process.env, GIT_DIR: join(checkout, 'missing-git-dir') }
    });
  const success = read(checkout, origin, pin, 'AGENTS.md');
  assert.equal(success.status, 0, success.stderr);
  assert.equal(success.stdout, 'reviewed\n');
  for (const args of [
    [join(checkout, 'docs'), origin, pin, 'AGENTS.md'],
    [checkout, 'https://example.invalid/other.git', pin, 'AGENTS.md'],
    [checkout, origin, 'HEAD', 'AGENTS.md'],
    [checkout, origin, git('rev-parse', 'HEAD:AGENTS.md'), 'AGENTS.md'],
    [checkout, origin, '0'.repeat(40), 'AGENTS.md'],
    [checkout, origin, pin, 'docs/link.md'],
    [checkout, origin, pin, 'docs/unknown.md'],
    [checkout, origin, pin, 'docs/../AGENTS.md'],
  ]) {
    const result = read(...args);
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Life Profile source unavailable/);
  }
});
