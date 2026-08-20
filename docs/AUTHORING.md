# Authoring a puzzle

Puzzles are plain data, one file per puzzle under `puzzles/<category>/`
(e.g. `puzzles/science/energy-flow.js`), each `export default`-ing a
single puzzle object. A puzzle with packaged resources such as a learning
introduction uses `definePuzzle(import.meta.url, { ... })` so its relative
files can be resolved safely; ordinary puzzles need no wrapper. To add one:
create a new file in the category
directory it belongs to (or a new directory, for a new category), then
import it and add it to the `PUZZLES` array in `puzzles/index.js` —
array order there is puzzle-picker order (reordering is harmless; a
puzzle is addressed everywhere else, including `?puzzle=` share links,
by its own `id` string, never by array position). No other game-code
changes are required.

This registration step applies to editing the repo directly. PRs opened
through the hosted MCP authoring server intentionally *omit* the
`puzzles/index.js` change: concurrent puzzle submissions would otherwise
conflict on that shared file, and GitHub doesn't support `merge=union`
for JS import lists. `tools/ensure-puzzle-registry.mjs` runs in CI (so
validation still sees the module) and again, post-merge, via the "Sync
puzzle registry" workflow, which pushes a follow-up commit registering
any module still missing from the array. A new puzzle module on disk
with no matching entry in `puzzles/index.js` is expected on those PRs,
not a bug.

After editing `puzzles/index.js` by hand, run:

```
node validate.mjs
```

For exchanging a complete puzzle—or installing a new one without manually
editing its module and registry—author it in the simplified format (see
[SIMPLIFIED-PUZZLE-FORMAT.md](SIMPLIFIED-PUZZLE-FORMAT.md)), the format the
MCP tools and canonical `content/puzzles/*.ccpuzzle.json` files both use.
`content:import`/`content:export` (see [JSON-LD.md](JSON-LD.md)) still speak
JSON-LD specifically -- portable interchange, not the everyday authoring
path -- so a simplified document needs an explicit export/import round trip
through that format to move through those two commands.

It checks the schema rules below automatically (term/seed counts, no
duplicate or bridge/cluster-term collisions, `idealTerms` pointing at
real terms, valid bridge topologies, and Concept Lens targets and reason
keys) and exits non-zero on failure.

When drafting with AI assistance, settling the domain logic in plain prose
first — clusters and their terms, the pedagogical reason each bridge
exists, diagnostic facts, lens questions — before constructing the
simplified-format document itself tends to work better than iterating on
both at once. Content decisions and schema/validation fixes compete for
attention when made together; a locked blueprint keeps each pass focused
on one job.

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
                                 // + "Categories and subcategories" below
                                 // group itself a blurb/link
  categories: ["Science", "Engineering"], // optional multidisciplinary
                                 // membership; category must remain first
  subcategories: {              // optional and category-relative
    Science: "physics",
    Engineering: "control-systems"
  },
  large: true,                  // optional, see "Puzzle size" below
  tags: ["book"],                // optional, informal -- see "Tags" below
  level: "introductory",         // optional, opt-in -- see "Learning level" below
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
  learningIntroduction: {       // optional pre-puzzle lesson; see
                                 // "Learning introductions" below
    requirement: "recommended", // "optional" | "recommended" | "required"
    title: "Before You Begin",
    summary: "What this short preparation helps the learner notice.",
    estimatedMinutes: 4,
    revision: 1,                // change when prior acknowledgements should expire
    content: {
      src: "./unique-string.intro.md",
      mediaType: "text/markdown"
    },
    sources: [ {
      label: "Source title",
      href: "https://example.org/source"
    } ],
    citations: [ {              // optional formal footnotes; same shape
      title: "Reference title", // as info.citations -- see below
      author: "Author, A.",
      year: "2024"
    } ]
  },
  generativeAssistance: [ {    // optional AI attribution; see
    system: "Claude",           // "Generative assistance" below
    provider: "Anthropic",
    scope: "learningIntroduction",
    role: "drafted",
    date: "2026-08-03"
  } ],
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
    termRole: "connector",      // optional when the bridge term is not itself lesson content
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
  come from knowing the concepts, not from disambiguating wordplay. This
  is hardest to hold to when adapting fiction, memoir, or poetry: a
  source's own vocabulary rarely arrives pre-stabilized the way academic
  terminology does, and coining an evocative but subjective phrase
  straight from the text (`"Ruined Youth"`, `"Living Corpse"`) tends to
  produce exactly the fluid, overlapping boundaries this rule exists to
  prevent. Map to the underlying analytical mechanism instead — a
  narrative device, a psychological pattern, a structural mode the work
  itself is enacting — so the term names something precise and citable
  rather than a mood.
