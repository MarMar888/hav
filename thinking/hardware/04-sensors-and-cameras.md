# Sensors & Cameras

## The sensor suite (v1)
| Sensor | Part | ~Cost | Role |
|---|---|---|---|
| **Pilot camera** (live) | Pi Cam 3 / USB / FPV cam → WebRTC | $30 | The low-latency feed you *drive* by |
| **Quality/record camera** | Waterproof action cam (GoPro / DJI Osmo Action / Insta360) | $200–400 | Gorgeous 4K stabilized footage to SD |
| **Pan/tilt** | 2× servo + printed gimbal | $20–35 | Look around / track sailing (gamepad-controlled) |
| **Lidar** (above-water) | RPLidar C1, 360° | ~$100 | Obstacle avoidance (native in ArduPilot Rover) |
| **Wind meter** | RS485 ultrasonic anemometer | ~$90 | Wind speed/direction (great for the sailing mission) |
| **GPS + compass** | uBlox M9N/M10 | $40–80 | Position, waypoints, return-home |

## Cameras: the recording-vs-live distinction (important!)
You want **GoPro-class quality**, and you can have it — but understand the split:
- **Recorded onboard:** full **4K/5.3K** GoPro beauty straight to the camera's SD card. The Pi never touches it. Watch the epic footage after.
- **Live to the dashboard over LTE:** capped at **~720–1080p** by the **cellular uplink** (1–5 Mbps), *not* by the camera or the Pi. Even a GoPro live over 4G is ~1080p.

**Conclusion:** GoPro quality does **not** require leaving the Raspberry Pi. The Pi just relays a 1080p stream (easy, especially Pi 5). The 4K lives in the recording.

### Two-tier camera setup (the pro approach)
1. **Cheap low-latency pilot cam** → natively streams through the Pi; what you drive by (latency beats resolution for driving).
2. **Waterproof action cam on the gimbal** → 4K record + optional 1080p live.

GoPro live-into-Linux is the finicky part (HERO 8/9/10 do ~1080p USB webcam mode via community tools; HDMI-out needs the $79 Media Mod). The two-camera split sidesteps most of that pain.

### Camera picks (all waterproof — a big win on a boat)
- **DJI Osmo Action 6** — waterproof 20 m, best-in-class stabilization. Top pick.
- **GoPro HERO13 Black** — 10 m, supports live streaming.
- **Insta360 X5** — 8K 360°, reframe later, 15 m.

Waterproofing is the real advantage: a bare Pi cam needs a sealed housing with a clear port that **fogs and water-spots**; an action cam just shrugs off spray.

## "Sonar" — clarified
The original idea mentioned underwater sonar, but the real want turned out to be **above-water obstacle sensing**, done with **cheap lidar** (not underwater depth). So:
- **DROPPED from v1:** underwater depth sonar. (Optional phase-2 add: Blue Robotics **Ping echosounder**, $430, if you ever want depth/bathymetry.)
- **IN v1:** **RPLidar C1** (~$100) for 360° obstacle avoidance — natively supported by ArduPilot Rover (`PRX1_TYPE`, `AVOID_ENABLE=7`).

### Lidar caveat (be realistic)
~12 m range, and it **degrades in bright sun / over reflective water**. Treat it as **close-range collision warning** (don't ram docks/buoys/boats), with the **camera as the primary eyes**. Mount it on top of the mast, clear 360°, cable to the rear.

## "Infrared" — clarified → thermal (Phase 2)
Confirmed as **thermal heat-vision** (FLIR Lepton 3.5 + PureThermal USB, ~$250–350), *not* IR-LED night vision (which is near-useless over open water). Streams through BlueOS like any UVC camera. Phase 2.

## Wind meter — the "in-between" pick
A **~$90 RS485 ultrasonic anemometer** (industrial unit, no moving parts) — robust like the $250 marine ones but a third of the price. Reads into the Pi over a USB-RS485 adapter. Mount at the very top of the mast, above the lidar. ArduPilot already supports wind sensors (from its sailboat code).

## Sensor positioning & layout (height vs. noise vs. stability)
**Principle:** mount each sensor **as low as its job allows.** Height helps the *view* (less spray, less water-clutter, clearer horizon) but **costs stability** (raises CG), **amplifies vibration** (long lever arm), and adds **wind load**. Only the wind meter truly needs to be highest.

Bottom → top:
| Height | What | Why there |
|---|---|---|
| **In the hulls (lowest)** | Drive battery, electronics battery, Pi/FC dry box, ESC | Heavy mass low = low CG = won't tip. FC **vibration-damped** + centered. |
| **Deck** | Power module, leak sensor | Low, protected. |
| **Low/forward on mast** | Pilot camera (forward), action cam on pan/tilt | Driving view; keep the heavy cam as low as gives a clear shot. |
| **Mid mast** | Lidar | High enough to clear the deck for 360°, low enough to limit CG. |
| **Upper mast** | LTE + GPS antennas | Clear sky for GPS; **keep GPS away from the LTE modem/USB3** (EMI). |
| **Masthead (highest, lightest)** | Wind meter | Clean airflow above everything. |

The tower itself (short, wide-base tripod, guyed, quick-release) is in `06-mechanical-design-and-environment.md` §B — that's where *"how do we build a tower that doesn't tip"* lives.

## Record **and** stream at the same time (waterproof)
You want gorgeous recordings *and* a live feed. Two clean ways:
- **Option 1 — dual-stream waterproof IP camera (simplest single device).** Waterproof 4K IP cameras (Reolink-class) output **two streams at once**: a **main stream** (4K H.265) recording to the camera's SD, and a **sub-stream** (720p H.264) for live. The sub-stream is **RTSP** → the Pi relays it (MediaMTX / Ant Media) → **SRT/WebRTC** to the dashboard. One waterproof box does both.
- **Option 2 — action cam + pilot cam (best image).** Waterproof action cam (GoPro/DJI/Insta360) records **4K to SD**; a separate cheap waterproof cam (or the action cam's 1080p webcam-out) handles the **live** feed.

Either way: **live is LTE-capped (~720–1080p); the 4K lives in the recording.** RTSP→WebRTC via a media server keeps live latency low.

## Radar vs. lidar vs. AIS (the Splash9 cue)
Industrial ASVs (Splash9) use **radar** — all-weather, works **over water at range**, sees other vessels. That's the "right" answer, but small marine radar is **heavy, expensive, power-hungry** — out of scope for our small/cheap boat.
**Our cheap, layered substitute:**
- **Lidar** — close-range obstacle stop (~12 m, Observe-mode).
- **Camera** — the primary eyes.
- **AIS receiver (~$100, phase 2)** — receives real vessels' position/heading broadcasts and plots them on your map. The single best cheap upgrade for **safety around real boat traffic** (which a sailing-watching boat will be in).
