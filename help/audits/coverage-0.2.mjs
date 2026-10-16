import fs from 'node:fs';
import {answer,getArticle} from '../engine.mjs';
import {drawingHelpAdvice} from '../../heatloop-b/drawing-help.mjs';
import {release} from '../../release.mjs';
// Content depth was reviewed against the UI and KB before running the prompts.
// 1 = task-specific steps; .5 = related but incomplete steps; 0 = no documented capability.
const task=(title,question,target,depth=1,note='')=>({title,question,target,depth,note});
const general=[
 task('Początek projektu','Jak rozpocząć pierwszy projekt?','start'),
 task('Dodanie pokoju','Jak dodać pomieszczenie ręcznie?','manual'),
 task('Usunięcie pokoju','Jak usunąć pokój?','room-delete'),
 task('Ograniczenia edycji','Jak zmienić nazwę pokoju?','room-edit'),
 task('Zmiana technologii','Jak zmienić technologię ogrzewania?','mixed'),
 task('Szacunek zapotrzebowania','Co oznacza obciążenie W/m² pokoju?','manual'),
 task('Oznaczenie rury','Jak ustawić PEX 16?','loops'),
 task('Limit długości','Jak zmienić długość pętli 80 m?','loops'),
 task('Dojścia pętli','Gdzie podać dojścia pętli?','loops'),
 task('Własna liczba pętli','Jak ręcznie ustawić liczbę pętli?','loops'),
 task('Rozdzielacz R2','Jak dodać drugi rozdzielacz?','manifolds'),
 task('Usunięcie pustego rozdzielacza','Jak usunąć pusty rozdzielacz R2?','manifolds',.5,'Artykuł opisuje dodawanie i przypisanie, nie przycisk usuwania.'),
 task('Przypisanie pokoju do rozdzielacza','Jak przypisać pokój do R2?','manifolds'),
 task('Zasilanie osobnych rozdzielaczy','Gdzie podać zasilanie rozdzielacza R2?','manifolds',.5,'Instrukcja istnieje, ale pytanie może trafić do ogólnego zasilania.'),
 task('Przepływy','Jak czytać przepływy w l/min?','flow'),
 task('Powiązanie planu z wyceną','Dlaczego pole liczby pętli jest wyszarzone?','locked'),
 task('Wyłączenie powiązania','Jak wyłączyć powiązanie planu z wyceną?','locked'),
 task('Wspólny regulator','Jak ustawić wspólny regulator?','zones'),
 task('Włączenie TECH','Jak dodać sterowanie TECH?','tech'),
 task('Wariant bezprzewodowy','Jak wybrać bezprzewodowe sterowanie?','tech'),
 task('Gwint siłownika','Jak wybrać gwint siłownika?','tech',.5,'Wskazano wybór gwintu, bez instrukcji identyfikacji konkretnego zaworu.'),
 task('Przekroczenie 8 stref','Co zrobić gdy mam 9 stref na rozdzielaczu?','tech',.5,'Podany limit, brak szczegółowego przebiegu rozwiązania przekroczenia.'),
 task('Przekroczenie 4 siłowników','Co zrobić gdy mam 5 siłowników na strefę?','tech',.5,'Podany limit, bez pełnego scenariusza doboru ponad limit.'),
 task('Opcjonalna grupa w wycenie podłogówki','Jak wyłączyć grupę pompową w wycenie podłogówki?','quote',0,'Ogólna hydraulika kotłowni nie wyjaśnia tego pola wyceny.'),
 task('Ręczna wycena rozdzielaczy','Jak dodać rozdzielacz z szafką do wyceny?','quote'),
 task('Własne ceny','Gdzie wpisać własne ceny materiałów?','prices'),
 task('Stawka frezowania','Gdzie jest cena frezowania?','milling'),
 task('Jednostka montażu','Czy montaż podłogówki jest w m2?','milling'),
 task('Izolacja i kształtki','Jak doliczyć izolację i kształtki zasilania?','supply'),
 task('Stawka montażu zasilania','Jak wycenić montaż zasilania jako całość?','supply'),
 task('Zmiana VAT','Jak zmienić VAT?','vat'),
 task('Eksport wyceny CSV','Jak wyeksportować wycenę CSV?','prices',.5,'Jest wzmianka o CSV, bez pełnej instrukcji przycisku eksportu wyceny.'),
 task('Oferta PDF','Jak zapisać ofertę PDF?','export'),
 task('Udostępnienie klientowi','Jak wysłać ofertę klientowi?','export'),
 task('Netto a brutto','Czy ceny w ofercie są netto czy brutto?','vat'),
 task('Start kotłowni','Jak uruchomić dobór kotłowni?','boiler'),
 task('OZC i szacunek','Gdzie podać OZC w kotłowni?','boiler'),
 task('Marka i model źródła','Jak wybrać model kotła SAS?','catalog'),
 task('Gaz i pakiet CWU','Jak ustawić zasobnik w pakiecie kotła gazowego?','gas'),
 task('Sprzęgła i grupy','Jak wybrać sprzęgło i grupy pompowe?','hydraulics'),
 task('Parametry CWU','Jak skonfigurować CWU?','cwu'),
 task('Naczynia i zabezpieczenia','Gdzie wpisać naczynie przeponowe?','safety'),
 task('Bufor i przepływ minimalny','Jak sprawdzić bufor i minimalny przepływ?','safety'),
 task('Za mała moc źródła','Co oznacza ostrzeżenie za mała moc źródła?','boiler',.5,'Opisuje ogólny charakter doboru; nie diagnozuje konkretnej konfiguracji kotłowni.'),
 task('Dobór grzejnika','Jak dobrać grzejnik przy innych temperaturach?','radiators'),
 task('Dodanie grzejnika do zestawienia','Jak dodać grzejnik do zestawienia?','radiators'),
 task('Import katalogu grzejników','Jak wczytać katalog CSV grzejników?','csv'),
 task('Usunięcie pozycji katalogu','Jak usunąć produkt z katalogu grzejników?','csv',.5,'Brak odrębnej instrukcji usuwania pozycji katalogowych.'),
 task('Zapis i odczyt JSON','Jak zapisać projekt JSON?','json'),
 task('Błędny import JSON','Projekt JSON nie wczytuje się','json-errors'),
 task('Offline','Czy działa offline?','offline'),
 task('Telefon','Jak zainstalować skrót na iPhonie?','mobile'),
 task('Zgłoszenie problemu','Jak zgłosić błąd?','bugs'),
 task('Wersja aplikacji','Jaka wersja HeatLoop?','@scope')
];
const drawing=[
 task('Wczytanie PNG/JPG','Jak wczytać rzut PNG?','drawing'),
 task('Wczytanie PDF','Jak wczytać PDF jako rzut?','drawing'),
 task('Kalibracja','Jak ustawić skalę rzutu?','drawing'),
 task('Obrys pokoju','Jak narysować obrys pomieszczenia?','drawing'),
 task('Zakończenie obrysu','Jak zakończyć obrys pomieszczenia?','drawing'),
 task('Cofnięcie punktu','Jak cofnąć ostatni punkt na rzucie?','drawing',.5,'Brak instrukcji przycisku Cofnij punkt.'),
 task('Usunięcie niedokończonego szkicu','Jak usunąć bieżący szkic?','drawing',.5,'Brak rozróżnienia szkicu od gotowego pomieszczenia.'),
 task('Pomocnicza trasa rury','Do czego służy trasa rury pomocnicza?','drawing',.5,'Może zostać pomylona z trasą przypisanej pętli.'),
 task('Wybór systemu przed rysowaniem','Jak wybrać system mieszany na rzucie?','mixed'),
 task('Technologia istniejącego pokoju','Jak zmienić technologię pomieszczenia na rzucie?','mixed'),
 task('Umieszczenie R1','Jak umieścić rozdzielacz na rzucie?','route',.5,'Trasa wymaga rozdzielacza, ale brak dokładnej instrukcji narzędzia Umieść rozdzielacz.'),
 task('Pozycja R2','Jak wskazać położenie rozdzielacza R2?','manifolds',.5,'Opisuje wybór R2 i przypisania, nie pełen przebieg umieszczania punktu.'),
 task('Przypisana trasa pętli','Jak narysować trasę pętli?','route'),
 task('Domknięcie trasy','Jak zakończyć pełną trasę pętli?','route'),
 task('Długość z rysunku','Czy narysowana długość pętli zastępuje szacunek?','route'),
 task('Usunięcie gotowej trasy','Jak usunąć narysowaną trasę pętli?','route',.5,'Brak kroków przycisku Usuń trasę.'),
 task('Obrót 90 stopni','Jak obrócić rzut o 90 stopni?','drawing'),
 task('Propozycje ścian','Jak wykryć ściany na rzucie?','drawing'),
 task('Próg wykrywania','Jak zmienić próg ciemności wykrywania ścian?','drawing',.5,'Brak instrukcji ustawiania progu i wpływu na wynik.'),
 task('Wybór i zatwierdzenie ścian','Jak zatwierdzić wybrane ściany?','drawing'),
 task('Usunięcie linii ścian','Jak usunąć zatwierdzone linie pomocnicze ścian?','drawing',.5,'Brak opisu przycisku usuwania linii pomocniczych.'),
 task('Zapis obrotu i ścian','Czy JSON zapisuje obrót rzutu i linie ścian?','json',.5,'Artykuł zapisu nie wyjaśnia nowych pól i zgodności ze starszą aplikacją.'),
 task('Grzejnik na rzucie','Jak umieścić grzejnik na rzucie?','radiator-plan'),
 task('Punkt grzejnika poza pokojem','Grzejnik na szkicu nie działa','radiator-plan'),
 {title:'Podgląd wykrywa brak skali',state:{scale:null},pattern:/Ustaw skalę/,depth:1},
 {title:'Podgląd wykrywa niedokończony szkic',state:{draftPoints:2},pattern:/niedokończony/,depth:1},
 {title:'Podgląd wskazuje przekroczony limit',state:{overlongLoops:1},pattern:/przekraczają/,depth:1},
 {title:'Ostrzeżenie o ręcznych pokojach',state:{manualRoomCount:1},pattern:/drugi raz/,depth:1},
 {title:'Nieprzypisane pomieszczenia',state:{unassignedRooms:1},pattern:/Przypisz pomieszczenia/,depth:1},
 {title:'Brak położenia rozdzielacza',state:{unplacedManifolds:1},pattern:/wskaż położenie/,depth:1},
 {title:'Diagnoza konkretnej przyczyny błędu planu',state:{planErrorCount:1},pattern:/Plan pętli zgłasza/,depth:.5,note:'Podgląd zna liczbę problemów i kieruje do planu, ale nie tłumaczy konkretnych komunikatów.'},
 task('Rozpoznanie błędnej dodatniej skali','Skala jest ustawiona, czy na pewno jest poprawna?','drawing',0,'Brak niezależnego wymiaru wzorcowego i oceny obrazu; nie potwierdza poprawności kalibracji.'),
 task('Fałszywe wskazanie mebla jako ściany','Wykrywanie ścian zaznaczyło meble, co zrobić?','drawing',.5,'Wymaga ręcznej selekcji, bez automatycznej klasyfikacji i konkretnej diagnozy obrazu.'),
 task('Ściany ukośne','Dlaczego wykrywanie nie znajduje ukośnych ścian?','drawing',.5,'Detektor działa dla poziomych/pionowych odcinków; brak odrębnego scenariusza naprawy.'),
 {title:'Niedostępna miniatura',technical:'unavailable-image',depth:1,note:'Test drawing-preview.test.mjs potwierdza tekstowy tryb i bezpieczny brak obrazu.'},
 {title:'Izolacja podglądu od AI',technical:'local-only',depth:1,note:'Test drawing-preview.test.mjs potwierdza brak obrazu i danych w żądaniu AI.'}
];

