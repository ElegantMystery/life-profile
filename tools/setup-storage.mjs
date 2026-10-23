import { realpathSync, lstatSync, readFileSync, writeFileSync, mkdirSync, openSync, closeSync, renameSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT=resolve(fileURLToPath(new URL('..',import.meta.url)));
const DEFAULT_PRIVATE=join(PROJECT,'private');
const CONFIG=join(PROJECT,'.life-profile.local.json');
const MARKER={instance_version:'0.1.0',kind:'life-profile-private'};
const DOMAINS=['basic','current-context','values','goals-projects','learning-skills','relationships','preferences','decisions-experiences','work-contribution','home-daily-life','health-optional','finance-optional','life-admin-optional'];
const FILES=['INDEX.md','records.json','export-policy.json','ASSISTANT-GUIDE.md','IMPORT-GUIDE.md','START-HERE.md','SETUP-PROGRESS.md','drafts/README.md','notes/README.md',...DOMAINS.map(name=>`domains/${name}.md`)];
export function stop(code){throw new Error(code);}

function statIfPresent(path){try{return lstatSync(path);}catch(error){if(error.code==='ENOENT')return null;throw error;}}
function outsideProject(path){const rel=relative(PROJECT,path);return rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel);}

// Binding contains only a local absolute directory, never credentials or profile facts.
function absolutePath(path){
 if(typeof path!=='string'||!isAbsolute(path)||/^[\\/]{2}/.test(path))stop('ABSOLUTE_NON_UNC_PATH_REQUIRED');
 if(path.split(/[\\/]/).includes('..'))stop('PATH_TRAVERSAL');
 return resolve(path);
}
function gitOutput(root,args){
 const env={...process.env};for(const key of Object.keys(env))if(key.startsWith('GIT_'))delete env[key];
 return execFileSync('git',['-C',root,...args],{encoding:'utf8',env,stdio:['ignore','pipe','pipe']}).trim();
}
function configText(){
 if(statIfPresent(join(PROJECT,'.git'))){
  let tracked;try{tracked=gitOutput(PROJECT,['ls-files','--','.life-profile.local.json']);}catch{stop('CONFIG_TRACKING_CHECK_FAILED');}
  if(tracked)stop('CONFIG_IS_TRACKED');
 }
 const stat=statIfPresent(CONFIG);if(!stat)return null;
 if(!stat.isFile()||stat.isSymbolicLink()||stat.nlink!==1)stop('UNSAFE_CONFIG');
 return readFileSync(CONFIG,'utf8');
}
export function boundDirectory(){
 const text=configText();if(text===null)return null;
 let value;try{value=JSON.parse(text);}catch{stop('INVALID_CONFIG');}
 if(!value||Array.isArray(value)||Object.keys(value).length!==1||typeof value.data_directory!=='string')stop('INVALID_CONFIG');
 const root=absolutePath(value.data_directory);
 // Never allow the code checkout, its descendants or any of its ancestors.
 if(!outsideProject(root)||PROJECT.startsWith(root+sep)||root===parse(root).root)stop('INVALID_BOUND_DIRECTORY');
 return root;
}
export function selectedDirectory(){return boundDirectory()??DEFAULT_PRIVATE;}
function bindingTarget(dest){
 const root=absolutePath(dest);
 if(!outsideProject(root)||PROJECT.startsWith(root+sep)||root===parse(root).root)stop('INVALID_BOUND_DIRECTORY');
 checkedDirectory(root,false,root);
 const markerPath=join(root,'.life-profile.json'),stat=statIfPresent(markerPath);
 if(!stat||!stat.isFile()||stat.isSymbolicLink()||stat.nlink!==1)stop('INVALID_INSTANCE_MARKER');
 let marker;try{marker=JSON.parse(readFileSync(markerPath,'utf8'));}catch{stop('INVALID_INSTANCE_MARKER');}
 if(!marker||Array.isArray(marker)||Object.keys(marker).length!==2||marker.instance_version!==MARKER.instance_version||marker.kind!==MARKER.kind)stop('INVALID_INSTANCE_MARKER');
 return root;
}
function changeBinding(next){
 // Serialize helper changes and refuse pre-existing temporary/linked paths.
 const lock=CONFIG+'.lock',pending=CONFIG+'.pending';let locked=false,staged=false;
 try{
  const fd=openSync(lock,'wx',0o600);closeSync(fd);locked=true;
  const before=configText();
  if(next===null){if(before!==null)unlinkSync(CONFIG);return;}
  if(before===next)return;
  const out=openSync(pending,'wx',0o600);staged=true;
  try{writeFileSync(out,next,'utf8');}finally{closeSync(out);}
  if(configText()!==before)stop('CONFIG_CHANGED');
  renameSync(pending,CONFIG);staged=false;
 }finally{if(staged)unlinkSync(pending);if(locked)unlinkSync(lock);}
}
export function bindProfile(dest){
 const root=bindingTarget(dest);
 changeBinding(JSON.stringify({data_directory:root},null,2)+'\n');
 return {bound:true};
}
export function unbindProfile(){changeBinding(null);return {bound:false};}
export function storageStatus(){
 const root=selectedDirectory();privateInstance(root);
 return {destination:root,mode:boundDirectory()?'external':'local'};
}

