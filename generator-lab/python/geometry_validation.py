"""Geometry validation for HeatLoop LAB using the maintained Shapely API.

Install: python -m pip install -r requirements.txt
Coordinates are metres. This module is for test/build validation, not
currently executed by GitHub Pages.
"""
from shapely.geometry import LineString, Polygon

def validate_layout(room, route, wall_offset_m=0.15, pipe_diameter_m=0.016):
    """Reject a route outside the room, too near walls, or self-intersecting."""
    polygon = Polygon(room)
    if not polygon.is_valid or polygon.is_empty or polygon.area <= 0:
        raise ValueError("Invalid room polygon")
    if len(route) < 2:
        raise ValueError("Route needs at least two points")
    if wall_offset_m < 0 or pipe_diameter_m <= 0:
        raise ValueError("Invalid clearances")
    line = LineString(route)
    if line.is_empty or line.length <= 0:
        raise ValueError("Empty route")
    clearance = wall_offset_m + pipe_diameter_m / 2
    interior = polygon.buffer(-clearance)
    inside = not interior.is_empty and interior.buffer(1e-9).covers(line)
    return {
        "valid_room": True,
        "inside_clearance": inside,
        "simple_route": line.is_simple,
        "length_m": line.length,
        "valid": bool(inside and line.is_simple),
    }

def inward_boundaries(room, wall_offset_m=0.15, pitch_m=0.30):
    """Return inward offset contours for experimental spiral planning."""
    polygon = Polygon(room)
    if not polygon.is_valid or polygon.area <= 0:
        raise ValueError("Invalid room")
    if wall_offset_m <= 0 or pitch_m <= 0:
        raise ValueError("Invalid offset or pitch")
    contours = []
    distance = wall_offset_m
    for _ in range(500):
        shape = polygon.buffer(-distance, join_style="mitre")
        if shape.is_empty:
            break
        geoms = list(shape.geoms) if shape.geom_type == "MultiPolygon" else [shape]
        contours.append([list(geom.exterior.coords) for geom in geoms])
        distance += pitch_m
    return contours
