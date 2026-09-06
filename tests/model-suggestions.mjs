import assert from "node:assert/strict";
import {
  AUTHORING_MODEL_SUGGESTIONS,
  modelSuggestionsForHost
} from "../modules/authoringModelSuggestions.js";
import {
  ADD_MODEL_SUGGESTION_CONFIRM,
  REMOVE_MODEL_SUGGESTION_CONFIRM,
  renderModelSuggestionsAdminPage
} from "../modules/modelSuggestionsAdminPage.js";

export const name = "Model suggestions: seed/custom merge and admin page";

export async function run() {
  // No custom labels: the seed list is returned as-is, "Custom Model" last.
  assert.deepEqual(modelSuggestionsForHost(), AUTHORING_MODEL_SUGGESTIONS);
  assert.equal(modelSuggestionsForHost().at(-1), "Custom Model");

  // Custom labels land before "Custom Model"; a repeat of a seed label
  // (case-insensitive) is not duplicated.
  const merged = modelSuggestionsForHost(["Muse Spark 4.0", "claude opus 5"]);
  assert.equal(merged.at(-1), "Custom Model");
  assert.equal(merged.filter(label => label.toLowerCase() === "claude opus 5").length, 1);
  assert.ok(merged.includes("Muse Spark 4.0"));
  assert.ok(merged.indexOf("Muse Spark 4.0") < merged.indexOf("Custom Model"));

  // Blank/whitespace-only custom entries are dropped, not rendered as options.
  assert.deepEqual(
    modelSuggestionsForHost(["  ", ""]),
    AUTHORING_MODEL_SUGGESTIONS
  );

  const emptyPage = renderModelSuggestionsAdminPage({ customLabels: [] });
  assert.match(emptyPage, /<title>Model suggestions<\/title>/);
  assert.match(emptyPage, /None added yet\./);
  assert.match(emptyPage, new RegExp(`value="${ADD_MODEL_SUGGESTION_CONFIRM}"`));
  assert.match(emptyPage, /<li>Codex 5\.3<\/li>/);
  assert.doesNotMatch(emptyPage, /<li>Custom Model<\/li>/);

  const populatedPage = renderModelSuggestionsAdminPage({ customLabels: ["Muse Spark 4.0"] });
  assert.match(populatedPage, /Muse Spark 4\.0/);
  assert.match(populatedPage, new RegExp(`value="${REMOVE_MODEL_SUGGESTION_CONFIRM}"`));
  assert.doesNotMatch(populatedPage, /None added yet\./);

  const errorPage = renderModelSuggestionsAdminPage({ customLabels: [], error: "label is required" });
  assert.match(errorPage, /class="error">label is required</);
}
