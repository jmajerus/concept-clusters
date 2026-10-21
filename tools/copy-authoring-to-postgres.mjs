// Copy authoring tables, then the current published corpus, from D1 into
// Postgres. Rows already in Postgres are left alone, so a later run cannot
// replace a corpus Postgres has since published. After this copy, Postgres
// is upstream and the replica drain is the only writer of live D1 rows.

import { createHttpD1Database } from "../modules/httpD1Database.js";
import { resolveLocalD1Config } from "../modules/localD1Config.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";
import { applyPostgresMigrations } from "./postgres-migrate.mjs";

const PUBLISHED_COLUMNS = {
  published_documents: [
    "kind", "id", "title", "document", "content_hash", "revision",
    "published_by", "published_at", "first_published_at", "content_revised_at",
    "updated_at", "last_agent_reviewed_at", "last_human_reviewed_at",
    "withdrawn_at", "cued_for_freeze_at", "cued_for_freeze_by", "layout_json"
  ],
  published_document_revisions: [
    "kind", "id", "revision", "document", "content_hash",
    "published_by", "published_at", "content_revised_at"
  ]
};

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
  const columns = table.columns || null;
  const projection = columns ? columns.join(", ") : "*";
  const rows = await d1All(database, `SELECT ${projection} FROM ${table.name}`);
  if (!rows.length) return 0;
  const rowColumns = columns || Object.keys(rows[0]);
  const columnList = rowColumns.map(quoteIdent).join(", ");
  const conflict = table.key.map(quoteIdent).join(", ");
  const client = await pool.connect();
  let inserted = 0;
  try {
    await client.query("BEGIN");
    for (const row of rows) {
      const values = rowColumns.map(column => row[column] ?? null);
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
    for (const [name, columns] of Object.entries(PUBLISHED_COLUMNS)) {
      const count = await copyTable(d1, pool, {
        name,
        key: name === "published_documents" ? ["kind", "id"] : ["kind", "id", "revision"],
        columns
      });
      console.log(`${name}: ${count} inserted`);
    }
    await syncIdentity(pool, "puzzle_review_events");
    await syncIdentity(pool, "puzzle_board_limit_waiver_requests");
    await syncIdentity(pool, "puzzle_board_limit_waiver_events");
    console.log(
      "Authoring and published rows are in Postgres. " +
      "D1 is a replica from here; the authoring server drains it. " +
      "Do not run this copy again over a corpus Postgres has since published."
    );
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
