/** HeatLoop LAB: preliminary ORTHOGONAL manifold approaches in unrotated drawing coordinates.
 * The overlay is NEVER a construction-ready route: walls/doorways and
 * real clearance between different pipe runs require installer verification.
 */
const EPS=1e-8;
function finitePoint(p){return Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)}
function edgeCrossing(a,b,c,d){
 const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]];
 const den=r[0]*s[1]-r[1]*s[0];
 if(Math.abs(den)<EPS)return null;
 const q=[c[0]-a[0],c[1]-a[1]];
 const t=(q[0]*s[1]-q[1]*s[0])/den,u=(q[0]*r[1]-q[1]*r[0])/den;
 return t>=-EPS&&t<=1+EPS&&u>=-EPS&&u<=1+EPS?Math.max(0,Math.min(1,t)):null;
}
function onSegment(p,a,b){
 const cross=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
 return Math.abs(cross)<EPS*Math.max(1,Math.hypot(b[0]-a[0],b[1]-a[1])) &&
 p[0]>=Math.min(a[0],b[0])-EPS&&p[0]<=Math.max(a[0],b[0])+EPS&&
 p[1]>=Math.min(a[1],b[1])-EPS&&p[1]<=Math.max(a[1],b[1])+EPS;
}
function insideStrict(p,poly){
 if(poly.some((q,i)=>onSegment(p,q,poly[(i+1)%poly.length])))return false;
 let inside=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[j],b=poly[i];
  if((a[1]>p[1])!==(b[1]>p[1])){
   const ix=a[0]+(p[1]-a[1])*(b[0]-a[0])/(b[1]-a[1]);
   if(p[0]<ix)inside=!inside;
  }
 }
 return inside;
}
export function segmentInsideForbidden(a,b,poly){
 if(!finitePoint(a)||!finitePoint(b)||!Array.isArray(poly)||poly.length<3)return false;
 const ts=[0,1];
 for(let i=0;i<poly.length;i++){
  const t=edgeCrossing(a,b,poly[i],poly[(i+1)%poly.length]);
  if(t!==null)ts.push(t);
 }
 ts.sort((x,y)=>x-y);
 for(let i=1;i<ts.length;i++){
  const t=(ts[i-1]+ts[i])/2;
  if(insideStrict([a[0]*(1-t)+b[0]*t,a[1]*(1-t)+b[1]*t],poly))return true;
 }
 return false;
}
export function metricPolylineLength(points,sx,sy){
 if(!(sx>0&&sy>0)||!Array.isArray(points))throw Error('Najpierw skalibruj rysunek.');
 let sum=0;
 for(let i=1;i<points.length;i++){
  if(!finitePoint(points[i])||!finitePoint(points[i-1]))throw Error('Niewłaściwe punkty trasy.');
  sum+=Math.hypot((points[i][0]-points[i-1][0])*sx,(points[i][1]-points[i-1][1])*sy);
 }
 return sum;
}
function simplify(points){
 return points.filter((p,i)=>i===0||Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])>1e-7);
}
function routeCandidates(a,b,obstacles,sx,sy){
 const out=[simplify([a,[b[0],a[1]],b]),simplify([a,[a[0],b[1]],b])];
 const margin=0.20;
 const xs=new Set([Math.min(a[0],b[0])-margin/sx,Math.max(a[0],b[0])+margin/sx]);
 const ys=new Set([Math.min(a[1],b[1])-margin/sy,Math.max(a[1],b[1])+margin/sy]);
 for(const poly of obstacles){
  xs.add(Math.min(...poly.map(p=>p[0]))-margin/sx);
  xs.add(Math.max(...poly.map(p=>p[0]))+margin/sx);
  ys.add(Math.min(...poly.map(p=>p[1]))-margin/sy);
  ys.add(Math.max(...poly.map(p=>p[1]))+margin/sy);
 }
 for(const x of xs)out.push(simplify([a,[x,a[1]],[x,b[1]],b]));
 for(const y of ys)out.push(simplify([a,[a[0],y],[b[0],y],b]));
 return out;
}
export function previewOrthogonalRoute(a,b,options){
 const {sx,sy,obstacles=[]}=options||{};
 if(!finitePoint(a)||!finitePoint(b)||!(sx>0&&sy>0))return {status:'invalid',reason:'Brak kalibracji lub współrzędnych końca.',points:[],length_m:null};
 if(!Array.isArray(obstacles))return {status:'invalid',reason:'Nieprawidłowe pola przeszkód.',points:[],length_m:null};
 const candidates=routeCandidates(a,b,obstacles,sx,sy).map(points=>{
  const collisions=obstacles.filter(poly=>points.slice(1).some((p,i)=>segmentInsideForbidden(points[i],p,poly))).length;
  return{points,collisions,length_m:metricPolylineLength(points,sx,sy)};
 }).sort((x,y)=>x.collisions-y.collisions||x.length_m-y.length_m);
 const chosen=candidates[0];
 if(!chosen||chosen.collisions)return {status:'blocked',reason:'Nie znaleziono prostej trasy bez przejścia przez inne pole grzewcze.',points:[],length_m:null};
 return{status:'draft',points:chosen.points,length_m:chosen.length_m,
  reason:'Trasa poglądowa: bez kontroli ścian, drzwi, kolizji innych rur i promieni gięcia.'};
}
/** A guide is a technician-drawn CENTER LINE, not two validated parallel pipes.
 * The preview follows its waypoints and marks any failure instead of crossing
 * known heating zones. It does not yet reserve space in the Python spiral.
 */
