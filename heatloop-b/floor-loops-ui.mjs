import {prepareAssignments,sourceSignature,proposeLoops,analyzeLoops,routeLength} from './floor-loops.mjs';

export function mountLoopPlanner(state,api){
 const $=id=>document.getElementById(id),format=n=>Number.isFinite(n)?n.toLocaleString('pl-PL',{maximumFractionDigits:2}):'—';
 let active=null;
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
   for(const value of ['R1/P'+row.section,row.room+' / '+row.zone,format(row.area),format(row.length),format(row.power),format(row.flow),format(row.flow/60),row.drawn?'Narysowana (z dojściami)':'Szacunek (z dojściami)']){const td=document.createElement('td');td.textContent=value;tr.append(td)}
   const td=document.createElement('td'),draw=document.createElement('button');draw.type='button';draw.textContent=row.drawn?'Rysuj ponownie':'Rysuj';draw.setAttribute('aria-label','Rysuj pętlę R1/P'+row.section);
   draw.onclick=()=>{
    if(!state.loopPlan.manifold||!(state.scale>0))return alert('Najpierw ustaw skalę i wskaż rozdzielacz R1 na rzucie.');
    if(state.loopPlan.signature!==sourceSignature(state))return alert('Dane zmieniły się. Wygeneruj ponownie propozycję pętli.');
    active=row.id;api.startRoute(state.loopPlan.manifold);api.openDrawing();
   };td.append(draw);
   if(row.drawn){const clear=document.createElement('button');clear.type='button';clear.textContent='Usuń trasę';clear.onclick=()=>{if(!confirm('Usunąć trasę i wrócić do szacowanej długości?'))return;state.loopPlan.loops.find(l=>l.id===row.id).route=[];api.render()};td.append(clear)}
   tr.append(td);$('pLoops').append(tr);
  }
 }
 function refresh(){
  prepareAssignments(state);
  for(const [id,key] of [['pMax','maxLength'],['pDt','dt'],['pPipe','pipe']])$(id).value=state.loopPlan[key];
  $('pLinked').checked=state.loopPlan.linked;
  const manifold=state.loopPlan.manifold;$('pManifold').textContent=manifold?'Rozdzielacz R1 wskazany na rzucie. Dojścia przyjmij według rzeczywistych tras.':'R1 nie został wskazany na rzucie. Możesz wykonać wstępny podział z ręcznie podanymi dojściami.';
  $('pRooms').replaceChildren();
  for(const a of state.loopPlan.assignments){
   const room=[...state.rooms,...state.polygons].find(r=>r.loopRoomId===a.roomId),tr=document.createElement('tr'),td=document.createElement('td');td.textContent=room?.name||'Usunięte';tr.append(td);
   for(const [key,label] of [['zone','Strefa'],['out','Dojście zasilania'],['back','Dojście powrotu'],['count','Liczba pętli']]){
    const cell=document.createElement('td'),input=document.createElement('input');input.value=a[key];input.type='text';input.maxLength=key==='zone'?80:10;if(key!=='zone')input.inputMode=key==='count'?'numeric':'decimal';input.setAttribute('aria-label',label+' — '+room?.name);
    input.oninput=()=>{a[key]=input.value;showResult();api.changed()};cell.append(input);tr.append(cell);
   }$('pRooms').append(tr);
  }showResult();
 }
 for(const [id,key] of [['pMax','maxLength'],['pDt','dt'],['pPipe','pipe']])$(id).oninput=()=>{state.loopPlan[key]=$(id).value;showResult();api.changed()};
 $('pPlace').onclick=()=>{api.placeManifold();api.openDrawing()};
 $('pGenerate').onclick=()=>{
  prepareAssignments(state);
  if(state.loopPlan.loops.length&&!confirm('Zastąpić obecny podział? Narysowane trasy zostaną usunięte.'))return;
  const result=proposeLoops(state);if(result.errors.length){status({...result,rows:[],totalLength:0,power:0,flow:0});return;}
  state.loopPlan.loops=result.loops;state.loopPlan.signature=sourceSignature(state);active=null;api.render();
 };
 $('pLinked').onchange=()=>{
  const result=analyzeLoops(state);if($('pLinked').checked&&result.errors.length){$('pLinked').checked=false;return alert('Popraw plan pętli przed powiązaniem z wyceną.');}
  state.loopPlan.linked=$('pLinked').checked;api.render();
 };
 $('pExport').onclick=()=>{const r=analyzeLoops(state);if(r.errors.length)return;api.exportCsv([['Sekcja','Pomieszczenie','Strefa','Rura','Powierzchnia m2','Dlugosc m z dojsciami','Moc W','Przeplyw l/h','Przeplyw l/min','Zrodlo dlugosci'],...r.rows.map(l=>['R1/P'+l.section,l.room,l.zone,state.loopPlan.pipe,l.area,l.length,l.power,l.flow,l.flow/60,l.drawn?'Narysowana':'Szacunek'])])};
 refresh();
 return {refresh,active:()=>active,
  setManifold(pos){if(state.loopPlan.loops.length&&!confirm('Zmiana R1 wymaga ponownego podziału pętli i narysowania tras. Kontynuować?'))return;state.loopPlan.manifold={...pos};active=null;api.render()},
  finishRoute(points){
   const loop=state.loopPlan.loops.find(l=>l.id===active),m=state.loopPlan.manifold;
   if(!loop||!m)throw Error('Wybierz pętlę przyciskiem „Rysuj” w zakładce Pętle i rozdzielacz.');
   const start=points[0];if(!start||Math.hypot(start.x-m.x,start.y-m.y)>0.01)throw Error('Zacznij rysowanie przyciskiem Rysuj dla wybranej pętli.');
   const route=[...points.map(p=>({...p})),{...m}];if(route.length<3||!(routeLength(route,state.scale)>0))throw Error('Wskaż trasę pętli przed jej zakończeniem.');
   loop.route=route;active=null;
  },
  overlay(ctx){
   for(const l of state.loopPlan.loops){if(!l.route.length)continue;ctx.beginPath();ctx.moveTo(l.route[0].x,l.route[0].y);for(const p of l.route.slice(1))ctx.lineTo(p.x,p.y);ctx.strokeStyle='hsl('+((l.section*61)%360)+' 65% 40%)';ctx.lineWidth=2;ctx.stroke();const p=l.route[Math.floor(l.route.length/2)];ctx.fillStyle='#10263a';ctx.font='bold 13px sans-serif';ctx.fillText('R1/P'+l.section,p.x+5,p.y-5)}
   const m=state.loopPlan.manifold;if(m){ctx.fillStyle='#10263a';ctx.fillRect(m.x-15,m.y-10,30,20);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.fillText('R1',m.x-8,m.y+4)}
  }
 };
}
