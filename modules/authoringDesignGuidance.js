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
bridges) fit 16 on the standard board or 24 on the wide board. Size
by genuine distinct terms, not to stay under 16. Canvas size is derived
from that count on save -- omit \`large\`. Do not drop a distinct term
or bridge to shrink the board. Do not treat board size as a difficulty
signal; it only affects rendering. Above 24, split into relatedPuzzles
rather than compressing the lesson onto one board.

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
  The 16-node standard-board cap is a rendering default, not a
  composition target. An honest 17-24-node board uses the wide canvas
  automatically; do not hunt for the weakest term to drop so the
  puzzle stays small. Redundancy checks are independent of the cap --
  run them because a term is actually duplicate work, not because
  the node count crossed 16. The firm ceiling is 24; only then split
  into relatedPuzzles rather than dropping essential terms.
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
  After classifying the role, provide help at the appropriate level of granularity:
  prefer a verified direct resource that advances this lesson.
  Cluster-sized help lives on the cluster; a term gets a link only at
  term-sized specificity; a connector's grain is concise info.text -- it
  may, and often should, have that info.text -- not a reference lookup. A
  connector does not need or want a reference link: do not give it links, link, extraLink, seeAlso, or citations.
  Source support belongs with the puzzle's lesson content, not with the connector. Omitting a link means
  no chip -- automatic Wikipedia search is not inferred. termRole and
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
- The Trivia category specifically leans toward lensMode: "quiz" and
  preSolve: true: trivia is usually about testing specific factual recall
  rather than discovering how terms cluster, so the sort is often a
  foregone conclusion once the terms are named and the quiz is the real
  content. Treat this as a lean for that one category, not a rule -- a
  Trivia puzzle built around a genuine categorical distinction should
  still use open clustering when that's the more honest structure.
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
  learningIntroduction.credit is a legacy stored byline only when provenance
  cannot derive L1. Prefer provenance; do not write credit. The human sets
  collaboration on the drafts page when they take editorial lead; the byline
  is derived read-only from provenance.
  Prefer links (same shape as info.links) for further-reading on the lesson.
  Bibliographic references are a single puzzle-level list on info.citations
  (same { author?, title, publisher?, year?, pages?, url? } shape) -- never
  a second list on the lesson. When a learningIntroduction exists, play
  shows that list under References in the Lesson dialog; otherwise it
  shows on the board. Do not duplicate references across surfaces.
- generativeAssistance is optional structured AI attribution, not the lesson
  footnote. The server also stamps it (and provenance) from the MCP call-frame
  host on draft create/save. Do not write learningIntroduction.credit; the
  player byline is derived from provenance. If you still set
  generativeAssistance yourself, keep it compact: one entry per system+scope,
  not an edit log, and do not put AI credit in citations.
- provenance is optional and agent-cheap: prefer
  \`{ contributors: ["Cursor", "Jane Doe"] }\`. Known AI host names
  (authoringHosts.js) are inferred as generative; other names as human.
  Storage keeps names (+ collaboration); kind/provider are omitted when
  derivable so draft reads stay cheap. Collaboration defaults
  (human / ai / aiPrimary for mixed); set
  \`collaboration: "humanPrimary"\` when a human has taken editorial lead.
  Do not invent humans, write byline strings, or add roles/scopes/dates.
  Omit provenance when unsure. The server may already stamp a generative
  contributor from the MCP host.
- relatedPuzzles is an optional, informal, one-directional "try this next"
  list shown once a puzzle (including its lenses, when present) is fully
  complete -- not a formal graph, and not required to be reciprocal. Each
  entry needs a puzzle id and a reason written as a reason to click that
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
  discovery instead of cross-linking.
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

- Before shaping a gap-fill draft, call search_puzzles with 2-3 planned
  anchor terms scoped to the target category. If an existing puzzle already
  covers the distinction, extend or relate instead of opening a parallel board.
- Establish id, title, primary category, two to six conceptually distinct
  clusters, their facts, and their terms. Each cluster needs exactly two
  immediately recognizable seeds and one to four floating terms. No trap
  words: every term must belong unambiguously to its declared cluster.
  Size by distinct concepts, not to stay under 16 nodes. Canvas size
  is derived from the honest total; do not drop a genuine term to shrink
  the board. If the map is too big for one board (above 24 nodes), split.
- Carry approved inventory connections onto the board as bridges. Do not
  invent extras to make the graph connected. A disconnected board or no
  bridges is acceptable. Write each bridge fact now, then classify
  termRole independently: reference
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
- Provide help at the appropriate level of granularity. Prefer a verified
  direct resource that advances this lesson. Omitting a link means no chip
  -- automatic Wikipedia search is not inferred.`;

