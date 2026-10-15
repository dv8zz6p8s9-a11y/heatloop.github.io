import assert from 'node:assert/strict';
import {catalog,defaults,normalizeControls,calculateControls,projectSignature} from '../tech-controls.mjs';
const config=()=>({...defaults(),mode:'wired',enabled:true,entries:[{room:'Salon',zone:'Dzienna',loops:'2'},{room:'Kuchnia',zone:'Dzienna',loops:'1'},{room:'Sypialnia',zone:'Nocna',loops:'1'}]});
let count=0;
function test(name,fn){fn();count++;console.log('OK:',name)}
test('Opcja wyłączona nie dodaje produktów',()=>assert.equal(calculateControls(defaults(),8,'').rows.length,0));
test('Jedna strefa może mieć kilka pomieszczeń i pętli',()=>{
 const r=calculateControls(config(),4,'');assert.deepEqual(r.errors,[]);assert.equal(r.zones,2);assert.equal(r.loops,4);assert.equal(r.rows[1][1],2);assert.equal(r.rows[2][1],4);
 assert.equal(r.rows.reduce((sum,row)=>sum+row[1]*catalog[row[3]].net,0),1416);
});
test('Bezprzewodowy zestaw i moduł Wi-Fi RS',()=>{
 const r=calculateControls({...config(),mode:'wireless',thread:'M28',internet:true},4,'');
 assert.deepEqual(r.errors,[]);assert.deepEqual(r.rows.map(r=>r[3]),['techL8','techWireless','techM28','techWifi']);
 assert.equal(r.rows.reduce((s,r)=>s+r[1]*catalog[r[3]].net,0),3521);
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
 const c=normalizeControls({enabled:true,mode:'other',thread:'24V',internet:true,entries:[null]});assert.equal(c.mode,'wired');assert.equal(c.thread,'M30');assert.equal(c.internet,false);assert(calculateControls(c,1,'').errors.length);
});
test('Przewodowy zestaw nie otrzymuje Wi-Fi RS',()=>assert(calculateControls({...config(),internet:true},4,'').errors.length));
console.log(count+' testów zakończonych pomyślnie');
