# Hardware Overview

> **Hardware is the main concern of this project.** The software is fun and flexible; the hardware is what floats, gets wet, draws power, and can sink $1k+ of electronics. Get this right.

## Guiding philosophy
**Cut corners on hardware; buy off-the-shelf.** Reinventing hulls, motors, and autopilots is the slow, joyless rabbit hole. Every hardware layer here is a solved, purchasable thing. (The *software* is where we go first-principles — see `software/`.)

## The system, end to end
```
                    [ 4G/LTE cell network ]
                            |
   ┌─── BOAT ───────────────────────────┐        ┌─── GROUND ───┐
   │  Donor hull + brushless motor/ESC   │        │  Laptop/PC    │
   │  Raspberry Pi  ── Flight Controller │ <—4G—> │  Dashboard    │
   │     (companion)    (ArduPilot)      │        │  Xbox pad     │
   │  GPS · IMU · LTE modem · ELRS Rx    │        └───────────────┘
   │  Cameras · Lidar · Wind · Power     │            ^
   └─────────────────────────────────────┘            |
                            └──── ELRS 915MHz backup ──┘ (safety/failsafe)
```

## Subsystems (each has its own doc)
| # | Subsystem | Doc | One-liner |
|---|---|---|---|
| 1 | Hull + propulsion | `01-hull-and-propulsion.md` | Bought brushless catamaran; speed comes from the motor, not the hull |
| 2 | Brain + autopilot | `02-brain-and-autopilot.md` | Pi (companion) + a flight controller running ArduPilot |
| 3 | Comms + range | `03-comms-and-range.md` | 4G/LTE primary, ELRS radio as the safety backup |
| 4 | Sensors + cameras | `04-sensors-and-cameras.md` | Lidar, wind meter, GPS, low-latency pilot cam + 4K action cam |
| 5 | Power + endurance | `05-power-and-endurance.md` | ~30 min at cruise; separate battery for the electronics |
| 6 | **Mechanical / environment** | `06-mechanical-design-and-environment.md` | Stability, tower, vibration, thermal, capsize — **the make-or-break layer** |

## The core constraints (and the conflict between them)
The whole build is shaped by **four wants that fight each other**:
1. **Fast** — wants a light, sleek planing hull + big motor.
2. **Long-range** — solved by LTE (not hull-dependent), but range-at-speed costs battery.
3. **Small / "not too big"** — limits battery and payload room.
4. **Lots of sensors** — wants payload room + a stable platform + power.

You **cannot maximize all four**. The resolution is **modes** (a fast mode and a slow sensing/"observe" mode on one boat) and accepting that the full sensor mission runs at a moderate cruise. See `tradeoffs/01-key-tradeoffs.md` — this is the single most important idea in the whole project.

## The #1 hardware risk: water
Most marine-robot failures are **water ingress**, not code. Mitigations baked into the plan:
- Sealed electronics in a dry box, conformal-coat boards, cable glands on every pass-through.
- **Positive buoyancy** (flotation foam) so a swamped boat floats instead of sinking the electronics.
- A **leak/water sensor** + ArduPilot **return-to-home** failsafe.
- Waterproof action cameras (GoPro-class) sidestep the camera-housing fogging problem entirely.

## What we are NOT building from scratch
The autopilot (ArduPilot), the hull, the motor/ESC, the OS (BlueOS) — all bought/open-source. We bridge and orchestrate them; we don't reinvent them.
