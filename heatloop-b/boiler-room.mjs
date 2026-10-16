import {brandsFor,modelsFor,gasKinds,gasKindFor,deviceName} from './boiler-catalog.mjs';
// Preliminary equipment scope. No certified device catalogue or safety sizing.
export const sources={gas:'Kocioł gazowy kondensacyjny',coal:'Kocioł na ekogroszek',pellet:'Kocioł na pellet',combo:'Pellet + zgazowanie drewna',wood:'Kocioł zgazowujący drewno',heatpump:'Pompa ciepła',hybrid:'Pompa ciepła + kocioł gazowy'};
export const topologies={direct:'Układ bezpośredni',separator:'Sprzęgło hydrauliczne',distribution:'Sprzęgłorozdzielacz',buffer:'Bufor ciepła',exchanger:'Wymiennik rozdzielający obiegi'};
export const boilerKeys=['bGasSource','bCoalSource','bPelletSource','bComboSource','bWoodSource','bHpSource','bGasFlue','bSolidFlue','bGasConnection','bCondensate','bHpBase','bHpDrain','bHpProtection','bHpElectric','bSeparator','bDistribution','bBuffer','bExchanger','bPrimaryPump','bMixGroup','bDirectGroup','bReturnProtection','bThermalProtection','bCoVessel','bCoSafety','bOpenVessel','bOpenSafety','bCwuTank','bCwuVessel','bCwuSafety','bDhwLoad','bDhwMix','bCirculation','bMagnet','bAir','bValves','bFilling','bPipes','bInsulation','bFittings','bMount','bElectrical'];
export const boilerDefaults=()=>({source:'',hpKind:'air',basis:'project',ozc:'',margin:'15',locality:'',outdoor:'-20',brand:'',catalogModel:'',gasKind:'',model:'',rated:'',minimum:'',sourceT:'55',floorT:'35',radT:'55',dt:'10',floorGroups:'',radGroups:'',topology:'direct',system:'closed',solidClosed:false,cwu:'storage',tank:'',cold:'10',storage:'55',reheat:'60',circulation:false,antiScald:true,dhwLoad:'valve',flue:'existing',flueLength:'0',buffer:'',coVessel:'',cwuVessel:'',requiredFlow:'',availableFlow:'',requiredVolume:'',activeVolume:'',pipeMeters:'0',included:{},linked:false});
export function bNumber(v){const s=String(v??'').trim().replace(',','.');return /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN;}
export const isSolid=s=>['coal','pellet','combo','wood'].includes(s);
export const isHp=s=>['heatpump','hybrid'].includes(s);
export function normalizeBoiler(raw){
 const b=boilerDefaults();if(!raw||typeof raw!=='object')return b;
 for(const k of Object.keys(b)){
  if(typeof b[k]==='string'&&typeof raw[k]==='string')b[k]=raw[k].slice(0,['model','locality','catalogModel'].includes(k)?120:30);
  if(typeof b[k]==='boolean')b[k]=raw[k]===true;
 }
 for(const k of boilerKeys){const value=raw.included?.[k];if(Number.isFinite(value)&&value>=0&&value<=1000)b.included[k]=value;}
 if(['storage','heating'].includes(b.gasKind))b.gasKind='single';
 if(b.catalogModel&&!modelsFor(b.source,b.brand).some(m=>m.id===b.catalogModel)){b.catalogModel='';b.brand='other';}
 return b;
}
export function projectDemand(state){
 const rooms=[...state.rooms,...state.polygons],floor=rooms.filter(r=>r.heatingType!=='radiators'),radiators=rooms.filter(r=>r.heatingType==='radiators');
 const watts=list=>list.reduce((s,r)=>s+r.area*r.load,0);
 return {floorKW:watts(floor)/1000,radKW:watts(radiators)/1000,totalKW:watts(rooms)/1000,floorCount:floor.length,radCount:radiators.length};
}
export function analyzeBoiler(state){
 const b=state.boiler,demand=projectDemand(state),errors=[],warnings=[],items=[];
 const number=k=>bNumber(b[k]),optional=k=>String(b[k]).trim()===''?null:number(k);
 const check=(k,min,max,label)=>{const n=number(k);if(!(Number.isFinite(n)&&n>=min&&n<=max))errors.push(label);return n;};
 if(!Object.hasOwn(sources,b.source))errors.push('Wybierz źródło ciepła.');
 if(b.brand&&!['other',...Object.keys(brandsFor(b.source))].includes(b.brand))errors.push('Wybierz producenta dla wybranego paliwa.');
 if(b.catalogModel&&!modelsFor(b.source,b.brand).some(m=>m.id===b.catalogModel))errors.push('Wybierz model dla wybranego producenta i paliwa.');
 if(b.source==='gas'){
  const kind=gasKindFor(b);
  if(!Object.hasOwn(gasKinds,kind))errors.push('Wybierz wariant kotła gazowego.');
  if(kind==='single'&&!['none','storage'].includes(b.cwu)||kind==='combi'&&b.cwu!=='instant')errors.push('Wariant kotła gazowego nie odpowiada przygotowaniu CWU.');
 }
 if(!['air','ground'].includes(b.hpKind))errors.push('Wybierz rodzaj pompy ciepła.');
 if(!['project','ozc'].includes(b.basis))errors.push('Wybierz podstawę zapotrzebowania na moc.');
 const base=b.basis==='ozc'?check('ozc',.1,1000,'Podaj moc z OZC od 0,1 do 1000 kW.'):demand.totalKW;
 if(!(base>0))errors.push('Dodaj pomieszczenia albo wpisz zapotrzebowanie z OZC.');
 const margin=check('margin',0,50,'Podaj zapas porównawczy od 0 do 50%.');
 const dt=check('dt',.1,40,'Podaj ΔT źródła od 0,1 do 40°C.');
 const sourceT=check('sourceT',20,95,'Podaj temperaturę zasilania źródła od 20 do 95°C.');
 check('outdoor',-40,20,'Podaj projektową temperaturę zewnętrzną od -40 do 20°C.');
 const floorT=check('floorT',20,60,'Sprawdź temperaturę obiegu podłogowego.'),radT=check('radT',20,95,'Sprawdź temperaturę obiegu grzejnikowego.');
 const groups=(key,count)=>{const n=b[key]===''?(count?1:0):number(key);if(!Number.isInteger(n)||n<0||n>20)errors.push('Liczby grup pompowych muszą być całkowite od 0 do 20.');return n;};
 const floorGroups=groups('floorGroups',demand.floorCount),radGroups=groups('radGroups',demand.radCount);
 if(!(floorGroups+radGroups>0))errors.push('Określ co najmniej jeden obieg / grupę pompową.');
 if(!Object.hasOwn(topologies,b.topology))errors.push('Wybierz układ hydrauliczny.');
 if(!['closed','open'].includes(b.system))errors.push('Wybierz układ otwarty lub zamknięty.');
 if(b.system==='open'&&!isSolid(b.source))errors.push('Dla tego źródła moduł obsługuje układ zamknięty.');
 if(isSolid(b.source)&&b.system==='closed'&&!b.solidClosed)errors.push('Potwierdź w DTR dopuszczenie kotła stałopalnego do układu zamkniętego i wymagane zabezpieczenia.');
 if(!['none','storage','instant'].includes(b.cwu))errors.push('Wybierz sposób przygotowania CWU.');
 if(b.cwu==='instant'&&b.source!=='gas')errors.push('Przepływowe CWU w tym module dotyczy gazowego kotła dwufunkcyjnego.');
 if(!['valve','pump','integrated'].includes(b.dhwLoad))errors.push('Wybierz sposób ładowania zasobnika.');
 if(!['existing','liner','insulated','ceramic'].includes(b.flue))errors.push('Wybierz wariant systemu spalinowego.');
 const flueLength=check('flueLength',0,100,'Sprawdź długość przewodu spalinowego.'),pipeMeters=check('pipeMeters',0,1000,'Sprawdź długość rur kotłowni.');
 for(const key of ['rated','minimum','buffer','coVessel','cwuVessel','requiredFlow','availableFlow','requiredVolume','activeVolume']){
  const n=optional(key);if(n!==null&&(!Number.isFinite(n)||n<0||n>100000))errors.push('Nieprawidłowa wartość: '+key+'.');
 }
 for(const key of ['buffer','coVessel','cwuVessel'])if(optional(key)!==null&&optional(key)<=0)errors.push('Pojemność zbiornika lub naczynia musi być dodatnia.');
 const rated=optional('rated'),minimum=optional('minimum');
 if(rated!==null&&rated<=0)errors.push('Moc wybranego urządzenia musi być dodatnia.');
 if(minimum!==null&&rated!==null&&minimum>rated)errors.push('Moc minimalna urządzenia przekracza moc podaną dla warunków projektowych.');
 if(b.basis==='project')warnings.push('Moc pochodzi z powierzchni × zadanego W/m². To szacunek, nie OZC ani wydajność zamontowanych grzejników / posadzki.');
 warnings.push('Zapas '+b.margin+'% jest wariantem porównawczym. Nie potwierdza doboru konkretnego kotła lub pompy ciepła.');
 if(rated===null||!b.model.trim())warnings.push('Model i moc urządzenia w warunkach projektowych wymagają uzupełnienia. Zestawienie określa zakres i budżet.');
 if(rated!==null&&rated<base&&b.source!=='hybrid')warnings.push('Podana moc źródła jest mniejsza od zapotrzebowania CO. Sprawdź strategię pracy i źródło wspomagające.');
 if(minimum!==null&&minimum>=base)warnings.push('Moc minimalna źródła jest nie mniejsza od obciążenia domu. Istnieje ryzyko częstego taktowania.');
 if(floorGroups&&sourceT<floorT||radGroups&&sourceT<radT)errors.push('Temperatura źródła jest niższa od wymaganej przez co najmniej jeden obieg. Zawór mieszający nie podwyższy temperatury.');
 const mixed=(floorGroups&&sourceT>floorT?floorGroups:0)+(radGroups&&sourceT>radT?radGroups:0),direct=floorGroups+radGroups-mixed;
 if(b.topology==='direct'&&floorGroups+radGroups>1)warnings.push('Układ bezpośredni z kilkoma pompami wymaga sprawdzenia wzajemnych przepływów i dyspozycji pompy źródła.');
 if(isSolid(b.source))warnings.push('Sprawdź lokalne ograniczenia paliw, dopuszczony komin, wentylację i ochronę powrotu oraz przegrzania według DTR.');
 if(b.source==='wood'||b.source==='combo')warnings.push('Pojemność bufora dla spalania drewna wynika z DTR i sposobu pracy kotła; moduł nie wyznacza jej z samej mocy.');
 if(isHp(b.source))warnings.push('Sprawdź moc i modulację przy temperaturze zewnętrznej '+b.outdoor+'°C i zasilaniu '+b.sourceT+'°C, odszranianie, przyłącze elektryczne i wymagania montażowe.');
 if(b.source==='hybrid')warnings.push('Układ hybrydowy wymaga strategii biwalencji. Moduł nie sumuje automatycznie mocy obu urządzeń.');
 const reqV=optional('requiredVolume'),activeV=optional('activeVolume'),reqF=optional('requiredFlow'),activeF=optional('availableFlow');
 const missingVolume=reqV!==null&&activeV!==null?Math.max(0,reqV-activeV):null;
 if(isHp(b.source)&&[reqV,activeV,reqF,activeF].some(v=>v===null))warnings.push('Uzupełnij minimalny przepływ i wymaganą czynną pojemność z DTR oraz wartości dostępne po zamknięciu stref.');
 if(reqF!==null&&activeF!==null&&activeF<reqF)errors.push('Przepływ dostępny po zamknięciu stref jest mniejszy od wymaganego. Zmień rozwiązanie hydrauliczne. Sam bufor nie gwarantuje przepływu.');
 const buffer=optional('buffer');
 if(b.topology==='buffer'&&!(buffer>0))errors.push('Wpisz pojemność wybranego bufora.');
 if(missingVolume>0&&(b.topology!=='buffer'||buffer<missingVolume))errors.push('Brakuje wymaganej czynnej pojemności wodnej. Sprawdź bufor lub inne rozwiązanie zgodne z DTR.');
 if(missingVolume>0&&b.topology==='buffer')warnings.push('Pojemność zbiornika musi być rzeczywiście czynna dla źródła przy zamkniętych strefach. Zależy to od sposobu podłączenia.');
 let dhwEnergy=null,dhwPower=null;
 if(b.cwu==='storage'){
  const tank=check('tank',1,5000,'Podaj pojemność zasobnika CWU od 1 do 5000 l.'),cold=check('cold',0,30,'Sprawdź temperaturę zimnej wody.'),storage=check('storage',30,80,'Sprawdź temperaturę wody w zasobniku.'),minutes=check('reheat',1,1440,'Podaj czas nagrzewania od 1 do 1440 min.');
  if(storage<=cold)errors.push('Temperatura zasobnika musi być wyższa od temperatury zimnej wody.');
  dhwEnergy=tank*1.163*(storage-cold)/1000;dhwPower=dhwEnergy/(minutes/60);
  warnings.push('CWU: obliczono energię pełnego nagrzania i średnią moc w zadanym czasie, bez strat. Sprawdź pobór szczytowy i wydajność wężownicy. Nie dodawaj automatycznie tej mocy do szczytu CO.');
 }
 const labelVolume=(key)=>optional(key)>0?' — '+b[key]+' l':' — pojemność do doboru';
 const add=(key,name,qty=1,unit='kpl.')=>{
  if(!(qty>0))return;
  const included=b.included[key]||0;if(!Number.isFinite(included)||included<0||included>qty||(unit!=='m'&&!Number.isInteger(included)))errors.push('Liczba elementów już w zestawie przekracza ilość: '+name+'.');
  items.push({key,name,qty,unit,included,buy:Math.max(0,qty-included)});
 };
 const name=deviceName(b),model=name?' — '+name:' — model do doboru';
 if(b.source==='gas'||b.source==='hybrid'){add('bGasSource','Kocioł gazowy'+(b.source==='gas'?' '+gasKinds[gasKindFor(b)]+(b.cwu==='storage'&&b.included.bCwuTank===1?' — zestaw z zasobnikiem CWU':''):'')+model);add('bGasFlue','System powietrzno-spalinowy — wg DTR',flueLength||1,flueLength?'m':'kpl.');add('bGasConnection','Armatura przyłącza gazu — wg projektu');add('bCondensate','Odprowadzenie kondensatu; neutralizacja jeśli wymagana');}
 if(isSolid(b.source)){
  add({coal:'bCoalSource',pellet:'bPelletSource',combo:'bComboSource',wood:'bWoodSource'}[b.source],sources[b.source]+model);
  add('bSolidFlue',({existing:'Ocena i przyłączenie istniejącego komina',liner:'Wkład kominowy stalowy',insulated:'Komin stalowy dwuścienny izolowany',ceramic:'Komin systemowy ceramiczny'}[b.flue]||'System spalinowy')+' — wg DTR',b.flue==='existing'?1:flueLength||1,b.flue==='existing'||!flueLength?'kpl.':'m');
  add('bReturnProtection','Zespół ochrony temperatury powrotu — wg DTR');
  if(b.system==='closed')add('bThermalProtection','Zabezpieczenie przed przegrzaniem / układ schładzający — wg DTR');
 }
 if(isHp(b.source)){add('bHpSource','Pompa ciepła '+(b.hpKind==='ground'?'gruntowa':'powietrze–woda')+model);if(b.hpKind==='air'){add('bHpBase','Podstawa, mocowanie i ograniczenie drgań jednostki');add('bHpDrain','Odprowadzenie wody z odszraniania — wg urządzenia');add('bHpProtection','Ochrona przed zamarzaniem — wariant wg DTR');}else{add('bHpBase','Dolne źródło gruntowe — osobny projekt i zakres robót');}add('bHpElectric','Przyłącze i zabezpieczenia elektryczne pompy — wg projektu');}
 if(b.topology==='separator')add('bSeparator','Sprzęgło hydrauliczne — dobór przepływów');
 if(b.topology==='distribution')add('bDistribution','Sprzęgłorozdzielacz — liczba obiegów '+(floorGroups+radGroups));
 if(b.topology==='buffer')add('bBuffer','Bufor ciepła'+labelVolume('buffer'));
 if(b.topology==='exchanger')add('bExchanger','Wymiennik rozdzielający — dobór mocy i strat ciśnienia');
 add('bPrimaryPump','Pompa obiegu źródła — sprawdź wyposażenie wbudowane');
 add('bMixGroup','Grupa pompowa z podmieszaniem — z pompą',mixed);
 add('bDirectGroup','Grupa pompowa bez podmieszania — z pompą',direct);
 if(b.system==='closed'||b.topology==='exchanger'){add('bCoVessel','Naczynie przeponowe CO'+labelVolume('coVessel'));add('bCoSafety','Grupa bezpieczeństwa naczynia przeponowego / instalacji CO — wg DTR');}
 if(b.system==='open'){add('bOpenVessel','Otwarte naczynie wzbiorcze — do doboru');add('bOpenSafety','Przewody bezpieczeństwa, przelewowe i zabezpieczenia układu otwartego');}
 if(b.cwu==='storage'){
  add('bCwuTank','Zasobnik ciepłej wody użytkowej — '+b.tank+' l; wężownica do doboru');add('bCwuVessel','Naczynie przeponowe CWU — do wody pitnej'+labelVolume('cwuVessel'));add('bCwuSafety','Grupa bezpieczeństwa naczynia przeponowego / zasobnika CWU — wg DTR');
  if(b.dhwLoad!=='integrated')add('bDhwLoad',b.dhwLoad==='pump'?'Pompa ładowania zasobnika — wg schematu':'Zawór przełączający ładowania zasobnika — wg schematu');
  if(b.antiScald)add('bDhwMix','Termostatyczny zawór mieszający CWU — ochrona przed oparzeniem');
  if(b.circulation)add('bCirculation','Zespół cyrkulacji CWU — pompa, armatura i sterowanie');
 }
 add('bMagnet','Separator zanieczyszczeń z magnesem');add('bAir','Separator powietrza / odpowietrzanie — wg schematu');
 add('bValves','Zawory odcinające, zwrotne, spusty, termometry i manometry — zestaw wg schematu');
 add('bFilling','Napełnianie, zabezpieczenie wody pitnej i przygotowanie wody instalacyjnej — wg wymagań');
 add('bPipes','Rury kotłowni — materiał i średnice do doboru',pipeMeters,'m');add('bInsulation','Izolacja rur kotłowni — grubość do doboru',pipeMeters,'m');
 add('bFittings','Kształtki, połączenia i uchwyty — zestaw do pomiaru');add('bMount','Montaż, płukanie i uruchomienie kotłowni');add('bElectrical','Połączenia automatyki kotłowni i odbiorników — zakres wg projektu');
 if(pipeMeters===0)warnings.push('Nie wyceniono metrów rur i izolacji: wpisz długość po pomiarze.');
 warnings.push('Pojemności naczyń, ciśnienia zaworów, pompy, średnice i kominy wymagają doboru według parametrów instalacji i DTR. Nie są wyznaczane z samej mocy.');
 return {errors:[...new Set(errors)],warnings,items,demand,baseKW:base,comparisonKW:base*(1+margin/100),flowLH:base*1000/(1.163*dt),floorGroups,radGroups,mixedGroups:mixed,directGroups:direct,dhwEnergy,dhwPower,missingVolume};
}
export function boilerQuoteRows(result){return result.items.filter(i=>i.buy>0).map(i=>['Kotłownia (wstępnie): '+i.name,i.buy,i.unit,i.key]);}
