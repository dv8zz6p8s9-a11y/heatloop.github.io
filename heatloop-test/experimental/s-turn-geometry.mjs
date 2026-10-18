import {BEND_RADII_PX, MODEL_SCALE_CM_PER_PX} from './bend-radii.mjs';
/** S: two tangent semicircles of opposite curvature; inflection exactly at center.
 * Units are model pixels, 1 px = 1 cm. Local primitive, NOT a complete loop.
 */
export function generateSTurn({mode='standard',samplesPerArc=48,minManufacturerRadiusCm=0,center={x:0,y:0},rotation=0,handedness=1}={}){
 if(!Object.hasOwn(BEND_RADII_PX,mode))throw new RangeError('Unknown radius preset');
 if(!Number.isInteger(samplesPerArc)||samplesPerArc<8||samplesPerArc>10000)throw new RangeError('Invalid sampling');
 if(!Number.isFinite(minManufacturerRadiusCm)||minManufacturerRadiusCm<0)throw new RangeError('Invalid pipe minimum radius');
 if(!Number.isFinite(center?.x)||!Number.isFinite(center?.y)||!Number.isFinite(rotation)||![1,-1].includes(handedness))throw new RangeError('Invalid transform');
 const r=BEND_RADII_PX[mode];
 if(r*MODEL_SCALE_CM_PER_PX<minManufacturerRadiusCm)throw new RangeError('Radius smaller than manufacturer minimum');
 const points=[];
 for(let arc=0;arc<2;arc++){
  const sign=arc===0?1:-1,theta=arc===0?0:Math.PI,x0=0,y0=arc===0?-2*r:0;
  for(let i=arc===0?0:1;i<=samplesPerArc;i++){
   const u=Math.PI*i/samplesPerArc,theta2=theta+sign*u;
   const x=x0+r/sign*(Math.sin(theta2)-Math.sin(theta));
   const y=y0+r/sign*(-Math.cos(theta2)+Math.cos(theta));
   const xx=x*handedness,yy=y;
   points.push({x:center.x+xx*Math.cos(rotation)-yy*Math.sin(rotation),y:center.y+xx*Math.sin(rotation)+yy*Math.cos(rotation)});
  }
 }
 return {mode,radiusPx:r,radiusCm:r*MODEL_SCALE_CM_PER_PX,center:{...center},handedness,rotation,points,exactLengthCm:2*Math.PI*r*MODEL_SCALE_CM_PER_PX,approxLengthCm:points.slice(1).reduce((s,p,i)=>s+Math.hypot(p.x-points[i].x,p.y-points[i].y),0)*MODEL_SCALE_CM_PER_PX,requiredHeightCm:4*r,requiredWidthCm:2*r};
}
