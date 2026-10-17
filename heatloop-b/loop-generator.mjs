// Wersja testowa: automatyczny meander tylko dla pomieszczen prostokatnych.
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
export function generateMeander(room,{scale,offsetCm,spacingCm,maxMeters,manifold}){
 if(!(scale>0)||!Number.isFinite(scale))throw Error('Ustaw prawidłową skalę rzutu.');
 if(!valid(manifold))throw Error('Najpierw wskaż rozdzielacz na rzucie.');
 if(!(offsetCm>=0&&offsetCm<=100&&Number.isFinite(offsetCm)))throw Error('Odsunięcie musi wynosić 0–100 cm.');
 if(!(spacingCm>=5&&spacingCm<=40&&Number.isFinite(spacingCm)))throw Error('Rozstaw rur musi wynosić 5–40 cm.');
 if(!(maxMeters>=10&&maxMeters<=300&&Number.isFinite(maxMeters)))throw Error('Nieprawidłowy limit długości pętli.');
 const g=rectangle(room?.points);
 if(!g)throw Error('Automatyczny meander obsługuje na razie pomieszczenia prostokątne (cztery narożniki i kąty proste).');
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
 const complete=()=>{if(!current.length)return;routes.push({route:[{...manifold},...current,{...manifold}],stripes:stripesInCurrent});current=[];stripesInCurrent=0;};
 for(const stripe of stripes){
  const candidate=[...current,...stripe],full=[manifold,...candidate,manifold];
  if(length(full,scale)>maxMeters+1e-7){
   if(!current.length)throw Error('Pojedyncze przejście z dojściami przekracza limit pętli. Zmień rozdzielacz lub układ.');
   complete();
   if(length([manifold,...stripe,manifold],scale)>maxMeters+1e-7)throw Error('Przejście z dojściami przekracza limit długości pętli.');
  }
  current.push(...stripe);stripesInCurrent++;
  if(routes.length>100)throw Error('Za dużo pętli. Zmień rozstaw lub parametry.');
 }
 complete();
 if(routes.length>100)throw Error('Projekt przekracza limit 100 pętli.');
 return {routes,heatedArea:Math.max(0,g.w-2*inset)*Math.max(0,g.h-2*inset)*scale*scale,offsetCm,spacingCm};
}
