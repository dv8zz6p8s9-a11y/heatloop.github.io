"""HeatLoop Python Drawing LAB – room measurements and experimental heating routes."""
from math import hypot,cos,sin,pi,atan2,tan,acos,isfinite
from shapely.geometry import Polygon,LineString

SPACINGS=[.10,.125,.15,.20]
MAX_LOOP_M=100.0
WARN_LOOP_M=90.0
def validate_room(pts):
    if not 3<=len(pts)<=200 or any(len(p)!=2 or not all(isfinite(v) for v in p) for p in pts):
        raise ValueError("Nieprawidłowe punkty obrysu")
    room=Polygon(pts)
    if not room.is_valid or room.area<.01:raise ValueError("Obrys pomieszczenia ma przecięcia lub jest zbyt mały")
    return room
def unit(p):
    d=hypot(*p)
    if d<1e-8:raise ValueError("Za krótki odcinek")
    return (p[0]/d,p[1]/d)
def minus(a,b):return (a[0]-b[0],a[1]-b[1])
def plus(a,b):return (a[0]+b[0],a[1]+b[1])
def mul(a,x):return (a[0]*x,a[1]*x)
def cross(a,b):return a[0]*b[1]-a[1]*b[0]
def right(a):return (a[1],-a[0])
def offset(path,d):
    seg=[]
    for a,b in zip(path,path[1:]):
        u=unit(minus(b,a));seg.append((u,plus(a,mul(right(u),d))))
    out=[]
    for i,p in enumerate(path):
        if i in (0,len(path)-1):
            u=seg[0 if i==0 else -1][0];out.append(plus(p,mul(right(u),d)));continue
        a,b=seg[i-1],seg[i];den=cross(a[0],b[0])
        if abs(den)<1e-8:out.append(plus(p,mul(right(a[0]),d)));continue
        t=cross(minus(b[1],a[1]),b[0])/den
        out.append(plus(a[1],mul(a[0],t)))
    return out
def rounded(path,r):
    out=[path[0]]
    for a,b,c in zip(path,path[1:],path[2:]):
        u=unit(minus(b,a));v=unit(minus(c,b));ang=acos(max(-1,min(1,u[0]*v[0]+u[1]*v[1])))
        if ang<1e-8:out.append(b);continue
        if ang>pi-1e-6:raise ValueError("Zwrot 180°")
        trim=r*tan(ang/2)
        if trim>min(hypot(*minus(b,a)),hypot(*minus(c,b)))/2+1e-8:raise ValueError("Brak miejsca na łuk")
        entry=minus(b,mul(u,trim));leave=plus(b,mul(v,trim))
        sign=1 if cross(u,v)>0 else -1
        center=plus(entry,mul((-u[1],u[0]),sign*r))
        t0=atan2(entry[1]-center[1],entry[0]-center[0]);t1=atan2(leave[1]-center[1],leave[0]-center[0])
        if sign>0:
            while t1<t0:t1+=2*pi
        else:
            while t1>t0:t1-=2*pi
        out.append(entry)
        for i in range(1,10):
            t=t0+(t1-t0)*i/10
            out.append((center[0]+r*cos(t),center[1]+r*sin(t)))
        out.append(leave)
    out.append(path[-1]);return out
def cap(path,spacing):
    start=path[-1];u=unit(minus(start,path[-2]));rr=spacing/2
    center=plus(start,mul(right(u),-rr));v=minus(start,center);direction=1 if cross(v,u)>0 else -1
    angle=atan2(v[1],v[0])
    return [(center[0]+rr*cos(angle+direction*pi*k/16),center[1]+rr*sin(angle+direction*pi*k/16)) for k in range(17)]
