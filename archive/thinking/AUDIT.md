# 🔍 Plan Audit — Major Overlooks & Fixes

*First-principles review of the whole plan, with internet research. Focus: waterproofing, weight, design, speed, sensor positioning, and the edge cases (flipping, heat, vibration, sensor height, footprint).*

## TL;DR — the plan was strong on *components*, weak on *physics*
We had a good parts list and a sound software architecture. But the original plan **barely addressed the mechanical and environmental engineering** — which is exactly what actually breaks boats. This audit adds that. New doc: [`hardware/06-mechanical-design-and-environment.md`](./hardware/06-mechanical-design-and-environment.md).

## Major overlooks found (ranked)

### 1. ⚠️ Tower stability / center of gravity — *the #1 gap*
We kept saying "sensor mast" without doing the physics. A tall mast with sensors up high **raises the center of gravity → lowers metacentric height (GM) → tips/capsizes** more easily. On a small light hull this is a real capsize risk in wind/chop/turns.
**Fix:** heavy mass (batteries, Pi box) **low and in the hulls**; only light sensors up top; **short, wide-base tripod/A-frame** mast (not a thin pole); **guy-wires**; quick-release to drop CG for Fast mode. (See `06`, §B + §C.)

### 2. ⚠️ Capsize defeats self-righting
Race cats are often self-righting — **but a tall tower stops that** (it floats inverted, sensors underwater). We never accounted for this.
**Fix:** masthead flotation, foldable mast, capsize-kill (ArduPilot detects inverted → cut throttle), full-submersion waterproofing, retrieval plan. Plus prevention (low/forward CG, trim, don't over-throttle). Also **"blow-over"** (backflip at speed) if CG is too far aft. (See `06`, §C.)

### 3. ⚠️ Flight-controller vibration isolation — *required, was missing*
ArduPilot **needs vibration damping**: >60 m/s² (a planing boat slamming) saturates the accelerometers → **EKF fails → vibration failsafe**. We never specced a damped mount.
**Fix:** mount the FC on **Sorbothane/foam** (30 durometer, ~15–20% compression), monitor the `VIBE` log. Lidar is effectively an Observe-mode-only sensor because of this. (See `06`, §D.) *Added to BOM.*

### 4. ⚠️ Thermal management of the sealed box — missing
A sealed waterproof box has **no airflow**; Pi + LTE + ESC + sun = throttling/failure. Plastic boxes are heat traps.
**Fix:** **aluminum enclosure as a heatsink** conducting to the water; thermal-epoxy a copper block from the CPU to the wall; **Gore vent** for pressure/condensation. Strong reason to **avoid the Jetson** unless truly needed. (See `06`, §E.) *Added to BOM.*

### 5. Weight budget never tallied
Estimated payload ≈ **~2.5–3 kg** (electronics + batteries + tower). A 24" race cat (1.76 kg) is **overloaded** by that → sits low, won't plane, high CG.
**Fix:** the *full* sensor build needs a **bigger/wider hull** (Zelos 36 ~4.4 kg, or printed v2). Small race cat = **starter only**. (See `06`, §A.)

### 6. EMI — GPS desensitized by LTE / USB3
A classic compact-build failure we hadn't flagged.
**Fix:** GPS up high on a ground plane, **away from the LTE modem + USB3 cables**; ferrites/shielding. (See `06`, §F.)

### 7. Camera "record AND stream" wasn't actually solved
You asked specifically. Two clean answers now documented: a **dual-stream waterproof IP camera** (4K→SD record + sub-stream→live, one device) or an **action cam (records) + cheap streaming cam**. (See `hardware/04`, updated.)

### 8. Sensor *positioning* was hand-wavy
Now a real bottom-to-top layout, with the honest **height-vs-stability** tension (height helps view/spray/clutter but costs stability + amplifies vibration + wind load). (See `hardware/04`, updated.)

### 9. Radar (the Splash9 cue)
Industrial ASVs use **radar** (all-weather, over-water, long-range — lidar can't do this over water). Too heavy/expensive/power-hungry for our scale.
**Fix:** our cheap layered substitute = **lidar (close obstacles) + camera (primary eyes) + an AIS receiver (~$100) to see real vessels.** AIS added as a phase-2 option. (See `hardware/04`.)

### 10. We'd drifted from the "why"
The plan was creeping toward a slow survey boat. Re-grounded the vision (cool, fast, sensor-filled, battery-powered, tech-driven + incredible software) and checked the plan against it. New doc: [`why-and-vision.md`](./why-and-vision.md).

## What changed in the repo
- **New:** `hardware/06-mechanical-design-and-environment.md` (stability, tower, vibration, thermal, capsize, EMI, weight, footprint).
- **New:** `why-and-vision.md` (north star + reality check).
- **Updated:** `hardware/04-sensors-and-cameras.md` (positioning layout, record+stream, radar/AIS).
- **Updated:** `tradeoffs/01` (added the sensor-height-vs-stability tradeoff + Splash9/SWATH reference), `tradeoffs/02` (new open items).
- **Updated:** `bom/bom.csv` (added vibration mount, thermal enclosure, tower hardware, AIS, dual-stream cam; v1 typical ~$1,155 → **~$1,252**).

## The one-sentence takeaway
**The components were right; the boat needed to become a *naval-architecture* problem, not just a parts list** — keep mass low, the mast short/wide/guyed, the FC vibration-damped, the box thermally managed, and plan for the flip.
