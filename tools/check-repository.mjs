// Heuristic release hygiene checks; not a comprehensive data-loss prevention system.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const files=[];
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){
 if(['.git','node_modules'].includes(e.name)) continue;
 const p=resolve(dir,e.name);if(e.isSymbolicLink()) throw new Error('Unexpected symlink');
 if(e.isDirectory()) walk(p);else files.push(p);
}}
walk(root);
let links=0;const failures=[];
for(const p of files){
 const text=readFileSync(p,'utf8');
 if(p.endsWith('.json')){try{JSON.parse(text);}catch{failures.push(relative(root,p)+': invalid JSON');}}
 if(p.endsWith('.md')) for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  const target=m[1].split('#')[0];if(!target||/^https?:/.test(target)) continue;
  links++;const dest=resolve(dirname(p),decodeURIComponent(target));
  if(!existsSync(dest)||!statSync(dest).isFile()) failures.push(relative(root,p)+': broken local link');
 }
 // Deliberately only report locations, never matched secrets.
 const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[A-Z0-9]{16}\b/,/\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bsk-[A-Za-z0-9]{24,}\b/,/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /[A-Z]:\\Users\\[^\\\s]+/i];
 if(patterns.some(re=>re.test(text))) failures.push(relative(root,p)+': possible secret or personal identifier');
}
if(failures.length){process.stderr.write(failures.join('\n')+'\n');process.exitCode=1;}
else process.stdout.write(`Checked ${files.length} files and ${links} local Markdown links; JSON parses; heuristic secret/identifier scan found no matches.\n`);
