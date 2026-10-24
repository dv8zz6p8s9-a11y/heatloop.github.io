import test from 'node:test';
import assert from 'node:assert/strict';
import {metricPolylineLength,segmentInsideForbidden,previewOrthogonalRoute,generateLoopApproaches}
 from '../approach-routing.mjs';
const obstacle=[[120,120],[260,120],[260,260],[120,260]];
const opts={sx:.01,sy:.01,obstacles:[obstacle]};
test('Meter lengths use calibrated source X/Y independent of zoom',()=>{
 assert.equal(metricPolylineLength([[0,0],[300,400]],.01,.01),5);
});
test('Segment through blocked heating field is rejected',()=>{
 assert.equal(segmentInsideForbidden([0,200],[400,200],obstacle),true);
 assert.equal(segmentInsideForbidden([0,50],[400,50],obstacle),false);
});
test('Touching an area boundary without entering is possible',()=>{
 assert.equal(segmentInsideForbidden([0,120],[400,120],obstacle),false);
});
test('Choose orthogonal approach avoiding other heating fields',()=>{
 const route=previewOrthogonalRoute([0,200],[400,200],opts);
 assert.equal(route.status,'draft');
 assert.ok(route.points.length>=3);
 for(let i=1;i<route.points.length;i++)
  assert.equal(segmentInsideForbidden(route.points[i-1],route.points[i],obstacle),false);
});
test('Shows no geometry for unsupported heating polygons',()=>{
 const preview=generateLoopApproaches({status:'planned'},{id:1,point:[40,40]},opts);
 assert.equal(preview.status,'no-loop');
 assert.equal(preview.supply.length,0);
});
test('No manifold location means no invented route',()=>{
 const layout={status:'experimental',drawn_m:32,supply:[[1,1],[2,1]],
  return:[[2,2],[1.2,1.2]],cap:[[2,1]]};
 const preview=generateLoopApproaches(layout,null,{sx:.01,sy:.01});
 assert.equal(preview.status,'no-manifold');
});
test('Routing preserves true Python loop start/end',()=>{
 const layout={status:'experimental',drawn_m:32,supply:[[1,1],[2,1]],
  return:[[2,2],[1.2,1.2]],cap:[[2,1]]};
 const preview=generateLoopApproaches(layout,{id:2,point:[20,20]},{sx:.01,sy:.01});
 assert.equal(preview.status,'draft');
 assert.deepEqual(preview.supply.at(-1),[100,100]);
 assert.deepEqual(preview.return[0],[120,120]);
 assert.equal(preview.manifold_id,2);
 assert.equal(preview.supply_m,1.6);
 assert.equal(preview.return_m,2);
});
test('Invalid calibration is rejected',()=>{
 const route=previewOrthogonalRoute([0,0],[100,100],{sx:0,sy:0});
 assert.equal(route.status,'invalid');
});
