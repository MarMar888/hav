# Dream-Company Stack (the custom build = a portfolio piece)

The boat's software is (re)built in the **exact stack of a company the builder wants to work for** — so it doubles as an **audition/portfolio piece**. The job description maps almost 1:1 onto this system.

## JD → boat mapping
| Their stack | This boat |
|---|---|
| **Go + connectRPC** microservices | Command & control backend: telemetry ingest, command dispatch, mission/device APIs |
| **AWS Lambda + Load Balancers** | Stateless APIs (auth, device registry, mission/history) behind an ALB |
| **Kubernetes** | Stateful media + telemetry hub (SRT→WebRTC, live fan-out) |
| **React** | The dashboard |
| **WebSockets** | Live telemetry + control channel (dashboard ↔ cloud ↔ boat) |
| **WebRTC + SRT streaming** | Boat camera: SRT ingest (survives lossy LTE) → WebRTC to the browser |
| **MapBox / MapLibre** | Map: GPS track, waypoints, geofence |
| **Secure user-level authz** | Who can *drive* vs *view* (JWT/OIDC) |
| **IoT telemetry / debugging** | The boat *is* the IoT device; the pipeline is the telemetry system |

## The layers
### 1. Boat edge agent — **Go**
A single static Go binary on the Pi:
- Reads **MAVLink** from the flight controller (telemetry up, commands down).
- **Dials out** to the cloud (the boat is behind cellular NAT) over a gRPC/Connect stream + WebSocket.
- Pushes the camera via **SRT** (Secure Reliable Transport — built for low-latency video over lossy networks like cellular; this is exactly what the JD's "SRT streaming" is for).

### 2. Cloud — **AWS**
- **Go connectRPC services**: command & control, missions, device registry.
- **AWS Lambda** — stateless (auth, CRUD, history queries).
- **Kubernetes** — stateful: a **media server** doing **SRT→WebRTC**, and the **WebSocket telemetry hub** (fans telemetry out to dashboards).
- **Load balancer** in front; **secure user-level authz** (drive vs view).

### 3. Frontend — **React** (this repo)
- **MapLibre** map (GPS track, waypoints, geofence).
- **WebRTC** video player (low-latency boat feed).
- **WebSocket** client for live telemetry (battery, heading, speed, wind, lidar obstacle ring).
- **connectRPC** (Connect-Web) client for commands/missions.
- **Gamepad API** → read the Xbox controller, send control messages.

### 4. CI/CD
GitHub Actions → build Go binaries/containers → AWS (Lambda + K8s); frontend → Vercel/CloudFront.

## The clean split (unchanged by all this)
ArduPilot/BlueOS still runs the **autopilot** on the boat (off-the-shelf, failsafe-grade). The Go agent just **bridges MAVLink ↔ cloud**. You build the entire **command/cloud/app layer** in the company's stack; flight control stays bought.

## Suggested first build slice
- **A)** Go boat-agent + connectRPC contract (define telemetry/command protobufs; get MAVLink into a Go service) — the backbone.
- **B)** React + MapLibre + WebSocket dashboard against SITL (see a boat move on a map *today*, in this repo).
- **C)** SRT→WebRTC pipeline (trickiest/flashiest — live low-latency browser video).

## Why this is the move
Interview gold: *"I built a 4G-connected autonomous boat with a Go/connectRPC backend on Lambda+K8s, SRT→WebRTC video, a React/MapLibre command dashboard, and user-level authz"* — that **is** their job description, demonstrated on real hardware.
