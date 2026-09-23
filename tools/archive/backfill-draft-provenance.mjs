// ARCHIVED -- applied once against hosted D1 on 2026-09-23. Retained as the
// worked example for provenance-shaped maintenance, not as a live tool.
// Re-running is harmless (it reports 0 rows to fix), and it is dry-run by
// default: --emit-sql writes the statements, --apply also executes them.
//
// What it did: 26 of 175 puzzle working copies did not name the agent that
// created them -- 20 with no provenance at all, 5 crediting a human and no
// agent, 1 with the agent present but not first. All predate commit 601fbf9,
// which made create_puzzle_draft stamp an unidentified client as
// "generative assistance" unconditionally.
//
// Why a migration and not an authoring pass: `provenance` is a protected root
// field (authoringFieldOwnership.js), so no MCP tool can write it -- that is
// what stops an agent laundering its own byline -- and the drafts-page form is
// the only human route, at 26 rows by hand.
//
// Three things worth stealing if you write the next one:
//
//   1. A provenance write is not one column. `document` is what publish and
//      Freeze read; `provenance_json` is what the focused domain path reads.
//      Writing one and not the other leaves the fix to be silently reverted at
//      publish time. Both move together, with content_hash, revision,
//      document_stale and validation_json, per d1DraftRepository.save.
//
//   2. Compute the new value with the real module functions, not by hand. The
//      first version of this script wrote { name: "generative assistance" }
//      with no kind. That name is not a known host, so expandProvenanceContributor
//      infers *human* -- it would have normalized to collaboration "human" and
//      replaced one wrongly-credited human with another. The dry run caught it.
//      Hence the post-normalization guards below: assert the agent is first and
//      that no human survived a removal fix, and skip the row if not.
//
//   3. Write the pre-state to puzzle_draft_history first and guard the UPDATE
//      on the revision you read. A row edited between plan and apply then
//      no-ops instead of clobbering.

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  expandProvenanceContributor,
  compactProvenanceContributor,
  renderProvenanceL1,
  normalizeAuthoringProvenance,
  UNIDENTIFIED_GENERATIVE_SYSTEM
} from "../../modules/authoringProvenance.js";
import { assembleAuthoredDocumentFromDraftRow, storedDomainDocuments } from "../../modules/authoringDomains.js";
import { draftContentHash, serializeDraftDocument } from "../../modules/draftRepository.js";

const APPLY = process.argv.includes("--apply");
const EMIT = process.argv.includes("--emit-sql");
const OUT = process.env.SCRATCH || "/tmp";
const DB = "concept-clusters-authoring";
const CONFIG = "wrangler.authoring.jsonc";

function d1(sql) {
  const out = execFileSync("npx", [
    "wrangler", "d1", "execute", DB, "--remote", "--config", CONFIG, "--json", "--command", sql
  ], { cwd: new URL("../../", import.meta.url).pathname, maxBuffer: 1024 * 1024 * 256, encoding: "utf8" });
  return JSON.parse(out)[0].results;
}

const rows = d1(`SELECT id, owner_subject, revision, document_stale, content_hash,
  document, content_json, pedagogy_json, provenance_json FROM puzzle_drafts`);

const plan = [];
const skipped = [];

