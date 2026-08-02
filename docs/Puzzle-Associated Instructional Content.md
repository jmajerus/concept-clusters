# Puzzle-Associated Instructional Content



> It seems that Concept Clusters could be more effective as a teaching platform if there were optional instructional content that preceded and was tailored to the associated puzzle?

Yes. This could substantially strengthen Concept Clusters as a teaching platform, provided the instructional content **prepares learners without revealing the puzzle’s conceptual structure**.

The puzzle currently asks learners to discover relationships through categorization, mapping, bridges, and lenses. A short instructional layer could supply the background knowledge needed to make that discovery meaningful rather than arbitrary.

## A useful model: “Learn, Explore, Consolidate”

### 1. Learn

Before the puzzle, the learner encounters a compact, puzzle-specific introduction. It might contain:

- a short explanation or narrative;
- essential vocabulary;
- a diagram, image, quotation, or brief source excerpt;
- one or two illustrative examples;
- a question that establishes the puzzle’s central problem.

This should teach the **domain knowledge**, but generally not disclose:

- the final clusters;
- the exact concept-to-cluster assignments;
- bridge relationships;
- lens assignments;
- the intended map structure.

For example, an introductory Public Health puzzle might explain that public-health decisions operate at several scales, from individual behavior to institutions and population-level conditions. It would not announce which nodes belong in “prevention,” “surveillance,” or “health infrastructure.”

### 2. Explore

The learner then plays the puzzle. The instructional material gives them enough footing to reason, while the puzzle remains the place where the conceptual organization is discovered.

The introductory content could remain accessible through a **Review lesson** or **Reference** button. That would reduce memory demands without forcing the learner to leave the puzzle.

### 3. Consolidate

The existing post-solution lenses and explanatory material can perform a different function: interpretation after discovery.

That produces a strong instructional sequence:

> **Preparation → active organization → explanation and transfer**

Pre-puzzle instruction answers, “What do I need to know?”  
The puzzle asks, “How do these ideas relate?”  
Post-puzzle content asks, “What does this structure help us understand?”

## Instruction should be optional at several levels

“Optional” could mean more than simply allowing authors to omit it.

An author might configure a puzzle as:

- **No introduction** — the present experience.
- **Optional introduction** — offered before play but skippable.
- **Recommended introduction** — prominently offered, especially for unfamiliar subject matter.
- **Required introduction** — appropriate for a guided course or when the puzzle depends on specific source material.

Learners might also be able to select:

- **Start puzzle**
- **Read introduction first**

A returning learner could bypass content they have already completed.

## The content should probably be structured, not just one large HTML field

A simple rich-text field would be enough for an initial implementation, but a block-based structure would provide a better foundation:

```json
"instruction": {
  "mode": "optional",
  "title": "Before You Begin",
  "estimatedMinutes": 4,
  "blocks": [
    {
      "type": "markdown",
      "content": "Public health works at both individual and population scales..."
    },
    {
      "type": "definition",
      "term": "Population health",
      "content": "The health outcomes of a group and how those outcomes are distributed."
    },
    {
      "type": "image",
      "src": "...",
      "alt": "Diagram showing levels of public-health intervention",
      "caption": "Public-health interventions can operate at multiple levels."
    },
    {
      "type": "reflection",
      "prompt": "Which kinds of intervention become visible only when we examine a population rather than one person?"
    }
  ]
}
```

Possible block types could eventually include:

- `markdown`
- `definition`
- `example`
- `quotation`
- `image`
- `sourceExcerpt`
- `callout`
- `reflection`
- `knowledgeCheck`
- `video` or `embed`

A conservative first version might support only `markdown`, `image`, and `reflection`, while leaving the schema extensible.

## The most important authoring principle

The introduction should be evaluated for **solution leakage**.

An authoring guide could distinguish three kinds of information:

| Content type                                    | Appropriate before play? |
| ----------------------------------------------- | ------------------------ |
| Facts and vocabulary needed to understand nodes | Yes                      |
| Context explaining why the subject matters      | Yes                      |
| Examples not duplicated in the puzzle           | Usually                  |
| Names of the puzzle’s clusters                  | Usually no               |
| Statements pairing nodes with clusters          | No                       |
| Explicit bridge relationships                   | No                       |
| Interpretation supplied by later lenses         | Usually no               |

There could even be an author checklist:

> After reading the introduction, does the learner understand the subject better while still needing to solve the puzzle?

## Instruction could be tailored more precisely than one introduction per puzzle

Later, this feature could support several valuable extensions:

### Difficulty-sensitive introductions

A novice version could provide definitions and examples. An expert version might offer only a source excerpt or framing question.

### Hint integration

The instructional blocks could be linked to puzzle concepts. A learner struggling with a node could request contextual help without being told its placement.

```json
{
  "conceptId": "herd-immunity",
  "instructionRef": "population-protection-definition"
}
```

### Source-based puzzles

For puzzles derived from a book chapter, article, historical document, or scientific source, the pre-puzzle section could serve as a curated reading. This would be especially useful for the planned puzzles based on *Deceptive Design* and for misinformation-focused catalogues.

