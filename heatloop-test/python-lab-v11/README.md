# HeatLoop Python LAB v1.1.2 RC — testy

To **oddzielna wersja testowa**. Nie zastępuje `heatloop-test/python-lab-v10` ani aplikacji produkcyjnej.

## Testowanie w przeglądarce
1. Otwórz [HeatLoop Python LAB v1.1](rysunek.html?v=112).
2. Aby nie zaczynać od zera, pobierz [projekt demonstracyjny JSON](examples/projekt_demo_v11.json) i wczytaj przez **Ustawienia → Otwórz projekt**.
3. Sprawdź **podziałkę liniową w prawym dolnym rogu**; po kalibracji na rysunku nie widać wymiarów dodanych przez aplikację.
4. Workflow: **Rysunek → Pokoje → Pola grzewcze → Rozdzielacze → Pętle i dojścia**.
5. W zakładce Rozdzielacze obracaj R1/R2 o **±90°** i obserwuj symbol w czerwonej ramce.
6. Generuj pętle — sprawdź **100 m** jako maksimum (część grzewcza + zasilanie + powrót), od 90 m ostrzeżenie.
7. Zapisz **NOWY JSON**, ponownie otwórz i porównaj dane.
8. Przełącz na **Widok techniczny** i wyeksportuj SVG TEST z podziałką.

## Bezpieczeństwo
- Stara wersja v1.0 bez zmian.
- Back-up: `backup/python-lab-v10-before-v11-20261025`.
- Duże obliczenia zależą od pobrania Python/Shapely z internetu.
- **Nie jest to projekt wykonawczy**. Podgląd dojść, nawroty i całkowite pokrycie pola wymagają weryfikacji.

## Dokumentacja
[Zmiany v1.1 i pełna procedura odbioru](ZMIANY_V11_SCENARIUSZE_TESTOWE.md).  
[Specyfikacja oryginalnego algorytmu v1.0 (archiwalna)](SPECYFIKACJA_GENERATORA_V10_TEST.md).

## Poprawka 1.1.1 — symbole rozdzielaczy

- Zmniejszono czerwone znaczniki R1/R2 z 76 × 38 do **34 × 18 jednostek rysunku** — o około 79% mniejsza zakrywana powierzchnia przy standardowej skali.
- Usunięto rozbudowany podpis nad rozdzielaczem. Widoczny jest tylko mały symbol **R1/R2**; pełną nazwę i kąt można zobaczyć w panelu rozdzielaczy albo w podpowiedzi po najechaniu kursorem.
- Znaczniki niebieskiego zasilania i pomarańczowego powrotu leżą dokładnie w punktach wykorzystywanych przez algorytm tras. Zachowano obroty 0°, 90°, 180°, 270° także przy innej kalibracji osi X/Y.
- Dane projektu w JSON v11 pozostają zgodne; ponowne obrysowywanie pomieszczeń nie jest wymagane.

## Poprawka v1.1.2 — wybór pokoju i ustawianie rozdzielacza

- **Krok 3 → Pola grzewcze:** nowy wybór pomieszczenia bezpośrednio w panelu. Dostępna jest również opcja „Wskaż pomieszczenie na rzucie”. Po wyborze program automatycznie włącza rysowanie prostokątnego pola.
- Przycisk **„Pole”** na liście pokojów przenosi teraz do kroku 3, zamiast pozostawiać użytkownika w nieodpowiedniej zakładce.
- Wybrane pomieszczenie jest wyróżnione, a tekst informuje o aktywnym pokoju.
- **Krok 4 → Rozdzielacze:** ustawianie nowego lub istniejącego rozdzielacza działa także po kliknięciu *obok samego obrazu*, w obrębie planszy rysunku — potrzebne np. przy montażu na korytarzu.
- Nad rzutem pojawia się wyraźny komunikat „Ustawianie rozdzielacza” z przyciskiem anulowania. Po ustawieniu program potwierdza zapis pozycji.
- Zmieniono ukryty komunikat „kliknij na podkładzie” na widoczną informację o dozwolonym miejscu.
- **Bez zmiany danych:** JSON v11 i wszystkie zapisane obrysy, pola, pętle i rozdzielacze są zachowane.

### Szybki test
1. Wczytaj dotychczasowy JSON i wybierz **3. Pola grzewcze**.
2. Wskaż pomieszczenie z rozwijanej listy, następnie kliknij dwa narożniki pola.
3. Kliknij **4. Rozdzielacze → Dodaj rozdzielacz** albo **„Ustaw na rysunku”**.
4. Kliknij planszę obok pomieszczenia, na przykład w korytarzu. Sprawdź R1/R2 i komunikat powodzenia.
5. Zapisz projekt pod nową nazwą, otwórz go ponownie i porównaj położenie rozdzielacza oraz pola.

Automatyczne testy obejmują wybór dwóch pokoi, dwa pola, kliknięcie ustawienia rozdzielacza poza rasterem zdjęcia, anulowanie, zapis i odczyt JSON.

## Korekta v1.1.3 — wybór następnych pomieszczeń

- Stabilna lista „Pomieszczenie, w którym chcesz narysować pole grzewcze” **nie jest już przebudowywana** po każdym odrysowaniu; to zapobiega resetowaniu opcji w natywnym menu Firefox/Safari/Chrome.
- W kroku **3. Pola grzewcze** są przyciski **← Poprzednie pomieszczenie** oraz **Następne pomieszczenie →**. Przejście automatycznie wybiera następny pokój, zaznacza go i aktywuje rysowanie prostokątnego pola.
- Na etapie 3 można również wskazać pomieszczenie na planie lub wybrać dowolny pokój z listy.
- Po ukończeniu jednego pola dane innych pokojów **nie są usuwane**. Można także dodać kilka pól w tym samym pokoju.
- Sprawdzenie automatyczne: osiem pokojów, dziewięć pól, wielokrotna zmiana pokoju, niezmienność opcji `select`, zapis JSON. Wersja pliku projektu pozostaje `JSON v11`.
- Kopia bezpieczeństwa sprzed korekty: `backup/python-lab-v112-before-room-selector-stability-20261025`.
