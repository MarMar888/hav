import Link from "next/link";
import { connection } from "next/server";
import { HullViewer } from "@/components/hull-viewer";
import { G_PER_LB, counts, onBom, pounds, totals, usd, WEIGHT_BUDGET_LB, type Phase, type Status } from "@/lib/bom";
import { getBoard, hasDatabase } from "@/lib/db";

const eyebrow = "font-mono text-xs uppercase tracking-widest text-zinc-500";
const RULES_URL = "https://pepworkforce.com/wp-content/uploads/2026/08/PEP27_Rules_Autonomy.pdf";

const RACE = [
  { value: "2 mi", label: "Uncrewed course" },
  { value: "45 min", label: "On-water limit" },
  { value: "5 min", label: "To launch" },
  { value: "30 lb", label: "Removable payload" },
  { value: "55.5 V", label: "Voltage limit" },
] as const;

const BOAT = [
  {
    title: "Hull",
    body: "A 3D-printed deep-V shell, used as a plug and glassed outside as the skin, then taped inside at the joints. A plywood baseboard sits inside it.",
  },
  {
    title: "Tubes",
    body: "Custom inflatable tubes run along both sides, which makes it a rigid inflatable boat.",
  },
  {
    title: "Power",
    body: "Two Flipsky 65150 motor pods, each with its speed controller built in, run from a 12S battery. The boat steers by differential thrust.",
  },
  {
    title: "Autonomy",
    body: "Phase two adds a sensor tower and an autopilot that drives the boat over LTE. The hull and power system go in the water first.",
  },
] as const;

// Order matters: it is the order of the segments in each progress bar.
const STATUS_STYLE: Record<Exclude<Status, "optional">, { label: string; bar: string }> = {
  have: { label: "In hand", bar: "bg-emerald-600" },
  ordered: { label: "Ordered", bar: "bg-emerald-300 dark:bg-emerald-800" },
  decided: { label: "Chosen, not bought", bar: "bg-zinc-400 dark:bg-zinc-600" },
  open: { label: "Still deciding", bar: "bg-amber-500" },
};

const STATUS_KEYS = Object.keys(STATUS_STYLE) as (keyof typeof STATUS_STYLE)[];

export default async function Page() {
  await connection(); // build status is read on every request, never at build time
  let phases: Phase[] | null = null;
  if (hasDatabase()) {
    try {
      phases = await getBoard();
    } catch {
      phases = null; // the page is still worth showing without live numbers
    }
  }

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_0%,rgba(16,185,129,0.18),transparent),linear-gradient(to_bottom,transparent_60%,rgba(16,185,129,0.06))]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1fr_1.1fr] lg:py-28">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">
              PEP27 Workforce Development Competition · Autonomy Division
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl">Haav</h1>
            <p className="mt-3 font-mono text-sm uppercase tracking-widest text-zinc-400">
              Highly Amphibious / Autonomous Vehicle
            </p>
            <p className="mt-6 max-w-xl text-lg text-zinc-300">
              A four-foot autonomous boat, designed and built from the hull up. We&apos;re doing it in the open: every part,
              price and design decision is on this site.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sponsors" className="rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400">
                Sponsor the build
              </Link>
              <a href="#boat" className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium hover:border-emerald-400 hover:text-emerald-400">
                See the boat
              </a>
            </div>
          </div>
          <HullViewer />
        </div>
      </section>

      {/* the race */}
      <section id="race" className="mx-auto w-full max-w-6xl scroll-mt-16 px-5 py-20">
        <p className={eyebrow}>The race</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight">One course, two miles, no one on board.</h2>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          The Autonomy Division races uncrewed boats. These limits come straight from the{" "}
          <a href={RULES_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600">
            official rules
          </a>{" "}
          and the whole design is built around them.
        </p>
        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-5">
          {RACE.map((r) => (
            <div key={r.label} className="bg-white p-6 last:col-span-2 dark:bg-zinc-950 sm:last:col-span-1">
              <dt className="text-3xl font-semibold tracking-tight tabular-nums">{r.value}</dt>
              <dd className="mt-1 text-sm text-zinc-500">{r.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* the boat */}
      <section id="boat" className="scroll-mt-16 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className={eyebrow}>The boat</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight">Small enough to build ourselves.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BOAT.map((b, i) => (
              <article key={b.title} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="font-mono text-xs text-emerald-600">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-lg font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{b.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* build status */}
      <section id="status" className="mx-auto w-full max-w-6xl scroll-mt-16 px-5 py-20">
        <p className={eyebrow}>Build status</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight">Where the build stands.</h2>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Live from our parts list. Nothing has touched water yet, and these numbers are our plan, not our results.
        </p>
        {phases ? <BuildStatus phases={phases} /> : (
          <p className="mt-8 rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">
            Live numbers are unavailable right now.
          </p>
        )}
        <Link href="/bom" className="mt-8 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          See every part and price →
        </Link>
      </section>

      {/* call to action */}
      <section className="bg-zinc-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-5 py-16">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight">Help us get it to the water.</h2>
            <p className="mt-3 text-zinc-300">Funds, parts or skills: there is a line on the build for each.</p>
          </div>
          <Link href="/sponsors" className="rounded-md bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 sm:ml-auto">
            Become a sponsor
          </Link>
        </div>
      </section>
    </>
  );
}

function BuildStatus({ phases }: { phases: Phase[] }) {
  const parts = phases.flatMap((p) => p.parts.filter(onBom));
  const all = totals(parts);
  const budgetG = WEIGHT_BUDGET_LB * G_PER_LB;
  const pct = Math.min(100, (all.weightG / budgetG) * 100);
  const counted = parts.filter(counts);
  const have = counted.filter((p) => p.status === "have").length;

  return (
    <div className="mt-10">
      <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className={eyebrow}>Planned weight</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
            {pounds(all.weightG)}<span className="ml-1.5 text-2xl text-zinc-500">lb</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : "bg-emerald-600"}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm text-zinc-500">of a {WEIGHT_BUDGET_LB} lb all-up budget</p>
        </div>
        <Stat label="Estimated cost" value={usd(all.cost)} note={all.unpriced ? `+ ${all.unpriced} not priced yet` : "everything priced"} />
        <Stat label="Parts" value={String(counted.length)} note={`${have} in hand`} />
        <Stat label="Phases" value={String(phases.length)} note="in the water first" />
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {phases.map((ph, i) => {
          const list = ph.parts.filter(onBom).filter(counts);
          const byStatus = STATUS_KEYS.map((k) => ({ k, n: list.filter((p) => p.status === k).length }));
          return (
            <div key={ph.slug}>
              <h3 className="font-semibold">
                <span className="mr-2 font-mono text-sm text-zinc-400">{i + 1}</span>
                {ph.title}
              </h3>
              {ph.goal && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{ph.goal}</p>}
              <div
                role="img"
                aria-label={byStatus.map(({ k, n }) => `${n} ${STATUS_STYLE[k].label.toLowerCase()}`).join(", ")}
                className="mt-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
              >
                {byStatus.map(({ k, n }) => n > 0 && <div key={k} className={STATUS_STYLE[k].bar} style={{ flex: n }} />)}
              </div>
            </div>
          );
        })}
      </div>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500">
        {STATUS_KEYS.map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLE[s].bar}`} />
            {STATUS_STYLE[s].label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <p className={eyebrow}>{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{note}</p>
    </div>
  );
}
