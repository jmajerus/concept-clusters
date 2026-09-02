#!/usr/bin/env node
// Default subject when the author-puzzle skill is invoked with no domain.
// Prefers an editable authoring-only backlog (missing categories / planned
// subcategories) over densifying already-registered thin categories, so
// open-ended authoring opens deliberate gaps without empty Library placeholders.
import { randomInt } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { categorySummaries } from "../../../../modules/categoryDiscovery.js";
import { CATEGORIES, categoriesForPuzzle, slugify } from "../../../../puzzles/categories.js";
import { PUZZLES } from "../../../../puzzles/index.js";

const BACKLOG_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "../category-backlog.json"
);
const BACKLOG_WEIGHT = 2 / 3;

function pick(items) {
  if (!items.length) throw new Error("No candidates to pick from");
  return items[randomInt(items.length)];
}

function percentileCutoff(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * fraction)];
}

function loadBacklog() {
  const raw = JSON.parse(readFileSync(BACKLOG_PATH, "utf8"));
  return {
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    subcategories: Array.isArray(raw.subcategories) ? raw.subcategories : []
  };
}

function existingInCategory(categoryName) {
  return PUZZLES
    .filter(puzzle => categoriesForPuzzle(puzzle).includes(categoryName))
    .map(puzzle => ({ id: puzzle.id, title: puzzle.title }));
}

function pickComparable(existing) {
  if (existing.length) return pick(existing).id;
  return null;
}

function pickSeed(seeds) {
  if (!Array.isArray(seeds) || !seeds.length) return null;
  return pick(seeds);
}

function pickNestedSubcategory(entry) {
  const subs = entry.subcategories && typeof entry.subcategories === "object"
    ? Object.entries(entry.subcategories)
    : [];
  if (!subs.length) return null;
  const [id, definition] = pick(subs);
  return {
    id,
    title: definition.title,
    info: definition.info || null,
    seedSubjects: definition.seedSubjects || []
  };
}

function backlogCategoryCandidates(backlog) {
  return backlog.categories
    .filter(entry => entry?.name && !Object.hasOwn(CATEGORIES, entry.name))
    .map(entry => {
      const nested = pickNestedSubcategory(entry);
      const seedSubject = pickSeed(nested?.seedSubjects)
        || pickSeed(entry.seedSubjects);
      return {
        mode: "new-category",
        category: entry.name,
        subcategory: nested
          ? { id: nested.id, title: nested.title }
          : null,
        domain: entry.domain || null,
        info: entry.info || null,
        rationale: entry.rationale || null,
        seedSubject,
        existing: [],
        comparable: pickComparable([]),
        publication: {
          requiresNewCategory: true,
          assignSubcategory: !!nested,
          note: "Call create_category with categoryDocument, then set puzzle.category to that title."
        },
        categoryDocument: {
          id: slugify(entry.name),
          title: entry.name,
          ...(entry.domain ? { domain: entry.domain } : {}),
          ...(entry.info ? { info: entry.info } : {}),
          ...(entry.subcategories
            ? {
                subcategories: Object.fromEntries(
                  Object.entries(entry.subcategories).map(([id, definition]) => [
                    id,
                    {
                      title: definition.title,
                      ...(definition.info ? { info: definition.info } : {})
                    }
                  ])
                )
              }
            : {})
        }
      };
    });
}

function backlogSubcategoryCandidates(backlog) {
  return backlog.subcategories
    .filter(entry => {
      if (!entry?.category || !entry?.id || !entry?.title) return false;
      if (!Object.hasOwn(CATEGORIES, entry.category)) return false;
      if (CATEGORIES[entry.category]?.subcategories?.[entry.id]) return false;
      return true;
    })
    .map(entry => {
      const existing = existingInCategory(entry.category);
      return {
        mode: "seed-subcategory",
        category: entry.category,
        subcategory: { id: entry.id, title: entry.title },
        domain: CATEGORIES[entry.category]?.domain || null,
        info: entry.info || CATEGORIES[entry.category]?.info || null,
        rationale: entry.rationale || null,
        seedSubject: pickSeed(entry.seedSubjects),
        existing,
        puzzleCount: existing.length,
        comparable: pickComparable(existing),
        publication: {
          requiresNewCategory: false,
          assignSubcategory: true,
          registerSubcategoryOnParent: {
            category: entry.category,
            id: entry.id,
            title: entry.title,
            ...(entry.info ? { info: entry.info } : {})
          },
          note: "Add this subcategory with update_category on the parent category working copy; the human Publishes on /admin/categories."
        }
      };
    });
}

function densifyCandidate() {
  const summaries = categorySummaries(PUZZLES, CATEGORIES)
    .filter(category => category.registered);
  const cutoff = percentileCutoff(
    summaries.map(category => category.puzzleCount),
    1 / 3
  );
  const thin = summaries.filter(category => category.puzzleCount <= cutoff);
  const category = pick(thin);
  const existing = existingInCategory(category.name);
  const counts = (category.subcategories || []).map(item => item.puzzleCount);
  const minCount = counts.length ? Math.min(...counts) : null;
  const thinSubcategories = (category.subcategories || [])
    .filter(subcategory => subcategory.puzzleCount === minCount);
  const subcategory = thinSubcategories.length ? pick(thinSubcategories) : null;
  return {
    mode: "densify",
    category: category.name,
    subcategory: subcategory
      ? { id: subcategory.id, title: subcategory.title }
      : null,
    domain: category.domain || null,
    info: category.info || null,
    puzzleCount: category.puzzleCount,
    cutoff,
    existing,
    comparable: pickComparable(existing),
    publication: {
      requiresNewCategory: false,
      assignSubcategory: !!subcategory
    }
  };
}

const backlog = loadBacklog();
const backlogPool = [
  ...backlogCategoryCandidates(backlog),
  ...backlogSubcategoryCandidates(backlog)
];

let suggestion;
if (backlogPool.length && Math.random() < BACKLOG_WEIGHT) {
  suggestion = pick(backlogPool);
} else {
  suggestion = densifyCandidate();
}

console.log(JSON.stringify(suggestion, null, 2));
