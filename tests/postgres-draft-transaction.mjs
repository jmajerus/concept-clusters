import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { DraftConflictError } from "../modules/draftRepository.js";
import { PostgresDraftRepository } from "../modules/postgresDraftRepository.js";
import { PostgresModelSuggestionRepository } from "../modules/postgresModelSuggestionRepository.js";
import { postgresConnectionDropped, withTransaction } from "../modules/postgresPool.js";
import { createHostedAuthoringContentService } from "../modules/hostedAuthoringContentService.js";
import { applyPostgresMigrations } from "../tools/postgres-migrate.mjs";
import { PostgresCitationSourceRepository } from "../modules/postgresCitationSourceRepository.js";
import { refreshPublishedCitationUsage, PostgresCitationUsagePilot } from "../modules/postgresCitationUsagePilot.js";

export const name = "Postgres draft writes: one transaction, conflict rolls back";

function poolFrom(db) {
  const client = {
    query: (text, values) => db.query(text, values),
    release() {}
  };
  return {
    async connect() {
      return client;
    },
    query: (text, values) => db.query(text, values)
  };
}

async function historyCount(pool, draftId) {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM puzzle_draft_history WHERE draft_id = $1",
    [draftId]
  );
  return Number(rows[0].count);
}

async function citationSchemaAndMatching(pool) {
  const sources = new PostgresCitationSourceRepository(pool);
  const identity = {
    zoteroLibrary: "user:1",
    zoteroItemKey: "SOURCE01",
    zoteroCollectionKey: "COLLECT1",
    citekey: "author2026paper"
  };
  const original = await sources.upsertFromZotero({
    ...identity, metadata: { title: "Original", url: "https://example.org/PaperA?token=AbC" }
  });
  const unchanged = await sources.upsertFromZotero({
    ...identity, metadata: original.metadata
  });
  assert.equal(unchanged.currentRevision, 1);
  const revised = await sources.upsertFromZotero({
    ...identity, metadata: { ...original.metadata, title: "Revised" }
  });
  assert.equal(revised.id, original.id);
  assert.equal(revised.currentRevision, 2);
  assert.equal((await sources.getRevision({ id: original.id, revision: 1 })).metadata.title, "Original");
  assert.equal((await sources.search({ query: "AUTHOR2026PAPER" }))[0].id, original.id);
  const pathVariant = await sources.upsertFromZotero({
    ...identity, zoteroItemKey: "SOURCE02", citekey: "author2026path",
    metadata: { title: "Different path", url: "https://example.org/papera?token=AbC" }
  });
  const queryVariant = await sources.upsertFromZotero({
    ...identity, zoteroItemKey: "SOURCE03", citekey: "author2026query",
    metadata: { title: "Different query", url: "https://example.org/PaperA?token=abc" }
  });
  await sources.upsertFromZotero({
    ...identity, zoteroItemKey: "SOURCE04", citekey: "author2026relative",
    metadata: { title: "Relative URL", url: "PaperA?token=AbC" }
  });
  const document = {
    id: "citation-case", title: "Citation case", category: "biology",
    subcategories: { biology: "genomics" },
    info: { citations: [
      { title: "Host normalization", url: "HTTPS://EXAMPLE.ORG/PaperA?token=AbC#section" },
      { title: "Path case", url: "https://example.org/papera?token=AbC" },
      { title: "Query case", url: "https://example.org/PaperA?token=abc" },
      { title: "No matching URL", url: "https://example.org/papera?token=abc" },
      { title: "Relative mismatch", url: "papera?token=abc" }
    ] }
  };
  await pool.query(`
    INSERT INTO published_documents
      (kind, id, title, document, content_hash, revision, published_by, published_at, updated_at)
    VALUES ('puzzle', $1, $2, $3, 'fixture', 1, 'author-1', '2026-01-01', '2026-01-01')
  `, [document.id, document.title, JSON.stringify(document)]);
  const refreshed = await refreshPublishedCitationUsage(pool, sources);
  assert.equal(refreshed.citations, 5);
  assert.equal(refreshed.inferred, 3);
  const usage = new PostgresCitationUsagePilot(pool);
  const matches = await usage.search({ category: "biology", subcategory: "genomics" });
  assert.deepEqual(matches.map(row => row.sourceId), [original.id, pathVariant.id, queryVariant.id, null, null]);
  assert.deepEqual(matches.map(row => row.matchStatus), ["inferred", "inferred", "inferred", "unmatched", "unmatched"]);
  assert.equal((await usage.status()).observations, 5);
  assert.equal((await pool.query(`
    SELECT indexname FROM pg_indexes WHERE indexname = 'citation_sources_citekey_lookup'
  `)).rows.length, 1);
  await assert.rejects(() => pool.query(`
    UPDATE citation_usage_observations SET match_status = 'confirmed'
    WHERE puzzle_id = $1
  `, [document.id]), /check constraint/i);
  await assert.rejects(() => pool.query(
    "DELETE FROM citation_sources WHERE id = $1", [original.id]
  ), /foreign key constraint/i);
  // A refresh removes withdrawn publications and their derived topic rows.
  await pool.query("UPDATE published_documents SET withdrawn_at = '2026-02-01' WHERE id = $1", [document.id]);
  await refreshPublishedCitationUsage(pool, sources);
  assert.equal((await usage.search({ category: "biology" })).length, 0);
  assert.equal((await pool.query("SELECT * FROM citation_usage_topics")).rows.length, 0);
}