def rectangle(room,s,clearance,radius,feed,back):
    xmin,ymin,xmax,ymax=room.bounds
    reference=Polygon([(xmin,ymin),(xmax,ymin),(xmax,ymax),(xmin,ymax)])
    if room.symmetric_difference(reference).area>1e-7:raise ValueError("Wielokąt nie jest prostokątem — pętlę zapisano jako planowaną")
    if radius>s/2+1e-8:raise ValueError("Przy tym rozstawie wymagany jest nawrót omega")
    x0,y0=xmin+clearance,ymin+clearance;x1,y1=xmax-clearance,ymax-clearance
    candidates=[]
    for count in range(1,40):
        path=[]
        valid=True
        for k in range(count):
            l=x0+2*k*s;t=y0+2*k*s;rr=x1-2*k*s;b=y1-2*k*s
            if min(rr-l,b-t)<max(3*s,2*radius+s):valid=False;break
            if k==0:path.append((l,b))
            path.extend([(l,t),(rr,t),(rr,b),(l+2*s,b)])
        if not valid:break
        try:
            go=rounded(path,radius);ret=rounded(list(reversed(offset(path,-s))),radius);turn=cap(path,s)
            whole=go+turn[1:]+ret[1:];line=LineString(whole);total=line.length+feed+back
            if room.buffer(-clearance).buffer(1e-7).covers(line) and line.is_simple and total<=MAX_LOOP_M+1e-7:
                candidates.append((count,line.length,go,ret,turn,total))
        except (ValueError,ZeroDivisionError):continue
    if not candidates:raise ValueError("Nie znaleziono bezkolizyjnego ślimaka w limicie 100 m")
    turns,drawn,go,ret,turn,total=max(candidates,key=lambda x:(x[0],x[1]))
    return {"status":"experimental","kind":"counterflow-rectangle","supply":go,"return":ret,"cap":turn,"drawn_m":round(drawn,3),"total_m":round(total,3),"margin_m":round(MAX_LOOP_M-total,3),"turns":turns,"installation_ready":False}
def schematic_rectangle(room, s, clearance, radius, feed, back, rejected_reason):
    """Clearly marked geometric PREVIEW, never a verified installation route.

    Fall back only for rectangular heating fields when the strict generator
    cannot satisfy bend/omega constraints. Build interleaved inward and
    outward rectangular spirals, with a semicircular center turnaround.
    Shapely checks polygon clearance and self-intersections. Sharp corners
    and the s/2 turnaround may NOT meet the requested bend radius.
    """
    xmin,ymin,xmax,ymax=room.bounds
    reference=Polygon([(xmin,ymin),(xmax,ymin),(xmax,ymax),(xmin,ymax)])
    if room.symmetric_difference(reference).area>1e-7:
        raise ValueError("Podgląd schematyczny jest obecnie dostępny tylko dla prostokątów")
    x0,y0=xmin+clearance,ymin+clearance
    x1,y1=xmax-clearance,ymax-clearance
    candidates=[]
    for turns in range(1,35):
        go=[]
        valid=True
        for k in range(turns):
            left=x0+2*k*s
            top=y0+2*k*s
            right_edge=x1-2*k*s
            bottom=y1-2*k*s
            if min(right_edge-left,bottom-top)<max(2.5*s,0.3):
                valid=False
                break
            if k==0:
                go.append((left,bottom))
            go.extend([(left,top),(right_edge,top),
                       (right_edge,bottom),(left+2*s,bottom)])
        if not valid:
            break
        try:
            ret=list(reversed(offset(go,-s)))
            start=go[-1]
            end=ret[0]
            cx=(start[0]+end[0])/2
            cy=(start[1]+end[1])/2
            rad=hypot(*minus(start,end))/2
            angle=atan2(start[1]-cy,start[0]-cx)
            turn=[(cx+rad*cos(angle+pi*j/16),
                   cy+rad*sin(angle+pi*j/16)) for j in range(17)]
            whole=go+turn[1:]+ret[1:]
            line=LineString(whole)
            if not room.buffer(-clearance).buffer(2e-7).covers(line):
                continue
            if not line.is_simple:
                continue
            total=line.length+feed+back
            if total<=MAX_LOOP_M+1e-7:
                candidates.append((turns,line.length,go,ret,turn,total))
        except (ValueError,ZeroDivisionError):
            continue
    if not candidates:
        raise ValueError("Nie ma miejsca na uproszczony podgląd w limicie 100 m")
    turns,drawn,go,ret,turn,total=candidates[-1]
    return {
        "status":"schematic",
        "kind":"counterflow-rectangle-preview",
        "supply":go,
        "return":ret,
        "cap":turn,
        "drawn_m":round(drawn,3),
        "total_m":round(total,3),
        "margin_m":round(MAX_LOOP_M-total,3),
        "turns":turns,
        "warning":"SZKIC – promienie narożników i nawrotu omega nie są zatwierdzone do montażu.",
        "generator_rejection":str(rejected_reason)[:350],
        "installation_ready":False,
    }

def _valid_xy(value):
    return (isinstance(value,(list,tuple)) and len(value)==2
            and all(isinstance(x,(int,float)) and isfinite(x) for x in value))


