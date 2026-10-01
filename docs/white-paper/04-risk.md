# Risk (8 points)

> **Meets:** clear description of the risks mitigated during the design, build, and coding, and a
> description of the risks that will be controlled during the race. Half of these points will review
> real-world testing documentation.
> ([`PEP-Rules/PEP27_Rules_Autonomy.pdf`](../PEP-Rules/PEP27_Rules_Autonomy.pdf), page 3)

This is the one section with real prior work to draw on, even though it's from the old hull:

- [`../../archive/thinking/AUDIT.md`](../../archive/thinking/AUDIT.md) — a first-principles review that
  found and fixed major risks: center-of-gravity/capsize, vibration isolation for the flight controller,
  thermal management of a sealed electronics box, EMI between GPS and the LTE modem, weight budget.
  The *reasoning* mostly transfers to the new hull even though the hull itself changed — re-check each
  one against the RIB's actual geometry and components before citing it as current.
- [`../../archive/thinking/hardware/06-mechanical-design-and-environment.md`](../../archive/thinking/hardware/06-mechanical-design-and-environment.md) —
  the detailed writeup behind that audit.

**Half the points need real-world testing documentation, not design reasoning** — that doesn't exist
yet for this hull. Don't substitute the audit above for it; note it as design-stage risk mitigation and
flag physical testing as still to come.

Nothing written yet below this line.
