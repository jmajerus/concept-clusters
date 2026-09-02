# Curated catalogues

Concept Clusters separates four kinds of navigation:

- **Library** is the top-level screen where a player chooses a catalogue.
- **All Puzzles** is the comprehensive catalogue, derived from `PUZZLES`.
- **Catalogue** is an editorial selection for an audience, theme, or
  learning purpose.
- **Category** is the canonical subject partition inside the active
  catalogue.

Related puzzles remain a separate, local recommendation: they answer
"what might be useful next?" rather than "which collection selected this
puzzle?"

## LAN authoring

On `npm run dev` and the hosted authoring Worker, `/admin/catalogues`
lists leaf and meta catalogues from D1. Leaf catalogues edit as Library
cards at `/?catalogue=<id>&view=author`. Meta catalogues edit at
`/admin/catalogues/<id>`; their entries are other catalogues.
**Publish** writes the shared D1 row. Create a catalogue or category from
those lists. **Remove from authoring play** withdraws the published row
(git seed will not restore it). **Delete working copy** removes only the
owner’s draft. **Cue** the published snapshot, then **Freeze** from `/admin`
to update the git-bundled player. Freeze automatically includes a missing
published leaf catalogue, puzzle, or category that the cued document needs;
the Admin plan shows the parent for each inclusion. Derived catalogues (`all`, `new`, `level-*`)
stay out of that list. A **new on next freeze** badge marks a published
D1 catalogue that git does not have yet. MCP `create_catalogue` and
`update_catalogue` write the same D1 drafts for leaf catalogues;
`update_meta_catalogue` updates an existing meta catalogue.

LAN play at `/` uses those published D1 catalogues (and puzzles, and
categories) rather than `catalogues/*.js`. Production still bundles the
git modules until freeze.

## Canonical puzzle ownership

Catalogue files contain stable puzzle IDs, not puzzle objects. The
canonical puzzle remains in `puzzles/`, and its player session remains
under `ccPlayerSession:v1:<puzzle-id>`.

This lets one puzzle belong to several catalogues without copying its
content, progress, or completed state. A completed puzzle immediately
contributes to every catalogue containing that ID.

All Puzzles is generated from the current `PUZZLES` array. It has no
authored entry list and must not be duplicated in `catalogues/`.

New Puzzles is likewise generated, not authored: the most recently
registered puzzles by `PUZZLES` array position (append-only, so position
already means "newest" with no date field needed). Same rule applies --
`new` is reserved and must not be duplicated in `catalogues/`.

A level catalogue (`level-introductory`, `level-intermediate`,
`level-advanced`) is generated the same way -- every puzzle whose optional
`level` field (see AUTHORING.md's "Learning level") currently matches, in
`PUZZLE_LEVELS`' fixed order. Same rule applies -- the `level-` prefix is
reserved and must not be duplicated in `catalogues/`. Unlike All/New
Puzzles, a level catalogue can legitimately not exist at all: with zero
matching puzzles it's simply absent from the Library (and from a direct
`?catalogue=level-introductory` link, same "not available" fallback as
any unknown id) rather than rendering an empty card -- `level` is opt-in,
so most puzzles won't have one set for a long time. See
`catalogueRegistry.js`'s `levelCatalogue`/`levelCatalogues`.

A Library catalogue card also gets a "New" badge if the catalogue
itself was recently added -- not just if it contains a new puzzle. This
relies on `catalogues/index.js`'s `CATALOGUES` array being append-only
the same way `PUZZLES` is: register a new file at the end of the array,
not inserted elsewhere, or it will be silently miscounted as older than
it is.

## Schema

Each file under `catalogues/` exports one object:

```js
export default {
  id: "getting-started",
  title: "Getting Started",
  info: {
    text:
      "An approachable cross-disciplinary introduction to clusters, bridges, and lenses."
  },
  entries: [
    {
      id: "energy-flow",
      reason:
        "Begin with a familiar system whose clusters and bridges are easy to observe."
    }
  ]
};
```

Required:

- `id`: a unique, URL-safe slug; `all` and `new` are reserved;
- `title`: the player-facing catalogue name;
- `entries`: a nonempty array of canonical puzzle references.

Optional:

