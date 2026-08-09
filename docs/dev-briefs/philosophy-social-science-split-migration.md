# Migration: split "Philosophy & Social Science" into four categories

**Why:** `docs/TAXONOMY-ROADMAP.md` already specifies this split (`Philosophy &
Social Science → Philosophy, Psychology, Sociology, Economics`) and says to
execute it "when their own puzzle counts justify it." The category is now at
28 puzzle memberships (23 primary), well past that point.

**Approach:** multi-category is the default for anything genuinely
interdisciplinary — this is not a one-shelf-per-book move. Primary category
was chosen as "best single entry point for a newcomer," not as a claim that
it's the *only* correct subject. See the two tables below.

**Do not use the hosted authoring MCP server for this.** It was built to
publish new puzzles, not relocate existing ones: it writes the new
category-path file but has no step that deletes the stale file at the old
category path, so every reassignment through that tool leaves an orphaned
duplicate behind (confirmed by testing on `psychology-schools` — PR #54,
not merged, should be closed). Direct file edits avoid this entirely.

---

## Step 1 — Register four new categories in `puzzles/categories.js`

Add these entries to the `CATEGORIES` export:

```js
Philosophy: {
  domain: "humanities",
  slug: "philosophy",
  info: {
    text: "How people reason about what's true, what's real, and what's right.",
    link: "wiki:Philosophy"
  }
},
Psychology: {
  domain: "social-sciences",
  slug: "psychology",
  info: {
    text: "How the mind develops, perceives, defends itself, and sometimes works against its own interests.",
    link: "wiki:Psychology"
  }
},
Sociology: {
  domain: "social-sciences",
  slug: "sociology",
  info: {
    text: "How groups, institutions, and social structures shape belief and behavior.",
    link: "wiki:Sociology"
  }
},
Economics: {
  domain: "social-sciences",
  slug: "economics",
  info: {
    text: "How people and institutions allocate scarce resources, and what that reveals about incentive and behavior.",
    link: "wiki:Economics"
  }
}
```

