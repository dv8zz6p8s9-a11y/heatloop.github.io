# HeatLoop Python LAB v1.0-RC — kompletna specyfikacja generatora pętli i dojść do rozdzielaczy
**Wydanie przygotowawcze: 24 października 2026** · **Status: test techniczny, NIE projekt wykonawczy**  
**Repo:** `dv8zz6p8s9-a11y/heatloop.github.io`  
**Kopia niezmieniona:** `backup/python-lab-2026-10-24-1856` (commit `a013c53face22a1b8141c713094be6697ea5a0b3`)  
**Gałąź wdrożeniowa:** `feature/python-lab-technical-drawing-v1` · PR #12 (draft).

## A. Cel i zakres

Celem jest uzyskanie czytelnego projektu ogrzewania podłogowego podobnego do rzutu przedstawionego przez użytkownika: wyraźnie rozdzielone kolorami zasilania i powroty, uporządkowane wejścia/wyjścia, przy rozdzielaczu dwie równoległe nitki dojścia, zrozumiałe oznaczenia P01...Pn oraz R1...Rn i tabela wszystkich obiegów. Rozwiązanie ma zachować dotychczasową edycję pomieszczeń i kalibrację (również osobne X/Y), działać na iPhonie i komputerze oraz nie przenosić bez zgody pracy użytkownika na serwer.

**Założenia produktu HeatLoop:** podział na wiele ręcznie wyznaczanych pól grzewczych, rozstawy 10 / 12,5 / 15 / 20 cm **oddzielnie dla każdej pętli**, rura 16 mm jako domyślna z możliwością zmiany, odstęp od ściany liczony od zewnętrznej krawędzi rury, nominalny maksymalny obieg **80 m razem z dojściami** (ustalony limit tej aplikacji), wariant A dla wąskich fragmentów — ominąć i kontynuować na dostępnej powierzchni, jeśli bezpieczna geometria jest możliwa. Brak automatycznego podziału dowolnej powierzchni na wiele obiegów; instalator wyznacza pola/pętle i może zmieniać ich parametry.

**Bardzo ważne:** 80 m to domyślny warunek produktu HeatLoop, nie uniwersalna granica każdej instalacji. Wymiarowanie mocy, hydraulika, dylatacje, promienie gięcia, materiały i dopuszczalne temperatury muszą być sprawdzone dla wybranego systemu i obowiązujących przepisów/norm.

## B. Wynik przeglądu źródeł — podstawy projektu

### B1. Producent / dokumentacja techniczna

- **Uponor**, zasady układania rur: ślimak naprzemiennie prowadzi równoległe odcinki zasilania i powrotu; kształt pomieszczenia ma wpływ na wybór sposobu układania. Źródło: https://www.uponor.com/pl-pl/instalacje/produkty/ogrzewanie-podlogowe.
- **Uponor, poradnik UFH**, podstawa do późniejszej implementacji hydrauliki, konstrukcji podłogi i regulatorów; nie kopiować arbitralnie limitów pomiędzy systemami: https://www.uponor.com/pl-pl/instalacje/poradnik-techniczny-ufh.
- **Purmo**, poradnik systemów płaszczyznowych: rozdziały obliczeń, konstrukcji, rozdzielaczy i dylatacji: https://www.purmo.com/docs/purmo-poradnik-techniczny-systemy-ogrzewania-i-chlodzenia-plaszczyznowego-03-2020.pdf.
- **Weber**, dylatacje i osłony rur na przejściach przez szczeliny, uwzględnić w funkcji odczytu drzwi/dylatacji: https://www.pl.weber/ogrzewanie-podlogowe-kompendium-wiedzy.
- **Disan**, czego powinien dotyczyć projekt instalacji (bilans strat, parametry pracy, rozstawy i długości, materiały, izolacja, uruchomienie): https://www.disan.pl/porady/ogrzewanie-podlogowe/.

### B2. Implementacje, algorytmy i rysunki do analizy

