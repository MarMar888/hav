import type { Metadata } from "next";
import { JoinForm } from "./join-form";

export const metadata: Metadata = { title: "Become a member" };

export default function Page() {
  return (
    <section className="pt-8">
      <h1 className="text-4xl font-semibold tracking-tight">Become a member</h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
        We are a student team at UW-Madison building an autonomous boat. If you are a student and want to help build it,
        tell us a little about yourself and which group you would like to join.
      </p>
      <p className="mt-3 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
        We especially need people to help build our bill of materials (BOM) as we design.
      </p>
      <div className="mt-8">
        <JoinForm />
      </div>
    </section>
  );
}
