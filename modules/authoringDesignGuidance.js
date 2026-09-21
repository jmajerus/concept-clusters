// Shared between the local stdio and hosted authoring MCP servers. A draft
// that passes validate_puzzle_draft can still be a bad puzzle -- this is the
// design judgment that tells the two apart, distilled from README.md's
// "Design brief", docs/AUTHORING.md's governing design judgment, and the
// extended rationale in docs/AUTHORING-REFERENCE.md. Keep those canonical,
// fuller statements aligned with this condensed guidance.
//
// Corpus review versions this bar in authoringGuidanceVersion.js -- bump
// major when existing puzzles should be re-checked, minor for clarifications
// that do not change the bar, nothing for typos.
import {
  AUTHORING_SETTINGS,
  fillAuthoringTemplate,
  preferredLessonCreditExample
} from "./authoringSettings.js";
import {
  authoringProfileDescriptor,
  TRIVIA_QUIZ_PROFILE,
  VOCABULARY_CONTEXT_PROFILE
} from "./authoringProfiles.js";

const CREDIT_PREFERRED_EXAMPLE = preferredLessonCreditExample(AUTHORING_SETTINGS);
const CREDIT_HUMAN_EXAMPLE = fillAuthoringTemplate(
  AUTHORING_SETTINGS.credit.templates.humanOnly,
  { author: AUTHORING_SETTINGS.credit.exampleAuthor }
);

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
  "category": "cognitive-science",
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

A cluster's \`seeds\` (normally two; one only for a minimum-size two-term
cluster, paired with exactly one \`floatingTerm\`) plus \`floatingTerms\` (one
to five) become its full term list, two to six clusters per puzzle. A bridge's \`clusters\`
names exactly two cluster \`id\`s (three for a ternary bridge) -- not
positions, not fragments. Cluster \`id\`, bridge \`id\`, and cluster \`color\`
are all optional and assigned automatically when omitted (cluster \`id\`
derives from \`name\` -- a bridge referencing an id-less cluster should
predict that plain slug). Each cluster's color must be unique within the
puzzle, one of teal, blue, amber, magenta, olive, brown, or cyan -- purple
is reserved for bridges and green/red for lens feedback, so none of those
three are valid cluster colors. Keep the complete board to at most 25 total
nodes (all cluster terms plus bridges). Size by genuine distinct terms; do not
drop a distinct term or bridge to fit a rendering threshold. If the material
needs more than 25 nodes, split it into relatedPuzzles rather than compressing
the lesson onto one board. Bridge terms are ordinary authored concepts; there is
no separate pedagogical-role field.

When a split plan is involved, the puzzle document receives only the
player-facing \`relatedPuzzles.info\` and \`relatedPuzzles.entries\`. The plan's
\`boardOrder\` is external metadata and must not be placed inside \`relatedPuzzles\`
or copied into the puzzle document.

Repository-owned timestamps, revision numbers, and cache-invalidation keys
are not authoring fields; the server derives them.

Omit puzzleKind for the default topic-based kind. For a specialized authored
type, follow the matching profile and record its type explicitly; the profile
selects focused guidance but is not a substitute for the field. Puzzle kind
remains independent of category and lensMode.

The MCP draft read/write contract uses the canonical stored shape: keep
category, categories, and subcategories on stable ids, and use the current
field names returned by the schema. Display titles are resolved metadata, not
replacements for those ids; do not rewrite an MCP document into a display
form before saving it back.

These are validity limits for a completed document, not composition targets.
Before mapping the material, do not choose or announce a cluster count,
terms-per-cluster range, or bridge count just to stay within them.

"Simplified" means no @context/@id/@type/schemaVersion and no cluster/bridge
@id to hand-sync with id -- not a cut-down feature set. Bridge \`direction\`/
\`idealTerms\`/\`conceptId\`/\`relationKind\`, ternary bridges, all three lens
modes, \`relatedPuzzles\`, and \`learningIntroduction\` are all directly
authorable here; call \`get_authoring_schema\` for the complete machine-readable
field contract.
Layout curation is authored separately from puzzle content, through
\`?author=layout&mode=graph|star|sets\` on the D1-backed authoring server.
\`Save Layout\` stores the selected renderer's validated, mode-neutral
override with the working copy; \`Publish\` transfers
that confirmed artifact to the shared puzzle row, and Freeze materializes it in
the generated player module. This is the sole layout publication path; deployed
player pages do not expose file export.`;

