// Shared between the local stdio and hosted authoring MCP servers. A draft
// that passes validate_puzzle_draft can still be a bad puzzle -- this is the
// design judgment that tells the two apart, distilled from README.md's
// "Design brief" and docs/AUTHORING.md's "Design rules". Keep those two the
// canonical, fuller statements; if either changes, check whether this
// condensed version drifted out of sync with it.
export const AUTHORING_DESIGN_GUIDANCE = `## Design judgment (not just schema validity)

- No trap words: every term must belong unambiguously to its declared
  cluster(s). Ambiguity is noise here, not challenge -- if two clusters
  could both plausibly claim a term, the term is wrong, not clever.
- Seed pairs are the orienting clue: choose the two most instantly
  recognizable terms in each cluster as its seeds, leaving the least
  obvious term as the "aha" the player has to work out.
- Bridges must be genuine, and are optional: a bridge should encode a real
  conceptual connection, never a trick or a link manufactured just to make
  the cluster graph connected. A puzzle with no bridges, or with bridges
  that leave separate components, is fine -- every board mode renders that
  honestly rather than hiding it.
- A lens must earn a "cross-cutting" claim: ask whether a player could
  answer mostly by selecting one existing cluster's color. If so, either
  that concentration is the intended lesson (a reinforcing or hybrid lens,
  which is a legitimate purpose on its own) or the prompt needs to draw
  more evenly from several clusters to actually cut across the map.
- Verify a wiki: link before writing it, don't infer it from the title
  alone: a short or common-word title often has an unrelated Wikipedia
  article at that exact name (a unit, a person, an ordinary noun --
  "consumers" resolving to the economics article instead of the
  food-chain one is a real example from this project). A confidently
  wrong link is worse than the plain-string auto-search fallback, because
  the wrong link fails silently and looks checked when it isn't. If the
  article can't be fetched and confirmed to match this puzzle's meaning
  of the term, leave it as a plain string rather than guessing a \`link\`.`;
