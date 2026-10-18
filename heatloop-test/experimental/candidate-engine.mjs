// Experimental contract adapter: intentionally preview-only, not installation geometry.
const finite=n=>Number.isFinite(n),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),len=p=>p.slice(1).reduce((s,v,i)=>s+dist(p[i],v),0);
const area=p=>Math.abs(p.reduce((s,a,i)=>s+a.x*p[(i+1)%p.length].y-p[(i+1)%p.length].x*a.y,0))/2;
function cross(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)}
function properCross(a,b,c,d){return cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0}
function validateRoom(room){if(!Array.isArray(room)||room.length<3||room.some(p=>!finite(p?.x)||!finite(p?.y))||area(room)<1e-9)throw Error('Niepoprawny obrys');for(let i=0;i<room.length;i++)for(let j=i+2;j<room.length;j++){if(i===0&&j===room.length-1)continue;if(properCross(room[i],room[(i+1)%room.length],room[j],room[(j+1)%room.length]))throw Error('Przecinający się obrys')}}
export function configure({room,spacing=.15,wallOffset=.1}={}){validateRoom(room);if(!finite(spacing)||spacing<=0||!finite(wallOffset)||wallOffset<0)throw Error('Niepoprawne parametry');return {room,spacing,wallOffset,loops:[]}}
export function buildSpiral({room,spacing=.15,wallOffset=.1,pipeDiameter=.016,minBendRadius=.12,entrySide='left'}={}){
 configure({room,spacing,wallOffset});if([pipeDiameter,minBendRadius].some(x=>!finite(x)||x<=0))throw Error('Niepoprawne parametry rury');
 const minX=Math.min(...room.map(p=>p.x)),maxX=Math.max(...room.map(p=>p.x)),minY=Math.min(...room.map(p=>p.y)),maxY=Math.max(...room.map(p=>p.y));
 const reserve=spacing+pipeDiameter/2;if(maxX-minX<2*minBendRadius+2*reserve||maxY-minY<4*minBendRadius+2*reserve)throw Error('Za mało miejsca na nawrót');
 const turns=Math.max(1,Math.min(4,Math.floor(Math.min(maxX-minX,maxY-minY)/(2*spacing))-1));
 const points=[];for(let k=0;k<turns;k++){const o=wallOffset+k*spacing;points.push({x:minX+o,y:minY+o},{x:maxX-o,y:minY+o},{x:maxX-o,y:maxY-o},{x:minX+o,y:maxY-o})}
 points[0].endpoint=true;points[points.length-1].endpoint=true;
 return {points,entrySide,previewOnly:true,validForInstallation:false};
}
export function validateCircuit(result,{spacing=.15,minBendRadius=.12,room,supply=[],returnRoute=[],limit=100}={}){
 const p=result.points;let selfCrossings=0,bendRadiusViolations=0,wallViolations=0;
 for(let i=0;i<p.length-1;i++)for(let j=i+2;j<p.length-1;j++)if(properCross(p[i],p[i+1],p[j],p[j+1]))selfCrossings++;
 for(let i=1;i<p.length-1;i++){const a=p[i-1],b=p[i],c=p[i+1],u={x:b.x-a.x,y:b.y-a.y},v={x:c.x-b.x,y:c.y-b.y};const dot=u.x*v.x+u.y*v.y;if(dot/(Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y))<.9999)bendRadiusViolations++}
 if(room){const minX=Math.min(...room.map(q=>q.x)),maxX=Math.max(...room.map(q=>q.x)),minY=Math.min(...room.map(q=>q.y)),maxY=Math.max(...room.map(q=>q.y));wallViolations=p.filter(q=>q.x<minX||q.x>maxX||q.y<minY||q.y>maxY).length}
 const totalLength=len(p)+(supply.length>1?len(supply):0)+(returnRoute.length>1?len(returnRoute):0);
 return {selfCrossings,bendRadiusViolations,wallViolations,totalLength,withinLimit:totalLength<=limit,validForInstallation:false};
}
