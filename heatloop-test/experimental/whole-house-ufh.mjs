/* HeatLoop: experimental whole-house UFH planning core.
 * Units: metres. No automatic split until layoutLoops().
 * This is a planning engine, NOT a certified hydraulic design.
 */
const EPS=1e-9;
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const pathLength=p=>p.slice(1).reduce((s,q,i)=>s+dist(p[i],q),0);
export function polygonArea(p){return Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.x*b.y-b.x*a.y},0))/2}
function cross(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)}
function between(a,b,c){return c.x>=Math.min(a.x,b.x)-EPS&&c.x<=Math.max(a.x,b.x)+EPS&&c.y>=Math.min(a.y,b.y)-EPS&&c.y<=Math.max(a.y,b.y)+EPS}
export function intersects(a,b,c,d){
 const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);
 if(x*y< -EPS&&z*w< -EPS)return true;
 return [Math.abs(x)<EPS&&between(a,b,c),Math.abs(y)<EPS&&between(a,b,d),Math.abs(z)<EPS&&between(c,d,a),Math.abs(w)<EPS&&between(c,d,b)].some(Boolean)
}
export function wallHits(path,walls){const hits=[];for(let i=1;i<path.length;i++)for(let j=0;j<walls.length;j++)if(intersects(path[i-1],path[i],walls[j].a,walls[j].b))hits.push({segment:i-1,wall:j});return hits}
export function pointInPolygon(p,poly){
 let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
 const a=poly[i],b=poly[j];if(Math.abs(cross(a,b,p))<EPS&&between(a,b,p))return true;
 if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }return inside;
}
export function configureRoom(room,{spacing=0.15,wallOffset=0.1}={}){
 if(!room?.id||!Array.isArray(room.polygon)||room.polygon.length<3||!(spacing>0)||!(wallOffset>=0))throw Error('Niepoprawne pomieszczenie lub rozstaw');
 return {...room,spacing,wallOffset,area:polygonArea(room.polygon),layout:null};
}
function bounds(poly){return {minX:Math.min(...poly.map(p=>p.x)),maxX:Math.max(...poly.map(p=>p.x)),minY:Math.min(...poly.map(p=>p.y)),maxY:Math.max(...poly.map(p=>p.y))}}
function pointToSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return dist(p,{x:a.x+t*dx,y:a.y+t*dy})}
function clearance(p,poly){return Math.min(...poly.map((a,i)=>pointToSegment(p,a,poly[(i+1)%poly.length])))}
/* Raster cell-centre coverage estimator; do not treat as actual routed pipe length. */
export function coverageEstimate(room){
 const {spacing,wallOffset,polygon}=room,b=bounds(polygon);let cells=0,covered=0;
 const step=spacing/2;
 for(let y=b.minY+step/2;y<b.maxY;y+=step)for(let x=b.minX+step/2;x<b.maxX;x+=step){
 const p={x,y};if(pointInPolygon(p,polygon)){cells++;if(clearance(p,polygon)>=wallOffset-EPS)covered++}
 }
 return {area:room.area,usableArea:covered*step*step,coverageRatio:cells?covered/cells:0,estimatedPipeLength:covered*step*step/spacing,method:'area-estimate-not-routed-geometry'};
}
export function layoutLoops(room,{maxLength=100,allowExtended=false,approvedExtended=false,feedAllowance=0}={}){
 if(!room?.spacing)throw Error('Najpierw skonfiguruj rozstaw (Generuj pętle)');
 if(maxLength>100&&!(allowExtended&&approvedExtended&&maxLength<=120))throw Error('Długość powyżej 100 m wymaga zgody instalatora (maks. 120 m)');
 if(!(maxLength>feedAllowance)||feedAllowance<0)throw Error('Nieprawidłowy limit lub dojścia');
 const estimate=coverageEstimate(room),capacity=maxLength-feedAllowance;
 const count=Math.max(1,Math.ceil(estimate.estimatedPipeLength/capacity));
 return {...room,layout:{...estimate,count,estimatedLengthPerLoop:estimate.estimatedPipeLength/count,feedAllowance,maximumTotalLength:maxLength,status:'planning-only-no-spiral-geometry'}};
}
export function connectManifold(loopStart,manifold,walls=[],via=[]){
 const points=[manifold,...via,loopStart];if(points.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw Error('Niepoprawny punkt');
 return {points,length:pathLength(points),wallCollisions:wallHits(points,walls)};
}
export function updateRoute(route,operation,index,point,walls=[]){
 const p=route.points.map(q=>({...q}));
 if(operation==='insert'&&index>0&&index<p.length&&point)p.splice(index,0,point);
 else if(operation==='move'&&index>0&&index<p.length-1&&point)p[index]=point;
 else if(operation==='remove'&&index>0&&index<p.length-1)p.splice(index,1);
 else throw Error('Niedozwolona edycja');
 if(p.some(q=>!Number.isFinite(q.x)||!Number.isFinite(q.y)))throw Error('Niepoprawne wspolrzedne');
 return {points:p,length:pathLength(p),wallCollisions:wallHits(p,walls)};
}
export function circuitSummary({pipeLength,supply,returnRoute,limit=100}){
 if(!Number.isFinite(pipeLength)||pipeLength<0)throw Error('Niepoprawna dlugosc');
 const supplyLength=pathLength(supply.points),returnLength=pathLength(returnRoute.points),total=pipeLength+supplyLength+returnLength;
 return {pipeLength,supplyLength,returnLength,total,withinLimit:total<=limit,hasCollisions:!!(supply.wallCollisions.length+returnRoute.wallCollisions.length)};
}
