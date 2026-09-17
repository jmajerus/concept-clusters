import assert from "node:assert/strict";
import { nonCryptographicHash } from "../modules/nonCryptographicHash.js";

export const name = "non-cryptographic hash: stable FNV-1a fingerprints";

export async function run() {
  assert.equal(nonCryptographicHash(""), "fnv1a64:cbf29ce484222325");
  assert.equal(nonCryptographicHash("a"), "fnv1a64:af63dc4c8601ec8c");
  assert.equal(nonCryptographicHash("hello"), "fnv1a64:a430d84680aabd0b");
  assert.equal(
    nonCryptographicHash({ a: 1 }),
    nonCryptographicHash(JSON.stringify({ a: 1 }))
  );
  assert.notEqual(nonCryptographicHash("a"), nonCryptographicHash("b"));
}
