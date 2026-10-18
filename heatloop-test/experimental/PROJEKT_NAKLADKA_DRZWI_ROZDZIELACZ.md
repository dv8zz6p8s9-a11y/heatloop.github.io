# HeatLoop BETA — nakładka ślimaka i przejścia drzwiowe

Status: zatwierdzona koncepcja funkcjonalna, nie zaimplementowana w aplikacji.
Data: 2026-10-18

## Cel
Na rzucie całego budynku instalator umieszcza gotowe wektorowe nakładki ślimaków (1–N obiegów na pomieszczenie). Nakładki można przesuwać, obracać, rozciągać i korygować punktami kontrolnymi, również w nieregularnych pomieszczeniach. Geometria rury, a nie obraz rastrowy, stanowi źródło długości i kontroli rozstawu.

## Przejście przez drzwi
- Otwór drzwiowy jest domyślnym, preferowanym portalem wyjścia z pomieszczenia dla zasilania i powrotu do rozdzielacza.
- Import PDF/JPG/PNG: rozpoznanie drzwi jest propozycją wymagającą zatwierdzenia; instalator może ręcznie zaznaczyć portal. Import CAD może dostarczyć geometrię otworów, o ile jest dostępna.
- Portal ma identyfikator, odcinek przejścia, szerokość, pomieszczenia po obu stronach i status potwierdzenia.
- Ściany stanowią przeszkody; przekroczenie dozwolone tylko przez potwierdzone portale (drzwi lub osobne przejścia techniczne).
- Nie prowadzić rur przez skrzydło drzwi ani próg bez sprawdzenia warunków montażowych; symbol drzwi na rzucie nie gwarantuje dopuszczalności przejścia.
- Przy wielu drzwiach wybierać trasę z uwzględnieniem długości, przeszkód i przepustowości przejść; instalator może wybrać inny portal.
- Brak bezpiecznej trasy: ostrzeżenie i tryb korekty ręcznej, bez fikcyjnego połączenia przez ścianę.

## Powiązanie nakładki z trasą
- Każdy obieg ma niezmienne ID, wektorową geometrię ślimaka, punkt początku i końca, identyfikator rozdzielacza oraz osobne polilinie zasilania i powrotu.
- Nakładka ślimaka i dojścia są osobnymi edytowalnymi warstwami.
- Przesunięcie / deformacja nakładki aktualizuje punkty początku/końca i ponownie wyznacza tylko potrzebny fragment dojścia; zatwierdzone punkty korekty użytkownika pozostają przypięte, jeśli to możliwe.
- W razie konfliktu z istniejącą trasą: oznaczyć problem i poprosić o zatwierdzenie nowej trasy, zamiast cicho usuwać korekty.
- Długość obiegu = rzeczywista długość ślimaka + dojście zasilające + dojście powrotne. Nie mnożyć automatycznie jednego dojścia przez 2, jeśli trasy są różne.
- Każda zmiana geometrii powoduje ponowne obliczenie długości, walidację kolizji, odstępów rur, promieni gięcia (wg specyfikacji wybranej rury), oraz danych do wyceny.

## Kolejność w HeatLoop (zachować wcześniejsze etapy)
1. Import rzutu, kalibracja skali, ściany i pomieszczenia.
2. Rozpoznanie / ręczne wskazanie otworów drzwiowych i przejść technicznych.
3. Generuj pętle: ustaw rozstaw rur i odsunięcie od ścian, wybierz wzór nakładki; bez automatycznego podziału.
4. Ułóż pętle: dopasuj nakładki; dopiero tutaj automatyczny podział pomieszczenia na obiegi, jeśli potrzebny.
5. Umieść rozdzielacz(e).
6. Połącz automatycznie: prowadź zasilanie/powrót przez zatwierdzone portale.
7. Korekta ręczna: punkty tras, portale, początek i kierunek pętli.
8. Wycena na podstawie zweryfikowanych długości i materiałów.

## Zasady techniczne i ograniczenia
- Standardowo do 100 m/obieg; 100–120 m wyłącznie po wyraźnym zatwierdzeniu instalatora. Kontrola długości uwzględnia obie drogi do rozdzielacza.
- Wzór nakładki ma stałą topologię, ale nie wolno go skalować jak bitmapy kosztem nieprawidłowego rozstawu; deformacja wymaga walidacji lub regeneracji geometrii.
- Wymagane testy: pokoje w kształcie L, wnęki, kilka drzwi, ślepy korytarz, dwa rozdzielacze, kilka obiegów w jednym pomieszczeniu, przesuwanie obrysu, przecięcia ścian, brak portalu, zmiany skali.
- Podkład rastrowy nie jest wiarygodną geometrią bez kalibracji i potwierdzenia ścian/drzwi.
- Obecne moduły experimental są prototypami, nie stanowią jeszcze kompletnego algorytmu wyznaczania ślimaka ani automatycznego trasowania przez drzwi.
