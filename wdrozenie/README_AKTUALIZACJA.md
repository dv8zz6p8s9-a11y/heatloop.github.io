# HeatLoop — pliki przygotowane do aktualizacji 16/17.10.2026

Stan: przygotowane w roboczym PR #7. Bez publikacji i bez włączenia płatnego AI.

Zakres: kotłownia i katalogi źródeł/hydrauliki, instrukcja HTML/PDF, 33 tematy asystenta (baza 2026-10-16.6), wejścia z aplikacji i landing page oraz Bug/Fix. Sugestia testera dotycząca wywiadu do sterowania strefowego jest osobno zapisana w SUGESTIE_TESTEROW.md; nie jest częścią tej implementacji. Asystent ma opcjonalny lokalny podgląd rzutu i ograniczonych danych kreatora. Obraz nie trafia do AI. Aplikacja oferuje obrót 90° oraz propozycje ścian do zatwierdzenia.

## Przygotowanie plików bez ZIP

1. W repozytorium uruchom `npm ci --prefix heatloop-b`.
2. Uruchom `node --test help/tests/*.test.mjs wdrozenie/tests/*.test.mjs` oraz `npm test --prefix heatloop-b`.
3. Uruchom `node wdrozenie/prepare-update.mjs --out /osobny/pusty/katalog` albo bez parametru, aby otrzymać katalog w .runtime.
4. Otrzymasz dwa foldery z gotowymi plikami do podmiany: `github-pages/` i `heatloop-pl/`, manifest SHA-256 oraz tę instrukcję. Pliki można przesyłać pojedynczo, zachowując ścieżki. Skrypt nie publikuje i nie nadpisuje niepustego katalogu.

Manifest `manifest-2026-10-16.json` podaje dla każdego pliku miejsce publikacji, źródło w repozytorium, ścieżkę docelową, rozmiar i SHA-256. Zmiana zawartości bez aktualizacji manifestu zatrzymuje przygotowanie. Po zatwierdzonej zmianie źródeł manifest odświeżysz przez `node wdrozenie/prepare-update.mjs --manifest`.

## Dwa miejsca publikacji

- **GitHub Pages:** zawartość `github-pages/` do katalogu głównego publikacji. Nie zastępuj obecnego głównego index.html legacy aplikacji — zestaw go nie zawiera. BETA jest w `heatloop-b/`.
- **heatloop.pl:** zawartość `heatloop-pl/` do katalogu głównego strony produktu. Tylko tutaj przygotowany landing page trafia do `index.html`.
- Przed podmianą porównaj bieżący landing page i Bug/Fix z przygotowanymi plikami, aby zachować ewentualne zmiany innych osób. Zachowaj kopię wszystkich zastępowanych plików na obu hostingach. Nie usuwaj dokumentów prawnych, ustawień domeny ani innych istniejących zasobów.
- Publiczny zestaw zawiera tylko pliki klienta pomocy. Nie zawiera serwera AI, testów, zależności npm, sekretów ani plików środowiska. `help/config.mjs` pozostaje z `aiEndpoint=null`.
- Publikuj komplet zasobów przed podmianą stron wejściowych. Przy nieatomowym przesyłaniu możliwy jest krótki stan mieszanych wersji — sprawdź wersję pomocy i odśwież aplikację po zakończeniu. Preferowana podmiana całego przygotowanego zestawu.

## Kontrola przed publikacją i po niej

Okno uzgodnione dla dużej aktualizacji: 16.10 godz. 23:00 – 17.10 godz. 05:00, Europe/Warsaw. Samo przygotowanie lub scalenie PR nie potwierdza publikacji ani nie uruchamia jej o konkretnej godzinie.

Przed publikacją pozostaje kontrola wizualna na rzeczywistym iPhonie/Androidzie: klawiatura, przewijanie, zamykanie pomocy, długie nazwy katalogowe, instrukcja i powiększanie zrzutów. PDF instrukcji zachowano z przygotowanego wydania 1.2; nie był w tej operacji ponownie redagowany ani renderowany. Nie nazywaj wydania w pełni zweryfikowanym na urządzeniach bez tej kontroli.

Po publikacji sprawdź oba hostingi: aplikacja, Grzejniki, Pomoc, instrukcja, PDF, Bug/Fix i formularz błędów. W pomocy ma widnieć baza 2026-10-16.6 oraz tryb bez połączenia z AI. Przetestuj R2, cenę frezowania, JSON, VAT, niejasne pytanie, uwagę testera i pracę na rzucie. Zweryfikuj zapis/odczyt projektu oraz końcowy dokument oferty. Rozdział instrukcji o przygotowywanych katalogach zachowuje ten status do rzeczywistego opublikowania — późniejsze dopasowanie instrukcji wykonuj na podstawie potwierdzonego wydania, nie samej daty.

W razie problemów przywróć kopię zastąpionych plików jako spójny zestaw. Nie kasuj projektów, danych przeglądarki ani cenników użytkowników.

Przy tej publikacji podmień także `drawing-help.mjs`, `drawing-tools.mjs` i `help/drawing-preview.mjs` oraz odświeżone HTML/CSS. Nowy panel „Najnowsza aktualizacja” jest nad główną treścią landing page; przy kolejnych wydaniach aktualizuj jego listę jednocześnie z Bug/Fix. Instrukcję i PDF zachowano jako dodatkową pomoc.

Weryfikacja końcowa rozszerzenia: 337 testów pomocy/przygotowania, 12 testów narzędzi rysunku oraz pełny zestaw BETA przeszły. Nowe przypadki obejmują dopasowanie 23 pytań w 4 wariantach na 7 ekranach (644 sprawdzenia) oraz podgląd rzeczywistych komunikatów walidatora na syntetycznych projektach. Sprawdzono też przyciski obrotu w integracji DOM — zachowują powiązaną wycenę, pola powierzchni i skalę. Zestaw ma 47 plików docelowych dla dwóch hostingów. Kontrola wizualna i rzeczywiste skany nadal pozostają przed publikacją.

Aktualna etykieta: HeatLoop BETA 0.2. Drobne wydania po publikacji: 0.21, 0.22 itd.; następne duże: 0.3. Polityka i oddzielenie formatu JSON od numeru aplikacji: WERSJONOWANIE.md. Wspólna wersja jest w release.mjs, kopiowanym na oba hostingi.

Dopracowanie pomocy: instrukcje edycji szkicu, tras, progów i linii ścian, położenia R1/R2, CSV, sterowania i powiązania wyceny. Podgląd wyjaśnia 21 znanych rodzajów błędów planu przez anonimowe kody; nie kopiuje nazw pokoi ani surowych komunikatów. Porównanie checklisty 90 pozycji: obsługa 80% → 96%, rysunek 75% → 94% (robocza ocena pokrycia, nie skuteczność detektora ścian). Pełne wyniki i stan sprzed zmian: help/audits/. Wersja publiczna pozostaje 0.2, ponieważ wydanie nadal jest przygotowywane.
