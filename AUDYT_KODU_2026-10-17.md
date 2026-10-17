# Przegląd kodu HeatLoop — 17.10.2026

## Wynik

Sprawdzono źródła aktualnej aplikacji `heatloop-b/`, lokalnego asystenta, formularza, opcjonalnych serwerów, historycznej aplikacji głównej i prototypu, PWA oraz pakowania aktualizacji. Przejrzano również kopię klienta dziennych sum: wysyła wyłącznie rodzaj zdarzenia, bez danych projektu. Serwer licznika w osobnym Site nie był zmieniany w tym przeglądzie; jego 36 testów, wdrożenie i zapis trzech typów zdarzeń zweryfikowano wcześniej tego samego dnia.

Nie znaleziono znaków zastępczych U+FFFD, ukrytych znaków zmieniających kierunek pisma ani nieoczekiwanych znaków sterujących w sprawdzonych plikach tekstowych. Polskie znaki, symbole matematyczne i kodowanie Base64 grafik są prawidłowymi elementami aplikacji.

W przejrzanym kodzie nie zidentyfikowano celowego mechanizmu wykradania projektów. Aplikacja ma zamierzone połączenia: biblioteki PDF z cdnjs, zgłoszenia i dobrowolne obrazy przez FormSubmit oraz dzienne sumy zdarzeń do HeatLoop. Opcjonalna pomoc przez OpenAI pozostaje wyłączona (`aiEndpoint=null`). Sprawdzenie podpisów kluczy w kluczowych plikach aplikacji i serwerów nie znalazło zakodowanych kluczy API. Nie oznacza to certyfikacji bezpieczeństwa, audytu całej historii Git ani potwierdzenia bezpieczeństwa wszystkich bibliotek i infrastruktury.

## Usunięte pozostałości

- `style.css` w głównym katalogu zawierał HTML eksportu z Meta AI, nie arkusz CSS. Żaden sprawdzony plik nie odwoływał się do niego jako do zasobu aplikacji. Usunięty.
- `index.html.html` był niepodłączoną wcześniejszą kopią aplikacji. Usunięty. Te dwa pliki zajmowały 621 688 bajtów (około 607 KiB); są odzyskiwalne z historii Git.
- Z historycznego `index.html` usunięto dwa skrypty mostka dawnego edytora oraz pusty manifest mediów podglądu. Nie były potrzebne samodzielnej stronie.
- Usunięto dwa odwołania do nieistniejących fontów dawnego edytora. Pozostawiono systemowe fonty zastępcze.
- Usunięto nieużywany import `topologies`, zmienną w detektorze linii, funkcję `escapeHTML` w grzejnikach, nieużywany argument iteracji i niewykorzystywaną gałąź zachowania średnicy rury.

Nie usuwano skompilowanego Reacta ani jego informacji licencyjnych. Moduł aplikacji React w głównym `index.html` porównano przed i po sprzątaniu: jest identyczny. Skrócone nazwy zmiennych i typowe konstrukcje minifikatora wewnątrz tego pakietu nie są same w sobie nieprawidłowością. Zachowano też osobny historyczny prototyp oraz wyraźnie opisane, niewdrożone szablony serwerów.

## Poprawione błędy

