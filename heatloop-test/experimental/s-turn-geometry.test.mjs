import {strict as assert} from 'node:assert';
import {generateSTurn} from './s-turn-geometry.mjs';
const near=(a,b,eps=1e-8)=>assert.ok(Math.abs(a-b)<eps,`${a} vs ${b}`);
for(const [mode,r] of [['tight',10],['standard',15],['wide',20]]){
 const s=generateSTurn({mode});
 near(s.exactLengthCm,2*Math.PI*r);near(s.requiredHeightCm,4*r);near(s.requiredWidthCm,2*r);
 near(s.points[0].x,0);near(s.points[0].y,-2*r);near(s.points.at(-1).x,0);near(s.points.at(-1).y,2*r);
 near(s.points[48].x,0);near(s.points[48].y,0);assert.equal(s.points.length,97);
 assert.ok(Math.abs(s.approxLengthCm-s.exactLengthCm)/s.exactLengthCm<.0002);
 const mirrored=generateSTurn({mode,handedness:-1});
 for(let i=0;i<s.points.length;i++){near(s.points[i].x,-mirrored.points[i].x);near(s.points[i].y,mirrored.points[i].y)}
 const shifted=generateSTurn({mode,center:{x:30,y:-12},rotation:Math.PI/3});near(shifted.exactLengthCm,s.exactLengthCm);
 assert.throws(()=>generateSTurn({mode,minManufacturerRadiusCm:r+1}),RangeError);
}
for(const args of [{mode:'invalid'},{samplesPerArc:0},{samplesPerArc:3.2},{center:{x:Infinity,y:0}},{rotation:NaN},{handedness:0},{minManufacturerRadiusCm:-1}])assert.throws(()=>generateSTurn(args),RangeError);
console.log('PASS: center, radius, dimensions, length, reflection, rotation, invalid inputs');
