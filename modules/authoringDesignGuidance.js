// Shared between the local stdio and hosted authoring MCP servers. A draft
// that passes validate_puzzle_draft can still be a bad puzzle -- this is the
// design judgment that tells the two apart, distilled from README.md's
// "Design brief" and docs/AUTHORING.md's "Design rules". Keep those two the
// canonical, fuller statements; if either changes, check whether this
// condensed version drifted out of sync with it.
export const AUTHORING_FORMAT_GUIDANCE = `# Concept Clusters authoring workflow

Build \`document\` as the simplified format, not hand-written JSON-LD: no
\`@context\`/\`@id\`/\`@type\`/\`schemaVersion\`, and no cluster/bridge \`@id\`
to keep in sync with \`id\` by hand -- that dual-field pattern is exactly what
kept drifting out of sync in hand-authored JSON-LD, so this format never asks
for it. A minimal example:

\`\`\`json
{
  "id": "cognitive-load-theory",
  "title": "Cognitive Load Theory",
  "category": "Cognitive Science",
  "clusters": [
    {
      "id": "intrinsic-load",
      "name": "Intrinsic Load",
      "fact": "Intrinsic load stems from the inherent complexity of the material itself.",
      "seeds": ["element interactivity", "information complexity"],
      "floatingTerms": ["domain knowledge", "prior schemas"]
    },
    {
      "id": "extraneous-load",
      "name": "Extraneous Load",
      "fact": "Extraneous load is created by poor instructional design or unnecessary distractions.",
      "seeds": ["redundancy effect", "split-attention effect"],
      "floatingTerms": ["seductive details", "format distraction"]
    }
  ],
  "bridges": [
    {
      "term": "germane load",
      "clusters": ["intrinsic-load", "extraneous-load"],
      "fact": "Freeing working memory capacity lets mental effort shift toward schema construction."
    }
  ]
}
\`\`\`

A cluster's \`seeds\` (exactly two) plus \`floatingTerms\` (one to four) become
its full term list, two to six clusters per puzzle. A bridge's \`clusters\`
names exactly two cluster \`id\`s (three for a ternary bridge) -- not
positions, not fragments. Cluster \`id\`, bridge \`id\`, and cluster \`color\`
are all optional and assigned automatically when omitted (cluster \`id\`
derives from \`name\` -- a bridge referencing an id-less cluster should
predict that plain slug). Each cluster's color must be unique within the
puzzle, one of teal, blue, amber, magenta, olive, brown, or cyan -- purple
is reserved for bridges and green/red for lens feedback, so none of those
three are valid cluster colors. Total nodes (all cluster terms plus
bridges) are capped at 16, or 24 with \`large: true\`; only set \`large\` once
validation actually flags the puzzle as over the smaller cap. It only
affects rendering, never difficulty -- don't use it as a difficulty signal.

"Simplified" means no @context/@id/@type/schemaVersion and no cluster/bridge
@id to hand-sync with id -- not a cut-down feature set. Bridge \`direction\`/
\`idealTerms\`/\`conceptId\`/\`termRole\`/\`relationKind\`, ternary bridges, all three lens
modes, \`relatedPuzzles\`, and \`learningIntroduction\` are all directly
authorable here; call \`get_authoring_schema\` for the complete machine-readable
field contract.
Star layout curation is authored separately from puzzle content, through a
dedicated repository maintainer workflow, not through this document.`;

