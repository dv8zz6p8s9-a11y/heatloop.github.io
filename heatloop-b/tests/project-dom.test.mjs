import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);const {JSDOM}=require('jsdom');
import fs from 'node:fs';import assert from 'node:assert/strict';
import * as drawingTools from '../drawing-tools.mjs';
import * as drawingHelp from '../drawing-help.mjs';
import * as boiler from '../boiler-room.mjs';
import {mountBoiler} from '../boiler-room-ui.mjs';
import * as tech from '../tech-controls.mjs';
import * as floor from '../floor-loops.mjs';
import {mountLoopPlanner} from '../floor-loops-ui.mjs';
import {mountControls} from '../tech-controls-ui.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const dom=new JSDOM(fs.readFileSync(root+'index.html','utf8'),{runScripts:'outside-only',url:'http://localhost/heatloop-b/'});const w=dom.window;const runtimeErrors=[];w.addEventListener('error',e=>runtimeErrors.push(e.error?.message||e.message));globalThis.document=w.document;globalThis.window=w;
w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:()=>()=>{},set:()=>true});w.scrollTo=()=>{};w.alert=message=>{throw Error(message)};w.confirm=()=>true;globalThis.confirm=w.confirm;globalThis.alert=w.alert;w.Blob=Blob;w.URL.createObjectURL=blob=>{w.lastBlob=blob;return 'blob:mock'};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};
w.__drawingTools=drawingTools;w.__drawingHelp=drawingHelp;w.__tech=tech;w.__mount=mountControls;w.__floor=floor;w.__loopMount=mountLoopPlanner;w.__boiler=boiler;w.__boilerMount=mountBoiler;
let code=fs.readFileSync(root+'app.js','utf8').replace(/^import .*;\n/gm,'');
code='const {drawRaster,rotateDrawing,rotationValue,normalizeWallGuides,detectWallCandidates}=window.__drawingTools;const {drawingHelpSnapshot,drawingHelpAdvice}=window.__drawingHelp;const {catalog:techCatalog,defaults:techDefaults,normalizeControls,projectSignature,calculateControls}=window.__tech;const mountControls=window.__mount;const {planDefaults,normalizePlan,ensureRoomIds,prepareAssignments,analyzeLoops,controlEntries,numberPL,loopLabel}=window.__floor;const mountLoopPlanner=window.__loopMount;const {boilerDefaults,normalizeBoiler,boilerKeys,analyzeBoiler,boilerQuoteRows}=window.__boiler;const mountBoiler=window.__boilerMount;\n'+code;
w.eval(code+'\nwindow.testOffer=()=>offerHtml(offerSnapshot());window.testState=()=>state;window.testImage=()=>{image={};};');
const $=id=>w.document.getElementById(id);
const change=(id,value)=>{const el=$(id);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new w.Event(el.tagName==='SELECT'||el.type==='checkbox'?'change':'input',{bubbles:true}))};
function cell(row,index,value){const el=$('tRooms').rows[row].querySelectorAll('input')[index];el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}))}
assert($('qRows').rows.length);change('tEnabled',true);assert($('qExport').disabled);$('tAdd').click();cell(0,0,'Salon');cell(0,1,'Dzienna');cell(0,2,'3');change('qLoops','3');assert(!$('qExport').disabled);assert($('qRows').textContent.includes('WG.20.0176'));
change('tMode','wireless');change('tController','lx');assert($('qRows').textContent.includes('WG.20.0156'));assert(!$('qRows').textContent.includes('WG.05.0049'));
const price=$('qRows').querySelector('input[aria-label^="Cena: TECH R-8b"]');price.value='200,50';price.dispatchEvent(new w.Event('input',{bubbles:true}));assert($('tStatus').textContent.replace(/\s/g,'').includes('2540,50'));
assert(w.testOffer().includes('WG.20.0156'));$('qExport').click();assert((await w.lastBlob.text()).includes('WG.20.0156'));
$('save').click();const saved=JSON.parse(await w.lastBlob.text());assert.equal(saved.controls.controller,'lx');assert.equal(saved.controls.internet,undefined);assert.equal(saved.quote.prices.techWireless,200.5);
change('tMode','wired');assert($('qRows').textContent.includes('WG.11.0730'));
async function load(obj){await $('projectFile').onchange({target:{files:[{size:100,text:async()=>JSON.stringify(obj)}]}})}
await load(saved);assert($('tEnabled').checked&&$('tController').value==='lx');assert.equal($('tRooms').rows.length,1);assert.equal($('qRows').querySelector('input[aria-label^="Cena: TECH R-8b"]').value,'200,5');
const old={version:1,rooms:[{name:'Pokój',area:15,load:60,spacing:15,heatingType:'wet'},{name:'Grzejnik',area:10,load:60,spacing:15,heatingType:'radiators'}],polygons:[],pipes:[],scale:null};await load(old);assert(!$('tEnabled').checked);
change('tEnabled',true);$('tFromProject').click();assert.equal($('tRooms').rows.length,1);assert.equal($('tRooms').querySelectorAll('input')[2].value,'');cell(0,2,'2');change('qLoops','2');assert(!$('qExport').disabled);
$('rooms').rows[0].querySelector('button').click();assert($('tStatus').textContent.includes('zmieniły'));assert($('qExport').disabled);change('tEnabled',false);assert(!$('qExport').disabled);
// Planner: generation, manifold placement, full route, quote + TECH link and round trip.
await load({version:1,rooms:[{name:'Salon',area:30,load:60,spacing:15,heatingType:'wet'}],polygons:[],pipes:[],scale:.1});
$('pGenerate').click();assert.equal($('pLoops').rows.length,4);assert(!$('pExport').disabled);
const bounds={left:0,top:0,width:1000,height:700};$('canvas').getBoundingClientRect=()=>bounds;
$('pPlace').click();$('canvas').dispatchEvent(new w.MouseEvent('pointerdown',{clientX:100,clientY:100}));assert.deepEqual({...w.testState().loopPlan.manifold},{x:100,y:100});
$('pGenerate').click();
$('pLoops').rows[0].querySelector('button').click();$('canvas').dispatchEvent(new w.MouseEvent('pointerdown',{clientX:130,clientY:140}));$('finish').click();assert.equal(w.testState().loopPlan.loops[0].route.length,3);assert.equal(floor.analyzeLoops(w.testState()).rows[0].length,10);
change('pLinked',true);assert.equal($('qLoops').value,'4');assert.equal($('qFloorLength').value,'205.00');assert($('qLoops').readOnly);change('tEnabled',true);assert.equal($('tRooms').rows[0].querySelectorAll('input')[2].value,'4');assert($('tRooms').rows[0].querySelectorAll('input')[2].readOnly);assert(!$('qExport').disabled);assert(w.testOffer().includes('R1/P4'));assert(w.testOffer().includes('l/min'));
$('pExport').click();assert((await w.lastBlob.text()).includes('R1/P4'));
$('save').click();const planned=JSON.parse(await w.lastBlob.text());await load(planned);assert($('pLinked').checked);assert.equal(w.testState().loopPlan.loops[0].route.length,3);assert.equal($('qFloorLength').value,'205.00');
change('pDt','10');assert.equal($('qDt').value,'10');assert(Math.abs(floor.analyzeLoops(w.testState()).flow-1800/(1.163*10))<1e-8);
const out=$('pRooms').rows[0].querySelectorAll('input')[1];out.value='6';out.dispatchEvent(new w.Event('input'));assert($('qExport').disabled);assert($('pExport').disabled);assert($('pStatus').textContent.includes('zmieniły'));
change('pLinked',false);assert(!$('qLoops').readOnly);assert(!$('tAdd').disabled);
// Boiler room: layout, source-dependent equipment, reference power and linked budget.
await load({version:1,rooms:[{name:'Dom',area:100,load:80,spacing:15,heatingType:'wet'}],polygons:[],pipes:[],scale:null});
w.document.querySelector('[data-source="gas"]').click();change('bCwu','none');assert(!$('bExport').disabled);assert($('bKpis').textContent.includes('9,2'));assert($('bDiagram').querySelector('svg'));assert($('bItems').textContent.includes('Naczynie przeponowe CO'));
change('bLinked',true);assert(!$('qExport').disabled);assert($('qRows').textContent.includes('Kotłownia (wstępnie)'));assert(w.testOffer().includes('Kotłownia — dobór wstępny'));
const mountPrice=$('bItems').querySelector('tr[data-key="bMount"] input[aria-label^="Cena kotłowni:"]');mountPrice.value='1000';mountPrice.dispatchEvent(new w.Event('input'));const mountOffer=w.testOffer();assert(mountOffer.includes('Robocizna netto: <b>1000,00 zł</b>'));assert(mountOffer.includes('Montaż, płukanie i uruchomienie kotłowni'));
const gasPrice=$('bItems').querySelector('tr[data-key="bGasSource"] input[aria-label^="Cena kotłowni:"]');gasPrice.value='12345,50';gasPrice.dispatchEvent(new w.Event('input'));assert($('qRows').textContent.includes('12 345,50')||$('qRows').textContent.includes('12345,50'));
gasPrice.value='';gasPrice.dispatchEvent(new w.Event('input'));assert($('qExport').disabled);gasPrice.value='12345,50';gasPrice.dispatchEvent(new w.Event('input'));assert(!$('qExport').disabled);
const builtIn=$('bItems').querySelector('tr[data-key="bPrimaryPump"] input[aria-label^="Już w zestawie:"]');builtIn.value='1';builtIn.dispatchEvent(new w.Event('change'));assert(!$('qRows').textContent.includes('Kotłownia (wstępnie): Pompa obiegu źródła'));
$('save').click();const boilerSaved=JSON.parse(await w.lastBlob.text());assert(boilerSaved.boiler.linked);assert.equal(boilerSaved.quote.prices.bGasSource,12345.5);await load(boilerSaved);assert($('bLinked').checked);assert.equal(w.testState().boiler.included.bPrimaryPump,1);
$('bExport').click();assert((await w.lastBlob.text()).includes('Naczynie przeponowe CO'));
w.document.querySelector('[data-source="heatpump"]').click();assert(!$('bItems').textContent.includes('System powietrzno-spalinowy'));assert($('bItems').textContent.includes('Pompa ciepła'));
change('bRequiredFlow','1000');change('bAvailableFlow','0');assert($('qExport').disabled);change('bAvailableFlow','1000');assert(!$('qExport').disabled);
w.document.querySelector('[data-source="wood"]').click();assert($('qExport').disabled);change('bSolidClosed',true);assert(!$('qExport').disabled);assert($('bItems').textContent.includes('ochrony temperatury powrotu'));
change('bBasis','ozc');assert($('qExport').disabled);change('bOzc','6,5');assert(!$('qExport').disabled);assert.equal(boiler.analyzeBoiler(w.testState()).baseKW,6.5);
console.log('PASS DOM: boiler source selection, diagram, demand, linked quote, price validation, built-in equipment, save/load, CSV, heat pump, safety and OZC');
console.log('PASS DOM: planner generation, R1 placement, drawn loop, per-loop flow, linked quote and TECH, CSV, offer HTML, save/load, live delta T and stale-plan block');
console.log('PASS DOM: initial load, optional quote, variants, price edit, offer HTML, CSV, JSON save/load, old project, room import, stale project block');assert.deepEqual(runtimeErrors,[]);
// Installer labor: m² without reserve/approaches, one fee for the whole supply.
await load({version:1,rooms:[{name:'Salon',area:30,load:60,spacing:15,heatingType:'wet'},{name:'Sypialnia',area:15,load:50,spacing:15,heatingType:'milled'},{name:'Grzejniki',area:20,load:60,spacing:15,heatingType:'radiators'}],polygons:[],pipes:[],scale:.1});
$('qFromProject').click();change('qLaborFloor','40');change('qLaborFeed','1200');
const quoteRow=prefix=>[...$('qRows').rows].find(r=>r.cells[0].textContent.startsWith(prefix));
assert.equal($('qFloorArea').value,'45');assert.equal(quoteRow('Robocizna — montaż ogrzewania').cells[1].textContent,'45,00');assert.equal(quoteRow('Robocizna — montaż ogrzewania').cells[2].textContent,'m²');assert.equal(quoteRow('Robocizna — montaż ogrzewania').cells[4].textContent,'1800,00');
assert.equal(quoteRow('Robocizna — montaż zasilania').cells[1].textContent,'1,00');assert.equal(quoteRow('Robocizna — montaż zasilania').cells[4].textContent,'1200,00');
change('qReserve','50');assert.equal(quoteRow('Robocizna — montaż ogrzewania').cells[4].textContent,'1800,00');change('qSupply','40');assert.equal(quoteRow('Robocizna — montaż zasilania').cells[4].textContent,'1200,00');
$('pAdd').click();assert.equal($('pSelect').value,'R2');
const assignment=$('pRooms').rows[1].querySelector('select');assignment.value='R2';assignment.dispatchEvent(new w.Event('change'));
change('pSupply','15');change('pReturn','17');$('pPlace').click();$('canvas').dispatchEvent(new w.MouseEvent('pointerdown',{clientX:200,clientY:200}));$('pGenerate').click();change('pLinked',true);change('tEnabled',true);
assert(!$('qExport').disabled);assert($('pLoops').textContent.includes('R2/P1'));assert($('qRows').textContent.includes('Rozdzielacz R1 — 4 sekcji'));assert($('qRows').textContent.includes('Rozdzielacz R2 — 2 sekcji'));
assert.equal(quoteRow('Zawory odcinające').cells[1].textContent,'4,00');assert.equal($('qSupply').value,'25');assert.equal($('qReturn').value,'27');assert.equal(quoteRow('Robocizna — montaż zasilania').cells[4].textContent,'1200,00');
const controllers=[...$('qRows').rows].filter(r=>r.cells[0].textContent.includes('WG.20.0176'));assert.equal(controllers.length,2);assert(w.testOffer().includes('R2/P1'));
const r2row=[...$('pLoops').rows].find(r=>r.cells[0].textContent==='R2/P1');r2row.querySelector('button').click();$('canvas').dispatchEvent(new w.MouseEvent('pointerdown',{clientX:230,clientY:240}));$('finish').click();
const r2loop=w.testState().loopPlan.loops.find(l=>l.manifoldId==='R2'&&l.section===1);assert.equal(r2loop.route[0].x,200);assert.equal(r2loop.route.at(-1).x,200);assert.equal(floor.analyzeLoops(w.testState()).errors.length,0);
const r2price=$('qRows').querySelector('input[aria-label="Cena: Rozdzielacz R2 — 2 sekcji"]');r2price.value='222';r2price.dispatchEvent(new w.Event('input'));$('save').click();const multi=JSON.parse(await w.lastBlob.text());await load(multi);assert.equal(w.testState().loopPlan.manifolds.length,2);assert.equal($('qFloorArea').value,'45');assert.equal($('qLaborFloor').value,'40');assert.equal($('qLaborFeed').value,'1200');assert.equal(w.testState().quote.prices.manifold_R2,222);assert(!$('qExport').disabled);
$('qExport').click();const csv=await w.lastBlob.text();assert(csv.includes('"45";"m²";"40";"1800"'));assert(csv.includes('"1";"kpl.";"1200";"1200"'));
const legacy=JSON.parse(JSON.stringify(multi));delete legacy.quote.laborUnitsVersion;legacy.quote.values.qLaborFloor='7';legacy.quote.values.qLaborFeed='9';await load(legacy);assert.equal($('qLaborFloor').value,'0');assert.equal($('qLaborFeed').value,'0');assert(!$('qLaborMigration').hidden);
change('pLinked',false);change('tEnabled',false);change('qFloorArea','');assert($('qExport').disabled);change('qFloorArea','0');change('qLaborFloor','50');assert($('qExport').disabled);
assert.deepEqual(runtimeErrors,[]);console.log('PASS DOM: m² labor, lump-sum supply, reserve independence, multiple manifolds, R2 route, TECH, individual prices, CSV/PDF, JSON and legacy migration');
// Quote-only workflow: two manifolds without rooms, and separate milling labor.
await load({version:1,rooms:[],polygons:[],pipes:[],scale:null});
change('qLoops','14');change('qFloorLength','1000');change('qFloorArea','75');change('qMilledArea','75');change('qLaborFloor','40');change('qLaborMilling','60');change('qLaborFeed','1200');
$('qAddManifold').click();
const sections=(id,value)=>{const el=$('qManifoldList').querySelector('input[aria-label="Liczba sekcji '+id+'"]');el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
sections('R1','7');sections('R2','7');assert.equal($('qLoops').value,'14');assert($('qLoops').readOnly);assert(!$('qExport').disabled);
assert(quoteRow('Rozdzielacz R1 — 7 sekcji'));assert(quoteRow('Rozdzielacz R2 — 7 sekcji'));assert(quoteRow('Szafka R1'));assert(quoteRow('Szafka R2'));assert.equal(quoteRow('Zawory odcinające').cells[1].textContent,'4,00');
assert.equal(quoteRow('Robocizna — montaż ogrzewania').cells[4].textContent,'3000,00');assert.equal(quoteRow('Robocizna — frezowanie').cells[2].textContent,'m²');assert.equal(quoteRow('Robocizna — frezowanie').cells[4].textContent,'4500,00');assert.equal(quoteRow('Robocizna — montaż zasilania').cells[4].textContent,'1200,00');
change('qReserve','30');assert.equal(quoteRow('Robocizna — frezowanie').cells[4].textContent,'4500,00');change('qMilledArea','76');assert($('qExport').disabled);change('qMilledArea','75');sections('R2','0');assert($('qExport').disabled);sections('R2','7');assert(!$('qExport').disabled);
const millingPrice=$('qRows').querySelector('input[aria-label="Cena: Robocizna — frezowanie posadzki"]');millingPrice.value='65';millingPrice.dispatchEvent(new w.Event('input'));assert.equal($('qLaborMilling').value,'65');assert.equal(quoteRow('Robocizna — frezowanie').cells[4].textContent,'4875,00');
$('save').click();const manual=JSON.parse(await w.lastBlob.text());await load(manual);assert.equal($('qManifoldList').querySelectorAll('input').length,2);assert.equal($('qLoops').value,'14');assert.equal($('qLaborMilling').value,'65');assert(!$('qExport').disabled);assert(w.testOffer().includes('frezowanie posadzki'));$('qExport').click();assert((await w.lastBlob.text()).includes('"75";"m²";"65";"4875"'));
change('tEnabled',true);assert($('qExport').disabled);assert($('tStatus').textContent.includes('Przy kilku rozdzielaczach'));change('tEnabled',false);assert(!$('qExport').disabled);
$('qManifoldList').querySelector('button[aria-label="Usuń rozdzielacz i szafkę R2"]').click();assert.equal($('qLoops').value,'7');assert(!$('qLoops').readOnly);assert(!quoteRow('Szafka R2'));assert.equal(quoteRow('Zawory odcinające').cells[1].textContent,'2,00');
await load({version:1,rooms:[{name:'Mokra',area:30,load:60,spacing:15,heatingType:'wet'},{name:'Frezowana',area:15,load:50,spacing:15,heatingType:'milled'}],polygons:[],pipes:[],scale:null});$('qFromProject').click();assert.equal($('qFloorArea').value,'45');assert.equal($('qMilledArea').value,'15');$('pGenerate').click();change('pLinked',true);assert($('qAddManifold').disabled);assert.equal($('qMilledArea').value,'15');change('pLinked',false);assert.equal($('qLoops').value,'6');assert.equal($('qManifoldList').querySelector('input').value,'6');assert(!$('qAddManifold').disabled);
assert.deepEqual(runtimeErrors,[]);console.log('PASS DOM: direct 7+7 manifolds and cabinets, separate milling labor, installer price edit, area validation, JSON/CSV/offer and linked-plan transition');
// Catalogue selection, gas CWU variants, own brands and persistence in the real form.
await load({version:1,rooms:[{name:'Dom',area:100,load:80,spacing:15,heatingType:'wet'}],polygons:[],pipes:[],scale:null});
w.document.querySelector('[data-source="pellet"]').click();change('bBrand','sas');assert.equal($('bCatalogModel').options.length,9);
change('bCatalogModel','BIO EFEKT PLUS');assert($('bModel').closest('label').hidden);assert($('bItems').textContent.includes('SAS BIO EFEKT PLUS'));
change('bCwu','none');change('bSolidClosed',true);change('bRated','17');change('bLinked',true);assert(w.testOffer().includes('SAS BIO EFEKT PLUS'));
$('save').click();const sasSaved=JSON.parse(await w.lastBlob.text());await load(sasSaved);assert.equal($('bBrand').value,'sas');assert.equal($('bCatalogModel').value,'BIO EFEKT PLUS');assert.equal($('bRated').value,'17');
$('bExport').click();assert((await w.lastBlob.text()).includes('SAS BIO EFEKT PLUS'));
w.document.querySelector('[data-source="combo"]').click();assert.equal($('bModel').value,'');change('bBrand','sas');assert.equal($('bCatalogModel').options.length,2);change('bCatalogModel','BIO GREEN PLUS');assert($('bItems').textContent.includes('SAS BIO GREEN PLUS'));
w.document.querySelector('[data-source="gas"]').click();assert.equal($('bBrand').options.length,6);assert(!$('bCwu').disabled);assert.equal($('bGasKind').options.length,2);
change('bBrand','de-dietrich');change('bModel','MCR');change('bGasKind','single');change('bCwu','storage');change('bTank','150');assert($('bItems').textContent.includes('Zasobnik ciepłej wody'));assert(w.testOffer().includes('De Dietrich MCR'));
change('bTankSupply','included');assert(!$('qRows').querySelector('input[aria-label^="Cena: Kotłownia (wstępnie): Zasobnik"]'));assert(w.testOffer().includes('zestaw z zasobnikiem CWU'));$('save').click();const packageSaved=JSON.parse(await w.lastBlob.text());await load(packageSaved);assert.equal($('bTankSupply').value,'included');change('bTankSupply','separate');assert($('qRows').querySelector('input[aria-label^="Cena: Kotłownia (wstępnie): Zasobnik"]'));change('bCwu','none');assert.equal($('bGasKind').value,'single');assert.equal($('bCwu').value,'none');assert(!$('bItems').textContent.includes('Zasobnik ciepłej wody'));
change('bGasKind','combi');assert.equal($('bCwu').value,'instant');assert(!$('bItems').textContent.includes('Zasobnik ciepłej wody'));assert(w.testOffer().includes('Dwufunkcyjny'));
change('bBrand','other');change('bModel','Własny producent i model');assert(w.testOffer().includes('Własny producent i model'));
$('save').click();const gasSaved=JSON.parse(await w.lastBlob.text());await load(gasSaved);assert.equal($('bGasKind').value,'combi');assert.equal($('bBrand').value,'other');assert.equal($('bModel').value,'Własny producent i model');assert.equal($('bCwu').value,'instant');
assert.deepEqual(runtimeErrors,[]);console.log('PASS DOM: SAS models, gas brands and variants, CWU equipment, custom names, offer/CSV and JSON round trip');
// Air-to-water catalogue and hydraulic packages share the same quote and persistence.
await load({version:1,rooms:[{name:'Podłoga',area:80,load:50,spacing:15,heatingType:'wet'},{name:'Grzejnik',area:20,load:60,spacing:15,heatingType:'radiators'}],polygons:[],pipes:[],scale:null});
w.document.querySelector('[data-source="heatpump"]').click();change('bCwu','none');change('bBrand','panasonic');assert.equal($('bCatalogModel').options.length,7);change('bCatalogModel','aquarea-m-16');assert($('bItems').textContent.includes('16 kW'));assert($('bDeviceInfo').textContent.includes('16 kW'));assert.equal($('bRated').value,'');
change('bRated','16');change('bTopology','distribution');change('bHydraulicModel','ksv-2-hw');assert.equal($('bHydraulicSections').value,'2');assert($('bHydraulicSections').disabled);assert.equal($('bHydraulicPower').value,'70');assert($('bHydraulicPower').disabled);
change('bMixModel','primotherm-2');change('bDirectModel','primotherm-1');assert($('bItems').textContent.includes('ARM 343'));assert(!$('bExport').disabled);change('bLinked',true);assert(w.testOffer().includes('KSV 125-2 HW'));assert(w.testOffer().includes('Aquarea T-CAP M'));assert(!w.testOffer().includes('WOMIX SL 10'));
change('bFloorGroups','2');assert($('qExport').disabled);change('bHydraulicModel','ksv-3-hw');assert(!$('qExport').disabled);assert($('bHydraulicInfo').textContent.includes('3 miejsc'));assert.equal($('bItems').querySelector('tr[data-key="bMixGroup"]').cells[1].textContent,'2 kpl.');
change('bMixModel','smt-125');assert($('bItems').textContent.includes('WOMIX SL 10'));const actuator=$('bItems').querySelector('tr[data-key="bMixActuator"]');assert.equal(actuator.cells[1].textContent,'2 kpl.');
const hydraulicPrice=$('bItems').querySelector('tr[data-key="bDistribution"] input[aria-label^="Cena kotłowni:"]');hydraulicPrice.value='1500';hydraulicPrice.dispatchEvent(new w.Event('input'));$('save').click();const hpSaved=JSON.parse(await w.lastBlob.text());await load(hpSaved);assert.equal($('bBrand').value,'panasonic');assert.equal($('bCatalogModel').value,'aquarea-m-16');assert.equal($('bHydraulicModel').value,'ksv-3-hw');assert.equal($('bMixModel').value,'smt-125');assert.equal(w.testState().quote.prices.bDistribution,1500);assert(!$('qExport').disabled);$('bExport').click();const hpCsv=await w.lastBlob.text();assert(hpCsv.includes('KSV 125-3 HW'));assert(hpCsv.includes('1500'));assert(hpCsv.includes('16 kW'));
change('bDt','4');assert($('qExport').disabled);assert($('bFindings').textContent.includes('Przepływ źródła'));change('bDt','10');assert(!$('qExport').disabled);
change('bTopology','separator');change('bHydraulicModel','cpn-70');change('bHydraulicSections','3');assert($('bItems').textContent.includes('WOMIX C 70'));assert(!$('bItems').querySelector('tr[data-key="bDistribution"]'));assert($('bItems').querySelector('tr[data-key="bHeatingManifold"]'));
change('bTopology','direct');assert(!$('bItems').querySelector('tr[data-key="bSeparator"]'));assert(!$('bItems').querySelector('tr[data-key="bHeatingManifold"]'));
change('bBrand','mitsubishi');assert.equal($('bCatalogModel').options.length,6);change('bCatalogModel','ecodan-r290-8');assert($('bItems').textContent.includes('klasa 8 kW'));change('bBrand','vaillant');assert.equal($('bCatalogModel').options.length,5);change('bCatalogModel','arotherm-plus-12');assert($('bItems').textContent.includes('VWL 125/6 A'));change('bHpKind','ground');assert.equal($('bCatalogModel').value,'');assert($('bCatalogModel').closest('label').hidden);assert.equal($('bModel').value,'');
assert.deepEqual(runtimeErrors,[]);console.log('PASS DOM: heat pump catalogue, hydraulic circuits, group quantities, actuator, flow validation, quote/offer/CSV and JSON');

// Read-only bridge, JSON compatibility and rotation of real application state.
await load({version:1,rooms:[],polygons:[{name:'PRIVATE_CLIENT',area:20,load:60,spacing:15,heatingType:'wet',points:[{x:100,y:100},{x:300,y:100},{x:300,y:250},{x:100,y:250}]}],pipes:[],scale:0.1,background:null,drawingRotation:90,wallGuides:[{points:[{x:100,y:100},{x:300,y:100}],thickness:5}]});
let payload;const beforePreview=JSON.stringify(w.testState());w.document.dispatchEvent(new w.CustomEvent('heatloop:preview-request',{detail:{provide:value=>payload=value}}));assert(payload,JSON.stringify(runtimeErrors));assert.equal(payload.snapshot.roomCount,1);assert(!JSON.stringify(payload).includes('PRIVATE_CLIENT'));assert.equal(JSON.stringify(w.testState()),beforePreview);
assert.equal(w.testState().drawingRotation,90);assert.equal(w.testState().wallGuides.length,1);$('save').click();const oriented=JSON.parse(await w.lastBlob.text());await load(oriented);assert.equal(w.testState().drawingRotation,90);assert.equal(w.testState().wallGuides.length,1);
console.log('PASS DOM: local helper preview is read-only and anonymized; rotation/wall metadata survive JSON');

// Real rotate button keeps the linked quote and physical geometry consistent.
await load({version:1,rooms:[],polygons:[{name:'Salon',area:20,load:60,spacing:15,heatingType:'wet',points:[{x:100,y:100},{x:300,y:100},{x:300,y:250},{x:100,y:250}]}],pipes:[],scale:0.1});
$('pGenerate').click();change('pLinked',true);const quoteBeforeRotation=$('qTotal').textContent;const drawingBeforeRotation=JSON.parse(JSON.stringify(w.testState()));w.testState().background='data:image/png;base64,AAAA';$('rotateRight').click();assert.equal(w.testState().drawingRotation,90);assert.equal($('qTotal').textContent,quoteBeforeRotation);assert(!$('qExport').disabled);assert(Math.abs(w.testState().scale-0.1/0.7)<1e-9);assert.equal(w.testState().polygons[0].area,20);$('rotateLeft').click();assert.equal(w.testState().drawingRotation,0);assert(Math.abs(w.testState().polygons[0].points[0].x-drawingBeforeRotation.polygons[0].points[0].x)<1e-7);assert.equal($('qTotal').textContent,quoteBeforeRotation);
console.log('PASS DOM: rotation buttons preserve the linked quote, room area, scale and coordinates');
// Wall proposals require selection and acceptance; they do not create rooms or alter quotes.
const wallRaster={data:new Uint8ClampedArray(1000*700*4).fill(255),width:1000,height:700};for(let y=20;y<26;y++)for(let x=20;x<220;x++){const i=(y*1000+x)*4;wallRaster.data[i]=wallRaster.data[i+1]=wallRaster.data[i+2]=0;}
w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({getImageData:()=>wallRaster},{get:(target,key)=>target[key]||(()=>{}),set:(target,key,value)=>{target[key]=value;return true;}});w.testImage();const areaBeforeWalls=w.testState().polygons[0].area;await $('detectWalls').onclick();assert.equal($('wallCandidates').querySelectorAll('input').length,1);assert.equal(w.testState().wallGuides.length,0);$('wallCandidates').querySelector('input').checked=false;$('acceptWalls').click();assert.equal(w.testState().wallGuides.length,0);$('wallCandidates').querySelector('input').checked=true;$('acceptWalls').click();assert.equal(w.testState().wallGuides.length,1);assert.equal(w.testState().polygons[0].area,areaBeforeWalls);assert.equal($('qTotal').textContent,quoteBeforeRotation);$('save').click();assert.equal(JSON.parse(await w.lastBlob.text()).wallGuides.length,1);$('clearWalls').click();assert.equal(w.testState().wallGuides.length,0);assert.equal($('qTotal').textContent,quoteBeforeRotation);
console.log('PASS DOM: wall detection, explicit selection/acceptance, JSON and clearing preserve rooms and quote');
assert.deepEqual(runtimeErrors,[]);w.close();
