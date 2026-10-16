import {modelsFor,deviceName,setGasKind} from '../boiler-catalog.mjs';
import assert from 'node:assert/strict';
import {boilerDefaults,normalizeBoiler,analyzeBoiler,boilerQuoteRows,projectDemand} from '../boiler-room.mjs';
const fixture=()=>({rooms:[{name:'Podłoga',area:100,load:50,spacing:15,heatingType:'wet'},{name:'Grzejniki',area:50,load:60,spacing:15,heatingType:'radiators'}],polygons:[],boiler:{...boilerDefaults(),source:'gas',cwu:'none'}});
let count=0;function test(name,fn){fn();count++;console.log('OK:',name)}
test('Zapotrzebowanie pomieszczeń, nie suma mocy grzejników',()=>{
 const s=fixture();s.radiators=[{power:15000}];const r=analyzeBoiler(s);assert.equal(r.baseKW,8);assert(Math.abs(r.comparisonKW-9.2)<1e-10);assert.equal(r.demand.floorKW,5);assert.equal(r.demand.radKW,3);
});
test('Zapas dolicza się raz dla całego CO',()=>{const s=fixture();s.boiler.margin='15';assert.equal(analyzeBoiler(s).comparisonKW,projectDemand(s).totalKW*1.15)});
test('Wpisany wynik OZC zastępuje szacunek',()=>{const s=fixture();s.boiler.basis='ozc';s.boiler.ozc='6,5';assert.equal(analyzeBoiler(s).baseKW,6.5)});
test('Brak OZC blokuje obliczenia zamiast używać zera',()=>{const s=fixture();s.boiler.basis='ozc';assert(analyzeBoiler(s).errors.length)});
test('Dla gazu jest system powietrzno-spalinowy i kondensat',()=>{const r=analyzeBoiler(fixture());assert.deepEqual(r.errors,[]);assert(r.items.some(i=>i.key==='bGasFlue'));assert(r.items.some(i=>i.key==='bCondensate'))});
test('Sama pompa ciepła nie otrzymuje komina',()=>{const s=fixture();s.boiler.source='heatpump';const r=analyzeBoiler(s);assert(!r.items.some(i=>i.key.endsWith('Flue')));assert(r.items.some(i=>i.key==='bHpSource'))});
test('Gruntowa pompa nie otrzymuje odpływu odszraniania',()=>{const s=fixture();s.boiler.source='heatpump';s.boiler.hpKind='ground';const r=analyzeBoiler(s);assert(!r.items.some(i=>i.key==='bHpDrain'));assert(r.items.find(i=>i.key==='bHpBase').name.includes('Dolne źródło'))});
test('Hybryda ma dwa źródła i tylko komin gazowy',()=>{const s=fixture();s.boiler.source='hybrid';const r=analyzeBoiler(s);assert(r.items.some(i=>i.key==='bGasSource'));assert(r.items.some(i=>i.key==='bHpSource'));assert(r.items.some(i=>i.key==='bGasFlue'));assert(!r.items.some(i=>i.key==='bSolidFlue'))});
test('Paliwa stałe wymagają potwierdzenia dopuszczenia układu zamkniętego',()=>{for(const source of ['coal','pellet','combo','wood']){const s=fixture();s.boiler.source=source;assert(analyzeBoiler(s).errors.some(e=>e.includes('DTR')));s.boiler.solidClosed=true;assert.deepEqual(analyzeBoiler(s).errors,[])}});
test('Kocioł stałopalny ma ochronę powrotu i przegrzania',()=>{const s=fixture();s.boiler.source='wood';s.boiler.solidClosed=true;const r=analyzeBoiler(s);assert(r.items.some(i=>i.key==='bReturnProtection'));assert(r.items.some(i=>i.key==='bThermalProtection'))});
test('Układ otwarty otrzymuje odpowiednie naczynie',()=>{const s=fixture();s.boiler.source='pellet';s.boiler.system='open';const r=analyzeBoiler(s);assert(r.items.some(i=>i.key==='bOpenVessel'));assert(!r.items.some(i=>i.key==='bCoVessel'))});
test('Wymiennik między układami wymaga wyposażenia obu stron',()=>{const s=fixture();s.boiler.source='wood';s.boiler.system='open';s.boiler.topology='exchanger';const r=analyzeBoiler(s);assert(r.items.some(i=>i.key==='bOpenVessel'));assert(r.items.some(i=>i.key==='bCoVessel'))});
test('Podmieszanie zależy od temperatur, nie tylko typu źródła',()=>{const s=fixture();let r=analyzeBoiler(s);assert.equal(r.mixedGroups,1);assert.equal(r.directGroups,1);s.boiler.floorT='55';r=analyzeBoiler(s);assert.equal(r.mixedGroups,0);assert.equal(r.directGroups,2)});
test('Mieszacz nie może podwyższyć temperatury',()=>{const s=fixture();s.boiler.sourceT='30';assert(analyzeBoiler(s).errors.some(e=>e.includes('Temperatura źródła')))});
test('CWU liczone osobno bez dodawania do mocy CO',()=>{const s=fixture();Object.assign(s.boiler,{cwu:'storage',tank:'200',cold:'10',storage:'55',reheat:'60'});const r=analyzeBoiler(s);assert.deepEqual(r.errors,[]);assert(Math.abs(r.dhwEnergy-10.467)<1e-10);assert.equal(r.dhwPower,r.dhwEnergy);assert.equal(r.baseKW,8);assert(r.items.some(i=>i.key==='bCwuVessel'));assert(r.items.some(i=>i.key==='bCwuSafety'))});
test('Pojemność CWU i czas nagrzewania muszą być dodatnie',()=>{const s=fixture();s.boiler.cwu='storage';assert(analyzeBoiler(s).errors.length);s.boiler.tank='200';s.boiler.reheat='0';assert(analyzeBoiler(s).errors.length)});
test('Przepływowe CWU tylko dla gazu w tym module',()=>{const s=fixture();s.boiler.source='heatpump';s.boiler.cwu='instant';assert(analyzeBoiler(s).errors.length)});
test('Zamknięte strefy mogą blokować poprawność hydrauliki',()=>{const s=fixture();Object.assign(s.boiler,{requiredFlow:'1000',availableFlow:'500'});assert(analyzeBoiler(s).errors.some(e=>e.includes('Przepływ dostępny')))});
test('Weryfikacja brakującej czynnej pojemności',()=>{const s=fixture();Object.assign(s.boiler,{requiredVolume:'100',activeVolume:'40'});let r=analyzeBoiler(s);assert.equal(r.missingVolume,60);assert(r.errors.length);s.boiler.topology='buffer';s.boiler.buffer='80';assert.deepEqual(analyzeBoiler(s).errors,[])});
test('Bufor nie rozwiązuje automatycznie niedoboru przepływu',()=>{const s=fixture();Object.assign(s.boiler,{topology:'buffer',buffer:'200',requiredFlow:'1000',availableFlow:'0'});assert(analyzeBoiler(s).errors.length)});
test('Wyposażenie wbudowane nie jest liczone drugi raz',()=>{const s=fixture();s.boiler.included.bPrimaryPump=1;const r=analyzeBoiler(s);assert.equal(r.items.find(i=>i.key==='bPrimaryPump').buy,0);assert(!boilerQuoteRows(r).some(i=>i[3]==='bPrimaryPump'))});
test('Ilość wbudowana nie może przekroczyć potrzebnej',()=>{const s=fixture();s.boiler.included.bPrimaryPump=2;assert(analyzeBoiler(s).errors.length)});
test('Rury i izolacja mają tę samą zmierzoną długość',()=>{const s=fixture();s.boiler.pipeMeters='12,5';const r=analyzeBoiler(s);assert.equal(r.items.find(i=>i.key==='bPipes').qty,12.5);assert.equal(r.items.find(i=>i.key==='bInsulation').qty,12.5)});
test('Nieprawidłowe wartości i warianty są odrzucane',()=>{for(const patch of [{margin:'-1'},{margin:'NaN'},{dt:'0'},{floorGroups:'1.5'},{source:'other'},{system:'open'},{topology:'other'}]){const s=fixture();Object.assign(s.boiler,patch);assert(analyzeBoiler(s).errors.length)}});
test('Starsze projekty mają kotłownię niepowiązaną',()=>assert.deepEqual(normalizeBoiler(undefined),boilerDefaults()));
test('Konfiguracja kotłowni przechodzi zapis i odczyt',()=>{const s=fixture();s.boiler.included.bPrimaryPump=1;assert.deepEqual(normalizeBoiler(JSON.parse(JSON.stringify(s.boiler))),s.boiler)});
test('Metry wyposażenia już w zestawie mogą być ułamkowe',()=>{const s=fixture();s.boiler.pipeMeters='12,5';s.boiler.included.bPipes=2.5;const r=analyzeBoiler(s);assert.deepEqual(r.errors,[]);assert.equal(r.items.find(i=>i.key==='bPipes').buy,10)});
test('Podana pojemność naczynia nie może być zerowa',()=>{const s=fixture();s.boiler.coVessel='0';assert(analyzeBoiler(s).errors.length)});

