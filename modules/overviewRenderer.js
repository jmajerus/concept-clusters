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
import { computePuzzleStats } from "./puzzleStats.js";
import { formatCitation, linkLabel, normalizeInfo, searchLink } from "./termInfo.js";
import {
  ALL_PUZZLES_CATALOGUE_ID,
  NEW_PUZZLES_CATALOGUE_ID,
  catalogueById,
  catalogueProgress,
  cataloguesForCategory,
  cataloguesForPuzzle,
  categoriesForCatalogue,
  childCatalogues,
  entriesForPuzzles,
  isOrderedCatalogue,
  libraryCatalogues,
  newCatalogues,
  newPuzzles,
  parentMetaCatalogueFor,
  relatedCatalogues,
  puzzlesForCatalogue,
  puzzlesForCatalogueCategory,
  puzzlesForCatalogueSubcategory
} from "./catalogueRegistry.js";
import { matchingCatalogues, parseLibraryQuery, rankedPuzzleMatches, puzzleMatchFields, catalogueMatchFields } from "./librarySearch.js";

// Owns the Library/category/related-set DOM. The game supplies navigation,
// persistence, and term-info callbacks; no puzzle state or history rules
// live here.
export function createOverviewRenderer({
  puzzles,
  catalogues,
  storage,
  layoutAuthoringMode,
  adminMode,
  authoringSearch = false,
  searchDrafts = [],
  elements,
  getNavigationContext,
  navigateTo,
  openPuzzle,
  openDraft = null,
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
    puzzleCatalogueSuggestionEl,
    puzzleMetaEl,
    puzzleStatsReportEl,
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
    overviewSearchHintEl,
    overviewListEl,
    overviewRelatedCataloguesEl,
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
        titlePrefix: "All ",
        title: category,
        titleSuffix: " puzzles",
        breadcrumb: "All puzzles",
        info: CATEGORIES[category]?.info
      };
    }
    if (subcategoryId === GENERATED_SUBCATEGORY_IDS.other) {
      return {
        titlePrefix: "Other ",
        title: category,
        titleSuffix: " puzzles",
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

  // See game.js's own copy of this for why it's a small distinct block
  // rather than another inline "See also" chip -- kept as a separate
  // copy here rather than shared, matching this file's existing
  // appendInfoAnchor duplication.
  function renderCitationsList(citations) {
    const list = document.createElement("ul");
    list.className = "citations";
    citations.forEach(citation => {
      const item = document.createElement("li");
      const formatted = formatCitation(citation);
      if (citation.url) {
        const anchor = document.createElement("a");
        anchor.href = citation.url;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = `${formatted} ↗`;
        item.appendChild(anchor);
      } else {
        item.textContent = formatted;
      }
      list.appendChild(item);
    });
    return list;
  }

  function renderInfoLine(container, rawInfo, fallbackSearchWord, {
    allowFallbackLink = true,
    omitCitations = false
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
    const links = Array.isArray(info.links) ? info.links : [];
    const primary = links[0] || (info.link ? { href: info.link, label: info.linkLabel || null } : null);
    const rest = primary && links.length ? links.slice(1) : (info.seeAlso || []);
    const href = primary?.href ||
      (allowFallbackLink ? searchLink(fallbackSearchWord) : null);
    if (href) {
      if (info.text) container.appendChild(document.createTextNode(" "));
      appendInfoAnchor(container, href, primary?.label);
    }
    if (rest.length) {
      const hasLead = !!(info.text || href);
      container.appendChild(document.createTextNode(
        `${hasLead ? " " : ""}See also: `
      ));
      rest.forEach((entry, index) => {
        if (index) container.appendChild(document.createTextNode(" · "));
        appendInfoAnchor(container, entry.href, entry.label);
      });
    }
    if (!omitCitations && info.citations?.length) {
      container.appendChild(renderCitationsList(info.citations));
    }
    const hasVisible = !!(
      info.text || href || rest.length ||
      (!omitCitations && info.citations?.length)
    );
    container.classList.toggle("shown", hasVisible);
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
      const target = targetIndex === -1
        ? entry
        : {
          ...puzzles[targetIndex],
          ...(typeof entry.title === "string" && entry.title.trim()
            ? { title: entry.title }
            : {})
        };
      if (!target?.id) return;
      const draftId = entry.draftId || target._draftId;
      const isDraft = Boolean(draftId) || entry.searchSource === "draft";
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

      if (isDraft) appendBadge(badges, "Working copy", "badge-new", "Opens your working copy");
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
      appendSearchMatchFields(main, entry.matchFields);
      const play = document.createElement("span");
      play.className = "card-play";
      play.textContent = isDraft ? "Edit ▶" : "Play ▶";
      card.append(main, play);
      card.addEventListener("click", () => {
        if (isDraft && typeof openDraft === "function") {
          openDraft(draftId || target.id);
          return;
        }
        if (targetIndex === -1) return;
        onPick(targetIndex);
      });
      container.appendChild(card);
    });
  }

  // At or below this many puzzles, a category card leading to a screen
  // that would just show this same short list anyway is a redundant
  // click -- show the list inline instead of the card. Only reached for
  // an *unordered* catalogue (see this function's `catalogue` param and
  // the call site's own comment) -- an ordered catalogue's whole puzzle
  // list is always shown inline already (wholeCatalogueInlined in
  // renderCatalogueOverviewList), which is the gate that matters there;
  // count only decides this narrower, per-category case.
  const INLINE_PUZZLE_LIST_THRESHOLD = 5;

  function renderCategoryCards(
    container,
    categoryNames,
    availablePuzzles,
    onPick,
    catalogue = null
  ) {
    container.innerHTML = "";
    categoryNames.forEach(name => {
      const info = normalizeInfo(CATEGORIES[name]?.info);
      const categoryPuzzles = availablePuzzles
        .filter(puzzle => puzzleBelongsToCategory(puzzle, name));
      const count = categoryPuzzles.length;
      // Only applies when the caller passed a catalogue -- the puzzles
      // need one to resolve targetIndex and originCategory against, and
      // renderDomainGroupedCategoryCards deliberately omits it when the
      // catalogue-level list above this was already inlined, or when
      // the catalogue is ordered (see the call site's own comment --
      // inlining a small category here has no way to reflect its
      // puzzles' actual position in an ordered sequence).
      if (catalogue && count <= INLINE_PUZZLE_LIST_THRESHOLD) {
        const heading = document.createElement("h5");
        heading.className = "overview-section-heading category-group-heading";
        heading.textContent = name;
        container.appendChild(heading);
        const list = document.createElement("div");
        list.className = "overview-card-list";
        container.appendChild(list);
        renderPuzzleCards(
          list,
          entriesForPuzzles(catalogue, categoryPuzzles),
          index => openPuzzle(index, { catalogue, originCategory: name }),
          { category: name, catalogueId: catalogue.id, showMemberships: true }
        );
        return;
      }
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
    onPick,
    catalogue = null
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
      renderCategoryCards(list, names, availablePuzzles, onPick, catalogue);
    };

    // Alphabetical, not curated -- any hand-ordering of subjects reads as
    // a ranking (which one matters more) whether or not that's intended,
    // and this list should carry no implied hierarchy between domains.
    [...byDomain.keys()]
      .sort((a, b) => DOMAINS[a].title.localeCompare(DOMAINS[b].title))
      .forEach(domainId => appendGroup(DOMAINS[domainId].title, byDomain.get(domainId)));
    if (ungrouped.length) appendGroup("Other subjects", ungrouped);
  }

  // A plain-text index, not a browsing UI: used only when the catalogue's
  // own puzzle list is already fully inlined above (wholeCatalogueInlined
  // in renderCatalogueOverviewList), so every puzzle here is already one
  // click away and there's nothing left for a category "card" to lead to.
  // No domain grouping either -- that's a readability aid for a longer
  // card list, and this is already about as short as it gets. Alphabetical
  // by category, same "no implied ranking" rule as everywhere else.
  // A bulleted separator, not ", " -- several puzzle titles here (e.g.
  // "Power Over, Power To") contain a comma themselves, so joining with
  // commas made it unclear where one title ended and the next began. A
  // bare " · " (this codebase's usual separator for exactly this kind
  // of comma-ambiguous list, e.g. the "See also" links above) turned
  // out too faint here against this row's small, already-muted text --
  // styled as its own bold, full-color span with room on both sides
  // instead, rather than changing that established convention
  // everywhere else it's used.
  function appendSubjectSummaryTitles(row, titles) {
    titles.forEach((title, index) => {
      if (index) {
        const separator = document.createElement("span");
        separator.className = "subject-summary-sep";
        separator.textContent = "•";
        row.appendChild(separator);
        // The separator's visual spacing is a CSS margin, which isn't a
        // real line-break opportunity -- two adjacent inline elements
        // with nothing but margin between them have nowhere valid to
        // wrap, so a nowrap title following one could get pushed off
        // the right edge with no fallback (confirmed live: a plain,
        // short title overflowing a 360px viewport, pushed there by
        // earlier same-row content it couldn't wrap away from). An
        // actual space character here is what gives the browser a real
        // place to break the line, between entries.
        row.appendChild(document.createTextNode(" "));
      }
      // Its own nowrap span, not a bare text node -- a multi-word title
      // (e.g. "The Hidden Transaction") is otherwise just as breakable
      // at any of its own spaces as the subcategory parenthetical was,
      // splitting one title across two lines with no visual cue it's
      // still one item. Wraps now only ever land at the space just
      // added above, between whole titles.
      const titleSpan = document.createElement("span");
      titleSpan.className = "subject-summary-title";
      titleSpan.textContent = title;
      row.appendChild(titleSpan);
    });
  }

  function renderSubjectSummary(container, categoryNames, availablePuzzles) {
    container.innerHTML = "";
    [...categoryNames].sort((a, b) => a.localeCompare(b)).forEach(category => {
      const heading = document.createElement("h5");
      heading.className = "overview-section-heading category-group-heading";
      heading.textContent = category;
      container.appendChild(heading);

      const categoryPuzzles = availablePuzzles.filter(
        puzzle => puzzleBelongsToCategory(puzzle, category)
      );
      // Grouped by subcategory, one row per group, rather than a
      // "(Subcategory)" repeated after every single title -- when every
      // puzzle in a category shares the same subcategory (common: a
      // catalogue's puzzles for one category often come from the same
      // corner of it), that repeated it as many times as there were
      // puzzles, which also broke word wrap (reported live: nearly
      // every wrapped line started with the tail end of a repeated
      // "Computing & Society"). A subcategory named once, up front,
      // covers the same information for the whole group.
      const groups = new Map();
      categoryPuzzles.forEach(puzzle => {
        const subcategoryId = subcategoryIdForPuzzle(puzzle, category);
        if (!groups.has(subcategoryId)) groups.set(subcategoryId, []);
        groups.get(subcategoryId).push(puzzle);
      });
      // Unlabeled puzzles (no subcategory, key null) always come first,
      // ahead of any named subcategory group -- reading top-down, the
      // category's own unlabeled row establishes where the category's
      // list starts; putting it after one or more labeled rows instead
      // left it unclear whether those trailing titles were still part
      // of the last subcategory or a separate, unlabeled group. Named
      // subcategories are alphabetical by title after that (same "no
      // implied ranking" rule as everywhere else).
      const orderedKeys = [...groups.keys()].sort((a, b) => {
        if (a === null) return -1;
        if (b === null) return 1;
        const titleA = subcategoryById(category, a)?.title || a;
        const titleB = subcategoryById(category, b)?.title || b;
        return titleA.localeCompare(titleB);
      });
      orderedKeys.forEach(subcategoryId => {
        const row = document.createElement("p");
        row.className = "subject-summary-row";
        if (subcategoryId !== null) {
          const label = document.createElement("span");
          label.className = "subject-summary-subcategory-label";
          label.textContent = `${subcategoryById(category, subcategoryId)?.title || subcategoryId}: `;
          row.appendChild(label);
        }
        appendSubjectSummaryTitles(
          row,
          groups.get(subcategoryId).map(puzzle => puzzle.title)
        );
        container.appendChild(row);
      });
    });
  }

  // For All Puzzles specifically: puzzles/index.js's registration order
  // (what puzzlesForCatalogue would otherwise hand back verbatim, see
  // allPuzzlesCatalogue in catalogueRegistry.js) is an accident of
  // authoring history, not a reading order -- unlike a real curated
  // catalogue's entries, it carries no editorial intent to preserve. This
  // groups by each puzzle's PRIMARY category only (not every category it
  // belongs to, so a multi-category puzzle still appears exactly once,
  // same as the flat list it replaces), nested under that category's
  // domain, alphabetical throughout -- domains and categories mirroring
  // the same "alphabetical, not a ranking" principle
  // renderDomainGroupedCategoryCards already establishes above.
  function renderAllPuzzlesGrouped(container, catalogue, members, onPick) {
    container.innerHTML = "";
    const byDomain = new Map();
    const other = new Map();
    members.forEach(puzzle => {
      const category = primaryCategoryForPuzzle(puzzle) || "Uncategorized";
      const domain = domainForCategory(category);
      const groupsByCategory = domain
        ? byDomain.get(domain) || byDomain.set(domain, new Map()).get(domain)
        : other;
      if (!groupsByCategory.has(category)) groupsByCategory.set(category, []);
      groupsByCategory.get(category).push(puzzle);
    });

    const appendCategoryGroups = groupsByCategory => {
      [...groupsByCategory.keys()]
        .sort((a, b) => a.localeCompare(b))
        .forEach(category => {
          const heading = document.createElement("h5");
          heading.className = "overview-section-heading category-group-heading";
          heading.textContent = category;
          container.appendChild(heading);
          const list = document.createElement("div");
          list.className = "overview-card-list";
          container.appendChild(list);
          const sorted = [...groupsByCategory.get(category)]
            .sort((a, b) => a.title.localeCompare(b.title));
          renderPuzzleCards(list, entriesForPuzzles(catalogue, sorted), onPick);
        });
    };

    [...byDomain.keys()]
      .sort((a, b) => DOMAINS[a].title.localeCompare(DOMAINS[b].title))
      .forEach(domainId => {
        const heading = document.createElement("h4");
        heading.className = "overview-section-heading domain-group-heading";
        heading.textContent = DOMAINS[domainId].title;
        container.appendChild(heading);
        appendCategoryGroups(byDomain.get(domainId));
      });
    if (other.size) {
      const heading = document.createElement("h4");
      heading.className = "overview-section-heading domain-group-heading";
      heading.textContent = "Other subjects";
      container.appendChild(heading);
      appendCategoryGroups(other);
    }
  }

  // A subcategory screen is only worth showing when it offers a genuine
  // choice -- at least two distinguishable groups among the category's
  // members. One puzzle total, or every puzzle sharing the same single
  // subcategory (with none left over untagged), both collapse to a
  // single group: the generated "All X puzzles" card and the one real
  // subcategory card (or the whole list) would list the exact same
  // puzzles, making the selection screen a redundant extra click.
  // Shared by the showCatalogueCategory gate below and
  // renderSubcategoryCards, so the two can never disagree about what
  // counts as "represented".
  function subcategoryGroups(members, category) {
    const represented = subcategoriesForPuzzleSet(members, category);
    const categoryPuzzles = members.filter(puzzle =>
      puzzleBelongsToCategory(puzzle, category)
    );
    const otherCount = categoryPuzzles.filter(puzzle =>
      !subcategoryIdForPuzzle(puzzle, category)
    ).length;
    return { represented, categoryPuzzles, otherCount };
  }

  function renderSubcategoryCards(
    container,
    category,
    availablePuzzles,
    onPick
  ) {
    container.innerHTML = "";
    const { represented, categoryPuzzles, otherCount } =
      subcategoryGroups(availablePuzzles, category);
    if (!represented.length) return;

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
    // A leaf catalogue nested under exactly one meta catalogue gets an
    // extra crumb for that parent -- derived from the registry, not
    // carried in navigation state, so it's correct on a direct link or
    // refresh too, not just after a click-through.
    const metaParent = contextCatalogue.kind !== "meta"
      ? parentMetaCatalogueFor(contextCatalogue.id, catalogues)
      : null;
    if (metaParent) addBreadcrumb(metaParent.title, catalogueRoute(metaParent));
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

  function renderCatalogueCards(container, catalogueList, { matchFieldsById } = {}) {
    container.innerHTML = "";
    const newPuzzleIds = new Set(newPuzzles(puzzles).map(puzzle => puzzle.id));
    // A catalogue can also be newly minted from older puzzles -- neither
    // signal alone is sufficient, so a card gets the badge if it contains
    // a new puzzle OR is itself among the most recently added catalogues.
    const recentCatalogueIds = new Set(newCatalogues(catalogues).map(item => item.id));
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
      if (catalogue.kind === "meta") card.classList.add("catalogue-card-meta-kind");
      card.dataset.catalogueId = catalogue.id;
      const detail = info?.text
        ? `<span class="card-detail">${info.text}</span>`
        : "";
      // All Puzzles and New Puzzles never carry the badge themselves --
      // All Puzzles would almost always qualify (permanently on,
      // meaningless), and New Puzzles doesn't need to point at itself.
      // puzzlesForCatalogue resolves a meta catalogue's entries (other
      // catalogues' ids) to its children's puzzles; for a leaf catalogue
      // this is the same set entries.map(id) already gave.
      const hasNew = catalogue.id !== ALL_PUZZLES_CATALOGUE_ID &&
        catalogue.id !== NEW_PUZZLES_CATALOGUE_ID &&
        (puzzlesForCatalogue(catalogue, puzzles, catalogues).some(puzzle => newPuzzleIds.has(puzzle.id)) ||
          recentCatalogueIds.has(catalogue.id));
      card.innerHTML = `
        <span class="card-main">
          <span class="card-title-line">
            <strong>${catalogue.title}</strong>
            ${hasNew ? '<span class="puzzle-badge badge-new">New</span>' : ""}
          </span>
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
      appendSearchMatchFields(
        card.querySelector(".card-main"),
        matchFieldsById?.get(catalogue.id)
      );
      container.appendChild(card);
    });
  }

  function appendSearchMatchFields(parent, fields) {
    if (!parent || !fields?.length) return;
    const list = document.createElement("ul");
    list.className = "search-match-fields";
    const limit = 20;
    const visible = fields.slice(0, limit);
    for (const field of visible) {
      const item = document.createElement("li");
      const path = document.createElement("code");
      path.textContent = field.path;
      item.appendChild(path);
      if (field.snippet) {
        item.appendChild(document.createTextNode(" — "));
        const snippet = document.createElement("span");
        snippet.textContent = field.snippet;
        item.appendChild(snippet);
      }
      list.appendChild(item);
    }
    if (fields.length > limit) {
      const more = document.createElement("li");
      more.className = "search-match-fields-more";
      more.textContent = `+${fields.length - limit} more`;
      list.appendChild(more);
    }
    parent.appendChild(list);
  }

  function appendSearchHeading(container, label) {
    const heading = document.createElement("div");
    heading.className = "related-heading search-result-heading";
    heading.textContent = label;
    container.appendChild(heading);
  }

  // A meta catalogue's "see also": catalogues related in spirit but left
  // out of entries' primary sequence on purpose. Rendered into its own
  // container below the primary card list, not mixed into it, so it reads
  // as adjacent rather than as a fifth member of the sequence. Mirrors
  // showRelatedPuzzles below -- same heading/subtitle/card-list shape --
  // but for catalogues, and scoped to the overview screen rather than the
  // puzzle view.
  function renderRelatedCataloguesSection(catalogue) {
    overviewRelatedCataloguesEl.innerHTML = "";
    if (catalogue?.kind !== "meta") return;
    const resolved = relatedCatalogues(catalogue, catalogues);
    if (!resolved.length) return;
    const heading = document.createElement("div");
    heading.className = "related-heading";
    heading.textContent = "See also";
    overviewRelatedCataloguesEl.appendChild(heading);
    const subtitle = document.createElement("div");
    subtitle.className = "related-subtitle";
    overviewRelatedCataloguesEl.appendChild(subtitle);
    renderInfoLine(subtitle, catalogue.relatedCatalogues.info, catalogue.title);
    const list = document.createElement("div");
    list.className = "overview-card-list";
    overviewRelatedCataloguesEl.appendChild(list);
    renderCatalogueCards(list, resolved);
  }

  // Swaps #overview-list's content in place on every keystroke -- no
  // debounce (a synchronous filter over ~70 puzzles is trivial), no
  // history/URL involvement (this state is ephemeral by design; see
  // showLibrary's reset). Reuses renderCatalogueCards/renderPuzzleCards
  // verbatim rather than inventing new markup, so a search result looks
  // and behaves exactly like every other catalogue/puzzle card in the app.
  // Matching (title/category/tag, then citation author/title, then
  // subcategory, then board terms; catalogue title then description,
  // including nested catalogues) lives in librarySearch.js. `text:` full-
  // object prose is admin-only on production (`?admin`). Authoring play
  // searches facts, lessons, and working copies on every query.
  function authoringSearchCorpus() {
    if (!searchDrafts.length) return puzzles;
    const byId = new Map(puzzles.map(puzzle => [puzzle.id, puzzle]));
    for (const draft of searchDrafts) {
      if (!draft?.id) continue;
      byId.set(draft.id, draft);
    }
    return [...byId.values()];
  }

  function librarySearchOptions() {
    return {
      allowFullText: adminMode || authoringSearch,
      implicitFullText: authoringSearch
    };
  }

  function renderLibraryList(rawQuery) {
    if (!rawQuery) {
      renderCatalogueCards(overviewListEl, libraryCatalogues(puzzles, catalogues));
      return;
    }
    const searchOptions = librarySearchOptions();
    const { fullText } = parseLibraryQuery(rawQuery, searchOptions);
    const searchPuzzles = authoringSearchCorpus();
    const catalogueMatches = matchingCatalogues(
      searchPuzzles,
      catalogues,
      rawQuery,
      searchOptions
    );
    const puzzleMatches = rankedPuzzleMatches(searchPuzzles, rawQuery, searchOptions);
    if (!catalogueMatches.length && !puzzleMatches.length) {
      overviewListEl.innerHTML = "";
      const empty = document.createElement("p");
      empty.className = "overview-empty-state";
      empty.textContent = `No puzzles or catalogues match "${rawQuery}".`;
      overviewListEl.appendChild(empty);
      return;
    }
    overviewListEl.innerHTML = "";
    const showHeadings = catalogueMatches.length > 0 && puzzleMatches.length > 0;
    if (catalogueMatches.length) {
      if (showHeadings) appendSearchHeading(overviewListEl, "Catalogues");
      const list = document.createElement("div");
      list.className = "overview-card-list";
      overviewListEl.appendChild(list);
      const matchFieldsById = fullText
        ? new Map(catalogueMatches.map(catalogue => [
          catalogue.id,
          catalogueMatchFields(catalogue, rawQuery, searchOptions)
        ]))
        : null;
      renderCatalogueCards(list, catalogueMatches, { matchFieldsById });
    }
    if (puzzleMatches.length) {
      if (showHeadings) appendSearchHeading(overviewListEl, "Puzzles");
      const list = document.createElement("div");
      list.className = "overview-card-list";
      overviewListEl.appendChild(list);
      renderPuzzleCards(
        list,
        puzzleMatches.map(puzzle => ({
          id: puzzle.id,
          title: puzzle.title,
          draftId: puzzle._draftId || null,
          searchSource: puzzle._searchSource || null,
          large: puzzle.large,
          lenses: puzzle.lenses,
          learningIntroduction: puzzle.learningIntroduction,
          matchFields: fullText
            ? puzzleMatchFields(puzzle, rawQuery, searchOptions)
            : null
        })),
        index => openPuzzle(index, {
          catalogue: catalogueById(ALL_PUZZLES_CATALOGUE_ID, puzzles, catalogues),
          originCategory: null
        })
      );
    }
  }

  function renderCatalogueOverviewList(container, catalogue) {
    container.innerHTML = "";
    // A meta catalogue (kind: "meta") is an ordinary catalogue whose
    // entries are other catalogues, not puzzles -- reuse the exact same
    // card list the Library screen itself renders, one level down, rather
    // than the category-partition UI below (which assumes direct puzzle
    // membership).
    if (catalogue.kind === "meta") {
      renderCatalogueCards(container, childCatalogues(catalogue, catalogues));
      return;
    }
    const members = puzzlesForCatalogue(catalogue, puzzles);
    // Ordered, not puzzle count, is the gate: an ordered catalogue's
    // whole point is a sequence worth seeing at a glance, and in
    // practice those stay short, so there's no separate size check to
    // explain or get wrong. The two synthetic catalogues are excluded
    // even though isOrderedCatalogue defaults them to true (neither sets
    // ordered: false, but neither has a real editorial order either --
    // see allCardDetail below, and All Puzzles alone would mean inlining
    // the entire collection).
    const wholeCatalogueInlined = catalogue.id !== ALL_PUZZLES_CATALOGUE_ID &&
      catalogue.id !== NEW_PUZZLES_CATALOGUE_ID &&
      isOrderedCatalogue(catalogue);
    if (wholeCatalogueInlined) {
      const inlineList = document.createElement("div");
      inlineList.className = "overview-card-list catalogue-inline-all";
      container.appendChild(inlineList);
      renderPuzzleCards(
        inlineList,
        entriesForPuzzles(catalogue, members),
        index => openPuzzle(index, { catalogue, originCategory: null })
      );
    } else {
      // A real catalogue only reaches this branch when it's explicitly
      // unordered (ordered: false) -- an ordered one is always inlined
      // above (wholeCatalogueInlined), so "editorial order" would be the
      // wrong claim to make about whatever's left here. The two
      // synthetic catalogues reach it regardless of their own (default
      // true) ordered status, for the same reason they're excluded from
      // wholeCatalogueInlined: neither has a real editorial sequence --
      // All Puzzles is just puzzles/index.js's registration order, and
      // New Puzzles is recency.
      const allCardDetail = catalogue.id === ALL_PUZZLES_CATALOGUE_ID
        ? "Browse the complete collection in the order puzzles were added."
        : catalogue.id === NEW_PUZZLES_CATALOGUE_ID
          ? "Browse the most recently added puzzles, newest first."
          : "Browse the collection; entry order here isn't a set sequence.";
      const allCard = document.createElement("button");
      allCard.type = "button";
      allCard.className = "related-card category-card catalogue-all-card";
      allCard.dataset.catalogueView = "all";
      allCard.innerHTML = `
        <span class="card-main">
          <strong>All puzzles in this catalogue</strong>
          <span class="card-detail">${allCardDetail}</span>
        </span>
        <span class="card-count">${pluralizedPuzzleCount(members.length)} →</span>`;
      allCard.addEventListener("click", () => navigateTo({
        kind: "catalogue-puzzles",
        catalogueId: catalogue.id
      }));
      container.appendChild(allCard);
    }

    const heading = document.createElement("h3");
    heading.className = "overview-section-heading";
    const categoryGroups = document.createElement("div");
    if (wholeCatalogueInlined) {
      // Every puzzle is already one click away, listed above -- a card
      // that would just lead back to a subset of what's already on
      // screen has nothing left to offer, so this becomes a plain
      // reference index instead of a second navigation surface.
      heading.textContent = "By subject";
      container.appendChild(heading);
      container.appendChild(categoryGroups);
      renderSubjectSummary(
        categoryGroups,
        categoriesForCatalogue(catalogue, puzzles),
        members
      );
    } else {
      heading.textContent = "Browse by subject";
      container.appendChild(heading);
      container.appendChild(categoryGroups);
      renderDomainGroupedCategoryCards(
        categoryGroups,
        categoriesForCatalogue(catalogue, puzzles),
        members,
        subject => navigateTo(categoryRoute(catalogue, subject)),
        // Per-category inlining here surfaces direct links to whichever
        // categories happen to be small -- fine for an unordered
        // catalogue (nothing implies a sequence to begin with), but for
        // an ordered one it's actively counterproductive: those small
        // categories aren't the catalogue's first entries, they're just
        // whichever ones happen to be small, so this was one-click
        // promoting an arbitrary (often late-sequence) subset while the
        // rest -- including the actual opener -- stayed behind the "All
        // puzzles" card. Reported live against Dark Patterns, where the
        // three inlined puzzles were its *last* three entries. An
        // ordinary category card makes no claim about sequence either
        // way, so that's the safe default whenever order is implied.
        isOrderedCatalogue(catalogue) ? null : catalogue
      );
    }
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
    titlePrefix = "",
    titleSuffix = "",
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
    // titlePrefix/titleSuffix are scaffolding phrases ("All puzzles in",
    // "puzzles") around the one dynamic value actually worth reading --
    // muted and set apart so a puzzle/catalogue/category named the same as
    // a piece of that scaffolding can't be misread as part of the phrase.
    // The concatenation is identical to the plain-string title this
    // replaced, so textContent (what every test's title assertion reads)
    // is unaffected either way.
    overviewTitleEl.textContent = "";
    if (titlePrefix || titleSuffix) {
      if (titlePrefix) {
        const prefix = document.createElement("span");
        prefix.className = "overview-title-scaffold";
        prefix.textContent = titlePrefix;
        overviewTitleEl.appendChild(prefix);
      }
      overviewTitleEl.appendChild(document.createTextNode(title));
      if (titleSuffix) {
        const suffix = document.createElement("span");
        suffix.className = "overview-title-scaffold";
        suffix.textContent = titleSuffix;
        overviewTitleEl.appendChild(suffix);
      }
    } else {
      overviewTitleEl.textContent = title;
    }
    renderInfoLine(
      overviewSubtitleEl,
      info,
      fallbackSearchWord || title,
      { allowFallbackLink: allowInfoFallback }
    );
    overviewProgressEl.textContent = progress || "";
    overviewProgressEl.classList.toggle("shown", !!progress);
    overviewSearchEl.classList.toggle("hidden", !showSearch);
    if (overviewSearchHintEl) {
      const showHint = showSearch && (adminMode || authoringSearch);
      overviewSearchHintEl.classList.toggle("hidden", !showHint);
      if (authoringSearch) {
        overviewSearchHintEl.textContent =
          "Search includes facts, lessons, and your working copies. A working-copy hit opens Construct.";
      }
    }
    renderList(overviewListEl);
    // Reset here, not per renderList implementation, so every screen that
    // isn't a meta catalogue's own overview (Library, a catalogue's puzzle
    // list, a category screen, related puzzles, ...) starts clean; only
    // showCatalogueOverview repopulates it, right after this call.
    overviewRelatedCataloguesEl.innerHTML = "";
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

  function showAuthoringCatalogue(document, { selectedId = null, onSelect = null } = {}) {
    browsePuzzlesBtn.disabled = false;
    const entries = Array.isArray(document?.entries) ? document.entries : [];
    showOverview({
      title: document?.title || document?.id || "Catalogue",
      info: document?.info,
      progress: `${entries.length} puzzle${entries.length === 1 ? "" : "s"}`,
      allowInfoFallback: false,
      shareRoute: null,
      breadcrumb: { kind: "library" },
      showSearch: false,
      renderList(container) {
        container.innerHTML = "";
        if (!entries.length) {
          const empty = globalThis.document.createElement("p");
          empty.className = "meta";
          empty.textContent = "No puzzles yet. Add one from the inspector.";
          container.appendChild(empty);
          return;
        }
        const list = globalThis.document.createElement("div");
        list.className = "overview-card-list catalogue-inline-all catalogue-authoring-list";
        container.appendChild(list);
        entries.forEach(entry => {
          const puzzleIndex = puzzles.findIndex(puzzle => puzzle.id === entry.id);
          if (puzzleIndex >= 0) {
            const holder = globalThis.document.createElement("div");
            renderPuzzleCards(holder, [entry], index => {
              const puzzle = puzzles[index];
              onSelect?.(puzzle?.id);
            });
            const card = holder.querySelector("[data-puzzle-id]");
            if (card) list.appendChild(card);
            return;
          }
          const card = globalThis.document.createElement("button");
          card.type = "button";
          card.className = "related-card";
          card.dataset.puzzleId = entry.id;
          const main = globalThis.document.createElement("span");
          main.className = "card-main";
          const title = globalThis.document.createElement("strong");
          title.textContent = entry.id;
          const detail = globalThis.document.createElement("span");
          detail.className = "card-detail";
          detail.textContent = entry.reason || "Not in this checkout";
          main.append(title, detail);
          card.appendChild(main);
          card.addEventListener("click", () => onSelect?.(entry.id));
          list.appendChild(card);
        });
        list.querySelectorAll("[data-puzzle-id]").forEach(card => {
          card.draggable = true;
          if (card.getAttribute("data-puzzle-id") === selectedId) {
            card.classList.add("selected");
          }
        });
      }
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
    renderRelatedCataloguesSection(catalogue);
  }

  function showCataloguePuzzles(catalogue, { focus = false } = {}) {
    browsePuzzlesBtn.disabled = false;
    const members = puzzlesForCatalogue(catalogue, puzzles);
    const progress = catalogueProgress(catalogue, puzzles, playerCompletedPuzzle);
    showOverview({
      titlePrefix: "All puzzles in ",
      title: catalogue.title,
      info: catalogue.info,
      progress: progressLabel(progress),
      renderList: container => {
        const onPick = index => openPuzzle(index, { catalogue, originCategory: null });
        if (catalogue.id === ALL_PUZZLES_CATALOGUE_ID) {
          renderAllPuzzlesGrouped(container, catalogue, members, onPick);
        } else {
          renderPuzzleCards(container, entriesForPuzzles(catalogue, members), onPick);
        }
      },
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
    // See subcategoryGroups above: only bother with the subcategory
    // selection screen when it splits members into 2+ actual groups --
    // otherwise skip straight to this category's flat puzzle list, same
    // as a category with no subcategories at all.
    const { represented, otherCount } = subcategoryGroups(members, category);
    const hasRepresentedSubcategories =
      represented.length + (otherCount ? 1 : 0) >= 2;
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
      titlePrefix: presentation.titlePrefix,
      titleSuffix: presentation.titleSuffix,
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
    // One bibliography on puzzle.info.citations. When a lesson exists, the
    // Lesson dialog shows it under References; keep it off the persistent board.
    // Never invent a Wikipedia search chip for the puzzle title -- omit links
    // means text-only subtitle (citations cover sources in the lesson).
    renderInfoLine(puzzleInfoEl, puzzle.info, puzzle.title, {
      omitCitations: !!puzzle.learningIntroduction,
      allowFallbackLink: false
    });
  }

  // A gentle nudge, not a redirect: when a puzzle was reached through the
  // flat, alphabetized All Puzzles list -- rather than by browsing into a
  // curated catalogue's own sequence -- and it happens to belong to one,
  // point the player at that catalogue's editorial order. Deliberately its
  // own element/function (see index.html's comment) rather than folded
  // into showPuzzleInfo/renderInfoLine, so it can show or hide on its own
  // terms regardless of whether the puzzle has an authored `info` field.
  function showPuzzleCatalogueSuggestion(puzzle) {
    const { catalogue: activeCatalogue } = getNavigationContext();
    const memberCatalogues = activeCatalogue?.id === ALL_PUZZLES_CATALOGUE_ID
      ? cataloguesForPuzzle(puzzle, puzzles, catalogues)
      : [];
    if (!memberCatalogues.length) {
      puzzleCatalogueSuggestionEl.hidden = true;
      puzzleCatalogueSuggestionEl.replaceChildren();
      return;
    }
    const suggested = memberCatalogues[0];
    puzzleCatalogueSuggestionEl.replaceChildren();
    const lead = document.createElement("span");
    lead.textContent = "Part of the ";
    const link = document.createElement("button");
    link.type = "button";
    link.className = "puzzle-catalogue-suggestion-link";
    link.textContent = suggested.title;
    link.addEventListener("click", () => navigateTo({
      kind: "catalogue-puzzles",
      catalogueId: suggested.id
    }));
    const tail = document.createElement("span");
    tail.textContent = isOrderedCatalogue(suggested)
      ? " catalogue — play it in sequence."
      : " catalogue.";
    puzzleCatalogueSuggestionEl.append(lead, link, tail);
    puzzleCatalogueSuggestionEl.hidden = false;
  }

  // Admin-only (see index.html's #puzzle-meta comment) -- a raw dump of
  // whichever optional metadata fields this puzzle actually has, not a
  // fixed report. Most are unpopulated on every puzzle today (creator/
  // license/dateCreated/dateModified/derivedFrom/version/language exist
  // in the schema but nothing sets them yet); tags is the one field with
  // real data right now. Renders nothing beyond "no metadata set" until
  // more fields get populated -- no change needed here when they do.
  const ADMIN_META_FIELDS = [
    "tags", "dateCreated", "dateModified", "creator", "license",
    "derivedFrom", "language", "version"
  ];

  function showPuzzleMeta(puzzle) {
    if (!adminMode) return;
    puzzleMetaEl.replaceChildren();
    const present = ADMIN_META_FIELDS.filter(key => puzzle[key] !== undefined);
    if (present.length === 0) {
      puzzleMetaEl.textContent = "No metadata set on this puzzle.";
      return;
    }
    const dl = document.createElement("dl");
    for (const key of present) {
      const dt = document.createElement("dt");
      dt.textContent = key;
      const dd = document.createElement("dd");
      const value = puzzle[key];
      dd.textContent = Array.isArray(value)
        ? value.join(", ")
        : (typeof value === "object" ? JSON.stringify(value) : String(value));
      dl.append(dt, dd);
    }
    puzzleMetaEl.append(dl);
  }

  // Admin-only (see index.html's #puzzle-stats-report comment), toggled
  // by the Stats button rather than tied to whichever puzzle is loaded
  // -- this covers the whole collection, computed fresh from
  // modules/puzzleStats.js every time it's opened (72 puzzles is cheap
  // enough that caching isn't worth the staleness risk). Renders the
  // exact same sections `npm run content:stats` prints to a terminal,
  // as a generic title+table loop -- no per-section markup here, so a
  // new section added to computePuzzleStats shows up here for free.
  function renderStatsSection(container, section) {
    const heading = document.createElement("h3");
    heading.textContent = section.title;
    container.append(heading);
    if (section.rows.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = section.emptyMessage || "(none)";
      container.append(empty);
      return;
    }
    const columns = Object.keys(section.rows[0]);
    const table = document.createElement("table");
    const headRow = document.createElement("tr");
    columns.forEach(column => {
      const th = document.createElement("th");
      th.textContent = column;
      headRow.append(th);
    });
    const thead = document.createElement("thead");
    thead.append(headRow);
    const tbody = document.createElement("tbody");
    section.rows.forEach(row => {
      const tr = document.createElement("tr");
      columns.forEach(column => {
        const td = document.createElement("td");
        td.textContent = row[column];
        tr.append(td);
      });
      tbody.append(tr);
    });
    table.append(thead, tbody);
    const wrap = document.createElement("div");
    wrap.className = "stats-table-wrap";
    wrap.append(table);
    container.append(wrap);
  }

  function togglePuzzleStats() {
    if (!puzzleStatsReportEl.hidden) {
      puzzleStatsReportEl.hidden = true;
      return;
    }
    puzzleStatsReportEl.replaceChildren();
    const { total, sections } = computePuzzleStats(puzzles);
    const summary = document.createElement("p");
    summary.textContent = `${total} puzzles total`;
    puzzleStatsReportEl.append(summary);
    sections.forEach(section => renderStatsSection(puzzleStatsReportEl, section));
    puzzleStatsReportEl.hidden = false;
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
    showPuzzleMeta,
    togglePuzzleStats,
    showCatalogueCategory,
    showCatalogueSubcategory,
    showCatalogueOverview,
    showAuthoringCatalogue,
    showCataloguePuzzles,
    showLibrary,
    showPuzzleCatalogueSuggestion,
    showPuzzleInfo,
    showRelatedOverview,
    showRelatedPuzzles
  };
}
