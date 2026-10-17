// Wersja testowa: meander dla prostokatow i wielokatow ortogonalnych (L, T).
// Wyniki wymagaja sprawdzenia przez instalatora; nie sa projektem hydraulicznym.
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const length=(points,scale)=>points.slice(1).reduce((sum,p,i)=>sum+dist(points[i],p),0)*scale;
const valid=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1000&&p.y>=0&&p.y<=700;
export function rectangularInsetArea(room,offsetCm,scale){
 const g=rectangle(room?.points);
 if(!g||!(scale>0))return null;
 const d=offsetCm/100/scale;
 return Math.max(0,g.w-2*d)*Math.max(0,g.h-2*d)*scale*scale;
}
function rectangle(points){
 if(!Array.isArray(points)||points.length!==4||!points.every(valid))return null;
 const [a,b,c,d]=points,w=dist(a,b),h=dist(a,d);
 if(w<1||h<1)return null;
 const ux=(b.x-a.x)/w,uy=(b.y-a.y)/w,vx=(d.x-a.x)/h,vy=(d.y-a.y)/h;
 if(Math.abs(ux*vx+uy*vy)>0.015||dist(c,{x:b.x+d.x-a.x,y:b.y+d.y-a.y})>Math.max(2,Math.min(w,h)*0.015))return null;
 return {a,w,h,ux,uy,vx,vy};
}

