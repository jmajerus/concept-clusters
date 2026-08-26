# Concept inventory (Phase A)

Save as `/tmp/<id>-inventory.json` before the fit pass. Prose in chat should
match this structure. **Do not** write simplified puzzle JSON or call
`create_puzzle_draft` until the human approves the inventory.

Board limits (`large`, 16/24 nodes, seeds/floatingTerms) are **forbidden** in
this artifact.

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
    "openQuestions": ["anything the human should decide before fit"]
  },
  "noneConsidered": false
}
```

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

Human approval phrase (required before fit): `inventory approved` or
`continue to fit`.
