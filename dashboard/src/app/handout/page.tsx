import type { Metadata } from "next";
import Image from "next/image";
import { TEAM } from "@/lib/team";
import { TIMELINE } from "@/lib/timeline";

// A one-page, letter-size handout. Open /handout and print (or save as PDF); `public/haav-handout.pdf`
// is the same page exported. Colors are fixed so it prints the same regardless of the visitor's dark mode.

export const metadata: Metadata = { title: "Team handout", robots: { index: false } };

const CRIMSON = "#c5050c";
const KEY_MILESTONES = ["Hull design", "Electrical design", "Hull built", "First drive", "First fast drive", "Tuning and testing"];
const DIFFERENT = [
  { title: "Designed as one system", text: "One optimization model picks hull shape, drive, battery and speed together, so no part is sized alone." },
  { title: "Industry experience", text: "Members have worked at Tesla, Northrop Grumman, Xcel Energy, Milwaukee Tool, John Deere and Fincantieri." },
];

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
    strategy: "Plane well, carry the load, stay light.",
    points: [
      "Hybrid planing composite hull",
      "Shape tuned by optimization",
      "Resistance checked in CFD first",
    ],
  },
  {
    title: "Electric",
    strategy: "Spend every watt-hour on speed.",
    points: [
      "High-voltage battery storage",
      "Motor pods sized by the model",
      "Differential thrust and rudder",
    ],
  },
  {
    title: "Autonomous",
    strategy: "Find the way and steer, with no one at the helm.",
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
        <header className="flex items-center justify-between px-10 py-4 text-white" style={{ backgroundColor: CRIMSON }}>
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
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              One composite planing hull, two motor pods steering by differential thrust, and a rudder for stability at speed. Designed as one system and built by students at UW–Madison.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <Image src="/haav-hull.webp" alt="CAD rendering of the Haav hull" width={1202} height={1008} className="mx-auto h-auto max-h-[1.7in] w-full object-contain" />
          </div>
        </section>

        <section className="mt-5 px-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">What makes us different</h2>
          <div className="mt-3 grid grid-cols-2 gap-6">
            {DIFFERENT.map((d) => (
              <div key={d.title} className="border-l-4 pl-4" style={{ borderColor: CRIMSON }}>
                <h3 className="text-[15px] font-semibold leading-tight">{d.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-700">{d.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 px-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Engineers from across UW–Madison</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-700">
            UW–Madison trains engineers in every discipline. We pulled from each segment of the boat.
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
              <div key={c.title} className="rounded-xl border border-zinc-200 p-4">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">{c.title}</h3>
                <p className="mt-3 text-[15px] font-medium leading-snug">{c.strategy}</p>
                <ul className="mt-3 space-y-2 border-t border-zinc-200 pt-3">
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

        <section className="mt-4 px-10 pb-3">
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
