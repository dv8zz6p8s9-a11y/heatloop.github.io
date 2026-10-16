# HeatLoop BETA 0.2 — pokrycie pomocy

Ocena przygotowanej gałęzi, 16.10.2026. To nie jest wynik testu opublikowanego serwisu ani certyfikacja zgodności.

## Metoda

Wybrano 90 czynności i sytuacji z obecnego interfejsu. Pełne wsparcie = 1 punkt (konkretne kroki i poprawne dopasowanie pytania lub potwierdzona wskazówka podglądu); częściowe = 0,5 (ogólna pomoc, niepełne kroki lub wymagane doprecyzowanie); brak = 0 (brak oczekiwanej reakcji albo brak zdolności). Wynik = suma punktów / liczba pozycji. To robocza, autorska miara pokrycia tej listy. Wybór czynności i ocena szczegółowości wpływają na wynik; nie jest to procent poprawności wszystkich możliwych rozmów.

Procenty nie mierzą skuteczności wykrywania ścian. Nie mamy oznaczonego zbioru rzeczywistych rzutów z prawidłowymi ścianami, więc nie obliczamy czułości ani precyzji detektora. Przejście 302 testów nie oznacza 100% pokrycia obsługi.

| Obszar | Czynności | Pełne | Częściowe | Brak w próbie | Punkty / maksimum | Ocena |
|---|---:|---:|---:|---:|---:|---:|
| Ogólna obsługa aplikacji | 54 | 41 | 4 | 9 | 43/54 | 80% |
| Praca z rysunkiem i podgląd | 36 | 21 | 12 | 3 | 27/36 | 75% |

## Znaczenie wyniku

Asystent obejmuje wszystkie główne moduły, lecz nie wszystkie czynności i sformułowania. Niepełne instrukcje trzeba odróżnić od błędnego dopasowania pytania: w tabelach pozostawiono faktyczny wynik, także gdy informacja istnieje, lecz silnik jej nie odnalazł. Nie zmieniano reguł ani oczekiwań po uruchomieniu tej próby, aby podnieść ocenę.

Podgląd jest lokalny, rozpoznaje wybrane braki danych i nie jest pełną analizą dokumentacji technicznej. Nie potwierdzi prawidłowości skali na podstawie samego faktu, że jest dodatnia. Nie klasyfikuje samodzielnie wszystkich ścian ani nie projektuje automatycznie instalacji.

## Ogólna obsługa

