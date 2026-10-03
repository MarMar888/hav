# Dashboard changelog

See [`../docs/VERSIONING.md`](../docs/VERSIONING.md) for how this file and `package.json`'s `version`
are kept — this folder versions independently of `cad/`, `optimization/`, and `docs/`.

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
