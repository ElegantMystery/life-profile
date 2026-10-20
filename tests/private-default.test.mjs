import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const project=resolve(fileURLToPath(new URL('..',import.meta.url)));
function fixture(t){
 const base=realpathSync(mkdtempSync(join(tmpdir(),'life-profile-default-test-')));
 t.after(()=>rmSync(base,{recursive:true,force:true}));
 const checkout=join(base,'checkout');
 cpSync(project,checkout,{recursive:true,filter:path=>path!==join(project,'.git')&&path!==join(project,'private')});
 const git=(...args)=>spawnSync('git',['-C',checkout,...args],{encoding:'utf8'});
 assert.equal(git('init','--quiet').status,0);
 const run=(...args)=>spawnSync(process.execPath,[join(checkout,'tools/setup.mjs'),...args],{cwd:base,encoding:'utf8'});
 return {base,checkout,dest:join(checkout,'private'),git,run};
}
const json=path=>JSON.parse(readFileSync(path,'utf8'));
function pending(dest){
 const day=new Date().toISOString().slice(0,10);
 writeFileSync(join(dest,'drafts','basic.json'),JSON.stringify({draft_version:'0.1.0',entries:[{id:'fictional-basic',domain:'stable-profile',statement:'Fictional person uses a fictional alias.',source:{kind:'user_statement',reference:'Fictional test answer'},confirmation:'pending',sensitivity:'private',subject:'self',status:'active',created:day,updated:day,review_due:null,expires:null,supersedes:[]}]}));
}

test('init defaults to private under the tools checkout, independent of working directory',t=>{
 const {base,checkout,dest,run}=fixture(t),result=run('init');
 assert.equal(result.status,0,result.stderr);
 assert.deepEqual(JSON.parse(result.stdout),{initialized:true,records:0,allow_ids:0});
 assert.deepEqual(json(join(dest,'records.json')).entries,[]);
 assert.deepEqual(json(join(dest,'export-policy.json')).allow_ids,[]);
 assert.equal(existsSync(join(base,'private')),false);
 assert.equal(existsSync(join(dest,'domains','basic.md')),true);
 assert.equal(existsSync(join(dest,'domains','stable-profile.md')),false);
 assert.equal(readdirSync(join(dest,'domains')).length,13);
 assert.equal(existsSync(join(checkout,'templates','domains','basic.md')),true);
 for(const name of ['.git','examples','tools'])assert.equal(existsSync(join(dest,name)),false);
});

test('explicit absolute destination may select the same private root',t=>{
 const {dest,run}=fixture(t),result=run('init','--dest',dest);
 assert.equal(result.status,0,result.stderr);
 assert.equal(existsSync(join(dest,'.life-profile.json')),true);
});

test('private instance supports explicit draft review and confirmation with the existing schema domain',t=>{
 const {dest,run}=fixture(t);assert.equal(run('init').status,0);pending(dest);
 const policy=readFileSync(join(dest,'export-policy.json'),'utf8');
 const checked=run('check-draft','--dest',dest,'--draft','basic.json');assert.equal(checked.status,0,checked.stderr);
 const approved=run('confirm','--dest',dest,'--draft','basic.json','--ids','fictional-basic','--approve',JSON.parse(checked.stdout).approval_digest);
 assert.equal(approved.status,0,approved.stderr);
 assert.equal(json(join(dest,'records.json')).entries[0].domain,'stable-profile');
 assert.equal(json(join(dest,'records.json')).entries[0].confirmation,'confirmed');
 assert.equal(readFileSync(join(dest,'export-policy.json'),'utf8'),policy);
 for(const args of [['check-draft','--draft','basic.json'],['confirm','--draft','basic.json','--ids','fictional-basic','--approve','0'.repeat(64)]])assert.notEqual(run(...args).status,0);
});

