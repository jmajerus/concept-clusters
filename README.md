# Concept Clusters

An educational puzzle game built with D3. Players attach floating concept terms to partially built clusters; special *bridge* terms belong to two clusters and must be connected to both, revealing why the concepts relate. Two rendering modes share the same underlying mechanic: Graph mode, a force-directed node-link diagram, and Sets mode, where clusters are fixed circles with bridges drawn as connecting lines between them.

This is a working prototype handed off from a Claude.ai design session. It runs by opening `index.html` directly in a browser — no build step, no server, no network required (D3 is vendored locally).

## Design brief (the decisions behind the code)

These choices were deliberate; preserve them unless there's a reason not to.

**No trap words.** Every term belongs unambiguously to its declared cluster(s). In entertainment puzzles (NYT Connections), ambiguity is the game; in an educational tool it punishes students for making *correct* associations, which is backwards pedagogically. Challenge should come from knowing the concepts, not disambiguating wordplay.

**Seed pairs are the orienting clue.** Each cluster starts with two terms already connected and colored, so a student forms a hypothesis before touching anything. The task is confirmation and extension, not blind search.

**Bridges are the relationship layer.** A bridge term needs one link into each of its two clusters. After the first correct link it shows a dashed purple outline ("not done yet"); on completion it turns purple and reveals a one-line explanation of *why* it spans both concepts. That reveal is the pedagogical core — the game rewards articulating relationships, not just membership.

**Feedback is diagnostic, never punitive.** There is no mistake counter and no fail state. Wrong connections get a nudge that points back at the concept ("think about what those terms share"). Solved clusters and bridges each reveal a teaching fact, so the moment of success doubles as the teaching moment.

**The physics is part of the lesson — in Graph mode.** As bridges land, the force simulation physically pulls clusters together, so the finished graph *looks* like one integrated body of knowledge rather than separate islands. Sets mode makes the same point differently, without live physics: clusters are fixed circles from the moment the puzzle loads, and a completed bridge is simply a visible line drawn between two of them — same idea, a diagram rather than a settling motion.

## Want to add a puzzle, or work on the code?

This README sticks to what the game is and why it's built this way.
The technical details live in [docs/](docs/):

- **[docs/AUTHORING.md](docs/AUTHORING.md)** — the puzzle schema, how
  to add a puzzle, sizing/color guidance. Start here if you just want
  to add content.
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** — what each file
  does, known limitations, and the roadmap. Start here if you're
  working on the game's code.
