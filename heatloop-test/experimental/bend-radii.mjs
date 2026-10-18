/** HeatLoop v2 — nominal bend radii in model units. 1 px = 1 cm.
 * Geometric centerline radii, not manufacturer-approved bend minima.
 */
export const MODEL_SCALE_CM_PER_PX = 1;
export const BEND_RADII_PX = Object.freeze({standard:15,wide:20,tight:10});
export const DEFAULT_BEND_RADIUS_PX = BEND_RADII_PX.standard;
export function selectBendRadius(mode='standard',minManufacturerRadiusCm=0){
 if(!Object.hasOwn(BEND_RADII_PX,mode))throw new RangeError('Unknown bend radius');
 if(!Number.isFinite(minManufacturerRadiusCm)||minManufacturerRadiusCm<0)throw new RangeError('Invalid manufacturer radius');
 const radiusPx=BEND_RADII_PX[mode],radiusCm=radiusPx*MODEL_SCALE_CM_PER_PX;
 return {mode,radiusPx,radiusCm,diameterCm:radiusCm*2,validForPipe:radiusCm>=minManufacturerRadiusCm};
}
