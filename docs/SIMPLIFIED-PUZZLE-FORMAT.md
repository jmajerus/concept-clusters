# Simplified puzzle format

This is the only input format for the authoring MCP tools
(`create_puzzle_draft`, `save_puzzle_draft` / `replace_puzzle_draft`), and
the canonical shape of everything downstream of them: drafts,
`content/puzzles/*.ccpuzzle.json` files, and generated `puzzles/**/*.js`
modules. It's the same puzzle content a `puzzles/*.js` module already
carries, minus the identity-bookkeeping problem JSON-LD's `@id`/`@type`
ceremony has -- not a cut-down subset of what a puzzle can express.
Everything a puzzle's *content* can do, this format can author:
multi-cluster bridges, bridge direction, ideal terms, bridge term roles, all
three lens modes, related puzzles, learning introductions, and provenance.
See "What's authored elsewhere" at the bottom for the one thing that
genuinely doesn't fit here.

`document` in those tools accepts this format. A document with a top-level
`@context` (hand-written JSON-LD) is still read as a compatibility path on
the hosted server -- for drafts saved before this was the only supported
shape -- but is not a supported way to author a new puzzle; see
[JSON-LD.md](./JSON-LD.md) for JSON-LD's current, narrower role as an
on-demand interchange format.

## Why this exists

Two different things silently drift out of sync if an author has to
maintain them by hand, and this format removes both:

- **JSON-LD's `id`/`@id` pair.** Every cluster and bridge needs a bare `id`
  slug *and* an `@id` that must be byte-identical to `"#" + id`. Authors
  (human and AI) kept getting these two fields out of sync -- five published
  puzzles shipped with a cluster `id` missing a prefix its `@id` fragment
  already had, caught only when an unrelated validator fix started flagging
  real, pre-existing content.
