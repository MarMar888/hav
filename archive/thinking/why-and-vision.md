# Why We're Building This (the north star)

*A reality check, because a plan this detailed can drift away from the point.*

## The vision, in one line
Build a **cool, fast, sensor-filled, battery-powered, technology-driven boat** — and pair it with **incredible software.**

## Unpacking each word (and whether the plan still serves it)
| Want | Does the plan deliver it? | How |
|---|---|---|
| **Cool** | ✅ | A 4G-controlled robot boat with a live video/map/telemetry dashboard, driven by an Xbox controller. It's a Roboat you built. |
| **Fast** | ✅ *as a mode* | Brushless catamaran that planes (30–45+ mph) in **Fast mode** (mast off). Not while fully loaded + cruising — that's physics, not a compromise we chose. |
| **Sensor-filled** | ✅ | Cameras (4K + pilot), 360° lidar, wind meter, GPS/IMU, optional thermal + AIS. |
| **Battery-powered** | ✅ | LiPo drive pack + isolated electronics battery; ~30 min at cruise. |
| **Technology-driven** | ✅ | ArduPilot autonomy, LTE/internet control, sensor fusion, return-to-home. |
| **Incredible software** | ✅✅ | The real payoff — a custom **Go + connectRPC + React + SRT/WebRTC + MapLibre + AWS** stack (and a portfolio piece for a dream job). |

## The one honest tension to keep in view
**"Fast" and "fully-loaded sensing" don't happen in the same instant** (speed = spray, vibration, battery drain, tip risk). The plan resolves this with **two modes on one boat** — rip around in Fast mode, sense/film in Observe mode. If you ever feel the plan getting "too slow/survey-y," that's the signal to protect Fast mode (keep the hull planing-capable, the mast quick-release, the weight down).

## What makes THIS build worth it (vs. buying a toy)
1. **You control it from anywhere** over the internet (not a 1 km RC toy).
2. **It carries real sensors** and shows them on a dashboard you built.
3. **The software is the centerpiece** — it exercises a professional, in-demand stack end-to-end on real hardware. That's the differentiator and the career payoff.
4. **It's a platform, not a product** — modular, like the industrial ASVs (Splash9), so it grows (thermal cam, AIS, autonomy, a bigger v2 hull).

## Guardrails so we don't lose the plot
- **Don't over-engineer the hardware** — buy it, cut corners, get on the water (hardware is the means, not the love).
- **Do go deep on the software** — that's the rewarding part and the portfolio.
- **Protect "fast" and "cool"** — keep the boat planing-capable and the dashboard slick; don't let it become a slow grey survey barge.
- **Respect the physics** — the mechanical/stability work (`hardware/06`) is what lets the cool/fast/sensor wants coexist instead of sinking.

## The success criterion
> *Drive your boat out onto the water from your laptop with an Xbox controller, watch a crisp live video + map + telemetry feed on a dashboard you wrote, run a lap fast, then drop the mast and cruise while it senses — and have it return home by itself if the signal drops.*

If a decision doesn't move toward that picture, it's scope creep.