def _rotate_reflect_point(point,center,turns,reflect=False,inverse=False):
    """Quarter-turn + reflection: exact isometry, preserves spacing/length."""
    x=point[0]-center[0]
    y=point[1]-center[1]
    k=(4-turns)%4 if inverse else turns
    if inverse:
        x,y=[(x,y),(-y,x),(-x,-y),(y,-x)][k]
        if reflect:x=-x
    else:
        if reflect:x=-x
        x,y=[(x,y),(-y,x),(-x,-y),(y,-x)][k]
    return (x+center[0],y+center[1])


def _turn_layout(layout,center,turns,reflect):
    result=dict(layout)
    for key in ("supply","return","cap"):
        result[key]=[
            _rotate_reflect_point(p,center,turns,reflect,True)
            for p in layout[key]
        ]
    return result


def _valid_route_routing(routing,field):
    if routing is None:return {}
    if not isinstance(routing,dict):
        raise ValueError("Nieprawidłowe dane wejścia i wyjścia pętli")
    result={}
    for key in ("preferred_start_m","preferred_end_m","manifold_point_m"):
        point=routing.get(key)
        if point is not None:
            if not _valid_xy(point):raise ValueError("Błędny punkt "+key)
            result[key]=tuple(point)
    guide=routing.get("guide_m",[])
    if not isinstance(guide,list) or len(guide)>25 or not all(_valid_xy(p) for p in guide):
        raise ValueError("Nieprawidłowe punkty dojścia")
    result["guide_m"]=[tuple(p) for p in guide]
    width=routing.get("corridor_width_m",.20)
    if not isinstance(width,(int,float)) or not isfinite(width) or not .10<=width<=.80:
        raise ValueError("Szerokość pasa technicznego musi wynosić 10-80 cm")
    result["corridor_width_m"]=width
    result["direction"]="reverse" if routing.get("direction")=="reverse" else "normal"
    for key in ("preferred_start_m","preferred_end_m"):
        if key in result and field.boundary.distance(
            __import__("shapely").geometry.Point(result[key]))>.80:
            raise ValueError("Preferowany początek lub koniec jest zbyt daleko od pola")
    return result


def _turn_candidates(field,s,clearance,radius,feed,back,routing):
    """Score 8 isometric layouts by marked endpoints and manifold approach.

    The generated inlet/outlet change with the loop orientation; the chosen
    points are measured against preferences, never silently snapped or moved.
    """
    from shapely.geometry import Point
    center=tuple(field.centroid.coords[0])
    widths=field.bounds
    manifold=routing.get("manifold_point_m")
    start_target=routing.get("preferred_start_m")
    end_target=routing.get("preferred_end_m")
    guide=routing.get("guide_m",[])
    reversed_flow=routing.get("direction")=="reverse"
    corridor=None
    if manifold is not None and guide:
        # The user-drawn polyline becomes a protected *preliminary* corridor.
        corridor=LineString([manifold]+guide).buffer(
            routing.get("corridor_width_m",.20)/2+clearance/4,
            cap_style=2,join_style=2
        )
    scored=[]
    duplicates=set()
    for turns in range(4):
        for reflect in (False,True):
            transformed=Polygon([
                _rotate_reflect_point(p,center,turns,reflect)
                for p in list(field.exterior.coords)[:-1]
            ])
            try:
                layout=rectangle(transformed,s,clearance,radius,feed,back)
            except ValueError as strict_error:
                try:
                    layout=schematic_rectangle(
                        transformed,s,clearance,radius,feed,back,str(strict_error)
                    )
                except ValueError:
                    continue
            layout=_turn_layout(layout,center,turns,reflect)
            if reversed_flow:
                outgoing=layout["supply"]
                returning=layout["return"]
                layout["supply"]=list(reversed(returning))
                layout["return"]=list(reversed(outgoing))
                layout["cap"]=list(reversed(layout["cap"]))
            inlet=layout["supply"][0] if layout["supply"] else None
            outlet=layout["return"][-1] if layout["return"] else None
            if inlet is None or outlet is None:continue
            identity=(round(inlet[0],5),round(inlet[1],5),
                      round(outlet[0],5),round(outlet[1],5))
            if identity in duplicates:continue
            duplicates.add(identity)
            if corridor is not None:
                pipe=LineString(layout["supply"]+
                    layout["cap"][1:]+layout["return"][1:])
                near=Point(inlet).buffer(max(.15,s*1.5)).union(
                    Point(outlet).buffer(max(.15,s*1.5)))
                blocked=pipe.intersection(corridor.difference(near))
                if blocked.length>.025:continue
            preference=0
            if start_target:preference+=hypot(*minus(inlet,start_target))
            if end_target:preference+=hypot(*minus(outlet,end_target))
            if not start_target and manifold:
                preference+=.6*hypot(*minus(inlet,manifold))
            if not end_target and manifold:
                preference+=.6*hypot(*minus(outlet,manifold))
            if guide:
                preference+=.4*hypot(*minus(inlet,guide[-1]))
                preference+=.4*hypot(*minus(outlet,guide[-1]))
            # The preferred entrance affects orientation; length/coverage
            # remains a secondary goal (not the other way round).
            scored.append((preference,-layout["drawn_m"],turns,reflect,layout))
    if not scored:return None
    scored.sort(key=lambda item:(item[0],item[1],item[2],item[3]))
    _,_,turns,reflect,chosen=scored[0]
    chosen["orientation_turns"]=turns
    chosen["orientation_reflect"]=reflect
    chosen["direction"]=routing.get("direction","normal")
    chosen["actual_start_m"]=list(chosen["supply"][0])
    chosen["actual_end_m"]=list(chosen["return"][-1])
    chosen["preferred_start_error_m"]=(
        round(hypot(*minus(chosen["supply"][0],start_target)),3)
        if start_target else None
    )
    chosen["preferred_end_error_m"]=(
        round(hypot(*minus(chosen["return"][-1],end_target)),3)
        if end_target else None
    )
    chosen["entrance_selected"]=bool(start_target or end_target or manifold)
    chosen["corridor_considered"]=corridor is not None
    if chosen["status"]=="schematic":
        chosen["warning"]+=" Wybrano orientację względem wejścia; S?/K? są preferencjami, nie gwarancją styku."
    return chosen


