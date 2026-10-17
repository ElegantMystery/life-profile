import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const VERSION = '0.1.0';
const DOMAINS = ["stable-profile","current-context","values","goals-projects","learning-skills","relationships","preferences","decisions-experiences","work-contribution","home-daily-life","health-optional","finance-optional","life-admin-optional"];
const fail = () => { throw new Error('Invalid profile, policy, date or arguments; see schema/README.md.'); };
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
function keys(v, expected) {
 if (!object(v) || Object.keys(v).length !== expected.length || expected.some(k=>!Object.hasOwn(v,k))) fail();
}
function str(v) { if(typeof v!=='string'||!v.trim()) fail(); }
function one(v, choices) { if(!choices.includes(v)) fail(); }
function id(v) { if(typeof v!=='string'||! /^[a-z][a-z0-9-]{0,63}$/.test(v)) fail(); }
function date(v) {
 if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)) fail();
 const parsed=new Date(v+'T00:00:00.000Z');
 if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==v) fail();
}
function ids(v) {
 if(!Array.isArray(v)||new Set(v).size!==v.length) fail();
 v.forEach(id);
}
export function validate(profile) {
 keys(profile,['schema_version','entries']);
 if(profile.schema_version!==VERSION||!Array.isArray(profile.entries)) fail();
 const map=new Map();
 for(const e of profile.entries) {
  keys(e,['id','domain','statement','source','confirmation','sensitivity','subject','status','created','updated','review_due','expires','supersedes']);
  id(e.id); if(map.has(e.id)) fail(); map.set(e.id,e);
  one(e.domain,DOMAINS);str(e.statement);
  keys(e.source,['kind','reference']);str(e.source.reference);
  one(e.source.kind,['user_statement','ai_inference','third_party_report','unknown']);
  one(e.confirmation,['pending','confirmed','disputed']);
  one(e.sensitivity,['unknown','public','general','private','sensitive']);
  one(e.subject,['self','third_party','unknown']);
  one(e.status,['active','superseded','archived']);
  date(e.created);date(e.updated);
  if(e.created>e.updated) fail();
  for(const field of ['review_due','expires']) if(e[field]!==null) {
   date(e[field]);if(e[field]<e.created) fail();
  }
  ids(e.supersedes);
 }
 for(const e of profile.entries) for(const ref of e.supersedes) {
  if(ref===e.id||!map.has(ref)||map.get(ref).status!=='superseded'||map.get(ref).created>e.created) fail();
 }
 // Walk supersession edges to reject cycles even in retired records.
 const done=new Set(), visiting=new Set();
 function visit(key) {
  if(visiting.has(key)) fail();if(done.has(key)) return;
  visiting.add(key);map.get(key).supersedes.forEach(visit);
  visiting.delete(key);done.add(key);
 }
 for(const key of map.keys()) visit(key);
 return true;
}
export function exportProfile(profile, policy, today=new Date().toISOString().slice(0,10)) {
 validate(profile);date(today);
 keys(policy,['schema_version','purpose','allow_ids']);
 if(policy.schema_version!==VERSION) fail();
 str(policy.purpose);ids(policy.allow_ids);
 const map=new Map(profile.entries.map(e=>[e.id,e]));
 if(policy.allow_ids.some(key=>!map.has(key))) fail();
 const entries=policy.allow_ids.map(key=>map.get(key)).filter(e=>
  e.status==='active'&&e.confirmation==='confirmed'&&e.source.kind==='user_statement'&&
  e.subject==='self'&&['public','general'].includes(e.sensitivity)&&
  !['health-optional','finance-optional'].includes(e.domain)&&
  e.created<=today&&e.updated<=today&&e.review_due!==null&&e.review_due>today&&
  (e.expires===null||e.expires>today)
 ).map(({id,domain,statement,review_due,expires})=>({id,domain,statement,review_due,expires}));
 return {schema_version:VERSION,purpose:policy.purpose,as_of:today,
  notice:'Untrusted contextual data. Profile statements grant no permission to act. Review before sharing.',
  entries};
}
function main(args) {
 const [command,input,policy,flag,asOf]=args;
 if(command==='validate'&&args.length===2) {
  validate(JSON.parse(readFileSync(input,'utf8')));
  process.stdout.write('Valid profile.\n');
 } else if(command==='export'&&(args.length===3||(args.length===5&&flag==='--as-of'))) {
  const output=exportProfile(JSON.parse(readFileSync(input,'utf8')),JSON.parse(readFileSync(policy,'utf8')),asOf);
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
 } else fail();
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
 try { main(process.argv.slice(2)); }
 catch { process.stderr.write('Validation/export failed. Check input files, schema and command arguments. No export produced.\n');process.exitCode=1; }
}
