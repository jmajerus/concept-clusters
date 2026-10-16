# Concept Clusters

**[Play the live game →](http://clusters.majerus.us)**

An educational puzzle game built with D3. Players attach floating concept terms to partially built clusters; special *bridge* terms belong to multiple clusters and reveal why the concepts relate. Selected puzzles then reuse the completed map for *Concept Lenses*: short matching rounds that reveal cross-cutting attributes spanning the original groups. In short: **Build the categories. Connect the ideas. Change the lens.**

Four rendering modes share the same puzzle progress: Graph mode, a force-directed node-link diagram where each connection is drawn straight to whichever already-placed term you tapped; Star mode, the same board but with every connection drawn to its cluster's own label instead, trading some of Graph mode's tangle (and its hidden cluster names) for a more legible read; Circle mode, where clusters are fixed circles with bridges drawn as connecting lines between them; and Table mode, a spreadsheet of terms with diagonal cluster headings and one checkbox per membership. Players can switch between modes while solving or examining the completed puzzle.

Table keeps seed terms checked in their normal rows and shows bridges with a check for each connected cluster. Ideal bridge endpoints remain in the shared graph and appear in annotations once revealed. Arrow keys move between cells, Space checks a membership, and term names open details or participate in lens rounds.

Click a cluster heading to bring its confirmed memberships to the top, with a connected-term count that includes seeds and bridge connections. Once every term is connected, **Group by cluster** stacks labeled cluster groups and repeats shared bridges in each relevant group. **Alphabetical** restores one row per term in the single-table view. Completion does not automatically change that view's row order; the chosen order stays in place when switching to a diagram and back during the same visit.

**Separate completed clusters** optionally places working terms on the left and completed cluster groups on the right, with repeated column headings. A cluster moves when all its ordinary terms are placed, matching the game's completion feedback. Newly completed clusters appear at the top; later bridge connections update their groups without changing that order. Confirmed bridges also appear in completed groups, while unfinished bridges stay available in the working table. A fully connected bridge stays in the working table until at least one of its clusters completes, so it always remains visible. Narrow screens stack the completed panel below the working panel. This layout preference is remembered across puzzles and visits, and completion order is reconstructed from saved moves, including moves made in other modes.

Within each cluster view, ordinary terms remain alphabetical. Bridges appear directly beneath their revealed ideal endpoint with an indented ↳ glyph; bridges without a revealed endpoint appear alphabetically in a **Shared connections** section at the bottom. A bridge moves beneath its endpoint only after that endpoint is placed, preserving the puzzle's reveal timing.

An unchecked cell that cannot accept a connection briefly turns red, including cells in completed rows. Clicking an existing check briefly highlights its cluster color. **Remember incorrect choices** optionally keeps a gray × for incorrect choices, saved for that puzzle across reloads and mode switches. Repeated bridge rows share these notes. Turning the option off hides existing notes and stops recording new ones; **Start over** clears them.

**Show term info** adds a column of wrapped descriptions to the right of the cluster columns, leaving cells blank where no description is provided. This display preference is remembered across puzzles and visits. Bridge explanations and ideal-endpoint annotations retain their usual reveal timing.

This is a working prototype handed off from a Claude.ai design session. It runs by opening `index.html` directly in a browser — no build step, no server, no network required (D3 is vendored locally).

## Design brief (the decisions behind the code)

The authoring and storage model is grounded in the companion position paper,
[The Integrity Burden: Why Agentic Document Editing Belongs in the
Infrastructure, Not the Agent](https://github.com/jmajerus/write-domain-scoping).
The paper explains the rationale; this repository is a working example and
implementation.

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

**Feedback is diagnostic, never punitive.** There is no mistake counter and no fail state. Incorrect connections get a nudge that points back at the concept ("think about what those terms share"). Solved clusters and bridges each reveal a teaching fact, so the moment of success doubles as the teaching moment.

**Physics assists in arranging the results in a clear and readable way.** The three diagram modes run a live force simulation to keep nodes and clusters legible as connections are made, rather than letting them pile up or overlap — Graph and Star modes each settle the whole node-link board from a cold start (Graph pulling a newly-connected term toward whichever term it was linked to, Star pulling it toward its cluster's label instead), while Circle mode only has to arrange the clusters and bridges, since docked terms stay fixed relative to their own circle. One visible consequence in Graph and Star modes: as bridges land, previously separate clusters visibly drift together into place. Table mode keeps its rows and columns fixed and does not run a simulation.

## Want to add a puzzle, or work on the code?

This README sticks to what the game is and why it's built this way.
The technical details live in [docs/](docs/):

- **[docs/AUTHORING.md](docs/AUTHORING.md)** — the governing workflow and
  design judgment for adding or reviewing a puzzle. Detailed field mechanics
  and edge cases are in **[docs/AUTHORING-REFERENCE.md](docs/AUTHORING-REFERENCE.md)**.
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

------
*This project was developed with the aid of generative AI assistants and tools, including the following:*
*ChatGPT web, Claude Code, Claude web, Cline, Cloudflare, Codex, Copilot, Copilot Autofix, Copilot CLI, Cursor, Deepseek, Gemini CLI, Gemini web, GLM, Google AI, Grok, Kilo Code, Kimi, Llama, Ollama, OpenClaw, Perplexity, Qwen, ZCode*

*This project is licensed under the PolyForm Noncommercial License 1.0.0.*
