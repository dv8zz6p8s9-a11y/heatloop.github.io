/* HeatLoop experimental editable spiral overlay.
 * Overlay control polygon maps normalized template to room polygon via
 * mean-value coordinates (convex or concave simple polygons).
 * Visual geometry only: validate pipe spacing and walls before installation.
 */
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const orient=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const onSeg=(a,b,p)=>Math.abs(orient(a,b,p))<1e-8&&p.x>=Math.min(a.x,b.x)-1e-8&&p.x<=Math.max(a.x,b.x)+1e-8&&p.y>=Math.min(a.y,b.y)-1e-8&&p.y<=Math.max(a.y,b.y)+1e-8;
const segmentsIntersect=(a,b,c,d)=>{const x=orient(a,b,c),y=orient(a,b,d),z=orient(c,d,a),w=orient(c,d,b);return (x*y<0&&z*w<0)||(Math.abs(x)<1e-8&&onSeg(a,b,c))||(Math.abs(y)<1e-8&&onSeg(a,b,d))||(Math.abs(z)<1e-8&&onSeg(c,d,a))||(Math.abs(w)<1e-8&&onSeg(c,d,b))};
export function validatePolygon(poly){
 if(!Array.isArray(poly)||poly.length<3||poly.some(p=>!Number.isFinite(p?.x)||!Number.isFinite(p?.y)))return false;
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];if(distance(a,b)<1e-8)return false;for(let j=i+1;j<poly.length;j++){if(j===i+1||(i===0&&j===poly.length-1))continue;if(segmentsIntersect(a,b,poly[j],poly[(j+1)%poly.length]))return false}}
 return Math.abs(poly.reduce((s,a,i)=>s+a.x*poly[(i+1)%poly.length].y-poly[(i+1)%poly.length].x*a.y,0))>1e-8;
}
const segmentDistance=(a,b,c,d)=>{
 if(segmentsIntersect(a,b,c,d))return 0;
 const pt=(p,u,v)=>{const dx=v.x-u.x,dy=v.y-u.y,len=dx*dx+dy*dy;if(len<1e-16)return distance(p,u);const t=Math.max(0,Math.min(1,((p.x-u.x)*dx+(p.y-u.y)*dy)/len));return distance(p,{x:u.x+t*dx,y:u.y+t*dy})};
 return Math.min(pt(a,c,d),pt(b,c,d),pt(c,a,b),pt(d,a,b));
};
const signedArea=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.x*b.y-b.x*a.y},0)/2;
export function makeOverlay(roomPolygon,{turns=4,margin=.08}={}){
 if(!validatePolygon(roomPolygon)||!Number.isInteger(turns)||turns<1||!Number.isFinite(margin)||!(margin>=0&&margin<.5))throw Error('Invalid overlay parameters');
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
 if(!Number.isFinite(desired)||desired<=0||!Number.isFinite(tolerance)||tolerance<0||tolerance>=1)throw Error('Invalid spacing');
 const p=overlay?.points;
 if(!Array.isArray(p)||p.length<2||p.some(q=>!Number.isFinite(q?.x)||!Number.isFinite(q?.y)))throw Error('Invalid path');
 const problems=[],threshold=desired*(1-tolerance);
 for(let i=0;i<p.length-1;i++){
  if(distance(p[i],p[i+1])<1e-8)problems.push({i,j:i,distance:0,reason:'zero-length'});
  for(let j=i+2;j<p.length-1;j++){
   const d=segmentDistance(p[i],p[i+1],p[j],p[j+1]);
   if(d<threshold)problems.push({i,j,distance:d,reason:'segment-clearance'});
  }
 }
 return {ok:problems.length===0,problems,method:'segment-segment-distance'};
}
