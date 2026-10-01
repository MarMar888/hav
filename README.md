# Project Hav

A 4-foot autonomous RIB. We build the hull ourselves: a 3D-printed deep-V shell used as a plug, glassed
outside as the skin and taped inside at the joints, with custom inflatable tubes along the sides and a
plywood baseboard inside. Two Flipsky 65150 pods, each with its VESC built in, push it on
12S and steer it by differential thrust. Phase 2 adds a sensor tower and an autopilot that drives it
over LTE.

This repo holds three things: the **CAD**, the **BOM** (a Postgres table on Neon, shown and edited on a
one-page Next.js site), and the early **design thinking**.

## Where things are

| You want | Go to |
|---|---|
| The current BOM | The site's home page. The data lives in the Neon Postgres `parts` table |
| The 3D model in a browser | [`public/viz/hull.html`](public/viz/hull.html), or "3D hull" in the site header |
| The geometry for Onshape / Fusion | [`cad/exports/hav-rib.step`](cad/exports/hav-rib.step), in millimetres |
| The CAD source | [`cad/hull.py`](cad/hull.py) |
| Early design thinking | [`thinking/`](thinking/) — historical |

## The current BOM

The BOM is a Postgres database on Neon, and the site's one page is a table over it. Weight is up top;
below it, one table per **active phase**. Right now two phases are active, and together they're the
dynamic system that goes in the water first:

1. **Make the hull**: print, glass, backbone, baseboard, tubes
2. **Preliminary power electronics**: batteries, pods, power wiring, battery case

Every part carries a vendor link, a price, and its **weight on the boat**. That last one isn't the weight
you buy: 10 kg of filament becomes a 7.8 kg shell, and the charger stays ashore at 0 g. Each weight is
tagged `cad` (derived from `cad/hull.py`), `spec`, `estimate`, or `measured`. Switch estimates to measured
as parts arrive and you weigh them. Parts marked `optional` are shown greyed out and left out of the
totals.

### Options

The **Options** tab is for products you haven't settled: option 1, option 2, and so on, each on its own
line with its own price, weight and link. Every option shows how it compares with the one currently in
the BOM ("+$70 · +500 g"). Exactly one option per product is in the BOM and counted; **Use this one**
swaps it. The BOM tab shows the chosen option with a "chosen option" tag, and warns you about any product
that has options but none chosen yet.

To start one, click **+ New product with options** on the Options tab, or edit an existing BOM line and
fill in **Option for**. The line stays in the BOM as option 1, and you add option 2 next to it.

### Editing it

- **On the site:** "Edit" on any row, or "+ Add part" under a phase. Anyone with the link can edit —
  there is no login. If a bad edit or delete gets through, roll it back from Neon's restore history.
- **In the database:** the Neon console's table editor works too. The tables are `parts` and `phases`
  ([`db/schema.sql`](db/schema.sql)). To start a new phase, insert a row into `phases`, or set
  `active = true` on one. The page shows every active phase in `sort` order.

### Setting it up

`DATABASE_URL` lives in `.env.local` ([`.env.example`](.env.example) shows the shape). Right now it points
at a local Postgres. Once Neon is linked, `neon link` rewrites it to the shared Neon database.

