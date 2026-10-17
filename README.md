# HeatLoop

Aktualna aplikacja BETA: **[heatloop-b/](https://dv8zz6p8s9-a11y.github.io/heatloop.github.io/heatloop-b/)**. Strona produktu: **https://heatloop.pl** (osobny Site i repozytorium źródłowe).

- `heatloop-b/`: główna aplikacja, moduł grzejników, formularz zgłoszeń, moduły obliczeń i rysunku. Szczegóły w `heatloop-b/README.md`.
- `help/`: lokalny asystent pomocy; `aiEndpoint=null`. `help/server/` jest opcjonalnym, niewdrożonym serwerem dopasowania tematów, nie częścią uruchamianej BETA.
- `instrukcja.html`, `pomoc.html`, `materialy/`: pomoc i instrukcja PDF.
- `wdrozenie/`: kontrolowany pakiet aktualizacji dla obu hostów i kopia strony produktu. Nie zastępuje serwerowego wdrożenia Site ani bazy dziennych sum.
- główny `index.html`: zachowana wcześniejsza, osobna aplikacja React. Nie jest źródłem BETA ani stroną heatloop.pl. Dołączony skompilowany React i CSS są potrzebne tej wersji; ich krótkie nazwy zmiennych nie oznaczają złośliwego kodu. Nie usuwać ich ręcznie z pakietu.
- `sw.js`, `manifest.json`, `icon-*.png`: PWA wcześniejszej aplikacji. Tryb offline nie zastępuje BETA starą aplikacją.
- `heatloop-test/`: historyczny, osobny prototyp do porównań. GitHub Pages udostępnia także ten katalog, jeżeli znajduje się on w publikowanym drzewie.
- `heatloop-b/backend/`: niewdrożony szablon alternatywnego zapisu zgłoszeń. Aktualny formularz korzysta z FormSubmit; szablon nie obsługuje jego załączników i nie jest gotowym przełącznikiem backendu.

## Sprawdzenie

```sh
npm ci --prefix heatloop-b
npm test --prefix heatloop-b
node wdrozenie/prepare-update.mjs --manifest
node --test help/tests/*.test.mjs wdrozenie/tests/*.test.mjs
```

Raport przeglądu: [AUDYT_KODU_2026-10-17.md](AUDYT_KODU_2026-10-17.md). Usunięte resztki eksportu pozostają odzyskiwalne w historii Git. Nie ma potrzeby utrzymywania ich jako publicznych plików.
