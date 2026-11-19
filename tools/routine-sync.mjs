// Run from the verified instruction checkout. Profile prose never enters CLI output.
import {execFileSync} from 'node:child_process';
import {closeSync, existsSync, lstatSync, openSync, unlinkSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {boundDirectory, privateInstance, readPrivateFile} from './setup-storage.mjs';
import {validate} from './profile.mjs';

class Pending extends Error {}
function stop(code) { throw new Pending(code); }
function quietly(code, operation) {
 try { return operation(); } catch { stop(code); }
}
function invoke(program, args) {
 const env = {...process.env, GH_HOST:'github.com', GH_PROMPT_DISABLED:'1'};
 for (const key of Object.keys(env)) if (key.startsWith('GIT_')) delete env[key];
 env.GIT_TERMINAL_PROMPT = '0';
 return execFileSync(program, args, {encoding:'utf8', env, stdio:['ignore','pipe','pipe']});
}
function git(root, ...args) {
 return invoke('git', ['--no-replace-objects','--literal-pathspecs','-C',root,...args]);
}
// Use the verified GitHub CLI account for the actual Git transport too.
function network(root, ...args) {
 return git(root,'-c','credential.helper=','-c','credential.helper=!gh auth git-credential',
  '-c','http.followRedirects=false',...args);
}
const github = {
 metadata(repo) {
  const api = path => JSON.parse(invoke('gh',['api','--hostname','github.com',path]));
  const {login} = api('user'), {full_name,visibility} = api('repos/' + repo);
  return {login,full_name,visibility};
 },
 fetch:(root,url,ref) => network(root,'fetch','--no-tags','--no-recurse-submodules',url,ref),
 push:(root,url,ref) => network(root,'push','--no-follow-tags','--recurse-submodules=no',url,ref)
};

const reviewedPath = path => /^(?:INDEX\.md|SETUP-PROGRESS\.md|records\.json|(?:domains|notes)\/[a-z0-9][a-z0-9-]*\.md)$/.test(path);
function validateRegister(text) { quietly('VALIDATION_PENDING', () => validate(JSON.parse(text))); }
function revision(root, name) { return git(root,'rev-parse','--verify',name).trim(); }
function ensureClean(root) {
 if (git(root,'status','--porcelain=v1','--untracked-files=all','--ignore-submodules=none')) stop('DIRTY_WORKTREE');
}
function localCommit(root, paths) {
 if (!paths.length || paths.some(path => !reviewedPath(path))) stop('REVIEWED_PATH_REQUIRED');
 if (git(root,'diff','--cached','--name-only','-z')) stop('INDEX_PENDING');
 for (const path of paths) {
  const file = join(root,path);
  // readPrivateFile also checks every ancestor, symlinks and the hard-link count.
  const stat = lstatSync(file,{throwIfNoEntry:false});
  if (stat) {
   const text = quietly('UNSAFE_PATH', () => readPrivateFile(file));
   if (stat.mode & 0o111) stop('UNSAFE_PATH');
   if (path === 'records.json') validateRegister(text);
  } else if (['records.json','INDEX.md','SETUP-PROGRESS.md'].includes(path)) stop('REQUIRED_PATH');
 }
 git(root,'add','--',...paths);
 if (!git(root,'diff','--cached','--name-only','-z')) stop('NO_CHANGES');
 quietly('INDEX_PENDING', () => git(root,'diff','--cached','--check'));
 git(root,'commit','-m','Update profile notes');
 return {state:'committed_locally', local:revision(root,'HEAD')};
}
function destination(root, branch, repo) {
 if (git(root,'symbolic-ref','--quiet','HEAD').trim() !== 'refs/heads/'+branch) stop('BRANCH_MISMATCH');
 const remote = git(root,'config','--get-all','branch.'+branch+'.remote').trim();
 if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(remote) ||
     git(root,'config','--get-all','branch.'+branch+'.merge').trim() !== 'refs/heads/'+branch) stop('UPSTREAM_MISMATCH');
 const upstream = 'refs/remotes/'+remote+'/'+branch;
 if (git(root,'rev-parse','--symbolic-full-name','@{upstream}').trim() !== upstream) stop('UPSTREAM_MISMATCH');
 const url = 'https://github.com/'+repo+'.git';
 const allowed = [url,url.slice(0,-4),'git@github.com:'+repo+'.git','git@github.com:'+repo];
 for (const args of [['--all'],['--push','--all']]) {
  if (!allowed.includes(git(root,'remote','get-url',...args,remote).trim())) stop('DESTINATION_MISMATCH');
 }
 // Literal URLs can also be affected by pushInsteadOf, independently of a remote's pushurl.
 let config;
 try {
  config = git(root,'config','--null','--get-regexp','^(url\\..*\\.(insteadof|pushinsteadof)|remote\\.https://github\\.com/.*)$').split('\0');
 } catch (error) {
  if (error.status !== 1) throw error;
  config = []; // Git exits 1 when no matching config entries exist.
 }
 if (config.some(entry => {
  const split = entry.indexOf('\n'), key = entry.slice(0,split), value = entry.slice(split+1);
  return (/^url\..*\.(?:pushinsteadof|insteadof)$/.test(key) && url.startsWith(value)) ||
   key.startsWith('remote.'+url+'.');
 })) stop('DESTINATION_MISMATCH');
 return {url, upstream};
}
function checkedHistory(root, base, tip) {
 // Check every commit, including transient changes that disappear in the tip diff.
 const commits = git(root,'rev-list',base+'..'+tip).trim().split('\n').filter(Boolean);
 for (const commit of commits) {
  const delta = git(root,'diff-tree','--no-commit-id','--root','-r','-m','--raw','--no-renames','-z',commit);
  const fields = delta.split('\0');
  for (let i=0; i < fields.length-1; i+=2) {
   const [oldMode,newMode] = fields[i].slice(1).split(' ');
   const path = fields[i+1];
   if (!reviewedPath(path) || ![oldMode,newMode].every(mode => ['100644','000000'].includes(mode))) stop('PROTECTED_HISTORY');
   if (newMode === '000000' && ['records.json','INDEX.md','SETUP-PROGRESS.md'].includes(path)) stop('REQUIRED_PATH');
  }
 }
}
function checkTree(root, tree) {
 for (const path of ['.life-profile.json','INDEX.md','export-policy.json','records.json']) {
  if (!git(root,'ls-tree',tree,'--',path).startsWith('100644 blob ')) stop('INVALID_INSTANCE');
 }
 validateRegister(git(root,'show',tree+':records.json'));
}
function synchronize(root, service, {account,repo,branch,command,tips,url,upstream}) {
 ensureClean(root);
 function fetchVerified() {
  const metadata = quietly('AUTH_PENDING', () => service.metadata(repo));
  if (metadata.login !== account || metadata.full_name !== repo || metadata.visibility !== 'private') stop('DESTINATION_MISMATCH');
  quietly('FETCH_PENDING', () => service.fetch(root,url,'refs/heads/'+branch+':'+upstream));
  return revision(root,upstream);
 }
 const remote = fetchVerified(), local = revision(root,'HEAD');
 if (command === 'apply' && (tips[0] !== local || tips[1] !== remote)) stop('REVIEW_STALE');
 ensureClean(root);
 checkTree(root,local);
 const base = quietly('HISTORY_PENDING', () => git(root,'merge-base',local,remote).trim());
 const state = local === remote ? 'synced' : local === base ? 'behind' : remote === base ? 'ahead' : 'diverged';
 if (state === 'synced') return {state,local,remote};
 checkedHistory(root,base,local);
 checkedHistory(root,base,remote);
 checkTree(root,remote);
 if (command === 'inspect') return {state,base,local,remote};
 if (state === 'behind') {
  git(root,'merge','--ff-only','--no-overwrite-ignore',remote);
  if (revision(root,'HEAD') !== remote) stop('MERGE_REVIEW_PENDING');
 }
 if (state === 'diverged') {
  // Compute without touching the index/worktree. Textual compatibility still needs semantic review.
  const tree = quietly('CONTENT_CONFLICT', () => git(root,'merge-tree','--write-tree',local,remote).trim());
  checkTree(root,tree);
  git(root,'merge','--no-ff','--no-edit','--no-overwrite-ignore','-m','Reconcile reviewed profile updates',remote);
  if (revision(root,'HEAD^{tree}') !== tree) stop('MERGE_REVIEW_PENDING');
 }
 ensureClean(root);
 const finalHead = revision(root,'HEAD');
 if (finalHead !== remote) quietly('PUSH_PENDING', () => service.push(root,url,finalHead+':refs/heads/'+branch));
 if (fetchVerified() !== finalHead || revision(root,'HEAD') !== finalHead) stop('VERIFY_PENDING');
 ensureClean(root);
 return {state:'synced',local:finalHead,remote:finalHead};
}