export function previewGuidedRoute(a,b,guide,options){
 if(!Array.isArray(guide)||guide.length>25||guide.some(p=>!finitePoint(p)))
  return {status:'invalid',reason:'Nieprawidłowe punkty trasy pomocniczej.',points:[],length_m:null};
 const points=[a,...guide,b];
 let joined=[],total=0;
 for(let i=1;i<points.length;i++){
  const part=previewOrthogonalRoute(points[i-1],points[i],options);
  if(part.status!=='draft')
   return {status:'blocked',reason:'Wyznaczony korytarz przecina inne pole grzewcze lub nie da się połączyć punktów.',
     points:[],length_m:null};
  joined=joined.concat(i===1?part.points:part.points.slice(1));
  total+=part.length_m;
 }
 return {status:'draft',points:simplify(joined),length_m:total,
  reason:'Przebieg na podstawie punktów pomocniczych. Brak kontroli przegród i wzajemnego odstępu zasilania/powrotu.'};
}
/** Split a technician-drawn corridor into TWO distinct parallel pipe lanes.
 * The separation is 10 cm centre-to-centre by default, an early preview
 * that may have to be recalculated near fittings and doorways.
 * All calculations are in metres; anisotropic image scale is respected.
 */
function crossing(a,b){return a[0]*b[1]-a[1]*b[0]}
function offsetMetricPolyline(pts,delta){
 if(pts.length<2)return[];
 const dirs=[];
 for(let i=1;i<pts.length;i++){
  const dx=pts[i][0]-pts[i-1][0],dy=pts[i][1]-pts[i-1][1];
  const mag=Math.hypot(dx,dy);
  if(mag<1e-7)return[];
  dirs.push([dx/mag,dy/mag]);
 }
 const normals=dirs.map(u=>[-u[1]*delta,u[0]*delta]);
 const result=[];
 for(let i=0;i<pts.length;i++){
  let v;
  if(i===0)v=normals[0];
  else if(i===pts.length-1)v=normals.at(-1);
  else{
   const u=dirs[i-1],w=dirs[i];
   const a=[pts[i][0]+normals[i-1][0],pts[i][1]+normals[i-1][1]];
   const b=[pts[i][0]+normals[i][0],pts[i][1]+normals[i][1]];
   const den=crossing(u,w);
   if(Math.abs(den)<1e-7){
    if(u[0]*w[0]+u[1]*w[1]<-.95)return [];
    v=normals[i];
   }else{
    const t=crossing([b[0]-a[0],b[1]-a[1]],w)/den;
    v=[a[0]+u[0]*t-pts[i][0],a[1]+u[1]*t-pts[i][1]];
    if(Math.hypot(...v)>Math.abs(delta)*3+1e-7)return[];
   }
  }
  result.push([pts[i][0]+v[0],pts[i][1]+v[1]]);
 }
 return result;
}
export function previewParallelGuide(manifold,inlet,outlet,guide,options){
 const {sx,sy,obstacles=[],corridorWidthM=.20,localSpacingM=.10}=options||{};
 if(!finitePoint(manifold)||!finitePoint(inlet)||!finitePoint(outlet)||
    !(sx>0&&sy>0)||!guide.length||guide.some(p=>!finitePoint(p)))
  return {status:'invalid',reason:'Błędny punkt dojścia.',supply:[],return:[]};
 if(corridorWidthM<localSpacingM+.016+.03)
  return {status:'blocked',reason:'Pas zbyt wąski na dwie rury o rozstawie 10 cm i wymagane marginesy.',supply:[],return:[]};
 const stem=simplify([manifold,...guide]);
 if(stem.length<2)return {status:'blocked',reason:'Korytarz nie ma długości.',supply:[],return:[]};
 const metres=stem.map(p=>[p[0]*sx,p[1]*sy]);
 const left=offsetMetricPolyline(metres,localSpacingM/2);
 const right=offsetMetricPolyline(metres,-localSpacingM/2);
 if(!left.length||!right.length)return {status:'blocked',reason:'Za ciasny nawrót lub odwrócony odcinek korytarza.',supply:[],return:[]};
 const lp=left.map(p=>[p[0]/sx,p[1]/sy]),rp=right.map(p=>[p[0]/sx,p[1]/sy]);
 // Reject plans that cut through another heating field, including the
 // diagonal/miter section of a corner.
 for(const lane of [lp,rp]){
  for(let i=1;i<lane.length;i++){
   if(obstacles.some(poly=>segmentInsideForbidden(lane[i-1],lane[i],poly)))
    return {status:'blocked',reason:'Jedna z dwóch rur przechodzi przez inne pole grzewcze.',supply:[],return:[]};
  }
 }
 const joinIn=previewOrthogonalRoute(lp.at(-1),inlet,{sx,sy,obstacles});
 const joinOut=previewOrthogonalRoute(outlet,rp.at(-1),{sx,sy,obstacles});
 if(joinIn.status!=='draft'||joinOut.status!=='draft')
  return {status:'blocked',reason:'Nie można połączyć obu rur z polem grzewczym bez przecięcia innego pola.',supply:[],return:[]};
 const supply=simplify([manifold,...lp,...joinIn.points.slice(1)]);
 const ret=simplify([...joinOut.points,...rp.slice().reverse().slice(1),manifold]);
 const lenS=metricPolylineLength(supply,sx,sy);
 const lenR=metricPolylineLength(ret,sx,sy);
 return {status:'draft',guided:true,parallel:true,supply,return:ret,
  supply_m:Number(lenS.toFixed(3)),return_m:Number(lenR.toFixed(3)),
  local_spacing_m:localSpacingM,
  reason:'DWIE oddzielne rury prowadzone wstępnie co 10 cm w pasie technicznym. Narożniki, ściany i połączenia przy rozdzielaczu wymagają walidacji.'};
}

