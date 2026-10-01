"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, RefreshCw, X } from "lucide-react";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";
import { candidateSchema, componentName, feasible, hullName, seconds, type Candidate, type HullResult, type Results } from "@/lib/optimization";

type Point = { candidate: Candidate; hull: HullResult["hull"]; x: number; y: number };
type Factor = { label: string; value: (c: Candidate, h: HullResult["hull"]) => number; format: (n: number) => string };
const decimal = (unit: string, digits = 1) => (n: number) => `${n.toFixed(digits)}${unit}`;
const factors = {
  time: { label: "Race time (min:sec)", value: (c) => c.metrics.race_time_s, format: seconds },
  speed: { label: "Speed (m/s)", value: (c) => c.setup.speed_mps, format: decimal("", 1) },
  power: { label: "Electrical power (kW)", value: (c) => c.metrics.electrical_power_w / 1000, format: decimal("", 1) },
  drag: { label: "Resistance (N)", value: (c) => c.metrics.resistance_n, format: decimal("", 0) },
  energy: { label: "Race energy (Wh)", value: (c) => c.metrics.energy_used_wh, format: decimal("", 0) },
  capacity: { label: "Battery capacity (Wh)", value: (c) => c.metrics.capacity_wh, format: decimal("", 0) },
  mass: { label: "Loaded mass (kg)", value: (c) => c.metrics.mass_kg, format: decimal("", 1) },
  current: { label: "Battery current (A)", value: (c) => c.metrics.current_a, format: decimal("", 0) },
  reserve: { label: "Energy reserve (%)", value: (c) => c.metrics.energy_reserve_fraction * 100, format: decimal("", 0) },
  lcg: { label: "LCG (% from transom)", value: (c) => c.metrics.lcg_fraction * 100, format: decimal("", 1) },
  length: { label: "Hull length (m)", value: (_, h) => h.length_m, format: decimal("", 2) },
  beam: { label: "Hull beam (m)", value: (_, h) => h.beam_m, format: decimal("", 2) },
  transom: { label: "Transom beam (m)", value: (_, h) => h.transom_beam_m ?? Number.NaN, format: decimal("", 2) },
  bowDeadrise: { label: "Bow deadrise (degrees)", value: (_, h) => h.bow_deadrise_deg ?? Number.NaN, format: decimal("", 0) },
  deadrise: { label: "Aft deadrise (degrees)", value: (_, h) => h.aft_deadrise_deg, format: decimal("", 0) },
} satisfies Record<string, Factor>;
type FactorKey = keyof typeof factors;
const plots: { title: string; x: FactorKey; y: FactorKey }[] = [
  { title: "Race time vs. battery capacity", x: "capacity", y: "time" },
  { title: "Power vs. speed", x: "speed", y: "power" },
  { title: "Resistance vs. speed", x: "speed", y: "drag" },
  { title: "Race energy vs. speed", x: "speed", y: "energy" },
  { title: "Race time vs. loaded mass", x: "mass", y: "time" },
  { title: "Race energy vs. capacity", x: "capacity", y: "energy" },
  { title: "Current vs. battery capacity", x: "capacity", y: "current" },
  { title: "Energy reserve vs. battery capacity", x: "capacity", y: "reserve" },
  { title: "Resistance vs. balance", x: "lcg", y: "drag" },
  { title: "Race time vs. hull length", x: "length", y: "time" },
  { title: "Resistance vs. beam", x: "beam", y: "drag" },
  { title: "Resistance vs. aft deadrise", x: "deadrise", y: "drag" },
];

