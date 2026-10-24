/** Editable room / heating-zone geometry for HeatLoop Drawing LAB.
 * Coordinates are pixels of the UNROTATED source drawing, not screen pixels.
 */
const EPS = 1e-7;
export const copyPoints = points => points.map(p => [p[0],p[1]]);
export function polygonArea(points) {
  if (!Array.isArray(points) || points.length < 3) return 0;
  return Math.abs(points.reduce((sum,p,i) => {
    const q=points[(i+1)%points.length];
    return sum+p[0]*q[1]-q[0]*p[1];
  },0))/2;
}
export function onSegment(p,a,b,eps=EPS) {
  const cross=(p[0]-a[0])*(b[1]-a[1])-(p[1]-a[1])*(b[0]-a[0]);
  if(Math.abs(cross)>eps*Math.max(1,Math.hypot(b[0]-a[0],b[1]-a[1])))return false;
  return p[0]>=Math.min(a[0],b[0])-eps && p[0]<=Math.max(a[0],b[0])+eps &&
         p[1]>=Math.min(a[1],b[1])-eps && p[1]<=Math.max(a[1],b[1])+eps;
}
export function insidePolygon(p,polygon) {
  if(!Array.isArray(polygon)||polygon.length<3)return false;
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[j],b=polygon[i];
    if(onSegment(p,a,b))return true;
    if((a[1]>p[1])!==(b[1]>p[1])){
      const x=a[0]+(p[1]-a[1])*(b[0]-a[0])/(b[1]-a[1]);
      if(p[0]<x)inside=!inside;
    }
  }
  return inside;
}
function orient(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}
function segmentsIntersect(a,b,c,d){
 const o=[orient(a,b,c),orient(a,b,d),orient(c,d,a),orient(c,d,b)];
 if((o[0]>EPS&&o[1]<-EPS||o[0]<-EPS&&o[1]>EPS) &&
    (o[2]>EPS&&o[3]<-EPS||o[2]<-EPS&&o[3]>EPS))return true;
 return (Math.abs(o[0])<=EPS&&onSegment(c,a,b)) ||
        (Math.abs(o[1])<=EPS&&onSegment(d,a,b)) ||
        (Math.abs(o[2])<=EPS&&onSegment(a,c,d)) ||
        (Math.abs(o[3])<=EPS&&onSegment(b,c,d));
}
export function validPolygon(points,minArea=1) {
  if(!Array.isArray(points)||points.length<3||points.length>200 ||
     points.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v))))return false;
  if(polygonArea(points)<minArea)return false;
  const n=points.length;
  for(let i=0;i<n;i++){
    const a=points[i],b=points[(i+1)%n];
    if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-3)return false;
    for(let j=i+1;j<n;j++){
      if(j===(i+1)%n||(i===0&&j===n-1))continue;
      if(segmentsIntersect(a,b,points[j],points[(j+1)%n]))return false;
    }
  }
  return true;
}
export function insideRoom(outer,inner) {
  if(!validPolygon(outer)||!validPolygon(inner))return false;
  for(const p of inner)if(!insidePolygon(p,outer))return false;
  // A concave room can have an outside passage between two interior vertices.
  // Any crossing of the room's boundary invalidates the heating zone.
  for(let i=0;i<inner.length;i++){
    const a=inner[i],b=inner[(i+1)%inner.length];
    const checkpoints=[.15,.37,.5,.63,.85].map(t=>[a[0]*(1-t)+b[0]*t,a[1]*(1-t)+b[1]*t]);
    if(checkpoints.some(p=>!insidePolygon(p,outer)))return false;
    for(let j=0;j<outer.length;j++){
      const c=outer[j],d=outer[(j+1)%outer.length];
      const ac=orient(a,b,c),ad=orient(a,b,d),ca=orient(c,d,a),cb=orient(c,d,b);
      if((ac>EPS&&ad<-EPS||ac<-EPS&&ad>EPS) &&
         (ca>EPS&&cb<-EPS||ca<-EPS&&cb>EPS))return false;
    }
  }
  return polygonArea(inner)<=polygonArea(outer)+1e-4;
}
export function rectFromCorners(a,b){
  return [[Math.min(a[0],b[0]),Math.min(a[1],b[1])],
          [Math.max(a[0],b[0]),Math.min(a[1],b[1])],
          [Math.max(a[0],b[0]),Math.max(a[1],b[1])],
          [Math.min(a[0],b[0]),Math.max(a[1],b[1])]];
}
export function changeVertex(points,index,point,shape='poly'){
  if(!Array.isArray(points)||index<0||index>=points.length)throw Error('Nieprawidłowy narożnik');
  if(shape==='rect'&&points.length===4){
    const opposite=points[(index+2)%4];
    // Do not allow dragging through the opposite corner: avoids handle flips.
    const min=3;
    if(Math.abs(opposite[0]-point[0])<min||Math.abs(opposite[1]-point[1])<min)
      throw Error('Pomieszczenie jest zbyt wąskie.');
    return rectFromCorners(point,opposite);
  }
  const output=copyPoints(points);output[index]=[...point];return output;
}
export function movePolygon(points,dx,dy) {
  return points.map(p=>[p[0]+dx,p[1]+dy]);
}
export function closestEdge(points,p) {
  let best={index:-1,distance:Infinity,point:null};
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],vx=b[0]-a[0],vy=b[1]-a[1],d=vx*vx+vy*vy;
    if(d<1e-6)continue;
    const t=Math.max(0,Math.min(1,((p[0]-a[0])*vx+(p[1]-a[1])*vy)/d));
    const q=[a[0]+t*vx,a[1]+t*vy],distance=Math.hypot(q[0]-p[0],q[1]-p[1]);
    if(distance<best.distance)best={index:i,distance,point:q};
  }
  return best;
}
export function addVertex(points,p,tolerance=18) {
  if(!Array.isArray(points)||points.length>=200)throw Error('Zbyt wiele punktów.');
  const edge=closestEdge(points,p);
  if(edge.index<0||edge.distance>tolerance)throw Error('Wskaż krawędź obrysu, aby dodać narożnik.');
  const result=copyPoints(points);result.splice(edge.index+1,0,edge.point);
  if(!validPolygon(result))throw Error('Nowy narożnik stworzył nieprawidłowy obrys.');
  return result;
}
export function deleteVertex(points,index) {
  if(points.length<=3)throw Error('Wielokąt musi mieć co najmniej trzy narożniki.');
  const result=copyPoints(points);result.splice(index,1);
  if(!validPolygon(result))throw Error('Nie można usunąć tego narożnika.');
  return result;
}
