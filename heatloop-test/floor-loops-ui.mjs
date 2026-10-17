import {prepareAssignments,sourceSignature,proposeLoops,analyzeLoops,routeLength,manifoldId,manifoldPoint,loopLabel,settingsErrors,newId,floorRooms} from './floor-loops.mjs?v=20261017-approach-review-1';
import {generateMeander,generateSpiral,suggestApproach,rightAnglePath,rectangularInsetArea} from './loop-generator.mjs?v=20261017-recovery-1';

export function mountLoopPlanner(state,api){
 const $=id=>document.getElementById(id),format=n=>Number.isFinite(n)?n.toLocaleString('pl-PL',{maximumFractionDigits:2}):'—';
 let active=null,selected='R1',approachRoomId=null,lastSavedApproachRoomId=null,editingLoopId=null,dragRoute=null;
 function status(result){
  $('pStatus').replaceChildren();
  const p=document.createElement('p');p.textContent=result.rows.length+' pętli · '+format(result.totalLength)+' m · '+format(result.power)+' W · '+format(result.flow)+' l/h'+(result.estimated?' · długości częściowo lub w całości szacowane':'');$('pStatus').append(p);
  for(const error of result.errors){const e=document.createElement('p');e.className='warning';e.textContent=error;$('pStatus').append(e)}
  $('pExport').disabled=!!result.errors.length;
 }
 function showResult(){
  const result=analyzeLoops(state);status(result);$('pLoops').replaceChildren();
  for(const row of result.rows){
   const tr=document.createElement('tr');
   for(const value of [loopLabel(row),row.room+' / '+row.zone,format(row.area),format(row.length),format(row.power),format(row.flow),format(row.flow/60),row.drawn?(row.approachVerified===false?'Automatyczna — dojście do weryfikacji':'Narysowana (z dojściami)'):'Szacunek (z dojściami)']){const td=document.createElement('td');td.textContent=value;tr.append(td)}
   const td=document.createElement('td'),draw=document.createElement('button');draw.type='button';draw.textContent=row.drawn?'Rysuj ponownie':'Rysuj';draw.setAttribute('aria-label','Rysuj pętlę R1/P'+row.section);
   draw.onclick=()=>{
    const m=manifoldPoint(state.loopPlan,row.manifoldId);if(!m||!(state.scale>0))return alert('Najpierw ustaw skalę i wskaż rozdzielacz '+manifoldId(row.manifoldId)+' na rzucie.');
    if(state.loopPlan.signature!==sourceSignature(state))return alert('Dane zmieniły się. Wygeneruj ponownie propozycję pętli.');
    active=row.id;api.startRoute(m);api.openDrawing();
   };td.append(draw);
   if(row.drawn){const clear=document.createElement('button');clear.type='button';clear.textContent='Usuń trasę';clear.onclick=()=>{if(!confirm('Usunąć trasę i wrócić do szacowanej długości?'))return;state.loopPlan.loops.find(l=>l.id===row.id).route=[];api.render()};td.append(clear)}
   if(row.drawn){const edit=document.createElement('button');edit.type='button';edit.textContent='Przesuń punkty';edit.onclick=()=>{editingLoopId=row.id;dragRoute=null;api.startRouteEdit();api.openDrawing();alert('Przeciągaj kolorowe punkty trasy tej pętli. Rozdzielacz pozostaje nieruchomy. Po korekcie sprawdź przejścia przez ściany i długość pętli.');};td.append(edit)}
   tr.append(td);$('pLoops').append(tr);
  }
 }
 function refresh(){
  prepareAssignments(state);
  for(const [id,key] of [['pMax','maxLength'],['pDt','dt'],['pPipe','pipe']])$(id).value=state.loopPlan[key];
  $('pLinked').checked=state.loopPlan.linked;
  if(!state.loopPlan.manifolds.some(m=>m.id===selected))selected='R1';
  $('pSelect').replaceChildren();
  for(const m of state.loopPlan.manifolds){const option=document.createElement('option');option.value=m.id;option.textContent=m.id;$('pSelect').append(option)}$('pSelect').value=selected;
  const current=state.loopPlan.manifolds.find(m=>m.id===selected);$('pSupply').value=current.supply;$('pReturn').value=current.return;
  $('pRemove').disabled=selected==='R1';$('pAdd').disabled=state.loopPlan.manifolds.length>=10;
  $('pManifold').textContent=state.loopPlan.manifolds.map(m=>m.id+': '+(manifoldPoint(state.loopPlan,m.id)?'wskazany na rzucie':'bez punktu na rzucie')).join(' · ')+'. Dojścia pętli i zasilanie od źródła podaj osobno.';
  $('pRooms').replaceChildren();
  for(const a of state.loopPlan.assignments){
   const room=[...state.rooms,...state.polygons].find(r=>r.loopRoomId===a.roomId),tr=document.createElement('tr'),td=document.createElement('td');td.textContent=room?.name||'Usunięte';
   if(room){
    const approachButton=document.createElement('button');approachButton.type='button';approachButton.textContent=a.approachConfirmed&&a.approach?.length?'Edytuj zatwierdzone dojście ('+a.approach.length+' punktów)':'Wskaż i zatwierdź przejście przez drzwi';
    approachButton.onclick=()=>{if(!(state.scale>0)||!manifoldPoint(state.loopPlan,manifoldId(a.manifoldId)))return alert('Najpierw skalibruj rzut i wskaż rozdzielacz.');approachRoomId=a.roomId;api.startApproach(a.approach||[]);api.openDrawing();alert('Wskaż punkty trasy od rozdzielacza przez korytarz i drzwi do środka pomieszczenia '+room.name+'. Ostatni punkt musi być WEWNĄTRZ pomieszczenia. Następnie kliknij „Zakończ obrys / trasę”. Generator nie wykrywa ścian automatycznie.');};
    td.append(document.createElement('br'),approachButton);
    for(const [label,value,callback] of [
    ['Odsunięcie od ścian (cm)',a.offsetCm??'10',v=>{a.offsetCm=v;}],
    ['Rozstaw rur (cm)',String(room.spacing),v=>{room.spacing=Number(v);}]
   ]){const l=document.createElement('label'),input=document.createElement('input');l.textContent=label+' ';input.type='text';input.inputMode='decimal';input.value=value;input.style.width='75px';input.setAttribute('aria-label',label+' — '+room.name);input.onchange=()=>{
    const n=Number(input.value.trim().replace(',','.'));
    if(!Number.isFinite(n)||(label.startsWith('Odsunięcie')?(n<0||n>100):(n<5||n>40))){alert('Podaj prawidłową wartość: odsunięcie 0–100 cm, rozstaw 5–40 cm.');refresh();return;}
    callback(label.startsWith('Odsunięcie')?String(n):n);api.render();
   };l.append(input);td.append(document.createElement('br'),l);}
    const heated=rectangularInsetArea(room,Number(a.offsetCm??'10'),state.scale);
    if(heated!==null){const note=document.createElement('small');note.textContent='Powierzchnia grzewcza (orientacyjna): '+format(heated)+' m² / pomieszczenie '+format(room.area)+' m²';td.append(document.createElement('br'),note);}
   }tr.append(td);
   const mc=document.createElement('td'),select=document.createElement('select');select.setAttribute('aria-label','Rozdzielacz — '+room?.name);
   for(const m of state.loopPlan.manifolds){const o=document.createElement('option');o.value=m.id;o.textContent=m.id;select.append(o)}select.value=manifoldId(a.manifoldId);select.onchange=()=>{a.manifoldId=select.value;showResult();api.changed()};mc.append(select);tr.append(mc);
   for(const [key,label] of [['zone','Strefa'],['out','Dojście zasilania'],['back','Dojście powrotu'],['count','Liczba pętli']]){
    const cell=document.createElement('td'),input=document.createElement('input');input.value=a[key];input.type='text';input.maxLength=key==='zone'?80:10;if(key!=='zone')input.inputMode=key==='count'?'numeric':'decimal';input.setAttribute('aria-label',label+' — '+room?.name);
    input.oninput=()=>{a[key]=input.value;showResult();api.changed()};cell.append(input);tr.append(cell);
   }$('pRooms').append(tr);
  }showResult();
 }
 for(const [id,key] of [['pMax','maxLength'],['pDt','dt'],['pPipe','pipe']])$(id).oninput=()=>{state.loopPlan[key]=$(id).value;showResult();api.changed()};
 $('pSelect').onchange=()=>{selected=$('pSelect').value;active=null;refresh()};
 $('pAdd').onclick=()=>{if(state.loopPlan.manifolds.length>=10)return;const id=Array.from({length:10},(_,i)=>'R'+(i+1)).find(id=>!state.loopPlan.manifolds.some(m=>m.id===id));state.loopPlan.manifolds.push({id,supply:'10',return:'10',position:null});selected=id;active=null;api.render()};
 $('pRemove').onclick=()=>{if(selected==='R1')return;if(state.loopPlan.assignments.some(a=>manifoldId(a.manifoldId)===selected))return alert('Najpierw przypisz pomieszczenia tego rozdzielacza do innego.');if(state.loopPlan.loops.some(l=>manifoldId(l.manifoldId)===selected))return alert('Najpierw wygeneruj ponownie pętle po zmianie przypisań.');state.loopPlan.manifolds=state.loopPlan.manifolds.filter(m=>m.id!==selected);selected='R1';active=null;api.render()};
 for(const [id,key] of [['pSupply','supply'],['pReturn','return']])$(id).oninput=()=>{state.loopPlan.manifolds.find(m=>m.id===selected)[key]=$(id).value;showResult();api.changed()};
 $('pPlace').onclick=()=>{api.placeManifold();api.openDrawing()};
 $('pGenerate').onclick=()=>{
  prepareAssignments(state);
  if(state.loopPlan.loops.length&&!confirm('Zastąpić obecny podział? Narysowane trasy zostaną usunięte.'))return;
  const result=proposeLoops(state);if(result.errors.length){status({...result,rows:[],totalLength:0,power:0,flow:0});return;}
  state.loopPlan.loops=result.loops;state.loopPlan.signature=sourceSignature(state);active=null;api.render();
 };
 $('pGenerateRoutes').onclick=()=>{
  prepareAssignments(state);
  const selectedStart=window.__heatloopSpiralStart;
  if(!selectedStart?.roomId)return alert('Oznacz początek ślimaka w wybranym pomieszczeniu.');
  if(state.loopPlan.loops.some(l=>l.roomId===selectedStart.roomId)&&!confirm('Zastąpić pętle tylko w wybranym pomieszczeniu?'))return;
  const errors=settingsErrors(state);if(errors.length){alert(errors.join('\n'));return;}
  if(!(state.scale>0)){alert('Najpierw skalibruj rzut.');return;}
  const retained=state.loopPlan.loops.filter(l=>l.roomId!==selectedStart.roomId);
  const generated=[],sections=new Map(),areas=[],warnings=[];
  for(const l of retained)sections.set(manifoldId(l.manifoldId),Math.max(sections.get(manifoldId(l.manifoldId))||0,l.section));
  try{
   for(const room of floorRooms(state).filter(r=>r.loopRoomId===selectedStart.roomId)){
    const a=state.loopPlan.assignments.find(x=>x.roomId===room.loopRoomId);
    const mid=manifoldId(a.manifoldId),m=manifoldPoint(state.loopPlan,mid);
    let result;
    const connected=a.approachConfirmed&&a.approach?.length;
    if(!m)throw Error(room.name+': ustaw rozdzielacz na rzucie.');
    // Propozycja dojścia nie jest zatwierdzonym przejściem przez drzwi.
    const approach=connected?a.approach:rightAnglePath(suggestApproach(room,m));
    if(!connected)warnings.push(room.name+': automatyczne dojście jest tylko propozycją; sprawdź ściany i drzwi w kroku 7.');
    const marker=window.__heatloopSpiralStart;
    let spiralRoom=room;
    if(marker?.roomId===room.loopRoomId&&room.points?.length===4){
     const corners=room.points,nearest=corners.reduce((best,p,i)=>Math.hypot(p.x-marker.x,p.y-marker.y)<Math.hypot(corners[best].x-marker.x,corners[best].y-marker.y)?i:best,0);
     spiralRoom={...room,points:[...corners.slice(nearest),...corners.slice(0,nearest)]};
    }
    try{result=generateSpiral(spiralRoom,{scale:state.scale,offsetCm:Number(a.offsetCm??'10'),spacingCm:room.spacing,maxMeters:Number(state.loopPlan.maxLength),manifold:m,approach});}
    catch(error){throw Error(room.name+': '+error.message)}
    if(result.approximate)warnings.push(room.name+': podział wielokąta na '+result.parts+' prostokątne obszary jest orientacyjny; sprawdź pokrycie rurami i przebieg dojść.');
    areas.push(room.name+': '+format(result.heatedArea)+' m² grzewcze / '+format(room.area)+' m² pomieszczenia');
    const stripesTotal=result.routes.reduce((sum,x)=>sum+x.stripes,0);
    let areaAssigned=0;
    for(let i=0;i<result.routes.length;i++){
     const item=result.routes[i],section=(sections.get(mid)||0)+1;sections.set(mid,section);
     const assigned=i===result.routes.length-1?room.area-areaAssigned:room.area*item.stripes/stripesTotal;areaAssigned+=assigned;
     const route=item.route;
     const heatingLength=Math.max(0.01,routeLength(route.slice(1,-1),state.scale));
     generated.push({id:newId(),manifoldId:mid,roomId:room.loopRoomId,section,area:assigned,heatingLength,out:0,back:0,route,approachVerified:!!connected});
    }
   }
   if(generated.length>100)throw Error('Generator przekracza limit 100 pętli.');
  }catch(err){alert('Nie wygenerowano tras. '+err.message+'\nDotychczasowy projekt pozostaje bez zmian.');return;}
  state.loopPlan.loops=[...retained,...generated];state.loopPlan.signature=sourceSignature(state);state.loopPlan.linked=false;active=null;editingLoopId=null;
  api.render();alert('Wygenerowano '+generated.length+' tras spiralnych.\n'+areas.join('\n')+(warnings.length?'\nUWAGI:\n'+warnings.join('\n'):'')+'\nTo wersja testowa. Sprawdź ręcznie ściany, dojścia i długości przed realizacją.');
 };
 $('pLinked').onchange=()=>{
  const result=analyzeLoops(state);if($('pLinked').checked&&result.errors.length){$('pLinked').checked=false;return alert('Popraw plan pętli przed powiązaniem z wyceną.');}
  state.loopPlan.linked=$('pLinked').checked;api.render();
 };
 $('pExport').onclick=()=>{const r=analyzeLoops(state);if(r.errors.length)return;api.exportCsv([['Sekcja','Pomieszczenie','Strefa','Rura','Powierzchnia m2','Dlugosc m z dojsciami','Moc W','Przeplyw l/h','Przeplyw l/min','Zrodlo dlugosci'],...r.rows.map(l=>[loopLabel(l),l.room,l.zone,state.loopPlan.pipe,l.area,l.length,l.power,l.flow,l.flow/60,l.drawn?'Narysowana':'Szacunek'])])};
 refresh();
 return {refresh,active:()=>active,
  beginRouteDrag(pos){
   const loop=state.loopPlan.loops.find(l=>l.id===editingLoopId);if(!loop?.route?.length)return false;
   let index=-1,best=18;
   for(let i=1;i<loop.route.length-1;i++){const p=loop.route[i],d=Math.hypot(p.x-pos.x,p.y-pos.y);if(d<best){best=d;index=i}}
   if(index<0)return false;dragRoute={id:loop.id,index,original:loop.route.map(p=>({...p}))};return true;
  },
  moveRouteDrag(pos){if(!dragRoute)return false;const loop=state.loopPlan.loops.find(l=>l.id===dragRoute.id);if(!loop)return false;loop.route[dragRoute.index]={x:Math.max(0,Math.min(1000,pos.x)),y:Math.max(0,Math.min(700,pos.y))};return true;},
  endRouteDrag(){if(!dragRoute)return;const loop=state.loopPlan.loops.find(l=>l.id===dragRoute.id),original=dragRoute.original;dragRoute=null;
   if(!loop)return;const meters=routeLength(loop.route,state.scale),max=Number(state.loopPlan.maxLength);
   if(!Number.isFinite(meters)||meters>max+1e-7){loop.route=original;alert('Korekta przekroczyłaby limit '+max+' m ('+format(meters)+' m). Przywrócono poprzedni punkt.');}
   api.render();
  },
  reopenLastApproachForUndo(){const a=state.loopPlan.assignments.find(a=>a.roomId===lastSavedApproachRoomId);if(!a?.approach?.length)return null;approachRoomId=a.roomId;return a.approach.slice(0,-1).map(p=>({...p}));},
  finishApproach(points){const a=state.loopPlan.assignments.find(a=>a.roomId===approachRoomId);if(!a)throw Error('Wybierz pomieszczenie w zakładce Pętle i rozdzielacz.');if(points.length<1||points.length>100)throw Error('Wskaż 1–100 punktów dojścia.');const room=[...state.rooms,...state.polygons].find(r=>r.loopRoomId===a.roomId);if(!room?.points)throw Error('Dojście wymaga pomieszczenia obrysowanego na rzucie.');const poly=room.points;const last=points[points.length-1];let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const p=poly[i],q=poly[j];if((p.y>last.y)!==(q.y>last.y)&&last.x<(q.x-p.x)*(last.y-p.y)/(q.y-p.y)+p.x)inside=!inside;}
   if(!inside){let near=Infinity;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dx=q.x-p.x,dy=q.y-p.y,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((last.x-p.x)*dx+(last.y-p.y)*dy)/den)):0;near=Math.min(near,Math.hypot(last.x-p.x-t*dx,last.y-p.y-t*dy));}
    if(near>6){a.approachNeedsReview=true;}else a.approachNeedsReview=false;
    // Punkt na linii obrysu: nie odrzucaj przez minimalne niedokładności kliknięcia.
   }
   a.approach=points.map(p=>({...p}));a.approachConfirmed=true;if(a.approachNeedsReview){$('pStatus').textContent='Uwaga: zapisano dojście, ale jego punkt końcowy wymaga ręcznej kontroli na rzucie (ściany i drzwi).';}lastSavedApproachRoomId=a.roomId;approachRoomId=null;},
  setManifold(pos){if(state.loopPlan.loops.length&&!confirm('Zmiana '+selected+' wymaga ponownego podziału pętli i narysowania tras. Kontynuować?'))return;if(selected==='R1')state.loopPlan.manifold={...pos};else state.loopPlan.manifolds.find(m=>m.id===selected).position={...pos};for(const a of state.loopPlan.assignments)if(manifoldId(a.manifoldId)===selected)a.approachConfirmed=false;active=null;api.render()},
  finishRoute(points){
   const loop=state.loopPlan.loops.find(l=>l.id===active),m=loop&&manifoldPoint(state.loopPlan,loop.manifoldId);
   if(!loop||!m)throw Error('Wybierz pętlę przyciskiem „Rysuj” w zakładce Pętle i rozdzielacz.');
   const start=points[0];if(!start||Math.hypot(start.x-m.x,start.y-m.y)>0.01)throw Error('Zacznij rysowanie przyciskiem Rysuj dla wybranej pętli.');
   const route=[...points.map(p=>({...p})),{...m}];if(route.length<3||!(routeLength(route,state.scale)>0))throw Error('Wskaż trasę pętli przed jej zakończeniem.');
   loop.route=route;active=null;
  },
  overlay(ctx){
   if(approachRoomId){const assignment=state.loopPlan.assignments.find(a=>a.roomId===approachRoomId),room=[...state.rooms,...state.polygons].find(r=>r.loopRoomId===approachRoomId);if(room?.points?.length){ctx.save();ctx.beginPath();ctx.moveTo(room.points[0].x,room.points[0].y);for(const p of room.points.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();ctx.fillStyle='rgba(255,195,0,.14)';ctx.fill();ctx.strokeStyle='#f5a000';ctx.lineWidth=5;ctx.setLineDash([9,5]);ctx.stroke();ctx.setLineDash([]);const p=room.points[0];ctx.fillStyle='#9b4700';ctx.font='bold 15px sans-serif';ctx.fillText('CEL DOJŚCIA: '+room.name,p.x+8,p.y+18);ctx.restore();}}
   for(const a of state.loopPlan.assignments){
    if(!a.approachConfirmed||!a.approach?.length)continue;
    const m=manifoldPoint(state.loopPlan,manifoldId(a.manifoldId));if(!m)continue;
    // Po wygenerowaniu nie nakladaj drugiej pomaranczowej linii na kolorowe petle.
    if(state.loopPlan.loops.some(l=>l.roomId===a.roomId&&l.route?.length))continue;
    const path=[m,...a.approach];ctx.beginPath();ctx.moveTo(path[0].x,path[0].y);
    for(const p of path.slice(1))ctx.lineTo(p.x,p.y);
    ctx.save();ctx.setLineDash([7,5]);ctx.strokeStyle='#cf7200';ctx.lineWidth=2;ctx.stroke();ctx.restore();
   }
   state.loopPlan.loops.forEach((l,i)=>{if(!l.route.length)return;const color='hsl('+((i*137.508+20)%360)+' 85% 38%)';ctx.beginPath();ctx.moveTo(l.route[0].x,l.route[0].y);for(const p of l.route.slice(1))ctx.lineTo(p.x,p.y);ctx.strokeStyle=color;ctx.lineWidth=l.id===editingLoopId?4:2.5;ctx.stroke();const p=l.route[Math.floor(l.route.length/2)];ctx.fillStyle=color;ctx.font='bold 13px sans-serif';ctx.fillText(loopLabel(l),p.x+5,p.y-5);if(l.id===editingLoopId){l.route.slice(1,-1).forEach(pt=>{ctx.beginPath();ctx.arc(pt.x,pt.y,6,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=color;ctx.stroke()})}});
   for(const manifold of state.loopPlan.manifolds){const m=manifoldPoint(state.loopPlan,manifold.id);if(m){ctx.fillStyle='#10263a';const width=state.scale>0?0.8/state.scale:40,height=state.scale>0?0.15/state.scale:7.5;
    ctx.fillRect(m.x-width/2,m.y-height/2,width,height);
    ctx.strokeStyle='#ef2424';ctx.lineWidth=3;ctx.strokeRect(m.x-width/2-3,m.y-height/2-3,width+6,height+6);
    ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.fillText(manifold.id,m.x-width/2,m.y-height/2-5)}}
  }
 };
}
