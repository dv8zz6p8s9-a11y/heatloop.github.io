/**
 * HeatLoop drawing calibration mathematics. Source drawing coordinates only.
 * Zoom, pan and visual rotation belong to the view layer, not dimensional units.
 */
export function parseKnownLength(value,unit='m'){
 const raw=String(value??'').trim().replace(/\s/g,'').replace(',','.');
 if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw))throw Error('Podaj dodatni wymiar (np. 4,70), bez innych znaków.');
 const scale={m:1,cm:0.01,mm:0.001}[unit];
 if(!scale)throw Error('Wybierz m, cm albo mm.');
 const metres=Number(raw)*scale;
 if(!(metres>0&&metres<=500&&Number.isFinite(metres)))throw Error('Wymiar musi być większy od zera i nie większy niż 500 m.');
 return metres;
}
export function originalAxisForVisibleTool(kind,rotation=0){
 if(!['cx','cy'].includes(kind))throw Error('Nieznany kierunek kalibracji.');
 const rotate90=((rotation%360)+360)%360;
 return rotate90%180===0?(kind==='cx'?'x':'y'):(kind==='cx'?'y':'x');
}
export function axisScale(points,knownMetres,axis){
 if(!['x','y'].includes(axis)||!Array.isArray(points)||points.length!==2)throw Error('Wybierz dwa końce odcinka.');
 if(!(knownMetres>0&&Number.isFinite(knownMetres)))throw Error('Nieprawidłowy znany wymiar.');
 if(points.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v))))throw Error('Nieprawidłowe współrzędne.');
 const primary=axis==='x'?0:1,secondary=1-primary;
 const parallel=Math.abs(points[1][primary]-points[0][primary]);
 const sideways=Math.abs(points[1][secondary]-points[0][secondary]);
 if(parallel<8)throw Error('Odcinek w wybranej osi jest zbyt krótki. Powiększ rysunek i wskaż ponownie.');
 if(sideways>parallel*0.15)throw Error('Odcinek jest zbyt ukośny w wybranej osi. Wskaż dwa końce na jednej poziomej lub pionowej linii.');
 return knownMetres/parallel; // never use diagonal distance for orthogonal calibrations
}
export function measuredLength(a,b,sx,sy){
 if(!Number.isFinite(sx)||!Number.isFinite(sy)||sx<=0||sy<=0)throw Error('Najpierw skalibruj rysunek.');
 if([...(a||[]),...(b||[])].length!==4)throw Error('Nieprawidłowe punkty.');
 return Math.hypot((b[0]-a[0])*sx,(b[1]-a[1])*sy);
}
export function polygonEdges(points,sx,sy){
 if(!Array.isArray(points)||points.length<3)return[];
 return points.map((p,i)=>({index:i,lengthM:measuredLength(p,points[(i+1)%points.length],sx,sy),midpoint:[(p[0]+points[(i+1)%points.length][0])/2,(p[1]+points[(i+1)%points.length][1])/2]}));
}