// Podzial prostych wielokatow ortogonalnych (np. L, T) na prostokaty.
// Dla wielokatow o scianach ukosnych nie generujemy pozornej geometrii.
// Tolerancja klikniec: koryguj jedynie lekko krzywe odcinki poziome/pionowe.
// Oryginalne punkty pokoju nie sa modyfikowane. Ukosne sciany pozostaja ukosne.
function normalizeOrthogonalPolygon(points){
 if(!Array.isArray(points)||points.length<4||points.length>100||!points.every(valid))return null;
 const source=points.map(p=>({...p}));
 if(source.length>4&&dist(source[0],source[source.length-1])<1)source.pop();
 const maxError=10,relative=0.08;
 let vertices=source;
 for(let attempt=0;attempt<vertices.length;attempt++){
  const types=[];
  for(let i=0;i<vertices.length;i++){
   const a=vertices[i],b=vertices[(i+1)%vertices.length],dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y);
   if(Math.min(dx,dy)>maxError||Math.min(dx,dy)>Math.max(dx,dy)*relative)return null;
   types.push(dx>=dy?'h':'v');
  }
  const remove=types.findIndex((t,i)=>t===types[(i+1)%types.length]);
  if(remove<0){
   const normalized=vertices.map((p,i)=>{
    const prev=(i+vertices.length-1)%vertices.length;
    const h=types[i]==='h'?i:prev;
    const v=types[i]==='v'?i:prev;
    const hp=vertices[h],hn=vertices[(h+1)%vertices.length];
    const vp=vertices[v],vn=vertices[(v+1)%vertices.length];
    return {x:(vp.x+vn.x)/2,y:(hp.y+hn.y)/2};
   });
   if(normalized.some((p,i)=>dist(p,vertices[i])>maxError+0.01||!valid(p)))return null;
   const area=poly=>Math.abs(poly.reduce((a,p,i)=>a+p.x*poly[(i+1)%poly.length].y-poly[(i+1)%poly.length].x*p.y,0))/2;
   if(area(source)<1||Math.abs(area(normalized)-area(source))/area(source)>0.05)return null;
   return normalized;
  }
  if(vertices.length<=4)return null;
  // Usun punkt pomiedzy dwiema niemal wspolliniowymi krawedziami.
  vertices=vertices.filter((_,i)=>i!==(remove+1)%vertices.length);
 }
 return null;
}
function orthogonalRects(points){
 if(!Array.isArray(points)||points.length<4||points.length>100||!points.every(valid))return null;
 const polygon=normalizeOrthogonalPolygon(points);
 if(!polygon)return null;
 const xs=[...new Set(polygon.map(p=>p.x))].sort((a,b)=>a-b);
 const ys=[...new Set(polygon.map(p=>p.y))].sort((a,b)=>a-b);
 if(xs.length*ys.length>1500)return null;
 const inside=(x,y)=>{
  let flag=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
   const a=polygon[i],b=polygon[j];
   if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)flag=!flag;
  }
  return flag;
 };
 const cells=[];
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){
  if(xs[i+1]-xs[i]<1||ys[j+1]-ys[j]<1)continue;
  if(inside((xs[i]+xs[i+1])/2,(ys[j]+ys[j+1])/2))
   cells.push({x0:xs[i],x1:xs[i+1],y0:ys[j],y1:ys[j+1]});
 }
 if(!cells.length)return null;
 // Scalaj komorki w pasy poziome, nastepnie pasy o identycznym zakresie X.
 const strips=[];
 for(const y0 of ys.slice(0,-1)){
  const row=cells.filter(c=>c.y0===y0).sort((a,b)=>a.x0-b.x0);
  let current=null;
  for(const c of row){
   if(current&&Math.abs(current.x1-c.x0)<1e-6)current.x1=c.x1;
   else{if(current)strips.push(current);current={...c};}
  }
  if(current)strips.push(current);
 }
 const rects=[];
 for(const strip of strips){
  const existing=rects.find(r=>Math.abs(r.x0-strip.x0)<1e-6&&Math.abs(r.x1-strip.x1)<1e-6&&Math.abs(r.y1-strip.y0)<1e-6);
  if(existing)existing.y1=strip.y1;
  else rects.push({...strip});
 }
 return rects.map(r=>({points:[{x:r.x0,y:r.y0},{x:r.x1,y:r.y0},{x:r.x1,y:r.y1},{x:r.x0,y:r.y1}]}));
}
// Automatyczna propozycja dojscia: od rozdzielacza do najblizszej granicy
// pomieszczenia i punktu wewnatrz. Nie sprawdza scian i drzwi!
export function suggestApproach(room,manifold){
 const poly=room?.points;
 if(!valid(manifold)||!Array.isArray(poly)||poly.length<3||!poly.every(valid))throw Error('Brak obrysu pomieszczenia lub rozdzielacza.');
 let boundary=null,best=Infinity;
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],dx=b.x-a.x,dy=b.y-a.y;
  const t=Math.max(0,Math.min(1,((manifold.x-a.x)*dx+(manifold.y-a.y)*dy)/(dx*dx+dy*dy||1)));
  const p={x:a.x+t*dx,y:a.y+t*dy},d=dist(manifold,p);
  if(d<best){best=d;boundary=p;}
 }
 const inside=p=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes;
 }return yes;};
 const candidates=[];
 const cx=poly.reduce((sum,p)=>sum+p.x,0)/poly.length,cy=poly.reduce((sum,p)=>sum+p.y,0)/poly.length;
 candidates.push({x:cx,y:cy});
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length];
  candidates.push({x:(a.x+b.x+cx)/3,y:(a.y+b.y+cy)/3});
 }
 const target=candidates.find(inside);
 if(!target)throw Error('Nie udało się wyznaczyć wejścia do pomieszczenia. Zaznacz dojście ręcznie.');
 const t=0.12;
 const interior={x:boundary.x+(target.x-boundary.x)*t,y:boundary.y+(target.y-boundary.y)*t};
 return [boundary,inside(interior)?interior:target];
}
// Lacznik osiowy zamiast przypadkowego skosu pomiedzy punktami.
// To NIE jest detekcja scian ani drzwi; geometrie nalezy zatwierdzic na rzucie.
export function rightAnglePath(points){
 if(!Array.isArray(points)||!points.length)return [];
 const result=[{...points[0]}];
 for(const b of points.slice(1)){
  const a=result[result.length-1];
  if(Math.abs(a.x-b.x)>0.01&&Math.abs(a.y-b.y)>0.01)result.push({x:b.x,y:a.y});
  if(dist(result[result.length-1],b)>0.01)result.push({...b});
 }
 return result;
}
export function generateMeander(room,{scale,offsetCm,spacingCm,maxMeters,manifold,approach=[]}){
 if(!(scale>0)||!Number.isFinite(scale))throw Error('Ustaw prawidłową skalę rzutu.');
 if(!valid(manifold))throw Error('Najpierw wskaż rozdzielacz na rzucie.');
 if(!Array.isArray(approach)||approach.length>100||!approach.every(valid))throw Error('Nieprawidłowa trasa dojścia do rozdzielacza.');
 if(!approach.length)throw Error('Wskaż trasę dojścia od rozdzielacza przez drzwi do pomieszczenia.');
 if(!(offsetCm>=0&&offsetCm<=100&&Number.isFinite(offsetCm)))throw Error('Odsunięcie musi wynosić 0–100 cm.');
 if(!(spacingCm>=5&&spacingCm<=40&&Number.isFinite(spacingCm)))throw Error('Rozstaw rur musi wynosić 5–40 cm.');
 if(!(maxMeters>=10&&maxMeters<=300&&Number.isFinite(maxMeters)))throw Error('Nieprawidłowy limit długości pętli.');
 const g=rectangle(room?.points);
 if(!g){
  const subrooms=orthogonalRects(room?.points);
  if(!subrooms)throw Error('Obrys zawiera wyraźnie ukośne ściany lub nieprawidłowe narożniki. Drobne odchylenia są już korygowane automatycznie. Sprawdź obrys lub popraw narożniki.');
  const routes=[];let heatedArea=0,used=0;
  for(const subroom of subrooms){
   // Pomijamy drobne uskoki, ktore nie mieszcza dwoch odsuniec od scian.
   const sub=rectangle(subroom.points),inset=offsetCm/100/scale;
   if(!sub||sub.w<=2*inset+1||sub.h<=2*inset+1)continue;
   const result=generateMeander(subroom,{scale,offsetCm,spacingCm,maxMeters,manifold,approach});
   routes.push(...result.routes);heatedArea+=result.heatedArea;used++;
   if(routes.length>100)throw Error('Projekt przekracza limit 100 pętli.');
  }
  if(!routes.length)throw Error('Wielokąt ma zbyt wąskie części dla podanego odsunięcia od ścian.');
  return {routes,heatedArea,offsetCm,spacingCm,parts:used,approximate:true};
 }
 const inset=offsetCm/100/scale,step=spacingCm/100/scale;
 if(g.w<=2*inset+1||g.h<=2*inset+1)throw Error('Odsunięcie jest za duże względem wymiarów pomieszczenia.');
 // Przebieg wzdłuż dłuższego boku ogranicza liczbę nawrotów.
 const horizontal=g.w>=g.h;
 const long=horizontal?g.w:g.h,short=horizontal?g.h:g.w;
 const count=Math.floor((short-2*inset)/step+1e-8)+1;
 if(count<1||count>1500)throw Error('Liczba przejść rur poza zakresem generatora.');
 const point=(along,across)=>horizontal?
  {x:g.a.x+g.ux*along+g.vx*across,y:g.a.y+g.uy*along+g.vy*across}:
  {x:g.a.x+g.ux*across+g.vx*along,y:g.a.y+g.uy*across+g.vy*along};
 const stripes=Array.from({length:count},(_,i)=>{
  const y=inset+i*step,forward=i%2===0;
  return [point(forward?inset:long-inset,y),point(forward?long-inset:inset,y)];
 });
 const routes=[];let current=[],stripesInCurrent=0;
 const back=[...approach].reverse();
 const completeRoute=stripes=>{
  if(!stripes.length)return [];
  // Trasa użytkownika ma pierwszeństwo: nie dodawaj automatycznych zakrętów
  // pomiędzy punktami, bo mogą przechodzić przez ściany.
  const supply=[{...manifold},...approach.map(p=>({...p})),stripes[0]];
  const ret=[stripes[stripes.length-1],...back.map(p=>({...p})),{...manifold}];
  return [...supply,...stripes.slice(1),...ret.slice(1)];
 };
 const complete=()=>{if(!current.length)return;routes.push({route:completeRoute(current),stripes:stripesInCurrent});current=[];stripesInCurrent=0;};
 for(const stripe of stripes){
  const candidate=[...current,...stripe],full=completeRoute(candidate);
  if(length(full,scale)>maxMeters+1e-7){
   if(!current.length)throw Error('Pojedyncze przejście z dojściami przekracza limit pętli. Zmień rozdzielacz lub układ.');
   complete();
   if(length(completeRoute(stripe),scale)>maxMeters+1e-7)throw Error('Przejście z dojściami przekracza limit długości pętli.');
  }
  current.push(...stripe);stripesInCurrent++;
  if(routes.length>100)throw Error('Za dużo pętli. Zmień rozstaw lub parametry.');
 }
 complete();
 if(routes.length>100)throw Error('Projekt przekracza limit 100 pętli.');
 return {routes,heatedArea:Math.max(0,g.w-2*inset)*Math.max(0,g.h-2*inset)*scale*scale,offsetCm,spacingCm};
}


