import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initProfile } from '../tools/setup-storage.mjs';

const cli = fileURLToPath(new URL('../tools/setup.mjs', import.meta.url));

function fixture(t) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'fictional-context-')));
  t.after(() => rmSync(dir, {recursive: true, force: true}));
  const profile = join(dir, 'profile');
  initProfile(profile);
  return profile;
}

function summary(profile, domains) {
  return spawnSync(process.execPath, [cli, 'summary', '--dest', profile, '--domains', domains], {encoding: 'utf8'});
}

function readSummary(profile, domains) {
  const result = summary(profile, domains);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('selected primary sections retain the facts and source while excluding notebook history', t => {
  const profile = fixture(t);
  const facts = [
    ['preferences', 'Prefers examples before theory.'],
    ['learning-skills', 'Currently learning wheel throwing.'],
    ['goals-projects', 'Plans to finish a set of four mugs.']
  ];
  const domains = facts.map(([domain]) => domain).join(',');
  let primaryBytes = 0;
  for (const [domain, fact] of facts) {
    const primary = '# Notebook\n\n## Quick context\n\n- ' + fact + '\n\nSource: user answer\n\n## History\n'
      + '- Previous fictional craft activity.\n'.repeat(80);
    writeFileSync(join(profile, 'domains', domain + '.md'), primary);
    primaryBytes += Buffer.byteLength(primary);
  }

  const result = summary(profile, domains);
  assert.equal(result.status, 0, result.stderr);
  const view = JSON.parse(result.stdout);
  assert.equal(view.derived, true);
  assert.deepEqual(view.notebooks, facts.map(([domain, fact]) => ({
    path: 'domains/' + domain + '.md',
    excerpt: '- ' + fact + '\n\nSource: user answer'
  })));
  assert.ok(Buffer.byteLength(result.stdout) < primaryBytes / 4);
  t.diagnostic('CLI context ' + Buffer.byteLength(result.stdout) + ' bytes for all three facts vs ' + primaryBytes + ' notebook bytes');
});

test('a correction or removal in the primary notebook takes effect on the next read', t => {
  const profile = fixture(t);
  const path = join(profile, 'domains', 'preferences.md');
  const notebook = '# Preferences\r\n\r\n## Quick context\r\n- Likes diagrams.\r\nSource: user answer\r\n';
  writeFileSync(path, notebook);
  assert.match(readSummary(profile, 'preferences').notebooks[0].excerpt, /Likes diagrams/);
  const corrected = notebook.replace('diagrams', 'examples');
  writeFileSync(path, corrected);
  assert.equal(readSummary(profile, 'preferences').notebooks[0].excerpt, '- Likes examples.\nSource: user answer');
  assert.equal(readFileSync(path, 'utf8'), corrected);
  writeFileSync(path, '# Preferences\n\n## Notes\n');
  assert.deepEqual(readSummary(profile, 'preferences').notebooks, [{path: 'domains/preferences.md', excerpt: null}]);
});

test('incomplete, unsupported or oversized excerpts fall back to a notebook reference', t => {
  const profile = fixture(t);
  const path = join(profile, 'domains', 'learning-skills.md');
  for (const body of [
    '## Notes\n\n```md\n## Quick context\n- Example only.\nSource: user answer\n```',
    '## Quick context\n- Missing attribution.',
    '## Quick context\n- First line\n  continued on another line.\nSource: user answer',
    '## Quick context\n- ' + 'x'.repeat(650) + '\nSource: user answer',
    '## Quick context\n- One.\nSource: direct\n## Quick context\n- Two.\nSource: unknown'
  ]) {
    writeFileSync(path, '# Learning\n\n' + body);
    assert.equal(readSummary(profile, 'learning-skills').notebooks[0].excerpt, null);
  }
});

test('selection is explicit and reads only guarded files in the selected instance', t => {
  const profile = fixture(t);
  const path = join(profile, 'domains', 'preferences.md');
  unlinkSync(path);
  symlinkSync(join(profile, 'records.json'), path, 'file');
  assert.equal(summary(profile, 'goals-projects').status, 0);
  for (const domains of ['preferences', '../preferences', 'health-optional', '', 'goals-projects,goals-projects']) {
    const result = summary(profile, domains);
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
  }
  unlinkSync(join(profile, '.life-profile.json'));
  assert.notEqual(summary(profile, 'learning-skills').status, 0);
});
