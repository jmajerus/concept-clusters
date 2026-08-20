#!/usr/bin/env node
// Default subject when /author-puzzle is invoked with no domain.
// Picks uniformly among registered categories in the lowest third of
// puzzle counts, then an emptiest subcategory if that category uses them.
import { randomInt } from "node:crypto";
import { categorySummaries } from "../../../../modules/categoryDiscovery.js";
import { CATEGORIES, categoriesForPuzzle } from "../../../../puzzles/categories.js";
import { PUZZLES } from "../../../../puzzles/index.js";

function pick(items) {
  if (!items.length) throw new Error("No candidates to pick from");
  return items[randomInt(items.length)];
}

function percentileCutoff(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * fraction)];
}

const summaries = categorySummaries(PUZZLES, CATEGORIES)
  .filter(category => category.registered);
const cutoff = percentileCutoff(summaries.map(category => category.puzzleCount), 1 / 3);
const thin = summaries.filter(category => category.puzzleCount <= cutoff);
const category = pick(thin);
const existing = PUZZLES
  .filter(puzzle => categoriesForPuzzle(puzzle).includes(category.name))
  .map(puzzle => ({ id: puzzle.id, title: puzzle.title }));
const thinSubcategories = (category.subcategories || [])
  .filter(subcategory => subcategory.puzzleCount === Math.min(
    ...category.subcategories.map(item => item.puzzleCount)
  ));
const subcategory = thinSubcategories.length ? pick(thinSubcategories) : null;
const comparable = existing.length
  ? pick(existing)
  : pick(PUZZLES.map(puzzle => ({ id: puzzle.id, title: puzzle.title })));

const suggestion = {
  category: category.name,
  subcategory: subcategory
    ? { id: subcategory.id, title: subcategory.title }
    : null,
  puzzleCount: category.puzzleCount,
  cutoff,
  info: category.info?.text ?? null,
  existing,
  comparable: comparable.id
};

console.log(JSON.stringify(suggestion, null, 2));
