"""Experimental HeatLoop Python geometry engine. Metres throughout."""
from math import hypot

def meander(width_m, height_m, spacing_m=0.15, offset_m=0.15):
    """Continuous meander prototype; NOT a counterflow spiral."""
    values=(width_m,height_m,spacing_m,offset_m)
    if not all(isinstance(v,(int,float)) and v>0 for v in values):
        raise ValueError("All dimensions must be positive")
    if width_m<=2*offset_m or height_m<=2*offset_m+spacing_m:
        raise ValueError("Room too small")
    n=2*((int((height_m-2*offset_m)/spacing_m)+1)//2)
    if n<2: raise ValueError("Insufficient passes")
    left,right=offset_m,width_m-offset_m
    route=[]
    for i in range(n):
        y=offset_m+i*spacing_m
        route.extend([(left,y),(right,y)] if i%2==0 else [(right,y),(left,y)])
    return route

def length_m(route):
    return sum(hypot(b[0]-a[0],b[1]-a[1]) for a,b in zip(route,route[1:]))
