# Direct-to-cluster bridges

**Status: on hold. Explored in conversation on 2026-09-04, put aside as a
potential future upgrade with unresolved issues below -- not scoped, not
started.**

## The question this answers

Today, completing a bridge takes real wiring effort on each side, not just
correct identification. This brief explores dropping that wiring
requirement for a specific bridge variant while keeping the underlying
concept -- a term genuinely belonging to more than one cluster -- unchanged.
It does **not** propose replacing bridges with plain relationship edges
between two otherwise-unrelated terms; that idea came up early in the
conversation and was explicitly rejected in favor of this narrower one.

## Current model (recap, confirmed by reading the code)

- A bridge is not a connector node sitting *between* two clusters -- it's a
  node that genuinely belongs to more than one. `isBridge` is just
  `n.gs.length > 1` ([game.js:845](../../game.js#L845)). An ordinary node
  has one cluster in `gs`; a bridge has two or three.
- Completing a bridge requires one explicit connection per membership:
  select the bridge, tap an already-`isDone` node in a cluster it belongs
  to, repeat per cluster
  ([modules/gameLogic.js:188-236](../../modules/gameLogic.js#L188-L236)).
  Bridges cannot connect to other bridges (line 190: "Connect to a
  solid-colored cluster node instead").
- Critically, the tapped target must already be `isDone`. Every cluster's
  seed starts `isDone`, but any other node only becomes eligible once a
  chain of prior intra-cluster connections has already reached it. So
  connecting a bridge to anything but the seed presupposes that cluster's
  tree has already been partly built -- an *intermediate node* on that side
  of the connection, in the sense this conversation used the term.
- A bridge's hexagon shape is deliberately hidden until it's
  partial/done, specifically so the shape itself doesn't spoil "this is a
  bridge" before the player interacts with it
  ([modules/puzzleGraph.js](../../modules/puzzleGraph.js), see the
  `bridgePoints` comment).
- All three render modes (Graph, Star, Sets/Circle) show every node from
  the start -- Graph via a force simulation, Star/Sets via a "free strip"
  that a node graduates out of once it gets its first connection. Graph
  mode has no fixed per-cluster region; Star and Sets anchor each cluster
  to a stable arc from its seed's placement
  ([modules/starRenderer.js:1608](../../modules/starRenderer.js#L1608)).
- Ternary bridges (arity 3) already exist as a separate, deliberately
  narrow pilot -- see
  [N-ARY-BRIDGE-PILOT.md](../N-ARY-BRIDGE-PILOT.md). This brief did not
  revisit how (or whether) direct-to-cluster attachment interacts with
  arity-3 bridges; treat that as untouched, not decided either way.

## The mechanic explored here

A *direct-to-cluster* bridge keeps the same data shape and the same
dual-membership premise (`clusters: [i, j]`, a real shared term). What
changes is the connection requirement on each side: the tapped target can
be **any** node currently belonging to that cluster, not necessarily one
that's already `isDone`, and not necessarily the authored "ideal" endpoint.
The dependency on that cluster's tree having already been built out is
dropped entirely -- the bridge can be wired in from turn one, regardless of
what else has or hasn't been connected yet.

Two presentation changes follow from that, not independent of it:

- **Pre-render the hexagon shape immediately**, rather than concealing it
  until partial/done. The existing concealment logic assumes the first
  connection is always the reveal moment; a direct-to-cluster bridge has
  no equivalent gated moment, so showing the shape upfront is not a bigger
  spoiler than the mechanic already is -- it tells the player how to
  interact with something that behaves differently before they fumble at
  it as an ordinary pill.
- **Disable Graph mode on any board that includes a direct-to-cluster
  bridge.** Star and Sets both give each cluster a fixed home from the
  start (an arc anchored by its seed), so a direct-to-cluster bridge has a
  natural resting place to pre-render into -- straddling the boundary
  between the two clusters' arcs. Graph mode is force-directed with no
  such fixed per-cluster region; an unwired node has nothing pulling it
  into a meaningful position, so pre-rendering its shape there wouldn't
  convey which two clusters it spans. This reasoning was offered in
  conversation but **not explicitly confirmed by the user** -- verify it
  (or get the real reason) before building on it.

## Open issues (why this is on hold)

1. **Graph-mode exclusion rationale unconfirmed.** The reasoning above is
   an inference, not something the user signed off on. Could also be a
   legibility/spoiler concern rather than a layout-feasibility one, which
   would change how firm the exclusion needs to be.
2. **Side effects of tapping an undone target are undecided.** When the
   tapped cluster node isn't yet `isDone`, does the tap award the bridge's
   membership on that side and leave the tapped node exactly as unbuilt as
   it was -- or does it also mark that node connected/placed as a
   byproduct? This changes what `state.made`/`state.need` count, what
   `moveHistory` records, and whether a direct-to-cluster bridge can be
   used to shortcut building the rest of that cluster's tree. Asked in
   conversation; not yet answered.
3. **Where the "direct-to-cluster" flag lives is unspecified.** Per-bridge
   (`attachment: "direct"` on the bridge entry) or per-board? The Graph-mode
   exclusion was phrased as "boards that include direct-to-cluster
   bridges," which implies a board-level consequence even if the flag
   itself is authored per-bridge -- not yet designed either way.
4. **Difficulty/reward rebalancing.** Removing the prior-tree-progress
   dependency makes a bridge strictly cheaper to complete than today's
   version. Whether that needs a smaller reward/lighter visual weight (the
   same concern raised earlier in the conversation about a *separate*,
   rejected idea -- direct relationship edges with no shared node -- may
   still apply here in a milder form) hasn't been discussed.
5. **`canonicalBridgeHit`/ideal-endpoint messaging is unresolved.** Today,
   tapping the authored ideal endpoint earns distinct praise text
   ([modules/gameLogic.js:213](../../modules/gameLogic.js#L213)). If any
   node in the cluster is a valid target, does the "ideal" concept still
   apply, and does the reward message still make sense unchanged?
6. **Validation rules not designed.** `contentValidation.js`'s existing
   bridge checks (arity 2-3, etc.) would need a corresponding rule for
   whatever the direct-to-cluster flag turns out to be, and for the
   Graph-mode-exclusion consequence if that's enforced at validation time
   rather than just at render time.
7. **Star/Sets boundary placement is unspecified.** "Sits at the boundary
   between the two clusters' arcs" is a sketch, not a layout spec -- needs
   real design against `starRenderer.js`/`setRenderer.js`'s actual arc/free
   strip math before this is buildable.

## Explicitly not this

A relationship edge directly between two ordinary, single-cluster terms
(no shared node at all) was raised and set aside early in the conversation
-- the user confirmed the motivating case is a term that is genuinely a
member of each cluster, i.e. a real bridge, not a synthetic link between
two otherwise-unrelated concepts. If that idea resurfaces later, it's a
different brief from this one.
