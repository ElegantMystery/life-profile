import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {initProfile} from '../tools/setup-storage.mjs';

const tools = fileURLToPath(new URL('../tools', import.meta.url));
const account = 'FictionalWriter', repo = 'FictionalOwner/notebook', branch = 'main';
const url = 'https://github.com/' + repo + '.git';
const git = (dir, ...args) => execFileSync('git', ['-C', dir, ...args], {encoding:'utf8', stdio:['ignore','pipe','pipe']}).trim();
const pref = 'domains/preferences.md', goals = 'domains/goals-projects.md';
const fact = 'Source: fictional user. Preferred workshop day: Monday.\n';
async function fixture(t) {
 const base = mkdtempSync(join(tmpdir(), 'routine-sync-'));
 t.after(() => rmSync(base, {recursive:true, force:true}));
 const remote = join(base, 'remote.git'), seed = join(base, 'seed');
 initProfile(seed);
 writeFileSync(join(seed, pref), fact + '\nA second paragraph.\n\nA final paragraph.\n');
 writeFileSync(join(seed, 'ASSISTANT-GUIDE.md'), 'A fictional legacy customization.\n');
 git(seed, 'init', '-q', '-b', branch);
 const identity = dir => {
  git(dir, 'config', 'user.name', 'Test');
  git(dir, 'config', 'user.email', 'test@localhost');
  git(dir, 'config', 'commit.gpgsign', 'false');
 };
 identity(seed);
 git(seed, 'add', '.'); git(seed, 'commit', '-qm', 'Initialize fictional profile');
 git(base, 'clone', '--bare', seed, remote);
 async function agent(name) {
  const dir = join(base, name), source = join(base, 'source-' + name);
  git(base, 'clone', remote, dir); identity(dir);
  git(dir, 'remote', 'set-url', 'origin', url);
  mkdirSync(source); cpSync(tools, join(source, 'tools'), {recursive:true});
  writeFileSync(join(source, '.life-profile.local.json'), JSON.stringify({data_directory:dir}));
  const {run} = await import(pathToFileURL(join(source, 'tools/routine-sync.mjs')));
  const service = {
   metadata: () => ({login:account, full_name:repo, visibility:'private'}),
   fetch: (root, _url, ref) => git(root, 'fetch', '--no-tags', remote, ref),
   push: (root, _url, ref) => git(root, 'push', remote, ref)
  };
  const call = (cmd, ...args) => run([cmd, account, repo, branch, ...args], service);
  return {dir, service, call, head:() => git(dir, 'rev-parse', 'HEAD'),
   edit:(path, text) => writeFileSync(join(dir, path), text),
   read:path => readFileSync(join(dir, path), 'utf8'),
   commit:(path, text) => {writeFileSync(join(dir,path), text); return call('commit', path);},
   review:() => call('inspect'), apply:review => call('apply', review.local, review.remote)};
 }
 return {a:await agent('one'), b:await agent('two'), remote};
}

test('independent reviewed additions integrate only after both current tips are supplied', async t => {
 const {a,b,remote} = await fixture(t);
 const protectedFiles = ['.life-profile.json','ASSISTANT-GUIDE.md','export-policy.json','INDEX.md'];
 const before = protectedFiles.map(a.read);
 a.commit(pref, fact + 'User statement: prefers morning classes.\n');
 b.commit(goals, 'User statement: learn ceramics.\n');
 assert.equal(b.apply(b.review()).state, 'synced');
 const review = a.review();
 assert.equal(review.state, 'diverged');
 assert.throws(() => a.call('apply', review.local, review.local), /REVIEW_STALE/);
 assert.equal(a.apply(review).state, 'synced');
 assert.equal(git(remote, 'rev-parse', 'main'), a.head());
 assert.equal(a.read(goals), b.read(goals));
 assert.deepEqual(protectedFiles.map(a.read), before);
 assert.equal(git(a.dir, 'status', '--porcelain'), '');
});

for (const scenario of ['same fact', 'different lines', 'delete versus edit']) {
 test('agents retain both proposed versions for ' + scenario, async t => {
  const {a,b,remote} = await fixture(t), original = a.read(pref);
  if (scenario === 'delete versus edit') {
   rmSync(join(a.dir, pref)); a.call('commit', pref);
  } else {
   a.commit(pref, original.replace('Monday', 'Tuesday'));
  }
  b.commit(pref, scenario === 'different lines'
   ? original + '\nUser correction: preferred workshop day is Friday.\n'
   : original.replace('Monday', 'Friday'));
  b.apply(b.review());
  const ours = a.head(), theirs = b.head(), review = a.review();
  assert.equal(review.state, 'diverged');
  if (scenario !== 'different lines') assert.throws(() => a.apply(review), /CONTENT_CONFLICT/);
  if (scenario === 'different lines') {
   const candidate = git(a.dir, 'show', review.candidate+':'+pref);
   assert.match(candidate,/Tuesday/); assert.match(candidate,/Friday/);
  } else {
   assert.equal(review.candidate,null);
  }
  // A clean textual merge still requires an agent to inspect these exact versions.
  assert.equal(a.head(), ours); assert.equal(git(remote,'rev-parse','main'), theirs);
  assert.equal(existsSync(join(a.dir, '.git/MERGE_HEAD')), false);
  assert.equal(git(a.dir, 'status','--porcelain'), '');
 });
}

