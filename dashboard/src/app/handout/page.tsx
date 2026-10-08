import type { Metadata } from "next";
import Image from "next/image";
import { ADVISORS, GROUPS, TEAM } from "@/lib/team";
import { TIMELINE } from "@/lib/timeline";

// A one-page, letter-size handout. Open /handout and print (or save as PDF); `public/haav-handout.pdf`
// is the same page exported. Colors are fixed so it prints the same regardless of the visitor's dark mode.

export const metadata: Metadata = { title: "Team handout", robots: { index: false } };

const CRIMSON = "#c5050c";
const KEY_MILESTONES = ["Hull design", "Electrical design", "Hull built", "First drive", "First fast drive", "Tuning and testing"];
const STATS = [
  { value: "4–6 ft", label: "composite hull" },
  { value: "30 lb", label: "added payload" },
  { value: "2 mi", label: "course" },
  { value: "2", label: "motor pods + rudder" },
];

const short = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const initials = (name: string) => name.split(" ").map((w) => w[0]).join("");

export default function Page() {
  const milestones = KEY_MILESTONES.map((label) => TIMELINE.find((m) => m.label === label)!);
  return (
    <main className="min-h-screen bg-zinc-300 py-8 text-zinc-900 print:bg-white print:py-0">
      <style>{`@page { size: 8.5in 11in; margin: 0 } html { -webkit-print-color-adjust: exact; print-color-adjust: exact }`}</style>
      <article className="mx-auto flex h-[11in] w-[8.5in] flex-col overflow-hidden bg-white shadow-2xl print:shadow-none">
        <header className="flex items-center justify-between px-10 py-5 text-white" style={{ backgroundColor: CRIMSON }}>
          <div>
            <h1 className="text-6xl font-semibold leading-none tracking-tight">Haav</h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-white/85">Highly Amphibious / Autonomous Vehicle</p>
          </div>
          <div className="rounded-lg bg-white px-4 py-2">
            <Image src="/uw-logo-horizontal.png" alt="University of Wisconsin–Madison" width={1542} height={527} className="h-14 w-auto" />
          </div>
        </header>

        <section className="grid grid-cols-[1fr_1.05fr] items-center gap-8 px-10 pt-5">
          <div>
            <p className="text-3xl font-semibold leading-tight tracking-tight">
              A student team building an autonomous boat from the ground up.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
              One composite planing hull, two motor pods steering by differential thrust, and a rudder for stability at speed. Built at UW–Madison for a 2‑mile course with a 30 pound payload.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <Image src="/haav-hull.webp" alt="CAD rendering of the Haav hull" width={1202} height={1008} className="mx-auto h-auto max-h-[2.3in] w-full object-contain" />
          </div>
        </section>

        <section className="mt-5 grid grid-cols-4 gap-3 px-10">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-lg bg-zinc-100 px-4 py-3">
              <div className="text-2xl font-semibold tabular-nums" style={{ color: CRIMSON }}>{s.value}</div>
              <div className="text-xs text-zinc-600">{s.label}</div>
            </div>
          ))}
        </section>

        <section className="mt-5 px-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">The team</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {TEAM.map((m) => (
              <div key={m.name} className="rounded-xl border border-zinc-200 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: CRIMSON }}
                  >
                    {initials(m.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold leading-tight">{m.name}</div>
                    <div className="text-xs leading-tight text-zinc-500">{m.role}</div>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-zinc-700">{m.blurb}</p>
              </div>
            ))}
            <div className="flex flex-col justify-center rounded-xl p-4 text-white" style={{ backgroundColor: CRIMSON }}>
              <div className="text-[15px] font-semibold leading-tight">Want to join?</div>
              <p className="mt-2 text-xs leading-relaxed text-white/90">
                Open to UW–Madison students in {GROUPS.length} groups, from hull to software.
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-600">
            <span className="font-semibold text-zinc-900">Advisors:</span>{" "}
            {ADVISORS.map((a) => `${a.name} (${a.role.replace("Advisor: ", "")})`).join(" · ")}
          </p>
        </section>

        <section className="mt-4 px-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Timeline</h2>
          <ol className="mt-3 grid grid-cols-6 gap-2">
            {milestones.map((m) => (
              <li key={m.label} className="border-t-2 pt-2" style={{ borderColor: CRIMSON }}>
                <div className="text-xs font-semibold tabular-nums">{short(m.date)}</div>
                <div className="text-xs leading-tight text-zinc-600">{m.label}</div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-auto flex items-center justify-between bg-zinc-900 px-10 py-4 text-white">
          <div>
            <div className="text-lg font-semibold leading-tight">Sponsor the build</div>
            <div className="text-xs text-white/70">We are looking for funds, parts and skills.</div>
          </div>
          <div className="text-right text-sm">
            <div className="text-xs uppercase tracking-widest text-white/60">Contact</div>
            <div className="font-medium">mhbarrett@wisc.edu</div>
          </div>
        </footer>
      </article>
    </main>
  );
}
