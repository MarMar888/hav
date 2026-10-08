import type { Metadata } from "next";
import Image from "next/image";
import { TEAM } from "@/lib/team";
import { TIMELINE } from "@/lib/timeline";

// A one-page, letter-size handout. Open /handout and print (or save as PDF); `public/haav-handout.pdf`
// is the same page exported. Colors are fixed so it prints the same regardless of the visitor's dark mode.

export const metadata: Metadata = { title: "Team handout", robots: { index: false } };

const CRIMSON = "#c5050c";
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
    strategy: "Manage drift and controls.",
    points: [
      "GPS, IMU and LIDAR sensing",
      "Firmware protects the battery",
      "Software plans the route",
    ],
  },
];


export default function Page() {
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
            <Image src="/haav-hull.webp" alt="CAD rendering of the Haav hull" width={1202} height={1008} className="mx-auto h-auto max-h-[1.05in] w-full object-contain" />
          </div>
        </section>

        <section className="mt-4 px-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">How we model it</h2>
          <div className="mt-2 rounded-xl bg-zinc-100 px-5 py-3">
            <h3 className="text-lg font-semibold leading-tight">First-principles mixed-integer linear programming</h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-700">
              We build the model from physics up. Each constraint cuts the space of possible boats, and the optimizer finds
              the fastest one left. Hull resistance comes from <span className="font-semibold">Savitsky&apos;s planing-hull model</span>. As we
              build and test, we keep updating the model and adding constraints: a hybrid of simulation and empirical data.
            </p>
          </div>
        </section>

        <section className="mt-4 px-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Engineers from across UW–Madison</h2>
            <p className="text-[10px] text-zinc-600">Experience at {COMPANIES}</p>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-3">
            {DISCIPLINES.map((d) => (
              <div key={d.name} className="rounded-lg bg-zinc-100 px-3 py-2">
                <div className="text-sm font-semibold leading-tight" style={{ color: CRIMSON }}>{d.name}</div>
                <div className="mt-0.5 text-xs leading-snug text-zinc-700">{d.covers}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 px-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Our approach</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {COMPONENTS.map((c) => (
              <div key={c.title} className="rounded-xl border border-zinc-200 p-3">
                <h3 className="text-xl font-semibold leading-none tracking-tight">{c.title}</h3>
                <p className="mt-1.5 text-sm font-medium leading-snug">{c.strategy}</p>
                <ul className="mt-1.5 space-y-1 border-t border-zinc-200 pt-1.5">
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
          <ol className="mt-2 columns-2 gap-x-7">
            {TIMELINE.map((m) => (
              <li key={m.label} className="break-inside-avoid border-t border-zinc-200 py-[4px]">
                <div className="flex gap-2.5">
                  <span className="w-[0.95in] shrink-0 text-[10px] font-semibold" style={{ color: CRIMSON }}>{m.when}</span>
                  <div>
                    <div className="text-[10.5px] font-semibold leading-tight text-zinc-900">{m.label}</div>
                    {m.detail && <div className="mt-0.5 text-[9px] leading-snug text-zinc-600">{m.detail}</div>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-auto flex items-center justify-between bg-zinc-900 px-10 py-3 text-white">
          <div className="max-w-[2.9in]">
            <div className="text-lg font-semibold leading-tight">Sponsor the build</div>
            <div className="text-xs text-white/70">We are looking for funds, parts, advisors and people to build our BOM as we design.</div>
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
