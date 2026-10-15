# Pętle podłogówki i rozdzielacz R1 — BETA

## Sposób pracy

1. Dodaj pomieszczenia ręcznie lub na rzucie. Pomieszczenia grzejnikowe są pomijane.
2. Otwórz „Pętle i rozdzielacz”. Sprawdź rurę (domyślnie PEX 16), limit długości i ΔT.
3. Wpisz długości dojścia zasilania oraz powrotu i strefę dla każdego pomieszczenia.
   Domyślne 5 m w każdą stronę wymaga potwierdzenia przez instalatora.
4. Wygeneruj propozycję. Puste pole liczby pętli uruchamia automat; wpisana liczba
   jest respektowana, ale zbyt długie pętle blokują eksport i połączenie z wyceną.
5. Na skalibrowanym rzucie wskaż R1. Użyj „Rysuj” przy konkretnej pętli i zaznacz
   pełną trasę od rozdzielacza przez pomieszczenie i z powrotem. „Zakończ” domyka
   ostatni odcinek do R1. Pętle mają kolory i oznaczenia R1/P1, R1/P2 itd.
6. Zaznacz „Użyj tego planu w wycenie i doborze sterowania TECH”. Sprzęt TECH
   pozostaje opcją dodatkową w wycenie. Powiązanie blokuje ręczną zmianę ilości
   wynikających z planu oraz ponowne ręczne przypisywanie stref w panelu TECH.

Można wykonać wstępny podział bez rzutu. Do rysowania tras potrzebna jest skala
i punkt R1. Pierwsza wersja obsługuje jeden rozdzielacz, maksymalnie 100 pętli;
dobór automatyki zachowuje własne limity liczby stref i siłowników.

## Obliczenia i znaczenie wyników

- Szacowana rura w pomieszczeniu: `powierzchnia / rozstaw_w_metrach × 1,10`.
  Jest to przybliżenie z uwzględnieniem łuków, a nie geometria wygenerowanych rur.
- Dla liczby pętli `n` długość szacowana każdej pętli wynosi
  `rura_w_pomieszczeniu / n + dojście_zasilania + dojście_powrotu`.
- Automat wybiera najmniejszą całkowitą liczbę pętli, która mieści ten szacunek
  w limicie. Powierzchnia i przypisana moc pomieszczenia są dzielone równo.
- Przepływ wody: `l/h = moc_W / (1,163 × ΔT)`; `l/min = l/h / 60`.
  To wymagany przepływ wynikający z przypisanej mocy, nie pomiar ani nastawa zaworu.
- Po narysowaniu pełnej trasy jej długość jest liczona z odcinków i skali.
  Zastępuje cały szacunek z dojściami; dojścia nie są dodawane ponownie.
- Zapas zakupowy z zakładki wyceny jest doliczany dopiero do ilości zamawianej
  rury, nie do długości hydraulicznej ani przepływu pętli.
- Limit 80 m i ΔT 5°C są wartościami początkowymi, nie uniwersalnymi wymaganiami.
  Zmiana oznaczenia rury nie dobiera automatycznie limitu lub współczynników.

Źródła do dalszej weryfikacji projektowej:
- Uponor, zasady projektowania ogrzewania/chłodzenia podłogowego:
  https://brandportal.uponor.com/m/7187327a41365ace/original/TI-planning-principles-UFHC-EN-1186660-v1.pdf
- Zakres obliczeń hydraulicznych i długości pętli z dojściami:
  https://ufhrevit.uponor.com/Manual/22.%20Hydraulic%20Calculations/Hydraulic%20Calculations.html

Moduł nie rozwiązuje strat ciśnienia, doboru pompy, rzeczywistych nastaw zaworów,
wydajności posadzki, strat do dołu, hydrauliki glikolu ani obliczeń strat ciepła.
Nie generuje geometrii ślimaka/meandra, nie omija ścian i nie weryfikuje pokrycia
powierzchni ani odstępu rur. Pole pomieszczenia i rozstaw nadal określa instalator.

## Integralność projektu i eksport

Pomieszczenia mają trwałe identyfikatory; takie same nazwy nie łączą pętli.
Zmiana pomieszczeń, geometrii, skali, R1 lub dojść unieważnia propozycję. Przed
ponownym generowaniem użytkownik potwierdza usunięcie poprzednich tras.
Zmiana ΔT przelicza przepływy bez kasowania tras; zmiana limitu ponownie ocenia
długości. Zmiana strefy aktualizuje powiązane sterowanie.

Plan i trasy zapisują się w istniejącym projekcie JSON wersji 1. Starsze pliki
otrzymują pusty, niepowiązany plan. Zestawienie pętli ma osobny eksport CSV,
a po powiązaniu także tabelę w ofercie HTML/PDF oraz ilości w wycenie materiałów.
Przy wyłączeniu powiązania ostatnie ilości pozostają do ręcznej edycji.

## Testy

W katalogu `heatloop-b`: `npm ci`, następnie `npm test`.
JSDOM jest zależnością wyłącznie do testów, nie jest pobierany przez aplikację.

Zestaw obejmuje 13 istniejących testów, 16 testów automatyki, 18 testów pętli
oraz integrację formularza: propozycja, R1, narysowana pętla, przepływy, wycena,
TECH, CSV, oferta HTML, zapis i odczyt projektu, zmiana ΔT i nieaktualny plan.
Sprawdzenie rzeczywistego renderowania PDF, gestów na telefonie i wyglądu
w przeglądarkach pozostaje do wykonania zgodnie z TESTY_PLATFORM.md.