export function generateLoopApproaches(layout,manifold,options){
 const {sx,sy,obstacles=[],guide=[],direction='normal'}=options||{};
 if(!['experimental','schematic'].includes(layout?.status))return{status:'no-loop',reason:'Brak zweryfikowanej geometrii samej pętli.',supply:[],return:[]};
 if(!Array.isArray(layout.supply)||!layout.supply.length||!Array.isArray(layout.return)||!layout.return.length)
  return{status:'no-loop',reason:'Pętla nie ma obu końców.',supply:[],return:[]};
 if(!manifold||!finitePoint(manifold.point))return{status:'no-manifold',reason:'Przypisz i ustaw rozdzielacz na rysunku.',supply:[],return:[]};
 const inlet=layout.supply[0],outlet=layout.return[layout.return.length-1];
 const origA=[inlet[0]/sx,inlet[1]/sy],origB=[outlet[0]/sx,outlet[1]/sy];
 const reversed=direction==='reverse';
 const a=reversed?origB:origA,b=reversed?origA:origB;
 if(guide.length){
  const duo=previewParallelGuide(manifold.point,a,b,guide,{sx,sy,obstacles,
    corridorWidthM:options?.corridorWidthM??.20,
    localSpacingM:.10});
  if(duo.status!=='draft')return {...duo,manifold_id:manifold.id};
  return {...duo,manifold_id:manifold.id,reversed,
    start_point:a,end_point:b};
 }
 const from=previewOrthogonalRoute(manifold.point,a,{sx,sy,obstacles});
 const back=previewOrthogonalRoute(b,manifold.point,{sx,sy,obstacles});
 if(from.status!=='draft'||back.status!=='draft')return {
  status:'blocked',reason:'Co najmniej jedno dojście nie może ominąć innych pól w prostym trasowaniu.',
  supply:[],return:[],supply_m:null,return_m:null,
 };
 return {
  status:'draft',reason:guide.length?
     'Dojścia idą po korytarzu pomocniczym; NIE ma kontroli odstępu między rurami ani automatycznej rezerwacji pasa.':
     'Dojścia poglądowe — wymagają sprawdzenia ścian, przejść i kolizji rur.',
  guided:guide.length>0,reversed,
  supply:from.points,return:back.points,
  supply_m:Number(from.length_m.toFixed(3)),return_m:Number(back.length_m.toFixed(3)),
  start_point:a,end_point:b,manifold_id:manifold.id,
 };
}
