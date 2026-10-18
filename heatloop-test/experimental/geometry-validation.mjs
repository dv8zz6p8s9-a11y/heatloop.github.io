// Geometry validation: independent of the drawing renderer. Units: metres.
const finite=p=>Number.isFinite(p?.x)&&Number.isFinite(p?.y);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function ptSeg(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,dd=dx*dx+dy*dy,t=dd?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/dd)):0;return dist(p,{x:a.x+t*dx,y:a.y+t*dy})}
function hit(a,b,c,d){const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b),eps=1e-10;const on=(p,u,v)=>Math.abs(cross(u,v,p))<eps&&p.x>=Math.min(u.x,v.x)-eps&&p.x<=Math.max(u.x,v.x)+eps&&p.y>=Math.min(u.y,v.y)-eps&&p.y<=Math.max(u.y,v.y)+eps;return(x*y<0&&z*w<0)||(Math.abs(x)<eps&&on(c,a,b))||(Math.abs(y)<eps&&on(d,a,b))||(Math.abs(z)<eps&&on(a,c,d))||(Math.abs(w)<eps&&on(b,c,d))}
const segDist=(a,b,c,d)=>hit(a,b,c,d)?0:Math.min(ptSeg(a,c,d),ptSeg(b,c,d),ptSeg(c,a,b),ptSeg(d,a,b));
function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(ptSeg(p,a,b)<1e-10)return true;if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes}return yes}
export function auditRoute(points,room,{wallOffset=.1,pipeDiameter=.016,minimumSpacing=.15,maximumLength=100}={}){
 if(!Array.isArray(points)||points.length<2||points.some(p=>!finite(p))||!Array.isArray(room)||room.length<3||room.some(p=>!finite(p)))throw Error('Invalid geometry');
 if([wallOffset,pipeDiameter,minimumSpacing,maximumLength].some(v=>!Number.isFinite(v)||v<0))throw Error('Invalid constraints');
 const required=wallOffset+pipeDiameter/2,wallViolations=[],crossings=[],spacingViolations=[];let length=0;
 for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];length+=dist(a,b);const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  if(!inside(a,room)||!inside(b,room)||!inside(mid,room)||room.some((u,j)=>segDist(a,b,u,room[(j+1)%room.length])<required-1e-8))wallViolations.push(i);
  for(let j=i+2;j<points.length-1;j++){const d=segDist(a,b,points[j],points[j+1]);if(d<1e-8)crossings.push([i,j]);else if(d<minimumSpacing-1e-8)spacingViolations.push({i,j,distance:d})}
 }
 return {length,wallViolations,crossings,spacingViolations,withinLimit:length<=maximumLength,ok:!wallViolations.length&&!crossings.length&&!spacingViolations.length&&length<=maximumLength};
}
