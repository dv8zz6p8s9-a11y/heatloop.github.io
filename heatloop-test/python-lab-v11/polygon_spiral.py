"""Experimental polygon spiral geometry for HeatLoop.

Only validated, contiguous previews are emitted. This is not an installation approval.
"""
from math import hypot
from shapely.geometry import LineString, Polygon, Point

def _rings(field, clearance, pitch):
    rings=[]
    distance=clearance
    for _ in range(80):
        geom=field.buffer(-distance, join_style=2)
        if geom.is_empty: break
        if geom.geom_type!="Polygon":
            # A disconnected heating region needs a routing planner, not a guessed join.
            break
        if geom.area<.004: break
        coords=[tuple(map(float,p)) for p in list(geom.exterior.coords)[:-1]]
        if len(coords)<3: break
        rings.append(coords)
        distance+=pitch
    return rings

def _cycle(coords, anchor):
    start=min(range(len(coords)), key=lambda i:(coords[i][0]-anchor[0])**2+(coords[i][1]-anchor[1])**2)
    ordered=coords[start:]+coords[:start]
    return ordered+[ordered[0]]

def _build_candidates(field, clearance, pitch):
    rings=_rings(field,clearance,pitch)
    if not rings: return []
    candidates=[]
    for anchor in [(field.bounds[0],field.bounds[1]),(field.bounds[2],field.bounds[1]),
                   (field.bounds[2],field.bounds[3]),(field.bounds[0],field.bounds[3])]:
        parts=[]
        for coords in rings:
            parts.append(_cycle(coords,anchor))
        if not parts: continue
        # Each nested contour is cut at its anchor, then joined by an inward bridge.
        # The resulting spiral is provisional until verified as a complete tube route.
        path=[]
        for ring in parts:
            if path: path.append(ring[0])
            path.extend(ring if not path else ring[1:])
        candidates.append(path)
    return candidates

def polygon_preview(field, pitch, clearance, radius, feed, back):
    """Generate a guarded polygon preview; never label it construction-ready."""
    if not isinstance(field,Polygon) or not field.is_valid:
        return None
    usable=field.buffer(-clearance)
    if usable.is_empty or usable.geom_type!="Polygon": return None
    candidates=_build_candidates(field,clearance,pitch)
    for path in candidates:
        if len(path)<4:continue
        line=LineString(path)
        if not line.is_simple or not usable.buffer(1e-7).covers(line):continue
        # A full heating circuit requires a safe return line; leave this candidate
        # as a diagnostic until the return path and turn radii are validated.
        continue
    return None

def polygon_diagnostics(field,pitch,clearance):
    usable=field.buffer(-clearance)
    if usable.is_empty:return "Brak miejsca po uwzględnieniu odstępu od ściany."
    if usable.geom_type!="Polygon":
        return "Pole rozdziela się na części po odsunięciu rury; wymagane bezkolizyjne połączenie."
    rings=_rings(field,clearance,pitch)
    return ("Wykryto "+str(len(rings))+" konturów wewnętrznych. "
            "Trwa opracowanie bezkolizyjnego połączenia zasilania, nawrotu i powrotu.")