- **Underfloor Heating Designer**, licencja Apache-2.0, otwarte źródła kodu, regulacja narożnika i kierunku rozpoczęcia pętli, pętle powrotne oraz dojścia. Dokumentacja uczciwie wskazuje problemy przy wklęsłych obrysach, których nie można ignorować. https://github.com/ArendJanKramer/underfloor-heating-designer
- **Comfort Draft**, fork z kilkoma rozdzielaczami i ręczną edycją wejść/wyjść oraz dojść: https://github.com/i-platonov/comfort-draft. Pozwala porównać interfejs i organizację danych. Rozwój HeatLoop pozostaje oryginalną implementacją; ewentualne wykorzystanie fragmentów kodu obcych repozytoriów wymaga osobnego przeglądu licencji i zachowania informacji o prawach autorskich.
- **HeatAlgo**, opis aktualizacji silnika 17 lipca 2026: układ wychodzący od rzeczywistego przyłącza, edycja węzłów, prosty rytm rozstawu, bez udawania poprawnego ślimaka w niemożliwym polu: https://heatalgo.com/blog/aktualizacja-lipiec-2026-3. To wzorzec funkcjonalny, nie źródło naszego kodu.
- **Shapely**, zbiory geometrii, `buffer` do obszarów odsunięcia i rezerwacji, `offset_curve` do linii równoległych, `covers/intersects` do walidacji: https://shapely.readthedocs.io/en/stable/reference/shapely.buffer.html i https://shapely.readthedocs.io/en/2.0.2/reference/shapely.offset_curve.html.
- Przykłady rysunków technicznych: https://heatupsolution.com/; https://www.krelldistributing.com/layout-design-portfolio/; https://benem.nl/advies-legplan.html. Inspiracja dotyczy funkcji i czytelności, nie bezpośredniego kopiowania chronionych grafik.

### B3. Wnioski projektowe

1. Dwa niepełne, współbieżnie rozłożone „ślimaki” połączone nawrotem są bliskie oczekiwanemu układowi przeciwprądowemu.
2. Miejsce przyłącza powinno wpływać na **rzeczywisty wybór orientacji ślimaka**, a nie wyłącznie jego kolor.
3. Dla wielu pętli dojścia muszą być planowane przed obliczeniem geometrii pola; jednak rezerwacja miejsca jest użyteczna tylko, gdy kontrola kolizji obejmuje obydwie nitki i pozostałe pętle.
4. Przy nieobsługiwanym kształcie lepiej wyświetlić geometrię *planowaną / niezweryfikowaną* z jednoznacznym ostrzeżeniem niż udawać kompletny projekt.
5. Wydruk należy oddzielić od gęstego interfejsu roboczego; długości, nazwy i zagrożenia powinny być w tabeli, nie na środku ślimaka.

## C. Kontrakt geometryczny i jednostki

Wszystkie obliczenia odległości w metrach; współrzędne SVG/obrazu zachowują oryginalne położenie, a przeliczenia wykonują `sx` i `sy`:

- `x_m = x_source * sx`; `y_m = y_source * sy`.
- Obliczenia rury **nie zależą** od powiększenia, przesunięcia ekranu i obrotu podkładu o 90°.
- Zewnętrzne odsunięcie osi rury = `odstęp_od_ściany_do_krawędzi + średnica_rury/2`. Przykład: 100 mm + 16/2 mm = **108 mm**.
- Całkowita długość obiegu `L_total = L_grzewcza + L_zasilanie + L_powrót`.
- Warunek `L_total <= 80.0 m`; długość obliczana po rzeczywistej polilinii, **nie po liczbie pikseli**.
- Minimalny rozstaw **normalnych** przewodów grzewczych = ustawienie pola (10/12,5/15/20 cm). Początkowe dwie nitki korytarza w podglądzie mają rozstaw osi 10 cm, **ale to wartość próbna** — nie zezwala na dowolne zagęszczenie niezależnie od technologii rur i hydrauliki.
- Promień gięcia: wartość zależna od średnicy/producenta i systemu montażowego. Jeżeli niemożliwy do dotrzymania, wynik jest wyraźnie **schematic** i nie może mieć statusu `installation_ready`.
- Każda polilinia musi w obliczeniach mieścić się wewnątrz dozwolonego obszaru `pole - clearance`; brak przecięć z samą sobą jest konieczny, ale niewystarczający do uznania projektu za wykonawczy.

