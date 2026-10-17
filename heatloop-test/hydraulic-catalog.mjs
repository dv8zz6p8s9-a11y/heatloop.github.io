// Manufacturer data checked 2026-10-16; power alone is not a hydraulic design.
export const hydraulicModels=[
 {id:'cpn-mini',type:'separator',name:'WOMIX CPN MINI DN25',kw:40,referenceDt:20,flow:2.5,manifold:'WOMIX CN 70 2/3 F DN25',maxCircuits:3,system:'125'},
 {id:'cpn-70',type:'separator',name:'WOMIX CPN 70 DN25',kw:55,referenceDt:20,flow:2.5,manifold:'WOMIX C 70',system:'125'},
 {id:'hw-70',type:'separator',name:'AFRISO HW do KSV 125 — 77317',kw:70,flow:3,manifold:'AFRISO KSV 125',system:'125'},
 {id:'ksv-2-hw',type:'distribution',name:'AFRISO KSV 125-2 HW — 77314',kw:70,flow:3,circuits:2,system:'125'},
 {id:'ksv-3-hw',type:'distribution',name:'AFRISO KSV 125-3 HW — 77315',kw:70,flow:3,circuits:3,system:'125'}
];
export const pumpGroups=[
 {id:'sa-125',kind:'direct',name:'WOMIX SA 125 DN25 — Grundfos UPM3S AUTO 25-60 (616056)',system:'125'},
 {id:'smt-125',kind:'mix',name:'WOMIX SMT 125 DN25 — Grundfos UPM3S AUTO 25-60 (616086)',system:'125',actuator:'WOMIX SL 10 — siłownik mieszacza'},
 {id:'primotherm-1',kind:'direct',name:'AFRISO PrimoTherm K 180-1 DN25 — Grundfos (77818)',system:'125'},
 {id:'primotherm-2',kind:'mix',name:'AFRISO PrimoTherm K 180-2 DN25 — Grundfos + ARM 343 (77813)',system:'125'}
];
export const hydraulicOptions=topology=>hydraulicModels.filter(m=>m.type===topology);
export const groupOptions=kind=>pumpGroups.filter(m=>m.kind===kind);
export function hydraulicSelection(b,groups,base,dt,rated){
 const active=['separator','distribution'].includes(b.topology),errors=[],warnings=[];
 const model=active?hydraulicOptions(b.topology).find(m=>m.id===b.hydraulicModel):null;
 const numeric=v=>{const s=String(v??'').trim().replace(',','.');return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN;};
 if(active&&b.hydraulicModel&&!model)errors.push('Wybierz sprzęgło lub sprzęgłorozdzielacz zgodny z układem.');
 const circuits=model?.circuits||(b.hydraulicSections?numeric(b.hydraulicSections):groups);
 if(active&&(!Number.isInteger(circuits)||circuits<1||circuits>40))errors.push('Liczba obiegów rozdziału musi być całkowita od 1 do 40.');
 if(active&&circuits<groups)errors.push('Za mało miejsc na obiegi: rozdział ma '+circuits+', a grup pompowych jest '+groups+'.');
 if(active&&model?.maxCircuits&&circuits>model.maxCircuits)errors.push('Rozdzielacz dla '+model.name+' obsługuje najwyżej '+model.maxCircuits+' obiegi.');
 const customKw=b.hydraulicPower?numeric(b.hydraulicPower):null;
 if(active&&!model&&b.hydraulicPower&&!(customKw>0&&customKw<=1000))errors.push('Podaj katalogową moc sprzęgła od 0 do 1000 kW, większą od zera.');
 const kw=model?.kw??customKw,flow=model?.flow??null,design=Math.max(base,Number.isFinite(rated)?rated:base);
 const requiredFlow=design/(1.163*dt);
 if(active&&kw&&design>kw)errors.push('Moc źródła / zapotrzebowanie przekracza katalogową moc wybranego sprzęgła.');
 if(active&&flow&&requiredFlow>flow*1.01)errors.push('Przepływ źródła przy zadanym ΔT przekracza dopuszczalny przepływ sprzęgła ('+flow+' m³/h).');
 if(active)warnings.push('Sprzęgło: sprawdź przepływy po obu stronach, temperatury, przyłącza i warunki mocy katalogowej. Nie zastępuje to doboru hydraulicznego.');
 if(active&&!model)warnings.push('Własne sprzęgło: moc nie potwierdza dopuszczalnego przepływu. Sprawdź go w karcie producenta.');
 const selectedGroup=(id,kind)=>{
  const found=groupOptions(kind).find(g=>g.id===id);
  if(id&&!found)errors.push('Wybierz grupę pompową właściwego typu: '+(kind==='mix'?'z mieszaniem':'bez mieszania')+'.');
  if(active&&model&&found&&model.system!==found.system)errors.push('Nieodpowiedni rozstaw grupy pompowej i rozdzielacza.');
  return found;
 };
 const mix=selectedGroup(b.mixModel,'mix'),direct=selectedGroup(b.directModel,'direct');
 if(mix||direct)warnings.push('Grupy katalogowe zawierają pompę. Rozstaw 125 mm nie potwierdza całej zgodności: sprawdź gwinty, adaptery, krzywą pompy, straty ciśnienia i sterowanie.');
 const power=kw?' — katalogowo '+kw+' kW'+(model?.referenceDt?' przy ΔT '+model.referenceDt+'°C':''):'';
 const name=(model?.name||b.hydraulicName||'model do doboru')+power;
 return {active,model,circuits,errors,warnings,requiredFlow,name,mix,direct};
}
