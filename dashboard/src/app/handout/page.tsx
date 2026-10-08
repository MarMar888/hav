import type { Metadata } from "next";
import Image from "next/image";
import { TEAM } from "@/lib/team";
import { TIMELINE } from "@/lib/timeline";

// A one-page, letter-size handout. Open /handout and print (or save as PDF); `public/haav-handout.pdf`
// is the same page exported. Relaxed on purpose: white page, a few plain grey cards, the site's own sans font,
// black, white and grey only, plus red for the UW–Madison mark. Colours are fixed so it prints the same in dark mode.

export const metadata: Metadata = { title: "Team handout", robots: { index: false } };

const PAPER = "#ffffff";
const CARD = "#f5f5f5";
const EDGE = "#f5f5f5";
const INK = "#111111";
const SOFT = "#555555";
const RED = "#c5050c"; // the UW–Madison mark only
const COMPANIES = "Tesla, Northrop Grumman, Xcel Energy and Milwaukee Tool";

// The team's engineering majors, and the part of the boat each one covers. No names on this page.
const DISCIPLINES = [
  { name: "Industrial", covers: "optimization, composites and manufacturing" },
  { name: "Mechanical", covers: "structures, CAD and fabrication" },
  { name: "Electrical", covers: "power, battery and high voltage" },
  { name: "Computer", covers: "embedded, firmware and software" },
];

// The three parts of the boat and the approach to each. Names stay off this page except the contact in the footer.
const COMPONENTS = [
  {
    title: "Hull",
    strategy: "Plane well and stay light.",
    points: ["Hybrid planing composite hull", "Shape tuned by optimization", "Resistance checked in CFD first"],
  },
  {
    title: "Electric",
    strategy: "Every watt-hour to speed.",
    points: ["High-voltage battery storage", "Propulsion sized by the model", "Propulsion and cooling co-designed"],
  },
  {
    title: "Autonomous",
    strategy: "Manage drift and controls.",
    points: ["GPS, IMU and LIDAR sensing", "Firmware protects the battery", "Software plans the route"],
  },
];

const h2 = "text-[17px] font-semibold leading-tight tracking-tight";
const card = "rounded-2xl border px-4 py-3";

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-300 py-8 print:bg-white print:py-0">
      <style>{`@page { size: 8.5in 11in; margin: 0 } html { -webkit-print-color-adjust: exact; print-color-adjust: exact }`}</style>
      <article
        className="mx-auto flex h-[11in] w-[8.5in] flex-col overflow-hidden px-[0.55in] pb-[0.45in] pt-[0.45in] shadow-2xl print:shadow-none"
        style={{ backgroundColor: PAPER, color: INK }}
      >
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-[48px] font-bold leading-none tracking-tight">Haav</h1>
            <p className="mt-1.5 text-[13px]" style={{ color: SOFT }}>Highly Amphibious / Autonomous Vehicle</p>
          </div>
          <div className="text-right">
            <div className="text-[26px] font-bold leading-none tracking-tight" style={{ color: RED }}>UW–Madison</div>
            <div className="mt-1 text-[13px]" style={{ color: SOFT }}>College of Engineering</div>
          </div>
        </header>

        <section className="relative mt-1 flex items-center">
          <p className="relative z-10 max-w-[4.2in] text-[32px] font-bold leading-[1.1] tracking-tight">
            A student team building an autonomous boat from the ground up.
          </p>
          <Image
            src="/haav-hull.webp"
            alt="CAD rendering of the Haav hull"
            width={1202}
            height={1008}
            className="ml-auto h-auto w-[2.5in] -rotate-3 mix-blend-multiply"
          />
        </section>

        <section className={`${card} mt-4`} style={{ backgroundColor: CARD, borderColor: EDGE }}>
          <h2 className={h2}>First-principles mixed-integer linear programming</h2>
          <p className="mt-1 text-[12px] leading-[1.5]" style={{ color: SOFT }}>
            We build the model from physics up. Each constraint cuts the space of possible boats, and the optimizer finds the
            fastest one left. Hull resistance comes from <span className="font-semibold" style={{ color: INK }}>Savitsky&apos;s planing-hull model</span>.
            As we build and test, we keep updating the model and adding constraints: a hybrid of simulation and empirical data.
          </p>
        </section>

        <section className="mt-5">
          <h2 className={h2}>Engineers from across UW–Madison</h2>
          <p className="mt-1 text-balance text-[12px] leading-[1.5]" style={{ color: SOFT }}>
            Each segment of the boat is covered, and members have worked at {COMPANIES}.
          </p>
          <dl className="mt-1.5 grid grid-cols-4 gap-x-6">
            {DISCIPLINES.map((d) => (
              <div key={d.name}>
                <dt className="text-[12.5px] font-semibold">{d.name}</dt>
                <dd className="text-[11.5px] leading-snug" style={{ color: SOFT }}>{d.covers}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-5">
          <h2 className={h2}>Our approach</h2>
          <div className="mt-1.5 grid grid-cols-3 gap-3">
            {COMPONENTS.map((c) => (
              <div key={c.title} className={card} style={{ backgroundColor: CARD, borderColor: EDGE }}>
                <h3 className="text-[15px] font-semibold leading-tight">{c.title}</h3>
                <p className="text-[12px] font-semibold leading-snug">{c.strategy}</p>
                <ul className="mt-1.5 space-y-0.5 text-[11.5px] leading-snug" style={{ color: SOFT }}>
                  {c.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <h2 className={h2}>Timeline</h2>
          <ol className="mt-1.5 grid grid-flow-col grid-cols-2 grid-rows-[repeat(6,auto)] gap-x-8 gap-y-[2px]">
            {TIMELINE.map((m) => (
              <li key={m.label} className="flex items-baseline gap-3 text-[11px] leading-snug">
                <span className="w-[1.1in] shrink-0 font-semibold tabular-nums">{m.when}</span>
                <span style={{ color: SOFT }}>{m.label}</span>
              </li>
            ))}
          </ol>
        </section>

        <footer
          className="mt-auto flex items-center justify-between gap-6 rounded-2xl px-5 py-3.5"
          style={{ backgroundColor: INK, color: PAPER }}
        >
          <div className="max-w-[3.5in]">
            <div className="text-[19px] font-semibold leading-tight tracking-tight">Want to help build it?</div>
            <p className="mt-0.5 text-[12px] leading-snug opacity-80">
              We are looking for funds, parts, advisors and people to build our BOM as we design.
            </p>
          </div>
          <div className="text-right text-[12px] leading-snug">
            <a href="https://bit.ly/haav" className="text-[19px] font-semibold leading-tight">bit.ly/haav</a>
            <div className="mt-0.5 font-medium">{TEAM[0].name}, {TEAM[0].role}</div>
            <div className="opacity-80">mhbarrett@wisc.edu</div>
          </div>
        </footer>
      </article>
    </main>
  );
}
