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
real terms, and that every cluster ends up connected — see "Bridges
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
  clusters: [ /* 2–4 of these */ {
    name: "Revealed on completion",
    color: "green",             // "green" | "blue" | "amber" | "rose"
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

`link` replaces the auto search entirely. `extraLink` adds a second
link *alongside* the auto search rather than replacing it — use it
when there's a genuinely better resource worth surfacing but the plain
search result (or the `link`) is still a fine fallback on its own.
That "better resource" doesn't have to be Wikipedia — a subject's own
critically-acclaimed source is often more valuable than an encyclopedia
entry: Poynter for media literacy terms, say, since it's a leading
authority on fact-checking and runs the program that popularized
teaching "lateral reading" in the first place:

```js
termInfo: {
  "lateral reading": {
    text: "A verification habit of jumping to outside sources to check a site's credibility, rather than staying on the page and evaluating it in isolation.",
    link: "wiki:Media literacy",
    extraLink: "https://www.poynter.org/fact-checking/media-literacy/2023/lateral-reading-the-best-media-literacy-tip-to-vet-credible-sources/"
  }
}
```

As with any link, verify a candidate source actually exists and is
genuinely on-topic before adding it (fetch the page, don't rely on a
plausible-looking title or memory) — `check-wiki-links.mjs` only
verifies `wiki:` targets, so a non-Wikipedia `extraLink` gets no
automated safety net at all.

Both `link` and `extraLink` accept two forms:

- **`"wiki:Article Title"`** — shorthand for a verified Wikipedia
  article, the common case. Use the article's exact title; spaces are
  fine, no need to underscore or encode anything by hand.
- **`"https://..."`** — a full URL, for anything not on Wikipedia.

`validate.mjs` flags a link that's neither of those — almost always a
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

A puzzle can optionally list others worth playing next, shown to the
player once *this* puzzle is fully solved (see "Sharing a group: the
overview screen" in [DEVELOPMENT.md](DEVELOPMENT.md)) and directly
navigable — clicking one loads it immediately, no picker-hunting
required. The field is `{ info, entries }`, not a bare array — `info`
describes the *set itself*, `entries` is the actual list:

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

A bridge can also optionally carry a `relationKind`, naming what kind
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
"Browse puzzles" button — see "Sharing a group" in
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

## Cluster colors

Four hues are available: `green`, `blue`, `amber`, `rose` — plus purple,
which is reserved for bridges and can't be used for a cluster. If a
puzzle needs a 5th cluster, add another hue's tokens to `:root` in
`styles.css` (see the existing `--rose`/`--rose-bg`/`--rose-line`
tokens for the pattern) before using it in a puzzle file.
