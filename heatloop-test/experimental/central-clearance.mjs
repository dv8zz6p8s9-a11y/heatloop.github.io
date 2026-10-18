/** Central return reservation. Units cm. This is a conservative bounding envelope,
 * not a finished routing solution. Do not shrink bend radius to force a fit.
 */
export function centralReturnEnvelope({radiusCm=15,pipeDiameterCm=1.6,nominalSpacingCm=15,manufacturerMinRadiusCm=0,clearanceCm=0}={}){
 const v=[radiusCm,pipeDiameterCm,nominalSpacingCm,manufacturerMinRadiusCm,clearanceCm];
 if(v.some(x=>!Number.isFinite(x))||radiusCm<=0||pipeDiameterCm<=0||nominalSpacingCm<pipeDiameterCm||manufacturerMinRadiusCm<0||clearanceCm<0)throw new RangeError('Invalid central return dimensions');
 const effectiveRadiusCm=Math.max(radiusCm,manufacturerMinRadiusCm);
 // 2 tangent semicircles with full pipe thickness and nominal centerline clearance
 // to neighboring runs on each side; 4r height of S primitive.
 const lateralReserveCm=Math.max(nominalSpacingCm,pipeDiameterCm+clearanceCm);
 const widthCm=2*effectiveRadiusCm+pipeDiameterCm+2*lateralReserveCm;
 const heightCm=4*effectiveRadiusCm+pipeDiameterCm+2*lateralReserveCm;
 return {effectiveRadiusCm,lateralReserveCm,widthCm,heightCm,canFit:({widthCm:w,heightCm:h})=>Number.isFinite(w)&&Number.isFinite(h)&&w>=widthCm&&h>=heightCm,status:'conservative-envelope-not-route-validation'};
}
