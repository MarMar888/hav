# Brain & Autopilot

## The key clarification: "it all runs on the Raspberry Pi"
A common confusion: *"Why a separate flight controller — can't the Pi do everything?"*

**It can, and that's exactly what the recommended setup is.** The Blue Robotics **Navigator** is an **add-on HAT that snaps onto the Pi — not a second computer.** ArduPilot runs as *software on the Pi*; the HAT just gives the Pi:
- Real motor-grade **PWM outputs** (via an internal PCA9685 chip),
- **IMU / compass / barometer / ADC**,
- Connectors for GPS, ESCs, sensors.

So "run everything off the Pi" = the Navigator setup. You are not adding a separate brain.

## Two jobs, don't confuse them
| Layer | Job | Runs on |
|---|---|---|
| **Autopilot** (flight controller) | Real-time motor control, IMU fusion, GPS waypoints, **failsafe / return-to-home** | A dedicated chip (Navigator HAT, or a standalone FC) running **ArduPilot Rover (Boat frame)** |
| **Companion computer** | Video, sensors, LTE, the dashboard backend | The **Raspberry Pi** (Linux) |

With the Navigator, both live on the same physical Pi+HAT stack. With a standalone FC, they're two boards talking over serial.

## Flight-controller options (cheapest → most turnkey)
| Option | ~Cost | Effort | Notes |
|---|---|---|---|
| **Bare Pi + PCA9685 + IMU + GPS** | ~$40–60 | **High** (first-principles) | Runs ArduPilot-Linux. Caveat: the PCA9685 has PWM-frequency limits — Navio2/Navigator replaced it with a microcontroller for exactly this reason. Most tinkering. |
| **Standalone FC (Matek / SpeedyBee / Pixhawk clone) + Pi companion** | ~$40–60 FC | **Low–medium** | ⭐ Best cheap+robust option. Dedicated real-time MCU + proper failsafe; Pi does the high-level stuff. Saves ~$160 vs Navigator. |
| **Navio2** (Emlid) HAT | ~$170–200 | Low | Polished Pi-HAT autopilot, ArduPilot + ROS preinstalled. |
| **Navigator** (Blue Robotics) HAT | $220 | **Lowest** | Ships with BlueOS; what the BlueBoat uses. Pi-4 form factor. |

**The one rule:** *keep ArduPilot.* Do **not** drive motors off the Pi's bare GPIO with your own control loop and no autopilot — you'd lose failsafe/return-to-home and risk losing the boat on open water.

## Companion compute scales with *vision ambition*, not camera quality
- **Pi 4** — baseline, fine for relay + sensors + LTE.
- **Pi 5** — better video relay headroom (hardware decode). Good if cameras matter.
- **Jetson Orin Nano** (~$250–500) — only if you want the boat to **see & think**: onboard computer vision, object tracking, vision autonomy. This is the RoboBoat-team route. Adds cost, ~15–25 W power, heat.

> Camera *quality* does NOT require a Jetson — a GoPro records its own 4K, and the live feed is capped by the LTE uplink anyway (see `04-sensors-and-cameras.md`).

## Why a flight controller at all (vs. just code on the Pi)
- **Real-time safety:** Linux isn't real-time; if the Pi's OS hangs or the SD card hiccups, a Pi-only boat loses control. A dedicated FC keeps controlling + failsafing regardless.
- **Proven autonomy:** ArduPilot gives GPS waypoints, geofence, position-hold, and **auto return-home on lost signal** — battle-tested, not worth re-writing (especially time-constrained).

## Decision status
**OPEN** (but low-risk). Recommended: **standalone cheap FC + Pi companion** (best blend of cheap, robust, first-principles-friendly). Navigator if you want zero fuss. See `tradeoffs/02`.