- **Seed pairs are the orienting clue.** Pick the two most instantly
  recognizable terms as seeds; leave the least obvious term as the
  "aha" the player has to work out.
- **Bridges are the relationship layer.** Use them to encode a real
  conceptual connection between two clusters, not to trick the player.
  If you can't find a genuine connection between two clusters, it's
  fine to leave that pair unbridged rather than manufacture one. A
  puzzle may have no bridges, or its genuine bridges may leave multiple
  connected components. Graph, Star, and Circle modes all support those
  layouts; visual separation can honestly communicate that the authored
  concepts do not form one integrated network.
- **A bridge can pass every structural check and still not earn its place.**
  Ask whether it deepens understanding of *why* the two clusters share their
  underlying logic, or is closer to a citation/provenance fact — accurate,
  even clever, but trivia relative to the puzzle's actual thesis. This shows
  up most when a connection was found *in order to* link two clusters that
  would otherwise sit apart, rather than emerging from the material. (Real
  example: a bridge naming the scholar who happened to write about three
  frameworks was true but taught only who-wrote-what; it was replaced with a
  bridge naming the actual historical doctrine that explains why those
  frameworks share their logic.)
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

### Let the material determine the puzzle's shape

The schema's counts are constraints, not composition targets. Do not begin
with an implicit template such as “3 clusters × 4 terms, 3 bridges, and 3
lenses” and then make the subject fit it. Cluster count, terms per cluster,
bridges, and lenses should each follow a separate pedagogical judgment:

- Create one cluster for each coherent conceptual grouping the lesson needs.
  Do not merge two teachable stages merely to keep the cluster count low, or
  split one idea merely to make the board symmetrical.
- Give each cluster the terms needed to establish its idea. A concise
  three-term cluster and a richer five- or six-term cluster can belong on the
  same board. Do not pad a small cluster with marginal examples or omit a
  useful distinction to equalize the rows.
- Add only genuine bridges. Bridge count need not track cluster count, and
  every cluster need not participate in the same number of bridges.
- Use as many lenses as there are distinct, defensible post-solve lessons
  worth the player's time. Three is a common lesson length, not a required
  value; a compact puzzle may need fewer, while a layered puzzle may support
  four or five without repetition.

Natural variability does **not** mean manufacturing irregularity. A puzzle
can legitimately have equal-sized clusters or three lenses. The question is
whether those counts emerged from the concepts or from an invisible quota.
Changing counts only to make a catalogue look less regular merely replaces
one aesthetic constraint with another.

Before finalizing one puzzle—and especially after generating several puzzles
in a batch—perform a regularity audit. Inspect these counts together:

```text
cluster count:
terms per cluster:
bridge count:
total nodes and applicable node cap:
lens count:
targets per lens:
```

Then review any repeated pattern rather than automatically correcting it.
For each equal count, ask whether the material independently supports it. If
a cluster combines separable ideas, split it; if a cluster contains padding,
trim it; if a lens restates another lens, remove or replace it. Conversely,
leave a repeated count alone when the concepts genuinely justify it.

Multiple clusters landing on the same term count is not on its own evidence
of anything — across this project's own puzzles, roughly seven in ten
clusters land on four terms regardless of author, so equal counts are the
ordinary case, not a coincidence needing an explanation. Treat it as a cheap
trigger for one specific, cheap check instead of a verdict: when several
clusters share a count, scan each cluster's own term list for two terms
doing the same conceptual job — one naming a condition, the other simply
restating what it amounts to — and separately scan the cluster's own `fact`
text for a term it already names but never added to `terms`. A real
instance found this way: a puzzle contrasting Hobbes, Machiavelli, and
Morgenthau had settled on four terms each, but "state of nature" and "war
of every man against every man" were the same idea twice for Hobbes, and
"national interest" and "interest defined as power" were the same idea
twice for Morgenthau — while Machiavelli's own fact text pointed at "the
lion and the fox" as a genuinely distinct concept that had been left out to
keep the count at four. Re-deriving each cluster's size from distinctness
alone gave 5/3/3, not 4/4/4, and every one of those numbers is more honest
than the template it replaced. The same cross-reference — does the puzzle's
own prose already name a term it excluded? — is the highest-precision check
available for a lens's target set too, stronger than the raw target count
(see the high-target-lens check below).