### C1. Statusy

| Status | Znaczenie | Zachowanie |
|---|---|---|
| `experimental` | Geometryczny ślimak przeszedł obecne testy prostokąta, ale nadal nie jest projektem wykonawczym | Obraz zasilania/powrotu/nawrotu, pełne ostrzeżenie o ograniczeniach |
| `schematic` | Podgląd ślimaka — uproszczone narożniki / omega wymagają weryfikacji promieni | Inna kreska i etykieta „SZKIC”; **bez** akceptacji do montażu |
| `planned` | Brak wiarygodnej geometrii lub kolizja z korytarzem | Nie rysować sztucznej rury; wskazać przyczynę |
| `draft` (dojście) | Wstępny przebieg zasilania i powrotu | Przerywany, z osobnymi długościami |
| `blocked` (dojście) | Zbyt wąski pas / konflikt z innym polem / brak przejścia | Nie udawać połączenia; włączyć ostrzeżenie |

`installation_ready=false` dla **każdego** wariantu dostarczonego w tej wersji testowej.

## D. Generator ślimaka — architektura i wersja osiągalna w bieżącym prototypie

1. Wejście: skalibrowany obrys pokoju; lista samodzielnych pól, każde z osobnym rozstawem i rozdzielaczem; średnica, ściana/clearance, promień i nominalne dojścia.
2. Preferencje pętli: `preferredStart` / `preferredEnd` w pikselach źródła (na krawędzi pola), `direction`, trasa pomocnicza `guide`, szerokość planowanego pasa, położenie rozdzielacza.
3. Każde pole walidowane Shapely: obrys prawidłowy, zawiera się w pomieszczeniu, nie nachodzi na inne pola.
4. **Prostokąty**: generator buduje układ ślimakowy z niepełnymi obiegami wchodzącymi do środka i równoległym powrotem, spina je łukiem. Dla żądanego promienia trudniejszego niż połowa rozstawu pozostaje tryb schematic.
5. **Nowość v10:** przed wygenerowaniem rury algorytm tworzy do 8 równoważnych orientacji (obroty 0/90/180/270° × odbicie), bez zmiany fizycznych wymiarów. Ocena kandydatów uwzględnia odległość początku i końca od wskazań instalatora oraz położenie rozdzielacza/punktów korytarza.
6. Jeśli ręcznie narysowano korytarz, jego oś otrzymuje bufor = połowa szerokości + margines. Kandydat przecinający ten bufor z dala od własnego wejścia/wyjścia jest odrzucany. Jeżeli żaden układ nie pasuje, pole pozostaje `planned` z przyczyną konfliktu.
7. Wybrany kandydat otrzymuje **rzeczywiste** `actual_start_m`, `actual_end_m` i odchyłki `preferred_start_error_m` / `preferred_end_error_m`. Wskazanie **nie oznacza jeszcze** dowolnego przesunięcia końca rury na wskazaną krawędź.
8. Przy „Odwróć kierunek” odwracana jest faktyczna kolejność trzech odcinków, nie tylko kolory. Punkt zasilania/powrotu w wynikach i rysunku nie może być odwrócony dwukrotnie.
9. Długość i orientacja pozostają stabilne dla identycznego wejścia (deterministyczny wybór).
10. Wstępne geometryczne pokrycie pola: bufor wokół osi rury o pół rozstawu, przecięty z użyteczną powierzchnią pola. Zwracamy `geometric_coverage_pct`. **Nie** jest to obliczenie mocy ani temperatura powierzchni.

### D1. Co jest nadal do opracowania

- Dokładne otwieranie ślimaka **w dowolnym punkcie** wskazanym na obrysie, bez dodatkowej nieweryfikowanej rury;
- złącze „S” ze stałym promieniem i bez krzyżowania w każdym rozstawie, w tym omega dla promienia większego od pół rozstawu;
- algorytm wielokątów nieprostokątnych i L, który pomija za wąskie fragmenty i kontynuuje w pozostałym obszarze;
- dynamiczne dogęszczenie w pasie rozdzielacza bez złamania minimalnego odstępu osi rur i wymaganego promienia;
- kontrola minimalnej odległości między dowolnymi nieprzyległymi fragmentami pętli, a nie jedynie test `LineString.is_simple`.