- `info`: the usual `{ text, link, extraLink }` information shape;
- `entries[].reason`: a short explanation of the editorial choice;
- `ordered`: a boolean, default `true`. Set `ordered: false` when a
  catalogue is a themed grouping without a deliberate sequence -- the
  All Puzzles list's "play the containing catalogue" nudge (see
  showPuzzleCatalogueSuggestion in overviewRenderer.js) drops its
  "play it in sequence" phrasing for these.

Entry order is always a light recommendation, never a lock or
prerequisite -- `ordered` only controls whether the UI *implies* a
sequence, not whether one is enforced.

A catalogue's own overview screen normally leads with an "All puzzles
in this catalogue" card linking to the flat, editorially-ordered list.
An *ordered* catalogue (the default -- see `ordered` above) skips that
card and shows its puzzles inline instead, always, regardless of how
many there are: an ordered catalogue's whole point is a sequence worth
taking in at a glance, and a card leading to a screen that would just
show the same list anyway is a redundant click. In practice ordered
catalogues also tend to be short, curated ones, so this rarely means a
long page -- but count isn't the gate; `ordered` is, deliberately, so
there's one flag to reason about instead of a threshold to explain. The
two synthetic catalogues (All Puzzles, New Puzzles) are excluded from
this even though they default to `ordered !== false` like everything
else -- neither has a real editorial sequence (see below), and All
Puzzles alone would mean inlining the entire collection.

An *unordered* catalogue (`ordered: false`) keeps the "All puzzles"
card -- with no sequence to show at a glance, the flat click-through
still makes sense. Below `INLINE_PUZZLE_LIST_THRESHOLD` puzzles (5, in
`overviewRenderer.js`) *within a single category*, the "Browse by
subject" cards below it inline that category's puzzles the same way,
under a small heading instead of a card leading to its own screen --
this is unordered-only too: inlining a small category for an ordered
catalogue would one-click-promote whichever categories happened to be
small, with no regard for where those puzzles actually fall in the
sequence (this is exactly why the catalogue-level card is skipped
entirely for an ordered catalogue instead of applying the same
per-category logic there).

When the catalogue-level list is inlined (any ordered catalogue), the
"Browse by subject" section itself becomes "By subject": a plain-text
reference index (category name, then that category's puzzle titles,
joined by " · " rather than a comma -- several titles contain a comma
themselves, e.g. "Power Over, Power To" -- with any subcategory noted
in parentheses), not cards. Every puzzle is already listed once, above,
with a direct link -- a card that would just lead back to a subset of
the same puzzles has no navigation left to offer, only a categorization
to communicate. See renderSubjectSummary in overviewRenderer.js.

Register a new file at the end of `catalogues/index.js`'s `CATALOGUES`
array -- see "New Puzzles" above for why append order matters, now that
the "New" badge relies on it too. Run `npm run validate`;
validation rejects missing or duplicate puzzle IDs, duplicate catalogue
IDs, invalid information values, empty reasons, the reserved `all`/`new`
IDs, and normalized ID collisions.

### Meta catalogues

`kind: "meta"` (optional; omitted means an ordinary catalogue, fully
backward-compatible) turns `entries` into references to other catalogues
instead of puzzles -- a curated grouping of catalogues, one level deep only
(a meta catalogue's entries must themselves be ordinary catalogues;
`npm run validate` enforces this, along with no duplicates and no
self-reference). It renders as just another card on the Library screen;
clicking it reuses the same card-list screen, scoped to its children,
instead of the usual category-partitioned puzzle list. Its own progress and
puzzle count are the deduped union of every child's puzzles, computed fresh
at render time, not stored.

A catalogue nested under a meta catalogue is suppressed from the flat
top-level Library list by default, to keep that screen from growing one
card per catalogue indefinitely -- it's still fully reachable through its
meta parent, by direct URL, and by the Library search box (which matches
catalogue titles and descriptions, including nested ones). Set
`showInLibrary: true` on a nested catalogue to keep it listed at both
levels.

Author them in D1 at `/admin/catalogues/<id>`. MCP `create_catalogue` /
`update_catalogue` still do not accept `kind: "meta"`. No JSON-LD
interchange support yet.

#### `relatedCatalogues` ("see also")