export const AUTHORING_DESIGN_GUIDANCE = `## Design judgment (not just schema validity)

- No trap words: every term must have a deliberate, defensible home in its
  declared cluster(s). If two clusters could both plausibly claim a term,
  that is noise rather than challenge; resolve the ownership or rewrite the
  distinction before publication.
- Seed pairs are the orienting clue: choose the two most instantly
  recognizable terms in each cluster as its seeds, leaving the least
  obvious term as the "aha" the player has to work out. A cluster pared
  down to just two terms total keeps only one seed, so that one remaining
  term stays the aha instead of the cluster arriving pre-solved.
- Size each cluster, bridge count, and lens count by genuine conceptual
  distinctness, not by converging toward a prior cluster's count or a
  familiar-looking template (e.g. defaulting to "4 terms, 3 lenses"
  because it reads as finished). Equal counts across clusters can be
  entirely legitimate; historical corpus frequency is not evidence either
  way. Treat an individual repeated count as a cheap draft-review
  descriptor, not a verdict. validate_puzzle_draft emits one non-blocking
  structural-regularity prompt only when the attributed cluster--bridge
  incidence graph has a real non-identity symmetry and the terms-per-cluster
  count also equals the cluster count. In either case, scan each
  cluster's own terms for a pair doing the same conceptual job (one
  naming a condition, the other just restating what it amounts to --
  "state of nature" / "war of every man against every man" is a real
  example caught this way), and separately check whether the cluster's
  own fact text names a genuinely distinct concept that never made it
  into terms. The same cross-reference applies to a lens's targets
  against its own cluster facts and bridge facts -- an excluded term the
  puzzle's own prose already names alongside included ones is the
  strongest signal of a real gap, much stronger than the raw count.
  Order matters: before choosing any count or range, enumerate the sourced
  distinctions, candidate terms, and genuine connections. A statement such as
  "four clusters of three to four terms" is not a valid starting plan, even
  when called provisional or said to be within limits. Equal and unequal
  outcomes are both legitimate; never alter the material merely to make the
  resulting counts look less regular.
  The firm board ceiling is 25 total nodes. Do not hunt for the weakest
  term to drop to fit a rendering threshold. Redundancy checks are a separate
  distinctness judgment; run them because a term is actually duplicate work,
  not because of how many nodes the board contains. Only above 25 nodes split
  into relatedPuzzles rather than dropping essential terms.
- Bridges must be genuine, and are optional: a bridge should encode a real
  conceptual connection, never a trick or a link manufactured just to make
  the cluster graph connected. A puzzle with no bridges, or with bridges
  that leave separate components, is fine -- every board mode renders that
  honestly rather than hiding it.
- Bridge terms are ordinary authored concepts. The bridge fact should explain
  the actual relationship between its clusters, rather than relying on term
  metadata to tell the player why the connection matters. Provide help at the
  appropriate level of granularity and prefer a verified direct resource that advances this lesson:
  concise bridge info for the connection itself, term info for one term, and
  sources on the puzzle lesson when they support a broader claim. Omission of
  a link is fine; automatic Wikipedia search is not inferred.
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
- idealTerms names the canonical endpoint within each connected cluster:
  the one term a bridge's fact would naturally mention. A player can tap any
  completed member to select the correct cluster, but the authored line
  resolves to this endpoint. A "veto" bridge's endpoint is tribunes, not
  Senate or consuls, because that's the term the fact would actually name.
  Most bridges are honest whole-cluster relationships with no standout
  term; leave it (or any one entry) null rather than manufacture false
  precision. A ternary bridge -- three
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
- Fit each lens to a learning objective worth a second look at the
  board. A focused question whose honest answers are one, two, or three
  terms is instructional -- that is a complete lens, not a stub to pad
  toward 6. A real instance: a four-term Disturbance cluster was split
  by asking which two techniques make space itself look geometrically
  wrong, not just unstable -- Dutch tilt and dolly zoom -- and naming
  why whip pan (speed) and slow zoom (advance) do not distort geometry.
  Two targets, bounded wording, explicit exclusions; that is a complete
  reinforcing lens, not a stub and not a failed cross-cut. 1-6 unique
  targets is the legal range, not a size to fill:
  include every term that answers the question, omit every term that
  does not. Cross-cutting is welcome when the question's real answers
  already span clusters; it is not a higher grade of lens and not a
  reason to churn, concatenate a second clause ("and …"), recruit extra
  terms, or drop the lens when a span will not form. A lens a player
  could answer by selecting one cluster's color is a legitimate
  reinforcing lens when that is the honest question -- not a defect to
  paper over. Broad
  phrasing ("associated with," "known for," "connected to") usually
  admits more correct answers than the authored target set -- prefer
  bounded phrasing ("directly involved in," "primarily functions as") and
  check the most plausible excluded node before finalizing: could a
  knowledgeable player defend it as also correct? If so, narrow the
  wording or include it. Order multiple lenses as a progression --
  concrete attribute, then function, then comparison or synthesis when
  those questions exist -- rather than as unrelated quizzes. Do not
  invent a cross-cutting round just to complete that sequence.
- learningIntroduction ("Before You Begin") is optional, but often worth a short
  orienting note: one or two paragraphs that state the learning objective and
  situate the learner in the domain (vocabulary, stakes, why the subject
  matters). Write about the **subject**, full stop — never about the puzzle as
  a device. Do not mention clusters, bridges, lenses, boards, sorting, or how
  terms will be grouped; do not preview membership or topology; do not give
  gameplay instructions. Schema vocabulary leaking into the lesson is a failure
  mode even when no "answer" is named. Length is not a virtue -- a tight
  paragraph beats a mini-essay. Omit it when the board title and cluster names
  already orient clearly; add it when the subject is technical, sequential, or
  easy to misframe. Its requirement level changes real behavior: optional and
  recommended both leave the board reachable without reading (recommended just
  leads with the invitation first), required holds the board until it's marked
  read. Reserve required for when the puzzle genuinely depends on that source,
  not as a default -- most introductions should be optional or recommended.
  content.text is Markdown with real line breaks in the string value (blank
  lines between paragraphs, \`##\` headings on their own lines). The lesson
  dialog already shows title; do not repeat it as the first line. Do not write
  the two-character sequence backslash-n; the tool serializer encodes newlines.
  A body stored as one line with \`\\n\` tokens renders as a single paragraph.
  learningIntroduction.credit is a legacy human-managed byline; do not include
  it in MCP documents. The MCP server keeps protected attribution outside the
  agent-authored document and stamps an identifiable client when possible.
  Prefer links (same shape as info.links) for further-reading on the lesson.
  Bibliographic references are a single puzzle-level list on info.citations
  (same { author?, title, publisher?, year?, pages?, url? } shape) -- never
  a second list on the lesson. When a learningIntroduction exists, play
  shows that list under References in the Lesson dialog; otherwise it
  shows on the board. Do not duplicate references across surfaces.
- Do not submit \`provenance\`, \`creator\`, \`license\`, or \`derivedFrom\` in
  MCP puzzle documents. They are protected metadata outside the agent authoring
  contract; the server preserves existing values and records an identifiable
  MCP client when possible. Human editorial workflows manage attribution and
  rights metadata. Do not invent people, write byline strings, or add
  roles/scopes/dates. Do not put AI credit in citations.
- relatedPuzzles is an optional, informal, one-directional "try this next"
  list shown once a puzzle (including its lenses, when present) is fully
  complete -- not a formal graph, and not required to be reciprocal. Each
  entry needs a puzzle id and a reason written as a reason to choose that
  specific puzzle, not a restatement of what it's about. The id may be a
  split sibling that is not registered yet (separate PR); validation treats
  ids listed in this puzzle's own entries as known. Prefer targets outside
  this puzzle's own catalogue(s) -- a catalogue already makes every one of
  its members easy to find, so a same-catalogue entry mostly restates that;
  relatedPuzzles earns its keep surfacing a connection browsing wouldn't.
  Also avoid it mechanically: entries[0] is what routes a returning visitor
  to their next puzzle, independent of (and easy to desync from) the
  catalogue's own order. Split pairs are an exception to the catalogue rule:
  cross-link forward (and reciprocally when useful) per the split plan even
  when both boards land in separate PRs. For unrelated batches drafted into
  the same catalogue, publish independently and rely on the catalogue for
  discovery instead of cross-linking. The field is exactly \`{ info?, entries }\`:
  do not add \`order\` or \`boardOrder\`; a split plan's top-level \`boardOrder\` is
  external metadata, while the entries array is the player-facing next-choice
  order.
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
  wrong link is worse than leaving the term unlinked (with the cluster
  carrying the topic page when that's the right zoom-out), because
  the wrong link fails silently and looks checked when it isn't. When the
  term belongs to a specific researcher's, institute's, or book's own
  coined vocabulary, check for that primary source before reaching for
  Wikipedia at all -- a biography of the term's originator is not the
  containing topic no matter how cleanly it resolves, since it explains
  who coined the term, not what the term means. When the term itself is
  too specific to have its own article, zoom out to the containing topic
  instead ("fixed shape" has none, but wiki:Solid explains exactly why
  solids have one). That is the same grain principle: if the containing
  topic is the cluster, the cluster already has the link. When even a
  broad topic doesn't exist, a dictionary entry (a plain non-Wikipedia
  URL) is next; only fall back to a plain string, unlinked, when none of
  those can be verified.
- When what's being cited is a specific book, page, or passage rather
  than a link-worthy page -- a particular edition, page range, or
  printing -- a plain link can't carry that. Use puzzle info.citations
  instead of or alongside links: an array of { author?, title, publisher?,
  year?, pages?, url? }, title required, everything else optional, always
  a structured object (no bare-string shorthand the way wiki:Title is
  shorthand for a link). Renders as a formal footnote-style line, not
  another "See also" chip. One bibliography for the whole puzzle -- attach
  it to puzzle info, not to a cluster, term, bridge, or the lesson object.
  Hover help is for the local idea; the citation is for the work the
  puzzle is based on. When a learningIntroduction exists, play shows that
  same list under References in the Lesson dialog (not on the board); with
  no lesson, it shows on the board. Do not also put the same destinations
  on info.links (or lesson links) -- that duplicates See also chips and
  References. Use links only for destinations that are not already in
  citations.
- Keep information surfaces stable. Always-visible info.text and a
  completion-gated fact have different jobs; never make a hover or help
  surface silently replace text the player already read after an achievement.
  Put gated teaching payoff on its own permanent fact surface instead.`;