for (const row of rows) {
  let doc;
  try {
    doc = assembleAuthoredDocumentFromDraftRow(row);
  } catch (error) {
    skipped.push({ id: row.id, reason: `could not assemble: ${error.message}` });
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
    nextProv = {
      ...prov,
      contributors: [...gen, ...hum].map(e => compactProvenanceContributor(e)).filter(Boolean)
    };
  } else {
    continue;
  }

  const normalized = normalizeAuthoringProvenance(nextProv);
  if (!normalized) {
    skipped.push({ id: row.id, reason: "computed provenance failed normalization" });
    continue;
  }
  // The whole point of the migration: the agent must survive normalization as
  // the agent, and be first. A bare unnamed entry infers human -- refuse it.
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
  // Provenance-only: everything else must be byte-identical.
  const beforeRest = serializeDraftDocument({ ...doc, provenance: undefined });
  const afterRest = serializeDraftDocument({ ...nextDoc, provenance: undefined });
  if (beforeRest !== afterRest) {
    skipped.push({ id: row.id, reason: "non-provenance drift detected -- refusing" });
    continue;
  }

  const documentJson = serializeDraftDocument(nextDoc);
  plan.push({
    id: row.id,
    owner: row.owner_subject,
    revision: row.revision,
    stale: Number(row.document_stale || 0) === 1,
    kind,
    beforeByline: renderProvenanceL1(prov),
    afterByline: renderProvenanceL1(normalized),
    droppedHumans: kind === "order" ? [] : hum.map(h => h.name),
    documentJson,
    contentHash: draftContentHash(documentJson),
    domains: storedDomainDocuments(nextDoc),
    prevDocumentJson: serializeDraftDocument(doc),
    prevContentHash: row.content_hash
  });
}

const byKind = k => plan.filter(p => p.kind === k);
console.log(`scanned ${rows.length} draft rows`);
console.log(`  no provenance      -> ${byKind("none").length}`);
console.log(`  human, no agent    -> ${byKind("humanOnly").length}`);
console.log(`  agent not first    -> ${byKind("order").length}`);
console.log(`  already correct    -> ${rows.length - plan.length - skipped.length}`);
console.log(`  skipped            -> ${skipped.length}`);
skipped.forEach(s => console.log(`     ! ${s.id}: ${s.reason}`));

console.log("\n--- names being removed ---");
plan.filter(p => p.droppedHumans.length).forEach(p =>
  console.log(`  ${p.id}: ${JSON.stringify(p.droppedHumans)}  "${p.beforeByline}" -> "${p.afterByline}"`));

console.log("\n--- stale rows (document blob not authoritative) ---");
const stale = plan.filter(p => p.stale);
console.log(stale.length ? stale.map(p => "  " + p.id).join("\n") : "  none");

if (!APPLY && !EMIT) {
  writeFileSync(`${OUT}/backfill-plan.json`, JSON.stringify(
    plan.map(({ documentJson, prevDocumentJson, domains, ...rest }) => rest), null, 1));
  console.log(`\nDRY RUN -- nothing written. Plan: ${OUT}/backfill-plan.json`);
  console.log("Re-run with --apply to write.");
  process.exit(0);
}

const q = v => v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`;
const now = new Date().toISOString();
const sql = [];
for (const p of plan) {
  sql.push(`INSERT INTO puzzle_draft_history (draft_id, seq, document, content_hash, saved_at)
    SELECT ${q(p.id)}, COALESCE(MAX(seq), 0) + 1, ${q(p.prevDocumentJson)}, ${q(p.prevContentHash)}, ${q(now)}
    FROM puzzle_draft_history WHERE draft_id = ${q(p.id)};`);
  sql.push(`UPDATE puzzle_drafts SET document = ${q(p.documentJson)}, content_hash = ${q(p.contentHash)},
    provenance_json = ${q(p.domains.provenance)}, content_json = ${q(p.domains.content)},
    pedagogy_json = ${q(p.domains.pedagogy)}, revision = revision + 1, validation_json = NULL,
    document_stale = 0, updated_at = ${q(now)}
    WHERE id = ${q(p.id)} AND owner_subject = ${q(p.owner)} AND revision = ${p.revision};`);
}
const file = `${OUT}/backfill-draft-provenance.sql`;
writeFileSync(file, sql.join("\n"));
console.log(`\nwrote ${plan.length * 2} statements to ${file}`);
if (EMIT) {
  console.log("--emit-sql: not executing. Run it with:");
  console.log(`  npx wrangler d1 execute ${DB} --remote --config ${CONFIG} --file ${file}`);
  process.exit(0);
}
console.log("applying...");
execFileSync("npx", ["wrangler", "d1", "execute", DB, "--remote", "--config", CONFIG, "--file", file],
  { cwd: new URL("../../", import.meta.url).pathname, stdio: "inherit" });
