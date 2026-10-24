# HeatLoop — migracja logiki do Python (etap 1)

Ten katalog jest **izolowanym prototypem**. Nie zastępuje HeatLoop BETA ani generatora przeciwprądowego.

## Cel

Zachować interfejs HTML/CSS/JS/PWA dla Windows, Android i iOS; przenosić sprawdzone obliczenia do biblioteki Python. Po testach zgodności w Pythonie ocenić działanie tej samej biblioteki przez Pyodide w Web Workerze. Nie zmieniać produkcji przed testami urządzeń.

## Zasady

- Ślimak przeciwprądowy musi mieć jedną ciągłą trasę zasilania i powrotu.
- Maksymalna długość jednej pętli to **80 m**, łącznie z rzeczywistymi dojściami do rozdzielacza.
- Odstęp od ściany mierzymy do **zewnętrznej krawędzi** rury; oś = odstęp + połowa średnicy.
- Dozwolone rozstawy osiowe: **10, 12,5, 15, 20 cm**.
- Ominięcie fragmentu zbyt wąskiego nie zwalnia z kontroli promienia gięcia, przecięć i pokrycia pozostałej powierzchni.
- Brak pełnego sprawdzenia = brak statusu "gotowy do montażu".

## Zakres etapu 1

`heatloop_core.geometry` tylko wstępnie waliduje wielokąt, położenie osi trasy, samoprzecięcia i całkowitą długość. **Nie generuje ślimaka, nie potwierdza minimalnego promienia ani równomiernego rozstawu.** To zostanie dopiero zbudowane i przetestowane.

## Testy

Z katalogu `python-core`:

```sh
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
```

## Kolejne moduły do migracji

1. Generator rur i obliczenia ogrzewania podłogowego, geometria L, kontrola pokrycia i łuków.
2. Walidacja rysunku, kalibracja skali i współrzędne pomieszczeń (interakcje pozostaną w JS).
3. Bilans mocy, podział pętli, długości doprowadzeń i rozdzielacze.
4. Dobór kotłowni i obliczenia hydrauliczne.
5. Kosztorys i reguły ilości materiałów.
6. Sterowanie strefowe i eksport danych — tylko te reguły, które korzystają na jednej bibliotece.

Przed przeniesieniem każdego modułu: porównanie wyniku Python/JS na tym samym zestawie danych i testy regresji. Bez pośpiesznego wyłączania działających funkcji.
