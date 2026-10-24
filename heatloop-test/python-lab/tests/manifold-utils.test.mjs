import test from 'node:test';
import assert from 'node:assert/strict';
import {SPACINGS,spacingAllowed,normalizeLoopSettings,manifoldCircuits,manifoldQuantities,createManifold} from '../manifold-utils.mjs';

test('Four HeatLoop pipe spacings accepted',()=>{
 for(const s of [.10,.125,.15,.20])assert.equal(spacingAllowed(s),true);
 assert.equal(spacingAllowed(.13),false);
});
test('Two heating fields can have different spacings and manifolds',()=>{
 const manifolds=[createManifold(1),createManifold(2)];
 const a=normalizeLoopSettings({spacing_m:.10,manifold_id:1,feed_m:2,back_m:3},undefined,manifolds);
 const b=normalizeLoopSettings({spacing_m:.20,manifold_id:2,feed_m:4,back_m:5},undefined,manifolds);
 assert.equal(a.spacing_m,.10);assert.equal(b.spacing_m,.20);
 assert.equal(a.manifold_id,1);assert.equal(b.manifold_id,2);
 assert.equal(a.feed_m,2);assert.equal(b.back_m,5);
});
test('Reject unknown manifold assignment',()=>{
 assert.throws(()=>normalizeLoopSettings({spacing_m:.10,feed_m:2,back_m:2,manifold_id:99},undefined,[createManifold(1)]));
});
test('Manifold count includes all rooms and zones',()=>{
 const rooms=[
  {heatingZones:[{settings:{manifold_id:1}},{settings:{manifold_id:2}}]},
  {heatingZones:[{settings:{manifold_id:1}}]},
  {heatingZones:[],implicitSettings:{manifold_id:1}},
 ];
 assert.equal(manifoldCircuits(rooms,1),3);
 assert.equal(manifoldCircuits(rooms,2),1);
});
test('Eight circuits: cabinet size 10, Eurokonus 16, 2 valves',()=>{
 const rooms=[{heatingZones:Array.from({length:8},()=>({settings:{manifold_id:1}}))}];
 const result=manifoldQuantities(rooms,createManifold(1));
 assert.equal(result.sections,8);
 assert.equal(result.cabinetSections,10);
 assert.equal(result.euroconus,16);
 assert.equal(result.isolatingValves,2);
 assert.equal(result.pumpGroup,false);
});
test('Manual manifold sections can exceed assigned circuit count',()=>{
 const m={...createManifold(1),requestedSections:8};
 const r=manifoldQuantities([{heatingZones:[{settings:{manifold_id:1}}]}],m);
 assert.equal(r.assignedLoops,1);
 assert.equal(r.sections,8);assert.equal(r.cabinetSections,10);assert.equal(r.unusedSections,7);
});
test('Requested sections smaller than assigned are enlarged automatically',()=>{
 const m={...createManifold(1),requestedSections:1};
 const r=manifoldQuantities([{heatingZones:Array.from({length:5},()=>({settings:{manifold_id:1}}))}],m);
 assert.equal(r.sections,5);
 assert.equal(r.cabinetSections,7);
});
test('Unassigned manifold without manual sections has no material quantities',()=>{
 const r=manifoldQuantities([],createManifold(1));
 assert.equal(r.sections,0);assert.equal(r.cabinetSections,0);assert.equal(r.euroconus,0);
});
test('Feeder and return lengths cannot be negative',()=>{
 assert.throws(()=>normalizeLoopSettings({spacing_m:.15,feed_m:-1,back_m:1}));
 assert.throws(()=>normalizeLoopSettings({spacing_m:.15,feed_m:1,back_m:101}));
});