## E. Dojścia i rozdzielacze

### E1. Kolejność pracy instalatora

1. Utwórz lub otwórz projekt.
2. Skalibruj obraz i zweryfikuj znany wymiar; obrysuj pokoje.
3. Zaznacz niezależne pola grzewcze.
4. Dodaj rozdzielacze (maks. 12 w obecnym LAB) i wskaż ich lokalizację.
5. Przypisz konkretne pętle do R1/R2 i ustaw ich rozstawy.
6. Zaznacz preferowany początek i koniec osobno dla każdej pętli; w razie potrzeby odwróć kierunek.
7. Wskaż środek wstępnego korytarza od rozdzielacza do pola (klikane kolejne punkty); wpisz jego szerokość.
8. Uruchom „Generuj pętle i dojścia całego projektu (TEST)”.
9. Odczytaj ostrzeżenia: odchyłki początku/końca, brak przestrzeni w korytarzu, pełne pokrycie, długość i promień.
10. Dopiero przy pozytywnych testach generuj rzut SVG TEST i zachowaj pełny JSON.

### E2. Trasy pary zasilanie/powrót

- Ręcznie rysowana trasa jest **osią pasa**, a nie dwiema rurami nakładającymi się na siebie.
- Dwa poglądowe przebiegi są tworzone równolegle po bokach osi. Domyślny rozstaw lokalny 10 cm (odległość osi). Geometria obliczana w metrach, a nie pikselach.
- Zbyt wąski pas (< około 14,6 cm według założenia prototypu) powoduje `blocked`. Ta granica jest **testowa**, nie uniwersalna dla wszystkich rur i systemów.
- Łączniki obu nitek z rzeczywistymi końcami ślimaka są prowadzone ortogonalnie z próbą obejścia **innych** znanych pól. Nadal mogą wymagać dodatkowych łuków oraz weryfikacji ścian, drzwi i wspólnej rezerwacji przestrzeni.
- Bez ręcznej osi generator daje poglądową trasę poziom/pion; automatyczny konflikt z innymi trasami zasilania/powrotu nie jest jeszcze w pełni rozstrzygnięty.
- Przy wielu pętlach docelowy automat musi przydzielać pasy w kolejności od rozdzielacza, trzymać rejestr zajętości, przewidzieć przejścia przez drzwi i odstępy między obiegami oraz obsłużyć kontrolowane częściowo mniejsze rozstawy.
- Wymagana przyszła funkcja „przesuń węzeł trasy” ma natychmiast aktualizować długość, kolizje i kolejne automatyczne obiegi.
- Wymagany przyszły tryb ręczny: niezależna edycja obu nitek i blokowanie segmentów przez instalatora.

### E3. Parametry rozdzielacza

- liczba sekcji automatycznie równa liczbie przypisanych pętli, ale instalator może ją zwiększyć;
- domyślna szafka = rozdzielacz + **2 sekcje**;
- Eurokonus = **2 × liczba sekcji**;
- dwa zawory odcinające;
- grupa pompowa opcjonalna i domyślnie niewybrana;
- możliwość kilku mniejszych rozdzielaczy zamiast jednego dużego;
- połączenie na schemacie nie jest obietnicą poprawnego przypisania fizycznych króćców — dojdzie osobne mapowanie zasilanie/powrót na porty.

## F. Interfejs i wzorzec wizualny

### F1. Zasada „projekt podobny do przesłanego zdjęcia — ale czytelniejszy”

Warstwy od spodu: przygaszona architektura → cienkie kontury pokojów → delikatne granice pól → niebieskie zasilanie → pomarańczowy powrót → turkusowy nawrót → rozdzielacze R1/R2 → najmniejsze konieczne etykiety. Linie `schematic` kreskowane, a dojścia przerywane innym rytmem. Półprzezroczysta strefa korytarza widoczna tylko po zaznaczeniu.