const REVIEW_PHASE_GUIDANCE = `## Structural and editorial review pass

- Review the latest accumulated draft; do not regenerate it. Check ambiguity,
  redundant terms doing the same conceptual job, missing concepts named by a
  cluster fact, seed recognizability, bridge necessity, and termRole choices.
- If validation flags more than 24 nodes, split into relatedPuzzles rather
  than dropping essential terms. Do not drop a distinct term to stay on
  the standard board. Checking for redundant terms is a separate
  distinctness judgment; do not start it because the node count crossed
  16. Canvas size is derived; omit \`large\`.
- Verify every retained direct link and citation against the claim it supports.
  Keep exact citation data gathered during research; this pass confirms and
  corrects it rather than performing a second generic source hunt. Check that
  each link matches the grain of the surface it sits on. Omitting a link
  means no chip -- automatic Wikipedia search is not inferred.
- Check that always-visible info and completion-gated facts remain distinct;
  no hover or help surface should silently replace text the player already read.
- Add relationKind only when the bridge clearly fits dynamic, foundation,
  cross-cutting, contrast, continuity, or evaluation. It classifies the
  relationship, independently of termRole. Leave it unset when ambiguous.
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
  learningIntroduction.credit is a human-owned lesson byline; leave it unset.
  Do not put credit in content.text.
- Lenses and learningIntroduction belong in this same pedagogy concern, but
  they do not have to be authored together. It is normal to add or revise a
  learning introduction long after the lenses exist; preserve those lenses
  unless the later lesson work reveals a substantive reason to change them.`;

const PUBLICATION_PHASE_GUIDANCE = `## Publication pass

- Add only useful discovery and stewardship metadata: tags, secondary category
  assignments, level, related puzzles, attribution, licensing, language, dates,
  and version. Most are optional; omission is better than filler.
- Keep generativeAssistance optional (the server may already have stamped the
  MCP host). Keep provenance optional the same way — agents can send bare
  contributor names; kinds/mode are inferred. Do not write
  learningIntroduction.credit; the lesson byline is derived from provenance
  (humans override collaboration on the drafts page). Do not treat dates,
  roles, or per-scope assistance entries as required publication metadata.
- relatedPuzzles should offer a specific reason to continue beyond connections
  already obvious from the same catalogue. Set level only when the editorial
  judgment is genuinely clear, and add subcategories only when category browse
  benefits from a stable subject split.
- Validate the complete accumulated document, then pause for the human to
  review \`/admin/drafts/<id>\`. Open board (\`/?draft=<draftId>\`) is
  Construct. Play (\`/?draft=<draftId>&view=play\`) is gameplay when the
  document compiles. Neither writes git. They Publish on that page to write
  the shared D1 row. Export to player (GitHub pull request) is optional for
  the git-bundled player. Do not call
  \`submit_puzzle_for_publication\` unless they ask you to. Publication
  review evaluates the whole puzzle, not merely this metadata pass.`;

export const AUTHORING_PHASE_GUIDANCE = Object.freeze({
  core: `${PHASE_PREAMBLE}\n\n${CORE_PHASE_GUIDANCE}`,
  review: `${PHASE_PREAMBLE}\n\n${REVIEW_PHASE_GUIDANCE}`,
  pedagogy: `${PHASE_PREAMBLE}\n\n${PEDAGOGY_PHASE_GUIDANCE}`,
  publication: `${PHASE_PREAMBLE}\n\n${PUBLICATION_PHASE_GUIDANCE}`
});

