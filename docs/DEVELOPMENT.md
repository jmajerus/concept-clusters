# Development notes

For how to add puzzle content, see [AUTHORING.md](AUTHORING.md) instead
— this doc is about the code itself.

## Files

| File | Purpose |
|---|---|
| `index.html` | Entry point; loads everything |
| `styles.css` | Visual design (lab-notebook direction: graph-paper board, marker-hue clusters) |
| `puzzles.js` | **The authoring format.** Puzzles are plain data; adding one requires no code changes |
| `game.js` | Game logic: puzzle loading, force simulation, connect mechanic, feedback |
| `d3.v7.min.js` | Vendored D3 v7.9.0 (swap for npm install when migrating to a bundler) |
| `validate.mjs` | Schema/consistency checker for `puzzles.js` — run with `node validate.mjs` |
| `tests/` | Browser-driven regression suite — run with `npm test` (see below) |
| `tools/check-wiki-links.mjs` | Verifies `termInfo`/bridge `info` Wikipedia links resolve — run with `npm run check-wiki-links` (see below) |

## Testing

The site itself has no build step and no dependencies — `tests/` is the
one part of this project that does, since driving a real browser needs
one. First time, or after pulling changes to `package.json`:

```
npm install
npx playwright install chromium   # only needed once, downloads the browser
```

Then, any time:

```
npm test
```

This starts a throwaway static server, runs the suite against it in a
headless browser, and exits non-zero if anything fails — safe to run
before committing, or wire into CI later. Always run `node validate.mjs`
too when puzzle content changed; it catches schema mistakes the browser
suite doesn't (and runs in milliseconds, no browser needed).

Each file in `tests/` covers one concern; add a puzzle-authoring
regression by writing a module that exports `name` and an async
`run(page, baseURL)`, then adding it to the list in `tests/run.mjs`.
`tests/layout-sanity.mjs` in particular is the one to lean on when
adding puzzles with unusual cluster counts or shapes — it's the
automated version of the overlap checks used by hand throughout this
project's early layout work.

`tools/check-wiki-links.mjs` is separate from `npm test` on purpose —
it calls Wikipedia's API, so it's a manual/occasional run rather than
something that should block every commit or need network access to
just run the regression suite:

```
npm run check-wiki-links            # only checks titles not already cached
npm run check-wiki-links -- --force # re-checks everything
```

It verifies that every term relying on the auto-generated Wikipedia
search actually has a matching article (informational — a miss just
means the Search link lands on results instead of jumping straight
there), and that every curated `wiki:Title` link/extraLink resolves
too (almost always a real typo if it doesn't — see [AUTHORING.md](AUTHORING.md)
for the `wiki:` shorthand itself). Results are cached in
`tools/wiki-link-cache.json` (committed) so re-running only hits the
network for titles that changed since the last run.

## Known limitations

- Pill width is estimated from character count (`game.js: pillWidth`); very long terms may clip
- No mobile-specific layout yet; the board scales but small screens get cramped
- Cluster colors support four hues (`green`, `blue`, `amber`, `rose`) plus purple reserved for bridges — see [AUTHORING.md](AUTHORING.md#cluster-colors) for adding a 5th
- Puzzle sizing (standard vs. `large`) is covered in [AUTHORING.md](AUTHORING.md#puzzle-size-large), including the node-count guidance for each
- In Sets mode, a bridge's pill can end up overlapping an *unrelated* third circle in some tight, multi-cluster layouts — not checked by `tests/layout-sanity.mjs` (scoped to circle-vs-circle only). Reducing this further would mean reconsidering how the free-node strip's direction is chosen relative to circle placement, not just tuning distances (see the `safePartialOffset` comments in `game.js`)

## Roadmap ideas (in rough priority order)

1. **Migrate to Vite** (or similar) — module imports, dev server, `puzzles.json` loaded via fetch instead of a global
2. **Teacher authoring UI** — build/edit puzzles in the browser, export JSON
3. **MCP server for puzzle authoring** — expose puzzle construction and fact-checking (schema validation plus web-search-backed claim verification) as MCP tools, so a non-technical author could build and vet a puzzle through a chat interface like Claude Desktop without touching git or Node. A lighter-weight alternative or complement to the Teacher authoring UI above — same underlying need (letting someone other than a developer author puzzles), different interface. Could also draft `termInfo`/bridge `info` definitions directly from a dictionary lookup for the author to accept or edit, rather than requiring one to be hand-written from scratch for every term
4. **Progress persistence** — localStorage per puzzle; a "review" mode replaying revealed facts
5. **Dark mode** — the palette is centralized in CSS custom properties, so this is a token swap
6. **Drag-to-connect** — drag a free node onto a cluster node as an alternative to tap-tap
7. **Bridge chains across puzzles** — sequence puzzles so completed clusters seed the next puzzle, letting students assemble a whole unit's concept map over time
8. **Assessment mode** — no seeds shown; grade the structure students build
9. **Touch/mobile polish** — larger hit targets, pinch-zoom on the board