Widok na ekranie:
- osobne zakładki Rysunek/Pokoje/Pętle/Rozdzielacze/Ustawienia;
- przy pętli mały panel sterowania oraz długości: **część grzewcza / zasilanie / powrót / suma / zapas do 80 m**;
- szybkie oznaczenia S? i K? dla *preferowanych* wejść/wyjść; prawdziwe końce oznaczone innymi znacznikami;
- wybór pętli z listy i (kolejny etap) kliknięciem w obrys na rysunku;
- zmiana skali/zoomu/obrotu nie zmienia żadnego metrażu.

Widok techniczny / SVG:
- podkład wyraźnie przygaszony, nazwa/numer pętli krótka: P01, P02;
- przy rozdzielaczu symbol R1 / R2, liczba sekcji;
- w tabeli pełna nazwa, m², rozstaw, wybrany rozdzielacz, m grzewcze, m podejść, % pokrycia geometrycznego i ostrzeżenia;
- ramka tytułowa, data, opis parametrów i wersja algorytmu to kolejne kroki, przed eksportem PDF;
- oznaczenie „TEST — nie projekt wykonawczy” na każdej wersji drukowanej, dopóki wynik nie przejdzie odbioru.

## G. Dane JSON — kontrakt v10

Wciąż plik lokalny `HeatLoop-Drawing-LAB`. Nowo dodane właściwości przy każdej pętli/polu:

```json
{
  "format":"HeatLoop-Drawing-LAB",
  "version":10,
  "background":"data:image/png;base64,...",
  "sx":0.01,
  "sy":0.01,
  "rooms":[{
    "id":1,
    "name":"Pokój",
    "points":[[100,100],[300,100],[300,400],[100,400]],
    "heatingZones":[{
      "id":1,
      "points":[[120,120],[280,120],[280,360],[120,360]],
      "settings":{"spacing_m":0.125,"feed_m":2,"back_m":2,"manifold_id":1},
      "routing":{
        "direction":"normal",
        "preferredStart":[120,250],
        "preferredEnd":[120,270],
        "guide":[[70,220],[95,245]],
        "corridorWidthM":0.20
      }
    }],
    "loopPreview":null
  }],
  "manifolds":[{"id":1,"name":"Rozdzielacz 1","point":[50,200]}]
}
```

Właściwy zapis z aplikacji zawiera również pola kalibracji, obrotu, ustawień i wyników geometrii. Obecne dane pozostają zgodne w odczycie od wersji v1 do v10. Powyższy fragment stanowi przykład struktury, nie pełną kopię realnego projektu.

### G1. Wymagania bezpieczeństwa danych

- Import JSON powinien być transakcyjny: parsowanie i walidacja przed zastąpieniem bieżącego projektu, wycofanie przy błędzie.
- Akceptować jedynie poprawne liczby skończone; limit 25 węzłów korytarza i zakres szerokości 10–80 cm.
- Dane użytkownika i obraz lokalnie wewnątrz JSON; nie logować danych osobowych ani dołączonych obrazów.
- Przed „Nowy projekt” konieczne potwierdzenie utraty danych.
- Zmiana kształtu pola unieważnia pętlę, ale nie powinna przypadkowo kasować rozdzielaczy innych pokojów.
- Edycja S?/K? i korytarza jest przechowywana oddzielnie od wyników silnika; plik pozwala odtworzyć intencję instalatora po przebudowie algorytmu.

## H. Plan wykonawczy (w kolejności)

### Sprint G1 — geometria ślimaka (aktualnie przygotowana)

- 8 orientacji przyłącza z zachowaniem odległości, obrotów i odbić;
- rzeczywiste odwrócenie przepływu na rysunku;
- wybór układu na podstawie początek/koniec/rozdzielacz;
- podgląd S? i K?, zapis odchylenia rzeczywistego przyłącza;
- wstępna ochrona wskazanego korytarza przed późniejszymi zwojami;
- wskaźnik **geometrycznego**, nie cieplnego pokrycia pola;
- testy Python/Shapely + Node.

### Sprint G2 — dojścia i zajętość

- zdolność prowadzenia dwóch fizycznie oddzielnych tras od rzeczywistych króćców R1/R2;
- model fizycznej szerokości korytarza dla wielu obiegów, ograniczeń ścian i przejść;
- mapa obszarów zajętych wraz z kolejnością kładzenia rur i kontrolą minimalnych odstępów;
- ponowne generowanie pętli po przesunięciu rozdzielacza albo korytarza bez gubienia edycji użytkownika.

