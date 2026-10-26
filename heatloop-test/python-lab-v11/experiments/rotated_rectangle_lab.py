"""HeatLoop v11 LAB — rectangular loop support when the whole field is rotated.
This is an isolated experiment, NOT a replacement for drawing_engine.py.
Does not solve omega turns, L rooms, obstacles or approach routing.
"""
from math import atan2, degrees
from shapely.geometry import Polygon
from shapely.affinity import rotate
from drawing_engine import rectangle

def _turn_points(points, angle, center):
    return [list(rotate_point(p, angle, center)) for p in points]

def rotate_point(p, angle, center):
    from math import radians, cos, sin
    t = radians(angle)
    x,y=p[0]-center[0],p[1]-center[1]
    return (center[0]+x*cos(t)-y*sin(t),center[1]+x*sin(t)+y*cos(t))

def rotated_rectangle(field, spacing, clearance, radius, feed=0, back=0):
    """Return a validated rectangle spiral for a rotated rectangular polygon.

    Raises ValueError if it is not a rectangle or the base engine rejects
    radius/spacing, geometry, collision, or total loop length.
    """
    if not isinstance(field,Polygon) or not field.is_valid or field.is_empty:
        raise ValueError("Invalid heating polygon")
    coords=list(field.exterior.coords)[:-1]
    if len(coords)!=4 or len(field.interiors):
        raise ValueError("Only a four-corner rectangle is supported")
    edge=(coords[1][0]-coords[0][0],coords[1][1]-coords[0][1])
    if edge[0]**2+edge[1]**2<1e-12:
        raise ValueError("Degenerate rectangle edge")
    angle=degrees(atan2(edge[1],edge[0]))
    origin=(field.centroid.x,field.centroid.y)
    aligned=rotate(field,-angle,origin=origin)
    xmin,ymin,xmax,ymax=aligned.bounds
    reference=Polygon([(xmin,ymin),(xmax,ymin),(xmax,ymax),(xmin,ymax)])
    if aligned.symmetric_difference(reference).area>1e-6*max(1,aligned.area):
        raise ValueError("The polygon is not a rectangle")
    layout=rectangle(aligned,spacing,clearance,radius,feed,back)
    for key in ("supply","return","cap"):
        layout[key]=_turn_points(layout[key],angle,origin)
    layout["kind"]="counterflow-rotated-rectangle-lab"
    layout["orientation_degrees"]=round(angle,4)
    layout["installation_ready"]=False
    return layout
