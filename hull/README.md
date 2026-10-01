# Hull design and CFD starter work

This folder collects the team's current hull design and early CFD tooling. The parametric Onshape FeatureScript is the design source; the STEP and STL files are exports for geometry checks and meshing.

## Current state

- The V2 FeatureScript defines a 60 in long, 14.5 in wide hull with provisional shape controls. Its parameter bounds are exploration values, not proven safe or optimized.
- `geometry/hull-v1.step` is the exported Onshape geometry. Although the export filename says V1, its internal part name identifies it as the V2 geometry-only hull.
- The exported CAD solid was checked and converted to a 4,992-triangle, metre-unit closed STL. It is suitable as a surface-meshing input, not a fluid mesh.
- A coarse fixed-hull OpenFOAM experiment ran at an imposed 1 m/s flow and 0.12 m waterline for 0.25 s. It confirms the basic solver path runs and captures a water/air interface; it does not measure resistance or predict performance.
- The coarse mesh has 1,501 concave cells and one failed geometry check. Treat the flow image and run as a smoke test only.
- Equipment mass, CG, inertia, solver choice, operating loading and optimization objective are unset. DP means dynamic programming; both DP and reinforcement learning are deferred.

The 45 mph target is about 20.1 m/s and represents a high-speed planing condition for this hull length. Nothing in this starter package validates operation at that speed, self-righting, or seaworthiness.

## Contents

- `cad/`: Onshape FeatureScript V1 and V2 sources.
- `geometry/`: original STEP export.
- `cfd/tools/`: design-space manifest, case campaign generator, geometry preparation and checks.
- `cfd/hull-input/`: checked STL, conversion image, report and surface-check log.
- `cfd/hull-flow-smoke/`: reproducible coarse OpenFOAM mesh/flow scripts and the exploratory result image.
- `docs/`: background and staged testing notes.

## Start here

Read [the CFD and design-space notes](docs/design-and-cfd-plan.md), then [the hull CFD smoke-test notes](cfd/hull-flow-smoke/README.md). The parameter campaign is bookkeeping for future runs; it does not run CFD. The smoke test needs Docker Desktop and OpenCFD OpenFOAM v2412 (pinned container image); it writes generated meshes and solver output locally under the case directory.
