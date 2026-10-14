# HeatLoop — instrukcja dla grupy testowej

**Adres aplikacji:** https://dv8zz6p8s9-a11y.github.io/heatloop.github.io/heatloop-b/

**Status:** BETA. To narzędzie testowe, niezatwierdzony projekt wykonawczy. Obliczenia, moce, materiały i ceny należy sprawdzić przed wykorzystaniem na budowie.

## Pierwsze 10 minut
1. Otwórz aplikację w przeglądarce na iOS, Androidzie lub Windows.
2. Wybierz **Praca z rysunku**, a następnie jeden z systemów: grzejniki, podłogowe mokre, frezowane lub mieszany.
3. Wczytaj rzut JPG/PNG/PDF i skalibruj znany odcinek.
4. Obrysuj pomieszczenie. W trybie mieszanym przypisz mu technologię.
5. Dla grzejników użyj narzędzia **Umieść grzejnik** i kliknij wewnątrz pomieszczenia grzejnikowego.
6. Sprawdź bilans mocy, zestawienie materiałów i eksport CSV.
7. Zapisz projekt JSON i sprawdź, czy po ponownym otwarciu wszystko pozostało na miejscu.
8. W **Wycena i zasilanie** wybierz **Pobierz dane z projektu**, uzupełnij ceny i sprawdź ofertę PDF.

## Zgłaszanie błędów
Zapisz: urządzenie i wersję systemu, przeglądarkę, kroki odtworzenia, oczekiwany i rzeczywisty wynik, zrzut ekranu. **Nie udostępniaj danych osobowych klientów ani poufnych rzutów** w publicznym zgłoszeniu.

Zgłoszenia: https://github.com/dv8zz6p8s9-a11y/heatloop.github.io/issues

## Znane ograniczenia
- Nie ma automatycznej synchronizacji katalogów HAP Armatura, Hydrosolar, Onninen i Purmo; moduł grzejników obsługuje lokalny import CSV.
- Dobór mocy grzejników i długości rur jest orientacyjny; brakuje kompletnego projektu hydraulicznego.
- Ceny katalogowe nie są pobierane automatycznie. Oferta PDF wymaga uzupełnienia cen grzejników, armatury i materiałów frezowanych.
- Część funkcji PDF pobiera biblioteki z internetu.
- Testy na fizycznych urządzeniach i przeglądarkach nie zostały jeszcze potwierdzone.

Szczegółowa macierz: [TESTY_PLATFORM.md](TESTY_PLATFORM.md).
