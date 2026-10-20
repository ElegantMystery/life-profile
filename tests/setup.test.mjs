import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, realpathSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync, symlinkSync, linkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { initProfile, privateDirectory, replaceRegister } from '../tools/setup-storage.mjs';
import { inspectDraft, saveDraft } from '../tools/setup-records.mjs';
import { exportProfile } from '../tools/profile.mjs';

const project=resolve(fileURLToPath(new URL('..',import.meta.url)));
function sandbox(t){const base=realpathSync(mkdtempSync(join(tmpdir(),'life-profile-test-')));t.after(()=>rmSync(base,{recursive:true,force:true}));return base;}
function instance(t){const dest=join(sandbox(t),'private-instance');initProfile(dest);return dest;}
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const today=()=>new Date().toISOString().slice(0,10);
function candidate(id='fictional-pref') {return {id,domain:'preferences',statement:'Fictional person prefers numbered craft steps.',source:{kind:'user_statement',reference:'Fictional direct answer'},confirmation:'pending',sensitivity:'private',subject:'self',status:'active',created:today(),updated:today(),review_due:null,expires:null,supersedes:[]};}
function draft(dest, entries=[candidate()], name='basic.json') {writeFileSync(join(dest,'drafts',name),JSON.stringify({draft_version:'0.1.0',entries},null,2));return name;}
function save(dest,name='basic.json',ids=['fictional-pref']){return saveDraft({dest,draftName:name,ids});}

