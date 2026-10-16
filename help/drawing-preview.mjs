// The bridge is requested only by a deliberate click. Snapshots never enter AI payloads.
export function mountDrawingPreview(doc,host){
 if(!doc.getElementById('canvas')||!doc.getElementById('drawing'))return {clear(){}};
 const el=(tag,text)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const launch=el('button','Podgląd kreatora rysunku');launch.type='button';launch.className='hl-help-preview-launch';
 const box=el('section');box.className='hl-help-preview';box.hidden=true;box.setAttribute('aria-label','Lokalny podgląd kreatora rysunku');
 host.append(launch,box);let revision=0;
 function clear(){revision++;box.replaceChildren();box.hidden=true;}
 function show(){const stamp=++revision;box.replaceChildren();box.hidden=false;box.append(el('p','Podgląd jest lokalny. Obraz i dane kreatora nie są wysyłane do AI. Wykrywanie ścian wyszukuje propozycje długich odcinków poziomych i pionowych; wymaga sprawdzenia.'));
  let received=false;
  doc.dispatchEvent(new doc.defaultView.CustomEvent('heatloop:preview-request',{detail:{provide(payload){if(received||stamp!==revision)return;const {snapshot:s,advice=[]}=payload||{};if(!s||!Array.isArray(s.rooms)||!Array.isArray(advice)||['roomCount','loopCount','drawnLoopCount','manifoldCount'].some(key=>!Number.isInteger(s[key])||s[key]<0)||s.rooms.some(r=>!r||typeof r!=='object')||advice.some(a=>!a||typeof a.text!=='string'))return;received=true;
   box.append(el('h3','Stan kreatora w chwili odświeżenia'));
   if(s.image&&/^data:image\/(jpeg|png);base64,[a-zA-Z0-9+/=]+$/.test(s.image)&&s.image.length<=1500000){const img=el('img');img.src=s.image;img.alt='Lokalny obraz aktualnego kreatora rysunku';box.append(img);}else box.append(el('p',s.hasDrawing?'Miniatura jest niedostępna. Sprawdź dane i otwórz kreator.':'Nie wczytano rzutu.'));
   const facts=el('p',`Skala: ${s.scale?'ustawiona':'brak'} · Pomieszczenia na rzucie: ${s.roomCount} · Pętle: ${s.loopCount} · Narysowane pętle: ${s.drawnLoopCount} · Rozdzielacze: ${s.manifoldCount} · Obrót: ${s.rotation||0}° · Linie ścian: ${s.wallGuideCount||0}`);box.append(facts);
   const list=el('ul');for(const r of (s.rooms||[]).slice(0,50)){const labels={wet:'podłogowe mokre',milled:'podłogowe frezowane',radiators:'grzejniki'};list.append(el('li',`${r.label}: ${Number.isFinite(r.area)?r.area.toLocaleString('pl-PL',{maximumFractionDigits:2}):'brak'} m² — ${labels[r.technology]||'sprawdź technologię'}`));}if(s.roomCount>50)list.append(el('li','Pokazano pierwszych 50 pomieszczeń.'));box.append(list);
   const checks=el('ul');for(const a of advice.slice(0,15)){const li=el('li',a.text);if(['drawing','manual','loops'].includes(a.module)){const b=el('button','Otwórz ekran');b.type='button';b.onclick=()=>doc.dispatchEvent(new doc.defaultView.CustomEvent('heatloop:preview-navigate',{detail:{module:a.module}}));li.append(' ',b);}checks.append(li);}box.append(checks);if(s.hasDrawing){const detect=el('button','Wykryj propozycje ścian');detect.type='button';detect.onclick=()=>doc.dispatchEvent(new doc.defaultView.CustomEvent('heatloop:preview-navigate',{detail:{module:'drawing',action:'detect-walls'}}));box.append(detect);}
  }}}));
  if(!received)box.append(el('p','Kreator nie udostępnił podglądu. Poczekaj na uruchomienie aplikacji i spróbuj ponownie.'));
  const refresh=el('button','Odśwież lokalny podgląd');refresh.type='button';refresh.onclick=show;const close=el('button','Ukryj podgląd');close.type='button';close.onclick=clear;box.append(refresh,close);
 }
 launch.onclick=show;
 doc.addEventListener('heatloop:drawing-changed',()=>{if(box.hidden)return;revision++;box.replaceChildren(el('p','Projekt zmienił się. Odśwież podgląd, aby zobaczyć aktualne dane.'));const refresh=el('button','Odśwież lokalny podgląd');refresh.type='button';refresh.onclick=show;box.append(refresh);});
 return {clear};
}
