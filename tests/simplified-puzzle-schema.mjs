import assert from "node:assert/strict";
import { validateJsonLdProfile } from "../modules/jsonLdProfile.js";
import { validatePuzzleContent } from "../modules/contentValidation.js";
import { validateGenerativeAssistance } from "../modules/generativeAssistance.js";
import { puzzleFromJsonLd } from "../modules/puzzleJsonLd.js";
import {
  isJsonLdShaped,
  normalizeAuthoredPuzzleDocument,
  puzzleFromAuthoredDocument,
  puzzleFromSimplified,
  SimplifiedPuzzleInputSchema
} from "../modules/simplifiedPuzzleSchema.js";

export const name = "simplified puzzle schema: shape, conversion, and normalization";

function validPuzzle(overrides = {}) {
  return {
    id: "cognitive-load-theory",
    title: "Cognitive Load Theory",
    category: "Cognitive Science",
    clusters: [
      {
        id: "intrinsic-load",
        name: "Intrinsic Load",
        fact: "Intrinsic load stems from the inherent complexity of the material itself.",
        seeds: ["element interactivity", "information complexity"],
        floatingTerms: ["domain knowledge", "prior schemas"]
      },
      {
        id: "extraneous-load",
        name: "Extraneous Load",
        fact: "Extraneous load is created by poor instructional design.",
        seeds: ["redundancy effect", "split-attention effect"],
        floatingTerms: ["seductive details", "format distraction"]
      }
    ],
    bridges: [
      {
        term: "germane load",
        clusters: ["intrinsic-load", "extraneous-load"],
        fact: "Freeing working memory capacity lets mental effort shift toward schema construction."
      }
    ],
    ...overrides
  };
}

