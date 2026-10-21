// Copy authoring tables from D1 into Postgres. Published player rows stay
// in D1. Rows already in Postgres are left alone, so a later run can fill a
// missing table without replacing working copies written after the cutover.

import { createHttpD1Database } from "../modules/httpD1Database.js";
import { resolveLocalD1Config } from "../modules/localD1Config.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";
import { applyPostgresMigrations } from "./postgres-migrate.mjs";

const TABLES = [
  {
    name: "puzzle_drafts",
    key: ["id"]
  },
  {
    name: "puzzle_draft_history",
    key: ["draft_id", "seq"]
  },
  {
    name: "draft_assistance_stamps",
    key: ["id"]
  },
  {
    name: "content_drafts",
    key: ["kind", "id", "owner_subject"]
  },
  {
    name: "puzzle_board_limit_waiver_requests",
    key: ["id"]
  },
  {
    name: "puzzle_board_limit_waiver_events",
    key: ["id"]
  },
  {
    name: "puzzle_review_events",
    key: ["id"]
  },
  {
    name: "authoring_model_suggestions",
    key: ["label"]
  },
  {
    name: "authoring_model_suggestion_catalog",
    key: ["id"]
  },
  {
    name: "wiki_link_checks",
    key: ["title"]
  },
  {
    name: "site_settings",
    key: ["key"]
  },
  {
    name: "freeze_requests",
    key: ["id"]
  }
];

function quoteIdent(name) {
  return `"${name.replaceAll('"', '""')}"`;
}

async function d1All(database, sql) {
  const { results = [] } = await database.prepare(sql).all();
  return results;
}

async function copyTable(database, pool, table) {
  const rows = await d1All(database, `SELECT * FROM ${table.name}`);
  if (!rows.length) return 0;
  const columns = Object.keys(rows[0]);
  const columnList = columns.map(quoteIdent).join(", ");
  const conflict = table.key.map(quoteIdent).join(", ");
  const client = await pool.connect();
  let inserted = 0;
  try {
    await client.query("BEGIN");
    for (const row of rows) {
      const values = columns.map(column => row[column]);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
      const result = await client.query(
        `INSERT INTO ${quoteIdent(table.name)} (${columnList}) VALUES (${placeholders})
         ON CONFLICT (${conflict}) DO NOTHING`,
        values
      );
      inserted += result.rowCount || 0;
    }
    await client.query("COMMIT");
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch { /* socket already gone */ }
    throw error;
  } finally {
    client.release();
  }
  return inserted;
}

async function syncIdentity(pool, table) {
  const sequence = await pool.query(
    "SELECT pg_get_serial_sequence($1, 'id') AS sequence",
    [table]
  );
  const name = sequence.rows[0]?.sequence;
  if (!name) return;
  await pool.query(
    `SELECT setval($1, GREATEST(COALESCE((SELECT MAX(id) FROM ${quoteIdent(table)}), 1), 1))`,
    [name]
  );
}

async function main() {
  loadProjectEnv();
  const url = authoringDatabaseUrl();
  if (!url) {
    console.error("AUTHORING_DATABASE_URL is required");
    process.exitCode = 1;
    return;
  }
  const pool = getAuthoringPool(url);
  try {
    await applyPostgresMigrations(pool);
    const d1 = createHttpD1Database(await resolveLocalD1Config());
    for (const table of TABLES) {
      const count = await copyTable(d1, pool, table);
      console.log(`${table.name}: ${count} inserted`);
    }
    await syncIdentity(pool, "puzzle_review_events");
    await syncIdentity(pool, "puzzle_board_limit_waiver_requests");
    await syncIdentity(pool, "puzzle_board_limit_waiver_events");
    console.log("Authoring rows are in Postgres. Published player rows stayed in D1.");
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
