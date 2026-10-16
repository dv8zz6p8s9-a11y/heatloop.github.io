import {answer,getArticle,topics,modules,knowledgeVersion} from './engine.mjs';
import {aiEndpoint} from './config.mjs';
const labels={home:'Start i zapis',manual:'Dane ręczne',drawing:'Praca z rysunku',loops:'Pętle i rozdzielacze',boiler:'Kotłownia',quote:'Wycena i sterowanie',radiators:'Grzejniki'};
const rootUrl=new URL('../',import.meta.url);
function el(doc,tag,text,className){const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
export function mountHelp(doc=document,{standalone=false,fetcher=globalThis.fetch,endpoint=aiEndpoint}={}){
 if(doc.getElementById('hl-help'))return;
 const panel=el(doc,'section',undefined,'hl-help');panel.id='hl-help';panel.setAttribute('aria-label','Asystent pomocy HeatLoop');
 const toggle=el(doc,'button','? Pomoc','hl-help-toggle');toggle.type='button';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',panel.id);
 const head=el(doc,'div',undefined,'hl-help-head');head.append(el(doc,'h2','Pomoc HeatLoop'));const clear=el(doc,'button','Wyczyść');clear.type='button';head.append(clear);
 const close=el(doc,'button','Zamknij ×');close.type='button';if(!standalone)head.append(close);panel.append(head);
 panel.append(el(doc,'p','Odpowiedzi z zatwierdzonej instrukcji. Nie wpisuj danych klientów. Historia znika po odświeżeniu karty.','hl-help-intro'));
 const context=el(doc,'label','Obszar pomocy: ');const select=el(doc,'select');select.setAttribute('aria-label','Obszar pomocy');for(const [value,name]of Object.entries(labels)){const o=el(doc,'option',name);o.value=value;select.append(o);}context.append(select);panel.append(context);
 const log=el(doc,'div',undefined,'hl-help-log');log.setAttribute('role','log');log.setAttribute('aria-live','polite');log.setAttribute('aria-relevant','additions');panel.append(log);
 const suggest=el(doc,'div',undefined,'hl-help-suggestions');suggest.setAttribute('aria-label','Proponowane tematy');panel.append(suggest);
 const form=el(doc,'form');const label=el(doc,'label','Twoje pytanie o HeatLoop');label.htmlFor='hl-help-question';const input=el(doc,'textarea');input.id=label.htmlFor;input.rows=2;input.maxLength=600;input.required=true;input.placeholder='Np. Jak dodać drugi rozdzielacz?';const send=el(doc,'button','Zapytaj');send.type='submit';form.append(label,input,send);panel.append(form);
 const online=el(doc,'a','Pełna instrukcja ze zrzutami ↗');online.href=new URL('instrukcja.html',rootUrl).href;panel.append(online);
 let useAI=null;
 if(endpoint){const l=el(doc,'label',undefined,'hl-help-consent');useAI=el(doc,'input');useAI.type='checkbox';l.append(useAI,doc.createTextNode('Dopasuj pytanie przez AI (treść pytania trafi do zewnętrznej usługi).'));panel.insertBefore(l,form);}
 const mode=el(doc,'small',`Baza wiedzy ${knowledgeVersion} · ${endpoint?'AI tylko po zaznaczeniu opcji':'Tryb instrukcji - bez połączenia z AI'}`);panel.append(mode);
 const host=standalone?doc.getElementById('help-root'):doc.body;if(!host)throw Error('Missing help-root');host.append(panel);if(!standalone){doc.body.append(toggle);panel.hidden=true;}
 let busy=false,controller=null,generation=0;
 function message(text,who='assistant'){const n=el(doc,'div',undefined,'hl-help-message '+who);n.append(el(doc,'p',text));log.append(n);n.scrollIntoView?.({block:'nearest'});return n;}
 function choices(list){const n=el(doc,'div',undefined,'hl-help-choice');for(const a of list){const b=el(doc,'button',a.title);b.type='button';b.onclick=()=>showArticle(a);n.append(b);}log.append(n);}
 function showArticle(a){const n=message(a.title);const ol=el(doc,'ol');for(const s of a.steps)ol.append(el(doc,'li',s));n.append(ol);if(a.note)n.append(el(doc,'p',a.note,'hl-help-note'));const link=el(doc,'a','Pokaż ten rozdział instrukcji →');link.href=new URL(`instrukcja.html#${a.section}`,rootUrl).href;n.append(link);n.scrollIntoView?.({block:'nearest'});}
 function renderTopics(){suggest.replaceChildren();for(const a of topics(select.value)){const b=el(doc,'button',a.title);b.type='button';b.onclick=()=>showArticle(a);suggest.append(b);}}
 function reset(){generation++;controller?.abort();controller=null;busy=false;send.disabled=false;log.replaceChildren();message('W czym pomóc? Zapytaj o funkcję HeatLoop albo wybierz gotowy temat.');input.value='';renderTopics();}
 async function ask(e){e?.preventDefault();if(busy)return;const q=input.value.trim();if(!q)return;message(q,'user');input.value='';const local=answer(q,select.value);const stamp=generation;busy=true;send.disabled=true;let result=local;
  try{if(useAI?.checked&&q.length<=600){controller=new AbortController();const timer=setTimeout(()=>controller?.abort(),12000);try{const response=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,module:select.value,knowledgeVersion}),signal:controller.signal});const data=await response.json();if(!response.ok&&data.kind!=='version')throw Error('Help unavailable');const approved=getArticle(data.articleId);if(approved)result={kind:'answer',article:approved};else if(data.kind==='version')message('Pomoc AI ma inną wersję wiedzy. Korzystam z instrukcji zapisanej z tą aplikacją.');}finally{clearTimeout(timer);}}
   if(stamp!==generation)return;
   if(result.kind==='answer')showArticle(result.article);else{message(result.message);if(result.choices)choices(result.choices);}
  }catch{if(stamp===generation){message('Połączenie z AI jest niedostępne. Oto pomoc z instrukcji.');if(local.article)showArticle(local.article);else message(local.message);}}
  finally{if(stamp===generation){busy=false;send.disabled=false;input.focus();}}}
 form.addEventListener('submit',ask);select.onchange=renderTopics;clear.onclick=reset;
 function open(){const active=doc.querySelector('.tab:not([hidden])')?.id;const module=doc.body.dataset.helpModule||(modules.has(active)?active:'home');select.value=module;renderTopics();panel.hidden=false;toggle.setAttribute('aria-expanded','true');input.focus();}
 function shut(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();}
 toggle.onclick=()=>panel.hidden?open():shut();close.onclick=shut;panel.addEventListener('keydown',e=>{if(e.key==='Escape'&&!standalone)shut();});
 if(standalone){const param=new URL(doc.URL).searchParams.get('module');if(modules.has(param))select.value=param;}
 reset();return {panel,open,showArticle};
}
