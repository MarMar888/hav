import type { Metadata } from "next";
import Link from "next/link";
import { FACTS, WAYS_TO_BACK, WHAT_YOU_GET } from "@/lib/sponsors";
import { HullViewer } from "./hull-viewer";
import { InquiryForm } from "./inquiry-form";

export const metadata: Metadata = {
  title: "Sponsor Project Hav",
  description:
    "Project Hav is a 4-foot autonomous boat built from scratch for the PEP27 Autonomy race. Explore the hull, the design math and the parts list, then back the build.",
};

const eyebrow = "font-mono text-xs uppercase tracking-widest text-zinc-500";

export default function Page() {
  return (
    <div id="top" className="mx-auto max-w-6xl px-5">
      {/* hero */}
      <section className="py-20 sm:py-28">
        <p className={eyebrow}>Project Hav · PEP27 Autonomy</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          A boat worth following<span className="text-emerald-600">_</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          We&apos;re building a four-foot autonomous boat from the hull up, and we&apos;re doing it in public. Every
          part, every price and every design decision is open for you to look at. Help us get it to the water.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#explore" className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-emerald-400">
            See the boat
          </a>
          <a href="#contact" className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:border-emerald-600 dark:border-zinc-700">
            Become a sponsor
          </a>
        </div>
        <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-zinc-200 pt-8 dark:border-zinc-800 sm:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.label}>
              <dt className="text-4xl font-semibold tracking-tight tabular-nums">{f.value}</dt>
              <dd className="mt-1 text-sm text-zinc-500">{f.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* explore */}
      <section id="explore" className="scroll-mt-8 border-t border-zinc-200 py-16 dark:border-zinc-800">
        <p className={eyebrow}>Explore</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight">Three ways to look inside the project.</h2>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          No pitch deck. These are the working files the team uses every day.
        </p>
        <div className="mt-8">
          <HullViewer />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ExploreCard
            kicker="Explore"
            title="The hull"
            body="A parametric deep-V design, 3D-printed as a plug and glassed into a skin. Orbit it, section it, check the dimensions yourself."
            href="/viz/hull.html"
            cta="Full-screen 3D viewer"
            external
          />
          <ExploreCard
            kicker="Demonstrate"
            title="The design math"
            body="One optimizer picks hull geometry, drive, battery and speed together against the race rules. Browse the runs and compare candidates."
            href="/optimization"
            cta="Optimizer results"
          />
          <ExploreCard
            kicker="Inspect"
            title="The parts list"
            body="The full bill of materials with prices, vendor links and weight against our budget. This is where your support shows up."
            href="/"
            cta="Live BOM"
          />
        </div>
      </section>

      {/* ways to back */}
      <section className="border-t border-zinc-200 py-16 dark:border-zinc-800">
        <p className={eyebrow}>Back the build</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight">
          Every sponsor is different. The support <span className="text-emerald-600">should be too.</span>
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {WAYS_TO_BACK.map((w) => (
            <article key={w.id} className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
              <p className={eyebrow}>{w.title}</p>
              <h3 className="mt-3 text-xl font-semibold">{w.line}</h3>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{w.body}</p>
            </article>
          ))}
        </div>
        <h3 className="mt-14 text-xl font-semibold">What you get</h3>
        <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {WHAT_YOU_GET.map((item) => (
            <li key={item} className="flex gap-3 text-zinc-700 dark:text-zinc-300">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* contact */}
      <section id="contact" className="scroll-mt-8 border-t border-zinc-200 py-16 dark:border-zinc-800">
        <p className={eyebrow}>Get in touch</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Talk to the team.</h2>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Tell us who you are and how you&apos;d like to help. Someone on the team will reply.
        </p>
        <div className="mt-8 max-w-3xl">
          <InquiryForm />
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 text-sm text-zinc-500 dark:border-zinc-800">
        <p>
          Project Hav is our entry in the PEP27 Workforce Development Competition, Autonomy Division. It
          hasn&apos;t touched water yet. The numbers on this site are the design as it stands today.{" "}
          <a href="#top" className="underline hover:text-emerald-600">Back to top</a>
        </p>
      </footer>
    </div>
  );
}

function ExploreCard({
  kicker,
  title,
  body,
  href,
  cta,
  external,
}: {
  kicker: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  external?: boolean;
}) {
  const link = "mt-5 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400";
  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <p className={eyebrow}>{kicker}</p>
      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
      <p className="mt-3 flex-1 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={link}>{cta} ↗</a>
      ) : (
        <Link href={href} className={link}>{cta} →</Link>
      )}
    </article>
  );
}
