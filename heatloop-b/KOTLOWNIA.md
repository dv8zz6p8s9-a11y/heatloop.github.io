# Kotłownia — wstępny dobór, schemat funkcjonalny i budżet

Nowa zakładka łączy dane domu, rodzaj źródła, obiegi, CWU, wyposażenie i wspólną
wycenę. Używa nazw „naczynie przeponowe CO”, „naczynie przeponowe CWU” oraz
„grupa bezpieczeństwa naczynia przeponowego / instalacji”. Nie używa nazwy marki
jako nazwy elementu.

## Podstawa mocy i zapas 15%

Podstawą jest wpisane obliczeniowe zapotrzebowanie z OZC albo jawnie oznaczony
szacunek z pomieszczeń: suma `powierzchnia × obciążenie W/m²`. Nominalne moce
zamontowanych grzejników nie określają strat ciepła domu i nie są do nich dodawane.
Moduł nie potwierdza wydajności cieplnej posadzki.

Zapas jest edytowalny (początkowo 15%). Wynik `moc CO × (1 + zapas/100)` jest
oddzielnym wariantem porównawczym, nie automatycznie dobraną mocą urządzenia.
Przykład: potrzeby domu 8 kW dają wariant 9,2 kW, niezależnie od tego, że moc
zamontowanych grzejników może wynosić 12 kW. Nie liczymy wtedy 12 × 1,15.

Dobór konkretnego źródła wymaga dokumentacji i warunków projektowych: temperatury
zewnętrznej i zasilania, modulacji, CWU, strategii biwalentnej oraz charakterystyki
urządzenia. Formularz przechowuje model, moc w warunkach projektowych i moc minimalną;
nie posiada zweryfikowanej bazy modeli ani charakterystyk producentów.

Przepływ CO dla wody: `moc_CO_W / (1,163 × ΔT)` w l/h. To orientacyjna wartość
wynikająca z obciążenia, nie dobór pompy lub sprzęgła i nie nastawa zaworu.

## Automatyczne zestawienie zakresu

- Gaz: kocioł, system powietrzno-spalinowy, przyłącze gazowe i kondensat.
- Ekogroszek, pellet, pellet+drewno, drewno zgazowywane: źródło, wybrany wariant
  komina, ochrona powrotu i zabezpieczenie przegrzania według DTR.
- Pompa powietrze–woda: jednostka, podstawa, odpływ odszraniania, ochrona przed
  zamarzaniem i przyłącze elektryczne. Dla gruntowej zamiast elementów jednostki
  zewnętrznej pojawia się dolne źródło do osobnego projektu.
- Hybryda: pompa i gaz, z gazowym systemem spalinowym; bez automatycznego sumowania mocy.
- Układ bezpośredni, sprzęgło, sprzęgłorozdzielacz, bufor lub wymiennik.
- Grupy z pompą i mieszaniem, gdy temperatura źródła jest wyższa od wymaganej
  dla obiegu, albo grupy bez mieszania. Liczba grup jest parametrem instalatora;
  automat proponuje po jednej dla obecnego rodzaju odbiorników, nie jedną na pokój.
- Naczynia i grupy bezpieczeństwa CO/CWU są osobne. Układ otwarty kotła ma
  odpowiednie otwarte naczynie i zakres zabezpieczeń. Wariant otwarty z wymiennikiem
  uwzględnia również wyposażenie zamkniętej strony wtórnej.
- Separator magnetyczny, odpowietrzanie, armatura pomiarowa i odcinająca,
  napełnianie i przygotowanie wody, rury, izolacja, połączenia, montaż i automatyka.

Zestawy nie określają dokładnych liczb złączek, średnic, wydajności pomp ani parametrów
zabezpieczeń. Część pozycji jest zestawem do pomiaru i indywidualnego doboru.
Rury i izolacja mają ilości po wpisaniu zmierzonej długości. Liczba „już w zestawie”
odejmuje wyposażenie wbudowane lub dostarczone, zapobiegając podwójnej wycenie.
Pompy obiegów są częścią grup, pompa źródła jest osobną pozycją do sprawdzenia.
Po powiązaniu kotłowni ogólna opcja grupy pompowej w starej wycenie jest wyłączana.

## CWU i zamykanie stref

CWU: bez przygotowania, zasobnik albo przepływowo (gaz). Dla zasobnika:
`energia_kWh = litry × 1,163 × (T_zasobnika − T_zimnej) / 1000`.
Średnia moc nagrzewania to energia podzielona przez czas w godzinach, bez strat.
Nie dodajemy jej automatycznie do szczytowej mocy CO. Formularz nie wyznacza
pojemności z samej liczby mieszkańców; potrzeby szczytowe i wężownica wymagają doboru.

Instalator może wpisać wymagany przepływ i czynną pojemność z DTR oraz wartości
dostępne po zamknięciu stref. Znany niedobór przepływu blokuje powiązaną wycenę.
Niedobór pojemności wymaga odpowiednio czynnego bufora lub zmiany rozwiązania.
Sama pojemność bufora nie dowodzi zapewnienia przepływu. Dla kotła na drewno
nie dobieramy bufora prostym przelicznikiem l/kW.

## Grafika i zachowanie

Interfejs ma kafelki źródeł z ikonami SVG, karty trzech wyników, rozwijane sekcje
parametrów, funkcjonalną mapę systemu i zestawienie materiałów. Układ dostosowuje
się do wąskiego ekranu. Mapa pokazuje zależności, nie miejsca montażu armatury.

