# Versioning

Four subgroups version independently — `cad/`, `optimization/`, `dashboard/`, `docs/` — because they
change on different clocks (a hull revision and a doc fix aren't the same kind of event) and a single
repo-wide version number would say nothing useful about any one of them. `archive/` doesn't version;
it's frozen.

Each subgroup carries:

- **A version number.** `dashboard/` already had one (`package.json`'s `version`, since it's an npm
  package); the other three get a plain `VERSION` file holding just the number.
- **A `CHANGELOG.md`**, newest entry on top, one entry per version: a date and a few sentences on what
  changed and why. Not auto-generated, not bot-assigned — this project is too small for that machinery.

## When to bump

Bump a subgroup's version, and add a `CHANGELOG.md` entry, in the same commit or PR that changes what
that subgroup *does* — a new hull revision, a changed optimizer constraint, a new doc section. A typo
fix or a path correction doesn't need a bump. Patch (`0.1.0` → `0.1.1`) by default; only bump minor or
major when it's genuinely a different capability, and that's a judgment call for whoever's making the
change, not an automated rule.

## Who changed what

Don't duplicate that in the changelog — `git log -- cad/` (or `optimization/`, `dashboard/`, `docs/`)
already gives the real author and date for anything in that subgroup, and a name copied into
`CHANGELOG.md` would just drift out of sync with reality.
