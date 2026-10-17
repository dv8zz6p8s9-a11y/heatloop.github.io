import {normalizePlan,ensureRoomIds} from './floor-loops.mjs?v=20261016-3';
import {normalizeBoiler} from './boiler-room.mjs';
import {normalizeControls} from './tech-controls.mjs?v=20261016-3';
import {rotationValue,normalizeWallGuides} from './drawing-tools.mjs';
export const projectFileLimit=25*1024*1024;
export const quoteInputIds=['qLoops','qFloorArea','qMilledArea','qFloorLength','qReserve','qPower','qDt','qVmax','qMaterial','qDiameter','qSupply','qReturn','qPump','qFittings','qLaborFloor','qLaborMilling','qLaborFeed','qLaborRadiator'];
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const point=p=>record(p)&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1000&&p.y>=0&&p.y<=700;
const room=r=>record(r)&&typeof r.name==='string'&&r.name.trim()&&Number.isFinite(r.area)&&r.area>0&&r.area<1e6&&Number.isFinite(r.load)&&r.load>0&&r.load<=1000&&Number.isFinite(r.spacing)&&r.spacing>=5&&r.spacing<=40;
function cleanRoom(r){return {name:r.name.slice(0,80),area:r.area,load:r.load,spacing:r.spacing,loopRoomId:typeof r.loopRoomId==='string'?r.loopRoomId.slice(0,100):undefined,heatingType:['radiators','wet','milled'].includes(r.heatingType)?r.heatingType:'wet'};}
function cleanQuote(raw,priceKeys){
 if(raw==null)return null;
 if(!record(raw)||raw.values!=null&&!record(raw.values)||raw.prices!=null&&!record(raw.prices))throw Error('Nieprawidłowe dane wyceny');
 const values={};
 for(const id of quoteInputIds){
  if(!Object.hasOwn(raw.values||{},id))continue;
  const value=raw.values[id];
  if(id==='qPump'){if(typeof value!=='boolean')throw Error('Nieprawidłowy wybór grupy pompowej');values[id]=value;continue;}
  if(typeof value!=='string'&&typeof value!=='number'||String(value).length>40)throw Error('Nieprawidłowe pole wyceny');
  values[id]=String(value);
 }
 if(values.qMaterial!==undefined&&!['alpex','pp','copper','steel'].includes(values.qMaterial))throw Error('Nieprawidłowy materiał rury');
 if(values.qDiameter!==undefined&&!/^[0-4]$/.test(values.qDiameter))throw Error('Nieprawidłowa średnica rury');
 const prices={};
 for(const [key,value]of Object.entries(raw.prices||{}))if((priceKeys.includes(key)||/^(?:manifold|cabinet)_R(?:[2-9]|10)$/.test(key))&&Number.isFinite(value)&&value>=0&&value<=10000000)prices[key]=value;
 return {values,prices,manifolds:Array.isArray(raw.manifolds)?raw.manifolds.slice(0,10).filter(record).map(m=>({id:String(m.id??'').slice(0,10),loops:String(m.loops??'').slice(0,4)})):undefined,laborUnitsVersion:raw.laborUnitsVersion===2?2:1,useProject:raw.useProject===true};
}
// Build a fresh, bounded state first. Never mutate the open project while validating a file.
export function normalizeProject(raw,{priceKeys=[]}={}){
 if(!record(raw)||raw.version!==1||!['rooms','polygons','pipes'].every(key=>Array.isArray(raw[key])))throw Error('Nieprawidłowy format projektu');
 if(raw.rooms.length+raw.polygons.length+raw.pipes.length>2000)throw Error('Projekt zbyt duży');
 if(raw.scale!=null&&!(Number.isFinite(raw.scale)&&raw.scale>0&&raw.scale<1000))throw Error('Nieprawidłowa skala projektu');
 let vertices=0;
 const geometry=(shape,min)=>{if(!record(shape)||!Array.isArray(shape.points)||shape.points.length<min||shape.points.length>20000) return false;vertices+=shape.points.length;return vertices<=100000&&shape.points.every(point);};
 if(!raw.rooms.every(room)||!raw.polygons.every(p=>room(p)&&geometry(p,3))||!raw.pipes.every(p=>geometry(p,2)))throw Error('Nieprawidłowe pomieszczenia lub punkty rysunku');
 let background=null;
 if(raw.background!=null){if(typeof raw.background!=='string'||raw.background.length>=28000000||!/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(raw.background))throw Error('Nieprawidłowy obraz rzutu');background=raw.background;}
 const next={rooms:raw.rooms.map(cleanRoom),polygons:raw.polygons.map(p=>({...cleanRoom(p),points:p.points.map(p=>({x:p.x,y:p.y}))})),pipes:raw.pipes.map(p=>({points:p.points.map(p=>({x:p.x,y:p.y}))})),radiators:[],scale:raw.scale??null,background,drawingRotation:rotationValue(raw.drawingRotation),wallGuides:normalizeWallGuides(raw.wallGuides),loopPlan:normalizePlan(raw.loopPlan),boiler:normalizeBoiler(raw.boiler),controls:normalizeControls(raw.controls),quote:cleanQuote(raw.quote,priceKeys)};
 if(raw.radiators!=null&&(!Array.isArray(raw.radiators)||raw.radiators.length>500))throw Error('Nieprawidłowa lista grzejników');
 next.radiators=(raw.radiators||[]).filter(r=>point(r)&&typeof r.room==='string'&&Number.isFinite(r.power)&&r.power>0&&r.power<=50000).map(r=>({x:r.x,y:r.y,room:r.room.slice(0,80),power:r.power}));
 ensureRoomIds(next);return next;
}
