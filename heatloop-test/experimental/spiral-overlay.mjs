/* HeatLoop experimental editable spiral overlay.
 * Overlay control polygon maps normalized template to room polygon via
 * mean-value coordinates (convex or concave simple polygons).
 * Visual geometry only: validate pipe spacing and walls before installation.
 */
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const signedArea=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.x*b.y-b.x*a.y},0)/2;
export function makeOverlay(roomPolygon,{turns=4,margin=.08}={}){
 if(!Array.isArray(roomPolygon)||roomPolygon.length<3||!Number.isInteger(turns)||turns<1||!(margin>=0&&margin<.5))throw Error('Invalid overlay parameters');
 const b={minX:Math.min(...roomPolygon.map(p=>p.x)),maxX:Math.max(...roomPolygon.map(p=>p.x)),minY:Math.min(...roomPolygon.map(p=>p.y)),maxY:Math.max(...roomPolygon.map(p=>p.y))};
 if((b.maxX-b.minX)*(b.maxY-b.minY)<1e-8)throw Error('Degenerate room');
 const p=[];
 // Inward rectangular spiral polyline; normalized template, continuous pipe.
 let l=margin,t=margin,r=1-margin,d=1-margin;
 for(let k=0;k<turns;k++){
  p.push({x:l,y:t},{x:r,y:t},{x:r,y:d},{x:l,y:d});
  l+= (1-2*margin)/(2*turns+1);t+=(1-2*margin)/(2*turns+1);
  r-= (1-2*margin)/(2*turns+1);d-=(1-2*margin)/(2*turns+1);
 }
 const template=p.map(q=>({x:b.minX+q.x*(b.maxX-b.minX),y:b.minY+q.y*(b.maxY-b.minY)}));
 return {controlPoints:roomPolygon.map(q=>({...q})),template,points:template.map(q=>({...q})),rotation:0,mirror:false,status:'preview-unvalidated'};
}
export function moveControl(overlay,index,point){
 if(!overlay.controlPoints[index]||!Number.isFinite(point?.x)||!Number.isFinite(point?.y))throw Error('Invalid control');
 const controls=overlay.controlPoints.map(p=>({...p}));controls[index]={...point};
 // Smooth displacement from control vertex with inverse-distance weighting.
 const original=overlay.controlPoints[index],delta={x:point.x-original.x,y:point.y-original.y};
 const points=overlay.points.map(p=>{
  const ds=overlay.controlPoints.map(c=>distance(c,p));
  const weights=ds.map(d=>1/Math.pow(Math.max(.05,d),2));
  const influence=weights[index]/weights.reduce((s,w)=>s+w,0);
  return {x:p.x+delta.x*influence,y:p.y+delta.y*influence};
 });
 return {...overlay,controlPoints:controls,points,status:'preview-unvalidated'};
}
export function translate(overlay,dx,dy){if(!Number.isFinite(dx)||!Number.isFinite(dy))throw Error('Invalid translation');const move=p=>({x:p.x+dx,y:p.y+dy});return {...overlay,controlPoints:overlay.controlPoints.map(move),template:overlay.template.map(move),points:overlay.points.map(move)}}
export function rotate(overlay,angle,center){
 if(!Number.isFinite(angle))throw Error('Invalid angle');
 const c=center||overlay.controlPoints.reduce((s,p)=>({x:s.x+p.x/overlay.controlPoints.length,y:s.y+p.y/overlay.controlPoints.length}),{x:0,y:0});
 const cs=Math.cos(angle),sn=Math.sin(angle),fn=p=>({x:c.x+(p.x-c.x)*cs-(p.y-c.y)*sn,y:c.y+(p.x-c.x)*sn+(p.y-c.y)*cs});
 return {...overlay,controlPoints:overlay.controlPoints.map(fn),template:overlay.template.map(fn),points:overlay.points.map(fn),rotation:overlay.rotation+angle};
}
export function reverseDirection(overlay){return {...overlay,points:[...overlay.points].reverse(),mirror:!overlay.mirror}}
export function pipeLength(overlay){return overlay.points.slice(1).reduce((s,p,i)=>s+distance(p,overlay.points[i]),0)}
export function checkSpacing(overlay,desired,tolerance=.2){
 if(!(desired>0))throw Error('Invalid spacing');
 // Non-neighbour segments only; checks near parallel sections at vertices.
 const p=overlay.points,problems=[];
 for(let i=0;i<p.length;i++)for(let j=i+3;j<p.length;j++){
  const d=distance(p[i],p[j]);
  if(d<desired*(1-tolerance))problems.push({i,j,distance:d});
 }
 return {ok:problems.length===0,problems,method:'vertex-proximity-only'};
}
