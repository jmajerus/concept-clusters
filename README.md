# Concept Clusters

An educational puzzle game rendered as a D3 force-directed graph. Players attach floating concept terms to partially built clusters; special *bridge* terms belong to two clusters and must be connected to both, revealing why the concepts relate.

This is a working prototype handed off from a Claude.ai design session. It runs by opening `index.html` directly in a browser — no build step, no server, no network required (D3 is vendored locally).

## Design brief (the decisions behind the code)

These choices were deliberate; preserve them unless there's a reason not to.

**No trap words.** Every term belongs unambiguously to its declared cluster(s). In entertainment puzzles (NYT Connections), ambiguity is the game; in an educational tool it punishes students for making *correct* associations, which is backwards pedagogically. Challenge should come from knowing the concepts, not disambiguating wordplay.

**Seed pairs are the orienting clue.** Each cluster starts with two terms already connected and colored, so a student forms a hypothesis before touching anything. The task is confirmation and extension, not blind search.

**Bridges are the relationship layer.** A bridge term needs one link into each of its two clusters. After the first correct link it shows a dashed purple outline ("not done yet"); on completion it turns purple and reveals a one-line explanation of *why* it spans both concepts. That reveal is the pedagogical core — the game rewards articulating relationships, not just membership.

**Feedback is diagnostic, never punitive.** There is no mistake counter and no fail state. Wrong connections get a nudge that points back at the concept ("think about what those terms share"). Solved clusters and bridges each reveal a teaching fact, so the moment of success doubles as the teaching moment.

**The physics is part of the lesson.** As bridges land, the force simulation physically pulls clusters together, so the finished graph *looks* like one integrated body of knowledge rather than separate islands.

## Files

| File | Purpose |
|---|---|
| `index.html` | Entry point; loads everything |
| `styles.css` | Visual design (lab-notebook direction: graph-paper board, marker-hue clusters) |
| `puzzles.js` | **The authoring format.** Puzzles are plain data; adding one requires no code changes |
| `game.js` | Game logic: puzzle loading, force simulation, connect mechanic, feedback |
| `d3.v7.min.js` | Vendored D3 v7.9.0 (swap for npm install when migrating to a bundler) |

## Authoring a puzzle

Add an object to `PUZZLES` in `puzzles.js`. The schema is documented in that file's header comment. Rules of thumb:

- 2–4 clusters, 3–5 single-cluster terms each, exactly 2 seeds per cluster
- 0–3 bridges; each names two cluster indices and a fact explaining the relationship
- Bridge terms must not appear in any cluster's `terms` list
- Keep terms short (long words make wide pills that crowd the board)

## Roadmap ideas (in rough priority order)

1. **Migrate to Vite** (or similar) — module imports, dev server, `puzzles.json` loaded via fetch instead of a global
2. **Teacher authoring UI** — build/edit puzzles in the browser, export JSON
3. **Progress persistence** — localStorage per puzzle; a "review" mode replaying revealed facts
4. **Dark mode** — the palette is centralized in CSS custom properties, so this is a token swap
5. **Drag-to-connect** — drag a free node onto a cluster node as an alternative to tap-tap
6. **Bridge chains across puzzles** — sequence puzzles so completed clusters seed the next puzzle, letting students assemble a whole unit's concept map over time
7. **Assessment mode** — no seeds shown; grade the structure students build
8. **Touch/mobile polish** — larger hit targets, pinch-zoom on the board

## Known limitations

- Pill width is estimated from character count (`game.js: pillWidth`); very long terms may clip
- No mobile-specific layout yet; the board scales but small screens get cramped
- Cluster colors support exactly three hues (`green`, `blue`, `amber`) plus purple reserved for bridges; add hues in `styles.css` if a puzzle needs a fourth cluster
