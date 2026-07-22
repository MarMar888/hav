# BOM Notes

The numbers live in [`bom.csv`](./bom.csv). This explains them.

## Totals at a glance
| Bundle | Typical | Range |
|---|---|---|
| **v1 — working long-range sensor boat** | **~$1,252** | $953–$1,585 |
| v1 + GoPro-class action cam (**v1.5**) | ~$1,455 | $1,095–$1,825 |
| Phase 2 add-ons (each optional) | +$40 to +$430 each | — |
| **Recurring** | ~$18/mo | $10–25/mo (data SIM) |
| Software | **$0** | open-source / self-built |

> **v1 lands inside the $800–1800 target.** The single biggest swing is the **flight controller**: a standalone FC (~$50) vs the turnkey Navigator ($220) moves the total ~$170.

## What's in v1 (and why it's the line)
v1 = **floats, drives over LTE with an Xbox controller, live video, GPS autopilot, lidar obstacle avoidance, and a wind meter.** It deliberately excludes the *premium* sensors (thermal, imaging sonar, zoom cam) — those are phase 2, so you get a fully working boat first without the big-ticket items.

## Cost levers (how to move the number)
| Lever | Effect |
|---|---|
| Standalone FC instead of Navigator | **−~$170** |
| Bare Pi + PCA9685 instead of Navigator | −~$170 (but more first-principles work) |
| Skip the action cam in v1 | −$300 (add it as v1.5) |
| Bait-boat hull instead of RTR + print | hull route changes; *includes* autopilot + sonar, could drop the GPS line |
| Cheapest-everything build | **≈ $900 floor** |

## Phasing rationale
- **v1 (~$1,252):** the satisfying, complete, drivable boat. Order these first. *(Now includes the audit's mechanical/thermal additions — vibration mount, aluminum/Gore-vent enclosure, and the tripod tower — ~$97 that the original BOM missed.)*
- **v1.5 (+$300):** the waterproof 4K action cam — the "really good quality footage" want. Pulled out of v1 only so the base boat isn't gated on it.
- **Phase 2:** thermal ($300), zoom cam ($150), better antennas ($55), underwater sonar ($430, optional), printed v2 hull ($40), Jetson ($400, only for AI vision). Add as wanted.

## What's assumed already owned ($0)
Laptop/PC, Xbox controller, 3D printer + filament, and **all software** (BlueOS, Cockpit, ArduPilot, Go, React, MapLibre, Tailscale free tier). If you don't have a 3D printer, the printed parts can be ordered from a print service or swapped for a flat-deck/PVC build.

## Recurring cost
A **data SIM** (~$10–25/mo) is the only ongoing cost. IoT/pay-as-you-go plans are cheapest; you only need a few hundred MB–few GB per outing for telemetry + compressed video.

## Order-of-purchase (time-constrained)
The clock is **shipping**, not assembly. **Order today (long-lead):** the donor hull + the flight controller. **Fast-ship after:** Pi, RPLidar, wind sensor, LTE modem, ELRS, power bits. Print the superstructure while you wait.

## How to use the CSV
- Open in any spreadsheet. Filter the **Phase** column: `v1` for the first build, `v1.5`/`phase2` for later, `owned` for $0 items, `recurring` for the SIM.
- The `SUBTOTAL` row sums the v1 line items (typical column).
- Swap the **Autopilot** row's typical to $220 if you go Navigator, or ~$50 if you go standalone FC, then re-total.
