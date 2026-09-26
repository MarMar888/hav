# First hull mesh and flow smoke test

The scripts exercise a starter OpenFOAM workflow around the hull. They are exploratory and not an accurate prediction of boat performance.

## Run

From the Git repository root, start Docker Desktop and run:

```powershell
./hull/cfd/hull-flow-smoke/run-mesh.ps1
```

The mesh script uses an OpenCFD OpenFOAM v2412 Docker image pinned by digest, disables networking, and caps resources. It reads `hull/cfd/hull-input/hull-meters.stl` and writes generated files under `hull/cfd/hull-flow-smoke/mesh-001/`. To replace an existing generated mesh, pass `-Force`.

After a successful mesh run, the companion flow script in this package sets up a fixed level hull with an imposed 1 m/s incoming flow, gravity and a 0.12 m waterline, and runs `interFoam` to 0.25 s. Existing recorded exploratory results are shown in `centerline-water.png`.

## Interpretation and limits

The image displays the water volume fraction on a centerline cut: blue is water, pale is air, and intermediate color is a mixed interface cell. The run completed and the water fraction stayed bounded, demonstrating that a basic air/water solver path can run around this surface.

The mesh contains 1,501 concave cells and `checkMesh` reports a failed geometry check. The hull is fixed and level; there is no free heave/pitch, force integration, resistance result or equipment loading. The run does not validate 45 mph, planing attitude, rollover stability, self-righting or seaworthiness. Improve and verify the mesh and define physical conditions before interpreting performance.
