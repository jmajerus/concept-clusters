import {
  CATEGORIES,
  DOMAINS,
  GENERATED_SUBCATEGORY_IDS,
  categoriesForPuzzle,
  categorySlugFor,
  domainForCategory,
  primaryCategoryForPuzzle,
  puzzleBelongsToCategory,
  puzzleBelongsToSubcategory,
  subcategoryById,
  subcategoryIdForPuzzle,
  subcategoriesForPuzzleSet
} from "../puzzles/categories.js";
import { loadPlayerSession } from "./playerSessionStore.js";
import { linkLabel, normalizeInfo, searchLink } from "./termInfo.js";
import {
  ALL_PUZZLES_CATALOGUE_ID,
  catalogueById,
  catalogueProgress,
  cataloguesForCategory,
  cataloguesForPuzzle,
  categoriesForCatalogue,
  entriesForPuzzles,
  libraryCatalogues,
  puzzlesForCatalogue,
  puzzlesForCatalogueCategory,
  puzzlesForCatalogueSubcategory
} from "./catalogueRegistry.js";

// Owns the Library/category/related-set DOM. The game supplies navigation,
// persistence, and term-info callbacks; no puzzle state or history rules
// live here.
export function createOverviewRenderer({
  puzzles,
  catalogues,
  storage,
  layoutAuthoringMode,
  elements,
  getNavigationContext,
  navigateTo,
  openPuzzle,
  persistCurrentPuzzle,
  copyLink,
  showTermInfo,
  clearTermInfo,
  focusTermInfo,
  blurTermInfo,
  getFocusedInfoNode,
  shareUrlForRoute
}) {
  const {
    termInfoEl,
    factsEl,
    relatedPuzzlesEl,
    puzzleInfoEl,
    puzzleViewEl,
    puzzleControlsEl,
    browsePuzzlesBtn,
    contextNavEl,
    breadcrumbsEl,
    backToCatalogueBtn,
    overviewEl,
    overviewTitleEl,
    overviewSubtitleEl,
    overviewProgressEl,
    overviewSearchEl,
    overviewSearchInputEl,
    overviewListEl,
    overviewShareRowEl,
    overviewShareBtn,
    overviewShareStatusEl
  } = elements;

  function catalogueRoute(catalogue) {
    return { kind: "catalogue", catalogueId: catalogue.id };
  }

  function categoryRoute(catalogue, category, legacy = false) {
    return legacy
      ? { kind: "legacy-category", category }
      : {
        kind: "catalogue-category",
        catalogueId: catalogue.id,
        category
      };
  }

  function subcategoryRoute(
    catalogue,
    category,
    subcategoryId,
    legacy = false
  ) {
    return legacy
      ? { kind: "legacy-subcategory", category, subcategoryId }
      : {
        kind: "catalogue-subcategory",
        catalogueId: catalogue.id,
        category,
        subcategoryId
      };
  }

  function subcategoryPresentation(category, subcategoryId) {
    if (subcategoryId === GENERATED_SUBCATEGORY_IDS.all) {
      return {
        title: `All ${category} puzzles`,
        breadcrumb: "All puzzles",
        info: CATEGORIES[category]?.info
      };
    }
    if (subcategoryId === GENERATED_SUBCATEGORY_IDS.other) {
      return {
        title: `Other ${category} puzzles`,
        breadcrumb: "Other",
        info: {
          text: `Puzzles in ${category} that have not yet been assigned to a subcategory.`
        }
      };
    }
    const subcategory = subcategoryById(category, subcategoryId);
    return {
      title: subcategory?.title || subcategoryId,
      breadcrumb: subcategory?.title || subcategoryId,
      info: subcategory?.info
    };
  }

  function appendInfoAnchor(container, href, label = null) {
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = `${label || linkLabel(href)} ↗`;
    container.appendChild(anchor);
  }

  function renderInfoLine(container, rawInfo, fallbackSearchWord, {
    allowFallbackLink = true
  } = {}) {
    container.innerHTML = "";
    const info = normalizeInfo(rawInfo);
    if (!info) {
      container.classList.remove("shown");
      return;
    }
    if (info.text) {
      const span = document.createElement("span");
      span.textContent = info.text;
      container.appendChild(span);
    }
    const href = info.link ||
      (allowFallbackLink ? searchLink(fallbackSearchWord) : null);
    if (href) {
      if (info.text) container.appendChild(document.createTextNode(" "));
      appendInfoAnchor(container, href, info.linkLabel);
    }
    if (info.seeAlso?.length) {
      const hasLead = !!(info.text || href);
      container.appendChild(document.createTextNode(
        `${hasLead ? " " : ""}See also: `
      ));
      info.seeAlso.forEach((entry, index) => {
        if (index) container.appendChild(document.createTextNode(" · "));
        appendInfoAnchor(container, entry.href, entry.label);
      });
    }
    container.classList.add("shown");
  }

  function appendBadge(container, text, className, title = "") {
    const badge = document.createElement("span");
    badge.className = `puzzle-badge ${className}`;
    badge.textContent = text;
    if (title) badge.title = title;
    container.appendChild(badge);
  }

  function renderPuzzleCards(
    container,
    entries,
    onPick,
    {
      category = null,
      catalogueId = null,
      showMemberships = false
    } = {}
  ) {
    container.innerHTML = "";
    entries.forEach(entry => {
      const targetIndex = puzzles.findIndex(puzzle => puzzle.id === entry.id);
      if (targetIndex === -1) return;
      const target = puzzles[targetIndex];
      const completed = playerCompletedPuzzle(target);
      const card = document.createElement("button");
      card.type = "button";
      card.className = `related-card${completed ? " puzzle-completed" : ""}`;
      card.dataset.puzzleId = target.id;
      card.dataset.completed = String(completed);

      const main = document.createElement("span");
      main.className = "card-main";
      const titleLine = document.createElement("span");
      titleLine.className = "card-title-line";
      const title = document.createElement("strong");
      title.textContent = target.title;
      titleLine.appendChild(title);
      const badges = document.createElement("span");
      badges.className = "card-badges";

      if (completed) {
        appendBadge(badges, "✓ Completed", "badge-completed");
      }
      if (target.large) appendBadge(badges, "Large", "badge-large");
      if (target.lenses?.length) appendBadge(badges, "Lenses", "badge-lenses");
      if (target.learningIntroduction) {
        appendBadge(badges, "Lesson", "badge-learning", "Includes a learning introduction");
      }

      if (showMemberships) {
        for (const subject of categoriesForPuzzle(target)) {
          if (subject === category) continue;
          appendBadge(
            badges,
            subject,
            "badge-large badge-category-membership",
            `Also in ${subject}`
          );
        }
        for (const memberCatalogue of cataloguesForPuzzle(
          target,
          puzzles,
          catalogues
        )) {
          if (memberCatalogue.id === catalogueId) continue;
          appendBadge(
            badges,
            memberCatalogue.title,
            "badge-lenses badge-catalogue-membership",
            `Part of the ${memberCatalogue.title} catalogue`
          );
        }
      }

      if (badges.children.length) titleLine.appendChild(badges);
      main.appendChild(titleLine);
      if (entry.reason) {
        const detail = document.createElement("span");
        detail.className = "card-detail";
        detail.textContent = entry.reason;
        main.appendChild(detail);
      }
      const play = document.createElement("span");
      play.className = "card-play";
      play.textContent = "Play ▶";
      card.append(main, play);
      card.addEventListener("click", () => onPick(targetIndex));
      container.appendChild(card);
    });
  }

  function renderCategoryCards(container, categoryNames, availablePuzzles, onPick) {
    container.innerHTML = "";
    categoryNames.forEach(name => {
      const info = normalizeInfo(CATEGORIES[name]?.info);
      const count = availablePuzzles
        .filter(puzzle => puzzleBelongsToCategory(puzzle, name)).length;
      const card = document.createElement("button");
      card.type = "button";
      card.className = "related-card category-card";
      card.dataset.category = categorySlugFor(name);
      card.innerHTML = `<span class="card-main"><strong>${name}</strong>${
        info?.text
          ? `<span class="card-detail">${info.text}</span>`
          : ""
      }</span><span class="card-count">${count} ${
        count === 1 ? "puzzle" : "puzzles"
      } →</span>`;
      card.addEventListener("click", () => onPick(name));
      const hoverNode = { word: name, info };
      card.addEventListener("mouseenter", () => {
        if (!getFocusedInfoNode()) showTermInfo(hoverNode);
      });
      card.addEventListener("mouseleave", () => {
        if (!getFocusedInfoNode()) clearTermInfo();
      });
      card.addEventListener("focus", () => focusTermInfo(hoverNode));
      card.addEventListener("blur", () => blurTermInfo(hoverNode));
      container.appendChild(card);
    });
  }

  // Groups the same category cards renderCategoryCards always rendered
  // under domain headings -- a readability aid on an already-flat screen,
  // not a new navigation level (see docs/TAXONOMY-ROADMAP.md). Card markup,
  // hover wiring, and the onPick → category route contract are untouched;
  // this only decides how many .overview-card-list containers to create
  // and what heading precedes each.
  function renderDomainGroupedCategoryCards(
    container,
    categoryNames,
    availablePuzzles,
    onPick
  ) {
    container.innerHTML = "";
    const byDomain = new Map();
    const ungrouped = [];
    categoryNames.forEach(name => {
      const domain = domainForCategory(name);
      if (!domain) {
        ungrouped.push(name);
        return;
      }
      if (!byDomain.has(domain)) byDomain.set(domain, []);
      byDomain.get(domain).push(name);
    });

    const appendGroup = (title, names) => {
      const heading = document.createElement("h4");
      heading.className = "overview-section-heading domain-group-heading";
      heading.textContent = title;
      container.appendChild(heading);
      const list = document.createElement("div");
      list.className = "overview-card-list";
      container.appendChild(list);
      renderCategoryCards(list, names, availablePuzzles, onPick);
    };

    // Alphabetical, not curated -- any hand-ordering of subjects reads as
    // a ranking (which one matters more) whether or not that's intended,
    // and this list should carry no implied hierarchy between domains.
    [...byDomain.keys()]
      .sort((a, b) => DOMAINS[a].title.localeCompare(DOMAINS[b].title))
      .forEach(domainId => appendGroup(DOMAINS[domainId].title, byDomain.get(domainId)));
    if (ungrouped.length) appendGroup("Other subjects", ungrouped);
  }

  function renderSubcategoryCards(
    container,
    category,
    availablePuzzles,
    onPick
  ) {
    container.innerHTML = "";
    const represented = subcategoriesForPuzzleSet(
      availablePuzzles,
      category
    );
    if (!represented.length) return;

    const categoryPuzzles = availablePuzzles.filter(puzzle =>
      puzzleBelongsToCategory(puzzle, category)
    );
    const otherCount = categoryPuzzles.filter(puzzle =>
      !subcategoryIdForPuzzle(puzzle, category)
    ).length;
    const cards = [
      {
        id: GENERATED_SUBCATEGORY_IDS.all,
        title: `All ${category} puzzles`,
        info: CATEGORIES[category]?.info,
        count: categoryPuzzles.length
      },
      ...represented,
      ...(otherCount
        ? [{
          id: GENERATED_SUBCATEGORY_IDS.other,
          title: `Other ${category} puzzles`,
          info: {
            text: "Not yet assigned to a subcategory."
          },
          count: otherCount
        }]
        : [])
    ];

    cards.forEach(entry => {
      const info = normalizeInfo(entry.info);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "related-card category-card subcategory-card";
      card.dataset.subcategory = entry.id;
      card.innerHTML = `<span class="card-main"><strong>${entry.title}</strong>${
        info?.text
          ? `<span class="card-detail">${info.text}</span>`
          : ""
      }</span><span class="card-count">${entry.count} ${
        entry.count === 1 ? "puzzle" : "puzzles"
      } →</span>`;
      card.addEventListener("click", () => onPick(entry.id));
      const hoverNode = { word: entry.title, info };
      card.addEventListener("mouseenter", () => {
        if (!getFocusedInfoNode()) showTermInfo(hoverNode);
      });
      card.addEventListener("mouseleave", () => {
        if (!getFocusedInfoNode()) clearTermInfo();
      });
      card.addEventListener("focus", () => focusTermInfo(hoverNode));
      card.addEventListener("blur", () => blurTermInfo(hoverNode));
      container.appendChild(card);
    });
  }

  function playerCompletedPuzzle(puzzle) {
    return !!loadPlayerSession(storage, puzzle)?.completed;
  }

  function pluralizedPuzzleCount(count) {
    return `${count} ${count === 1 ? "puzzle" : "puzzles"}`;
  }

  function progressLabel(progress) {
    return `${progress.completed} of ${progress.total} completed`;
  }

  function addBreadcrumb(label, route, current = false, visuallyHidden = false) {
    const item = document.createElement("li");
    if (route) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => navigateTo(route));
      item.appendChild(button);
    } else {
      const span = document.createElement("span");
      span.textContent = label;
      if (current) span.setAttribute("aria-current", "page");
      if (visuallyHidden) span.className = "visually-hidden";
      item.appendChild(span);
    }
    breadcrumbsEl.appendChild(item);
  }

  function renderBreadcrumbs({
    kind,
    catalogue,
    category,
    subcategoryId,
    puzzle,
    legacy = false
  }) {
    if (layoutAuthoringMode) {
      contextNavEl.hidden = true;
      return;
    }
    breadcrumbsEl.replaceChildren();
    contextNavEl.hidden = false;
    backToCatalogueBtn.hidden = true;
    backToCatalogueBtn._route = null;
    backToCatalogueBtn.textContent = "Back to catalogue";

    if (kind === "library") {
      addBreadcrumb("Library", null, true);
      return;
    }

    addBreadcrumb("Library", { kind: "library" });
    const contextCatalogue = catalogue ||
      catalogueById(ALL_PUZZLES_CATALOGUE_ID, puzzles, catalogues);
    const catalogueCurrent = kind === "catalogue";
    addBreadcrumb(
      contextCatalogue.title,
      catalogueCurrent ? null : catalogueRoute(contextCatalogue),
      catalogueCurrent
    );

    if (kind === "catalogue-puzzles") {
      addBreadcrumb("All puzzles", null, true);
      backToCatalogueBtn._route = catalogueRoute(contextCatalogue);
    } else if (kind === "catalogue-category") {
      addBreadcrumb(category, null, true);
      backToCatalogueBtn._route = catalogueRoute(contextCatalogue);
      backToCatalogueBtn.textContent = `Back to ${contextCatalogue.title}`;
    } else if (kind === "catalogue-subcategory") {
      addBreadcrumb(
        category,
        categoryRoute(contextCatalogue, category, legacy)
      );
      const presentation = subcategoryPresentation(category, subcategoryId);
      addBreadcrumb(presentation.breadcrumb, null, true);
      backToCatalogueBtn._route = categoryRoute(
        contextCatalogue,
        category,
        legacy
      );
      backToCatalogueBtn.textContent = `Back to ${category}`;
    } else if (kind === "related") {
      addBreadcrumb("Related puzzles", null, true);
      backToCatalogueBtn._route = catalogueRoute(contextCatalogue);
    } else if (kind === "puzzle") {
      const { originCategory, originSubcategory } = getNavigationContext();
      const breadcrumbCategory = puzzleBelongsToCategory(
        puzzle,
        originCategory
      )
        ? originCategory
        : primaryCategoryForPuzzle(puzzle);
      if (breadcrumbCategory) {
        addBreadcrumb(
          breadcrumbCategory,
          categoryRoute(contextCatalogue, breadcrumbCategory, legacy)
        );
      }
      const breadcrumbSubcategory = puzzleBelongsToSubcategory(
        puzzle,
        breadcrumbCategory,
        originSubcategory
      )
        ? originSubcategory
        : null;
      if (breadcrumbSubcategory) {
        const presentation = subcategoryPresentation(
          breadcrumbCategory,
          breadcrumbSubcategory
        );
        addBreadcrumb(
          presentation.breadcrumb,
          subcategoryRoute(
            contextCatalogue,
            breadcrumbCategory,
            breadcrumbSubcategory,
            legacy
          )
        );
      }
      addBreadcrumb(puzzle.title, null, true, true);
      backToCatalogueBtn._route = breadcrumbSubcategory
        ? subcategoryRoute(
          contextCatalogue,
          breadcrumbCategory,
          breadcrumbSubcategory,
          legacy
        )
        : originCategory
          ? categoryRoute(contextCatalogue, originCategory, legacy)
        : catalogueRoute(contextCatalogue);
      backToCatalogueBtn.textContent = breadcrumbSubcategory
        ? `Back to ${subcategoryPresentation(
          breadcrumbCategory,
          breadcrumbSubcategory
        ).breadcrumb}`
        : originCategory
          ? `Back to ${originCategory}`
          : `Back to ${contextCatalogue.title}`;
    }
    backToCatalogueBtn.hidden = !backToCatalogueBtn._route;
  }

  function renderCatalogueCards(container, catalogueList) {
    container.innerHTML = "";
    catalogueList.forEach(catalogue => {
      const progress = catalogueProgress(
        catalogue,
        puzzles,
        playerCompletedPuzzle
      );
      const info = normalizeInfo(catalogue.info);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "related-card catalogue-card";
      card.dataset.catalogueId = catalogue.id;
      const detail = info?.text
        ? `<span class="card-detail">${info.text}</span>`
        : "";
      card.innerHTML = `
        <span class="card-main">
          <strong>${catalogue.title}</strong>
          ${detail}
        </span>
        <span class="catalogue-card-meta">
          <span>${pluralizedPuzzleCount(progress.total)}</span>
          <span>${progressLabel(progress)}</span>
          <b>Browse →</b>
        </span>`;
      card.addEventListener("click", () =>
        navigateTo(catalogueRoute(catalogue))
      );
      container.appendChild(card);
    });
  }

  // Library-only: matches against both title and every one of a puzzle's
  // authored categories (categoriesForPuzzle, not just puzzle.category),
  // so e.g. "geography" surfaces geography-category puzzles whose titles
  // never mention geography.
  function puzzleMatchesQuery(puzzle, query) {
    if (puzzle.title.toLowerCase().includes(query)) return true;
    return categoriesForPuzzle(puzzle).some(name =>
      name.toLowerCase().includes(query)
    );
  }

  // Swaps #overview-list's content in place on every keystroke -- no
  // debounce (a synchronous filter over ~70 puzzles is trivial), no
  // history/URL involvement (this state is ephemeral by design; see
  // showLibrary's reset). Reuses renderCatalogueCards/renderPuzzleCards
  // verbatim rather than inventing new markup, so a search result looks
  // and behaves exactly like every other puzzle card in the app.
  function renderLibraryList(rawQuery) {
    const query = rawQuery.toLowerCase();
    if (!query) {
      renderCatalogueCards(overviewListEl, libraryCatalogues(puzzles, catalogues));
      return;
    }
    const matches = puzzles.filter(puzzle => puzzleMatchesQuery(puzzle, query));
    if (!matches.length) {
      overviewListEl.innerHTML = "";
      const empty = document.createElement("p");
      empty.className = "overview-empty-state";
      empty.textContent = `No puzzles match "${rawQuery}".`;
      overviewListEl.appendChild(empty);
      return;
    }
    renderPuzzleCards(
      overviewListEl,
      matches.map(puzzle => ({ id: puzzle.id })),
      index => openPuzzle(index, {
        catalogue: catalogueById(ALL_PUZZLES_CATALOGUE_ID, puzzles, catalogues),
        originCategory: null
      })
    );
  }

  function renderCatalogueOverviewList(container, catalogue) {
    container.innerHTML = "";
    const members = puzzlesForCatalogue(catalogue, puzzles);
    const allCard = document.createElement("button");
    allCard.type = "button";
    allCard.className = "related-card category-card catalogue-all-card";
    allCard.dataset.catalogueView = "all";
    allCard.innerHTML = `
      <span class="card-main">
        <strong>All puzzles in this catalogue</strong>
        <span class="card-detail">Browse the collection in its editorial order.</span>
      </span>
      <span class="card-count">${pluralizedPuzzleCount(members.length)} →</span>`;
    allCard.addEventListener("click", () => navigateTo({
      kind: "catalogue-puzzles",
      catalogueId: catalogue.id
    }));
    container.appendChild(allCard);

    const heading = document.createElement("h3");
    heading.className = "overview-section-heading";
    heading.textContent = "Browse by subject";
    container.appendChild(heading);
    const categoryGroups = document.createElement("div");
    container.appendChild(categoryGroups);
    renderDomainGroupedCategoryCards(
      categoryGroups,
      categoriesForCatalogue(catalogue, puzzles),
      members,
      subject => navigateTo(categoryRoute(catalogue, subject))
    );
  }

  function renderCatalogueIntersections(
    container,
    category,
    currentCatalogue
  ) {
    const intersections = cataloguesForCategory(
      category,
      puzzles,
      catalogues
    );
    if (!intersections.length) return;

    const heading = document.createElement("h3");
    heading.className = "overview-section-heading";
    heading.textContent = "Catalogue intersections";
    container.appendChild(heading);

    const list = document.createElement("div");
    list.className = "overview-card-list catalogue-intersections";
    container.appendChild(list);
    for (const { catalogue, count } of intersections) {
      const isCurrent = catalogue.id === currentCatalogue.id;
      const card = document.createElement("button");
      card.type = "button";
      card.className = `related-card category-card catalogue-intersection-card${
        isCurrent ? " catalogue-intersection-current" : ""
      }`;
      card.dataset.catalogueId = catalogue.id;
      card.dataset.current = String(isCurrent);
      card.innerHTML = `
        <span class="card-main">
          <strong>${catalogue.title}</strong>
          <span class="card-detail">${
            isCurrent
              ? "Current catalogue context; open the full cross-subject learning sequence."
              : "Continue through the full cross-subject learning sequence."
          }</span>
        </span>
        <span class="card-count">${pluralizedPuzzleCount(count)} here${
          isCurrent ? " · Full catalogue →" : " →"
        }</span>`;
      card.addEventListener("click", () =>
        navigateTo(
          isCurrent
            ? catalogueRoute(catalogue)
            : categoryRoute(catalogue, category)
        )
      );
      list.appendChild(card);
    }
  }

  function showOverview({
    title,
    info,
    fallbackSearchWord,
    progress,
    renderList,
    shareRoute,
    breadcrumb,
    allowInfoFallback = true,
    showSearch = false,
    focus = false
  }) {
    persistCurrentPuzzle();
    puzzleViewEl.classList.add("hidden");
    puzzleControlsEl.classList.add("hidden");
    overviewEl.insertBefore(termInfoEl, overviewShareRowEl);
    overviewTitleEl.textContent = title;
    renderInfoLine(
      overviewSubtitleEl,
      info,
      fallbackSearchWord || title,
      { allowFallbackLink: allowInfoFallback }
    );
    overviewProgressEl.textContent = progress || "";
    overviewProgressEl.classList.toggle("shown", !!progress);
    overviewSearchEl.classList.toggle("hidden", !showSearch);
    renderList(overviewListEl);
    overviewEl._shareRoute = shareRoute || null;
    overviewShareRowEl.classList.toggle("hidden", !shareRoute);
    overviewEl.classList.add("shown");
    renderBreadcrumbs(breadcrumb);
    if (focus) overviewTitleEl.focus();
  }

  function showLibrary({ invalidCatalogue = false, focus = false } = {}) {
    browsePuzzlesBtn.disabled = true;
    overviewSearchInputEl.value = "";
    showOverview({
      title: "Library",
      info: {
        text: invalidCatalogue
          ? "That catalogue is unavailable. Choose a collection from the Library."
          : "Choose the complete collection or a curated catalogue for a particular learning purpose."
      },
      renderList: container => renderCatalogueCards(
        container,
        libraryCatalogues(puzzles, catalogues)
      ),
      allowInfoFallback: false,
      breadcrumb: { kind: "library" },
      showSearch: true,
      focus
    });
  }

  function showCatalogueOverview(catalogue, { focus = false } = {}) {
    browsePuzzlesBtn.disabled = false;
    const progress = catalogueProgress(catalogue, puzzles, playerCompletedPuzzle);
    showOverview({
      title: catalogue.title,
      info: catalogue.info,
      progress: progressLabel(progress),
      renderList: container => renderCatalogueOverviewList(container, catalogue),
      allowInfoFallback: false,
      shareRoute: catalogueRoute(catalogue),
      breadcrumb: { kind: "catalogue", catalogue },
      focus
    });
  }

  function showCataloguePuzzles(catalogue, { focus = false } = {}) {
    browsePuzzlesBtn.disabled = false;
    const members = puzzlesForCatalogue(catalogue, puzzles);
    const progress = catalogueProgress(catalogue, puzzles, playerCompletedPuzzle);
    showOverview({
      title: `All puzzles in ${catalogue.title}`,
      info: catalogue.info,
      progress: progressLabel(progress),
      renderList: container => renderPuzzleCards(
        container,
        entriesForPuzzles(catalogue, members),
        index => openPuzzle(index, { catalogue, originCategory: null })
      ),
      allowInfoFallback: false,
      shareRoute: {
        kind: "catalogue-puzzles",
        catalogueId: catalogue.id
      },
      breadcrumb: { kind: "catalogue-puzzles", catalogue },
      focus
    });
  }

  function showCatalogueCategory(catalogue, category, {
    legacy = false,
    focus = false
  } = {}) {
    browsePuzzlesBtn.disabled = false;
    const members = puzzlesForCatalogueCategory(catalogue, category, puzzles);
    const progress = {
      completed: members.filter(playerCompletedPuzzle).length,
      total: members.length
    };
    const hasRepresentedSubcategories =
      subcategoriesForPuzzleSet(members, category).length > 0;
    showOverview({
      title: category,
      info: CATEGORIES[category]?.info,
      progress: `${progressLabel(progress)} in ${catalogue.title}`,
      renderList: container => {
        if (hasRepresentedSubcategories) {
          renderSubcategoryCards(
            container,
            category,
            members,
            subcategoryId => navigateTo(subcategoryRoute(
              catalogue,
              category,
              subcategoryId,
              legacy
            ))
          );
        } else {
          renderPuzzleCards(
            container,
            entriesForPuzzles(catalogue, members),
            index => openPuzzle(index, {
              catalogue,
              originCategory: category
            }),
            {
              category,
              catalogueId: catalogue.id,
              showMemberships: true
            }
          );
        }
        renderCatalogueIntersections(container, category, catalogue);
      },
      shareRoute: legacy
        ? { kind: "legacy-category", category }
        : {
          kind: "catalogue-category",
          catalogueId: catalogue.id,
          category
        },
      breadcrumb: {
        kind: "catalogue-category",
        catalogue,
        category,
        legacy
      },
      focus
    });
  }

  function showCatalogueSubcategory(
    catalogue,
    category,
    subcategoryId,
    {
      legacy = false,
      focus = false
    } = {}
  ) {
    browsePuzzlesBtn.disabled = false;
    const members = puzzlesForCatalogueSubcategory(
      catalogue,
      category,
      subcategoryId,
      puzzles
    );
    const progress = {
      completed: members.filter(playerCompletedPuzzle).length,
      total: members.length
    };
    const presentation = subcategoryPresentation(category, subcategoryId);
    showOverview({
      title: presentation.title,
      info: presentation.info,
      progress: `${progressLabel(progress)} in ${catalogue.title}`,
      renderList: container => renderPuzzleCards(
        container,
        entriesForPuzzles(catalogue, members),
        index => openPuzzle(index, {
          catalogue,
          originCategory: category,
          originSubcategory: subcategoryId
        }),
        {
          category,
          catalogueId: catalogue.id,
          showMemberships: true
        }
      ),
      shareRoute: subcategoryRoute(
        catalogue,
        category,
        subcategoryId,
        legacy
      ),
      breadcrumb: {
        kind: "catalogue-subcategory",
        catalogue,
        category,
        subcategoryId,
        legacy
      },
      focus
    });
  }

  function showRelatedOverview(puzzleIds, { focus = false } = {}) {
    browsePuzzlesBtn.disabled = false;
    const contextCatalogue = catalogueById(
      ALL_PUZZLES_CATALOGUE_ID,
      puzzles,
      catalogues
    );
    const anchorPuzzle = puzzles.find(puzzle => puzzle.id === puzzleIds[0]);
    showOverview({
      title: "Related puzzles",
      info: anchorPuzzle?.relatedPuzzles?.info,
      fallbackSearchWord: anchorPuzzle?.title,
      renderList: container => renderPuzzleCards(
        container,
        puzzleIds.map(id => ({ id })),
        index => openPuzzle(index, { preserveCatalogue: true })
      ),
      shareRoute: { kind: "related", puzzleIds },
      breadcrumb: {
        kind: "related",
        catalogue: contextCatalogue
      },
      focus
    });
  }

  function showRelatedPuzzles(puzzle) {
    relatedPuzzlesEl.innerHTML = "";
    const related = puzzle.relatedPuzzles?.entries || [];
    if (!related.length) return;
    const heading = document.createElement("div");
    heading.className = "related-heading";
    heading.textContent = "Related puzzles";
    relatedPuzzlesEl.appendChild(heading);
    const subtitle = document.createElement("div");
    subtitle.className = "related-subtitle";
    relatedPuzzlesEl.appendChild(subtitle);
    renderInfoLine(subtitle, puzzle.relatedPuzzles.info, puzzle.title);
    const list = document.createElement("div");
    relatedPuzzlesEl.appendChild(list);
    renderPuzzleCards(
      list,
      related,
      index => openPuzzle(index, { preserveCatalogue: true })
    );

    const share = document.createElement("button");
    share.type = "button";
    share.className = "related-share-link";
    share.textContent = "Share these related puzzles";
    const status = document.createElement("span");
    status.setAttribute("role", "status");
    share.addEventListener("click", () => {
      const ids = [puzzle.id, ...related.map(entry => entry.id)];
      const params = new URLSearchParams({ puzzles: ids.join(",") });
      copyLink(
        `${location.origin}${location.pathname}?${params.toString()}`,
        status
      );
    });
    relatedPuzzlesEl.append(share, status);
  }

  function hideOverview() {
    overviewEl.classList.remove("shown");
    puzzleViewEl.insertBefore(termInfoEl, factsEl);
    puzzleViewEl.classList.remove("hidden");
    puzzleControlsEl.classList.remove("hidden");
  }

  function showPuzzleInfo(puzzle) {
    renderInfoLine(puzzleInfoEl, puzzle.info, puzzle.title);
  }

  function renderPuzzleBreadcrumb(puzzle) {
    const { catalogue } = getNavigationContext();
    renderBreadcrumbs({
      kind: "puzzle",
      catalogue,
      category: primaryCategoryForPuzzle(puzzle),
      puzzle,
      legacy: catalogue.id === ALL_PUZZLES_CATALOGUE_ID
    });
  }

  overviewShareBtn.addEventListener("click", () => {
    if (!overviewEl._shareRoute) return;
    copyLink(
      shareUrlForRoute(overviewEl._shareRoute),
      overviewShareStatusEl
    );
  });

  overviewSearchInputEl.addEventListener("input", () =>
    renderLibraryList(overviewSearchInputEl.value.trim())
  );
  backToCatalogueBtn.addEventListener("click", () => {
    if (backToCatalogueBtn._route) navigateTo(backToCatalogueBtn._route);
  });

  return {
    hideOverview,
    renderInfoLine,
    renderPuzzleBreadcrumb,
    renderPuzzleCards,
    showCatalogueCategory,
    showCatalogueSubcategory,
    showCatalogueOverview,
    showCataloguePuzzles,
    showLibrary,
    showPuzzleInfo,
    showRelatedOverview,
    showRelatedPuzzles
  };
}
