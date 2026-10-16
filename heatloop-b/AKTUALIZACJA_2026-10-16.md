# HeatLoop — aktualizacja nocna 16/17.10.2026

Okno publikacji: 16.10.2026 godz. 23:00 – 17.10.2026 godz. 05:00, Europe/Warsaw.
Zmiany przygotowane w PR #7: https://github.com/dv8zz6p8s9-a11y/heatloop.github.io/pull/7

## Zakres

- Kotły SAS: 5 rodzin na groszek, 8 na pellet, BIO GREEN PLUS na pellet i zgazowanie drewna, GREEN PLUS i VARMO PLUS na drewno.
- Kotły gazowe: De Dietrich, Immergas, Bosch, Viessmann i własna nazwa; typy jednofunkcyjny / dwufunkcyjny. Zasobnik jest niezależną opcją kotła jednofunkcyjnego; pakiet nie dubluje kosztu zasobnika.
- Powietrzne pompy ciepła: Panasonic Aquarea L R290 5/7/9 kW i T-CAP M R290 9/12/16 kW; Mitsubishi Electric Ecodan R290 PUZ-WZ klasy 5/6/8/10/12 kW; Vaillant aroTHERM plus VWL 55/75/105/125 serii /6 A (klasy 5/7/10/12 kW). Opcja innej marki/modelu. Nazwa klasy nie ustawia automatycznie mocy projektowej ani minimalnej modulacji.
- Osobne sprzęgła: WOMIX CPN MINI 40 kW i CPN 70 DN25 55 kW (obie moce przy ΔT 20°C, przepływ max 2,5 m³/h); AFRISO HW do KSV 125, 70 kW / 3 m³/h.
- Sprzęgłorozdzielacze AFRISO KSV 125-2 HW i KSV 125-3 HW, 70 kW / 3 m³/h. Dla własnego układu wybór 1/2/3 miejsc na obiegi i własnej mocy/nazwy.
- Dla osobnego sprzęgła i kilku grup doliczany jest osobny rozdzielacz obiegów CO. Dla KSV HW sprzęgło i rozdzielacz stanowią jedną pozycję. Liczba grup wynika z liczby obiegów, a mieszanie z temperatur.
- Grupy bez mieszania: WOMIX SA 125 DN25 z Grundfos (616056), AFRISO PrimoTherm K 180-1 DN25 Grundfos (77818).
- Grupy z mieszaniem: WOMIX SMT 125 DN25 z Grundfos (616086) oraz osobno siłownik SL 10; AFRISO PrimoTherm K 180-2 DN25 Grundfos z siłownikiem ARM 343 (77813). Pompy zawarte są w wybranych grupach; brak dodatkowego dublowania ich w obiegach.
- Kontrole liczby miejsc na obiegi, mocy katalogowej i przepływu źródła przy zadanym ΔT. Katalogowe kW nie zastępują kontroli przepływu. Przyłącza, adaptery, spadki ciśnienia i parametry pomp wymagają potwierdzenia w dokumentacji.
- Konfiguracja zachowywana w JSON; nazwy i ilości trafiają do wspólnej wyceny, oferty i CSV. Ceny netto i moc projektową uzupełnia instalator. Bez integracji z hurtownią.

## Kontrola przed publikacją

1. Pobierz bieżący main i aktualny head PR #7. Nie cofaj innych zmian.
2. Sprawdź diff i CI; uruchom `npm ci --prefix heatloop-b` oraz `npm test --prefix heatloop-b` oraz `node --test help/tests/*.test.mjs wdrozenie/tests/*.test.mjs`.
3. Sprawdź składnię modułów i `git diff --check`.
4. Kontrola funkcjonalna: pompa 16 kW, własna marka, gaz jednofunkcyjny i zasobnik w pakiecie; 2 i 3 obiegi; sprzęgło 40/55/70 kW; grupy z/bez mieszania; przepływ przekraczający katalog; brak podwójnego naliczania; zapis/odczyt JSON; CSV i oferta.
5. Dopiero po pomyślnych kontrolach scal i opublikuj. Zweryfikuj publiczną BETĘ i wejście z heatloop.pl. Sam merge nie potwierdza publikacji.
6. Raport dla użytkownika: rzeczywisty wynik, zakres i ewentualne problemy.

## Źródła danych katalogowych (sprawdzono 16.10.2026)

