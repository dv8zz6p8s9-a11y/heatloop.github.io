/* HeatLoop BETA - niezalezny prototyp geometrii dojsc (bez kodu ISKO).
 * Wspolrzedne w metrach. Sciany jako segmenty {a:{x,y},b:{x,y}}.
 * Przejscia drzwiowe reprezentuje sie jako przerwy w segmentach scian.
 */
export const distance=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y);
export function length(points){
  return points.slice(1).reduce((sum,p,i)=>sum+distance(points[i],p),0);
}
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function onSegment(a,b,p,eps=1e-8){
  return Math.abs(cross(a,b,p))<eps &&
    p.x>=Math.min(a.x,b.x)-eps && p.x<=Math.max(a.x,b.x)+eps &&
    p.y>=Math.min(a.y,b.y)-eps && p.y<=Math.max(a.y,b.y)+eps;
}
export function intersects(a,b,c,d){
  const x1=cross(a,b,c),x2=cross(a,b,d),x3=cross(c,d,a),x4=cross(c,d,b);
  if(x1*x2<0 && x3*x4<0) return true;
  return (Math.abs(x1)<1e-8&&onSegment(a,b,c)) ||
    (Math.abs(x2)<1e-8&&onSegment(a,b,d)) ||
    (Math.abs(x3)<1e-8&&onSegment(c,d,a)) ||
    (Math.abs(x4)<1e-8&&onSegment(c,d,b));
}
export function violations(points,walls=[]){
  const hits=[];
  for(let i=1;i<points.length;i++)
    for(let j=0;j<walls.length;j++)
      if(intersects(points[i-1],points[i],walls[j].a,walls[j].b))
        hits.push({routeSegment:i-1,wallIndex:j});
  return hits;
}
const valid=p=>p && Number.isFinite(p.x)&&Number.isFinite(p.y);
export function createRoute(manifold,loop,walls=[]){
  if(!valid(manifold)||!valid(loop)) throw Error('Niepoprawne punkty');
  const points=[{...manifold},{...loop}];
  return {points,violations:violations(points,walls),length:length(points)};
}
export function editRoute(route,operation,index,point,walls=[]){
  const points=route.points.map(p=>({...p}));
  if(operation==='move'){
    if(index<1||index>=points.length-1||!valid(point)) throw Error('Niepoprawna edycja');
    points[index]={...point};
  }else if(operation==='insert'){
    if(index<1||index>=points.length||!valid(point)) throw Error('Niepoprawna edycja');
    points.splice(index,0,{...point});
  }else if(operation==='remove'){
    if(index<1||index>=points.length-1) throw Error('Niepoprawna edycja');
    points.splice(index,1);
  }else throw Error('Nieznana operacja');
  return {points,length:length(points),violations:violations(points,walls)};
}
export function loopTotalLength(spiralLength,supplyRoute,returnRoute){
  if(!Number.isFinite(spiralLength)||spiralLength<0) throw Error('Niepoprawna dlugosc petli');
  return spiralLength+length(supplyRoute.points)+length(returnRoute.points);
}
