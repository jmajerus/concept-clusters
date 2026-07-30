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
  goToDefaultLanding,
  views
}) {
  let activeCatalogue = catalogueById(
    ALL_PUZZLES_CATALOGUE_ID,
    puzzles,
    catalogues
  );
  let originCategory = null;
  let viewKind = "puzzle";

  function getContext() {
    return {
      catalogue: activeCatalogue,
      originCategory,
      viewKind
    };
  }

  function setContext(kind, catalogue = activeCatalogue, category = null) {
    viewKind = kind;
    activeCatalogue = catalogue;
    originCategory = category;
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
            category: originCategory
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
      preserveCatalogue = false
    } = {}
  ) {
    if (!Number.isInteger(index) || !puzzles[index]) return;
    if (layoutAuthoringMode) {
      loadPuzzle(index);
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

    const routeCategory =
      targetCatalogue.id !== ALL_PUZZLES_CATALOGUE_ID
        ? (category === puzzle.category ? category : puzzle.category)
        : null;
    navigateTo({
      kind: "puzzle",
      puzzleId: puzzle.id,
      catalogueId: targetCatalogue?.id,
      category: routeCategory
    });
  }

  function renderCurrentRoute({ initial = false, focus = false } = {}) {
    const params = new URLSearchParams(location.search);
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

      case "related":
        setContext(
          "related",
          catalogueById(ALL_PUZZLES_CATALOGUE_ID, puzzles, catalogues),
          null
        );
        views.showRelatedOverview(route.puzzleIds, { focus });
        return;

      case "puzzle":
        setContext(
          "puzzle",
          route.catalogue ||
            catalogueById(
              ALL_PUZZLES_CATALOGUE_ID,
              puzzles,
              catalogues
            ),
          route.originCategory
        );
        {
          const hasSharedState = initial &&
            (params.has("solved") || params.has("moves"));
          loadPuzzle(puzzles.indexOf(route.puzzle), {
            restoreSession: !hasSharedState,
            persistInitial: !hasSharedState,
            focus
          });
        }
        return;

      default:
        useAllPuzzlesContext();
        goToDefaultLanding();
    }
  }

  function validCuratedContextForPuzzle(puzzle) {
    if (
      !activeCatalogue ||
      activeCatalogue.id === ALL_PUZZLES_CATALOGUE_ID ||
      !catalogueContainsPuzzle(activeCatalogue, puzzle, puzzles)
    ) {
      return null;
    }
    return {
      catalogue: activeCatalogue,
      originCategory
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
    validCuratedContextForPuzzle
  };
}