- SAS: https://www.sas.busko.pl/pl/produkty
- Panasonic L: https://www.aircon.panasonic.eu/PL_pl/product/hydraulic-split-l-generation-1-phase-r290-1/
- Panasonic M: https://www.aircon.panasonic.eu/PL_pl/happening/aquarea-t-cap-m-series/
- Mitsubishi: https://www.mitsubishi-les.com/en-de/knowledge/refrigerant-r290-propane-18688.html
- Vaillant: https://www.myvaillantpro.pl/produkty-i-dokumentacja/nowa-arotherm-plus
- WOMIX CPN MINI: https://womix.pl/pl/oferta/grupy_mieszajaco_pompowe/system_dn_25/system-dn-25-do-40kw/zwrotnica-cpn-mini
- WOMIX CPN 70: https://womix.pl/pl/oferta/grupy_mieszajaco_pompowe/system_dn_25/system-dn-25-do-55kw/zwrotnica-hydrauliczna-cpn-70
- WOMIX SA: https://womix.pl/pl/oferta/grupy_mieszajaco_pompowe/system_dn_25/grupa_pompowa_sa___dn_
- WOMIX SMT: https://womix.pl/pl/oferta/grupy_mieszajaco_pompowe/system_dn_25/grupa_smt_125__dn_25
- AFRISO zestawienie KSV / HW / PrimoTherm: https://afriso.pl/storage/_elfinder/promocje/Ulotka_promocja_PrimoTherm_AFRISO_2025.pdf

## Stan testów przygotowanej wersji

Pełny zestaw `npm test --prefix heatloop-b` przeszedł, w tym 40 scenariuszy modułu kotłowni i testy integracyjne formularza, wyceny, oferty, eksportów i zapisów projektu. Ponów dla ostatecznego head przed publikacją.

Kontrola wizualna w przeglądarce pozostaje do wykonania: lokalny runtime nie ma działającego Chromium, a pobranie przeglądarki nie powiodło się. Testy DOM przeszły; przed zakończeniem wdrożenia sprawdź również widok na małym ekranie i długie nazwy katalogowe.


## Instrukcja 1.2 i podstrona pomocy - dołączenie do tej aktualizacji

- `instrukcja.html`: samodzielna podstrona z 14 rozdziałami i 11 rzeczywistymi zrzutami ekranów z oznaczonymi polami; rozwijany spis treści, powiększanie obrazów, obsługa klawiatury i druk. Zrzuty są osadzone w HTML; brak zewnętrznych bibliotek.
- `materialy/HeatLoop_instrukcja_BETA.pdf`: pełne wydanie 1.2, 14 stron; zastępuje dotychczasowy PDF 1.1.
- Link „Instrukcja obsługi” w nawigacji aplikacji i stopkach BETA oraz modułu Grzejniki.
- `wdrozenie/strona-glowna/index.html`: przygotowana podmiana landing page, pobrana z heatloop.pl 16.10.2026. Sekcja pomocy ma główny przycisk „Czytaj instrukcję online” i dodatkowy PDF. Nie zastępuje pliku index.html aplikacji z głównego katalogu tego repozytorium.

### Dwie lokalizacje publikacji

1. Przy wspólnym wdrożeniu BETA opublikuj `instrukcja.html` i `materialy/HeatLoop_instrukcja_BETA.pdf` w katalogu głównym GitHub Pages. Sprawdź link `../instrukcja.html` z aplikacji i grzejników.
2. Na hostingu strony heatloop.pl skopiuj te same dwa pliki, zachowując katalog `materialy`, oraz podmień stronę główną zawartością `wdrozenie/strona-glowna/index.html`. To osobny hosting - samo scalenie PR nie aktualizuje landing page.
3. Przed podmianą landing page porównaj jego aktualną wersję z przygotowanym plikiem, aby zachować ewentualne nowsze zmiany. Nie cofaj plików prawnych ani pozostałych zasobów.
4. Rozdział „Przygotowywane rozszerzenia” jest jawnie oznaczony. Po faktycznym udostępnieniu katalogów dopasuj jego status do wydania i uzupełnij zrzuty nowych pól; nie zmieniaj daty publicznej instrukcji na potwierdzenie niewykonanego wdrożenia.
5. Sprawdź na telefonie: spis treści, odnośniki do rozdziałów, powiększenie i zamknięcie zrzutu, przewijanie tabel, pobranie PDF oraz wejście z obu stron.

Status: przygotowane do wspólnego wdrożenia, bez publikacji produkcyjnej na tym etapie.


## Asystent pomocy - przygotowany, bez aktywacji płatnego API

