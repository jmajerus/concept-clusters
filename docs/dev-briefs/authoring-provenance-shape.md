# Authoring provenance shape

**Status: implemented in the internal schema/runtime as optional `provenance`.
The current MCP agent-facing schema omits it: the server stamps an identifiable
MCP client where possible, while human editorial workflows maintain or correct
document attribution. JSON-LD remains an explicit interchange format.**

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
// Human/editorial update (kinds inferred on read):
provenance: { contributors: ["Cursor", "Jane Doe"] }

// Stored / canonical form (lean — kind inferred when known):
provenance: {
  collaboration: "aiPrimary",
  contributors: [
    { name: "Cursor" },
    { name: "Jane Doe" }
  ]
}
```

The entire `provenance` object is optional on the work product. It remains in
the internal document model, but MCP agents neither receive nor author it.

### Axis 1 — contributors

Human/editorial workflows may enter **bare names** (cheapest):

```js
contributors: ["Cursor", "Jane Doe"]
```

Or objects `{ name, kind?, model? }`. Legacy `provider` input is discarded.
When `kind` is omitted, it is
inferred: names matching known AI hosts in
[`authoringHosts.js`](../../modules/authoringHosts.js)
(`Cursor`, `Claude`, `Claude Code`, `GitHub Copilot`, `Gemini`, `Gemini CLI`,
`Codex`, `ChatGPT`, `Muse`, `Muse Code`, including `Codex (model…)` forms) are
**generative**; everything else is **human**. Grow that host list when a real
new system appears.

**Client surfaces are canonical.** The client that touched the draft remains
the contributor identity everywhere: Claude and Claude Code, Gemini and
Gemini CLI, Muse and Muse Code, Codex and ChatGPT (when identified), and
Cursor remain separate rows, bylines, and model-editor choices. This is
important because clients
using the same model revision can differ in sampling, temperature, tools, and
editor integration. The registry may retain `family`/`provider` annotations
for a future reporting feature, but they are inactive metadata: they do not
participate in stamping, storage keying, API responses, or byline rendering,
and neither is persisted on a puzzle document or assistance-stamp audit
record.

**Storage stays lean:** omit `kind` when it matches inference. Keep an explicit
`kind` only to override inference; model detail is embedded in the contributor
name when known.

### Axis 2 — collaboration mode

Optional on write. When omitted, inferred from contributor kinds:

| Inferred kinds | Default mode |
|---|---|
| humans only | `human` |
| generative only | `ai` |
| both | `aiPrimary` (server-stamped AI-draft default; human editors may set `humanPrimary` when a human leads) |

Human editors may set `collaboration: "aiPrimary"` explicitly when AI was the primary producer.
Stored form always includes collaboration + contributor names; kinds are
derived on read for L1/L2 and validation.

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
| **L2** | Admin / review | No — human/editorial only | Show `collaboration` + contributor names/kinds; no dates, roles, or scopes |
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

When the author has set optional `reviewedBy`, L1 appends
`; reviewed by {name}` after that line (for example
`Drafted with Claude Code (Claude Sonnet 5 High); edited by John Majerus; reviewed by Jane Expertsmith`).
`reviewedBy` is **not** a contributor: it does not change collaboration
inference, and it is not a sign-off the reviewer has to click. Authors set
it on `/admin/drafts`. Agents must not invent a reviewer name.

## MCP agent boundary (current)

The shapes below describe stored provenance and human/editorial maintenance;
they are not part of the MCP puzzle document. MCP reads omit `provenance`, and
MCP writes cannot supply or replace it. The server records an identifiable
client where possible and preserves existing attribution; `/admin/drafts` is
the human surface for corrections. MCP agents also do not receive or write the
legacy `learningIntroduction.credit` byline or protected `creator`, `license`,
and `derivedFrom` fields. Those fields remain separate from `provenance` in
stored documents; this boundary change does not migrate them into a new
settings object. `language` remains agent-authored metadata.

## Human/editorial maintenance

Prefer:

```js
provenance: { contributors: ["Cursor", "Jane Doe"] }
```

Human editors may:

- List contributor names (strings); kinds are inferred from known AI hosts.
- Omit `collaboration` unless they need `humanPrimary` (human editorial lead).
  Mixed names default to `aiPrimary`.
- Leave `provenance` unset when unsure.

Do not ask MCP agents to:

- Choose L0 / L1 / L3 or byline templates.
- Write player-facing byline strings (today’s `learningIntroduction.credit`).
- Invent humans, systems, roles, scopes, dates, or a reviewer name.
- Set `reviewedBy` (authors fill that on the drafts page).
- Emit role/scope contribution matrices.

Prefer server host-stamps to seed a generative contributor; add human names
when known through `/admin/drafts`. Human editors may override
`collaboration` (e.g. to `humanPrimary`); that refresh also rewrites the lesson
byline from L1.

## L3 optional detail (not agent surface)

Additive only when useful for export/audit:

- Contributor model detail (normally embedded in the client-surface name);
  provider is never stored
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
| Retired client-attribution array | **Folded into** generative `contributors` (+ mode); no longer part of current documents |

Current MCP guidance identifies provenance as outside the agent contract;
human/editorial guidance describes the internal provenance shape. The corpus
canonicalization pass has completed for the retired client-attribution array;
current documents no longer carry it, and current authoring rejects it rather
than treating it as a second input contract. JSON-LD remains available only
through the explicit interchange boundary.

## Concept Clusters mapping (today → proposed)

| Today | Proposed |
|---|---|
| Distinct legacy client systems | Generative `contributors` |
| Human from drafts UI / JWT / default author when known | Human `contributors` |
| Directed / drafted-only / human-only bylines | L1 from `collaboration` + names |
| `learningIntroduction.credit` | Derived L1 (or temporary override); not the model of record |
| Legacy assistance scopes / roles / dates | Not part of the puzzle document; retained in the append-only D1 assistance-stamp audit |

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

1. **This brief + optional field** — vocabulary locked; internal simplified
   documents retain `provenance`; MCP stamps identifiable clients and keeps
   provenance outside agent read/write payloads.
2. **Canonicalize fold (completed)** — `canonicalizeDocumentProvenance` and
   the corpus migration moved any retired client-attribution data that could
   be recovered into `provenance`. When L1 can render, **deletes** stored
   `learningIntroduction.credit` so the byline stays derived. Opaque legacy
   credits remain only when L1 cannot render.
3. **Current authoring/interchange contract** — the retired client-attribution
   array is removed from active simplified/MCP and JSON-LD contracts. Current
   authoring accepts simplified documents only; JSON-LD is a separately
   invoked interchange boundary and uses `provenance` directly. The separate
   `learningIntroduction.credit` read/display fallback can be retired later
   after existing opaque credits have been reviewed.
