// Top-speed prediction for the kayak build.
//
// Method: build a DRAG curve R(v) and a THRUST curve T(v), both in lbf vs boat
// speed. Steady top speed is the highest v where T(v) == R(v). Whether the boat
// planes at all is a separate check: can thrust clear the displacement "hump".
//
// This is an engineering estimate, not a tank test. The single largest unknown
// is the propeller (pitch + how fast thrust decays with boat speed), so the
// model is parameterized on it. Everything is in US units.
//
// Works in both Node and the browser (no imports).

const RHO = 1.94;     // seawater-ish density, slug/ft^3 (fresh ~1.936, close enough)
const NU = 1.2e-5;    // kinematic viscosity, ft^2/s
const G = 32.2;       // ft/s^2
const MPH2FPS = 1.46667;

function cf(Re) { return 0.075 / Math.pow(Math.log10(Math.max(Re, 1e5)) - 2, 2); }

// Running trim angle (deg): steep just after it planes, flattening at speed.
function trimDeg(mph) {
  const a = 8, b = 26, hi = 5.5, lo = 3.0;
  const u = Math.min(1, Math.max(0, (mph - a) / (b - a)));
  return hi + (lo - hi) * u;
}

export const DEFAULTS = {
  weightLb: 55,       // all-up, from the BOM balance calc
  Lft: 5.67,          // waterline length ~68 in
  S0: 6.0,            // displacement wetted area, ft^2
  Sp: 3.8,            // planing wetted area, ft^2 (less hull in the water)
  CdA_app: 0.019,     // appendage drag area (2 motor pods + struts + prop discs), ft^2
  pitchIn: 5.0,       // PROP PITCH — the big unknown. 4/5/6 are the scenarios.
  rpm: 5500,          // loaded motor rpm at 12S (150KV * ~44V, ~83% of no-load)
  pitchFactor: 0.90,  // real zero-thrust speed sits a bit below geometric pitch speed
  T0perMotor: 40.3,   // static thrust per motor, lbf. 40.3 = 18.3 kgf @ rated 30A;
                      //   59.5 = 27 kgf @ burst 60A (Flipsky's own figures)
};

// Drag in lbf at a given speed (mph).
function dragLb(v, p) {
  const fps = v * MPH2FPS;
  const Re = fps * p.Lft / NU;
  const q = 0.5 * RHO * fps * fps;

  // Displacement branch: friction on full wetted area + a wave-drag hump.
  const Rf0 = q * cf(Re) * p.S0;
  const Fr = fps / Math.sqrt(G * p.Lft);
  const Rw = p.weightLb * 0.11 * Math.exp(-Math.pow((Fr - 0.50) / 0.16, 2));
  const dispHull = Rf0 + Rw;

  // Planing branch: induced drag (W*tan trim) + friction on planing area.
  const tau = trimDeg(v) * Math.PI / 180;
  const Rf = q * cf(Re) * p.Sp;
  const planeHull = p.weightLb * Math.tan(tau) + Rf / Math.cos(tau);

  // The boat rides on whichever branch is cheaper at that speed.
  const hull = Math.min(dispHull, planeHull);
  const app = q * p.CdA_app;
  return hull + app;
}

// Total thrust (both motors) in lbf at a given speed (mph).
function thrustLb(v, p) {
  const fps = v * MPH2FPS;
  const nRps = p.rpm / 60;
  const vZero = p.pitchFactor * nRps * (p.pitchIn / 12); // fps where thrust -> 0
  const perMotor = p.T0perMotor * Math.max(0, 1 - fps / vZero);
  return 2 * perMotor;
}

export function predict(overrides = {}) {
  const p = { ...DEFAULTS, ...overrides };
  const curve = [];
  let top = 0, prevSign = 1;
  const dispCrit = { mph: 0, drag: -1 }; // track displacement-hump drag peak

  for (let v = 0; v <= 40; v += 0.25) {
    const d = dragLb(v, p), t = thrustLb(v, p);
    curve.push({ mph: v, drag: d, thrust: t });
    // highest crossover where thrust drops through drag
    const sign = Math.sign(t - d);
    if (sign < 0 && prevSign >= 0 && v > 1) top = v;
    prevSign = sign === 0 ? prevSign : sign;
  }

  // Hump check: peak of the displacement branch below ~9 mph, and thrust there.
  let humpMph = 0, humpDrag = 0;
  for (let v = 2; v <= 9; v += 0.25) {
    const fps = v * MPH2FPS, Re = fps * p.Lft / NU, q = 0.5 * RHO * fps * fps;
    const Fr = fps / Math.sqrt(G * p.Lft);
    const dispHull = q * cf(Re) * p.S0 + p.weightLb * 0.11 * Math.exp(-Math.pow((Fr - 0.50) / 0.16, 2));
    const dtot = dispHull + q * p.CdA_app;
    if (dtot > humpDrag) { humpDrag = dtot; humpMph = v; }
  }
  const thrustAtHump = thrustLb(humpMph, p);
  const planes = thrustAtHump > humpDrag * 1.05; // needs margin to climb over

  return { params: p, curve, topMph: top, planes, humpMph, humpDrag, thrustAtHump };
}
