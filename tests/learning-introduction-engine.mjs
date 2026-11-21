import assert from "node:assert/strict";
import fromEvidenceToAction from "../puzzles/public-health/from-evidence-to-action.js";
import { validatePuzzleContent } from "../modules/contentValidation.js";
import {
  formatHostCredit,
  lessonCredit
} from "../modules/generativeAssistance.js";
import {
  decodeAuthoredEscapedNewlines,
  learningIntroductionGate,
  normalizedLearningIntroduction
} from "../modules/learningIntroduction.js";
import {
  loadLearningIntroductionStatus,
  saveLearningIntroductionStatus
} from "../modules/learningIntroductionStore.js";
import {
  definePuzzle,
  resolvePuzzleResourceUrl
} from "../modules/puzzleManifest.js";
import { validateLearningIntroduction } from "../modules/learningIntroductionValidation.js";
import { validateLearningIntroductionStructure } from "../modules/learningIntroductionValidationCore.js";
import { fenceClasses, fenceCloseIndex, lessonBlockFor, lessonBlockIssues } from "../modules/lessonBlocks.js";

export const name = "learning introductions: resources, requirements, and acknowledgement";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
}

export async function run() {
  assert.equal(
    decodeAuthoredEscapedNewlines("# Title\\n\\n## Section\\nBody."),
    "# Title\n\n## Section\nBody."
  );
  assert.equal(
    decodeAuthoredEscapedNewlines("# Title\n\n## Section\nBody."),
    "# Title\n\n## Section\nBody."
  );
  assert.equal(
    decodeAuthoredEscapedNewlines("Use the sequence \\n in JSON source.\nKeep this line."),
    "Use the sequence \\n in JSON source.\nKeep this line."
  );

  const introduction = normalizedLearningIntroduction(fromEvidenceToAction);
  assert.equal(introduction.requirement, "recommended");
  assert.equal(introduction.revision, undefined);
  assert.equal(learningIntroductionGate(introduction, null), true);
  assert.equal(learningIntroductionGate(introduction, "skipped"), false);
  assert.equal(learningIntroductionGate({ requirement: "required" }, "skipped"), true);
  assert.equal(learningIntroductionGate({ requirement: "required" }, "read"), false);
  assert.equal(learningIntroductionGate({ requirement: "optional" }, null), false);

  const packagedPuzzle = definePuzzle(
    new URL("../puzzles/public-health/from-evidence-to-action.js", import.meta.url),
    {
      ...fromEvidenceToAction,
      learningIntroduction: {
        ...fromEvidenceToAction.learningIntroduction,
        content: {
          src: "./from-evidence-to-action.intro.md",
          mediaType: "text/markdown"
        }
      }
    }
  );

  const resource = resolvePuzzleResourceUrl(
    packagedPuzzle,
    packagedPuzzle.learningIntroduction.content.src
  );
  assert.match(resource.pathname, /from-evidence-to-action\.intro\.md$/);
  assert.throws(
    () => resolvePuzzleResourceUrl(packagedPuzzle, "../unrelated.md"),
    /cannot escape/
  );
  assert.throws(
    () => resolvePuzzleResourceUrl(packagedPuzzle, "./other-puzzle.intro.md"),
    /must begin with "from-evidence-to-action\."/
  );
  assert.deepEqual(await validateLearningIntroduction(packagedPuzzle), []);
  assert.equal(
    formatHostCredit(fromEvidenceToAction.provenance?.contributors),
    "Drafted with Claude"
  );
  assert.equal(
    formatHostCredit([{ name: "Jane Doe" }, { name: "Codex" }]),
    "Drafted with Codex"
  );
  assert.equal(formatHostCredit([{ name: "Jane Doe" }]), null);
  assert.equal(
    lessonCredit(
      { credit: "By Jane Doe, with assistance from Gemini 3.1 Pro" },
      fromEvidenceToAction.provenance?.contributors
    ),
    "By Jane Doe, with assistance from Gemini 3.1 Pro"
  );
  assert.equal(
    lessonCredit({}, fromEvidenceToAction.provenance?.contributors),
    "Drafted with Claude"
  );
  assert.deepEqual(validatePuzzleContent(fromEvidenceToAction), []);

  const storage = memoryStorage();
  assert.equal(loadLearningIntroductionStatus(storage, fromEvidenceToAction), null);
  assert.equal(saveLearningIntroductionStatus(storage, fromEvidenceToAction, "read"), true);
  assert.equal(loadLearningIntroductionStatus(storage, fromEvidenceToAction), "read");
  assert.equal(saveLearningIntroductionStatus(storage, fromEvidenceToAction, "unknown"), false);
  const revisedPuzzle = {
    ...fromEvidenceToAction,
    learningIntroduction: {
      ...fromEvidenceToAction.learningIntroduction,
      content: {
        ...fromEvidenceToAction.learningIntroduction.content,
        text: `${fromEvidenceToAction.learningIntroduction.content.text}\n\nA changed lesson.`
      }
    }
  };
  assert.equal(loadLearningIntroductionStatus(storage, revisedPuzzle), null);

  const invalid = definePuzzle(
    new URL("../puzzles/public-health/fixture.js", import.meta.url),
    {
      id: "fixture",
      learningIntroduction: {
        requirement: "sometimes",
        content: { text: "", src: "./fixture.intro.md", mediaType: "text/html" }
      }
    }
  );
  const errors = await validateLearningIntroduction(invalid);
  assert.ok(errors.some(error => error.includes("optional")));
  assert.ok(errors.some(error => error.includes("text/markdown")));
  assert.ok(errors.some(error => error.includes("exactly one")));

  const unsafeAsset = definePuzzle(
    new URL("../puzzles/public-health/fixture.js", import.meta.url),
    {
      id: "fixture",
      learningIntroduction: {
        requirement: "optional",
        content: {
          text: "![](./fixture.missing.svg)",
          mediaType: "text/markdown"
        }
      }
    }
  );
  const assetErrors = await validateLearningIntroduction(unsafeAsset);
  assert.ok(assetErrors.some(error => error.includes("non-empty alt text")));
  assert.ok(assetErrors.some(error => error.includes("invalid or missing")));

  // IASP lesson blocks: brace and shorthand forms name the same block;
  // layout-only classes and attributes do not change it.
  assert.equal(lessonBlockFor(fenceClasses("{.note .insight}"))?.kind, "insight");
  assert.equal(lessonBlockFor(fenceClasses("note.insight"))?.kind, "insight");
  assert.equal(lessonBlockFor(fenceClasses('{.epigraph concepts="a:b"}'))?.kind, "epigraph");
  assert.equal(
    lessonBlockFor(fenceClasses("{.sidebar .sidebar-block .example}"))?.kind, "example");
  assert.equal(lessonBlockFor(fenceClasses("note.definition"))?.kind, "definition");
  assert.equal(lessonBlockFor(fenceClasses("note.warning")), null);
  assert.equal(lessonBlockFor(fenceClasses("{.note .insight .warning}")), null);

  const blocks = [
    "<!-- quote 12 -->",
    "::: {.epigraph}",
    "Words.",
    "",
    "— Someone, *Book*",
    ":::",
    "",
    "::: note.insight",
    "::: {.note .definition}",
    "Nested.",
    ":::",
    ":::",
    "",
    "```",
    "::: note.warning",
    "```"
  ].join("\n");
  assert.deepEqual(lessonBlockIssues(blocks), []);
  const bad = lessonBlockIssues("::: note.warning\nCareful.\n:::\n\n::: epigraph\nOpen.");
  assert.equal(bad.length, 2);
  assert.match(bad[0], /"::: note.warning" is not a lesson block/);
  assert.match(bad[1], /1 ":::" block\(s\) left unclosed/);
  assert.match(lessonBlockIssues(":::")[0], /closes no open block/);
  // A ::: line inside code within a block does not nest, so the block's own
  // close is found and later lesson text stays outside it.
  const codeInBlock = ["::: note.insight", "```", "::: note.warning", "```", ":::", "After."];
  assert.equal(fenceCloseIndex(codeInBlock, 0), 4);
  assert.deepEqual(lessonBlockIssues(codeInBlock.join("\n")), []);

  const withBlock = text => ({
    learningIntroduction: {
      requirement: "optional",
      content: { mediaType: "text/markdown", text }
    }
  });
  assert.deepEqual(validateLearningIntroductionStructure(withBlock(blocks)), []);
  assert.ok(validateLearningIntroductionStructure(withBlock("::: callout\nHi.\n:::"))
    .some(error => error.includes("is not a lesson block")));

  // Companion / standalone Ghost article lessons:
  const standaloneArticlePuzzle = {
    id: "ghost-lesson",
    learningIntroduction: {
      requirement: "recommended",
      summary: "Why signals and causes diverge.",
      article: {
        url: "https://essays.example.org/signals-and-causes/",
        title: "Signals Are Not Yet Causes",
        summary: "Full essay with primary-source citations.",
        estimatedMinutes: 14
      }
    }
  };
  assert.deepEqual(validateLearningIntroductionStructure(standaloneArticlePuzzle), []);
  assert.deepEqual(await validateLearningIntroduction(standaloneArticlePuzzle), []);
  const normalizedStandalone = normalizedLearningIntroduction(standaloneArticlePuzzle);
  assert.equal(normalizedStandalone.title, "Signals Are Not Yet Causes");
  assert.equal(learningIntroductionGate(normalizedStandalone, null), true);
  assert.equal(learningIntroductionGate(normalizedStandalone, "skipped"), false);
  assert.equal(learningIntroductionGate(normalizedStandalone, "read"), false);
  // Even if hand-edited to "required", an external-only article never hard-locks.
  assert.equal(
    learningIntroductionGate({
      requirement: "required",
      article: { url: "https://essays.example.org/signals-and-causes/" }
    }, "skipped"),
    false
  );
  // Validation rejects "required" without embedded content, non-http(s) article URLs,
  // and lessons that omit both content and article.
  assert.ok(
    validateLearningIntroductionStructure({
      learningIntroduction: {
        requirement: "required",
        article: { url: "https://essays.example.org/signals-and-causes/" }
      }
    }).some(error => error.includes('cannot be "required" when content is omitted'))
  );
  assert.ok(
    validateLearningIntroductionStructure({
      learningIntroduction: {
        requirement: "optional",
        article: { url: "wiki:Epidemiology" }
      }
    }).some(error => error.includes("full http(s) URL"))
  );
  assert.ok(
    validateLearningIntroductionStructure({
      learningIntroduction: { requirement: "optional", title: "Empty" }
    }).some(error => error.includes("must provide content, article, or both"))
  );

  // Paired ("expanded lesson") with embedded orientation + Ghost article:
  const pairedArticlePuzzle = definePuzzle(
    new URL("../puzzles/public-health/from-evidence-to-action.js", import.meta.url),
    {
      ...fromEvidenceToAction,
      learningIntroduction: {
        requirement: "required",
        title: "Before You Begin",
        content: {
          mediaType: "text/markdown",
          text: "Short in-app orientation."
        },
        article: {
          url: "https://essays.example.org/from-evidence-to-action/",
          title: "From Evidence to Action (Full Essay)",
          estimatedMinutes: 18
        }
      }
    }
  );
  assert.deepEqual(await validateLearningIntroduction(pairedArticlePuzzle), []);

  // Round-trip simplified <-> runtime <-> JSON-LD + link check:
  const { puzzleFromAuthoredDocument, puzzleToSimplified } = await import("../modules/simplifiedPuzzleSchema.js");
  const { puzzleToJsonLd, puzzleFromJsonLd } = await import("../modules/puzzleJsonLd.js");
  const { collectDocumentWebLinks } = await import("../modules/wikiLinkCheck.js");
  const simplifiedStandalone = puzzleToSimplified({
    ...fromEvidenceToAction,
    learningIntroduction: standaloneArticlePuzzle.learningIntroduction
  });
  assert.equal(simplifiedStandalone.learningIntroduction.content, undefined);
  assert.equal(
    simplifiedStandalone.learningIntroduction.article.url,
    "https://essays.example.org/signals-and-causes/"
  );
  const compiledStandalone = puzzleFromAuthoredDocument(simplifiedStandalone);
  assert.deepEqual(compiledStandalone.errors, []);
  assert.equal(compiledStandalone.puzzle.learningIntroduction.content, undefined);
  assert.equal(
    compiledStandalone.puzzle.learningIntroduction.article.estimatedMinutes,
    14
  );
  const jsonLdRoundTrip = puzzleFromJsonLd(puzzleToJsonLd(compiledStandalone.puzzle));
  assert.deepEqual(
    jsonLdRoundTrip.learningIntroduction.article,
    compiledStandalone.puzzle.learningIntroduction.article
  );
  assert.ok(
    collectDocumentWebLinks(simplifiedStandalone).some(
      entry =>
        entry.where === "learningIntroduction.article" &&
        entry.link === "https://essays.example.org/signals-and-causes/"
    )
  );
}