def analyze_room(points,settings,heating_points=None,heating_zones=None,zone_settings=None):
    """Analyze multiple independently configured heating fields.

    Each field can have its own spacing, manifold assignment and manually
    measured supply/return approach lengths. Approaches are NOT generated
    automatically by this lab. A planned route is never installation-ready.
    """
    from shapely.ops import unary_union

    room=validate_room(points)
    if heating_zones is not None:
        if not isinstance(heating_zones,list) or not 1<=len(heating_zones)<=40:
            raise ValueError("Wybierz od 1 do 40 pól ogrzewania")
        fields=[validate_room(p) for p in heating_zones]
    elif heating_points is not None:
        fields=[validate_room(heating_points)]
    else:
        fields=[room]

    for field in fields:
        if not room.covers(field):
            raise ValueError("Każde pole ogrzewania musi znajdować się w całości wewnątrz pomieszczenia")
    for i in range(len(fields)):
        for j in range(i+1,len(fields)):
            if fields[i].intersection(fields[j]).area>1e-7:
                raise ValueError("Pola grzewcze nachodzą na siebie; skoryguj nakładające się obszary")

    if zone_settings is not None and (
        not isinstance(zone_settings,list) or len(zone_settings)!=len(fields) or
        any(not isinstance(z,dict) for z in zone_settings)
    ):
        raise ValueError("Ustawienia pętli muszą odpowiadać liczbie pól grzewczych")

    diameter=settings["diameter_m"]
    edge=settings["wall_edge_m"]
    radius=settings["radius_m"]
    if any(not isinstance(v,(int,float)) or not isfinite(v) for v in
           (diameter,edge,radius)):
        raise ValueError("Nieprawidłowe parametry rur")
    if not (0<diameter<=.05 and 0<=edge<=1 and 0<radius<=.5):
        raise ValueError("Nieprawidłowe parametry rur")

    zone_results=[]
    layouts=[]
    for index,field in enumerate(fields):
        zone=zone_settings[index] if zone_settings is not None else {}
        spacing=zone.get("spacing_m",settings["spacing_m"])
        feed=zone.get("feed_m",settings["feed_m"])
        back=zone.get("back_m",settings["back_m"])
        if any(not isinstance(v,(int,float)) or not isfinite(v) for v in
               (spacing,feed,back)):
            raise ValueError("Nieprawidłowe parametry konkretnej pętli")
        if not any(abs(spacing-x)<1e-7 for x in SPACINGS):
            raise ValueError("Rozstaw pojedynczej pętli musi wynosić 10, 12,5, 15 lub 20 cm")
        if not (0<=feed<=100 and 0<=back<=100):
            raise ValueError("Długości dojść do rozdzielacza muszą być nieujemne")
        estimate=field.area/spacing+feed+back
        route=_valid_route_routing(zone.get("routing"),field)
        if route:
            layout=_turn_candidates(field,spacing,edge+diameter/2,
                                    radius,feed,back,route)
        else:
            layout=None
        if layout is None:
            if route and route.get("guide_m") and route.get("manifold_point_m"):
                # No safe approach corridor for the requested routing.
                layout={"status":"planned","kind":"none",
                        "message":"Wskazany pas dojścia koliduje z układem rur. Zmień trasę lub pole grzewcze.",
                        "installation_ready":False}
            else:
                try:
                    layout=rectangle(field,spacing,edge+diameter/2,radius,feed,back)
                except ValueError as e:
                    try:
                        layout=schematic_rectangle(
                            field,spacing,edge+diameter/2,radius,feed,back,str(e)
                        )
                    except ValueError as preview_error:
                        layout={"status":"planned","kind":"none",
                                "message":str(e)+"; "+str(preview_error),
                                "installation_ready":False}
        # Geometric proxy only: tube centerline buffered by half the pitch,
        # intersected with the usable heating region. Not a thermal simulation.
        if layout["status"] in ("experimental","schematic"):
            try:
                pipe=LineString(layout["supply"]+
                                layout["cap"][1:]+layout["return"][1:])
                usable=field.buffer(-(edge+diameter/2))
                occupied=pipe.buffer(spacing/2,resolution=8).intersection(usable)
                covered=occupied.area
                usable_area=usable.area
                ratio=min(1.,covered/usable_area) if usable_area>.00001 else 0.
                layout["geometric_coverage_pct"]=round(100*ratio,1)
                layout["geometric_coverage_m2"]=round(covered,3)
                layout["usable_area_m2"]=round(usable_area,3)
                layout["coverage_method"]="buffered-centerline-proxy"
            except Exception:
                layout["geometric_coverage_pct"]=None
        layouts.append(layout)
        checked_length=layout.get("total_m",estimate)
        # A shortened preview may fit the 100 m maximum while the estimated
        # full-area coverage is longer, so explicitly warn the installer.
        coverage_warning=(layout["status"]=="schematic" and estimate>MAX_LOOP_M+1e-7)
        zone_results.append({
            "index":index,
            "area_m2":round(field.area,4),
            "spacing_m":spacing,
            "feed_m":feed,
            "back_m":back,
            "manifold_id":zone.get("manifold_id"),
            "estimate_m":round(estimate,2),
            "checked_length_m":round(checked_length,3),
            "max_loop_m":MAX_LOOP_M,
            "warning_90m":WARN_LOOP_M<=checked_length<=MAX_LOOP_M+1e-7,
            "over_limit":checked_length>MAX_LOOP_M+1e-7 or coverage_warning,
            "over_80m":checked_length>MAX_LOOP_M+1e-7 or coverage_warning,  # legacy field name; value follows current maximum
            "coverage_warning":coverage_warning,
            "full_area_estimate_m":round(estimate,2),
            "geometric_coverage_pct":layout.get("geometric_coverage_pct"),
            "coverage_incomplete":(
                layout.get("geometric_coverage_pct") is not None and
                layout["geometric_coverage_pct"]<90
            ),
            "length_is_estimate":layout["status"]!="experimental",
            "layout":layout,
        })

    heating=unary_union(fields)
    estimated_total=sum(item["estimate_m"] for item in zone_results)
    if len(fields)>1:
        total_layout={
            "status":"planned",
            "kind":"multiple-heating-fields",
            "message":"Osobne pola mają niezależne rozstawy. Dojścia do rozdzielacza wpisuje instalator; nie jest to automatycznie połączony projekt.",
            "installation_ready":False,
        }
    else:
        total_layout=layouts[0]

    return {
        "area_m2":round(heating.area,4),
        "room_area_m2":round(room.area,4),
        "heating_area_m2":round(heating.area,4),
        "unheated_area_m2":round(max(0,room.area-heating.area),4),
        "heating_zone_count":len(fields),
        "heating_zone_areas_m2":[round(field.area,4) for field in fields],
        "heating_zone_pipe_estimates_m":[item["estimate_m"] for item in zone_results],
        "zone_results":zone_results,
        "perimeter_m":round(room.length,4),
        "estimate_m":round(estimated_total,2),
        "max_loop_m":MAX_LOOP_M,
        "warning_threshold_m":WARN_LOOP_M,
        "estimate_over_limit":any(item["over_limit"] for item in zone_results),
        "axis_offset_m":edge+diameter/2,
        "custom_heating_area":heating_points is not None or heating_zones is not None,
        "layout":total_layout,
    }
