// Migration is opt-in. Never interpret a copied manual, or emit its contents.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { closeSync, fsyncSync, lstatSync, openSync, realpathSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, sep } from 'node:path';
import { privateDirectory, privateInstance, stop } from './setup-storage.mjs';

const guides = ['AGENTS.md','ASSISTANT-GUIDE.md','IMPORT-GUIDE.md','START-HERE.md','drafts/README.md','notes/README.md'];
const requiredSource = ['AGENTS.md','docs/INSTRUCTION-SOURCE.md','docs/guides/ASSISTANT-GUIDE.md'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const stat = path => lstatSync(path,{throwIfNoEntry:false});

function locate(root,name) {
  const path = join(root,name);
  if (dirname(path) !== root) {
    if (!stat(dirname(path))) return null;
    privateDirectory(dirname(path)); // reject linked parents and nested repositories
  }
  const file = stat(path);
  if (!file) return null;
  if (!file.isFile() || file.isSymbolicLink() || file.nlink !== 1) stop('UNSAFE_LEGACY_GUIDE');
  return path;
}

// Checks layout and availability. The caller separately verifies repository provenance,
// compatible *behavior*, permission scope and host activation at this commit.
export function checkSource(checkout,commit) {
  if (!checkout || !isAbsolute(checkout) || !/^[0-9a-f]{40}$/.test(commit ?? '')) stop('FULL_SOURCE_COMMIT_REQUIRED');
  const env = {...process.env};
  for (const key of Object.keys(env)) if (key.startsWith('GIT_')) delete env[key];
  // Source verification uses only local objects, including on older Git versions.
  env.GIT_NO_LAZY_FETCH = '1';
  env.GIT_ALLOW_PROTOCOL = '';
  const git = (args, stdout='pipe') => execFileSync('git',['--no-replace-objects','-C',checkout,...args],{env,encoding:'utf8',stdio:['ignore',stdout,'pipe']});
  let entries;
  try {
    if (realpathSync(git(['rev-parse','--show-toplevel']).trim()) !== realpathSync(checkout)) stop('SOURCE_UNAVAILABLE');
    if (git(['cat-file','-t',commit]).trim() !== 'commit') stop('SOURCE_UNAVAILABLE');
    entries = git(['ls-tree','-rz',commit,'--',...requiredSource]).split('\0');
  } catch { stop('SOURCE_UNAVAILABLE'); }
  for (const name of requiredSource) {
    if (!entries.some(line => /^100(644|755) blob [a-f0-9]+\t/.test(line) && line.split('\t')[1] === name)) stop('INCOMPATIBLE_SOURCE_LAYOUT');
    // A tree can still list a blob that is missing from the checkout.
    try { git(['cat-file','blob',commit+':'+name],'ignore'); }
    catch { stop('SOURCE_UNAVAILABLE'); }
  }
  return commit;
}

// Status can flag a legacy layout without reading any candidate's contents.
export function legacyGuideNames(validatedRoot) {
  return guides.filter(name => locate(validatedRoot,name) !== null);
}

export function migrationCheck(dest) {
  const root = privateInstance(dest);
  const files = [];
  for (const name of guides) {
    const path = locate(root,name);
    if (path) files.push({name,sha256:hash(readFileSync(path))});
  }
  return {status:files.length ? 'legacy-review-required' : 'no-known-legacy-guides',files};
}

// One reviewed file per call. A protected byte-for-byte backup is durable
// before unlink; no overwrites, recursive cleanup or fallback destination.
export function retireGuide({dest,name,digest,backup,checkout,commit}) {
  checkSource(checkout,commit);
  if (!guides.includes(name) || !/^[0-9a-f]{64}$/.test(digest ?? '')) stop('REVIEWED_GUIDE_REQUIRED');
  const root = privateInstance(dest);
  const archive = privateDirectory(backup);
  if (archive === root || archive.startsWith(root+sep) || root.startsWith(archive+sep)) stop('SEPARATE_PRIVATE_BACKUP_REQUIRED');
  for (let dir=archive; ; dir=dirname(dir)) {
    // Bare repositories have no .git child. Reject repository-like layouts
    // conservatively instead of running a command in the backup directory.
    if (stat(join(dir,'.git')) || stat(join(dir,'.life-profile.json')) ||
        (stat(join(dir,'HEAD')) && stat(join(dir,'objects')))) stop('SEPARATE_PRIVATE_BACKUP_REQUIRED');
    if (dirname(dir) === dir) break;
  }
  if (process.platform !== 'win32' && (stat(archive).uid !== process.getuid() || (stat(archive).mode & 0o077))) stop('PROTECTED_BACKUP_REQUIRED');
  const path = locate(root,name);
  if (!path) stop('GUIDE_NOT_FOUND');
  const bytes = readFileSync(path);
  if (hash(bytes) !== digest) stop('LEGACY_GUIDE_CHANGED');
  const saved = join(archive,name.replace('/','--'));
  const fd = openSync(saved,'wx',0o600);
  try { writeFileSync(fd,bytes); fsyncSync(fd); } finally { closeSync(fd); }
  if (process.platform !== 'win32') {
    const dirfd = openSync(archive,'r');
    try { fsyncSync(dirfd); } finally { closeSync(dirfd); }
  }
  if (!readFileSync(saved).equals(bytes)) stop('BACKUP_VERIFICATION_FAILED');
  if (locate(root,name) !== path || hash(readFileSync(path)) !== digest) stop('LEGACY_GUIDE_CHANGED');
  unlinkSync(path);
  return {retired:name,backupFile:name.replace('/','--'),sha256:digest};
}
