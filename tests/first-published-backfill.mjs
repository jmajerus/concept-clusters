import assert from "node:assert/strict";
import {
  applyFirstPublishedBackfill,
  manifestFirstPublished,
  planFirstPublishedBackfill
} from "../tools/backfill-first-published.mjs";
import { createSqliteD1 } from "./lib/sqlite-d1.mjs";

export const name = "first-published backfill: seeded puzzles take their first git add, never a later date";

export async function run() {
  const manifestDates = manifestFirstPublished([
    { id: "seeded", published: "2026-07-23" },
    { id: "right", published: "2026-08-01" },
    { id: "same-day", published: "2026-10-11" },
    { id: "earlier-in-d1", published: "2026-09-01" },
    { id: "raced", published: "2026-07-23" },
    { id: "no-row", published: "2026-07-23" },
    { id: "undated" }
  ]);
  assert.equal(manifestDates.get("seeded"), "2026-07-23T00:00:00.000Z");
  assert.equal(manifestDates.has("undated"), false);

  const database = createSqliteD1();
  const insert = (id, firstPublishedAt) => database.prepare(`
    INSERT INTO published_documents (kind, id, title, document, content_hash, revision, published_by,
      published_at, first_published_at, updated_at)
    VALUES ('puzzle', ?, ?, '{}', 'h', 1, 'git-seed', 'now', ?, 'now')
  `).bind(id, id, firstPublishedAt).run();
  await insert("seeded", "2026-09-23T10:43:54.172Z");
  await insert("right", "2026-08-01T00:00:00.000Z");
  await insert("same-day", "2026-10-11T16:29:16.113Z");
  await insert("earlier-in-d1", "2026-08-15T09:00:00.000Z");
  await insert("raced", "2026-09-23T10:43:54.172Z");
  await insert("undated", "2026-09-23T10:43:54.172Z");
  await insert("missing-date", null);

  const rows = (await database.prepare("SELECT kind, id, first_published_at FROM published_documents").all()).results;
  const plan = planFirstPublishedBackfill({
    publishedRows: rows,
    manifestDates: new Map([...manifestDates, ["missing-date", "2026-07-30T00:00:00.000Z"]])
  });
  assert.deepEqual(plan.changes.map(change => change.id).sort(), ["missing-date", "raced", "seeded"]);
  assert.equal(plan.unchanged, 3, "a date on or before the manifest's day stays, time and all");
  assert.deepEqual(plan.undated, ["undated"]);

  // A row changed after planning is skipped, not overwritten.
  await database.prepare("UPDATE published_documents SET first_published_at = '2026-07-01T00:00:00.000Z' WHERE id = 'raced'").run();
  const result = await applyFirstPublishedBackfill(database, plan.changes);
  assert.deepEqual(result.applied.sort(), ["missing-date", "seeded"]);
  assert.deepEqual(result.skipped, ["raced"]);
  const date = async id => (await database.prepare(
    "SELECT first_published_at AS value FROM published_documents WHERE id = ?"
  ).bind(id).first()).value;
  assert.equal(await date("seeded"), "2026-07-23T00:00:00.000Z");
  assert.equal(await date("earlier-in-d1"), "2026-08-15T09:00:00.000Z");
  assert.equal(await date("raced"), "2026-07-01T00:00:00.000Z");

  // A second plan finds nothing left to move.
  const again = planFirstPublishedBackfill({
    publishedRows: (await database.prepare("SELECT kind, id, first_published_at FROM published_documents").all()).results,
    manifestDates
  });
  assert.equal(again.changes.length, 0);
}
