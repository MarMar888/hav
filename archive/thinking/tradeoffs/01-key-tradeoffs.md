# Key Tradeoffs (the tensions that shape the whole build)

These are the recurring tensions. Almost every decision is a point on one of these axes.

---

## 1. Fast × Small × Easy-to-mount → **pick two** (the hull trilemma)
The single biggest tension.
- **Fast + small** → race cat (Zelos 36 / Blackjack 24), but cramped → needs a printed deck.
- **Fast + easy-to-mount** → Blackjack 42, but big + pricey.
- **Easy-to-mount + small-ish** → bait boat, but ~5 mph.

**Resolution:** cut hardware corners → avoid the most-work option (race cat + printed deck) *unless* small+fast is non-negotiable. Otherwise relax speed (bait boat) or size (Blackjack 42). Or: cheap fast cat as a starter + printed v2 for the full rig.

---

## 2. Speed × Endurance × Sensors → **modes, not one setting**
You can't rip at 40 mph *and* calmly film with a full sensor mast *and* run 30+ min — at the same instant. High speed = spray, vibration, instability, and 5–10× the battery drain.

**Resolution: two modes on one boat.**
- **Fast mode** — sensor mast off, rip around (~10–15 min bursts).
- **Observe mode** — mast on, cruise slow, full sensing, 30+ min, watch sailing.

This is the most important single idea in the project. (See `hardware/05-power-and-endurance.md`.)

---

## 3. "Fast + full sensor payload" is a **rare unicorn**
We searched for prior art. Findings:
- **Full Pi + autonomy + sensor payload** boats are everywhere — but **all slow/stable** (RoboBoat cats, n3m0, Leviathan, survey vessels, MIT Roboat).
- **On a genuinely fast boat:** basically nobody. Closest are research **waterjet speedboats** (stripped-down payload) and **FPV race boats** (camera only, manual).
- **Why:** speed and full sensing physically conflict.

**Takeaway:** every *piece* is proven; the *combination on one fast hull* isn't. The validated template for "fast-ish + full payload" is a **wide catamaran run at moderate speed** (what RoboBoat teams do) — which is exactly this plan.

---

## 4. Buy off-the-shelf × Build first-principles
The builder's stated philosophy: **first-principles for software, cut corners on hardware.**
- **Hardware:** buy proven (hull, motor, autopilot, OS). Reinventing them = slow + risky.
- **Software:** build the app/cloud/dashboard layer by hand — it's the rewarding part *and* a portfolio piece.

This line falls neatly at the **autopilot boundary**: ArduPilot/BlueOS = bought; everything above MAVLink = built.

---

## 5. Flight controller: turnkey × cheap × first-principles
| Route | Cost | Robust? | Tinker? |
|---|---|---|---|
| Navigator HAT | $220 | ✅✅ | low |
| Standalone FC + Pi ⭐ | ~$40–60 | ✅✅ | medium |
| Bare Pi + PCA9685 | ~$40–60 | ⚠️ (PWM-freq limits) | high (most first-principles) |

Hard rule: **keep ArduPilot** — never a bare-GPIO loop with no failsafe.

---

## 6. Live video: quality × latency × LTE bandwidth
- **Recording** can be full **4K** (GoPro to SD) — camera-limited.
- **Live feed** is capped **~720–1080p** by the **cellular uplink** — *link*-limited, not camera- or Pi-limited.
- **Driving** wants **low latency over resolution** → a cheap pilot cam for control + a 4K action cam for beauty.

So "GoPro-quality" is real for recording; the live dashboard view is bounded by cellular no matter what camera you use. (No need for a Jetson just for camera quality.)

---

## 7. Companion compute: Pi × Jetson
- **Pi (4/5):** fine for relay + sensors + LTE + dashboard backend.
- **Jetson Orin Nano:** only for **onboard vision/AI** (object tracking, vision autonomy). Adds cost + power + heat. Not needed for pretty video.

---

## 8. Comms: LTE long-range × ELRS line-of-sight → **use both**
LTE = unlimited range + fat data pipe, but depends on coverage + has latency. ELRS = rock-solid manual override + failsafe, but short range. **LTE primary, ELRS backup** — belt and suspenders so you never lose the boat.

---

## 9. Sensor height × stability (the tower tension)
Sensors want to be **high** (better view, less spray, less water-clutter/noise) — but height **raises the center of gravity** (tip/capsize risk), **amplifies vibration** (long lever), and adds **wind load**. Resolution: **short, wide-base, guyed tripod mast; only light sensors up top; all heavy mass low in the hulls.** Industrial ASVs (Splash9; the SWATH "Pioneer") buy out of it with **wide hulls + a low payload bay** — at our scale we mimic that, not a tippy pole on a small boat. (Full detail: `hardware/06`.)

## The meta-point
Most of these collapse to one truth: **a boat that's fast, tiny, long-running, and sensor-laden all at once doesn't exist.** The build wins by (a) splitting into **modes**, (b) **buying** the hard hardware, and (c) accepting that the sensor mission is a **moderate-speed cruise**.
