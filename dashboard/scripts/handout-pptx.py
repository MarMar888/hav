"""Builds public/haav-handout.pptx: the /handout page as native, editable PowerPoint shapes and text boxes.

Canva imports .pptx with its text and shapes still editable (File > Import files, or Create a design > Import file).
The page itself (src/app/handout/page.tsx) is the source of truth; this copies its wording and layout, so re-run it
after the page changes:

  python3 scripts/handout-pptx.py <hull.png>

hull.png is public/haav-hull.webp converted to PNG.
The logo comes from public/uw-logo-horizontal.png. Needs `pip install python-pptx`.
"""

import re
import sys
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parent.parent
HULL = Path(sys.argv[1])
LOGO = ROOT / "public" / "uw-logo-horizontal.png"
OUT = ROOT / "public" / "haav-handout.pptx"

FONT = "Arial"
CRIMSON, INK, GRAY, MUTED, PANEL, LINE, WHITE, DARK = (
    RGBColor.from_string(h) for h in ("C5050C", "18181B", "3F3F46", "71717A", "F4F4F5", "E4E4E7", "FFFFFF", "18181B")
)

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(8.5), Inches(11)
slide = prs.slides.add_slide(prs.slide_layouts[6])


def box(x, y, w, h, fill=None, line=None, radius=None, name=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    if radius:
        shape.adjustments[0] = radius / min(w, h)
    if fill is None:
        shape.fill.background()
    else:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = Pt(0.75)
    shape.shadow.inherit = False
    if name:
        shape.name = name
    return shape


def text(x, y, w, h, runs, size=10, color=INK, bold=False, align=PP_ALIGN.LEFT, spacing=None, anchor=MSO_ANCHOR.TOP, name=None):
    """runs: a string, or a list of paragraphs, each a string or a list of (text, {bold, color}) runs."""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    if name:
        tb.name = name
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    paragraphs = [runs] if isinstance(runs, str) else runs
    for i, para in enumerate(paragraphs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        if spacing:
            p.line_spacing = spacing
        for seg in [(para, {})] if isinstance(para, str) else para:
            t, o = seg
            r = p.add_run()
            r.text = t
            r.font.name = FONT
            r.font.size = Pt(o.get("size", size))
            r.font.bold = o.get("bold", bold)
            r.font.color.rgb = o.get("color", color)
    return tb


def label(x, y, w, s):
    text(x, y, w, 0.2, s.upper(), size=8, color=MUTED, bold=True, name=f"Label: {s}")


PAD = 0.42
W = 8.5 - 2 * PAD

# header band
box(0, 0, 8.5, 1.0, fill=CRIMSON, name="Header band")
text(PAD, 0.16, 4, 0.55, "Haav", size=36, color=WHITE, bold=True, name="Title")
text(PAD, 0.72, 5, 0.2, "HIGHLY AMPHIBIOUS / AUTONOMOUS VEHICLE", size=8, color=WHITE, name="Subtitle")
box(6.04, 0.12, 2.04, 0.76, fill=WHITE, radius=0.08, name="Logo plate")
slide.shapes.add_picture(str(LOGO), Inches(6.12), Inches(0.17), height=Inches(0.66)).name = "UW-Madison logo"

# hero
text(PAD, 1.1, 4.4, 1.0, "A student team building an autonomous boat from the ground up.", size=20, bold=True, spacing=1.05, name="Headline")
box(5.1, 1.12, 2.98, 1.1, fill=WHITE, line=LINE, radius=0.1, name="Hull frame")
slide.shapes.add_picture(str(HULL), Inches(5.55), Inches(1.15), height=Inches(1.04)).name = "Hull render"

# how we model it
label(PAD, 2.36, 4, "How we model it")
box(PAD, 2.56, W, 1.08, fill=PANEL, radius=0.1, name="Model panel")
text(0.6, 2.64, 7.3, 0.3, "First-principles mixed-integer linear programming", size=12.5, bold=True, name="Model title")
text(
    0.6, 2.94, 7.3, 0.7,
    [[("We build the model from physics up. Each constraint cuts the space of possible boats, and the optimizer finds the fastest one left. Hull resistance comes from ", {}),
      ("Savitsky's planing-hull model", {"bold": True}), (". As we build and test, we keep updating the model and adding constraints: a hybrid of simulation and empirical data.", {})]],
    size=9, color=GRAY, spacing=1.15, name="Model text",
)

# engineers
label(PAD, 3.8, 4.5, "Engineers from across UW–Madison")
text(3.9, 3.8, W - 3.48, 0.18, "Experience at Tesla, Northrop Grumman, Xcel Energy and Milwaukee Tool", size=7.5, color=GRAY, align=PP_ALIGN.RIGHT, name="Engineers text")
tiles = [
    ("Industrial", "Optimization, composites and manufacturing"),
    ("Mechanical", "Structures, CAD and fabrication"),
    ("Electrical", "Power, battery and high voltage"),
    ("Computer", "Embedded, firmware and software"),
]
tw, gap = 1.81, 0.13
for i, (name, covers) in enumerate(tiles):
    x = PAD + i * (tw + gap)
    box(x, 4.02, tw, 0.7, fill=PANEL, radius=0.07, name=f"Tile: {name}")
    text(x + 0.11, 4.08, tw - 0.2, 0.2, name, size=10.5, color=CRIMSON, bold=True, name=f"Tile title: {name}")
    text(x + 0.11, 4.3, tw - 0.2, 0.4, covers, size=8.5, color=GRAY, spacing=1.1, name=f"Tile text: {name}")

# approach
label(PAD, 4.9, 4, "Our approach")
cards = [
    ("Hull", "Plane well and stay light.", ["Hybrid planing composite hull", "Shape tuned by optimization", "Resistance checked in CFD first"]),
    ("Electric", "Every watt-hour to speed.", ["High-voltage battery storage", "Propulsion sized by the model", "Propulsion and cooling co-designed"]),
    ("Autonomous", "Manage drift and controls.", ["GPS, IMU and LIDAR sensing", "Firmware protects the battery", "Software plans the route"]),
]
cw, cgap = 2.45, 0.13
for i, (title, strategy, points) in enumerate(cards):
    x = PAD + i * (cw + cgap)
    box(x, 5.12, cw, 1.52, fill=WHITE, line=LINE, radius=0.1, name=f"Card: {title}")
    text(x + 0.15, 5.18, cw - 0.3, 0.3, title, size=14, bold=True, name=f"Card title: {title}")
    text(x + 0.15, 5.5, cw - 0.3, 0.25, strategy, size=10, bold=True, name=f"Card strategy: {title}")
    box(x + 0.15, 5.78, cw - 0.3, 0.01, fill=LINE, name=f"Card rule: {title}")
    text(x + 0.15, 5.86, cw - 0.3, 0.75, [[("●  ", {"color": CRIMSON, "size": 6}), (pt, {})] for pt in points], size=8.5, color=GRAY, spacing=1.5, name=f"Card points: {title}")


# timeline: read from src/lib/timeline.ts so the handout and the site never disagree
def read_timeline():
    src = (ROOT / "src" / "lib" / "timeline.ts").read_text(encoding="utf-8")
    body = src[src.index("= [", src.index("export const TIMELINE")):]
    entries = []
    for block in re.findall(r"\{(.*?)\}", body, re.S):
        fields = dict(re.findall(r'(\w+):\s*"((?:[^"\\]|\\.)*)"', block))
        if "when" in fields and "label" in fields:
            entries.append(fields)
    return entries


TL = read_timeline()
colw = (W - 0.3) / 2
text_w = colw - 1.0
chars_per_line = int(text_w / 0.052 * 0.92)  # 7.5 pt Arial, a little conservative


def entry_height(e):
    lines = -(-len(e.get("detail", "")) // chars_per_line) if e.get("detail") else 0
    return 0.16 + lines * 0.122 + 0.09


total = sum(entry_height(e) for e in TL)
label(PAD, 6.84, 4, "Timeline")
col, y, used = 0, 7.06, 0.0
for e in TL:
    h = entry_height(e)
    if col == 0 and used + h / 2 > total / 2:
        col, y = 1, 7.06
    x = PAD + col * (colw + 0.3)
    box(x, y, colw, 0.01, fill=LINE, name=f"Timeline rule: {e['label']}")
    text(x, y + 0.05, 0.95, 0.16, e["when"], size=8, color=CRIMSON, bold=True, name=f"Timeline date: {e['label']}")
    paras = [[(e["label"], {"bold": True, "color": INK, "size": 8.5})]]
    if e.get("detail"):
        paras.append([(e["detail"], {"size": 7.5})])
    text(x + 1.0, y + 0.05, text_w, h - 0.05, paras, size=7.5, color=GRAY, spacing=1.0, name=f"Timeline: {e['label']}")
    y += h
    if col == 0:
        used += h

# footer
box(0, 10.17, 8.5, 0.83, fill=DARK, name="Footer band")
text(PAD, 10.33, 3.0, 0.25, "Sponsor the build", size=15, color=WHITE, bold=True, name="Footer title")
text(PAD, 10.6, 2.75, 0.4, "We are looking for funds, parts, advisors and people to build our BOM as we design.", size=8.5, color=RGBColor.from_string("B5B5BB"), name="Footer tagline")
text(3.25, 10.3, 2.0, 0.2, "LEARN MORE", size=8, color=RGBColor.from_string("9A9AA2"), align=PP_ALIGN.CENTER, name="Footer link label")
text(3.25, 10.5, 2.0, 0.3, "bit.ly/haav", size=14, color=WHITE, bold=True, align=PP_ALIGN.CENTER, name="Footer link")
text(5.3, 10.27, 2.78, 0.2, "CONTACT", size=8, color=RGBColor.from_string("9A9AA2"), align=PP_ALIGN.RIGHT, name="Footer contact label")
text(5.3, 10.45, 2.78, 0.22, "Marley Barrett, Project lead", size=10.5, color=WHITE, bold=True, align=PP_ALIGN.RIGHT, name="Footer contact name")
text(5.3, 10.68, 2.78, 0.2, "mhbarrett@wisc.edu", size=9.5, color=RGBColor.from_string("D4D4D8"), align=PP_ALIGN.RIGHT, name="Footer contact email")

prs.save(OUT)
print(f"wrote {OUT}")