A high-target lens deserves one more specific check: if its targets are one
cluster's entire term list plus every bridge already touching that cluster,
ask whether solving it teaches anything the board's own bridge lines don't
already show. A player can often read "these are connected" straight off
the drawn bridges without the lens revealing anything new — in which case
the fix isn't a better-worded prompt for the same target list, it's a
narrower target list built around a real distinction the current framing is
flattening. Selecting only *some* of a cluster's available bridges, or
reaching into a different cluster for a term chosen for a specific reason,
is normal and not what this check is about — the warning sign is reaching
for *all* of them, which needs no judgment to produce and teaches no more
than the board already displays. When a whole cluster genuinely does belong
in a lens on its own merits, say so directly in the prompt (e.g. "besides
everything in the X cluster, which other concepts also apply to Y?")
instead of leaving the inclusion looking coincidental.

The total-node ceiling remains firm even when the natural structure is
larger. Do not evade it by compressing distinct ideas into vague clusters or
by dropping essential terms. Split the subject into focused, linked puzzles
when one honest treatment would exceed the limit; see [Puzzle size
(`large`)](#puzzle-size-large) and [Related puzzles](#related-puzzles).

### Star-mode cold-read check

Before submitting, check playability against what a Star-mode player
actually has (Star is the primary, richest-experience mode): each cluster's
terms alongside only its cluster's visible hub name — no fact, nothing
completion-gated. For each term, is its home obvious from term-plus-hub-name
alone? If not, does `termInfo` hover text resolve it? If neither does,
that's a real trap word or an under-supported term, regardless of how well
it reads in the authored fact.

Cluster terms should pass this cleanly — a term that doesn't cohere with its
own hub even once named is a genuine gap. Bridge terms are supposed to
resist it: figuring out which two hubs a bridge spans is the intended "aha,"
so the bar there is "not actively misleading toward the wrong hub," not
"instantly placeable."

Check this at the board level, not just per term. A board leaning heavily on
`connector`-type bridges — mechanism, plot detail, biographical thread, one
after another — can have every individual term correctly classified and
still read as a wall of connective tissue, even to a player who already
knows the material well.

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

- **Check for a named-framework primary source first**, before
  reaching for Wikipedia at all, when the term belongs to a specific
  researcher's, institute's, or book's own coined vocabulary rather
  than a general concept. This kind of specialist vocabulary is often
  thinly covered on Wikipedia or not covered at all, and the
  temptation is to zoom out to whatever `wiki:` article resolves
  nearby — commonly a biography of the person who coined the term.
  **A biography of the term's originator is not the containing topic**
  and doesn't belong in the next bullet no matter how cleanly it
  resolves: it explains who the person is, not what the term means,
  which is exactly the "sounds checked but tells the reader nothing"
  failure this whole section exists to prevent. If the source material
  itself — the institute's own site, the book — defines the term more
  specifically and accurately than Wikipedia ever will, verify it
  manually (see "As with any link..." above) and use it directly as a
  plain `"https://..."` URL. The extra manual-verification cost is
  worth paying for a source that actually explains the concept.

  When what's being cited is a specific book, page, or passage rather
  than a link-worthy web page — quoting a particular edition, page
  range, or printing — a plain URL can't carry that detail. Use
  `citations` instead of (or alongside) `link`/`seeAlso` for that; see
  [INFO-LINKS.md](INFO-LINKS.md#citations).
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

A bridge's own `info` field works the same way, one level up
— directly on the bridge object rather than nested under a term name,
since a bridge is a single term rather than a map of several. The one
exception is a bridge marked `termRole: "connector"`: it has no automatic
search fallback, because the bridge term is not itself an intended object of
learning in this puzzle. This applies to concrete nouns and proper names as
well as phrases. Do not add `info.link`, `extraLink`, `seeAlso`, or a citation
URL to a connector. Its `info` may—and often should—provide a concise local
description of what the connector is doing on this board; a non-linked
bibliographic citation may substantiate the bridge fact. See
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
everything above — `check-wiki-links.mjs` checks every cluster name,
searchable term, and reference bridge, plus any explicit `wiki:` links on a
connector bridge. It verifies either the curated title or the raw title an
automatic search would use, and the same "confidently-wrong beats an
honest auto search" caution applies: don't write down `wiki:` for a
cluster name that's short, common, or plausibly ambiguous without
actually opening the article and confirming it's the topic this puzzle
means, not just that *some* article exists at that title. A verified direct
resource is normally preferable to leaving the generic search fallback. Keep
search only when the results page itself is an intentional part of the
exploration, not as a substitute for link curation.

**A cluster's `info.link` is also the fallback for any of its own terms
that don't have one.** A term with no `termInfo` entry (or one with
`text` but no `link`) no longer falls straight to a raw word search —
it silently uses its cluster's `link` instead, the same "zoom out to
the containing topic" move used by hand elsewhere in this doc (`wiki:
Solid` for "fixed shape", `wiki:Indus Valley Civilisation` for
"standardized weights"), just automatic now that every cluster has a
verified link of its own. This only inherits `link` — a term's `text`,
`extraLink`, and `citations` still have to be authored per-term, since a
cluster's blurb (if it ever has one) describes the whole cluster, not
any one term inside it, `extraLink` is a curated bonus resource
specific to whatever it was actually written for, and a citation is
specific to what it's citing. Bridges are excluded, since a bridge belongs
to two clusters and picking one as "the" fallback would be arbitrary. An
unauthored reference bridge still falls straight to a raw search on its own
word for backward compatibility; authors should normally replace that with a
verified direct resource unless the search results themselves offer several
deliberately useful avenues. A connector bridge deliberately has no automatic
search. Because of this, `check-wiki-links.mjs`'s
"no exact page" report no longer flags a term whose cluster already has
a link (it's already covered by that cluster's own check) — it's
reserved for terms in a puzzle whose cluster hasn't been curated yet.

A cluster's own `info.citations` is valid and round-trips through the
puzzle's canonical document, but currently has no rendering surface in the app —
neither Star mode's cluster-title hover nor Circle mode's cluster-info
hover show `seeAlso` or `citations` today. Author cluster-level
citations only if the data itself has independent value; for anything
that needs to actually be seen by a player, attach it to the puzzle,
term, or bridge instead.

## Puzzle info & links

A puzzle itself can carry an `info` field, same `{ text, link, extraLink }`/
`wiki:` shape as everywhere else:

```js
info: { text: "How energy moves through living systems, from sunlight to decomposers.", link: "wiki:Bioenergetics" }
```

Keep `text` compact — it renders as a permanent one-line subtitle (see
below), and a puzzle whose subtitle runs several sentences reads as a
visual outlier against the rest of the catalogue, where most stay to a
single clause. Reach for `citations` (see below) rather than lengthening
`text` when a puzzle needs to carry more than a line's worth of
attribution.

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

For a puzzle built directly from a book (see [Tags](#tags) below —
this is exactly what the `"book"` tag marks), this is also the natural
place for a real `citations` entry — the permanent subtitle is the one
spot every visitor sees regardless of which term or bridge they hover:

```js
info: {
  link: "wiki:Finite and Infinite Games",
  text: "James Carse's distinction between games played to end, within fixed limits, and games played only to keep the playing going.",
  citations: [
    {
      author: "Carse, James P.",
      title: "Finite and Infinite Games: A Vision of Life as Play and Possibility",
      publisher: "Free Press",
      year: "1986"
    }
  ]
}
```

See [INFO-LINKS.md](INFO-LINKS.md#citations) for the full shape.

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
  thing — same `{ text, link, extraLink, seeAlso, citations }`/`wiki:`
  shape as everywhere else. Shown as this puzzle's own "Related
  puzzles" subtitle, and reused as the subtitle when this puzzle's set
  is shared and reopened
  as an overview (`&puzzles=...` — see "Sharing a group" in
  [DEVELOPMENT.md](DEVELOPMENT.md) for how the *first* id in a shared
  list is treated as the "anchor" whose `relatedPuzzles.info` applies).

This relationship is a directed edge, not a symmetric pair — puzzle A
listing B doesn't require B to list A back. Keep it that way rather
than force reciprocity everywhere; a puzzle can be a reasonable "next
step" from several others without all of *those* being equally good
next steps from it.

**Prefer targets outside this puzzle's own catalogue(s).** A catalogue
already gives a player an easy path to every one of its members —
browsing it, or its `view=all` list (see
[CATALOGUES.md](CATALOGUES.md)) — so a `relatedPuzzles` entry pointing
at a catalogue-mate mostly restates something catalogue membership
already provides for free. `relatedPuzzles` earns its keep by surfacing
a connection a player *wouldn't* otherwise stumble onto through normal
category/catalogue browsing — something in a different subject or
catalogue entirely. There's also a concrete mechanical reason to avoid
it within one catalogue: `entries[0]` is literally what routes a
returning visitor to their next puzzle (see below), a signal completely
independent of the catalogue's own `entries` order (itself only "a
light recommendation, never a lock or prerequisite" — see
CATALOGUES.md's Schema section). Cross-linking catalogue-mates gives
the same puzzles two different, unsynchronized notions of "what comes
next" instead of one.

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

## Tags

`tags` is an optional array of freeform strings, deliberately informal
— not a vocabulary, not validated against a registry, just words for a
puzzle to be found by. The same spirit as `relatedPuzzles.entries[].via`
above, applied at the puzzle level instead of one relationship.

Findable through the Library search box, which matches title, category,
tags, citation authors and titles, subcategory titles, and board terms
(cluster names, cluster terms, bridge terms) together with no special
syntax: typing "book" surfaces every puzzle tagged `"book"` the same way
typing a category name already surfaces puzzles in that category — no
`tag="..."` operator to learn. Citation matching is why a puzzle based
on a named book is findable by its author: "Shay" and "Jonathan Shay"
both hit a citation authored `Shay, Jonathan`, even though library
catalogues store the name inverted. Title, category, and tag hits rank
above citation hits, which rank above subcategory hits, which rank above
board-term hits. The same box also matches catalogue titles and
descriptions, including catalogues nested under a meta parent and
suppressed from the top-level Library list.

Elements must be non-empty strings. This is one step stricter than
`via`: tags feed directly into search matching (`tag.toLowerCase()`),
so a malformed entry would break that outright rather than just look
untidy in authored data.

## Learning level

`level` is an optional string, one of `"introductory"`, `"intermediate"`,
or `"advanced"` (`PUZZLE_LEVELS` in `puzzles/categories.js`) -- unlike
`tags`, this is a small fixed vocabulary, not freeform text, because it
has to be enumerable for "which level catalogues currently exist" to be
answerable at all (see below).

Deliberately opt-in and omitted by default, not something every puzzle
needs. "Introductory" vs. "advanced" is a real, recurring editorial
judgment call -- unlike `category` (usually obvious from subject matter)
or the position-derived New Puzzles catalogue (zero judgment either way).
Set it only when you're actually confident where a puzzle sits; leaving
it unset is always the safe default, not a gap to fill in.

Setting it does one thing: the puzzle becomes a member of that level's
auto-catalogue (`level-introductory`, `level-intermediate`,
`level-advanced` -- reserved ids, an authored catalogue can never use
this prefix). A level catalogue is synthesized on the fly from whichever
puzzles currently carry that `level`, the same way All Puzzles and New
Puzzles already are (see catalogueRegistry.js's `levelCatalogue`) --
never an authored file, never stored. A level with zero members doesn't
appear in the Library at all, so setting `level` on a handful of puzzles
doesn't require classifying the rest of the corpus to avoid a sparse or
broken-looking card.

A level catalogue reuses the same category-partition screen every
catalogue already gets, unordered (`ordered: false` on the synthesized
object) since a level cross-section of the whole library has no
editorial sequence -- so opening "Introductory Puzzles" and browsing to
Science already gives "introductory science puzzles" for free, with no
separate per-category-per-level catalogue needed.

## Bridge term roles

A bridge's optional `termRole` is a pedagogical distinction: is the displayed
bridge term itself one of the things this puzzle intends to teach?

- **`reference`** — the term itself belongs inside the puzzle's conceptual
  territory and central lesson. Learning more about it independently would
  deepen the understanding the puzzle is designed to produce. This is the
  backward-compatible default when `termRole` is omitted.
- **`connector`** — the term carries a local relationship, piece of evidence,
  mechanism, plot detail, or biographical thread, while the bridge fact already
  gives the player what this lesson needs from it. It is connecting tissue,
  not an independent learning destination.

A bridge term that is a proper noun — a specific named person, place,
organization, or work — is always `reference`, however incidental its role
feels; a bare name carries no self-descriptive content of its own and always
reads as a specific, findable thing worth looking up. This is enforced by
validation, not just advised — a capitalized `connector` term fails.

Among non-proper-noun terms, do not infer the role from grammar or web
notability. A connector can be a phrase such as `how far to go`, `beyond
compliance`, or `taken seriously`, but it can just as readily be a concrete
and specific common noun. In a literary puzzle, `touch`, `the tracheotomy`,
and `wireless telegraphy` can all be connectors when their job is to carry
the work's plot, mechanism, or biography rather than teach touch, surgery,
or radio history. The fact that an encyclopedia article exists—or that a
player may not know the term—does not promote it to `reference`.

When a proper noun's role actually is incidental — carrying a relationship
or mechanism, not itself part of the lesson — the fix isn't to keep it on
display as a forced reference. It's to not display the name at all: rephrase
the term as the generic relationship or mechanism, and move the name into
`fact`/`info.text` as supporting detail. (Real example: a bridge spanning
three frameworks through one scholar's career was originally displayed as
his name; since his role was biographical rather than itself the lesson, it
was rewritten as `one continuous argument`, with the scholar named in
`fact` instead.)

Classify the pedagogical role before considering links. Then:

- For a `reference`, prefer a verified direct resource that advances this
  puzzle's lesson. Do the editorial work rather than accepting automatic
  search merely because no link has been curated yet.
- Retain the automatic Wikipedia search only when the result set is itself a
  deliberate, productive exploration surface—for example, when several
  plausible avenues are genuinely useful.
- A missing direct link does not make a reference into a connector.
- A connector receives no automatic or authored reference links. Use a plain
  `info` string or `{ text: "..." }`—often worthwhile—to clarify what it is
  doing in this puzzle. A non-linked citation may substantiate the bridge fact,
  but connector `link`, `extraLink`, `seeAlso`, and citation URLs are invalid.

`termRole` and `relationKind` answer different questions and are independent.
`termRole` describes what function the displayed term serves in the lesson;
`relationKind` describes what kind of relationship the bridge's `fact`
expresses. A connector may therefore be `dynamic`, `cross-cutting`, or any
other valid relation kind without conflict.

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

## Learning introductions

`learningIntroduction` adds optional, puzzle-associated preparation before
the learner organizes the board. Its UI label is **Before You Begin**. It is
for domain knowledge, vocabulary, framing, examples, and a reflection
question—not gameplay instructions and not a preview of the solution. The
lesson remains available for review throughout play.

The three requirement levels deliberately behave differently:

- `optional` leaves the board immediately available and places a **Before
  you begin** invitation above it.
- `recommended` first presents the invitation, while allowing **Start
  puzzle** without reading.
- `required` holds the board until the lesson loads and the learner marks
  it read. Use this sparingly, for example when the puzzle depends on a
  particular source.

A read or skipped choice is stored separately from puzzle progress. It is
revision-aware, so changing `revision` causes the revised introduction to be
offered again. **Start over** intentionally does not erase that choice. A
shared solved/moves link also waits at a recommended or required
introduction rather than briefly exposing its board first.

### Inline and outboard Markdown

Short content can stay inline:

```js
import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  id: "energy-flow",
  // ...
  learningIntroduction: {
    requirement: "optional",
    title: "Energy in an Ecosystem",
    estimatedMinutes: 3,
    revision: 1,
    content: {
      text: `## Follow the energy

Energy enters most ecosystems through sunlight, while matter is reused.`,
      mediaType: "text/markdown"
    }
  }
});
```

Prefer an outboard file once the prose is more than a few lines:

```js
learningIntroduction: {
  requirement: "recommended",
  title: "Reasoning from Evidence",
  summary: "Distinguish observations, explanations, and revisable decisions.",
  estimatedMinutes: 4,
  revision: 1,
  content: {
    src: "./from-evidence-to-action.intro.md",
    mediaType: "text/markdown"
  }
}
```

Resource-bearing puzzles must use the `definePuzzle(import.meta.url, ... )`
wrapper shown above. Existing flat puzzle modules keep their current names;
their sibling resources must begin with the complete puzzle id:

```text
puzzles/public-health/
├── from-evidence-to-action.js
├── from-evidence-to-action.intro.md
└── from-evidence-to-action.assets/
    └── evidence-cycle.svg
