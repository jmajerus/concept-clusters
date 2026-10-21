import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { DraftConflictError } from "../modules/draftRepository.js";
import { PostgresDraftRepository } from "../modules/postgresDraftRepository.js";
import { PostgresModelSuggestionRepository } from "../modules/postgresModelSuggestionRepository.js";
import { postgresConnectionDropped, withTransaction } from "../modules/postgresPool.js";
import { createHostedAuthoringContentService } from "../modules/hostedAuthoringContentService.js";
import { applyPostgresMigrations } from "../tools/postgres-migrate.mjs";

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

export async function run() {
  assert.equal(postgresConnectionDropped(Object.assign(new Error("Connection terminated"), { code: "57P01" })), true);
  assert.equal(postgresConnectionDropped(new Error("duplicate key value")), false);

  const db = new PGlite();
  const pool = poolFrom(db);
  const applied = await applyPostgresMigrations(pool);
  assert.deepEqual(applied, [
    "0001_authoring.sql",
    "0002_model_suggestion_catalog.sql",
    "0003_published_corpus.sql"
  ]);

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
}
