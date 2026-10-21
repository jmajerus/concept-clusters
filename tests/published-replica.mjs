import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { createSplitContentDocuments } from "../modules/authoringContentDocuments.js";
import { renderContentPublicationNotice, renderCatalogueListPage } from "../modules/catalogueReviewPage.js";
import { PostgresPublishedRepository } from "../modules/postgresPublishedRepository.js";
import { PostgresReviewEventStore } from "../modules/postgresReviewEvents.js";
import { createPostgresSiteSettingsStore } from "../modules/siteSettings.js";
import {
  drainPublishedReplica,
  enqueueSiteSettingsReplica,
  loadPublishedReplicaStatus,
  refuseDirectPublishedD1Write,
  replicaWriteOrder
} from "../modules/publishedReplica.js";
import { applyPostgresMigrations } from "../tools/postgres-migrate.mjs";

export const name = "D1 published replica: Postgres commits, the drain copies";

const actor = { subject: "author-1" };

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

function fakeD1() {
  const documents = new Map();
  const settings = new Map();
  const statements = [];
  let failNext = false;

  function identify(sql, params) {
    if (sql.includes("INSERT INTO published_documents")) return params[1];
    if (sql.includes("UPDATE published_documents")) return params.at(-1);
    if (sql.includes("site_settings")) return "site_settings";
    return null;
  }

  function apply(sql, params) {
    const compact = sql.replace(/\s+/g, " ").trim();
    statements.push({ sql: compact, params, id: identify(compact, params) });
    if (compact.includes("INSERT INTO published_documents")) {
      const [
        kind, id, title, document, content_hash, revision, published_by,
        published_at, first_published_at, updated_at, withdrawn_at,
        layout_json, content_revised_at
      ] = params;
      documents.set(`${kind}:${id}`, {
        kind, id, title, document, content_hash, revision, published_by,
        published_at, first_published_at, updated_at, withdrawn_at,
        layout_json, content_revised_at
      });
    } else if (compact.includes("UPDATE published_documents")) {
      const [
        title, document, content_hash, revision, published_by, published_at,
        first_published_at, updated_at, withdrawn_at, layout_json,
        content_revised_at, kind, id
      ] = params;
      documents.set(`${kind}:${id}`, {
        kind, id, title, document, content_hash, revision, published_by,
        published_at, first_published_at, updated_at, withdrawn_at,
        layout_json, content_revised_at
      });
    } else if (compact.includes("INSERT INTO site_settings")) {
      settings.set(params[0], params[1]);
    } else if (compact.startsWith("DELETE FROM site_settings")) {
      if (!params.length) settings.clear();
      else for (const key of params) settings.delete(key);
    }
  }

  function bound(sql, params) {
    return {
      async run() {
        apply(sql, params);
        return { meta: { changes: 1 } };
      },
      async all() {
        if (sql.includes("FROM published_documents")) {
          const kind = params[0];
          const results = params.slice(1)
            .map(id => documents.get(`${kind}:${id}`))
            .filter(Boolean);
          return { results };
        }
        if (sql.includes("FROM site_settings")) {
          return {
            results: [...settings].map(([key, value_json]) => ({ key, value_json }))
          };
        }
        return { results: [] };
      }
    };
  }

  return {
    statements,
    documents,
    failNextBatch() {
      failNext = true;
    },
    prepare(sql) {
      return {
        bind(...params) {
          return bound(sql, params);
        },
        all() {
          return bound(sql, []).all();
        },
        run() {
          return bound(sql, []).run();
        }
      };
    },
    async batch(stmts) {
      if (failNext) {
        failNext = false;
        throw new Error("d1 down");
      }
      for (const stmt of stmts) await stmt.run();
    }
  };
}

async function queueIds(pool) {
  const { rows } = await pool.query(
    "SELECT kind, id FROM published_replica_queue ORDER BY kind, id"
  );
  return rows.map(row => `${row.kind}:${row.id}`);
}

