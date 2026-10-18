import assert from "node:assert/strict";
import {
  WATCHED_TABLES,
  cacheableTables,
  clearD1ReadCache,
  createCachedD1Database
} from "../modules/d1ReadCache.js";
import { runInD1RequestScope } from "../modules/d1RequestScope.js";
import { createSqliteD1 } from "./lib/sqlite-d1.mjs";

export const name = "D1 read cache: version triggers, reuse within and across requests, writes, fallback";

export async function run() {
  cacheableRules();
  triggersBumpVersions();
  await reuseAndInvalidation();
  await ownWritesForgetTheCheck();
  await resultsAreCopies();
  await batchesPassThrough();
  await missingVersionsTableFallsBack();
}

const LIST_PUBLISHED = "SELECT * FROM published_documents WHERE kind = ? ORDER BY id";

function counting(database) {
  const calls = [];
  return {
    calls,
    count: sql => calls.filter(entry => entry === sql).length,
    prepare(sql) {
      const wrap = statement => ({
        sql: statement.sql,
        bind: (...params) => wrap(statement.bind(...params)),
        execute: () => statement.execute(),
        all: () => { calls.push(sql); return statement.all(); },
        first: () => { calls.push(sql); return statement.first(); },
        run: () => { calls.push(sql); return statement.run(); }
      });
      return wrap(database.prepare(sql));
    },
    batch: statements => database.batch(statements)
  };
}

function insertPublished(sqlite, id, title = id) {
  sqlite.prepare(`
    INSERT INTO published_documents
      (kind, id, title, document, content_hash, revision, published_by, published_at, updated_at)
    VALUES ('puzzle', ?, ?, '{}', 'hash', 1, 'test', '2026-01-01', '2026-01-01')
  `).run(id, title);
}

function versionOf(sqlite, table) {
  return sqlite.prepare("SELECT version FROM content_versions WHERE table_name = ?").get(table).version;
}

function cacheableRules() {
  assert.deepEqual(cacheableTables(LIST_PUBLISHED), ["published_documents"]);
  assert.deepEqual(cacheableTables(`
    SELECT title, page_exists FROM wiki_link_checks
    ORDER BY title
  `), ["wiki_link_checks"], "whitespace and newlines do not matter");
  assert.deepEqual(cacheableTables("SELECT 1 FROM puzzle_drafts WHERE id = ?"), ["puzzle_drafts"]);
  assert.equal(cacheableTables("SELECT * FROM puzzle_review_events WHERE puzzle_id = ?"), null,
    "an unwatched table is never cached");
  assert.equal(cacheableTables(
    "SELECT puzzle_drafts.*, (SELECT COUNT(*) FROM puzzle_draft_history WHERE draft_id = id) FROM puzzle_drafts"
  ), null, "a subquery on an unwatched table makes the whole query uncacheable");
  assert.equal(cacheableTables("SELECT * FROM puzzle_drafts d JOIN content_drafts c ON 1"), null, "JOINs");
  assert.equal(cacheableTables("SELECT * FROM puzzle_drafts, content_drafts"), null, "comma lists");
  assert.equal(cacheableTables("SELECT * FROM puzzle_drafts pd WHERE pd.id = ?"), null, "aliases");
  assert.equal(cacheableTables("WITH x AS (SELECT 1) SELECT * FROM x"), null, "CTEs");
  assert.equal(cacheableTables("UPDATE puzzle_drafts SET title = ?"), null, "writes");
}

function triggersBumpVersions() {
  const { sqlite } = createSqliteD1();
  for (const table of WATCHED_TABLES) assert.equal(versionOf(sqlite, table), 0, table);
  insertPublished(sqlite, "a");
  assert.equal(versionOf(sqlite, "published_documents"), 1, "insert");
  sqlite.prepare("UPDATE published_documents SET title = 'b' WHERE id = 'a'").run();
  assert.equal(versionOf(sqlite, "published_documents"), 2, "update");
  sqlite.prepare("DELETE FROM published_documents WHERE id = 'a'").run();
  assert.equal(versionOf(sqlite, "published_documents"), 3, "delete");
  assert.equal(versionOf(sqlite, "puzzle_drafts"), 0, "other tables are untouched");
  sqlite.prepare(`
    INSERT INTO wiki_link_checks (title, page_exists, disambiguation, resolved_title, checked_at)
    VALUES ('X', 1, 0, NULL, '2026-01-01')
  `).run();
  assert.equal(versionOf(sqlite, "wiki_link_checks"), 1, "every watched table has triggers");
}

