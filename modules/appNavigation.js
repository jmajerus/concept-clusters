import {
  primaryCategoryForPuzzle,
  puzzleBelongsToCategory,
  puzzleBelongsToSubcategory
} from "../puzzles/categories.js";
import {
  ALL_PUZZLES_CATALOGUE_ID,
  catalogueById,
  catalogueContainsPuzzle
} from "./catalogueRegistry.js";
import {
  parseCatalogueRoute,
  routeUrl
} from "./catalogueNavigation.js";

export function createAppNavigation({
  puzzles,
  catalogues,
  layoutAuthoringMode,
  validModes,
  browsePuzzlesBtn,
  getState,
  persistCurrentPuzzle,
  loadPuzzle,
  loadDraftOverlay,
  loadCatalogueOverlay = null,
  leaveCatalogueAuthoring = null,
  goToDefaultLanding,
  views,
  // Optional (kind, catalogue, category, subcategory) => void, fired every
  // time setContext runs
  // (i.e. on every route change). Lets a caller keep UI that lives outside
  // both `views` and this module -- currently just the header library
  // picker in game.js -- in sync with whichever catalogue is now active,
  // without this module needing to know that picker exists.
  onContextChange
}) {
  let activeCatalogue = catalogueById(
    ALL_PUZZLES_CATALOGUE_ID,
    puzzles,
    catalogues
  );
  let originCategory = null;
  let originSubcategory = null;
  let viewKind = "puzzle";

  function getContext() {
    return {
      catalogue: activeCatalogue,
      originCategory,
      originSubcategory,
      viewKind
    };
  }

  function setContext(
    kind,
    catalogue = activeCatalogue,
    category = null,
    subcategory = null
  ) {
    viewKind = kind;
    activeCatalogue = catalogue;
    originCategory = category;
    originSubcategory = subcategory;
    onContextChange?.(kind, catalogue, category, subcategory);
  }

  function useAllPuzzlesContext() {
    setContext(
      "puzzle",
      catalogueById(ALL_PUZZLES_CATALOGUE_ID, puzzles, catalogues),
      null
    );
  }

  function notePuzzleLoaded() {
    viewKind = "puzzle";
    if (!activeCatalogue) useAllPuzzlesContext();
  }

  function preservedUrlMode() {
    const mode = new URLSearchParams(location.search).get("mode");
    return validModes.includes(mode) ? mode : null;
  }

  function shareUrlForRoute(route) {
    return `${location.origin}${routeUrl(location.pathname, route, null)}`;
  }

  function navigateTo(route, { replace = false, focus = true } = {}) {
    if (layoutAuthoringMode) return;

    persistCurrentPuzzle();
    const currentState = getState();
    const currentUrl = new URL(location.href);
    if (
      !replace &&
      viewKind === "puzzle" &&
      currentState?.puzzle &&
      !currentUrl.searchParams.has("puzzle")
    ) {
      history.replaceState(
        { conceptClusters: true },
        "",
        routeUrl(
          location.pathname,
          {
            kind: "puzzle",
            puzzleId: currentState.puzzle.id,
            catalogueId: activeCatalogue?.id,
            category: originCategory,
            subcategoryId: originSubcategory
          },
          preservedUrlMode()
        )
      );
    }

    const url = routeUrl(location.pathname, route, preservedUrlMode());
    history[replace ? "replaceState" : "pushState"](
      { conceptClusters: true },
      "",
      url
    );
    renderCurrentRoute({ focus });
  }

  function openPuzzle(
    index,
    {
      catalogue = activeCatalogue,
      originCategory: category = null,
      originSubcategory: subcategory = null,
      preserveCatalogue = false
    } = {}
  ) {
    if (!Number.isInteger(index) || !puzzles[index]) return;
    if (layoutAuthoringMode) {
      void loadPuzzle(index);
      return;
    }

    const puzzle = puzzles[index];
    let targetCatalogue = preserveCatalogue ? activeCatalogue : catalogue;
    if (
      !targetCatalogue ||
      !catalogueContainsPuzzle(targetCatalogue, puzzle, puzzles)
    ) {
      targetCatalogue = catalogueById(
        ALL_PUZZLES_CATALOGUE_ID,
        puzzles,
        catalogues
      );
    }

    const contextualCategory = preserveCatalogue &&
      puzzleBelongsToCategory(puzzle, originCategory)
      ? originCategory
      : null;
    const requestedCategory = puzzleBelongsToCategory(puzzle, category)
      ? category
      : contextualCategory;
    const routeCategory = requestedCategory || (
      targetCatalogue.id !== ALL_PUZZLES_CATALOGUE_ID
        ? primaryCategoryForPuzzle(puzzle)
        : null
    );
    const requestedSubcategory = subcategory || (
      preserveCatalogue && routeCategory === originCategory
        ? originSubcategory
        : null
    );
    const routeSubcategory = puzzleBelongsToSubcategory(
      puzzle,
      routeCategory,
      requestedSubcategory
    )
      ? requestedSubcategory
      : null;
    navigateTo({
      kind: "puzzle",
      puzzleId: puzzle.id,
      catalogueId: targetCatalogue?.id,
      category: routeCategory,
      subcategoryId: routeSubcategory
    });
  }

  async function renderCurrentRoute({ initial = false, focus = false } = {}) {
    const params = new URLSearchParams(location.search);
    const draftId = params.get("draft");
    if (draftId && loadDraftOverlay) {
      leaveCatalogueAuthoring?.();
      useAllPuzzlesContext();
      await loadDraftOverlay(draftId, { initial, focus });
      return;
    }
    const authorCatalogueId = params.get("view") === "author" ? params.get("catalogue") : null;
    if (authorCatalogueId && loadCatalogueOverlay) {
      useAllPuzzlesContext();
      await loadCatalogueOverlay(authorCatalogueId, { initial, focus });
      return;
    }
    leaveCatalogueAuthoring?.();
    const route = parseCatalogueRoute(params, puzzles, catalogues);

    switch (route.kind) {
      case "library":
        setContext("library", null, null);
        views.showLibrary({
          invalidCatalogue: route.invalidCatalogue,
          focus
        });
        return;

      case "catalogue":
        setContext("catalogue", route.catalogue, null);
        views.showCatalogueOverview(route.catalogue, { focus });
        return;

      case "catalogue-puzzles":
        setContext("catalogue-puzzles", route.catalogue, null);
        views.showCataloguePuzzles(route.catalogue, { focus });
        return;

      case "catalogue-category":
        setContext(
          "catalogue-category",
          route.catalogue,
          route.category
        );
        views.showCatalogueCategory(route.catalogue, route.category, {
          legacy: route.legacy,
          focus
        });
        return;

      case "catalogue-subcategory":
        setContext(
          "catalogue-subcategory",
          route.catalogue,
          route.category,
          route.subcategoryId
        );
        views.showCatalogueSubcategory(
          route.catalogue,
          route.category,
          route.subcategoryId,
          {
            legacy: route.legacy,
            focus
          }
        );
        return;

      case "related":
        setContext(
          "related",
          catalogueById(ALL_PUZZLES_CATALOGUE_ID, puzzles, catalogues),
          null
        );
        views.showRelatedOverview(route.puzzleIds, { focus });
        return;

      case "puzzle": {
        setContext(
          "puzzle",
          route.catalogue ||
            catalogueById(
              ALL_PUZZLES_CATALOGUE_ID,
              puzzles,
              catalogues
          ),
          route.originCategory,
          route.originSubcategory
        );
        const hasSharedState = initial &&
          (params.has("solved") || params.has("moves"));
        const index = puzzles.findIndex(puzzle => puzzle.id === route.puzzle.id);
        await loadPuzzle(index, {
          restoreSession: !hasSharedState,
          persistInitial: !hasSharedState,
          focus
        });
        return;
      }

      default:
        useAllPuzzlesContext();
        await goToDefaultLanding();
    }
  }

  function validNavigationContextForPuzzle(puzzle) {
    if (
      !activeCatalogue ||
      !catalogueContainsPuzzle(activeCatalogue, puzzle, puzzles)
    ) {
      return null;
    }
    const category = puzzleBelongsToCategory(puzzle, originCategory)
      ? originCategory
      : null;
    if (activeCatalogue.id === ALL_PUZZLES_CATALOGUE_ID && !category) {
      return null;
    }
    const subcategory = puzzleBelongsToSubcategory(
      puzzle,
      category,
      originSubcategory
    )
      ? originSubcategory
      : null;
    return {
      catalogue: activeCatalogue,
      originCategory: category || primaryCategoryForPuzzle(puzzle),
      originSubcategory: subcategory
    };
  }

  if (layoutAuthoringMode) {
    browsePuzzlesBtn.classList.add("hidden");
  } else {
    browsePuzzlesBtn.addEventListener("click", () =>
      navigateTo({ kind: "library" })
    );
    window.addEventListener("popstate", () =>
      renderCurrentRoute({ focus: true })
    );
  }

  return {
    getContext,
    useAllPuzzlesContext,
    notePuzzleLoaded,
    navigateTo,
    openPuzzle,
    renderCurrentRoute,
    shareUrlForRoute,
    validNavigationContextForPuzzle
  };
}
