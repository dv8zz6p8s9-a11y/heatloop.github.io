import {brandsFor,modelsFor,gasKindFor,setGasKind} from './boiler-catalog.mjs';
import {sources,topologies,isHp,isSolid,analyzeBoiler,bNumber} from './boiler-room.mjs';
export const boilerFields={bBasis:'basis',bOzc:'ozc',bMargin:'margin',bLocality:'locality',bOutdoor:'outdoor',bModel:'model',bRated:'rated',bMinimum:'minimum',bHpKind:'hpKind',bTopology:'topology',bSystem:'system',bSolidClosed:'solidClosed',bSourceT:'sourceT',bFloorT:'floorT',bRadT:'radT',bDt:'dt',bFloorGroups:'floorGroups',bRadGroups:'radGroups',bBuffer:'buffer',bCwu:'cwu',bTank:'tank',bCold:'cold',bStorage:'storage',bReheat:'reheat',bCirculation:'circulation',bAntiScald:'antiScald',bDhwLoad:'dhwLoad',bFlue:'flue',bFlueLength:'flueLength',bCoVessel:'coVessel',bCwuVessel:'cwuVessel',bRequiredFlow:'requiredFlow',bAvailableFlow:'availableFlow',bRequiredVolume:'requiredVolume',bActiveVolume:'activeVolume',bPipeMeters:'pipeMeters'};
export function mountBoiler(state,prices,api){
 const $=id=>document.getElementById(id),fmt=n=>Number.isFinite(n)?n.toLocaleString('pl-PL',{maximumFractionDigits:2}):'—';
 const sourceButtons=[];
 const icon=hp=>hp?'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="3" width="26" height="26" rx="5"/><circle cx="16" cy="16" r="8"/><path d="M16 8v16M8 16h16M10 10l12 12M10 22l12-12"/></svg>':'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M17 3c3 8 9 9 9 16a10 10 0 0 1-20 0c0-5 4-8 6-11 0 5 2 6 3 7 3-4 3-7 2-12Z"/></svg>';
 for(const [key,name] of Object.entries(sources)){
  const button=document.createElement('button');button.type='button';button.dataset.source=key;button.className='boiler-source';button.innerHTML=icon(isHp(key));
  const span=document.createElement('span');span.textContent=name;button.append(span);button.onclick=()=>{if(state.boiler.source!==key){state.boiler.source=key;resetDevice();if(key==='gas')setGasKind(state.boiler,gasKindFor(state.boiler));else if(state.boiler.cwu==='instant')state.boiler.cwu='storage';}refresh();api.changed()};$('bSources').append(button);sourceButtons.push(button);
 }
 function resetDevice(){Object.assign(state.boiler,{brand:'',catalogModel:'',model:'',rated:'',minimum:'',included:{}});}
 function options(id,entries,value){const select=$(id);select.replaceChildren();for(const [key,label] of entries){const option=document.createElement('option');option.value=key;option.textContent=label;select.append(option);}select.value=value;}
 function catalogue(){
  const b=state.boiler;
  options('bBrand',[['','Wybierz producenta'],...Object.entries(brandsFor(b.source)),['other','Inny — wpisz własną nazwę']],b.brand);
  options('bCatalogModel',[['','Inny model — wpisz własną nazwę'],...modelsFor(b.source,b.brand).map(m=>[m.id,m.name])],b.catalogModel);
  $('bGasKind').value=gasKindFor(b);$('bCwu').disabled=b.source==='gas'&&gasKindFor(b)==='combi';$('bCwu').querySelector('option[value="instant"]').disabled=b.source==='gas'&&gasKindFor(b)==='single';$('bTankSupply').value=b.included.bCwuTank===1?'included':'separate';
 }
 $('bTankSupply').onchange=()=>{state.boiler.included.bCwuTank=$('bTankSupply').value==='included'?1:0;refresh();api.changed()};
 $('bGasKind').onchange=()=>{setGasKind(state.boiler,$('bGasKind').value);refresh();api.changed()};
 $('bBrand').onchange=()=>{const brand=$('bBrand').value;resetDevice();state.boiler.brand=brand;refresh();api.changed()};
 $('bCatalogModel').onchange=()=>{const b=state.boiler;b.catalogModel=$('bCatalogModel').value;b.model=modelsFor(b.source,b.brand).find(m=>m.id===b.catalogModel)?.name||'';b.rated='';b.minimum='';b.included={};refresh();api.changed()};
 function diagram(result){
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 560 365');svg.setAttribute('role','img');svg.setAttribute('aria-label','Schemat funkcjonalny: źródło, rozdział na obiegi oraz przygotowanie CWU');
  const node=(tag,attrs,text)=>{const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(text)n.textContent=text;svg.append(n);return n};
  node('title',{},'Kotłownia — mapa funkcjonalna, nie schemat montażowy');
  const line=(d,color='#ff9f69')=>node('path',{d,fill:'none',stroke:color,'stroke-width':3,'stroke-linecap':'round'});
  const box=(x,y,w,h,title,subtitle,accent='#ff9f69')=>{node('rect',{x,y,width:w,height:h,rx:14,fill:'#112c40',stroke:accent,'stroke-width':1.5});node('text',{x:x+12,y:y+25,fill:'#eff7ff','font-size':13,'font-weight':700},title);node('text',{x:x+12,y:y+44,fill:'#a9c4d7','font-size':10},subtitle)};
  line('M168 113H205');if(result.floorGroups)line('M345 113H375V57H393');if(result.radGroups)line('M345 113H375V165H393');
  if(state.boiler.cwu!=='none')line('M87 145V282H205','#70d9dc');
  box(10,78,158,70,isHp(state.boiler.source)?'Pompa / źródło':isSolid(state.boiler.source)?'Kocioł stałopalny':'Źródło ciepła',state.boiler.source==='hybrid'?'Pompa + gaz':state.boiler.source==='gas'?'Gaz kondensacyjny':sources[state.boiler.source]||'Wybierz technologię');
  const names={direct:'Bezpośrednio',separator:'Sprzęgło',distribution:'Sprzęgłorozdzielacz',buffer:'Bufor',exchanger:'Wymiennik'};
  box(205,78,140,70,names[state.boiler.topology]||'Hydraulika',state.boiler.topology==='buffer'?(state.boiler.buffer||'—')+' l':'Rozdział energii');
  box(393,23,156,68,'Podłogówka',result.floorGroups+' grup · '+state.boiler.floorT+'°C','#70d9dc');
  box(393,131,156,68,'Grzejniki',result.radGroups+' grup · '+state.boiler.radT+'°C','#70d9dc');
  if(state.boiler.cwu!=='none')box(205,247,220,68,'Ciepła woda użytkowa',state.boiler.cwu==='storage'?'Zasobnik '+(state.boiler.tank||'—')+' l':'Przygotowanie przepływowe','#70d9dc');
  node('text',{x:12,y:347,fill:'#8eafc5','font-size':11},'Połączenia pokazują zależności funkcjonalne.');$('bDiagram').replaceChildren(svg);
 }
 function visibility(){
  const visible=(id,yes)=>{$(id).closest('label').hidden=!yes;};
  visible('bTankSupply',state.boiler.source==='gas'&&gasKindFor(state.boiler)==='single'&&state.boiler.cwu==='storage');
  $('bTankSupply').value=state.boiler.included.bCwuTank===1?'included':'separate';
  visible('bGasKind',state.boiler.source==='gas');visible('bBrand',Object.keys(brandsFor(state.boiler.source)).length>0);visible('bCatalogModel',state.boiler.brand==='sas');visible('bModel',!state.boiler.catalogModel);
  visible('bOzc',state.boiler.basis==='ozc');visible('bHpKind',isHp(state.boiler.source));visible('bSolidClosed',isSolid(state.boiler.source)&&state.boiler.system==='closed');visible('bFlue',isSolid(state.boiler.source));visible('bFlueLength',!['heatpump',''].includes(state.boiler.source));visible('bBuffer',state.boiler.topology==='buffer');
  for(const id of ['bTank','bCold','bStorage','bReheat','bCirculation','bAntiScald','bDhwLoad','bCwuVessel'])visible(id,state.boiler.cwu==='storage');
 }
 function cost(result){
  const total=result.items.reduce((sum,i)=>sum+i.buy*(prices[i.key]||0),0),missing=result.items.filter(i=>i.buy>0&&!(prices[i.key]>0)).length;
  $('bCost').textContent='Budżet netto: '+fmt(total)+' zł'+(missing?' · '+missing+' pozycji bez ceny':'');
 }
 function results(table=true){
  visibility();const r=analyzeBoiler(state);$('bKpis').replaceChildren();
  for(const [label,value,unit] of [['Zapotrzebowanie CO',r.baseKW,'kW'],['Porównanie +'+state.boiler.margin+'%',r.comparisonKW,'kW'],['Przepływ CO / ΔT '+state.boiler.dt+'°C',r.flowLH,'l/h']]){const card=document.createElement('div');card.className='boiler-kpi';const title=document.createElement('span');title.textContent=label;const strong=document.createElement('strong');strong.textContent=fmt(value)+' '+unit;card.append(title,strong);$('bKpis').append(card)}
  $('bDhwResult').textContent=r.dhwEnergy===null?'Bez obliczenia ładowania zasobnika.':'Pełne nagrzanie: '+fmt(r.dhwEnergy)+' kWh · średnia moc: '+fmt(r.dhwPower)+' kW';
  $('bFindings').replaceChildren();for(const message of r.errors){const p=document.createElement('p');p.className='warning';p.textContent=message;$('bFindings').append(p)}
  const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Założenia i elementy do sprawdzenia ('+r.warnings.length+')';details.append(summary);for(const message of r.warnings){const p=document.createElement('p');p.className='hint';p.textContent=message;details.append(p)}$('bFindings').append(details);
  $('bExport').disabled=!!r.errors.length||r.items.some(i=>i.buy>0&&(!Number.isFinite(prices[i.key])||prices[i.key]<0));diagram(r);cost(r);
  if(table){
   $('bItems').replaceChildren();for(const item of r.items){
    const tr=document.createElement('tr');tr.dataset.key=item.key;const name=document.createElement('td');name.textContent=item.name;const qty=document.createElement('td');qty.textContent=item.qty+' '+item.unit;
    const included=document.createElement('td'),input=document.createElement('input');input.type='text';input.inputMode=item.unit==='m'?'decimal':'numeric';input.value=String(item.included);input.setAttribute('aria-label','Już w zestawie: '+item.name);
    input.onchange=()=>{state.boiler.included[item.key]=bNumber(input.value);results();api.changed()};included.append(input);
    const buy=document.createElement('td');buy.textContent=item.buy+' '+item.unit;
    const price=document.createElement('td'),p=document.createElement('input');p.type='text';p.inputMode='decimal';p.value=String(prices[item.key]||0).replace('.',',');p.setAttribute('aria-label','Cena kotłowni: '+item.name);
    p.oninput=()=>{const value=bNumber(p.value);if(!(Number.isFinite(value)&&value>=0&&value<=10000000)){p.setCustomValidity('Wpisz cenę netto od 0 do 10000000 zł');prices[item.key]=NaN;cost(analyzeBoiler(state));$('bExport').disabled=true;api.changed();return;}p.setCustomValidity('');prices[item.key]=value;sum.textContent=fmt(item.buy*value);cost(analyzeBoiler(state));const checked=analyzeBoiler(state);$('bExport').disabled=!!checked.errors.length||checked.items.some(i=>i.buy>0&&(!Number.isFinite(prices[i.key])||prices[i.key]<0));api.changed()};price.append(p);
    const sum=document.createElement('td');sum.textContent=fmt(item.buy*(prices[item.key]||0));tr.append(name,qty,included,buy,price,sum);$('bItems').append(tr);
   }
  }
 }
 function refresh(){
  catalogue();
  for(const [id,key] of Object.entries(boilerFields))if($(id).type==='checkbox')$(id).checked=state.boiler[key];else $(id).value=state.boiler[key];
  for(const button of sourceButtons)button.setAttribute('aria-pressed',String(button.dataset.source===state.boiler.source));
  $('bLinked').checked=state.boiler.linked;results();
 }
 for(const [id,key] of Object.entries(boilerFields))$(id).addEventListener($(id).type==='checkbox'||$(id).tagName==='SELECT'?'change':'input',()=>{state.boiler[key]=$(id).type==='checkbox'?$(id).checked:$(id).value;if(id==='bCwu'&&state.boiler.source==='gas'){state.boiler.gasKind='';state.boiler.gasKind=gasKindFor(state.boiler);$('bGasKind').value=state.boiler.gasKind;}results();api.changed()});
 $('bLinked').onchange=()=>{if($('bLinked').checked&&analyzeBoiler(state).errors.length){$('bLinked').checked=false;return alert('Uzupełnij prawidłowe dane kotłowni przed powiązaniem z wyceną.');}state.boiler.linked=$('bLinked').checked;api.changed()};
 $('bExport').onclick=()=>{const r=analyzeBoiler(state);if(r.errors.length)return;api.exportCsv([['HeatLoop — wstępny zakres kotłowni; nie projekt montażowy'],['Element','Potrzebne','Jednostka','Juz w zestawie','Do dokupienia','Cena netto','Wartosc netto'],...r.items.map(i=>[i.name,i.qty,i.unit,i.included,i.buy,prices[i.key]||0,i.buy*(prices[i.key]||0)])])};
 refresh();return {refresh};
}