test('Warianty gazowe doliczają zasobnik tylko dla kotła z zasobnikiem',()=>{
 const s=fixture();s.boiler.tank='150';
 for(const [kind,cwu,tank] of [['storage','storage',true],['heating','none',false],['combi','instant',false]]){
  setGasKind(s.boiler,kind);const r=analyzeBoiler(s);assert.deepEqual(r.errors,[]);assert.equal(s.boiler.cwu,cwu);assert.equal(r.items.some(i=>i.key==='bCwuTank'),tank);assert(r.items.find(i=>i.key==='bGasSource').name.includes(kind==='combi'?'Dwufunkcyjny':'Jednofunkcyjny'));
 }
 s.boiler.cwu='storage';assert(analyzeBoiler(s).errors.some(e=>e.includes('Wariant kotła')));
});
test('Starszy projekt zachowuje nazwę kotła i konfigurację CWU',()=>{
 for(const cwu of ['none','storage','instant']){const b=normalizeBoiler({source:'gas',model:'Mój stary kocioł',cwu,tank:'120'});const s=fixture();s.boiler=b;assert.deepEqual(analyzeBoiler(s).errors,[]);assert(analyzeBoiler(s).items[0].name.includes('Mój stary kocioł'));}
});
test('Katalog SAS oddziela paliwa i zachowuje model w eksporcie',()=>{
 assert.equal(modelsFor('coal','sas').length,5);assert.equal(modelsFor('pellet','sas').length,8);assert.equal(modelsFor('combo','sas')[0].name,'SAS BIO GREEN PLUS');
 const s=fixture();Object.assign(s.boiler,{source:'combo',brand:'sas',catalogModel:'BIO GREEN PLUS',model:'SAS BIO GREEN PLUS',solidClosed:true});
 assert(boilerQuoteRows(analyzeBoiler(s)).some(r=>r[0].includes('SAS BIO GREEN PLUS')));assert.deepEqual(normalizeBoiler(JSON.parse(JSON.stringify(s.boiler))),s.boiler);
 s.boiler.catalogModel='EFEKT';assert(analyzeBoiler(s).errors.some(e=>e.includes('model')));
});
test('Marka gazowa i własna nazwa trafiają do zestawienia bez powielania',()=>{
 const b={source:'gas',brand:'immergas',model:'VICTRIX'};assert.equal(deviceName(b),'Immergas VICTRIX');b.model='Immergas VICTRIX';assert.equal(deviceName(b),b.model);b.brand='other';b.model='Moja marka / model';assert.equal(deviceName(b),b.model);
});
test('Nieprawidłowy import katalogu zwraca błędy bez awarii',()=>{const s=fixture();Object.assign(s.boiler,{source:'constructor',brand:'sas',catalogModel:'EFEKT'});assert(analyzeBoiler(s).errors.length);s.boiler={...fixture().boiler,brand:'constructor'};assert(analyzeBoiler(s).errors.length)});
console.log(count+' testów zakończonych pomyślnie');
