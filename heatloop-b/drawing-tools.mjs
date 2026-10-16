import {sourceSignature} from './floor-loops.mjs?v=20261016-3';
export const rotationValue=x=>[0,90,180,270].includes(x)?x:0;
export const rotationFit=(angle,w=1000,h=700)=>angle%180?Math.min(w/h,h/w):1;
export function drawRaster(ctx,image,angle=0,w=1000,h=700){ctx.save();ctx.translate(w/2,h/2);ctx.rotate(rotationValue(angle)*Math.PI/180);const k=rotationFit(angle,w,h);ctx.scale(k,k);ctx.drawImage(image,-w/2,-h/2,w,h);ctx.restore();}
export function normalizeWallGuides(raw){return Array.isArray(raw)?raw.slice(0,200).filter(x=>Array.isArray(x?.points)&&x.points.length===2&&x.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1000&&p.y>=0&&p.y<=700)).map(x=>({points:x.points.map(p=>({x:p.x,y:p.y})),thickness:Number.isFinite(x.thickness)&&x.thickness>0&&x.thickness<=100?x.thickness:3})):[];}
export function rotateDrawing(state,turn,{points=[]}={}){
 if(!state.background)throw Error('Najpierw wczytaj rzut.');if(![90,-90].includes(turn))throw Error('Obrót musi wynosić 90° w lewo lub w prawo.');
 const old=rotationValue(state.drawingRotation),next=(old+turn+360)%360,ratio=rotationFit(next)/rotationFit(old),sign=turn===90?1:-1;
 const map=p=>{const x=p.x-500,y=p.y-350,n={x:500-sign*y*ratio,y:350+sign*x*ratio};for(const key of ['x','y'])if(Math.abs(n[key])<1e-8)n[key]=0;if(!Number.isFinite(n.x)||!Number.isFinite(n.y)||n.x < -1e-7||n.x>1000+1e-7||n.y < -1e-7||n.y>700+1e-7)throw Error('Elementy wychodzą poza obszar obróconego rzutu. Zapisz kopię i sprawdź projekt.');n.x=Math.min(1000,Math.max(0,n.x));n.y=Math.min(700,Math.max(0,n.y));return n;};
 const scale=state.scale==null?null:state.scale/ratio;if(scale!==null&&!(scale>0&&scale<1000))throw Error('Skala po obrocie przekroczyłaby obsługiwany zakres.');
 const current=state.loopPlan.signature===sourceSignature(state),polygons=state.polygons.map(r=>({...r,points:r.points.map(map)})),pipes=state.pipes.map(r=>({...r,points:r.points.map(map)})),radiators=state.radiators.map(r=>({...r,...map(r)}));
 const manifolds=state.loopPlan.manifolds.map(m=>({...m,position:m.position?map(m.position):null})),manifold=state.loopPlan.manifold?map(state.loopPlan.manifold):null,loops=state.loopPlan.loops.map(l=>({...l,route:(l.route||[]).map(map)})),draft=points.map(map),wallGuides=(state.wallGuides||[]).map(g=>({...g,points:g.points.map(map),thickness:g.thickness*ratio}));
 Object.assign(state,{polygons,pipes,radiators,scale,wallGuides,drawingRotation:next});Object.assign(state.loopPlan,{manifolds,manifold,loops});if(current)state.loopPlan.signature=sourceSignature(state);
 return draft;
}
// Local raster heuristic. Detects thick, long horizontal/vertical dark runs, not semantic wall classes.
export function detectWallCandidates({data,width,height},{threshold=115,minLength=40,minThickness=3,maxThickness=50,limit=200}={}){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>1200000||!data||data.length!==width*height*4)throw Error('Nieprawidłowy lub zbyt duży obraz do wykrywania ścian.');
 if(!Number.isFinite(threshold)||threshold<20||threshold>220||!Number.isInteger(minLength)||minLength<10||minLength>1000||!Number.isInteger(minThickness)||minThickness<1||minThickness>50||!Number.isInteger(maxThickness)||maxThickness<minThickness||maxThickness>100||!Number.isInteger(limit)||limit<1||limit>200)throw Error('Nieprawidłowe ustawienia wykrywania.');
 const mask=new Uint8Array(width*height);for(let i=0;i<mask.length;i++){const p=i*4;mask[i]=data[p+3]>180&&(data[p]*0.2126+data[p+1]*0.7152+data[p+2]*0.0722)<threshold?1:0;}
 const all=[];
 for(const vertical of [false,true]){
  const major=vertical?height:width,minor=vertical?width:height;let active=[];
  const complete=g=>{const thickness=g.last-g.first+1;if(thickness<minThickness||thickness>maxThickness)return;const a=(g.start+g.end)/2,length=g.end-g.start+1;if(length<minLength)return;const mid=(g.first+g.last)/2;all.push({points:vertical?[{x:mid,y:g.start},{x:mid,y:g.end}]:[{x:g.start,y:mid},{x:g.end,y:mid}],thickness,length,axis:vertical?'vertical':'horizontal'});};
  for(let line=0;line<minor;line++){
   const runs=[];let start=-1,last=-1;
   for(let pos=0;pos<=major+2;pos++){const dark=pos<major&&mask[vertical?pos*width+line:line*width+pos];if(dark){if(start<0)start=pos;last=pos;}if(start>=0&&pos-last>2){if(last-start+1>=minLength)runs.push({start,end:last});start=-1;}}
   const next=[],used=new Set();for(const run of runs){const index=active.findIndex((g,i)=>!used.has(i)&&Math.abs(g.start-run.start)<=6&&Math.abs(g.end-run.end)<=6);if(index>=0){const g=active[index];used.add(index);g.last=line;g.start=Math.min(g.start,run.start);g.end=Math.max(g.end,run.end);next.push(g);}else next.push({...run,first:line,last:line});}
   active.forEach((g,i)=>{if(!used.has(i))complete(g);});active=next;
  }active.forEach(complete);
 }
 return all.sort((a,b)=>b.length-a.length).slice(0,limit);
}
