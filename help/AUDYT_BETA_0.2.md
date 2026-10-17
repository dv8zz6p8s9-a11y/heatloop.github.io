# Audyt pomocnika — przygotowanie BETA 0.2

Data: 16.10.2026. Wersja publicznej etykiety w przygotowanej gałęzi: 0.2. Baza wiedzy: 2026-10-16.5. Bez publikacji i bez aktywacji AI.

## Wykryte problemy i naprawy

| Problem | Przykład / skutek | Poprawka i sprawdzenie |
|---|---|---|
| Stary wybór zasłania nową intencję | Po wyborze plan/wycena pytanie o VAT w wycenie mogło wskazać rozdzielacze; podobnie pytanie o długość pętli | Tylko jednoznaczne krótkie odpowiedzi rozstrzygają poprzedni wybór. Nowe pytania przechodzą zwykłe rozpoznawanie. Testy czterech nowych intencji |
| Zamknięcie nie kończy oczekującej odpowiedzi | Spóźniona odpowiedź mogła trafić do zamkniętej pomocy i próbować przestawić fokus | Zamknięcie anuluje żądanie, unieważnia jego generację i odblokowuje wysyłanie. Test późnej odpowiedzi i fokusu |
| Timer korzysta ze wspólnego kontrolera | Starszy timer mógł anulować nowsze żądanie po czyszczeniu rozmowy | Każde żądanie ma swój kontroler w zamknięciu funkcji. Test dwóch oczekujących odpowiedzi |
| Błędne dane podglądu | Nieprawidłowa tablica pomieszczeń lub wskazówek mogła przerwać renderowanie | Walidacja projekcji, komunikat o niedostępnym podglądzie i ponowna próba |
| Nieprawidłowa podpowiedź modułu | Nieznana wartość w data-help-module dawała pusty wybór | Powrót do Start i zapis |
| Zaprzeczony rozkaz | „Nie usuwaj pokoju” mógł wskazać instrukcję dotyczącą pokoju | Dopytanie zamiast instrukcji niechcianej czynności. Sprawdzono cztery zaprzeczenia |
| Niespójne oznaczenia 0.1 / 0.2 | Nagłówek, zgłoszenie błędu i metadane mogły wskazywać inne wydanie | Wspólne release.mjs, aktualizacja widocznych etykiet, test spójności pakietu, PWA, stron i manifestu |
| Brak pliku wskazanego przez formularz w zestawie podmiany | Link do dziennika TXT mógł być niekompletny przy wdrożeniu z folderu | Do zestawu dołączono historyczny dziennik i nazwano link archiwalnym |

## Wyniki

- 302/302 testy `node --test help/tests/*.test.mjs wdrozenie/tests/*.test.mjs` zaliczone. Obejmują wcześniejsze 10 064 próby wejść/kontekstów, testy UI, lokalnego HTTP, podglądu i spójności plików.
- Pełny `npm test --prefix heatloop-b` zaliczony, w tym 12 testów narzędzi rysunku oraz integracje DOM obrotu, przyjęcia ścian, niezmienionej wyceny, JSON i ograniczonej projekcji podglądu.
- `npm ci --prefix heatloop-b --ignore-scripts` działa po synchronizacji pakietu i lockfile.
- Przygotowano 47 plików docelowych na dwa hostingi; manifest i kopie sprawdzone.
- Format projektu JSON pozostaje 1; appVersion jest osobnym polem.

Wszystkie znalezione w tej rundzie regresje mają powtarzalne przypadki w repozytorium. Testy nie dowodzą braku wszystkich możliwych błędów. Nadal potrzebne: rzeczywisty iPhone/Android, rzuty testerów i kontrola zasobów po publikacji. Wykrywanie ścian jest heurystyczne, obejmuje odcinki poziome/pionowe i wymaga ręcznego potwierdzenia. Nie sprawdzano prawdziwych odpowiedzi modelu AI.

## Numeracja

0.2 — bieżące duże wydanie; 0.21, 0.22 itd. — kolejne małe poprawki po jego publikacji; 0.3 — następne duże wydanie. Oznaczenia są tekstem. Szczegóły: wdrozenie/WERSJONOWANIE.md.
