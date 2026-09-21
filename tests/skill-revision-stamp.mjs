import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { stampContent } from "../tools/stamp-skill-revision.mjs";

export const name = "Skill revision stamp: content hash under each SKILL.md H1 stays current";

const FIXTURE = "---\nname: x\n---\n\n# Title\n\nBody line.\n";

export async function run() {
  const first = stampContent(FIXTURE, "2026-01-01");
  assert.equal(first.changed, true);
  assert.match(first.text, /^# Title\n\nSkill rev `[0-9a-f]{8}` · 2026-01-01\n\nBody line\.\n$/m);

  // Idempotent: a current stamp is left alone, date included.
  const again = stampContent(first.text, "2026-02-02");
  assert.equal(again.changed, false);
  assert.equal(again.text, first.text);
  assert.equal(again.hash, first.hash);

  // A body edit changes the hash; the old stamp is replaced, not duplicated.
  const edited = stampContent(first.text.replace("Body line.", "Body line changed."), "2026-03-03");
  assert.equal(edited.changed, true);
  assert.notEqual(edited.hash, first.hash);
  assert.equal((edited.text.match(/Skill rev/g) || []).length, 1);
  assert.match(edited.text, /· 2026-03-03/);

  // An H1 with no blank line after it still gets a well-formed stamp block.
  const tight = stampContent("# Title\nBody.\n", "2026-01-01");
  assert.match(tight.text, /^# Title\n\nSkill rev `[0-9a-f]{8}` · 2026-01-01\n\nBody\.\n$/);

  // The repository's own skills are stamped and current.
  const check = spawnSync(process.execPath, ["tools/stamp-skill-revision.mjs", "--check"], { encoding: "utf8" });
  assert.equal(check.status, 0, `Stale skill stamps:\n${check.stdout}${check.stderr}`);
}