export const AUTHORING_WORKFLOW_GUIDANCE = Object.freeze({
  "pull-request-review": `# Pull-request review workflow

After the human opens the pull request from the drafts page, run review as a
bounded autonomous loop before asking the human to merge. Collect CI and
automated or independent-agent feedback with get_review_feedback, work only on
remainingThreads, and treat GitHub's resolved threads and concurrent human
actions as authoritative. Use each thread id/version snapshot so stale writes
fail closed.

Apply correct exact suggestions. Handle valid prose feedback by editing the
draft and resubmitting; reply with a reason when rejecting feedback. Resolve
only explicitly dispositioned thread snapshots. When draftSyncRequired is
true, call sync_review_changes_to_draft before editing or resubmitting.

After acting and receiving fresh feedback, call complete_review_round once;
passive polling never counts. Stop all automated writes if the circuit breaker
opens, and never call reset_review_circuit without explicit human
authorization. Pause for a human on that breaker, genuine product, editorial,
or risk decisions, or materially conflicting reviews.

When the loop is otherwise complete, call prepare_human_review_handoff with
every thread accounted for. It emits ready-for-human-review or
human-decision-needed. Gameplay is reviewed on the LAN authoring checkout
(\`/?draft=<id>\`), not on a Cloudflare preview. This loop is
GitHub CI and review comments before merge to production. The human retains
final merge authority.`,
  catalogue: `# Catalogue workflow

Call list_catalogues before creating a catalogue, and get_catalogue before
updating one. A catalogue is a curated selection with a real audience, theme,
or learning purpose, not another name for a category or routine polish.

create_catalogue and update_catalogue receive the complete catalogue document.
Updating replaces the whole entries list, so preserve every entry that should
remain. They write the same D1 working copies \`/admin/catalogues\` uses, then
may open a GitHub pull request as export to the git-bundled player. Publish on
that page writes the shared D1 published row without a PR. Entry puzzle ids are
checked against the current GitHub base branch, not only the Worker-bundled
list_puzzles snapshot. Preview tools are optional and never write. Humans edit
catalogues at \`/admin/catalogues\` (\`/?catalogue=<id>&view=author\`) without
MCP; those tools remain optional assistance. Meta-catalogue writes are not supported.`
});

export function authoringWorkflowGuidanceResult(topic) {
  return { topic, markdown: AUTHORING_WORKFLOW_GUIDANCE[topic] };
}

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

export const LOCAL_DRAFT_REVIEW_URL = "http://127.0.0.1:8787/admin/drafts";
export const HOSTED_DRAFT_REVIEW_URL =
  "https://concept-clusters-authoring.jmajerus.workers.dev/admin/drafts";

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

// Same pause on local stdio and hosted MCP. Only the review URL (and an
// optional local-dev hint) differs; do not reintroduce a "submit immediately"
// instruction on one side.
export function submitAfterDraftReviewInstructions({
  reviewUrl,
  reviewHint = "",
  checkoutInstall = false
} = {}) {
  const install = checkoutInstall
    ? "They open `/?draft=<draftId>` on the LAN authoring server (Construct by default; Play when the document compiles). That loads the D1 draft in memory and does not write this checkout. Install in this checkout is optional (repo checks, layouts, git-shaped files). Do not call install_puzzle unless they ask you to. "
    : "Unpublished boards are constructed and played on the LAN authoring checkout (`/?draft=`), not on Cloudflare. ";
  return (
    `Once validate_puzzle_draft passes, pause: give the human ${reviewUrl}/<draftId>${reviewHint} ` +
    "and wait until they have reviewed that page. " +
    install +
    "They click Publish there to write the shared D1 row. Export to player opens a GitHub pull request for the git-bundled player; it is optional. " +
    "Do not call submit_puzzle_for_publication unless they ask you to (catalogue extras, the button failed, or the page is unavailable). " +
    "The drafts page is design-copy review; LAN `/?draft=` is the construct canvas and gameplay staging; D1 Publish is authoring truth; the pull request exports to today's bundled player. Humans can build the board without MCP; agents may propose edits to the same document. "
  );
}