### Sprint G3 — L i wielokąty

- roboczy obszar = właściwe pole - odsunięcie od ściany - przeszkody - pasy techniczne;
- klasyfikacja komponentów po buforowaniu do środka; wąskie fragmenty pomijane zgodnie z wariantem A;
- próba jednego ciągłego układu od wskazanego wejścia poprzez ramię L, wnętrze i powrót;
- walidacja odcinków na rzeczywistym wielokącie (nie na prostokącie ograniczającym);
- gdy brak jednej bezkolizyjnej pętli: jasne „pole wymaga korekty/podziału”, nie sztuczna linia.

### Sprint G4 — edycja węzłów i promieni

- osobne przyciski „Wyznacz początek”, „Wyznacz koniec”, „Odwróć pętlę”, „Przywróć automat”;
- przeciąganie węzłów ze sprawdzaniem rozstawu, długości, gięcia i przecięć;
- narożniki zaokrąglane łukiem spełniającym minimalny promień producenta, bez sztucznie ostrych 90°;
- środkowy nawrót omega: test promienia i przestrzeni; blokada wyniku jeśli za mało miejsca.

### Sprint G5 — projekt techniczny i raport

- warstwy, identyfikatory P01... / R1..., tabela, legenda, ostrzeżenia;
- eksport PDF i SVG z osadzonym rzutem i powtarzalnymi metrażami;
- numer rewizji projektu i arkusza, kopia danych obliczeniowych;
- powiązanie z wyceną, ilościami materiałowymi i modułem kotłowni bez przenoszenia funkcji eksperymentalnych do publicznej Beta przed odbiorem.

## I. Plan testów — procedura obowiązkowa

### I1. Dane testowe

**T-01:** prostokąt 3 × 3 m, rozstaw 15 cm, rura 16 mm, najpierw bez rozdzielacza.  
**T-02:** prostokąt 2,07 × 3,00 m, rozstaw 12,5 cm.  
**T-03:** 1,93 × 3,00 m, rozstaw 12,5 cm.  
**T-04:** 4,73 × 2,28 m, rozstaw 12,5 cm.  
**T-05:** 4,75 × 2,07 m, rozstaw 12,5 cm.  
**T-06:** 4,75 × 2,13 m, rozstaw 10 cm; sprawdzenie ostrzeżenia o niepełnym pokryciu w limicie 80 m.  
**T-07:** 1,77 × 4,20 m, rozstaw 12,5 cm.  
**T-08:** 1,80 × 3,61 m, rozstaw 15 cm.  
**T-09:** L prosty, z załamaniem i fragmentem zbyt wąskim na rozstaw; nie wolno narysować błędnego przebiegu przez wnękę.  
**T-10:** nieortogonalny wielokąt ze skosem.  
**T-11:** dwie stykające się granicami strefy; odrębne parametry.  
**T-12:** dwa rozdzielacze; część pętli do R1, część do R2.

### I2. Testy interakcji