const PHASE_PREAMBLE = `# Progressive Concept Clusters authoring

This is one pass over one accumulating simplified-puzzle draft. Retrieve the
latest draft before editing, preserve every field from earlier passes, and
change only what this pass improves. A phase response is a focused working
view, not a smaller replacement format. Use phase=complete whenever the whole
contract or guidance is needed, and always validate the complete draft before
publication. Phases are reusable concern areas, not irreversible lifecycle
gates: revisit any phase whenever that part of the puzzle needs more work.`;

const CORE_PHASE_GUIDANCE = `## Core and research pass

- Omit puzzleKind for the default topic-based kind. For a specialized type,
  follow the selected profile and record its authored type explicitly. It is
  content metadata, separate from taxonomy category and lensMode.
- Before shaping a gap-fill draft, call search_puzzles with 2-3 planned
  anchor terms scoped to the target category. If an existing puzzle already
  covers the distinction, extend or relate instead of opening a parallel board.
  search_puzzles covers the authoring corpus and your drafts (a draft
  overlays the same id). Set full_text=true when looking for a fact, lesson,
  or other prose rather than a title or board term.
- Establish id, title, primary category, two to six conceptually distinct
  clusters, their facts, and their terms. Each cluster needs two
  immediately recognizable seeds and one to five floating terms -- or,
  for a minimum-size two-term cluster only, one seed and one floating
  term. No trap words: every term must have a deliberate, defensible home in
  its declared cluster. If two clusters could both plausibly claim a term,
  that is noise rather than challenge; resolve the ownership or rewrite the
  distinction before publication.
  Size by distinct concepts. Do not drop a genuine term to fit a rendering
  threshold. If the map needs more than 25 nodes, split it into relatedPuzzles.
- Carry approved inventory connections onto the board as bridges. Do not
  invent extras to make the graph connected. A disconnected board or no
  bridges is acceptable. Write each bridge fact now and make its local
  relationship understandable from the fact and any concise bridge info.
- Research while shaping the concepts. When a source supports a fact or term,
  record it immediately in the existing exact citation shape
  { title, author?, publisher?, year?, pages?, url? } under the appropriate
  puzzle, cluster, term, bridge, or learning info. Preserve URLs and page
  details discovered now; do not plan to rediscover or reconstruct them in a
  later pass.
- Provide help at the appropriate level of granularity; prefer a verified
  direct resource that advances this lesson. Omitting a link means no chip
  -- automatic Wikipedia search is not inferred.`;