export const AUTHORING_DESIGN_GUIDANCE = `## Design judgment (not just schema validity)

- No trap words: every term must belong unambiguously to its declared
  cluster(s). Ambiguity is noise here, not challenge -- if two clusters
  could both plausibly claim a term, the term is wrong, not clever.
- Seed pairs are the orienting clue: choose the two most instantly
  recognizable terms in each cluster as its seeds, leaving the least
  obvious term as the "aha" the player has to work out.
- Size each cluster, bridge count, and lens count by genuine conceptual
  distinctness, not by converging toward a prior cluster's count or a
  familiar-looking template (e.g. defaulting to "4 terms, 3 lenses"
  because it reads as finished). Equal counts across clusters can be
  entirely legitimate -- most clusters in this project's own puzzles
  land on 4 terms regardless of author, and that alone proves nothing --
  but when several clusters do land on the same count, treat it as a
  cheap trigger for one specific check, not a verdict (validate_puzzle_draft
  now surfaces this and the equivalent lens/bridge cases automatically as
  non-blocking flags -- still worth applying the check yourself on
  anything it doesn't happen to catch): scan each
  cluster's own terms for a pair doing the same conceptual job (one
  naming a condition, the other just restating what it amounts to --
  "state of nature" / "war of every man against every man" is a real
  example caught this way), and separately check whether the cluster's
  own fact text names a genuinely distinct concept that never made it
  into terms. The same cross-reference applies to a lens's targets
  against its own cluster facts and bridge facts -- an excluded term the
  puzzle's own prose already names alongside included ones is the
  strongest signal of a real gap, much stronger than the raw count.
- Bridges must be genuine, and are optional: a bridge should encode a real
  conceptual connection, never a trick or a link manufactured just to make
  the cluster graph connected. A puzzle with no bridges, or with bridges
  that leave separate components, is fine -- every board mode renders that
  honestly rather than hiding it.
- A bridge's optional termRole is a pedagogical classification: is the
  displayed bridge term itself an intended object of learning, within the
  puzzle's conceptual territory and central lesson? Use the default reference
  role only when learning more about that term independently would deepen the
  lesson the puzzle is actually teaching. Use connector when the term instead
  carries a local relationship, piece of evidence, mechanism, plot detail, or
  biographical thread and the bridge fact already gives the player what this
  lesson needs from it. A connector may be a relational phrase ("how far to
  go", "taken seriously") or a perfectly concrete, specific, unfamiliar, and
  encyclopedia-worthy noun. In a literary puzzle, for example, "touch", "the
  tracheotomy", and "wireless telegraphy" can all be connectors when they
  serve only as mechanisms or details of the work rather than subjects the
  lesson sets out to teach. Do not use article existence, search quality,
  familiarity, obscurity, specificity, or grammatical form as the test. A
  generic search being possible does not make a term a reference, just as a
  missing verified direct link does not make a real lesson topic a connector.
  After classifying the role, curate links separately. For a reference, prefer
  a verified direct resource that advances this lesson; do not leave the
  automatic Wikipedia search merely to avoid doing that editorial work. Keep
  the search fallback only when its result set is itself a deliberate,
  productive exploration surface with multiple useful avenues. For a
  connector, suppressing that fallback is a consequence of the pedagogical
  role, never the reason for choosing it. A connector does not need or want a
  reference link: do not give it link, extraLink, seeAlso, or citations.
  It may -- and often should -- have concise info.text clarifying the local
  relationship or function it carries on this board. Source support belongs
  with the puzzle's lesson content, not with the connector. termRole and
  relationKind are independent:
  the first classifies the displayed term's role in the lesson, while the
  second classifies the relationship described by the bridge fact.
- A bridge's optional relationKind classifies the connection its fact
  describes, never the term in isolation: dynamic is one cluster
  affecting, regulating, moving into, transforming, exchanging with, or
  constraining the other; foundation is both clusters depending on, or
  being partly built from, the same underlying thing; cross-cutting is
  the same concept, pattern, practice, or device showing up meaningfully
  in both clusters -- independently, or serving a different function in
  each -- without implying dependency, causation, inheritance, or
  disagreement between them; contrast is the clusters disagreeing about,
  or interpreting differently, the bridge concept; continuity is a
  practice, institution, form, or idea inherited, transmitted, adapted,
  or echoed across time or traditions; evaluation is the bridge
  connecting evidence or claims with a practice used to test, validate,
  contextualize, or interpret them. Leave it unset unless a bridge
  clearly fits one of the six -- unset never implies a weaker bridge, and
  forcing a classification onto a genuinely ambiguous bridge is worse
  than leaving it unset. contrast and cross-cutting are the pair most
  often confused: do the clusters actively oppose each other about the
  concept (disagree, or offer competing explanations)? That's contrast.
  Does the concept simply recur, or function differently, across them
  without either side contradicting the other? That's cross-cutting.
  Still unclear -- leave it unset.
- A binary bridge's optional direction (ternary bridges stay undirected)
  asserts a directional topology on top of relationKind, independent of
  it: through is A -> X -> B (flow, influence, or development from A
  toward B, with explicit from/to cluster indices -- never infer them
  from clusters' array order, which already aligns idealTerms and
  shouldn't silently flip meaning on a reorder); bidirectional is
  A <-> X <-> B (reciprocal influence or exchange); outward is
  A <- X -> B (the bridge supplies, shapes, or produces both sides);
  inward is A -> X <- B (both sides converge to produce or explain the
  bridge). Add direction only when reversing it would make the bridge's
  fact false or materially change its meaning -- omission is the normal
  case, not a gap, and shared foundations, contrasts, and genuinely
  unspecified connections should stay undirected rather than defaulting
  to a direction for its own sake.
- idealTerms names the one term within each connected cluster that a
  bridge's fact would naturally mention -- a "veto" bridge's ideal term
  is tribunes, not Senate or consuls, because that's the term the fact
  would actually name. Most bridges are honest whole-cluster
  relationships with no standout term; leave it (or any one entry) null
  rather than manufacture false precision. A ternary bridge -- three
  cluster indices instead of two, for a relationship genuinely
  collective rather than pairwise -- takes idealTerms as three entries
  under the same rule, stays undirected (direction isn't supported for
  ternary), and takes at most one relationKind for the whole relation,
  not one per leg. Use ternary only when removing any single
  participating cluster would change what the fact describes; if it's
  really three separate pairwise explanations, author three binary
  bridges instead. Prefer at most one ternary bridge per puzzle.
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
  more evenly from several clusters to actually cut across the map. Broad
  phrasing ("associated with," "known for," "connected to") usually
  admits more correct answers than the authored target set -- prefer
  bounded phrasing ("directly involved in," "primarily functions as") and
  check the most plausible excluded node before finalizing: could a
  knowledgeable player defend it as also correct? If so, narrow the
  wording or include it. Order multiple lenses as a progression --
  concrete attribute, then function, then cross-cutting comparison, then
  interpretive synthesis -- rather than as unrelated quizzes.
- learningIntroduction ("Before You Begin") is optional pre-puzzle
  preparation -- domain knowledge, vocabulary, framing, a reflection
  question -- never gameplay instructions or a preview of the solution.
  Its requirement level changes real behavior: optional and recommended
  both leave the board reachable without reading (recommended just leads
  with the invitation first), required holds the board until it's marked
  read. Reserve required for when the puzzle genuinely depends on that
  source, not as a default -- most introductions should be optional or
  recommended. Prefer sources for further-reading http(s) links, and
  citations (same { author?, title, publisher?, year?, pages?, url? }
  shape as info.citations) for bibliographic footnotes under the lesson.
- generativeAssistance is compact current attribution for AI help, not an
  edit log: an array of { system, provider?, scope, role?, date? } on the
  puzzle. system and scope are required; scope is learningIntroduction,
  puzzle, or lenses; role is drafted or edited (default drafted). One
  entry per system+scope -- when the same chatbot keeps working that
  scope, update that entry in place (and optionally refresh date) instead
  of appending. When you draft or materially regenerate AI-assisted
  prose, populate it before saving the draft; the Lesson modal renders a
  short "Assisted by …" line from learningIntroduction- and puzzle-scoped
  entries. Do not put AI credit in citations.
- relatedPuzzles is an optional, informal, one-directional "try this next"
  list shown once a puzzle (including its lenses, when present) is fully
  complete -- not a formal graph, and not required to be reciprocal. Each
  entry needs a real puzzle id and a reason written as a reason to click
  that specific puzzle, not a restatement of what it's about. Prefer
  targets outside this puzzle's own catalogue(s) -- a catalogue already
  makes every one of its members easy to find, so a same-catalogue entry
  mostly restates that; relatedPuzzles earns its keep surfacing a
  connection browsing wouldn't. Also avoid it mechanically:
  entries[0] is what routes a returning visitor to their next puzzle,
  independent of (and easy to desync from) the catalogue's own order.
  If several puzzles are being drafted into the same catalogue together,
  don't try to cross-link them at all -- publish independently and rely
  on the catalogue for discovery.
- tags is an optional array of freeform strings -- deliberately informal,
  no vocabulary or registry, just words the puzzle should be findable by
  in the Library search box (which matches tags alongside title, category,
  citation authors/titles, subcategory titles, and board terms, with no
  special syntax). Tag a puzzle built directly from a named book "book",
  and put the book's author on info.citations so the puzzle is findable
  by that name.
- level is an optional string ("introductory", "intermediate", or
  "advanced") that adds the puzzle to that level's auto-catalogue --
  synthesized on the fly from whichever puzzles currently carry it, the
  same way All/New Puzzles already are, never authored or stored. Leave
  it unset by default; only set it when genuinely confident where a
  puzzle sits, not as a routine field to fill in on every new puzzle --
  "introductory" vs. "advanced" is a real editorial call, not something
  to infer reflexively from cluster count or category. Most puzzles
  should stay unclassified.
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
  the wrong link fails silently and looks checked when it isn't. When the
  term belongs to a specific researcher's, institute's, or book's own
  coined vocabulary, check for that primary source before reaching for
  Wikipedia at all -- a biography of the term's originator is not the
  containing topic no matter how cleanly it resolves, since it explains
  who coined the term, not what the term means. When the term itself is
  too specific to have its own article, zoom out to the containing topic
  instead ("fixed shape" has none, but wiki:Solid explains exactly why
  solids have one); when even a broad topic doesn't exist, a dictionary
  entry (a plain non-Wikipedia URL) is next; only fall back to a plain
  string, unlinked, when none of those can be verified.
- When what's being cited is a specific book, page, or passage rather
  than a link-worthy page -- a particular edition, page range, or
  printing -- a plain link can't carry that. Use info.citations instead
  of or alongside link: an array of { author?, title, publisher?, year?,
  pages?, url? }, title required, everything else optional, always a
  structured object (no bare-string shorthand the way wiki:Title is
  shorthand for a link). Renders as a formal footnote-style line, not
  another "See also" chip. Available on puzzle/cluster/termInfo/bridge
  info, same as seeAlso -- puzzle-level is the most useful attachment
  point since it's always visible, not hover-gated.`;

