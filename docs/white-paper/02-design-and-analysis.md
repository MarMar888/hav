# Design & Analysis (6 points)

> **Meets:** design of the craft ensures the hull matches the propulsion system with autonomous
> controls, including code, calculations and simulations.
> ([`PEP-Rules/PEP27_Rules_Autonomy.pdf`](../PEP-Rules/PEP27_Rules_Autonomy.pdf), page 3)

What to write here: how the hull ([`../../cad/`](../../cad/)), the propulsion (two Flipsky 65150 pods,
differential thrust), and the optimizer ([`../../optimization/`](../../optimization/)) fit together as
one designed system, with the actual calculations — not just a parts list.

- [`../../cad/README.md`](../../cad/README.md) — the hull model, its current dimensions and weight budget.
- [`../../optimization/README.md`](../../optimization/README.md) — the full objective, constraints, and
  decision variables, plus its own honest limits (synthetic component catalog, no CFD-validated
  resistance yet — read "Improve one relationship at a time" before citing a result as validated).
- Autonomous controls: not documented anywhere in this repo yet. The optimizer picks hull/drive/battery/
  speed, but there's no autopilot/control-stack writeup the way `archive/thinking/software/` had for the
  old design. Worth writing fresh rather than pulling from the archive, since the controls hardware
  hasn't been chosen for this hull.

Nothing written yet below this line.
