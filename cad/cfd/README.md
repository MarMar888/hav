# CFD — hull resistance

OpenFOAM v2606, installed natively on Apple Silicon:

```bash
brew install --cask gerlero/openfoam/openfoam
of() { /Applications/OpenFOAM-v2606.app/Contents/Resources/etc/openfoam -c "$@"; }
```

## Geometry

`export_surfaces.py` runs `hull.py` and writes `geometry/*.stl` in OpenFOAM
coordinates: metres, **+x downstream** (bow at −0.84, transom at +0.39), **z = 0 at the
undisturbed free surface** (the static waterline at the 62 lb design weight). Re-run it
after any change to `hull.py` so the CFD geometry can't drift from the CAD:

```bash
cd cad && agentcad run cfd/export_surfaces.py --label cfd-surfaces --no-preview --no-diff --no-view
```

## hav-captive — fixed-attitude resistance

Adapted from the `DTCHull` tutorial (interFoam, VOF free surface, k-omega SST,
local time stepping for a steady answer). Half domain, symmetry on the centreplane.

```bash
of './runMesh.sh'    # blockMesh -> decomposePar -> snappyHexMesh -> checkMesh   (~5 min)
of './runSolve.sh'   # setFields -> interFoam on 8 cores                         (~80 min)
```

- Mesh: 589k cells. 80 mm background, 5 mm on the hull, 10 mm through the free surface.
- Forces land in `postProcessing/forces/0/force.dat`. **Half domain: double them.**
  Force components are (x = drag, y = side, z = lift), moments about the CG at
  x = −0.0405 m, z = −0.011 m.

### What this case does and does not do

**Captive**: the hull is pinned at its static attitude — level, 115 mm draft. A real
planing boat rises and trims bow-up, so this run is a setup check and a force
measurement at a known attitude, **not** the boat's actual drag. Getting the real number
needs either a matrix of fixed attitudes with the equilibrium interpolated from the
force and moment curves, or a free-to-sink-and-trim run (`overInterDyMFoam`, several
times the cost).

**Sanity check before trusting any number**: at rest with no flow the vertical force
must come out to the 276 N the boat weighs. If it doesn't, the pressure or patch setup
is wrong, not the boat.

**No prism layers**, so y+ is far too large to trust skin friction to better than
roughly ±10–20%. Friction is over half of a planing hull's drag, so add layers before
quoting a resistance number.

**Calm water only.** Slamming loads and vertical accelerations in a seaway — the thing
that actually breaks sensor payloads — need a wave case and are out of reach on a
laptop.
