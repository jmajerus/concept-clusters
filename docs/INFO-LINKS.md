# Primary and see-also information links

Puzzle, catalogue, category, cluster, term, bridge, and related-puzzle `info`
can provide one primary reference and an ordered list of supplementary
references.

```js
info: {
  text: "How several institutions contribute to honest choice.",
  link: "https://www.acm.org/code-of-ethics",
  linkLabel: "ACM Code of Ethics",
  seeAlso: [
    {
      href: "https://www.ftc.gov/legal-library/browse/rules/negative-option-rule",
      label: "FTC negative-option rule"
    },
    {
      href: "https://www.aacsb.edu/educators/global-standards",
      label: "AACSB business-education standards"
    },
    "wiki:Business ethics"
  ]
}
```

## Semantics

- `link` is the best single starting point or defining reference.
- `linkLabel` optionally gives that primary link a specific visible name.
- `seeAlso` is an ordered list of additional references that contribute a
  distinct authority, perspective, example, or level of analysis.
- A see-also string uses the automatically derived label (`Wikipedia`,
  `Search`, or `Learn more`).
- A see-also object requires both `href` and `label`.
- Full URLs and the existing `wiki:Article Title` shorthand are supported in
  both `link` and `seeAlso`.

There is no hard maximum. As an editorial norm, use no more than three
see-also entries unless each additional source has a clear, non-duplicative
purpose. This is a relevance guardrail, not a schema limit.

## Backward compatibility

The older `extraLink` field remains valid. At runtime it is normalized as the
first see-also entry, before entries explicitly authored in `seeAlso`.
Existing puzzles therefore render unchanged and can be migrated gradually.
New content should use `seeAlso`.

## Rendering

The primary link remains adjacent to the information text. Supplementary links
appear after an explicit **See also:** label and preserve their authored order.
The same behavior applies to node hover/tap panels and overview information
surfaces.

## Validation

`npm run validate` checks that:

- `seeAlso`, when present, is a non-empty array;
- each entry is a non-empty string or a labeled `{ href, label }` object;
- primary and supplementary links are non-empty;
- duplicate destinations are not repeated within one information object;
- `linkLabel` is used only with a primary `link`.
