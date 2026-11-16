import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { initProfile, bindProfile, unbindProfile, storageStatus, selectedDirectory, boundDirectory, stop } from './setup-storage.mjs';
import { inspectDraft, saveDraft } from './setup-records.mjs';

import { legacyGuideNames, migrationCheck, retireGuide } from './legacy-migration.mjs';

export function run(args){
 const [command,...rest]=args;
 const expected={'migration-check':['--dest'],'retire-guide':['--dest','--guide','--sha256','--backup','--source-checkout','--source-commit'],bind:['--dest'],unbind:[],status:[],init:['--dest'],'check-draft':['--dest','--draft'],save:['--dest','--draft','--ids']}[command];
 if(!expected||rest.length%2!==0||rest.length>expected.length*2)stop('INVALID_ARGUMENTS');
 const options={};
 for(let i=0;i<rest.length;i+=2){
  if(!expected.includes(rest[i])||Object.hasOwn(options,rest[i])||!rest[i+1])stop('INVALID_ARGUMENTS');
  options[rest[i]]=rest[i+1];
 }
 if(command==='migration-check')return migrationCheck(options['--dest']??selectedDirectory());
 if(command==='retire-guide'){
  if(expected.some(key=>!options[key]))stop('INVALID_ARGUMENTS');
  return retireGuide({dest:options['--dest'],name:options['--guide'],digest:options['--sha256'],backup:options['--backup'],checkout:options['--source-checkout'],commit:options['--source-commit']});
 }
 if(command==='bind'){if(!options['--dest'])stop('INVALID_ARGUMENTS');return bindProfile(options['--dest']);}
 if(command==='unbind')return unbindProfile();
 if(command==='status'){
  const result=storageStatus(),files=legacyGuideNames(result.destination);
  return files.length ? {...result,legacyGuides:files,migration:'review-required'} : result;
 }
 if(command!=='init'){
  options['--dest']??=boundDirectory();
  if(!options['--dest']||!options['--draft'])stop('INVALID_ARGUMENTS');
 }
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