export function submitAfterDraftReviewMechanics({
  reviewUrl,
  reviewHint = "",
  checkoutInstall = false
} = {}) {
  const install = checkoutInstall
    ? ` They open \`/?draft=<draftId>\` on the LAN
authoring server (Construct by default; Play when the document compiles). That loads the D1 draft in memory and does not write
this checkout. Install in this checkout is optional (repo checks, layouts,
git-shaped files).
Do not call install_puzzle unless they ask you to.`
    : ` Unpublished boards are constructed and played on the LAN authoring checkout (\`/?draft=\`),
not on Cloudflare.`;
  return `After validate_puzzle_draft passes, pause so the human can read the draft
at ${reviewUrl}/<draftId>${reviewHint}. Publish on that page writes the shared
D1 row. Export to player opens a GitHub pull request for the git-bundled
player; it is optional.${install} Do not call submit_puzzle_for_publication unless they ask you to (catalogue extras, the
button failed, or the page is unavailable). The drafts page is design-copy
review; LAN \`/?draft=\` is the construct canvas and gameplay staging; D1 Publish is
authoring truth; the pull request exports to today's bundled player.
preview_repository_import first is optional, not a precondition.`;
}

export function localAuthoringGuidance(env = envProcess()) {
  return completeAuthoringGuidance({
    formatNotes:
      "See docs/SIMPLIFIED-PUZZLE-FORMAT.md for the prose reference. JSON-LD " +
      "is interchange-only (content:export/import) and is not accepted as a " +
      "stored draft. Author in the simplified format get_authoring_schema documents.",
    workflowMechanics: `Discover existing subjects with list_categories before choosing category names.
Drafts may be temporarily invalid. Save with save_puzzle_draft, then
validate and address every error. Do not write learningIntroduction.credit;
the human sets that byline on the drafts page if they want one.
${submitAfterDraftReviewMechanics({
  reviewUrl: localDraftReviewUrl(env),
  reviewHint: localDraftReviewHint(env),
  checkoutInstall: true
})} Merging
stays a separate human action in GitHub, so submitting does not publish
anything by itself and does not write this checkout. Stdio MCP stores
drafts and publication_requests in the same D1 database hosted MCP uses,
scoped to AUTHORING_OWNER_SUBJECT (the Cloudflare Access subject). Local
puzzle PRs omit puzzles/index.js so concurrent submissions do not conflict;
CI and a post-merge sync register on-disk modules into the index.
install_puzzle remains for clients that are not looking at the drafts page:
preview returns the exact affected paths and an approval token; install_puzzle
requires that unchanged draft revision, the token, and confirm: true.
After install, structural checks are \`npm run validate\` (and \`npm run
content:check\` for packaged sources). The full Playwright suite
(\`npm test\`) is optional local diagnosis when play or taxonomy issues
appear -- not required for every puzzle add. A dedicated MCP diagnostic
tool for on-demand checks may be added later.
On preview_repository_import and submit_puzzle_for_publication, reason is
scoped to catalogue_id: it becomes that catalogue entry's editorial-choice
text, not a general note about the submission, so pass it only when also
passing catalogue_id -- omit both when the puzzle isn't joining a catalogue.`
  });
}

export const LOCAL_AUTHORING_GUIDANCE = localAuthoringGuidance();

export const HOSTED_AUTHORING_GUIDANCE = completeAuthoringGuidance({
  formatNotes: "This is the only supported authoring shape.",
  workflowMechanics: `Discover existing subjects with list_categories before choosing category names.
Drafts may be temporarily invalid. Retrieve the latest draft, save with
expected_revision, then validate and address every error.
When you draft or materially regenerate content with generative AI, do not
write learningIntroduction.credit; the human sets that byline on the drafts
page if they want one.
The first published puzzle in a new category may propose its category metadata
as part of the same publication pull request; its optional \`domain\` must be
one of the ids list_categories/get_category report (a small fixed
vocabulary, not something a puzzle author invents).
Hosted learning introductions embed Markdown in
learningIntroduction.content.text with real line breaks in that string;
packaged files and binary assets are introduced during repository publication.
${submitAfterDraftReviewMechanics({ reviewUrl: HOSTED_DRAFT_REVIEW_URL })} Merging
the pull request stays a separate human action in GitHub, so submitting doesn't
publish anything by itself. Hosted authoring has no git checkout and does not
write the base branch; the player-facing Worker is not auto-deployed on push.
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