**Locally** (this is how it's set up now):

```bash
brew services start postgresql@14      # local Postgres, starts at login
createdb hav_bom
echo "DATABASE_URL=postgres://$USER@localhost:5432/hav_bom" > .env.local
pnpm install
pnpm db:setup     # creates the tables and loads db/seed.sql
pnpm dev          # http://localhost:3000
```

**On Neon** (the shared BOM everyone edits):

```bash
neon link --project-id tiny-sunset-56470675 --branch production -y   # writes DATABASE_URL to .env.local
pnpm db:setup
```

`pnpm db:setup` is safe to re-run, and it's also how the schema gets upgraded. Table changes are written
as `add column if not exists`, and it only seeds an empty `parts` table, so it never overwrites edits.
`pnpm db:setup --reset` drops both tables and reloads the seed.

Older BOMs are superseded, so don't buy from them: `thinking/bom/bom.csv` (the catamaran-era list) and
`.context/to-buy-list.md` (workspace notes from the kayak and Magnum 57 era).

## CAD

The model is one parametric [build123d](https://github.com/gumyr/build123d) script, driven by
[agentcad](https://pypi.org/project/agentcad/). Every dimension in it is in millimetres.

```
cad/
├── hull.py              the model: print, glass skin, tubes, backbone, baseboard, payload, pods, waterline
├── exports/hav-rib.step latest geometry, for any CAD tool
├── reference/Hull.step  the original Onshape collar (see the units note below)
├── agentcad.toml        sends everything agentcad generates to build/
├── requirements.txt     agentcad 0.6.0, build123d 0.10.0, on Python 3.12
├── AGENTS.md, .claude/  agentcad's guide for coding agents working in this folder
└── build/               every version, viewer and mesh agentcad generates (gitignored)
```

### Just looking

- **Browser:** open `public/viz/hull.html`. It's a single self-contained file: orbit, zoom, and toggle
  parts on and off.
- **CAD tool:** import `cad/exports/hav-rib.step`. It's an assembly of separate bodies (the printed shell,
  its outside glass skin, both tubes, the backbone pieces, baseboard, payload, pods), not one fused solid.

### Changing it

One-time setup, from the repo root:

```bash
python3.12 -m venv .venv-cad
.venv-cad/bin/pip install -r cad/requirements.txt
cd cad && ../.venv-cad/bin/agentcad init --name hull   # fresh clone only: creates build/
```

Then edit `hull.py` and run:

```bash
cd cad && source ../.venv-cad/bin/activate
agentcad run hull.py --label my-change --dry-run                          # validate, writes nothing
agentcad run hull.py --label my-change --no-preview --no-diff --no-view   # light: STEP only
```

`agentcad run` on its own launches a 3D viewer server and opens a browser tab every time, and that's the
heavy part. The flags above skip it, along with the PNG renders and the diff. When a version is good and
you want to look at it or publish it, run it once without `--no-view`:

```bash
agentcad run hull.py --label my-change --no-preview --no-diff             # also writes viewer.html
cp build/vN_my-change/output.step exports/hav-rib.step
cp build/vN_my-change/viewer.html ../public/viz/hull.html
agentcad viewer stop                                                      # free the memory after
```

The BOM site never loads any of this. The 3D hull is a separate page behind the "3D hull" link in its
header, so it only uses memory when you open it: about 10 MB of JS for the BOM page, against 71 MB plus
WebGL for the viewer.

### Units and coordinates

- Millimetres throughout. **y** runs along the boat (transom at −390, stem at +840), **z** is up, **x**
  is athwartships. The waterline plane in the model is at z = −115.3, the 62 lb design weight.
- The outside shape is the **glassed** hull. The print is modelled `SKIN_OUT` (1.2 mm) smaller all round,
  so print it from the `hull` body, not the outside shape, and the glass brings it back to size.
- `reference/Hull.step` came out of Onshape at 3.33 × full size **in inches**; multiply by 7.62 to get
  this model's millimetres. `hull.py` doesn't read it any more. The tubes are generated from the hull's
  own sheer line.

### The current design at a glance

From build `v18_layup-baseboard-named`:

| | |
|---|---|
| Hull | 48.4 × 17.9 in, 7.8 in deep at the transom |
| Over the tubes | 53.7 × 23.3 in |
| Draft | 4.4 in at the hull, about 7.7 in to the prop tips |
| All-up weight | 59.5 lb, against a 62 lb budget |
| Printed shell | 7.8 kg of PETG at 3 mm walls |
| Outside glass skin | about 1.2 kg: 1 m² of 2 × 6 oz glass, faired and painted |
| Baseboard | 0.8 kg of 1/4 in marine ply, glassed both sides |
| Aluminium backbone | 2.0 kg of 6061 |
| Balance | LCG at 35% of length from the transom, VCG 11 mm below the waterline |

## Thinking files

[`thinking/`](thinking/) is the design reasoning from the project's first phase. It describes a bought
catamaran hull and a ~$1,250 budget, so **the parts are out of date but most of the reasoning still
holds**. Start with its [README](thinking/README.md).

| File | What it's still good for |
|---|---|
| `why-and-vision.md` | The north star: what the boat is for |
| `AUDIT.md` | First-principles checklist: stability, vibration, thermal, capsize, EMI |
| `hardware/00–06` | Subsystem reasoning. Hull and propulsion (`01`) are superseded; comms, autopilot, sensors, power and `06`'s mechanical and environmental notes still apply |
| `software/` | The onboard control stack and the dashboard/cloud plan |
| `tradeoffs/` | The core tensions, and the decision log as it stood |
| `bom/` | Superseded. Kept for the reasoning, not the parts |

Older working notes from individual sessions — emails, hull and battery sizing, earlier plans — sit in
`.context/`. That folder belongs to this workspace and isn't in git.

## The site

One page: the BOM. Next.js 16 on Postgres through `pg` ([`src/lib/db.ts`](src/lib/db.ts)). The page
reads the database on every request, so the build never needs a database connection.

```bash
pnpm dev      # http://localhost:3000, editable
pnpm build
```

| File | What it does |
|---|---|
| `src/app/page.tsx` | Weight and cost up top, then a table per active phase |
| `src/app/parts-table.tsx` | The BOM table and the shared edit form |
| `src/app/options-table.tsx` | The Options tab: one card per product, one line per option |
| `src/app/actions.ts` | Save, delete, and choose an option, with input validation |
| `src/lib/bom.ts` | Types, totals and formatting, shared with the browser |
| `db/schema.sql`, `db/seed.sql` | The tables and the starting BOM |

This is Next.js 16, which has breaking changes from earlier versions — read [`AGENTS.md`](AGENTS.md)
before changing site code.
