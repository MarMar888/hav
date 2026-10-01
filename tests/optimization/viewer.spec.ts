import { expect, test } from "@playwright/test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { resultsSchema, type Candidate, type Results } from "../../src/lib/optimization";

const candidate: Candidate = {
  id: "hull_000_setup_0000", hull_id: "hull_000",
  setup: { drive_id: "assumed_6kw_drive", prop_id: "assumed_prop_b", battery_capacity_wh: 900, speed_mps: 10, payload_x_fraction: 0.45, battery_x_fraction: 0.3 },
  metrics: { mass_kg: 41, lcg_fraction: 0.37, resistance_n: 240, shaft_power_w: 4000, electrical_power_w: 4500, race_time_s: 342, energy_used_wh: 427.5, capacity_wh: 900, battery_mass_kg: 5, capacity_ah: 20.27, current_a: 112.5, energy_reserve_fraction: 0.525, battery_current_limit_a: 129, drive_current_limit_a: 144 },
  margins: { loaded_mass_kg: 11, energy_wh: 202.5, shaft_power_w: 800, battery_current_a: 16.5, drive_current_a: 31.5, system_voltage_v: 5.1, drive_voltage_v: 9.6, lcg_min_fraction: 0.07, lcg_max_fraction: 0.08 },
};
const rejected: Candidate = { ...candidate, id: "hull_000_setup_0001", metrics: { ...candidate.metrics, race_time_s: 280 }, margins: { ...candidate.margins, loaded_mass_kg: -100 } };
const result: Results = {
  optimization_mode: "joint_grid",
  status: "demo_optimal_on_grid", data_status: "illustrative_not_calibrated", build_ready: false,
  finalops_revision: "test_fixture", optimality_scope: "Enumerated hulls and setups only", unmodeled_requirements: ["Hydrostatics and self-righting"], beats_benchmark_in_demo: true, best: candidate,
  hulls: [{ hull: { id: "hull_000", length_m: 2.6, beam_m: 0.9, aft_deadrise_deg: 14, mass_kg: 12 }, evaluated: 2, feasible: 1, rejections_by_constraint: { loaded_mass_kg: 1 }, best: candidate }],
};
let directory: string;
let run: string;
test.beforeAll(async () => {
  const root = path.join(process.cwd(), "optimization/runs");
  await mkdir(root, { recursive: true });
  directory = await mkdtemp(path.join(root, "viewer-test-"));
  run = path.basename(directory);
  await mkdir(path.join(directory, "hulls/hull_000"), { recursive: true });
  await writeFile(path.join(directory, "results.json"), JSON.stringify(result));
  await writeFile(path.join(directory, "hulls/hull_000/candidates.json"), JSON.stringify([candidate, rejected]));
});
test.afterAll(async () => { if (directory) await rm(directory, { recursive: true, force: true }); });

