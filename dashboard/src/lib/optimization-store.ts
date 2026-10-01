import "server-only";
import { readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { candidateSchema, resultsSchema, type RunSummary } from "./optimization";

// optimization/ is a sibling of dashboard/, not inside it.
const root = path.join(process.cwd(), "..", "optimization", "runs");

async function readRunFile(run: string, parts: string[]) {
  // Only descendants of a discovered run may be read, including through symlinks.
  const entries = await readdir(root, { withFileTypes: true });
  if (!entries.some((entry) => entry.isDirectory() && entry.name === run)) throw new Error("Run not found");
  const runRoot = await realpath(path.join(root, run));
  const file = await realpath(path.join(runRoot, ...parts));
  if (!file.startsWith(runRoot + path.sep)) throw new Error("Invalid run file");
  if ((await stat(file)).size > 20 * 1024 * 1024) throw new Error("Run file exceeds 20 MB");
  return JSON.parse(await readFile(file, "utf8"));
}

export async function listRuns(): Promise<RunSummary[]> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const results = await Promise.all(entries.filter((entry) => entry.isDirectory()).map(async (entry) => {
    try {
      const info = await stat(path.join(root, entry.name, "results.json"));
      return { id: entry.name, updated: info.mtime.toISOString() };
    } catch {
      return { id: entry.name, updated: "", error: "Results missing or unreadable" };
    }
  }));
  return results.sort((a, b) => b.updated.localeCompare(a.updated) || a.id.localeCompare(b.id));
}

export async function loadResults(run: string) {
  return resultsSchema.parse(await readRunFile(run, ["results.json"]));
}

export async function loadCandidates(run: string, hull: string) {
  const results = await loadResults(run);
  if (!/^hull_\d+$/.test(hull) || !results.hulls.some((row) => row.hull.id === hull)) throw new Error("Hull not found");
  const folder = results.optimization_mode === "nested_grid" ? "inner" : "hulls";
  const candidates = z.array(candidateSchema).max(100000).parse(await readRunFile(run, [folder, hull, "candidates.json"]));
  if (candidates.some((candidate) => candidate.hull_id !== hull)) throw new Error("Inconsistent candidate data");
  return candidates;
}
