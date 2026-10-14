# HeatLoop B — prototyp z wyceną i doborem zasilania

Uruchom `index.html` przez lokalny serwer HTTP (np. `python -m http.server 8000`) i otwórz `http://localhost:8000/heatloop-b/` przy serwowaniu katalogu nadrzędnego. PDF.js wymaga dostępu do CDN.

## Zakładki
- Dane ręczne: pomieszczenia i szacunki długości rur.
- Praca z rysunku: rzut JPG/PNG/PDF, kalibracja, pomieszczenia i trasy.
- Wycena i zasilanie: liczba pętli, rura podłogowa, rozdzielacz, szafka +2 sekcje, 2 zawory, Eurokonus 2×liczba pętli, opcjonalna grupa pompowa (wyłączona domyślnie); dobór zasilania z ręcznym wyborem materiału (PP-R, Alpex, miedź, stal zaciskana), średnicy, długości zasilania i powrotu oraz cen.

W zakładce wyceny kliknij **Pobierz długość i moc z projektu**, aby użyć danych pomieszczeń. Dane wyceny zapisują się w pliku projektu JSON. Wycena może być eksportowana do CSV.

**Uwaga:** dobór średnicy uwzględnia przepływ i prędkość, nie uwzględnia strat ciśnienia, długości hydraulicznej instalacji ani pompy. Rzeczywiste średnice wewnętrzne, gabaryty szafek i dostępne liczby sekcji należy zweryfikować według katalogów producenta. Ceny to dane przykładowe. Wynik nie zastępuje projektu instalacji.

Strona startowa: po uruchomieniu widoczny jest uproszczony ekran z trzema kafelkami (Dane ręczne, Praca z rysunku, Wycena i zasilanie). Nawigacja Start pozwala do niego wrócić.

## Wersja zintegrowana — testy
Poprawiono wprowadzanie wartości z przecinkiem, puste pola, walidację wyceny i ceny edytowane bez utraty fokusu. Generator PDF korzysta z biblioteki zewnętrznej i wymaga dostępu do internetu. Udostępnianie przez pocztę odbywa się przez systemowy panel udostępniania; nie jest automatyczną wysyłką z serwera. Dobór rur ma charakter orientacyjny.

Logo HeatLoop: heatloop-logo.webp; strona startowa wyświetla logo lokalnie, również offline po pobraniu zasobów.
