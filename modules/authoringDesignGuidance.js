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
- A bridge's optional relationKind (dynamic, foundation, cross-cutting,
  contrast, continuity, or evaluation) classifies the connection its fact
  describes, never the term in isolation. Leave it unset unless a bridge
  clearly fits one of the six -- unset never implies a weaker bridge, and
  forcing a classification onto a genuinely ambiguous bridge is worse than
  leaving it unset. contrast and cross-cutting are the pair most often
  confused: contrast is the clusters actively disagreeing or offering
  competing explanations about the concept; cross-cutting is the same
  concept simply recurring, or functioning differently, across them
  without either side contradicting the other.
- A binary bridge's optional direction (through, bidirectional, outward,
  inward; ternary bridges stay undirected) asserts a directional topology
  on top of relationKind, independent of it. Add it only when reversing
  the arrow would make the bridge's fact false or materially change its
  meaning -- omission is the normal case, not a gap, and shared
  foundations, contrasts, and genuinely unspecified connections should
  stay undirected rather than defaulting to a direction for its own sake.
- lenses default to sequential rounds (reclassify targets, check, read an
  explanation), but lensMode can be "quiz" (multiple-choice, one correct
  answer) or "assignment" (comparative classification across two or more
  lenses at once) when the pedagogy actually calls for it -- pick based on
  whether the round is open reclassification, a single best-answer
  question, or a compare-and-contrast task, not by default. preSolve: true
  skips straight to the lens phase when sorting the clusters is a foregone
  conclusion once the terms are named, making the lens the real point of
  the puzzle -- a narrow, deliberate exception, not something to reach for
  by default.
- The Trivia category specifically leans toward lensMode: "quiz" and
  preSolve: true: trivia is usually about testing specific factual recall
  rather than discovering how terms cluster, so the sort is often a
  foregone conclusion once the terms are named and the quiz is the real
  content. Treat this as a lean for that one category, not a rule -- a
  Trivia puzzle built around a genuine categorical distinction should
  still use open clustering when that's the more honest structure.
- A lens must earn a "cross-cutting" claim: ask whether a player could
  answer mostly by selecting one existing cluster's color. If so, either
  that concentration is the intended lesson (a reinforcing or hybrid lens,
  which is a legitimate purpose on its own) or the prompt needs to draw
  more evenly from several clusters to actually cut across the map.
- learningIntroduction ("Before You Begin") is optional pre-puzzle
  preparation -- domain knowledge, vocabulary, framing, a reflection
  question -- never gameplay instructions or a preview of the solution.
  Its requirement level changes real behavior: optional and recommended
  both leave the board reachable without reading (recommended just leads
  with the invitation first), required holds the board until it's marked
  read. Reserve required for when the puzzle genuinely depends on that
  source, not as a default -- most introductions should be optional or
  recommended.
- relatedPuzzles is an optional, informal, one-directional "try this next"
  list shown once a puzzle (including its lenses, when present) is fully
  complete -- not a formal graph, and not required to be reciprocal. Each
  entry needs a real puzzle id and a reason written as a reason to click
  that specific puzzle, not a restatement of what it's about.
- A category may optionally register subcategories once it has enough
  puzzles to benefit from a recognizable internal split (field, period,
  genre) -- subject classification only, never difficulty or a curated
  sequence, and only one subcategory per category membership. Most
  categories don't need this; add it only when the category-browse screen
  would genuinely benefit from the extra level, not as routine polish.
- Verify a wiki: link before writing it, don't infer it from the title
  alone: a short or common-word title often has an unrelated Wikipedia
  article at that exact name (a unit, a person, an ordinary noun --
  "consumers" resolving to the economics article instead of the
  food-chain one is a real example from this project). A confidently
  wrong link is worse than the plain-string auto-search fallback, because
  the wrong link fails silently and looks checked when it isn't. If the
  article can't be fetched and confirmed to match this puzzle's meaning
  of the term, leave it as a plain string rather than guessing a \`link\`.`;
