import { loadCandidates } from "@/lib/optimization-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const run = params.get("run");
  const hull = params.get("hull");
  if (!run || !hull) return Response.json({ error: "Run and hull are required" }, { status: 400 });
  try {
    return Response.json(await loadCandidates(run, hull), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Setup data is missing or invalid for this hull." }, { status: 404 });
  }
}
