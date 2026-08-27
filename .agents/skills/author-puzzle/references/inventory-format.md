# Concept inventory (Phase A)

Save as `/tmp/<id>-inventory.json` before the fit pass. Prose in chat should
match this structure. **Do not** write simplified puzzle JSON or call
`create_puzzle_draft` until the human approves the inventory.

Board limits (`large`, 16/24 nodes, seeds/floatingTerms) are **forbidden** in
this artifact.

**Do not read existing puzzle files** during inventory. The concept map must
come from the subject and cited sources, not from mirroring another board in
the corpus.

## Required shape

```json
{
  "id": "provisional-slug",
  "title": "Working title",
  "category": "registered-category-key",
  "thesis": "One sentence: what playing this board should teach.",
  "distinctions": [
    {
      "id": "d1",
      "name": "Working cluster name",
      "job": "What conceptual work this grouping does — not a syllabus label.",
      "candidateTerms": ["term a", "term b", "term c"],
      "anchor": {
        "title": "Source title",
        "url": "https://…",
        "author": "optional",
        "pages": "optional"
      },
      "nearDuplicates": ["terms that would do the same job if both included"]
    }
  ],
  "connections": [
    {
      "distinctions": ["d1", "d2"],
      "concept": "bridge concept label",
      "because": "why this link is genuine"
    }
  ],
  "excluded": [
    {
      "item": "term or subtopic",
      "reason": "why it is out of scope or redundant"
    }
  ],
  "rivalOrganizations": [
    {
      "alternative": "how the subject could be split differently",
      "chosenBecause": "why this inventory's split is better for the thesis"
    }
  ],
  "scope": {
    "in": "what this puzzle covers",
    "out": "what is deferred or out of scope",
    "openQuestions": ["anything the human should decide before plan or fit"]
  },
  "resolvedQuestions": [
    {
      "question": "…",
      "resolution": "…"
    }
  ],
  "splitPlanPath": "/tmp/<parent-id>-split-plan.json",
  "noneConsidered": false
}
```

When sizing or split is needed, follow [split-pass.md](split-pass.md) after
inventory approval. Move answered questions from `openQuestions` to
`resolvedQuestions`.

## Rules

- At least **two** distinctions; each needs a distinct `job`, ≥1 `candidateTerms`,
  and an `anchor` with `title` (prefer `url` when the source is on the web).
- Every `candidateTerms` entry must appear under **one** distinction only.
- `excluded` must be non-empty **or** set `"noneConsidered": true` with a
  sentence in `scope.out` explaining why nothing was set aside.
- `rivalOrganizations` is optional but recommended when the split is non-obvious.
- Uneven `candidateTerms` lengths are expected. **Do not** equalize counts here.
- Log a regularity audit in chat only (not used to reshape):

  ```text
  distinctions: N
  terms per distinction: …
  ```

Validate with:

```sh
node .agents/skills/author-puzzle/scripts/check-completeness.mjs --level inventory /tmp/<id>-inventory.json
```

Proceed to **plan** or **fit** when the human approves the map or gives a direct
create/fit instruction (see SKILL.md — no magic phrase required).
