"""HeatLoop geometry preflight. Metres, pipe centerlines; NOT a spiral generator."""
from dataclasses import dataclass
from math import isfinite
from shapely.geometry import LineString, Polygon

ALLOWED_SPACING_M = (0.10, 0.125, 0.15, 0.20)
MAX_LOOP_M = 80.0


@dataclass(frozen=True)
class CircuitRules:
    spacing_m: float = 0.15
    pipe_diameter_m: float = 0.016
    wall_to_pipe_edge_m: float = 0.10
    supply_to_manifold_m: float = 0.0
    return_to_manifold_m: float = 0.0
    min_bend_radius_m: float = 0.08

    def __post_init__(self):
        values = vars(self)
        if not all(isfinite(v) for v in values.values()):
            raise ValueError("Parameters must be finite")
        if not any(abs(self.spacing_m - s) < 1e-9 for s in ALLOWED_SPACING_M):
            raise ValueError("Spacing must be 10, 12.5, 15 or 20 cm")
        if self.pipe_diameter_m <= 0 or self.wall_to_pipe_edge_m < 0:
            raise ValueError("Invalid pipe diameter or wall clearance")
        if self.supply_to_manifold_m < 0 or self.return_to_manifold_m < 0:
            raise ValueError("Manifold runs cannot be negative")
        if self.min_bend_radius_m <= 0:
            raise ValueError("Bend radius must be positive")

    @property
    def wall_to_pipe_axis_m(self):
        return self.wall_to_pipe_edge_m + self.pipe_diameter_m / 2


def preflight(room_vertices, pipe_centerline, rules: CircuitRules):
    """Basic validation, not a hydraulic design or complete bend/spacing check."""
    room = Polygon(room_vertices)
    if not room.is_valid or room.is_empty or room.area <= 0:
        raise ValueError("Room polygon is invalid")
    if len(pipe_centerline) < 2:
        raise ValueError("Route requires at least two points")
    route = LineString(pipe_centerline)
    if route.is_empty or route.length <= 0:
        raise ValueError("Route has no length")
    safe = room.buffer(-rules.wall_to_pipe_axis_m)
    inside = not safe.is_empty and safe.buffer(1e-9).covers(route)
    length_m = route.length + rules.supply_to_manifold_m + rules.return_to_manifold_m
    return {
        "room_area_m2": round(room.area, 6),
        "wall_to_pipe_axis_m": rules.wall_to_pipe_axis_m,
        "drawn_length_m": round(route.length, 6),
        "total_length_m": round(length_m, 6),
        "within_80m": length_m <= MAX_LOOP_M + 1e-9,
        "inside_wall_clearance": bool(inside),
        "no_self_crossings": bool(route.is_simple),
        "preflight_pass": bool(inside and route.is_simple and length_m <= MAX_LOOP_M + 1e-9),
        "bend_radius_verified": False,
        "spacing_verified": False,
        "installation_ready": False,
    }
