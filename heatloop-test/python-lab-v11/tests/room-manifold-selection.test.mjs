import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as roomEditor from '../room-editor.mjs';
import * as calibration from '../calibration-utils.mjs';
import * as manifolds from '../manifold-utils.mjs';
import * as routing from '../approach-routing.mjs';
import * as technical from '../technical-drawing.mjs';
import * as scale from '../map-scale.mjs';

const html=readFileSync(new URL('../rysunek.html',import.meta.url),'utf8');
const inline=html.match(/<script type="module">([\\s\\S]*?)<\\/script>/)?.[1]
 .replace(/^import\\s+\\{[^;]+;\\s*/gm,'');
const helpers={...roomEditor,...calibration,...manifolds,...routing,...technical,...scale};
class Element {
 constructor(tag='div'){
  this.tag=tag;this.children=[];this.value='';this.checked=false;this.hidden=false;
  this.textContent='';this.className='';this.dataset={};this.attrs={};
  this.styles={};this.style={setProperty:(k,v)=>{this.styles[k]=v}};
  this.classes=new Set();this.classList={
   toggle:(k,v)=>{if(v??!this.classes.has(k))this.classes.add(k);else this.classes.delete(k)},
   add:k=>this.classes.add(k),remove:k=>this.classes.delete(k)
  };
  this.listeners={};this.viewBox={baseVal:{x:0,y:0,width:1100,height:750}};
 }
 set innerHTML(s){if(s==='')this.children=[]}get innerHTML(){return ''}
 append(...v){this.children.push(...v)}appendChild(...v){this.append(...v)}
 setAttribute(k,v){
  this.attrs[k]=String(v);
  if(k==='viewBox'){const [x,y,width,height]=String(v).split(' ').map(Number);
   this.viewBox.baseVal={x,y,width,height}}
 }
 getAttribute(k){return this.attrs[k]}
 addEventListener(k,fn){this.listeners[k]=fn}
 getScreenCTM(){return {a:1,b:0,c:0,d:1,inverse(){return this}}}
 createSVGPoint(){return {x:0,y:0,matrixTransform(){return {x:this.x,y:this.y}}}}
 getBoundingClientRect(){return {width:900,height:614}}
 cloneNode(){const c=new Element(this.tag);c.children=this.children;return c}
 setPointerCapture(){}releasePointerCapture(){}
 click(){this.onclick?.()}
}
function startApp(){
 const elements=new Map();
 const $=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 for(const [id,value] of Object.entries({
  dimX:'4,70',dimY:'5,40',unitX:'m',unitY:'m',spacing:'.125',
  diam:'16',edge:'100',radius:'80',feed:'2',back:'2'
 }))$(id).value=value;
 const tabs=['drawing','rooms','zones','manifolds','loops','settings'].map(tab=>{
  const el=new Element('button');el.dataset.tab=tab;return el});
 const panes=tabs.map(tab=>{const el=new Element('section');el.dataset.pane=tab.dataset.tab;return el});
 const buttons=['rect','heatRect','heatPoly','select','placeManifold','pan'].map(tool=>{
  const el=new Element('button');el.dataset.tool=tool;return el});
 const document={getElementById:$,
  createElement:tag=>new Element(tag),
  createElementNS:(_,tag)=>new Element(tag),
  querySelectorAll:q=>q==='[data-tool]'?buttons:q==='#workflowTabs [data-tab]'?tabs:
   q==='#controls [data-pane]'?panes:[]};
 class Worker {constructor(){this.sent=[]}postMessage(q){this.sent.push(q)}}
 class Blob {constructor(parts){Blob.contents=String(parts[0])}}
 class FileReader {readAsText(file){this.result=file.text;this.onload?.()}}
 class Image {set src(url){this.naturalWidth=1100;this.naturalHeight=750;this.onload?.()}}
 class XMLSerializer {serializeToString(){return '<svg/>'}}
 const URL={createObjectURL:()=>'/testfile',revokeObjectURL:()=>{}};
 const args=['document','Worker','Blob','FileReader','URL','setTimeout','window','Image','XMLSerializer',...Object.keys(helpers)];
 const values=[document,Worker,Blob,FileReader,URL,()=>{},
  {confirm:()=>true,addEventListener(){}},Image,XMLSerializer,...Object.values(helpers)];
 const app=new Function(...args,inline+
  '\\nreturn {get:()=>({rooms,manifolds,selected,tools,activeTab,imageFit}),'+
  'tool,click,showTab,setImageFit:p=>{imageFit=p}};')(...values);
 return {app,$,Blob};
}

test('room chooser and mannequin manifold placement work without losing JSON fields',()=>{
 const {app,$,Blob}=startApp();
 $('sample').click();app.tool('rect');
 app.click([120,120]);app.click([370,420]);
 app.tool('rect');app.click([450,120]);app.click([780,520]);
 assert.equal(app.get().rooms.length,2);
 app.showTab('zones');
 assert.equal($('zoneRoomSelect').children.length,3);
 $('zoneRoomSelect').value='1';$('zoneRoomSelect').onchange();
 assert.equal(app.get().selected,1);assert.equal(app.get().tools,'heatRect');
 app.click([150,150]);app.click([310,310]);
 assert.equal(app.get().rooms[0].heatingZones.length,1);
 assert.equal(app.get().rooms[1].heatingZones.length,0);
 $('pickZoneRoom').click();
 assert.equal(app.get().tools,'select');
 app.click([560,210]);
 assert.equal(app.get().selected,2);
 assert.equal(app.get().tools,'heatRect');
 app.click([500,170]);app.click([700,420]);
 assert.equal(app.get().rooms[1].heatingZones.length,1);
 // Real scan contains all rooms but not corridor/mounting area on its right.
 app.setImageFit({x:100,y:100,width:700,height:500});
 app.showTab('manifolds');$('addManifold').click();
 assert.equal(app.get().tools,'placeManifold');
 assert.equal($('manifoldPlacementBanner').hidden,false);
 const canvas=$('plan');
 canvas.listeners.pointerdown({clientX:910,clientY:210,pointerId:1,preventDefault(){}});
 assert.deepEqual(app.get().manifolds[0].point,[910,210]);
 assert.equal($('manifoldPlacementBanner').hidden,true);
 assert.equal(app.get().tools,'select');
 const savedPosition=app.get().manifolds[0].point.slice();
 const card=$('manifoldList').children[0];
 const buttons=card.children.filter(el=>el.className==='buttons').flatMap(el=>el.children);
 const place=buttons.find(b=>String(b.textContent).includes('Ustaw na rysunku'));
 assert.ok(place);
 place.click();$('cancelManifoldPlacement').click();
 assert.deepEqual(app.get().manifolds[0].point,savedPosition);
 $('save').click();
 const saved=JSON.parse(Blob.contents);
 assert.equal(saved.version,11);
 assert.equal(saved.rooms.length,2);
 assert.equal(saved.rooms.reduce((n,r)=>n+r.heatingZones.length,0),2);
 assert.deepEqual(saved.manifolds[0].point,[910,210]);
 $('clear').click();
 assert.equal(app.get().rooms.length,0);
 $('jsonfile').onchange({target:{files:[{size:Blob.contents.length,text:Blob.contents}]}});
 assert.equal(app.get().rooms.length,2);
 assert.equal(app.get().rooms[0].heatingZones.length,1);
 assert.equal(app.get().rooms[1].heatingZones.length,1);
 assert.deepEqual(app.get().manifolds[0].point,[910,210]);
});

test('placement picker and status banner are available on v1.1.2 screen',()=>{
 const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size);
 for(const id of ['zoneRoomSelect','pickZoneRoom','zoneRoomStatus',
  'manifoldPlacementBanner','cancelManifoldPlacement'])assert.ok(ids.includes(id),id);
 assert.match(inline,/if\(tools==='placeManifold'\)\{placeManifoldAt\(p\);return;\}/);
 assert.match(inline,/allowedManifoldLocation\(point\)/);
});
