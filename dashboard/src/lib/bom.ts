// Types, constants and arithmetic for the BOM. No database code here, so the
// client table can import it without pulling `pg` into the browser bundle.

export const STATUSES = ["open", "decided", "ordered", "have", "optional"] as const;
export const WEIGHT_BASES = ["estimate", "spec", "cad", "measured"] as const;
export type Status = (typeof STATUSES)[number];
export type WeightBasis = (typeof WEIGHT_BASES)[number];

/** All-up weight the hull and hydrostatics were designed around. */
export const WEIGHT_BUDGET_LB = 62;
export const G_PER_LB = 453.592;

export interface Part {
  id: number;
  phase: string;
  category: string;
  name: string;
  qty: number;
  unitPrice: number | null; // USD
  unitWeightG: number | null; // grams on the boat, per unit
  weightBasis: WeightBasis;
  status: Status;
  vendor: string | null;
  link: string | null;
  notes: string | null;
  sort: number;
  optionGroup: string | null; // product this is an option for; null = plain BOM line
  inBom: boolean; // for options: the one the BOM counts
}

export interface Phase {
  slug: string;
  title: string;
  goal: string | null;
  parts: Part[];
}

/** On the BOM tab: plain lines, plus the chosen option of each product. */
export const onBom = (p: Part) => !p.optionGroup || p.inBom;

/** Optional parts are listed but not counted in any total. */
export const counts = (p: Part) => p.status !== "optional";

export interface OptionGroup {
  name: string;
  phase: string;
  options: Part[]; // in sort order: option 1, option 2, ...
  chosen: Part | null;
}

/** Parts that belong to an option group, grouped by product, in first-seen order. */
export function optionGroups(parts: Part[]): OptionGroup[] {
  const groups = new Map<string, OptionGroup>();
  for (const p of parts) {
    if (!p.optionGroup) continue;
    const g = groups.get(p.optionGroup) ?? { name: p.optionGroup, phase: p.phase, options: [], chosen: null };
    g.options.push(p);
    if (p.inBom) g.chosen = p;
    groups.set(p.optionGroup, g);
  }
  return [...groups.values()];
}

export function totals(parts: Part[]) {
  const counted = parts.filter(counts);
  return {
    weightG: counted.reduce((s, p) => s + p.qty * (p.unitWeightG ?? 0), 0),
    cost: counted.reduce((s, p) => s + p.qty * (p.unitPrice ?? 0), 0),
    unpriced: counted.filter((p) => p.unitPrice === null).length,
    missingLinks: parts.filter((p) => !p.link).length,
    open: parts.filter((p) => p.status === "open").length,
  };
}

export const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const grams = (g: number) =>
  g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${Math.round(g)} g`;

export const pounds = (g: number) => (g / G_PER_LB).toFixed(1);
