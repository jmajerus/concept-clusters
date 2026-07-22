# Authoring a puzzle

Puzzles are plain data in `puzzles.js`. Add an object to the `PUZZLES`
array — no game-code changes are required. After editing, run:

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
                                 // in the picker; reuse an existing
                                 // category to add to that group
  large: true,                  // optional, see "Puzzle size" below
  clusters: [ /* 2–4 of these */ {
    name: "Revealed on completion",
    color: "green",             // "green" | "blue" | "amber" | "rose"
    fact: "One-line teaching payoff shown when the cluster completes.",
    terms: ["term1", "term2", "term3"],   // 3–5 recommended
    seeds: ["term1", "term2"],            // exactly 2, pre-connected
    termInfo: {                 // optional, see "Term info & links" below
      term1: "One-line definition, shown to the player on hover/tap."
    }
  } ],
  bridges: [ /* 0–3 of these */ {
    term: "bridge term",        // must NOT appear in any cluster's terms
    clusters: [0, 1],           // indices into the clusters array
    fact: "Explains WHY it spans both — the key teaching moment.",
    idealTerms: ["term1", null], // optional, see "Ideal bridge terms" below
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
auto search.** A bare auto search means nobody has actually checked
where it goes — it's asking each player to redo, at click-time, the
verification the author could have done once. `check-wiki-links.mjs`
enforces this too: an "auto-search" entry it can't confirm is either
missing or on a disambiguation page gets flagged just like a broken
curated link. A `link` with no `text` is completely valid for this —
see "Link-only overrides" below — so committing to an explicit link
never requires writing a definition you don't have yet:

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
  `resolvedTitle` — the exact article it resolves to — so this is
  usually a lookup, not a search.

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

**Rough sizing guidance**, counting all cluster terms + bridges:

| Total nodes | Comfortable at |
|---|---|
| ~11–14 | standard size (no `large` flag) |
| ~15–19 | `large: true` |
| 20+ | not recommended — crowds the force layout regardless of board size |

## Cluster colors

Four hues are available: `green`, `blue`, `amber`, `rose` — plus purple,
which is reserved for bridges and can't be used for a cluster. If a
puzzle needs a 5th cluster, add another hue's tokens to `:root` in
`styles.css` (see the existing `--rose`/`--rose-bg`/`--rose-line`
tokens for the pattern) before using it in `puzzles.js`.
