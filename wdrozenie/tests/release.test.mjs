import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {buildManifest,prepareUpdate,root} from '../prepare-update.mjs';
const stored=()=>fs.readFile(path.join(root,'wdrozenie/manifest-2026-10-16.json'),'utf8').then(JSON.parse);
test('Release manifest matches the current sources and separates the two hosts',async()=>{
 const manifest=await stored();assert.deepEqual(await buildManifest(),manifest);assert.equal(manifest.status,'prepared-not-published');assert.equal(manifest.aiEnabled,false);
 const github=manifest.entries.filter(x=>x.host==='github-pages'),landing=manifest.entries.filter(x=>x.host==='heatloop-pl');assert(!github.some(x=>x.target==='index.html'));assert(landing.some(x=>x.target==='index.html'&&x.source==='wdrozenie/strona-glowna/index.html'));
 for(const host of ['github-pages','heatloop-pl']){const entries=manifest.entries.filter(x=>x.host===host);assert.equal(new Set(entries.map(x=>x.target)).size,entries.length);for(const file of ['pomoc.html','instrukcja.html','materialy/HeatLoop_instrukcja_BETA.pdf','help/start.mjs','help/widget.mjs','help/engine.mjs','help/policy.mjs','help/language.mjs','help/knowledge.mjs','help/config.mjs','help/help.css'])assert(entries.some(x=>x.target===file),host+'/'+file);}
 for(const entry of manifest.entries)assert(!/server\/|tests\/|node_modules|\.env|backend\//.test(entry.target),entry.target);
});
test('Every local module import exists in its prepared host bundle',async()=>{
 const manifest=await stored();for(const host of ['github-pages','heatloop-pl']){const entries=manifest.entries.filter(x=>x.host===host),targets=new Set(entries.map(x=>x.target));for(const entry of entries.filter(x=>/\.(mjs|js)$/.test(x.target))){const text=await fs.readFile(path.join(root,entry.source),'utf8');for(const m of text.matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g)){if(!m[1].startsWith('.'))continue;const dependency=path.posix.normalize(path.posix.join(path.posix.dirname(entry.target),m[1].split('?')[0]));assert(targets.has(dependency),host+'/'+entry.target+' -> '+dependency);}}}
});
test('Prepared entry points contain help links and omit the owner name and personal email',async()=>{
 const landing=await fs.readFile(path.join(root,'wdrozenie/strona-glowna/index.html'),'utf8'),beta=await fs.readFile(path.join(root,'heatloop-b/index.html'),'utf8');
 assert(landing.includes('pomoc.html'));assert(beta.includes('../help/start.mjs'));for(const text of [landing,beta]){assert(!text.includes('sroczynski.rafal@gmail.com'));assert(!text.includes('Rafał Sroczyński'));}
 const help=await fs.readFile(path.join(root,'pomoc.html'),'utf8');assert(help.includes('Nie ogląda rzutu'));assert((await fs.readFile(path.join(root,'help/config.mjs'),'utf8')).includes('aiEndpoint=null'));
});
test('Staged copies match every SHA-256; repeated staging refuses overwriting; source directory is protected',async t=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'heatloop-release-'));t.after(()=>fs.rm(temp,{recursive:true,force:true}));const out=path.join(temp,'prepared'),manifest=await prepareUpdate(out);
 for(const entry of manifest.entries){const bytes=await fs.readFile(path.join(out,entry.host,entry.target));assert.equal(bytes.length,entry.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);}
 assert.deepEqual(JSON.parse(await fs.readFile(path.join(out,'manifest.json'),'utf8')),manifest);await assert.rejects(()=>prepareUpdate(out),/pusty/);await assert.rejects(()=>prepareUpdate(root),/osobny/);await assert.rejects(()=>prepareUpdate(path.join(root,'help','bad-output')),/osobny/);
});
