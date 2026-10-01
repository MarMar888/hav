// The BOM lives in Postgres on Neon (tables in db/schema.sql). This is the only
// module that talks to it.
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import type { Phase, Status, WeightBasis } from "./bom";

let pool: Pool | undefined;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    attachDatabasePool(pool); // lets Vercel Fluid compute close idle clients cleanly
  }
  return pool;
}

// numeric columns come back from pg as strings
const num = (v: string | null) => (v === null ? null : Number(v));

type PartRow = {
  id: number;
  phase: string;
  category: string;
  name: string;
  qty: string;
  unit_price: string | null;
  unit_weight_g: string | null;
  weight_basis: WeightBasis;
  status: Status;
  vendor: string | null;
  link: string | null;
  notes: string | null;
  sort: number;
  option_group: string | null;
  in_bom: boolean;
};

/** Active phases, in order, each with its parts. */
export async function getBoard(): Promise<Phase[]> {
  const [phases, parts] = await Promise.all([
    db().query<{ slug: string; title: string; goal: string | null }>(
      "select slug, title, goal from phases where active order by sort, slug"
    ),
    db().query<PartRow>(
      `select p.* from parts p join phases ph on ph.slug = p.phase
       where ph.active order by p.sort, p.id`
    ),
  ]);
  return phases.rows.map((ph) => ({
    ...ph,
    parts: parts.rows
      .filter((r) => r.phase === ph.slug)
      .map((r) => ({
        id: r.id,
        phase: r.phase,
        category: r.category,
        name: r.name,
        qty: Number(r.qty),
        unitPrice: num(r.unit_price),
        unitWeightG: num(r.unit_weight_g),
        weightBasis: r.weight_basis,
        status: r.status,
        vendor: r.vendor,
        link: r.link,
        notes: r.notes,
        sort: r.sort,
        optionGroup: r.option_group,
        inBom: r.in_bom,
      })),
  }));
}
