# Dashboard changelog

See [`../docs/VERSIONING.md`](../docs/VERSIONING.md) for how this file and `package.json`'s `version`
are kept — this folder versions independently of `cad/`, `optimization/`, and `docs/`.

## 0.4.5 — 2026-10-07

The sponsor form now emails the team through Resend on every submission (`RESEND_API_KEY`, `NOTIFY_EMAIL`).
Saving to the `sponsor_inquiries` table is now optional: the form succeeds if either the email or the save
worked, so it works in production without a database.

## 0.4.4 — 2026-10-07

Removed the "Explore it in 3D" link under the hero render, and the click-through on the image itself. The
interactive viewer is still at `/viz/hull.html` and in the workshop header.

## 0.4.3 — 2026-10-07

Added Peyton Olson (structural and mechanical lead) to the team profiles.

## 0.4.2 — 2026-10-07

Added a build timeline to the home page (rough hull dimensions in Oct 2026 through tuning and testing in
Mar 2027), with a Timeline link in the header. Dates live in `src/lib/timeline.ts`.

## 0.4.1 — 2026-10-07

Added a rendering of the hull CAD on the home page, directly under the Haav title, linking to the interactive
3D viewer. See [`README.md`](README.md) for how it was made.

## 0.4.0 — 2026-10-07

Public site cut back to one plain page: what Haav is, the boat, the team (new profiles in `src/lib/team.ts`)
and the sponsor form. Messaging now leads with the team's mix of skills and modeling up front. The public pages
don't name a competition yet, since eligibility isn't confirmed. Removed the dark hero, card grids, race-stat tiles and live build status from
the public page; `/sponsors` redirects to the form. The workshop (`/bom`, `/optimization`) is unchanged.

## 0.3.0 — 2026-10-03

Split the site into a public half and a team workshop. `/` is now a public project page (race rules, the
boat, live build status, sponsor call to action) and the BOM moved to `/bom`, alongside `/optimization`, under
a separate "workshop" layout marked `noindex`. Added a logo, favicon and share image, and fixed the body
font (Geist was loaded but overridden by Arial). The project is now called Haav (Highly Amphibious / Autonomous
Vehicle) across the site. `/sponsors` now shares the public header and footer.

## 0.2.0 — 2026-10-02

New public page, `/sponsors`, for finding sponsors: a hero, links into the live 3D hull viewer, optimizer
results and BOM, three ways to back the build, and a contact form that stores inquiries in a new
`sponsor_inquiries` table. Modeled on hello.aecync.com. See [`README.md`](README.md).

## 0.1.0 — 2026-10-01

First version tracked here. One page: the BOM, a Postgres table on Neon with weight/cost totals and an
editable table per active phase. A second page, `/optimization`, reads completed optimizer runs and
compares candidates. See [`README.md`](README.md).
