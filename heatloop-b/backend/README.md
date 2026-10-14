# HeatLoop BETA — uruchomienie bazy zgłoszeń (Cloudflare)

Repozytorium zawiera gotowy Worker `worker.js` i schemat bazy `schema.sql`. **Backend nie jest jeszcze wdrożony** — wymaga konta Cloudflare, ponieważ GitHub Pages nie ma dostępu do zapisu plików.

1. Utwórz bezpłatne konto https://dash.cloudflare.com/.
2. W Cloudflare Workers & Pages utwórz Worker o nazwie `heatloop-reports`.
3. W D1 utwórz bazę `heatloop-errors`, wykonaj SQL z `schema.sql` w zakładce Console.
4. W ustawieniach Workera dodaj powiązanie D1 o nazwie `DB` do bazy `heatloop-errors` oraz KV namespace o nazwie `RATE` do ograniczenia spamu.
5. Wklej kod `worker.js` do Workera i wdroż go.
6. W ustawieniach Workera dodaj sekret `ADMIN_TOKEN` (długi losowy ciąg, **nigdy nie umieszczaj go w repozytorium**) oraz zmienną `ALLOWED_ORIGIN` = `https://dv8zz6p8s9-a11y.github.io`.
7. W pliku `heatloop-b/zglos-blad.html` wpisz publiczny adres Workera w stałej `ENDPOINT`. Wdróż GitHub Pages i sprawdź wysłanie testowego zgłoszenia.
8. Zgłoszenia są przechowywane w Cloudflare D1. Eksport TXT: GET `https://ADRES-WORKERA/reports.txt` z nagłówkiem `Authorization: Bearer ADMIN_TOKEN`. **Nie dodawaj tokenu do kodu strony**. Eksport wykonuje administrator, np. przez curl z komputera.

Bezpieczny eksport z terminala (podstaw własne wartości):
```sh
curl -H "Authorization: Bearer $HEATLOOP_ADMIN_TOKEN" "https://TWOJ-WORKER.workers.dev/reports.txt" -o RAPORT_BLEDOW.txt
```

Dziennik `RAPORT_TESTOW_BETA_0.1.txt` w repozytorium jest osobnym raportem analitycznym, nie automatyczną kopią D1. Do analizy przez ChatGPT trzeba udostępnić eksport TXT albo umożliwić odczyt raportów przez bezpieczne połączenie. Samo utworzenie Workera nie daje asystentowi automatycznego dostępu do bazy.

Uwaga: publiczny formularz jest ograniczony limitem jednego zgłoszenia na minutę na IP, ma pułap wielkości treści i pole antyspamowe. Dla większej liczby użytkowników rozważ Turnstile. Adres publiczny Workera i dostęp do D1 nie powinny ujawniać sekretu administratora.
