# Taxonomy roadmap

**Status: the "Now" stage below is implemented; everything past it is
still roadmap.** `domain` exists on `puzzles/categories.js` and groups the
category-browse screen's cards under headings. There is still no `domain`
route or landing page. This document records decisions made in advance so
that vocabulary stays stable as the catalog grows, and so that navigation
can be switched on later without renaming things learners have already
bookmarked.

At the time of writing the catalog holds 14 registered categories and
roughly 70 puzzle memberships. Everything below is sized for the point
where that becomes several hundred.

## The problem this anticipates

Fourteen categories is a list. Forty is a wall. Somewhere between those
two numbers a flat category list stops being navigation and starts being
an inventory, and a learner arriving at the Library has no way to form an
expectation about what the site contains before reading all of it.

The obvious fix — add a level above categories — is only half the answer,
and not the more important half.

## What a course platform actually has

The model here is an online university or a platform like Coursera. Its
structure is not simply "more levels of subject tree":

| University            | Concept Clusters                  | Status                |
| --------------------- | --------------------------------- | --------------------- |
| School or faculty     | **domain**                        | this document         |
| Department            | category                          | exists                |
| Field                 | subcategory                       | exists, optional      |
| Course, specialization| **catalogue**                     | exists, underused     |
| Lesson or module      | puzzle                            | exists                |

A puzzle is lesson-sized: one board, one optional
`learningIntroduction`, five to fifteen minutes. On a course platform you
do not browse into a subject and land on a lesson — you land on a course,
and the course contains the lessons. Today, browsing lands directly on a
puzzle. That is correct at sixty puzzles and wrong at four hundred.

**The highest-leverage work is therefore the course layer, not the domain
layer.** Catalogues already exist (see [CATALOGUES.md](./CATALOGUES.md));
what they lack is ordering, a stated scope, estimated time, and completion
state. Promoting them to a first-class course object does more for a large
catalog than any amount of subject hierarchy above it.

Domains then organize catalogues as well as categories, which is what a
course-catalog home page actually is.

## Domains are a property of the category registry, not of a puzzle

`domain` lives in `puzzles/categories.js`, alongside `slug` and `info` —
never as a field on a puzzle.

```js
export const CATEGORIES = {
  "Computer Science": {
    domain: "computing-engineering",
    info: { text: "...", link: "wiki:Computer science" }
  }
};
```

The reason is structural. The puzzle schema already supports
multidisciplinary membership through `categories: [...]`, precisely
because puzzles genuinely belong to more than one subject. A per-puzzle
domain field would reintroduce the single-parent constraint that field
exists to escape, and would misfile the most interesting puzzles first.
A category, by contrast, is a stable editorial object that can reasonably
be asked to name one home.

Consequences worth stating plainly:

- A puzzle's domain is derived from its primary `category`, never authored.
- A multidisciplinary puzzle appears under several domains, for the same
  reason and by the same mechanism it appears under several categories.
- Domains never affect validation of a puzzle file. They are a navigation
  and presentation concern only.
- Nothing about a puzzle's `id`, share links, or `?category=` URLs changes.

## The eleven domains

