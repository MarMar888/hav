import { TEAM } from "@/lib/team";
import { InquiryForm } from "./inquiry-form";

const h2 = "text-2xl font-semibold tracking-tight";
const section = "scroll-mt-8 border-t border-zinc-200 pt-12 dark:border-zinc-800";
const prose = "mt-4 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300";
const link = "text-emerald-700 underline underline-offset-4 hover:text-emerald-600 dark:text-emerald-400";

export default function Page() {
  return (
    <div className="space-y-20">
      <section className="pt-8">
        <h1 className="text-6xl font-semibold tracking-tight">Haav</h1>
        <p className="mt-3 font-mono text-sm text-zinc-500">Highly Amphibious / Autonomous Vehicle</p>
        <p className="mt-8 text-xl leading-relaxed">
          We are a student team building an autonomous boat from the ground up, and we model every decision before we cut
          a single part.
        </p>
        <p className={prose}>
          Our team spans computer science, optimization, battery energy systems and composites. That mix lets us
          design the whole system together: hull, drive, battery and software. The goal is a boat that performs well on
          the water, and a worked example of what modeling up front can do.
        </p>
      </section>

      <section id="boat" className={section}>
        <h2 className={h2}>The boat</h2>
        <p className={prose}>
          A four-foot autonomous rigid inflatable boat. The hull is a 3D-printed deep-V shell, used as a plug and
          glassed into a skin. Two motor pods steer it by differential thrust, and an autopilot comes in a second
          phase. It has not touched water yet.
        </p>
        <p className={prose}>
          <a href="/viz/hull.html" target="_blank" rel="noopener noreferrer" className={link}>Explore the hull in 3D</a>
        </p>
      </section>

      <section id="team" className={section}>
        <h2 className={h2}>Team</h2>
        <dl className="mt-8 space-y-8">
          {TEAM.map((m) => (
            <div key={m.name}>
              <dt className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-lg font-semibold">{m.name}</span>
                <span className="text-zinc-500">{m.role}</span>
              </dt>
              <dd className="mt-2 leading-relaxed text-zinc-700 dark:text-zinc-300">{m.bio}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="contact" className={section}>
        <h2 className={h2}>Sponsor the build</h2>
        <p className={prose}>
          We are looking for funds, parts and skills. If your company or lab would like to help, or you just want to
          know more, tell us a little about yourself.
        </p>
        <div className="mt-8">
          <InquiryForm />
        </div>
      </section>
    </div>
  );
}
