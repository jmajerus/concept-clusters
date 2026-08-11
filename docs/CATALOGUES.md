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
At or below `INLINE_PUZZLE_LIST_THRESHOLD` member puzzles (5, in
`overviewRenderer.js`), that card is skipped and the puzzle list shows
inline instead -- one click to the same puzzles isn't worth showing for
a catalogue small enough to take in at a glance.

The same threshold applies one level down, per category, to the
"Browse by subject" cards below it: a category with that few puzzles
shows its puzzles inline (under a small heading) instead of a card
leading to its own screen. This only happens when the catalogue-level
puzzle list above it wasn't *already* inlined -- otherwise every
puzzle would appear on screen twice, once flat and once regrouped by
category.

When the catalogue-level list *is* already inlined, "Browse by
subject" itself becomes "By subject": a plain-text reference index
(category name, then that category's puzzle titles, with any
subcategory noted in parentheses), not cards. Every puzzle is already
listed once, above, with a direct link -- a card that would just lead
back to a subset of the same puzzles has no navigation left to offer,
only a categorization to communicate. See renderSubjectSummary in
overviewRenderer.js.

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
meta parent, by direct URL, and by search. Set `showInLibrary: true` on a
nested catalogue to keep it listed at both levels.

This is a runtime/local concept only -- no JSON-LD interchange support,
and the hosted `create_catalogue` MCP tool doesn't accept `kind: "meta"`
yet. A meta catalogue is hand-authored the same way this doc's examples
already are.

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

The puzzle picker remains global. It preserves a curated context when
the chosen puzzle belongs to that catalogue and otherwise returns to All
Puzzles. Related-puzzle navigation applies the same rule.

The picker also lists every real catalogue in its own "Catalogues"
group (Library/All Puzzles/New Puzzles are not real catalogue objects
and aren't listed), letting a player jump straight to a catalogue's own
overview. Its selection stays in sync with whichever catalogue is
currently being browsed -- overview, category, subcategory, or the flat
puzzle list -- and resets to the placeholder on screens with no single
active catalogue (Library, Related). See syncPickerToContext in
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