Konfiguracja zapisuje się w projekcie JSON, ceny we wspólnym zapisie wyceny.
Domyślne ceny wynoszą 0 i wymagają uzupełnienia. Nie ma fikcyjnego cennika.
Wstępne zestawienie ma CSV i może wejść do wspólnej oferty HTML/PDF. Brakujące
ceny blokują końcową ofertę; błędne dane kotłowni blokują powiązaną wycenę.
Starsze projekty otwierają się z niepowiązaną kotłownią.

## Źródła i ograniczenia

Sprawdzono 15.10.2026:
- https://www.vaillant.pl/porady/centrum-pomocy/dobor-wielkosci-pompy-ciepla-jakiej-wielkosci-pompa-ciepla-jest-mi-potrzebna/
- https://www.caleffi.com/pl-pl/produkty/grupy-bezpieczenstwa-dla-cwu
- https://www.caleffi.com/pl-pl/produkty/grupy-bezpieczenstwa
- https://reflex-winkelmann.com/pl/produkty/Przeponowe%20naczynia%20wzbiorcze
- https://www.defro.pl/produkty/gamma/
- https://www.gov.pl/web/klimat/uchwaly-antysmogowe

To wstępny konfigurator zakresu i budżetu, nie projekt instalacji. Pojemności naczyń,
ciśnienia zabezpieczeń, przewody spalinowe, ochrona pożarowa, wentylacja, strefy
montażowe pomp, przepisy lokalne, średnice i straty ciśnienia wymagają sprawdzenia.
Moduł nie uznaje automatycznie paliwa lub kotła za legalny w danej lokalizacji.

Testy: 28 przypadków obliczeniowych i doboru zakresu oraz integracja JSDOM obejmująca
grafikę SVG, źródła, zapotrzebowanie, ceny, wyposażenie wbudowane, zapis/odczyt,
CSV, ofertę HTML, hydraulikę stref i OZC. Uruchom `npm ci` oraz `npm test` w heatloop-b.

Sprawdzono też działanie w Chromium przy szerokościach 1440 i 390 px: wybór pompy, OZC, CWU, bufor, przeliczenia, schemat SVG i połączenie z wyceną. Bez błędów JavaScript i bez wyjścia strony poza szerokość ekranu; tabela wyposażenia przewija się we własnym obszarze. Obejrzano zrzuty obu układów. Test nie zastępuje sprawdzenia Safari na rzeczywistym iPhonie; renderowanie końcowego PDF pozostaje do sprawdzenia.


## Wybór producenta i modelu — 16.10.2026

Dodano listy rodzin SAS: EFEKT, SPARK, COMPACT, SOLID i SOLID (DM) dla groszku; MINI ECO PLUS, BIO COMPACT, BIO COMPACT PLUS, BIO EFEKT, BIO EFEKT PLUS, BIO SPARK, BIO SOLID i BIO SOLID (DM) dla pelletu; BIO GREEN PLUS dla pelletu i zgazowania drewna. Dla drewna dostępne są GREEN PLUS i VARMO PLUS.

Źródło nazw: https://www.sas.busko.pl/pl/produkty — sprawdzono 16.10.2026. Są to rodziny modeli, bez automatycznego doboru wersji mocy, cen ani wyposażenia wbudowanego.

Gaz: De Dietrich, Immergas, Bosch, Viessmann i „Inny — wpisz własną nazwę”. Model gazowy wpisuje instalator. Typy kotłów: jednofunkcyjny i dwufunkcyjny. Dla jednofunkcyjnego osobno wybiera się zasobnik CWU lub brak CWU. Zasobnik można dokupić osobno albo oznaczyć jako sprzedawany w zestawie z kotłem. Przy pakiecie cena źródła obejmuje kocioł i zasobnik; zasobnik jest oznaczony jako już w zestawie, więc nie zostaje wyceniony drugi raz. Osprzęt CWU wymaga osobnego sprawdzenia. Dwufunkcyjny przygotowuje CWU przepływowo.

Wybór producenta i modelu oraz wariantu gazowego zapisuje się w projekcie JSON. Nazwa trafia do wyceny, oferty i CSV. Stare projekty zachowują ręczną nazwę i ustawienie CWU. Zmiana producenta lub rodziny kotła czyści model, moce i odliczenia wyposażenia wbudowanego, które wymagają ponownego sprawdzenia. Ceny netto pozostają wpisywane przez instalatora.


## Pompy ciepła i hydraulika — uzupełnienie 16.10.2026

Katalog rozszerzono o Panasonic, Mitsubishi Electric i Vaillant z rzeczywistymi klasami mocy, a hydraulikę o sprzęgła 40/55/70 kW, sprzęgłorozdzielacze na 2 i 3 obiegi oraz ręczny wybór 1/2/3 miejsc dla własnego rozwiązania. Dostępne są grupy pompowe WOMIX i AFRISO z pompami, z mieszaniem i bez. Wyposażenie nie jest liczone podwójnie; WOMIX SL 10 jest osobną pozycją, a ARM w wybranej grupie AFRISO jest w komplecie.

Sprawdzane są liczba obiegów, moc katalogowa i przepływ źródła przy zadanym ΔT. Modele CPN MINI i CPN 70 mają moce katalogowe przy ΔT 20°C; przepływ wynika z mocy i zadanego ΔT, a nie z samej nazwy urządzenia. Dopasowanie rozstawu nie zastępuje sprawdzenia gwintów, adapterów i charakterystyki pomp.

Pełny zakres, źródła danych i procedura wdrożenia: [AKTUALIZACJA_2026-10-16.md](AKTUALIZACJA_2026-10-16.md).
