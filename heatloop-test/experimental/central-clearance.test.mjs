import {test} from 'node:test';import {strict as assert} from 'node:assert';import {centralReturnEnvelope} from './central-clearance.mjs';
test('reserve extra space beyond bare bend diameter',()=>{const r=centralReturnEnvelope();assert.ok(r.widthCm>30);assert.ok(r.heightCm>60)});
test('larger manufacturer minimum expands envelope',()=>{const a=centralReturnEnvelope(),b=centralReturnEnvelope({manufacturerMinRadiusCm:20});assert.ok(b.widthCm>a.widthCm);assert.ok(b.heightCm>a.heightCm)});
test('reject insufficient room rather than squeeze',()=>{const e=centralReturnEnvelope();assert.equal(e.canFit({widthCm:e.widthCm-1,heightCm:e.heightCm}),false);assert.equal(e.canFit({widthCm:e.widthCm,heightCm:e.heightCm}),true)});
test('reject invalid geometry',()=>assert.throws(()=>centralReturnEnvelope({pipeDiameterCm:Infinity}),RangeError));
