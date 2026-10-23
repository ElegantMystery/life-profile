import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cpSync,mkdtempSync,realpathSync,rmSync,readFileSync,writeFileSync,mkdirSync,symlinkSync,existsSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const project=resolve(fileURLToPath(new URL('..',import.meta.url)));
function fixture(t){
 const base=realpathSync(mkdtempSync(join(tmpdir(),'profile-binding-')));t.after(()=>rmSync(base,{recursive:true,force:true}));
 const code=join(base,'code'),data=join(base,'data');
 // Copy only explicitly scoped, Git-listed public sources, never ignored local data.
 const listed=spawnSync('git',['-C',project,'ls-files','--cached','--others','--exclude-standard','-z','--','tools','tests','templates','schema','docs','examples','.gitignore','README.md','LICENSE','AGENTS.md'],{encoding:'utf8'});
 assert.equal(listed.status,0,listed.stderr);
 for(const name of new Set(listed.stdout.split('\0').filter(Boolean))){
  const source=join(project,name),dest=join(code,name);mkdirSync(resolve(dest,'..'),{recursive:true});cpSync(source,dest);
 }
 const git=(root,...args)=>spawnSync('git',['-C',root,...args],{encoding:'utf8'});
 assert.equal(git(code,'init','-q').status,0);
 const run=(...args)=>spawnSync(process.execPath,[join(code,'tools/setup.mjs'),...args],{cwd:base,encoding:'utf8'});
 return {base,code,data,git,run,config:join(code,'.life-profile.local.json')};
}
function fileBytes(root){
 const result={};
 function walk(dir,prefix=''){for(const entry of readdirSync(dir,{withFileTypes:true})){
  if(entry.name==='.git')continue;
  const name=prefix+entry.name,path=join(dir,entry.name);
  if(entry.isDirectory())walk(path,name+'/');else result[name]=readFileSync(path).toString('base64');
 }}walk(root);return result;
}
const ok=r=>assert.equal(r.status,0,r.stderr);
const bad=r=>assert.notEqual(r.status,0);
function draft(data){const day=new Date().toISOString().slice(0,10);writeFileSync(join(data,'drafts','test.json'),JSON.stringify({draft_version:'0.1.0',entries:[{id:'fictional-one',domain:'preferences',statement:'Fictional person enjoys ceramics.',source:{kind:'user_statement',reference:'Fictional answer'},confirmation:'pending',sensitivity:'private',subject:'self',status:'active',created:day,updated:day,review_due:null,expires:null,supersedes:[]}]}));}
test('explicit binding permits only initialized external root and supports default record operations',t=>{
 const f=fixture(t);ok(f.run('init','--dest',f.data));ok(f.git(f.data,'init','-q'));draft(f.data);
 const policy=readFileSync(join(f.data,'export-policy.json'));
 bad(f.run('check-draft','--dest',f.data,'--draft','test.json'));
 ok(f.run('bind','--dest',f.data));ok(f.run('bind','--dest',f.data));
 assert.equal(JSON.parse(f.run('status').stdout).destination,f.data);
 ok(f.run('save','--draft','test.json'));
 assert.equal(JSON.parse(readFileSync(join(f.data,'records.json'))).entries.length,1);
 assert.deepEqual(readFileSync(join(f.data,'export-policy.json')),policy);
 ok(f.git(f.code,'add','.'));assert.equal(f.git(f.code,'ls-files','--','.life-profile.local.json','private').stdout,'');
 bad(f.run('init'));assert.equal(JSON.parse(readFileSync(join(f.data,'records.json'))).entries.length,1);
});
test('copy migration and unbind rollback preserve both instances without rewriting data',t=>{
 const f=fixture(t);ok(f.run('init'));const source=join(f.code,'private');writeFileSync(join(source,'domains/basic.md'),'# Fictional\n\nSource: user answer.\n- Alias: Casey.\n');
 cpSync(source,f.data,{recursive:true});ok(f.git(f.data,'init','-q'));
 const before=readFileSync(join(source,'domains/basic.md')),allBefore=fileBytes(source);
 assert.deepEqual(fileBytes(f.data),allBefore);
 ok(f.run('bind','--dest',f.data));assert.deepEqual(readFileSync(join(f.data,'domains/basic.md')),before);
 ok(f.run('unbind'));ok(f.run('unbind'));assert.equal(JSON.parse(f.run('status').stdout).destination,source);
 assert.deepEqual(readFileSync(join(source,'domains/basic.md')),before);assert.deepEqual(readFileSync(join(f.data,'domains/basic.md')),before);
 assert.deepEqual(fileBytes(source),allBefore);assert.deepEqual(fileBytes(f.data),allBefore);
});
test('rejects unsafe bindings without replacing valid local configuration',t=>{
 const f=fixture(t);ok(f.run('init','--dest',f.data));ok(f.run('bind','--dest',f.data));const before=readFileSync(f.config);
 const alias=join(f.base,'alias');symlinkSync(f.data,alias,'dir');const nested=join(f.base,'outer');mkdirSync(nested);ok(f.git(nested,'init','-q'));
 for(const p of [f.code,join(f.code,'private'),f.base,alias,join(nested,'child'),f.data+'/../data',join(f.data,'.git'),'relative','//server/profile'])bad(f.run('bind','--dest',p));
 assert.deepEqual(readFileSync(f.config),before);
});
test('bound repository still rejects nested Git roots and gitdir indirection',t=>{
 const f=fixture(t);ok(f.run('init','--dest',f.data));ok(f.git(f.data,'init','-q'));ok(f.run('bind','--dest',f.data));draft(f.data);
 mkdirSync(join(f.data,'drafts','.git'));bad(f.run('check-draft','--draft','test.json'));rmSync(join(f.data,'drafts','.git'),{recursive:true});
 rmSync(join(f.data,'.git'),{recursive:true});writeFileSync(join(f.data,'.git'),'gitdir: elsewhere');bad(f.run('status'));
});
test('malformed or linked configuration fails closed and does not initialize default',t=>{
 const f=fixture(t);writeFileSync(f.config,'{broken');bad(f.run('init'));assert.equal(existsSync(join(f.code,'private')),false);
 rmSync(f.config);const outside=join(f.base,'config.json');writeFileSync(outside,JSON.stringify({data_directory:f.data}));symlinkSync(outside,f.config);bad(f.run('init'));bad(f.run('unbind'));assert.ok(existsSync(outside));
});