// Reject UNC/double-separator spelling, not mapped drives or mounted filesystems.
// Storage locality is not detected. This is not an OS sandbox.
export function privateDirectory(path){
 if(typeof path!=='string'||!isAbsolute(path)||/^[\\/]{2}/.test(path))stop('ABSOLUTE_NON_UNC_PATH_REQUIRED');
 const full=absolutePath(path);
 const inPrivate=full===DEFAULT_PRIVATE||full.startsWith(DEFAULT_PRIVATE+sep);
 if(!outsideProject(full)&&!inPrivate)stop('DESTINATION_INSIDE_PROJECT');
 return checkedDirectory(full,inPrivate,boundDirectory());
}

function checkedDirectory(full,inPrivate,allowedRoot=null){
 const root=parse(full).root;let current=root;
 const parts=relative(root,full).split(sep).filter(Boolean);
 for(const part of ['',...parts]){
  if(part)current=join(current,part);
  if(part==='.git')stop('GIT_METADATA_FORBIDDEN');
  const stat=statIfPresent(current);
  if(!stat||!stat.isDirectory()||stat.isSymbolicLink())stop('UNSAFE_OR_MISSING_DIRECTORY');
  // Only this checkout's Git marker is exempted for its private subtree.
  // Other Git ancestors and nested repositories remain forbidden.
  const gitMarker=statIfPresent(join(current,'.git'));
  if(gitMarker&&!(inPrivate&&current===PROJECT)){
   if(current!==allowedRoot)stop('DESTINATION_INSIDE_GIT');
   if(!gitMarker.isDirectory()||gitMarker.isSymbolicLink())stop('UNSAFE_GIT_METADATA');
   for(const part of ['commondir','objects/info/alternates'])if(statIfPresent(join(current,'.git',part)))stop('UNSAFE_GIT_METADATA');
   for(const part of ['config','HEAD','objects','refs'])if(statIfPresent(join(current,'.git',part))?.isSymbolicLink())stop('UNSAFE_GIT_METADATA');
   // Standalone repositories only: no worktree gitfiles, submodules or redirected worktrees.
   let top;try{top=gitOutput(current,['rev-parse','--show-toplevel']);}catch{stop('INVALID_DATA_REPOSITORY');}
   if(resolve(top)!==current)stop('INVALID_DATA_REPOSITORY');
   let dirs;try{dirs=gitOutput(current,['rev-parse','--absolute-git-dir','--git-common-dir']).split('\n');}catch{stop('INVALID_DATA_REPOSITORY');}
   if(dirs.length!==2||dirs.some(path=>realpathSync(resolve(current,path))!==join(current,'.git')))stop('UNSAFE_GIT_METADATA');
  }
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

export function initProfile(dest){
 if(dest===undefined){
  const bound=boundDirectory();
  // A missing bound profile is a recovery problem, never an invitation to replace it.
  if(bound)privateInstance(bound);
  dest=bound??DEFAULT_PRIVATE;
 }
 if(typeof dest!=='string'||!isAbsolute(dest)||/^[\\/]{2}/.test(dest))stop('ABSOLUTE_NON_UNC_PATH_REQUIRED');
 const root=absolutePath(dest);
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
