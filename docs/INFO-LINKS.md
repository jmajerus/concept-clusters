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

## Citations

Puzzle-level, cluster-level, term (`termInfo`), and bridge `info` can also
carry an ordered `citations` list — structured bibliographic references,
rendered as a formal footnote-style block distinct from `seeAlso`'s inline
link list. Not available on catalogue, category, or subcategory `info`,
which use a separate, narrower authoring schema.

```js
info: {
  text: "James Carse's distinction between games played to end and games
         played only to keep the playing going.",
  link: "wiki:Finite and Infinite Games",
  citations: [
    {
      author: "Carse, James P.",
      title: "Finite and Infinite Games",
      publisher: "Free Press",
      year: "1986"
    }
  ]
}
```

- `title` is required and non-empty; every other field (`author`,
  `publisher`, `year`, `pages`, `url`) is optional.
- Unlike `seeAlso`, a citation is always a structured object — never a bare
  string. There's no shorthand for a footnote the way `wiki:Title` is
  shorthand for a verified link.
- `year` and `pages` are strings, not numbers (`"1986"`, not `1986`).
- `url`, if present, accepts the same `wiki:Article Title` shorthand or full
  URL as `link`/`seeAlso`, and makes the whole formatted citation clickable;
  without a `url`, a citation renders as plain text.
- Citations do not inherit from a cluster to its terms — same rule as
  `text`/`extraLink`. A cluster's own `info.citations` also has no
  rendering surface in the app today (the same limitation `seeAlso`
  already has at cluster level); author it only if the JSON-LD data
  itself has independent value.

## Rendering

The primary link remains adjacent to the information text. Supplementary links
appear after an explicit **See also:** label and preserve their authored order.
The same behavior applies to node hover/tap panels and overview information
surfaces. A citation renders as its own small block below that content, one
line per citation, in authored order. Star-mode cluster-title hover and
Set/Circle-mode cluster-info hover render neither `seeAlso` nor `citations`
today — a pre-existing limitation of those two panels' stripped info shape.

Terms and bridge terms normally receive an automatic Wikipedia search when no
primary link is authored. A bridge with `termRole: "connector"` is the explicit
exception: contextual connecting tissue does not receive that fallback. Its
authored text, primary link, supplementary links, and citations are unaffected;
with none of those present, hovering it opens no empty information panel.

## Validation

`npm run validate` checks that:

- `seeAlso`, when present, is a non-empty array;
- each entry is a non-empty string or a labeled `{ href, label }` object;
- primary and supplementary links are non-empty;
- duplicate destinations are not repeated within one information object;
- `linkLabel` is used only with a primary `link`;
- `citations`, when present, is a non-empty array of objects, each with a
  non-empty `title` and any other fields non-empty strings when present.
