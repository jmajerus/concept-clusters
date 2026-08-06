// CLI presentation for the content statistics report -- see
// modules/puzzleStats.js for what's actually computed and why (also
// used by the in-app admin Stats panel, &admin-gated, so both surfaces
// report the exact same numbers). Read-only, no side effects; not
// wired into `npm test` or validate.mjs -- a report, not a gate, same
// reasoning as tools/check-wiki-links.mjs.
//
// Usage:
//   npm run content:stats

import { computePuzzleStats } from "../modules/puzzleStats.js";
import { PUZZLES } from "../puzzles/index.js";

const { total, sections } = computePuzzleStats(PUZZLES);

console.log(`\n=== Concept Clusters -- content statistics (${total} puzzles) ===`);
for (const { title, rows, emptyMessage } of sections) {
  console.log(`\n-- ${title} --`);
  if (rows.length === 0 && emptyMessage) {
    console.log(emptyMessage);
  } else {
    console.table(rows);
  }
}
console.log("");
