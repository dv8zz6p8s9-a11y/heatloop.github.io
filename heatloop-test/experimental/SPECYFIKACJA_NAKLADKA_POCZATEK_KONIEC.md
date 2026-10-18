# HeatLoop — doprecyzowanie nakładki ślimaka (2026-10-18)

## Zasada
Nakładka reprezentuje **jeden gotowy, ciągły obieg ślimakowy** z dwiema końcówkami rury. Instalator dopasowuje wzór do pomieszczenia; nie rysuje swobodnie ślimaka od zera. Po dopasowaniu zachowana jest topologia ślimaka i wymagany jest ponowny test geometrii/rozstawu.

## Operacje edycyjne
- **Obróć nakładkę**: obrót o dowolny kąt wokół wskazanego środka, zachowujący topologię.
- **Zaznacz początek**: wskazanie strefy wyjścia obiegu. Dwie końcówki — zasilanie i powrót — są blisko siebie, ale NIE są połączone; nie jest to zamknięta pętla rury.
- **Odwróć kierunek**: zmiana orientacji / zwrotu przebiegu przy zachowaniu ogólnego wzoru; po operacji przeliczyć geometrię i wyjścia.
- **Przesuń / dopasuj**: deformacja przez uchwyty, bez dowolnego rysowania nowego układu; w razie niemożliwości zachowania rozstawu pokaż błąd, a nie zaakceptuj niewłaściwy wzór.
- **Dołącz do rozdzielacza**: oddzielne polilinie od obu końcówek przez zatwierdzony otwór drzwiowy; obie długości wliczone do obiegu.

## Ważne rozróżnienie
Określenie „początek jest też końcem” oznacza **wspólną strefę wyjścia**, a nie jeden wspólny punkt hydrauliczny ani fizycznie zamknięty pierścień. Nakładka nie może być zapisana jako poprawny obieg bez dwóch odrębnych końcówek i ciągłego przebiegu między nimi.

## Status implementacji
Wcześniejszy `spiral-overlay.mjs` jest tylko prototypem. Jego `reverseDirection` odwraca kolejność punktów, a nie pełną handedness geometrii; `makeOverlay` nie tworzy poprawnego ślimaka z powrotem. Nie używać do projektu wykonawczego przed przebudową i testami.
