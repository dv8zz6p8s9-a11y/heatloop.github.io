# Asystent pomocy HeatLoop - przygotowanie do aktualizacji

Status: gotowy tryb pomocy z zatwierdzonej instrukcji; opcjonalne dopasowanie pytania przez AI przygotowane, domyślnie wyłączone. Nie uruchomiono płatnej usługi ani produkcji.

## Gdzie jest dostępny

- `pomoc.html`: pełna strona pomocy; wejście ze strony głównej.
- Pływający przycisk „? Pomoc” w BETA i Grzejnikach. Ustala obszar pomocy z otwartej zakładki, bez czytania wartości pól projektu.
- Ta sama baza `knowledge.mjs` i silnik w obu miejscach; nie tworzymy dwóch niezależnych botów.
- Podstawowy tryb to dopasowanie pytania i wyświetlenie zatwierdzonych kroków. To nie jest swobodny chatbot AI. Działa bez serwera i bez API; po załadowaniu nie wysyła pytań poza przeglądarkę.
- Przy braku odpowiedzi bot proponuje tematy i instrukcję. Nie zgaduje, nie wykonuje obliczeń i nie zmienia projektu.

## Aktualizacja wiedzy

Przy zmianie funkcji aktualizuj odpowiednie artykuły w `knowledge.mjs`, instrukcję oraz testy. Zwiększ `knowledgeVersion`. Publikuj pliki `help/` jednocześnie z aplikacją i tym samym serwerem. Serwer odrzuca inną wersję wiedzy; klient wraca do swojej lokalnej instrukcji. Nie ma samoczynnego uczenia na rozmowach ani automatycznego zgadywania zmian z kodu. Baza zawiera 33 tematy; nie pokrywa wszystkich możliwych błędów.

Rodziny producentów, gazowe pakiety CWU oraz katalog hydrauliki są oznaczone jako przygotowywane. Po faktycznej publikacji usuń te oznaczenia i uzupełnij zrzuty; sprawdź wersję użytkownika.

## Opcjonalne AI - osobne wdrożenie

Przygotowany Node 22+ serwer `server/server.mjs` uruchamia się poza GitHub Pages. Model służy wyłącznie do wyboru tematu z zatwierdzonej listy. Nigdy nie wyświetlamy jego swobodnej odpowiedzi: klient ponownie sprawdza ID i wyświetla kroki ze swojej bazy. Zakres to tylko obsługa HeatLoop.

W środowisku serwera ustaw:

- `HELP_AI_ENABLED=true`
- `OPENAI_API_KEY`: sekret ustawiany u dostawcy hostingu, nigdy w repozytorium ani przeglądarce.
- `OPENAI_MODEL`: model dostępny na koncie, wybrany po sprawdzeniu kosztów i jakości dopasowania. Celowo bez domyślnego modelu.
- `HELP_ALLOWED_ORIGINS`: dokładne originy strony, oddzielone przecinkami. To kontrola przeglądarek, nie uwierzytelnienie.
- `HELP_BUDGET_FILE`: absolutna ścieżka pliku licznika poza publicznym katalogiem WWW; trwały dysk, jeden proces/instancja.
- `HELP_DAILY_REQUESTS`: dzienny limit wywołań AI, domyślnie 100. Nie jest gwarantowanym limitem kwotowym; dodatkowy limit kosztów i kontrolę wydatków skonfiguruj u dostawcy API.
- `HOST` i `PORT`: domyślnie 127.0.0.1:8787 za reverse proxy z HTTPS.

Uruchom: `node help/server/server.mjs`. Potem ustaw pełny HTTPS URL `/api/help` w `help/config.mjs`. Klient pokazuje opcjonalną zgodę na przesłanie pytania do AI. Bez zaznaczenia pomoc pozostaje lokalna.

Ochrony: limit 600 znaków, limit rozmiaru żądania, 20 żądań/min na adres połączenia, trwały dzienny licznik wywołań, timeout i powrót do instrukcji. Za reverse proxy limit adresu połączenia obejmuje wspólny adres proxy; przed produkcją skonfiguruj dodatkowy limit na brzegu. Nie ufamy dowolnemu X-Forwarded-For. Wiele instancji wymaga wspólnego, atomowego licznika; obecny wariant jest jednoproc.

Nie zapisujemy pytań ani historii po stronie tego serwera. `store:false` wyłącza zapis stanu odpowiedzi API, ale nie stanowi obietnicy braku innych logów lub retencji dostawcy. Przed włączeniem AI sprawdź polityki dostawców i zaktualizuj prywatność. Wysyłane są: pytanie, wybrany obszar i publiczna lista tematów; bez JSON projektu i danych pól. Wklejone e-maile i długie numery są odrzucane na serwerze, ale nie jest to pełne wykrywanie danych osobowych.

Aktualna dokumentacja integracji: https://developers.openai.com/api/docs/guides/text (sprawdzona 16.10.2026). Klucz API niedostępny w tej sesji; testy dostawcy wykonano na atrapach, bez prawdziwych wywołań i kosztów.

