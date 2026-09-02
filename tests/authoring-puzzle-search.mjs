import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import { CATEGORIES } from "../puzzles/categories.js";
import {
  mergeAuthoringSearchPuzzles,
  searchAuthoringPuzzles
} from "../modules/authoringPuzzleSearch.js";

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
    limit: 25
  });
  assert.ok(corpus.matches.length <= 25);
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

  const gitPuzzle = {
    id: "search-merge-fixture",
    title: "Git title",
    category: "Science",
    clusters: [{ name: "Alpha", terms: ["one", "two", "three"], fact: "Git-only fact token." }]
  };
  const published = {
    id: "search-merge-fixture",
    title: "Published title",
    category: "Science",
    clusters: [{
      name: "Alpha",
      seeds: ["one", "two"],
      floatingTerms: ["three"],
      fact: "Published fact zxqv-published-prose."
    }]
  };
  const draft = {
    draftId: "search-merge-fixture",
    puzzleId: "search-merge-fixture",
    document: {
      id: "search-merge-fixture",
      title: "Draft title",
      category: "Science",
      clusters: [{
        name: "Alpha",
        seeds: ["one", "two"],
        floatingTerms: ["three"],
        fact: "Draft fact zxqv-draft-prose."
      }]
    }
  };
  const merged = mergeAuthoringSearchPuzzles({
    gitPuzzles: [gitPuzzle],
    publishedRows: [{ document: published }],
    drafts: [draft]
  });
  assert.equal(merged.length, 1);
  assert.equal(merged[0]._searchSource, "draft");
  assert.equal(merged[0].title, "Draft title");

  const draftHit = searchAuthoringPuzzles(merged, CATEGORIES, {
    query: "zxqv-draft-prose",
    fullText: true
  });
  assert.equal(draftHit.matches[0]?.id, "search-merge-fixture");
  assert.equal(draftHit.matches[0]?.source, "draft");
  assert.equal(draftHit.matches[0]?.match, "fulltext");

  const noProse = searchAuthoringPuzzles(merged, CATEGORIES, {
    query: "zxqv-draft-prose"
  });
  assert.deepEqual(noProse.matches, []);

  const publishedOnly = mergeAuthoringSearchPuzzles({
    gitPuzzles: [gitPuzzle],
    publishedRows: [{ document: published }]
  });
  const publishedHit = searchAuthoringPuzzles(publishedOnly, CATEGORIES, {
    query: "zxqv-published-prose",
    fullText: true
  });
  assert.equal(publishedHit.matches[0]?.source, "published");
}
