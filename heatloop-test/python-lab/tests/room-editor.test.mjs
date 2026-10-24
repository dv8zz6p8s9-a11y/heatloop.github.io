import test from 'node:test';
import assert from 'node:assert/strict';
import {polygonArea,validPolygon,insideRoom,rectFromCorners,changeVertex,movePolygon,addVertex,deleteVertex,zonesOverlap,normalizeClosedPolygon,tappedFirstPoint} from '../room-editor.mjs';
const room=[[100,100],[600,100],[600,500],[100,500]];
const heating=[[160,160],[420,160],[420,390],[160,390]];
test('Room geometry is independent of heating surface',()=>{
 assert.equal(polygonArea(room),200000);assert.equal(polygonArea(heating),59800);
 assert.equal(polygonArea(room)-polygonArea(heating),140200);
});
test('Custom heating field is contained',()=>assert.equal(insideRoom(room,heating),true));
test('Reject field crossing room edge',()=>assert.equal(insideRoom(room,[[160,160],[720,160],[720,390],[160,390]]),false));
test('Reject self-intersecting room',()=>assert.equal(validPolygon([[0,0],[400,400],[0,400],[400,0]]),false));
test('Concave room: reject an edge crossing the notch',()=>{
 const L=[[0,0],[500,0],[500,100],[100,100],[100,400],[0,400]];
 const field=[[30,300],[60,300],[200,50],[50,50]];
 assert.equal(insideRoom(L,field),false);
});
test('Drag rectangle corner, preserve orthogonality',()=>{
 const next=changeVertex(room,2,[650,550],'rect');
 assert.deepEqual(next,[[100,100],[650,100],[650,550],[100,550]]);
});
test('Moving room and its custom field conserves areas',()=>{
 const moved=movePolygon(room,45,-20),zone=movePolygon(heating,45,-20);
 assert.equal(polygonArea(moved),polygonArea(room));
 assert.equal(polygonArea(zone),polygonArea(heating));
 assert.equal(insideRoom(moved,zone),true);
});
test('Add and delete a vertex without crossing',()=>{
 const updated=addVertex(room,[350,101],22);
 assert.equal(updated.length,5);
 assert.equal(deleteVertex(updated,1).length,4);
});
test('Reject removal below three vertices',()=>assert.throws(()=>deleteVertex([[0,0],[100,0],[0,100]],0)));
test('Room-boundary heating zone allowed',()=>assert.equal(insideRoom(room,room),true));

test('Separate heating fields do not overlap',()=>{
 const a=[[0,0],[100,0],[100,100],[0,100]];
 const b=[[150,0],[250,0],[250,100],[150,100]];
 assert.equal(zonesOverlap(a,b),false);
});
test('Heating fields sharing only a border can coexist',()=>{
 const a=[[0,0],[100,0],[100,100],[0,100]];
 const b=[[100,0],[200,0],[200,100],[100,100]];
 assert.equal(zonesOverlap(a,b),false);
});
test('Overlapping and identical heating fields are rejected',()=>{
 const a=[[0,0],[100,0],[100,100],[0,100]];
 const b=[[60,60],[160,60],[160,160],[60,160]];
 assert.equal(zonesOverlap(a,b),true);
 assert.equal(zonesOverlap(a,a),true);
});
test('Adding another heating field must not mutate earlier coordinates',()=>{
 const room=[[0,0],[500,0],[500,500],[0,500]];
 const first=[[50,50],[150,50],[150,150],[50,150]];
 const before=JSON.stringify(first);
 const second=[[220,200],[320,200],[320,300],[220,300]];
 assert.ok(insideRoom(room,first));
 assert.ok(insideRoom(room,second));
 assert.ok(!zonesOverlap(first,second));
 assert.equal(JSON.stringify(first),before);
});

test('Button closing polygon discards repeated starting vertex',()=>{
 const pts=[[0,0],[100,0],[100,100],[0,100],[0,0]];
 const closed=normalizeClosedPolygon(pts,15,4);
 assert.equal(closed.length,4);
 assert.equal(validPolygon(closed),true);
});
test('Near-start touch closes after at least three corners',()=>{
 const pts=[[0,0],[100,0],[100,100],[0,100]];
 assert.equal(tappedFirstPoint(pts,[6,4],15),true);
 assert.equal(tappedFirstPoint(pts,[50,50],15),false);
 assert.equal(tappedFirstPoint(pts.slice(0,2),[0,0],15),false);
});
test('Repeated last tap does not become an extra vertex',()=>{
 const pts=[[0,0],[100,0],[100,100],[101,100],[0,100]];
 const closed=normalizeClosedPolygon(pts,15,4);
 assert.equal(closed.length,4);
});
test('Too few distinct corners cannot become valid polygon',()=>{
 const pts=[[0,0],[100,0],[0,0]];
 const closed=normalizeClosedPolygon(pts);
 assert.equal(validPolygon(closed),false);
});