1. **Import projektu:** sprawdzanie limitu 25 MB przed odczytem i parsowaniem. Walidacja odbywa się w nowym, wydzielonym module `project-io.mjs`, przed zastąpieniem otwartego projektu. Nieprawidłowe rekordy, niedozwolone punkty, nadmierne listy i geometria oraz nieprawidłowe pola wyceny są odrzucane.
2. **Obce pola w JSON:** import wyceny dopuszcza tylko znane identyfikatory kontrolek i ceny. Nie może zmienić dowolnego pola DOM. Importowane pomieszczenia, punkty i grzejniki są kopiowane według znanego schematu, bez dowolnych dodatkowych właściwości.
3. **Uszkodzony obraz:** dekodowanie następuje przed usunięciem starego rysunku lub zastąpieniem projektu. Błąd pozostawia bieżącą pracę. Przy nakładających się importach obowiązuje ostatni rozpoczęty import.
4. **Przenoszenie ustawień między projektami:** ceny i pola wyceny wracają do wartości początkowych przed odtworzeniem danych nowego projektu; nie dziedziczą przypadkowo stawek poprzedniego klienta.
5. **Walidacja cen:** zmiana poprawnej ceny nie odblokowuje eksportu ani oferty, jeśli inne widoczne pole ceny jest nieprawidłowe. Przygotowanie oferty sprawdza też aktualną poprawność tych pól.
6. **PDF:** po nieudanym pobraniu biblioteki możliwa jest ponowna próba. Dodano limit oczekiwania i usuwanie nieudanego skryptu. Rasteryzacja wgrywanego PDF ogranicza rozmiar płótna i zwalnia dokument po zakończeniu.
7. **Grzejniki:** nieprawidłowe rekordy zapisane lokalnie nie zatrzymują startu. Blokada lub przepełnienie localStorage nie blokuje pracy w karcie; pojawia się komunikat o braku trwałego zapisu. Usunięto drugie, zbędne wywołanie obliczenia tego samego wyniku. Pusty CSV daje kontrolowany komunikat zamiast wyjątku przy odczycie nagłówka.
8. **PWA wcześniejszej aplikacji:** poprawiono nieistniejące ścieżki `icons/` w manifeście. Service worker nie pokazuje wcześniejszej aplikacji jako zastępstwa niedostępnej offline strony BETA. Zmieniono nazwę cache, aby uruchomić aktualizację starej pamięci.
9. **Niewdrożony szablon zgłoszeń:** JSON `null`, tablica lub skalar zwraca błąd walidacji zamiast wyjątku. Dokumentacja wyraźnie rozróżnia obecny FormSubmit i alternatywny szablon — nie ma nieistniejącego przełącznika `ENDPOINT`.
10. **Dokumentacja:** poprawiono mapę repozytorium, błędne wskazanie dawnego adresu i nieprawdziwą informację, że katalog prototypu na publikowanej gałęzi nie jest publiczny.

## Walidacja

- Analiza 36 skryptów lub modułów produkcyjnych, także wydzielonych z HTML: brak zgłoszeń wybranych reguł poza zachowanym, skompilowanym pakietem historycznej aplikacji React. Reguły obejmowały niewykorzystywane nazwy, nieosiągalne instrukcje, powtórzone klucze i gałęzie oraz wybrane błędy składniowe/logiczne. To analiza statyczna, nie dowód braku wszystkich usterek.
- 337 testów asystenta i przygotowania wydania: zaliczone.
- 13 testów podstawowych obliczeń, 16 sterowania, 20 planowania pętli i 40 kotłowni: zaliczone.
- 37 testów rysunku i przeglądu kodu: zaliczone, w tym uszkodzony import, nadmierna geometria, ograniczenie pól, uszkodzony zapis grzejników i izolacja starej PWA.
- Zintegrowane scenariusze DOM: zaliczone, także zachowanie starego projektu po nieudanym imporcie, limit przed odczytem pliku, kolejność jednoczesnych importów, walidacja kilku cen i ponowne pobranie biblioteki PDF.
- W sprawdzonych wejściach HTML nie wykryto powtórzonych identyfikatorów ani brakujących lokalnych skryptów, arkuszy, zasobów obrazów i ikon manifestów.

Nie przeprowadzono pełnej macierzy prawdziwych urządzeń, przeglądarek i trybów offline ani audytu podatności usług zewnętrznych. Testy DOM i statyczne nie zastępują takich sprawdzeń. Nie zmieniono modelu obliczeń ani nie potwierdzano zgodności projektu instalacji z normami.