```

This convention prevents a puzzle from claiming a neighboring puzzle's
resources. Relative paths cannot escape the puzzle package. External pages
belong in `sources`, not in `content.src`; the lesson remains a locally
versioned part of the puzzle.

`sources` is an optional further-reading list of `{ label, href }` links
(http(s) only), shown under a "Sources and further reading" heading.
`citations` is the formal footnote list — the same
`{ author?, title, publisher?, year?, pages?, url? }` shape used on puzzle
`info` (title required; see [INFO-LINKS.md](INFO-LINKS.md#citations)). It
renders at the bottom of the Lesson dialog as plain reference text, below
`sources` when both are present. Use `citations` for bibliographic credit.
AI drafting credit belongs on puzzle-level `generativeAssistance` instead
(see below), which the Lesson modal turns into a short "Assisted by …" line.

### Generative assistance

`generativeAssistance` records which AI systems materially helped author
the puzzle. It is **current attribution**, not a changelog:

```js
generativeAssistance: [
  {
    system: "Claude",           // required — chatbot / product name
    provider: "Anthropic",      // optional owning organization
    scope: "learningIntroduction", // required: learningIntroduction | puzzle | lenses
    role: "drafted",            // optional: drafted | edited
    date: "2026-08-03"          // optional YYYY-MM-DD
  }
]
```

Keep **one entry per `system`+`scope`**. When the same assistant continues
on that scope, update that entry in place (and optionally refresh `date`)
instead of appending. MCP authoring guidance and the draft tools ask
chatbots to populate this when they draft or materially regenerate
content. The Lesson modal credits systems whose scope is
`learningIntroduction` or `puzzle`.

The first implementation intentionally supports a safe Markdown subset:
headings, paragraphs, emphasis, strong text, inline code, fenced code,
ordered and unordered lists, blockquotes, horizontal rules, HTTP(S) links,
and local images. Raw HTML is displayed as text rather than executed. Every
Markdown image needs non-empty alt text and should use a puzzle-scoped path:

```md
![Three observations feeding a provisional explanation](./from-evidence-to-action.assets/evidence-cycle.svg "Evidence is interpreted before action is chosen.")
```

The quoted image title becomes a visible caption. Lesson Markdown and its
images load only when the learner opens the lesson. `validate.mjs` checks the
manifest, file size, local-file existence, package boundaries, source links,
and image alt text before deployment.

### Authoring for discovery rather than disclosure

The introduction succeeds when the learner understands the subject better
but still needs to solve the puzzle. A useful review is:

- Teach facts and vocabulary necessary to understand the nodes.
- Supply context, stakes, and examples that are not themselves puzzle
  answers.
- Usually omit cluster names, especially when naming them would reveal the
  main classification.
- Do not pair puzzle terms with clusters or spell out bridge relationships.
- Reserve the interpretive payoff of a Concept Lens for its post-solve
  round.
- End with a question that activates observation or comparison without
  identifying the answer set.

For optional or recommended content, a runtime loading failure is visible
but nonfatal. Required content remains blocking on failure; validation is
therefore particularly important before choosing `required`. Structured
lesson JSON, shared category/catalogue resources, remote lesson bodies, and
portable puzzle-package export are intentionally deferred until real
authoring needs justify the additional schema.

## Concept Lenses

`lenses` adds an optional learning phase after the map is solved. Each
round asks the player to reclassify terms across the completed map using
a different attribute. Ordinary and bridge terms can be targets; cluster
titles cannot. The solved layout remains fixed while the player selects
terms, checks the answer, and reads the explanation.

There is no preferred lens count in the schema. Choose the shortest sequence
that teaches the worthwhile secondary patterns on this particular board.
Adding a lens only to reach a familiar count lengthens the lesson without
adding insight; stopping at three when a fourth non-redundant comparison is
central leaves useful structure unexplored. When authoring a batch, compare
lens counts and purposes across the puzzles as part of the regularity audit
above, but do not vary them for appearance alone.

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

- Name 3–6 unique targets. Crossing several clusters is often a sign of a
  cross-cutting lens, but reinforcing lenses may stay inside one cluster.
  Bridge targets count as touching every cluster they connect structurally;
  that alone does not make a lens conceptually cross-cutting.
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

## Categories and subcategories

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

### Optional subcategories

A category may define one additional browsing level when it has enough
puzzles to benefit from recognizable internal fields, periods, genres, or
topic areas. Subcategories are subject classification—not curated sequences,
difficulty levels, or free-form tags—and the application intentionally
supports only one subcategory assignment per category membership.

Register stable IDs under the category metadata:

```js
export const CATEGORIES = {
  Art: {
    info: { text: "How visual choices organize perception and meaning." },
    subcategories: {
      "visual-form": {
        title: "Visual Form",
        info: {
          text: "How composition, color, and spatial relationships shape seeing.",
          link: "wiki:Visual arts"
        }
      },
      "representation-and-interpretation": {
        title: "Representation & Interpretation",
        info: {
          text: "How artworks transform appearances and acquire meaning.",
          link: "wiki:Representation (arts)"
        }
      }
    }
  }
};
```

The object key is the stable URL ID; `title` is display copy and may be
reworded later. IDs must already be lowercase URL-safe slugs. `all` and
`other` are reserved because the browser generates those partitions.
Library search matches both the title and the ID (hyphens read as spaces),
so a puzzle in `computing-and-society` is findable by "Computing & Society"
or "computing and society" even when those words never appear in its
title.

Assign a puzzle with a mapping keyed by its exact category name:

```js
{
  category: "Art",
  subcategories: {
    Art: "visual-form"
  }
}
```

The mapping is category-relative because a multidisciplinary puzzle can sit
in a different internal field in each subject:

```js
{
  category: "Computer Science",
  categories: ["Computer Science", "Business & Organizations"],
  subcategories: {
    "Computer Science": "human-computer-interaction",
    "Business & Organizations": "work-design"
  }
}
```

Assignments are optional even after a category is subdivided. The Library
generates an **Other** card whenever the active category or catalogue contains
unassigned puzzles, making gradual adoption safe. It also hides registered
subcategories that have no puzzles in the active catalogue. A category with
no represented assignments retains the original direct puzzle list instead
of adding an unnecessary navigation step.

## Puzzle size (`large`)

`large: true` marks a puzzle for the bigger board: a 960×620 viewBox
and a wider page layout (`.wrap.wide` in `styles.css`), instead of the
standard 640×460. It only affects rendering — the puzzle still lives
in its normal `category` group, and the flag is purely about node
count/board size, not conceptual difficulty (a puzzle can be large and
introductory, or small and conceptually hard — don't conflate the two
axes). It's shown with a "(Large)" suffix in the picker and a small
badge next to the title.

The page layout only becomes physically wider on a viewport with room
for it. The 960×620 coordinate space itself is preserved at narrower
viewports and the responsive SVG scales it down to fit. Falling back to
640×460 caused the dense puzzles that need `large` most to develop real
overlaps and crossings; preserving their layout space is more important
than making their already-dense labels marginally larger.

`large` isn't the only thing that requests the wide board, though —
Circle and Star modes always do, on *any* puzzle, regardless of this
flag (`applyBoardSize` in `game.js`). Both need more room than Graph
mode's per-term layout for reasons that have nothing to do with node
count: Circle mode draws containers as well as the terms inside them,
and Star mode routes every connection through a cluster's title hub
rather than point-to-point, so a bridge fans two lines into two
different hubs instead of one. Graph mode never requests it on its own
unless the puzzle is explicitly `large`. On an ordinary puzzle it
remains the most readable fallback for a narrow screen; on a `large`
puzzle all three modes honor the author's larger-canvas requirement.

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
Run `npm run validate` and the quick `npm test` before committing. Reserve
`npm run test:extended` for shared rendering/layout changes and occasional
release-level verification.

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
