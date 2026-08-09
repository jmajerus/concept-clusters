import assert from "node:assert/strict";
import { validateJsonLdProfile } from "../modules/jsonLdProfile.js";
import { validatePuzzleContent } from "../modules/contentValidation.js";
import { validateGenerativeAssistance } from "../modules/generativeAssistance.js";
import { puzzleFromJsonLd } from "../modules/puzzleJsonLd.js";
import {
  isJsonLdShaped,
  normalizeAuthoredPuzzleDocument,
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
}
