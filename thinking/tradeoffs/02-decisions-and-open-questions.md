# Decisions & Open Questions

## ✅ Locked decisions
| # | Decision | Choice | Why |
|---|---|---|---|
| D1 | **Comms / range** | 4G/LTE + onboard Pi, **ELRS backup** | Only option giving true long range + a fat data pipe for sensors → dashboard. ELRS = safety failsafe. |
| D2 | **Budget (v1)** | ~$800–1800 (landing ~$1,250) | Premium sensors (thermal, imaging sonar) deferred to phase 2. |
| D3 | **Speed vs sensing** | **Both, via modes** | Fast mode (mast off) + Observe mode (mast on, cruise). |
| D4 | **Software approach** | Hybrid → custom in the **dream-company stack** | Cockpit day-one; build Go/connectRPC/React/SRT/AWS in parallel. |
| — | **Above-water sensing** | Cheap **360° lidar (RPLidar C1)** | Underwater depth sonar dropped from v1. |
| — | **"Infrared"** | **Thermal** (FLIR Lepton), Phase 2 | IR-LED night vision is useless over open water. |
| — | **Wind meter** | **~$90 RS485 ultrasonic** | The "in-between" pick: robust, no moving parts, affordable. |
| — | **Endurance** | **~30 min at cruise** + separate electronics battery | Full-throttle is ~10–15 min; cruise hits 30+. |
| — | **Cameras** | Two-tier: low-latency pilot cam + waterproof 4K action cam | Live feed is LTE-capped; 4K lives in the recording. |

## ❓ Open questions (need a decision before/while ordering)
| Question | Options | Leaning |
|---|---|---|
| **Hull** | (a) cheap RTR cat starter + printed v2, (b) bait boat (easy, ~5 mph), (c) Blackjack 42 (fast+roomy, big/pricey), (d) print v1 | Depends on speed-vs-size priority. Cheap RTR starter is the fast/cheap path; bait boat if speed can flex. |
| **Flight controller** | Navigator ($220), standalone FC + Pi (~$50), bare Pi+PCA9685 (~$50) | **Standalone FC + Pi** — cheap, robust, first-principles-friendly. |
| **Companion** | Pi 4, Pi 5, Jetson | Pi 5 if cameras matter; Jetson only if onboard vision/AI. |
| **Action camera** | DJI Osmo Action 6 / GoPro HERO13 / Insta360 X5 | DJI Osmo Action 6 (best stabilization + 20 m waterproof). |
| **Timeline** | days / 2–4 wks / 1–2 mo | Drives how far down the milestones you go (M1 only vs full v1). |
| **Camera record+stream** | dual-stream IP cam vs action cam + pilot cam | Dual-stream waterproof IP cam = simplest single device. |
| **Radar substitute** | lidar + camera + **AIS receiver** | AIS (~$100) to see real vessels; true radar too big for our scale. |

## Mechanical must-dos (from the audit — non-negotiable)
These aren't optional choices; skipping them breaks the boat. Full detail in `hardware/06`.
- **Vibration-damp the flight controller** (Sorbothane) or the EKF fails at speed.
- **Keep mass low / mast short + wide-base + guyed** or it tips.
- **Thermally manage the sealed box** (aluminum heatsink + Gore vent) or it throttles.
- **Plan for capsize** (masthead flotation, capsize-kill, submersion-proofing, retrieval) — a tower defeats self-righting.
- **Keep GPS away from LTE/USB3** or you lose your fix.
- **Tally the weight budget (~3 kg)** before buying a hull — small race cats are overloaded.

## Notes the build assumes (confirm during build)
- **Cell coverage** exists on your target water (some lakes are dead zones — check a coverage map; ELRS mitigates near shore).
- **Legal/safety:** unmanned-vessel rules vary — keep visual-line-of-sight capability, a bright hull, and stay clear of swimmers/traffic.

## Build sequence (fastest-time-to-water)
The real clock is **shipping**, not assembly. Order long-lead items now; everything else in parallel.
1. **M1** — floats, drives on Xbox via **Cockpit over Wi-Fi**, live video + GPS. *The working boat.* (≈ a weekend after parts arrive)
2. **M2** — add LTE + Tailscale + ELRS failsafe → out-of-sight range.
3. **M3** — lidar + wind meter on the printed mast (Observe mode).
4. **M4** — thermal, the **custom dashboard / dream-company stack**, autonomous missions.

> **Order today (long-lead):** the donor hull + the flight controller. Fast-ship later: Pi, RPLidar, wind sensor, LTE modem, ELRS, power bits.

## Prior art to study (reference builds)
- **RoboBoat** teams (SeaSentinel, aQuatonomous, AMORE) — full sensor cats; the gold standard for the sensor side.
- **n3m0** (DAV Foundation), **Leviathan** (Pololu) — DIY autonomous Pi boats.
- **Small Autonomous Survey Vessel** (Hackaday.io #166552) — Pi + sonar + GPS.
- **UAVcast-Pro** — Pi + 4G/LTE + MAVLink (our exact comms architecture, productized).
- **MIT Roboat II** — the research inspiration.
