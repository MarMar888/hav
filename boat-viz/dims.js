// All dimensions in INCHES. Coordinate system:
//   X: fore/aft, bow = +36, stern = -36 (hull centered at origin)
//   Y: vertical, keel bottom = 0, deck ≈ +9, water surface = +DRAFT
//   Z: port/starboard, centerline = 0, starboard = +
//
// Confidence tags:
//   [SPEC]  = manufacturer spec sheet / product page
//   [PHOTO] = estimated from the hull-bottom photo
//             (.context/attachments/8G6CEs/Screenshot 2026-07-15 at 11.47.55 PM.png)
//   [EST]   = engineering estimate, tune freely

export const DIMS = {
  hull: {
    length: 72,        // [SPEC] Lifetime Wave 90100 product page
    beam: 24,          // [SPEC]
    depth: 9,          // [SPEC] keel to deck rim (overall height)
    halfBeam: 12,
    chineHeight: 2.2,  // [EST] where the side turns under to the reverse chine
    bowTaperStart: 0.62, // [PHOTO] fraction of length (from stern) where bow taper begins
    // Recessed cockpit: the top of the hull is not flat — there is a ~3 in
    // deep inlet/well inboard of the rims where all equipment sits. [USER]
    deckInset: 3.0,
    recessRimFrac: 0.82,   // [EST] recess opening starts at 82% of local half-width
    recessFloorFrac: 0.70, // [EST] recess floor half-width
    weightLb: 18,      // [SPEC]
    capacityLb: 130,   // [SPEC]
  },
  // Recess floor height above keel = depth - deckInset = 6.0 in. Frame parts
  // below reference that floor, not the 9 in rim.

  // Water surface height above keel at ~65 lb all-up.
  // 65 lb / 62.4 lb/ft^3 ≈ 1800 in^3; waterplane ~615 in^2 -> ~3 in draft. [EST]
  draft: 3.0,

  scuppers: {
    // Two REAL through-holes, forward area. [PHOTO] ~21% of length aft of bow
    frontX: 21,        // 15 in aft of bow tip
    frontZ: 2.2,       // ± off centerline [PHOTO]
    holeDia: 0.75,     // [EST] typical Lifetime scupper ~3/4-1 in
    // Rear feature is a closed molded DIMPLE, not a hole (user confirmed). [PHOTO]
    dimpleX: -8,       // ~61% of length aft of bow
    dimpleZ: 0,
  },

  fins: {
    // Twin molded tracking fins at the stern. [PHOTO]
    xAft: -34, xFwd: -28,
    z: 4.0,            // ± off centerline
    depth: 1.5,        // below keel
    thickness: 0.5,
  },

  frame: {
    postDia: 0.5,        // [EST] stainless rod/tube through front scuppers
    postTop: 7.0,        // just above the 6.0 in recess floor
    postBottom: -0.7,
    puckDia: 2.2,        // [EST] bottom fairing pucks at the scupper exits
    puckHeight: 0.6,
    frontPlate: { x: 21, w: 4.5, d: 7.5, t: 0.4, y: 6.45 }, // [EST] plate on the recess floor over both posts
    railZ: 5.0,          // ± two aluminum deck rails
    railSize: 1.0,       // [EST] 1x1 in tube (80/20-class)
    railY: 6.8,          // rails run inside the recess, on the floor w/ pads
    railXFwd: 21, railXAft: -20,
    crossbar: { x: -20, span: 27.5, size: 1.2, y: 9.8 },   // [EST] crossbar rides on the rims, over the recess
    deckPlate: { xFwd: 12, xAft: -12, halfW: 6.5, t: 0.25, y: 7.45 }, // [EST] equipment plate down in the recess
    strut: { z: 13.2, chord: 2.0, thickness: 0.4, topY: 9.8, bottomY: -1.5 }, // [EST] faired struts, outside chines
    strapX: [-17.5, -22.5], // [EST] two cam straps bracketing the crossbar
  },

  lights: {
    // Nav lights: red port / green starboard on the bow rims, all-round white
    // on a stalk above the lidar plane. Stalk shadows a small aft lidar
    // sector — acceptable, or relocate later. [EST]
    bowX: 26, domeDia: 0.8, bowY: 9.35,
    whiteStalkH: 2.6, whiteDia: 0.7,
  },

  motor: {
    // Flipsky 56115: Ø56 x 115 mm -> 2.2 x 4.5 in. [SPEC]
    x: -20.5, y: -1.5, z: 13.2,  // rear third, just below keel line, outside chines [EST]
    dia: 2.2, length: 4.5,
    propDia: 5.0,       // [EST] prop TBD — pending Flipsky reply
  },

  pelican: {
    // Pelican 1200 exterior 10.62 x 9.68 x 4.87. [SPEC]
    l: 10.62, w: 9.68, h: 4.87,
    // Aft of center for planing trim: puts LCG ~57% aft of the bow.
    // Mount it SLIDEABLE on the rails so trim can be tuned on the water. [CALC]
    x: -5.5,
  },

  esc: {
    // Mini FSESC6.8 Plus: 103.5 x 67.6 x 27.5 mm -> 4.07 x 2.66 x 1.08 in. [SPEC]
    l: 4.07, w: 2.66, h: 1.08,
    x: 3.5, z: 4.0,     // between tower legs and box, heatsinks on the plate [EST]
  },

  // Component weight budget for CG calculation. lb, and x/y of each item's
  // own centroid in model coordinates. [EST] unless noted.
  weights: [
    { name: 'hull',                     lb: 18.0, x: -3,    y: 4    }, // [SPEC] wt; centroid aft of mid (bow taper)
    { name: 'motors+props',             lb: 7.5,  x: -20.5, y: -1.5 }, // [SPEC] 2x 1.535 kg + props/hardware
    { name: 'mount frame',              lb: 10.0, x: -5,    y: 6.5  }, // rails/crossbar/struts/posts/plates composite
    { name: 'straps',                   lb: 1.0,  x: -20,   y: 4.5  },
    { name: 'battery+pelican+fuse',     lb: 11.5, x: -5.5,  y: 10   }, // 2x 6S16Ah (~8.2) + case (~2.4) + wiring — keep x = pelican.x
    { name: 'escs',                     lb: 1.5,  x: 3.5,   y: 8.1  }, // keep x = esc.x
    { name: 'sensor tower+lidar+cam',   lb: 3.5,  x: 10,    y: 17   },
    { name: 'pi+lte+misc electronics',  lb: 2.0,  x: 0,     y: 8    },
  ],

  tower: {
    // Mini sensor tower: A-frame legs to a small platform carrying lidar + camera + GPS. [EST]
    x: 10,               // on the deck plate, forward of the Pelican box
    baseY: 7.6,          // top of deck plate (down in the recess)
    height: 14,          // platform height above plate
    legSpread: 3.0,      // ± leg footprint at the base (fore/aft and side)
    legDia: 0.6,
    platform: { w: 4.0, d: 4.0, t: 0.3 },
    // RPLidar C1: Ø55.6 x 41.3 mm -> Ø2.19 x 1.63 in. [SPEC]
    lidar: { dia: 2.19, h: 1.63 },
    // Pilot camera: small box w/ lens, faces the bow. [EST]
    camera: { w: 1.6, h: 1.1, d: 1.0, lensDia: 0.7 },
    gpsDia: 1.6,
  },
};
