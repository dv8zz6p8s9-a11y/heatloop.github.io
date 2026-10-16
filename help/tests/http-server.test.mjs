import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {knowledgeVersion} from '../engine.mjs';
test('Real local HTTP server: malformed JSON, body limits, CORS, rate limits and continued availability',async t=>{
 const reservation=net.createServer();await new Promise(r=>reservation.listen(0,'127.0.0.1',r));const port=reservation.address().port;await new Promise(r=>reservation.close(r));
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'heatloop-help-http-'));const budget=path.join(temp,'budget.json');
 const child=spawn(process.execPath,[new URL('../server/server.mjs',import.meta.url).pathname],{env:{...process.env,HOST:'127.0.0.1',PORT:String(port),HELP_AI_ENABLED:'false',HELP_BUDGET_FILE:budget},stdio:['ignore','pipe','pipe']});
 t.after(async()=>{if(child.exitCode===null){const done=new Promise(r=>child.once('exit',r));child.kill();await done;}fs.rmSync(temp,{recursive:true,force:true});});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('HTTP server startup timeout')),5000);child.once('error',e=>{clearTimeout(timer);reject(e);});child.once('exit',code=>{clearTimeout(timer);reject(Error('Server exited: '+code));});child.stdout.on('data',chunk=>{if(chunk.toString().includes('ready')){clearTimeout(timer);resolve();}});});
 const url=`http://127.0.0.1:${port}/api/help`,headers={Origin:'https://heatloop.pl','Content-Type':'application/json'};
 const send=body=>fetch(url,{method:'POST',headers,body,signal:AbortSignal.timeout(3000)});
 const valid=JSON.stringify({question:'JSON',module:'home',knowledgeVersion});
 assert.equal((await fetch(url,{method:'OPTIONS',headers})).status,204);
 assert.equal((await fetch(url,{headers})).status,405);
 assert.equal((await fetch(url,{method:'POST',headers:{...headers,Origin:'https://evil.invalid'},body:valid})).status,403);
 for(const body of ['null','[]','42','false','{','"JSON"'])assert.equal((await send(body)).status,400,body);
 assert.equal((await send('x'.repeat(6000))).status,413);
 const statuses=[];for(let i=0;i<25;i++){const res=await send(valid);statuses.push(res.status);if(res.status===200)assert.equal((await res.json()).articleId,'json');}
 assert(statuses.includes(200));assert(statuses.includes(429));assert.equal(child.exitCode,null);assert.equal(fs.existsSync(budget),false,'Disabled AI does not spend or persist question data');
});
