import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {mkdtempSync,realpathSync,mkdirSync,rmSync,readFileSync,writeFileSync,existsSync,symlinkSync,renameSync} from 'node:fs';
import {initProfile} from '../tools/setup-storage.mjs';
import {run} from '../tools/setup.mjs';

function fixture(t){
  const base=realpathSync(mkdtempSync(join(tmpdir(),'guide-migration-')));
  t.after(()=>rmSync(base,{recursive:true,force:true}));
  const root=join(base,'instance'),backup=join(base,'backup'),source=join(base,'source');
  mkdirSync(backup,{mode:0o700}); mkdirSync(source); initProfile(root);
  const git=(...args)=>execFileSync('git',['-C',source,...args],{encoding:'utf8'}).trim();
  git('init','-q');
  const commit=()=>{git('add','-A');git('-c','user.name=Fixture','-c','user.email=fixture','commit','-qm','fixture');return git('rev-parse','HEAD');};
  writeFileSync(join(source,'AGENTS.md'),'Fictional source');
  const incompatible=commit();
  for(const name of ['docs/INSTRUCTION-SOURCE.md','docs/guides/ASSISTANT-GUIDE.md']){
    mkdirSync(dirname(join(source,name)),{recursive:true});writeFileSync(join(source,name),'Fixture guidance');
  }
  const good=commit();
  const inspect=()=>run(['migration-check','--dest',root]);
  const retire=(file,rev=good)=>run(['retire-guide','--dest',root,'--guide',file.name,'--sha256',file.sha256,'--backup',backup,'--source-checkout',source,'--source-commit',rev]);
  return {root,backup,source,commit,incompatible,good,inspect,retire};
}

test('explicit reviewed retirement preserves data and permits exact rollback of custom guide bytes',t=>{
  const f=fixture(t);
  const before=f.inspect(); assert.equal(before.status,'no-known-legacy-guides');
  const name='notes/README.md',path=join(f.root,name),custom=Buffer.from('Custom restriction: never sync.\r\n');
  writeFileSync(path,custom);writeFileSync(join(f.root,'domains/basic.md'),'Fictional preference: concise answers');
  const state=()=>['domains/basic.md','.life-profile.json','SETUP-PROGRESS.md','export-policy.json','records.json','INDEX.md'].map(n=>readFileSync(join(f.root,n)));
  const data=state(); const report=f.inspect();
  assert.equal(report.status,'legacy-review-required'); assert.deepEqual(report.files.map(f=>f.name),[name]);
  assert.equal(JSON.stringify(report).includes('never sync'),false);
  const result=f.retire(report.files[0]);
  assert.deepEqual(f.inspect(),before);assert.deepEqual(state(),data);
  assert.deepEqual(readFileSync(join(f.backup,result.backupFile)),custom);
  writeFileSync(path,readFileSync(join(f.backup,result.backupFile)),{flag:'wx'});
  assert.deepEqual(f.inspect(),report);
  assert.throws(()=>f.retire(report.files[0]),{code:'EEXIST'});
  assert.deepEqual(readFileSync(path),custom);assert.deepEqual(state(),data);
});

test('unavailable, incompatible or linked source and stale review preserve the live guide',t=>{
  const f=fixture(t),path=join(f.root,'ASSISTANT-GUIDE.md');
  writeFileSync(path,'Old restrictions'); const [file]=f.inspect().files;
  for(const [rev,error] of [[f.incompatible,'INCOMPATIBLE_SOURCE_LAYOUT'],['0'.repeat(40),'SOURCE_UNAVAILABLE'],['main','FULL_SOURCE_COMMIT_REQUIRED']])
    assert.throws(()=>f.retire(file,rev),{message:error});
  const guide=join(f.source,'docs/guides/ASSISTANT-GUIDE.md');
  rmSync(guide);symlinkSync('../../AGENTS.md',guide);
  assert.throws(()=>f.retire(file,f.commit()),{message:'INCOMPATIBLE_SOURCE_LAYOUT'});
  writeFileSync(path,'Concurrent correction');
  assert.throws(()=>f.retire(file),{message:'LEGACY_GUIDE_CHANGED'});
  assert.equal(readFileSync(path,'utf8'),'Concurrent correction');
  assert.equal(existsSync(join(f.backup,file.name)),false);
  assert.throws(()=>f.retire({...file,name:'domains/basic.md'}),{message:'REVIEWED_GUIDE_REQUIRED'});
});