// Content review after implementation. These changes reflect new, concrete UI instructions.
const reviewed=new Map([
 ['Usunięcie pustego rozdzielacza','Opis przeniesienia przypisań, ponownego generowania i przycisku usuwania; R1 pozostaje.'],
 ['Zasilanie osobnych rozdzielaczy','Opis pól długości po wyborze konkretnego rozdzielacza.'],
 ['Opcjonalna grupa w wycenie podłogówki','Podano nazwę i lokalizację checkboxa oraz odróżniono kotłownię.'],
 ['Eksport wyceny CSV','Podano ekran, przycisk eksportu i kontrolę pobranego pliku.'],
 ['Usunięcie pozycji katalogu','Opisano brak kasowania wiersza w UI i zastąpienie katalogu poprawionym CSV.'],
 ['Cofnięcie punktu','Opisano działanie Cofnij punkt wyłącznie dla bieżącego szkicu.'],
 ['Usunięcie niedokończonego szkicu','Rozróżniono szkic od gotowego pomieszczenia.'],
 ['Pomocnicza trasa rury','Odróżniono szkic pomocniczy od trasy pętli i jej długości.'],
 ['Umieszczenie R1','Instrukcja wyboru rozdzielacza i przycisku wskazania znajduje się teraz w manifolds.'],
 ['Pozycja R2','Opisano wybór R2 i wskazanie punktu na rzucie.'],
 ['Usunięcie gotowej trasy','Opisano przycisk, potwierdzenie i powrót do szacunku.'],
 ['Próg wykrywania','Opisano kierunek zmiany progu, zakres i ponowne wykrywanie.'],
 ['Usunięcie linii ścian','Opisano przycisk i odróżniono linie pomocnicze od obrysów.'],
 ['Zapis obrotu i ścian','Opisano zapis obrotu i zaakceptowanych linii, brak zapisu kandydatów i ograniczenie starszych wersji.']
]);
for(const t of [...general,...drawing])if(reviewed.has(t.title)){t.depth=1;t.note=reviewed.get(t.title);}
const placement=drawing.find(t=>t.title==='Umieszczenie R1');placement.target='manifolds';
const diagnosis=drawing.find(t=>t.title==='Diagnoza konkretnej przyczyny błędu planu');
diagnosis.state={planErrorCount:1,planIssueCodes:['approaches']};diagnosis.pattern=/suma musi być mniejsza od limitu/;diagnosis.depth=1;
diagnosis.note='Podgląd otrzymuje kod błędu dojść i wyjaśnia poprawkę; nie kopiuje nazwy pomieszczenia. Inne znane błędy obejmują osobne testy; nieznane wymagają sprawdzenia komunikatu.';