const PHASE_PREAMBLE = `# Progressive Concept Clusters authoring

This is one pass over one accumulating simplified-puzzle draft. Retrieve the
latest draft before editing, preserve every field from earlier passes, and
change only what this pass improves. A phase response is a focused working
view, not a smaller replacement format. Use phase=complete whenever the whole
contract or guidance is needed, and always validate the complete draft before
publication. Phases are reusable concern areas, not irreversible lifecycle
gates: revisit any phase whenever that part of the puzzle needs more work.`;

const CORE_PHASE_GUIDANCE = `## Core and research pass

- Establish id, title, primary category, two to six conceptually distinct
  clusters, their facts, and their terms. Each cluster needs exactly two
  immediately recognizable seeds and one to four floating terms. No trap
  words: every term must belong unambiguously to its declared cluster.
- Add only genuine bridges. A disconnected board or no bridges is acceptable.
  Write each bridge fact now, then classify termRole independently: reference
  means the displayed term is itself part of the puzzle's central lesson;
  connector means it only carries the local relationship, evidence, mechanism,
  plot detail, or biographical thread. A connector may and often should use
  info.text to explain that local function; it gets no automatic or authored
  reference link.
- Research while shaping the concepts. When a source supports a fact or term,
  record it immediately in the existing exact citation shape
  { title, author?, publisher?, year?, pages?, url? } under the appropriate
  puzzle, cluster, term, bridge, or learning info. Preserve URLs and page
  details discovered now; do not plan to rediscover or reconstruct them in a
  later pass.
- Curate links rather than defaulting lazily to search. Prefer a verified direct
  resource that advances this lesson. Retain automatic search only when its
  result set is deliberately useful as a multi-path exploration surface.`;

