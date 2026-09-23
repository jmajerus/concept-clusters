// Verification for the provenance backfills: does any published row whose
// provenance differs from its module in puzzles/ lack a pending freeze cue?
//
// Such a row is stranded -- the correction lives in D1, but production serves
// the generated modules, and contentFreezePlan exports only rows carrying a
// non-seed cue. Fixing D1 without cueing therefore looks done and changes
// nothing a player sees. Expected output is zero gaps.
//
// Rows published but absent from puzzles/ are listed separately: a freeze
// would ADD those files, which is a different decision from correcting one.
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = "/home/john/Workspace/concept-clusters";
const sh = (c, a) => execFileSync(c, a, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });
const d1 = sql => JSON.parse(sh("npx", ["wrangler", "d1", "execute",
  "concept-clusters-authoring", "--remote", "--config", "wrangler.authoring.jsonc",
  "--json", "--command", sql]))[0].results;

const gitProv = new Map();
for (const c of readdirSync(path.join(ROOT, "puzzles"), { withFileTypes: true })) {
  if (!c.isDirectory()) continue;
  for (const f of readdirSync(path.join(ROOT, "puzzles", c.name))) {
    if (!f.endsWith(".js")) continue;
    const mod = await import(pathToFileURL(path.join(ROOT, "puzzles", c.name, f)).href);
    const doc = mod.default ?? mod.puzzle ?? Object.values(mod)[0];
    if (doc?.id) gitProv.set(doc.id, doc.provenance ?? null);
  }
}

const rows = d1(`SELECT id, json_extract(document,'$.provenance') AS prov, cued_for_freeze_by
  FROM published_documents WHERE kind='puzzle' AND withdrawn_at IS NULL`);

const canon = v => Array.isArray(v) ? v.map(canon)
  : (v && typeof v === "object"
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])]))
    : v);
const j = v => JSON.stringify(canon(v ?? null));

const pending = r => r.cued_for_freeze_by && r.cued_for_freeze_by !== "git-seed";
const gaps = [], covered = [], notInGit = [];
for (const r of rows) {
  const pub = r.prov ? JSON.parse(r.prov) : null;
  if (!gitProv.has(r.id)) { if (!pending(r)) notInGit.push(r.id); continue; }
  if (j(pub) === j(gitProv.get(r.id))) continue;
  (pending(r) ? covered : gaps).push(r.id);
}

console.log(`published rows whose provenance differs from git: ${covered.length + gaps.length}`);
console.log(`  cued, will reach git on the next freeze: ${covered.length}`);
console.log(`  NOT cued -- correction stranded in D1:    ${gaps.length}`);
gaps.forEach(id => console.log(`     ! ${id}`));
console.log(`\npublished but absent from git and not cued: ${notInGit.length}`);
notInGit.forEach(id => console.log(`     - ${id} (freeze would add; deliberately held)`));
