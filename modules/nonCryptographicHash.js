// Synchronous deterministic fingerprints for trusted application data.
//
// These values are change-detection and idempotence markers, not secrets or
// authentication tokens. FNV-1a is deliberately used instead of Web Crypto:
// it is synchronous, available in Node/browser/Worker runtimes, and avoids
// making authoring saves wait on a cryptographic digest.

const FNV64_OFFSET_HIGH = 0xcbf29ce4;
const FNV64_OFFSET_LOW = 0x84222325;
const FNV64_PRIME_LOW = 0x1b3;
const UINT32 = 0x100000000;
const TEXT_ENCODER = new TextEncoder();

function textBytes(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (typeof text !== "string") {
    throw new Error("Hash input must be JSON-serializable");
  }
  return TEXT_ENCODER.encode(text);
}

/**
 * Return a stable, non-cryptographic FNV-1a 64-bit fingerprint.
 *
 * The 64-bit state is carried as two uint32 values rather than BigInt so the
 * hot path stays inexpensive in browser and Worker JavaScript runtimes.
 */
export function nonCryptographicHash(value) {
  const bytes = textBytes(value);
  let high = FNV64_OFFSET_HIGH;
  let low = FNV64_OFFSET_LOW;

  for (let index = 0; index < bytes.length; index++) {
    const byte = bytes[index];
    const mixedLow = (low ^ byte) >>> 0;
    const product = mixedLow * FNV64_PRIME_LOW;
    const nextLow = product >>> 0;
    const carry = Math.floor(product / UINT32);
    high = (
      Math.imul(high, FNV64_PRIME_LOW) +
      carry +
      ((mixedLow << 8) >>> 0)
    ) >>> 0;
    low = nextLow;
  }

  return `fnv1a64:${high.toString(16).padStart(8, "0")}${low
    .toString(16)
    .padStart(8, "0")}`;
}
