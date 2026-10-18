# HeatLoop — generator pętli v2: założenia i testy

Status: projekt od podstaw; brak integracji z publiczną aplikacją.

## Geometria
1. Jeden obieg to jedna **otwarta**, ciągła krzywa od zasilania do powrotu; oba końce sąsiadują w strefie wyjścia, ale nie łączą się hydraulicznie.
2. Rzut pokoju to wielokąt; obszar roboczy powstaje po odsunięciu od ścian. Otwory drzwiowe są jawnie zdefiniowanymi portalami.
3. Dla prostokąta punkt przecięcia przekątnych jest punktem odniesienia środka; nie narzucamy go jako punktu każdego fragmentu rury. Centralny nawrót jest **S-podobny**, styczny do toru dochodzącego i wychodzącego.
4. Generator wyznacza przeplatające się tory w rozstawie nominalnym, a następnie łączy je łukami o promieniu co najmniej dopuszczalnym dla wybranej rury. Nie generuje osobnych zamkniętych prostokątów.
5. Zmiana rozmiaru pomieszczenia, rozstawu, szerokości lub wysokości regeneruje geometrię, a nie skaluje rur anisotropowo.
6. Obrót i przesunięcie są transformacjami sztywnymi; odbicie lustrzane zmienia handedness. Punkt wyjścia dobiera instalator, trasy zasilania i powrotu prowadzone osobno przez drzwi do rozdzielacza.
7. Długość zasilania + długość nawrotu i zwojów + długość powrotu stanowią długość całkowitą. Podział na obiegi dopiero po naciśnięciu „Ułóż pętle”; limit domyślny 100 m, 100–120 m wyłącznie po zatwierdzeniu.

## Kryteria akceptacji
- Dwa końce i dokładnie jedna ciągła ścieżka; brak samoprzecięć i odcinków o zerowej długości.
- Styczność G1 na wszystkich połączeniach; promień gięcia >= minimalnego dla materiału rury.
- Kontrola odległości do ścian i pomiędzy nieprzylegającymi odcinkami, z tolerancją technologiczną.
- Obrót i przesunięcie nie zmieniają długości; dwukrotne odbicie odtwarza pierwotny kształt.
- Dla różnych proporcji pomieszczeń (kwadrat, wąski prostokąt, kształt L) brak samoprzecięć; gdy geometria jest niewykonalna, komunikat zamiast fałszywego wyniku.
- Zgodność długości z numerycznym całkowaniem łuków i ręcznymi przypadkami kontrolnymi.
- Testy dotykowe na iOS i Android: wybór, dodanie, usunięcie, płynny obrót, przesunięcie, regeneracja po zmianie rozmiaru.
- Nie podawać ilości materiału ani wyceny z geometrii niespełniającej walidacji.

## Etapy
A. Model odcinków i łuków + testy przecięć i styczności.
B. Generator jednej ścieżki dla prostokąta z centralnym nawrotem.
C. Portal drzwi, dojścia i rozdzielacz.
D. Wielokąty i podział na obiegi.
E. Edytor mobilny, testy porównawcze i integracja.

Dotychczasowe shape() i osobna fioletowa krzywa w edytorze demo są wyłącznie historią prototypowania — nie są podstawą v2.
