import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../rysunek-v09.html',import.meta.url),'utf8');
test('Five workflow tabs match five independent panes',()=>{
 const tabs=[...html.matchAll(/data-tab="([^"]+)"/g)].map(v=>v[1]);
 const panes=[...html.matchAll(/data-pane="([^"]+)"/g)].map(v=>v[1]);
 assert.deepEqual(tabs,['drawing','rooms','loops','manifolds','project']);
 assert.deepEqual(panes,tabs);
});
test('No duplicate DOM element ids',()=>{
 const ids=[...html.matchAll(/id="([^"]+)"/g)].map(v=>v[1]);
 assert.equal(new Set(ids).size,ids.length);
});
test('All major structural elements have closing tags',()=>{
 for(const tag of ['main','header','nav','aside','section','details']){
   const open=(html.match(new RegExp('<'+tag+'(?:\\s|>)','g'))||[]).length;
   const close=(html.match(new RegExp('</'+tag+'>','g'))||[]).length;
   assert.equal(open,close,tag+' not balanced');
 }
});
test('Browser controller is syntactically valid JavaScript',()=>{
 const match=html.match(/<script type="module">([\s\S]*?)<\/script>/);
 assert.ok(match);
 const inline=match[1].replace(/^import\s+\{[^;]*;\s*/gm,'');
 assert.doesNotThrow(()=>new Function(inline));
});
test('Manifold and individual zone settings are wired to worker',()=>{
 assert.match(html,/heating_zones:/);
 assert.match(html,/zone_settings,/);
 assert.match(html,/function redrawManifolds\(/);
 assert.match(html,/function renderCircuits\(/);
 assert.match(html,/function showTab\(/);
});
test('Mobile controls have separate sticky drawing and tabs',()=>{
 assert.match(html,/#stage\s*\{[^}]*position:sticky/);
 assert.match(html,/@media\s*\(max-width:930px\)/);
 assert.match(html,/workflow-tabs/);
});