- Jedna baza wiedzy `help/knowledge.mjs`, 33 zatwierdzone tematy i wspólne odpowiedzi w aplikacji oraz na `pomoc.html`.
- W aplikacji przycisk „? Pomoc” wybiera obszar aktualnego modułu, bez odczytu projektu. Na landing page przygotowano wejście do tej samej pomocy.
- Przy publikacji heatloop.pl skopiuj także `pomoc.html` i cały publiczny katalog `help/` bez `server/` i `tests/`. Katalog serwera nie jest potrzebny do trybu lokalnego.
- Domyślnie działa lokalne dopasowanie do instrukcji; nie przedstawiamy go jako uruchomionego modelu AI.
- Opcjonalny serwer AI wybiera wyłącznie ID zatwierdzonego tematu. Wymaga osobnego hostingu HTTPS, sekretu API, wyboru modelu i kontroli kosztów. `help/config.mjs` pozostaje z `aiEndpoint=null`.
- Przed publikacją sprawdź widok mobilny i działanie z klawiaturą. AI nie aktywować do czasu konfiguracji limitów i informacji o przetwarzaniu pytań.
- Wiedzę aktualizuj wraz ze zmianami funkcji; wersja klienta i serwera musi się zgadzać. Rozmowy nie zmieniają wiedzy automatycznie.


### Dopracowanie asystenta po audycie zakresu (16.10, przed publikacją)

Baza `2026-10-16.2`: 33 tematy, ostrożne dopasowanie pytań zamiast fragmentów słów, dopytywanie, krótki kontekst oparty na ID tematów, czyszczenie przy zmianie modułu. Rozdzielono dodawanie rozdzielacza w planie i w wycenie. Dodano obsługę instrukcji VAT, usuwania/ograniczeń edycji pokoju, telefonu, offline, błędów JSON i własnych cen.

Weryfikacja: 100/100 scenariuszy pytań oraz 27 dodatkowych testów — 127/127; cały zestaw BETA także przeszedł. Raport: `help/TEST_REPORT_2026-10-16.md`. AI nadal wyłączone. Kontrola na rzeczywistym telefonie pozostaje do wykonania przed publikacją; wynik testów nie stanowi gwarancji dla dowolnego pytania.


### Rozszerzone testy skrajne asystenta — baza 2026-10-16.3

Dodano obsługę sugestii i uwag bez deklarowania wysyłki, spokojne reakcje na same obelgi, zachowanie pomocy przy wulgarnym pytaniu, zaprzeczenia, kilka intencji, wybór opcji i słowne czyszczenie kontekstu. Doprecyzowano zakres, R1–R10, brak działań za użytkownika i brak obliczeń w bocie. Dane rozpoznawane jako e-mail/długi numer nie wychodzą do AI. Ograniczono rozmiar historii okna, poprawiono obsługę wadliwych żądań serwera.

279/279 testów asystenta; co najmniej 10 064 próby wejść/kontekstów, w tym 5000 deterministycznych prób losowych. Pełny zestaw BETA także zaliczony. Raport: `help/EXTREME_TEST_REPORT_2026-10-16.md`. Testy nie obejmują wszystkich możliwych zdań, prawdziwych wywołań modelu ani rzeczywistego telefonu. Brak publikacji i aktywacji AI.


## Gotowy zestaw do podmiany — przygotowanie końcowe

Instrukcja wykonawcza: `wdrozenie/README_AKTUALIZACJA.md`. Dokładna lista plików z miejscami publikacji, rozmiarami i SHA-256: `wdrozenie/manifest-2026-10-16.json`. Polecenie `node wdrozenie/prepare-update.mjs` tworzy dwa osobne foldery gotowych plików bez ZIP; sprawdza aktualność manifestu i poprawność kopii. Nie publikuje.

W publicznym zestawie są wszystkie zależności pomocy, także nowe `language.mjs` i `policy.mjs`; serwer i testy są wykluczone. Uzupełniono Bug/Fix i przygotowano jego samodzielną wersję dla heatloop.pl. Z przygotowanego landing page i stopki BETA usunięto nazwisko oraz prywatny e-mail, zgodnie z wcześniejszym ustaleniem; uwagi prowadzą do formularza. W pomocy jasno opisano brak odczytu rzutu i danych projektu.

Sugestia testera o pytaniach do doboru sterowania strefowego jest zapisana w `wdrozenie/SUGESTIE_TESTEROW.md` jako propozycja do opracowania. Nie dołączono kreatora wyceny z wymiarów.

Przed publikacją nadal sprawdzić rzeczywiste urządzenia i porównać bieżący landing page. Istniejące dokumenty prawne i zasoby hostingu pozostają poza zestawem.
