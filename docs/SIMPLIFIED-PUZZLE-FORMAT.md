# Simplified puzzle format

This is the primary input format for the authoring MCP tools
(`create_puzzle_draft`, `save_puzzle_draft` / `replace_puzzle_draft`). It's a
flat JSON shape purpose-built for a chatbot to write directly, with no
JSON-LD envelope and no dual identity fields to keep in sync by hand.

`document` in those tools accepts this format by default. Supplying a
document that already has a top-level `@context` switches to full
[JSON-LD](./JSON-LD.md) instead -- no separate flag, the shape itself is the
signal.

## Why this exists

JSON-LD requires every cluster and bridge to carry two independently-typed
identity fields: a bare `id` slug, and an `@id` that must be byte-identical
to `"#" + id`. An author (human or AI) has to notice and maintain that
agreement by hand. In practice it kept drifting -- five published puzzles
shipped with a cluster `id` missing a prefix its `@id` fragment already had,
caught only when a validator fix (added for an unrelated reason) started
flagging real, pre-existing content.

This format doesn't ask for `@id` at all. A cluster or bridge has exactly one
identity field, `id`; the fragment identifier JSON-LD needs internally is
always derived as `"#" + id` on export (`modules/puzzleJsonLd.js`), never
independently authored, so there's nothing left to disagree.

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

This compiles, deterministically, to exactly the JSON-LD document a hand-authored
equivalent would produce -- cluster `@id`s, bridge id derivation via
`stableLocalIds()`, the full envelope -- by converting through the same
internal puzzle shape every built-in puzzle module already uses, then the
existing `puzzleToJsonLd()` exporter. Nothing downstream (validation,
preview, publication) can tell the difference.

## Field reference

**Puzzle** — `id`, `title`, `category` required. `categories` (array, primary
first), `subcategories` (`{categoryName: subcategoryId}`), `tags`, `large`,
`info` (string, or `{text?, link?, extraLink?, citations?}`),
`generativeAssistance` (see `get_authoring_guidance` for when to set this) are
optional. Two to six `clusters`, zero or more `bridges`.

**Cluster** — `id`, `name`, `fact` required. `seeds`: exactly two terms.
`floatingTerms`: one to four more terms, disjoint from `seeds`. Together
these become the cluster's three-to-six term list. `color` is one of `teal`,
`blue`, `amber`, `magenta`, `olive`, `brown`, `cyan` and auto-assigned,
collision-free, when omitted. `termInfo` (`{term: infoValue}`) and `info` are
optional.

**Bridge** — `term`, `clusters` (exactly two cluster `id`s from this
document), `fact` required. `id` is optional -- derived from `term` when
omitted, the same way every bridge without an explicit id already works.
`info` is optional.

**Lens** (optional, `lenses[]`) — `id`, `prompt`, `explanation`, `targets`
(three to six term or bridge names) required. This covers sequential-mode
lenses only; see below for assignment/quiz.

## Still requires JSON-LD

Real runtime features with no representation in this format yet -- author
these via full JSON-LD instead:

- Three-cluster (ternary) bridges, and bridge `direction`, `idealTerms`,
  `conceptId`, `relationKind`.
- Assignment- or quiz-mode lenses (`lensMode`, `preSolve`, and lens
  `options`/`reasons`/`label`/`definition`/`color`).
- `relatedPuzzles`.
- `learningIntroduction`.

A puzzle needing any of these can still be authored end to end with a
hand-written JSON-LD `document` -- this format is an additional primary
input, not a replacement for JSON-LD's expressiveness.

## Validation layers

1. Shape: `modules/simplifiedPuzzleSchema.js`'s zod schema (required fields,
   cardinality, no unrecognized keys). A draft saved with input that fails
   this check is stored exactly as given, not rejected -- consistent with
   drafts generally being allowed to stay temporarily invalid between saves.
   `validate_puzzle_draft` then reports these as plain, field-scoped
   messages, not JSON-LD-profile errors.
2. Conversion: `puzzleFromSimplified()` resolves bridge cluster references,
   assigns colors, and produces the internal puzzle shape.
3. Everything JSON-LD-authored content already goes through: the JSON-LD
   profile, then the shared semantic rules in `modules/contentValidation.js`
   (node-count cap, color uniqueness, duplicate terms, lens target
   existence, and the rest) -- see [JSON-LD.md](./JSON-LD.md#validation-layers).
   This format only replaces the authoring shape, not the rules a puzzle has
   to satisfy.