async function reuseAndInvalidation() {
  clearD1ReadCache();
  const sqliteD1 = createSqliteD1();
  insertPublished(sqliteD1.sqlite, "a");
  const d1 = counting(sqliteD1);
  const cached = createCachedD1Database(d1, { cacheKey: "reuse" });
  const list = () => cached.prepare(LIST_PUBLISHED).bind("puzzle").all();
  const probes = () => d1.calls.filter(sql => sql.includes("content_versions")).length;

  await runInD1RequestScope(async () => {
    assert.equal((await list()).results.length, 1);
    assert.equal((await list()).results.length, 1);
  });
  assert.equal(d1.count(LIST_PUBLISHED), 1, "the second read in a request comes from the cache");
  assert.equal(probes(), 1, "and reuses the request's version check");

  await runInD1RequestScope(list);
  assert.equal(d1.count(LIST_PUBLISHED), 1, "a later request reuses the result while versions match");
  assert.equal(probes(), 2, "after checking versions again");

  insertPublished(sqliteD1.sqlite, "b");
  const fresh = await runInD1RequestScope(list);
  assert.equal(fresh.results.length, 2, "a write from any other writer is seen");
  assert.equal(d1.count(LIST_PUBLISHED), 2);

  await list();
  await list();
  assert.equal(probes(), 5, "outside a request every read checks versions");
  assert.equal(d1.count(LIST_PUBLISHED), 2);

  await runInD1RequestScope(() => cached.prepare(LIST_PUBLISHED).bind("category").all());
  assert.equal(d1.count(LIST_PUBLISHED), 3, "different parameters are a different entry");
}

async function ownWritesForgetTheCheck() {
  clearD1ReadCache();
  const sqliteD1 = createSqliteD1();
  insertPublished(sqliteD1.sqlite, "a");
  const d1 = counting(sqliteD1);
  const cached = createCachedD1Database(d1, { cacheKey: "own-writes" });
  await runInD1RequestScope(async () => {
    await cached.prepare(LIST_PUBLISHED).bind("puzzle").all();
    await cached.prepare("UPDATE published_documents SET title = ? WHERE id = ?").bind("Renamed", "a").run();
    const after = await cached.prepare(LIST_PUBLISHED).bind("puzzle").first();
    assert.equal(after.title, "Renamed", "a read after this request's own write sees the write");
  });
  assert.equal(d1.count(LIST_PUBLISHED), 2);
}

async function resultsAreCopies() {
  clearD1ReadCache();
  const sqliteD1 = createSqliteD1();
  insertPublished(sqliteD1.sqlite, "a", "Original");
  const cached = createCachedD1Database(sqliteD1, { cacheKey: "copies" });
  await runInD1RequestScope(async () => {
    const first = await cached.prepare(LIST_PUBLISHED).bind("puzzle").all();
    first.results[0].title = "Mutated by a caller";
    first.results.push({ id: "extra" });
    const second = await cached.prepare(LIST_PUBLISHED).bind("puzzle").all();
    assert.equal(second.results.length, 1);
    assert.equal(second.results[0].title, "Original", "a caller's changes never reach the cache");
  });
}

async function batchesPassThrough() {
  clearD1ReadCache();
  const sqliteD1 = createSqliteD1();
  const cached = createCachedD1Database(sqliteD1, { cacheKey: "batch" });
  await runInD1RequestScope(async () => {
    assert.equal((await cached.prepare(LIST_PUBLISHED).bind("puzzle").all()).results.length, 0);
    await cached.batch([
      cached.prepare(`
        INSERT INTO published_documents
          (kind, id, title, document, content_hash, revision, published_by, published_at, updated_at)
        VALUES ('puzzle', ?, ?, '{}', 'hash', 1, 'test', '2026-01-01', '2026-01-01')
      `).bind("a", "A")
    ]);
    assert.equal((await cached.prepare(LIST_PUBLISHED).bind("puzzle").all()).results.length, 1,
      "a batch write is seen by the next read");
  });
}

async function missingVersionsTableFallsBack() {
  clearD1ReadCache();
  const sqliteD1 = createSqliteD1({ through: 34 });
  insertPublished(sqliteD1.sqlite, "a");
  const d1 = counting(sqliteD1);
  const cached = createCachedD1Database(d1, { cacheKey: "fallback" });
  await runInD1RequestScope(async () => {
    assert.equal((await cached.prepare(LIST_PUBLISHED).bind("puzzle").all()).results.length, 1);
    assert.equal((await cached.prepare(LIST_PUBLISHED).bind("puzzle").all()).results.length, 1);
  });
  assert.equal(d1.count(LIST_PUBLISHED), 2, "without content_versions every read goes to D1");
  assert.equal(d1.calls.filter(sql => sql.includes("content_versions")).length, 1,
    "and the missing table is not re-checked on every read");
}