test('fictional repeat summary import preserves provenance, reviews supersession and rejects stale approval',t=>{
 const {dest,run}=fixture(t);assert.equal(run('init').status,0);
 const policy=readFileSync(join(dest,'export-policy.json'),'utf8');
 assert.deepEqual(json(join(dest,'export-policy.json')).allow_ids,[]);
 pending(dest);
 const check=name=>{
  const result=run('check-draft','--dest',dest,'--draft',name);
  assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);
 };
 const confirm=(name,ids,digest)=>run('confirm','--dest',dest,'--draft',name,'--ids',ids,'--approve',digest);
 const first=check('basic.json');
 assert.equal(confirm('basic.json','fictional-basic',first.approval_digest).status,0);
 const original=json(join(dest,'records.json')).entries[0];
 const imported={...original,id:'fictional-import',statement:'Fictional AI summary suggests the person may now prefer a different alias; uncertain.',source:{kind:'ai_inference',reference:'Fictional user-provided AI summary, item 1; source date unknown'},confirmation:'pending',supersedes:['fictional-basic']};
 const unresolved={...imported,id:'fictional-unresolved',statement:'Fictional AI summary suggests a possible interest in painting; unverified.',supersedes:[]};
 const draftPath=join(dest,'drafts','import.json');
 const write=entries=>writeFileSync(draftPath,JSON.stringify({draft_version:'0.1.0',entries},null,2));
 write([imported,unresolved]);
 const checked=check('import.json');
 assert.deepEqual(checked.candidate_ids,['fictional-import','fictional-unresolved']);
 const before=readFileSync(join(dest,'records.json'),'utf8');
 // The agent must review both sides; checking alone cannot resolve a conflict.
 assert.equal(json(join(dest,'records.json')).entries[0].status,'active');
 assert.notEqual(confirm('import.json','not-reviewed',checked.approval_digest).status,0);
 writeFileSync(draftPath,readFileSync(draftPath,'utf8')+'\n');
 const staleDraft=confirm('import.json','fictional-import',checked.approval_digest);
 assert.notEqual(staleDraft.status,0);assert.match(staleDraft.stderr,/APPROVAL_DIGEST_REQUIRED_OR_STALE/);
 assert.equal(readFileSync(join(dest,'records.json'),'utf8'),before);
 const rechecked=check('import.json');
 writeFileSync(join(dest,'records.json'),before+'\n');
 const staleRegister=confirm('import.json','fictional-import',rechecked.approval_digest);
 assert.notEqual(staleRegister.status,0);assert.match(staleRegister.stderr,/APPROVAL_DIGEST_REQUIRED_OR_STALE/);
 const approved=confirm('import.json','fictional-import',check('import.json').approval_digest);
 assert.equal(approved.status,0,approved.stderr);
 assert.deepEqual(JSON.parse(approved.stdout),{confirmed_ids:['fictional-import'],superseded_ids:['fictional-basic']});
 const entries=json(join(dest,'records.json')).entries;
 assert.equal(entries.length,2);assert.equal(entries[0].status,'superseded');
 assert.deepEqual(entries[0].source,original.source);
 assert.deepEqual(entries[1].source,imported.source);assert.equal(entries[1].statement,imported.statement);
 assert.equal(entries[1].confirmation,'confirmed');assert.equal(entries[1].sensitivity,'private');
 assert.equal(readFileSync(join(dest,'export-policy.json'),'utf8'),policy);
 assert.equal(json(draftPath).entries[1].confirmation,'pending');
 // A repeat import cannot silently duplicate a confirmed ID or add provider fields.
 assert.notEqual(run('check-draft','--dest',dest,'--draft','import.json').status,0);
 write([{...unresolved,source:{...unresolved.source,provider:'fictional'}}]);
 assert.notEqual(run('check-draft','--dest',dest,'--draft','import.json').status,0);
 assert.deepEqual(json(join(dest,'records.json')).entries,entries);
});

for(const kind of ['empty directory','file','symlink','dangling symlink'])test('default refuses existing '+kind+' without replacing it',t=>{
 const {base,dest,run}=fixture(t),target=join(base,'target');
 if(kind==='empty directory')mkdirSync(dest);
 else if(kind==='file')writeFileSync(dest,'keep');
 else{if(kind==='symlink')mkdirSync(target);symlinkSync(target,dest,process.platform==='win32'?'junction':'dir');}
 assert.notEqual(run('init').status,0);
 if(kind==='empty directory')assert.deepEqual(readdirSync(dest),[]);
 else if(kind==='file')assert.equal(readFileSync(dest,'utf8'),'keep');
 else if(kind==='symlink')assert.deepEqual(readdirSync(target),[]);
 else assert.equal(existsSync(target),false);
});

test('only the exact private root is an allowed in-project initialization target',t=>{
 const {checkout,dest,run}=fixture(t);
 for(const path of [checkout,join(checkout,'other'),join(checkout,'private-copy'),join(checkout,'templates','private'),join(dest,'nested')]){
  const result=run('init','--dest',path);assert.notEqual(result.status,0,path);assert.match(result.stderr,/DESTINATION_INSIDE_PROJECT/);
 }
 assert.equal(existsSync(dest),false);
});

test('nested Git metadata remains forbidden inside the private instance',t=>{
 const {dest,run}=fixture(t);assert.equal(run('init').status,0);pending(dest);
 for(const directory of [dest,join(dest,'drafts')]){
  const marker=join(directory,'.git');writeFileSync(marker,'gitdir: elsewhere');
  const result=run('check-draft','--dest',dest,'--draft','basic.json');assert.notEqual(result.status,0);assert.match(result.stderr,/DESTINATION_INSIDE_GIT/);rmSync(marker);
 }
 assert.deepEqual(json(join(dest,'records.json')).entries,[]);
});

