/** Reference proportions from installer photo and accepted mockup.
 * This is a VISUAL target, not measured site geometry or a certified pipe design.
 * Model scale: 1 px = 1 cm, in model coordinates only (not CSS device pixels).
 */
export const PHOTO_REFERENCE=Object.freeze({
 modelCmPerPx:1,spacingCm:15,wallOffsetCm:10,
 centralReturn:{shape:'elongated-teardrop',radiusPreset:'standard',radiusCm:15,centerMode:'editable-room-center'},
 outerTurns:{radiusCm:20,style:'tangent-rounded'},
 pipe:{continuous:true,openEndpoints:2,endpointSide:'same',separateSupplyAndReturn:true},
 constraints:{validateSelfIntersections:true,validateWallClearance:true,validateSegmentSpacing:true,validateManufacturerBendRadius:true},
 status:'reference-only-not-validated-geometry'
});
