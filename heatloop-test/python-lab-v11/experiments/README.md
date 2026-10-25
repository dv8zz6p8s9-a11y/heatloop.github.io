# HeatLoop v11 — Transit LAB

Isolated experiment only. It does NOT modify the running geometry engine.

## What it does
Chooses the field nearest the door, and reserves a conservative strip for 2 supply/return pipes per farther field. Reports the remaining space and available tube-axis area (wall edge measured to the *outer surface* of pipe). Limit metadata: 80 m.

## What it does NOT do
Does NOT route real pipes, draw heating spirals, validate spacing between all tubes, calculate real lengths, or verify bending radii. Do not use for installation.

Run locally: `python -m pip install shapely pytest && python -m pytest -q test_transit_lab.py`.

Reference implementation is an isolated first-pass geometry test. Previous LAB ZIP also contains additional exploratory source. Integrate only after end-to-end geometry verification.
