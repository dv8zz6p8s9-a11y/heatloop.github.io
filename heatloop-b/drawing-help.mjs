// Convert known validator messages to reviewed codes; never copy room names or raw errors.
const planIssues=[
 ['limit',/limit długości pętli od/, 'W polu limitu długości podaj 10–300 m zgodnie z systemem. Nie podnoś limitu wyłącznie po to, by ukryć ostrzeżenie.'],
 ['delta',/różnicę temperatur wody/, 'Sprawdź ΔT: wymagane jest więcej niż 0 i najwyżej 30°C.'],
 ['manifold',/oznaczenia rozdzielaczy|wybierz istniejący rozdzielacz|nieprawidłowy rozdzielacz/, 'Sprawdź przypisania pokoi do istniejących R1–R10 i ponownie wygeneruj podział.'],
 ['feed',/długości zasilania i powrotu od/, 'Wybierz każdy rozdzielacz i sprawdź zasilanie oraz powrót od źródła: 0–10000 m.'],
 ['pipe',/oznaczenie rury/, 'Uzupełnij oznaczenie rury w planie pętli.'],
 ['rooms',/Dodaj pomieszczenie z ogrzewaniem podłogowym/, 'Dodaj pokój podłogówki lub sprawdź jego technologię. Pokoje grzejnikowe nie tworzą pętli podłogowych.'],
 ['assignments',/Pobierz pomieszczenia do planu/, 'Otwórz „Pętle i rozdzielacz”, sprawdź pobrane automatycznie pomieszczenia i ich przypisania, a następnie wygeneruj podział.'],
 ['approaches',/dojścia muszą być/, 'Popraw dojście zasilania i powrotu przy pokoju: oba nieujemne, ich suma musi być mniejsza od limitu pętli.'],
 ['count',/całkowitą liczbę pętli/, 'Wpisz liczbę pętli 1–100 lub pozostaw puste pole dla automatu.'],
 ['zone',/wpisz strefę sterowania/, 'Uzupełnij nazwę strefy w wierszu pomieszczenia w planie pętli.'],
 ['total',/limit 100 pętli/, 'Projekt przekracza limit 100 pętli aplikacji. Sprawdź dane i liczbę pętli; większy projekt wymaga osobnego opracowania.'],
 ['generate',/Wygeneruj propozycję podziału/, 'Kliknij „Zaproponuj podział na pętle” po sprawdzeniu danych.'],
 ['stale',/Dane projektu lub dojścia zmieniły/, 'Zapisz kopię JSON. Po zmianie danych wygeneruj pętle ponownie; zastąpienie podziału usuwa narysowane trasy.'],
 ['deleted',/usunięte pomieszczenie/, 'Plan odwołuje się do usuniętego pokoju. Sprawdź pokoje i przypisania, a następnie wygeneruj podział ponownie.'],
 ['sections',/powtórzone oznaczenie pętli/, 'Oznaczenia pętli lub sekcji są nieprawidłowe albo powtórzone. Zachowaj kopię JSON i wygeneruj podział ponownie.'],
 ['parameters',/Nieprawidłowe parametry pętli/, 'Sprawdź powierzchnię, rozstaw, długości i dojścia pokoju. Po poprawieniu danych wygeneruj podział ponownie.'],
 ['position',/Trasa wymaga skali i rozdzielacza/, 'Ustaw skalę i wskaż położenie właściwego rozdzielacza przed ponownym rysowaniem trasy.'],
 ['endpoints',/Trasa musi zaczynać się i kończyć/, 'Sprawdź początek i koniec trasy na właściwym rozdzielaczu. Użyj „Rysuj ponownie” przy odpowiedniej pętli.'],
 ['zero',/trasa ma zerową długość/, 'Narysowana trasa ma zerową długość. Sprawdź skalę oraz odrębne punkty trasy i narysuj ją ponownie.'],
 ['overlong',/długość przekracza ustawiony limit/, 'Sprawdź długość trasy, dojścia i podział pokoju. Po zmianie liczby pętli ponownie wygeneruj podział i odtwórz trasy.'],
 ['area',/powierzchnia pętli nie pokrywa/, 'Suma powierzchni pętli nie odpowiada pokojowi. Sprawdź obrys i skalę, a następnie wygeneruj podział ponownie.']
];
const issueByCode=new Map(planIssues.map(([code,,text])=>[code,text]));
export function drawingPlanIssueCodes(errors){
 if(!Array.isArray(errors))return [];
 return [...new Set(errors.filter(e=>typeof e==='string').slice(0,200).flatMap(e=>{const match=planIssues.find(([,pattern])=>pattern.test(e.includes(': ')?e.slice(e.lastIndexOf(': ')+2):e));return match?[match[0]]:['unknown'];}))].slice(0,22);
}

// Explicit, read-only projection. No client names, prices, raw room IDs or project JSON.
export function drawingHelpSnapshot(state,{analysis,points=[],wallCandidates=[],tool='',capture=()=>null}={}){
 const rooms=state.polygons||[],floor=rooms.filter(r=>r.heatingType!=='radiators'),plan=state.loopPlan||{},assignments=plan.assignments||[],loops=plan.loops||[];
 const snapshot={hasDrawing:!!state.background,scale:Number.isFinite(state.scale)&&state.scale>0?state.scale:null,roomCount:rooms.length,manualRoomCount:(state.rooms||[]).length,
  rooms:rooms.slice(0,50).map((r,i)=>({label:'Pomieszczenie na rzucie '+(i+1),area:Number.isFinite(r.area)?r.area:null,technology:['wet','milled','radiators'].includes(r.heatingType)?r.heatingType:'wet'})),
  draftPoints:points.length,tool:['room','pipe','manifold','loopRoute','scale','radiator'].includes(tool)?tool:null,
  loopCount:loops.length,drawnLoopCount:loops.filter(l=>Array.isArray(l.route)&&l.route.length>=3).length,
  manifoldCount:(plan.manifolds||[]).length,unplacedManifolds:(plan.manifolds||[]).filter(m=>m.id==='R1'?!plan.manifold:!m.position).length,
  unassignedRooms:floor.filter(r=>!assignments.some(a=>a.roomId===r.loopRoomId&&(plan.manifolds||[]).some(m=>m.id===a.manifoldId))).length,
  planErrorCount:analysis?.errors?.length||0,planIssueCodes:drawingPlanIssueCodes(analysis?.errors),overlongLoops:(analysis?.rows||[]).filter(r=>Number.isFinite(r.length)&&r.length>Number(plan.maxLength)).length,
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
 if(s.hasFloorRooms&&s.planErrorCount){
  const codes=Array.isArray(s.planIssueCodes)?[...new Set(s.planIssueCodes)]:[];
  for(const code of codes)if(issueByCode.has(code))add(issueByCode.get(code),'loops');
  if(!codes.length||codes.some(code=>!issueByCode.has(code)))add('Plan pętli zgłasza problemy. Otwórz jego komunikaty; dla tego problemu brak szczegółowej wskazówki w podglądzie.','loops');
 }
 if(s.loopCount>s.drawnLoopCount)add('Część długości jest nadal szacunkiem. Narysowanie pełnych tras wymaga skali i położenia rozdzielaczy.','loops');
 if(s.loopCount&&!s.linked)add('Po sprawdzeniu planu możesz powiązać go z wyceną i doborem sterowania.','loops');
 if(!advice.length)add('Nie wykryto sprawdzanych braków w danych kreatora. To nie potwierdza poprawności hydraulicznej ani zgodności instalacji.','drawing');
 return advice;
}