test('diagnosis fails closed for linked legacy paths and optional directory redirection',t=>{
  const f=fixture(t);
  symlinkSync('INDEX.md',join(f.root,'AGENTS.md'));
  assert.throws(f.inspect,{message:'UNSAFE_LEGACY_GUIDE'});
  rmSync(join(f.root,'AGENTS.md'));
  renameSync(join(f.root,'notes'),join(f.root,'old-notes'));
  symlinkSync('old-notes',join(f.root,'notes'),'dir');
  assert.throws(f.inspect,{message:'UNSAFE_OR_MISSING_DIRECTORY'});
});

// Exercise the documented connector transaction against real Git objects and
// a guarded ref, without using credentials or making a live GitHub request.
test('remote retirement and rollback preserve intervening data and reject a stale head',t=>{
  const {root}=fixture(t);
  const git=(args,input)=>execFileSync('git',['-C',root,'-c','user.name=Fixture','-c','user.email=fixture',...args],
    {input,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
  git(['init','-q','-b','profile']);
  writeFileSync(join(root,'ASSISTANT-GUIDE.md'),'Custom rule: local saves only');
  git(['add','.']);git(['commit','-qm','Legacy fixture']);
  const original=git(['rev-parse','HEAD']),ref='refs/heads/profile';
  const originalTree=git(['ls-tree',original]).split('\n');
  const guide=originalTree.find(e=>e.endsWith('\tASSISTANT-GUIDE.md'));
  assert.match(guide,/^100644 blob /);
  function proposed(parent,entries){
    const tree=git(['mktree'],entries.join('\n')+'\n');
    return git(['commit-tree',tree,'-p',parent,'-m','Reviewed migration']);
  }
  const without=lines=>lines.filter(line=>!line.endsWith('\tASSISTANT-GUIDE.md'));
  const stale=proposed(original,without(originalTree));
  writeFileSync(join(root,'domains/basic.md'),'Fictional concurrent note');
  git(['commit','-qam','Concurrent edit']);const current=git(['rev-parse','HEAD']);
  assert.throws(()=>git(['update-ref',ref,stale,original]));
  const curTree=git(['ls-tree',current]).split('\n'); assert.ok(curTree.includes(guide));
  const retired=proposed(current,without(curTree));
  git(['update-ref',ref,retired,current]);
  assert.deepEqual(git(['ls-tree',ref]).split('\n'),without(curTree));
  const restored=proposed(retired,[...without(curTree),guide]);
  git(['update-ref',ref,restored,retired]);
  assert.equal(git(['ls-tree',ref]),curTree.join('\n'));
});

test('refuses backup inside bare repository metadata before changing the live guide',t=>{
  const f=fixture(t),name='AGENTS.md',path=join(f.root,name);
  writeFileSync(path,'Fictional customized instructions');
  const [file]=f.inspect().files;
  execFileSync('git',['init','--bare','-q',f.backup]);
  const inside=join(f.backup,'objects','backup');mkdirSync(inside,{mode:0o700});
  assert.throws(()=>run(['retire-guide','--dest',f.root,'--guide',name,'--sha256',file.sha256,
    '--backup',inside,'--source-checkout',f.source,'--source-commit',f.good]),{message:'SEPARATE_PRIVATE_BACKUP_REQUIRED'});
  assert.equal(readFileSync(path,'utf8'),'Fictional customized instructions');
  assert.equal(existsSync(join(inside,name)),false);
});
