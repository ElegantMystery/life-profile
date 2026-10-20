import { join } from 'node:path';
import { validate } from './profile.mjs';
import { privateInstance, readPrivateFile, replaceRegister, stop } from './setup-storage.mjs';

const day=()=>new Date().toISOString().slice(0,10);
const fingerprint=e=>e.domain+'\0'+e.statement.trim().replace(/\s+/g,' ').toLowerCase();

function load(dest,draftName){
 const root=privateInstance(dest);
 if(typeof draftName!=='string'||! /^[a-z][a-z0-9-]{0,63}\.json$/.test(draftName))stop('INVALID_DRAFT_NAME');
 const registerText=readPrivateFile(join(root,'records.json'));
 const draftText=readPrivateFile(join(root,'drafts',draftName));
 const register=JSON.parse(registerText),draft=JSON.parse(draftText);
 validate(register);
 if(!draft||Array.isArray(draft)||Object.keys(draft).length!==2||draft.draft_version!=='0.1.0'||!Array.isArray(draft.entries)||draft.entries.length===0)stop('INVALID_DRAFT_ENVELOPE');
 const known=new Map(register.entries.map(e=>[e.id,e]));const ids=new Set(),texts=new Set(),replaced=new Set();
 for(const e of draft.entries){
  if(!e||e.confirmation!=='pending'||e.status!=='active'||e.sensitivity!=='private')stop('UNSAFE_DRAFT_STATE');
  if(known.has(e.id)||ids.has(e.id))stop('DUPLICATE_ID');ids.add(e.id);
  // Validate the record shape first, using temporary retired copies of known targets.
  if(!Array.isArray(e.supersedes))stop('INVALID_SUPERSESSION');
  for(const id of e.supersedes){
   if(!known.has(id)||known.get(id).status!=='active'||replaced.has(id))stop('AMBIGUOUS_SUPERSESSION');
   replaced.add(id);
  }
  const retired=register.entries.map(old=>e.supersedes.includes(old.id)?{...old,status:'superseded'}:old);
  validate({schema_version:'0.1.0',entries:[...retired,e]});
  if(e.created>day()||e.updated>day())stop('FUTURE_DRAFT_DATE');
  const key=fingerprint(e);
  if(texts.has(key)||register.entries.some(old=>old.status==='active'&&!e.supersedes.includes(old.id)&&fingerprint(old)===key))stop('DUPLICATE_STATEMENT');
  texts.add(key);
 }
 return {root,registerText,register,draft};
}

export function inspectDraft(dest,draftName){
 const loaded=load(dest,draftName);
 return {candidate_ids:loaded.draft.entries.map(e=>e.id)};
}

export function saveDraft({dest,draftName,ids}){
 const loaded=load(dest,draftName);
 // No approval handshake: validate the current input and preserve concurrent-write guards.
 if(ids===undefined)ids=loaded.draft.entries.map(e=>e.id);
 if(!Array.isArray(ids)||ids.length===0||new Set(ids).size!==ids.length||ids.some(id=>!loaded.draft.entries.some(e=>e.id===id)))stop('EXPLICIT_KNOWN_IDS_REQUIRED');
 const chosen=loaded.draft.entries.filter(e=>ids.includes(e.id));
 const retired=new Set(chosen.flatMap(e=>e.supersedes));
 const entries=loaded.register.entries.map(e=>retired.has(e.id)?{...e,status:'superseded',updated:day()}:e);
 entries.push(...chosen.map(e=>({...e,confirmation:e.source.kind==='user_statement'?'confirmed':'pending',updated:day()})));
 const next={schema_version:'0.1.0',entries};validate(next);
 replaceRegister(loaded.root,loaded.registerText,JSON.stringify(next,null,2)+'\n');
 return {saved_ids:chosen.map(e=>e.id),superseded_ids:[...retired]};
}
