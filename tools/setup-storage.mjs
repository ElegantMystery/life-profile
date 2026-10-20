import { lstatSync, readFileSync, writeFileSync, mkdirSync, openSync, closeSync, renameSync, unlinkSync } from 'node:fs';
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT=resolve(fileURLToPath(new URL('..',import.meta.url)));
const DEFAULT_PRIVATE=join(PROJECT,'private');
const MARKER={instance_version:'0.1.0',kind:'life-profile-private'};
const DOMAINS=['basic','current-context','values','goals-projects','learning-skills','relationships','preferences','decisions-experiences','work-contribution','home-daily-life','health-optional','finance-optional','life-admin-optional'];
const FILES=['INDEX.md','records.json','export-policy.json','ASSISTANT-GUIDE.md','IMPORT-GUIDE.md','START-HERE.md','SETUP-PROGRESS.md','drafts/README.md','notes/README.md',...DOMAINS.map(name=>`domains/${name}.md`)];
export function stop(code){throw new Error(code);}

function statIfPresent(path){try{return lstatSync(path);}catch(error){if(error.code==='ENOENT')return null;throw error;}}
function outsideProject(path){const rel=relative(PROJECT,path);return rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel);}

// Reject UNC/double-separator spelling, not mapped drives or mounted filesystems.
// Storage locality is not detected. This is not an OS sandbox.
export function privateDirectory(path){
 if(typeof path!=='string'||!isAbsolute(path)||/^[\\/]{2}/.test(path))stop('ABSOLUTE_NON_UNC_PATH_REQUIRED');
 const full=resolve(path);
 const inPrivate=full===DEFAULT_PRIVATE||full.startsWith(DEFAULT_PRIVATE+sep);
 if(!outsideProject(full)&&!inPrivate)stop('DESTINATION_INSIDE_PROJECT');
 return checkedDirectory(full,inPrivate);
}

function checkedDirectory(full,inPrivate){
 const root=parse(full).root;let current=root;
 const parts=relative(root,full).split(sep).filter(Boolean);
 for(const part of ['',...parts]){
  if(part)current=join(current,part);
  const stat=statIfPresent(current);
  if(!stat||!stat.isDirectory()||stat.isSymbolicLink())stop('UNSAFE_OR_MISSING_DIRECTORY');
  // Only this checkout's Git marker is exempted for its private subtree.
  // Other Git ancestors and nested repositories remain forbidden.
  if(statIfPresent(join(current,'.git'))&&!(inPrivate&&current===PROJECT))stop('DESTINATION_INSIDE_GIT');
 }
 return full;
}

export function readPrivateFile(path){
 privateDirectory(dirname(path));
 const stat=lstatSync(path);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.nlink!==1)stop('UNSAFE_FILE');
 return readFileSync(path,'utf8');
}

export function privateInstance(dest){
 const root=privateDirectory(dest);
 const marker=JSON.parse(readPrivateFile(join(root,'.life-profile.json')));
 if(!marker||Array.isArray(marker)||Object.keys(marker).length!==2||marker.instance_version!==MARKER.instance_version||marker.kind!==MARKER.kind)stop('INVALID_INSTANCE_MARKER');
 return root;
}

export function initProfile(dest=DEFAULT_PRIVATE){
 if(typeof dest!=='string'||!isAbsolute(dest)||/^[\\/]{2}/.test(dest))stop('ABSOLUTE_NON_UNC_PATH_REQUIRED');
 const root=resolve(dest);
 if(root===DEFAULT_PRIVATE)checkedDirectory(PROJECT,true);
 else{
  if(!outsideProject(root))stop('DESTINATION_INSIDE_PROJECT');
  privateDirectory(dirname(root));
 }
 if(statIfPresent(root))stop('DESTINATION_EXISTS');
 // Read only the manifest before making a directory; examples can never be copied.
 const contents=FILES.map(name=>{
  const source=join(PROJECT,'templates',name);const stat=lstatSync(source);
  if(!stat.isFile()||stat.isSymbolicLink())stop('UNSAFE_TEMPLATE');
  return [name,readFileSync(source,'utf8')];
 });
 const empty=JSON.parse(contents.find(([name])=>name==='records.json')[1]);
 const policy=JSON.parse(contents.find(([name])=>name==='export-policy.json')[1]);
 if(empty.schema_version!=='0.1.0'||!Array.isArray(empty.entries)||empty.entries.length!==0||!Array.isArray(policy.allow_ids)||policy.allow_ids.length!==0)stop('TEMPLATE_NOT_EMPTY');
 mkdirSync(root,{mode:0o700});
 // A failure leaves a new, incomplete folder for inspection. Never recursively delete it.
 for(const dir of ['domains','drafts','notes'])mkdirSync(join(root,dir),{mode:0o700});
 for(const [name,text] of contents)writeFileSync(join(root,name),text,{encoding:'utf8',flag:'wx',mode:0o600});
 writeFileSync(join(root,'.life-profile.json'),JSON.stringify(MARKER,null,2)+'\n',{flag:'wx',mode:0o600});
 return {initialized:true,records:0,allow_ids:0};
}

export function replaceRegister(root, expected, next){
 privateInstance(root);
 const lock=join(root,'.setup.lock'),pending=join(root,'.records.pending'),target=join(root,'records.json');
 let lockOwned=false,pendingOwned=false;
 try{
  const fd=openSync(lock,'wx',0o600);lockOwned=true;closeSync(fd);
  if(readPrivateFile(target)!==expected)stop('REGISTER_CHANGED');
  // Exclusive creation refuses stale files, directories and dangling symlinks.
  const staged=openSync(pending,'wx',0o600);pendingOwned=true;
  try{writeFileSync(staged,next,'utf8');}finally{closeSync(staged);}
  if(readPrivateFile(target)!==expected)stop('REGISTER_CHANGED');
  renameSync(pending,target);pendingOwned=false;
 }finally{
  if(pendingOwned)unlinkSync(pending);
  if(lockOwned)unlinkSync(lock);
 }
}
