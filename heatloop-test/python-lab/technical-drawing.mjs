/** HeatLoop technical drawing - pure state/label helpers.
 * Printed geometry is not a validated installation routing.
 */
export const DRAWING_COLORS=Object.freeze({
 supply:"#087ab2",return:"#e17b38",turn:"#199e80",field:"#16876c",
 manifold:"#b77928",label:"#193746",warning:"#a76516",room:"#677983"
});
const finite=p=>Array.isArray(p)&&p.length===2&&p.every(x=>typeof x==="number"&&Number.isFinite(x));
const copy=p=>p?[...p]:null;
export function cleanRouting(input={}){
 if(input===null||typeof input!=="object"||Array.isArray(input))throw Error("Nieprawidłowy zapis prowadzenia pętli");
 const mode=input.direction==="reverse"?"reverse":"normal";
 const start=input.preferredStart??null,end=input.preferredEnd??null;
 for(const p of [start,end])if(p!==null&&!finite(p))throw Error("Nieprawidłowy znacznik początku/końca");
 const guide=Array.isArray(input.guide)?input.guide:[];
 if(guide.length>25||guide.some(p=>!finite(p)))throw Error("Trasa pomocnicza: maksymalnie 25 poprawnych punktów");
 const corridorWidthM=input.corridorWidthM==null?.20:Number(input.corridorWidthM);
 if(!Number.isFinite(corridorWidthM)||corridorWidthM<.10||corridorWidthM>.80)
  throw Error("Szerokość pasa technicznego musi wynosić 10–80 cm");
 return {direction:mode,preferredStart:copy(start),preferredEnd:copy(end),
  guide:guide.map(copy),corridorWidthM};
}
export function effectiveEndpoints(layout,sx,sy,config={}){
 const r=cleanRouting(config);
 if(!["experimental","schematic"].includes(layout?.status))return null;
 if(!(sx>0&&sy>0)||!Array.isArray(layout.supply)||!layout.supply.length
   ||!Array.isArray(layout.return)||!layout.return.length)return null;
 const a=layout.supply[0],b=layout.return.at(-1);
 if(!finite(a)||!finite(b))return null;
 const originalIn=[a[0]/sx,a[1]/sy],originalOut=[b[0]/sx,b[1]/sy];
 return r.direction==="reverse"?{inlet:originalOut,outlet:originalIn,reversed:true}:
  {inlet:originalIn,outlet:originalOut,reversed:false};
}
export function getZoneTag(room,zone,index,layout,settings,manifold,sx,sy){
 const points=zone?.points||room.points;
 const dims=points.reduce((r,p)=>({x:Math.min(r.x,p[0]),y:Math.min(r.y,p[1])}),{x:Infinity,y:Infinity});
 const estimated=Number(layout?.total_m);
 const warning=layout?.status==="schematic"?"SZKIC - nieweryfikowany":layout?.status==="experimental"?"TRASA TESTOWA":"BRAK TRASY";
 const manifoldText=manifold?.name||"Nieprzypisany";
 return {
  x:dims.x+8,y:dims.y+8,
  id:"P"+String(index+1).padStart(2,"0"),
  title:String(room.name||"Pomieszczenie").slice(0,38),
  lines:[
   String((Math.abs(points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p[0]*q[1]-q[0]*p[1]},0))/2*sx*sy).toFixed(2)).replace(".",",")+
    " m² · rozstaw "+String(Math.round(settings.spacing_m*1000)/10).replace(".",",")+" cm",
   "Rozdz.: "+String(manifoldText).slice(0,28),
   Number.isFinite(estimated)?"Długość (test): "+estimated.toFixed(1).replace(".",",")+" m":warning
  ],
  warning
 };
}
export function technicalSummary(room,zone,zoneIndex,layout,settings,manifold,sx,sy){
 const tag=getZoneTag(room,zone,zoneIndex,layout,settings,manifold,sx,sy);
 return [tag.id,tag.title,...tag.lines,tag.warning].join(" | ");
}
export function plannedCorridorPolyline(manifoldPoint,routing){
 const r=cleanRouting(routing);
 if(!finite(manifoldPoint)||r.guide.length===0)return [];
 return [copy(manifoldPoint),...r.guide.map(copy)];
}

/** Project the user's pointer onto a heating-field edge; returns null if far away. */
export function snapToFieldEdge(point,polygon,sx,sy,maxDistanceM=.80){
 if(!finite(point)||!Array.isArray(polygon)||polygon.length<3||!(sx>0&&sy>0))return null;
 let best=null,distance=Infinity;
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length];
  const ax=a[0]*sx,ay=a[1]*sy,bx=b[0]*sx,by=b[1]*sy;
  const px=point[0]*sx,py=point[1]*sy;
  const dx=bx-ax,dy=by-ay;
  const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1)));
  const x=ax+t*dx,y=ay+t*dy;
  const d=Math.hypot(px-x,py-y);
  if(d<distance){distance=d;best=[x/sx,y/sy]}
 }
 return distance<=maxDistanceM?best:null;
}
export function guideMetricLength(manifold,routing,sx,sy){
 const pts=plannedCorridorPolyline(manifold,routing);
 if(pts.length<2||!(sx>0&&sy>0))return null;
 let length=0;
 for(let i=1;i<pts.length;i++){
  length+=Math.hypot((pts[i][0]-pts[i-1][0])*sx,(pts[i][1]-pts[i-1][1])*sy);
 }
 return length;
}
