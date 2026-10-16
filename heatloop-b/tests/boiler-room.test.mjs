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
 for(const [kind,cwu,tank] of [['single','storage',true],['single','none',false],['combi','instant',false]]){
  s.boiler.cwu=cwu;setGasKind(s.boiler,kind);const r=analyzeBoiler(s);assert.deepEqual(r.errors,[]);assert.equal(s.boiler.cwu,cwu);assert.equal(r.items.some(i=>i.key==='bCwuTank'),tank);assert(r.items.find(i=>i.key==='bGasSource').name.includes(kind==='combi'?'Dwufunkcyjny':'Jednofunkcyjny'));
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
test('Zasobnik w pakiecie nie jest wyceniany drugi raz',()=>{const s=fixture();Object.assign(s.boiler,{gasKind:'single',cwu:'storage',tank:'150',included:{bCwuTank:1}});const r=analyzeBoiler(s);assert.deepEqual(r.errors,[]);assert(!boilerQuoteRows(r).some(i=>i[3]==='bCwuTank'));assert(r.items.find(i=>i.key==='bGasSource').name.includes('zestaw z zasobnikiem'));assert.equal(normalizeBoiler({source:'gas',gasKind:'storage',cwu:'storage'}).gasKind,'single');assert.equal(normalizeBoiler({source:'gas',gasKind:'heating',cwu:'none'}).gasKind,'single')});


test('Pompy ciepła mają rzeczywiste klasy mocy zamiast fikcyjnego 15 kW',()=>{
 assert.deepEqual(modelsFor('heatpump','panasonic').map(m=>m.nominal),[5,7,9,9,12,16]);
 assert.deepEqual(modelsFor('heatpump','mitsubishi').map(m=>m.nominal),[5,6,8,10,12]);
 assert.deepEqual(modelsFor('heatpump','vaillant').map(m=>m.nominal),[5,7,10,12]);assert.equal(modelsFor('heatpump','panasonic','ground').length,0);
 const s=fixture();Object.assign(s.boiler,{source:'heatpump',brand:'panasonic',catalogModel:'aquarea-m-16',model:'Panasonic Aquarea T-CAP M R290 — 16 kW'});const r=analyzeBoiler(s);assert.deepEqual(r.errors,[]);assert(r.items.find(i=>i.key==='bHpSource').name.includes('16 kW'));assert.equal(s.boiler.rated,'');assert.deepEqual(normalizeBoiler(JSON.parse(JSON.stringify(s.boiler))),s.boiler);
});
test('Sprzęgło osobne dodaje rozdzielacz dla kilku obiegów, bez powielania sprzęgła',()=>{
 const s=fixture();Object.assign(s.boiler,{topology:'separator',hydraulicModel:'cpn-70',hydraulicSections:'3'});const r=analyzeBoiler(s);assert.deepEqual(r.errors,[]);assert.equal(r.items.filter(i=>i.key==='bSeparator').length,1);assert(r.items.find(i=>i.key==='bHeatingManifold').name.includes('WOMIX C 70'));assert(!r.items.some(i=>i.key==='bDistribution'));
 s.boiler.floorGroups='1';s.boiler.radGroups='0';s.boiler.hydraulicSections='1';assert(!analyzeBoiler(s).items.some(i=>i.key==='bHeatingManifold'));
});
test('Sprzęgłorozdzielacz 2 lub 3 obiegi zawiera sprzęgło i rozdzielacz',()=>{
 const s=fixture();Object.assign(s.boiler,{topology:'distribution',hydraulicModel:'ksv-2-hw'});let r=analyzeBoiler(s);assert.deepEqual(r.errors,[]);assert(r.items.some(i=>i.key==='bDistribution'));assert(!r.items.some(i=>['bSeparator','bHeatingManifold'].includes(i.key)));
 s.boiler.floorGroups='2';assert(analyzeBoiler(s).errors.some(e=>e.includes('Za mało miejsc')));s.boiler.hydraulicModel='ksv-3-hw';r=analyzeBoiler(s);assert.deepEqual(r.errors,[]);assert.equal(r.hydraulic.circuits,3);assert.equal(r.mixedGroups+r.directGroups,3);
});
test('Moce 40, 55 i 70 kW oraz przepływ są osobnymi ograniczeniami',()=>{
 const s=fixture();Object.assign(s.boiler,{basis:'ozc',ozc:'20',topology:'separator',hydraulicModel:'cpn-mini',dt:'20'});assert.deepEqual(analyzeBoiler(s).errors,[]);
 s.boiler.dt='5';assert(analyzeBoiler(s).errors.some(e=>e.includes('Przepływ źródła')));s.boiler.dt='20';s.boiler.ozc='45';assert(analyzeBoiler(s).errors.some(e=>e.includes('katalogową moc')));
 s.boiler.hydraulicModel='cpn-70';assert.deepEqual(analyzeBoiler(s).errors,[]);s.boiler.ozc='60';assert(analyzeBoiler(s).errors.length);s.boiler.hydraulicModel='hw-70';assert.deepEqual(analyzeBoiler(s).errors,[]);
});
test('Grupy z pompą i siłowniki nie są liczone podwójnie',()=>{
 const s=fixture();Object.assign(s.boiler,{topology:'distribution',hydraulicModel:'ksv-2-hw',mixModel:'smt-125',directModel:'sa-125'});let r=analyzeBoiler(s);assert.deepEqual(r.errors,[]);assert.equal(r.items.find(i=>i.key==='bMixGroup').qty,1);assert.equal(r.items.find(i=>i.key==='bDirectGroup').qty,1);assert.equal(r.items.find(i=>i.key==='bMixActuator').qty,1);assert(r.items.find(i=>i.key==='bDirectGroup').name.includes('616056'));
 s.boiler.mixModel='primotherm-2';r=analyzeBoiler(s);assert(!r.items.some(i=>i.key==='bMixActuator'));assert(r.items.find(i=>i.key==='bMixGroup').name.includes('ARM 343'));
 s.boiler.included.bMixGroup=1;assert(!boilerQuoteRows(analyzeBoiler(s)).some(i=>i[3]==='bMixGroup'));
});
test('Własny rozdział 1/2/3 obiegi i nazwy przechodzą JSON i eksport',()=>{
 const s=fixture();Object.assign(s.boiler,{topology:'distribution',hydraulicSections:'1',hydraulicPower:'55',hydraulicName:'Moje sprzęgło',mixName:'Moja grupa z mieszaniem'});assert(analyzeBoiler(s).errors.some(e=>e.includes('Za mało miejsc')));
 s.boiler.hydraulicSections='2';assert.deepEqual(analyzeBoiler(s).errors,[]);assert(boilerQuoteRows(analyzeBoiler(s)).some(i=>i[0].includes('Moje sprzęgło')));assert.deepEqual(normalizeBoiler(JSON.parse(JSON.stringify(s.boiler))),s.boiler);
 s.boiler.hydraulicPower='-1';assert(analyzeBoiler(s).errors.length);s.boiler.hydraulicPower='55';s.boiler.mixModel='sa-125';assert(analyzeBoiler(s).errors.some(e=>e.includes('właściwego typu')));
});
console.log(count+' testów zakończonych pomyślnie');