const REVIEW_PHASE_GUIDANCE = `## Structural and editorial review pass

- Review the latest accumulated draft; do not regenerate it. Check ambiguity,
  redundant terms doing the same conceptual job, missing concepts named by a
  cluster fact, seed recognizability, bridge necessity, and termRole choices.
- Verify every retained direct link and citation against the claim it supports.
  Keep exact citation data gathered during research; this pass confirms and
  corrects it rather than performing a second generic source hunt.
- Add relationKind only when the bridge clearly fits dynamic, foundation,
  cross-cutting, contrast, continuity, or evaluation. It classifies the
  relationship, independently of termRole. Leave it unset when ambiguous.
- Add binary direction only when reversing it changes the fact's meaning. Use
  idealTerms only for the one term in a connected cluster the bridge fact would
  naturally name; omit false precision. Use a ternary bridge only for a truly
  collective relation that changes if any one cluster is removed. Add
  conceptId only when the same underlying bridge concept is intentionally
  shared with a bridge in another puzzle.`;

const PEDAGOGY_PHASE_GUIDANCE = `## Pedagogy pass

- Add lenses only when they create a worthwhile second way to think. Choose
  sequential, quiz, or assignment mode from the learning task rather than by
  habit; use preSolve only when sorting is a foregone conclusion and the lens
  is the real lesson.
- Bound lens wording so plausible excluded terms are not also defensibly
  correct. Order multiple lenses as a progression instead of unrelated trivia.
- Add learningIntroduction only when preparation genuinely helps. It supplies
  domain framing, vocabulary, sources, or reflection—not gameplay instructions
  or a preview of the solution. Reserve required for material the puzzle truly
  depends on. Preserve prior research citations and use the same exact citation
  shape for any new introduction sources.
- Lenses and learningIntroduction belong in this same pedagogy concern, but
  they do not have to be authored together. It is normal to add or revise a
  learning introduction long after the lenses exist; preserve those lenses
  unless the later lesson work reveals a substantive reason to change them.`;