## Weryfikacja przed publikacją

`node --test help/tests/*.test.mjs` i `npm test --prefix heatloop-b`.

Sprawdź także na Androidzie i Safari/iPhone: otwieranie/zamykanie, klawiaturę ekranową, przewijanie rozmowy, przechodzenie do instrukcji, temat aktualnego modułu oraz niedostępność AI. Kontrola DOM nie potwierdza wyglądu na urządzeniu.

## Wynik przygotowania 16.10.2026

Pierwotne 20 testów asystenta obejmowało: zakres, dopasowanie tematów, bezpieczne renderowanie, brak sieci domyślnie, kontekst modułu, czyszczenie rozmowy, opcjonalna zgoda AI, brak danych projektu w żądaniu, limity, wersje i powrót do instrukcji po błędzie. Pełne testy obliczeń i DOM aplikacji również przeszły. Nowe pliki pomocy zajmują około 45 KB (bez istniejącej instrukcji i zrzutów). Kontrola wizualna na telefonie oraz rzeczywiste połączenie z dostawcą AI pozostają do wykonania.

## Dopracowanie 16.10.2026 — baza 2026-10-16.2

Zastąpiono dopasowanie dowolnych fragmentów słów konserwatywnym rozpoznawaniem pojęć i działania. Krótkie, niejasne pytania wywołują doprecyzowanie. Dla rozdzielaczy rozróżniamy plan i wycenę. Literówki są tolerowane tylko w dłuższych nazwach funkcji, aby nie rozszerzać przypadkowo zakresu.

Kontekst rozmowy przechowuje w pamięci karty wyłącznie ID ostatniego artykułu i ID proponowanych odpowiedzi. Pozwala powtórzyć wskazówki („gdzie to znajdę?”) oraz wybrać opcję numerem lub nazwą obszaru. Nie jest to dowolne rozumienie wieloetapowej rozmowy. Wyczyść, zmiana obszaru i odświeżenie usuwają kontekst. Wybór tematu przerywa oczekującą odpowiedź sieciową.

Dodano instrukcje usuwania i ograniczeń edycji pomieszczeń, VAT, telefonu, ograniczeń offline, błędów JSON i własnych cen. Treści sprawdzono z kodem, bez obiecywania funkcji edycji lub synchronizacji, których nie ma.

Niejasne pytania wymagają odpowiedzi użytkownika i nie są rozstrzygane automatycznie przez opcjonalne AI. Pytania spoza rozpoznanego zakresu i instrukcje manipulowania botem są obsługiwane lokalnie. Serwer i przeglądarka sprawdzają, czy zwrócony temat zgadza się z bieżącą decyzją silnika. Klucz i produkcyjne AI pozostają wyłączone.

Weryfikacja: 100 opisanych scenariuszy pytań oraz 27 dodatkowych testów silnika, okna pomocy i serwera — 127/127 zaliczonych. Pełny zestaw testów BETA zaliczony. Szczegóły i wszystkie scenariusze: `TEST_REPORT_2026-10-16.md`. Wynik nie oznacza gwarancji poprawności dla dowolnego pytania. Kontrola wizualna iPhone/Android oraz rzeczywiste wywołania modelu AI pozostają poza tą weryfikacją.


## Testy skrajne i uwagi — baza 2026-10-16.3

Dodano osobne rozpoznawanie uwag/propozycji, podziękowań, pytań o możliwości bota, czyszczenia kontekstu oraz obelg bez pytania. Wulgaryzm towarzyszący prawidłowemu pytaniu nie blokuje instrukcji. Sugestia nie jest udawanym zgłoszeniem: użytkownik dostaje wyraźną informację i drogę do formularza.

Zaprzeczenia z „tylko” kierują do potwierdzonej czynności. Pytania o kilka niezależnych działań wymagają wyboru pierwszego tematu. Wybór opcji rozumie numer, nazwę obszaru i zwroty typu „druga opcja”. To nadal ograniczony mechanizm instrukcji, nie ogólne rozumienie języka.

Rozpoznawane adresy e-mail i długie numery są zatrzymywane w przeglądarce przed wywołaniem serwera AI; ten sam filtr jest na serwerze, także dla części zapisów Unicode. Nie jest to kompletne wykrywanie danych osobowych. Pytań nie wolno traktować jako miejsca na dane klientów.

Okno zachowuje do 60 ostatnich elementów rozmowy w pamięci karty. Zbyt długie wejście nie jest w całości kopiowane do logu. Nieprawidłowe żądania JSON i konteksty serwera nie powodują przerwania obsługi.

Wynik rozszerzenia: 279/279 testów runnera. Obejmują co najmniej 10 064 próby wejść i kontekstów, w tym 5000 testów losowych dotyczących odporności, a nie jakości rozumienia. Dokładny podział, ograniczenia i polecenia: `EXTREME_TEST_REPORT_2026-10-16.md`. Cały zestaw BETA także przeszedł. Wszystko pozostaje robocze; płatne AI wyłączone.
