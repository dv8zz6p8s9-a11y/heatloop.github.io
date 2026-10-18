# HeatLoop — test plan generator v2 (2026-10-18)

## Tests required before integration
1. Geometry: closed vs open path; exactly two free endpoints; one connected component; no self-intersections; no zero-length segments.
2. Central S: inflection at room center, G1 tangency at entry/exit, minimum curvature radius, no intersections with surrounding turns.
3. Spacing: shortest segment-segment distance (not just vertex distance), between nonadjacent curves including Bézier segments; tolerances at corners.
4. Transformations: translation/rotation preserve length and clearance; reflection twice returns original; nonuniform resize requires regeneration and revalidation.
5. Room shapes: 2x2, 6x4, 10x2, 2x10, L-shaped, concave, narrow neck, hole/obstacle; invalid polygons.
6. Boundary: NaN/Infinity, zero/negative spacing, 0/100/120/121 m limits, feed allowance >= limit, zero area, huge coordinate values.
7. Routes: doorway portal, wall collision, tangent to wall, overlapping wall, editing waypoint, supply/return both accounted.
8. Numeric: compare curve arc length by integration and sampling; repeatable output; count loops near threshold.
9. UI: one/two-finger gestures, adding/removing/selection, reflow after resize, stable pointer capture, iOS Safari and Android Chrome.
10. Acceptance: no material quantities or quotes from unvalidated geometry.

## Observed issues in existing prototypes
- `spiral-overlay.mjs`: open rectangular spiral with no return, no adjacent paired endpoints; 90-degree corners; `reverseDirection` toggles mirror flag but only reverses point order.
- `checkSpacing`: vertex proximity only; can miss crossings of segments without close vertices.
- `configureRoom`: does not reject +Infinity spacing; room geometry not validated for self-intersection.
- `coverageEstimate`: raster area/spacing estimate, not routed length; `layoutLoops` count is an estimate.
- Mobile editor: `shape()` yields two independent paths, S added as separate SVG path, anisotropic scaling distorts spacing and radii; no collision validation.
- `roundedPath` uses quadratic curves but no engineering radius calculation.
- Routes: wall hits do not distinguish door portals.

## Testing status
Independent Python reproduction of relevant mathematical expressions completed on 2026-10-18; **not** a run of original Node source. Need original Node unit tests, browser screenshots, and integration tests before release.
