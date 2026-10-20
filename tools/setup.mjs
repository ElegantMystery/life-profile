import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { initProfile, stop } from './setup-storage.mjs';
import { inspectDraft, saveDraft } from './setup-records.mjs';

export function run(args){
 const [command,...rest]=args;
 const expected={init:['--dest'],'check-draft':['--dest','--draft'],save:['--dest','--draft','--ids']}[command];
 if(!expected||rest.length%2!==0||rest.length>expected.length*2)stop('INVALID_ARGUMENTS');
 const options={};
 for(let i=0;i<rest.length;i+=2){
  if(!expected.includes(rest[i])||Object.hasOwn(options,rest[i])||!rest[i+1])stop('INVALID_ARGUMENTS');
  options[rest[i]]=rest[i+1];
 }
 if(command!=='init'&&(!options['--dest']||!options['--draft']))stop('INVALID_ARGUMENTS');
 if(command==='init')return initProfile(options['--dest']);
 if(command==='check-draft')return inspectDraft(options['--dest'],options['--draft']);
 return saveDraft({dest:options['--dest'],draftName:options['--draft'],ids:options['--ids']?.split(',')});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{process.stdout.write(JSON.stringify(run(process.argv.slice(2)),null,2)+'\n');}
 catch(error){
  // Never print input contents, filesystem paths or native errors containing them.
  const code=/^[A-Z][A-Z_]+$/.test(error.message)?error.message:'SETUP_FAILED';
  process.stderr.write(code+': See docs/AI-SETUP.md. Inspect private files before retrying an interrupted write.\n');process.exitCode=1;
 }
}
