import {articles,knowledgeVersion,applicationVersion} from './knowledge.mjs';
export {knowledgeVersion,applicationVersion};
export const modules=new Set(['home','manual','drawing','loops','boiler','quote','radiators']);
export const normalise=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9%/]+/g,' ').trim();
const stop=new Set('jak gdzie czy co to i w z na do sie nie jest mam moge aplikacja aplikacji heatloop prosze mi ten ta tego pomoc'.split(' '));
const tokens=s=>normalise(s).split(' ').filter(t=>t.length>=3&&!stop.has(t));
export function search(question,module='home'){
 const q=normalise(question),qs=tokens(question);if(!qs.length)return [];
 return articles.map(a=>{
  let score=0,hits=0;
  for(const term of a.terms){const t=normalise(term),ts=tokens(term);if(t.length>=3&&q.includes(t)){score+=(ts.length>=2?10+ts.length*3:6);hits++;continue;}
   const matched=ts.filter(t=>qs.some(v=>v===t||(t.length>=5&&v.length>=5&&v.slice(0,5)===t.slice(0,5))));
   if(ts.length&&matched.length===ts.length){score+=2;hits++;}
  }
  return {article:a,score:score+(hits&&a.module===module?1:0),hits};
 }).filter(x=>x.hits).sort((a,b)=>b.score-a.score);
}
export function answer(question,module='home'){
 if(typeof question!=='string'||!question.trim())return {kind:'empty',message:'Napisz pytanie o obsługę HeatLoop.'};
 if(question.length>600)return {kind:'invalid',message:'Skróć pytanie do 600 znaków.'};
 const found=search(question,module);
 if(!found.length)return {kind:'unknown',message:'Pomagam wyłącznie w obsłudze HeatLoop. Nie mam potwierdzonej odpowiedzi na to pytanie. Wybierz temat poniżej lub zajrzyj do instrukcji.'};
 const best=found[0];
 if(found[1]&&best.score-found[1].score<2)return {kind:'choose',message:'Którego obszaru HeatLoop dotyczy pytanie?',choices:found.slice(0,3).map(x=>x.article)};
 return {kind:'answer',article:best.article};
}
export const getArticle=id=>articles.find(a=>a.id===id);
export const topics=module=>articles.filter(a=>a.module===module).slice(0,4);
