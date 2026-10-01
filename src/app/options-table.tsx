"use client";

import { useState } from "react";
import { chooseOption } from "./actions";
import { BASIS_LABEL, num, PartForm, STATUS_STYLE, th } from "./parts-table";
import { grams, usd, type OptionGroup, type Part } from "@/lib/bom";

type PhaseRef = { slug: string; title: string };

const lineCost = (p: Part) => (p.unitPrice === null ? null : p.qty * p.unitPrice);
const lineWeight = (p: Part) => (p.unitWeightG === null ? null : p.qty * p.unitWeightG);

/** "+$40 · −120 g" against the option currently in the BOM. */
function delta(p: Part, chosen: Part | null) {
  if (!chosen || chosen.id === p.id) return null;
  const bits: string[] = [];
  const c = lineCost(p), cc = lineCost(chosen);
  if (c !== null && cc !== null && c !== cc) bits.push(`${c > cc ? "+" : "−"}${usd(Math.abs(c - cc))}`);
  const w = lineWeight(p), cw = lineWeight(chosen);
  if (w !== null && cw !== null && w !== cw) bits.push(`${w > cw ? "+" : "−"}${grams(Math.abs(w - cw))}`);
  return bits.length ? bits.join(" · ") : "same";
}

export function OptionsView({ groups, phases }: { groups: OptionGroup[]; phases: PhaseRef[] }) {
  const [adding, setAdding] = useState(false);
  const phaseTitle = (slug: string) => phases.find((p) => p.slug === slug)?.title ?? slug;

  return (
    <div className="space-y-8">
      {groups.length === 0 && !adding && (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No options yet. Add a product below and list its alternatives — option 1, option 2 — one per line.
        </p>
      )}

      {groups.map((g) => (
        <OptionCard key={g.name} group={g} phases={phases} phaseTitle={phaseTitle(g.phase)} />
      ))}

      {adding ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="mb-3 text-sm font-medium">New product — this is option 1</p>
          <PartForm phases={phases} newOption onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          + New product with options
        </button>
      )}
    </div>
  );
}

function OptionCard({ group, phases, phaseTitle }: { group: OptionGroup; phases: PhaseRef[]; phaseTitle: string }) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const chosenIndex = group.chosen ? group.options.indexOf(group.chosen) + 1 : 0;
  const COLS = 10;

  return (
    <section>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-lg font-semibold tracking-tight">{group.name}</h3>
        <span className="font-mono text-xs text-zinc-500">{phaseTitle}</span>
        <span className="ml-auto text-sm text-zinc-500">
          {group.options.length} option{group.options.length === 1 ? "" : "s"} ·{" "}
          {chosenIndex ? (
            <span className="text-emerald-700 dark:text-emerald-400">option {chosenIndex} is in the BOM</span>
          ) : (
            <span className="text-amber-600 dark:text-amber-500">none in the BOM yet</span>
          )}
        </span>
      </div>
      <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60">
            <tr>
              <th className={th}>#</th>
              <th className={th}>Part</th>
              <th className={th}>Status</th>
              <th className={`${th} text-right`}>Qty</th>
              <th className={`${th} text-right`}>Unit</th>
              <th className={`${th} text-right`}>Total</th>
              <th className={`${th} text-right`}>Weight</th>
              <th className={th}>vs BOM choice</th>
              <th className={th}>Notes</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {group.options.map((p, i) =>
              editing === p.id ? (
                <tr key={p.id}>
                  <td colSpan={COLS} className="bg-zinc-50 p-4 dark:bg-zinc-900/40">
                    <PartForm phases={phases} part={p} onDone={() => setEditing(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className={`align-top ${p.inBom ? "bg-emerald-500/[0.04]" : ""}`}>
                  <td className="px-3 py-2.5 font-mono text-xs text-zinc-500 whitespace-nowrap">Option {i + 1}</td>
                  <td className="px-3 py-2.5">
                    {p.link ? (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline dark:text-blue-400">
                        {p.name} <span aria-hidden>↗</span>
                      </a>
                    ) : (
                      <span className="font-medium">{p.name}</span>
                    )}
                    <div className="mt-0.5 text-xs text-zinc-500">
                      {p.vendor}
                      {!p.link && <span className="text-amber-600 dark:text-amber-500">{p.vendor ? " · " : ""}no link</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_STYLE[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className={num}>{p.qty}</td>
                  <td className={num}>{p.unitPrice === null ? "—" : usd(p.unitPrice)}</td>
                  <td className={`${num} font-medium`}>{lineCost(p) === null ? "—" : usd(lineCost(p)!)}</td>
                  <td className={num}>
                    {lineWeight(p) === null ? (
                      "—"
                    ) : (
                      <>
                        <span className="font-medium">{grams(lineWeight(p)!)}</span>
                        <div className="text-[11px] text-zinc-500">{BASIS_LABEL[p.weightBasis]}</div>
                      </>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                    {delta(p, group.chosen) ?? (p.inBom ? "—" : "")}
                  </td>
                  <td className="max-w-xs px-3 py-2.5 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                    <p className="line-clamp-2" title={p.notes ?? undefined}>{p.notes}</p>
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    {p.inBom ? (
                      <span className="mr-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/25 dark:text-emerald-400">
                        in BOM
                      </span>
                    ) : (
                      <form action={chooseOption} className="inline">
                        <input type="hidden" name="id" value={p.id} />
                        <button className="mr-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                          Use this one
                        </button>
                      </form>
                    )}
                    <button
                      onClick={() => setEditing(p.id)}
                      className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )
            )}
            {editing === "new" ? (
              <tr>
                <td colSpan={COLS} className="bg-zinc-50 p-4 dark:bg-zinc-900/40">
                  <PartForm
                    phases={phases}
                    phase={group.phase}
                    optionGroup={group.name}
                    newOption
                    onDone={() => setEditing(null)}
                  />
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={COLS} className="px-3 py-2">
                  <button onClick={() => setEditing("new")} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                    + Add option {group.options.length + 1}
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