test('push races require fresh review each time and retain all commits', async t => {
 const {a,b,remote} = await fixture(t);
 a.commit(pref, fact + 'Source: user. Afternoon class.\n');
 const push = a.service.push;
 let races = 0;
 a.service.push = (...args) => {
  b.commit(goals, 'Source: fictional user. Goal ' + (++races) + '.\n');
  b.apply(b.review()); return push(...args);
 };
 for (let i = 0; i < 2; i++) {
  const review = a.review();
  assert.throws(() => a.apply(review), /PUSH_PENDING/);
  assert.equal(races, i + 1);
  assert.equal(git(remote, 'rev-parse', 'main'), b.head());
  assert.match(a.read(pref), /Afternoon class/);
 }
});

test('offline, denied access and interrupted integration preserve staged and unstaged work', async t => {
 const {a,remote} = await fixture(t), initial = a.head();
 a.edit(goals, 'Unrelated fictional work.\n'); a.commit(pref, fact + 'Morning class.\n');
 assert.equal(a.read(goals), 'Unrelated fictional work.\n');
 assert.match(git(a.dir,'status','--porcelain'), /domains\/goals-projects.md/);
 assert.throws(a.review, /DIRTY/);
 a.call('commit', goals);
 const head = a.head(), fetch = a.service.fetch;
 a.service.fetch = () => {throw Error('SECRET-FICTIONAL');};
 assert.throws(a.review, /^Error: FETCH_PENDING$/);
 a.service.fetch = fetch;
 const review = a.review();
 a.service.push = () => {throw Error('SECRET-FICTIONAL');};
 assert.throws(() => a.apply(review), /^Error: PUSH_PENDING$/);
 writeFileSync(join(a.dir,'.git','MERGE_HEAD'),initial+'\n');
 assert.throws(a.review, /INTEGRATION_PENDING/);
 assert.equal(a.head(),head); assert.equal(git(remote,'rev-parse','main'), initial);
 assert.equal(readFileSync(join(a.dir,'.git','MERGE_HEAD'),'utf8'),initial+'\n');
});

test('reject wrong source, destination, staged content and protected or invalid changes', async t => {
 const {a,remote} = await fixture(t), head = a.head();
 for (const bad of [{login:'other'},{visibility:'public'},{full_name:'other/name'}]) {
  a.service.metadata = () => ({login:account,full_name:repo,visibility:'private',...bad});
  assert.throws(a.review, /DESTINATION/);
 }
 a.service.metadata = () => ({login:account,full_name:repo,visibility:'private'});
 git(a.dir,'remote','set-url','--push','origin','https://github.com/other/name.git');
 assert.throws(a.review, /DESTINATION/);
 git(a.dir,'remote','set-url','--push','origin',url);
 assert.throws(() => a.call('inspect', 'extra'), /ARGUMENT/);
 for (const path of ['export-policy.json', '.life-profile.json', 'ASSISTANT-GUIDE.md', 'drafts/raw.json','../escape']) {
  assert.throws(() => a.call('commit', path), /PATH/);
 }
 a.edit('records.json', '{}');
 assert.throws(() => a.call('commit','records.json'), /VALIDATION/);
 a.edit(goals,'Separate staged work.\n'); git(a.dir,'add','--',goals);
 assert.throws(() => a.commit(pref,fact), /INDEX/);
 assert.equal(a.head(),head); assert.equal(git(remote,'rev-parse','main'),head);
});

test('an active helper prevents a second writer from committing in its clone', async t => {
 const {a} = await fixture(t), fetch = a.service.fetch, initial = a.head();
 a.service.fetch = (...args) => {
  a.edit(goals,'Competing uncommitted edit.\n');
  assert.throws(() => a.call('commit',goals), /CLONE_BUSY/);
  return fetch(...args);
 };
 assert.throws(a.review, /DIRTY/);
 assert.equal(a.head(), initial); assert.equal(a.read(goals), 'Competing uncommitted edit.\n');
});

test('recover an uncertain push by fetching, and fast-forward a clean second clone', async t => {
 const {a,b} = await fixture(t), push = a.service.push;
 a.commit(goals, 'Source: fictional user. Learn paper folding.\n');
 a.service.push = (...args) => { push(...args); throw Error('uncertain response'); };
 assert.throws(() => a.apply(a.review()), /PUSH_PENDING/);
 assert.equal(a.review().state, 'synced');
 const review = b.review();
 assert.equal(review.state, 'behind'); assert.equal(b.apply(review).state, 'synced');
 assert.equal(b.head(), a.head()); assert.equal(b.read(goals), a.read(goals));
});

test('a transient protected change in outgoing history cannot be uploaded', async t => {
 const {a,remote} = await fixture(t), original = a.head(), policy = a.read('export-policy.json');
 a.edit('export-policy.json','{}'); git(a.dir,'commit','-qam','Fictional bad history');
 a.edit('export-policy.json',policy); git(a.dir,'commit','-qam','Restore policy');
 assert.throws(a.review, /PROTECTED_HISTORY/);
 assert.equal(git(remote,'rev-parse','main'), original);
});
