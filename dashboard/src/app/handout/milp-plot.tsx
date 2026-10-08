// An abstract mixed-integer linear program in two variables. Every edge of the shaded polygon is one constraint,
// drawn dashed where it continues past the polygon; the dots are the integer points that survive all of them; the
// red arrow is the objective, with dashed red lines of equal value stepping toward it. Not our numbers, and no
// optimum is marked. Y is SVG pixels: smaller y is higher on the page.

const CRIMSON = "#c5050c";
const PLOT = { x0: 40, x1: 400, y0: 12, y1: 160 };

// Convex polygon, clockwise from the lower left. Each edge is a constraint.
const POLY: [number, number][] = [
  [40, 140],
  [64, 98],
  [126, 56],
  [214, 30],
  [304, 40],
  [366, 82],
  [386, 160],
  [40, 160],
];

const GRAD: [number, number] = [0.5, -0.85]; // objective direction (up and to the right)

const cross = (a: [number, number], b: [number, number], p: [number, number]) =>
  (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
const inside = (p: [number, number]) => POLY.every((a, i) => cross(a, POLY[(i + 1) % POLY.length], p) >= 0);

const DOTS: [number, number][] = [];
for (let x = PLOT.x0; x <= PLOT.x1; x += 20) {
  for (let y = PLOT.y1; y >= PLOT.y0; y -= 12) {
    if (inside([x, y])) DOTS.push([x, y]);
  }
}

// Each constraint edge, pushed out past both ends (clipped to the plot).
const LINES = POLY.slice(0, 7).map((a, i) => {
  const b = POLY[i + 1];
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  return { x1: a[0] - dx * 1.4, y1: a[1] - dy * 1.4, x2: b[0] + dx * 1.4, y2: b[1] + dy * 1.4 };
});

// Lines of equal objective value: g . p = c, stepping toward the objective.
const g2 = GRAD[0] ** 2 + GRAD[1] ** 2;
const values = POLY.map((p) => GRAD[0] * p[0] + GRAD[1] * p[1]);
const ISO = [0.28, 0.5, 0.72].map((f) => {
  const c = Math.min(...values) + f * (Math.max(...values) - Math.min(...values));
  const base = [(c * GRAD[0]) / g2, (c * GRAD[1]) / g2];
  const perp = [-GRAD[1], GRAD[0]];
  return { x1: base[0] - perp[0] * 400, y1: base[1] - perp[1] * 400, x2: base[0] + perp[0] * 400, y2: base[1] + perp[1] * 400 };
});

const pts = POLY.map((p) => p.join(",")).join(" ");
const label = "fill-zinc-700 text-[8.5px]";

export function MilpPlot() {
  return (
    <svg viewBox="0 0 425 190" role="img" aria-label="Abstract feasible region of a mixed-integer linear program" className="h-auto w-full">
      <defs>
        <clipPath id="milp-clip">
          <rect x={PLOT.x0} y={PLOT.y0} width={PLOT.x1 - PLOT.x0 + 20} height={PLOT.y1 - PLOT.y0} />
        </clipPath>
      </defs>

      <polygon points={pts} fill="#e4e4e7" />

      <g clipPath="url(#milp-clip)">
        {LINES.map((l, i) => (
          <line key={i} {...l} stroke="#71717a" strokeWidth={1} strokeDasharray="3 3" />
        ))}
        {ISO.map((l, i) => (
          <line key={i} {...l} stroke={CRIMSON} strokeWidth={1} strokeOpacity={0.55} strokeDasharray="2 3" />
        ))}
      </g>

      <polygon points={pts} fill="none" stroke="#18181b" strokeWidth={2} strokeLinejoin="round" />

      {DOTS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2} fill="#52525b" />
      ))}

      {/* axes and objective direction */}
      <path d={`M${PLOT.x0} ${PLOT.y0}V${PLOT.y1}H${PLOT.x1 + 20}`} fill="none" stroke="#18181b" strokeWidth={1.2} />
      <text x={PLOT.x1 + 12} y={PLOT.y1 + 14} className={label}>x₁</text>
      <text x={PLOT.x0 - 14} y={PLOT.y0 + 8} className={label}>x₂</text>
      <path d="M392 132L416 91" stroke={CRIMSON} strokeWidth={1.8} fill="none" />
      <path d="M415.3 101.1L416 91L407.5 96.5" stroke={CRIMSON} strokeWidth={1.8} fill="none" />
    </svg>
  );
}
