-- Project Hav BOM. Idempotent: safe to run on every setup.

create table if not exists phases (
  slug    text primary key,
  title   text not null,
  goal    text,
  sort    integer not null default 0,
  active  boolean not null default true      -- the page shows active phases only
);

create table if not exists parts (
  id             serial primary key,
  phase          text not null references phases (slug) on update cascade,
  category       text not null,
  name           text not null,
  qty            numeric(10, 2) not null default 1 check (qty >= 0),
  unit_price     numeric(10, 2),              -- USD; null = not priced yet
  unit_weight_g  numeric(10, 1),              -- grams that end up ON the boat, per unit
  weight_basis   text not null default 'estimate'
                 check (weight_basis in ('estimate', 'spec', 'cad', 'measured')),
  status         text not null default 'decided'
                 check (status in ('open', 'decided', 'ordered', 'have', 'optional')),
  vendor         text,
  link           text,
  notes          text,
  sort           integer not null default 0,
  updated_at     timestamptz not null default now()
);

create index if not exists parts_phase_sort on parts (phase, sort, id);

-- Options: alternatives for the same product, one per line. Parts that share an
-- option_group are options for that product; the one with in_bom = true is the
-- line the BOM counts, the rest only show on the Options tab. Plain BOM lines
-- have option_group = null (in_bom is then irrelevant).
alter table parts add column if not exists option_group text;
alter table parts add column if not exists in_bom boolean not null default true;
create unique index if not exists parts_one_choice_per_option
  on parts (option_group) where option_group is not null and in_bom;
