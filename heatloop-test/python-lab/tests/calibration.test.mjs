import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseKnownLength,axisScale,originalAxisForVisibleTool,measuredLength,polygonEdges
} from '../calibration-utils.mjs';

const eq=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} !== ${b}`);
test('Polskie wartości m, cm i mm',()=>{
  eq(parseKnownLength('4,70','m'),4.7);
  eq(parseKnownLength('470','cm'),4.7);
  eq(parseKnownLength('4700','mm'),4.7);
});
test('Skala X używa rzutu X, nie przekątnej',()=>{
  eq(axisScale([[10,20],[480,30]],4.7,'x'),.01);
});
test('Skala Y używa rzutu Y, nie przekątnej',()=>{
  eq(axisScale([[10,20],[15,560]],5.4,'y'),.01);
});
test('Dwa niezależne wymiary przy zniekształconym skanie',()=>{
  const sx=axisScale([[0,0],[470,0]],4.7,'x');
  const sy=axisScale([[0,0],[0,675]],5.4,'y');
  eq(470*675*sx*sy,25.38);
});
test('Po obrocie 90° poziom ekranu odpowiada osi Y źródła',()=>{
  assert.equal(originalAxisForVisibleTool('cx',90),'y');
  assert.equal(originalAxisForVisibleTool('cy',90),'x');
});
test('Po obrocie 270° kierunki także się zamieniają',()=>{
  assert.equal(originalAxisForVisibleTool('cx',270),'y');
  assert.equal(originalAxisForVisibleTool('cy',270),'x');
});
test('Pomiar niezależny 4,70 x 5,40 m',()=>{
  eq(measuredLength([0,0],[470,0],.01,.01),4.7);
  eq(measuredLength([470,0],[470,540],.01,.01),5.4);
});
test('Długość każdego boku prostokąta',()=>{
  const sides=polygonEdges([[0,0],[470,0],[470,540],[0,540]],.01,.01);
  [4.7,5.4,4.7,5.4].forEach((n,i)=>eq(sides[i].lengthM,n));
});
test('Ukośny wymiar X odrzucamy zamiast przekłamywać skalę',()=>{
  assert.throws(()=>axisScale([[0,0],[500,90]],5,'x'));
});
test('Błędna jednostka i zero są odrzucane',()=>{
  assert.throws(()=>parseKnownLength('0','m'));
  assert.throws(()=>parseKnownLength('5','km'));
});
test('Nie można mierzyć bez skali',()=>{
  assert.throws(()=>measuredLength([0,0],[100,0],0,.01));
});