**Note on domain assignment:** Philosophy gets `domain: "humanities"`, not
`"social-sciences"`, even though it's splitting off the social-sciences-domain
category. This follows the roadmap's own domain scope table, which lists
philosophy explicitly under Humanities (domain #5: "Literature, history,
philosophy, religion, and cultural interpretation") and Social Sciences
separately as "Psychology, sociology, anthropology, economics as behavior,
politics" (domain #4). Psychology, Sociology, and Economics all stay under
`social-sciences`.

**After all puzzles below are moved**, remove the `Philosophy & Social
Science` entry from `CATEGORIES` entirely — `validate.mjs` checks that every
registered category name is used by at least one puzzle, and after this
migration it won't be.

**Political Science is intentionally not created here.** Two puzzles
(`what-gets-said-in-the-open`, `what-gets-said-offstage`) would fit it better
than Sociology, but the roadmap's own admission test ("can you name ten
puzzles you'd plausibly author under it") isn't clearly met yet. They're
filed under Sociology below as the least-wrong available option.

---

## Step 2 — Move and reclassify 23 puzzles

For each puzzle: update the `category` field, update or add the `categories`
array (primary listed first), then move the file from
`puzzles/philosophy-social-science/<id>.js` to
`puzzles/<new-primary-slug>/<id>.js`. Update the corresponding import path in
`puzzles/index.js` to match.

**Five of these are resource-bearing puzzles** (`definePuzzle(import.meta.url, ...)`
wrapper) with sibling files that must move together as a package — leaving
one behind will break the learning introduction or orphan an asset:

- `the-birth-of-the-drive` → also move `the-birth-of-the-drive.intro.md` (+ any `.assets/`)
- `confronting-the-shadow` → also move `confronting-the-shadow.intro.md` (+ any `.assets/`)
- `models-of-the-divided-mind` → also move `models-of-the-divided-mind.intro.md` (+ any `.assets/`)
- `the-manufactured-desire` → also move `the-manufactured-desire.intro.md` (+ any `.assets/`)
- `solidarity-in-brokenness` → also move `solidarity-in-brokenness.intro.md` (+ any `.assets/`)

### → Psychology (`puzzles/psychology/`)

| id | category | categories |
|---|---|---|
| `psychology-schools` | `"Psychology"` | *(omit — single category)* |
| `lacans-three-registers` | `"Psychology"` | `["Psychology", "Philosophy"]` |
| `moral-disengagement-and-moral-inversion` | `"Psychology"` | `["Psychology", "Philosophy"]` |
| `how-couples-get-stuck` | `"Psychology"` | `["Psychology", "Sociology"]` |
| `ways-out-of-a-conflict` | `"Psychology"` | *(omit)* |
| `the-birth-of-the-drive` | `"Psychology"` | `["Psychology", "Philosophy"]` |
| `confronting-the-shadow` | `"Psychology"` | `["Psychology", "Philosophy"]` |
| `models-of-the-divided-mind` | `"Psychology"` | `["Psychology", "Philosophy"]` |
| `designed-not-to-choose` | `"Psychology"` | `["Psychology", "Business & Organizations"]` |
| `after-the-click` | `"Psychology"` | `["Psychology", "Computer Science"]` — **keep existing `subcategories: { "Computer Science": "computing-and-society" }` unchanged** |

### → Sociology (`puzzles/sociology/`)

| id | category | categories |
|---|---|---|
| `sociology-paradigms` | `"Sociology"` | *(omit)* |
| `what-gets-said-in-the-open` | `"Sociology"` | *(omit)* |
| `what-gets-said-offstage` | `"Sociology"` | *(omit)* |
| `distortion-and-magnification` | `"Sociology"` | `["Sociology", "Psychology", "Philosophy"]` |

### → Philosophy (`puzzles/philosophy/`)

| id | category | categories |
|---|---|---|
| `epistemology-schools` | `"Philosophy"` | *(omit)* |
| `philosophy-branches` | `"Philosophy"` | *(omit)* |
| `finite-and-infinite-games` | `"Philosophy"` | *(omit)* |
| `the-manufactured-desire` | `"Philosophy"` | `["Philosophy", "Sociology"]` |
| `solidarity-in-brokenness` | `"Philosophy"` | `["Philosophy", "Psychology"]` |

### → Economics (`puzzles/economics/`)

| id | category | categories |
|---|---|---|
| `evolution-of-cooperation` | `"Economics"` | `["Economics", "Sociology", "Philosophy"]` |
| `governing-the-commons` | `"Economics"` | `["Economics", "Sociology"]` |
| `exit-voice-and-loyalty` | `"Economics"` | `["Economics", "Sociology"]` |
| `why-leaving-isnt-free` | `"Economics"` | `["Economics", "Sociology"]` |

---

## Step 3 — Update secondary category on 5 already-published puzzles

These stay exactly where they are (`puzzles/business-organizations/`,
`category: "Business & Organizations"` unchanged). Only the secondary entry
in their `categories` array changes, from `"Philosophy & Social Science"` to
`"Psychology"`. No file move.

| id | categories (old → new) |
|---|---|
| `the-groups-other-task` | `["Business & Organizations", "Philosophy & Social Science"]` → `["Business & Organizations", "Psychology"]` |
| `the-uses-of-hierarchy` | same pattern |
| `when-the-structure-stops-holding` | same pattern |
| `taking-off-the-engineering-hat` | same pattern |
| `the-leader-written-large` | same pattern |

---

## Step 4 — Verify

```sh
node validate.mjs
```

Should confirm: no duplicate puzzle IDs, no unregistered/unused categories,
every `category`/`categories` reference resolves, and (for the five
resource-bearing puzzles) that each moved package's local resource paths
still resolve correctly from their new directory.

## Summary of new category sizes

- **Psychology**: 10 primary (+5 secondary from Business & Organizations, +1 from Philosophy, +1 from Sociology, +2 from Philosophy) — largest of the four by a wide margin
- **Sociology**: 4 primary (+6 secondary)
- **Philosophy**: 5 primary (+5 secondary)
- **Economics**: 4 primary (+3 secondary)

Psychology's size, even after accounting for genuine multi-category spread,
is worth revisiting as its own subcategory question later — not now, but
flagging it since it's the same shape of problem this migration exists to
solve, one level down.
