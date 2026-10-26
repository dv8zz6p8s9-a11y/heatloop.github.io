# HeatLoop v11 — testy wieczorne 26.10.2026

Gałąź laboratoryjna: `lab/generator-evening-2026-10-26`. **Bez podmiany produkcji.**

## Przygotowana zmiana
`rotated_rectangle_lab.py`: eksperymentalny adapter pozwalający wykorzystać istniejący `drawing_engine.rectangle()` dla pól będących prostokątami obróconymi. Transformuje pole do układu osi, uruchamia istniejącą kontrolę geometrii/długości, a następnie obraca wynik z powrotem.

**Celowo nie obejmuje:** pomieszczeń L, nawrotów omega, automatycznego rozpoznawania ścian/drzwi, pomniejszania pola o dojścia i wspólnego układania kilku pętli. Przy zbyt małym rozstawie względem promienia nadal zgłasza odmowę.

## Jak uruchomić testy
Z katalogu `heatloop-test/python-lab-v11` po zainstalowaniu `shapely`:
```bash
python -m unittest discover -s experiments -p 'test_rotated_rectangle_lab.py'
```
Testy: prostokąt obrócony o 30°, prostokąt osiowy, odrzucenie pola L, odrzucenie konfiguracji wymagającej nawrotu omega.

**Status:** pliki testowe dodane; testów nie uruchomiono w tym zadaniu. Wynik należy zweryfikować lokalnie/CI.

## Plan następnych prób
1. Potwierdzić cztery testy na aktualnym Shapely/Python.
2. Dodać konturowy generator dla L w osobnej wersji (bez szkicowania jako sukces).
3. Osobno opracować łuki omega i sprawdzać minimalny promień gięcia.
4. Następnie zintegrować bezkolizyjne dojścia; na koniec porównać pięć pól grzewczych z referencyjnego JSON.
5. Testy Safari dopiero po włączeniu zatwierdzonej metody do osobnego widoku LAB.

Limit całkowity: 100 mb, ostrzeżenie: 90 mb.