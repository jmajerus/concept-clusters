# Authoring provenance shape

**Status: implemented in schema/runtime as optional `provenance` — keep
`generativeAssistance` / `learningIntroduction.credit` until a later
interchange bump retires them.**

Compact structured authoring provenance for human and generative-AI input to a
digital work product (Concept Clusters puzzles first). The saved shape is the
source of truth; player bylines and exports are projections at different detail
levels.

## Why

- One record can render in different **styles** and **levels of detail**.
- Chat/MCP agents need a **small** write contract (token cost and decision load).
- Partial knowledge must be enough: never invent people, systems, or modes.

## Core shape: two axes

```text
Axis 1 — contributors    who took part (named list)
Axis 2 — collaboration   how human and AI relate (one of four modes)
```

```js
// Agent-cheap write (kinds + mode inferred):
provenance: { contributors: ["Cursor", "Jane Doe"] }

// Stored / canonical form:
provenance: {
  collaboration: "aiPrimary",
  contributors: [
    { kind: "generative", name: "Cursor" },
    { kind: "human", name: "Jane Doe" }
  ]
}
```

The entire `provenance` object is optional on the work product.

### Axis 1 — contributors

Agents may send **bare names** (cheapest):

```js
contributors: ["Cursor", "Jane Doe"]
```

Or objects `{ name, kind?, provider?, model? }`. When `kind` is omitted, it is
inferred: names matching known AI hosts in
[`authoringSettings.js`](../../modules/authoringSettings.js)
(`Cursor`, `Claude`, `Claude Code`, `GitHub Copilot`, `Gemini CLI`, `Codex`,
including `Codex (model…)` forms) are **generative**; everything else is
**human**. Grow that host list when a real new system appears.

### Axis 2 — collaboration mode

Optional on write. When omitted, inferred from contributor kinds:

| Inferred kinds | Default mode |
|---|---|
| humans only | `human` |
| generative only | `ai` |
| both | `aiPrimary` (agent-from-scratch default; set `humanPrimary` when a human leads) |

Set `collaboration: "aiPrimary"` explicitly when AI was the primary producer.
Stored/canonical form always includes both axes with explicit kinds.

| Mode | Meaning |
|---|---|
| `human` | Human only — no generative contributor |
| `humanPrimary` | Human + AI; human is primary (direction, judgment, accountability) |
| `aiPrimary` | Human + AI; AI is primary producer; human oversees or lightly edits |
| `ai` | AI only — no human contributor named |

Never invent a placeholder person or system to satisfy a mode.
## Render levels (product keeps all)

| Level | Audience | Agent-facing? | Rule |
|---|---|---|---|
| **L0** | Minimal UI | No | Omit |
| **L1** | Lesson / player byline | No — app derives | Short string from mode + names (see below) |
| **L2** | Admin / review / **agent contract** | **Yes — only** | Show `collaboration` + contributor names/kinds; no dates, roles, or scopes |
| **L3** | Export / JSON-LD / audit | No | Full object; optional additive detail; dates only if stamped |

Richness is **derived from present fields**, not a stored tier flag. Callers may
always choose a render level; sparse data yields thinner output.

### L1 mode → byline sketch (product-side)

Uses the same template families as today’s
[`AUTHORING_SETTINGS.credit`](../../modules/authoringSettings.js) wording:

| Mode | Typical L1 |
|---|---|
| `human` | `By {human names}` |
| `humanPrimary` | `By {generative names}, with editorial direction by {human names}` (or compact) |
| `aiPrimary` | `Drafted with {generative names}; edited by {human names}` |
| `ai` | `Drafted with {generative names}` |

## Agent contract = L2 only (cheap writes)

Prefer:

```js
provenance: { contributors: ["Cursor", "Jane Doe"] }
```

Agents may:

- List contributor names (strings); kinds are inferred from known AI hosts.
- Omit `collaboration` unless they need `humanPrimary` (human editorial lead).
  Mixed names default to `aiPrimary`.
- Leave `provenance` unset when unsure.

Agents must not:

- Choose L0 / L1 / L3 or byline templates.
- Write player-facing byline strings (today’s `learningIntroduction.credit`).
- Invent humans, systems, roles, scopes, or dates.
- Emit role/scope contribution matrices.

Prefer server host-stamps to seed a generative contributor; add human names
when known. On `/admin/drafts`, humans override `collaboration` (e.g. to
`humanPrimary`); that refresh also rewrites the lesson byline from L1.

## L3 optional detail (not agent surface)

Additive only when useful for export/audit:

- Contributor `provider` / `model`
- `date` (`YYYY-MM-DD`) — **L3 only**; prefer silent server stamp; agents never
  set or invent dates
- Optional `contributions[]` with `role` / `scope` if a future admin surface
  needs them
- If scopes appear: `work` | `introduction` | `structure` | `assessment`
  (CC: puzzle / learningIntroduction / clusters–bridges–terms / lenses)

## Naming: `provenance` replaces “credit” as the model of record

Do **not** rename `learningIntroduction.credit` → `learningIntroduction.provenance`.
That would collide with puzzle-level structured `provenance` and keep a free-text
string as the durable shape.

Intended end state:

| Concern | Field |
|---|---|
| Model of record | Puzzle-level `provenance` (two axes) |
| Player byline | **Derived L1** from `provenance` (optional human override cache if needed) |
| Today’s `learningIntroduction.credit` | **Retire** after interchange bump (legacy L1 string) |
| Today’s `generativeAssistance` | **Fold into** generative `contributors` (+ mode); keep until the same bump |

Until that bump, keep shipping `generativeAssistance` and
`learningIntroduction.credit` as today. New design work and future MCP guidance
should speak in `provenance` terms.

## Concept Clusters mapping (today → proposed)

| Today | Proposed |
|---|---|
| Distinct `generativeAssistance[].system` | Generative `contributors` |
| Human from drafts UI / JWT / default author when known | Human `contributors` |
| Directed / drafted-only / human-only bylines | L1 from `collaboration` + names |
| `learningIntroduction.credit` | Derived L1 (or temporary override); not the model of record |
| `generativeAssistance` scopes / roles / dates | Collapse to mode for agents; scopes/roles/dates → L3 if kept |

## Separation of concerns

- **Authoring provenance** — who made the artifact (`provenance`).
- **Source provenance** — `citations` / `links` (bibliographic / further reading).
- Never put AI drafting attribution in `citations`.

## Non-goals

- Not an edit log or changelog.
- Not forcing mode or contributors when unknown.
- Not teaching agents roles, scopes, dates, or the full render menu.
- Not a runtime schema / validator / corpus change in this brief.

## Adoption sequence

1. **This brief + optional field** — vocabulary locked; `provenance` accepted
   on simplified/runtime documents; MCP stamps generative contributors;
   agents taught L2 only in publication/pedagogy guidance.
2. **Canonicalize fold** — `canonicalizeDocumentProvenance` runs with link/citation
   folding on editor load and publication: syncs generative systems into
   provenance; when L1 can render, **deletes** stored `learningIntroduction.credit`
   so the byline stays derived. Opaque legacy credits remain only when L1 cannot
   render.
3. **Later interchange bump** — drop `generativeAssistance` with read compatibility;
   remove legacy credit field from schema when corpus is migrated.