const REVIEW_PHASE_GUIDANCE = `## Structural and editorial review pass

- Review the latest accumulated draft; do not regenerate it. Check ambiguity,
  redundant terms doing the same conceptual job, missing concepts named by a
  cluster fact, seed recognizability, bridge necessity, and whether each
  bridge fact genuinely explains its connection.
- If validation flags more than 25 nodes, split into relatedPuzzles rather
  than dropping essential terms. Checking for redundant terms is a separate
  distinctness judgment; do not start it because of the node count alone.
- Verify every retained direct link and citation against the claim it supports.
  Keep exact citation data gathered during research; this pass confirms and
  corrects it rather than performing a second generic source hunt. Check that
  each link matches the grain of the surface it sits on. Omitting a link
  means no chip -- automatic Wikipedia search is not inferred.
- Check that always-visible info and completion-gated facts remain distinct;
  no hover or help surface should silently replace text the player already read.
- Add relationKind only when the bridge clearly fits dynamic, foundation,
  cross-cutting, contrast, continuity, or evaluation. It classifies the
  relationship described by the bridge fact. Leave it unset when ambiguous.
- Add binary direction only when reversing it changes the fact's meaning. Use
  idealTerms only for the canonical term in a connected cluster the bridge fact
  would naturally name; every valid cluster tap resolves to that endpoint, so
  omit false precision. Use a ternary bridge only for a truly
  collective relation that changes if any one cluster is removed. Add
  conceptId only when the same underlying bridge concept is intentionally
  shared with a bridge in another puzzle.`;

const PEDAGOGY_PHASE_GUIDANCE = `## Pedagogy pass

- Add lenses only when they create a worthwhile second way to think. Choose
  sequential, quiz, or assignment mode from the learning task rather than by
  habit; use preSolve only when sorting is a foregone conclusion and the lens
  is the real lesson.
- Fit each lens to a learning objective. A focused question with one,
  two, or three honest answers is a complete lens, not something to pad
  toward 6 or abandon because it is not cross-cutting. Cross-cutting is
  welcome when the answers already span clusters; do not concatenate a
  second clause, recruit extra terms, or drop the lens to force a span.
  If the honest question is one cluster's color, keep a reinforcing lens.
  A real instance: a four-term Disturbance cluster was split by asking
  which two techniques make space itself look geometrically wrong, not
  just unstable -- Dutch tilt and dolly zoom -- and naming why whip pan
  (speed) and slow zoom (advance) do not distort geometry. Two targets,
  bounded wording, explicit exclusions; that is a complete reinforcing
  lens, not a stub and not a failed cross-cut.
  1-6 unique targets is the legal range, not a size to fill: include
  every term that answers the question. Bound the wording so plausible
  excluded terms are not also defensibly correct. Order multiple lenses
  as a progression instead of unrelated trivia.
- Prefer a short learningIntroduction when orientation helps -- typically one
  or two paragraphs naming the learning objective and situating the domain --
  not only when a long lesson is warranted. Write about the subject, not the
  puzzle: no clusters, bridges, lenses, boards, sorting instructions, or
  membership/topology talk. Schema vocabulary in the lesson is a failure even
  when no answer is named. Omit it when the board already orients clearly.
  Reserve required for material the puzzle truly depends on; otherwise prefer
  optional or recommended. Preserve prior research citations on
  info.citations (one list for the puzzle and lesson). content.text is
  Markdown with real line breaks in the string value (blank lines between
  paragraphs, \`##\` headings on their own lines). The lesson dialog already
  shows title; do not repeat it as the first line. Do not write the
  two-character sequence backslash-n; the tool serializer encodes newlines. A
  body stored as one line with \`\\n\` tokens renders as a single paragraph.
  Do not include the human-managed legacy field learningIntroduction.credit.
  Do not put byline text in content.text.
  Never add dateCreated, dateModified, version, or
  learningIntroduction.revision; those are infrastructure-derived values.
- Lenses and learningIntroduction belong in this same pedagogy concern, but
  they do not have to be authored together. It is normal to add or revise a
  learning introduction long after the lenses exist; preserve those lenses
  unless the later lesson work reveals a substantive reason to change them.`;

