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
export function brandsFor(source){return source==='gas'?gasBrands:Object.hasOwn(sas,source)?{sas:'SAS'}:{};}
export function modelsFor(source,brand){return brand==='sas'?(Object.hasOwn(sas,source)?sas[source]:[]).map(name=>({id:name,name:'SAS '+name})):[];}
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
 const selected=modelsFor(b.source,b.brand).find(m=>m.id===b.catalogModel);
 if(selected)return selected.name;
 const model=(b.model||'').trim(),brands=brandsFor(b.source),brand=Object.hasOwn(brands,b.brand)?brands[b.brand]:'';
 return brand&&!model.toLocaleLowerCase().startsWith(brand.toLocaleLowerCase())?brand+(model?' '+model:' — model do wpisania'):model;
}
