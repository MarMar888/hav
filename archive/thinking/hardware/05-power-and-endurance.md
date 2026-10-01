# Power & Endurance

## The target: ~30 minutes of driving
**Achievable — at a cruise, not at full throttle.** Throttle is the single biggest factor in runtime.

## The power budget
Three draws:
| Draw | Power | Notes |
|---|---|---|
| **Electronics ("hotel load")** | ~15 W | Pi + LTE + lidar + camera + GPS — constant, regardless of speed |
| **Cruising** (a few mph, sensing) | ~100–200 W | The endurance mode |
| **Full-throttle planing** (30–45 mph) | ~500–800+ W | Motor pulling 40–70 A |

A **4S 8,000 mAh** pack ≈ **120 Wh**. So:

| Mode | Total draw | Runtime on ~120 Wh |
|---|---|---|
| Cruise / sensing | ~130–215 W | **~33–55 min** ✅ |
| Mixed (mostly cruise, some sprints) | ~250 W | **~28 min** |
| Full throttle continuous | ~600 W+ | **~10–12 min** ❌ |

**So 30 min is comfortably in reach at a cruise** — exactly the pace for watching sailing + running sensors. You **cannot** plane for 30 min straight without 3–4× the battery (heavy, expensive, swamps a small hull). Fast running is always short bursts — true of every fast RC boat.

## How to guarantee the 30 minutes
1. **Give the electronics their own battery** (a small 2S pack or a USB power bank for the Pi). The single most important move:
   - The main drive pack becomes 100% propulsion.
   - The Pi never **browns out** from motor current spikes.
   - Sensors/video keep running even while you sit and drift.
2. **Size the drive pack to ~4S 8–10 Ah** (~120–150 Wh) — that buys the 30+ min of cruise.
3. **Cruise for long sessions; sprint in bursts.** The "two modes" idea, applied to the battery.

## Power components (v1)
| Item | ~Cost | Role |
|---|---|---|
| Drive battery: 4S 8–10 Ah LiPo + charger | $90–160 | Propulsion |
| Electronics battery: small 2S / USB power bank | $20–40 | Isolated supply for Pi + sensors |
| Power module (V/I telemetry) + 5V UBEC/BEC | $40–70 | Monitoring + regulated 5V |

## The endurance ↔ speed tradeoff
- **Want hours instead of 30 min?** That's the efficient **bait-boat / thruster** route → **2–3 hours** (slow displacement hull, big battery).
- **Want speed?** Accept ~10–15 min of *fast* running, but still get **30 min at cruise.**
- The fast cat gives you both — just not at the same time.

## Safety/power notes
- Battery weight affects a small fast hull's handling and CG — another reason the *full* endurance + sensor mission fits a **bigger / printed v2** hull.
- Water-cooled ESC/motor (standard on RC boats) — keep the cooling loop intact when you mod the boat.
- LiPo safety: fuse the main pack, use a proper charger, don't over-discharge.
