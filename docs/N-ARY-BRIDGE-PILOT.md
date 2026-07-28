# N-ary bridge pilot

## Purpose

Concept Clusters has historically represented every bridge as a binary
edge: one term connected to two clusters. This pilot tests a narrower
claim before generalizing the schema further:

> Some concepts are genuinely three-part relations, and decomposing
> them into pairwise bridges changes the lesson.

The first test case is Lacan's Borromean knot across the Imaginary,
Symbolic, and Real. The knot's point is the joint organization of all
three rings; no isolated pair expresses the same structure.

## Scope

The validator permits bridge arity 2 or 3. Runtime logic is written in
an arity-neutral way where practical, but four-way and larger bridges
remain deliberately unauthorable until the ternary mechanic has been
observed in real play.

The pilot does not add:

- per-leg `relationKind` values;
- a separate hyperedge node type;
- a new scoring system;
- a bridge-progress badge on the node itself;
- permission to use ternary bridges merely because a term recurs widely.

## Data shape

```js
{
  term: "Borromean knot",
  clusters: [0, 1, 2],
  fact: "One collective explanation of the three-way relation.",
  idealTerms: [null, null, null] // optional; usually omit
}
```

`idealTerms`, when present, must have one entry per cluster index and
uses the same ordering.

## Gameplay

The interaction remains one connection at a time:

1. Select the bridge term.
2. Connect it to one valid cluster.
3. Reselect it and connect another.
4. Complete it only after the third valid cluster.

Before the first connection, the node does not reveal that it is a
bridge or disclose its arity. Once partially solved, normal bridge
styling appears and the status message reports `1 of 3` or `2 of 3`.
Its fact is revealed only after all three sides are complete.

Graph mode anchors a partially solved bridge to the centroid of its
confirmed memberships. Star mode already draws one spring and one line
per confirmed membership. Circle mode renders the bridge pill as a
shared hub with one spoke to each connected circle.

## Authoring test

A proposed ternary bridge should satisfy all of these:

1. One fact explains the entire relationship.
2. Removing one participant materially changes the concept.
3. One collective `relationKind` fits, or the field is honestly unset.
4. The third connection adds understanding rather than repetition.

If the relation has different meanings on different legs, it is not one
ternary bridge. Use binary bridges instead.

## Playtesting questions

- Do players understand after the first connection that more than one
  destination remains?
- Is the third connection an insight, or merely another required tap?
- Does the dashed partial styling remain clear after two correct sides?
- Do Graph, Star, and Circle modes all communicate one shared relation
  rather than three unrelated pairwise relations?
- Does a ternary bridge dominate the progress meter or perceived puzzle
  importance?
- Do incorrect attempts rise because of conceptual difficulty or because
  arity is insufficiently visible?

## Exit criteria

Keep the feature if the Borromean-knot puzzle demonstrates a lesson that
binary bridges cannot express and the third connection remains legible
and satisfying. Otherwise revert the schema support and retain the
three-way relation as a post-solve synthesis explanation.
