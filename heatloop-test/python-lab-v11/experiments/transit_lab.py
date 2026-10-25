"""Experimental transit corridor reservation. NOT an installation-ready route."""
from shapely.geometry import Polygon, Point, box
SPACINGS=(.10,.125,.15,.20)
MAX_LOOP_M=80.

def reserve_transit(room_points, fields, door, spacing=.15, pipe_diameter=.016, wall_edge=.10, gap=.03):
    if spacing not in SPACINGS: raise ValueError("Rozstaw 10/12,5/15/20 cm")
    if not (0<pipe_diameter<=.032 and 0<=wall_edge<=.5 and 0<=gap<=.2): raise ValueError("Błędne parametry")
    room=Polygon(room_points)
    zones=[Polygon(f) for f in fields]
    if not room.is_valid or room.area<.01 or not 2<=len(zones)<=20: raise ValueError("Błędny obrys lub liczba pól")
    if any(not z.is_valid or z.area<.01 or not room.buffer(1e-7).covers(z) for z in zones): raise ValueError("Nieprawidłowe pole")
    if any(zones[i].intersection(zones[j]).area>1e-7 for i in range(len(zones)) for j in range(i+1,len(zones))): raise ValueError("Pola nakładają się")
    if not room.buffer(1e-7).covers(Point(door)): raise ValueError("Drzwi poza pomieszczeniem")
    ordered=sorted(range(len(zones)),key=lambda i:zones[i].distance(Point(door)))
    idx=ordered[0]; near=zones[idx]; pairs=len(zones)-1
    width=2*pairs*max(spacing,pipe_diameter+gap)+pipe_diameter+2*gap
    minx,miny,maxx,maxy=near.bounds; dx,dy=door
    distances=[abs(dx-minx),abs(dx-maxx),abs(dy-miny),abs(dy-maxy)]
    edge=distances.index(min(distances))
    strips=[box(minx,miny,minx+width,maxy),box(maxx-width,miny,maxx,maxy),
            box(minx,miny,maxx,miny+width),box(minx,maxy-width,maxx,maxy)]
    reserved=near.intersection(strips[edge]); remaining=near.difference(reserved)
    axis=remaining.buffer(-(wall_edge+pipe_diameter/2))
    status="candidate" if not axis.is_empty and axis.area>.01 else "blocked"
    return {"status":status,"near_field_index":idx,"far_field_indices":ordered[1:],
        "transit_pipe_count":2*pairs,"reserved_width_m":round(width,3),
        "heat_area_before_m2":round(near.area,3),"heat_area_after_m2":round(remaining.area,3),
        "reserved_area_m2":round(reserved.area,3),"usable_axis_area_m2":round(axis.area,3),
        "limit_m":MAX_LOOP_M,
        "note":"Poglądowa rezerwacja bez wyznaczenia tras, kolizji rur ani promieni gięcia."}
