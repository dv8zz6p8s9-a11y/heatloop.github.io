/** Screen-space map scale for calibrated technical plans.
 * Use a source-axis screen transform (SVG getScreenCTM) so zoom,
 * panning, 90° rotation and responsive sizing NEVER change metres.
 * Distorted scans: the horizontal screen axis switches from X to Y at 90°.
 */
export const NICE_METRES=[1,2,2.5,5];
export function scaleBarForDrawing({sx,sy,rotation=0,pixelsPerSourceX,pixelsPerSourceY,
  targetPixels=140,maxPixels=180,minPixels=62}={}){
 if(!(sx>0&&sy>0) || !Number.isFinite(sx)||!Number.isFinite(sy))return null;
 if(![0,90,180,270].includes(rotation))return null;
 const rotated=rotation%180!==0;
 const metresPerSource=rotated?sy:sx;
 const pixelsPerSource=rotated?pixelsPerSourceY:pixelsPerSourceX;
 if(!(pixelsPerSource>0) || !Number.isFinite(pixelsPerSource))return null;
 const pxPerMetre=pixelsPerSource/metresPerSource;
 const candidates=[];
 for(let power=-4;power<=5;power++){
  const pow=10**power;
  for(const mantissa of NICE_METRES){
   const lengthM=mantissa*pow,pixels=lengthM*pxPerMetre;
   if(pixels>=minPixels&&pixels<=maxPixels)candidates.push({lengthM,pixels});
  }
 }
 let chosen=candidates.sort((a,b)=>Math.abs(a.pixels-targetPixels)-Math.abs(b.pixels-targetPixels))[0];
 if(!chosen){
  const raw=targetPixels/pxPerMetre;
  if(!(raw>0&&Number.isFinite(raw)))return null;
  const power=Math.floor(Math.log10(raw));
  const all=NICE_METRES.map(m=>m*10**power).concat(NICE_METRES.map(m=>m*10**(power+1)));
  const lengthM=all.sort((a,b)=>Math.abs(a*pxPerMetre-targetPixels)-Math.abs(b*pxPerMetre-targetPixels))[0];
  if(!Number.isFinite(lengthM))return null;
  chosen={lengthM,pixels:lengthM*pxPerMetre};
 }
 const format=val=>{
  if(val<1){
   const cm=val*100;
   return `${Number(cm.toFixed(2)).toLocaleString('pl-PL',{maximumFractionDigits:2})} cm`;
  }
  return `${Number(val.toFixed(3)).toLocaleString('pl-PL',{maximumFractionDigits:3})} m`;
 };
 return{
  metres:chosen.lengthM,
  pixels:chosen.pixels,
  halfLabel:format(chosen.lengthM/2),
  label:format(chosen.lengthM),
  sourceAxis:rotated?'Y':'X',
  isDistorted:Math.abs(sx-sy)/Math.max(sx,sy)>0.01,
  metresPerScreenPixel:metresPerSource/pixelsPerSource,
 };
}
export function getScaleBarFromMatrix({sx,sy,rotation=0,matrix,...options}={}){
 if(!matrix||[matrix.a,matrix.b,matrix.c,matrix.d].some(v=>!Number.isFinite(v)))return null;
 return scaleBarForDrawing({sx,sy,rotation,
  pixelsPerSourceX:Math.hypot(matrix.a,matrix.b),
  pixelsPerSourceY:Math.hypot(matrix.c,matrix.d),
  ...options});
}
