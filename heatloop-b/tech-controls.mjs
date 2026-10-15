// Source: official TECH catalogue linked from techsterowniki.pl on 2026-10-15.
// Prices are a reviewed snapshot, never a live feed. White regulators, 230 V NC actuators.
export const catalog = {
  techL4X: {name:'TECH L-4X Wi-Fi — listwa, wbudowane Wi-Fi', sku:'WG.20.0176', net:1344},
  techLX: {name:'TECH L-X Wi-Fi — listwa, 8 stref, wbudowane Wi-Fi', sku:'WG.20.0156', net:1911},
  techML4X: {name:'TECH ML-4X Wi-Fi — rozszerzenie do 8 stref podłogowych', sku:'WG.20.0195', net:388},
  techRX: {name:'TECH R-X — regulator przewodowy TECH SBUS, biały', sku:'WG.11.0730', net:226},
  techWireless: {name:'TECH R-8b — regulator bezprzewodowy, biały', sku:'WG.11.0293', net:231},
  techM30: {name:'TECH STT-230/2 — siłownik 230 V NC, M30 × 1,5', sku:'WG.01.0050', net:143},
  techM28: {name:'TECH STT-230/2 — siłownik 230 V NC, M28 × 1,5', sku:'WG.01.0051', net:143}
};
export const defaults = () => ({enabled:false,mode:'wireless',controller:'auto',thread:'M30',entries:[],projectSignature:null});
export function normalizeControls(value) {
  const c=defaults();
  if(!value || typeof value!=='object')return c;
  c.enabled=value.enabled===true;
  c.mode=value.mode==='wireless'?'wireless':'wired';
  c.thread=value.thread==='M28'?'M28':'M30';
  c.controller=['auto','l4x','lx'].includes(value.controller)?value.controller:'auto';
  c.entries=Array.isArray(value.entries)?value.entries.slice(0,200).map(e=>({
    room:String(e?.room??'').slice(0,80),zone:String(e?.zone??'').slice(0,80),loops:String(e?.loops??'').slice(0,8)
  })):[];
  c.projectSignature=typeof value.projectSignature==='string'?value.projectSignature:null;
  return c;
}
export function projectSignature(rooms) {
  return JSON.stringify(rooms.map(r=>[r.name,r.area,r.spacing,r.heatingType||'wet']));
}
export function calculateControls(c,quoteLoops,currentSignature) {
  const errors=[],rows=[];
  if(!c.enabled)return {errors,rows,zones:0,loops:0};
  if(!['wired','wireless'].includes(c.mode)||!['M30','M28'].includes(c.thread))errors.push('Nieprawidłowy wariant sterowania.');
  if(!['auto','l4x','lx'].includes(c.controller))errors.push('Wybierz sterownik L-4X Wi-Fi lub L-X Wi-Fi.');
  if(c.projectSignature!==null&&c.projectSignature!==currentSignature)errors.push('Pomieszczenia projektu zmieniły się. Pobierz je ponownie i sprawdź przypisania oraz pętle.');
  if(!c.entries.length)errors.push('Dodaj pomieszczenia i wpisz liczbę pętli.');
  const groups=new Map();let loops=0;
  for(const entry of c.entries){
    const zone=entry.zone.trim(),count=Number(entry.loops);
    if(!entry.room.trim()||!zone)errors.push('Uzupełnij nazwę pomieszczenia i strefy.');
    if(!/^\d+$/.test(String(entry.loops).trim())||!Number.isInteger(count)||count<1||count>100)errors.push('Każde pomieszczenie musi mieć całkowitą liczbę pętli od 1 do 100.');
    else {loops+=count;groups.set(zone,(groups.get(zone)||0)+count);}
  }
  if(groups.size>8)errors.push('Ten moduł obsługuje maksymalnie 8 stref na jednym rozdzielaczu.');
  if([...groups.values()].some(n=>n>4))errors.push('Przekroczono przyjęty limit aplikacji: 4 siłowniki na strefę. Wymagany indywidualny dobór.');
  if(loops!==quoteLoops)errors.push('Suma pętli sterowania ('+loops+') musi odpowiadać liczbie pętli w wycenie ('+quoteLoops+').');
  if(!errors.length){
    const add=(key,qty)=>rows.push([catalog[key].name+' · '+catalog[key].sku,qty,'szt.',key]);
    const l4x=c.controller==='l4x'||(c.controller==='auto'&&groups.size<=4);
    add(l4x?'techL4X':'techLX',1);
    if(l4x&&groups.size>4)add('techML4X',1);
    add(c.mode==='wired'?'techRX':'techWireless',groups.size);
    add(c.thread==='M30'?'techM30':'techM28',loops);
    // Both controllers have integrated Wi-Fi; never add Wi-Fi RS.
  }
  return {errors:[...new Set(errors)],rows,zones:groups.size,loops};
}
