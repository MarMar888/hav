# Onboard & Control Stack (the proven base)

This is the off-the-shelf software that flies the boat and gets you driving fast. **Don't reinvent it** — it's the "buy the firmware layer" half of the split.

## The stack
| Layer | What | Why |
|---|---|---|
| **Autopilot firmware** | **ArduPilot Rover** (Boat frame) | GPS waypoints, position-hold, geofence, **return-to-home / failsafe**. Battle-tested. |
| **Companion OS** | **BlueOS** (on the Pi) | Marine-robot OS: manages the autopilot, video streaming, and exposes clean APIs. |
| **Ground station (stand-in)** | **Cockpit** (Blue Robotics) | Open-source, browser-based, **Xbox/gamepad support built in**. Drive on day one. |

## What BlueOS gives you for free (the APIs your custom stack consumes)
- **`mavlink2rest`** — MAVLink telemetry + commands as REST/WebSocket. This is the bridge that makes the custom dashboard possible without touching hardware directly.
- **WebRTC video** (`mavlink-camera-manager`) — streams any connected camera (USB/Pi cam, even a thermal UVC cam) to the browser.
- Autopilot firmware management, parameter config, logging, extensions.

## ArduPilot Rover (Boat) specifics worth knowing
- **Frame:** Rover firmware has a native boat/USV config. Twin-motor cats use **skid/differential steering** (each ESC on its own output); single-motor boats use throttle + rudder servo.
- **Object avoidance:** set `PRX1_TYPE` to the lidar type + `AVOID_ENABLE=7` → it auto-stops before obstacles (RPLidar C1 is natively supported).
- **Failsafes:** GCS/RC loss → configurable RTH or hold. **This is why we keep a real autopilot** rather than a bare Pi loop.
- **Wind sensor:** ArduPilot supports wind vane/anemometer input (from its sailboat code).

## Development without hardware: SITL
**ArduPilot SITL** (software-in-the-loop) simulates the whole boat. Run it (optionally with **BlueOS in Docker**) to develop the dashboard against real MAVLink + simulated telemetry **before any parts arrive**. The simulated boat can arm, take a waypoint, and RTH — and your dashboard talks to it exactly like the real thing.

## The hand-off
Cockpit is the **day-one** way to drive (gamepad + video + map, no code). The custom stack (next doc) is built in parallel and takes over when ready — Cockpit stays as the backup GCS.

## The boat edge agent (bridge to the custom stack)
In the custom build, a small **Go agent** runs on the Pi alongside BlueOS: it reads MAVLink, dials *out* to the cloud (cellular NAT), and bridges telemetry/commands + pushes video. See `02-dream-company-stack.md`.
