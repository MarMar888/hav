import Link from "next/link";
import { connection } from "next/server";
import { getBoard, hasDatabase } from "@/lib/db";
import { G_PER_LB, onBom, optionGroups, pounds, totals, usd, WEIGHT_BUDGET_LB, type Phase } from "@/lib/bom";
import { PartsTable } from "./parts-table";
import { OptionsView } from "./options-table";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection(); // read the database on every request, never at build time
  const tab = (await searchParams).tab === "options" ? "options" : "bom";

  if (!hasDatabase()) return <Notice title="No database connected" body={SETUP} />;

  let phases: Phase[];
  try {
    phases = await getBoard();
  } catch (err) {
    return <Notice title="Couldn't read the BOM" body={[(err as Error).message, ...SETUP]} />;
  }

  // The BOM counts plain lines plus each product's chosen option; the rest of
  // the options only appear on the Options tab.
  const bomPhases = phases.map((ph) => ({ ...ph, parts: ph.parts.filter(onBom) }));
  const groups = optionGroups(phases.flatMap((p) => p.parts));
  const undecided = groups.filter((g) => !g.chosen).length;
  const all = totals(bomPhases.flatMap((p) => p.parts));
  const budgetG = WEIGHT_BUDGET_LB * G_PER_LB;
  const pct = Math.min(100, (all.weightG / budgetG) * 100);
  const over = all.weightG > budgetG;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* weight up top */}
      <section className="grid gap-6 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Weight on the boat</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
            {pounds(all.weightG)}
            <span className="ml-1.5 text-2xl text-zinc-500">lb</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full ${over ? "bg-red-500" : "bg-zinc-900 dark:bg-zinc-100"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {(all.weightG / 1000).toFixed(1)} kg ·{" "}
            {over
              ? `${pounds(all.weightG - budgetG)} lb over the ${WEIGHT_BUDGET_LB} lb budget`
              : `${pounds(budgetG - all.weightG)} lb left of the ${WEIGHT_BUDGET_LB} lb budget`}
          </p>
        </div>
        <Stat label="Cost" value={usd(all.cost)} note={all.unpriced ? `+ ${all.unpriced} not priced yet` : "everything priced"} />
        <Stat label="Parts" value={String(bomPhases.reduce((s, p) => s + p.parts.length, 0))} note={`${all.open + undecided} open decision${all.open + undecided === 1 ? "" : "s"}`} />
        <Stat label="Missing links" value={String(all.missingLinks)} note="add them with Edit" warn={all.missingLinks > 0} />
      </section>

      <nav className="mt-8 flex items-end gap-1 border-b border-zinc-200 dark:border-zinc-800">
        <Tab href="/" active={tab === "bom"}>BOM</Tab>
        <Tab href="/?tab=options" active={tab === "options"}>
          Options
          {groups.length > 0 && <span className="ml-1.5 font-mono text-xs text-zinc-400">{groups.length}</span>}
        </Tab>
        <span className="ml-auto pb-2 text-xs text-zinc-500">
          {tab === "bom"
            ? "Weight is what ends up on the boat — the charger and spares count as 0. Optional parts are greyed out and not counted."
            : "Alternatives for one product, one per line. Only the option marked in BOM is counted."}
        </span>
      </nav>

      {tab === "options" ? (
        <div className="mt-8">
          <OptionsView groups={groups} phases={phases.map(({ slug, title }) => ({ slug, title }))} />
        </div>
      ) : (
        <>
          {undecided > 0 && (
            <p className="mt-6 text-sm text-amber-700 dark:text-amber-500">
              {undecided} product{undecided === 1 ? " has" : "s have"} options but none in the BOM yet —{" "}
              <Link href="/?tab=options" className="underline">pick one on the Options tab</Link>.
            </p>
          )}
          {bomPhases.map((ph, i) => {
            const t = totals(ph.parts);
            return (
              <section key={ph.slug} className="mt-10">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 className="text-xl font-semibold tracking-tight">
                    <span className="mr-2 font-mono text-sm text-zinc-400">{i + 1}</span>
                    {ph.title}
                  </h2>
                  <p className="ml-auto font-mono text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                    {pounds(t.weightG)} lb · {usd(t.cost)}
                    {t.unpriced > 0 && <span className="text-zinc-400"> + {t.unpriced} unpriced</span>}
                  </p>
                </div>
                {ph.goal && <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{ph.goal}</p>}
                <div className="mt-4">
                  <PartsTable phase={ph.slug} parts={ph.parts} />
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`-mb-px border-b-2 px-3 pb-2 text-sm font-medium ${
        active
          ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
          : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      }`}
    >
      {children}
    </Link>
  );
}

function Stat({ label, value, note, warn }: { label: string; value: string; note: string; warn?: boolean }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold tracking-tight tabular-nums ${warn ? "text-amber-600 dark:text-amber-500" : ""}`}>
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{note}</p>
    </div>
  );
}

const SETUP = [
  "Link the Neon project and pull its env: neon link --project-id <id> --branch production -y",
  "Create the tables and load the starting BOM: pnpm db:setup",
];

function Notice({ title, body }: { title: string; body: string[] }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <ul className="mt-4 space-y-2 font-mono text-sm text-zinc-600 dark:text-zinc-400">
        {body.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