### Catalogue-level learning sequences

A catalogue could eventually have:

- a catalogue introduction;
- module or subcategory introductions;
- puzzle-specific instruction;
- cumulative puzzles;
- concluding synthesis.

That would allow Concept Clusters to operate not merely as a collection of puzzles but as a lightweight curriculum platform.

## A particularly promising distinction

It may help to name this feature something broader than **instructions**, since “instructions” can sound like gameplay directions. Possibilities include:

- **Learning Introduction**
- **Before You Begin**
- **Puzzle Primer**
- **Learning Brief**
- **Background**
- **Preparation**

At the schema level, `learningContent` or `prePuzzleContent` would be less ambiguous than `instructions`.

My preference would be:

- UI label: **Before You Begin**
- Authoring/schema concept: **learning introduction**
- JSON property: `learningIntroduction`

This feature would preserve the distinctive discovery-based character of Concept Clusters while making the puzzles usable for learners who do not already possess the background knowledge that an expert author may unconsciously assume.

------

I think **outboard instructional files should be supported**, especially if the learning layer may include substantial prose, images, diagrams, transcripts, or source excerpts.

The existing architecture already treats each puzzle as a self-contained JavaScript data module under `puzzles/<category>/`. That remains appropriate for the puzzle’s essential structural data, but it need not require every associated teaching asset to be embedded in the same module.

## Recommended principle

A puzzle should remain a **small, readable manifest** that may either:

1. contain brief instructional content inline; or
2. refer to one or more accompanying files.

That gives authors a convenient inline form for short introductions without penalizing richer lessons.

```js
learningIntroduction: {
  mode: "optional",
  title: "Before You Begin",
  content: {
    type: "markdown",
    src: "./energy-flow.intro.md"
  }
}
```

For a small introduction:

```js
learningIntroduction: {
  mode: "optional",
  title: "Before You Begin",
  content: {
    type: "markdown",
    text: `
Energy moves through an ecosystem while matter is recycled...
`
  }
}
```

The two forms could normalize internally to the same representation.

## Prefer puzzle-relative files

I would make relative local references the standard:

```text
puzzles/
  science/
    energy-flow/
      puzzle.js
      introduction.md
      energy-pyramid.svg
      food-web.jpg
```

Or, while retaining the present flat puzzle layout:

```text
puzzles/
  science/
    energy-flow.js
    energy-flow.intro.md
    energy-flow.assets/
      energy-pyramid.svg
```

The directory-per-puzzle model will probably age better once puzzles acquire multiple associated resources:

```text
puzzles/science/energy-flow/
├── puzzle.js
├── introduction.md
├── teacher-notes.md
├── sources.json
└── assets/
    ├── energy-pyramid.svg
    └── trophic-levels.webp
```

This creates a natural **puzzle package**, even though it is stored as ordinary files during development.

## A content-reference shape

Rather than having a special field only for Markdown files, I would define a reusable content source:

```js
learningIntroduction: {
  mode: "optional",
  title: "Before You Begin",
  estimatedMinutes: 5,
  content: {
    src: "./introduction.md",
    mediaType: "text/markdown"
  }
}
```

Possible content sources:

```js
// Inline text
{
  text: "Brief instructional content...",
  mediaType: "text/markdown"
}
// Puzzle-relative file
{
  src: "./introduction.md",
  mediaType: "text/markdown"
}
// Structured outboard lesson
{
  src: "./introduction.json",
  mediaType: "application/vnd.concept-clusters.lesson+json"
}
// External resource
{
  href: "https://example.org/resource",
  mediaType: "text/html"
}
```

I would distinguish `src` from `href` deliberately:

- `src` means the resource is part of the puzzle package and should be loadable, exportable, and preservable with it.
- `href` means an external destination that may change or disappear and is not itself part of the puzzle.

That distinction will matter greatly for import/export and archival reliability.

## Images and other assets should also be outboard

Large binary assets should almost never be embedded in the puzzle file.

A structured lesson might refer to them as follows:

```json
{
  "blocks": [
    {
      "type": "markdown",
      "text": "Energy diminishes at successive trophic levels."
    },
    {
      "type": "image",
      "src": "./assets/energy-pyramid.svg",
      "alt": "An energy pyramid showing decreasing energy at higher trophic levels",
      "caption": "Only part of the energy at one level becomes available to the next."
    }
  ]
}
```

This avoids:

- enormous JavaScript or JSON files;
- base64-encoded images;
- difficult diffs;
- duplicated assets;
- awkward authoring;
- loading everything before the learner asks to view it.

The application could lazy-load the learning content only when the learner opens **Before You Begin**.

## Puzzle integrity versus content availability

The core puzzle should still work when optional instructional content cannot be loaded.

That suggests three separate states:

```js
learningIntroduction: {
  requirement: "optional", // "optional" | "recommended" | "required"
  content: {
    src: "./introduction.md",
    mediaType: "text/markdown"
  }
}
```

For optional or recommended material, a missing file should produce a visible but nonfatal message.

For required material, failure to load it should prevent the learning sequence from beginning, though perhaps still permit a clearly labeled direct-puzzle fallback for administrators or developers.

