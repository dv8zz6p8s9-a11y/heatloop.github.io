// Explicit, read-only projection. No client names, prices, raw room IDs or project JSON.
export function drawingHelpSnapshot(state,{analysis,points=[],wallCandidates=[],tool='',capture=()=>null}={}){
 const rooms=state.polygons||[],floor=rooms.filter(r=>r.heatingType!=='radiators'),plan=state.loopPlan||{},assignments=plan.assignments||[],loops=plan.loops||[];
 const snapshot={hasDrawing:!!state.background,scale:Number.isFinite(state.scale)&&state.scale>0?state.scale:null,roomCount:rooms.length,manualRoomCount:(state.rooms||[]).length,
  rooms:rooms.slice(0,50).map((r,i)=>({label:'Pomieszczenie na rzucie '+(i+1),area:Number.isFinite(r.area)?r.area:null,technology:['wet','milled','radiators'].includes(r.heatingType)?r.heatingType:'wet'})),
  draftPoints:points.length,tool:['room','pipe','manifold','loopRoute','scale','radiator'].includes(tool)?tool:null,
  loopCount:loops.length,drawnLoopCount:loops.filter(l=>Array.isArray(l.route)&&l.route.length>=3).length,
  manifoldCount:(plan.manifolds||[]).length,unplacedManifolds:(plan.manifolds||[]).filter(m=>m.id==='R1'?!plan.manifold:!m.position).length,
  unassignedRooms:floor.filter(r=>!assignments.some(a=>a.roomId===r.loopRoomId&&(plan.manifolds||[]).some(m=>m.id===a.manifoldId))).length,
  planErrorCount:analysis?.errors?.length||0,overlongLoops:(analysis?.rows||[]).filter(r=>Number.isFinite(r.length)&&r.length>Number(plan.maxLength)).length,
  rotation:state.drawingRotation||0,wallGuideCount:(state.wallGuides||[]).length,wallCandidateCount:wallCandidates.length,linked:plan.linked===true,hasFloorRooms:floor.length>0,image:null};
 if(snapshot.hasDrawing){try{const image=capture();if(typeof image==='string'&&/^data:image\/(jpeg|png);base64,[a-zA-Z0-9+/=]+$/.test(image)&&image.length<=1500000)snapshot.image=image;}catch{/* Tainted/unavailable canvas does not disable textual help. */}}
 return snapshot;
}
export function drawingHelpAdvice(s){
 const advice=[];const add=(text,module)=>advice.push({text,module});
 if(!s.hasDrawing)add('Wczytaj rzut PNG/JPG/PDF w „Praca z rysunku”.','drawing');
 if(s.hasDrawing&&!s.wallGuideCount&&!s.wallCandidateCount)add('Możesz wykryć propozycje ścian. Sprawdź je przed zatwierdzeniem; same nie tworzą pomieszczeń.','drawing');
 if(!s.scale)add('Ustaw skalę na znanym odcinku i sprawdź powierzchnię pokoju o znanych wymiarach.','drawing');
 if(s.draftPoints)add('Masz niedokończony obrys lub trasę. Sprawdź punkty przed użyciem „Zakończ obrys / trasę”.','drawing');
 if(s.hasDrawing&&!s.roomCount)add('Obrysuj i nazwij pomieszczenia na skalibrowanym rzucie.','drawing');
 if(s.rooms.some(r=>!(r.area>0)))add('Powierzchnia któregoś obrysu jest nieprawidłowa. Sprawdź skalę i obrys.','drawing');
 if(s.manualRoomCount)add('Projekt ma też pomieszczenia wpisane ręcznie. Sprawdź, czy nie liczysz tych samych pomieszczeń drugi raz.','manual');
 if(s.unassignedRooms)add('Przypisz pomieszczenia podłogówki do właściwych rozdzielaczy w planie pętli.','loops');
 if(s.hasFloorRooms&&!s.loopCount)add('Wygeneruj propozycję podziału na pętle po sprawdzeniu dojść i limitu długości.','loops');
 if(s.hasFloorRooms&&s.unplacedManifolds)add('Przed rysowaniem tras wskaż położenie używanych rozdzielaczy na rzucie.','drawing');
 if(s.overlongLoops)add('Niektóre pętle przekraczają ustawiony limit długości. Sprawdź podział i dojścia.','loops');
 if(s.hasFloorRooms&&s.planErrorCount)add('Plan pętli zgłasza problemy. Otwórz jego komunikaty; podgląd nie zastępuje ich sprawdzenia.','loops');
 if(s.loopCount>s.drawnLoopCount)add('Część długości jest nadal szacunkiem. Narysowanie pełnych tras wymaga skali i położenia rozdzielaczy.','loops');
 if(s.loopCount&&!s.linked)add('Po sprawdzeniu planu możesz powiązać go z wyceną i doborem sterowania.','loops');
 if(!advice.length)add('Nie wykryto sprawdzanych braków w danych kreatora. To nie potwierdza poprawności hydraulicznej ani zgodności instalacji.','drawing');
 return advice;
}
