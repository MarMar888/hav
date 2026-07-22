# Software Overview

## The split that drives everything
**Buy the firmware/hardware layer; build the app layer first-principles.**
- **Bought (off-the-shelf):** the autopilot/firmware — **ArduPilot** on the flight controller, **BlueOS** on the Pi. Reinventing an autopilot is the slow, risky rabbit hole. Don't.
- **Built (first-principles, the fun part):** the entire **command / cloud / dashboard** layer — talking MAVLink, streaming video, the map UI, the Xbox control loop, auth.

This split matches the builder's preference (loves first-principles **software**, pragmatic about hardware) *and* a dream company's stack (see `02-dream-company-stack.md`).

## Two software tracks
| Track | Purpose | Doc |
|---|---|---|
| **Onboard + control stack** | Gets the hardware driving ASAP; the proven base | `01-onboard-and-control-stack.md` |
| **Dream-company stack** | The custom, portfolio-grade cloud + dashboard | `02-dream-company-stack.md` |

## The pragmatic sequence (so software never blocks getting wet)
1. **Cockpit first.** Use Blue Robotics' open-source [Cockpit](https://github.com/bluerobotics/cockpit) ground station — it has **Xbox/gamepad support built in** — to drive the boat on day one over Wi-Fi. Zero custom code needed to get on the water.
2. **Build the custom stack in parallel**, against an **ArduPilot SITL** simulated boat (develop with no hardware). This is the first-principles thread — the rewarding part.
3. **Switch over** to the custom dashboard once it reaches parity; keep Cockpit as a backup.

> Trap to avoid under time pressure: don't build the custom dashboard *before* you can drive. Cockpit gets the **hardware** wet while your **stack** catches up.

## The data interfaces (what the software talks to)
- **MAVLink** — the autopilot protocol (telemetry + commands). BlueOS exposes it as REST/WebSocket via `mavlink2rest`.
- **WebRTC / SRT** — video transport (low-latency / loss-resilient).
- **Gamepad API** — the Xbox controller, read in the browser.
- **MapLibre** — the map.

## Everything here is free
BlueOS, Cockpit, ArduPilot, Go, React, MapLibre, Tailscale (free tier) — **$0 of software cost.** The "super cool software" is all open-source or self-built.
