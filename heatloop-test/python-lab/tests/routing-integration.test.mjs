import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../rysunek.html',import.meta.url),'utf8');
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1]||'';
test('Main LAB contains controls for rendering circuits and manifold approaches',()=>{
 for(const id of ['loop','loopAll','showApproaches','routeSummary','plan'])
  assert.match(html,new RegExp('id="'+id+'"'));
});
test('Approach routing runs on real Python/Shapely results',()=>{
 assert.match(script,/function refreshApproaches\(/);
 assert.match(script,/generateLoopApproaches\(result\.layout,manifold/);
 assert.match(script,/r\.loop=d\.result;refreshApproaches\(\)/);
});
test('Draft approach is drawn with distinct dashed feed and return',()=>{
 assert.match(script,/function drawApproaches\(/);
 assert.match(script,/'stroke-dasharray':'9 6'/);
 assert.match(script,/drawApproaches\(z\)/);
});
test('Total visible loop length uses actual drawing and route lengths',()=>{
 assert.match(script,/result\.visual_heating_m=result\.layout\.drawn_m/);
 assert.match(script,/result\.visual_heating_m\+approach\.supply_m\+approach\.return_m/);
 assert.match(script,/result\.visual_total_m>80/);
});
test('JSON restore rebuilds manifold approach overlays',()=>{
 assert.match(script,/refreshApproaches\(\);scaleRead\(\);list\(\);render\(\)/);
 assert.match(script,/loopPreview:validLoopPreview/);
});
test('Cannot accidentally display unverified polygon geometry',()=>{
 assert.match(script,/if\(l\?\.status!==['"]experimental['"]\)continue/);
 assert.match(script,/if\(!showApproachRoutes\|\|p\?\.status!==['"]draft['"]\)return/);
});
test('Previous settings and new project confirmation survive integration',()=>{
 assert.match(html,/data-tab="settings"/);
 assert.match(html,/Czy chcesz utworzyć nowy projekt\?/);
});
test('Browser module has valid JavaScript syntax',()=>{
 const stripped=script.replace(/^import\s+\{[^;]+;\s*/gm,'');
 assert.doesNotThrow(()=>new Function(stripped));
});

test('LAB renders schematic preview from Python when strict geometry is rejected',()=>{
 assert.match(script,/\['experimental','schematic'\]\.includes\(l\?\.status\)/);
 assert.match(script,/'stroke-dasharray':'12 3'/);
 assert.match(script,/schematy '\+schematic/);
});
test('Schematic loop previews and their supply-return lines survive JSON storage',()=>{
 assert.match(script,/\['experimental','schematic','planned'\]\.includes\(layout\.status\)/);
 assert.match(script,/if\(\['experimental','schematic'\]\.includes\(layout\.status\)\)/);
 assert.match(script,/loopPreview:validLoopPreview/);
});
test('UI warns if full-area estimate exceeds 80m although schematic is shorter',()=>{
 assert.match(script,/result\.coverage_warning/);
 assert.match(script,/result\.full_area_estimate_m/);
});
