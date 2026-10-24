# HeatLoop Python LAB — przygotowanie czytelnego rzutu ogrzewania podłogowego

**Data:** 24.10.2026  
**Gałąź robocza:** `feature/python-lab-technical-drawing-v1`  
**Kopia zapasowa przed modyfikacją:** `backup/python-lab-2026-10-24-1856` (stan `main`, commit `a013c53face22a1b8141c713094be6697ea5a0b3`).  
**Status:** kandydat do testów; bez automatycznego wdrożenia na `main` i bez obietnicy gotowego projektu wykonawczego.

## Cel wizualny

Wzorcem jest przekazany przez użytkownika rzut z licznymi polami grzewczymi, dwukolorowymi odcinkami pętli i zgrupowanymi dojściami do rozdzielacza. Zachować jego czytelność instalacyjną, ale ograniczyć nakładanie się napisów na rury.

### Warstwy od spodu

1. Podkład architektoniczny: jasnoszary / przygaszony, bez rozciągania i deformacji po kalibracji.
2. Obrysy pokoi: cienkie linie bez ciężkiego wypełnienia.
3. Pola grzewcze: delikatny zielony kontur, bez intensywnego zalewania rysunku kolorem.
4. Pętle: zasilanie niebieskie, powrót pomarańczowy, nawrót zielony; dla pętli schematycznych kreskowanie i ostrzeżenie.
5. Dojścia: linie przerywane, zawsze rozróżnione od odcinków pola grzewczego.
6. Planowane korytarze: półprzezroczysty pas szerokości podanej przez instalatora oraz środkowa oś trasy.
7. Rozdzielacze: kontrastowy znak R1/R2 z liczbą sekcji.
8. Etykiety: na samym planie tylko P01/P02 i rozstaw; pełny opis w osobnej tabeli pod rysunkiem.

### Styl pracy i eksport

- Tryb **roboczy** zachowuje punkty edycji, kolory, narzędzia i dotychczasowe gesty.
- Tryb **techniczny** zmniejsza wizualny ciężar planu, wyróżnia rury i wystawia zestawienie wszystkich pól.
- Eksport **SVG TEST** jest samodzielnym obrazem rzutu, nie pełnym PDF ani obliczeniowo zatwierdzoną dokumentacją.

## Warianty kierunku i prowadzenia pętli

### Funkcje gotowe w kandydacie (do testów)

- `direction: normal|reverse` — odwrócenie logicznego kierunku przepływu i kolorów; **nie zmienia fizycznej geometrii** ślimaka.
- `preferredStart`, `preferredEnd` — wskazane przez instalatora punkty docelowe na granicy pola (przyciągane do jej najbliższej krawędzi). Znaczniki **S?** i **K?** oznaczają preferencję, nie istniejące zakończenie rury.
- `guide` — kolejność punktów trasy poglądowej od rozdzielacza ku polu; długości prowadzenia liczone według odrębnych odcinków z kalibracją X/Y.
- `corridorWidthM` — planowana szerokość pasa 0,10–0,80 m, rysowana na warstwie pomocniczej; **nie oznacza rezerwacji miejsca w algorytmie Python**.
- Kopiowanie i wczytywanie danych w JSON v10; projekty JSON v1–v9 pozostają możliwe do wczytania bez wymagania nowych pól.

### Istotne ograniczenia obecnej integracji

- Punkty S?/K? **nie powodują jeszcze przebudowy** ślimaka — generator nie może w tym momencie obiecać połączenia rury bez przecinania istniejących zwojów.
- Trasa prowadzona po punktach pomocniczych jest **poglądowa**: algorytm sprawdza inne pola grzewcze, ale nie zna drzwi, ścian, progów i już ułożonych przewodów.
- Korytarz może wizualnie przecinać przebiegi pola własnego; dopiero fizyczne zarezerwowanie geometrii pozwoli prawidłowo poprowadzić dwie równoległe rury.
- Nie ma jeszcze algorytmu bezpiecznego **zagęszczania** rur przy rozdzielaczu. Nie należy symulować dowolnych rozstawów przez zgniatanie grafiki.
- Dla L i złożonych wielokątów ślimaki pozostają zależne od odrębnej walidacji Python/Shapely.
- Limit 80 m musi sprawdzać **każdą pętlę osobno**, uwzględniając prawdziwą długość części grzewczej, zasilania i powrotu. W tym kandydacie długości ślimaków typu `schematic` i dojść pozostają wstępne.

