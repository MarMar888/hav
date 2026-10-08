"""Builds public/haav-handout.pptx: the /handout page as native, editable PowerPoint shapes and text boxes.

Canva imports .pptx with its text and shapes still editable (File > Import files, or Create a design > Import file).
The page itself (src/app/handout/page.tsx) is the source of truth; this copies its wording and layout, so re-run it
after the page changes:

  python3 scripts/handout-pptx.py <hull.png>

hull.png is public/haav-hull.webp converted to PNG.
The logo comes from public/uw-logo-horizontal.png. Needs `pip install python-pptx`.
"""

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
text(PAD, 1.22, 4.4, 1.3, "A student team building an autonomous boat from the ground up.", size=21, bold=True, spacing=1.05, name="Headline")
box(5.1, 1.17, 2.98, 1.46, fill=WHITE, line=LINE, radius=0.1, name="Hull frame")
slide.shapes.add_picture(str(HULL), Inches(5.3), Inches(1.2), height=Inches(1.4)).name = "Hull render"

# how we model it
label(PAD, 2.9, 4, "How we model it")
box(PAD, 3.12, W, 1.33, fill=PANEL, radius=0.1, name="Model panel")
text(0.6, 3.27, 7.3, 0.3, "First-principles mixed-integer linear programming", size=13, bold=True, name="Model title")
text(
    0.6, 3.62, 7.3, 0.75,
    [[("We build the model from physics up. Each constraint cuts the space of possible boats, and the optimizer finds the fastest one left. Hull resistance comes from ", {}),
      ("Savitsky's planing-hull model", {"bold": True}), (". As we build and test, we keep updating the model and adding constraints: a hybrid of simulation and empirical data.", {})]],
    size=10, color=GRAY, spacing=1.2, name="Model text",
)

# engineers
label(PAD, 4.8, 5, "Engineers from across UW–Madison")
text(PAD, 5.0, W, 0.2, "Each segment of the boat is covered, and members have worked at Tesla, Northrop Grumman, Xcel Energy and Milwaukee Tool.", size=9, color=GRAY, name="Engineers text")
tiles = [
    ("Industrial", "Optimization, composites and manufacturing"),
    ("Mechanical", "Structures, CAD and fabrication"),
    ("Electrical", "Power, battery and high voltage"),
    ("Computer", "Embedded, firmware and software"),
]
tw, gap = 1.81, 0.13
for i, (name, covers) in enumerate(tiles):
    x = PAD + i * (tw + gap)
    box(x, 5.28, tw, 0.78, fill=PANEL, radius=0.07, name=f"Tile: {name}")
    text(x + 0.11, 5.35, tw - 0.2, 0.2, name, size=11, color=CRIMSON, bold=True, name=f"Tile title: {name}")
    text(x + 0.11, 5.58, tw - 0.2, 0.45, covers, size=9, color=GRAY, spacing=1.1, name=f"Tile text: {name}")

# approach
label(PAD, 6.4, 4, "Our approach")
cards = [
    ("Hull", "Plane well and stay light.", ["Hybrid planing composite hull", "Shape tuned by optimization", "Resistance checked in CFD first"]),
    ("Electric", "Every watt-hour to speed.", ["High-voltage battery storage", "Propulsion sized by the model", "Propulsion and cooling co-designed"]),
    ("Autonomous", "Manage drift and controls.", ["GPS, IMU and LIDAR sensing", "Firmware protects the battery", "Software plans the route"]),
]
cw, cgap = 2.45, 0.13
for i, (title, strategy, points) in enumerate(cards):
    x = PAD + i * (cw + cgap)
    box(x, 6.63, cw, 1.75, fill=WHITE, line=LINE, radius=0.1, name=f"Card: {title}")
    text(x + 0.15, 6.75, cw - 0.3, 0.3, title, size=15, bold=True, name=f"Card title: {title}")
    text(x + 0.15, 7.12, cw - 0.3, 0.25, strategy, size=10.5, bold=True, name=f"Card strategy: {title}")
    box(x + 0.15, 7.46, cw - 0.3, 0.01, fill=LINE, name=f"Card rule: {title}")
    text(x + 0.15, 7.58, cw - 0.3, 0.9, [[("●  ", {"color": CRIMSON, "size": 6}), (pt, {})] for pt in points], size=9, color=GRAY, spacing=1.55, name=f"Card points: {title}")

# timeline (same entries as src/lib/timeline.ts, in two columns)
label(PAD, 8.52, 4, "Timeline")
steps = [
    ("Oct 25", "Current hull design frozen"),
    ("Nov 15", "Preliminary design review"),
    ("Dec 1", "Mechanical and electrical design frozen"),
    ("December", "Build the hull and composite parts"),
    ("Early January", "First float and tow test"),
    ("January", "Manufacture and assemble everything"),
    ("Jan–Feb", "Build likely spare parts, in parallel"),
    ("End of January", "Zeroth nautical mile"),
    ("Early February", "Slow drives on the water"),
    ("Mid February", "Start increasing speed"),
    ("Until competition", "Test as much as possible"),
]
colw = (W - 0.3) / 2
for i, (when, what) in enumerate(steps):
    col, row = divmod(i, 6)
    x = PAD + col * (colw + 0.3)
    y = 8.76 + row * 0.22
    box(x, y, colw, 0.01, fill=LINE, name=f"Timeline rule: {what}")
    text(x, y + 0.045, 1.15, 0.16, when, size=8, color=CRIMSON, bold=True, name=f"Timeline date: {what}")
    text(x + 1.2, y + 0.045, colw - 1.2, 0.16, what, size=8, color=GRAY, name=f"Timeline label: {what}")

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