Descriptions are scope statements for authors deciding where something
belongs, not player-facing copy. Wikipedia links are **candidates
requiring verification** — run `check-wiki-links.mjs` and read each
article before registering any of them, per the discipline in
[AUTHORING.md](./AUTHORING.md) ("a confidently-wrong direct link is worse
than leaving the term unlinked").

| # | Domain | Scope | Link candidate |
|---|---|---|---|
| 1 | 🌱📐 Sciences & Mathematics | Biology, physics, chemistry, astronomy, and the mathematics and methods common to them. | `wiki:Natural science` |
| 2 | 💻🛠️ Computing & Engineering | Computation, algorithms, and software; designed systems, materials, control, and robotics; and the data science and analytics running through both. | `wiki:Computer science` |
| 3 | ⚕️ Health & Medicine | Anatomy, physiology, clinical reasoning, nutrition, and population health. | `wiki:Medicine` |
| 4 | 🧠 Social Sciences | Psychology, sociology, anthropology, economics as behavior, politics. | `wiki:Social science` |
| 5 | 📜 Humanities | Literature, history, philosophy, religion, and cultural interpretation. | `wiki:Humanities` |
| 6 | 🗣️ Language & Literacy | How language is built and used well: grammar, rhetoric, composition, second-language learning. | `wiki:Language arts` |
| 7 | 📰 Communication & Media | Journalism, media studies, information literacy, evidence and sourcing. | `wiki:Communication studies` |
| 8 | 🎨 Art & Design | Visual arts, music, film, graphic and product design, media production. | `wiki:The arts` |
| 9 | 💼 Business & Management | Marketing, finance, accounting, leadership, organizational design. | `wiki:Business administration` |
| 10 | 📚 Education & Teaching | Pedagogy, instructional design, assessment, study skills, training. | `wiki:Education` |
| 11 | 🌍 Earth & Environment | Geology, climate, oceanography, ecology, geography, environmental policy. | `wiki:Earth science` |

### Sciences & Mathematics and Computing & Engineering were five domains

The original draft of this document gave Sciences, Mathematics, Computer
Science, Data Science, and Engineering five separate domains, while Social
Sciences, Humanities, and Art & Design each already bundle several
comparably distinct, comparably departmentalized fields — psychology,
sociology, anthropology, economics, and politics under one; literature,
history, philosophy, and religion under another; visual arts, music, film,
and design under a third — into one domain apiece. That wasn't a
considered call about which fields deserve their own heading; it was an
unreflective habit that gave the technical fields far finer granularity
than everything else, with nothing about the actual catalog content to
justify it. Data Science existing as its own domain with zero puzzles and
zero categories, while equally real, equally departmentalized fields like
Psychology or Visual Arts got no equivalent slot, was the clearest symptom.

Consolidated to two domains instead — a merge, not an invention of new
vocabulary, and reversible in the direction that matters: it's always
easier to split a broad domain later once specific content justifies it
than to have invented a narrow one nothing yet fills. Revisit this once
enough distinct content exists on either side to justify finer domains
again, the same trigger already governing the two categories below that
are expected to split.

### Notes on the less obvious four

**Language & Literacy (6)** is deliberately broader than "language
learning." Second-language acquisition and the craft of using one's own
language well are different subjects, but both are about language as a
skill rather than as an object of literary study, and the catalog is
unlikely to sustain them as separate schools. Literature stays in
Humanities.

**Communication & Media (7)** exists because information literacy has no
honest parent among the others. It is not pedagogy, not social science,
and not humanities, and it is already one of the largest bodies of content
in the catalog. Most universities recognize this with a school of
journalism or communication.

**Art & Design (8)** is scoped wider than the current `Art` category,
which is specifically visual arts. Music, film, and design are expected
here and will likely arrive as sibling categories rather than as
subcategories of visual art.

**Earth & Environment (11)** is not a subset of Sciences & Mathematics.
Environmental study is atmospheric physics *and* economics *and* policy
*and* ethics; the interdisciplinarity is the field itself, not a
complication of it. It also gives physical geography an honest home, which
folding geography into Social Sciences did not.

## Current categories, provisionally assigned

Two assignments are provisional in the strict sense that the category
itself is expected to split before this ships. They are marked.

| Category | Puzzles | Domain |
| --- | --- | --- |
| Computer Science | 10 | Computing & Engineering |
| History & Society | 8 | Humanities *(splits)* |
| Philosophy & Social Science | 8 | Social Sciences *(splits)* |
| Media & Information Literacy | 8 | Communication & Media |
| Humanities | 6 | Humanities |
| Public Health | 6 | Health & Medicine |
| Physiology & Medicine | 5 | Health & Medicine |
| Science | 4 | Sciences & Mathematics |
| Art | 4 | Art & Design |
| Math | 3 | Sciences & Mathematics |
| Language Arts | 3 | Language & Literacy |
| Business & Organizations | 2 | Business & Management |
| Geography | 2 | Earth & Environment |
| Engineering | 1 | Computing & Engineering |
| Music | 1 | Art & Design |

Education & Teaching currently has no categories. It stays in the
vocabulary as a deliberate signal of where content is missing — but it
must not render as an empty heading, and no puzzle should be authored
merely to fill it.

### On the categories that straddle

`History & Society` and `Philosophy & Social Science` each span two
domains by construction, and a single-parent tree forces a choice that is
wrong for roughly half the puzzles underneath. This is not an argument
against domains; it is an artifact of a small catalog. At scale these
categories split along lines that parent cleanly:

```
History & Society            -> History, Political Science, Sociology
Philosophy & Social Science  -> Philosophy, Psychology, Sociology, Economics
```

Split them when their own puzzle counts justify it, not to satisfy the
domain layer. Until then the provisional assignment above is adequate,
because domains are not yet navigation.

**Update (2026-08-09): `Philosophy & Social Science` has been split**,
at 28 puzzle memberships (23 primary) — see
`docs/dev-briefs/philosophy-social-science-split-migration.md` for the
executed migration. `Philosophy` went to `humanities` per the domain
scope table above (domain #5); `Psychology`, `Sociology`, and `Economics`
stayed under `social-sciences` (domain #4). Political Science was
intentionally not created — the admission test below ("can you name ten
puzzles you'd plausibly author under it") wasn't clearly met. `History &
Society` remains unsplit.

## Reserved vocabulary

**⚖️ Law & Governance** — constitutional structure, rights, procedure,
regulation, international law. Real institutional standing, and law sits
poorly under Social Sciences. Held back only on timing: there are no law
puzzles today, and its nearest neighbors are the two categories that have
not yet decided their own shape. Promote it once five or six authored
puzzles clearly want it.

### Declined, with reasons

**Personal Development** is a genuine top-level category on commercial
platforms and would house study skills and financial literacy. Declined as
a register mismatch: every other domain names a body of knowledge, and
this one names a motive. It also invites content the mechanic serves
poorly — "time management" has no interesting cluster structure.

**Foundations / Thinking & Learning** — logic, evidence, research methods,
epistemology. Declined despite being unusually on-brand for this game.
Every subject it would contain already has a real home, and a domain
defined by cutting across everything becomes the drawer that absorbs
whatever is hard to file. This is exactly what catalogues are for: a
course on reasoning from evidence can draw from six domains without being
one.

### Admission test for future domains

Both conditions, not either:

1. Does it have a real institutional home — a school, faculty, or
   department — somewhere in higher education?
2. Can you name ten puzzles you would plausibly author under it that do
   not already belong somewhere else?

Earth & Environment passes both. Law & Governance passes the first and
probably the second. Personal Development fails the first. Foundations
fails the second in a specific and instructive way: ten puzzles are easy
to name, and all of them are already filed.

## The `level` field

Ranked **above** the domain layer in priority. A learner arriving at a
category holding thirty boards needs to know which one is the entry point
far more urgently than they need to know that category sits under a STEM
heading.

```js
{
  id: "unique-string",
  level: "introductory",   // "introductory" | "intermediate" | "advanced"
  // ...
}
```

- **Orthogonal to `large`.** AUTHORING.md is already explicit that `large`
  is board size and not difficulty; a puzzle can be large and
  introductory, or small and hard. Do not let the picker conflate them.
- **Relative to its category, not globally.** An introductory Computer
  Science puzzle and an introductory Art puzzle make no claim to be
  equally demanding.
- **Optional, with no default.** An unset level means nobody has judged
  it, which is different from claiming it is intermediate.
- Judge by the knowledge a solver needs to hold before starting, not by
  node count and not by how long the board takes.

## Prerequisites, later

`relatedPuzzles` is explicitly informal, directed, and non-reciprocal — a
"you might want this next" edge, not an ordering claim. A course sequence
needs a validated ordering with cycle detection, which is a different
thing. Add it as its own field when catalogues become courses; do not
overload the existing one, which is doing useful work in its current
loose form.

## Staged rollout

Sized by catalog growth rather than by date.

**Now (~60 puzzles).** Add `domain` to `puzzles/categories.js` and render
the Library's category list under domain headings. No puzzle-schema
change, no new URL space, no additional click depth. `validate.mjs` gains
one check: every `domain` value is a registered domain id. Reversible in
an afternoon.

**~100–150.** Add `level`. Backfill it across the existing catalog in one
editorial pass rather than piecemeal, so the judgments stay calibrated
against each other. Split the straddling categories as their counts
justify.

**~150+.** Promote catalogues to the course layer: ordering, scope
statement, estimated time, completion state. Domains begin organizing
catalogues alongside categories.

**~250+.** Domains become real navigation — `?domain=` routes and landing
pages. By this point every category has a settled parent, and the tree
describes structure that already exists.

## The failure mode this staging is designed to avoid

Defining the taxonomy first and growing content into it produces authoring
to fill headings — puzzles that exist because a domain looked empty rather
than because the topic had genuine cluster structure. That is the opposite
of every design rule in AUTHORING.md.

Treat the eleven domains as **a vocabulary committed to now and a
navigation layer switched on late.** The vocabulary costs nothing and
prevents renaming later; the navigation is worth building only once it is
describing something real.

## Implementation notes

Collected here so the eventual change is not archaeology.

- **Slugs.** Domain ids are lowercase URL-safe slugs, same rules as
  subcategory ids. `all` and `other` stay reserved. Tried adding a
  validate.mjs check that no domain slug collides with a category slug;
  dropped it after finding real, sensible collisions (a `Humanities`
  category naming its own domain) with no actual ambiguity behind them --
  domain and category are separate query params, not a shared namespace.
  Revisit only if `?domain=` navigation ever puts them in one.
- **Registration is optional, as with categories.** An unregistered
  category simply has no domain and lands in an ungrouped section, the
  same graceful degradation subcategories already use.
- **MCP surface.** `submit_puzzle_for_publication`'s `new_category`
  payload gains an optional `domain` alongside `name`, `slug`, `info`, and
  `subcategories`. `list_categories` and `get_category` return it. No
  authoring tool needs a new domain-creation call — the domain set is
  fixed vocabulary in this document, not user-extensible content.
- **JSON-LD.** The interchange format needs no change, since domain is not
  a puzzle property. Only the category registry serializes it.
- **Emoji.** The icons in the table above are editorial shorthand for this
  document. Decide separately whether they appear in the UI; they carry no
  information a screen reader benefits from and should not be the only
  cue for anything.
