"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { deletePart, savePart, type FormState } from "./actions";
import { counts, grams, STATUSES, usd, WEIGHT_BASES, type Part, type Status } from "@/lib/bom";

export const STATUS_STYLE: Record<Status, string> = {
  open: "bg-amber-500/10 text-amber-700 ring-amber-600/25 dark:text-amber-400",
  decided: "bg-zinc-500/10 text-zinc-700 ring-zinc-500/25 dark:text-zinc-300",
  ordered: "bg-blue-500/10 text-blue-700 ring-blue-600/25 dark:text-blue-400",
  have: "bg-emerald-500/10 text-emerald-700 ring-emerald-600/25 dark:text-emerald-400",
  optional: "bg-zinc-500/5 text-zinc-500 ring-zinc-400/25",
};

export const BASIS_LABEL = { estimate: "est", spec: "spec", cad: "CAD", measured: "weighed" };

const COLS = 9;
export const th = "px-3 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500";
export const num = "px-3 py-2.5 text-right tabular-nums whitespace-nowrap";

export function PartsTable({ phase, parts }: { phase: string; parts: Part[] }) {
  const [editing, setEditing] = useState<number | "new" | null>(null);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60">
          <tr>
            <th className={th}>Part</th>
            <th className={th}>Category</th>
            <th className={th}>Status</th>
            <th className={`${th} text-right`}>Qty</th>
            <th className={`${th} text-right`}>Unit</th>
            <th className={`${th} text-right`}>Total</th>
            <th className={`${th} text-right`}>Weight</th>
            <th className={th}>Notes</th>
            <th className={th} />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {parts.map((p) =>
            editing === p.id ? (
              <tr key={p.id}>
                <td colSpan={COLS} className="bg-zinc-50 p-4 dark:bg-zinc-900/40">
                  <PartForm phase={phase} part={p} onDone={() => setEditing(null)} />
                </td>
              </tr>
            ) : (
              <Row key={p.id} p={p} onEdit={() => setEditing(p.id)} />
            )
          )}
          {editing === "new" ? (
            <tr>
              <td colSpan={COLS} className="bg-zinc-50 p-4 dark:bg-zinc-900/40">
                <PartForm phase={phase} onDone={() => setEditing(null)} />
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan={COLS} className="px-3 py-2">
                <button
                  onClick={() => setEditing("new")}
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  + Add part
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Row({ p, onEdit }: { p: Part; onEdit: () => void }) {
  const muted = counts(p) ? "" : "text-zinc-400 dark:text-zinc-500";
  const lineWeight = p.unitWeightG === null ? null : p.qty * p.unitWeightG;
  return (
    <tr className={`align-top ${muted}`}>
      <td className="px-3 py-2.5">
        {p.link ? (
          <a
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-700 hover:underline dark:text-blue-400"
          >
            {p.name} <span aria-hidden>↗</span>
          </a>
        ) : (
          <span className="font-medium">{p.name}</span>
        )}
        <div className="mt-0.5 text-xs text-zinc-500">
          {p.vendor}
          {!p.link && (
            <span className="text-amber-600 dark:text-amber-500">
              {p.vendor ? " · " : ""}no link
            </span>
          )}
        </div>
        {p.optionGroup && (
          <Link
            href="/?tab=options"
            className="mt-1 inline-block rounded bg-violet-500/10 px-1.5 py-0.5 text-[11px] text-violet-700 hover:underline dark:text-violet-400"
          >
            chosen option · {p.optionGroup} →
          </Link>
        )}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{p.category}</td>
      <td className="px-3 py-2.5">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_STYLE[p.status]}`}
        >
          {p.status}
        </span>
      </td>
      <td className={num}>{p.qty}</td>
      <td className={num}>{p.unitPrice === null ? "—" : usd(p.unitPrice)}</td>
      <td className={`${num} font-medium`}>
        {p.unitPrice === null ? "—" : usd(p.qty * p.unitPrice)}
      </td>
      <td className={num}>
        {lineWeight === null ? (
          "—"
        ) : (
          <>
            <span className="font-medium">{grams(lineWeight)}</span>
            <div className="text-[11px] text-zinc-500">{BASIS_LABEL[p.weightBasis]}</div>
          </>
        )}
      </td>
      <td className="max-w-xs px-3 py-2.5 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
        <p className="line-clamp-2" title={p.notes ?? undefined}>
          {p.notes}
        </p>
      </td>
      <td className="px-3 py-2.5 text-right">
        <button
          onClick={onEdit}
          className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}

const input =
  "w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950";
const label = "block text-xs font-medium text-zinc-500";

export function PartForm({
  phase,
  phases,
  part,
  optionGroup,
  newOption,
  onDone,
}: {
  phase?: string;
  phases?: { slug: string; title: string }[]; // show a phase picker (Options tab)
  part?: Part;
  optionGroup?: string;
  newOption?: boolean; // added from the Options tab: starts out of the BOM
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(async (prev: FormState, fd: FormData) => {
    const result = await savePart(prev, fd);
    if (result.ok) onDone();
    return result;
  }, { ok: false });

  return (
    <form action={action} className="grid grid-cols-2 gap-3 sm:grid-cols-6">
      {part && <input type="hidden" name="id" value={part.id} />}
      {newOption && <input type="hidden" name="in_bom" value="false" />}
      {phases ? (
        <div className="sm:col-span-2">
          <label className={label}>Phase</label>
          <select name="phase" defaultValue={part?.phase ?? phase ?? phases[0]?.slug} className={input}>
            {phases.map((ph) => (
              <option key={ph.slug} value={ph.slug}>
                {ph.title}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="phase" value={part?.phase ?? phase} />
      )}
      <div className={phases ? "col-span-2 sm:col-span-4" : "col-span-2 sm:col-span-6"}>
        <label className={label}>
          Option for {newOption ? "(product)" : "— leave empty for a plain BOM line"}
        </label>
        <input
          name="option_group"
          defaultValue={part?.optionGroup ?? optionGroup ?? ""}
          placeholder="e.g. Battery pack"
          required={newOption}
          className={input}
        />
      </div>
      <div className="col-span-2 sm:col-span-3">
        <label className={label}>Name</label>
        <input name="name" defaultValue={part?.name} required className={input} autoFocus />
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Category</label>
        <input name="category" defaultValue={part?.category} className={input} />
      </div>
      <div>
        <label className={label}>Status</label>
        <select name="status" defaultValue={part?.status ?? "decided"} className={input}>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>Qty</label>
        <input name="qty" defaultValue={part?.qty ?? 1} inputMode="decimal" className={input} />
      </div>
      <div>
        <label className={label}>Unit price ($)</label>
        <input name="unit_price" defaultValue={part?.unitPrice ?? ""} inputMode="decimal" className={input} />
      </div>
      <div>
        <label className={label}>Unit weight (g, on boat)</label>
        <input name="unit_weight_g" defaultValue={part?.unitWeightG ?? ""} inputMode="decimal" className={input} />
      </div>
      <div>
        <label className={label}>Weight from</label>
        <select name="weight_basis" defaultValue={part?.weightBasis ?? "estimate"} className={input}>
          {WEIGHT_BASES.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Vendor</label>
        <input name="vendor" defaultValue={part?.vendor ?? ""} className={input} />
      </div>
      <div className="col-span-2 sm:col-span-6">
        <label className={label}>Link</label>
        <input name="link" type="url" defaultValue={part?.link ?? ""} placeholder="https://" className={input} />
      </div>
      <div className="col-span-2 sm:col-span-6">
        <label className={label}>Notes</label>
        <textarea name="notes" defaultValue={part?.notes ?? ""} rows={2} className={input} />
      </div>
      <div className="col-span-2 flex items-center gap-2 sm:col-span-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Saving…" : part ? "Save" : newOption ? "Add option" : "Add part"}
        </button>
        <button type="button" onClick={onDone} className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800">
          Cancel
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {part && (
          <button
            type="submit"
            formAction={async (fd) => {
              if (!confirm(`Delete “${part.name}”?`)) return;
              await deletePart(fd);
              onDone();
            }}
            className="ml-auto rounded-md px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
