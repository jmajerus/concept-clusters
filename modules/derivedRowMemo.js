// Remembers values computed from a row (layout checks, published-vs-working
// comparisons) under a key built from the row's change markers, so a list
// page recomputes only rows that changed since it last rendered them. Keys
// must include every input the computation reads (rowMarkers covers a
// working copy or published row); least recently used
// entries go first once maxEntries is reached. Values are returned as copies.
import { nonCryptographicHash } from "./nonCryptographicHash.js";

export function createDerivedRowMemo({ maxEntries = 2000 } = {}) {
  const entries = new Map();
  return {
    get(key, compute) {
      if (entries.has(key)) {
        const value = entries.get(key);
        entries.delete(key);
        entries.set(key, value);
        return structuredClone(value);
      }
      const value = compute();
      entries.set(key, structuredClone(value));
      if (entries.size > maxEntries) entries.delete(entries.keys().next().value);
      return value;
    },
    get size() {
      return entries.size;
    }
  };
}

/** A fingerprint of a category registry, for memo keys; null if it has none. */
export function registryFingerprint(categoryRegistry) {
  try {
    return nonCryptographicHash(JSON.stringify(categoryRegistry ?? null));
  } catch {
    return null;
  }
}

/** A fingerprint of a parsed layout document; null for none. */
export function layoutFingerprint(layout) {
  return layout == null ? null : nonCryptographicHash(JSON.stringify(layout));
}

// A row's document is covered by its content hash. Its layout is
// fingerprinted directly: a layout save changes only updated_at, which two
// saves in the same millisecond could share.
export function rowMarkers(row) {
  if (!row) return null;
  return [
    row.revision ?? null,
    row.contentHash ?? null,
    row.updatedAt ?? null,
    row.withdrawnAt ?? null,
    layoutFingerprint(row.layout)
  ];
}
