# Concept Clusters

**[Play the live game →](http://clusters.majerus.us)**

An educational puzzle game built with D3. Players attach floating concept terms to partially built clusters; special *bridge* terms belong to multiple clusters and reveal why the concepts relate. Selected puzzles then reuse the completed map for *Concept Lenses*: short matching rounds that reveal cross-cutting attributes spanning the original groups. In short: **Build the categories. Connect the ideas. Change the lens.**

Three rendering modes share the same underlying mechanic: Graph mode, a force-directed node-link diagram where each connection is drawn straight to whichever already-placed term you tapped; Star mode, the same board but with every connection drawn to its cluster's own label instead, trading some of Graph mode's tangle (and its hidden cluster names) for a more legible read; and Circle mode, where clusters are fixed circles with bridges drawn as connecting lines between them.

This is a working prototype handed off from a Claude.ai design session. It runs by opening `index.html` directly in a browser — no build step, no server, no network required (D3 is vendored locally).

## Design brief (the decisions behind the code)

These choices were deliberate; preserve them unless there's a reason not to.
A condensed version of the authoring-relevant points below ships to AI
authors directly through the MCP servers' `get_authoring_guidance` tool
(`modules/authoringDesignGuidance.js`) — if this section changes in a way
that affects what makes a puzzle good, check whether that file drifted
out of sync with it.

**No trap words.** Every term belongs unambiguously to its declared cluster(s). In entertainment puzzles (NYT Connections), ambiguity is the game; in an educational tool it punishes students for making *correct* associations, which is backwards pedagogically. Challenge should come from knowing the concepts, not disambiguating wordplay.

**Seed pairs are the orienting clue.** Each cluster starts with two terms already connected and colored, so a student forms a hypothesis before touching anything. The task is confirmation and extension, not blind search.

**Bridges are the relationship layer.** A bridge term needs one link into each of its two clusters. After the first correct link it shows a dashed purple outline ("not done yet"); on completion it turns purple and reveals a one-line explanation of *why* it spans both concepts. That reveal is the pedagogical core when a genuine relationship belongs in the puzzle — bridges are optional, and should not be manufactured merely to force every cluster into one connected graph.

**Lenses reveal secondary structure.** On puzzles that benefit from them,
solving the map begins a succession of cross-cluster prompts over the same
fixed layout. Correct selections, missed associations, and extra selections
are revealed diagnostically, followed by a short explanation. Lenses are
optional: they belong only where another classification adds genuine
understanding.

**Feedback is diagnostic, never punitive.** There is no mistake counter and no fail state. Wrong connections get a nudge that points back at the concept ("think about what those terms share"). Solved clusters and bridges each reveal a teaching fact, so the moment of success doubles as the teaching moment.

**Physics assists in arranging the results in a clear and readable way.** All three modes run a live force simulation to keep nodes and clusters legible as connections are made, rather than letting them pile up or overlap — Graph and Star modes each settle the whole node-link board from a cold start (Graph pulling a newly-connected term toward whichever term it was linked to, Star pulling it toward its cluster's label instead), while Circle mode only has to arrange the clusters and bridges, since docked terms stay fixed relative to their own circle. One visible consequence in Graph and Star modes: as bridges land, previously separate clusters visibly drift together into place.

## Want to add a puzzle, or work on the code?

This README sticks to what the game is and why it's built this way.
The technical details live in [docs/](docs/):

- **[docs/AUTHORING.md](docs/AUTHORING.md)** — the puzzle schema, how
  to add a puzzle, sizing/color guidance. Start here if you just want
  to add content.
- **[docs/CATALOGUES.md](docs/CATALOGUES.md)** — curated collections,
  overlapping puzzle membership, Library navigation, and catalogue URLs.
- **[docs/JSON-LD.md](docs/JSON-LD.md)** — portable puzzle/catalogue
  interchange, validation, export, and one-command puzzle publication.
- **[docs/MCP.md](docs/MCP.md)** — local AI-assisted authoring tools,
  durable drafts, validation previews, and approval-gated publication.
- **[docs/MCP-REMOTE.md](docs/MCP-REMOTE.md)** — Access-protected Cloudflare
  MCP authoring with D1 drafts, approval-gated GitHub pull requests, and
  deployment setup.
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** — what each file
  does, known limitations, and the roadmap. Start here if you're
  working on the game's code.
