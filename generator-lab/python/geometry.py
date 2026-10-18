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

def segment_intersection(a,b,c,d):
    """True for proper crossings; touching at an endpoint is not a crossing."""
    def orient(p,q,r): return (q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])
    return orient(a,b,c)*orient(a,b,d)<-1e-12 and orient(c,d,a)*orient(c,d,b)<-1e-12

def self_crossings(route):
    """Count non-adjacent proper segment intersections."""
    return sum(segment_intersection(route[i],route[i+1],route[j],route[j+1])
               for i in range(len(route)-1) for j in range(i+2,len(route)-1))

def reverse_route(route):
    return list(reversed(route))

def bend_points(route, radius_m=0.08, samples=12):
    """Replace orthogonal 90-degree corners with circular fillets."""
    from math import atan2,cos,sin,pi
    if radius_m<=0: raise ValueError("Radius must be positive")
    if len(route)<3: return list(route)
    result=[route[0]]
    for a,b,c in zip(route,route[1:],route[2:]):
        dx1,dy1=b[0]-a[0],b[1]-a[1]
        dx2,dy2=c[0]-b[0],c[1]-b[1]
        l1,l2=hypot(dx1,dy1),hypot(dx2,dy2)
        if min(l1,l2)<1e-10 or abs(dx1*dx2+dy1*dy2)>1e-8:
            result.append(b);continue
        t=min(radius_m,l1/2,l2/2)
        u=(dx1/l1,dy1/l1);v=(dx2/l2,dy2/l2)
        entry=(b[0]-u[0]*t,b[1]-u[1]*t)
        exit=(b[0]+v[0]*t,b[1]+v[1]*t)
        center=(entry[0]+v[0]*t,entry[1]+v[1]*t)
        a0=atan2(entry[1]-center[1],entry[0]-center[0])
        a1=atan2(exit[1]-center[1],exit[0]-center[0])
        cross=u[0]*v[1]-u[1]*v[0]
        if cross>0:
            while a1<a0:a1+=2*pi
        else:
            while a1>a0:a1-=2*pi
        result.append(entry)
        for k in range(1,samples):
            theta=a0+(a1-a0)*k/samples
            result.append((center[0]+t*cos(theta),center[1]+t*sin(theta)))
        result.append(exit)
    result.append(route[-1])
    return result

def generate_layout(width_m,height_m,spacing_m=0.15,offset_m=0.15,bend_radius_m=0.08):
    """Serializable LAB layout. Geometry remains an experimental meander."""
    raw=meander(width_m,height_m,spacing_m,offset_m)
    smooth=bend_points(raw,bend_radius_m)
    return {"type":"meander-experimental","points":smooth,
            "length_m":length_m(smooth),"crossings":self_crossings(smooth),
            "supply":smooth[0],"return":smooth[-1]}

def spiral_inward_tracks(width_m,height_m,spacing_m=0.15,offset_m=0.15):
    """Experimental inward track of a two-arm spiral, 2*spacing pitch.

    This is NOT a finished heating circuit: the interleaved outward arm and
    centre U-turn must be generated and validated before use in the UI.
    """
    vals=(width_m,height_m,spacing_m,offset_m)
    if any(not isinstance(v,(int,float)) or not 0<v<float("inf") for v in vals):
        raise ValueError("Invalid dimensions")
    left,top=offset_m,offset_m
    right,bottom=width_m-offset_m,height_m-offset_m
    if min(right-left,bottom-top)<4*spacing_m:
        raise ValueError("Room too small for spiral")
    route=[(right,top),(right,bottom),(left,bottom),(left,top)]
    for k in range(1,100):
        x0=left+2*k*spacing_m
        x1=right-2*k*spacing_m
        y0=top+2*k*spacing_m
        y1=bottom-2*k*spacing_m
        if min(x1-x0,y1-y0)<2*spacing_m: break
        route.extend([(x1,y0),(x1,y1),(x0,y1),(x0,y0)])
    return route
