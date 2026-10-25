# HeatLoop Python LAB v1.1 RC — zmiany, kolejność pracy i scenariusze testowe
**Wydanie testowe: 25 października 2026**  
**Kopia zapasowa całego repozytorium przed zmianami:** `backup/python-lab-v10-before-v11-20261025` (commit `125452d53ee299592d93e5d8cc41f6d9e70d3609`).  
**Wersja publiczna v1.0:** `heatloop-test/python-lab-v10/` — pozostaje bez zmian.  
**Wersja testowa v1.1:** `heatloop-test/python-lab-v11/`.

## 1. Ustalony nowy przebieg użytkownika

1. **Wczytaj rysunek i skalibruj.** Obraz/JPG/PNG/WEBP/PDF (pierwsza strona), wymiar znany w osi X i/lub Y. Po zaakceptowaniu kalibracji linie pomiarowe i opisy znikają z rzutu. Skala fizyczna jest zachowana w pamięci i JSON.
2. **Oznacz pokoje.** Prostokąty lub wielokąty, z edycją punktów.
3. **Oznacz pola grzewcze.** Nowa osobna zakładka. W jednym pokoju mogą być niezależne obszary i rozstawy 10 / 12,5 / 15 / 20 cm. „Zamknij wielokąt pola” dostępne we właściwej zakładce.
4. **Ustaw rozdzielacze.** Każdy ma duży symbol prostokątny R1/R2 z czerwoną ramką; przyciski obrotu o ±90° oraz wybór 0°/90°/180°/270°. Kierunek poglądowych króćców obraca się wraz z nim. Można dodać kilka rozdzielaczy.
5. **Generuj pętle i dojścia.** Oddzielny rozstaw każdej pętli, przypisanie do ustawionego rozdzielacza, preferowane punkty S/K, trasy pomocnicze i obliczenia w Python/Shapely. W przypadku brakujących elementów krok 5 nie rozpocznie generowania, tylko wskaże brak.

`Ustawienia` dostępne cały czas z opcjami zapisz, otwórz, nowy projekt (z potwierdzeniem utraty danych).

## 2. Limit 100 mb i sposób liczenia

**Główna wartość projektu: 100 m / obieg (łącznie z dojściem i powrotem).**

- `L_total = L_ogrzewanie + L_zasilanie + L_powrót`;
- **poniżej 90 m:** podstawowy zakres, bez ostrzeżenia długości;
- **od 90 do 100 m:** ostrzeżenie o zbliżeniu do limitu;
- **powyżej 100 m:** przekroczenie limitu; wynik wymagający korekty;
- jeżeli pełne pokrycie pola według rozstawu prawdopodobnie przekroczy 100 m, a szkic został skrócony do limitu, generator nie sugeruje pełnego pokrycia;
- brak utożsamiania tego limitu z uniwersalną normą lub wytyczną dla dowolnych rur i źródeł ciepła.

Silnik Python, wynik pola, podsumowanie UI i komunikaty wykorzystują 100 m. Dawna nazwa pola `over_80m` w Pythonie pozostaje jedynie **aliasem kompatybilności**; nowy kod korzysta z `over_limit` i `max_loop_m`.

Dla JSON v1–v10 stare zdjęcie, pokoje, pola, ustawienia i rozdzielacze są odczytywane. **Podglądy obiegów wygenerowane według 80 m są unieważniane i obliczane ponownie** przy dostępnym Pythonie oraz poprawnie wykonanych etapach pracy. Nie należy ich traktować jako gotowych wyników 100 m.

## 3. Kalibracja i podziałka „jak na mapie”

- Po pomyślnym skalowaniu nie ma stałych linii wymiarów X/Y ani wymiarów wybranego pokoju nad rysunkiem.
- Użytkownik może tymczasowo zaznaczyć „**Pokaż pomocnicze linie kalibracji oraz wymiary pomieszczeń**”.
- W prawym dolnym rogu rzutu umieszczono **dwuczęściową podziałkę liniową** z 0, wartością pośrednią i całkowitą.
- Dobór długości jest automatyczny (np. 0,5 m, 1 m, 2 m, 5 m), żeby kreska była czytelna na telefonie i komputerze.
- Po zoomie lub zmianie rozmiaru okna podziałka ponownie wylicza szerokość odcinka; **metry i powierzchnia pozostają bez zmian**.
- Po obrocie planu o 90° pozioma odległość na ekranie wykorzystuje **źródłową oś Y**, co uwzględnia skany ze skalą X różną od Y.
- Podziałka trafia również do eksportowanego SVG. Nie twierdzimy, że plik jest w standardowej skali wydruku 1:50 / 1:100: podziałka opisuje *bieżący widok fizyczny*, a wydruk i skalowanie przez drukarkę zależą od ustawień eksportu.

**Uwaga:** wymiar wpisany bezpośrednio w skan/zdjęcie pozostaje częścią oryginalnego obrazu i nie może być automatycznie usunięty bez ingerencji w podkład. Ukrywamy oznaczenia dodawane przez HeatLoop.

## 4. Widoczność obrysów

