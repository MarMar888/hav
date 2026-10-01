# Hav — Long-Range RC Sensor Boat

A remote-control, long-range sensor boat: cameras, lidar, a wind meter, and GPS,
driven from a laptop dashboard + Xbox controller over 4G/LTE, with a short-range
radio as a safety fallback. Inspired by MIT's Roboat, built on off-the-shelf
marine-robotics hardware (ArduPilot/BlueOS) with a custom software stack on top.

**Status: early design phase.** Hull geometry, a bill of materials, and a CFD
starter workflow exist; nothing has been built or tested on water yet.

## Start here

- New to the project? Read [`thinking/why-and-vision.md`](thinking/why-and-vision.md),
  then [`thinking/README.md`](thinking/README.md).
- Want the numbers? [`thinking/bom/bom.csv`](thinking/bom/bom.csv).
- Want the hull/CFD work? [`hull/README.md`](hull/README.md).

## Repo map

| Area | What's there | Status |
|---|---|---|
| **CFD** — [`hull/`](hull/) | Parametric Onshape hull (FeatureScript), STEP/STL geometry exports, an OpenFOAM mesh + flow smoke test | Early. Geometry exports cleanly; one coarse CFD run confirms the solver path runs, but measures nothing about resistance, speed, or stability yet. |
| **Optimization** — [`hull/cfd/tools/`](hull/cfd/tools/) | `design-space.json` (parameter bounds + which ones are open to optimize) and `prepare.py` (generates candidate hull geometries for a sweep) | Bookkeeping only. Produces candidates, doesn't yet run or score them. DP/RL-based optimization is explicitly deferred until there's a trustworthy CFD evaluator — see [`hull/docs/design-and-cfd-plan.md`](hull/docs/design-and-cfd-plan.md). |
| **BOM + operations** — [`thinking/bom/`](thinking/bom/), [`thinking/hardware/`](thinking/hardware/), [`thinking/software/`](thinking/software/), [`thinking/tradeoffs/`](thinking/tradeoffs/) | Bill of materials with reasoning and cost levers; per-subsystem hardware docs (hull/propulsion, brain/autopilot, comms, sensors, power, mechanical/environment); the software stack plan; the tradeoffs and open-decisions log | v1 build costs ≈$1,252 (range $953–$1,585). Major subsystems are locked; final hull pick and flight-controller route are still open. |
| **Visualization** — [`boat-viz/`](boat-viz/) | Standalone 3D hull-and-mount viewer + a top-speed model, plain HTML/JS | Working, no build step. |
| **Dashboard** — [`src/app/`](src/app/) | Next.js app, meant to become the live video/map/telemetry control dashboard | Not started — still the `create-next-app` template. |

## Getting started

### Visualize the hull / speed model

No install needed — open directly in a browser:

- [`boat-viz/index.html`](boat-viz/index.html) — 3D hull + sensor mount layout
- [`boat-viz/speed.html`](boat-viz/speed.html) — top-speed model

### Generate hull design-space candidates

```bash
python hull/cfd/tools/prepare.py
python -m unittest discover -s hull/cfd/tools -v
```

### Run the hull CFD smoke test (needs Docker Desktop)

```powershell
./hull/cfd/hull-flow-smoke/run-mesh.ps1
```

See [`hull/cfd/hull-flow-smoke/README.md`](hull/cfd/hull-flow-smoke/README.md) for
exactly what this does and doesn't prove.

### Dashboard (Next.js)

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). This is currently the
unmodified Next.js starter template — see [`thinking/software/`](thinking/software/)
for what it's meant to become.

## Reading order for new contributors

1. [`thinking/why-and-vision.md`](thinking/why-and-vision.md) — the north star
2. [`thinking/README.md`](thinking/README.md) — full navigation + current status
3. [`thinking/tradeoffs/01-key-tradeoffs.md`](thinking/tradeoffs/01-key-tradeoffs.md) — why the build is shaped this way
4. [`thinking/bom/bom.csv`](thinking/bom/bom.csv) — the cost
5. [`hull/README.md`](hull/README.md) — hull design + CFD state
6. [`thinking/software/00-overview.md`](thinking/software/00-overview.md) — the software plan

## Contributing

This is an early-stage hardware project — no CI, tests, or license file yet.
If you're picking up the engineering work, read
[`thinking/AUDIT.md`](thinking/AUDIT.md) first: it lists the major overlooks
(stability, vibration, thermal, capsize) already found and fixed in the plan,
so they don't get rediscovered from scratch.