Validation should catch missing local files before deployment.

## Validation implications

`validate.mjs` already performs substantial structural checking of puzzle data. It could be extended to validate outboard resources:

- referenced local files exist;
- paths remain inside the puzzle or approved asset directories;
- declared media types match supported formats;
- structured lesson JSON conforms to its schema;
- image blocks include alt text;
- duplicate or circular content references are rejected;
- remote URLs use permitted protocols;
- required files are not remote-only unless deliberately allowed.

One particularly important rule would be:

> A relative content reference must not escape its puzzle package.

Thus this should fail:

```js
src: "../../../private-or-unrelated-file.md"
```

Path traversal protections matter even in a static application because imported puzzle packages may eventually come from other authors.

## External URLs should not substitute for packaged content

It would be tempting to permit this:

```js
content: {
  src: "https://some-site.example/article.md"
}
```

But externally loaded content introduces:

- CORS failures;
- link rot;
- content changing after puzzle publication;
- privacy concerns;
- tracking;
- offline failure;
- licensing uncertainty;
- potential injection or sanitization problems.

I would therefore treat remote material as a **linked reference**, not as the canonical instructional body:

```js
content: {
  src: "./introduction.md",
  mediaType: "text/markdown"
},
sources: [
  {
    href: "https://example.org/original-source",
    label: "Original source"
  }
]
```

A later trusted-author or server-managed mode could allow remote content, but it should not be the baseline format.

## Shared instructional content

Some material may apply to several puzzles. Duplication should not be required.

A puzzle could refer to catalogue- or category-level resources:

```js
learningIntroduction: {
  content: {
    ref: "public-health:population-vs-individual-risk"
  }
}
```

A resource registry might resolve that reference:

```js
export const LEARNING_RESOURCES = {
  "public-health:population-vs-individual-risk": {
    src: "./public-health/resources/population-risk.md",
    mediaType: "text/markdown"
  }
};
```

However, I would introduce this only after puzzle-local resources work. Shared references add versioning and portability questions:

- What happens when exporting one puzzle?
- Should the shared resource be copied into the export?
- What if two catalogues define the same identifier?
- Does an update change every puzzle that uses it?

The export process should probably **materialize dependencies** into the exported package.

## Relationship to JSON-LD import and export

This points toward two complementary representations:

### Authoring representation

A directory containing readable source files:

```text
energy-flow/
├── puzzle.js
├── introduction.md
└── assets/
    └── energy-pyramid.svg
```

### Exchange representation

A portable package, perhaps:

```text
energy-flow.ccpuzzle
```

internally containing:

```text
manifest.jsonld
content/introduction.md
assets/energy-pyramid.svg
```

The JSON-LD manifest would refer to package-relative resources:

```json
{
  "@type": "ConceptClustersPuzzle",
  "learningIntroduction": {
    "@type": "LearningResource",
    "contentUrl": "content/introduction.md",
    "encodingFormat": "text/markdown"
  }
}
```

A single JSON-LD file could still support small inline content, while a ZIP-like package would be used whenever outboard resources are present.

This avoids forcing a choice between:

- a clean, portable standard; and
- efficient external files.

The package becomes the portable unit rather than the individual manifest file.

## My recommended first implementation

Start with only two content forms:

```js
content: {
  text: "...",
  mediaType: "text/markdown"
}
```

and:

```js
content: {
  src: "./introduction.md",
  mediaType: "text/markdown"
}
```

Support puzzle-relative Markdown and local images referenced from that Markdown. Add validation, sanitization, and lazy loading. Organize newly resource-heavy puzzles as directories, but do not require existing puzzles to migrate.

Later, add structured lesson JSON, shared catalogue resources, and packaged JSON-LD export.

The key architectural distinction should be:

> **The puzzle file is the manifest; the puzzle package is the complete educational artifact.**

That would let Concept Clusters grow into a richer teaching platform without turning its puzzle definitions into large, unwieldy containers.

------

## Implemented first phase

The initial implementation follows the recommendation above with a few
deliberately narrow choices:

- puzzle manifests use the property `learningIntroduction` and the levels
  `optional`, `recommended`, and `required`;
- lesson bodies support inline or puzzle-relative `text/markdown` content;
- packaged resources are resolved from a non-serializing puzzle-module
  origin and cannot traverse outside that puzzle's package;
- the controlled `<cc-learning-introduction>` Web Component lazy-loads a
  DOM-built, raw-HTML-free Markdown subset in an accessible native dialog;
- local images require alt text, while external HTTP(S) reading may be
  listed separately under `sources`;
- read/skipped acknowledgement is local, revision-aware, and independent of
  saved board progress;
- recommended and required introductions pause shared moves/solved state
  until the learner has made the appropriate entry choice; and
- **From Evidence to Action** supplies the first outboard example, written to
  teach evidence reasoning without naming its map or lens answers.

Structured lesson JSON, shared-resource registries, remote lesson bodies,
directory migration for existing puzzles, and JSON-LD/package export remain
deferred. The concrete authoring contract and solution-leakage checklist now
live in [AUTHORING.md](AUTHORING.md#learning-introductions).
