import test from 'node:test';
import assert from 'node:assert/strict';
import {answer,modules} from '../engine.mjs';
import {drawingHelpSnapshot,drawingHelpAdvice,drawingPlanIssueCodes} from '../../heatloop-b/drawing-help.mjs';
import {planDefaults,ensureRoomIds,prepareAssignments,proposeLoops,sourceSignature,analyzeLoops} from '../../heatloop-b/floor-loops.mjs';

const prompts=[
 ['Jak ustawić wspólny regulator?','zones'],
 ['Jeden regulator dla dwóch pomieszczeń','zones'],
 ['Jak wyłączyć powiązanie planu z wyceną?','locked'],
 ['Jak włączyć powiązanie z wyceną?','locked'],
 ['Gdzie podać zasilanie rozdzielacza R2?','manifolds'],
 ['Jak umieścić rozdzielacz na rzucie?','manifolds'],
 ['Jak wskazać położenie rozdzielacza R2?','manifolds'],
 ['Co zrobić gdy mam 9 stref na rozdzielaczu?','tech'],
 ['Jak wyłączyć grupę pompową w wycenie podłogówki?','quote'],
 ['Jak wyeksportować wycenę CSV?','prices'],
 ['Czy ceny w ofercie są netto czy brutto?','vat'],
 ['Co oznacza obciążenie W/m² pokoju?','manual'],
 ['Co oznacza ostrzeżenie za mała moc źródła?','boiler'],
 ['Jak usunąć produkt z katalogu grzejników?','csv'],
 ['Do czego służy trasa rury pomocnicza?','drawing'],
 ['Jak wybrać system mieszany na rzucie?','mixed'],
 ['Jak zmienić technologię pomieszczenia na rzucie?','mixed'],
 ['Jak cofnąć ostatni punkt na rzucie?','drawing'],
 ['Jak usunąć bieżący szkic?','drawing'],
 ['Jak usunąć narysowaną trasę pętli?','route'],
 ['Jak zmienić próg ciemności wykrywania ścian?','drawing'],
 ['Jak usunąć zatwierdzone linie pomocnicze ścian?','drawing'],
 ['Czy JSON zapisuje obrót rzutu i linie ścian?','json']
];
for(const [question,id] of prompts)test('Refined help routes across screens: '+question,()=>{
 for(const module of modules)for(const q of [question,question.toUpperCase(),'  '+question+'  ',question.normalize('NFD')]){
  const r=answer(q,module,{pendingIds:['manifolds','quote'],lastArticleId:'json'});
  assert.equal(r.kind,'answer',module+': '+q);assert.equal(r.article.id,id,module+': '+q);
 }
});
function project(){
 const s={rooms:[],background:'data:image/png;base64,AAAA',scale:.1,polygons:[{name:'PRYWATNA NAZWA KLIENTA',area:20,load:50,spacing:15,heatingType:'wet',points:[{x:0,y:0},{x:100,y:0},{x:100,y:200},{x:0,y:200}]}],loopPlan:planDefaults()};
 ensureRoomIds(s);prepareAssignments(s);s.loopPlan.manifold={x:0,y:0};s.loopPlan.loops=proposeLoops(s).loops;s.loopPlan.signature=sourceSignature(s);return s;
}
const invalidStates=[
 ['approaches',s=>s.loopPlan.assignments[0].out='90',/suma musi być mniejsza/],
 ['stale',s=>s.polygons[0].load=70,/zastąpienie podziału usuwa/],
 ['limit',s=>s.loopPlan.maxLength='2',/10–300/],
 ['delta',s=>s.loopPlan.dt='0',/najwyżej 30/],
 ['pipe',s=>s.loopPlan.pipe='',/oznaczenie rury/],
 ['zone',s=>s.loopPlan.assignments[0].zone='',/nazwę strefy/],
 ['count',s=>s.loopPlan.assignments[0].count='0',/1–100/],
 ['feed',s=>s.loopPlan.manifolds[0].supply='-1',/0–10000/],
 ['endpoints',s=>s.loopPlan.loops[0].route=[{x:10,y:10},{x:50,y:50},{x:10,y:10}],/początek i koniec/],
 ['overlong',s=>s.loopPlan.loops[0].route=[{x:0,y:0},{x:1000,y:600},{x:0,y:0}],/podział pokoju/]
];
for(const [code,mutate,expected] of invalidStates)test('Actual plan validation yields private, actionable preview: '+code,()=>{
 const s=project();mutate(s);const original=JSON.stringify(s),analysis=analyzeLoops(s);
 assert(analysis.errors.length,code);
 const snapshot=drawingHelpSnapshot(s,{analysis});assert(snapshot.planIssueCodes.includes(code),JSON.stringify(snapshot.planIssueCodes));
 const advice=drawingHelpAdvice(snapshot);assert(advice.some(a=>expected.test(a.text)),code);
 assert(!JSON.stringify({snapshot,advice}).includes('PRYWATNA'));assert.equal(JSON.stringify(s),original);
});
test('Unknown errors and malformed codes cannot become copied instructions',()=>{
 const s=project();const snapshot=drawingHelpSnapshot(s,{analysis:{errors:['TAJNE <script>nieznany błąd</script>']}});
 assert.deepEqual(snapshot.planIssueCodes,['unknown']);assert(!JSON.stringify(snapshot).includes('TAJNE'));
 const text=drawingHelpAdvice(snapshot).map(a=>a.text).join(' ');assert.match(text,/brak szczegółowej wskazówki/);assert(!text.includes('script'));
 assert.deepEqual(drawingPlanIssueCodes(null),[]);assert.deepEqual(drawingPlanIssueCodes([null,42,{}]),[]);
});
test('Room labels cannot masquerade as another validator error',()=>{
 assert.deepEqual(drawingPlanIssueCodes(['wpisz strefę sterowania: prywatne: dojścia muszą być nieujemne i krótsze łącznie od limitu pętli.']),['approaches']);
});
