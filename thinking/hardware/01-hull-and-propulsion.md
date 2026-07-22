# Hull & Propulsion

## The key realization
**Speed comes from the running gear, not the hull shape.** Catamarans are among the *fastest* RC hull types (race cats hit 50+ mph). Earlier worry that "a catamaran won't be fast enough" was a misconception — the slowness came from speccing trolling-style thrusters, not from the cat shape.

So the hull just needs to be a **stable platform**; the motor decides the speed.

## The hull trilemma: fast + small + easy-to-mount → pick two
This is the central hardware tension.

| You want | What you give up | Example |
|---|---|---|
| **Fast + small** | Easy mounting (cramped, needs a printed deck) | Pro Boat Zelos 36, Blackjack 24 |
| **Fast + easy-to-mount** | Small (it gets big & pricey) | Pro Boat Blackjack 42 |
| **Easy-to-mount + small-ish** | Speed (~5 mph) | RC bait boat |

Because we're **cutting corners on hardware**, the option needing the *most work* (a race cat + a printed deck) is the least attractive. The real choice is **relax speed (bait boat)** or **relax size (Blackjack 42)** — or use a cheap fast cat as a *starter* and build the full rig on a printed v2.

## Hull options compared
| Option | Price | Speed | Mounting | Notes |
|---|---|---|---|---|
| **Cheap RTR cat** (Volantex, etc.) | $80–160 | 30–40 mph | Cramped → print a deck/box | Cheapest, fastest to water. Good **starter**. |
| **Pro Boat Blackjack 24" V2** | ~$200 | 45+ mph | **Too small for full suite** | Great fun/starter; single motor + offset rudder; 24"/3.9 lb. Run minimal payload (Pi+cam+LTE) only. |
| **Pro Boat Zelos 36** | ~$420 | 60 mph | Needs printed deck (but mod-friendly) | Twin-motor = differential steering; removable canopy + replaceable electronics tray; 36"/9.65 lb; big power headroom. |
| **Pro Boat Blackjack 42** | ~$550–650 | 55+ mph | **Easiest of the fast ones** | Roomy, thumbscrew canopy, self-righting. Big (42") + pricey 8S batteries. |
| **RC bait boat** (Flytec/Rippton) | $200–500 | ~5 mph | **Easiest, period** | Built to haul payload; *includes* GPS autopilot + sonar + dual motors + 2–3 h runtime. Slow. |
| **3D-printed open-deck cat** | ~filament | tune w/ brushless | **Total freedom** | Design the deck for your gear. Most build time (print + epoxy-seal the hull). |
| *Turnkey reference* — **BlueBoat** | $4,400 | ~6 kn | n/a | The whole idea pre-built. Over budget + slow; we emulate it cheaper. |

## Why a small race cat (e.g. Blackjack 24") is risky for the full build
- **24" / 3.9 lb** with a "clean" (i.e. *packed*, not roomy) interior — motor, ESC, Rx, battery tray, cooling lines already fill it.
- Light hull + ~1–1.5 kg of gear + a tall sensor mast = **tippy at speed, raised CG**.
- Verdict: excellent **cheap, fast starter** for learning the stack (drive + camera + maybe LTE). Put the **full lidar/wind/mast suite on a roomier printed v2.**

## Propulsion
- **Recommended:** the donor RTR boat **includes** the motor + ESC + servo/rudder — we just tap those signals into the flight controller. Cut corner, done.
- **Twin-motor donors** (Zelos) give **differential thrust** (skid steering) once each ESC is on its own autopilot channel — great low-speed control for filming/station-keeping.
- **Endurance alternative:** twin Blue Robotics **T200 thrusters** — bulletproof, waterproof, reversible, but only ~6 mph (this is the slow/long-endurance route).

## Mounting approach (for any race cat)
**Don't drill the hull.** 3D-print a **replacement canopy / payload deck** that seals the existing hatch opening (gasket strip like stock) and carries a **quick-release sensor mast** + flat mount surface. Mod/reprint the electronics tray to seat the Pi + FC. Dry electronics ride in a **printed topside box** (the hull bay is full of battery + ESC). Seal every cable pass-through; tune CG/trim.

## Decision status
**OPEN.** Leaning: cheap RTR as a fast starter + printed v2 for the full rig, OR a bait boat if speed can flex. See `tradeoffs/02-decisions-and-open-questions.md`.
