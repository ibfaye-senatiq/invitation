#!/usr/bin/env python
"""Génère les ornements SVG de l'invitation.

Parti pris graphique : filigrane *gravé* (traits fins, pas d'aplats) plutôt que dentelle
pleine photographique — plus élégant en vectoriel, net à toutes les tailles, et léger.

Usage : python tools/make-ornements.py
"""
import math
import os
import random

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")
os.makedirs(OUT, exist_ok=True)

BURGUNDY = "#5e1420"
BURGUNDY_MID = "#7a1d2c"
BURGUNDY_DEEP = "#3f0b15"
GOLD = "#b58f55"
GOLD_LIGHT = "#dcc08a"
IVORY = "#f6efe4"

# Épaisseur globale des traits : un faire-part gravé doit rester lisible même réduit à
# ~140 px de large sur mobile.
STROKE = 1.8


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


DEFS = f"""<defs>
  <linearGradient id="inkGrad" x1="0" y1="0" x2="0.8" y2="1">
    <stop offset="0" stop-color="{BURGUNDY_MID}"/>
    <stop offset=".55" stop-color="{BURGUNDY}"/>
    <stop offset="1" stop-color="{BURGUNDY_DEEP}"/>
  </linearGradient>
  <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="{GOLD_LIGHT}"/>
    <stop offset="1" stop-color="{GOLD}"/>
  </linearGradient>
</defs>"""


