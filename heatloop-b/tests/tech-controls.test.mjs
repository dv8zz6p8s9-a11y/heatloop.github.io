import assert from 'node:assert/strict';
import {catalog,defaults,normalizeControls,calculateControls,projectSignature} from '../tech-controls.mjs';
const config=()=>({...defaults(),mode:'wired',enabled:true,entries:[{room:'Salon',zone:'Dzienna',loops:'2'},{room:'Kuchnia',zone:'Dzienna',loops:'1'},{room:'Sypialnia',zone:'Nocna',loops:'1'}]});
let count=0;
function test(name,fn){fn();count++;console.log('OK:',name)}
test('Opcja wyłączona nie dodaje produktów',()=>assert.equal(calculateControls(defaults(),8,'').rows.length,0));
test('Jedna strefa może mieć kilka pomieszczeń i pętli',()=>{
 const r=calculateControls(config(),4,'');assert.deepEqual(r.errors,[]);assert.equal(r.zones,2);assert.equal(r.loops,4);assert.equal(r.rows[1][1],2);assert.equal(r.rows[2][1],4);
 assert.equal(r.rows.reduce((sum,row)=>sum+row[1]*catalog[row[3]].net,0),2368);
});
test('Bezprzewodowy L-X ma internet wbudowany',()=>{
 const r=calculateControls({...config(),mode:'wireless',controller:'lx',thread:'M28'},4,'');
 assert.deepEqual(r.errors,[]);assert.deepEqual(r.rows.map(r=>r[3]),['techLX','techWireless','techM28']);
 assert.equal(r.rows.reduce((s,r)=>s+r[1]*catalog[r[3]].net,0),2945);
});
test('Brak zgodności liczby pętli blokuje dobór',()=>assert(calculateControls(config(),8,'').errors.length));
test('Puste, ujemne, ułamkowe i wykładnicze pętle są odrzucane',()=>{
 for(const loops of ['', '-1','1.5','1e1','Infinity'])assert(calculateControls({...config(),entries:[{room:'A',zone:'A',loops}]},1,'').errors.length);
});
test('Dziewiąta strefa nie jest wyceniana jako jedna listwa',()=>{
 const entries=Array.from({length:9},(_,i)=>({room:'R'+i,zone:'Z'+i,loops:'1'}));const r=calculateControls({...config(),entries},9,'');assert(r.errors.length);assert.equal(r.rows.length,0);
});
test('Limit aplikacji jest sprawdzany dla całej strefy',()=>{
 const c=config();c.entries[0].loops='4';assert(calculateControls(c,6,'').errors.length);
});
test('Zmiana projektu wymaga ponownego importu',()=>{
 const a=projectSignature([{name:'A',area:10,spacing:15}]),b=projectSignature([{name:'A',area:12,spacing:15}]);
 assert(calculateControls({...config(),projectSignature:a},4,b).errors.length);
 assert.deepEqual(calculateControls({...config(),projectSignature:a},4,a).errors,[]);
});
test('Stare projekty mają sterowanie wyłączone',()=>assert.deepEqual(normalizeControls(undefined),defaults()));
test('Import usuwa nieobsługiwane warianty i ogranicza wejście',()=>{
 const c=normalizeControls({enabled:true,mode:'other',thread:'24V',internet:true,entries:[null]});assert.equal(c.mode,'wired');assert.equal(c.thread,'M30');assert.equal(c.controller,'auto');assert(calculateControls(c,1,'').errors.length);
});
test('Domyślny dobór bezprzewodowy',()=>assert.equal(defaults().mode,'wireless'));
test('Do czterech stref automatyczny L-4X bez rozszerzenia',()=>{
 const r=calculateControls({...config(),mode:'wireless'},4,'');assert.deepEqual(r.rows.map(r=>r[3]),['techL4X','techWireless','techM30']);
});
test('Piąta strefa zmienia automatyczny dobór na L-X',()=>{
 const entries=Array.from({length:5},(_,i)=>({room:'R'+i,zone:'Z'+i,loops:'1'}));
 const r=calculateControls({...config(),entries},5,'');assert.deepEqual(r.errors,[]);assert.equal(r.rows[0][3],'techLX');assert(!r.rows.some(r=>r[3]==='techML4X'));
});
test('L-4X powyżej czterech stref otrzymuje ML-4X',()=>{
 const entries=Array.from({length:8},(_,i)=>({room:'R'+i,zone:'Z'+i,loops:'1'}));
 const r=calculateControls({...config(),controller:'l4x',entries},8,'');assert.deepEqual(r.errors,[]);assert.equal(r.rows[0][3],'techL4X');assert.equal(r.rows[1][3],'techML4X');
});
test('Żaden wariant nie dolicza osobnego modułu internetowego',()=>{
 for(const controller of ['auto','l4x','lx'])for(const mode of ['wired','wireless']){
  const r=calculateControls({...config(),controller,mode,internet:true},4,'');assert.deepEqual(r.errors,[]);assert(!r.rows.some(r=>r[0].includes('Wi-Fi RS')));
 }
});
test('Stary wybór L-8e migruje do nowego doboru bez dopłaty za internet',()=>{
 const c=normalizeControls({...config(),mode:'wireless',internet:true});assert.equal(c.controller,'auto');assert.equal(c.internet,undefined);assert.equal(calculateControls(c,4,'').rows[0][3],'techL4X');
});
console.log(count+' testów zakończonych pomyślnie');
