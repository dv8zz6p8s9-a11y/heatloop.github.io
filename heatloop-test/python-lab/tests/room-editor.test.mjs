import test from 'node:test';
import assert from 'node:assert/strict';
import {polygonArea,validPolygon,insideRoom,rectFromCorners,changeVertex,movePolygon,addVertex,deleteVertex} from '../room-editor.mjs';
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
