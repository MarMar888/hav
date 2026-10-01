# PEP27 rules

[`PEP27_Rules_Autonomy.pdf`](PEP27_Rules_Autonomy.pdf) is the official rules document for the PEP27
Workforce Development Competition, Autonomy Division — the race this boat is built for. Downloaded
2026-10-01 from [pepworkforce.com](https://pepworkforce.com/wp-content/uploads/2026/08/PEP27_Rules_Autonomy.pdf).

This is the primary source behind most of the "assumed" numbers scattered through
[`../../optimization/`](../../optimization/) and [`../../archive/thinking/`](../../archive/thinking/):

| Rule | What it says | Where it's used |
|---|---|---|
| Rule 10 | Total voltage ≤ 55.5 V, total capacity < 500 Ah | `optimization/optimization-plan.md`'s voltage/current constraints |
| Rule 17 | 30 lb removable, non-functioning payload | `optimization/optimization-plan.md`'s fixed payload |
| Rule 12 | Uncrewed: ≥ 3 in from the downflooding point to the waterline, fully loaded | Not yet modeled — see `archive/thinking/AUDIT.md`'s stability notes |
| Rule 16 | Uncrewed craft need positive buoyancy (trapped air, floats even full of water) | `archive/thinking/AUDIT.md` §2 |
| Race rules (p.5) | Uncrewed craft race 2 miles, 45-minute on-water limit, 5 minutes to launch | `optimization/optimization-plan.md`'s 2-mile mission, `optimization/README.md`'s 420 s benchmark |
| Rule 4 | No gas engines, sails, or manual propulsion — electric only, solar recharge allowed | Design constraint throughout |
| Rule 2 | No "Frankenstein" vessels — the hull must be cohesive, no seams that could come apart | Relevant to `cad/`'s glass-skin-over-printed-shell approach |

Re-download if a new revision ships — the file is dated by its own `Last-modified` header, not renamed per
revision, so check that before assuming this copy is current.
