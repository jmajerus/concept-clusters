import assert from "node:assert/strict";
import {
  createDerivedRowMemo,
  layoutFingerprint,
  registryFingerprint,
  rowMarkers
} from "../modules/derivedRowMemo.js";

export const name = "derived row memo: recompute only changed rows, copies, eviction, markers";

export async function run() {
  const memo = createDerivedRowMemo({ maxEntries: 2 });
  let computed = 0;
  const compute = value => () => {
    computed += 1;
    return { domains: [value] };
  };
  assert.deepEqual(memo.get("a", compute("first")), { domains: ["first"] });
  assert.deepEqual(memo.get("a", compute("ignored")), { domains: ["first"] }, "a known key is not recomputed");
  assert.equal(computed, 1);

  const shared = memo.get("a", compute("ignored"));
  shared.domains.push("changed by a caller");
  assert.deepEqual(memo.get("a", compute("ignored")), { domains: ["first"] }, "callers get copies");

  memo.get("b", compute("b"));
  memo.get("a", compute("ignored"));
  memo.get("c", compute("c"));
  assert.equal(memo.size, 2);
  memo.get("b", compute("b again"));
  assert.equal(computed, 4, "the least recently used entry (b) was evicted and recomputed");

  const row = { revision: 2, contentHash: "h", updatedAt: "2026-01-01T00:00:00.000Z", layout: { modes: { star: {} } } };
  assert.notDeepEqual(rowMarkers(row), rowMarkers({ ...row, layout: { modes: { circle: {} } } }),
    "a layout change with the same timestamp still changes the markers");
  assert.notDeepEqual(rowMarkers(row), rowMarkers({ ...row, withdrawnAt: "2026-02-01" }));
  assert.deepEqual(rowMarkers(row), rowMarkers({ ...row, layout: { modes: { star: {} } } }));
  assert.equal(rowMarkers(null), null);
  assert.equal(layoutFingerprint(null), null);
  assert.notEqual(registryFingerprint({ Biology: {} }), registryFingerprint({ Biology: { slug: "bio" } }));
  const cyclic = {};
  cyclic.self = cyclic;
  assert.equal(registryFingerprint(cyclic), null, "an unserializable registry turns the memo off");
}