test("loads saved results, explores failures and downloads JSON", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/optimization?run=${run}`);
  await expect(page.getByRole("heading", { name: "Optimization", exact: true })).toBeVisible();
  await expect(page.getByText("Not build-ready")).toBeVisible();
  await expect(page.getByText("One joint search", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Component setups", exact: true }).click();
  await expect(page.getByRole("button", { name: "#1", exact: true })).toBeVisible();
  await page.locator(".recharts-scatter-symbol").first().click();
  await expect(page.getByRole("heading", { name: "Setup #2", exact: true })).toBeVisible();
  await page.getByLabel("Setup status").selectOption("rejected");
  await expect(page.getByRole("button", { name: "#1", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "#2", exact: true }).click();
  await expect(page.getByText("Fails modeled constraints")).toBeVisible();
  await expect(page.getByText("-100.0")).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download results", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("results.json");
  expect(errors).toEqual([]);
});

test("imports summaries, rejects invalid JSON, and returns to saved runs", async ({ page }) => {
  await page.goto(`/optimization?run=${run}`);
  const input = page.getByLabel("Import results JSON");
  await input.setInputFiles({ name: "broken.json", mimeType: "application/json", buffer: Buffer.from('{"hulls":[]}') });
  await expect(page.getByRole("alert").filter({ hasText: "Could not import" })).toBeVisible();
  await input.setInputFiles({ name: "summary.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(result)) });
  await expect(page.getByLabel("Saved run", { exact: true })).toHaveValue("__imported");
  await page.getByRole("button", { name: "Component setups", exact: true }).click();
  await expect(page.getByText(/Imported summary only/)).toBeVisible();
  await page.getByLabel("Saved run", { exact: true }).selectOption(run);
  await expect(page.getByLabel("Saved run", { exact: true })).toHaveValue(run);
  await expect(page.getByText(/Imported summary only/)).toHaveCount(0);
});

test("infeasible results and missing runs do not fabricate winners", async ({ page }) => {
  await page.goto("/optimization?run=missing-viewer-run");
  await expect(page.getByRole("heading", { name: "Run unavailable" })).toBeVisible();
  await page.getByLabel("Import results JSON").setInputFiles({ name: "infeasible.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ ...result, status: "infeasible_on_grid", best: null, beats_benchmark_in_demo: null, hulls: [{ ...result.hulls[0], best: null, feasible: 0 }] })) });
  await expect(page.getByText("No solution", { exact: true })).toBeVisible();
  await expect(page.getByText("No feasible setup for this hull.")).toBeVisible();
});

test("candidate endpoint rejects paths outside the run", async ({ request }) => {
  const valid = await request.get(`/api/optimization?run=${run}&hull=hull_000`);
  expect(valid.status()).toBe(200);
  expect((await valid.json()).length).toBe(2);
  expect((await request.get(`/api/optimization?run=${run}&hull=../../..`)).status()).toBe(404);
  expect((await request.get("/api/optimization?run=../../..&hull=hull_000")).status()).toBe(404);
  expect((await request.get("/api/optimization")).status()).toBe(400);
});

test("schema rejects nonfinite or inconsistent reports", () => {
  expect(resultsSchema.safeParse(result).success).toBe(true);
  expect(resultsSchema.parse({ ...result, optimization_mode: undefined }).optimization_mode).toBe("nested_grid");
  expect(resultsSchema.safeParse({ ...result, best: null }).success).toBe(false);
  expect(resultsSchema.safeParse({ ...result, hulls: [result.hulls[0], result.hulls[0]] }).success).toBe(false);
  expect(resultsSchema.safeParse({ ...result, best: { ...candidate, metrics: { ...candidate.metrics, race_time_s: NaN } } }).success).toBe(false);
});

test("historical runs still load their original candidate paths", async ({ page, request }) => {
  const legacyDirectory = await mkdtemp(path.join(path.dirname(directory), "viewer-legacy-"));
  const legacyRun = path.basename(legacyDirectory);
  try {
    await mkdir(path.join(legacyDirectory, "inner/hull_000"), { recursive: true });
    await writeFile(path.join(legacyDirectory, "results.json"), JSON.stringify({ ...result, optimization_mode: undefined }));
    await writeFile(path.join(legacyDirectory, "inner/hull_000/candidates.json"), JSON.stringify([candidate, rejected]));
    const response = await request.get(`/api/optimization?run=${legacyRun}&hull=hull_000`);
    expect(response.status()).toBe(200);
    expect((await response.json()).length).toBe(2);
    await page.goto(`/optimization?run=${legacyRun}`);
    await expect(page.getByText("Historical nested search", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Component setups", exact: true }).click();
    await expect(page.getByRole("button", { name: "#1", exact: true })).toBeVisible();
  } finally {
    await rm(legacyDirectory, { recursive: true, force: true });
  }
});

test("continuous runs show bow deadrise and the deadrise-order margin", async ({ page }) => {
  const continuousDirectory = await mkdtemp(path.join(path.dirname(directory), "viewer-continuous-"));
  const continuousRun = path.basename(continuousDirectory);
  const best: Candidate = { ...candidate, margins: { ...candidate.margins, deadrise_order_deg: 24, transom_within_beam_m: 0.2 } };
  try {
    await mkdir(path.join(continuousDirectory, "hulls/hull_000"), { recursive: true });
    const hull = { ...result.hulls[0].hull, transom_beam_m: 0.7, bow_deadrise_deg: 32.5, aft_deadrise_deg: 6.25 };
    const report: Results = {
      ...result, optimization_mode: "continuous_nlp", status: "demo_best_found", best,
      hulls: [{ hull, evaluated: 1, feasible: 1, rejections_by_constraint: {}, best }],
    };
    expect(resultsSchema.parse(report).hulls[0].hull.bow_deadrise_deg).toBe(32.5);
    await writeFile(path.join(continuousDirectory, "results.json"), JSON.stringify(report));
    await writeFile(path.join(continuousDirectory, "hulls/hull_000/candidates.json"), JSON.stringify([best]));
    await page.goto(`/optimization?run=${continuousRun}`);
    await expect(page.getByText("Continuous multistart search", { exact: true })).toBeVisible();
    await expect(page.getByText("Bow deadrise", { exact: true })).toBeVisible();
    await expect(page.getByText("32.5°").first()).toBeVisible();
    await expect(page.getByText("Transom beam", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Component setups", exact: true }).click();
    await page.getByRole("button", { name: "#1", exact: true }).click();
    await expect(page.getByText("Bow at least aft deadrise")).toBeVisible();
    await expect(page.getByText("Transom within beam")).toBeVisible();
  } finally {
    await rm(continuousDirectory, { recursive: true, force: true });
  }
});

test("factor plots cover major relationships, filter data and change axes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/optimization?run=${run}`);
  await page.getByRole("button", { name: "Plots", exact: true }).click();
  await expect(page.locator(".opt-factor-plot")).toHaveCount(13);
  await expect(page.getByRole("heading", { name: "Power vs. speed", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resistance vs. aft deadrise", exact: true })).toBeAttached();
  await page.getByLabel("Plot status", { exact: true }).selectOption("rejected");
  await expect(page.getByText("1 evaluated setups", { exact: true })).toBeVisible();
  await page.locator(".opt-factor-plot").first().locator(".recharts-scatter-symbol").first().click();
  await expect(page.locator(".opt-plot-selection")).toContainText("Setup #2");
  await page.getByLabel("Custom X factor").selectOption("capacity");
  await page.getByLabel("Custom Y factor").selectOption("reserve");
  await expect(page.locator(".opt-factor-plot").last().getByRole("img")).toHaveAttribute("aria-label", "Energy reserve (%) against Battery capacity (Wh)");
  await page.getByLabel("Clear plot selection", { exact: true }).click();
  await expect(page.locator(".opt-plot-selection")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: ".context/optimization-plots-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("plots report missing data and use only winners for imports", async ({ page }) => {
  await page.route("**/api/optimization?**", (route) => route.fulfill({ status: 404, body: "{}" }));
  await page.goto(`/optimization?run=${run}`);
  await page.getByRole("button", { name: "Plots", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Incomplete plot data" })).toBeVisible();
  await expect(page.getByText("No evaluated setups match these filters.")).toBeVisible();
  await page.unroute("**/api/optimization?**");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".opt-factor-plot")).toHaveCount(13);
  await page.getByLabel("Import results JSON").setInputFiles({ name: "summary.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(result)) });
  await page.getByRole("button", { name: "Plots", exact: true }).click();
  await expect(page.getByText(/Imported summary: best feasible setup per hull only/)).toBeVisible();
  await expect(page.getByText("1 evaluated setups", { exact: true })).toBeVisible();
  await page.getByLabel("Plot status", { exact: true }).selectOption("rejected");
  await expect(page.getByText("No evaluated setups match these filters.")).toBeVisible();
});

test("desktop and mobile views fit and render the data plot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`/optimization?run=${run}`);
  await page.screenshot({ path: ".context/optimization-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Component setups", exact: true }).click();
  await expect(page.locator(".recharts-scatter-symbol").first()).toBeVisible();
  await page.screenshot({ path: ".context/optimization-setups.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel("Setup status")).toBeVisible();
  // The responsive chart re-lays out asynchronously after the viewport shrinks.
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: ".context/optimization-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Model coverage", exact: true }).click();
  await expect(page.getByText("Hydrostatics and self-righting")).toBeVisible();
});
