import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import { CATEGORIES } from "../puzzles/categories.js";
import { searchAuthoringPuzzles } from "../modules/authoringPuzzleSearch.js";

export const name = "Authoring puzzle search (category-scoped)";

export async function run() {
  const feedback = searchAuthoringPuzzles(PUZZLES, CATEGORIES, {
    query: "feedback",
    category: "Engineering"
  });
  assert.ok(feedback.matches.some(match => match.id === "closing-the-loop"));
  const closing = feedback.matches.find(match => match.id === "closing-the-loop");
  assert.equal(closing.match, "term");
  assert.equal(closing.detail?.value, "feedback");

  const scoped = searchAuthoringPuzzles(PUZZLES, CATEGORIES, {
    query: "feedback",
    category: "Art"
  });
  assert.ok(!scoped.matches.some(match => match.id === "closing-the-loop"));

  const corpus = searchAuthoringPuzzles(PUZZLES, CATEGORIES, {
    query: "feedback",
    limit: 3
  });
  assert.ok(corpus.matches.length <= 3);
  assert.ok(corpus.matches.some(match => match.id === "closing-the-loop"));

  assert.throws(
    () => searchAuthoringPuzzles(PUZZLES, CATEGORIES, {
      query: "feedback",
      category: "Not A Real Category"
    }),
    /Unknown category/
  );

  const empty = searchAuthoringPuzzles(PUZZLES, CATEGORIES, { query: "   " });
  assert.deepEqual(empty.matches, []);
}
