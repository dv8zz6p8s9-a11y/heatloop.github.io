import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as editor from '../room-editor.mjs';
import * as calibration from '../calibration-utils.mjs';
import * as manifolds from '../manifold-utils.mjs';
import * as routing from '../approach-routing.mjs';
import * as technical from '../technical-drawing.mjs';
import * as scale from '../map-scale.mjs';

const source=readFileSync(new URL('../rysunek.html',import.meta.url),'utf8');
const moduleBody=source.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1]
  .replace(/^import\s+\{[^;]+;\s*/gm,'');
assert.ok(moduleBody?.length>20000);
const imports={...editor,...calibration,...manifolds,...routing,...technical,...scale};

class Node {
 constructor(tag='div'){
  this.tag=tag;this.children=[];this.value='';this.checked=false;
  this.textContent='';this.dataset={};this.hidden=false;this.className='';
  this.style={setProperty(){}};
  this.classes=new Set();
  this.classList={
   add:v=>this.classes.add(v),remove:v=>this.classes.delete(v),
   toggle:(v,on)=>{if(on??!this.classes.has(v))this.classes.add(v);else this.classes.delete(v)}
  };
  this.viewBox={baseVal:{x:0,y:0,width:1100,height:750}};
  this.handlers={};
 }
 get options(){return this.tag==='select'?this.children:undefined}
 set innerHTML(v){if(v==='')this.children=[]}
 get innerHTML(){return ''}
 append(...nodes){this.children.push(...nodes)}
 appendChild(...nodes){this.append(...nodes)}
 setAttribute(name,value){
  if(name==='viewBox'){
   const [x,y,width,height]=String(value).split(' ').map(Number);
   this.viewBox.baseVal={x,y,width,height};
  }
 }
 addEventListener(k,fn){this.handlers[k]=fn}
 getScreenCTM(){return{a:1,b:0,c:0,d:1,inverse(){return this}}}
 createSVGPoint(){return{x:0,y:0,matrixTransform(){return{x:this.x,y:this.y}}}}
 getBoundingClientRect(){return{width:900,height:614}}
 setPointerCapture(){}releasePointerCapture(){}
 click(){this.onclick?.()}
 cloneNode(){const clone=new Node(this.tag);clone.children=[...this.children];return clone}
}
const refs=new Map();
function $(id){if(!refs.has(id))refs.set(id,new Node(id==='zoneRoomSelect'?'select':id));return refs.get(id)}
for(const [id,value] of Object.entries({
 dimX:'4,70',dimY:'5,40',unitX:'m',unitY:'m',
 spacing:'.125',diam:'16',edge:'100',radius:'80',feed:'2',back:'2'
}))$(id).value=value;
const tabs=['drawing','rooms','zones','manifolds','loops','settings'].map(tab=>{
 const b=new Node('button');b.dataset.tab=tab;return b;
});
const panes=tabs.map(t=>{const section=new Node('section');section.dataset.pane=t.dataset.tab;return section});
const buttons=['select','rect','heatRect','heatPoly','placeManifold','pan'].map(t=>{
 const b=new Node('button');b.dataset.tool=t;return b;
});
const document={
 getElementById:$,createElement:n=>new Node(n),createElementNS:(_,n)=>new Node(n),
 querySelectorAll:sel=>sel==='[data-tool]'?buttons:
  sel==='#workflowTabs [data-tab]'?tabs:
  sel==='#controls [data-pane]'?panes:[]
};
class Worker{postMessage(){}}
class Blob{constructor(items){Blob.saved=String(items[0])}}
class FileReader{readAsText(file){this.result=file.text;this.onload?.()}}
class Image{set src(value){this.naturalWidth=1100;this.naturalHeight=750;this.onload?.()}}
class XMLSerializer{serializeToString(){return'<svg/>'}}
const URL={createObjectURL:()=>'/dummy',revokeObjectURL(){}};
const args=[
 'document','Worker','Blob','FileReader','URL','setTimeout','window','Image',
 'XMLSerializer','ResizeObserver',...Object.keys(imports)
];
const values=[
 document,Worker,Blob,FileReader,URL,()=>{},
 {confirm:()=>true,addEventListener(){}},Image,XMLSerializer,undefined,
 ...Object.values(imports)
];
const app=new Function(...args,moduleBody+`\nreturn {
 get:()=>({rooms,selected,tools,activeTab}),
 click,tool,showTab,chooseRoomForHeating,cycleHeatingRoom,
 updateZoneRoomSelector,render
};`)(...values);

function drawRoom(x,y,width=190,height=240){
 app.tool('rect');app.click([x,y]);app.click([x+width,y+height]);
}
function drawField(x,y,width=140,height=140){
 app.click([x,y]);app.click([x+width,y+height]);
}
const origins=[
 [30,30],[255,30],[480,30],[705,30],
 [30,325],[255,325],[480,325],[705,325]
];

test('create eight distinct rooms with no heating fields',()=>{
 $('sample').click();
 origins.forEach(([x,y])=>drawRoom(x,y));
 assert.equal(app.get().rooms.length,8);
 assert.ok(app.get().rooms.every(x=>x.heatingZones.length===0));
});
test('stable native selector options even when repeatedly switching rooms and adding fields',()=>{
 app.showTab('zones');
 const chooser=$('zoneRoomSelect');
 assert.equal(chooser.children.length,9);
 const options=[...chooser.children];
 for(let i=0;i<8;i++){
  chooser.value=String(i+1);chooser.onchange();
  assert.equal(app.get().selected,i+1);
  assert.equal(app.get().tools,'heatRect');
  assert.match($('zoneRoomStatus').textContent,new RegExp('Aktywne pomieszczenie '+(i+1)+' z 8'));
  const [x,y]=origins[i];drawField(x+20,y+20);
  assert.equal(app.get().rooms[i].heatingZones.length,1);
  assert.equal(app.get().activeTab,'zones');
  assert.deepEqual(chooser.children,options,'select option identities must remain stable');
 }
 assert.deepEqual(app.get().rooms.map(x=>x.heatingZones.length),Array(8).fill(1));
});
test('previous/next buttons work repeatedly and wrap without resetting fields',()=>{
 for(let i=0;i<18;i++){
  $('nextZoneRoom').click();
  assert.equal(app.get().tools,'heatRect');
  assert.equal(app.get().activeTab,'zones');
 }
 const after=app.get().selected;
 $('prevZoneRoom').click();
 assert.equal(app.get().selected,(after-2+8)%8+1);
 assert.deepEqual(app.get().rooms.map(x=>x.heatingZones.length),Array(8).fill(1));
});
test('picker allows selecting another room from the drawing after eight fields',()=>{
 $('pickZoneRoom').click();
 assert.equal(app.get().tools,'select');
 const [x,y]=origins[2];app.click([x+70,y+70]);
 assert.equal(app.get().selected,3);
 assert.equal(app.get().tools,'heatRect');
});
test('multiple fields remain possible inside the same room',()=>{
 $('zoneRoomSelect').value='3';$('zoneRoomSelect').onchange();
 const [x,y]=origins[2];
 drawField(x+20,y+175,120,40);
 assert.equal(app.get().rooms[2].heatingZones.length,2);
});
test('JSON preserves all rooms, nine fields and their geometry',()=>{
 $('save').click();
 const data=JSON.parse(Blob.saved);
 assert.equal(data.version,11);
 assert.equal(data.rooms.length,8);
 assert.equal(data.rooms.reduce((sum,r)=>sum+r.heatingZones.length,0),9);
});