const PUBLICATION_PHASE_GUIDANCE = `## Publication pass

- Add only useful discovery and stewardship metadata: tags, secondary category
  assignments, level, related puzzles, and language.
  Most are optional; omission is better than filler. The server supplies
  timestamps, revision metadata, and MCP-client attribution; protected
  provenance and rights metadata are not authored in this pass.
- Do not include learningIntroduction.credit, provenance, creator, license, or
  derivedFrom in an MCP document. Do not invent a reviewer name or treat roles
  or per-scope assistance entries as publication metadata.
- relatedPuzzles should offer a specific reason to continue beyond connections
  already obvious from the same catalogue. Set level only when the editorial
  judgment is genuinely clear, and add subcategories only when category browse
  benefits from a stable subject split.
- This pass binds to write domain pedagogy: retrieve get_puzzle_draft with
  domain=pedagogy, preserve lenses and learningIntroduction already present,
  and save that same domain. Do not send a publication-only object as a
  whole-domain replacement.
- Validate the complete accumulated document. If the caller explicitly
  requests authoring publication, set \`publish_to_authoring=true\` on
  \`save_puzzle_draft\` for a confirmed final edit; this publishes a valid
  document to authoring play in that same call, but it remains held and is
  not cued for Freeze. Cue and Freeze are outside MCP. Set
  \`category\` / \`categories\` / \`subcategories\` on this document. A category is
  registered when its category-editor document is published to D1; create_category
  or update_category creates or revises that document, and a new category should
  be published before a puzzle references it. Add or remove catalogue
  membership with get_catalogue then update_catalogue (or update_meta_catalogue
  when editing a meta catalogue). Publication review
  evaluates the whole puzzle, not merely this metadata pass.`;

const VOCABULARY_CONTEXT_PROFILE_OVERVIEW = `## Vocabulary-in-context profile

This profile is for lexical-disambiguation puzzles: the board gathers tight
synonym or near-synonym neighborhoods, and the lenses teach why a particular
context prefers one neighboring term over another. It is not a simple matching
exercise with a sentence appended afterward. Close relatedness is intentional;
the author must still make each completed lens resolve to one best fit.

The profile is advisory. It does not create a new storage domain, impose a
cluster count, or require the homonym-bridge pattern. Record the authored type
as puzzleKind: "vocabulary-context"; category remains a separate taxonomy
choice. Content still belongs to the content domain and lenses still belong
to the pedagogy domain.`;

const VOCABULARY_CONTEXT_PROFILE_GUIDANCE = Object.freeze({
  core: `## Vocabulary-in-context core pass

- Set puzzleKind to "vocabulary-context" in the puzzle document. This is
  authored content metadata; choose category independently for discovery.
- Begin with a distinction inventory, not a target cluster count. Identify the
  shared semantic center of each synonym neighborhood and the usage axes that
  separate its members: frequency, duration, agency, intent, register,
  intensity, connotation, collocation, grammatical frame, or another real
  distinction.
- Choose genuine near-neighbors. A term may overlap broadly with its cluster
  mates; that overlap is the material the learner is meant to refine. Do not
  manufacture unrelated terms merely to make the board easy to sort, and do
  not treat every broad synonym as interchangeable in every context.
- Use the cluster fact to state the shared meaning and the relevant boundary.
  Use term information when an individual term needs a sharper usage note.
  Seeds should orient the learner to the neighborhood; floating terms can
  carry the subtler distinctions that the lenses will revisit.
- A bridge is optional and must represent a genuine connection. A homonym or
  homograph may be authored once as an ordinary bridge term shared by the
  relevant clusters, but that pattern is not required and must not become the
  profile's template.

The core pass remains a content-domain pass: save clusters, terms, facts, and
bridge cores with domain=content.`,
  review: `## Vocabulary-in-context review pass

- Review each cluster as a semantic neighborhood, not merely as a topic. Can
  the author state what the terms share and what usage boundary makes each one
  worth retaining? Close meaning is expected; accidental duplicate work is
  not.
- For every planned lens, substitute the nearest board neighbors into the
  sentence. The desired result is one most natural or precise fit plus
  meaningful near-misses—not arbitrary distractors and not two equally good
  answers.
- Check that the sentence supplies the deciding cue through natural context,
  collocation, syntax, register, or situation. A dictionary definition hidden
  in the prompt is a matching exercise, not a useful lens.
- Make the explanation name the distinction that decided the answer. When a
  neighboring term is especially plausible, explain why the target is more
  precise rather than claiming that the neighbor is simply unrelated.
- A repeated target is acceptable when separate lenses teach separate usages,
  including separate senses of a bridge term. Repetition alone is not a
  reason to merge lenses or add a second blank.

This pass may inspect both domains, but any bridge annotations still save
through domain=pedagogy and the content core remains owned by domain=content.`,
  pedagogy: `## Vocabulary-in-context pedagogy pass

- Treat each lens as a contextual usage decision. Write a natural sentence
  with one blank whose surrounding situation makes one board term the best fit
  among its near-synonyms. The learner should have to notice the usage
  distinction, not merely recognize a definition.
- Keep the first form to one blank and one target term. The target may be any
  playable board term, and the same term may be targeted by multiple lenses
  when each context teaches something different. Do not repeat the target as
  a separate multiple-choice option list.
- In the explanation or target reason, name the cue and the boundary it
  activates: for example, intermittent occurrence rather than general
  unpredictability, personal whim rather than lack of order, or formal
  register rather than ordinary frequency. Avoid explanations that only say
  the target belongs to the topic.
- Do not force every lens to span clusters, use a bridge, or cover every term.
  Choose lenses for real usage distinctions and order several lenses as a
  progression when the material supports one.
- Use lensMode=sequential by default for this open contextual reclassification
  flow. Leave preSolve as a per-puzzle judgment: use it when the grouping is
  genuinely obvious and the contextual distinction is the lesson; leave the
  clustering challenge intact for advanced near-synonym boards.
- Multiple blanks and structured slot mapping remain deferred. Do not encode
  several unordered answers in one target list.

This pass remains a pedagogy-domain pass: retrieve the pedagogy projection and
save lenses, lensMode, preSolve, and learningIntroduction with domain=pedagogy.`,
  publication: `## Vocabulary-in-context publication pass

- Keep Vocabulary as the stable taxonomy category when the puzzle belongs in
  that cross-disciplinary collection. Preserve the authored
  puzzleKind: "vocabulary-context" independently of that category; the
  profile argument selects guidance, while the kind is content metadata, not a
  third document domain.
- Publish only useful discovery metadata. Do not flatten the puzzle into a
  generic quiz description: its purpose is to teach precise usage among close
  lexical neighbors.`
});

