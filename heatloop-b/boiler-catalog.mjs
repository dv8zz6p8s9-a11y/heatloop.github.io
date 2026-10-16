// Model families verified against the manufacturer's catalogue on 2026-10-16.
// No automatic power, price or built-in equipment assumptions.
export const catalogSource='https://www.sas.busko.pl/pl/produkty';
export const gasBrands={'de-dietrich':'De Dietrich',immergas:'Immergas',bosch:'Bosch',viessmann:'Viessmann'};
export const gasKinds={single:'Jednofunkcyjny',combi:'Dwufunkcyjny'};
const sas={
 coal:['EFEKT','SPARK','COMPACT','SOLID','SOLID (DM)'],
 pellet:['MINI ECO PLUS','BIO COMPACT','BIO COMPACT PLUS','BIO EFEKT','BIO EFEKT PLUS','BIO SPARK','BIO SOLID','BIO SOLID (DM)'],
 combo:['BIO GREEN PLUS'],
 wood:['GREEN PLUS','VARMO PLUS']
};
export const hpBrands={panasonic:'Panasonic',mitsubishi:'Mitsubishi Electric',vaillant:'Vaillant'};
const hp={
 panasonic:[...([5,7,9].map(kw=>({id:'aquarea-l-'+kw,name:'Panasonic Aquarea L R290 — '+kw+' kW',nominal:kw}))),...([9,12,16].map(kw=>({id:'aquarea-m-'+kw,name:'Panasonic Aquarea T-CAP M R290 — '+kw+' kW',nominal:kw})))],
 mitsubishi:[5,6,8,10,12].map(kw=>({id:'ecodan-r290-'+kw,name:'Mitsubishi Electric Ecodan R290 PUZ-WZ — klasa '+kw+' kW',nominal:kw})),
 vaillant:[5,7,10,12].map((kw,i)=>({id:'arotherm-plus-'+kw,name:'Vaillant aroTHERM plus VWL '+[55,75,105,125][i]+'/6 A — klasa '+kw+' kW',nominal:kw}))
};
export function brandsFor(source,hpKind='air'){return source==='gas'?gasBrands:source==='heatpump'&&hpKind==='air'?hpBrands:Object.hasOwn(sas,source)?{sas:'SAS'}:{};}
export function modelsFor(source,brand,hpKind='air'){
 if(source==='heatpump'&&hpKind==='air'&&Object.hasOwn(hp,brand))return hp[brand];
 return brand==='sas'?(Object.hasOwn(sas,source)?sas[source]:[]).map(name=>({id:name,name:'SAS '+name})):[];
}
export function gasKindFor(b){
 if(['storage','heating'].includes(b.gasKind))return 'single';
 return b.gasKind||(b.cwu==='instant'?'combi':'single');
}
export function setGasKind(b,kind){
 b.gasKind=kind;
 if(kind==='combi')b.cwu='instant';
 else if(kind==='single'&&!['none','storage'].includes(b.cwu))b.cwu='storage';
}
export function deviceName(b){
 const selected=modelsFor(b.source,b.brand,b.hpKind).find(m=>m.id===b.catalogModel);
 if(selected)return selected.name;
 const model=(b.model||'').trim(),brands=brandsFor(b.source,b.hpKind),brand=Object.hasOwn(brands,b.brand)?brands[b.brand]:'';
 return brand&&!model.toLocaleLowerCase().startsWith(brand.toLocaleLowerCase())?brand+(model?' '+model:' — model do wpisania'):model;
}
