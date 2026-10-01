# White paper

PEP27 scores the white paper out of 20 points: Background (2), Design & Analysis (6), Overview of
Build & Fabrication Processes (4), Risk (8). Due three weeks before race day, max 15 pages (the title
page doesn't count toward that). Full rubric: [`../PEP-Rules/PEP27_Rules_Autonomy.pdf`](../PEP-Rules/PEP27_Rules_Autonomy.pdf),
page 3.

## Due dates — fill in which event you're entering

Copied straight from the rules PDF, page 2. The due dates predate the race dates by over a year for
some events, which looks odd but is what's printed — don't "fix" it without checking with PEP.

| Event | White paper due | Race |
|---|---|---|
| PEP27 West — Bremerton, WA | Mar. 12, 2026 | Apr. 2, 2027 |
| PEP27 Gulf Coast — Panama City, FL (tentative) | Mar. 16, 2026 | Apr. 6, 2027 |
| PEP27 East — Portsmouth, VA | Mar. 23, 2026 | Apr. 13, 2027 |
| PEP27 Alabama — Mobile, AL | Jan. 8, 2026 | Jan. 29, 2027 |
| PEP27 North Carolina — Raleigh, NC (tentative) | TBD | TBD |
| PEP27 Ohio — Springfield, OH | Mar. 27, 2026 | Apr. 17, 2027 |

## Sections

| File | Rubric item | Points | Pull evidence from |
|---|---|---|---|
| [`title-page.md`](title-page.md) | required, doesn't count toward 15 pages | — | fill in by hand |
| [`01-background.md`](01-background.md) | Background | 2 | `archive/thinking/why-and-vision.md`, `optimization/optimization-plan.md` |
| [`02-design-and-analysis.md`](02-design-and-analysis.md) | Design & Analysis | 6 | `cad/README.md`, `optimization/README.md` |
| [`03-build-and-fabrication.md`](03-build-and-fabrication.md) | Overview of Build & Fabrication Processes | 4 | `cad/README.md`, `dashboard/README.md` |
| [`04-risk.md`](04-risk.md) | Risk | 8 | `archive/thinking/AUDIT.md` |

Each file opens with the exact "Meets" bar from the rubric, so you're writing against the actual
scoring criteria, not a guess at it. None of them have real content yet — they're pointers to where
the evidence already lives in this repo, not a draft. Some sections (controls, build/test of the actual
hardware) have no evidence yet at all, because that work hasn't happened; each file says so rather than
pretending otherwise.