const TRIVIA_QUIZ_PROFILE_OVERVIEW = `## Trivia-quiz profile

This profile identifies a quiz-led puzzle type. Clusters, board terms, and
quiz lenses are designed together: the grouping supplies the question's scope,
evidence, or comparison frame, rather than serving as an arbitrary prelude to
unrelated recall.

Use lensMode=quiz as the normal form. preSolve=true often fits when grouping is
obvious and the quiz is the real work, but keep the clustering challenge when
it contributes meaningful play. The profile imposes no cluster or lens count,
does not require cross-cluster questions, and is independent of taxonomy. The
domain-less Trivia category is the current browse convention for
cross-disciplinary material, not the profile selector; this profile may fit a
puzzle filed under a disciplinary category.

The MCP profile argument selects focused guidance; the puzzle document records
the authored type as puzzleKind: "trivia-quiz". That field belongs to content
and creates no new write domain. Clusters and facts remain in content; quiz
lenses remain in pedagogy.`;

const TRIVIA_QUIZ_PROFILE_GUIDANCE = Object.freeze({
  core: `## Trivia-quiz core pass

- Set puzzleKind to "trivia-quiz" in the puzzle document. This authored type is
  independent of the taxonomy category.
- Inventory question-worthy facts and relationships alongside candidate
  board terms. Shape the clusters and the intended quiz questions together so
  the groups provide useful scope, comparison sets, or denominators for the
  questions. Do not build an arbitrary sort and append unrelated recall.
- Give each cluster a meaningful inclusion rule and a fact that explains it.
  A group may organize items by genre, period, role, or another defensible
  dimension; choose the structure that makes the intended questions clearer,
  not a target cluster count or a symmetric-looking layout.
- Select a board inventory that supports interesting questions about its
  items or relationships within and across groups. Not every lens must span
  clusters, and no cluster needs its own question. Do not add terms merely as
  quiz fodder when they do not belong in the board's subject.
- Treat trivia claims as factual claims: verify them and preserve exact
  citations when research finds supporting sources. A cross-cluster person,
  work, or pattern may be a genuine bridge, but bridges are optional and must
  not be invented to connect the whole board.

This is a content-domain pass: save the clusters, terms, facts, and genuine
bridge cores with domain=content. The category is chosen separately during
publication; selecting this profile does not require category=trivia.`,
  review: `## Trivia-quiz review pass

- Check that each cluster is a coherent, defensible group and that its fact
  gives the grouping a meaningful role in the puzzle's question design. If a
  question is unchanged when the board and its groupings are removed, decide
  whether it is useful here or is detached recall that belongs elsewhere.
- Verify every factual premise in each prompt, answer option, and explanation.
  Check dates, roles, counts, and scope carefully; preserve citations for
  supported claims. A trivia-style puzzle is not an exemption from accuracy.
- Read every multiple-choice lens against the complete option set. There must
  be exactly one defensible correct answer; distractors may be plausible but
  must be clearly wrong under the wording and evidence given.
- Where options map to board terms, compare each target set against the full
  board: include all and only the terms the option describes. Ensure cluster
  membership or cluster facts do not accidentally reveal a different answer
  than the lens explanation claims.
- Review the lens sequence as a whole. Prefer distinct, complementary
  questions that build a picture of the board over repeated counts or a list
  of unrelated facts. If preSolve is enabled, confirm the grouping really is
  obvious and that several substantive quiz rounds carry the experience;
  three is a useful heuristic, not a fixed minimum.

This pass may inspect both domains; save content changes with domain=content
and quiz-lens changes with domain=pedagogy.`,
  pedagogy: `## Trivia-quiz pedagogy pass

- Use lensMode=quiz for the quiz-led profile. Each lens should ask a clear
  factual question about the curated board or a relevant relationship among
  its items; do not append questions that merely happen to share a broad
  subject.
- Make exactly one option correct. Use plausible distractors that test the
  intended distinction rather than obscure wording. Explain why the answer is
  correct and address the most tempting alternative when that helps teach.
- Map each option's targets to every and only board term supported by that
  answer. The question may concern a relationship not printed on the board,
  but the selected films, people, events, or other terms should make the
  question's connection to the board evident.
- Order lenses as a purposeful sequence—for example, identification followed
  by a within-group comparison and then a cross-group relationship when those
  questions genuinely fit. Do not force any one question pattern or pad the
  sequence to a template.
- Choose preSolve per puzzle. Use it when the sort is a foregone conclusion
  and the quiz sequence is the meaningful play; leave clustering open when
  its categories themselves reward discovery. If preSolve is on, several
  substantial lenses are important so the puzzle does not collapse to one
  isolated question.

This is a pedagogy-domain pass: retrieve the pedagogy projection and save
lenses, lensMode, preSolve, and learningIntroduction with domain=pedagogy.`,
  publication: `## Trivia-quiz publication pass

- Choose category for discovery and disciplinary home, independently of this
  profile. Trivia is the current domain-less category convention for
  cross-disciplinary fact collections; use a disciplinary category when that
  is the better browse home. Do not infer or require profile=trivia-quiz from
  category=trivia, and do not change category just to select this profile.
- Preserve puzzleKind: "trivia-quiz" as the authored puzzle type; the MCP
  profile selects guidance but does not replace the document field. Publish
  only useful discovery metadata for the actual puzzle.`
});