1. Obrys pokoju, dwa pola, zmiana rozstawu tylko drugiej pętli — pierwsza zachowana.
2. Obrót planu 90° w każdą stronę i zoom 1–8× — bez zmiany rzeczywistych m²/metrów.
3. Wskaż S? w każdym z czterech narożników tego samego prostokąta. Po regeneracji wynik powinien zmienić **rzeczywisty** początek, bez przeniesienia pola.
4. Odwróć kierunek. Przepływ, kolejność części `supply/return` i rzeczywiste końce mają zostać odwrócone spójnie, bez przestawienia ścian.
5. Przenieś S? i K? na różne boki pola. Sprawdź odchylenia w metrach; nigdy nie zgłaszać zerowej odchyłki bez pokrywania się punktów.
6. Oznacz korytarz od rozdzielacza, wpisz szerokość 20 cm. Powinny powstać **dwie**, nie jedna nakładająca się, linie wstępne o rozstawie osi 10 cm.
7. Ustaw pas 11 cm; komunikat „za wąski”, bez dwóch pozornie poprawnych przewodów.
8. Poprowadź pas przez inne pole; wymagany status „blocked”/ostrzeżenie.
9. Przesuń rozdzielacz; dojścia należy przeliczyć, a geometria ślimaka wymaga świadomego ponownego obliczenia.
10. Test 80 m: 79,9 / 80,0 / 80,1 m; dokładność pomiaru bez ucinania wyniku przed porównaniem.
11. Zapisz JSON v10 z 3 pokojami/7 polami/2 rozdzielaczami; otwórz dwukrotnie, także ten sam plik; sprawdź podkład i wszystkie dane.
12. Wczytaj JSON ze starszej wersji, w tym plik bez tras; nie może pojawić się `spacingAllowed is not defined`.
13. Wczytaj celowo uszkodzony JSON; zachowaj poprzednią pracę bez zmian.
14. Przełącz widok roboczy/techniczny; wyeksportuj SVG; sprawdź znikanie opisów nad rurami, czytelność P01/R1 i podkład.
15. Otwórz na Windows/Firefox, Android/Chrome i iPhone/Safari; sprawdź scroll paneli, wybór małych punktów i zachowanie orientacji obrazu.

### I3. Automatyczna walidacja

Uruchomić GitHub Actions `HeatLoop Python LAB drawing geometry checks`:
- Node: kalibracja, niezależne pętle, rozdzielacze, edytor JSON, korytarze, ortogonalne dojścia;
- Python + Shapely: poprawność pól, pętli 7 rozmiarów, orientacja względem S?/K?, odwrócenie kierunku, prekontrola korytarza, brak losowych różnic dla identycznych danych;
- sprawdzenie składni modułów JS;
- każdy błąd testu blokuje awans z wersji RC na publiczne LAB.

### I4. Bramka odbioru dla zmian widocznych

**Można testować RC**, gdy przechodzi testy syntax, Python, Node, JSON, nie psuje starej wersji i nigdy nie oznacza uproszczonego rysunku jako montażowo gotowego.

**Nie można uznać generatora za projekt wykonawczy**, dopóki:
- wszystkie linie znajdują się w dozwolonej powierzchni;
- odstępy między różnymi rurami i między rurą a przeszkodą są sprawdzone;
- każdy łuk spełnia minimalny promień danego producenta;
- przy rozdzielaczu znamy fizyczne porty i kolejność obiegów;
- trasa każdej pary przebiega zgodnie z projektowanymi drzwiami, ścianami i dylatacjami;
- 80 m obejmuje prawdziwe długości pętli + obydwu dojść;
- istnieją obliczenia hydrauliczne/termiczne lub profesjonalna kontrola projektanta;
- wyniki powtarzają się po zapisaniu/otwarciu i na urządzeniach docelowych.

## J. Stan prac na dzień sporządzenia

- **Gotowe do testów:** dwa tryby widoku, krótka legenda i tabela, eksport SVG TEST, dane preferowanych S?/K? i pasa, odwracanie kolejności przepływu, wybór orientacji dla prostokątów, poglądowe oddzielne nitki dojścia w korytarzu oraz zapis/odczyt JSON v10.
- **Częściowo:** prewalidacja korytarza; szacowanie geometrycznego pokrycia; analiza 80 m oparta na długości testowej; rysowanie narysowanych rur dla prostokątów.
- **Niewdrożone:** pełna fizyczna przebudowa ślimaka z dowolnym wskazanym S?/K?, wielokąty L i T, zintegrowana mapa kolizji wszystkich pętli, algorytm bezpiecznych łuków omega i automatyczne lokalne zagęszczanie po obliczeniach.
- **Bezpieczeństwo publikacji:** pozostawić aktualny publiczny Python LAB bez zmian; prototyp testować w osobnej lokalizacji lub na osobnej gałęzi. Merge do `main` dopiero po kontroli regresji i próbach na rysunku użytkownika.

---

**Notatka:** Zewnętrzne źródła wykorzystano jako merytoryczną inspirację i materiał do porównania ograniczeń, nie jako skopiowany silnik ani gwarancję zgodności projektu z normą. Wzór wizualny użytkownika jest referencją interfejsu, nie maszynową specyfikacją geometrii.