Obrys zaznaczonego pokoju został zmniejszony z 3,5 do **1,8** jednostki SVG, pozostałego do **1,1**; pola grzewczego z 4,3 do **1,85** dla aktywnego i 1,2 dla pozostałych. Zmniejszono też przezroczyste wypełnienie i rozmiary napisów w widoku roboczym. Rury pozostają na pierwszym planie. Te wartości są *wizualne* i nie zmieniają odległości rur od ścian.

## 5. Rozdzielacz i kierunek wyjścia rur

- `angle = 0 / 90 / 180 / 270` zapisywany do JSON v11;
- starszy JSON bez `angle` zostaje odczytany jako **0°**;
- symbol R1/R2 jest czerwonym prostokątem 76 × 38 jednostek źródła z dwoma punktami wyjścia;
- model poglądowych króćców wyznacza parę punktów w metrach w odległości osiowej 10 cm, obraca je o `angle` i przelicza na X/Y podkładu; obliczenia dojść rozpoczynają się i kończą w tych dwóch różnych punktach, zamiast w tym samym środku;
- nie odtwarzamy jeszcze fabrycznej geometrii króćców, odległości od ściany, rzeczywistych muf, zaworów, przejść ani trójwymiarowej drogi rury; **oznaczenie TEST jest obowiązkowe**.

Zapotrzebowanie wykonawcze: przypisanie zasilania/powrotu do konkretnych sekcji rozdzielacza i pełna kontrola kolizji wymaga kolejnego etapu.

## 6. Dane i bezpieczeństwo

- Plik `HeatLoop-Drawing-LAB`, **wersja 11**; oryginalny obraz i kalibracja w JSON.
- Import nie usuwa dotychczasowego projektu przy błędzie — działa przywrócenie poprzedniego stanu.
- Nowy projekt wymaga potwierdzenia utraty wprowadzonych danych.
- Kąty spoza 0/90/180/270 są odrzucane.
- Po zmianie wymiarów geometrycznych lub przyjętego limitu regeneracja wyników jest wymagana.
- Wersja eksperymentalna nadal nie kwalifikuje się do wykonania bez zatwierdzenia geometrii, promieni gięcia, kolizji i obliczeń hydraulicznych.

## 7. Scenariusze odbiorowe — do wykonania w przeglądarce

1. Otwórz projekt demonstracyjny JSON w `Ustawienia → Otwórz projekt`. Sprawdź obecność **2 pokojów, 3 pól i 2 rozdzielaczy** oraz podkładu.
2. Otwórz `Rysunek`, zweryfikuj podziałkę po prawej stronie. Wybierz jej odczyt przy zoomie 100%, 200%, 400% — długość i szerokość powinny odpowiadać rzeczywistym wymiarom.
3. Obróć plan o 90° w prawo i w lewo. Zweryfikuj, że przy zachowaniu kalibracji nie zmieniają się pola w m².
4. Włącz checkbox „Pokaż pomocnicze linie...”, a następnie wyłącz. Sprawdź czy opisy wymiarów nie zostają nad pętlami.
5. `Pokoje` — zaznacz trzeci pokój; `Pola grzewcze` — dodaj dwa rozłączne pola. Pierwsze nie może znikać po utworzeniu drugiego.
6. `Rozdzielacze` — wybierz R1, obróć o +90°, potem −90°; ikona powinna się obrócić, opis kąta zmienić.
7. `Pętle` — ustaw dla każdego pola inny rozstaw i przypisanie. Przelicz cały projekt. Długości powinny być liczone od osobnych poglądowych króćców rozdzielacza.
8. Zapisz JSON v11; otwórz go ponownie; sprawdź odczyt obrazu, pól, kąta rozdzielacza i preferowanych punktów.
9. Eksportuj SVG TEST w widoku technicznym; sprawdź podziałkę i widoczne oznaczenie „NIE PROJEKT WYKONAWCZY”.
10. Wczytaj starszy projekt JSON v10 — pokoje mają pozostać, ale podglądy pętli z limitem 80 m muszą zostać przebudowane.
11. Rozpocznij generowanie projektu, który nie ma rozdzielacza albo nie ma pola grzewczego — interfejs ma wskazać wymagany brak zamiast wymyślać przebieg.
12. Zweryfikuj działanie na **Windows Firefox, Android Chrome i iPhone Safari**.

## 8. Testy automatyczne i ograniczenia

GitHub Actions `HeatLoop Python LAB v1.1 checks` wykonuje testy JavaScript (składnia modułów, niezależna kalibracja, pasek mapy, UI, JSON, kąty i dojścia) oraz Python/Shapely (100 m, 90 m ostrzeżenie, prawidłowość geometrii, walidacja pól, obrót kierunku przepływu).

Nie są jeszcze zaimplementowane i zatwierdzone: prawidłowy ślimak we wszystkich kształtach L/T, dowolne ustawianie fizycznego S/K, globalne bezkolizyjne prowadzenie obu nitek wszystkich obiegów, realna gęstość przy rozdzielaczu i obliczenia hydrauliczne. Ograniczenia pozostają widoczne w specyfikacji v1.0.

**Link do danych demonstracyjnych:** `examples/projekt_demo_v11.json`.