| Czynność | Reprezentatywne pytanie | Wsparcie | Otrzymano | Uzasadnienie / ograniczenie |
|---|---|---|---|---|
| Początek projektu | Jak rozpocząć pierwszy projekt? | pełna | answer / start | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Dodanie pokoju | Jak dodać pomieszczenie ręcznie? | pełna | answer / manual | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Usunięcie pokoju | Jak usunąć pokój? | pełna | answer / room-delete | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Ograniczenia edycji | Jak zmienić nazwę pokoju? | pełna | answer / room-edit | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Zmiana technologii | Jak zmienić technologię ogrzewania? | pełna | answer / mixed | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Szacunek zapotrzebowania | Co oznacza obciążenie W/m² pokoju? | brak w tej próbie | answer / milling | Nie dopasowano oczekiwanego tematu: manual. |
| Oznaczenie rury | Jak ustawić PEX 16? | pełna | answer / loops | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Limit długości | Jak zmienić długość pętli 80 m? | pełna | answer / loops | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Dojścia pętli | Gdzie podać dojścia pętli? | pełna | answer / loops | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Własna liczba pętli | Jak ręcznie ustawić liczbę pętli? | pełna | answer / loops | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Rozdzielacz R2 | Jak dodać drugi rozdzielacz? | pełna | answer / manifolds | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Usunięcie pustego rozdzielacza | Jak usunąć pusty rozdzielacz R2? | częściowa | answer / manifolds | Artykuł opisuje dodawanie i przypisanie, nie przycisk usuwania. |
| Przypisanie pokoju do rozdzielacza | Jak przypisać pokój do R2? | pełna | answer / manifolds | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Zasilanie osobnych rozdzielaczy | Gdzie podać zasilanie rozdzielacza R2? | brak w tej próbie | answer / supply | Instrukcja istnieje, ale pytanie może trafić do ogólnego zasilania. |
| Przepływy | Jak czytać przepływy w l/min? | pełna | answer / flow | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Powiązanie planu z wyceną | Dlaczego pole liczby pętli jest wyszarzone? | pełna | answer / locked | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Wyłączenie powiązania | Jak wyłączyć powiązanie planu z wyceną? | brak w tej próbie | unknown | Nie dopasowano oczekiwanego tematu: locked. |
| Wspólny regulator | Jak ustawić wspólny regulator? | brak w tej próbie | answer / tech | Nie dopasowano oczekiwanego tematu: zones. |
| Włączenie TECH | Jak dodać sterowanie TECH? | pełna | answer / tech | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Wariant bezprzewodowy | Jak wybrać bezprzewodowe sterowanie? | pełna | answer / tech | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Gwint siłownika | Jak wybrać gwint siłownika? | częściowa | answer / tech | Wskazano wybór gwintu, bez instrukcji identyfikacji konkretnego zaworu. |
| Przekroczenie 8 stref | Co zrobić gdy mam 9 stref na rozdzielaczu? | brak w tej próbie | choose | Podany limit, brak szczegółowego przebiegu rozwiązania przekroczenia. |
| Przekroczenie 4 siłowników | Co zrobić gdy mam 5 siłowników na strefę? | częściowa | answer / tech | Podany limit, bez pełnego scenariusza doboru ponad limit. |
| Opcjonalna grupa w wycenie podłogówki | Jak wyłączyć grupę pompową w wycenie podłogówki? | brak w tej próbie | answer / hydraulics | Ogólna hydraulika kotłowni nie wyjaśnia tego pola wyceny. |
| Ręczna wycena rozdzielaczy | Jak dodać rozdzielacz z szafką do wyceny? | pełna | answer / quote | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Własne ceny | Gdzie wpisać własne ceny materiałów? | pełna | answer / prices | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Stawka frezowania | Gdzie jest cena frezowania? | pełna | answer / milling | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Jednostka montażu | Czy montaż podłogówki jest w m2? | pełna | answer / milling | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Izolacja i kształtki | Jak doliczyć izolację i kształtki zasilania? | pełna | answer / supply | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Stawka montażu zasilania | Jak wycenić montaż zasilania jako całość? | pełna | answer / supply | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Zmiana VAT | Jak zmienić VAT? | pełna | answer / vat | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Eksport wyceny CSV | Jak wyeksportować wycenę CSV? | częściowa | answer / prices | Jest wzmianka o CSV, bez pełnej instrukcji przycisku eksportu wyceny. |
| Oferta PDF | Jak zapisać ofertę PDF? | pełna | answer / export | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Udostępnienie klientowi | Jak wysłać ofertę klientowi? | pełna | answer / export | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Netto a brutto | Czy ceny w ofercie są netto czy brutto? | brak w tej próbie | unknown | Nie dopasowano oczekiwanego tematu: vat. |
| Start kotłowni | Jak uruchomić dobór kotłowni? | pełna | answer / boiler | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| OZC i szacunek | Gdzie podać OZC w kotłowni? | pełna | answer / boiler | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Marka i model źródła | Jak wybrać model kotła SAS? | pełna | answer / catalog | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Gaz i pakiet CWU | Jak ustawić zasobnik w pakiecie kotła gazowego? | pełna | answer / gas | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Sprzęgła i grupy | Jak wybrać sprzęgło i grupy pompowe? | pełna | answer / hydraulics | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Parametry CWU | Jak skonfigurować CWU? | pełna | answer / cwu | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Naczynia i zabezpieczenia | Gdzie wpisać naczynie przeponowe? | pełna | answer / safety | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Bufor i przepływ minimalny | Jak sprawdzić bufor i minimalny przepływ? | pełna | answer / safety | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Za mała moc źródła | Co oznacza ostrzeżenie za mała moc źródła? | brak w tej próbie | unknown | Opisuje ogólny charakter doboru; nie diagnozuje konkretnej konfiguracji kotłowni. |
| Dobór grzejnika | Jak dobrać grzejnik przy innych temperaturach? | pełna | answer / radiators | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Dodanie grzejnika do zestawienia | Jak dodać grzejnik do zestawienia? | pełna | answer / radiators | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Import katalogu grzejników | Jak wczytać katalog CSV grzejników? | pełna | answer / csv | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Usunięcie pozycji katalogu | Jak usunąć produkt z katalogu grzejników? | brak w tej próbie | answer / radiators | Brak odrębnej instrukcji usuwania pozycji katalogowych. |
| Zapis i odczyt JSON | Jak zapisać projekt JSON? | pełna | answer / json | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Błędny import JSON | Projekt JSON nie wczytuje się | pełna | answer / json-errors | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Offline | Czy działa offline? | pełna | answer / offline | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Telefon | Jak zainstalować skrót na iPhonie? | pełna | answer / mobile | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Zgłoszenie problemu | Jak zgłosić błąd? | pełna | answer / bugs | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Wersja aplikacji | Jaka wersja HeatLoop? | pełna | scope | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |

## Rysunek i podgląd

| Czynność | Reprezentatywne pytanie | Wsparcie | Otrzymano | Uzasadnienie / ograniczenie |
|---|---|---|---|---|
| Wczytanie PNG/JPG | Jak wczytać rzut PNG? | pełna | answer / drawing | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Wczytanie PDF | Jak wczytać PDF jako rzut? | pełna | answer / drawing | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Kalibracja | Jak ustawić skalę rzutu? | pełna | answer / drawing | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Obrys pokoju | Jak narysować obrys pomieszczenia? | pełna | answer / drawing | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Zakończenie obrysu | Jak zakończyć obrys pomieszczenia? | pełna | answer / drawing | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Cofnięcie punktu | Jak cofnąć ostatni punkt na rzucie? | częściowa | answer / drawing | Brak instrukcji przycisku Cofnij punkt. |
| Usunięcie niedokończonego szkicu | Jak usunąć bieżący szkic? | częściowa | answer / drawing | Brak rozróżnienia szkicu od gotowego pomieszczenia. |
| Pomocnicza trasa rury | Do czego służy trasa rury pomocnicza? | brak w tej próbie | unknown | Może zostać pomylona z trasą przypisanej pętli. |
| Wybór systemu przed rysowaniem | Jak wybrać system mieszany na rzucie? | częściowa | choose | Właściwy temat jest wśród propozycji; potrzebne doprecyzowanie. |
| Technologia istniejącego pokoju | Jak zmienić technologię pomieszczenia na rzucie? | częściowa | choose | Właściwy temat jest wśród propozycji; potrzebne doprecyzowanie. |
| Umieszczenie R1 | Jak umieścić rozdzielacz na rzucie? | brak w tej próbie | choose | Trasa wymaga rozdzielacza, ale brak dokładnej instrukcji narzędzia Umieść rozdzielacz. |
| Pozycja R2 | Jak wskazać położenie rozdzielacza R2? | częściowa | answer / manifolds | Opisuje wybór R2 i przypisania, nie pełen przebieg umieszczania punktu. |
| Przypisana trasa pętli | Jak narysować trasę pętli? | pełna | answer / route | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Domknięcie trasy | Jak zakończyć pełną trasę pętli? | pełna | answer / route | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Długość z rysunku | Czy narysowana długość pętli zastępuje szacunek? | pełna | answer / route | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Usunięcie gotowej trasy | Jak usunąć narysowaną trasę pętli? | częściowa | answer / route | Brak kroków przycisku Usuń trasę. |
| Obrót 90 stopni | Jak obrócić rzut o 90 stopni? | pełna | answer / drawing | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Propozycje ścian | Jak wykryć ściany na rzucie? | pełna | answer / drawing | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Próg wykrywania | Jak zmienić próg ciemności wykrywania ścian? | częściowa | answer / drawing | Brak instrukcji ustawiania progu i wpływu na wynik. |
| Wybór i zatwierdzenie ścian | Jak zatwierdzić wybrane ściany? | pełna | answer / drawing | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Usunięcie linii ścian | Jak usunąć zatwierdzone linie pomocnicze ścian? | częściowa | answer / drawing | Brak opisu przycisku usuwania linii pomocniczych. |
| Zapis obrotu i ścian | Czy JSON zapisuje obrót rzutu i linie ścian? | częściowa | answer / json | Artykuł zapisu nie wyjaśnia nowych pól i zgodności ze starszą aplikacją. |
| Grzejnik na rzucie | Jak umieścić grzejnik na rzucie? | pełna | answer / radiator-plan | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Punkt grzejnika poza pokojem | Grzejnik na szkicu nie działa | pełna | answer / radiator-plan | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Podgląd wykrywa brak skali | Podgląd / test integracyjny | pełna | oczekiwana wskazówka | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Podgląd wykrywa niedokończony szkic | Podgląd / test integracyjny | pełna | oczekiwana wskazówka | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Podgląd wskazuje przekroczony limit | Podgląd / test integracyjny | pełna | oczekiwana wskazówka | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Ostrzeżenie o ręcznych pokojach | Podgląd / test integracyjny | pełna | oczekiwana wskazówka | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Nieprzypisane pomieszczenia | Podgląd / test integracyjny | pełna | oczekiwana wskazówka | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Brak położenia rozdzielacza | Podgląd / test integracyjny | pełna | oczekiwana wskazówka | Kroki w bazie i poprawne dopasowanie reprezentatywnego pytania. |
| Diagnoza konkretnej przyczyny błędu planu | Podgląd / test integracyjny | częściowa | oczekiwana wskazówka | Podgląd zna liczbę problemów i kieruje do planu, ale nie tłumaczy konkretnych komunikatów. |
| Rozpoznanie błędnej dodatniej skali | Skala jest ustawiona, czy na pewno jest poprawna? | brak w tej próbie | answer / drawing | Brak niezależnego wymiaru wzorcowego i oceny obrazu; nie potwierdza poprawności kalibracji. |
| Fałszywe wskazanie mebla jako ściany | Wykrywanie ścian zaznaczyło meble, co zrobić? | częściowa | answer / drawing | Wymaga ręcznej selekcji, bez automatycznej klasyfikacji i konkretnej diagnozy obrazu. |
| Ściany ukośne | Dlaczego wykrywanie nie znajduje ukośnych ścian? | częściowa | answer / drawing | Detektor działa dla poziomych/pionowych odcinków; brak odrębnego scenariusza naprawy. |
| Niedostępna miniatura | Podgląd / test integracyjny | pełna | potwierdzone testem integracyjnym | Test drawing-preview.test.mjs potwierdza tekstowy tryb i bezpieczny brak obrazu. |
| Izolacja podglądu od AI | Podgląd / test integracyjny | pełna | potwierdzone testem integracyjnym | Test drawing-preview.test.mjs potwierdza brak obrazu i danych w żądaniu AI. |

## Co dopracować najpierw

1. Osobne, krótkie instrukcje cofania punktów, kasowania szkicu, usuwania tras i linii ścian; rozróżnienie pomocniczej rury od przypisanej pętli.
2. Dopasowanie pytań o pozycje rozdzielaczy, powiązanie planu, eksport CSV i szczegółowe opcje TECH.
3. Wyjaśnianie konkretnych komunikatów planu, a nie samej ich liczby.
4. Próby na rzeczywistych rzutach testerów i fizycznym iPhonie/Androidzie; osobna ocena skuteczności ścian na oznaczonym zbiorze.

Powtórzenie oceny: node help/audits/coverage-0.2.mjs. Dane i pytania są w tym samym pliku. Ocena nie zmienia aplikacji, nie aktualizuje numeracji i nie publikuje wydania.
