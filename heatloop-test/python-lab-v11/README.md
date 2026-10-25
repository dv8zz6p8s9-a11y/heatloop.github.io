# HeatLoop Python LAB v1.1 RC — testy

To **oddzielna wersja testowa**. Nie zastępuje `heatloop-test/python-lab-v10` ani aplikacji produkcyjnej.

## Testowanie w przeglądarce
1. Otwórz [HeatLoop Python LAB v1.1](rysunek.html?v=111).
2. Aby nie zaczynać od zera, pobierz [projekt demonstracyjny JSON](examples/projekt_demo_v11.json) i wczytaj przez **Ustawienia → Otwórz projekt**.
3. Sprawdź **podziałkę liniową w prawym dolnym rogu**; po kalibracji na rysunku nie widać wymiarów dodanych przez aplikację.
4. Workflow: **Rysunek → Pokoje → Pola grzewcze → Rozdzielacze → Pętle i dojścia**.
5. W zakładce Rozdzielacze obracaj R1/R2 o **±90°** i obserwuj symbol w czerwonej ramce.
6. Generuj pętle — sprawdź **100 m** jako maksimum (część grzewcza + zasilanie + powrót), od 90 m ostrzeżenie.
7. Zapisz **NOWY JSON**, ponownie otwórz i porównaj dane.
8. Przełącz na **Widok techniczny** i wyeksportuj SVG TEST z podziałką.

## Bezpieczeństwo
- Stara wersja v1.0 bez zmian.
- Back-up: `backup/python-lab-v10-before-v11-20261025`.
- Duże obliczenia zależą od pobrania Python/Shapely z internetu.
- **Nie jest to projekt wykonawczy**. Podgląd dojść, nawroty i całkowite pokrycie pola wymagają weryfikacji.

## Dokumentacja
[Zmiany v1.1 i pełna procedura odbioru](ZMIANY_V11_SCENARIUSZE_TESTOWE.md).  
[Specyfikacja oryginalnego algorytmu v1.0 (archiwalna)](SPECYFIKACJA_GENERATORA_V10_TEST.md).
