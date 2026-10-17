import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {answer,getArticle,normalise,modules,knowledgeVersion} from '../engine.mjs';
import {curated} from './extreme-cases.mjs';
import {mountHelp} from '../widget.mjs';
import {createHandler} from '../server/handler.mjs';
const require=createRequire(new URL('../../heatloop-b/package.json',import.meta.url));const {JSDOM}=require('jsdom');
export const metrics={curated:curated.length,variants:0,associations:0,fuzz:0};
for(const [i,s]of curated.entries())test(`Extreme ${i+1}: ${String(s.question).slice(0,80)}`,()=>{
 const r=answer(s.question,s.module,s.context);assert.equal(r.kind,s.kind);if(s.id)assert.equal(r.article?.id,s.id);
});
const seeds=[
 ['Jak rozpocząć pierwszy projekt?','start'],['Jak dodać pokój ręcznie?','manual'],['kalibracja skali rzutu','drawing'],['system mieszany','mixed'],['Jak dodać R2?','manifolds'],['PEX 16 długość pętli','loops'],['Jak narysować trasę pętli?','route'],['Jak ustawić przepływ w l/min?','flow'],['wyszarzone pola','locked'],['Jak dodać sterowanie TECH?','tech'],['wspólny regulator dla stref','zones'],['Jak uruchomić dobór kotłowni?','boiler'],['model kotła SAS','catalog'],['kocioł gazowy dwufunkcyjny','gas'],['sprzęgło i grupy pompowe','hydraulics'],['Jak skonfigurować CWU?','cwu'],['bufor i naczynie przeponowe','safety'],['szafki i eurokonus','quote'],['cena frezowania','milling'],['izolacja zasilania alpex','supply'],['dobór grzejników','radiators'],['grzejnik na szkicu','radiator-plan'],['Jak zapisać ofertę PDF?','export'],['Jak zapisać projekt JSON?','json'],['Jak zgłosić błąd?','bugs'],['import katalogu CSV grzejników','csv'],['Jak usunąć pokój?','room-delete'],['Jak zmienić nazwę pokoju?','room-edit'],['Czy działa offline?','offline'],['skrót na telefonie','mobile'],['Jak zmienić VAT?','vat'],['JSON nie wczytuje się','json-errors'],['Jak zamówić materiały z hurtowni?','prices']
];
const formats=[x=>x,x=>x.toUpperCase(),x=>x.normalize('NFD'),x=>normalise(x),x=>'  '+x+'  ',x=>x.replaceAll(' ','\n\t'),x=>x.split('').join('\u200b'),x=>'🔧 '+x+' 🤷',x=>x.replace(/[!-~]/g,c=>String.fromCharCode(c.charCodeAt(0)+0xfee0)),x=>x+' ?!?!?!'];
const prefixes=['','Proszę: ','Mam pytanie: ','W HeatLoop: ','Kurwa, ','Ty debilu, ','Dzień dobry. ','Pomóż mi: '];
metrics.variants=seeds.length*formats.length*prefixes.length;
test(`${metrics.variants} generated wording, Unicode, spacing and profanity variants of all 33 topics`,()=>{
 for(const [q,id]of seeds)for(const format of formats)for(const prefix of prefixes){const input=format(prefix+q),r=answer(input);assert.equal(r.kind,'answer',input);assert.equal(r.article.id,id,input);}
});
// Topic words must not be enough to override an unrelated or malicious task.
const outsiders=['Napisz wiersz o','Podaj przepis na','Jaka pogoda dla','Jaki film o','Jak ugotować','Napisz w Pythonie','Co na giełdzie oznacza','Jaką kryptowalutą jest'];
metrics.associations=outsiders.length*seeds.length*modules.size;
test(`${metrics.associations} cross-domain associations across all modules never return articles`,()=>{
 for(const module of modules)for(const [q]of seeds)for(const prefix of outsiders){const r=answer(prefix+' '+q,module);assert.notEqual(r.kind,'answer',prefix+' '+q);assert(!r.article);}
});
const allowedKinds=new Set(['answer','choose','unknown','empty','invalid','refused','unsupported','privacy','feedback','acknowledged','civil','scope','reset']);
let state=0x51ab31;const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
const alphabet=['a','ą','中','\0','\u202e','\u200b','😀','<','>','&','"',"'",' ','\n','1','/','%','{','}','[',']','é'];
metrics.fuzz=5000;
test('5000 reproducible random Unicode/malformed inputs: no crashes, fabricated articles or invalid choices',()=>{
 const ctx=[null,42,{},[],{lastArticleId:'__proto__'},{pendingIds:['json',null,{},'__proto__']},{pendingIds:'json'}];
 for(let i=0;i<metrics.fuzz;i++){
  const len=rand()%750;let input='';for(let j=0;j<len;j++)input+=alphabet[rand()%alphabet.length];
  const r=answer(input,[...modules,null,'__proto__'][rand()%9],ctx[rand()%ctx.length]);assert(allowedKinds.has(r.kind));
  if(r.article)assert.strictEqual(r.article,getArticle(r.article.id));
  if(r.choices){assert(r.choices.length>=1&&r.choices.length<=4);assert.equal(new Set(r.choices.map(x=>x.id)).size,r.choices.length);for(const a of r.choices)assert.strictEqual(a,getArticle(a.id));}
 }
});
function setup(options={}){const dom=new JSDOM('<div id="help-root"></div>',{url:'https://heatloop.pl/pomoc.html'});mountHelp(dom.window.document,{standalone:true,...options});return {dom,d:dom.window.document,async ask(q){dom.window.document.querySelector('textarea').value=q;dom.window.document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,0));}};}
test('Typed reset clears conversation without changing project fields',async()=>{
 const f=setup();try{const project=f.d.createElement('input');project.id='project-test';project.value='original';f.d.body.append(project);await f.ask('JSON');await f.ask('Wyczyść historię pomocy');assert(!f.d.querySelector('.hl-help-log ol'));assert.equal(project.value,'original');await f.ask('gdzie?');assert(f.d.querySelector('.hl-help-choice'));assert(!f.d.querySelector('.hl-help-log ol'));}finally{f.dom.window.close();}
});
test('Feedback, abuse, private data, blocked requests and unknown questions stay local even with AI opted in',async()=>{
 let calls=0;const f=setup({endpoint:'https://help.invalid/api/help',fetcher:async()=>{calls++;throw Error();}});try{f.d.querySelector('input').checked=true;for(const s of curated.filter(x=>typeof x.question==='string'&&x.kind!=='answer'&&x.question.length<=600))await f.ask(s.question);assert.equal(calls,0);}finally{f.dom.window.close();}
});
test('Chat size is bounded, and pasted HTML is text rather than executable nodes',async()=>{
 const f=setup();try{for(let i=0;i<100;i++)await f.ask('JSON');assert(f.d.querySelector('.hl-help-log').children.length<=60);await f.ask('<img src=x onerror=alert(1)> JSON');assert.equal(f.d.querySelectorAll('.hl-help-log img, .hl-help-log script').length,0);await f.ask('a'.repeat(100000));assert(f.d.querySelector('.hl-help-log').textContent.length<100000);assert.equal(f.d.querySelector('button[type=submit]').disabled,false);}finally{f.dom.window.close();}
});
test('Optional server accepts only valid request shapes and stays alive after every malformed request',async()=>{
 const cases=[null,[],false,42,'JSON',{}, {question:'JSON',module:'home',knowledgeVersion,context:false},{question:'JSON',module:'home',knowledgeVersion,context:42},{question:'JSON',module:'home',knowledgeVersion,context:{pendingIds:null}}, {question:'JSON',module:'__proto__',knowledgeVersion}];
 const h=createHandler();let i=0;for(const data of cases){const res=await h(new Request('https://help.invalid/api/help',{method:'POST',headers:{Origin:'https://heatloop.pl','Content-Type':'application/json'},body:JSON.stringify(data)}),'peer-'+i++);assert.equal(res.status,400,JSON.stringify(data));}
});
test('Sensitive data in full-width or zero-width spelling is rejected before the provider',async()=>{
 let calls=0;const h=createHandler({env:{HELP_AI_ENABLED:'true',OPENAI_API_KEY:'test',OPENAI_MODEL:'test'},budget:{take:()=>true},fetcher:async()=>{calls++;throw Error();}});
 for(const q of ['JSON test@example.com','JSON 123456789','JSON ｔｅｓｔ＠ｅｘａｍｐｌｅ．ｃｏｍ','JSON t\u200best@example.com']){const res=await h(new Request('https://help.invalid/api/help',{method:'POST',headers:{Origin:'https://heatloop.pl','Content-Type':'application/json'},body:JSON.stringify({question:q,module:'home',knowledgeVersion})}));assert.equal(res.status,400,q);assert.equal(answer(q).kind,'privacy',q);}assert.equal(calls,0);
});
const tasks=[['zapisać JSON','json'],['zmienić VAT','vat'],['dodać grzejnik','radiators'],['usunąć pokój','room-delete'],['narysować trasę pętli','route'],['wygenerować ofertę PDF','export'],['dodać sterowanie TECH','tech']];
metrics.multiIntent=tasks.length*(tasks.length-1)*modules.size;
test(`${metrics.multiIntent} pairs of independent tasks across seven modules ask which to explain first`,()=>{
 for(const module of modules)for(const [first,a]of tasks)for(const [second,b]of tasks){if(a===b)continue;const q=`Jak ${first} oraz ${second}?`,r=answer(q,module);assert.equal(r.kind,'choose',q);assert(r.choices.some(x=>x.id===a),q+' / '+a);assert(r.choices.some(x=>x.id===b),q+' / '+b);}
});
metrics.negation=tasks.length*(tasks.length-1);
test(`${metrics.negation} contrasts route to the affirmed task, not the negated one`,()=>{
 for(const [first,a]of tasks)for(const [second,b]of tasks){if(a===b)continue;const q=`Nie chcę ${first}, tylko ${second}`,r=answer(q);assert.equal(r.kind,'answer',q);assert.equal(r.article.id,b,q);}
});
test('Context selections accept human phrasing and unrelated questions cannot poison a prior topic',()=>{
 for(const q of ['druga opcja','ta druga','opcja 2','opcja nr 2'])assert.equal(answer(q,'home',{pendingIds:['manifolds','quote']}).article?.id,'quote',q);
 for(const q of ['napisz chamską ofertę PDF','mój pies ma na imię Kocioł'])assert.notEqual(answer(q,'home',{lastArticleId:'json'}).kind,'answer',q);
});
