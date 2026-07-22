# Comms & Range

## The decision: 4G/LTE + onboard Pi (with an ELRS safety backup)
We picked **"control over the internet via 4G/LTE"** over traditional line-of-sight RC, because it's the only architecture that gives **both** true long distance **and** a fat data pipe for cameras + sensors → dashboard. It's also the most "Roboat-like" and the natural fit for a computer dashboard.

## The three comms architectures we compared
| Option | Range | Data pipe | Verdict |
|---|---|---|---|
| **A) ELRS + analog video** | ~1 km line-of-sight | thin | Simplest/cheapest, but caps range + dashboard richness |
| **B) ELRS long-range + digital video** | several km LOS | medium | Real distance, but long-range video is the hard/expensive part |
| **C) 4G/LTE + onboard Pi** ✅ | anywhere with coverage | fat | **Chosen.** True long range + rich sensor data + dashboard-native |

## How the LTE link works
- **USB 4G/LTE modem** on the Pi (use a **USB modem, not a stacking HAT**, to avoid a GPIO conflict with the Navigator HAT) + a **data SIM** (~$10–25/mo IoT/pay-as-you-go).
- The boat is behind **cellular NAT**, so it **dials *out*** to your cloud/laptop — via a VPN (**Tailscale** / ZeroTier) or, in the custom build, a persistent gRPC/WebSocket connection to the cloud backend.
- **Video** rides over **WebRTC** (low latency) and/or **SRT** (resilient to packet loss on lossy cellular — see `software/`).
- **Telemetry** over MAVLink (`mavlink2rest`) / WebSocket.

## The safety backup: ELRS — *mandatory, not optional*
- **ExpressLRS (ELRS) 915 MHz** receiver on the boat + a cheap ELRS transmitter module on shore.
- Gives **direct manual override** and a hardware **failsafe** near shore, so a **dropped cell signal never means a lost boat**.
- Paired with ArduPilot's **return-to-home on signal loss**.
- ~$50–80 total.

## Range reality checks
- **Coverage is the real limit.** Some lakes are cellular dead zones — check a coverage map for your water. The ELRS backup mitigates dead spots near shore.
- **Latency:** LTE control delay is typically <150 ms (fine for a boat; you're not racing drones). Tune video bitrate to the uplink.
- **Antennas:** a higher-gain LTE antenna + good GPS antenna mounted **up high on the sensor mast** improves both signal and fix quality (a phase-2 upgrade).

## Bill (comms portion)
| Item | ~Cost |
|---|---|
| USB 4G/LTE modem + antennas | $110–160 |
| Data SIM | $10–25/mo |
| ELRS Rx + Tx module | $50–80 |

## Decision status
**LOCKED.** LTE primary + ELRS failsafe.
