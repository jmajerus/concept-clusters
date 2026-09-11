import assert from "node:assert/strict";
import {
  canonicalizeCategoryDocument,
  planCategoryRenamePropagation
} from "../modules/categoryRenamePropagation.js";

export const name = "category rename propagation: dry-run is canonical and idempotent";

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
}
