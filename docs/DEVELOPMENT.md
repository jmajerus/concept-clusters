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

## Known limitations

- Pill width is estimated from character count (`game.js: pillWidth`); very long terms may clip
- No mobile-specific layout yet; the board scales but small screens get cramped
- Cluster colors support four hues (`green`, `blue`, `amber`, `rose`) plus purple reserved for bridges — see [AUTHORING.md](AUTHORING.md#cluster-colors) for adding a 5th
- Puzzle sizing (standard vs. `large`) is covered in [AUTHORING.md](AUTHORING.md#puzzle-size-large), including the node-count guidance for each

## Roadmap ideas (in rough priority order)

1. **Migrate to Vite** (or similar) — module imports, dev server, `puzzles.json` loaded via fetch instead of a global
2. **Teacher authoring UI** — build/edit puzzles in the browser, export JSON
3. **Progress persistence** — localStorage per puzzle; a "review" mode replaying revealed facts
4. **Dark mode** — the palette is centralized in CSS custom properties, so this is a token swap
5. **Drag-to-connect** — drag a free node onto a cluster node as an alternative to tap-tap
6. **Bridge chains across puzzles** — sequence puzzles so completed clusters seed the next puzzle, letting students assemble a whole unit's concept map over time
7. **Assessment mode** — no seeds shown; grade the structure students build
8. **Touch/mobile polish** — larger hit targets, pinch-zoom on the board
