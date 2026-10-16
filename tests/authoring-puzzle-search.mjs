import assert from "node:assert/strict";
import { PUZZLES } from "../puzzles/index.js";
import { CATEGORIES } from "../puzzles/categories.js";
import {
  filterAuthoringPuzzles,
  mergeAuthoringSearchPuzzles,
  searchAuthoringPuzzles,
  sortByRecent
} from "../modules/authoringPuzzleSearch.js";
import { recencyKey, updatedWithin } from "../modules/puzzleCorpusStatus.js";

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

  const hiddenCreditToken = "zxqv-opaque-credit-search-token";
  const legacyCreditDrafts = mergeAuthoringSearchPuzzles({
    drafts: [{
      draftId: "legacy-credit-search",
      puzzleId: "legacy-credit-search",
      document: {
        id: "legacy-credit-search",
        title: "Legacy credit search fixture",
        category: "Science",
        clusters: [],
        learningIntroduction: {
          requirement: "optional",
          content: { text: "Ordinary lesson content." },
          credit: `Opaque human byline ${hiddenCreditToken}`
        }
      }
    }]
  });
  assert.equal(legacyCreditDrafts[0]?.learningIntroduction?.credit, undefined);
  const hiddenCreditSearch = searchAuthoringPuzzles(legacyCreditDrafts, CATEGORIES, {
    query: hiddenCreditToken,
    fullText: true
  });
  assert.deepEqual(hiddenCreditSearch.matches, []);

  const renamed = mergeAuthoringSearchPuzzles({
    gitPuzzles: [{
      id: "renamed-search-fixture",
      title: "Renamed search fixture",
      category: "Old Subject",
      clusters: []
    }],
    categoryRegistry: {
      "Current Subject": { slug: "current-subject", previousTitles: ["Old Subject"] }
    }
  });
  assert.equal(renamed[0]?.category, "Current Subject");

  composableFilters();
}

// list_puzzles and search_puzzles share these filters; status and recency
// must select what the admin puzzle list's Show filters and Recent groups do.
function composableFilters() {
  const now = new Date("2026-10-15T15:00:00");
  const daysAgo = days => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  const sample = PUZZLES.find(puzzle =>
    puzzle.subcategories && Object.keys(puzzle.subcategories).length
  );
  const [subKey, subId] = Object.entries(sample.subcategories)[0];
  const doc = (id, extra = {}) => ({
    id,
    title: `Filter fixture ${id}`,
    category: sample.category,
    clusters: [{ id: "a", name: "Alpha", seeds: ["one", "two"] }],
    ...extra
  });
  const corpus = mergeAuthoringSearchPuzzles({
    publishedRows: [
      {
        id: "live-only",
        updatedAt: daysAgo(0),
        document: doc("live-only", {
          tags: ["Filter-Tag"],
          puzzleKind: "vocabulary-context",
          subcategories: { [subKey]: subId },
          lenses: [{ id: "l1", title: "Lens" }]
        })
      },
      { id: "live-edited", updatedAt: daysAgo(40), document: doc("live-edited") },
      { id: "withdrawn", updatedAt: daysAgo(1), withdrawnAt: daysAgo(1), document: doc("withdrawn") }
    ],
    drafts: [
      { draftId: "live-edited", updatedAt: daysAgo(3), document: doc("live-edited", { title: "Edited title" }) },
      { draftId: "fresh-draft", updatedAt: daysAgo(10), document: doc("fresh-draft") }
    ],
    categoryRegistry: CATEGORIES
  });
  const ids = options => filterAuthoringPuzzles(corpus, {
    categoryRegistry: CATEGORIES,
    now,
    ...options
  }).map(puzzle => puzzle.id).sort();

  assert.deepEqual(ids({ status: "published_only" }), ["live-only"]);
  assert.deepEqual(ids({ status: "working" }), ["fresh-draft"]);
  assert.deepEqual(ids({ status: "unpublished_changes" }), ["live-edited"]);
  const edited = corpus.find(puzzle => puzzle.id === "live-edited");
  assert.deepEqual(edited._corpus.unpublishedChangeDomains, ["content"]);

  assert.deepEqual(ids({ updatedWithin: "today" }), ["live-only"]);
  assert.deepEqual(ids({ updatedWithin: "week" }), ["live-edited", "live-only", "withdrawn"]);
  assert.deepEqual(ids({ updatedWithin: "month" }), ["fresh-draft", "live-edited", "live-only", "withdrawn"]);

  assert.deepEqual(ids({ tag: "filter-tag" }), ["live-only"]);
  assert.deepEqual(ids({ puzzleKind: "vocabulary-context" }), ["live-only"]);
  assert.equal(ids({ puzzleKind: "topic-based" }).length, 3, "No puzzleKind is the topic-based kind");
  assert.deepEqual(ids({ hasLenses: true }), ["live-only"]);
  assert.deepEqual(ids({ subcategory: subId }), ["live-only"]);
  assert.deepEqual(ids({ subcategory: subId, category: sample.category }), ["live-only"]);
  assert.deepEqual(ids({ status: "published_only", hasLenses: false }), [], "Filters combine with AND");
  assert.throws(() => ids({ status: "cued" }), /Unknown status/);

  assert.deepEqual(
    sortByRecent(corpus).map(puzzle => puzzle.id),
    ["live-only", "withdrawn", "live-edited", "fresh-draft"]
  );
  assert.equal(recencyKey(daysAgo(6), now), "week");
  assert.equal(updatedWithin(daysAgo(20), "week", now), false);
  assert.equal(updatedWithin("", "month", now), false, "Undated rows fall outside every window");

  // Bookkeeping stays out of full-text search.
  const leak = searchAuthoringPuzzles(corpus, CATEGORIES, {
    query: daysAgo(3).slice(0, 10),
    fullText: true
  });
  assert.deepEqual(leak.matches, []);
  for (const query of ["draft", "fresh-draft-bookkeeping"]) {
    const bookkeeping = searchAuthoringPuzzles(mergeAuthoringSearchPuzzles({
      drafts: [{ draftId: "fresh-draft-bookkeeping", document: doc("bookkept") }],
      categoryRegistry: CATEGORIES
    }), CATEGORIES, { query, fullText: true });
    assert.deepEqual(bookkeeping.matches, [], `"${query}" must not match _searchSource or _draftId`);
  }
}