export async function run() {
  assert.throws(
    () => refuseDirectPublishedD1Write({ AUTHORING_DATABASE_URL: "postgres://local/authoring" }),
    /replica of the LAN Postgres corpus/
  );
  assert.doesNotThrow(() => refuseDirectPublishedD1Write({}));
  assert.deepEqual(
    replicaWriteOrder([
      { kind: "puzzle", id: "cell", withdrawn_at: "2026-01-01" },
      { kind: "catalogue", id: "life" },
      { kind: "puzzle", id: "live" },
      { kind: "category", id: "biology" }
    ]).map(row => row.id),
    ["biology", "live", "life", "cell"]
  );

  const db = new PGlite();
  const pool = poolFrom(db);
  await applyPostgresMigrations(pool);
  const published = new PostgresPublishedRepository(pool);
  const category = { id: "biology", title: "Biology" };
  const catalogue = { id: "life", title: "Life", entries: [{ id: "cell" }] };
  const puzzle = { id: "cell", title: "Cell", category: "biology" };

  const categoryRow = await published.publish({ kind: "category", id: "biology", document: category, actor });
  assert.equal(categoryRow.replicaPending, true);
  assert.equal(categoryRow.revision, 1);
  const again = await published.publish({ kind: "category", id: "biology", document: category, actor });
  assert.equal(again.revision, 1);

  await published.publish({ kind: "catalogue", id: "life", document: catalogue, actor });
  const publishedPuzzle = await published.publish({
    kind: "puzzle",
    id: "cell",
    document: puzzle,
    actor
  });
  assert.equal(publishedPuzzle.replicaPending, true);
  assert.deepEqual(await queueIds(pool), [
    "catalogue:life",
    "category:biology",
    "puzzle:cell"
  ]);

  const d1 = fakeD1();
  const first = await drainPublishedReplica({ pool, d1 });
  assert.equal(first.shipped > 0, true);
  assert.deepEqual(d1.statements.map(statement => statement.id), ["biology", "cell", "life"]);
  assert.equal(d1.documents.get("puzzle:cell").withdrawn_at, null);
  assert.deepEqual(await queueIds(pool), []);
  const quiet = d1.statements.length;
  await drainPublishedReplica({ pool, d1 });
  assert.equal(d1.statements.length, quiet);
  const synced = await published.getPublished({ kind: "puzzle", id: "cell" });
  assert.equal(synced.replicaPending, undefined);
  assert.deepEqual(await loadPublishedReplicaStatus(pool), { pending: [], held: [] });

  await published.publish({
    kind: "catalogue",
    id: "life",
    document: { ...catalogue, entries: [] },
    actor
  });
  await published.unpublish({ kind: "puzzle", id: "cell", actor });
  const beforeWithdrawal = d1.statements.length;
  await drainPublishedReplica({ pool, d1 });
  const withdrawalIds = d1.statements.slice(beforeWithdrawal).map(statement => statement.id);
  assert.ok(withdrawalIds.indexOf("life") !== -1);
  assert.ok(withdrawalIds.indexOf("life") < withdrawalIds.indexOf("cell"));
  assert.equal(d1.documents.get("puzzle:cell").withdrawn_at == null, false);
  assert.deepEqual(await queueIds(pool), []);

  await published.publish({
    kind: "puzzle",
    id: "cell",
    document: { ...puzzle, title: "Cell revised" },
    actor
  });
  d1.failNextBatch();
  await assert.rejects(() => drainPublishedReplica({ pool, d1 }), /d1 down/);
  assert.equal((await queueIds(pool)).includes("puzzle:cell"), true);
  assert.equal(d1.documents.get("puzzle:cell").title, "Cell");
  await drainPublishedReplica({ pool, d1 });
  assert.equal(d1.documents.get("puzzle:cell").title, "Cell revised");
  assert.equal((await queueIds(pool)).includes("puzzle:cell"), false);

  const orphan = await published.publish({
    kind: "puzzle",
    id: "orphan",
    document: { id: "orphan", title: "Orphan", category: "missing" },
    actor
  });
  assert.equal(orphan.replicaPending, true);
  const waiting = await loadPublishedReplicaStatus(pool);
  assert.equal(waiting.pending.some(row => row.kind === "puzzle" && row.id === "orphan"), true);
  assert.deepEqual(
    waiting.held.find(row => row.id === "orphan"),
    { id: "orphan", title: "Orphan", missing: ["missing"] }
  );
  const held = await drainPublishedReplica({ pool, d1 });
  assert.equal(held.held > 0, true);
  assert.equal(d1.documents.has("puzzle:orphan"), false);
  await published.publish({
    kind: "category",
    id: "missing",
    document: { id: "missing", title: "Missing" },
    actor
  });
  await drainPublishedReplica({ pool, d1 });
  assert.equal(d1.documents.has("category:missing"), true);
  assert.equal(d1.documents.has("puzzle:orphan"), true);

  await published.seedPublishedIfAbsent({
    kind: "category",
    id: "seeded-cat",
    document: { id: "seeded-cat", title: "Seeded" }
  });
  assert.equal((await queueIds(pool)).includes("category:seeded-cat"), false);
  assert.equal((await published.getPublished({ kind: "category", id: "seeded-cat" })).title, "Seeded");

  const beforeCue = (await queueIds(pool)).length;
  await published.setFreezeCue({ kind: "category", id: "biology", actor, cued: true });
  const cued = await published.getPublished({ kind: "category", id: "biology" });
  assert.ok(cued.cuedForFreezeAt);
  assert.equal((await queueIds(pool)).length, beforeCue);

  const reviewEvents = new PostgresReviewEventStore(pool);
  const documents = createSplitContentDocuments({
    drafts: {},
    published,
    reviewEvents
  });
  let failStamp = false;
  const flaky = {
    async connect() {
      const inner = await pool.connect();
      return {
        async query(text, values) {
          if (failStamp && /SET last_agent_reviewed_at/.test(text)) {
            throw new Error("stamp failed");
          }
          return inner.query(text, values);
        },
        release() {
          inner.release();
        }
      };
    },
    query: (text, values) => pool.query(text, values)
  };
  const flakyPublished = new PostgresPublishedRepository(flaky);
  const flakyDocuments = createSplitContentDocuments({
    drafts: {},
    published: flakyPublished,
    reviewEvents: new PostgresReviewEventStore(flaky)
  });
  const eventCount = async () => Number((await pool.query(
    "SELECT COUNT(*)::int AS count FROM puzzle_review_events WHERE puzzle_id = 'cell'"
  )).rows[0].count);
  failStamp = true;
  await assert.rejects(
    () => flakyDocuments.recordPuzzleAgentReview({
      id: "cell",
      comments: "done",
      outcome: "changed",
      draftRevision: 1
    }),
    /stamp failed/
  );
  assert.equal(await eventCount(), 0);
  assert.equal((await published.getPublished({ kind: "puzzle", id: "cell" })).lastAgentReviewedAt, null);
  failStamp = false;
  const stamped = await documents.recordPuzzleAgentReview({
    id: "cell",
    comments: "done",
    outcome: "changed",
    draftRevision: 1
  });
  assert.equal(stamped.lastAgentReviewedAt != null, true);
  assert.equal(await eventCount(), 1);

  const settings = createPostgresSiteSettingsStore(pool, {
    replicate: enqueueSiteSettingsReplica
  });
  await settings.update({ lensRevealCue: "ripple" }, { actor });
  assert.equal((await queueIds(pool)).includes("site_settings:public"), true);
  const beforeSettings = d1.statements.length;
  await drainPublishedReplica({ pool, d1 });
  assert.ok(d1.statements.slice(beforeSettings).some(statement => statement.id === "site_settings"));
  assert.equal((await queueIds(pool)).includes("site_settings:public"), false);
  const afterSettings = d1.statements.length;
  await drainPublishedReplica({ pool, d1 });
  assert.equal(d1.statements.length, afterSettings);

  const notice = renderContentPublicationNotice({
    kind: "catalogue",
    id: "life",
    revision: 2,
    action: "published",
    replicaPending: true
  });
  assert.match(notice, /On the LAN\. Not yet on the public site\./);
  assert.match(notice, /as revision 2/);
  const list = renderCatalogueListPage([{
    id: "life",
    title: "Life",
    published: true,
    kind: "leaf",
    entryCount: 0,
    replicaPending: true
  }]);
  assert.match(list, /not on the public site/);
}
