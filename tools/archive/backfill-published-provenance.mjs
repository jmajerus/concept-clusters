// ARCHIVED -- applied once against hosted D1 on 2026-09-23. Retained as the
// worked example for the published side; see its sibling
// backfill-draft-provenance.mjs for the drafts pass and the general lessons.
//
// What it did: 75 of 239 live published puzzle rows did not name the agent
// that created them -- 74 with no provenance at all, 1 crediting a human and
// no agent. Same invariant as the drafts pass: every puzzle here was
// agent-initiated, so the agent belongs in provenance, first.
//
// Why a migration rather than Publish, which is the sanctioned path:
// Publish replaces the whole document, so it carries whatever else the working
// copy happens to hold. Checking the 19 candidates that had drafts found only
// 12 safe; the rest would have reverted canonicalized {text} objects to legacy
// strings, dropped whole clusters[].terms arrays, or rewritten cluster ids.
// Rewriting just the `provenance` key cannot roll content backward, and the
// guard below refuses any row where anything else would change.

import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  expandProvenanceContributor,
  compactProvenanceContributor,
  renderProvenanceL1,
  normalizeAuthoringProvenance,
  UNIDENTIFIED_GENERATIVE_SYSTEM
} from "../modules/authoringProvenance.js";
import { draftContentHash, serializeDraftDocument } from "../modules/draftRepository.js";

const APPLY = process.argv.includes("--apply");
const EMIT = process.argv.includes("--emit-sql");
const OUT = process.env.SCRATCH || "/tmp";
const DB = "concept-clusters-authoring";
const CONFIG = "wrangler.authoring.jsonc";
const ROOT = new URL("../", import.meta.url).pathname;

function d1(sql) {
  const out = execFileSync("npx", [
    "wrangler", "d1", "execute", DB, "--remote", "--config", CONFIG, "--json", "--command", sql
  ], { cwd: ROOT, maxBuffer: 1024 * 1024 * 256, encoding: "utf8" });
  return JSON.parse(out)[0].results;
}

const rows = d1(`SELECT id, revision, document, cued_for_freeze_by
  FROM published_documents WHERE kind = 'puzzle' AND withdrawn_at IS NULL`);

const plan = [];
const skipped = [];

for (const row of rows) {
  let doc;
  try {
    doc = JSON.parse(row.document);
  } catch (error) {
    skipped.push({ id: row.id, reason: `unparseable document: ${error.message}` });
    continue;
  }
  const prov = doc.provenance ?? null;
  const expanded = (prov?.contributors || []).map(e => expandProvenanceContributor(e)).filter(Boolean);
  const gen = expanded.filter(e => e.kind === "generative");
  const hum = expanded.filter(e => e.kind === "human");

  let kind = null;
  let nextProv = null;
  if (!expanded.length) {
    kind = "none";
    nextProv = { collaboration: "ai", contributors: [{ name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" }] };
  } else if (!gen.length) {
    kind = "humanOnly";
    nextProv = { collaboration: "ai", contributors: [{ name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" }] };
  } else if (expanded[0].kind !== "generative") {
    kind = "order";
    nextProv = { ...prov, contributors: [...gen, ...hum].map(e => compactProvenanceContributor(e)).filter(Boolean) };
  } else {
    continue;
  }

  const normalized = normalizeAuthoringProvenance(nextProv);
  if (!normalized) {
    skipped.push({ id: row.id, reason: "computed provenance failed normalization" });
    continue;
  }
  const check = (normalized.contributors || []).map(e => expandProvenanceContributor(e)).filter(Boolean);
  if (check[0]?.kind !== "generative") {
    skipped.push({ id: row.id, reason: `agent not first after normalize (got ${check[0]?.kind})` });
    continue;
  }
  if (kind !== "order" && check.some(e => e.kind === "human")) {
    skipped.push({ id: row.id, reason: "human survived a removal fix -- refusing" });
    continue;
  }

  const nextDoc = { ...doc, provenance: normalized };
  const beforeRest = serializeDraftDocument({ ...doc, provenance: undefined });
  const afterRest = serializeDraftDocument({ ...nextDoc, provenance: undefined });
  if (beforeRest !== afterRest) {
    skipped.push({ id: row.id, reason: "non-provenance drift detected -- refusing" });
    continue;
  }

  const documentJson = serializeDraftDocument(nextDoc);
  plan.push({
    id: row.id,
    revision: Number(row.revision),
    kind,
    cuedBy: row.cued_for_freeze_by,
    beforeByline: renderProvenanceL1(prov),
    afterByline: renderProvenanceL1(normalized),
    droppedHumans: kind === "order" ? [] : hum.map(h => h.name),
    documentJson,
    contentHash: draftContentHash(documentJson)
  });
}

const byKind = k => plan.filter(p => p.kind === k);
console.log(`scanned ${rows.length} live published puzzle rows`);
console.log(`  no provenance    -> ${byKind("none").length}`);
console.log(`  human, no agent  -> ${byKind("humanOnly").length}`);
console.log(`  agent not first  -> ${byKind("order").length}`);
console.log(`  already correct  -> ${rows.length - plan.length - skipped.length}`);
console.log(`  skipped          -> ${skipped.length}`);
skipped.forEach(s => console.log(`     ! ${s.id}: ${s.reason}`));
console.log("\n--- names being removed ---");
const drops = plan.filter(p => p.droppedHumans.length);
console.log(drops.length ? drops.map(p => `  ${p.id}: ${JSON.stringify(p.droppedHumans)}  "${p.beforeByline}" -> "${p.afterByline}"`).join("\n") : "  none");
const uncued = plan.filter(p => !p.cuedBy).length;
console.log(`\nof ${plan.length} rows to fix, ${uncued} currently carry no freeze cue`);

if (!APPLY && !EMIT) {
  console.log(`\nDRY RUN -- nothing written. Re-run with --emit-sql or --apply.`);
  process.exit(0);
}

const q = v => v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`;
const now = new Date().toISOString();
const sql = [];
for (const p of plan) {
  const next = p.revision + 1;
  sql.push(`INSERT INTO published_document_revisions (kind, id, revision, document, content_hash, published_by, published_at)
    SELECT 'puzzle', ${q(p.id)}, ${next}, ${q(p.documentJson)}, ${q(p.contentHash)}, published_by, ${q(now)}
    FROM published_documents WHERE kind='puzzle' AND id=${q(p.id)} AND revision=${p.revision};`);
  sql.push(`UPDATE published_documents SET document=${q(p.documentJson)}, content_hash=${q(p.contentHash)},
    revision=${next}, updated_at=${q(now)}
    WHERE kind='puzzle' AND id=${q(p.id)} AND revision=${p.revision};`);
}
const file = `${OUT}/backfill-published-provenance.sql`;
writeFileSync(file, sql.join("\n"));
console.log(`\nwrote ${sql.length} statements to ${file}`);
if (EMIT) {
  console.log("--emit-sql: not executing. Run it with:");
  console.log(`  npx wrangler d1 execute ${DB} --remote --config ${CONFIG} --file ${file}`);
  process.exit(0);
}
execFileSync("npx", ["wrangler", "d1", "execute", DB, "--remote", "--config", CONFIG, "--file", file],
  { cwd: ROOT, stdio: "inherit" });