// Generator testowy ślimaka: ortogonalne przejścia i kontrola samoprzecięć.
export function generateSpiral(room,{scale,offsetCm,spacingCm,maxMeters,manifold,approach=[]}){
 if(!(scale>0)||!(spacingCm>=5&&spacingCm<=40)||!(offsetCm>=0&&offsetCm<=100)||!(maxMeters>=10)||!valid(manifold)||!approach.length||!approach.every(valid))throw Error('Nieprawidłowe parametry ślimaka lub dojścia.');
 const g=rectangle(room?.points);
 if(!g)throw Error('Ślimak w tej wersji wymaga prostokątnego pomieszczenia.');
 const d=offsetCm/100/scale,s=spacingCm/100/scale,W=g.w-2*d,H=g.h-2*d;
 if(W<4*s||H<4*s)throw Error('Pomieszczenie jest za wąskie na ślimak przy wybranym rozstawie.');
 const xy=(x,y)=>({x:g.a.x+g.ux*x+g.vx*y,y:g.a.y+g.uy*x+g.vy*y});
 const cross=(a,b,c,d)=>{
  const orient=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
  const o1=orient(a,b,c),o2=orient(a,b,d),o3=orient(c,d,a),o4=orient(c,d,b);
  return o1*o2 < -1e-6 && o3*o4 < -1e-6;
 };
 const validate=pts=>{
  for(let i=1;i<pts.length;i++){
   if(dist(pts[i-1],pts[i])<1e-5)return false;
   for(let j=1;j<i-1;j++)if(cross(pts[i-1],pts[i],pts[j-1],pts[j]))return false;
  }
  return true;
 };
 // Zwoje co dwa rozstawy, a powrót pomiędzy nimi. Bez ukośnych łączników.
 function coil(x,y,w,h){
  // Dwutorowy ślimak prostokątny: wejście i powrót w osobnych korytarzach.
  const turns=Math.floor(Math.min(w,h)/(4*s));
  if(turns<1)return null;
  const raw=[];
  for(let k=0;k<turns;k++){
   const L=x+2*k*s,T=y+2*k*s,R=x+w-2*k*s,B=y+h-2*k*s;
   raw.push({x:L,y:T},{x:R,y:T},{x:R,y:B},{x:L+s,y:B});
  }
  for(let k=turns-1;k>=0;k--){
   const L=x+(2*k+1)*s,T=y+(2*k+1)*s,R=x+w-(2*k+1)*s,B=y+h-(2*k+1)*s;
   raw.push({x:L+s,y:B},{x:L,y:B},{x:L,y:T},{x:R,y:T});
  }
  const pts=[raw[0]];
  for(const next of raw.slice(1)){
   const prev=pts[pts.length-1];
   if(Math.abs(prev.x-next.x)>1e-6&&Math.abs(prev.y-next.y)>1e-6)pts.push({x:next.x,y:prev.y});
   if(Math.hypot(pts[pts.length-1].x-next.x,pts[pts.length-1].y-next.y)>1e-6)pts.push(next);
  }
  const world=pts.map(p=>xy(p.x,p.y));
  return validate(world)?world:null;
 }
 const approachLength=length([manifold,...approach],scale);
 if(2*approachLength>=maxMeters)throw Error('Dojścia przekraczają limit długości pętli.');
 function build(nx,ny){
  const routes=[];
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
   const spiral=coil(d+i*W/nx,d+j*H/ny,W/nx,H/ny);
   if(!spiral)return null;
   const route=[manifold,...approach,...spiral,...[...approach].reverse(),manifold];
   if(length(route,scale)>maxMeters+1e-6)return null;
   routes.push({route,stripes:1});
  }
  return routes;
 }
 // Pełna siatka pokrywająca każde pole, najmniejsza liczba pętli.
 for(let n=1;n<=40;n++){
  const variants=[];
  for(let nx=1;nx<=n;nx++)if(n%nx===0)variants.push([nx,n/nx]);
  variants.sort((a,b)=>Math.abs(Math.log((W/a[0])/(H/a[1])))-Math.abs(Math.log((W/b[0])/(H/b[1]))));
  for(const [nx,ny] of variants){
   const routes=build(nx,ny);
   if(routes)return {routes,heatedArea:W*H*scale*scale,offsetCm,spacingCm,spiral:true};
  }
 }
 throw Error('Nie udało się wygenerować ślimaka bez nieprawidłowych łączników. Zmień rozstaw lub obrys; projekt pozostaje bez zmian.');
}