- **The runtime `.js` shape's positional bridge references.** A puzzle
  module's bridges name their clusters by array position (`"clusters": [0,
  1]`), which is the same class of bug in a different costume: reorder or
  miscount the cluster array and a bridge silently connects the wrong two
  clusters, with no validation possible, because any small integer is a
  "valid" index. Referencing clusters by `id` string instead turns a silent
  wrong connection into a loud "unknown cluster reference" error.

A cluster's `id` is optional -- when omitted, it's derived from `name` (a
plain slug, no prefix) so a bridge referencing it can predict what to write.
Bridge `id` is optional too, derived from `term`, the same way every
bridge-id-less puzzle in the repository already works. Neither ever needs a
JSON-LD-style `@id` typed alongside it -- that pairing (always mechanically
`"#" + id`) only exists on the far side of an explicit, on-demand
conversion, if this puzzle is ever exported for portable interchange (see
[JSON-LD.md](./JSON-LD.md)); it plays no role in authoring or storage.

## Example

```json
{
  "id": "cognitive-load-theory",
  "title": "Cognitive Load Theory",
  "category": "Cognitive Science",
  "clusters": [
    {
      "id": "intrinsic-load",
      "name": "Intrinsic Load",
      "fact": "Intrinsic load stems from the inherent complexity of the material itself.",
      "seeds": ["element interactivity", "information complexity"],
      "floatingTerms": ["domain knowledge", "prior schemas"]
    },
    {
      "id": "extraneous-load",
      "name": "Extraneous Load",
      "fact": "Extraneous load is created by poor instructional design or unnecessary distractions.",
      "seeds": ["redundancy effect", "split-attention effect"],
      "floatingTerms": ["seductive details", "format distraction"]
    }
  ],
  "bridges": [
    {
      "term": "germane load",
      "clusters": ["intrinsic-load", "extraneous-load"],
      "fact": "Freeing working memory capacity lets mental effort shift toward schema construction."
    }
  ]
}
```

This compiles, deterministically, to the same internal puzzle shape every
built-in puzzle module already uses -- the shape validation, preview, and
publication all work from directly, with no JSON-LD conversion in between.

## Field reference

**Puzzle** — `id`, `title`, `category` required. `categories` (array,
primary first), `subcategories` (`{categoryName: subcategoryId}`), `tags`,
`large`, `info` (string, or `{text?, link?, extraLink?, citations?}`) are
optional, as are:

- `lenses` (see below), `lensMode` (`sequential` | `assignment` | `quiz`,
  default sequential), `preSolve` (boolean).
- `relatedPuzzles`: `{info?, entries: [{id, reason, via?}]}`.
- `learningIntroduction`: `{requirement: "optional"|"recommended"|"required",
  title?, summary?, estimatedMinutes?, content: {text}, sources?:
  [{label, href}], citations?}`.
- `generativeAssistance` (see `get_authoring_guidance` for when to set this).
- Provenance pass-through: `creator`, `license`, `derivedFrom`,
  `dateCreated`, `dateModified`, `language`, `version` -- plain strings,
  carried through unchanged.

Two to six `clusters`, zero or more `bridges`.

**Cluster** — `name`, `fact` required. `id` is optional, derived from `name`
when omitted. `seeds`: exactly two terms. `floatingTerms`: one to four more
terms, disjoint from `seeds`. Together these become the cluster's
three-to-six term list. `color` is one of `teal`, `blue`, `amber`,
`magenta`, `olive`, `brown`, `cyan` and auto-assigned, collision-free, when
omitted. `termInfo` (`{term: infoValue}`) and `info` are optional. Every
term (a `seeds`/`floatingTerms` entry, or a bridge's `term` below) is
capped at 40 characters -- it becomes a Star-mode pill sized to fit the
whole string on one line, and a much longer term bloats its own pill and
crowds its neighbors.

**Bridge** — `term`, `clusters` (two cluster `id`s, or three for a ternary
bridge), `fact` required. `id` is optional, derived from `term` when
omitted. Also optional: `info`, `conceptId`, `termRole` (`reference` |
`connector`; omitted means `reference`), `relationKind` (`dynamic` |
`foundation` | `cross-cutting` | `contrast` | `continuity` | `evaluation`),
`direction` (`{kind: "undirected"|"through"|"bidirectional"|"outward"|"inward",
from?, to?}` -- `from`/`to` are cluster ids, only meaningful for `"through"`,
and only valid on a two-cluster bridge), `idealTerms`
(`{clusterId: term}` -- list only the clusters worth specifying; the rest
default to no ideal term).

Use `termRole: "reference"` (or omit it) when the displayed bridge term is
itself an intended object of learning within the puzzle's conceptual
territory and central lesson, or whenever the term is a proper noun (a
specific named person, place, organization, or work) -- a name carries no
self-descriptive content and always reads as a specific, findable thing
worth looking up, however incidental its role feels. Use `connector` when
it carries a local relationship, evidence, mechanism, plot detail, or
biographical thread phrased as the generic thing itself rather than as a
named entity. A connector may be a phrase or a concrete, unfamiliar,
specific, encyclopedia-worthy common noun (a technical process, say); among
these non-proper-noun candidates, article existence, search quality,
familiarity, and grammar still are not the test. Want connector treatment
for something that's really a specific named thing? Keep the name out of
the displayed term and put it in the surrounding fact/info prose instead,
where it isn't the term being classified at all.

Classify the role first, then provide help at the appropriate level of
granularity. Prefer a verified direct resource for references.
Cluster-sized help on the cluster; term-sized help on a term. Omitting a
link means no chip -- automatic Wikipedia search is not inferred. A connector receives no automatic search
but may still carry a concise `info` description—often useful—to clarify its
local function.
It must not carry `link`, `extraLink`, `seeAlso`, or `citations`. Source support
belongs with the puzzle's lesson content, not with the connector.
`termRole` is independent of `relationKind`: the former describes the term's
role in the lesson, while the latter describes the relationship expressed by
the bridge fact.

**Lens** (optional, `lenses[]`) — `id`, `prompt`, `explanation` required
(every lens needs `explanation` regardless of mode). Also optional: `label`,
`definition`, `color`. Sequential and assignment mode use `targets` (term or
bridge names); assignment mode also uses `reasons` (`{target: rationale}`).
Quiz mode uses `options` (`[{id, label, correct?, targets?}]`) instead of
top-level `targets`. Which of these a given lens actually needs depends on
the puzzle's `lensMode` -- that consistency is checked downstream (see
"Validation layers"), not by this format's own shape check.

## What's authored elsewhere

**Star layout curation** -- positional/visual placement data for the Star
board mode, authored through its own dedicated schema
(`modules/starLayoutSchema.js`) and a maintainer-run tool
(`tools/import-star-layout.mjs`), not part of puzzle content or this
format's field set. It has never lived in JSON-LD either -- storage is a
sparse, generated per-puzzle registry under `puzzles/layouts/star/`, present
only for puzzles that got hand-placed final layouts; algorithmic layout is
the default for everything else. Everything else a puzzle can express, this
format can author directly.

## Validation layers

1. Shape: `modules/simplifiedPuzzleSchema.js`'s zod schema (required fields,
   cardinality, no unrecognized keys). A draft saved with input that fails
   this check is stored exactly as given, not rejected -- consistent with
   drafts generally being allowed to stay temporarily invalid between saves.
   `validate_puzzle_draft` then reports these as plain, field-scoped
   messages.
2. Conversion: `puzzleFromSimplified()` resolves cluster and bridge id
   references, assigns colors, and produces the internal puzzle shape --
   the same shape every built-in puzzle module already exports, and the one
   the rest of validation and publication work from directly.
3. The shared semantic rules in `modules/contentValidation.js` and
   `modules/lensValidation.js` (node-count cap, color uniqueness, duplicate
   terms, direction/lensMode consistency, lens target existence, and the
   rest) run on that internal shape regardless of authoring format. This
   format only replaces the authoring shape, not the rules a puzzle has to
   satisfy.
