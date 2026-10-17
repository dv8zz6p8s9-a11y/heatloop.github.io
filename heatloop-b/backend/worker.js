function reply(data,status=200,origin=''){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(origin?{'Access-Control-Allow-Origin':origin}:{})}})}
const clean=(v,max=4000)=>typeof v==='string'?v.trim().slice(0,max):'';
export default {
 async fetch(req,env){
  const origin=req.headers.get('Origin')||'';
  const allowed=env.ALLOWED_ORIGIN||'https://dv8zz6p8s9-a11y.github.io';
  const cors=origin===allowed?origin:'';
  if(req.method==='OPTIONS')return new Response(null,{status:cors?204:403,headers:{'Access-Control-Allow-Origin':cors,'Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
  const url=new URL(req.url);
  if(url.pathname==='/health')return reply({ok:true},200,cors);
  if(url.pathname==='/reports.txt'&&req.method==='GET'){
   if(!env.ADMIN_TOKEN||req.headers.get('Authorization')!=='Bearer '+env.ADMIN_TOKEN)return reply({error:'Unauthorized'},401);
   const result=await env.DB.prepare('SELECT * FROM reports ORDER BY id DESC LIMIT 5000').all();
   const lines=['HEATLOOP - RAPORT BLEDOW','Eksport: '+new Date().toISOString(),''];
   for(const row of result.results){lines.push('BLAD #'+row.id+' | '+row.created_at+' | '+row.status+' | '+row.severity);for(const field of ['module','summary','device','browser','steps','expected','actual','notes'])lines.push(field+': '+String(row[field]||'').replaceAll('\r',' ').replaceAll('\n',' '));lines.push('---')}
   return new Response(lines.join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="RAPORT_BLEDOW.txt"','Cache-Control':'no-store'}});
  }
  if(url.pathname!=='/report'||req.method!=='POST')return reply({error:'Not found'},404,cors);
  if(!cors)return reply({error:'Forbidden'},403);
  if(Number(req.headers.get('Content-Length')||0)>20000)return reply({error:'Too large'},413,cors);
  let body;try{body=await req.json()}catch{return reply({error:'Invalid JSON'},400,cors)}
  if(JSON.stringify(body).length>20000)return reply({error:'Too large'},413,cors);
  if(!body||typeof body!=='object'||Array.isArray(body))return reply({error:'Invalid JSON object'},400,cors);
  if(body.website)return reply({ok:true},200,cors);
  const data=['module','severity','summary','device','browser','steps','expected','actual','notes'].map(k=>clean(body[k],k==='summary'?140:4000));
  if(data.slice(2,8).some(x=>!x))return reply({error:'Wymagane pola sa puste'},400,cors);
  if(!['Krytyczny','Wysoki','Średni','Niski'].includes(data[1]))return reply({error:'Invalid severity'},400,cors);
  const rateKey='rate:'+req.headers.get('CF-Connecting-IP');
  if(await env.RATE.get(rateKey))return reply({error:'Odczekaj minute'},429,cors);
  await env.RATE.put(rateKey,'1',{expirationTtl:60});
  const result=await env.DB.prepare('INSERT INTO reports(module,severity,summary,device,browser,steps,expected,actual,notes) VALUES(?,?,?,?,?,?,?,?,?)').bind(...data).run();
  return reply({ok:true,id:result.meta.last_row_id},201,cors);
 }
};