const PUBLICATION_PHASE_GUIDANCE = `## Publication pass

- Add only useful discovery and stewardship metadata: tags, secondary category
  assignments, level, related puzzles, attribution, licensing, language, dates,
  and version. Most are optional; omission is better than filler.
- Keep generativeAssistance as compact current attribution, one entry per
  system+scope, not an edit log. Do not put AI credit in citations.
- relatedPuzzles should offer a specific reason to continue beyond connections
  already obvious from the same catalogue. Set level only when the editorial
  judgment is genuinely clear, and add subcategories only when category browse
  benefits from a stable subject split.
- Validate the complete accumulated document before submission. Publication
  review evaluates the whole puzzle, not merely this metadata pass.`;

export const AUTHORING_PHASE_GUIDANCE = Object.freeze({
  core: `${PHASE_PREAMBLE}\n\n${CORE_PHASE_GUIDANCE}`,
  review: `${PHASE_PREAMBLE}\n\n${REVIEW_PHASE_GUIDANCE}`,
  pedagogy: `${PHASE_PREAMBLE}\n\n${PEDAGOGY_PHASE_GUIDANCE}`,
  publication: `${PHASE_PREAMBLE}\n\n${PUBLICATION_PHASE_GUIDANCE}`
});

export function authoringGuidanceResult(phase, completeGuidance) {
  if (phase === "complete") return { markdown: completeGuidance };
  return {
    phase,
    complete: false,
    preserveExisting: true,
    markdown: AUTHORING_PHASE_GUIDANCE[phase]
  };
}

