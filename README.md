# Concept Clusters

An educational puzzle game built with D3. Players attach floating concept terms to partially built clusters; special *bridge* terms belong to two clusters and must be connected to both, revealing why the concepts relate. Three rendering modes share the same underlying mechanic: Graph mode, a force-directed node-link diagram where each connection is drawn straight to whichever already-placed term you tapped; Star mode, the same board but with every connection drawn to its cluster's own label instead, trading some of Graph mode's tangle (and its hidden cluster names) for a more legible read; and Circle mode, where clusters are fixed circles with bridges drawn as connecting lines between them.

This is a working prototype handed off from a Claude.ai design session. It runs by opening `index.html` directly in a browser — no build step, no server, no network required (D3 is vendored locally).

## Design brief (the decisions behind the code)

These choices were deliberate; preserve them unless there's a reason not to.

**No trap words.** Every term belongs unambiguously to its declared cluster(s). In entertainment puzzles (NYT Connections), ambiguity is the game; in an educational tool it punishes students for making *correct* associations, which is backwards pedagogically. Challenge should come from knowing the concepts, not disambiguating wordplay.

**Seed pairs are the orienting clue.** Each cluster starts with two terms already connected and colored, so a student forms a hypothesis before touching anything. The task is confirmation and extension, not blind search.

**Bridges are the relationship layer.** A bridge term needs one link into each of its two clusters. After the first correct link it shows a dashed purple outline ("not done yet"); on completion it turns purple and reveals a one-line explanation of *why* it spans both concepts. That reveal is the pedagogical core — the game rewards articulating relationships, not just membership.

**Feedback is diagnostic, never punitive.** There is no mistake counter and no fail state. Wrong connections get a nudge that points back at the concept ("think about what those terms share"). Solved clusters and bridges each reveal a teaching fact, so the moment of success doubles as the teaching moment.

**Physics assists in arranging the results in a clear and readable way.** All three modes run a live force simulation to keep nodes and clusters legible as connections are made, rather than letting them pile up or overlap — Graph and Star modes each settle the whole node-link board from a cold start (Graph pulling a newly-connected term toward whichever term it was linked to, Star pulling it toward its cluster's label instead), while Circle mode only has to arrange the clusters and bridges, since docked terms stay fixed relative to their own circle. One visible consequence in Graph and Star modes: as bridges land, previously separate clusters visibly drift together into place.

## Want to add a puzzle, or work on the code?

This README sticks to what the game is and why it's built this way.
The technical details live in [docs/](docs/):

- **[docs/AUTHORING.md](docs/AUTHORING.md)** — the puzzle schema, how
  to add a puzzle, sizing/color guidance. Start here if you just want
  to add content.
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** — what each file
  does, known limitations, and the roadmap. Start here if you're
  working on the game's code.
