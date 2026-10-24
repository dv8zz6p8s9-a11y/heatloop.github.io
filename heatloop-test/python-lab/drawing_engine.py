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
def analyze_room(points,settings):
    room=validate_room(points)
    s=settings["spacing_m"];diameter=settings["diameter_m"];edge=settings["wall_edge_m"];radius=settings["radius_m"];feed=settings["feed_m"];back=settings["back_m"]
    if any(not isinstance(v,(int,float)) or not isfinite(v) for v in (s,diameter,edge,radius,feed,back)):raise ValueError("Nieprawidłowe liczby")
    if not any(abs(s-x)<1e-7 for x in SPACINGS):raise ValueError("Rozstaw: 10, 12,5, 15 lub 20 cm")
    if not (0<diameter<=.05 and 0<=edge<=1 and 0<radius<=.5 and 0<=feed<=100 and 0<=back<=100):raise ValueError("Nieprawidłowe parametry rur")
    est=room.area/s+feed+back
    try:layout=rectangle(room,s,edge+diameter/2,radius,feed,back)
    except ValueError as e:layout={"status":"planned","kind":"none","message":str(e),"installation_ready":False}
    return {"area_m2":round(room.area,4),"perimeter_m":round(room.length,4),"estimate_m":round(est,2),"estimate_over_limit":est>80,"axis_offset_m":edge+diameter/2,"layout":layout}