test('initializer copies only empty private templates and local assistant guides',t=>{
 const dest=instance(t);assert.deepEqual(json(join(dest,'records.json')).entries,[]);
 assert.deepEqual(json(join(dest,'export-policy.json')).allow_ids,[]);
 assert.ok(readFileSync(join(dest,'ASSISTANT-GUIDE.md'),'utf8').includes('cloud'));
 assert.ok(existsSync(join(dest,'START-HERE.md')));assert.ok(existsSync(join(dest,'SETUP-PROGRESS.md')));
 assert.equal(readFileSync(join(dest,'IMPORT-GUIDE.md'),'utf8'),readFileSync(join(project,'templates','IMPORT-GUIDE.md'),'utf8'));
 assert.equal(readdirSync(join(dest,'domains')).length,13);
 for(const name of ['examples','.git','tools']) assert.equal(existsSync(join(dest,name)),false);
 assert.deepEqual(readdirSync(join(dest,'drafts')),['README.md']);
});
test('initialization refuses any existing destination without modifying it',t=>{
 const base=sandbox(t);for(const name of ['empty','occupied']){const dest=join(base,name);mkdirSync(dest);if(name==='occupied')writeFileSync(join(dest,'keep.txt'),'keep');assert.throws(()=>initProfile(dest));assert.deepEqual(readdirSync(dest),name==='occupied'?['keep.txt']:[]);}
 const file=join(base,'file');writeFileSync(file,'keep');assert.throws(()=>initProfile(file));assert.equal(readFileSync(file,'utf8'),'keep');
});
test('initializer rejects relative, UNC spelling, project and Git-managed destinations',t=>{
 const base=sandbox(t);mkdirSync(join(base,'repo'));writeFileSync(join(base,'repo','.git'),'gitdir: elsewhere');
 for(const dest of ['relative-profile','//server/share/profile',join(project,'new-private-profile'),join(base,'repo','profile'),join(base,'missing','profile')])assert.throws(()=>initProfile(dest));
 assert.equal(existsSync(join(project,'new-private-profile')),false);
});
test('path errors describe syntax restrictions without asserting storage locality',()=>{
 for(const path of ['relative-profile','//server/share/profile','\\\\server\\share\\profile','\\/server/share/profile','/\\server/share/profile']){
  for(const check of [initProfile,privateDirectory])assert.throws(()=>check(path),{message:'ABSOLUTE_NON_UNC_PATH_REQUIRED'});
 }
});
test('initializer rejects directory junction/symlink ancestors',t=>{
 const base=sandbox(t),target=join(base,'real'),alias=join(base,'alias');mkdirSync(target);symlinkSync(target,alias,process.platform==='win32'?'junction':'dir');
 assert.throws(()=>initProfile(join(alias,'profile')));assert.deepEqual(readdirSync(target),[]);
});
test('draft check reads without changing register; drafts cannot be exported',t=>{
 const dest=instance(t),name=draft(dest),before=readFileSync(join(dest,'records.json'),'utf8');
 const report=inspectDraft(dest,name);assert.deepEqual(Object.keys(report),['candidate_ids']);assert.deepEqual(report.candidate_ids,['fictional-pref']);
 assert.equal(readFileSync(join(dest,'records.json'),'utf8'),before);
 assert.throws(()=>exportProfile(json(join(dest,'drafts',name)),{schema_version:'0.1.0',purpose:'Fictional task',allow_ids:[]},today()));
});
test('saving validates selected IDs without requiring approval or an earlier check',t=>{
 const dest=instance(t),name=draft(dest);
 for(const ids of [[],['missing'],['fictional-pref','fictional-pref']])assert.throws(()=>saveDraft({dest,draftName:name,ids}));
 assert.deepEqual(json(join(dest,'records.json')).entries,[]);
 assert.deepEqual(saveDraft({dest,draftName:name}),{saved_ids:['fictional-pref'],superseded_ids:[]});
 assert.equal(json(join(dest,'records.json')).entries[0].confirmation,'confirmed');
});
test('saving adds only selected entries and leaves notes, drafts and policy untouched',t=>{
 const dest=instance(t),name=draft(dest,[candidate(),{...candidate('fictional-other'),statement:'Fictional second preference.'}]);
 const paths=['export-policy.json','drafts/basic.json','domains/preferences.md'];const before=paths.map(p=>readFileSync(join(dest,p),'utf8'));
 save(dest,name);const entries=json(join(dest,'records.json')).entries;
 assert.equal(entries.length,1);assert.equal(entries[0].confirmation,'confirmed');assert.equal(entries[0].sensitivity,'private');
 paths.forEach((p,i)=>assert.equal(readFileSync(join(dest,p),'utf8'),before[i]));
 assert.deepEqual(exportProfile(json(join(dest,'records.json')),{schema_version:'0.1.0',purpose:'Fictional task',allow_ids:['fictional-pref']},today()).entries,[]);
});
test('saved inference retains its source kind and uncertainty in its wording',t=>{
 const dest=instance(t),e=candidate();e.source.kind='ai_inference';e.statement='Possibly enjoys fictional craft lessons; uncertain.';draft(dest,[e]);save(dest);
 const saved=json(join(dest,'records.json')).entries[0];assert.equal(saved.source.kind,'ai_inference');assert.equal(saved.statement,e.statement);assert.equal(saved.confirmation,'pending');
});
test('saving reads current draft and register without a stale approval ceremony',t=>{
 const dest=instance(t),name=draft(dest);inspectDraft(dest,name);
 const revised={...candidate(),statement:'Fictional person now prefers diagrams.'};draft(dest,[revised]);
 writeFileSync(join(dest,'records.json'),readFileSync(join(dest,'records.json'),'utf8')+'\n');
 saveDraft({dest,draftName:name});
 assert.equal(json(join(dest,'records.json')).entries[0].statement,revised.statement);
});
test('stale register replacement still refuses to overwrite concurrent edits',t=>{
 const dest=instance(t),path=join(dest,'records.json'),before=readFileSync(path,'utf8');
 writeFileSync(path,before+'\n');
 assert.throws(()=>replaceRegister(dest,before,before),{message:'REGISTER_CHANGED'});
 assert.equal(readFileSync(path,'utf8'),before+'\n');
 assert.equal(existsSync(join(dest,'.setup.lock')),false);
});
for(const [field,value] of [['confirmation','confirmed'],['sensitivity','general'],['sensitivity','public'],['sensitivity','sensitive'],['sensitivity','unknown'],['status','archived'],['updated','2999-01-01'],['domain','invented']])test('rejects unsafe draft '+field+'='+value,t=>{
 const dest=instance(t),e=candidate();e[field]=value;draft(dest,[e]);const before=readFileSync(join(dest,'records.json'),'utf8');assert.throws(()=>inspectDraft(dest,'basic.json'));assert.throws(()=>saveDraft({dest,draftName:'basic.json'}));assert.equal(readFileSync(join(dest,'records.json'),'utf8'),before);
});
test('missing metadata and malformed JSON fail without writes',t=>{
 const dest=instance(t),e=candidate();delete e.source;draft(dest,[e]);assert.throws(()=>inspectDraft(dest,'basic.json'));
 writeFileSync(join(dest,'drafts','basic.json'),'{broken');assert.throws(()=>inspectDraft(dest,'basic.json'));assert.deepEqual(json(join(dest,'records.json')).entries,[]);
});
test('explicit supersession preserves old source and unrelated records',t=>{
 const dest=instance(t);draft(dest);save(dest);const original=json(join(dest,'records.json')).entries[0];
 const replacement={...candidate('fictional-revised'),statement:'Fictional person now prefers diagrams.',supersedes:['fictional-pref']};draft(dest,[replacement],'change.json');save(dest,'change.json',['fictional-revised']);
 const entries=json(join(dest,'records.json')).entries;assert.equal(entries.length,2);assert.equal(entries[0].status,'superseded');assert.deepEqual(entries[0].source,original.source);assert.equal(entries[1].confirmation,'confirmed');
});
test('duplicate IDs and duplicate normalized statements are rejected',t=>{
 const dest=instance(t);draft(dest);save(dest);assert.throws(()=>save(dest));
 draft(dest,[{...candidate('another'),statement:'  FICTIONAL person prefers numbered craft steps.  '}],'duplicate.json');assert.throws(()=>inspectDraft(dest,'duplicate.json'));
 assert.equal(json(join(dest,'records.json')).entries.length,1);
});
test('multiple replacements for one old record are rejected',t=>{
 const dest=instance(t);draft(dest);save(dest);draft(dest,[{...candidate('first'),statement:'First change.',supersedes:['fictional-pref']},{...candidate('second'),statement:'Second change.',supersedes:['fictional-pref']}],'change.json');
 assert.throws(()=>inspectDraft(dest,'change.json'));
});
test('lock or existing temporary file blocks saving without clobbering files',t=>{
 const dest=instance(t);draft(dest);const before=readFileSync(join(dest,'records.json'),'utf8');
 for(const name of ['.setup.lock','.records.pending']){writeFileSync(join(dest,name),'keep');assert.throws(()=>save(dest));assert.equal(readFileSync(join(dest,name),'utf8'),'keep');assert.equal(readFileSync(join(dest,'records.json'),'utf8'),before);rmSync(join(dest,name));}
});
test('partial or invalid instance marker cannot be saved',t=>{
 const dest=instance(t);draft(dest);rmSync(join(dest,'.life-profile.json'));assert.throws(()=>save(dest));
 writeFileSync(join(dest,'.life-profile.json'),'{}');assert.throws(()=>save(dest));
});
test('draft names cannot traverse directories or select examples',t=>{
 const dest=instance(t);draft(dest);for(const name of ['../records.json',join(project,'examples','fictional','records.json'),'nested/basic.json'])assert.throws(()=>inspectDraft(dest,name));
});
test('linked register and draft files are refused',t=>{
 const dest=instance(t),name=draft(dest);const outside=join(sandbox(t),'outside.json');writeFileSync(outside,readFileSync(join(dest,'records.json')));rmSync(join(dest,'records.json'));linkSync(outside,join(dest,'records.json'));
 assert.throws(()=>save(dest));assert.deepEqual(json(outside).entries,[]);
 rmSync(join(dest,'records.json'));writeFileSync(join(dest,'records.json'),JSON.stringify({schema_version:'0.1.0',entries:[]}));
 const second=join(sandbox(t),'draft.json');writeFileSync(second,readFileSync(join(dest,'drafts',name)));rmSync(join(dest,'drafts',name));linkSync(second,join(dest,'drafts',name));assert.throws(()=>inspectDraft(dest,name));
});
test('CLI saves local user records directly without approval flags or a preliminary check',t=>{
 const dest=join(sandbox(t),'cli-profile');const run=args=>spawnSync(process.execPath,['tools/setup.mjs',...args],{cwd:project,encoding:'utf8'});
 const initialized=run(['init','--dest',dest]);assert.equal(initialized.status,0,initialized.stderr);draft(dest);
 const saved=run(['save','--dest',dest,'--draft','basic.json']);assert.equal(saved.status,0,saved.stderr);
 assert.deepEqual(JSON.parse(saved.stdout),{saved_ids:['fictional-pref'],superseded_ids:[]});
 assert.equal(json(join(dest,'records.json')).entries[0].confirmation,'confirmed');
 for(const args of [[],['init','--dest'],['init','--dest',dest,'--force'],['check-draft','--dest',dest,'--dest',dest,'--draft','basic.json'],['save','--dest',dest],['save','--draft','basic.json'],['save','--dest',dest,'--draft','basic.json','--approve','invented']])assert.notEqual(run(args).status,0);
});

test('direct user restatement can supersede identical inferred wording without approval',t=>{
 const dest=instance(t),inferred={...candidate(),source:{kind:'ai_inference',reference:'Fictional summary'}};
 draft(dest,[inferred]);saveDraft({dest,draftName:'basic.json'});
 const restated={...candidate('fictional-restated'),supersedes:[inferred.id]};
 draft(dest,[restated],'restated.json');saveDraft({dest,draftName:'restated.json'});
 const entries=json(join(dest,'records.json')).entries;
 assert.equal(entries[0].status,'superseded');assert.deepEqual(entries[0].source,inferred.source);
 assert.equal(entries[1].source.kind,'user_statement');assert.equal(entries[1].confirmation,'confirmed');
 assert.equal(entries[1].statement,inferred.statement);
});