# ------------------------------------------------------------------ primitives
def spline(points, width=1.3, color="url(#inkGrad)", opacity=1.0, cap="round", dash=None):
    """Courbe lissée (Catmull-Rom → cubiques) passant par les points."""
    width = width * STROKE
    d = f"M{f(points[0][0])} {f(points[0][1])}"
    for i in range(len(points) - 1):
        p0 = points[max(i - 1, 0)]
        p1 = points[i]
        p2 = points[i + 1]
        p3 = points[min(i + 2, len(points) - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}"
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return (
        f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{f(width)}" '
        f'stroke-opacity="{opacity}" stroke-linecap="{cap}" stroke-linejoin="round"{da}/>'
    )


def spiral(cx, cy, r, turns=1.6, start=0.0, cw=1, width=1.1, color="url(#inkGrad)", opacity=0.9):
    pts = []
    n = 26
    for i in range(n):
        t = i / (n - 1)
        a = start + cw * t * turns * 2 * math.pi
        rad = r * (1 - 0.72 * t)
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    return spline(pts, width=width, color=color, opacity=opacity)


def leaf(x, y, length, angle, curve=0.35, width=1.2, color="url(#inkGrad)", opacity=0.95):
    """Feuille en amande, en trait."""
    width = width * STROKE
    a = math.radians(angle)
    tipx = x + length * math.cos(a)
    tipy = y + length * math.sin(a)
    mx, my = x + length * 0.5 * math.cos(a), y + length * 0.5 * math.sin(a)
    nx, ny = -math.sin(a), math.cos(a)
    w = length * curve
    return (
        f'<path d="M{f(x)} {f(y)} Q{f(mx + nx*w)} {f(my + ny*w)} {f(tipx)} {f(tipy)} '
        f'Q{f(mx - nx*w)} {f(my - ny*w)} {f(x)} {f(y)} Z" fill="none" stroke="{color}" '
        f'stroke-width="{f(width)}" stroke-opacity="{opacity}" stroke-linejoin="round"/>'
        f'<path d="M{f(x)} {f(y)} Q{f(mx + nx*w*0.15)} {f(my + ny*w*0.15)} {f(tipx)} {f(tipy)}" '
        f'fill="none" stroke="{color}" stroke-width="{f(width*0.55)}" stroke-opacity=".4"/>'
    )


def blossom(cx, cy, r, petals=5, width=1.0, rot=0.0, color="url(#inkGrad)", fill=IVORY):
    """Petite fleur : pétales en goutte + cœur doré."""
    width = width * STROKE
    out = [f'<g transform="translate({f(cx)} {f(cy)}) rotate({f(rot)})">']
    for i in range(petals):
        a = i * (360 / petals)
        rx, ry = r * 0.42, r * 0.62
        out.append(
            f'<path d="M0 0 C{f(-rx)} {f(-ry*0.7)} {f(-rx*0.7)} {f(-ry*1.35)} 0 {f(-ry*1.45)} '
            f'C{f(rx*0.7)} {f(-ry*1.35)} {f(rx)} {f(-ry*0.7)} 0 0 Z" '
            f'transform="rotate({a})" fill="{fill}" fill-opacity=".8" stroke="{color}" '
            f'stroke-width="{f(width)}" stroke-opacity=".9"/>'
        )
    out.append(f'<circle r="{f(r*0.16)}" fill="url(#goldGrad)" fill-opacity=".95"/>')
    out.append("</g>")
    return "".join(out)


def bud(x, y, r, angle, width=0.9):
    width = width * STROKE
    return (
        f'<g transform="translate({f(x)} {f(y)}) rotate({f(angle)})">'
        f'<path d="M0 0 C{f(-r*0.8)} {f(-r)} {f(r*0.8)} {f(-r)} 0 {f(-r*2.1)} '
        f'C{f(-r*0.8)} {f(-r)} {f(r*0.8)} {f(-r)} 0 0 Z" fill="{IVORY}" fill-opacity=".55" '
        f'stroke="url(#inkGrad)" stroke-width="{f(width)}" stroke-opacity=".85"/></g>'
    )


# ------------------------------------------------------------------ coin
def make_corner(size=560):
    """Filigrane de coin : deux tiges maîtresses, feuillage, fleurs, perles dorées."""
    w = h = size
    p = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">',
        DEFS,
        # lavis très léger pour asseoir le motif sur le papier
        f'<radialGradient id="wash" cx="0" cy="0" r="1">'
        f'<stop offset="0" stop-color="{BURGUNDY}" stop-opacity=".11"/>'
        f'<stop offset=".55" stop-color="{BURGUNDY}" stop-opacity=".05"/>'
        f'<stop offset="1" stop-color="{BURGUNDY}" stop-opacity="0"/></radialGradient>',
        f'<circle cx="0" cy="0" r="{size*0.46}" fill="url(#wash)"/>',
        # arcade de festons collée au coin : rappel de dentelle, en trait
        "".join(
            f'<path d="M{f(size*0.585*math.cos(math.radians(a0)))} {f(size*0.585*math.sin(math.radians(a0)))} '
            f'A {f(size*0.585)} {f(size*0.585)} 0 0 1 '
            f'{f(size*0.585*math.cos(math.radians(a0+7)))} {f(size*0.585*math.sin(math.radians(a0+7)))}" '
            f'fill="none" stroke="url(#inkGrad)" stroke-opacity=".45" stroke-width="{f(1.0*STROKE)}"/>'
            for a0 in range(2, 88, 7)
        ),
    ]
    arc_pts = []
    for i in range(13):
        t = i / 12
        ang = math.radians(4 + t * 82)
        r = size * (0.50 - 0.035 * math.sin(math.pi * t))
        arc_pts.append((r * math.cos(ang), r * math.sin(ang)))
    p.append(spline(arc_pts, width=1.5))

    arc2 = []
    for i in range(11):
        t = i / 10
        ang = math.radians(10 + t * 70)
        r = size * (0.345 - 0.02 * math.sin(math.pi * t))
        arc2.append((r * math.cos(ang), r * math.sin(ang)))
    p.append(spline(arc2, width=0.9, opacity=0.6))

    for i in range(1, 12, 2):
        t = i / 12
        ang = 4 + t * 82
        r = size * 0.50
        x, y = r * math.cos(math.radians(ang)), r * math.sin(math.radians(ang))
        p.append(leaf(x, y, size * 0.075, ang + 205, curve=0.42, width=1.0))
        p.append(leaf(x, y, size * 0.075, ang - 25, curve=0.42, width=1.0))
    for i in range(0, 11, 2):
        t = i / 10
        ang = 10 + t * 70
        r = size * 0.345
        x, y = r * math.cos(math.radians(ang)), r * math.sin(math.radians(ang))
        p.append(leaf(x, y, size * 0.062, ang + 200, curve=0.5, width=0.9, opacity=0.8))

    for ang, rr in ((18, 0.50), (45, 0.487), (72, 0.50)):
        x = size * rr * math.cos(math.radians(ang))
        y = size * rr * math.sin(math.radians(ang))
        p.append(blossom(x, y, size * 0.039, petals=5, rot=ang + 12, width=0.9))
    for ang in (30, 58):
        x = size * 0.345 * math.cos(math.radians(ang))
        y = size * 0.345 * math.sin(math.radians(ang))
        p.append(blossom(x, y, size * 0.026, petals=5, rot=ang, width=0.8))
        p.append(bud(x, y - size * 0.03, size * 0.012, ang))

    p.append(spiral(size * 0.135, size * 0.135, size * 0.085, turns=1.5, start=0.6))
    p.append(spiral(size * 0.115, size * 0.40, size * 0.05, turns=1.4, start=0.2, cw=-1))
    p.append(spiral(size * 0.40, size * 0.115, size * 0.05, turns=1.4, start=2.4))
    p.append(spline([(size * 0.05, size * 0.05), (size * 0.10, size * 0.115), (size * 0.135, size * 0.135)],
                    width=1.2))
    p.append(spline([(size * 0.135, size * 0.135), (size * 0.30, size * 0.20), (size * 0.44, size * 0.235)],
                    width=0.9, opacity=0.55))
    rnd = random.Random(4)
    for i in range(9):
        t = i / 8
        ang = math.radians(14 + t * 62)
        r = size * 0.555
        p.append(
            f'<circle cx="{f(r*math.cos(ang))}" cy="{f(r*math.sin(ang))}" r="{f(1.6+rnd.uniform(0,0.6))}" '
            f'fill="url(#goldGrad)" fill-opacity=".8"/>'
        )
    p.append("</svg>")
    open(os.path.join(OUT, "filigrane-coin.svg"), "w", encoding="utf-8").write("".join(p))


