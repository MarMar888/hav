"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { STATUSES, WEIGHT_BASES } from "@/lib/bom";

export type FormState = { ok: boolean; error?: string };

const text = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v === "" ? null : v;
};

/** Empty → null; otherwise must be a non-negative number. */
function amount(f: FormData, k: string, label: string) {
  const v = text(f, k);
  if (v === null) return { value: null };
  const n = Number(v.replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0) return { error: `${label} must be a number.` };
  return { value: n };
}

export async function savePart(_prev: FormState, f: FormData): Promise<FormState> {
  const id = text(f, "id");
  const phase = text(f, "phase");
  const name = text(f, "name");
  const category = text(f, "category") ?? "General";
  const status = text(f, "status") ?? "decided";
  const basis = text(f, "weight_basis") ?? "estimate";
  const link = text(f, "link");
  if (!phase || !name) return { ok: false, error: "A part needs a name." };
  if (!(STATUSES as readonly string[]).includes(status)) return { ok: false, error: "Unknown status." };
  if (!(WEIGHT_BASES as readonly string[]).includes(basis)) return { ok: false, error: "Unknown weight basis." };
  if (link && !/^https?:\/\//i.test(link)) return { ok: false, error: "Links must start with http:// or https://." };

  const qty = amount(f, "qty", "Qty");
  const price = amount(f, "unit_price", "Unit price");
  const weight = amount(f, "unit_weight_g", "Unit weight");
  const bad = [qty, price, weight].find((r) => "error" in r);
  if (bad && "error" in bad) return { ok: false, error: bad.error };

  // Options: parts sharing an option_group are alternatives for one product, and
  // only one of them may be in the BOM. A new option added from the Options tab
  // starts out of the BOM; a line joining a group that already has a choice
  // steps out of the BOM rather than colliding with it.
  const optionGroup = text(f, "option_group");
  const wantInBom = f.get("in_bom") !== "false";

  const values = [
    phase, category, name, qty.value ?? 1, price.value, weight.value, basis, status,
    text(f, "vendor"), link, text(f, "notes"), optionGroup,
  ];
  try {
    if (id) {
      await db().query(
        `update parts set phase = $1, category = $2, name = $3, qty = $4, unit_price = $5,
           unit_weight_g = $6, weight_basis = $7, status = $8, vendor = $9, link = $10,
           notes = $11, option_group = $12,
           in_bom = case
             when $12::text is null then true
             when exists (select 1 from parts s where s.option_group = $12 and s.in_bom and s.id <> $13)
               then false
             else in_bom end,
           updated_at = now()
         where id = $13`,
        [...values, Number(id)]
      );
    } else {
      await db().query(
        `insert into parts (phase, category, name, qty, unit_price, unit_weight_g,
           weight_basis, status, vendor, link, notes, option_group, in_bom, sort)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
           case when $12::text is null then true
                else $13::boolean and not exists (select 1 from parts where option_group = $12 and in_bom) end,
           (select coalesce(max(sort), 0) + 10 from parts where phase = $1))`,
        [...values, wantInBom]
      );
    }
  } catch (err) {
    return { ok: false, error: `Database error: ${(err as Error).message}` };
  }
  revalidatePath("/bom");
  return { ok: true };
}

export async function deletePart(f: FormData) {
  const id = Number(f.get("id"));
  if (!Number.isInteger(id)) throw new Error("Bad part id.");
  await db().query("delete from parts where id = $1", [id]);
  revalidatePath("/bom");
}

/** Make this option the one the BOM counts, and take its siblings out. */
export async function chooseOption(f: FormData) {
  const id = Number(f.get("id"));
  if (!Number.isInteger(id)) throw new Error("Bad part id.");
  const client = await db().connect();
  try {
    await client.query("begin");
    // Clear first, then set: the one-choice-per-product index never sees two.
    await client.query(
      `update parts set in_bom = false, updated_at = now()
       where in_bom and option_group = (select option_group from parts where id = $1)`,
      [id]
    );
    await client.query(
      "update parts set in_bom = true, updated_at = now() where id = $1 and option_group is not null",
      [id]
    );
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
  revalidatePath("/bom");
}
