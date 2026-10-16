// Initial circuit planning, not pressure-loss or EN 1264 output verification.
export const newId=()=>globalThis.crypto?.randomUUID?.()||'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
export const floorRooms=state=>[...state.rooms,...state.polygons].filter(r=>r.heatingType!=='radiators');
export const numberPL=value=>{
 const s=String(value??'').trim().replace(',','.');
 return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN;
};
export const planDefaults=()=>({manifold:null,manifolds:[{id:'R1',supply:'10',return:'10',position:null}],maxLength:'80',dt:'5',pipe:'PEX 16',linked:false,assignments:[],loops:[],signature:null});
export const manifoldId=value=>value||'R1';
export const manifoldPoint=(plan,id)=>manifoldId(id)==='R1'?plan.manifold:plan.manifolds.find(m=>m.id===id)?.position;
export const loopLabel=loop=>manifoldId(loop.manifoldId)+'/P'+loop.section;
const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1000&&p.y>=0&&p.y<=700;
export function ensureRoomIds(state){
 const used=new Set();
 for(const r of [...state.rooms,...state.polygons]){
  if(typeof r.loopRoomId!=='string'||!r.loopRoomId||r.loopRoomId.length>100||used.has(r.loopRoomId))r.loopRoomId=newId();
  used.add(r.loopRoomId);
 }
}
export function normalizePlan(raw){
 const p=planDefaults();if(!raw||typeof raw!=='object')return p;
 p.manifold=point(raw.manifold)?{x:raw.manifold.x,y:raw.manifold.y}:null;
 if(Array.isArray(raw.manifolds)&&raw.manifolds.length){
  p.manifolds=raw.manifolds.slice(0,10).map(m=>({id:String(m?.id??'').slice(0,10),supply:String(m?.supply??'').slice(0,12),return:String(m?.return??'').slice(0,12),position:point(m?.position)?{x:m.position.x,y:m.position.y}:null}));
  p.manifolds=p.manifolds.filter((m,i,all)=>/^R(?:[1-9]|10)$/.test(m.id)&&all.findIndex(other=>other.id===m.id)===i);
  if(!p.manifolds.some(m=>m.id==='R1'))p.manifolds.unshift({id:'R1',supply:'10',return:'10',position:null});
  p.manifolds=[p.manifolds.find(m=>m.id==='R1'),...p.manifolds.filter(m=>m.id!=='R1')];
 }
 for(const key of ['maxLength','dt','pipe'])if(typeof raw[key]==='string')p[key]=raw[key].slice(0,40);
 p.linked=raw.linked===true;p.signature=typeof raw.signature==='string'?raw.signature:null;
 p.assignments=Array.isArray(raw.assignments)?raw.assignments.slice(0,200).map(a=>({manifoldId:manifoldId(a?.manifoldId),roomId:String(a?.roomId??'').slice(0,100),zone:String(a?.zone??'').slice(0,80),out:String(a?.out??'').slice(0,10),back:String(a?.back??'').slice(0,10),count:String(a?.count??'').slice(0,4)})):[];
 p.loops=Array.isArray(raw.loops)?raw.loops.slice(0,100).map(l=>({manifoldId:manifoldId(l?.manifoldId),id:String(l?.id??'').slice(0,100),roomId:String(l?.roomId??'').slice(0,100),section:l?.section,area:l?.area,heatingLength:l?.heatingLength,out:l?.out,back:l?.back,route:Array.isArray(l?.route)&&l.route.length<=20000&&l.route.every(point)?l.route.map(p=>({x:p.x,y:p.y})):[]})):[];
 return p;
}
export function prepareAssignments(state){
 const old=new Map(state.loopPlan.assignments.map(a=>[a.roomId,a]));
 state.loopPlan.assignments=floorRooms(state).map((r,i)=>old.get(r.loopRoomId)||{roomId:r.loopRoomId,manifoldId:'R1',zone:r.name+' ['+(i+1)+']',out:'5',back:'5',count:''});
}
export function sourceSignature(state){
 return JSON.stringify({rooms:floorRooms(state).map(r=>[r.loopRoomId,r.name,r.area,r.load,r.spacing,r.heatingType||'wet',r.points||null]),scale:state.scale,
  ...(state.loopPlan.manifolds.length>1?{manifolds:state.loopPlan.manifolds.map(m=>[m.id,manifoldPoint(state.loopPlan,m.id)]),distribution:state.loopPlan.assignments.map(a=>[a.roomId,manifoldId(a.manifoldId)])}:{}),manifold:state.loopPlan.manifold,assignments:state.loopPlan.assignments.map(a=>[a.roomId,a.out,a.back,a.count])});
}
export function settingsErrors(state){
 const p=state.loopPlan,errors=[],max=numberPL(p.maxLength),dt=numberPL(p.dt);
 if(!(max>=10&&max<=300))errors.push('Podaj limit długości pętli od 10 do 300 m, zgodny z wybranym systemem.');
 if(!(dt>0&&dt<=30))errors.push('Podaj różnicę temperatur wody większą od 0 i nie większą niż 30°C.');
 const mids=p.manifolds.map(m=>m.id);
 if(!mids.length||mids[0]!=='R1'||mids.length>10||new Set(mids).size!==mids.length||mids.some(id=>!/^R(?:[1-9]|10)$/.test(id)))errors.push('Nieprawidłowe oznaczenia rozdzielaczy.');
 for(const m of p.manifolds)if(![m.supply,m.return].every(v=>Number.isFinite(numberPL(v))&&numberPL(v)>=0&&numberPL(v)<=10000))errors.push(m.id+': podaj długości zasilania i powrotu od 0 do 10000 m.');
 if(!p.pipe.trim())errors.push('Podaj oznaczenie rury.');
 if(!floorRooms(state).length)errors.push('Dodaj pomieszczenie z ogrzewaniem podłogowym.');
 for(const room of floorRooms(state)){
  const a=p.assignments.find(a=>a.roomId===room.loopRoomId);
  if(!a){errors.push('Pobierz pomieszczenia do planu pętli.');continue;}
  if(!mids.includes(manifoldId(a.manifoldId)))errors.push(room.name+': wybierz istniejący rozdzielacz.');
  const out=numberPL(a.out),back=numberPL(a.back);
  if(!Number.isFinite(out)||!Number.isFinite(back)||out<0||back<0||out+back>=max)errors.push(room.name+': dojścia muszą być nieujemne i krótsze łącznie od limitu pętli.');
  if(a.count!==''&&(!/^\d+$/.test(a.count)||Number(a.count)<1||Number(a.count)>100))errors.push(room.name+': podaj całkowitą liczbę pętli 1–100 albo pozostaw automat.');
  if(!a.zone.trim())errors.push(room.name+': wpisz strefę sterowania.');
 }
 return [...new Set(errors)];
}
export function proposeLoops(state){
 const errors=settingsErrors(state);if(errors.length)return {errors,loops:[]};
 const loops=[],sections=new Map(),max=numberPL(state.loopPlan.maxLength);
 for(const room of floorRooms(state)){
  const a=state.loopPlan.assignments.find(a=>a.roomId===room.loopRoomId),out=numberPL(a.out),back=numberPL(a.back);
  const heating=room.area/(room.spacing/100)*1.1;
  const count=a.count===''?Math.max(1,Math.ceil(heating/(max-out-back))):Number(a.count);
  if(count>100||loops.length+count>100)return {errors:['Projekt przekracza obsługiwany limit 100 pętli.'],loops:[]};
  const mid=manifoldId(a.manifoldId);for(let i=0;i<count;i++){const section=(sections.get(mid)||0)+1;sections.set(mid,section);loops.push({id:newId(),manifoldId:mid,roomId:room.loopRoomId,section,area:room.area/count,heatingLength:heating/count,out,back,route:[]});}
 }
 return {errors:[],loops};
}
export function routeLength(points,scale){
 return points.slice(1).reduce((s,p,i)=>s+Math.hypot(p.x-points[i].x,p.y-points[i].y),0)*scale;
}
export function analyzeLoops(state){
 const p=state.loopPlan,errors=settingsErrors(state),rooms=floorRooms(state),rows=[],ids=new Set(),sections=new Set();
 if(!p.loops.length)errors.push('Wygeneruj propozycję podziału na pętle.');
 if(p.loops.length&&p.signature!==sourceSignature(state))errors.push('Dane projektu lub dojścia zmieniły się. Wygeneruj ponownie pętle i sprawdź trasy.');
 for(const loop of p.loops){
  const room=rooms.find(r=>r.loopRoomId===loop.roomId),a=p.assignments.find(a=>a.roomId===loop.roomId);
  if(!room||!a){errors.push('Pętla wskazuje usunięte pomieszczenie.');continue;}
  const mid=manifoldId(loop.manifoldId),sectionKey=mid+'/'+loop.section,m=manifoldPoint(p,mid);
  if(mid!==manifoldId(a.manifoldId)||!p.manifolds.some(m=>m.id===mid))errors.push('Pętla wskazuje nieprawidłowy rozdzielacz.');
  if(!loop.id||ids.has(loop.id)||!Number.isInteger(loop.section)||loop.section<1||loop.section>100||sections.has(sectionKey))errors.push('Nieprawidłowe lub powtórzone oznaczenie pętli / sekcji.');
  ids.add(loop.id);sections.add(sectionKey);
  if(![loop.area,loop.heatingLength,loop.out,loop.back].every(Number.isFinite)||loop.area<=0||loop.heatingLength<=0||loop.out<0||loop.back<0){errors.push('Nieprawidłowe parametry pętli.');continue;}
  const drawn=loop.route.length>0;
  let length=loop.heatingLength+loop.out+loop.back;
  if(drawn){
   if(!(state.scale>0)||!m||loop.route.length<3||!loop.route.every(point))errors.push('Trasa wymaga skali i rozdzielacza na rzucie.');
   else {
    const first=loop.route[0],last=loop.route.at(-1);
    if(Math.hypot(first.x-m.x,first.y-m.y)>0.01||Math.hypot(last.x-m.x,last.y-m.y)>0.01)errors.push('Trasa musi zaczynać się i kończyć na rozdzielaczu '+mid+'.');
    length=routeLength(loop.route,state.scale);if(!(length>0))errors.push('Narysowana trasa ma zerową długość.');
   }
  }
  if(length>numberPL(p.maxLength)+1e-6)errors.push(loopLabel(loop)+': długość przekracza ustawiony limit.');
  const power=loop.area*room.load,flow=power/(1.163*numberPL(p.dt));
  rows.push({...loop,room:room.name,zone:a.zone,technology:room.heatingType||'wet',length,power,flow,drawn});
 }
 for(const room of rooms){
  const area=rows.filter(l=>l.roomId===room.loopRoomId).reduce((s,l)=>s+l.area,0);
  if(Math.abs(area-room.area)>1e-6*Math.max(1,room.area))errors.push(room.name+': powierzchnia pętli nie pokrywa powierzchni pomieszczenia.');
 }
 return {errors:[...new Set(errors)],rows,totalLength:rows.reduce((s,r)=>s+r.length,0),power:rows.reduce((s,r)=>s+r.power,0),flow:rows.reduce((s,r)=>s+r.flow,0),estimated:rows.some(r=>!r.drawn)};
}
export function controlEntries(state,result){
 return floorRooms(state).map(room=>({manifoldId:manifoldId(state.loopPlan.assignments.find(a=>a.roomId===room.loopRoomId)?.manifoldId),room:room.name,zone:state.loopPlan.assignments.find(a=>a.roomId===room.loopRoomId)?.zone||'',loops:String(result.rows.filter(r=>r.roomId===room.loopRoomId).length)}));
}
