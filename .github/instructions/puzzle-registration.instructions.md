---
applyTo: "puzzles/**/*.js"
---

# Puzzle module registration is intentionally deferred on hosted PRs

Hosted puzzle-authoring PRs (submitted through the MCP authoring server)
intentionally do **not** add their new puzzle module to the `PUZZLES`
array in `puzzles/index.js` in the same PR. Concurrent puzzle
submissions would otherwise conflict on that one shared file, and
GitHub doesn't support `merge=union` for JS import lists.

`tools/ensure-puzzle-registry.mjs` runs in CI (so validation still sees
every on-disk module) and again, post-merge, via the "Sync puzzle
registry" workflow, which pushes a follow-up commit registering any
module still missing from the array.

Do not flag a new file under `puzzles/**` for being absent from
`puzzles/index.js`'s `PUZZLES` array, or from the app's puzzle picker /
catalogue generation as a result -- that gap is expected on these PRs
and is closed automatically after merge. A puzzle module with some
other, substantive problem is still worth flagging; the registration
gap alone is not.
