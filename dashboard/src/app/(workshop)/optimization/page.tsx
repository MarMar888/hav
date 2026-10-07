import type { Metadata } from "next";
import { connection } from "next/server";
import { listRuns, loadResults } from "@/lib/optimization-store";
import { OptimizationView } from "./results-view";
import type { Results, RunSummary } from "@/lib/optimization";
import "./optimization.css";

export const metadata: Metadata = { title: "Optimization" };
export const runtime = "nodejs";

export default async function OptimizationPage({ searchParams }: {
  searchParams: Promise<{ run?: string | string[] }>;
}) {
  await connection();
  const params = await searchParams;
  let runs: RunSummary[] = [];
  let result: Results | null = null;
  let error = "";
  let selected = "";
  try {
    runs = await listRuns();
    selected = typeof params.run === "string" ? params.run : runs.find((run) => !run.error)?.id ?? runs[0]?.id ?? "";
    if (selected) result = await loadResults(selected);
  } catch {
    error = "This run could not be read. Its results may be incomplete or invalid.";
  }
  return <OptimizationView key={`${selected}:${runs.find((r) => r.id === selected)?.updated}`} runs={runs} run={selected} initial={result} error={error} />;
}
