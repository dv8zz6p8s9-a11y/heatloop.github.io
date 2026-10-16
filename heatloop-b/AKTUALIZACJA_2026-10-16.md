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
2. Sprawdź diff i CI; uruchom `npm ci --prefix heatloop-b` oraz `npm test --prefix heatloop-b`.
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
