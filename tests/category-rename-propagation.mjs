import assert from "node:assert/strict";
import {
  canonicalizeCategoryDocument,
  planCategoryRenamePropagation
} from "../modules/categoryRenamePropagation.js";
import { applyD1Changes } from "../tools/propagate-category-renames.mjs";

export const name = "category rename propagation: dry-run is canonical and idempotent";

function fakeDatabase({ changes = 1 } = {}) {
  const prepared = [];
  const batches = [];
  return {
    prepared,
    batches,
    prepare(sql) {
      return {
        bind(...params) {
          const statement = {
            sql,
            params,
            async all() {
              if (sql.includes("MAX(seq)")) return { results: [] };
              return { results: [], meta: { changes } };
            }
          };
          prepared.push(statement);
          return statement;
        }
      };
    },
    async batch(statements) {
      batches.push(statements);
      return statements.map(() => ({ meta: { changes } }));
    }
  };
}

export async function run() {
  const registry = {
    "Physical Geography": {
      slug: "geography",
      previousTitles: ["Geography"]
    }
  };
  const stale = {
    id: "river-basins",
    category: "Geography",
    categories: ["Geography", "Physical Geography"],
    subcategories: {
      Geography: "landforms",
      "Physical Geography": "climate"
    }
  };
  const plan = planCategoryRenamePropagation({
    registry,
    rows: [
      { source: "d1", table: "published_documents", kind: "puzzle", id: stale.id, document: stale },
      {
        source: "d1",
        table: "content_drafts",
        kind: "category",
        id: "geography",
        document: {
          id: "geography",
          title: "Physical Geography",
          previousTitles: ["Geography", "Physical Geography", "Geography"]
        }
      }
    ]
  });
  assert.equal(plan.changes.length, 2);
  assert.equal(plan.unresolved.length, 0);
  assert.deepEqual(plan.changes[0].after, {
    id: "river-basins",
    category: "Physical Geography",
    categories: ["Physical Geography"],
    subcategories: { "Physical Geography": "climate" }
  });
  assert.deepEqual(plan.changes[1].after.previousTitles, ["Geography"]);

  const second = planCategoryRenamePropagation({
    registry,
    rows: plan.changes.map(change => ({
      source: change.source,
      table: change.table,
      kind: change.kind,
      id: change.id,
      document: change.after
    }))
  });
  assert.equal(second.changes.length, 0);

  const conflict = planCategoryRenamePropagation({
    registry: {
      One: { previousTitles: ["Old"] },
      Two: { previousTitles: ["Old"] }
    },
    rows: [{ source: "git", table: "git", kind: "puzzle", id: "x", document: { category: "Old" } }]
  });
  assert.equal(conflict.changes.length, 0);
  assert.equal(conflict.unresolved.length, 1);
  assert.match(conflict.unresolved[0].reason, /more than one/);

  assert.deepEqual(
    canonicalizeCategoryDocument({
      id: "x",
      title: "X",
      previousTitles: [" Old ", "X", "Old"]
    }),
    { id: "x", title: "X", previousTitles: ["Old"] }
  );

  const database = fakeDatabase();
  const applied = await applyD1Changes(database, [{
    source: "d1:published_documents",
    table: "published_documents",
    kind: "puzzle",
    id: "river-basins",
    revision: 4,
    row: {
      kind: "puzzle",
      id: "river-basins",
      revision: 4
    },
    after: { id: "river-basins", title: "River basins", category: "Physical Geography" }
  }]);
  assert.equal(applied, 1);
  assert.equal(database.batches.length, 1);
  assert.equal(database.batches[0].length, 2);
  assert.match(database.batches[0][0].sql, /UPDATE published_documents/);
  assert.match(database.batches[0][1].sql, /INSERT INTO published_document_revisions/);

  await assert.rejects(
    () => applyD1Changes(fakeDatabase({ changes: 0 }), [{
      source: "d1:published_documents",
      table: "published_documents",
      kind: "puzzle",
      id: "river-basins",
      revision: 4,
      row: { kind: "puzzle", id: "river-basins", revision: 4 },
      after: { id: "river-basins", title: "River basins" }
    }]),
    /Propagation OCC conflict/
  );
}
