"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowDownToLine, ArrowRight, Check, ChevronLeft, ChevronRight, CircleX, LoaderCircle, RefreshCw, Upload } from "lucide-react";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";
import { candidateSchema, componentName, constraints, feasible, hullName, resultsSchema, seconds, type Candidate, type HullResult, type Results, type RunSummary } from "@/lib/optimization";
import { FactorPlots } from "./factor-plots";

type Props = { runs: RunSummary[]; run: string; initial: Results | null; error: string };
type View = "hulls" | "plots" | "setups" | "coverage";

function download(data: unknown, name: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function OptimizationView({ runs, run, initial, error }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [imported, setImported] = useState<{ name: string; result: Results } | null>(null);
  const [importError, setImportError] = useState("");
  const [view, setView] = useState<View>("hulls");
  const [hullId, setHullId] = useState(initial?.best?.hull_id ?? initial?.hulls[0]?.hull.id ?? "");
  const fileInput = useRef<HTMLInputElement>(null);
  const result = imported?.result ?? initial;
  const hull = result?.hulls.find((row) => row.hull.id === hullId) ?? result?.hulls[0];
  const count = result?.hulls.reduce((sum, row) => sum + row.evaluated, 0) ?? 0;
  const passing = result?.hulls.reduce((sum, row) => sum + row.feasible, 0) ?? 0;
  const best = result?.best;

  async function importFile(file?: File) {
    if (!file) return;
    setImportError("");
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error("File too large");
      const parsed = resultsSchema.parse(JSON.parse(await file.text()));
      setImported({ name: file.name, result: parsed });
      setHullId(parsed.best?.hull_id ?? parsed.hulls[0]?.hull.id ?? "");
      setView("hulls");
    } catch {
      setImportError("Could not import this file. A valid optimization results.json under 20 MB is required.");
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  return <div className="opt-page" aria-busy={pending}>
    <div className="opt-titlebar">
      <div><p className="opt-eyebrow">Design studies</p><h1>Optimization</h1></div>
      <div className="opt-actions">
        <label className="opt-run"><span>Run</span><select aria-label="Saved run" value={imported ? "__imported" : run} onChange={(event) => {
          setImported(null); setImportError("");
          startTransition(() => router.push(`/optimization?run=${encodeURIComponent(event.target.value)}`));
        }}>
          {imported && <option value="__imported">{imported.name} (imported)</option>}
          {!runs.length && !imported && <option value="">No saved runs</option>}
          {!!run && !runs.some((r) => r.id === run) && !imported && <option value={run}>{run} (unavailable)</option>}
          {runs.map((r) => <option key={r.id} value={r.id}>{r.id}{r.error ? " (incomplete)" : ""}</option>)}
        </select></label>
        <button className="opt-icon" title="Refresh saved runs" aria-label="Refresh saved runs" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? <LoaderCircle className="opt-spin" size={17} /> : <RefreshCw size={17} />}</button>
        <button className="opt-button" onClick={() => fileInput.current?.click()}><Upload size={16} />Import</button>
        <input ref={fileInput} type="file" accept=".json,application/json" aria-label="Import results JSON" hidden onChange={(event) => void importFile(event.target.files?.[0])} />
        <button className="opt-icon" title="Download results" aria-label="Download results" disabled={!result} onClick={() => result && download(result, "results.json")}><ArrowDownToLine size={17} /></button>
      </div>
    </div>

    {importError && <p className="opt-error" role="alert">{importError}</p>}
    {!imported && error && <p className="opt-error" role="alert">{error}</p>}
    {!result ? <div className="opt-empty"><h2>{error ? "Run unavailable" : "No optimization results yet"}</h2><p>{error ? "Choose another saved run or import a results file." : "No completed runs were found."}</p><button className="opt-button" onClick={() => fileInput.current?.click()}><Upload size={16} />Import results</button></div> : <>
      <div className="opt-notice"><AlertTriangle size={17} /><span><strong>Illustrative model</strong> Synthetic hull and component data. Not validated for construction or race performance.</span><span className="opt-not-ready">Not build-ready</span></div>
      <section className="opt-stats" aria-label="Run summary">
        <Stat label="Best modeled time" value={best ? seconds(best.metrics.race_time_s) : "No solution"} note={best ? `${hullName(best.hull_id)} / ${best.setup.speed_mps.toFixed(1)} m/s` : "No feasible setup found"} />
        <Stat label="Hull variants" value={String(result.hulls.length)} note={result.optimization_mode === "continuous_nlp" ? "One per optimizer start" : "Geometry combinations"} />
        <Stat label="Complete boat candidates" value={count.toLocaleString()} note={result.optimization_mode === "continuous_nlp" ? "Continuous multistart search" : result.optimization_mode === "joint_grid" ? "One joint search" : "Historical nested search"} />
        <Stat label="Feasible setups" value={passing.toLocaleString()} note={`${count ? (100 * passing / count).toFixed(1) : 0}% pass modeled constraints`} />
      </section>
      <nav className="opt-tabs" aria-label="Optimization views">
        {([['hulls', 'Hull comparison'], ['plots', 'Plots'], ['setups', 'Component setups'], ['coverage', 'Model coverage']] as const).map(([id, label]) => <button key={id} aria-pressed={view === id} className={view === id ? "active" : ""} onClick={() => setView(id)}>{label}</button>)}
        <span>finalops / {result.finalops_revision.slice(0, 7)}</span>
      </nav>

      {view === "plots" && <FactorPlots key={imported ? "imported" : run} run={imported ? null : run} result={result} />}
      {view === "hulls" && <>
        <div className="opt-section-heading"><h2>Hull comparison</h2><span>Fastest feasible candidate per hull</span></div>
        <HullTable rows={result.hulls} selected={hull?.hull.id ?? ""} winner={best?.hull_id} onSelect={setHullId} />
        {hull && <section className="opt-detail-section">
          <div className="opt-section-heading"><h2>{hullName(hull.hull.id)}<span className="opt-subheading"> / best setup</span></h2><button className="opt-text-button" onClick={() => setView("setups")}>All setups <ArrowRight size={15} /></button></div>
          <div className="opt-detail-grid"><div><HullSummary row={hull} />{hull.best ? <SetupSummary candidate={hull.best} /> : <p className="opt-muted">No feasible setup for this hull.</p>}</div><div>{hull.best ? <Margins candidate={hull.best} /> : <Rejections row={hull} />}</div></div>
        </section>}
      </>}
      {view === "setups" && <>
        <div className="opt-section-heading"><h2>Component setups</h2><label className="opt-field">Hull<select aria-label="Hull" value={hull?.hull.id ?? ""} onChange={(event) => setHullId(event.target.value)}>{result.hulls.map((r) => <option value={r.hull.id} key={r.hull.id}>{hullName(r.hull.id)} / {r.hull.length_m.toFixed(2)} m</option>)}</select></label></div>
        {hull ? <SetupExplorer key={`${imported ? "import" : run}:${hull.hull.id}`} run={imported ? null : run} row={hull} /> : <p className="opt-muted">No hulls in this run.</p>}
      </>}
      {view === "coverage" && <section className="opt-coverage">
        <div><div className="opt-section-heading"><h2>Modeled constraints</h2><span>{Object.values(constraints).filter((c) => !c.legacy).length} checks per setup</span></div><ul>{Object.entries(constraints).filter(([, value]) => !value.legacy).map(([key, value]) => <li key={key}><Check size={16} className="opt-green" /><span>{value.label}</span><small>{value.unit}</small></li>)}</ul></div>
        <div><div className="opt-section-heading"><h2>Outside this model</h2></div><ul>{result.unmodeled_requirements.map((item) => <li key={item}><AlertTriangle size={16} className="opt-amber" /><span>{item}</span></li>)}</ul><p className="opt-scope">{result.optimality_scope}</p></div>
      </section>}
    </>}
  </div>;
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return <div><p className="opt-label">{label}</p><p className="opt-stat-value">{value}</p><p className="opt-muted">{note}</p></div>;
}

function HullTable({ rows, selected, winner, onSelect }: { rows: HullResult[]; selected: string; winner?: string; onSelect: (id: string) => void }) {
  const [sort, setSort] = useState("time");
  const sorted = [...rows].sort((a, b) => {
    const key = sort === "mass" ? "mass_kg" : "race_time_s";
    return (a.best?.metrics[key] ?? Infinity) - (b.best?.metrics[key] ?? Infinity) || a.hull.id.localeCompare(b.hull.id);
  });
  return <>
    <div className="opt-table-tools"><label className="opt-field">Sort by<select aria-label="Sort hulls" value={sort} onChange={(event) => setSort(event.target.value)}><option value="time">Race time</option><option value="mass">Loaded mass</option></select></label><span className="opt-muted">Equal times are tied; one is selected by the solver.</span></div>
    <div className="opt-table-scroll"><table className="opt-table"><thead><tr><th>Hull</th><th>Length / beam</th><th>Bow / aft V</th><th>Modeled time</th><th>Loaded mass</th><th>Feasible</th><th>Selection</th></tr></thead><tbody>
      {sorted.map((row) => <tr key={row.hull.id} className={selected === row.hull.id ? "selected" : ""}>
        <td><button className="opt-row-button" aria-pressed={selected === row.hull.id} onClick={() => onSelect(row.hull.id)}>{hullName(row.hull.id)}</button></td>
        <td>{row.hull.length_m.toFixed(2)} / {row.hull.beam_m.toFixed(2)} m</td><td>{degrees(row.hull.bow_deadrise_deg)}{row.hull.bow_deadrise_deg !== undefined && " / "}{degrees(row.hull.aft_deadrise_deg)}</td>
        <td className="opt-strong">{row.best ? seconds(row.best.metrics.race_time_s) : "Infeasible"}</td><td>{row.best ? `${row.best.metrics.mass_kg.toFixed(1)} kg` : "—"}</td>
        <td><span className="opt-feasible-bar"><span style={{ width: `${row.evaluated ? row.feasible / row.evaluated * 100 : 0}%` }} /></span>{row.feasible} / {row.evaluated}</td>
        <td>{winner === row.hull.id ? <span className="opt-badge"><Check size={12} />Selected</span> : <span className="opt-muted">{row.best ? "Feasible" : "Rejected"}</span>}</td>
      </tr>)}
    </tbody></table></div>
  </>;
}

const degrees = (n?: number) => n === undefined ? "" : `${Number(n.toFixed(1))}°`;

function HullSummary({ row }: { row: HullResult }) {
  return <div className="opt-dimensions"><div><span>Length</span><strong>{row.hull.length_m.toFixed(2)} m</strong></div><div><span>Beam</span><strong>{row.hull.beam_m.toFixed(2)} m</strong></div>{row.hull.transom_beam_m !== undefined && <div><span>Transom beam</span><strong>{row.hull.transom_beam_m.toFixed(2)} m</strong></div>}{row.hull.bow_deadrise_deg !== undefined && <div><span>Bow deadrise</span><strong>{degrees(row.hull.bow_deadrise_deg)}</strong></div>}<div><span>Aft deadrise</span><strong>{degrees(row.hull.aft_deadrise_deg)}</strong></div><div><span>Hull mass</span><strong>{row.hull.mass_kg.toFixed(1)} kg</strong></div></div>;
}

function SetupSummary({ candidate: c }: { candidate: Candidate }) {
  return <div>
    <dl className="opt-definition-list">
      <div><dt>Drive / propeller</dt><dd>{componentName(c.setup.drive_id)} / {componentName(c.setup.prop_id)}</dd></div>
      <div><dt>Battery</dt><dd>{c.metrics.capacity_wh.toFixed(0)} Wh{c.metrics.battery_mass_kg !== undefined && <> / {c.metrics.battery_mass_kg.toFixed(1)} kg</>}</dd></div>
      <div><dt>Operating speed</dt><dd>{c.setup.speed_mps.toFixed(1)} m/s <span>({(c.setup.speed_mps * 2.236936).toFixed(1)} mph)</span></dd></div>
      <div><dt>Electrical demand</dt><dd>{(c.metrics.electrical_power_w / 1000).toFixed(2)} kW / {c.metrics.current_a.toFixed(1)} A</dd></div>
      <div><dt>Race energy / reserve</dt><dd>{c.metrics.energy_used_wh.toFixed(0)} Wh / {(c.metrics.energy_reserve_fraction * 100).toFixed(1)}%</dd></div>
      <div><dt>Battery / payload position</dt><dd>{(c.setup.battery_x_fraction * 100).toFixed(0)}% / {(c.setup.payload_x_fraction * 100).toFixed(0)}% from transom</dd></div>
    </dl>
    <div className="opt-placement" aria-label={`Center of gravity ${(c.metrics.lcg_fraction * 100).toFixed(1)} percent forward from transom`}><div className="opt-placement-track"><span style={{ left: `${c.metrics.lcg_fraction * 100}%` }} /></div><div><span>Transom</span><strong>LCG {(c.metrics.lcg_fraction * 100).toFixed(1)}%</strong><span>Bow</span></div></div>
  </div>;
}

function Margins({ candidate }: { candidate: Candidate }) {
  return <div className="opt-margins"><h3>Constraint margins</h3><p className="opt-muted">Remaining allowance; negative values fail.</p><div className="opt-margin-list">{Object.entries(candidate.margins).map(([key, margin]) => {
    const info = constraints[key as keyof typeof constraints];
    const pass = margin >= -1e-7;
    const value = key.startsWith("lcg_") ? margin * 100 : margin;
    return <div key={key}><span>{pass ? <Check size={14} className="opt-green" /> : <CircleX size={14} className="opt-red" />}{info.label}</span><strong className={pass ? "" : "opt-red"}>{value >= 0 ? "+" : ""}{value.toFixed(1)} <small>{info.unit}</small></strong></div>;
  })}</div></div>;
}

function Rejections({ row }: { row: HullResult }) {
  return <div className="opt-rejections"><h3>Rejection reasons</h3>{Object.entries(row.rejections_by_constraint).sort((a, b) => b[1] - a[1]).map(([key, count]) => <div key={key}><span>{constraints[key as keyof typeof constraints]?.label ?? key}</span><span className="opt-rejection-track"><span style={{ width: `${row.evaluated ? count / row.evaluated * 100 : 0}%` }} /></span><strong>{count}</strong></div>)}<p className="opt-muted">A setup can fail more than one constraint.</p></div>;
}

function SetupExplorer({ run, row }: { run: string | null; row: HullResult }) {
  const [data, setData] = useState<Candidate[] | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState<Candidate | null>(row.best);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("time");
  const [page, setPage] = useState(0);
  useEffect(() => {
    if (!run) return;
    const controller = new AbortController();
    fetch(`/api/optimization?${new URLSearchParams({ run, hull: row.hull.id })}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Setup data is missing or invalid for this hull.");
        return z.array(candidateSchema).parse(await response.json());
      })
      .then(setData)
      .catch((error: Error) => { if (error.name !== "AbortError") setError("Setup data could not be loaded."); });
    return () => controller.abort();
  }, [run, row.hull.id, retry]);
  if (!run) return <><p className="opt-notice">Imported summary only. Full component setup data is not included in results.json.</p>{row.best && <div className="opt-detail-grid"><SetupSummary candidate={row.best} /><Margins candidate={row.best} /></div>}</>;
  if (error) return <div className="opt-empty" role="alert"><p>{error}</p><button className="opt-button" onClick={() => { setError(""); setRetry((n) => n + 1); }}><RefreshCw size={16} />Retry</button></div>;
  if (!data) return <div className="opt-empty" role="status"><LoaderCircle className="opt-spin" size={22} /><p>Loading setups…</p></div>;
  const filtered = data.filter((c) => filter === "all" || (filter === "feasible" ? feasible(c) : !feasible(c))).sort((a, b) => {
    const key = sort === "mass" ? "mass_kg" : "race_time_s";
    return a.metrics[key] - b.metrics[key] || a.id.localeCompare(b.id);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const currentPage = Math.min(page, pages - 1);
  return <>
    <div className="opt-explore-grid"><div><h3>Race time vs. loaded mass</h3><div className="opt-chart-legend"><span><i className="good" />Feasible</span><span><i className="bad" />Rejected</span><span><i className="chosen" />Inspecting</span></div>
      <div className="opt-chart" role="img" aria-label="Scatter plot of modeled race time versus loaded mass, colored by feasibility">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}><ScatterChart margin={{ top: 8, right: 15, bottom: 15, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--opt-border)" />
          <XAxis type="number" dataKey="metrics.mass_kg" name="Loaded mass" domain={["dataMin - 2", "dataMax + 2"]} tickFormatter={(v) => `${Math.round(v)} kg`} tick={{ fontSize: 11, fill: "var(--opt-muted)" }} />
          <YAxis type="number" dataKey="metrics.race_time_s" name="Race time" domain={["dataMin - 20", "dataMax + 20"]} tickFormatter={seconds} tick={{ fontSize: 11, fill: "var(--opt-muted)" }} width={45} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
            const c = payload?.[0]?.payload as Candidate | undefined;
            return active && c ? <div className="opt-chart-tooltip"><strong>{seconds(c.metrics.race_time_s)} / {c.metrics.mass_kg.toFixed(1)} kg</strong><span>{c.metrics.capacity_wh.toFixed(0)} Wh battery / {c.setup.speed_mps} m/s</span><span>{feasible(c) ? "Feasible" : "Rejected"}</span></div> : null;
          }} />
          <Scatter name="Rejected" data={data.filter((c) => !feasible(c))} fill="#d8756c" fillOpacity={0.55} isAnimationActive={false} onClick={(entry) => setSelected(entry.payload as Candidate)} />
          <Scatter name="Feasible" data={data.filter(feasible)} fill="#16816b" fillOpacity={0.7} isAnimationActive={false} onClick={(entry) => setSelected(entry.payload as Candidate)} />
          {selected && <Scatter name="Inspecting" data={[selected]} fill="#397ec4" stroke="white" strokeWidth={2} isAnimationActive={false} />}
        </ScatterChart></ResponsiveContainer>
      </div></div><Rejections row={row} /></div>
    <div className="opt-table-tools"><div className="opt-filters"><label className="opt-field">Status<select aria-label="Setup status" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(0); }}><option value="all">All setups</option><option value="feasible">Feasible</option><option value="rejected">Rejected</option></select></label><label className="opt-field">Sort by<select aria-label="Sort setups" value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}><option value="time">Race time</option><option value="mass">Loaded mass</option></select></label></div><span className="opt-muted">{filtered.length} setups</span></div>
    <div className="opt-table-scroll"><table className="opt-table"><thead><tr><th>Setup</th><th>Drive / prop</th><th>Battery</th><th>Speed</th><th>Time</th><th>Status</th></tr></thead><tbody>{filtered.slice(currentPage * 12, currentPage * 12 + 12).map((c) => <tr key={c.id} className={selected?.id === c.id ? "selected" : ""}><td><button className="opt-row-button" aria-pressed={selected?.id === c.id} onClick={() => setSelected(c)}>#{Number(c.id.split("_").at(-1)) + 1}</button></td><td>{componentName(c.setup.drive_id)} / {componentName(c.setup.prop_id)}</td><td>{c.metrics.capacity_wh.toFixed(0)} Wh</td><td>{c.setup.speed_mps} m/s</td><td>{seconds(c.metrics.race_time_s)}</td><td><span className={`opt-status ${feasible(c) ? "opt-green" : "opt-red"}`}>{feasible(c) ? <Check size={13} /> : <CircleX size={13} />}{feasible(c) ? "Feasible" : "Rejected"}</span></td></tr>)}</tbody></table>{!filtered.length && <p className="opt-empty">No setups match this filter.</p>}</div>
    <div className="opt-pagination"><span>{filtered.length ? currentPage * 12 + 1 : 0}–{Math.min((currentPage + 1) * 12, filtered.length)} of {filtered.length}</span><button className="opt-icon" aria-label="Previous page" title="Previous page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button><button className="opt-icon" aria-label="Next page" title="Next page" disabled={currentPage >= pages - 1} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button></div>
    {selected && <section className="opt-detail-section"><div className="opt-section-heading"><h2>Setup #{Number(selected.id.split("_").at(-1)) + 1}</h2><span className={feasible(selected) ? "opt-green" : "opt-red"}>{feasible(selected) ? "Passes modeled constraints" : "Fails modeled constraints"}</span></div><div className="opt-detail-grid"><SetupSummary candidate={selected} /><Margins candidate={selected} /></div></section>}
  </>;
}
