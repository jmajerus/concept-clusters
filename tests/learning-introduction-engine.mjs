import assert from "node:assert/strict";
import fromEvidenceToAction from "../puzzles/public-health/from-evidence-to-action.js";
import { validatePuzzleContent } from "../modules/contentValidation.js";
import {
  formatAssistanceCredit,
  upsertGenerativeAssistance
} from "../modules/generativeAssistance.js";
import {
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
  const introduction = normalizedLearningIntroduction(fromEvidenceToAction);
  assert.equal(introduction.requirement, "recommended");
  assert.equal(introduction.revision, "1");
  assert.equal(learningIntroductionGate(introduction, null), true);
  assert.equal(learningIntroductionGate(introduction, "skipped"), false);
  assert.equal(learningIntroductionGate({ requirement: "required" }, "skipped"), true);
  assert.equal(learningIntroductionGate({ requirement: "required" }, "read"), false);
  assert.equal(learningIntroductionGate({ requirement: "optional" }, null), false);

  const resource = resolvePuzzleResourceUrl(
    fromEvidenceToAction,
    fromEvidenceToAction.learningIntroduction.content.src
  );
  assert.match(resource.pathname, /from-evidence-to-action\.intro\.md$/);
  assert.throws(
    () => resolvePuzzleResourceUrl(fromEvidenceToAction, "../unrelated.md"),
    /cannot escape/
  );
  assert.throws(
    () => resolvePuzzleResourceUrl(fromEvidenceToAction, "./other-puzzle.intro.md"),
    /must begin with "from-evidence-to-action\."/
  );
  assert.deepEqual(await validateLearningIntroduction(fromEvidenceToAction), []);
  assert.equal(fromEvidenceToAction.generativeAssistance?.[0]?.system, "Claude");
  assert.equal(
    formatAssistanceCredit(fromEvidenceToAction.generativeAssistance),
    "Assisted by Claude"
  );
  assert.deepEqual(
    validatePuzzleContent(fromEvidenceToAction).filter(error =>
      error.includes("generativeAssistance")
    ),
    []
  );
  assert.ok(
    validatePuzzleContent({
      ...fromEvidenceToAction,
      generativeAssistance: [{ system: "Claude" }]
    }).some(error => error.includes("generativeAssistance[0].scope"))
  );
  assert.deepEqual(
    upsertGenerativeAssistance(fromEvidenceToAction.generativeAssistance, {
      system: "Claude",
      scope: "learningIntroduction",
      role: "edited",
      date: "2026-08-07"
    }),
    [{
      system: "Claude",
      provider: "Anthropic",
      scope: "learningIntroduction",
      role: "edited",
      date: "2026-08-07"
    }]
  );

  const storage = memoryStorage();
  assert.equal(loadLearningIntroductionStatus(storage, fromEvidenceToAction), null);
  assert.equal(saveLearningIntroductionStatus(storage, fromEvidenceToAction, "read"), true);
  assert.equal(loadLearningIntroductionStatus(storage, fromEvidenceToAction), "read");
  assert.equal(saveLearningIntroductionStatus(storage, fromEvidenceToAction, "unknown"), false);
  const revisedPuzzle = {
    ...fromEvidenceToAction,
    learningIntroduction: {
      ...fromEvidenceToAction.learningIntroduction,
      revision: 2
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
}
