// Create the BOM tables and seed them. Run with `pnpm db:setup`.
//
// Safe to re-run: the schema is idempotent and the seed only loads into an
// empty parts table, so it never overwrites edits made on the site.
// `pnpm db:setup --reset` drops both tables and reseeds from db/seed.sql.
import { readFile } from "node:fs/promises";
import pg from "pg";

// Migrations want the direct connection, not the pooled one.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL. Run `neon link` (or `neon env pull`) first — see README.");
  process.exit(1);
}

const reset = process.argv.includes("--reset");
const sql = (name) => readFile(new URL(`../db/${name}`, import.meta.url), "utf8");
const client = new pg.Client({ connectionString: url });

await client.connect();
try {
  await client.query("begin");
  if (reset) {
    await client.query("drop table if exists parts; drop table if exists phases;");
    console.log("Dropped parts and phases.");
  }
  await client.query(await sql("schema.sql"));
  const { rows } = await client.query("select count(*)::int as n from parts");
  if (rows[0].n === 0) {
    await client.query(await sql("seed.sql"));
    const seeded = await client.query("select count(*)::int as n from parts");
    console.log(`Seeded ${seeded.rows[0].n} parts.`);
  } else {
    console.log(`parts already has ${rows[0].n} rows; left them alone.`);
  }
  await client.query("commit");
} catch (err) {
  await client.query("rollback");
  throw err;
} finally {
  await client.end();
}
