import assert from 'node:assert/strict';
import {planDefaults,ensureRoomIds,normalizePlan,prepareAssignments,sourceSignature,proposeLoops,analyzeLoops,controlEntries,routeLength} from '../floor-loops.mjs';
const fixture=()=>{
 const state={rooms:[{name:'Salon',area:30,load:60,spacing:15,heatingType:'wet'}],polygons:[],scale:null,loopPlan:planDefaults()};
 ensureRoomIds(state);prepareAssignments(state);return state;
};
function generate(s){const r=proposeLoops(s);assert.deepEqual(r.errors,[]);s.loopPlan.loops=r.loops;s.loopPlan.signature=sourceSignature(s);return analyzeLoops(s)}
let count=0;function test(name,fn){fn();count++;console.log('OK:',name)}
test('Podział uwzględnia oba dojścia i zachowuje powierzchnię oraz moc',()=>{
 const s=fixture(),r=generate(s);assert.deepEqual(r.errors,[]);assert.equal(r.rows.length,4);assert.equal(r.totalLength,260);assert.equal(r.power,1800);assert.equal(r.rows[0].length,65);assert.equal(r.rows.reduce((sum,l)=>sum+l.area,0),30);assert(r.estimated);
 assert(Math.abs(r.flow-1800/(1.163*5))<1e-8);assert.equal(controlEntries(s,r)[0].loops,'4');
});
test('Dłuższe dojścia zwiększają liczbę pętli',()=>{const s=fixture();s.loopPlan.assignments[0].out='15';s.loopPlan.assignments[0].back='15';assert.equal(generate(s).rows.length,5)});
test('Dojścia wyczerpujące limit blokują propozycję',()=>{const s=fixture();s.loopPlan.assignments[0].out='80';assert(proposeLoops(s).errors.length)});
test('Ręczna liczba pętli jest sprawdzana względem limitu',()=>{const s=fixture();s.loopPlan.assignments[0].count='1';assert(generate(s).errors.some(e=>e.includes('limit')))});
test('Zmiana pomieszczenia wykrywa nieaktualny plan',()=>{const s=fixture();generate(s);s.rooms[0].area=31;assert(analyzeLoops(s).errors.length)});
test('Zmiana skali wykrywa nieaktualny plan',()=>{const s=fixture();generate(s);s.scale=.05;assert(analyzeLoops(s).errors.some(e=>e.includes('zmieniły')))});
test('Dwa pokoje z tą samą nazwą mają niezależne identyfikatory',()=>{const s=fixture();s.rooms.push({...s.rooms[0]});ensureRoomIds(s);prepareAssignments(s);const r=generate(s);assert.notEqual(s.rooms[0].loopRoomId,s.rooms[1].loopRoomId);assert.equal(r.rows.length,8)});
test('Grzejniki nie tworzą pętli podłogowych',()=>{const s=fixture();s.rooms.push({name:'Grzejnik',area:20,load:70,spacing:15,heatingType:'radiators'});ensureRoomIds(s);prepareAssignments(s);assert.equal(generate(s).power,1800)});
test('Pełna trasa zastępuje szacunek bez ponownego dodawania dojść',()=>{
 const s=fixture();s.scale=.1;s.loopPlan.manifold={x:0,y:0};generate(s);s.loopPlan.loops[0].route=[{x:0,y:0},{x:30,y:40},{x:0,y:0}];const r=analyzeLoops(s);assert.deepEqual(r.errors,[]);assert.equal(r.rows[0].length,10);assert.equal(r.totalLength,205);assert(r.rows[0].drawn);
});
test('Trasa musi wrócić do rozdzielacza',()=>{const s=fixture();s.scale=.1;s.loopPlan.manifold={x:0,y:0};generate(s);s.loopPlan.loops[0].route=[{x:0,y:0},{x:30,y:40},{x:20,y:0}];assert(analyzeLoops(s).errors.length)});
test('Zmiana R1 wymaga ponownego planu',()=>{const s=fixture();generate(s);s.loopPlan.manifold={x:10,y:10};assert(analyzeLoops(s).errors.length)});
test('Nieprawidłowe ΔT blokuje przepływy',()=>{const s=fixture();generate(s);s.loopPlan.dt='0';assert(analyzeLoops(s).errors.length)});
test('Sekcje nie mogą się powtarzać',()=>{const s=fixture();generate(s);s.loopPlan.loops[1].section=1;assert(analyzeLoops(s).errors.length)});
test('Stary projekt otrzymuje pusty niepowiązany plan',()=>assert.deepEqual(normalizePlan(undefined),planDefaults()));
test('Zapis i odczyt zachowuje plan, powiązania i trasy',()=>{const s=fixture();generate(s);s.loopPlan.linked=true;const p=normalizePlan(JSON.parse(JSON.stringify(s.loopPlan)));assert.deepEqual(p,s.loopPlan)});
test('Przecinek dziesiętny w dojściach',()=>{const s=fixture();s.loopPlan.assignments[0].out='5,5';assert.equal(generate(s).rows[0].out,5.5)});
test('Limit liczby pętli chroni przed nadmiernym generowaniem',()=>{const s=fixture();s.rooms[0].area=10000;assert(proposeLoops(s).errors.length)});
test('Długość wieloodcinkowej trasy według skali',()=>assert.equal(routeLength([{x:0,y:0},{x:3,y:4},{x:6,y:8}],2),20));
test('Dwa rozdzielacze zachowują sumy i numerują sekcje osobno',()=>{
 const s=fixture();s.rooms.push({name:'Pokój',area:15,load:50,spacing:15,heatingType:'wet'});ensureRoomIds(s);prepareAssignments(s);s.loopPlan.manifolds.push({id:'R2',supply:'15',return:'17',position:{x:200,y:200}});s.loopPlan.assignments[1].manifoldId='R2';const r=generate(s);assert.deepEqual(r.errors,[]);assert.equal(r.rows.length,6);assert.equal(r.rows.find(l=>l.manifoldId==='R2').section,1);assert.equal(r.rows.reduce((sum,l)=>sum+l.area,0),45);assert.equal(r.power,2550);assert.equal(controlEntries(s,r)[1].manifoldId,'R2');assert.deepEqual(normalizePlan(JSON.parse(JSON.stringify(s.loopPlan))),s.loopPlan);
 s.loopPlan.assignments[1].manifoldId='R1';assert(analyzeLoops(s).errors.length);
});
test('Nieistniejący rozdzielacz i błędna długość zasilania blokują plan',()=>{const s=fixture();s.loopPlan.assignments[0].manifoldId='R3';assert(proposeLoops(s).errors.length);s.loopPlan.assignments[0].manifoldId='R1';s.loopPlan.manifolds[0].supply='';assert(proposeLoops(s).errors.length)});
console.log(count+' testów zakończonych pomyślnie');
