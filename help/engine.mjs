import {articles,knowledgeVersion,applicationVersion} from './knowledge.mjs';
export {knowledgeVersion,applicationVersion};
export const modules=new Set(['home','manual','drawing','loops','boiler','quote','radiators']);
export const normalise=s=>String(s).toLowerCase().replace(/δ/g,'delta ').normalize('NFKD').replace(/[\u0300-\u036f\u200b-\u200f\ufeff]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9%/]+/g,' ').replace(/\s+/g,' ').trim();
export const getArticle=id=>articles.find(a=>a.id===id);
export const topics=module=>articles.filter(a=>a.module===module).slice(0,6);
const unknown=()=>({kind:'unknown',message:'Pomagam wyłącznie w obsłudze HeatLoop. Nie mam potwierdzonej odpowiedzi na to pytanie. Napisz, na którym ekranie jesteś i co chcesz zrobić, albo wybierz temat.'});
const choose=(ids,message='Doprecyzuj pytanie: którego działania w HeatLoop potrzebujesz?')=>({kind:'choose',message,choices:[...new Set(ids)].map(getArticle).filter(Boolean).slice(0,4)});
const found=id=>({kind:'answer',article:getArticle(id)});
// Conservative vocabulary: fuzzy matching is only for long, application-specific nouns.
// No substring matching of generic words (e.g. model, email, zmienić, działa).
const vocab={
 room:['pokoj','pokoju','pokoje','pokoi','pomieszczenie','pomieszczenia','pomieszczeniu','pomieszczen'],
 manifold:['rozdzielacz','rozdzielacza','rozdzielacze','rozdzielaczy','rozdzielaczu','r1','r2','r3','r10'],
 loop:['petla','petle','petli','petlach','obwod','obwody'],
 drawing:['rysunek','rysunku','rzut','rzutu','rzucie','szkic','szkicu','obrys','obrysu','kalibracja','kalibracje','kalibracji','skala','skale','skali'],
 radiator:['grzejnik','grzejnika','grzejniki','grzejnikow','grzejniku','kaloryfer','kaloryfery'],
 boiler:['kotlownia','kotlowni','kociol','kotla','kotly','kotlow','ozc'],
 quote:['wycena','wycenie','wyceny','kosztorys','oferta','oferte','ofercie','oferty'],
 mill:['frezowanie','frezowania','frezowaniu','frezowane','frezowana','frezowanej'],
 floor:['podlogowka','podlogowki','podlogowke','podlogowe','podlogowego'],
 control:['sterowanie','sterowania','sterowaniu','tech','regulator','regulatory','regulatora','silownik','silowniki','silownikow','listwa','listwy','l4x'],
 zone:['strefa','strefy','stref','strefie'],
 flow:['przeplyw','przeplywy','przeplywu','rotametr','rotametry','rotametrow','delta'],
 hydraulic:['sprzeglo','sprzegla','sprzeglorozdzielacz','sprzeglorozdzielacza','womix','afriso','podmieszanie','podmieszania','mieszanie','mieszania'],
 safety:['naczynie','naczynia','bufor','bufora','zabezpieczenia','zabezpieczen'],
 cwu:['cwu','zasobnik','zasobnika','cyrkulacja','cyrkulacje'],
 json:['json'],csv:['csv'],pdf:['pdf'],
 offline:['offline'],vat:['vat','brutto','netto'],
 price:['cena','cene','ceny','cen','cenie','cennik','cennika','cenniki','stawka','stawke','stawki','koszt','koszty','kosztuje','robocizna','robocizny'],
 supply:['zasilanie','zasilania','zasilaniu','izolacja','izolacje','izolacji','ksztaltki','ksztaltek','alpex','miedz','miedzi','srednica','srednice','srednicy'],
 cabinet:['szafka','szafke','szafki','szafce','eurokonus','eurokonusow','zlaczki','zawory'],
 supplier:['hurtownia','hurtowni','hurtownie','zamowic','zamowienie','zamowienia','magazyn'],
 mobile:['iphone','iphonie','android','androidzie','telefon','telefonie','telefonu','smartfon','pwa'],
 brand:['sas','panasonic','mitsubishi','vaillant','bosch','immergas','viessmann','dedietrich']
};
const fuzzy=new Set(['room','manifold','loop','drawing','radiator','boiler','mill','floor','control','hydraulic','safety','cwu']);
function distance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old;}}return row[b.length];}
function concepts(q){const words=q.split(' ');return Object.fromEntries(Object.entries(vocab).map(([key,terms])=>[key,words.some(w=>terms.some(t=>w===t||(fuzzy.has(key)&&w.length>=6&&t.length>=6&&distance(w,t)<=1)))]));}
function boundary(q){
 if(/\b(ignore|ignoruj|zignoruj|pomin|omin|zapomnij|ujawnij|system prompt|developer message|jailbreak)\b/.test(q))return {kind:'refused',message:'Nie zmieniam zasad pomocy ani nie ujawniam sekretów. Mogę wyjaśnić obsługę HeatLoop.'};
 if(/\b(pogod\w*|obiad\w*|gotowa\w*|przepis\w*|wakac\w*|telefon\w* kup\w*|kup\w* telefon\w*|polityk\w*|wybor\w* prezydent\w*|kryptowalut\w*|bitcoin|rozwod\w*|komornik\w*|lekar\w*|diagnoz\w*|seks\w*|film\w*|piosenk\w*|wiersz\w*|zart\w*|dowcip\w*|kolegi|kolezanki|haslo|hasla|token|klucz api|html|javascript|python)\b/.test(q))return unknown();
 if(/\b(podlacz\w*|podlaczyc|zamontow\w*|montowac|wykonac instalacje|obejsc zabezpieczenia)\b/.test(q))return {kind:'unsupported',message:'Pomagam w obsłudze HeatLoop. Nie podaję instrukcji montażu, podłączeń ani obchodzenia zabezpieczeń. W aplikacji mogę wskazać pola i sposób odczytania komunikatów.'};
 return null;
}
function retrieve(q,module){
 const c=concepts(q),list=[];const add=(id,score=10)=>list.push({article:getArticle(id),score,hits:1});
 const remove=/\b(usun\w*|skas\w*|wywal\w*)\b/.test(q),edit=/\b(zmien\w*|edyt\w*|popraw\w*|nazwa|nazwe|nazwy)\b/.test(q),error=/\b(blad|bled\w*|problem|nie dziala|nie moge|nie chce|nie otwiera|nie wczytuje|nie laduje|odrzuca|uszkodz\w*)\b/.test(q);
 const fileContext=/\b(plik\w*|projekt\w*|zapis\w*|wczyt\w*|otwor\w*|otwier\w*|pobierz|pobrac|zachow\w*|kopia|kopie)\b/.test(q);
 const heatPump=/\bpomp\w* ciepl\w*\b/.test(q),pumpGroup=/\bgrup\w* pompow\w*\b/.test(q);
 if(c.offline||/\bbez (internetu|sieci|zasiegu)\b/.test(q))add('offline',35);
 if(c.vat&&!c.price||/\bvat\b/.test(q))add('vat',30);
 if(c.room){if(remove)add('room-delete',35);else if(edit&&!/technolog|system|ogrzewan/.test(q))add('room-edit',30);else if(!c.drawing&&!c.manifold&&!c.loop&&!c.radiator&&!/regulator|stref/.test(q))add('manual',15);}
 if(c.json){add(error?'json-errors':'json',30);}
 if(!c.json&&fileContext&&/\b(zapis\w*|zachow\w*|kopia|kopie|odtworz\w*|otworzyc projekt|otworzyc plik)\b/.test(q)&&!c.pdf&&!c.csv)add(error?'json-errors':'json',25);
 if(c.pdf&&c.drawing)add('drawing',32);
 else if(c.pdf&&fileContext&&/\b(projekt\w*|json)\b/.test(q)&&/\b(otwor\w*|wczyt\w*|import\w*)\b/.test(q))add('json-errors',32);
 else if(c.pdf||/\b(wyslac|udostepnic|wydruk\w*|drukow\w*)\b/.test(q)&&c.quote)add('export',20);
 if(c.csv&&c.radiator||c.csv&&/\b(katalog\w*|import\w*|wczyt\w*|szablon\w*)\b/.test(q))add('csv',32);
 else if(c.csv)add('prices',20);
 if(c.supplier)add('prices',28);
 if((c.price||/\b(zl|m2)\b/.test(q))&&!c.vat&&!c.supplier){if(c.mill||c.floor||/\bm2\b/.test(q))add('milling',28);else if(!c.supply&&!c.cabinet)add('prices',14);}
 if(c.mill&&!c.price)add('mixed',18);
 if(/\b(mokre|mokra|mieszany|technologia|technologie|technologii)\b/.test(q)&&!c.hydraulic)add('mixed',22);
 if(c.drawing&&!c.pdf){if(c.radiator)add('radiator-plan',32);else if(c.loop&&/\b(rys\w*|tras\w*)\b/.test(q))add('route',32);else if(!c.manifold)add('drawing',20);}
 if(c.radiator&&!c.drawing&&!c.csv)add('radiators',20);
 if(c.manifold){if(c.quote||c.cabinet)add('quote',25);else if(!c.supply&&!c.flow&&!c.loop)add('manifolds',22);}
 if(c.cabinet&&!c.manifold)add('quote',22);
 if(c.loop){if(/\b(rys\w*|tras\w*|narys\w*)\b/.test(q))add('route',28);else if(!c.flow&&!c.control&&!c.zone)add('loops',20);}
 if(/\b(pex|dojscia|dojscie|80 m)\b/.test(q))add('loops',24);
 if(c.flow&&!heatPump&&!c.boiler&&!c.safety&&!c.hydraulic)add('flow',25);
 if(c.zone&&/\b(wspoln\w*|jeden|jeden regulator|nazwa|nazwy|nazwe|identycz\w*)\b/.test(q))add('zones',30);
 else if(c.control||c.zone||/\bl (4x|x)\b/.test(q))add('tech',22);
 if(c.hydraulic||pumpGroup)add('hydraulics',25);
 if(c.safety||/zamkniet\w* stref|minimaln\w* przeplyw/.test(q))add('safety',30);
 if(c.cwu&&!c.safety){if(/\b(gaz\w*|jednofunkcyjny|dwufunkcyjny|pakiet\w*)\b/.test(q))add('gas',30);else add('cwu',22);}
 if(/\b(jednofunkcyjny|dwufunkcyjny|gazowy)\b/.test(q)&&!c.cwu)add('gas',24);
 if(c.brand||/de dietrich/.test(q)||(c.boiler||heatPump)&&/\b(producent\w*|model\w*|mark\w*)\b/.test(q))add('catalog',28);
 else if(c.boiler||heatPump)add('boiler',18);
 if(c.supply&&!c.hydraulic&&!c.safety&&!c.cwu&&!heatPump)add('supply',20);
 if(/\b(zablokowan\w*|wyszarzon\w*|nieaktyw\w*)\b/.test(q))add('locked',35);
 if(c.mobile&&!/\b(kup\w*|model\w*)\b/.test(q))add(error?'bugs':'mobile',15);
 if(/\b(zglos\w*|bug|bug\/fix|aktualizac\w*|stara wersja)\b/.test(q))add('bugs',20);
 if(/\b(zacz\w*|rozpocz\w*|pierwszy projekt|od czego)\b/.test(q))add('start',22);
 // General failures get a clarification, not a diagnosis guessed from a verb.
 if(error&&!list.length&&/\b(heatloop|aplikac\w*|przycisk\w*|ekran\w*)\b/.test(q))add('bugs',8);
 const best=new Map();for(const r of list)if(!best.has(r.article.id)||best.get(r.article.id).score<r.score)best.set(r.article.id,r);
 return [...best.values()].map(r=>({...r,score:r.score+(r.article.module===module?1:0)})).sort((a,b)=>b.score-a.score);
}
export function search(question,module='home'){
 if(typeof question!=='string'||question.length>600)return [];
 const q=normalise(question);if(!q||boundary(q))return [];
 return retrieve(q,modules.has(module)?module:'home');
}
export function answer(question,module='home',context={}){
 if(typeof question!=='string'||!question.trim())return {kind:'empty',message:'Napisz pytanie o obsługę HeatLoop.'};
 if(question.length>600)return {kind:'invalid',message:'Skróć pytanie do 600 znaków.'};
 const q=normalise(question);if(!q)return {kind:'empty',message:'Napisz pytanie słowami, np. „Jak zapisać projekt?”.'};
 const blocked=boundary(q);if(blocked)return blocked;
 const pending=(Array.isArray(context.pendingIds)?context.pendingIds:[]).filter(id=>getArticle(id)).slice(0,4);
 const last=getArticle(context.lastArticleId);
 const ordinals={pierwsza:0,pierwsze:0,pierwszy:0,'1':0,druga:1,drugie:1,drugi:1,'2':1,trzecia:2,trzecie:2,trzeci:2,'3':2,czwarta:3,'4':3};
 if(pending.length&&Object.hasOwn(ordinals,q)){const id=pending[ordinals[q]];return id?found(id):choose(pending,'Wybierz jedną z pokazanych opcji.');}
 const referential=/^(a )?(gdzie( to)?( znajde| jest)?|jak to( zrobic)?|co dalej|pokaz( to)?|powtorz|jeszcze raz|to samo|a potem)$/.test(q);
 if(referential)return pending.length?choose(pending):last?found(last.id):choose(topics(module).slice(0,3).map(a=>a.id),'Co chcesz znaleźć? Wybierz temat albo podaj nazwę ekranu.');
 if(/^(nie dziala|dalej nie dziala|nadal nie dziala|nie moge|pomocy|ratunku|nic|nie wiem|czemu|dlaczego|\?+)$/.test(q))return choose(last?[last.id,'bugs']:topics(module).slice(0,3).map(a=>a.id),'Na którym ekranie występuje problem i po jakim działaniu? Podaj komunikat lub wybierz temat.');
 const c=concepts(q);
 if(/^(cena|ceny|koszt|model|email|e mail|plik|instalacja)$/.test(q))return choose(topics(module).slice(0,3).map(a=>a.id),'Czego dotyczy pytanie w HeatLoop? Podaj nazwę funkcji lub pliku.');
 // Asking for a manifold without saying which workflow is genuinely ambiguous.
 if(c.manifold&&!c.quote&&!c.cabinet&&!c.supply&&!c.loop&&!c.flow&&!/\b(r[2-9]|r10|drugi|kolejny|druga|kolejna)\b/.test(q)&&!['loops','quote'].includes(module))return choose(['manifolds','quote'],'Chcesz dodać rozdzielacz w planie pętli czy bezpośrednio w wycenie?');
 if(c.manifold&&module==='quote'&&!c.supply&&!c.loop&&!c.flow&&!c.drawing)return found('quote');
 const results=search(question,module);
 if(pending.length){const candidate=results.find(r=>pending.includes(r.article.id));if(candidate)return found(candidate.article.id);if(c.quote&&pending.includes('quote'))return found('quote');if(c.loop&&pending.includes('manifolds'))return found('manifolds');}
 if(!results.length){if(/\b(model|producent|cena|email|e mail|instalacja|plik|zapisac|usunac|zmienic)\b/.test(q))return choose(topics(module).slice(0,3).map(a=>a.id),'Czego dotyczy pytanie w HeatLoop? Podaj nazwę funkcji lub pliku.');return unknown();}
 if(results[0].score<12)return choose(['bugs',...topics(module).slice(0,2).map(a=>a.id)],'Opisz ekran, wykonane działanie i dokładny komunikat. Bez tego nie mogę wskazać przyczyny.');
 if(results[1]&&results[0].score-results[1].score<5&&results[0].article.id!==results[1].article.id)return choose(results.slice(0,3).map(r=>r.article.id));
 return found(results[0].article.id);
}
