import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {scaleBarForDrawing,getScaleBarFromMatrix} from '../map-scale.mjs';
import {createManifold,normalizeManifoldAngle,rotateManifoldBy,manifoldQuantities} from '../manifold-utils.mjs';
import {manifoldConnectionPorts,generateLoopApproaches} from '../approach-routing.mjs';
const html=readFileSync(new URL('../rysunek.html',import.meta.url),'utf8');
const code=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1]||'';
test('main browser module parses',()=>{
 const source=code.replace(/^import\s+\{[^;]*;\s*/gm,'');
 assert.ok(source.length>30000);
 assert.doesNotThrow(()=>new Function(source));
});
test('exact workflow step order and matching panes',()=>{
 const tabs=[...html.matchAll(/data-tab="([^"]+)"/g)].map(x=>x[1]);
 const panes=[...html.matchAll(/data-pane="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(tabs,['drawing','rooms','zones','manifolds','loops','settings']);
 assert.deepEqual(panes,tabs);
});
test('no duplicate HTML ids and calibration UI present',()=>{
 const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length);
 for(const key of ['mapScale','mapScaleBar','showMeasurements','finishZone','cancelZone','workflowHint','loopAll'])
  assert.ok(ids.includes(key),key);
});
test('calibration dimension lines and room measurements are hidden by default',()=>{
 assert.ok(code.includes("if(showMeasurements||tools==='cx'||tools==='cy')"));
 assert.ok(code.includes("if(!showMeasurements||room.id!==selected"));
 assert.ok(code.includes("$('showMeasurements').onchange"));
 assert.ok(code.includes('showMeasurements=false'));
});
test('map scale also inserted into SVG export',()=>{
 assert.ok(code.includes('function appendSvgMapScale(clone)'));
 assert.ok(code.includes('appendSvgMapScale(clone);'));
});
test('v11 JSON and old-preview migration',()=>{
 assert.ok(code.includes('version:11,background:bg'));
 assert.ok(code.includes('j.version===11&&validLoopPreview'));
 assert.ok(code.includes('angle:normalizeManifoldAngle(m.angle??0)'));
});
test('100 m limit and 90 m warning without old UI strings',()=>{
 assert.ok(code.includes('MAX_LOOP_M=100,WARN_LOOP_M=90'));
 assert.ok(html.includes('100 m na pętlę'));
 assert.ok(!code.includes('ponad 80 m'));
});
test('generator enforces presence of fields and assigned manifold',()=>{
 assert.ok(code.includes('function validateGeneration('));
 assert.ok(code.includes('roomZones(r).length'));
 assert.ok(code.includes('Krok 4: przypisz każdą pętlę'));
});
test('map scale hidden until valid calibrated geometry',()=>{
 assert.equal(scaleBarForDrawing({sx:0,sy:.01,pixelsPerSourceX:2,pixelsPerSourceY:2}),null);
 assert.equal(getScaleBarFromMatrix({sx:.01,sy:.01,matrix:null}),null);
});
test('rotated screen horizontal metric uses Y of distorted image',()=>{
 const args={sx:.01,sy:.02,pixelsPerSourceX:2,pixelsPerSourceY:3};
 const h=scaleBarForDrawing({...args,rotation:0});
 const v=scaleBarForDrawing({...args,rotation:90});
 assert.equal(h.sourceAxis,'X');
 assert.equal(v.sourceAxis,'Y');
 assert.equal(h.metresPerScreenPixel,.005);
 assert.ok(Math.abs(v.metresPerScreenPixel-.02/3)<1e-12);
});
test('scale metric always equals graphic pixels times metres-per-pixel',()=>{
 for(const zoom of [1,2,4,8]){
  for(const rotation of [0,90,180,270]){
   const m=scaleBarForDrawing({sx:.012,sy:.022,rotation,
     pixelsPerSourceX:1.2*zoom,pixelsPerSourceY:1.4*zoom});
   assert.ok(m.pixels>0);
   assert.ok(Math.abs(m.pixels*m.metresPerScreenPixel-m.metres)<1e-10);
  }
 }
});
test('manifold rotates through four accepted right angles',()=>{
 const m=createManifold(1);assert.equal(m.angle,0);
 for(const expected of [90,180,270,0]){
  m.angle=rotateManifoldBy(m,90);assert.equal(m.angle,expected);
 }
 m.angle=rotateManifoldBy(m,-90);assert.equal(m.angle,270);
 assert.throws(()=>normalizeManifoldAngle(45));
});
test('manifold supply and return are different and move on rotation',()=>{
 const m={id:2,point:[150,150],angle:0};
 const original=manifoldConnectionPorts(m,.01,.02);
 m.angle=90;const changed=manifoldConnectionPorts(m,.01,.02);
 assert.notDeepEqual(original.supply,changed.supply);
 const separation=Math.hypot((changed.supply[0]-changed.return[0])*.01,
   (changed.supply[1]-changed.return[1])*.02);
 assert.ok(Math.abs(separation-.10)<1e-10);
});
test('draft approaches begin/end at rotated ports, not at same center',()=>{
 const layout={status:'schematic',supply:[[1.5,1.5],[2,1.5]],return:[[2,2],[1.8,1.8]]};
 const m={id:2,point:[70,70],angle:180};
 const r=generateLoopApproaches(layout,m,{sx:.01,sy:.01,obstacles:[]});
 const ports=manifoldConnectionPorts(m,.01,.01);
 assert.equal(r.status,'draft');
 assert.deepEqual(r.supply[0],ports.supply);
 assert.deepEqual(r.return.at(-1),ports.return);
});
test('manifold quantity defaults have not regressed',()=>{
 const rooms=[{heatingZones:[{settings:{manifold_id:2}},{settings:{manifold_id:2}}]}];
 const q=manifoldQuantities(rooms,{id:2,requestedSections:3,pumpGroup:false});
 assert.equal(q.sections,3);assert.equal(q.cabinetSections,5);
 assert.equal(q.euroconus,6);assert.equal(q.isolatingValves,2);
});

test('manifold icon occupies a compact 34x18 footprint instead of a large 76x38 cover',()=>{
 const begin=code.indexOf('// Compact red-outline manifold.');
 const end=code.indexOf("if(['rect','heatRect'].includes(tools)&&temp)",begin);
 assert.ok(begin>0&&end>begin);
 const block=code.slice(begin,end);
 assert.match(block,/x:-17,y:-9,width:34,height:18/);
 assert.doesNotMatch(block,/width:76|height:38|font-size':19/);
 assert.match(block,/label\.textContent='R'\+m\.id/);
 assert.doesNotMatch(block,/label\.textContent=.*m\.name/);
 const reduction=1-(34*18)/(76*38);
 assert.ok(reduction>.75);
});
test('manifold visual port coordinates are sourced from exact routing geometry',()=>{
 const begin=code.indexOf('// Compact red-outline manifold.');
 const end=code.indexOf("if(['rect','heatRect'].includes(tools)&&temp)",begin);
 const block=code.slice(begin,end);
 assert.match(block,/manifoldConnectionPorts\(m,sx,sy\)/);
 assert.match(block,/\['supply',ports\.supply/);
 assert.match(block,/\['return',ports\.return/);
 assert.match(block,/cx:pt\[0\],cy:pt\[1\]/);
 assert.match(block,/scale\(\$\{1\/sx\} \$\{1\/sy\}\) rotate/);
});
test('all four manifold orientations retain actual 10 cm port separation under nonuniform scale',()=>{
 for(const angle of [0,90,180,270]){
  const ports=manifoldConnectionPorts({id:2,point:[820,240],angle},.0125,.02);
  assert.ok(ports);
  const dx=(ports.supply[0]-ports.return[0])*.0125;
  const dy=(ports.supply[1]-ports.return[1])*.02;
  assert.ok(Math.abs(Math.hypot(dx,dy)-.10)<1e-9);
 }
});
