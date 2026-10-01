# Design and CFD plan

## Parametric design and loading

`cad/drone-hull-v2.fs` exposes shape controls for systematic changes. `cfd/tools/design-space.json` records provisional ranges and units, the candidate speed list, and placeholders for loading, fluid conditions, solver and objectives. Equipment mass and position intentionally remain unset. A visual spacer is not a mass model: later physical tests should use secured dummy weights, and CFD motion studies need total mass, centre of gravity and inertia.

The generator in `cfd/tools/prepare.py` makes repeatable candidate manifests and performs preliminary section checks. Run it from any directory with Python 3:

```text
python hull/cfd/tools/prepare.py
python -m unittest discover -s hull/cfd/tools -v
```

The campaign manifest contains proposed candidates, not simulation results. Geometry screening does not validate the Onshape CAD kernel or hull performance. Bounds, mass, CG, fluid conditions, force application and objective need engineering decisions before optimization. Dynamic programming and reinforcement learning are deferred until there is a trustworthy evaluator and defined feasibility thresholds.

## Research basis

The two local reference papers informed the exploration plan:

- Oh, Oh and Son (2024), “Reinforcement learning-based optimal hull form design with variations in fore and aft parts,” [DOI 10.1093/jcde/qwae087](https://doi.org/10.1093/jcde/qwae087). It uses PPO/DDPG and Holtrop-Mennen resistance in a tanker design study. Its reward, constraints and reported gains do not transfer directly to this small planing hull.
- Tayeb et al. (2025), “Optimizing Geometric Parameters of Planing Vessels for Enhanced Hydrodynamic Performance,” [DOI 10.1007/s11804-025-00632-5](https://doi.org/10.1007/s11804-025-00632-5). It uses STAR-CCM+, unsteady RANS, air/water VOF and free heave/pitch on a Fridsma reference hull. It does not establish roll stability or self-righting for our geometry.

## Recommended validation stages

1. Regenerate a pinned CAD revision; verify a single closed exterior, units, smoothness and usable interior.
2. Establish hydrostatics with the actual loading. Evaluate displacement, equilibrium trim and a righting-arm curve across roll angles with sealed deck and realistic openings.
3. Build transient air/water CFD with stated speed, water depth, fluid properties and hull attitude. Add free heave/pitch only after fixed-body mesh and time-step checks.
4. Evaluate rollover/recovery separately with suitable full-width domain and rigid-body motion. Exact upside-down symmetry can produce zero torque; test perturbed near-inverted states too.
5. Verify mesh, time-step, domain and averaging sensitivity, then compare selected predictions with physical tests.

A calm-water bare-hull resistance test does not predict powered top speed, and static righting curves do not prove dynamic self-righting. The current smoke test is much earlier in this sequence.