export async function run() {
  // A full valid conversion round-trips cleanly through the existing
  // validators -- the output is indistinguishable from hand-authored JSON-LD.
  {
    const input = validPuzzle();
    const { document, errors } = normalizeAuthoredPuzzleDocument(input);
    assert.deepEqual(errors, []);
    assert.equal(document["@context"], "https://concept-clusters.org/context/v1");
    assert.deepEqual(validateJsonLdProfile(document), []);
    const puzzle = puzzleFromJsonLd(document);
    assert.deepEqual(
      validatePuzzleContent(puzzle, { knownPuzzleIds: new Set([puzzle.id]) }),
      []
    );
  }

  // Seeds need not lead terms -- only a subset relationship is required.
  {
    const input = puzzleFromSimplified(SimplifiedPuzzleInputSchema.parse(validPuzzle({
      clusters: [
        {
          id: "a",
          name: "A",
          fact: "f",
          seeds: ["z", "y"],
          floatingTerms: ["x", "w"]
        },
        ...validPuzzle().clusters.slice(1)
      ],
      bridges: [{ term: "germane load", clusters: ["a", "extraneous-load"], fact: "f" }]
    })));
    assert.deepEqual(input.clusters[0].terms, ["z", "y", "x", "w"]);
    assert.deepEqual(input.clusters[0].seeds, ["z", "y"]);
  }

  // Unknown bridge cluster reference -- error, not a throw.
  {
    const input = validPuzzle({
      bridges: [{ term: "x", clusters: ["intrinsic-load", "nope"], fact: "f" }]
    });
    const result = normalizeAuthoredPuzzleDocument(input);
    assert.equal(result.document, null);
    assert.ok(result.errors.some(e => e.includes("nope")));
  }

  // Omitted bridge id gets stableLocalIds()'s usual bridge-<slug> default;
  // colliding bridge terms get suffixed distinctly.
  {
    const input = validPuzzle({
      clusters: [
        ...validPuzzle().clusters,
        { id: "third", name: "Third", fact: "f", seeds: ["p", "q"], floatingTerms: ["r"] }
      ],
      bridges: [
        { term: "germane load", clusters: ["intrinsic-load", "extraneous-load"], fact: "f1" },
        { term: "germane load", clusters: ["extraneous-load", "third"], fact: "f2" }
      ]
    });
    const { document, errors } = normalizeAuthoredPuzzleDocument(input);
    assert.deepEqual(errors, []);
    const ids = document.bridges.map(b => b.id);
    assert.deepEqual(ids, ["bridge-germane-load", "bridge-germane-load-2"]);
    assert.equal(document.bridges[0]["@id"], "#bridge-germane-load");
    assert.equal(document.bridges[1]["@id"], "#bridge-germane-load-2");
  }

  // Omitted cluster color gets an unused palette color; a cluster explicitly
  // claiming a color doesn't get stolen by an earlier auto-assignment.
  {
    const input = validPuzzle({
      clusters: [
        { ...validPuzzle().clusters[0], color: undefined },
        { ...validPuzzle().clusters[1], color: "teal" }
      ]
    });
    const { document, errors } = normalizeAuthoredPuzzleDocument(input);
    assert.deepEqual(errors, []);
    const colors = document.clusters.map(c => c.color);
    assert.equal(colors[1], "teal");
    assert.notEqual(colors[0], "teal");
    assert.equal(new Set(colors).size, 2);
  }

  // A lens missing `explanation` fails shape validation with a clear message.
  {
    const input = validPuzzle({
      lenses: [{ id: "raw", prompt: "Which are raw?", targets: ["intrinsic-load"] }]
    });
    const parsed = SimplifiedPuzzleInputSchema.safeParse(input);
    assert.equal(parsed.success, false);
    assert.ok(parsed.error.issues.some(i => i.path.includes("explanation")));
  }

  // A lens WITH explanation validates and survives conversion.
  {
    const input = validPuzzle({
      lenses: [{
        id: "raw",
        prompt: "Which are raw?",
        explanation: "Distinguishes unmediated force from managed expression.",
        targets: ["element interactivity", "information complexity", "domain knowledge"]
      }]
    });
    const { document, errors } = normalizeAuthoredPuzzleDocument(input);
    assert.deepEqual(errors, []);
    assert.equal(document.lenses[0].explanation, input.lenses[0].explanation);
  }

  // An unrecognized top-level key is rejected, not silently dropped -- this
  // is exactly the failure mode (a field that looks plausible but matches
  // nothing downstream) this schema exists to prevent.
  {
    const input = validPuzzle({ description: "should not be accepted" });
    const result = normalizeAuthoredPuzzleDocument(input);
    assert.equal(result.document, null);
    assert.ok(result.errors.some(e => e.includes("description")));
  }

  // generativeAssistance round-trips and passes its own validator.
  {
    const input = validPuzzle({
      generativeAssistance: [{ system: "Claude", scope: "puzzle", role: "drafted" }]
    });
    const { document, errors } = normalizeAuthoredPuzzleDocument(input);
    assert.deepEqual(errors, []);
    assert.deepEqual(validateGenerativeAssistance(document.generativeAssistance), []);
  }

  // Already-JSON-LD-shaped input passes through unchanged, untouched.
  {
    const jsonld = { "@context": "https://concept-clusters.org/context/v1", id: "x" };
    assert.equal(isJsonLdShaped(jsonld), true);
    const result = normalizeAuthoredPuzzleDocument(jsonld);
    assert.equal(result.document, jsonld);
    assert.deepEqual(result.errors, []);
  }

  // Bridges have no minimum -- zero bridges is valid simplified input.
  {
    const input = validPuzzle({ bridges: [] });
    const { document, errors } = normalizeAuthoredPuzzleDocument(input);
    assert.deepEqual(errors, []);
    assert.deepEqual(document.bridges, []);
  }

  // A structurally invalid simplified document never throws -- always
  // {document: null, errors}.
  {
    assert.deepEqual(normalizeAuthoredPuzzleDocument({}).document, null);
    assert.deepEqual(normalizeAuthoredPuzzleDocument({ id: "x" }).document, null);
    assert.doesNotThrow(() => normalizeAuthoredPuzzleDocument(null));
    assert.doesNotThrow(() => normalizeAuthoredPuzzleDocument("not an object"));
  }

  // "Simplified" means the identity ceremony is gone, not that features
  // are gone -- everything below is real puzzle content, not JSON-LD-only.

  // Cluster id is optional, derived from name (plain slug, no prefix) so a
  // bridge can predict what to reference; collisions get suffixed exactly
  // like stableLocalIds() already does for bridge ids.
  {
    const input = {
      id: "no-cluster-ids",
      title: "No Cluster Ids",
      category: "Science",
      clusters: [
        { name: "Alpha!", fact: "f1", seeds: ["a1", "a2"], floatingTerms: ["a3"] },
        { name: "Alpha?", fact: "f2", seeds: ["b1", "b2"], floatingTerms: ["b3"] }
      ],
      bridges: [{ term: "t", clusters: ["alpha", "alpha-2"], fact: "f" }]
    };
    const { document, errors } = normalizeAuthoredPuzzleDocument(input);
    assert.deepEqual(errors, []);
    assert.deepEqual(document.clusters.map(c => c.id), ["alpha", "alpha-2"]);
    assert.deepEqual(validateJsonLdProfile(document), []);
  }

  // Ternary bridges, direction, idealTerms, conceptId, termRole, and
  // relationKind all round-trip through the real validators with zero errors.
  {
    const input = {
      id: "advanced-bridge-fixture",
      title: "Advanced Bridge Fixture",
      category: "Science",
      clusters: [
        { id: "a", name: "A", fact: "fa", seeds: ["a1", "a2"], floatingTerms: ["a3"] },
        { id: "b", name: "B", fact: "fb", seeds: ["b1", "b2"], floatingTerms: ["b3"] },
        { id: "c", name: "C", fact: "fc", seeds: ["c1", "c2"], floatingTerms: ["c3"] }
      ],
      bridges: [
        { term: "ternary term", clusters: ["a", "b", "c"], fact: "ternary bridge" },
        {
          term: "directed term",
          clusters: ["a", "b"],
          fact: "directed bridge",
          termRole: "connector",
          relationKind: "dynamic",
          conceptId: "concept-x",
          direction: { kind: "through", from: "a", to: "b" },
          idealTerms: { a: "a1", b: "b2" }
        }
      ]
    };
    const { document, errors } = normalizeAuthoredPuzzleDocument(input);
    assert.deepEqual(errors, []);
    assert.deepEqual(validateJsonLdProfile(document), []);
    const puzzle = puzzleFromJsonLd(document);
    assert.deepEqual(
      validatePuzzleContent(puzzle, { knownPuzzleIds: new Set([puzzle.id]) }),
      []
    );
    assert.equal(puzzle.bridges[1].direction.kind, "through");
    assert.equal(puzzle.bridges[1].idealTerms[0], "a1");
    assert.equal(puzzle.bridges[1].conceptId, "concept-x");
    assert.equal(puzzle.bridges[1].termRole, "connector");
    assert.equal(document.bridges[1].termRole, "connector");

    const invalidRole = normalizeAuthoredPuzzleDocument({
      ...input,
      bridges: [{
        term: "invalid role",
        clusters: ["a", "b"],
        fact: "invalid role bridge",
        termRole: "phrase"
      }]
    });
    assert.equal(invalidRole.document, null);
    assert.ok(invalidRole.errors.some(error => error.includes("termRole")));
  }

  // idealTerms referencing a cluster outside the bridge's own clusters, and
  // direction.from outside the bridge's own clusters, are clear errors.
  {
    const badIdeal = validPuzzle({
      bridges: [{
        term: "germane load",
        clusters: ["intrinsic-load", "extraneous-load"],
        fact: "f",
        idealTerms: { nope: "x" }
      }]
    });
    const idealResult = normalizeAuthoredPuzzleDocument(badIdeal);
    assert.equal(idealResult.document, null);
    assert.ok(idealResult.errors.some(e => e.includes("nope")));

    const badDirection = validPuzzle({
      bridges: [{
        term: "germane load",
        clusters: ["intrinsic-load", "extraneous-load"],
        fact: "f",
        direction: { kind: "through", from: "nope", to: "extraneous-load" }
      }]
    });
    const directionResult = normalizeAuthoredPuzzleDocument(badDirection);
    assert.equal(directionResult.document, null);
    assert.ok(directionResult.errors.some(e => e.includes("nope")));
  }

  // Assignment-mode and quiz-mode lenses both round-trip cleanly.
  {
    const clusters = [
      { id: "a", name: "A", fact: "fa", seeds: ["a1", "a2"], floatingTerms: ["a3"] },
      { id: "b", name: "B", fact: "fb", seeds: ["b1", "b2"], floatingTerms: ["b3"] }
    ];
    const bridges = [{ term: "bt", clusters: ["a", "b"], fact: "f" }];

    const assignment = {
      id: "assignment-fixture", title: "Assignment", category: "Science", clusters, bridges,
      lensMode: "assignment",
      lenses: [
        { id: "l1", prompt: "p1", explanation: "e1", targets: ["a1", "a2"], reasons: { a1: "because" } },
        { id: "l2", prompt: "p2", explanation: "e2", targets: ["b1", "b2"] }
      ]
    };
    const assignmentResult = normalizeAuthoredPuzzleDocument(assignment);
    assert.deepEqual(assignmentResult.errors, []);
    const assignmentPuzzle = puzzleFromJsonLd(assignmentResult.document);
    assert.deepEqual(
      validatePuzzleContent(assignmentPuzzle, { knownPuzzleIds: new Set([assignmentPuzzle.id]) }),
      []
    );

    const quiz = {
      id: "quiz-fixture", title: "Quiz", category: "Science", clusters, bridges,
      lensMode: "quiz",
      lenses: [{
        id: "q1", prompt: "which", explanation: "e",
        options: [
          { id: "opt1", label: "Option 1", correct: true, targets: ["a1"] },
          { id: "opt2", label: "Option 2", targets: ["b1"] }
        ]
      }]
    };
    const quizResult = normalizeAuthoredPuzzleDocument(quiz);
    assert.deepEqual(quizResult.errors, []);
    const quizPuzzle = puzzleFromJsonLd(quizResult.document);
    assert.deepEqual(
      validatePuzzleContent(quizPuzzle, { knownPuzzleIds: new Set([quizPuzzle.id]) }),
      []
    );
  }

  // relatedPuzzles and learningIntroduction round-trip cleanly.
  {
    const input = validPuzzle({
      relatedPuzzles: { entries: [{ id: "energy-flow", reason: "shares a theme" }] },
      learningIntroduction: {
        requirement: "optional",
        title: "Before you begin",
        content: { text: "# Hello\nSome markdown." }
      }
    });
    const { document, errors } = normalizeAuthoredPuzzleDocument(input);
    assert.deepEqual(errors, []);
    const puzzle = puzzleFromJsonLd(document);
    assert.deepEqual(
      validatePuzzleContent(puzzle, { knownPuzzleIds: new Set([puzzle.id, "energy-flow"]) }),
      []
    );
    assert.equal(puzzle.relatedPuzzles.entries[0].id, "energy-flow");
    assert.equal(puzzle.learningIntroduction.content.mediaType, "text/markdown");
    assert.equal(puzzle.learningIntroduction.content.text, "# Hello\nSome markdown.");
  }

  {
    const input = validPuzzle({
      learningIntroduction: {
        requirement: "optional",
        title: "Before you begin",
        credit: "By Jane Doe, with assistance from Gemini 3.1 Pro",
        content: { text: "# Hello\nSome markdown." }
      }
    });
    const { puzzle, errors } = puzzleFromAuthoredDocument(input);
    assert.deepEqual(errors, []);
    assert.equal(
      puzzle.learningIntroduction.credit,
      "By Jane Doe, with assistance from Gemini 3.1 Pro"
    );
  }

  // Tool-argument Markdown that used the two-character sequence \n instead
  // of real line breaks becomes actual Markdown on conversion.
  {
    const input = validPuzzle({
      learningIntroduction: {
        requirement: "optional",
        content: { text: "# Hello\\n\\n## Section\\nSome markdown." }
      }
    });
    const { puzzle, errors } = puzzleFromAuthoredDocument(input);
    assert.deepEqual(errors, []);
    assert.equal(
      puzzle.learningIntroduction.content.text,
      "# Hello\n\n## Section\nSome markdown."
    );
  }

  // Provenance fields pass straight through.
  {
    const input = validPuzzle({ creator: "Jane Doe", license: "CC-BY-4.0", language: "en" });
    const { document, errors } = normalizeAuthoredPuzzleDocument(input);
    assert.deepEqual(errors, []);
    assert.equal(document.creator, "Jane Doe");
    assert.equal(document.license, "CC-BY-4.0");
    assert.equal(document.language, "en");
  }

  // Leftover link/sources names are a load-time fold, not the write schema.
  {
    const leftover = validPuzzle({
      info: { text: "Note.", link: "wiki:Ethos" },
      learningIntroduction: {
        requirement: "optional",
        content: { text: "Body." },
        sources: [{ label: "Handout", href: "https://example.org/handout" }]
      }
    });
    assert.equal(SimplifiedPuzzleInputSchema.safeParse(leftover).success, false);
    const { puzzle, errors } = puzzleFromAuthoredDocument(leftover);
    assert.deepEqual(errors, []);
    assert.deepEqual(puzzle.info.links, [{ href: "wiki:Ethos" }]);
    assert.equal(puzzle.info.link, undefined);
    assert.deepEqual(puzzle.learningIntroduction.links, [
      { href: "https://example.org/handout", label: "Handout" }
    ]);
    assert.equal(puzzle.learningIntroduction.sources, undefined);
  }
}
