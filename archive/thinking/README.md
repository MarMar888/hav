# 🚤 Project: Long-Range RC Sensor Boat — Thinking & Design Notes

> **Historical: early design thinking.** These notes predate the current build — they describe a bought
> catamaran hull, an Xbox controller and a ~$1,250 budget. The reasoning (stability, vibration, thermal,
> comms) still holds; the parts list does not. For the current design start at the [root README](../../README.md).

This folder organizes everything we've worked through for the boat: a **remote-control, long-distance RC boat** loaded with sensors (cameras, lidar, wind, GPS), driven from a **computer dashboard + Xbox controller**, controlled over **4G/LTE** from anywhere. Inspired by **MIT's Roboat**, built mostly from **off-the-shelf marine-robotics parts** (ArduPilot / BlueOS ecosystem) with a **custom software stack**.

> **Hardware is the main concern** — so the `hardware/` docs are the deepest. Software is the part that's built first-principles (and doubles as a portfolio piece — see `software/02-dream-company-stack.md`).

## The one-paragraph summary
A bought brushless catamaran hull + a Raspberry Pi running ArduPilot/BlueOS for the autopilot, talking to a laptop dashboard over 4G/LTE (with an ELRS radio as a safety backup). You drive with an Xbox controller. It carries a low-latency pilot camera + a waterproof 4K action cam, a 360° lidar for obstacle avoidance, a wind meter, and GPS. Target: **~30 min runtime at cruise**, fully loaded, for **~$1,250**.

## How to navigate
| Folder | What's in it |
|---|---|
| [`hardware/`](./hardware/) | The boat itself — hull, propulsion, brain, comms, sensors, power. **Start here.** |
| [`software/`](./software/) | Onboard control stack + the custom cloud/dashboard stack |
| [`tradeoffs/`](./tradeoffs/) | The big tensions, every decision we made and why, and what's still open |
| [`bom/`](./bom/) | Bill of materials — `bom.csv` (the numbers) + `bom-notes.md` (the reasoning) |
| [`AUDIT.md`](./AUDIT.md) | **First-principles audit** — major overlooks found & fixed (stability, vibration, thermal, capsize) |
| [`why-and-vision.md`](./why-and-vision.md) | The north star: cool, fast, sensor-filled boat + incredible software |

## Reading order if you're new to it
1. `hardware/00-overview.md` — the system + the core constraints
2. `tradeoffs/01-key-tradeoffs.md` — *why* the build is shaped the way it is
3. `tradeoffs/02-decisions-and-open-questions.md` — what's locked, what's not
4. `bom/bom.csv` — the cost
5. `software/00-overview.md` — the software plan

## Current status (as of last working session)
- **Locked:** LTE + onboard Pi comms; ArduPilot/BlueOS autopilot; sensor suite (lidar, wind, cameras, GPS); ~30-min-at-cruise endurance; software stack rebuilt in the dream-company stack.
- **Still open:** final hull pick (cheap RTR starter vs bait boat vs print-your-own); exact flight-controller route (Navigator vs standalone FC vs Pi+PCA9685). See `tradeoffs/02`.
- A separate running plan file also exists at `~/.claude/plans/` — this `thinking/` folder is the organized, standalone version.
