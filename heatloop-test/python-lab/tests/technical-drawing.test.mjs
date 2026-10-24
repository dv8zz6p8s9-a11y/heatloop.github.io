import test from 'node:test';
import assert from 'node:assert/strict';
import {
 cleanRouting,effectiveEndpoints,getZoneTag,plannedCorridorPolyline,
 snapToFieldEdge,guideMetricLength
} from '../technical-drawing.mjs';
import {generateLoopApproaches,previewGuidedRoute,previewParallelGuide} from '../approach-routing.mjs';

const field=[[100,100],[400,100],[400,360],[100,360]];
const layout={
 status:'schematic',drawn_m:32,
 supply:[[1.1,1.1],[3.5,1.1]],
 return:[[3.4,3.4],[1.2,1.2]],cap:[[3.5,1.1]]
};
const manifold={id:2,name:'Rozdzielacz 2',point:[30,30]};

test('Old JSON without routing data has non-destructive defaults',()=>{
 assert.deepEqual(cleanRouting(),{direction:'normal',preferredStart:null,preferredEnd:null,guide:[],corridorWidthM:.20});
});
test('Routing is independent for each heating field',()=>{
 const a=cleanRouting({direction:'reverse',guide:[[20,20]],corridorWidthM:.15});
 const b=cleanRouting({});
 assert.equal(a.guide.length,1);
 assert.equal(b.guide.length,0);
 assert.equal(a.direction,'reverse');
 assert.equal(b.direction,'normal');
});
test('Reject malformed guide and extreme widths on JSON import',()=>{
 assert.throws(()=>cleanRouting({guide:[[NaN,20]]}));
 assert.throws(()=>cleanRouting({guide:Array.from({length:26},(_,i)=>[i,i])}));
 assert.throws(()=>cleanRouting({corridorWidthM:0.01}));
 assert.throws(()=>cleanRouting({preferredEnd:['a','b']}));
});
test('Start/end markers snap to geometric boundary',()=>{
 assert.deepEqual(snapToFieldEdge([155,115],field,.01,.01),[155,100]);
 assert.equal(snapToFieldEdge([1000,1000],field,.01,.01),null);
});
test('Reversing the circuit swaps ends but does not move the pipe layout',()=>{
 const a=effectiveEndpoints(layout,.01,.01,{});
 const b=effectiveEndpoints(layout,.01,.01,{direction:'reverse'});
 assert.deepEqual(a.inlet,b.outlet);
 assert.deepEqual(a.outlet,b.inlet);
 assert.deepEqual(layout.supply[0],[1.1,1.1]);
});
test('Guide preview follows technician waypoints in order',()=>{
 const guide=[[70,50],[95,90]];
 const route=previewGuidedRoute(manifold.point,[110,110],guide,{sx:.01,sy:.01,obstacles:[]});
 assert.equal(route.status,'draft');
 assert.ok(route.points.find(p=>p[0]===70&&p[1]===50));
 assert.ok(route.points.find(p=>p[0]===95&&p[1]===90));
});
test('Reject waypoint routing through other floor-heating zone',()=>{
 const obstacles=[[[40,40],[90,40],[90,80],[40,80]]];
 const route=previewGuidedRoute([20,20],[100,100],[[60,50]],{sx:.01,sy:.01,obstacles});
 assert.equal(route.status,'blocked');
});
test('Guided supply and return use same planning spine but stay marked unverified',()=>{
 const guide=[[50,40],[90,90]];
 const r=generateLoopApproaches(layout,manifold,{sx:.01,sy:.01,obstacles:[],guide,direction:'reverse'});
 assert.equal(r.status,'draft');
 assert.equal(r.guided,true);
 assert.equal(r.reversed,true);
 assert.deepEqual(r.supply.at(-1),[120,120]);
 assert.deepEqual(r.return[0],[110,110]);
 assert.match(r.reason,/kontroli odstępu/);
});
test('Technical tag contains readable loop identifier and only short lines',()=>{
 const tag=getZoneTag({name:'Pokój dzienny',points:field},null,3,layout,
  {spacing_m:.125},manifold,.01,.01);
 assert.equal(tag.id,'P04');
 assert.match(tag.lines[0],/12,5 cm/);
 assert.match(tag.lines[1],/Rozdzielacz 2/);
 assert.ok(tag.lines.length<=3);
});
test('Guided corridor length depends on calibration X and Y',()=>{
 const guide={guide:[[50,30],[50,130]],corridorWidthM:.20};
 assert.equal(guideMetricLength([30,30],guide,.01,.02),2.2);
 assert.deepEqual(plannedCorridorPolyline([30,30],guide),[[30,30],[50,30],[50,130]]);
});
test('Unsupported and uncalibrated loops must not claim valid physical ends',()=>{
 assert.equal(effectiveEndpoints({status:'planned'},.01,.01),null);
 assert.equal(effectiveEndpoints(layout,0,.01),null);
});

test('Parallel guide offsets supply and return centre lines by 10 cm',()=>{
 const res=previewParallelGuide([10,10],[140,80],[140,100],[[60,10],[120,10]],{
   sx:.01,sy:.01,corridorWidthM:.20,obstacles:[]
 });
 assert.equal(res.status,'draft');
 assert.equal(res.parallel,true);
 assert.equal(res.local_spacing_m,.10);
 // For the first 2 straight guide segments, the two lane centerlines
 // retain a distance of 10 px = 10 cm.
 assert.equal(Math.abs(res.supply[2][1]-res.return.at(-3)[1]),10);
 assert.notDeepEqual(res.supply,res.return.toReversed());
});
test('Narrow technical corridor fails rather than overlapping two runs',()=>{
 const r=previewParallelGuide([0,0],[100,100],[120,100],[[30,0],[60,0]],{
  sx:.01,sy:.01,obstacles:[],corridorWidthM:.11
 });
 assert.equal(r.status,'blocked');
 assert.match(r.reason,/zbyt wąski/);
});
test('Dual-lane corridor refuses to cut through another heating zone',()=>{
 const r=previewParallelGuide([10,10],[140,100],[140,120],[[60,10],[100,60]],{
  sx:.01,sy:.01,obstacles:[[[40,0],[80,0],[80,40],[40,40]]],corridorWidthM:.20
 });
 assert.equal(r.status,'blocked');
});
