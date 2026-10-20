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

test('private instance supports direct record saving with the existing schema domain',t=>{
 const {dest,run}=fixture(t);assert.equal(run('init').status,0);pending(dest);
 const policy=readFileSync(join(dest,'export-policy.json'),'utf8');
 const checked=run('check-draft','--dest',dest,'--draft','basic.json');assert.equal(checked.status,0,checked.stderr);
 const approved=run('save','--dest',dest,'--draft','basic.json','--ids','fictional-basic');
 assert.equal(approved.status,0,approved.stderr);
 assert.equal(json(join(dest,'records.json')).entries[0].domain,'stable-profile');
 assert.equal(json(join(dest,'records.json')).entries[0].confirmation,'confirmed');
 assert.equal(readFileSync(join(dest,'export-policy.json'),'utf8'),policy);
 for(const args of [['check-draft','--draft','basic.json'],['save','--draft','basic.json','--ids','fictional-basic']])assert.notEqual(run(...args).status,0);
});

test('fictional repeat import and direct corrections preserve provenance and export policy without approval',t=>{
 const {dest,run}=fixture(t);assert.equal(run('init').status,0);pending(dest);
 const policy=readFileSync(join(dest,'export-policy.json'),'utf8');
 assert.equal(run('save','--dest',dest,'--draft','basic.json').status,0);
 const original=json(join(dest,'records.json')).entries[0];
 const imported={...original,id:'fictional-import',statement:'Fictional AI summary suggests an interest in painting; uncertain.',source:{kind:'ai_inference',reference:'Fictional supplied summary'},confirmation:'pending',supersedes:[]};
 const correction={...original,id:'fictional-correction',statement:'Fictional person now uses the alias River.',source:{kind:'user_statement',reference:'Fictional direct correction'},confirmation:'pending',supersedes:['fictional-basic']};
 const draftPath=join(dest,'drafts','import.json');
 writeFileSync(draftPath,JSON.stringify({draft_version:'0.1.0',entries:[imported,correction]}));
 const result=run('save','--dest',dest,'--draft','import.json');assert.equal(result.status,0,result.stderr);
 assert.deepEqual(JSON.parse(result.stdout),{saved_ids:['fictional-import','fictional-correction'],superseded_ids:['fictional-basic']});
 const entries=json(join(dest,'records.json')).entries;
 assert.equal(entries[0].status,'superseded');assert.deepEqual(entries[0].source,original.source);
 assert.deepEqual(entries[1].source,imported.source);assert.equal(entries[1].confirmation,'pending');
 assert.deepEqual(entries[2].source,correction.source);assert.equal(entries[2].confirmation,'confirmed');
 assert.equal(readFileSync(join(dest,'export-policy.json'),'utf8'),policy);
 assert.deepEqual(json(join(dest,'export-policy.json')).allow_ids,[]);
 assert.notEqual(run('save','--dest',dest,'--draft','import.json').status,0);
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