# ------------------------------------------------------------------ bordure
def make_border(w=800, h=150):
    p = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">',
        DEFS,
    ]
    base = h * 0.62
    pts = [(w * (i / 16), base - math.sin(i / 16 * math.pi * 2) * h * 0.11) for i in range(17)]
    p.append(spline(pts, width=1.4))
    for i in range(1, 17):
        x, y = pts[i]
        up = -1 if i % 2 else 1
        p.append(leaf(x, y, h * 0.13, -90 + up * 26, curve=0.45, width=0.95))
    for i in (2, 5, 8, 11, 14):
        x, y = pts[i]
        p.append(blossom(x, y - h * 0.10, h * 0.055, petals=5, rot=i * 9, width=0.9))
        p.append(bud(x - w * 0.02, y - h * 0.015, h * 0.018, -110))
    for i in range(17):
        x, y = pts[i]
        p.append(f'<circle cx="{f(x)}" cy="{f(y + h*0.16)}" r="1.9" fill="url(#goldGrad)" fill-opacity=".75"/>')
    p.append("</svg>")
    open(os.path.join(OUT, "filigrane-bordure.svg"), "w", encoding="utf-8").write("".join(p))


# ------------------------------------------------------------------ gypsophile
def make_gyps(size=280):
    p = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {int(size*1.2)}" '
        f'width="{size}" height="{int(size*1.2)}">',
        DEFS,
    ]
    bx, by = size * 0.5, size * 1.16
    rnd = random.Random(3)
    stems = [(-40, 1.0), (-22, 0.9), (-4, 0.96), (14, 0.88), (32, 0.8), (-56, 0.66), (50, 0.62)]
    for ang, scale in stems:
        a = math.radians(ang - 90)
        length = size * 0.88 * scale
        tipx, tipy = bx + length * math.cos(a), by + length * math.sin(a)
        p.append(
            f'<path d="M{f(bx)} {f(by)} Q{f(bx + length*0.5*math.cos(a) + rnd.uniform(-10,10))} '
            f'{f(by + length*0.5*math.sin(a))} {f(tipx)} {f(tipy)}" fill="none" stroke="url(#goldGrad)" '
            f'stroke-opacity=".7" stroke-width="1" stroke-linecap="round"/>'
        )
        for i in range(11):
            t = rnd.uniform(0.5, 1.0)
            px = bx + length * t * math.cos(a) + rnd.uniform(-13, 13)
            py = by + length * t * math.sin(a) + rnd.uniform(-13, 13)
            r = rnd.uniform(2.0, 4.0)
            p.append(
                f'<circle cx="{f(px)}" cy="{f(py)}" r="{f(r)}" fill="{IVORY}" fill-opacity=".95" '
                f'stroke="url(#goldGrad)" stroke-opacity=".6" stroke-width=".7"/>'
            )
            p.append(f'<circle cx="{f(px)}" cy="{f(py)}" r="{f(r*0.28)}" fill="url(#goldGrad)"/>')
    p.append("</svg>")
    open(os.path.join(OUT, "gypsophile.svg"), "w", encoding="utf-8").write("".join(p))


