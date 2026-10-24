# HeatLoop — rejestr sugestii usprawnień

**Utworzono:** 2026-10-24  
**Zasada projektu:** najpierw skompletowanie działających modułów projektowania instalacji, potem usprawnienia interfejsu i ergonomii.  
**Status pozycji w tym dokumencie:** propozycje odłożone na później, **nie oznaczają funkcji już wdrożonych**.

Ten plik jest **oddzielnym rejestrem sugestii**, a nie listą obowiązkowych zmian na bieżący etap. Dopisujemy tu nowe pomysły i uwagi z testów. Nie modyfikujemy działających narzędzi wyłącznie z powodu sugestii, jeśli utrudniłoby to ukończenie generatora.

## Najpierw kompletujemy funkcjonalność — nie jest to lista poprawek UX

W bieżących pracach pierwszeństwo mają:
1. Poprawna wizualizacja pętli przeciwprądowych dla pól prostokątnych, L i nieregularnych, z kontrolą promieni, odstępu od ścian, rozstawu oraz przecięć.
2. Rysowanie i przypisywanie wielu rozdzielaczy do pętli na jednym rzucie.
3. Rysowanie zasilania i powrotu z każdego obiegu do wskazanego rozdzielacza; możliwość ręcznej korekty przebiegu.
4. Rzetelne obliczenie długości **każdej** pętli: część grzewcza + rzeczywiste dojście i powrót; limit **80 m**.
5. Spójność parametrów na rysunku, w silniku Python, w zestawieniu materiałów i w eksporcie projektu.
6. Testy geometryczne, testy w przeglądarce i na urządzeniach Android/iOS, zanim dany moduł uznamy za gotowy.

**Uwaga:** wstępny szacunek długości lub szkic bez pełnej walidacji nie jest gotowym projektem montażowym.

## Odłożone sugestie ergonomii i interfejsu

| ID | Sugestia | Problem, który rozwiązuje | Priorytet po ukończeniu projektu | Status |
| --- | --- | --- | --- | --- |
| UX-001 | **Jednoczesna obsługa pomieszczenia i jego pętli** w jednym panelu lub widoku dzielonym | Częste przełączanie zakładek „Pokoje” ↔ „Pętle” jest uciążliwe | Wysoki | Odłożone |
| UX-002 | **Kliknięcie pola grzewczego na rysunku automatycznie wybiera pokój i pętlę**, z natychmiastowym dostępem do rozstawu i rozdzielacza | Trzeba odszukać właściwą pętlę na liście | Wysoki | Odłożone |
| UX-003 | **Stała mini-lista pomieszczeń i pętli** przy rzucie, z szybkim przełączaniem bez przewijania | Duże projekty wymagają wielokrotnego szukania elementów | Wysoki | Odłożone |
| UX-004 | **Pasek narzędzi kompaktowy na telefonie** (z możliwością zwinięcia i odkrycia większej części rysunku) | Nadmiar przewijania w pionie | Wysoki | Odłożone |
| UX-005 | **Panele rozwijane i zapamiętywanie aktywnej sekcji** po powrocie do projektu | Powtarzanie nawigacji po otwarciu pliku | Średni | Odłożone |
| UX-006 | **Szybkie kopiowanie ustawień pętli** do innych pól z możliwością późniejszej niezależnej edycji | Przy wielu podobnych obiegach ręcznie wpisujemy te same parametry | Średni | Odłożone |
| UX-007 | **Kolor pętli, numer pętli i oznaczenie rozdzielacza** zawsze widoczne i jednakowe na rysunku i na liście | Utrudniona identyfikacja obiegów | Wysoki | Odłożone |
| UX-008 | **Podświetlenie zasilania i powrotu** wybranej pętli, przygaszenie innych tras | Nakładające się dojścia utrudniają kontrolę rysunku | Wysoki | Odłożone |
| UX-009 | **Usprawnione gesty na Androidzie i iPhonie**: niezawodne przesuwanie, przybliżanie wokół dotknięcia, brak przypadkowego stawiania punktu | Precyzyjna edycja planu na telefonie | Wysoki | Odłożone |
| UX-010 | **Wygodniejsze cofanie / ponawianie operacji** dla obrysów, pętli, rozdzielaczy i dojść, z historią zmian | Konieczność ponownego rysowania po błędzie | Średni | Odłożone |
| UX-011 | **Pokazywanie wymiaru i kąta edytowanego odcinka na żywo** | Trudniejsza precyzyjna korekta punktów | Średni | Odłożone |
| UX-012 | **Czytelne ostrzeżenia bez blokowania pracy**: długość ponad 80 m, brak przypisanego rozdzielacza, niezweryfikowana geometria | Łatwo przeoczyć stan obiegu | Wysoki | Odłożone |
| UX-013 | **Niezależne warstwy widoczności**: podkład, obrysy pokoi, pola grzewcze, pętle, dojścia, rozdzielacze, siatka | Zatłoczony rysunek przy większej instalacji | Średni | Odłożone |
| UX-014 | **Lista zadań i błędów wymagających uwagi** przed eksportem | Trudno wychwycić wszystkie problemy w dużym projekcie | Średni | Odłożone |
| UX-015 | **Skróty klawiaturowe na komputerze** i duże uchwyty edycji na telefonie | Różne potrzeby interakcji desktop / mobile | Niski | Odłożone |

## Późniejsze usprawnienia silnika i generowania tras

Te propozycje rozwijają **gotowy** silnik, ale nie zastępują wymaganego teraz poprawnego działania:

| ID | Sugestia | Priorytet później | Status |
| --- | --- | --- | --- |
| ALG-001 | Inteligentniejsze wyznaczanie punktu początku/końca pętli względem wybranego rozdzielacza | Wysoki | Odłożone |
| ALG-002 | Propozycje kilku wariantów dojścia i wybór najkorzystniejszej trasy | Średni | Odłożone |
| ALG-003 | Automatyczna optymalizacja tras wielu dojść pod kątem kolizji i ich długości | Wysoki | Odłożone |
| ALG-004 | Porównanie wariantów rozstawu dla danej pętli: długość, pokrycie i rezerwa do 80 m | Średni | Odłożone |
| ALG-005 | Automatyczne raportowanie różnicy między powierzchnią pokoju a ogrzewaną | Średni | Odłożone |
| ALG-006 | Automatyczne wykrywanie obszarów bez pokrycia i wyświetlanie ich na rzucie | Wysoki | Odłożone |

## Zasady dopisywania nowych propozycji

1. Dodaj kolejny numer `UX-016` / `ALG-007` albo nową kategorię.
2. Zapisz **co przeszkadza lub co poprawić**, a nie sam pomysł technologiczny.
3. Oddziel sugestię od błędu, który uniemożliwia pracę: **błąd blokujący realizujemy od razu**.
4. Nie oznaczaj propozycji jako „Gotowe”, dopóki wdrożenie i test nie zostały potwierdzone.
5. Przeniesienie sugestii do bieżącego zakresu prac wymaga świadomej decyzji po ukończeniu kluczowych funkcji.

## Dziennik decyzji

- **2026-10-24:** Ustalono priorytet na skompletowanie projektu HeatLoop. Usprawnienia UI i ergonomii są zbierane osobno i realizowane później.
- **2026-10-24:** Zapisano uciążliwość częstego przełączania między „Pokojami” i „Pętlami” (UX-001–UX-003).
- **2026-10-24:** Zapisano problem nadmiernego przewijania strony na telefonie oraz propozycję dalszego upraszczania paneli (UX-004–UX-005).
