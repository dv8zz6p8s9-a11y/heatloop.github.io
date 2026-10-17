import {generateSpiral} from './loop-generator.mjs?v=20261017-center-fix-1';
const out=document.querySelector('#results');
const cases=[
 ['Pokój 4 × 3 m',400,300,15],
 ['Pokój 5 × 4 m',500,400,15],
 ['Pokój 6 × 3 m',600,300,20],
 ['Mały pokój 2,5 × 2,5 m',250,250,10],
 ['Wąski pokój 6 × 2 m',600,200,15],
 ['Rzeczywisty pokój 4,17 × 2,58 m',417,258,15],
 ['Rzeczywisty pokój 4,17 × 2,58 m — START prawy dół',417,258,15,2],
 ['Rzeczywisty pokój 4,17 × 2,58 m — START prawy góra',417,258,15,1],
 ['Rzeczywisty pokój 4,17 × 2,58 m — START lewy dół',417,258,15,3]
];
let passed=0;
function segmentCross(a,b,c,d){
 const o=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
 return o(a,b,c)*o(a,b,d)<-1e-8&&o(c,d,a)*o(c,d,b)<-1e-8;
}
for(const [name,w,h,spacingCm,rotation=0] of cases){
 let issues=[];
 try{
  const corners=[{x:100,y:100},{x:100+w/2,y:100},{x:100+w/2,y:100+h/2},{x:100,y:100+h/2}];
  const room={points:[...corners.slice(rotation),...corners.slice(0,rotation)]};
  const result=generateSpiral(room,{scale:0.02,offsetCm:10,spacingCm,maxMeters:100,manifold:{x:500,y:500},approach:[{x:110,y:110}]});
  if(!result.routes.length)issues.push('Brak pętli');
  for(const {route} of result.routes){
   const meters=route.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-route[i].x,p.y-route[i].y)*0.02,0);
   if(meters>100.0001)issues.push('Przekroczono 100 m');
   // Testuj odcinki wewnętrzne; dojścia mogą wymagać oddzielnego trasowania.
   const inside=route.slice(2,-2);
   for(let i=1;i<inside.length;i++){
    const a=inside[i-1],b=inside[i];
    const axisX=Math.abs(a.x-b.x)<1e-6,axisY=Math.abs(a.y-b.y)<1e-6;
    if(!axisX&&!axisY)issues.push('Ukośny odcinek spirali');
    for(let j=1;j<i-1;j++)if(segmentCross(a,b,inside[j-1],inside[j]))issues.push('Przecięcie spirali');
   }
  }
 }catch(e){issues.push(e.message)}
 const ok=issues.length===0;if(ok)passed++;
 const li=document.createElement('li');li.textContent=(ok?'PASS — ':'FAIL — ')+name+(ok?'':' — '+[...new Set(issues)].join('; '));li.style.color=ok?'#147d50':'#b42318';out.append(li);
}
document.querySelector('#summary').textContent=passed+'/'+cases.length+' testów zakończonych powodzeniem. Testy nie zastępują weryfikacji hydraulicznej.';