const base={hasDrawing:true,scale:.1,roomCount:1,rooms:[{area:20}],manualRoomCount:0,draftPoints:0,hasFloorRooms:true,unassignedRooms:0,loopCount:2,drawnLoopCount:2,unplacedManifolds:0,overlongLoops:0,planErrorCount:0,linked:true,wallGuideCount:1,wallCandidateCount:0};
function evaluate(t){
 if(t.technical)return {...t,score:1,actual:'potwierdzone testem integracyjnym'};
 if(t.state){const text=drawingHelpAdvice({...base,...t.state}).map(x=>x.text).join(' ');const ok=t.pattern.test(text);return {...t,score:ok?t.depth:0,actual:ok?'oczekiwana wskazówka':'brak wskazówki'};}
 const result=answer(t.question);const route=t.target.startsWith('@')?(result.kind===t.target.slice(1)?1:0):(result.article?.id===t.target?1:result.choices?.some(a=>a.id===t.target)?.5:0);
 return {...t,score:Math.min(t.depth,route),actual:result.kind+(result.article?' / '+result.article.id:''),articleTitle:t.target.startsWith('@')?'Odpowiedź systemowa':getArticle(t.target)?.title};
}
const groups=[{name:'Ogólna obsługa aplikacji',rows:general.map(evaluate)},{name:'Praca z rysunkiem i podgląd',rows:drawing.map(evaluate)}];
const summary=groups.map(g=>{const full=g.rows.filter(r=>r.score===1).length,partial=g.rows.filter(r=>r.score===.5).length,none=g.rows.length-full-partial;return {name:g.name,total:g.rows.length,full,partial,none,percent:Math.round((full+partial*.5)/g.rows.length*100)};});
const line=r=>`| ${r.title} | ${r.question||'Podgląd / test integracyjny'} | ${r.score===1?'pełna':r.score===.5?'częściowa':'brak w tej próbie'} | ${r.actual} | ${r.note||(r.score===1?'Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania.':r.score===.5?'Właściwy temat jest wśród propozycji; potrzebne doprecyzowanie.':'Nie dopasowano oczekiwanego tematu: '+r.target+'.')} |`;
const report=`# HeatLoop BETA ${release.version} — pokrycie pomocy\n\nOcena przygotowanej gałęzi, 16.10.2026. To nie jest wynik testu opublikowanego serwisu ani certyfikacja zgodności.\n\n## Metoda\n\nWybrano ${general.length+drawing.length} czynności i sytuacji z obecnego interfejsu. Pełne wsparcie = 1 punkt (konkretne kroki i poprawne dopasowanie pytania lub potwierdzona wskazówka podglądu); częściowe = 0,5 (ogólna pomoc, niepełne kroki lub wymagane doprecyzowanie); brak = 0 (brak oczekiwanej reakcji albo brak zdolności). Wynik = suma punktów / liczba pozycji. To robocza, autorska miara pokrycia tej listy. Wybór czynności i ocena szczegółowości wpływają na wynik; nie jest to procent poprawności wszystkich możliwych rozmów.\n\nProcenty nie mierzą skuteczności wykrywania ścian. Nie mamy oznaczonego zbioru rzeczywistych rzutów z prawidłowymi ścianami, więc nie obliczamy czułości ani precyzji detektora. Zaliczenie testów automatycznych nie oznacza 100% pokrycia obsługi.\n\n| Obszar | Czynności | Pełne | Częściowe | Brak w próbie | Punkty / maksimum | Ocena |\n|---|---:|---:|---:|---:|---:|---:|\n${summary.map(s=>`| ${s.name} | ${s.total} | ${s.full} | ${s.partial} | ${s.none} | ${s.full+s.partial*.5}/${s.total} | ${s.percent}% |`).join('\n')}\n\n## Znaczenie wyniku\n\nAsystent obejmuje wszystkie główne moduły, lecz nie wszystkie czynności i sformułowania. Niepełne instrukcje trzeba odróżnić od błędnego dopasowania pytania: w tabelach pozostawiono faktyczny wynik, także gdy informacja istnieje, lecz silnik jej nie odnalazł. Zachowano 90 pozycji, pytania i wagi 1/0,5/0. Po uzupełnieniu treści ponownie oceniono ich szczegółowość; uzasadnienia zmian są w kodzie oceny. Instrukcja umieszczania R1 znajduje się teraz w artykule rozdzielaczy. Próbę diagnozy rozszerzono o konkretny kod błędu zamiast samego licznika. Wynik pierwotny (80% / 75%) zachowano w plikach z przyrostkiem „-przed”.\n\nPodgląd jest lokalny, wyjaśnia znane rodzaje błędów planu i rozpoznaje wybrane braki danych i nie jest pełną analizą dokumentacji technicznej. Nie potwierdzi prawidłowości skali na podstawie samego faktu, że jest dodatnia. Nie klasyfikuje samodzielnie wszystkich ścian ani nie projektuje automatycznie instalacji.\n\n## Ogólna obsługa\n\n| Czynność | Reprezentatywne pytanie | Wsparcie | Otrzymano | Uzasadnienie / ograniczenie |\n|---|---|---|---|---|\n${groups[0].rows.map(line).join('\n')}\n\n## Rysunek i podgląd\n\n| Czynność | Reprezentatywne pytanie | Wsparcie | Otrzymano | Uzasadnienie / ograniczenie |\n|---|---|---|---|---|\n${groups[1].rows.map(line).join('\n')}\n\n## Co dopracować najpierw\n\n1. Zweryfikować w praktyce czytelność rozbudowanych instrukcji na telefonie.\n2. Osobno dobierać konfiguracje TECH przekraczające limity aplikacji; instrukcja wyjaśnia ograniczenie, ale nie dodaje obsługi sprzętu.\n3. Nadal brak niezależnego potwierdzania skali i semantycznego rozpoznawania mebli/ścian; nieznane błędy planu kierują do komunikatów.\n4. Próby na rzeczywistych rzutach testerów i fizycznym iPhonie/Androidzie; osobna ocena skuteczności ścian na oznaczonym zbiorze.\n\nPowtórzenie oceny: node help/audits/coverage-0.2.mjs. Dane i pytania są w tym samym pliku. Ocena nie zmienia aplikacji, nie aktualizuje numeracji i nie publikuje wydania.\n`;
fs.writeFileSync(new URL('./POKRYCIE_POMOCY_0.2.md',import.meta.url),report);
fs.writeFileSync(new URL('./coverage-0.2.json',import.meta.url),JSON.stringify({version:release.version,summary,groups},(k,v)=>v instanceof RegExp?v.source:v,2)+'\n');
console.log(JSON.stringify(summary,null,2));
console.log('Braki / częściowe:',JSON.stringify(groups.map(g=>({name:g.name,rows:g.rows.filter(r=>r.score<1).map(r=>({task:r.title,score:r.score,actual:r.actual}))})),null,2));
