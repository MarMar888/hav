# Mechanical Design, Stability & Environment

*The biggest gap in the original plan. This is the naval-architecture / ruggedization layer — what actually keeps the boat upright, dry, cool, and giving clean sensor data. Read with `04-sensors-and-cameras.md` (positioning) and `05-power-and-endurance.md` (weight of batteries).*

## A. Weight budget (do this BEFORE buying a hull)
| Item | ~Mass |
|---|---|
| Pi + FC + wiring | 0.3 kg |
| LTE modem + antennas | 0.1 kg |
| Drive battery (4S 8Ah) | 0.7 kg |
| Electronics battery | 0.2 kg |
| Cameras + gimbal | 0.2 kg |
| Lidar (RPLidar C1) | 0.12 kg |
| Wind sensor | 0.2 kg |
| Tower + enclosure + mounts | 0.4 kg |
| Misc (glands, wiring, foam) | 0.3 kg |
| **Total payload** | **~2.5 kg** (→ budget **3 kg** with margin) |

A 24" race cat (**1.76 kg** hull) carrying ~3 kg is **overloaded** → sits low, won't plane, high CG. **The full build wants a bigger/wider hull** (Zelos 36 ~4.4 kg, or a printed v2). Small race cat = **starter only**. Buoyancy must exceed total weight with margin (add flotation foam).

## B. Center of gravity & stability — tip-proofing the tower
**Physics (metacentric height, GM):** a boat is stable while its **metacenter** sits above its **center of gravity**. A tall mast + heavy sensors up high **raises CG → shrinks GM → capsizes more easily** (waves, wind, turns). Catamarans start stable (wide beam = big righting moment) — don't squander it.

**Rules for a tower that doesn't tip:**
1. **Mass low, centered, in the hulls.** Batteries + Pi box at the bottom between the hulls, slightly forward. *Biggest single lever.*
2. **Only LIGHT things up top** (wind sensor, GPS, small camera). Heavy never goes on the mast.
3. **Keep the mast SHORT** — only as tall as the sensor function needs. Every cm costs stability + vibration + wind load.
4. **Wide base, not a thin pole** — a **tripod or A-frame** is far stiffer, resists resonance, spreads load.
5. **Guy-wires / stays** from masthead to the hull corners (like sailboat shrouds) — kill sway + vibration.
6. **Quick-release / foldable** — drop it for Fast mode (lowers CG) and for transport.
7. **Geometry target:** hull half-beam **>>** CG height. Wider hull + lower CG = more margin; add low ballast if top-heavy.

> **The industrial cue (Splash9 / "Pioneer" USVs):** they get speed *and* heavy sensors from **wide hulls (catamaran / SWATH) + a big low payload bay**, not a tippy pole on a small boat. At our scale we mimic it: **wide cat, mass low, short guyed tripod.** "Stability over speed" is a real ASV design philosophy.

## C. Capsize, self-righting & blow-over (edge cases)
- **A tall tower defeats a self-righting hull** — it'll float **inverted**, sensors underwater. Plan for it:
  - **Masthead flotation** (foam float on top) so it can't fully invert / pops back upright.
  - **Foldable/breakaway mast** so a flip doesn't snap it.
  - **Capsize-kill:** ArduPilot detects inverted/extreme attitude (IMU) → cut throttle.
  - **Full-submersion waterproofing** (not just splash — see §E/waterproofing).
  - **Retrieval plan:** positive buoyancy + bright hull + last-GPS so a dead boat floats and is findable.
- **Blow-over (backflip at speed):** fast cats flip backward if CG is too far aft or air gets under the bow. Keep **CG slightly forward**, use **trim tabs**, a sealed canopy, and **add speed incrementally** while watching the bow.
- **Prevention beats recovery:** low/forward CG + don't over-throttle in chop.

## D. Vibration & shaking
ArduPilot **requires vibration damping**. A planing boat slams; >**60 m/s²** vibration saturates ("clips") the accelerometers → **EKF fails → vibration failsafe**.
- **Mount the FC on Sorbothane / damping foam** (30 durometer, ~15–20% compression) — *not* plain double-sided tape (the FC is too light for tape to damp).
- **Soft-mount the electronics tray** for fast running.
- **Cameras:** gimbal / soft mount; action-cam electronic stabilization helps a lot.
- **Lidar** is effectively an **Observe-mode-only** sensor (vibration + slamming wreck it at speed).
- Watch the **`VIBE`** log; keep < ~30 m/s².

## E. Thermal management (a sealed box is a heat trap)
No airflow + Pi + LTE + ESC + sun = throttling/failure. Plastic insulates (bad).
- **Aluminum enclosure as a heatsink** — conduct heat out through the walls to the **water** (the water is a free, huge heatsink; mount the box low against a hull wall).
- **Conduct CPU heat to the wall:** thermal pad / epoxy a copper block from the Pi/Jetson to the case.
- **Internal fan** circulating to finned inner walls (finned outside too).
- **Gore vent** — equalizes pressure + stops **condensation** (sealed air + temp swings = internal fog/water) without breaking the seal.
- **Light-colored box/hull** (less solar gain).
- Strong reason to **avoid the Jetson** unless you truly need vision/AI — it dumps 15–25 W into the box.

## F. EMI / GPS interference
LTE modems and **USB3 desensitize GPS** — a classic compact-build failure (lost fix).
- Keep **GPS up high on a ground plane**, **away from the LTE modem + USB3 cables**.
- Ferrites/shielding on noisy cables; separate antennas; keep ELRS, LTE, GPS, and Wi-Fi antennas apart.

## G. Waterproofing depth — it's not just splash
- **Splash** (spray, bow waves): conformal-coat boards + cable glands.
- **Submersion** (capsize, swamping): needs an **IP67/IP68 sealed enclosure** + proper **marine cable penetrators** (Blue Robotics sells these). Every wire through the seal is a leak risk — **minimize penetrations**.
- **Connectors** live inside the dry box or use waterproof connectors.
- **Leak sensor** inside the box → telemetry alarm → RTH.
- Waterproof cameras (action cams / IP cams) avoid the fog-prone clear-port problem entirely.

## H. Footprint & transport
- **Wider hull** = more stable + more payload, but bigger to transport + more material.
- **Taller tower** = better sensor view, but more wind load + tip risk + transport height.
- The **quick-release mast** helps transport and lowers CG for Fast mode.
- Budget the footprint up front — it interacts with stability (wide base) and the "not too big" want.

## Design summary (the shape this implies)
A **wide-beam catamaran**, batteries + electronics **low in/between the hulls**, a **short tripod/A-frame mast** carrying only light sensors, **guyed**, **quick-release**, with the FC **vibration-damped** in an **aluminum, Gore-vented, water-cooled** box, everything **submersion-rated**, and a **capsize-kill + flotation + retrieval** plan. That's the difference between a parts pile and a boat that survives.
