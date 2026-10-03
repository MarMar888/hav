# The dashboard

One Next.js site, in two halves:

| | Routes | Who it's for |
|---|---|---|
| **Public site** (`src/app/(site)/`) | `/` project page with live build status, `/sponsors` | Judges, sponsors, anyone with the link |
| **Workshop** (`src/app/(workshop)/`) | `/bom`, `/optimization` | The team. Editable by anyone with the link, so marked `noindex` |

Each half has its own layout and header, so the working tools never dress up as the public face, and the
other way round.
See the [root README](../README.md) for how this fits into the rest of the project.

The commands below assume you're `cd`'d into this folder, which you need to do once anyway (`pnpm
install`, setting up `.env.local`). Day to day, `../package.json` delegates `dev`/`build`/`start`/`lint`/
`db:setup` down to here, so `pnpm dev` from the repo root works the same as `pnpm dev` from inside
`dashboard/`.

## Sponsors

`/` is the project page: the race rules, the boat, a live build-status section read from the BOM, and a
sponsor call to action. `/sponsors` is the page we point potential sponsors at, modeled on [hello.aecync.com](https://hello.aecync.com/):
instead of a pitch deck it lets people explore the real work: the 3D hull viewer, the optimizer results and the
live BOM, then offers three ways to back the build (funds, parts, skills) and a contact form.

- **Copy** lives in [`src/lib/sponsors.ts`](src/lib/sponsors.ts), apart from the markup. The "what you get" list is
  the team's draft offer, so edit it to match what we can actually deliver.
- **Inquiries** from the form land in the `sponsor_inquiries` table (`pnpm db:setup` creates it; it's
  idempotent). Read them in the Neon console's table editor. The form has a hidden honeypot field against bots
  and no other spam protection. Without `DATABASE_URL` the form tells the visitor it isn't collecting messages.

## The BOM

The BOM is a Postgres database on Neon, and `/bom` is a table over it. Weight is up top;
below it, one table per **active phase**. Right now two phases are active, and together they're the
dynamic system that goes in the water first:

1. **Make the hull**: print, glass, backbone, baseboard, tubes
2. **Preliminary power electronics**: batteries, pods, power wiring, battery case

Every part carries a vendor link, a price, and its **weight on the boat**. That last one isn't the weight
you buy: 10 kg of filament becomes a 7.8 kg shell, and the charger stays ashore at 0 g. Each weight is
tagged `cad` (derived from [`../cad/hull.py`](../cad/hull.py)), `spec`, `estimate`, or `measured`. Switch
estimates to measured as parts arrive and you weigh them. Parts marked `optional` are shown greyed out
and left out of the totals.

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

Older BOMs are superseded, so don't buy from them: [`../archive/thinking/bom/bom.csv`](../archive/thinking/bom/bom.csv)
(the catamaran-era list) and `.context/to-buy-list.md` (workspace notes from the kayak and Magnum 57 era,
not in git).

## The site, file by file

Next.js 16 on Postgres through `pg` ([`src/lib/db.ts`](src/lib/db.ts)). The page reads the database on
every request, so the build never needs a database connection.

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

This is Next.js 16, which has breaking changes from earlier versions — read [`../AGENTS.md`](../AGENTS.md)
before changing site code.

## The optimization results viewer

`/optimization`, linked from the shared navigation, reads completed runs from `../optimization/runs/`
(a sibling of this folder, not inside it) on each request — independent of the BOM database. See
[`../optimization/README.md`](../optimization/README.md#results-viewer) for what it shows and how to run
its Playwright tests.
