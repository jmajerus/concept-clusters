# Ordered information links

Puzzle, cluster, term, bridge, and related-puzzle `info` carry one ordered
`links` list. Catalogue and category `info` still use the narrower
`text` / `link` / `extraLink` shape.

```js
info: {
  text: "How several institutions contribute to honest choice.",
  links: [
    { href: "https://www.acm.org/code-of-ethics", label: "ACM Code of Ethics" },
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

- `links` is ordered by pertinence. The first entry is the best starting
  point; later entries are further reading.
- An entry may be a URL or `wiki:Article Title` string, or `{ href, label? }`.
  A string (and an object without `label`) uses the automatically derived
  label (`Wikipedia`, `Search`, or `Learn more`).
- Full URLs and `wiki:Article Title` shorthand are both valid. An optional
  `#Section heading` fragment on a `wiki:` link is preserved
  (`wiki:Irony#Dramatic irony`).

Play still shows the first link beside the note and the rest after an
explicit **See also:** label. There is no hard maximum. As an editorial
norm, keep the list short unless each extra source has a clear,
non-duplicative purpose.

Citations stay a separate structured list. They are not links.

## Backward compatibility

`link`, `linkLabel`, `extraLink`, and `seeAlso` still play on published
puzzles. They are a load-time fold into `links`, not authoring fields.
The advertised write schema (MCP `get_authoring_schema`) lists `links`
only. Leftover names fold before that schema parse when a document enters
a draft, so old files still load. Opening the editor does not rewrite
published files. The first whole-document write persists `links`.

## Citations

Puzzle `info` can carry an ordered `citations` list — structured
bibliographic references for the work the puzzle is based on, rendered as
a formal footnote-style block distinct from `links`. Cluster, term, and
bridge `info` do not; leftover nested citations still play, and fold up
to the puzzle when a draft enters the editor. The lesson
(`learningIntroduction`) can keep its own footnotes. Lesson further-reading
uses the same `links` entry shape. Leftover `sources` still play; they are
not an authoring field. Not available on
catalogue, category, or subcategory `info`, which use a separate, narrower
authoring schema.

```js
info: {
  text: "James Carse's distinction between games played to end and games
         played only to keep the playing going.",
  links: ["wiki:Finite and Infinite Games"],
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
  `publisher`, `year`, `pages`, `url`) is optional. Library search matches
  `author` and `title` (so a puzzle based on a book is findable by the
  author's name, including `Shay, Jonathan` via "Jonathan Shay").
- Unlike `links`, a citation is always a structured object — never a bare
  string. There's no shorthand for a footnote the way `wiki:Title` is
  shorthand for a verified link.
- `year` and `pages` are strings, not numbers (`"1986"`, not `1986`).
- `url`, if present, accepts the same `wiki:Article Title` shorthand or full
  URL as `links`, and makes the whole formatted citation clickable; without
  a `url`, a citation renders as plain text.
- Citations do not inherit from a cluster to its terms — they are not
  authored there. Source support belongs on the puzzle, and on the lesson.

## Rendering

The first link remains adjacent to the information text. Remaining links
appear after an explicit **See also:** label and preserve their authored
order. The same behavior applies to node hover/tap panels, overview
information surfaces, and cluster hover. A citation renders as its own
small block below that content, one line per citation, in authored order.

Terms and reference bridge terms no longer receive an automatic Wikipedia
search when no link is authored. That missing-link fallback is deprecated:
it looked like a unique destination and often landed on the wrong sense or
a disambiguation page. Prefer a verified direct link that serves the
puzzle's lesson. Provide help at the appropriate level of granularity:
cluster-sized help on the cluster, term-sized help on a term. Omitting a
link means no chip; author a Wikipedia search URL as the first `links`
entry only when the results page itself is the exploration surface this
lesson needs. A bridge with `termRole: "connector"` receives no automatic
search because it is not itself an intended object of learning in this
puzzle; its grammar, familiarity, and independent notability do not decide
that role. It receives no authored `links` either. A concise `info.text`
is often useful to clarify what the connector is doing locally. Do not add
citations; source support belongs with the puzzle's lesson content. With
no description present, hovering it opens no empty information panel.

## Validation

`npm run validate` checks that:

- `links`, when present, is a non-empty array;
- each entry is a non-empty string or `{ href, label? }` object;
- connector bridges have no `links`, `link`, `extraLink`, `seeAlso`, or
  `citations`;
- `linkLabel` is used only with `link` or `links`;
- `citations`, when present, is a non-empty array of objects, each with a
  non-empty `title` and any other fields non-empty strings when present.
