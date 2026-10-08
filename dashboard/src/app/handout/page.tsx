import type { Metadata } from "next";
import Image from "next/image";
import { TEAM } from "@/lib/team";
import { MilpPlot } from "./milp-plot";
import { TIMELINE } from "@/lib/timeline";

// A one-page, letter-size handout. Open /handout and print (or save as PDF); `public/haav-handout.pdf`
// is the same page exported. Colors are fixed so it prints the same regardless of the visitor's dark mode.

export const metadata: Metadata = { title: "Team handout", robots: { index: false } };

const CRIMSON = "#c5050c";
const KEY_MILESTONES = ["Hull design", "Electrical design", "Hull built", "First drive", "First fast drive", "Tuning and testing"];
const COMPANIES = "Tesla, Northrop Grumman, Xcel Energy and Milwaukee Tool";

// The team's engineering majors, and the part of the boat each one covers. No names on this page.
const DISCIPLINES = [
  { name: "Industrial", covers: "Optimization, composites and manufacturing" },
  { name: "Mechanical", covers: "Structures, CAD and fabrication" },
  { name: "Electrical", covers: "Power, battery and high voltage" },
  { name: "Computer", covers: "Embedded, firmware and software" },
];

// The three parts of the boat and the approach to each. Names stay off this page except the contact in the footer.
const COMPONENTS = [
  {
    title: "Hull",
    strategy: "Plane well and stay light.",
    points: [
      "Hybrid planing composite hull",
      "Shape tuned by optimization",
      "Resistance checked in CFD first",
    ],
  },
  {
    title: "Electric",
    strategy: "Every watt-hour to speed.",
    points: [
      "High-voltage battery storage",
      "Propulsion sized by the model",
      "Propulsion and cooling co-designed",
    ],
  },
  {
    title: "Autonomous",
    strategy: "Find the way, unaided.",
    points: [
      "GPS, IMU and LIDAR sensing",
      "Firmware protects the battery",
      "Software plans the route",
    ],
  },
];

const short = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export default function Page() {
  const milestones = KEY_MILESTONES.map((label) => TIMELINE.find((m) => m.label === label)!);
  return (
    <main className="min-h-screen bg-zinc-300 py-8 text-zinc-900 print:bg-white print:py-0">
      <style>{`@page { size: 8.5in 11in; margin: 0 } html { -webkit-print-color-adjust: exact; print-color-adjust: exact }`}</style>
      <article className="mx-auto flex h-[11in] w-[8.5in] flex-col overflow-hidden bg-white shadow-2xl print:shadow-none">
        <header className="flex items-center justify-between px-10 py-3 text-white" style={{ backgroundColor: CRIMSON }}>
          <div>
            <h1 className="text-5xl font-semibold leading-none tracking-tight">Haav</h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-white/85">Highly Amphibious / Autonomous Vehicle</p>
          </div>
          <div className="rounded-lg bg-white px-4 py-2">
            <Image src="/uw-logo-horizontal.png" alt="University of Wisconsin–Madison" width={1542} height={527} className="h-14 w-auto" />
          </div>
        </header>

        <section className="grid grid-cols-[1.45fr_1fr] items-center gap-8 px-10 pt-4">
          <div>
            <p className="text-[28px] font-semibold leading-tight tracking-tight">
              A student team building an autonomous boat from the ground up.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <Image src="/haav-hull.webp" alt="CAD rendering of the Haav hull" width={1202} height={1008} className="mx-auto h-auto max-h-[1.2in] w-full object-contain" />
          </div>
        </section>

        <section className="mt-5 px-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">How we model it</h2>
          <div className="mt-2.5 grid grid-cols-[1fr_1.45fr] items-center gap-4 rounded-xl bg-zinc-100 p-3">
            <div>
              <h3 className="text-base font-semibold leading-tight">First-principles mixed-integer linear programming</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-700">
                We build the model from physics up. Each constraint cuts the space of possible boats, and the optimizer finds
                the fastest one left. Hull resistance comes from <span className="font-semibold">Savitsky&apos;s planing-hull model</span>. As we build and test, we keep updating the model and adding constraints: a hybrid of simulation and empirical data.
              </p>
              <p className="mt-2 text-[11px] leading-snug text-zinc-500">
                Illustrative: lines are constraints, dots are integer choices, red is what the 6 kW drive adds.
              </p>
            </div>
            <div className="rounded-lg bg-white p-2">
              <MilpPlot />
            </div>
          </div>
        </section>

        <section className="mt-5 px-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Engineers from across UW–Madison</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-700">
            Each segment of the boat is covered, and members have worked at {COMPANIES}.
          </p>
          <div className="mt-2.5 grid grid-cols-4 gap-3">
            {DISCIPLINES.map((d) => (
              <div key={d.name} className="rounded-lg bg-zinc-100 px-3 py-2.5">
                <div className="text-sm font-semibold leading-tight" style={{ color: CRIMSON }}>{d.name}</div>
                <div className="mt-0.5 text-xs leading-snug text-zinc-700">{d.covers}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 px-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Our approach</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {COMPONENTS.map((c) => (
              <div key={c.title} className="rounded-xl border border-zinc-200 p-3">
                <h3 className="text-xl font-semibold leading-none tracking-tight">{c.title}</h3>
                <p className="mt-2 text-sm font-medium leading-snug">{c.strategy}</p>
                <ul className="mt-2 space-y-1.5 border-t border-zinc-200 pt-2">
                  {c.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-xs leading-relaxed text-zinc-700">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: CRIMSON }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-3 px-10 pb-3">
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

        <footer className="mt-auto flex items-center justify-between bg-zinc-900 px-10 py-3 text-white">
          <div>
            <div className="text-lg font-semibold leading-tight">Sponsor the build</div>
            <div className="text-xs text-white/70">We are looking for funds, parts and advisors.</div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-white/60">Learn more</div>
            <a href="https://bit.ly/haav" className="text-lg font-semibold">bit.ly/haav</a>
          </div>
          <div className="text-right text-sm">
            <div className="text-xs uppercase tracking-widest text-white/60">Contact</div>
            <div className="font-medium">{TEAM[0].name}, {TEAM[0].role}</div>
            <div className="text-white/80">mhbarrett@wisc.edu</div>
          </div>
        </footer>
      </article>
    </main>
  );
}