const PROFILE_PHASE_PREAMBLE = `# Progressive profile authoring

This is one pass over one accumulating simplified-puzzle draft. Retrieve the
latest draft before editing, preserve every field from earlier passes, and
change only what this pass improves. The selected profile chooses focused
guidance; for new documents, record the matching authored type in puzzleKind.
Use the canonical schema for field validity and save through the phase's
existing write domain. Always
validate the complete draft before publication.`;

const AUTHORING_PROFILE_GUIDANCE = Object.freeze({
  [VOCABULARY_CONTEXT_PROFILE]: Object.freeze({
    overview: VOCABULARY_CONTEXT_PROFILE_OVERVIEW,
    phases: VOCABULARY_CONTEXT_PROFILE_GUIDANCE,
    routing: `Request profile=vocabulary-context with phase=core, review, pedagogy, or
publication for the focused brief. Core owns semantic neighborhoods and
bridge cores in content; review checks usage distinctions across the
accumulated draft; pedagogy authors contextual lenses and learning
introductions; publication adds ordinary discovery metadata.`
  }),
  [TRIVIA_QUIZ_PROFILE]: Object.freeze({
    overview: TRIVIA_QUIZ_PROFILE_OVERVIEW,
    phases: TRIVIA_QUIZ_PROFILE_GUIDANCE,
    routing: `Request profile=trivia-quiz with phase=core, review, pedagogy, or
publication for the focused brief. Core co-designs the board and its question
space; review checks factual accuracy, group coherence, and answer mappings;
pedagogy authors the quiz sequence; publication chooses taxonomy independently.`
  })
});

function profileGuidance(profile, phase) {
  const descriptor = authoringProfileDescriptor(profile);
  const profileDefinition = AUTHORING_PROFILE_GUIDANCE[descriptor.id];
  if (!profileDefinition) {
    throw new Error(`No guidance is registered for authoring profile ${profile}`);
  }
  if (phase === "complete") {
    return [
      profileDefinition.overview,
      `## Focused profile passes\n\n${profileDefinition.routing} This complete response is intentionally a routing overview; it does not repeat every phase brief.`
    ].join("\n\n");
  }
  const guidance = profileDefinition.phases[phase];
  if (!guidance) {
    throw new Error(`No guidance is registered for phase ${phase}`);
  }
  return `${PROFILE_PHASE_PREAMBLE}\n\n${guidance}`;
}

export const AUTHORING_PHASE_GUIDANCE = Object.freeze({
  core: `${PHASE_PREAMBLE}\n\n${CORE_PHASE_GUIDANCE}`,
  review: `${PHASE_PREAMBLE}\n\n${REVIEW_PHASE_GUIDANCE}`,
  pedagogy: `${PHASE_PREAMBLE}\n\n${PEDAGOGY_PHASE_GUIDANCE}`,
  publication: `${PHASE_PREAMBLE}\n\n${PUBLICATION_PHASE_GUIDANCE}`
});

export const AUTHORING_WORKFLOW_GUIDANCE = Object.freeze({
  catalogue: `# Catalogue and category workflow

A puzzle's category association is on the puzzle document: stable category id in \`category\`,
optional \`categories\`, and optional \`subcategories\`. Save those with
save_puzzle_draft after its category-editor document is published to D1. A
published category document is the registration event. Create category
metadata (title, domain, blurb, subcategory definitions) with create_category /
update_category — the same D1
working-copy store used by the authoring service. Call list_categories / get_category
first; those read the live D1 taxonomy. Git is not an MCP fallback.

A catalogue is a curated selection with a real audience, theme, or learning
purpose, not another name for a category. Call list_catalogues before creating
one, and get_catalogue before updating one. Those reads use your D1 working
copy or the D1 published row. Git is not an MCP fallback.

create_catalogue and update_catalogue receive the complete ordinary-catalogue document
and write D1 working copies. They do not open a GitHub pull request. Updating
replaces the whole entries list, so preserve every entry that should remain.
Entry puzzle ids must already exist in published D1. Preview tools
validate that document and never write. Set publish_to_authoring=true only
when a valid catalogue or category write is explicitly confirmed; it remains
held and is not cued for Freeze. To edit an existing meta catalogue, call
get_catalogue and send its complete \`kind: "meta"\` document
to update_meta_catalogue. Meta entries are existing non-meta catalogue ids;
relatedCatalogues may point at any existing catalogue (send \`null\` to clear
it). MCP does not create or delete meta catalogues.`
});

export function authoringWorkflowGuidanceResult(topic) {
  return { topic, markdown: AUTHORING_WORKFLOW_GUIDANCE[topic] };
}

