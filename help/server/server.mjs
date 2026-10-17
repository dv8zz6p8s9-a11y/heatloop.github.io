import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {createHandler} from './handler.mjs';
// Single-process server. Counter file contains date + count only, no questions/IPs.
const file=process.env.HELP_BUDGET_FILE;const cap=Number(process.env.HELP_DAILY_REQUESTS||100);
let count={date:'',count:0};if(file&&path.isAbsolute(file)&&fs.existsSync(file)){try{count=JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw Error('Invalid help budget counter');}}
const budget={take(){if(!file||!path.isAbsolute(file)||!Number.isInteger(cap)||cap<1||cap>10000)return false;const today=new Date().toISOString().slice(0,10);if(count.date!==today)count={date:today,count:0};if(!Number.isInteger(count.count)||count.count<0||count.count>=cap)return false;count.count++;try{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(count),{mode:0o600});fs.renameSync(file+'.tmp',file);return true;}catch{return false;}}};
const handle=createHandler({env:process.env,budget});
const server=http.createServer(async(req,res)=>{
 try{if(req.url!=='/api/help'){res.writeHead(404).end();return;}const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>4096){res.writeHead(413).end();return;}chunks.push(chunk);}
  const request=new Request('http://localhost/api/help',{method:req.method,headers:req.headers,...(['POST','PUT'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
  const response=await handle(request,req.socket.remoteAddress||'unknown');res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
 }catch{res.writeHead(500).end();}
});
server.requestTimeout=15000;server.headersTimeout=10000;server.listen(Number(process.env.PORT||8787),process.env.HOST||'127.0.0.1',()=>console.log('HeatLoop help server ready'));