test('a Git ancestor above the tools checkout is not exempted',t=>{
 const {base,dest,run}=fixture(t);mkdirSync(join(base,'.git'));
 const result=run('init');assert.notEqual(result.status,0);assert.match(result.stderr,/DESTINATION_INSIDE_GIT/);assert.equal(existsSync(dest),false);
});

test('linked private child directories cannot redirect draft reads',t=>{
 const {base,dest,run}=fixture(t);assert.equal(run('init').status,0);
 const target=join(base,'outside-drafts');mkdirSync(target);rmSync(join(dest,'drafts'),{recursive:true});
 symlinkSync(target,join(dest,'drafts'),process.platform==='win32'?'junction':'dir');
 const result=run('check-draft','--dest',dest,'--draft','basic.json');assert.notEqual(result.status,0);assert.match(result.stderr,/UNSAFE_OR_MISSING_DIRECTORY/);
 assert.deepEqual(readdirSync(target),[]);
});

test('root-anchored private ignore excludes all generated files from ordinary git add',t=>{
 const {dest,checkout,run,git}=fixture(t);assert.equal(run('init').status,0);
 const ignored=git('check-ignore','--verbose','private/records.json');assert.equal(ignored.status,0,ignored.stderr);assert.match(ignored.stdout,/:\/private\/\s+private\/records\.json/);
 mkdirSync(join(checkout,'docs','private'));writeFileSync(join(checkout,'docs','private','ordinary.md'),'Generic test fixture.');
 assert.equal(git('check-ignore','docs/private/ordinary.md').status,1);
 assert.equal(git('add','.').status,0);
 assert.equal(git('ls-files','--','private').stdout,'');
 assert.equal(git('ls-files','--','templates/domains/basic.md').stdout.trim(),'templates/domains/basic.md');
 assert.deepEqual(json(join(dest,'records.json')).entries,[]);
});

test('repository checker skips the entire root private folder without reading it',t=>{
 const {dest,checkout,run}=fixture(t);assert.equal(run('init').status,0);
 writeFileSync(join(dest,'invalid.json'),'{ deliberately invalid private test fixture');
 symlinkSync(join(dest,'missing-target'),join(dest,'unreadable-link'),process.platform==='win32'?'junction':'dir');
 const result=spawnSync(process.execPath,['tools/check-repository.mjs'],{cwd:checkout,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/Checked/);
});

test('repository checker still checks nested folders named private',t=>{
 const {checkout}=fixture(t);mkdirSync(join(checkout,'docs','private'));writeFileSync(join(checkout,'docs','private','invalid.json'),'{broken');
 const result=spawnSync(process.execPath,['tools/check-repository.mjs'],{cwd:checkout,encoding:'utf8'});
 assert.notEqual(result.status,0);assert.match(result.stderr,/docs[\\/]private[\\/]invalid\.json: invalid JSON/);
});

test('repository checker scans a root regular file named private because the directory ignore does not cover it',t=>{
 const {checkout,git}=fixture(t);
 writeFileSync(join(checkout,'private'),['-----BEGIN','PRIVATE KEY-----'].join(' '));
 assert.equal(git('check-ignore','private').status,1);
 const result=spawnSync(process.execPath,['tools/check-repository.mjs'],{cwd:checkout,encoding:'utf8'});
 assert.notEqual(result.status,0);assert.match(result.stderr,/private: possible secret or personal identifier/);
});

test('repository checker refuses a root private symlink without following it',t=>{
 const {base,checkout}=fixture(t),target=join(base,'private-target');mkdirSync(target);
 symlinkSync(target,join(checkout,'private'),process.platform==='win32'?'junction':'dir');
 const result=spawnSync(process.execPath,['tools/check-repository.mjs'],{cwd:checkout,encoding:'utf8'});
 assert.notEqual(result.status,0);assert.match(result.stderr,/Unexpected symlink/);assert.deepEqual(readdirSync(target),[]);
});

test('the default also initializes an extracted source archive without Git metadata',t=>{
 const {checkout,dest,run}=fixture(t);rmSync(join(checkout,'.git'),{recursive:true});
 const result=run('init');assert.equal(result.status,0,result.stderr);assert.deepEqual(json(join(dest,'records.json')).entries,[]);
 const before=readFileSync(join(dest,'domains','basic.md'),'utf8');
 assert.notEqual(run('init').status,0);assert.equal(readFileSync(join(dest,'domains','basic.md'),'utf8'),before);
});
