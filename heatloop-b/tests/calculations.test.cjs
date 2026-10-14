// HeatLoop — niezależne testy funkcji obliczeniowych, uruchom: node heatloop-b/tests/calculations.test.cjs
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const code=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const start=code.indexOf('function parsePL('),end=code.indexOf('const heatType=');
assert(start>=0&&end>start,'Nie znaleziono funkcji obliczeniowych');
const {parsePL,area,distance,validRoom,insidePolygon,radiatorPower,floorMeters}=new Function(code.slice(start,end)+";const floorMeters=r=>r.heatingType==='radiators'?0:r.area/(r.spacing/100)*1.1;return {parsePL,area,distance,validRoom,insidePolygon,radiatorPower,floorMeters}")();
const square=[{x:0,y:0},{x:4,y:0},{x:4,y:5},{x:0,y:5}];
const tests=[
 ['Przecinek dziesiętny',()=>assert.equal(parsePL('12,5'),12.5)],
 ['Odrzucenie błędnej liczby',()=>assert(Number.isNaN(parsePL('12foo')))],
 ['Powierzchnia 4×5 m',()=>assert.equal(area(square),20)],
 ['Długość trasy 3-4-5',()=>assert.equal(distance([{x:0,y:0},{x:3,y:4}]),5)],
 ['Punkt wewnątrz pomieszczenia',()=>assert(insidePolygon({x:2,y:2},square))],
 ['Punkt poza pomieszczeniem',()=>assert(!insidePolygon({x:8,y:2},square))],
 ['Moc katalogowa przy 75/65/20',()=>assert(Math.abs(radiatorPower(1500,75,65,20)-1500)<1e-6)],
 ['Moc grzejnika spada przy 55/45/20',()=>assert(radiatorPower(1500,55,45,20)<1500)],
 ['Poprawny pokój',()=>assert(validRoom({name:'Salon',area:20,load:70,spacing:15}))],
 ['Odrzucenie zerowej powierzchni',()=>assert(!validRoom({name:'Salon',area:0,load:70,spacing:15}))],
 ['Grzejniki bez rur podłogowych',()=>assert.equal(floorMeters({area:20,spacing:15,heatingType:'radiators'}),0)],
 ['Mokra podłogówka 15 m²',()=>assert(Math.abs(floorMeters({area:15,spacing:15,heatingType:'wet'})-110)<1e-8)],
 ['Frezowana podłogówka 10 m²',()=>assert(Math.abs(floorMeters({area:10,spacing:15,heatingType:'milled'})-73.3333333333)<1e-6)]
];let passed=0;for(const [name,fn] of tests){try{fn();console.log('OK:',name);passed++}catch(e){console.error('BŁĄD:',name,e.message)}}console.log(passed+'/'+tests.length+' testów');if(passed!==tests.length)process.exitCode=1;
