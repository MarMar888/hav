import { z } from "zod";

const finite = z.number().finite();
const positive = finite.positive();
export const candidateSchema = z.object({
  id: z.string().min(1),
  hull_id: z.string().min(1),
  setup: z.object({
    drive_id: z.string(), prop_id: z.string(),
    // Historical runs chose battery mass; current runs choose capacity. Metrics carry capacity for both.
    battery_capacity_wh: positive.optional(), battery_mass_kg: positive.optional(),
    speed_mps: positive, payload_x_fraction: finite.min(0).max(1),
    battery_x_fraction: finite.min(0).max(1),
  }),
  metrics: z.object({
    mass_kg: positive, lcg_fraction: finite,
    resistance_n: finite.nonnegative(), shaft_power_w: finite.nonnegative(),
    electrical_power_w: finite.nonnegative(), race_time_s: positive,
    energy_used_wh: finite.nonnegative(), capacity_wh: positive, battery_mass_kg: positive.optional(), capacity_ah: positive,
    current_a: finite.nonnegative(), energy_reserve_fraction: finite,
    battery_current_limit_a: positive, drive_current_limit_a: positive,
  }),
  margins: z.object({
    budget_usd: finite.optional(), // legacy: earlier runs constrained cost
    loaded_mass_kg: finite, energy_wh: finite,
    shaft_power_w: finite, battery_current_a: finite, drive_current_a: finite,
    system_voltage_v: finite, drive_voltage_v: finite,
    lcg_min_fraction: finite, lcg_max_fraction: finite,
    deadrise_order_deg: finite.optional(), // absent in runs that predate bow deadrise
    transom_within_beam_m: finite.optional(), // absent in runs that predate transom beam
  }),
});

export const resultsSchema = z.object({
  optimization_mode: z.enum(["continuous_nlp", "joint_grid", "nested_grid"]).default("nested_grid"),
  status: z.enum(["demo_best_found", "no_feasible_found", "demo_optimal_on_grid", "infeasible_on_grid"]),
  data_status: z.literal("illustrative_not_calibrated"),
  build_ready: z.literal(false), finalops_revision: z.string(),
  optimality_scope: z.string(), unmodeled_requirements: z.array(z.string()),
  beats_benchmark_in_demo: z.boolean().nullable(), best: candidateSchema.nullable(),
  hulls: z.array(z.object({
    hull: z.object({
      id: z.string(), length_m: positive, beam_m: positive,
      transom_beam_m: positive.optional(), bow_deadrise_deg: finite.optional(), aft_deadrise_deg: finite, mass_kg: positive,
    }),
    evaluated: finite.int().nonnegative(), feasible: finite.int().nonnegative(),
    rejections_by_constraint: z.record(z.string(), finite.int().nonnegative()),
    best: candidateSchema.nullable(),
  })).max(10000),
}).superRefine((data, ctx) => {
  const ids = data.hulls.map((h) => h.hull.id);
  if (new Set(ids).size !== ids.length || data.hulls.some((h) => h.feasible > h.evaluated || (h.best && h.best.hull_id !== h.hull.id))) {
    ctx.addIssue({ code: "custom", message: "Inconsistent hull results" });
  }
  const found = data.status === "demo_best_found" || data.status === "demo_optimal_on_grid";
  if (found !== (data.best !== null) || (data.best && !ids.includes(data.best.hull_id))) {
    ctx.addIssue({ code: "custom", message: "Inconsistent winning candidate" });
  }
});

export type Candidate = z.infer<typeof candidateSchema>;
export type Results = z.infer<typeof resultsSchema>;
export type HullResult = Results["hulls"][number];
export type RunSummary = { id: string; updated: string; error?: string };

export const constraints: Record<keyof Candidate["margins"], { label: string; unit: string; legacy?: true }> = {
  budget_usd: { label: "Budget", unit: "USD", legacy: true },
  loaded_mass_kg: { label: "Loaded mass", unit: "kg" },
  energy_wh: { label: "Usable energy", unit: "Wh" },
  shaft_power_w: { label: "Shaft power", unit: "W" },
  battery_current_a: { label: "Battery current", unit: "A" },
  drive_current_a: { label: "Drive current", unit: "A" },
  system_voltage_v: { label: "System voltage", unit: "V" },
  drive_voltage_v: { label: "Drive voltage", unit: "V" },
  lcg_min_fraction: { label: "LCG lower bound", unit: "% length" },
  lcg_max_fraction: { label: "LCG upper bound", unit: "% length" },
  deadrise_order_deg: { label: "Bow at least aft deadrise", unit: "deg" },
  transom_within_beam_m: { label: "Transom within beam", unit: "m" },
};
export function feasible(candidate: Candidate) {
  return Object.values(candidate.margins).every((margin) => margin >= -1e-7);
}
export const seconds = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
export const hullName = (id: string) => /^hull_\d+$/.test(id) ? `Hull ${Number(id.slice(5)) + 1}` : id;
export const componentName = (id: string) => id.replace(/^assumed_/, "").replaceAll("_", " ");
