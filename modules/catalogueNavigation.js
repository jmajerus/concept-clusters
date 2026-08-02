import {
  categorySlugFor,
  puzzleBelongsToCategory,
  puzzleBelongsToSubcategory,
  resolveSubcategory
} from "../puzzles/categories.js";
import {
  ALL_PUZZLES_CATALOGUE_ID,
  catalogueById,
  catalogueContainsPuzzle,
  puzzlesForCatalogue,
  resolveCategory
} from "./catalogueRegistry.js";

const VALID_MODES = new Set(["graph", "star", "sets"]);

export function parseCatalogueRoute(params, puzzles, catalogues) {
  const puzzleId = params.get("puzzle");
  const puzzle = puzzleId
    ? puzzles.find(candidate => candidate.id === puzzleId)
    : null;
  const requestedCatalogueId = params.get("catalogue");
  const requestedCatalogue = requestedCatalogueId
    ? catalogueById(requestedCatalogueId, puzzles, catalogues)
    : null;

  if (puzzle) {
    const catalogue = requestedCatalogue &&
      catalogueContainsPuzzle(requestedCatalogue, puzzle, puzzles)
      ? requestedCatalogue
      : catalogueById(ALL_PUZZLES_CATALOGUE_ID, puzzles, catalogues);
    const cataloguePuzzles = puzzlesForCatalogue(catalogue, puzzles);
    const requestedCategory = resolveCategory(
      params.get("category"),
      cataloguePuzzles
    );
    const originCategory = puzzleBelongsToCategory(puzzle, requestedCategory)
      ? requestedCategory
      : null;
    const requestedSubcategory = resolveSubcategory(
      params.get("subcategory"),
      cataloguePuzzles,
      originCategory
    );
    return {
      kind: "puzzle",
      puzzle,
      catalogue,
      originCategory,
      originSubcategory: puzzleBelongsToSubcategory(
        puzzle,
        originCategory,
        requestedSubcategory
      )
        ? requestedSubcategory
        : null
    };
  }

  const relatedIds = params.get("puzzles")?.split(",")
    .map(value => value.trim())
    .filter(id => puzzles.some(puzzle => puzzle.id === id)) || [];
  if (relatedIds.length) return { kind: "related", puzzleIds: relatedIds };

  if (requestedCatalogueId && !requestedCatalogue) {
    return { kind: "library", invalidCatalogue: true };
  }

  if (requestedCatalogue) {
    const members = puzzlesForCatalogue(requestedCatalogue, puzzles);
    const category = resolveCategory(params.get("category"), members);
    if (category && members.some(puzzle =>
      puzzleBelongsToCategory(puzzle, category)
    )) {
      const subcategoryId = resolveSubcategory(
        params.get("subcategory"),
        members,
        category
      );
      if (subcategoryId) {
        return {
          kind: "catalogue-subcategory",
          catalogue: requestedCatalogue,
          category,
          subcategoryId
        };
      }
      return {
        kind: "catalogue-category",
        catalogue: requestedCatalogue,
        category
      };
    }
    if (params.get("view") === "all") {
      return { kind: "catalogue-puzzles", catalogue: requestedCatalogue };
    }
    return { kind: "catalogue", catalogue: requestedCatalogue };
  }

  const legacyCategory = resolveCategory(params.get("category"), puzzles);
  if (legacyCategory) {
    const subcategoryId = resolveSubcategory(
      params.get("subcategory"),
      puzzles,
      legacyCategory
    );
    if (subcategoryId) {
      return {
        kind: "catalogue-subcategory",
        catalogue: catalogueById(
          ALL_PUZZLES_CATALOGUE_ID,
          puzzles,
          catalogues
        ),
        category: legacyCategory,
        subcategoryId,
        legacy: true
      };
    }
    return {
      kind: "catalogue-category",
      catalogue: catalogueById(
        ALL_PUZZLES_CATALOGUE_ID,
        puzzles,
        catalogues
      ),
      category: legacyCategory,
      legacy: true
    };
  }

  if (params.has("library")) return { kind: "library" };
  return { kind: "default" };
}

export function routeSearch(route, mode) {
  const params = new URLSearchParams();
  switch (route.kind) {
    case "library":
      params.set("library", "");
      break;
    case "catalogue":
      params.set("catalogue", route.catalogueId);
      break;
    case "catalogue-puzzles":
      params.set("catalogue", route.catalogueId);
      params.set("view", "all");
      break;
    case "catalogue-category":
      params.set("catalogue", route.catalogueId);
      params.set("category", categorySlugFor(route.category));
      break;
    case "catalogue-subcategory":
      params.set("catalogue", route.catalogueId);
      params.set("category", categorySlugFor(route.category));
      params.set("subcategory", route.subcategoryId);
      break;
    case "legacy-category":
      params.set("category", categorySlugFor(route.category));
      break;
    case "legacy-subcategory":
      params.set("category", categorySlugFor(route.category));
      params.set("subcategory", route.subcategoryId);
      break;
    case "related":
      params.set("puzzles", route.puzzleIds.join(","));
      break;
    case "puzzle":
      params.set("puzzle", route.puzzleId);
      if (route.catalogueId &&
          route.catalogueId !== ALL_PUZZLES_CATALOGUE_ID) {
        params.set("catalogue", route.catalogueId);
      }
      if (route.category) {
        params.set("category", categorySlugFor(route.category));
        if (route.subcategoryId) {
          params.set("subcategory", route.subcategoryId);
        }
      }
      break;
    default:
      break;
  }
  if (VALID_MODES.has(mode)) params.set("mode", mode);
  const query = params.toString().replace(/^library=(?=&|$)/, "library");
  return query ? `?${query}` : "";
}

export function routeUrl(pathname, route, mode) {
  return `${pathname}${routeSearch(route, mode)}`;
}
