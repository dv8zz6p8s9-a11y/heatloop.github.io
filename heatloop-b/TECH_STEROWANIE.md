# Dobór sterowania strefowego TECH — pierwsza wersja BETA

W zakładce **Wycena i zasilanie** włącz **Dodaj sterowanie do wyceny**.
Pobierz pomieszczenia z projektu albo dodaj je ręcznie. Import pomija grzejniki.
Wpisz liczbę pętli dla każdego pomieszczenia i nazwę strefy. Identyczna nazwa
strefy oznacza jeden wspólny regulator. Nazwy są porównywane z uwzględnieniem
wielkości liter, po usunięciu spacji na końcach.

## Obsługiwane zestawy

- Sterowniki: L-4X Wi-Fi lub L-X Wi-Fi. Oba mają wbudowane Wi-Fi, bez osobnego Wi-Fi RS.
- Domyślna komunikacja regulatorów: bezprzewodowa R-8b. Opcjonalnie przewodowe R-X TECH SBUS.
- W obu przypadkach przewodowe siłowniki STT-230/2, 230 V NC; wybór M30×1,5 lub M28×1,5.
- Dobór automatyczny: L-4X do 4 stref podłogowych, L-X dla 5–8. To wybór według pojemności bez rozszerzeń, nie optymalizacja ceny.
- Ręczny wybór L-4X powyżej 4 stref dodaje ML-4X Wi-Fi, rozszerzający do 8 stref podłogowych.
- Jedna listwa główna i jeden rozdzielacz; do 8 stref. Limit aplikacji to 4 siłowniki na strefę, niezależny od deklarowanych maksymalnych możliwości sprzętu.
- Starsze konfiguracje migrują do nowego doboru; zapisany wybór dodatkowego Wi-Fi RS jest pomijany. Ceny nowego sprzętu zaczynają się od aktualnego zapisu katalogowego.

Suma pętli musi być zgodna z polem liczby pętli w wycenie. Ręczne przypisania można zastąpić powiązaniem z zakładką „Pętle i rozdzielacz”, która proponuje podział z uwzględnieniem rozstawu i dojść. Po powiązaniu liczby i strefy pochodzą z planu pętli. Zmiana pomieszczeń po imporcie blokuje wycenę do
ponownego pobrania i sprawdzenia przypisań. Niepoprawna konfiguracja nie może
zniknąć z oferty po cichu: blokuje wycenę i eksport.

Konfiguracja jest zapisywana w projekcie JSON. Starsze projekty otwierają się z
opcją wyłączoną. Sprzęt trafia do CSV oraz tabeli używanej przez ofertę PDF i druk.
Ceny można edytować; cena katalogowa stanowi wartość początkową. Podsumowanie
sterowania pokazuje netto i brutto przy 23%. Oferta stosuje VAT wskazany przez
instalatora, który odpowiada za jego prawidłowy wybór.

## Źródła i aktualizacja

Sprawdzono 15.10.2026. Oficjalny link „Cenniki produktów TECH” kierował do:
https://www.techsterowniki.pl/!uploads/cennik/CennikTECH_PL_09_2026_www.pdf

Plik ma w nazwie 09_2026, ale na okładce podaje „aktualizacja 04.2026”. Dlatego
interfejs używa daty sprawdzenia, a nie deklaracji daty obowiązywania cennika.
Wybrane pozycje: strony drukowane 10–13 i 22–24. Ceny netto; VAT katalogowy 23%.
Zapis cen jest statyczny. Aktualizację należy zweryfikować i wprowadzić w
`tech-controls.mjs`. Nie wdrożono automatycznego pobierania cen ani integracji API.

Dokumentacja do weryfikacji zgodności:
- https://www.techsterowniki.pl/p/l-4x-wi-fi
- https://www.techsterowniki.pl/p/l-x-wi-fi
- https://www.techsterowniki.pl/manuals/l-4x-wifi-1
- https://www.techsterowniki.pl/manuals
- https://www.techsterowniki.pl/konfigurator-systemow/pl/typ

Nie kopiowano opisów marketingowych ani grafik. Zestawienie nie stanowi informacji
o partnerstwie z producentem ani projektu elektrycznego. Dobór gwintu, skoku,
obciążeń, rozruchu, okablowania i współpracy ze źródłem ciepła wymaga weryfikacji.
Przewody, robocizna sterowania i dodatkowe zabezpieczenia pompy nie są wyceniane
przez ten moduł. Nie łączy się on z fizycznymi urządzeniami.

## Testy

`node heatloop-b/tests/calculations.test.cjs`

`node heatloop-b/tests/tech-controls.test.mjs`

Przed publikacją sprawdzić na telefonie: oba warianty, wspólną strefę kilku
pomieszczeń, sumę pętli, limity, zapis i odczyt JSON, zmiany projektu, CSV oraz PDF.

Sprawdzono także interakcje w środowisku JSDOM: start aplikacji, włączenie/wyłączenie opcji, oba warianty, edycję cen, zawartość oferty HTML, CSV, zapis/odczyt JSON, starszy projekt, import pomieszczeń oraz blokadę nieaktualnych przypisań. 13 istniejących i 16 nowych testów obliczeniowych zakończyło się pomyślnie. Pełny test wizualny i rzeczywistego renderowania PDF pozostaje do wykonania: w środowisku nie było przeglądarki, a pobranie Chromium zwracało niekompletne archiwum.
