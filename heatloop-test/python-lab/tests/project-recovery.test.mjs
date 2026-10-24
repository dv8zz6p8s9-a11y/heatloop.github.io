import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const html=readFileSync(new URL('rysunek-v091.html',root),'utf8');
const moduleScript=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
if(!moduleScript)throw Error('Module script missing');
const main=moduleScript.replace(/^import\s+\{[^;]*;\s*/gm,'');
const pure=['room-editor.mjs','calibration-utils.mjs','manifold-utils.mjs'].map(
 name=>readFileSync(new URL(name,root),'utf8').replaceAll('export function ','function ').replaceAll('export const ','const ')
).join('\n');
class MockElement {
 constructor(tag='div'){
  this.tag=tag;this.children=[];this._inner='';this.value='';this.checked=false;
  this.textContent='';this.dataset={};this.style={};this.className='';this.listeners={};
  this.viewBox={baseVal:{x:0,y:0,width:1100,height:750}};
  this.classList={toggle(){},add(){},remove(){}};
 }
 set innerHTML(v){this._inner=v;if(v==='')this.children=[]}
 get innerHTML(){return this._inner}
 append(...children){this.children.push(...children)}
 appendChild(...children){this.append(...children)}
 addEventListener(name,fn){this.listeners[name]=fn}
 setAttribute(name,value){
  if(name==='viewBox'){
   const [x,y,width,height]=String(value).split(' ').map(Number);
   this.viewBox.baseVal={x,y,width,height};
  }
 }
 getScreenCTM(){return{a:1,b:0,c:0,d:1,inverse(){return this}}}
 createSVGPoint(){return{x:0,y:0,matrixTransform(){return{x:this.x,y:this.y}}}}
 click(){this.onclick?.()}
}
class MockImage{set src(v){this._src=v;this.onload?.()}}
class MockFileReader{readAsText(f){this.result=f.text;this.onload?.()}}
class MockBlob{constructor(parts){MockBlob.latest=String(parts[0])}}
class MockWorker{
 constructor(){this.sent=[];MockWorker.latest=this}
 postMessage(value){this.sent.push(value)}
}
function setup(){
 const nodes=new Map();
 const get=id=>{if(!nodes.has(id))nodes.set(id,new MockElement(id));return nodes.get(id)};
 for(const [id,value] of Object.entries({
  dimX:'4,70',dimY:'5,40',unitX:'m',unitY:'m',spacing:'.20',diam:'16',edge:'100',radius:'80',feed:'2',back:'2'
 }))get(id).value=value;
 const tabs=['drawing','rooms','loops','manifolds','project'].map(name=>{let e=new MockElement();e.dataset.tab=name;return e});
 const panes=['drawing','rooms','loops','manifolds','project'].map(name=>{let e=new MockElement();e.dataset.pane=name;return e});
 const document={
  getElementById:get,createElementNS:(_,tag)=>new MockElement(tag),createElement:tag=>new MockElement(tag),
  querySelectorAll:q=>q.includes('workflowTabs')?tabs:q.includes('[data-pane]')?panes:[]
 };
 const controller=new Function('document','Worker','FileReader','Blob','Image','URL','setTimeout',
  pure+'\n'+main+'\nreturn {get:()=>({rooms,manifolds,bg,imageFit,sx,sy,ready,pendingRestoration}),tool,click};'
 )(document,MockWorker,MockFileReader,MockBlob,MockImage,
   {createObjectURL:()=>'/fake-blob',revokeObjectURL(){}},()=>{});
 const load=text=>get('jsonfile').onchange({target:{files:[{text,size:text.length}],value:'heatloop.json'}});
 return {controller,get,load};
}
const fixture={
 format:'HeatLoop-Drawing-LAB',version:8,
 background:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBApZ0uxsAAAAASUVORK5CYII=',
 imageFit:{x:0,y:0,width:1100,height:750},rotation:0,
 sx:.01,sy:.01,calLines:{cx:[[100,100],[570,100]],cy:[[100,100],[100,640]]},
 calAxes:{cx:'x',cy:'y'},known:{x:'4,70',y:'5,40',unitX:'m',unitY:'m'},
 defaults:{spacing_m:.125,feed_m:2,back_m:2,diam:'16',edge:'100',radius:'80'},
 manifolds:[{id:1,name:'R1',point:[50,50],requestedSections:0,type:'flowmeters',pumpGroup:false}],
 activeManifoldId:1,
 rooms:[{id:1,name:'Testowy pokój',points:[[100,100],[500,100],[500,500],[100,500]],
   shape:'rect',selectedZoneId:1,zoneSerial:1,implicitSettings:{spacing_m:.2,feed_m:2,back_m:2,manifold_id:null},
   heatingZones:[{id:1,shape:'rect',points:[[120,120],[400,120],[400,400],[120,400]],
     settings:{spacing_m:.125,feed_m:2,back_m:2,manifold_id:1}}]}]
};
test('Restore full v8 JSON: background, room, heating area, manifold and dimensions',()=>{
 const {controller,get,load}=setup();
 load(JSON.stringify(fixture));
 const state=controller.get();
 assert.equal(state.bg,fixture.background);
 assert.deepEqual(state.imageFit,fixture.imageFit);
 assert.equal(state.rooms.length,1);
 assert.equal(state.rooms[0].heatingZones.length,1);
 assert.equal(state.manifolds.length,1);
 assert.equal(state.rooms[0].heatingZones[0].settings.spacing_m,.125);
 assert.equal(state.sx,.01);
 assert.match(get('restoreSummary').textContent,/Odzyskano rysunek: TAK/);
});
test('Worker automatically recalculates missing old previews after Python ready',()=>{
 const {controller,load}=setup();
 load(JSON.stringify(fixture));
 assert.equal(controller.get().pendingRestoration,true);
 MockWorker.latest.onmessage({data:{kind:'ready',versions:'synthetic-test'}});
 assert.equal(MockWorker.latest.sent.filter(x=>x.kind==='analyze').length,1);
 assert.equal(MockWorker.latest.sent[0].payload.zone_settings[0].spacing_m,.125);
});
test('Bad imported file rolls back without removing working project',()=>{
 const {controller,load,get}=setup();
 load(JSON.stringify(fixture));
 const damaged=structuredClone(fixture);
 damaged.rooms[0].points[0]=[NaN,NaN];
 load(JSON.stringify(damaged));
 assert.equal(controller.get().rooms.length,1);
 assert.equal(controller.get().bg,fixture.background);
 assert.match(get('restoreSummary').textContent,/Dotychczasowa praca została zachowana/);
 load(JSON.stringify(fixture));
 assert.equal(controller.get().rooms.length,1);
 assert.match(get('restoreSummary').textContent,/Odzyskano rysunek/);
});
test('Save and load a verified loop preview without requiring new calculation',()=>{
 const {controller,get,load}=setup();
 load(JSON.stringify(fixture));
 MockWorker.latest.onmessage({data:{kind:'ready',versions:'synthetic-test'}});
 const request=MockWorker.latest.sent.find(x=>x.kind==='analyze');
 MockWorker.latest.onmessage({data:{kind:'result',seq:request.seq,result:{
   layout:{status:'planned',kind:'none',message:'Test geometry',installation_ready:false},
   zone_results:[{index:0,spacing_m:.125,checked_length_m:24.5,over_80m:false,
     layout:{status:'planned',kind:'none',message:'Test geometry',installation_ready:false}}],
   estimate_m:24.5
 }}});
 get('save').click();
 const saved=JSON.parse(MockBlob.latest);
 assert.equal(saved.version,9);
 assert.equal(saved.rooms[0].loopPreview.zone_results.length,1);
 get('clear').click();
 load(JSON.stringify(saved));
 assert.equal(controller.get().rooms.length,1);
 assert.equal(controller.get().rooms[0].loop.zone_results.length,1);
 assert.equal(controller.get().pendingRestoration,false);
});
