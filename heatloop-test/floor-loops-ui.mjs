import {prepareAssignments,sourceSignature,proposeLoops,analyzeLoops,routeLength,manifoldId,manifoldPoint,loopLabel,settingsErrors,newId,floorRooms} from './floor-loops.mjs?v=20261016-3';
import {generateMeander,rectangularInsetArea} from './loop-generator.mjs';

export function mountLoopPlanner(state,api){
 const $=id=>document.getElementById(id),format=n=>Number.isFinite(n)?n.toLocaleString('pl-PL',{maximumFractionDigits:2}):'—';
 let active=null,selected='R1',approachRoomId=null,lastSavedApproachRoomId=null;
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
   for(const value of [loopLabel(row),row.room+' / '+row.zone,format(row.area),format(row.length),format(row.power),format(row.flow),format(row.flow/60),row.drawn?'Narysowana (z dojściami)':'Szacunek (z dojściami)']){const td=document.createElement('td');td.textContent=value;tr.append(td)}
   const td=document.createElement('td'),draw=document.createElement('button');draw.type='button';draw.textContent=row.drawn?'Rysuj ponownie':'Rysuj';draw.setAttribute('aria-label','Rysuj pętlę R1/P'+row.section);
   draw.onclick=()=>{
    const m=manifoldPoint(state.loopPlan,row.manifoldId);if(!m||!(state.scale>0))return alert('Najpierw ustaw skalę i wskaż rozdzielacz '+manifoldId(row.manifoldId)+' na rzucie.');
    if(state.loopPlan.signature!==sourceSignature(state))return alert('Dane zmieniły się. Wygeneruj ponownie propozycję pętli.');
    active=row.id;api.startRoute(m);api.openDrawing();
   };td.append(draw);
   if(row.drawn){const clear=document.createElement('button');clear.type='button';clear.textContent='Usuń trasę';clear.onclick=()=>{if(!confirm('Usunąć trasę i wrócić do szacowanej długości?'))return;state.loopPlan.loops.find(l=>l.id===row.id).route=[];api.render()};td.append(clear)}
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
    const approachButton=document.createElement('button');approachButton.type='button';approachButton.textContent=a.approach?.length?'Edytuj dojście ('+a.approach.length+' punktów)':'Wskaż dojście od rozdzielacza';
    approachButton.onclick=()=>{if(!(state.scale>0)||!manifoldPoint(state.loopPlan,manifoldId(a.manifoldId)))return alert('Najpierw skalibruj rzut i wskaż rozdzielacz.');approachRoomId=a.roomId;api.startApproach(a.approach||[]);api.openDrawing();alert('Klikaj kolejne punkty od rozdzielacza, przez korytarz i drzwi, aż do wnętrza pomieszczenia '+room.name+'. Następnie kliknij „Zakończ obrys / trasę”.');};
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
  if(state.loopPlan.loops.length&&!confirm('Zastąpić obecne pętle i wszystkie narysowane trasy automatycznym meandrem?'))return;
  const errors=settingsErrors(state);if(errors.length){alert(errors.join('\n'));return;}
  if(!(state.scale>0)){alert('Najpierw skalibruj rzut.');return;}
  const generated=[],sections=new Map(),areas=[];
  try{
   for(const room of floorRooms(state)){
    const a=state.loopPlan.assignments.find(x=>x.roomId===room.loopRoomId);
    const mid=manifoldId(a.manifoldId),m=manifoldPoint(state.loopPlan,mid);
    const result=generateMeander(room,{scale:state.scale,offsetCm:Number(a.offsetCm??'10'),spacingCm:room.spacing,maxMeters:Number(state.loopPlan.maxLength),manifold:m,approach:a.approach||[]});
    areas.push(room.name+': '+format(result.heatedArea)+' m² grzewcze / '+format(room.area)+' m² pomieszczenia');
    const stripesTotal=result.routes.reduce((sum,x)=>sum+x.stripes,0);
    let areaAssigned=0;
    for(let i=0;i<result.routes.length;i++){
     const item=result.routes[i],section=(sections.get(mid)||0)+1;sections.set(mid,section);
     const assigned=i===result.routes.length-1?room.area-areaAssigned:room.area*item.stripes/stripesTotal;areaAssigned+=assigned;
     const route=item.route;
     const heatingLength=Math.max(0.01,routeLength(route.slice(1,-1),state.scale));
     generated.push({id:newId(),manifoldId:mid,roomId:room.loopRoomId,section,area:assigned,heatingLength,out:Number(a.out),back:Number(a.back),route});
    }
   }
   if(generated.length>100)throw Error('Generator przekracza limit 100 pętli.');
  }catch(err){alert('Nie wygenerowano tras. '+err.message+'\nDotychczasowy projekt pozostaje bez zmian.');return;}
  state.loopPlan.loops=generated;state.loopPlan.signature=sourceSignature(state);active=null;
  api.render();alert('Wygenerowano '+generated.length+' tras meandrowych.\n'+areas.join('\n')+'\nSprawdź przebieg i długości na rzucie przed realizacją.');
 };
 $('pLinked').onchange=()=>{
  const result=analyzeLoops(state);if($('pLinked').checked&&result.errors.length){$('pLinked').checked=false;return alert('Popraw plan pętli przed powiązaniem z wyceną.');}
  state.loopPlan.linked=$('pLinked').checked;api.render();
 };
 $('pExport').onclick=()=>{const r=analyzeLoops(state);if(r.errors.length)return;api.exportCsv([['Sekcja','Pomieszczenie','Strefa','Rura','Powierzchnia m2','Dlugosc m z dojsciami','Moc W','Przeplyw l/h','Przeplyw l/min','Zrodlo dlugosci'],...r.rows.map(l=>[loopLabel(l),l.room,l.zone,state.loopPlan.pipe,l.area,l.length,l.power,l.flow,l.flow/60,l.drawn?'Narysowana':'Szacunek'])])};
 refresh();
 return {refresh,active:()=>active,
  reopenLastApproachForUndo(){const a=state.loopPlan.assignments.find(a=>a.roomId===lastSavedApproachRoomId);if(!a?.approach?.length)return null;approachRoomId=a.roomId;return a.approach.slice(0,-1).map(p=>({...p}));},
  finishApproach(points){const a=state.loopPlan.assignments.find(a=>a.roomId===approachRoomId);if(!a)throw Error('Wybierz pomieszczenie w zakładce Pętle i rozdzielacz.');if(points.length<1||points.length>100)throw Error('Wskaż 1–100 punktów dojścia.');const room=[...state.rooms,...state.polygons].find(r=>r.loopRoomId===a.roomId);if(!room?.points)throw Error('Dojście wymaga pomieszczenia obrysowanego na rzucie.');a.approach=points.map(p=>({...p}));lastSavedApproachRoomId=a.roomId;approachRoomId=null;},
  setManifold(pos){if(state.loopPlan.loops.length&&!confirm('Zmiana '+selected+' wymaga ponownego podziału pętli i narysowania tras. Kontynuować?'))return;if(selected==='R1')state.loopPlan.manifold={...pos};else state.loopPlan.manifolds.find(m=>m.id===selected).position={...pos};active=null;api.render()},
  finishRoute(points){
   const loop=state.loopPlan.loops.find(l=>l.id===active),m=loop&&manifoldPoint(state.loopPlan,loop.manifoldId);
   if(!loop||!m)throw Error('Wybierz pętlę przyciskiem „Rysuj” w zakładce Pętle i rozdzielacz.');
   const start=points[0];if(!start||Math.hypot(start.x-m.x,start.y-m.y)>0.01)throw Error('Zacznij rysowanie przyciskiem Rysuj dla wybranej pętli.');
   const route=[...points.map(p=>({...p})),{...m}];if(route.length<3||!(routeLength(route,state.scale)>0))throw Error('Wskaż trasę pętli przed jej zakończeniem.');
   loop.route=route;active=null;
  },
  overlay(ctx){
   for(const a of state.loopPlan.assignments){
    if(!a.approach?.length)continue;
    const m=manifoldPoint(state.loopPlan,manifoldId(a.manifoldId));if(!m)continue;
    ctx.beginPath();ctx.moveTo(m.x,m.y);for(const p of a.approach)ctx.lineTo(p.x,p.y);
    ctx.save();ctx.setLineDash([7,5]);ctx.strokeStyle='#cf7200';ctx.lineWidth=3;ctx.stroke();ctx.restore();
   }
   for(const l of state.loopPlan.loops){if(!l.route.length)continue;ctx.beginPath();ctx.moveTo(l.route[0].x,l.route[0].y);for(const p of l.route.slice(1))ctx.lineTo(p.x,p.y);ctx.strokeStyle='hsl('+((l.section*61)%360)+' 65% 40%)';ctx.lineWidth=2;ctx.stroke();const p=l.route[Math.floor(l.route.length/2)];ctx.fillStyle='#10263a';ctx.font='bold 13px sans-serif';ctx.fillText(loopLabel(l),p.x+5,p.y-5)}
   for(const manifold of state.loopPlan.manifolds){const m=manifoldPoint(state.loopPlan,manifold.id);if(m){ctx.fillStyle='#10263a';ctx.fillRect(m.x-15,m.y-10,30,20);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.fillText(manifold.id,m.x-8,m.y+4)}}
  }
 };
}