Optional, meta catalogues only. Same `{ info?, entries: [{ id, reason? }] }`
shape as a puzzle's `relatedPuzzles` (see AUTHORING.md), but pointing at
other catalogues instead of other puzzles -- for a catalogue that's related
in spirit but doesn't fit the meta's primary sequence in `entries` (a leaf
catalogue built around a different theme that happens to share ground with
this one, say). Unlike `entries`, this is not nesting: a related catalogue
isn't suppressed from the flat Library list, gets no breadcrumb segment,
and (unlike `entries`, which is capped at ordinary catalogues one level
deep) may itself be a meta catalogue. `info` is optional set-level framing
for when several related catalogues share one connective thread -- same as
`relatedPuzzles.info`, skip it for a single entry and let that entry's own
`reason` carry the explanation instead of repeating boilerplate ("related,
but outside the sequence") that the "See also" heading already conveys.
Validation rejects an id already present in `entries`, a self-reference,
duplicates, and an id that doesn't
resolve to a registered catalogue.

Renders as a "See also" section below the meta catalogue's own card list --
real, clickable catalogue cards, not descriptive text, and visually
separate from `entries` so it doesn't read as a fifth member of the
sequence. Same runtime/local-only caveat as `kind: "meta"` above: no JSON-LD
interchange support yet.

## Category partitioning

Catalogue files do not repeat category membership. Each selected
puzzle's canonical `category` value supplies that partition.

Consequently, category names and counts are catalogue-relative. Science
may contain three puzzles in Getting Started and four in All Puzzles
without either catalogue owning a second category definition.

## URLs

Supported catalogue routes are:

```text
?library
?catalogue=getting-started
?catalogue=getting-started&view=all
?catalogue=getting-started&category=science
?puzzle=energy-flow&catalogue=getting-started
?puzzle=energy-flow&catalogue=getting-started&category=science
```

`view=all` is the catalogue's editorially ordered puzzle list. The
catalogue overview itself remains the subject-partition screen.

Legacy `?puzzle=`, `?category=`, `?puzzles=`, `moves`, `solved`, and
`mode` forms remain supported. A direct puzzle URL has neutral All
Puzzles context. If a puzzle URL names a catalogue that does not contain
it, the puzzle still opens but the invalid association is dropped.

An invalid explicit catalogue opens the Library. A bare root visit still
opens a live showcase or remembered-next puzzle; it does not open the
Library.

The global header picker contains category, registered subcategory, and
catalogue landing pages rather than every individual puzzle. Category and
subcategory choices open the standard All Puzzles Library routes. Every real
ordinary catalogue appears in the "Catalogues" group, while meta catalogues
appear under "Catalogue collections" with a `◈` marker that remains visible
when the select is closed. Library/All Puzzles/New Puzzles are synthetic and
aren't listed. Every option jumps straight to that catalogue's overview.

Its selection stays in sync with whichever category, subcategory, or curated
catalogue is currently being browsed and resets to the placeholder on puzzle,
Library, and Related screens. See syncPickerToContext in
game.js and appNavigation.js's setContext, the single choke point every
route change passes through.

## History and sharing

Library, catalogue, category, and puzzle navigation use
`history.pushState`; Back and Forward therefore traverse the actual
hierarchy. One-time `moves` and `solved` values are replayed only during
initial bootstrap, never again during `popstate`.

Catalogue and catalogue-category overview Share buttons reproduce their
current filtered views. Puzzle Share links include a valid curated
catalogue (and originating category when available). Direct or All
Puzzles shares omit `catalogue=all` to keep their existing compact form.

## Progress

Catalogue progress is computed at render time:

```text
canonical member puzzles with a completed player session
---------------------------------------------------------
total canonical member puzzles
```

There are no catalogue-specific session keys, completion thresholds,
scores, or locks. Lens puzzles use the existing player-session meaning
of completion: their map and lens sequence must be complete.

## Editorial guidance

Use a catalogue when the selection itself communicates a useful
audience, theme, or learning purpose. Do not use it as:

- another name for an academic category;
- a prerequisite pathway or locked sequence;
- a copy of a puzzle with catalogue-specific wording;
- a replacement for a small, conceptual related-puzzle recommendation.

A future pathway could add sequence, prerequisites, or milestones. This
first catalogue layer deliberately does not.
