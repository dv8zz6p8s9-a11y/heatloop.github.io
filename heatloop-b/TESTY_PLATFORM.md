# HeatLoop — macierz testów wydania

Stan: scenariusze przygotowane, **niezaliczone** do czasu uruchomienia na wskazanych urządzeniach. Testy wymagają sprawdzenia na rzeczywistych przeglądarkach.

## Wymagane środowiska

| Platforma | Przeglądarka | Status |
|---|---|---|
| iOS / iPadOS | Safari | Do wykonania |
| iOS / iPadOS | Chrome | Do wykonania |
| Android | Chrome | Do wykonania |
| Android | Samsung Internet | Do wykonania |
| Android | Firefox | Do wykonania |
| Windows 10/11 | Edge | Do wykonania |
| Windows 10/11 | Chrome | Do wykonania |
| Windows 10/11 | Firefox | Do wykonania |

## Scenariusze krytyczne

1. Wejdź do `heatloop-b/index.html`; wybierz zakładkę Praca z rysunku. Przed wyborem systemu narzędzia powinny być niedostępne.
2. Wybierz każdy z czterech systemów: grzejniki, podłogowe mokre, podłogowe frezowane, mieszany. W mieszanym zmieniaj system pomieszczenia.
3. Wczytaj JPG, PNG i jednostronicowy PDF. Skalibruj odcinek 2 m. Zweryfikuj prawidłowość pola prostokąta 4 × 5 m (20 m²).
4. Dodaj trzy pomieszczenia: grzejnikowe 20 m², mokre 15 m², frezowane 10 m², rozstaw 15 cm. Suma szacunkowej rury podłogowej powinna wynosić około 183,33 m (bez dojść); grzejnikowe nie zwiększa ilości rury.
5. Dodaj grzejnik w obrębie pomieszczenia grzejnikowego. Sprawdź, że punkt poza obrysem jest odrzucony.
6. Dla 20 m² × 70 W/m² oczekuj 1400 W zapotrzebowania. Grzejnik katalogowy 1500 W przy 55/45/20°C powinien zostać oznaczony jako wystarczający, a 1000 W jako za mały. Sprawdź komunikaty.
7. Zmień typ ogrzewania istniejącego pomieszczenia; sprawdź zmianę sumy rur.
8. Zapisz projekt JSON, przeładuj aplikację, otwórz projekt. Sprawdź obrysy, technologie, grzejniki, rury i tło.
9. Eksportuj CSV i PDF. Sprawdź polskie znaki, ilości, zaokrąglenia i brak fikcyjnych cen dostawców.
10. Uruchom PWA z ikony, sprawdź instalację i podstawowe zachowanie offline. Nie zakładaj pełnej obsługi PDF offline, jeśli biblioteki są pobierane z CDN.
11. Testuj dotyk i gesty na telefonach, kliknięcia myszy na Windows, skalowanie strony, obrót ekranu i pola formularzy.
12. Sprawdź błędne wartości (0 m², ujemne temperatury, puste pola, wadliwy JSON), brak internetu i odrzucony import pliku.

## Kryterium ukończenia

Wydanie można oznaczyć jako sprawdzone dopiero po zaliczeniu scenariuszy krytycznych na wszystkich wymaganych platformach i naprawie błędów blokujących. Obliczenia projektowe wymagają dodatkowej weryfikacji przez kompetentnego projektanta instalacji; przybliżone W/m² i długości rur nie zastępują obliczeń strat ciepła ani hydrauliki.
