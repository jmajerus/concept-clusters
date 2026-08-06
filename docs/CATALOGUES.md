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
- `entries[].reason`: a short explanation of the editorial choice.

Entry order is a light recommendation, never a lock or prerequisite.

Register a new file at the end of `catalogues/index.js`'s `CATALOGUES`
array -- see "New Puzzles" above for why append order matters, now that
the "New" badge relies on it too. Run `npm run validate`;
validation rejects missing or duplicate puzzle IDs, duplicate catalogue
IDs, invalid information values, empty reasons, the reserved `all`/`new`
IDs, and normalized ID collisions.

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