## Następne wymagane prace przed uznaniem funkcji za gotowe

| ID | Zakres | Warunek odbioru | Status |
| --- | --- | --- | --- |
| GEO-01 | Przebudowa ślimaka z punktami start/koniec | Łączenie faktycznych końców do wskazanych punktów bez niezgodnych promieni, przecięć i zmiany rozstawu | Niewdrożone |
| GEO-02 | Rezerwacja korytarza w obliczeniach pola | Generator rzeczywiście omija korytarz przed ułożeniem ślimaka | Niewdrożone |
| GEO-03 | Równoległe zasilanie i powrót w korytarzu | Zachowany odstęp osi rur, łuki zgodne z promieniem, brak kolizji między obiegami | Niewdrożone |
| GEO-04 | Automatyczne zagęszczanie przy rozdzielaczu | Dozwolony rozstaw tylko 10 / 12,5 / 15 / 20 cm, raport dodatkowych metrów, brak nakładania | Niewdrożone |
| GEO-05 | Obsługa L-ek i wielokątów | Geometria bez przecięć, obszary zbyt wąskie omijane, brak sztucznego skrótu | Niewdrożone |
| GEO-06 | Walidacja 80 m | Każda pętla liczona oddzielnie i wynik porównany z rysunkiem | Częściowa, wstępna |
| UI-01 | Widok techniczny i opisy | Brak długich etykiet na ślimaku, czytelne P01/R1 i tabela pod rzutem | Gotowe do testu |
| UI-02 | Eksport SVG | Poprawne barwy i proporcje, zgodność z widokiem w Firefox, Chrome, Safari | Gotowe do testu |
| DATA-01 | JSON i kopia zapasowa | Ponowny odczyt wszystkich znaczników i ustawień z plików starszych i nowszych | Gotowe do testu |
| QA-01 | Automatyczne testy | Testy geometrii, tras, odwrócenia kierunku, zapisu i odczytu | W przygotowaniu |
| QA-02 | Test mobilny i desktopowy | Firefox Windows, Safari iPhone, Chrome Android; ponowne otwarcie JSON bez utraty danych | Niepotwierdzone |

## Test odbiorowy użytkownika

1. Wczytać kopię projektu z trzema pokojami, siedmioma polami i dwoma rozdzielaczami; potwierdzić pełne przywrócenie.
2. Włączyć **widok techniczny**; sprawdzić czytelność etykiet, barwy pętli i widoczność rozdzielaczy.
3. Wybrać pętlę i wskazać preferowany S? i K?; sprawdzić, że istniejąca geometria nie udaje przeniesionego zakończenia.
4. Odwrócić kierunek; porównać, czy kolory zasilania/powrotu i przypisanie dojść zmieniły się spójnie.
5. Wskazać korytarz pomocniczy od rozdzielacza do pola; sprawdzić rysunek, liczbę punktów i ostrzeżenia o kolizji.
6. Zapisać i otworzyć JSON. Ponownie wykonać krok 2 oraz 3.
7. Wyeksportować SVG TEST i sprawdzić, czy podkład, kontury, pętle i symbole są czytelne.
8. Nie łączyć tej gałęzi z produkcją, jeśli geometria sugeruje pełny projekt wykonawczy mimo nierozwiązanych problemów GEO-01–GEO-05.

## Zasada wdrożenia

**Najpierw backup, potem prace na osobnej gałęzi, potem przegląd zmian i test w Python LAB.** Publiczna wersja `main` pozostaje niezmieniona do pozytywnego odbioru.
