import assert from "node:assert/strict";
import {
  PUZZLE_MATCH,
  catalogueMatchesQuery,
  matchingCatalogues,
  puzzleMatchRank,
  puzzleMatchesQuery,
  rankedPuzzleMatches,
  searchableCatalogues
} from "../modules/librarySearch.js";
import { libraryCatalogues } from "../modules/catalogueRegistry.js";

export const name = "library search engine: fields, ranking, nested catalogues";

function puzzle(overrides = {}) {
  return {
    id: "inside-the-cell",
    title: "Inside the cell",
    category: "Biology",
    subcategories: { Biology: "foundations" },
    tags: ["organelles"],
    clusters: [
      {
        name: "Energy transformation",
        terms: ["mitochondrion", "ATP", "chloroplast"]
      }
    ],
    bridges: [{ term: "active transport" }],
    ...overrides
  };
}

export async function run() {
  const cell = puzzle();

  assert.equal(puzzleMatchRank(cell, "inside"), PUZZLE_MATCH.TITLE);
  assert.equal(puzzleMatchRank(cell, "biology"), PUZZLE_MATCH.CATEGORY);
  assert.equal(puzzleMatchRank(cell, "organelles"), PUZZLE_MATCH.TAG);
  assert.equal(puzzleMatchRank(cell, "Foundations"), PUZZLE_MATCH.SUBCATEGORY);
  assert.equal(puzzleMatchRank(cell, "foundations"), PUZZLE_MATCH.SUBCATEGORY);
  assert.equal(puzzleMatchRank(cell, "mitochondrion"), PUZZLE_MATCH.TERM);
  assert.equal(puzzleMatchRank(cell, "Energy transformation"), PUZZLE_MATCH.TERM);
  assert.equal(puzzleMatchRank(cell, "active transport"), PUZZLE_MATCH.TERM);
  assert.equal(puzzleMatchRank(cell, "zzzznope"), PUZZLE_MATCH.NONE);
  assert.equal(puzzleMatchesQuery(cell, ""), false);
  assert.equal(puzzleMatchesQuery(cell, "   "), false);

  const titled = puzzle({
    id: "math-foundations",
    title: "Math foundations",
    category: "Math",
    subcategories: undefined,
    tags: undefined,
    clusters: [],
    bridges: []
  });
  const termOnly = puzzle({
    id: "cell-2",
    title: "Something else",
    category: "Chemistry",
    subcategories: undefined,
    tags: undefined,
    clusters: [{ name: "Quantities", terms: ["foundations of chemistry", "mole", "stoichiometry"] }],
    bridges: []
  });
  assert.equal(puzzleMatchRank(titled, "foundations"), PUZZLE_MATCH.TITLE);
  assert.equal(puzzleMatchRank(termOnly, "foundations"), PUZZLE_MATCH.TERM);
  const ranked = rankedPuzzleMatches([termOnly, titled], "foundations");
  assert.deepEqual(ranked.map(item => item.id), ["math-foundations", "cell-2"]);

  const subcategoryAndTerm = puzzle({
    clusters: [{ name: "X", terms: ["foundations", "membrane", "nucleus"] }]
  });
  assert.equal(
    puzzleMatchRank(subcategoryAndTerm, "foundations"),
    PUZZLE_MATCH.SUBCATEGORY,
    "subcategory outranks a board-term hit on the same puzzle"
  );

  const bookPuzzle = puzzle({
    id: "achilles-in-vietnam",
    title: "Achilles in Vietnam",
    category: "Psychology",
    subcategories: undefined,
    tags: ["book"],
    clusters: [],
    bridges: [],
    info: {
      citations: [{
        author: "Shay, Jonathan",
        title: "Achilles in Vietnam: Combat Trauma and the Undoing of Character"
      }]
    }
  });
  assert.equal(puzzleMatchRank(bookPuzzle, "Shay"), PUZZLE_MATCH.CITATION);
  assert.equal(puzzleMatchRank(bookPuzzle, "Jonathan Shay"), PUZZLE_MATCH.CITATION);
  assert.equal(puzzleMatchRank(bookPuzzle, "shay, jonathan"), PUZZLE_MATCH.CITATION);
  assert.equal(puzzleMatchRank(bookPuzzle, "Combat Trauma"), PUZZLE_MATCH.CITATION);
  assert.equal(puzzleMatchRank(bookPuzzle, "zzzznope"), PUZZLE_MATCH.NONE);

  const twoAuthors = puzzle({
    id: "manufacturing-consent",
    title: "Manufacturing Consent",
    category: "Media & Information Literacy",
    subcategories: undefined,
    tags: ["book"],
    clusters: [],
    bridges: [],
    info: {
      citations: [{
        author: "Herman, Edward S., and Chomsky, Noam",
        title: "Manufacturing Consent: The Political Economy of the Mass Media"
      }]
    }
  });
  assert.equal(puzzleMatchRank(twoAuthors, "Chomsky"), PUZZLE_MATCH.CITATION);
  assert.equal(puzzleMatchRank(twoAuthors, "Noam Chomsky"), PUZZLE_MATCH.CITATION);

  const lessonCite = puzzle({
    id: "lesson-cite",
    title: "Unrelated title",
    category: "Science",
    subcategories: undefined,
    tags: undefined,
    clusters: [],
    bridges: [],
    learningIntroduction: {
      citations: [{ author: "Axelrod, Robert", title: "The Evolution of Cooperation" }]
    }
  });
  assert.equal(puzzleMatchRank(lessonCite, "Axelrod"), PUZZLE_MATCH.CITATION);
  assert.equal(puzzleMatchRank(lessonCite, "Robert Axelrod"), PUZZLE_MATCH.CITATION);

  const nested = {
    id: "loyalty-without-exit",
    title: "Loyalty Without Exit",
    info: { text: "How exit stops disciplining anything once leaving actually costs something." },
    entries: []
  };
  const intro = {
    id: "getting-started",
    title: "Getting Started",
    info: { text: "An approachable cross-disciplinary introduction." },
    entries: []
  };
  const meta = {
    id: "holding-it-together",
    title: "Holding It Together",
    kind: "meta",
    info: { text: "Four catalogues, four scales of the same question." },
    entries: [{ id: nested.id }]
  };
  const catalogues = [intro, nested, meta];
  const puzzles = [cell];

  const visibleIds = libraryCatalogues(puzzles, catalogues).map(item => item.id);
  assert.ok(visibleIds.includes(meta.id));
  assert.ok(visibleIds.includes(intro.id));
  assert.ok(!visibleIds.includes(nested.id));

  const searchableIds = searchableCatalogues(puzzles, catalogues).map(item => item.id);
  assert.ok(searchableIds.includes(nested.id));

  assert.equal(catalogueMatchesQuery(nested, "Loyalty Without Exit"), true);
  assert.equal(catalogueMatchesQuery(nested, "exit stops disciplining"), true);
  assert.equal(catalogueMatchesQuery(nested, "zzzznope"), false);

  const byTitle = matchingCatalogues(puzzles, catalogues, "loyalty without exit");
  assert.deepEqual(byTitle.map(item => item.id), [nested.id]);

  const byInfo = matchingCatalogues(puzzles, catalogues, "disciplining");
  assert.deepEqual(byInfo.map(item => item.id), [nested.id]);

  const introAndInfo = matchingCatalogues(puzzles, catalogues, "introduction");
  assert.deepEqual(introAndInfo.map(item => item.id), [intro.id]);

  assert.deepEqual(rankedPuzzleMatches(puzzles, ""), []);
  assert.deepEqual(matchingCatalogues(puzzles, catalogues, ""), []);
}