export function completeAuthoringGuidance({
  formatNotes = "",
  workflowMechanics
}) {
  return [
    AUTHORING_FORMAT_GUIDANCE,
    formatNotes,
    AUTHORING_DESIGN_GUIDANCE,
    `## Workflow mechanics\n\n${workflowMechanics}`
  ].filter(Boolean).join("\n\n");
}

export const LOCAL_AUTHORING_GUIDANCE = completeAuthoringGuidance({
  formatNotes:
    "See docs/SIMPLIFIED-PUZZLE-FORMAT.md for the prose reference. A " +
    "document that already has `@context` is treated as hand-written JSON-LD " +
    "and validated as such -- no separate flag needed to opt in, though the " +
    "simplified format above is what get_authoring_schema documents and what " +
    "new puzzles should be authored as.",
  workflowMechanics: `Discover existing subjects with list_categories before choosing category names.
Drafts may be temporarily invalid. Save with replace_puzzle_draft, then
validate and address every error. When you draft or materially regenerate
content with generative AI, set puzzle.generativeAssistance (one entry per
system+scope; update in place on later edits to the same scope) before
saving -- see get_authoring_guidance. Preview returns the exact affected paths
and an approval token; install_puzzle requires that unchanged draft
revision, the token, and confirm: true -- unlike the hosted server, this one
writes straight to your local working tree, so this really is the one
explicit go-ahead before anything on disk changes. After install, structural
checks are \`npm run validate\` (and \`npm run content:check\` for packaged
sources). The full Playwright suite (\`npm test\`) is optional local
diagnosis when play or taxonomy issues appear -- not required for every
puzzle add. A dedicated MCP diagnostic tool for on-demand checks may be
added later.`
});

export const HOSTED_AUTHORING_GUIDANCE = completeAuthoringGuidance({
  formatNotes: "This is the only supported authoring shape.",
  workflowMechanics: `Discover existing subjects with list_categories before choosing category names.
Drafts may be temporarily invalid. Save, then validate and address every error.
When you draft or materially regenerate content with generative AI, set
puzzle.generativeAssistance (one entry per system+scope; update in place on
later edits to the same scope) before saving -- see get_authoring_guidance.
The first published puzzle in a new category may propose its category metadata
as part of the same publication pull request; its optional \`domain\` must be
one of the ids list_categories/get_category report (a small fixed
vocabulary, not something a puzzle author invents).
Hosted learning introductions embed Markdown in
learningIntroduction.content.text; packaged files and binary assets are introduced
during repository publication.
submit_puzzle_for_publication validates and opens the pull request directly --
there's no separate approval step, and calling preview_repository_import first
is optional, not a precondition. Merging the pull request stays a separate
human action in GitHub, so submitting doesn't publish anything by itself.
Pull-request CI runs structural validate and Worker unit tests -- not the
full Playwright browser suite. Hosted puzzle PRs omit
puzzles/index.js so concurrent submissions do not conflict on GitHub; CI and
a post-merge sync register on-disk modules into the index. If play or taxonomy
issues appear after import, diagnose locally with \`npm run validate\` and
optionally \`npm test\` (a dedicated MCP diagnostic tool for on-demand checks
may be added later).
On preview_repository_import and submit_puzzle_for_publication, reason is
scoped to catalogue_id: it becomes that catalogue entry's editorial-choice
text, not a general note about the submission, so pass it only when also
passing catalogue_id -- omit both when the puzzle isn't joining a catalogue.`
});
