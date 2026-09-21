#!/usr/bin/env node
// Stamp each .agents/skills/*/SKILL.md with a short content hash under its H1
// so a host's inline log of the skill can be checked against disk at a glance:
// same eight characters, same file. The hash covers the file with the stamp
// line removed, so restamping an unchanged skill is a no-op and keeps its date.
//
//   node tools/stamp-skill-revision.mjs           # write stale stamps
//   node tools/stamp-skill-revision.mjs --check   # list stale files, exit 1
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const STAMP_PATTERN = /^Skill rev `([0-9a-f]{8})` · \d{4}-\d{2}-\d{2}$/;

function stampLine(hash, date) {
  return `Skill rev \`${hash}\` · ${date}`;
}

// Remove the stamp (and the blank line that follows it) so the remainder is
// exactly the unstamped file.
function stripStamp(lines) {
  const index = lines.findIndex(line => STAMP_PATTERN.test(line));
  if (index === -1) return { bare: lines, hash: null };
  const hash = lines[index].match(STAMP_PATTERN)[1];
  const bare = [...lines];
  const removeCount = bare[index + 1] === "" ? 2 : 1;
  bare.splice(index, removeCount);
  return { bare, hash };
}

export function contentHash(bareText) {
  return createHash("sha256").update(bareText).digest("hex").slice(0, 8);
}

// Returns { text, hash, changed }. `text` is the input when the stamp is
// already current.
export function stampContent(text, date = new Date().toISOString().slice(0, 10)) {
  const lines = text.split("\n");
  const { bare, hash: existing } = stripStamp(lines);
  const hash = contentHash(bare.join("\n"));
  if (existing === hash) return { text, hash, changed: false };

  const h1 = bare.findIndex(line => /^# /.test(line));
  if (h1 === -1) throw new Error("SKILL.md has no H1 to stamp under");
  const insert = bare[h1 + 1] === "" ? ["", stampLine(hash, date)] : ["", stampLine(hash, date), ""];
  bare.splice(h1 + 1, 0, ...insert);
  return { text: bare.join("\n"), hash, changed: true };
}

export function skillFiles(root) {
  const skillsDir = join(root, ".agents", "skills");
  return readdirSync(skillsDir)
    .map(name => join(skillsDir, name, "SKILL.md"))
    .filter(path => { try { return statSync(path).isFile(); } catch { return false; } })
    .sort();
}

function main() {
  const check = process.argv.includes("--check");
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const stale = [];
  for (const path of skillFiles(root)) {
    const result = stampContent(readFileSync(path, "utf8"));
    const relative = path.slice(root.length + 1);
    if (!result.changed) {
      console.log(`current  ${result.hash}  ${relative}`);
      continue;
    }
    stale.push(relative);
    if (check) {
      console.log(`STALE    ${result.hash}  ${relative}`);
    } else {
      writeFileSync(path, result.text);
      console.log(`stamped  ${result.hash}  ${relative}`);
    }
  }
  if (check && stale.length) {
    console.error(`\n${stale.length} stale skill stamp(s). Run: npm run skills:stamp`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
