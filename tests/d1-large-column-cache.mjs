import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LISTS,
  cachedListFor,
  clearD1LargeColumnCache,
  createLargeColumnCachedD1Database
} from "../modules/d1LargeColumnCache.js";
import { D1ContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { D1DraftRepository } from "../modules/d1DraftRepository.js";
import { createSqliteD1 } from "./lib/sqlite-d1.mjs";

export const name = "D1 large-column cache: same rows as SELECT *, reuse, refetch, and every large-column writer sets updated_at";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED = "SELECT * FROM published_documents WHERE kind = ? ORDER BY id";
const DRAFTS = "SELECT * FROM puzzle_drafts WHERE owner_subject = ? ORDER BY updated_at DESC LIMIT ?";
const DRAFTS_BY_STATUS = "SELECT * FROM puzzle_drafts WHERE owner_subject = ? AND status = ? ORDER BY updated_at DESC LIMIT ?";

export async function run() {
  await repositoryQueriesAreRegistered();
  await publishedListMatchesAndReuses();
  await draftListsMatch();
  await rowDeletedBetweenListAndFetch();
  largeColumnWritersSetUpdatedAt();
}

// A recording database: every prepared statement, the rows each batch
// fetched whole, and an optional
// hook that runs just before a batch.
function recording(database, { beforeBatch = () => {} } = {}) {
  const log = { prepared: [], batches: [] };
  return {
    log,
    prepare(sql) {
      log.prepared.push(sql);
      return database.prepare(sql);
    },
    async batch(statements) {
      beforeBatch();
      const results = await database.batch(statements);
      log.batches.push(results.reduce((rows, result) => rows + result.results.length, 0));
      return results;
    }
  };
}

function insertPublished(sqlite, id, { document = `{"id":"${id}"}`, layout = null, updatedAt = "2026-01-01" } = {}) {
  sqlite.prepare(`
    INSERT INTO published_documents
      (kind, id, title, document, layout_json, content_hash, revision, published_by, published_at, updated_at)
    VALUES ('puzzle', ?, ?, ?, ?, 'hash', 1, 'test', '2026-01-01', ?)
  `).run(id, id, document, layout, updatedAt);
}

function insertDraft(sqlite, id, { status = "draft", updatedAt = "2026-01-01", owner = "owner-1" } = {}) {
  sqlite.prepare(`
    INSERT INTO puzzle_drafts
      (id, puzzle_id, owner_subject, title, status, document, content_hash, created_at, updated_at,
       revision, content_json, pedagogy_json, layout_json)
    VALUES (?, ?, ?, ?, ?, ?, 'hash', '2026-01-01', ?, 1, ?, ?, NULL)
  `).run(id, id, owner, id, status, `{"id":"${id}"}`, updatedAt, `{"content":"${id}"}`, `{"pedagogy":"${id}"}`);
}

function direct(sqlite, sql, params) {
  return sqlite.prepare(sql).all(...params).map(row => ({ ...row }));
}

async function repositoryQueriesAreRegistered() {
  const sqliteD1 = createSqliteD1();
  const recorder = recording(sqliteD1);
  await new D1ContentDocumentRepository(recorder).listPublished({ kind: "puzzle" });
  await new D1DraftRepository(recorder).list({ actor: { subject: "owner-1" } });
  await new D1DraftRepository(recorder).list({ actor: { subject: "owner-1" }, status: "draft" });
  const lists = recorder.log.prepared.filter(sql => /SELECT \*/.test(sql));
  assert.equal(lists.length, 3);
  for (const sql of lists) {
    assert.ok(cachedListFor(sql), `a repository list query is no longer cached: ${sql.replace(/\s+/g, " ").trim()}`);
  }
  assert.equal(LISTS.length, 3, "the registry and the repository queries are the same three");
}

async function publishedListMatchesAndReuses() {
  clearD1LargeColumnCache();
  const sqliteD1 = createSqliteD1();
  const { sqlite } = sqliteD1;
  insertPublished(sqlite, "a", { layout: '{"mode":"graph"}' });
  insertPublished(sqlite, "b", { document: '{"id":"b","title":"Émoji 🧩 puzzle"}' });
  insertPublished(sqlite, "c");
  const recorder = recording(sqliteD1);
  const cached = createLargeColumnCachedD1Database(recorder, { cacheKey: "published" });
  const list = async () => (await cached.prepare(PUBLISHED).bind("puzzle").all()).results;
  const expected = () => direct(sqlite, PUBLISHED, ["puzzle"]);

  assert.deepEqual(await list(), expected(), "a cold list is exactly SELECT *");
  assert.deepEqual(recorder.log.batches, [3], "and fetches every row whole, once");

  const warm = await list();
  assert.deepEqual(warm, expected(), "a warm list is exactly SELECT *");
  assert.deepEqual(recorder.log.batches, [3], "and fetches nothing whole, including the non-ASCII row");

  warm[0].document = "changed by a caller";
  assert.deepEqual(await list(), expected(), "a caller's change to a row never reaches the cache");

  sqlite.prepare("UPDATE published_documents SET document = ?, updated_at = ? WHERE id = 'b'")
    .run('{"id":"b","title":"Revised"}', "2026-02-01");
  assert.deepEqual(await list(), expected(), "a revised document is seen");
  assert.deepEqual(recorder.log.batches, [3, 1], "by fetching only that row whole");

  sqlite.prepare("UPDATE published_documents SET layout_json = ? WHERE id = 'c'").run('{"mode":"circle"}');
  assert.deepEqual(await list(), expected(),
    "a large-column write that forgot updated_at is still caught by its length");

  sqlite.prepare("UPDATE published_documents SET cued_for_freeze_at = '2026-03-01' WHERE id = 'a'").run();
  assert.deepEqual(await list(), expected(), "a small-column change is seen");
  assert.equal(recorder.log.batches.length, 3, "without fetching any row whole");

  insertPublished(sqlite, "d");
  sqlite.prepare("DELETE FROM published_documents WHERE id = 'a'").run();
  assert.deepEqual(await list(), expected(), "added and deleted rows are seen");

  assert.deepEqual(await cached.prepare(PUBLISHED).bind("puzzle").first(), expected()[0], "first() works too");
  const other = await cached.prepare("SELECT id FROM published_documents WHERE id = ?").bind("b").all();
  assert.deepEqual(other.results.map(row => ({ ...row })), [{ id: "b" }], "other statements pass through");
}

async function draftListsMatch() {
  clearD1LargeColumnCache();
  const sqliteD1 = createSqliteD1();
  const { sqlite } = sqliteD1;
  insertDraft(sqlite, "x", { updatedAt: "2026-01-03" });
  insertDraft(sqlite, "y", { status: "review", updatedAt: "2026-01-02" });
  insertDraft(sqlite, "z", { updatedAt: "2026-01-01" });
  insertDraft(sqlite, "other", { owner: "owner-2" });
  const cached = createLargeColumnCachedD1Database(sqliteD1, { cacheKey: "drafts" });
  for (let pass = 0; pass < 2; pass += 1) {
    assert.deepEqual(
      (await cached.prepare(DRAFTS).bind("owner-1", 2).all()).results,
      direct(sqlite, DRAFTS, ["owner-1", 2]),
      "the limit and the owner scope hold"
    );
    assert.deepEqual(
      (await cached.prepare(DRAFTS_BY_STATUS).bind("owner-1", "draft", 100).all()).results,
      direct(sqlite, DRAFTS_BY_STATUS, ["owner-1", "draft", 100]),
      "the status filter holds"
    );
  }
  sqlite.prepare("UPDATE puzzle_drafts SET content_json = ?, revision = 2 WHERE id = 'x'").run('{"content":"revised"}');
  assert.deepEqual(
    (await cached.prepare(DRAFTS).bind("owner-1", 100).all()).results,
    direct(sqlite, DRAFTS, ["owner-1", 100])
  );
}

async function rowDeletedBetweenListAndFetch() {
  clearD1LargeColumnCache();
  const sqliteD1 = createSqliteD1();
  const { sqlite } = sqliteD1;
  insertPublished(sqlite, "kept");
  insertPublished(sqlite, "gone");
  const recorder = recording(sqliteD1, {
    beforeBatch: () => sqlite.prepare("DELETE FROM published_documents WHERE id = 'gone'").run()
  });
  const cached = createLargeColumnCachedD1Database(recorder, { cacheKey: "race" });
  const rows = (await cached.prepare(PUBLISHED).bind("puzzle").all()).results;
  assert.deepEqual(rows.map(row => row.id), ["kept"], "a row deleted mid-list is left out, not half-filled");
}

// Every UPDATE of a cached table that writes a large column must also set
// updated_at, or a cached copy of that column could survive the write (its
// length is a second check, not a guarantee). Existing migrations ran before
// the cache existed; new ones are checked.
function largeColumnWritersSetUpdatedAt() {
  const largeByTable = new Map();
  for (const list of LISTS) largeByTable.set(list.table, list.large);
  const files = [
    ...walk(join(root, "modules")),
    ...walk(join(root, "tools")).filter(file => !file.includes(`${join("tools", "archive")}`)),
    ...walk(join(root, "d1", "migrations")).filter(file => Number.parseInt(file.split("/").pop(), 10) > 34)
  ].filter(file => /\.(m?js|sql)$/.test(file));
  const offenders = [];
  let checked = 0;
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const update = /UPDATE\s+(published_documents|puzzle_drafts)\s+SET\b([\s\S]*?)(?:`|;|$)/g;
    let match;
    while ((match = update.exec(text))) {
      const [, table, body] = match;
      const writesLarge = largeByTable.get(table)
        .some(column => new RegExp(`\\b${column}\\s*=`).test(body));
      if (!writesLarge) continue;
      checked += 1;
      if (!/\bupdated_at\s*=/.test(body)) {
        offenders.push(`${relative(root, file)}: UPDATE ${table} SET ${body.replace(/\s+/g, " ").trim().slice(0, 80)}`);
      }
    }
  }
  assert.ok(checked >= 10, `the writer scan found only ${checked} large-column writes; is the pattern still right?`);
  assert.deepEqual(offenders, [], "large-column writes without updated_at");
}

function walk(directory) {
  return readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
