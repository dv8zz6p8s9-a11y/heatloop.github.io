import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const root=fileURLToPath(new URL('../',import.meta.url));
const manifestPath=path.join(root,'wdrozenie/manifest-2026-10-16.json');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
export async function buildManifest(){
 const common=['instrukcja.html','pomoc.html','materialy/HeatLoop_instrukcja_BETA.pdf'];
 const help=(await fs.readdir(path.join(root,'help'))).filter(x=>/\.(mjs|css)$/.test(x)).map(x=>'help/'+x);
 const beta=(await fs.readdir(path.join(root,'heatloop-b'))).filter(x=>/\.(html|js|mjs|css|webmanifest)$/.test(x)||x==='TESTY_PLATFORM.md').map(x=>'heatloop-b/'+x);
 const entries=[];
 async function add(host,source,target=source){const bytes=await fs.readFile(path.join(root,source));entries.push({host,source,target,bytes:bytes.length,sha256:digest(bytes)});}
 for(const source of [...common,...help,...beta])await add('github-pages',source);
 for(const source of [...common,...help])await add('heatloop-pl',source);
 await add('heatloop-pl','wdrozenie/strona-glowna/index.html','index.html');
 await add('heatloop-pl','wdrozenie/strona-glowna/bug-fix.html','bug-fix.html');
 entries.sort((a,b)=>(a.host+'/'+a.target).localeCompare(b.host+'/'+b.target,'en'));
 return {release:'heatloop-beta-2026-10-16-help4',status:'prepared-not-published',aiEnabled:false,knowledgeVersion:'2026-10-16.4',entries};
}
export async function prepareUpdate(out){
 const expected=JSON.parse(await fs.readFile(manifestPath,'utf8')),actual=await buildManifest();
 if(JSON.stringify(expected)!==JSON.stringify(actual))throw Error('Manifest jest nieaktualny. Wygeneruj go ponownie i zweryfikuj zmiany.');
 const dest=path.resolve(out);
 if(dest===root||root.startsWith(dest+path.sep)||['help','heatloop-b','wdrozenie','materialy'].some(dir=>dest===path.join(root,dir)||dest.startsWith(path.join(root,dir)+path.sep)))throw Error('Wybierz osobny pusty katalog wynikowy.');
 await fs.mkdir(dest,{recursive:true});if((await fs.readdir(dest)).length)throw Error('Katalog wynikowy musi być pusty; nie nadpisuję istniejących plików.');
 for(const item of actual.entries){const output=path.join(dest,item.host,item.target);await fs.mkdir(path.dirname(output),{recursive:true});await fs.copyFile(path.join(root,item.source),output);if(digest(await fs.readFile(output))!==item.sha256)throw Error('Błąd kopii: '+item.target);}
 await fs.writeFile(path.join(dest,'manifest.json'),JSON.stringify(actual,null,2)+'\n');
 await fs.copyFile(path.join(root,'wdrozenie/README_AKTUALIZACJA.md'),path.join(dest,'INSTRUKCJA_WDROZENIA.md'));
 return actual;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.includes('--manifest')){await fs.writeFile(manifestPath,JSON.stringify(await buildManifest(),null,2)+'\n');console.log('Zaktualizowano manifest.');}
 else{const at=process.argv.indexOf('--out');let out=at>=0?process.argv[at+1]:null;if(at>=0&&!out)throw Error('Podaj katalog po --out.');if(!out){await fs.mkdir(path.join(root,'.runtime'),{recursive:true});out=await fs.mkdtemp(path.join(root,'.runtime','aktualizacja-'));}const result=await prepareUpdate(out);console.log(JSON.stringify({out,files:result.entries.length,status:result.status}));}
}