test('binding refuses a public-tracked configuration and leaves it unchanged',t=>{
 const f=fixture(t);ok(f.run('init','--dest',f.data));
 writeFileSync(f.config,JSON.stringify({data_directory:f.data}));ok(f.git(f.code,'add','-f','.life-profile.local.json'));
 const before=readFileSync(f.config);bad(f.run('bind','--dest',f.data));bad(f.run('unbind'));assert.deepEqual(readFileSync(f.config),before);
});
test('existing config lock and pending symlink are not overwritten',t=>{
 const f=fixture(t);ok(f.run('init','--dest',f.data));
 writeFileSync(f.config+'.lock','busy');bad(f.run('bind','--dest',f.data));assert.equal(readFileSync(f.config+'.lock','utf8'),'busy');rmSync(f.config+'.lock');
 const target=join(f.base,'outside');writeFileSync(target,'keep');symlinkSync(target,f.config+'.pending');bad(f.run('bind','--dest',f.data));assert.equal(readFileSync(target,'utf8'),'keep');assert.equal(existsSync(f.config),false);
});
test('explicit destinations override binding without allowing another Git repository',t=>{
 const f=fixture(t);ok(f.run('init','--dest',f.data));ok(f.run('bind','--dest',f.data));
 const other=join(f.base,'other');ok(f.run('init','--dest',other));draft(other);ok(f.run('check-draft','--dest',other,'--draft','test.json'));
 ok(f.git(other,'init','-q'));bad(f.run('check-draft','--dest',other,'--draft','test.json'));
 assert.equal(JSON.parse(f.run('status').stdout).destination,f.data);
});
test('Git ancestors and redirected worktrees do not receive the bound-root exception',t=>{
 const f=fixture(t);ok(f.run('init','--dest',f.data));ok(f.git(f.base,'init','-q'));bad(f.run('bind','--dest',f.data));rmSync(join(f.base,'.git'),{recursive:true});
 ok(f.git(f.data,'init','-q'));ok(f.git(f.data,'config','core.worktree',f.code));bad(f.run('bind','--dest',f.data));
});
test('configuration must have exactly one field and a valid current instance',t=>{
 const f=fixture(t);ok(f.run('init','--dest',f.data));
 for(const cfg of [{data_directory:f.data,extra:true},{data_directory:f.code},{data_directory:'relative'},[]]){
  writeFileSync(f.config,JSON.stringify(cfg));bad(f.run('status'));
 }
 rmSync(f.config);ok(f.run('bind','--dest',f.data));writeFileSync(join(f.data,'.life-profile.json'),'{}');bad(f.run('status'));
});

test('missing bound instance cannot be silently reinitialized',t=>{
 const f=fixture(t);ok(f.run('init','--dest',f.data));ok(f.run('bind','--dest',f.data));rmSync(f.data,{recursive:true});
 bad(f.run('init'));assert.equal(existsSync(f.data),false);
});
test('shared Git common directory is not a standalone personal repository',t=>{
 const f=fixture(t);ok(f.run('init','--dest',f.data));ok(f.git(f.data,'init','-q'));
 writeFileSync(join(f.data,'.git','commondir'),join(f.code,'.git')+'\n');bad(f.run('bind','--dest',f.data));assert.equal(existsSync(f.config),false);
});

test('documented fresh local flow reports absence then initializes and resumes without overwrite',t=>{
 const f=fixture(t);bad(f.run('status'));ok(f.run('init'));
 const status=JSON.parse(f.run('status').stdout);assert.equal(status.mode,'local');assert.equal(status.destination,join(f.code,'private'));
 const before=fileBytes(status.destination);bad(f.run('init'));assert.deepEqual(fileBytes(status.destination),before);
});
test('documented existing-instance and malformed-binding recovery never recreates profile data',t=>{
 const f=fixture(t);ok(f.run('init','--dest',f.data));const before=fileBytes(f.data);
 ok(f.run('bind','--dest',f.data));assert.equal(JSON.parse(f.run('status').stdout).mode,'external');
 writeFileSync(f.config,'{malformed');bad(f.run('status'));ok(f.run('unbind'));bad(f.run('status'));assert.equal(existsSync(join(f.code,'private')),false);
 ok(f.run('bind','--dest',f.data));ok(f.run('status'));assert.deepEqual(fileBytes(f.data),before);
 const validation=spawnSync(process.execPath,[join(f.code,'tools/profile.mjs'),'validate',join(f.data,'records.json')],{cwd:f.base,encoding:'utf8'});ok(validation);
});
