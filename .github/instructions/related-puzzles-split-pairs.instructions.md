---
applyTo:
  - "content/puzzles/**/*.ccpuzzle.json"
  - "puzzles/**/*.js"
---

# Split-pair `relatedPuzzles` links are valid before the sibling lands

Hosted authoring often publishes **split pairs** as separate PRs (for example
`measuring-the-metabolome` and `from-features-to-metabolic-meaning`). Each
board may list the other in `relatedPuzzles.entries` **before** that sibling
is registered in `puzzles/index.js`.

Repository and draft validation both allow this: when checking a puzzle, ids
listed in **its own** `relatedPuzzles.entries` are treated as known. Forward
and reciprocal links between planned split siblings are intentional — not
typos, not broken references, and not a reason to block the PR.

Do **not** flag `relatedPuzzles.entries[].id` as "not a real puzzle id" when:

- the target id is the paired board from an approved split plan, and
- the link matches the seam / play order the author documented.

The link may not be playable until the sibling PR merges; that is expected for
sequential split publication.

## Canonical JSON vs generated module

New puzzles ship **two** files with the same puzzle metadata:

- `content/puzzles/<id>.ccpuzzle.json` — canonical source
- `puzzles/<category>/<id>.js` — generated compatibility module

Both carry the same `relatedPuzzles` block. Review the substance once; do not
file duplicate comments on the json and js copies for the same sibling id.
