# Numeracja HeatLoop

Zasada zatwierdzona przez użytkownika 16.10.2026:

| Rodzaj wydania | Oznaczenie dla użytkownika | Techniczna wersja pakietu |
|---|---|---|
| Ta duża aktualizacja | 0.2 | 0.2.0 |
| Pierwsza drobna poprawka/dodatek | 0.21 | 0.2.1 |
| Druga drobna poprawka/dodatek | 0.22 | 0.2.2 |
| Następna duża aktualizacja | 0.3 | 0.3.0 |

Oznaczenia użytkowe są tekstem. Nie zamieniaj ich na liczby dziesiętne ani nie sortuj numerycznie. Techniczny format pakietu wynika z wymagań npm i nie zastępuje oznaczenia widocznego w HeatLoop. Szczegóły numeracji po większej liczbie drobnych poprawek nie zostały jeszcze ustalone — nie awansuj automatycznie do 0.3 po wyczerpaniu jednej cyfry.

`release.mjs` jest wspólnym źródłem wersji aplikacji i bazy wiedzy dla modułów. Przy każdym wydaniu zmień etykietę, family/revision i packageVersion, zsynchronizuj package.json oraz główny wpis package-lock.json, widoczne nagłówki, formularz zgłoszeń, manifest PWA i panel zmian. Odśwież manifest podmiany i uruchom test spójności wydania.

Numer formatu projektu JSON pozostaje **1**. Wersja aplikacji jest zapisywana osobno jako appVersion. Numer wydania instrukcji PDF **1.2** i archiwalne dzienniki BETA **0.1** pozostają historycznymi oznaczeniami dokumentów; nie zmieniaj ich przez masową zamianę tekstu. Nie zmieniaj numerów zależności npm.

Numer 0.2 w tej gałęzi oznacza przygotowane wydanie. Publiczne udostępnienie następuje dopiero po publikacji; sam zapis kodu nie potwierdza, że testerzy już używają 0.2.

Poprawki wykonywane przed opublikowaniem przygotowywanego 0.2 pozostają częścią 0.2. Numer 0.21 otrzyma pierwsza drobna aktualizacja po tym wydaniu.