export async function run() {
  assert.equal(postgresConnectionDropped(Object.assign(new Error("Connection terminated"), { code: "57P01" })), true);
  assert.equal(postgresConnectionDropped(new Error("duplicate key value")), false);

  const db = new PGlite();
  const pool = poolFrom(db);
  const applied = await applyPostgresMigrations(pool);
  assert.deepEqual(applied, [
    "0001_authoring.sql",
    "0002_model_suggestion_catalog.sql",
    "0003_published_corpus.sql",
    "0004_citation_sources.sql",
    "0005_citation_usage_pilot.sql",
    "0006_citation_citekey_lookup.sql"
  ]);
  assert.deepEqual(await applyPostgresMigrations(pool), []);
  await citationSchemaAndMatching(pool);

  const repository = new PostgresDraftRepository({ pool });
  const content = createHostedAuthoringContentService();
  const actor = { subject: "author-1" };
  const document = {
    ...content.getPuzzleDocument("energy-flow"),
    id: "pg-conflict",
    title: "One"
  };
  const created = await repository.create({
    draftId: "pg-conflict",
    document,
    actor
  });
  assert.equal(created.revision, 1);

  const saved = await repository.save({
    draftId: "pg-conflict",
    document: { ...document, title: "Two" },
    actor,
    expectedRevision: 1
  });
  assert.equal(saved.revision, 2);
  assert.equal(await historyCount(pool, "pg-conflict"), 1);

  await assert.rejects(
    () => repository.save({
      draftId: "pg-conflict",
      document: { ...document, title: "Three" },
      actor,
      expectedRevision: 1
    }),
    error => error instanceof DraftConflictError
  );
  assert.equal(await historyCount(pool, "pg-conflict"), 1);
  const stored = await pool.query(
    "SELECT revision FROM puzzle_drafts WHERE id = $1",
    ["pg-conflict"]
  );
  assert.equal(Number(stored.rows[0].revision), 2);

  await assert.rejects(
    () => withTransaction(pool, async client => {
      await client.query(`
        INSERT INTO puzzle_draft_history (
          draft_id, seq, content_hash, saved_at
        ) VALUES ('pg-conflict', 99, 'rolled-back', '2026-01-01T00:00:00.000Z')
      `);
      throw new Error("boom");
    }),
    /boom/
  );
  assert.equal(await historyCount(pool, "pg-conflict"), 1);

  let dropped = false;
  const flaky = {
    async connect() {
      const inner = await pool.connect();
      return {
        async query(text, values) {
          const result = await inner.query(text, values);
          if (!dropped && text === "COMMIT") {
            dropped = true;
            const error = new Error("Connection terminated");
            error.code = "57P01";
            throw error;
          }
          return result;
        },
        release() {
          inner.release();
        }
      };
    },
    query: (text, values) => pool.query(text, values)
  };
  const recovered = await new PostgresDraftRepository({ pool: flaky }).save({
    draftId: "pg-conflict",
    document: { ...document, title: "Four" },
    actor,
    expectedRevision: 2
  });
  assert.equal(recovered.revision, 3);
  assert.equal(recovered.contentHash, (await pool.query(
    "SELECT content_hash FROM puzzle_drafts WHERE id = $1",
    ["pg-conflict"]
  )).rows[0].content_hash);
  assert.equal(await historyCount(pool, "pg-conflict"), 2);

  let droppedPop = false;
  const flakyPop = {
    async connect() {
      const inner = await pool.connect();
      return {
        async query(text, values) {
          const result = await inner.query(text, values);
          if (!droppedPop && text === "COMMIT") {
            droppedPop = true;
            const error = new Error("Connection terminated");
            error.code = "57P01";
            throw error;
          }
          return result;
        },
        release() {
          inner.release();
        }
      };
    },
    query: (text, values) => pool.query(text, values)
  };
  const popped = await new PostgresDraftRepository({ pool: flakyPop }).popWorkingCopy({
    draftId: "pg-conflict",
    actor,
    expectedRevision: 3
  });
  assert.equal(popped.revision, 4);
  assert.equal(popped.document.title, "Two");

  const models = new PostgresModelSuggestionRepository(pool);
  await models.add("Muse Spark 9");
  assert.equal(await models.listForFreeze(), null);
  await pool.query(
    "INSERT INTO authoring_model_suggestion_catalog (id, version) VALUES (1, 1)"
  );
  assert.deepEqual(await models.listForFreeze(), ["Muse Spark 9"]);
  await db.close();
}
