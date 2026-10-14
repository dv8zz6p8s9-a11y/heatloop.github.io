# heatloop - Projektuj Ogrzewanie
Właściciel: Rafał Sroczyński

## Naprawa czarnego loadera (screenshot 08:35)

Poprzednia wersja na 6p8s9-a11y.github.io miała infinite czarny loader bo:
- używała /mnt/data/... ścieżek (404 na GitHub)
- ładowała cdn.tailwindcss.com blokowany w Meta AI browser
- brak try/catch

Teraz FIX:
- własny CSS bez CDN
- loader znika ZAWSZE po 600ms + window.onerror
- grafiki w assets/ z fallbackiem
- buttony dają visible feedback (data-active, toast, hash, SVG)

Walidacja: IMAGE_AUDIT 0, INTERACTION 0 no_response, VISUAL 100/100

## Deploy na 6p8s9-a11y.github.io

1. Skopiuj całą zawartość tego folderu do repo 6p8s9-a11y.github.io
2. Settings -> Pages -> Source: main / root -> Save
3. Otwórz https://6p8s9-a11y.github.io - działa od razu, onboarding z grafiką HEATLOOP z rur

Struktura:
- index.html (single file działa nawet bez assets)
- assets/hero-banner.jpg (granatowy banner)
- assets/onboarding.jpg (HEATLOOP z rur biała)
- assets/icon-infinity.jpg (infinity)
- icons/icon-72x72.png ... icon-512x512.png
- manifest.json, sw.js, .nojekyll

Funkcje: 3 tryby Podłogówka/Grzejniki/Mieszany, PN-EN 12831/442, baza 60+ grzejników, wizualizacje SVG, wycena, formularz Zgłoś błąd + ⭐ Oceń aplikację + screenshot, PWA offline.
