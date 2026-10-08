// An illustrative mixed-integer linear program in two variables: battery capacity (integer, in cells) and speed.
// Every line is one constraint; the shaded region is what survives all of them. Dots are the integer choices,
// the drive package is a binary switch (the 6 kW drive opens the red wedge), and the star is the fastest feasible
// boat. Shapes are for explanation only, not our numbers. Y is SVG pixels: smaller y means faster.

const CRIMSON = "#c5050c";
const X0 = 40;
const WALL = 300; // mass limit
const BOTTOM = 160; // minimum speed
const CEIL4 = 105; // 4 kW shaft-power ceiling
const CEIL6 = 52; // 6 kW shaft-power ceiling
const energy = (x: number) => 150 - 0.45 * (x - X0); // energy <= 70% of the pack
const current = (x: number) => 120 - 0.18 * (x - X0); // battery current <= 80% of its rating
const X_ENERGY_MEETS_CEIL = 140; // where the energy line reaches the 4 kW ceiling
const X_CROSS = 151; // where the current line takes over from the energy line

// Feasible for a given drive: below every speed cap.
const ok = (x: number, y: number, kw: 4 | 6) =>
  x >= X0 && x <= WALL && y <= BOTTOM && y >= Math.max(energy(x), current(x), kw === 4 ? CEIL4 : CEIL6);

const DOTS: { x: number; y: number; kw: 4 | 6 }[] = [];
for (let x = X0; x <= WALL; x += 20) {
  for (let y = BOTTOM; y >= 60; y -= 12) {
    if (ok(x, y, 4)) DOTS.push({ x, y, kw: 4 });
    else if (ok(x, y, 6)) DOTS.push({ x, y, kw: 6 });
  }
}
const STAR = { x: WALL, y: 76 };

const pts = (p: [number, number][]) => p.map((q) => q.join(",")).join(" ");
const label = "fill-zinc-700 text-[8.5px]";
const dashed = { stroke: "#71717a", strokeWidth: 1, strokeDasharray: "3 3" };
const bold = { stroke: "#18181b", strokeWidth: 2 };

export function MilpPlot() {
  return (
    <svg viewBox="0 0 425 190" role="img" aria-label="Feasible region of a mixed-integer linear program for the boat" className="h-auto w-full">
      {/* the 4 kW region, and the wedge the 6 kW drive adds */}
      <polygon
        points={pts([[X0, BOTTOM], [X0, energy(X0)], [X_ENERGY_MEETS_CEIL, CEIL4], [WALL, CEIL4], [WALL, BOTTOM]])}
        fill="#e4e4e7"
      />
      <polygon
        points={pts([[X_ENERGY_MEETS_CEIL, CEIL4], [X_CROSS, current(X_CROSS)], [WALL, current(WALL)], [WALL, CEIL4]])}
        fill={CRIMSON}
        fillOpacity={0.28}
      />

      {/* axes */}
      <path d={`M${X0} 12V${BOTTOM}H${WALL + 20}`} fill="none" stroke="#18181b" strokeWidth={1.2} />

      {/* constraint lines: dashed where slack, bold where they bind */}
      <line x1={X0} y1={energy(X0)} x2={WALL} y2={energy(WALL)} {...dashed} />
      <line x1={X0} y1={energy(X0)} x2={X_ENERGY_MEETS_CEIL} y2={CEIL4} {...bold} />
      <line x1={X0} y1={current(X0)} x2={WALL} y2={current(WALL)} {...dashed} />
      <line x1={X_CROSS} y1={current(X_CROSS)} x2={WALL} y2={current(WALL)} {...bold} />
      <line x1={X0} y1={CEIL4} x2={WALL} y2={CEIL4} {...dashed} />
      <line x1={X_ENERGY_MEETS_CEIL} y1={CEIL4} x2={WALL} y2={CEIL4} {...bold} />
      <line x1={X0} y1={CEIL6} x2={WALL} y2={CEIL6} {...dashed} />
      <line x1={WALL} y1={12} x2={WALL} y2={BOTTOM} {...bold} />

      {/* integer choices */}
      {DOTS.map((d) => (
        <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r={2} fill={d.kw === 6 ? CRIMSON : "#52525b"} />
      ))}

      {/* optimum */}
      <polygon
        transform={`translate(${STAR.x} ${STAR.y})`}
        points="0,-8 2.4,-2.6 8,-2.4 3.6,1.4 5,7 0,3.8 -5,7 -3.6,1.4 -8,-2.4 -2.4,-2.6"
        fill={CRIMSON}
        stroke="#fff"
        strokeWidth={1}
      />

      {/* labels, kept in the right-hand margin so no line is crossed */}
      <text x={WALL + 6} y={20} className={label}>Mass limit</text>
      <text x={WALL + 6} y={CEIL6 + 3} className={label}>6 kW drive</text>
      <text x={WALL + 6} y={current(WALL) - 6} className={label}>Battery current</text>
      <text x={WALL + 14} y={STAR.y + 12} className="fill-zinc-900 text-[9px] font-semibold">fastest feasible boat</text>
      <text x={WALL + 6} y={CEIL4 + 3} className={label}>4 kW drive</text>
      <text x={44} y={142} className={label} transform="rotate(-24 44 142)">Energy limit</text>

      {/* objective direction and axis title */}
      <path d="M26 150V40" stroke={CRIMSON} strokeWidth={1.6} fill="none" />
      <path d="M22 46l4-8 4 8" stroke={CRIMSON} strokeWidth={1.6} fill="none" />
      <text x={14} y={30} className="text-[8.5px] font-semibold" fill={CRIMSON}>faster</text>
      <text x={X0} y={178} className={label}>Battery capacity (integer cells) →</text>
    </svg>
  );
}