# ------------------------------------------------------------------ sceau de cire
def make_seal(size=420):
    cx = cy = size / 2
    rnd = random.Random(5)
    pts = []
    n = 96
    for i in range(n):
        a = 2 * math.pi * i / n
        r = size * 0.43 * (1 + 0.032 * math.sin(3.1 * a + 0.7) + rnd.uniform(-0.018, 0.018))
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    d = f"M{f(pts[0][0])} {f(pts[0][1])}"
    for i in range(1, n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}"
    d += " Z"
    p = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">',
        f"""<defs>
  <radialGradient id="sealGrad" cx=".34" cy=".28" r=".9">
    <stop offset="0" stop-color="#b02c42"/>
    <stop offset=".32" stop-color="{BURGUNDY_MID}"/>
    <stop offset=".72" stop-color="{BURGUNDY}"/>
    <stop offset="1" stop-color="{BURGUNDY_DEEP}"/>
  </radialGradient>
  <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="{BURGUNDY_MID}"/>
    <stop offset="1" stop-color="{BURGUNDY_DEEP}"/>
  </linearGradient>
</defs>""",
        f'<g opacity=".95">'
        f'<path d="M{f(cx-size*0.28)} {f(cy+size*0.22)} l{f(-size*0.11)} {f(size*0.30)} '
        f'l{f(size*0.11)} {f(-size*0.07)} l{f(size*0.09)} {f(size*0.10)} Z" fill="url(#ribbonGrad)"/>'
        f'<path d="M{f(cx+size*0.28)} {f(cy+size*0.22)} l{f(size*0.11)} {f(size*0.30)} '
        f'l{f(-size*0.11)} {f(-size*0.07)} l{f(-size*0.09)} {f(size*0.10)} Z" fill="url(#ribbonGrad)"/>'
        f"</g>",
        f'<path d="{d}" fill="url(#sealGrad)" stroke="{BURGUNDY_DEEP}" stroke-opacity=".45" stroke-width="2"/>',
        f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(size*0.352)}" fill="none" stroke="{BURGUNDY_DEEP}" '
        f'stroke-opacity=".38" stroke-width="4"/>',
        f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(size*0.345)}" fill="none" stroke="#c04a5c" '
        f'stroke-opacity=".28" stroke-width="1.2"/>',
        f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(size*0.315)}" fill="none" stroke="{GOLD_LIGHT}" '
        f'stroke-opacity=".30" stroke-width="1.4"/>',
        f'<ellipse cx="{f(cx*0.78)}" cy="{f(cy*0.66)}" rx="{f(size*0.19)}" ry="{f(size*0.10)}" '
        f'fill="#fff" fill-opacity=".12" transform="rotate(-24 {f(cx)} {f(cy)})"/>',
        "</svg>",
    ]
    open(os.path.join(OUT, "sceau.svg"), "w", encoding="utf-8").write("".join(p))


# ------------------------------------------------------------------ papier
def make_paper(size=700):
    p = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">',
        f'<rect width="{size}" height="{size}" fill="{IVORY}"/>',
        '<filter id="grain" x="0" y="0" width="100%" height="100%">'
        '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" seed="9" result="n"/>'
        '<feColorMatrix in="n" type="saturate" values="0"/>'
        '<feComponentTransfer><feFuncA type="linear" slope="0.42"/></feComponentTransfer></filter>',
        f'<rect width="{size}" height="{size}" filter="url(#grain)" opacity=".55"/>',
        '<filter id="fib" x="0" y="0" width="100%" height="100%">'
        '<feTurbulence type="fractalNoise" baseFrequency="0.008 0.35" numOctaves="2" seed="4" result="v"/>'
        '<feColorMatrix in="v" type="saturate" values="0"/>'
        '<feComponentTransfer><feFuncA type="linear" slope="0.30"/></feComponentTransfer></filter>',
        f'<rect width="{size}" height="{size}" filter="url(#fib)" opacity=".35"/>',
        "</svg>",
    ]
    open(os.path.join(OUT, "papier.svg"), "w", encoding="utf-8").write("".join(p))


if __name__ == "__main__":
    make_corner()
    make_border()
    make_gyps()
    make_seal()
    make_paper()
    for name in sorted(os.listdir(OUT)):
        p = os.path.join(OUT, name)
        print(f"{name:26s} {os.path.getsize(p)/1024:7.1f} Ko")