export function authoringGuidanceResult(phase, completeGuidance, profile = null) {
  const markdown = profile
    ? profileGuidance(profile, phase)
    : phase === "complete"
      ? completeGuidance
      : AUTHORING_PHASE_GUIDANCE[phase];
  if (phase === "complete") {
    return {
      ...(profile ? { profile } : {}),
      markdown
    };
  }
  return {
    phase,
    complete: false,
    preserveExisting: true,
    ...(profile ? { profile } : {}),
    markdown
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

export const LOCAL_DRAFT_REVIEW_URL = "http://127.0.0.1:8787/admin/drafts";

function envProcess() {
  return typeof process !== "undefined" && process.env ? process.env : {};
}

function trimTrailingSlash(value) {
  return String(value).replace(/\/+$/, "");
}

export function localDraftReviewUrl(env = envProcess()) {
  const fromEnv = typeof env.AUTHORING_DRAFT_REVIEW_URL === "string"
    ? env.AUTHORING_DRAFT_REVIEW_URL.trim()
    : "";
  if (!fromEnv) return LOCAL_DRAFT_REVIEW_URL;
  const stripped = trimTrailingSlash(fromEnv);
  return stripped.endsWith("/admin/drafts")
    ? stripped
    : `${stripped}/admin/drafts`;
}

export function localDraftReviewHint(env = envProcess()) {
  return env.AUTHORING_DRAFT_REVIEW_URL?.trim()
    ? ""
    : " (needs npm run dev)";
}

export function mcpPublicationBoundaryGuidance() {
  return `After validate_puzzle_draft passes, the MCP workflow is complete. If
the caller explicitly requests authoring publication, set
\`publish_to_authoring=true\` on a confirmed final edit; this promotes the
valid document to a held D1 authoring snapshot in the same call. MCP has no
Cue or Freeze operation. Cue and Freeze are outside MCP; the optional
publication remains held until a separate human-controlled authoring workflow
cues it.`;
}

export function localAuthoringGuidance(env = envProcess()) {
  return completeAuthoringGuidance({
    formatNotes:
      "See docs/SIMPLIFIED-PUZZLE-FORMAT.md for the prose reference. JSON-LD " +
      "is interchange-only (content:export/import) and is not accepted as a " +
      "stored draft. Author in the simplified format get_authoring_schema documents.",
    workflowMechanics: `Use list_categories or get_category for the live D1 taxonomy. A category-editor
document becomes the registered category when it is published to D1; create and
publish a genuinely new subject before authoring puzzles that reference it. Do
not infer its absence from puzzles/categories.js or another Git checkout, and
do not move a puzzle to a parent category because a static Git view omits a
category that is published in D1.
Drafts may be temporarily invalid. Save with save_puzzle_draft, then
validate and address every error. MCP maintains protected attribution and
editorial metadata outside the agent document; existing values are preserved.
Set stable category ids in category / categories / subcategories on the puzzle document. Use
create_category or update_category with publish_to_authoring=true to publish the
category document before the puzzle references it. Add or remove catalogue membership
with get_catalogue then update_catalogue; those write D1 working copies.
${mcpPublicationBoundaryGuidance()} Stdio MCP stores
drafts in the same D1 database hosted MCP uses, scoped to
AUTHORING_OWNER_SUBJECT (the Cloudflare Access subject).
Nothing but Freeze writes this checkout; merging its pull request stays a
separate human action in GitHub. Structural checks after a freeze
are \`npm run validate\` (and \`npm run content:check\` for packaged
sources). The full Playwright suite (\`npm test\`) is optional local
diagnosis when play or taxonomy issues appear -- not required for every
puzzle add. A dedicated MCP diagnostic tool for on-demand checks may be
added later.`
  });
}

export const LOCAL_AUTHORING_GUIDANCE = localAuthoringGuidance();

export const HOSTED_AUTHORING_GUIDANCE = completeAuthoringGuidance({
  formatNotes: "This is the only supported authoring shape.",
  workflowMechanics: `Use list_categories or get_category for the live D1 taxonomy. A category-editor
document becomes the registered category when it is published to D1; create and
publish a genuinely new subject before authoring puzzles that reference it. Do
not infer its absence from puzzles/categories.js or another Git checkout, and
do not move a puzzle to a parent category because a static Git view omits a
category that is published in D1.
Drafts may be temporarily invalid. Retrieve the latest draft, save with
expected_revision, then validate and address every error. MCP maintains
protected attribution and editorial metadata outside the agent document;
existing values are preserved.
Set stable category ids in category / categories / subcategories on the puzzle document. Use
create_category or update_category with publish_to_authoring=true to publish the
category document before the puzzle references it; its optional domain must be one
of the ids list_categories/get_category report (a small fixed vocabulary).
Add or remove ordinary catalogue membership with get_catalogue then
update_catalogue. For a meta catalogue, use get_catalogue then
update_meta_catalogue.
Hosted learning introductions embed Markdown in
learningIntroduction.content.text with real line breaks in that string;
packaged files and binary assets are introduced during repository publication.
${mcpPublicationBoundaryGuidance()} Hosted authoring has no git checkout and
does not write the base branch; the player-facing Worker is not auto-deployed
on push. If play or taxonomy issues appear after a release, diagnose locally
with \`npm run validate\` and optionally \`npm test\` (a dedicated MCP
diagnostic tool for on-demand checks may be added later).`
});
