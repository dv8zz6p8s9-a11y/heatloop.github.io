import {strict as assert} from 'node:assert';
import {MODEL_SCALE_CM_PER_PX,BEND_RADII_PX,DEFAULT_BEND_RADIUS_PX,selectBendRadius} from './bend-radii.mjs';
assert.equal(MODEL_SCALE_CM_PER_PX,1);
assert.deepEqual(BEND_RADII_PX,{standard:15,wide:20,tight:10});
assert.equal(DEFAULT_BEND_RADIUS_PX,15);
for(const [mode,r] of Object.entries(BEND_RADII_PX)){
 const result=selectBendRadius(mode,r);
 assert.equal(result.radiusCm,r);assert.equal(result.diameterCm,2*r);assert.equal(result.validForPipe,true);
 assert.equal(selectBendRadius(mode,r+1).validForPipe,false);
}
assert.throws(()=>selectBendRadius('other'),RangeError);
assert.throws(()=>selectBendRadius('standard',-1),RangeError);
assert.throws(()=>selectBendRadius('standard',Infinity),RangeError);
console.log('PASS: bend radii scale, presets, and pipe-minimum validation');