export function FactorPlots({ run, result }: { run: string | null; result: Results }) {
  const [loaded, setLoaded] = useState<{ rows: Candidate[]; missing: string[] } | null>(null);
  const [retry, setRetry] = useState(0);
  const [hullFilter, setHullFilter] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [customX, setCustomX] = useState<FactorKey>("mass");
  const [customY, setCustomY] = useState<FactorKey>("power");
  const hulls = useMemo(() => new Map(result.hulls.map((row) => [row.hull.id, row.hull])), [result]);

  useEffect(() => {
    if (!run) return;
    const controller = new AbortController();
    async function load() {
      const responses = await Promise.allSettled(result.hulls.map(async (row) => {
        const response = await fetch(`/api/optimization?${new URLSearchParams({ run: run!, hull: row.hull.id })}`, { signal: controller.signal });
        if (!response.ok) throw new Error(row.hull.id);
        const parsed = z.array(candidateSchema).parse(await response.json());
        if (parsed.some((c) => c.hull_id !== row.hull.id)) throw new Error("Mismatched hull");
        return parsed;
      }));
      if (controller.signal.aborted) return;
      const rows: Candidate[] = [];
      const missing: string[] = [];
      responses.forEach((response, index) => {
        if (response.status === "fulfilled") rows.push(...response.value);
        else missing.push(result.hulls[index].hull.id);
      });
      setLoaded({ rows, missing });
    }
    void load();
    return () => controller.abort();
  }, [run, result, retry]);

  const data = useMemo(() => run ? loaded?.rows ?? [] : result.hulls.flatMap((r) => r.best ? [r.best] : []), [run, loaded, result]);
  const filtered = useMemo(() => data.filter((c) => (hullFilter === "all" || c.hull_id === hullFilter) && (status === "all" || feasible(c) === (status === "feasible"))), [data, hullFilter, status]);
  const visibleSelected = selected && filtered.some((c) => c.id === selected.id) ? selected : null;

  return <section className="opt-factor-section">
    <div className="opt-section-heading"><h2>Design factor plots</h2><span>{filtered.length.toLocaleString()} evaluated setups</span></div>
    <div className="opt-plot-toolbar">
      <div className="opt-filters"><label className="opt-field">Hull<select aria-label="Plot hull" value={hullFilter} onChange={(e) => setHullFilter(e.target.value)}><option value="all">All hulls</option>{result.hulls.map((r) => <option key={r.hull.id} value={r.hull.id}>{hullName(r.hull.id)}</option>)}</select></label>
        <label className="opt-field">Status<select aria-label="Plot status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All setups</option><option value="feasible">Feasible</option><option value="rejected">Rejected</option></select></label></div>
      <div className="opt-chart-legend"><span><i className="good" />Feasible</span><span><i className="bad" />Rejected</span><span><i className="chosen" />Inspecting</span></div>
    </div>
    <p className="opt-muted opt-plot-basis">{run ? "Evaluated design combinations. Multiple factors vary together; these are not isolated sensitivity curves." : "Imported summary: best feasible setup per hull only. Full search data is not available."}</p>
    {loaded?.missing.length ? <div className="opt-notice" role="alert"><span>Incomplete plot data: {loaded.missing.map(hullName).join(", ")} unavailable.</span><button className="opt-button" onClick={() => { setLoaded(null); setRetry((n) => n + 1); }}><RefreshCw size={14} />Retry</button></div> : null}
    {run && !loaded ? <div className="opt-empty" role="status"><LoaderCircle size={22} className="opt-spin" />Loading plot data…</div> : !filtered.length ? <div className="opt-empty">No evaluated setups match these filters.</div> : <>
      {visibleSelected && <div className="opt-plot-selection" role="status"><div><strong>{hullName(visibleSelected.hull_id)} / Setup #{Number(visibleSelected.id.split("_").at(-1)) + 1}</strong><span>{componentName(visibleSelected.setup.drive_id)} / {componentName(visibleSelected.setup.prop_id)} / {visibleSelected.metrics.capacity_wh.toFixed(0)} Wh battery</span></div><div><strong>{seconds(visibleSelected.metrics.race_time_s)} / {visibleSelected.metrics.mass_kg.toFixed(1)} kg</strong><span className={feasible(visibleSelected) ? "opt-green" : "opt-red"}>{feasible(visibleSelected) ? "Feasible" : "Rejected"}</span></div><button className="opt-icon" title="Clear plot selection" aria-label="Clear plot selection" onClick={() => setSelected(null)}><X size={16} /></button></div>}
      <div className="opt-factor-grid">{plots.map((plot) => <FactorChart key={plot.title} {...plot} data={filtered} hulls={hulls} selected={visibleSelected} onSelect={setSelected} />)}</div>
      <div className="opt-section-heading"><h2>Custom comparison</h2><div className="opt-filters">
        <label className="opt-field">X<select aria-label="Custom X factor" value={customX} onChange={(e) => setCustomX(e.target.value as FactorKey)}>{Object.entries(factors).map(([key, factor]) => <option key={key} value={key}>{factor.label}</option>)}</select></label>
        <label className="opt-field">Y<select aria-label="Custom Y factor" value={customY} onChange={(e) => setCustomY(e.target.value as FactorKey)}>{Object.entries(factors).map(([key, factor]) => <option key={key} value={key}>{factor.label}</option>)}</select></label>
      </div></div>
      <FactorChart title="Custom factor comparison" x={customX} y={customY} data={filtered} hulls={hulls} selected={visibleSelected} onSelect={setSelected} />
    </>}
  </section>;
}

function FactorChart({ title, x, y, data, hulls, selected, onSelect }: {
  title: string; x: FactorKey; y: FactorKey; data: Candidate[];
  hulls: Map<string, HullResult["hull"]>; selected: Candidate | null; onSelect: (c: Candidate) => void;
}) {
  const fx: Factor = factors[x], fy: Factor = factors[y];
  const points = useMemo(() => data.flatMap((candidate) => {
    const hull = hulls.get(candidate.hull_id);
    if (!hull) return [];
    const px = fx.value(candidate, hull), py = fy.value(candidate, hull);
    // Runs that predate a factor (for example bow deadrise) simply have no point for it.
    return Number.isFinite(px) && Number.isFinite(py) ? [{ candidate, hull, x: px, y: py }] : [];
  }), [data, hulls, fx, fy]);
  const rejected = points.filter((p) => !feasible(p.candidate));
  const passing = points.filter((p) => feasible(p.candidate));
  const inspecting = points.filter((p) => p.candidate.id === selected?.id);
  // A padded domain also works for a constant factor or a one-point import.
  function domain([low, high]: readonly [number, number]): [number, number] {
    const pad = (high - low || Math.abs(low) || 1) * 0.08;
    return [low - pad, high + pad];
  }
  return <section className="opt-factor-plot" aria-label={title}>
    <h3>{title}</h3><p className="opt-muted opt-y-label">{fy.label}</p>
    <div className="opt-factor-canvas" role="img" aria-label={`${fy.label} against ${fx.label}`}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}><ScatterChart margin={{ top: 10, right: 24, bottom: 8, left: 6 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--opt-border)" />
        <XAxis type="number" dataKey="x" domain={domain} tickFormatter={fx.format} tickCount={4} tick={{ fontSize: 11, fill: "var(--opt-muted)" }} minTickGap={18} />
        <YAxis type="number" dataKey="y" domain={domain} tickFormatter={fy.format} tickCount={4} width={62} tick={{ fontSize: 11, fill: "var(--opt-muted)" }} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
          const p = payload?.[0]?.payload as Point | undefined;
          return active && p ? <div className="opt-chart-tooltip"><strong>{hullName(p.candidate.hull_id)} / {feasible(p.candidate) ? "Feasible" : "Rejected"}</strong><span>{fx.label}: {fx.format(p.x)}</span><span>{fy.label}: {fy.format(p.y)}</span><span>{p.candidate.metrics.capacity_wh.toFixed(0)} Wh battery / {componentName(p.candidate.setup.drive_id)}</span></div> : null;
        }} />
        <Scatter name="Rejected" data={rejected} fill="#d8756c" fillOpacity={0.4} isAnimationActive={false} onClick={(entry) => onSelect((entry.payload as Point).candidate)} />
        <Scatter name="Feasible" data={passing} fill="#16816b" fillOpacity={0.55} isAnimationActive={false} onClick={(entry) => onSelect((entry.payload as Point).candidate)} />
        {!!inspecting.length && <Scatter name="Inspecting" data={inspecting} fill="#397ec4" stroke="white" strokeWidth={2} isAnimationActive={false} />}
      </ScatterChart></ResponsiveContainer>
    </div><p className="opt-x-label">{fx.label}</p>
  </section>;
}