export function run(args, service=github) {
 const [command,account,repo,branch,...rest] = args;
 if (!['commit','inspect','apply'].includes(command) || !/^[A-Za-z0-9-]+$/.test(account ?? '') ||
     !/^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(repo ?? '') || !branch ||
     (command === 'inspect' && rest.length) || (command === 'apply' && (rest.length !== 2 || rest.some(s => !/^[a-f0-9]{40}$/.test(s))))) stop('INVALID_ARGUMENTS');
 try {
  const root = boundDirectory();
  if (!root || !lstatSync(join(root,'.git')).isDirectory()) stop('BOUND_CLONE_REQUIRED');
  privateInstance(root);
  git(root,'check-ref-format','--branch',branch);
  for (const name of ['MERGE_HEAD','CHERRY_PICK_HEAD','REVERT_HEAD','REBASE_HEAD','rebase-merge','rebase-apply','sequencer','BISECT_START','index.lock']) {
   if (existsSync(join(root,'.git',name))) stop('INTEGRATION_PENDING');
  }
  const dest = destination(root,branch,repo);
  // Separate clones protect edits made outside this helper. This lock serializes helper calls.
  const lock = join(root,'.git','life-profile-sync.lock');
  const fd = quietly('CLONE_BUSY', () => openSync(lock,'wx',0o600));
  try {
   if (command === 'commit') return localCommit(root,rest);
   return synchronize(root,service,{account,repo,branch,command,tips:rest,...dest});
  } finally {
   closeSync(fd); unlinkSync(lock);
  }
 } catch (error) {
  if (error instanceof Pending) throw error;
  stop('SYNC_PENDING');
 }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
 try { process.stdout.write(JSON.stringify(run(process.argv.slice(2)))+'\n'); }
 catch (error) { process.stderr.write(JSON.stringify({state:'pending',reason:error instanceof Pending ? error.message : 'SYNC_PENDING'})+'\n'); process.exitCode=1; }
}
