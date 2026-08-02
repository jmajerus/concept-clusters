# Authoring a puzzle

Puzzles are plain data, one file per puzzle under `puzzles/<category>/`
(e.g. `puzzles/science/energy-flow.js`), each `export default`-ing a
single puzzle object. To add one: create a new file in the category
directory it belongs to (or a new directory, for a new category), then
import it and add it to the `PUZZLES` array in `puzzles/index.js` —
array order there is puzzle-picker order (reordering is harmless; a
puzzle is addressed everywhere else, including `?puzzle=` share links,
by its own `id` string, never by array position). No other game-code
changes are required. After editing, run:

```
node validate.mjs
```

It checks the schema rules below automatically (term/seed counts, no
duplicate or bridge/cluster-term collisions, `idealTerms` pointing at
real terms, valid binary bridge topologies, Concept Lens targets and
reason keys, and that every cluster ends up connected — see "Bridges
must connect everything" below) and exits non-zero on failure.

## Schema reference

```js
{
  id: "unique-string",          // used internally; not shown to players
  title: "Shown to the player",
  category: "Science",          // groups puzzles into <optgroup> sections
                                 // in the picker, and into a shared
                                 // ?category= overview screen; reuse an
                                 // existing category to add to that
                                 // group, and see puzzles/categories.js
                                 // + "Category info" below to give the
                                 // group itself a blurb/link
  large: true,                  // optional, see "Puzzle size" below
  info: { link: "wiki:Puzzle Topic" }, // optional, see "Puzzle info &
                                 // links" below
  relatedPuzzles: {             // optional, see "Related puzzles" below
    info: { text: "What this whole set of puzzles has in common." }, // optional
    entries: [ {
      id: "another-puzzle-id",
      via: ["shared-concept-id"], // optional, informal -- see below
      reason: "One sentence: why a player who just finished this one might want that one next."
    } ]
  },
  lenses: [ {                   // optional post-solve rounds; see
                                 // "Concept Lenses" below
    id: "direct-evidence",
    prompt: "Which concepts can function as evidence cited directly from the text?",
    targets: ["term1", "term4", "bridge term"], // 3–6 real node words
    explanation: "Why this cross-cutting set belongs together.",
    reasons: { term1: "Why this particular term qualifies." } // optional
  } ],
  clusters: [ /* 2–6 of these; total-node cap is the real limit */ {
    name: "Revealed on completion",
    color: "teal",              // "teal" | "blue" | "amber" | "magenta" | "olive" | "brown" | "cyan"
    fact: "One-line teaching payoff shown when the cluster completes.",
    terms: ["term1", "term2", "term3"],   // 3–5 recommended
    seeds: ["term1", "term2"],            // exactly 2, pre-connected
    termInfo: {                 // optional, see "Term info & links" below
      term1: "One-line definition, shown to the player on hover/tap."
    },
    info: { link: "wiki:Cluster Article Title" } // optional, see
                                 // "Cluster info & links" below
  } ],
  bridges: [ /* 0–3 of these */ {
    term: "bridge term",        // must NOT appear in any cluster's terms
    conceptId: "shared-concept-id", // optional, see "Related puzzles" below
    clusters: [0, 1],           // 2 normally; [0, 1, 2] in the ternary pilot
    relationKind: "dynamic",    // optional, see "Bridge relation kinds" below
    direction: { kind: "through", from: 0, to: 1 }, // optional, binary only
    fact: "Explains WHY it spans both — the key teaching moment.",
    idealTerms: ["term1", null], // optional; one entry per clusters item
    info: "One-line definition" // optional, same shape as termInfo above
  } ]
}
```

## Design rules

These are deliberate; preserve them unless there's a real reason not to
(see the README's "Design brief" for the reasoning behind each one).

- **No trap words.** Every term belongs unambiguously to its declared
  cluster(s). Ambiguity is noise, not challenge — the difficulty should
  come from knowing the concepts, not from disambiguating wordplay.
- **Seed pairs are the orienting clue.** Pick the two most instantly
  recognizable terms as seeds; leave the least obvious term as the
  "aha" the player has to work out.
- **Bridges are the relationship layer.** Use them to encode a real
  conceptual connection between two clusters, not to trick the player.
  If you can't find a genuine connection between two clusters, it's
  fine to leave that pair unbridged (see below) rather than manufacture
  one.
- **Bridges must connect everything.** Once all of a puzzle's bridges
  are counted, every cluster should end up in a single connected
  component — the physics simulation is built to pull the finished
  graph into "one integrated body of knowledge," not separate islands
  (see the README's "Design brief"). `validate.mjs` checks this.
  With only 2–3 clusters this usually falls out naturally; with 4,
  make sure your bridges don't leave one cluster stranded (a bridge to
  its next-most-related neighbor is usually enough — it doesn't need
  to touch every other cluster).
- **A hover/info surface never silently changes what it says.** Once a
  player has read something on a given hover panel, a later hover
  shouldn't make that same spot say something different with no
  obvious, attributable cause — there's no genre convention here that
  trains players to expect that, so discovering it anyway reads as the
  game contradicting itself, not as a feature (in the worst case, it
  can feel like the game is gaslighting the player about what they
  just read). If a piece of content is meant to be gated behind an
  achievement, give it its own separate, permanent surface instead of
  swapping it into a spot that already said something else — see how
  `info.text` (always shown) and `fact` (its own fact-card, never
  shown in the hover panel even after being earned) deliberately stay
  out of each other's way in "Cluster info & links" below.

## Ideal bridge terms

A bridge's `idealTerms` field names the specific term within a cluster
that the bridge conceptually connects to best — e.g. the `veto` bridge
connects to Roman Republic, and `tribunes` is the actual answer, not
`Senate` or `consuls`.

Connecting to **any** completed node in the right cluster still counts
as correct — this is never enforced or rejected, since requiring one
specific term would recreate the exact trap-word guessing game the
"no trap words" rule exists to avoid (now between cluster-mates
instead of within a cluster). Landing on the named term just adds a
bit of extra praise in the feedback message and a highlighted link.

Only add an `idealTerms` entry when a term is *genuinely* the best
fit — usually because you'd naturally name it when writing the
bridge's `fact` (e.g. "Roman **tribunes** invented it..."). Many
bridges are honestly whole-cluster relationships with no standout
term (e.g. `melting point` bridging Solid/Liquid — no single term
among `crystal`/`rigid`/`fixed shape` is more "melting-point-related"
than another). Leave the field, or either entry, `null` in that case
rather than force a false precision.

For an experimental ternary bridge, `idealTerms` has three entries in
the same order as `clusters`. The same rule against false precision
applies: omit the field rather than manufacture three privileged terms.

## Term info & links

Any term or bridge can optionally carry a short definition, shown to
the player on hover (desktop) or tap (all devices, and the only way
this reaches touch screens, which have no hover) — a small dot marks
which nodes have one, so players know where it's worth trying. Add it
only where the cluster's own `fact` doesn't already make the term's
meaning clear on its own; not every term needs one.

The simplest form is a plain string:

```js
termInfo: {
  chlorophyll: "The green pigment in plant cells that absorbs light energy for photosynthesis."
}
```

This automatically adds a "Search ↗" link to Wikipedia for that exact
term. When the auto search would land on the wrong or an ambiguous
page — a plural whose article is titled in the singular, a term with
an unrelated common meaning — use the object form instead:

```js
termInfo: {
  mitochondria: {
    text: "The organelle where cellular respiration happens.",
    link: "wiki:Mitochondrion"
  }
}
```

`link` replaces the auto search entirely and remains the best single
starting point or defining reference. `linkLabel` can give that primary
source a specific visible name. Additional references belong in the ordered
`seeAlso` list:

```js
termInfo: {
  "lateral reading": {
    text: "A verification habit of jumping to outside sources to check a site's credibility, rather than staying on the page and evaluating it in isolation.",
    link: "wiki:Media literacy",
    seeAlso: [
      {
        href: "https://www.poynter.org/fact-checking/media-literacy/2023/lateral-reading-the-best-media-literacy-tip-to-vet-credible-sources/",
        label: "Poynter guide to lateral reading"
      }
    ]
  }
}
```

A `seeAlso` entry may be a string, which receives an automatic label, or a
`{ href, label }` object. Preserve editorial order and add a source only when
it contributes a distinct authority, perspective, example, or level of
analysis. There is no hard maximum, but ordinarily use no more than three.
The legacy `extraLink` field remains valid and is normalized as the first
see-also entry; new content should use `seeAlso`.

As with any link, verify a candidate source actually exists and is genuinely
on-topic before adding it (fetch the page, don't rely on a plausible-looking
title or memory). `check-wiki-links.mjs` verifies `wiki:` targets in the
primary and supplementary fields, but non-Wikipedia URLs still require manual
verification. See [INFO-LINKS.md](INFO-LINKS.md) for the complete shape.

`link`, string `seeAlso` entries, and object `seeAlso[].href` values
accept two forms:

- **`"wiki:Article Title"`** — shorthand for a verified Wikipedia
  article, the common case. Use the article's exact title; spaces are
  fine, no need to underscore or encode anything by hand.
- **`"https://..."`** — a full URL, for anything not on Wikipedia.

`npm run validate` flags a link that's neither of those — almost always a
forgotten `wiki:` prefix, which would otherwise silently render as a
broken link at runtime instead of failing loudly at authoring time. It
also flags a `termInfo` key that doesn't match one of that cluster's
own terms, the same kind of typo that would otherwise fail silently
(the entry just never shows).

That only checks the *shape* of a link, not whether it actually goes
anywhere — a `wiki:` title can still be a typo of a real article, and
a term with no `termInfo` at all falls back to an auto-generated
search link that might not find an exact match, or worse, might land
on a Wikipedia disambiguation page (a list of unrelated things sharing
a name — "ATP" is also a tennis tour, "Angles" is primarily the
Anglo-Saxon tribe). Run `npm run check-wiki-links` to verify every
referenced title — curated or auto-generated — against Wikipedia
itself (see [DEVELOPMENT.md](DEVELOPMENT.md#testing) for details);
it's not part of `validate.mjs` since it needs network access.

**Every term should end up with an explicit `link`, not the implicit
auto search — but only once it's actually verified, not just present.**
A bare auto search means nobody has checked where it goes; a `link`
that exists and isn't a disambiguation page *sounds* checked, but
`check-wiki-links.mjs` only confirms the title resolves to *some* real
article, not that it's the *right* one. "consumers" once linked to
`wiki:Consumer` — a real, unambiguous, entirely wrong article (the
economics sense: a person who buys goods) instead of `wiki:Consumer
(food chain)`, the ecology one the puzzle actually means. Both
"meter" and "consuls" had the same failure: a real article existed
under the plain common-word title, just not the one the puzzle
context needed (the SI unit instead of poetic metre; a modern
diplomatic posting instead of the Roman Republic office). None of
these were caught by the tool, because there was nothing wrong to
catch by its definition of wrong.

**A confidently-wrong direct link is worse than an honest auto
search.** The auto search at least fails visibly (it lands on results,
not a specific claim); a wrong `link` fails silently and looks
authoritative while doing it. So: if a title is short, a common
English word, or plausibly has an unrelated everyday meaning (person,
place, thing, unit, whatever), don't stop at "the tool didn't flag
it" — actually open the article (or fetch a short extract) and confirm
its subject matches what the term means *in this puzzle's context*
before writing the link down. If you can't verify it, leaving the term
on auto search is the honest fallback, not a failure to fix later.

A `link` with no `text` is completely valid for this — see "Link-only
overrides" below — so committing to a verified explicit link never
requires writing a definition you don't have yet:

- **Zoom out to the containing topic**, when the term itself is too
  specific/descriptive to have its own article. "fixed shape" doesn't
  have its own article, but `wiki:Solid` does and explains exactly why
  solids have one. "standardized weights" zooms out to
  `wiki:Indus Valley Civilisation`, which covers that civilization's
  weight system directly. "14 lines" zooms out to `wiki:Sonnet`.
- **A dictionary, for something too small to have an article at all.**
  If even a broad topic doesn't exist and the term is really just a
  phrase that needs defining rather than a concept worth an
  encyclopedia entry, link to an open dictionary (e.g. Wiktionary)
  instead — a plain `"https://..."` URL, since the `wiki:` shorthand
  is Wikipedia-specific. Renders as "Learn more ↗" rather than
  "Wikipedia ↗", same as any other non-Wikipedia link.
- **Otherwise, commit to the title the auto search would already find**
  — most terms genuinely do have a clean, single matching article; the
  point isn't to always find something more specific, it's to stop
  leaving it to a runtime redirect to discover that. `wiki-link-cache.json`
  (built by `check-wiki-links.mjs`) records each checked title's
  `resolvedTitle` — the exact article it resolves to — but treat that
  as a candidate to confirm, not an answer to copy: `resolvedTitle` is
  exactly what told us "consumers" resolves cleanly to `Consumer`, and
  it does — just not the sense that means anything here. Read what the
  article is actually about before using it, especially for a term
  that's also an ordinary English word.

## Link-only overrides

`link` doesn't require `text` alongside it:

```js
termInfo: {
  sunlight: { link: "wiki:Sunlight" }
}
```

Use this whenever you're confident in the destination but don't have
(or don't need) a hand-written definition — the info-dot only appears
for nodes with `text`, so a link-only override stays invisible in the
UI. It fixes the link without adding a dot that would falsely promise
a note. This is the normal way to eliminate a bare auto search for a
term whose meaning is already obvious from its cluster's `fact` — no
need to invent a definition just to attach a verified link.

Fixing a flagged miss is, on its own, reason enough to add a
`termInfo` entry even for a term whose meaning is already clear from
the cluster's `fact` — the payoff there isn't clarity, it's giving the
player a specific page to click through to instead of a bare search.
That's a different bar than the one for adding `termInfo` in the first
place (still: only when the `fact` alone doesn't already cover a
term's meaning); it just also applies once you're already looking at a
miss.

The player-facing label is derived from where the link actually goes,
not which field produced it, so it stays accurate even if a term ends
up with both `link` and `extraLink` set: the auto search always says
"Search ↗", any Wikipedia article says "Wikipedia ↗" (either field,
any language edition), and anything else says "Learn more ↗".

A bridge's own `info` field works exactly the same way, one level up
— directly on the bridge object rather than nested under a term name,
since a bridge is a single term rather than a map of several. See
`oxygen` in the first puzzle (`energy-flow`) for a plain-string example.

## Cluster info & links

A cluster can carry an `info` field too, one level up from a bridge's
— same shape, same rules, same `wiki:`/full-URL/`check-wiki-links.mjs`
verification story as everything above. It exists for a reason
specific to clusters, though: a cluster's `name` is usually a real,
citable topic in its own right — "Photosynthesis", "Fundamental
forces of physics" — and often a *richer* Wikipedia article than any
single term inside it, which is worth surfacing on hover in Star mode
(the title node) and Circle mode (the heading), the same info-dot/hover
mechanic terms already use.

`info` and `fact` are independent, and stay independent even after the
cluster is completed:

```js
info: {
  text: "How plants convert light into chemical energy.",
  link: "wiki:Photosynthesis"
}
```

- **`info.text`/`info.link`/`info.extraLink`** all show on hover from
  the moment the puzzle loads, regardless of completion state — none of
  it is spoiler-gated. **`info.text` is real, live content a player can
  read before finishing the cluster, so keep it non-spoiling on
  purpose** — a plain, dictionary-style definition of the topic that
  never names any of the cluster's own terms is the safe shape; naming
  a term (or something close enough to give one away) undermines the
  same "no trap words" challenge `fact` itself is already careful not
  to spoil. Optional, same as everywhere else — a cluster with no
  authored `info.text` just shows nothing on hover beyond the name and
  whatever link is available.
- **`fact`** stays exactly what it's always been — a completion
  *reward*, shown once as its own fact-card (`addFactCard` in
  `game.js`) the first time the cluster is fully connected, gated on
  `state.shownClusters` so that's impossible to see early. It never
  appears in the hover panel, even after being earned — deliberately:
  it's already sitting permanently on the page by then, so repeating it
  in a second place would just be noise, and a hover panel whose text
  silently changes mid-play would read as a bug ("didn't this say
  something else a minute ago?"), not a feature.

As with any link, this needs the same verification discipline as
everything above — `check-wiki-links.mjs` now checks every cluster
name alongside every term and bridge (as either a curated `wiki:` link
or, absent one, the auto search the cluster's plain name would
otherwise fall back to), and the same "confidently-wrong beats an
honest auto search" caution applies: don't write down `wiki:` for a
cluster name that's short, common, or plausibly ambiguous without
actually opening the article and confirming it's the topic this puzzle
means, not just that *some* article exists at that title.

**A cluster's `info.link` is also the fallback for any of its own terms
that don't have one.** A term with no `termInfo` entry (or one with
`text` but no `link`) no longer falls straight to a raw word search —
it silently uses its cluster's `link` instead, the same "zoom out to
the containing topic" move used by hand elsewhere in this doc (`wiki:
Solid` for "fixed shape", `wiki:Indus Valley Civilisation` for
"standardized weights"), just automatic now that every cluster has a
verified link of its own. This only inherits `link` — a term's `text`
and `extraLink` still have to be authored per-term, since a cluster's
blurb (if it ever has one) describes the whole cluster, not any one
term inside it, and `extraLink` is a curated bonus resource specific to
whatever it was actually written for. Bridges are excluded, since a
bridge belongs to two clusters and picking one as "the" fallback would
be arbitrary — an unauthored bridge still falls straight to a raw
search on its own word. Because of this, `check-wiki-links.mjs`'s
"no exact page" report no longer flags a term whose cluster already has
a link (it's already covered by that cluster's own check) — it's
reserved for terms in a puzzle whose cluster hasn't been curated yet.

## Puzzle info & links

A puzzle itself can carry an `info` field, same `{ text, link, extraLink }`/
`wiki:` shape as everywhere else:

```js
info: { text: "How energy moves through living systems, from sunlight to decomposers.", link: "wiki:Bioenergetics" }
```

Unlike a cluster (which skips `text` because `fact` already plays that
role), a puzzle has no other reveal mechanism for a top-level
description — there's nothing else that ever explains what a puzzle as
a whole is about — so `text` is genuinely useful here, not redundant.
It's shown as a permanent one-line subtitle under the puzzle's title
(`#puzzle-info` in `game.js`), visible from the moment the puzzle
loads, not hover-gated or completion-gated the way term/cluster info
and cluster `fact` are — describing a puzzle's topic doesn't spoil
anything about how to solve it. When absent, the subtitle simply
doesn't render at all, the same graceful-degradation behavior as every
other optional `info`.

## Related puzzles

A puzzle can optionally list other puzzles worth playing next. They are
shown to the player once *this* puzzle is fully complete—including its
Concept Lenses, when present—and are directly navigable: clicking one
loads it immediately, with no picker-hunting required. See "Sharing a
group: the overview screen" in [DEVELOPMENT.md](DEVELOPMENT.md). The
field is `{ info, entries }`, not a bare array — `info` describes the
*set itself*, `entries` is the actual list:

```js
relatedPuzzles: {
  info: { text: "Recognizing manipulation across media types." }, // optional
  entries: [
    {
      id: "quotations-and-attribution",
      via: ["provenance", "authentication"],
      reason: "Compare attribution of words with authentication of synthetic images, audio, video and documents."
    }
  ]
}
```

- **`entries[].id`** must be a real puzzle id (`validate.mjs` checks
  this, and that a puzzle never lists itself).
- **`entries[].reason`** is required and is exactly what the player
  sees under the target puzzle's title — write it as a reason to
  click, not a description of the target puzzle in isolation.
- **`entries[].via`** is informal today, not a formal registry — a
  plain list of words naming the shared thread, for your own and other
  authors' benefit skimming the data later. It is *not* validated
  against real `conceptId`s (see below); most current `via` entries
  don't have one.
- **`info`** is optional and, unlike an entry's `reason` (which is
  about one specific *other* puzzle), describes the whole set as one
  thing — same `{ text, link, extraLink }`/`wiki:` shape as everywhere
  else. Shown as this puzzle's own "Related puzzles" subtitle, and
  reused as the subtitle when this puzzle's set is shared and reopened
  as an overview (`&puzzles=...` — see "Sharing a group" in
  [DEVELOPMENT.md](DEVELOPMENT.md) for how the *first* id in a shared
  list is treated as the "anchor" whose `relatedPuzzles.info` applies).

This relationship is a directed edge, not a symmetric pair — puzzle A
listing B doesn't require B to list A back. Keep it that way rather
than force reciprocity everywhere; a puzzle can be a reasonable "next
step" from several others without all of *those* being equally good
next steps from it.

Order within `entries` is mostly free — the overview screen this drives
is a module list to choose from, not a locked sequence — with one
exception: `entries[0]` is what a returning visitor lands on by default
after finishing this puzzle and later returning to the site with no
specific link (see "Default landing" in
[DEVELOPMENT.md](DEVELOPMENT.md)). Put whatever's genuinely the best
next step first if that matters to you; it's a light nudge, not a
locked path — the player can still pick any other entry, or any other
puzzle entirely, at any time.

A bridge can optionally carry a matching `conceptId` — a plain string,
shared across the bridges (in different puzzles) that represent the
same underlying concept:

```js
// In both puzzle A and puzzle B's bridges array:
{ term: "provenance", conceptId: "provenance", ... }
```

This is what makes a `via` entry more than a label when it's used —
"provenance" naming a real, shared bridge concept in both puzzles,
not just a word that happens to appear in each. It's optional and
currently under-used (only "provenance" is tagged this way as of this
writing); adding it is worthwhile whenever two puzzles' bridges really
are the same concept, but there's no expectation every `via` entry
gets one.

## Bridge relation kinds

A bridge can optionally carry a `relationKind`, naming what kind
of connection it is:

```js
{ term: "negative feedback", relationKind: "dynamic", ... }
```

**Classify the connection the bridge's `fact` describes, never the
term in isolation.** `{ term: "oxygen", relationKind: "dynamic" }`
doesn't claim oxygen itself is a process — it says the fact describes
oxygen moving between the two clusters. Six values are valid —
`validate.mjs` enforces this — the result of two revisions after a
full-catalog pilot pass (see `docs/Bridge Role Annotation.md` for the
complete history and classification table) surfaced gaps in earlier,
narrower versions:

- **`dynamic`** — one cluster affects, regulates, moves into, transforms,
  exchanges with, or constrains the other.
- **`foundation`** — both clusters depend on, or are partly built from,
  the same underlying thing.
- **`cross-cutting`** — the same concept, pattern, practice, or device
  shows up meaningfully in both clusters — independently, or serving a
  different function in each — without implying dependency, causation,
  inheritance, or disagreement between them.
- **`contrast`** — the clusters disagree about, or interpret
  differently, the bridge concept.
- **`continuity`** — a practice, institution, form, or idea is
  inherited, transmitted, adapted, or echoed across time or traditions.
- **`evaluation`** — the bridge connects evidence or claims with a
  practice used to test, validate, contextualize, or interpret them.

Leave it unset unless a bridge clearly fits one of these six — this is
not meant to reach full coverage, and an unset value never implies a
weaker or incomplete bridge. Don't rewrite a bridge's `fact` just to
force a classification: the fact is the primary teaching content,
`relationKind` is secondary metadata layered on top of it. The pilot
pass left a handful of genuinely split bridges (`markets`, `agreement`,
`phrase`, `free will`, `sample`) unset for exactly this reason —
resolving them later through independent review is fine; stretching a
definition to cover them now isn't.

`contrast` and `cross-cutting` are the two easiest to blur together —
both can involve two clusters treating the same concept "differently."
The practical test:

```text
Do the clusters oppose one another about this concept
(disagree, offer competing explanations, take opposing positions)?
    Yes -> contrast

Does the concept simply recur, function differently, or invite
different questions across the clusters, without either side
actually contradicting the other?
    Yes -> cross-cutting

Still unclear?
    Leave relationKind unset
```

**`relationKind` is a small, optional pedagogical facet, not an
ontology of the bridge term.** It exists to help a player notice how a
bridge is functioning in *this* puzzle, not to formally classify what
kind of thing negative feedback or oxygen "really is" -- that's a much
larger and, for this project, unnecessary undertaking (see "Where this
sits relative to formal knowledge-representation work" in `docs/Bridge
Role Annotation.md` if the distinction matters to you). Don't add a
finer-grained predicate field alongside it, however tempting a specific
borderline bridge makes that feel -- it would recreate exactly the
duplicate-authoring, spoiler-risk problem `relationKind` itself was
already revised twice to avoid (see that same doc). If a bridge is
genuinely ambiguous, leaving it unset is the intended outcome, not a
gap to close.

## Bridge direction

A binary bridge can optionally assert a meaningful topology:

```js
{
  term: "afferent pathway",
  clusters: [0, 1],
  direction: { kind: "through", from: 0, to: 1 },
  ...
}
```

Five relationships are available:

| Kind | Completed path | Meaning |
| --- | --- | --- |
| omitted or `undirected` | `A — X — B` | Connection only; no direction asserted |
| `through` | `A → X → B` | Flow, influence, or development from A toward B |
| `bidirectional` | `A ↔ X ↔ B` | Reciprocal influence or exchange |
| `outward` | `A ← X → B` | The bridge supplies, shapes, or produces both sides |
| `inward` | `A → X ← B` | Both sides converge to produce or explain the bridge |

For `through`, `from` and `to` are explicit cluster indices, and both
must occur in the bridge's `clusters` array. Do not infer direction
from that array's order: the order already aligns entries in
`idealTerms`, and an editing reorder should not silently reverse the
conceptual claim. The other directional kinds apply symmetrically to
both arms and therefore do not take `from` or `to`.

Add `direction` only when reversing it would make the bridge's `fact`
false or materially change its meaning, or when the inward/outward
distinction reveals a real convergence or common source. Read the
bridge fact as a miniature diagram: which arrow arrangement does that
sentence actually describe? Direction may describe flow, influence,
transformation, regulation, exchange, or consequence; it does not have
to claim simple deterministic causation.

Omitting `direction` means that no direction is asserted. It does not
claim reciprocal arrows. Prefer omission over explicitly authoring
`{ kind: "undirected" }`; the explicit form is accepted only so the
topology vocabulary remains complete. Shared foundations, contrasts,
and intentionally unspecified connections should normally remain
undirected. Use `bidirectional` only when the fact actually describes
reciprocal influence or exchange.

Direction and `relationKind` are independent. A `dynamic` relationship
may be directed, reciprocal, or cyclic, while a collection of directed
bridges may form a larger sequence or feedback loop. The current schema
supports direction only on binary bridges. Ternary relationships can
represent several different structures and should remain undirected
until a richer schema is justified.

## Concept Lenses

`lenses` adds an optional learning phase after the map is solved. Each
round asks the player to reclassify terms across the completed map using
a different attribute. Ordinary and bridge terms can be targets; cluster
titles cannot. The solved layout remains fixed while the player selects
terms, checks the answer, and reads the explanation.

```js
lenses: [
  {
    id: "requires-outside-context",
    prompt: "Which concepts require knowledge beyond the text itself?",
    targets: [
      "historical setting",
      "genre",
      "intended audience",
      "contextualization"
    ],
    explanation:
      "These concepts situate the work in circumstances not fully contained in its words and form.",
    reasons: {
      "historical setting": "Historical conditions come from evidence outside the work.",
      "contextualization": "This practice explicitly relates the work to outside circumstances."
    }
  }
]
```

### Choose the lens's purpose deliberately

A lens can serve more than one teaching purpose:

- A **reinforcing lens** examines an important distinction within one
  cluster. It may be dominated by that cluster, but should do more than
  restate the cluster title.
- A **hybrid lens** begins with a cluster-centered idea and follows its
  consequences into other clusters, where those additional terms extend,
  qualify, or complicate the original idea.
- A **cross-cutting lens** reveals a genuinely different way to organize
  the completed map. Its targets should draw meaningfully from several
  clusters, so the answer cannot be found simply by selecting one cluster
  color.

These are authoring purposes, not schema types, quotas, or quality grades.
A puzzle may use more than one kind. In particular, a rule such as “no
cluster supplies more than half the targets” would mistakenly reject
worthwhile reinforcing and hybrid lenses. Instead, ask:

- Could a player answer mostly by selecting one existing cluster?
- If so, is that concentration the intended lesson, or would a more
  orthogonal prompt reveal a stronger secondary pattern?
- Do bridge targets add genuine meaning? Because a bridge touches several
  clusters structurally, its presence alone does not make a lens
  conceptually cross-cutting.

### Matrix-first authoring

For a puzzle intended to showcase cross-cutting lenses, design the primary
clusters and secondary lenses together rather than adding the lenses only
after the cluster puzzle is finished:

```text
Clusters: the primary columns — what kind of concept is this?
Lenses:   the secondary rows — where else does this concept participate?
```

A small authoring worksheet can expose that hidden structure before the
wording is polished:

```text
Node                  Cluster       Lens A   Lens B   Lens C
term one              climate         ✓                ✓
term two              livelihood               ✓       ✓
term three            adaptation      ✓        ✓
```

The matrix does not need to be numerically balanced. Use it to notice
whether:

- a lens exactly or nearly reproduces a cluster;
- two lenses have nearly identical answer sets;
- a few broad nodes appear in almost every round;
- much of the board never participates in the lens phase; or
- a claimed cross-cutting lens depends on bridge membership to span more
  than one cluster without actually revealing a second organizing axis.

One reliable regional or comparative pattern combines:

- **anchor concepts**, which make the profile recognizable;
- **profile components**, drawn from several clusters to make it
  multidimensional; and
- **transfer concepts**, which recur across multiple lenses and create the
  comparative challenge.

Repeated targets can be valuable. A term appearing in two lenses may show
that one practice, process, or condition participates in different
regional or conceptual configurations. Repetition becomes a problem only
when the same rationale makes several rounds substantially redundant.

### Prompt and answer-set review

Apply the same no-trap-words discipline used for the main puzzle:

- Name 3–6 unique targets spanning at least two clusters. Bridge targets
  count as touching every cluster they connect.
- Write a prompt precise enough to support a defensible yes-or-no answer.
  If a knowledgeable player could reasonably defend an excluded term,
  narrow the wording or include it.
- Prefer a meaningful minority of the board. For a reinforcing lens, make
  the distinction more specific than its dominant cluster; for a
  cross-cutting lens, make the pattern meaningfully different from the
  original partition.
- Provide a short teaching explanation. Optional `reasons` may explain
  individual targets; every reason key must also appear in `targets`.

Before finalizing a lens, explicitly review its most plausible exclusions:

```text
Lens:
Decision rule:
Correct targets:
Most plausible excluded nodes:
Why each is excluded:
Does the prompt need narrowing?
```

Broad phrases such as “associated with,” “important to,” “connected to,”
and “known for” often admit more answers than the authored target set.
More bounded formulations—“directly involved in,” “primarily functions
as,” “is a defining feature of,” or “which concepts on this board combine
to characterize”—can make the intended threshold clearer. Avoid wording
such as “most specifically characterize” when the answer deliberately
includes transfer concepts shared with other profiles.

For regional or cultural profiles, scope the claim carefully. Name the
puzzle's subject and, when relevant, its time frame. The explanation
should make clear that the selected concepts form a representative profile
within that scope; they do not define every place, community, livelihood,
or historical period in the region.

### Sequence lenses as a learning progression

Order multiple lenses so the rounds build on one another rather than read
as unrelated quizzes. Useful progressions include:

1. a concrete or observable attribute;
2. a function or process;
3. a cross-cutting comparison or principle; and
4. an interpretive, evaluative, or synthesis distinction.

A sequence may instead follow an argument such as conditions → processes
→ consequences → responses. Later explanations can briefly compare their
answer set with an earlier round, drawing attention to a shared term while
also naming the different context in which it operates.

### Second-order synthesis lenses

A final **second-order synthesis lens** can ask the player to reason about
the preceding lens answers themselves rather than only about the original
clusters. For example:

```js
{
  id: "shared-regional-features",
  prompt: "Which concepts appeared in more than one of the preceding regional profiles?",
  targets: [
    "terraced farming",
    "irrigation",
    "transhumance",
    "seasonality"
  ],
  explanation:
    "These features recur across different profiles. Their recurrence reveals comparison and transfer, not that the regions are interchangeable."
}
```

Use this form only after the source rounds it summarizes, and make its
answer derivable from those revealed sets. It works especially well when
transfer concepts have already appeared in two carefully contrasted
profiles. The explanation should state what the recurrence teaches and
why sharing a feature does not erase the larger differences between the
profiles.

### Soft authoring diagnostics

Treat target distribution as evidence for review, not as an automatic
quality score. Useful diagnostics include:

- target count by cluster;
- exact or near-exact matches between a lens and a cluster;
- pairwise overlap between lens answer sets;
- nodes selected by no lens;
- nodes selected by nearly every lens;
- bridge targets whose structural arity supplies most of the apparent
  cross-cluster coverage; and
- the most plausible excluded nodes for each prompt.

Do not impose arbitrary balance requirements. The question is whether the
observed distribution serves the declared purpose of the round and whether
the complete sequence reveals a useful secondary structure.

`validate.mjs` enforces the structural rules, including unique ids, real
node targets, target count, cross-cluster coverage, and valid reason keys.
The conceptual defensibility of the answer set, the purpose of the lens,
and the quality of the matrix remain authoring judgments.

## Ternary bridges (experimental)

A bridge may name three cluster indices when one relationship is
genuinely collective and pairwise decomposition would change its
meaning:

```js
{
  term: "Borromean knot",
  clusters: [0, 1, 2],
  fact: "The relationship belongs to the three-part structure, not to any isolated pair."
}
```

This is a constrained pilot:

- `validate.mjs` accepts bridge arity 2 or 3, not arbitrary larger
  hyperedges.
- A ternary bridge completes only after one connection to each of its
  three clusters.
- After its first connection, feedback reports progress as `1 of 3`,
  `2 of 3`, and so on. Arity is not revealed while the node is untouched.
- `relationKind`, when present, classifies the one collective relation
  described by `fact`. Do not assign a different kind to each leg.
- `direction` is not supported for ternary bridges; leave it unset
  rather than forcing a multi-source or multi-destination relationship
  into the binary shape.
- Prefer at most one ternary bridge in an experimental puzzle. Every
  additional connection should add understanding rather than repeat an
  already-obvious answer.

Use a ternary bridge only when removing any one participating cluster
materially changes the concept. If the fact is really three separate
pairwise explanations, author three binary bridges instead. If the
connection merely summarizes an already-solved board and repeated taps
would add little, use a synthesis explanation rather than a game piece.

See `docs/N-ARY-BRIDGE-PILOT.md` for the experiment's scope and
playtesting questions.

## Category info

A category isn't part of any single puzzle file — it's just the
`category` string several puzzles happen to share — so its own `info`
lives in a separate registry, `puzzles/categories.js`, keyed by that
exact string:

Catalogue membership is managed separately from puzzle authorship and
category metadata. See [CATALOGUES.md](CATALOGUES.md) when a puzzle
should be added to a curated Library collection.

```js
// puzzles/categories.js
export const CATEGORIES = {
  "Science": {
    info: { text: "Where things come from and how they work.", link: "wiki:Science" }
  }
};
```

`info` is the same shape and rules as everywhere else. Shown as the
subtitle on that category's overview screen (`?category=<slug>` or the
Library's All Puzzles catalogue — see "Sharing a group" in
[DEVELOPMENT.md](DEVELOPMENT.md)). Registering a category here is
entirely optional and doesn't make it "more real" — any string a
puzzle uses for `category` is already a valid, working category on its
own; an unregistered one's overview simply shows no subtitle.
`validate.mjs` checks two things about this file specifically: every
registered entry's `info` shape (same as any other `info`), and that
every registered name is actually used by at least one puzzle's
`category` field (almost always a typo on one side or the other,
otherwise).

An entry can also set `slug`, e.g. `{ slug: "sci", info: {...} }` — what
a `?category=` link actually encodes for this category, in place of the
auto-derived one `categorySlugFor` (same file) would otherwise fall
back to. Auto-derived is enough on its own for a clean URL and needs no
authoring at all; the only reason to set one explicitly is to *pin* it,
so the link keeps working even if this category's display name (the
object key itself) is later reworded — the same reason a puzzle's `id`
stays separate from its `title`. `validate.mjs` also checks that no two
categories in use resolve to the same slug, registered or auto-derived.

## Puzzle size (`large`)

`large: true` marks a puzzle for the bigger board: a 960×620 viewBox
and a wider page layout (`.wrap.wide` in `styles.css`), instead of the
standard 640×460. It only affects rendering — the puzzle still lives
in its normal `category` group, and the flag is purely about node
count/board size, not conceptual difficulty (a puzzle can be large and
introductory, or small and conceptually hard — don't conflate the two
axes). It's shown with a "(Large)" suffix in the picker and a small
badge next to the title.

The wide layout only actually widens things on a viewport with room
for it — a `large` puzzle falls back to the standard, more cramped
640×460 space on a small screen automatically (see `game.js:
loadPuzzle`). You don't need to do anything for this to work correctly.

`large` isn't the only thing that requests the wide board, though —
Circle and Star modes always do, on *any* puzzle, regardless of this
flag (`applyBoardSize` in `game.js`). Both need more room than Graph
mode's per-term layout for reasons that have nothing to do with node
count: Circle mode draws containers as well as the terms inside them,
and Star mode routes every connection through a cluster's title hub
rather than point-to-point, so a bridge fans two lines into two
different hubs instead of one. Graph mode never requests it on its own
— its layout stays comfortable at the standard size regardless — which
is deliberate: it's the one mode that works on every puzzle on the
narrowest screen too small to fit the wide board at all, so switching
to it (not a puzzle-by-puzzle size metric) is the answer for that
visitor.

**`validate.mjs` enforces this directly**, not just as guidance: total
nodes (every cluster's terms, plus every bridge) is capped at 16
without `large`, 24 with it. Cluster count on its own only has a loose
sanity floor/ceiling now (2–6, mostly a typo guard) — it used to be a
hard cap at 4, but that couldn't tell a puzzle with four dense 6-term
clusters from one with four light 3-term clusters, same cluster count,
very different actual size. The total-node cap is what actually tracks
render load, so it's the real constraint; cluster count and per-cluster
term count are both free to trade off against each other underneath it
however suits the topic — five light clusters (with `large: true`, see
below) is exactly as valid as three heavier ones, if either total fits.

| Total nodes | Fits at |
|---|---|
| ≤16 | standard size (no `large` flag) |
| 17–24 | `large: true` |
| 25+ | rejected by `validate.mjs` — split into `relatedPuzzles` instead |

Both ceilings were calibrated against every puzzle's own actual totals
at the time this was written (normal puzzles topped out at 14; every
existing `large` puzzle happened to be exactly 4 clusters × 4 terms +
3 bridges = 19) — so there's real headroom above anything already
authored, this isn't just barely covering the status quo. If a topic
still doesn't fit at 24, that's the signal to split it into two
`relatedPuzzles`-linked puzzles rather than reaching for a bigger
number here (see "Related puzzles" above) — the total-node cap is
about what one board can hold at once, not about how much a topic is
allowed to say across a whole visit.

## Optional authored Star layouts

The Star-mode pretty-printer is the default for every puzzle. Only a
puzzle whose final presentation still needs editorial placement should
add a custom override.

Open the puzzle locally with both Star and layout-authoring mode selected:

```text
http://localhost:8787/?puzzle=revolutions-modern-world&mode=star&author=layout
```

The authoring panel can prepare the generated solution, after which
dragging a term or cluster title becomes literal placement: the force
simulation stays stopped when the node is released. Drafts are stored in
that browser's local storage and are specific to the puzzle revision and
board dimensions. Local storage is only a workspace, never the published
source of truth.

`Export JSON` is enabled when the solved layout has no line crossings or
overlapping pills. Lines passing through unrelated pills are reported
separately so an author can make a deliberate judgment about minor edge
cases. Import the downloaded file with:

```bash
node tools/import-star-layout.mjs ~/Downloads/revolutions-modern-world-star-layout.json
```

The importer validates the schema, puzzle fingerprint, exact node set,
board bounds, and hard geometry metrics, then writes
`puzzles/layouts/star/<puzzle-id>.js` and regenerates the sparse registry.
Run `npm run validate` and `npm test` before committing.

At runtime, the second `Show solution` click uses a matching repository
layout when one exists. A missing, stale, wrong-sized, or geometrically
unsafe override falls back to the algorithmic pretty-printer. This keeps
custom layout data optional and prevents a puzzle edit from silently
reusing obsolete coordinates.

## Cluster colors

Seven cluster hues are available: `teal`, `blue`, `amber`, `magenta`,
`olive`, `brown`, and `cyan`. Use each at most once within a puzzle. Purple is
reserved for bridges and can't be used for a cluster.

Natural green and red are reserved for success and error feedback,
including Concept Lens results: green reveals correct and missed targets,
while red marks extra selections. Gray remains the unchecked selection
color. Line styles also distinguish these states, so color is never the
only cue. Keeping semantic colors out of the cluster palette prevents the
feedback layer from being confused with the solved map underneath it.
