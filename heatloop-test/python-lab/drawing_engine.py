"""HeatLoop Python Drawing LAB – room measurements and experimental heating routes."""
from math import hypot,cos,sin,pi,atan2,tan,acos,isfinite
from shapely.geometry import Polygon,LineString

SPACINGS=[.10,.125,.15,.20]
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
            if room.buffer(-clearance).buffer(1e-7).covers(line) and line.is_simple and total<=80+1e-7:
                candidates.append((count,line.length,go,ret,turn,total))
        except (ValueError,ZeroDivisionError):continue
    if not candidates:raise ValueError("Nie znaleziono bezkolizyjnego ślimaka w limicie 80 m")
    turns,drawn,go,ret,turn,total=max(candidates,key=lambda x:(x[0],x[1]))
    return {"status":"experimental","kind":"counterflow-rectangle","supply":go,"return":ret,"cap":turn,"drawn_m":round(drawn,3),"total_m":round(total,3),"margin_m":round(80-total,3),"turns":turns,"installation_ready":False}
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
            if total<=80+1e-7:
                candidates.append((turns,line.length,go,ret,turn,total))
        except (ValueError,ZeroDivisionError):
            continue
    if not candidates:
        raise ValueError("Nie ma miejsca na uproszczony podgląd w limicie 80 m")
    turns,drawn,go,ret,turn,total=candidates[-1]
    return {
        "status":"schematic",
        "kind":"counterflow-rectangle-preview",
        "supply":go,
        "return":ret,
        "cap":turn,
        "drawn_m":round(drawn,3),
        "total_m":round(total,3),
        "margin_m":round(80-total,3),
        "turns":turns,
        "warning":"SZKIC – promienie narożników i nawrotu omega nie są zatwierdzone do montażu.",
        "generator_rejection":str(rejected_reason)[:350],
        "installation_ready":False,
    }

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
        layouts.append(layout)
        checked_length=layout.get("total_m",estimate)
        # A shortened schematic can fit within 80 m while the area/spacing
        # estimate for a fully heated field still exceeds that limit.
        coverage_warning=(layout["status"]=="schematic" and estimate>80+1e-7)
        zone_results.append({
            "index":index,
            "area_m2":round(field.area,4),
            "spacing_m":spacing,
            "feed_m":feed,
            "back_m":back,
            "manifold_id":zone.get("manifold_id"),
            "estimate_m":round(estimate,2),
            "checked_length_m":round(checked_length,3),
            "over_80m":checked_length>80+1e-7 or coverage_warning,
            "coverage_warning":coverage_warning,
            "full_area_estimate_m":round(estimate,2),
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
        "estimate_over_limit":any(item["over_80m"] for item in zone_results),
        "axis_offset_m":edge+diameter/2,
        "custom_heating_area":heating_points is not None or heating_zones is not None,
        "layout":total_layout,
    }
