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
provenance: {
  collaboration: "humanPrimary",
  contributors: [
    { kind: "human", name: "Jane Doe" },
    { kind: "generative", name: "Cursor" }
  ]
}
```

The entire `provenance` object is optional on the work product.

### Axis 1 — contributors

| Field | Required | Notes |
|---|---|---|
| `kind` | yes | `human` \| `generative` |
| `name` | yes | Person display name, or product/system name |

- Non-empty when `provenance` is present.
- One entry per distinct `kind` + `name` (case-insensitive); upsert in place.
- Optional later (**L3 only**, not agent-facing): `provider`, `model`.

### Axis 2 — collaboration mode

Exactly one value when `provenance` is present:

| Mode | Meaning |
|---|---|
| `human` | Human only — no generative contributor |
| `humanPrimary` | Human + AI; human is primary (direction, judgment, accountability) |
| `aiPrimary` | Human + AI; AI is primary producer; human oversees or lightly edits |
| `ai` | AI only — no human contributor named |

Consistency (validate when both axes are present; do not invent names to
satisfy the mode):

- `human` → every contributor `kind: "human"`.
- `ai` → every contributor `kind: "generative"`.
- `humanPrimary` / `aiPrimary` → at least one human and one generative when
  both kinds are known. If only one kind is known, use `human` or `ai`, or
  omit `provenance` — **never invent** a placeholder person or system.

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

## Agent contract = L2 only

Agents may:

- Set `collaboration` when confident.
- Upsert `contributors[]` with `{ kind, name }` for known participants.
- Leave `provenance` unset when unsure.

Agents must not:

- Choose L0 / L1 / L3 or byline templates.
- Write player-facing byline strings (today’s `learningIntroduction.credit`).
- Invent humans, systems, roles, scopes, or dates.
- Emit role/scope contribution matrices.

Prefer server host-stamps to seed a generative contributor; humans (or a later
pass) set mode and human names when known.

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
2. **Later interchange bump** — derive L1 bylines from `provenance`; migrate
   or drop `learningIntroduction.credit`; fold `generativeAssistance` into
   contributors + mode (with read compatibility as needed).
3. **UI polish** — drafts/player surfaces prefer L1/L2 from `provenance`
   when present.
