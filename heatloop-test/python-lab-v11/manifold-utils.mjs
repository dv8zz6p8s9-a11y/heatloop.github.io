/** Shared HeatLoop Python LAB state helpers for manifolds and per-circuit settings.
 * These are configuration/quantity helpers, not hydraulic sizing approvals.
 */
export const SPACINGS=[0.10,0.125,0.15,0.20];
export const MANIFOLD_ANGLES=[0,90,180,270];
export function normalizeManifoldAngle(angle){
 const value=Number(angle);
 if(!Number.isFinite(value)||!Number.isInteger(value)||!MANIFOLD_ANGLES.includes(value))
   throw Error('Obrót rozdzielacza: dozwolone 0°, 90°, 180° albo 270°.');
 return value;
}
export function rotateManifoldBy(manifold,step){
 const a=normalizeManifoldAngle(manifold?.angle??0);
 if(!Number.isInteger(step)||Math.abs(step)!==90)
  throw Error('Można obracać tylko o 90°.');
 return (a+step+360)%360;
}
export function spacingAllowed(spacing) {
 return typeof spacing==='number'&&Number.isFinite(spacing)&&SPACINGS.some(s=>Math.abs(s-spacing)<1e-8);
}
export function normalizeLoopSettings(data={},defaults={spacing_m:.15,feed_m:2,back_m:2},validManifolds=[]) {
 const spacing_m=Number(data.spacing_m??defaults.spacing_m);
 const feed_m=Number(data.feed_m??defaults.feed_m);
 const back_m=Number(data.back_m??defaults.back_m);
 if(!spacingAllowed(spacing_m))throw Error('Rozstaw pętli: 10, 12,5, 15 lub 20 cm.');
 if(!Number.isFinite(feed_m)||feed_m<0||feed_m>100||!Number.isFinite(back_m)||back_m<0||back_m>100)
   throw Error('Dojście i powrót do rozdzielacza muszą wynosić 0–100 m.');
 const manifold_id=data.manifold_id==null||data.manifold_id===''?null:Number(data.manifold_id);
 if(manifold_id!==null && (!Number.isInteger(manifold_id)||!validManifolds.some(m=>m.id===manifold_id)))
   throw Error('Wybierz istniejący rozdzielacz albo brak przypisania.');
 return {spacing_m,feed_m,back_m,manifold_id};
}
export function manifoldCircuits(rooms,manifoldId) {
 let count=0;
 for(const room of rooms||[]) {
   const zones=Array.isArray(room.heatingZones)?room.heatingZones:[];
   if(zones.length===0) {
     if(room.implicitSettings?.manifold_id===manifoldId)count++;
   } else {
     for(const zone of zones)if(zone.settings?.manifold_id===manifoldId)count++;
   }
 }
 return count;
}
export function manifoldQuantities(rooms,manifold) {
 const assigned=manifoldCircuits(rooms,manifold.id);
 const requested=Number(manifold.requestedSections)||0;
 const sections=Math.max(assigned,requested);
 return {
   assignedLoops:assigned,
   sections,
   cabinetSections:sections>0?sections+2:0,
   euroconus:2*sections,
   isolatingValves:sections>0?2:0,
   pumpGroup:!!manifold.pumpGroup,
   unusedSections:Math.max(0,sections-assigned)
 };
}
export function createManifold(id) {
 return {id,name:'Rozdzielacz '+id,point:null,angle:0,requestedSections:0,type:'flowmeters',pumpGroup:false};
}
