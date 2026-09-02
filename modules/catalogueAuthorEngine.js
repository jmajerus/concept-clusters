function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function asEntries(document) {
  return Array.isArray(document?.entries) ? document.entries : [];
}

export function createCatalogueSkeleton({ id, title, kind = null }) {
  const trimmedId = typeof id === "string" ? id.trim() : "";
  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  if (!trimmedId) throw new Error("Catalogue id is required");
  if (!trimmedTitle) throw new Error("Catalogue title is required");
  return {
    id: trimmedId,
    title: trimmedTitle,
    ...(kind === "meta" ? { kind: "meta" } : {}),
    info: { text: "" },
    ordered: true,
    entries: []
  };
}

export function setCatalogueTitle(document, title) {
  const next = clone(document);
  next.title = typeof title === "string" ? title : "";
  return next;
}

export function setCatalogueInfoText(document, text) {
  const next = clone(document);
  const value = typeof text === "string" ? text : "";
  next.info = { ...(next.info && typeof next.info === "object" ? next.info : {}), text: value };
  return next;
}

export function setCatalogueOrdered(document, ordered) {
  const next = clone(document);
  next.ordered = Boolean(ordered);
  return next;
}

export function addCatalogueEntry(document, puzzleId, reason = "") {
  const id = typeof puzzleId === "string" ? puzzleId.trim() : "";
  if (!id) throw new Error("Puzzle id is required");
  if (asEntries(document).some(entry => entry.id === id)) {
    throw new Error(`"${id}" is already in this catalogue`);
  }
  const next = clone(document);
  const entry = { id };
  const trimmed = typeof reason === "string" ? reason.trim() : "";
  if (trimmed) entry.reason = trimmed;
  next.entries = [...asEntries(next), entry];
  return next;
}

export function removeCatalogueEntry(document, puzzleId) {
  const next = clone(document);
  next.entries = asEntries(next).filter(entry => entry.id !== puzzleId);
  return next;
}

export function moveCatalogueEntry(document, fromIndex, toIndex) {
  const entries = asEntries(document);
  if (fromIndex < 0 || fromIndex >= entries.length) {
    throw new Error(`No catalogue entry at ${fromIndex}`);
  }
  const target = Math.max(0, Math.min(entries.length - 1, toIndex));
  const next = clone(document);
  const list = asEntries(next);
  const [moved] = list.splice(fromIndex, 1);
  list.splice(target, 0, moved);
  next.entries = list;
  return next;
}

export function setCatalogueEntryReason(document, puzzleId, reason) {
  const next = clone(document);
  const entry = asEntries(next).find(item => item.id === puzzleId);
  if (!entry) throw new Error(`"${puzzleId}" is not in this catalogue`);
  const trimmed = typeof reason === "string" ? reason.trim() : "";
  if (trimmed) entry.reason = trimmed;
  else delete entry.reason;
  return next;
}

export function prepareCatalogueDocumentForPublication(document) {
  const next = {
    id: typeof document?.id === "string" ? document.id.trim() : "",
    title: typeof document?.title === "string" ? document.title.trim() : "",
    entries: asEntries(document)
      .filter(entry => typeof entry?.id === "string" && entry.id.trim())
      .map(entry => {
        const prepared = { id: entry.id.trim() };
        const reason = typeof entry.reason === "string" ? entry.reason.trim() : "";
        if (reason) prepared.reason = reason;
        return prepared;
      })
  };
  if (document?.kind === "meta") next.kind = "meta";
  if (document?.showInLibrary === true) next.showInLibrary = true;
  const infoText = typeof document?.info === "string"
    ? document.info.trim()
    : (typeof document?.info?.text === "string" ? document.info.text.trim() : "");
  if (infoText) next.info = { text: infoText };
  if (document?.ordered === false) next.ordered = false;
  if (document?.kind === "meta" && document.relatedCatalogues) {
    const relatedEntries = (document.relatedCatalogues.entries || [])
      .filter(entry => typeof entry?.id === "string" && entry.id.trim())
      .map(entry => {
        const prepared = { id: entry.id.trim() };
        const reason = typeof entry.reason === "string" ? entry.reason.trim() : "";
        if (reason) prepared.reason = reason;
        return prepared;
      });
    if (relatedEntries.length) {
      next.relatedCatalogues = { entries: relatedEntries };
      const relatedInfo = typeof document.relatedCatalogues.info?.text === "string"
        ? document.relatedCatalogues.info.text.trim()
        : "";
      if (relatedInfo) next.relatedCatalogues.info = { text: relatedInfo };
    }
  }
  return next;
}

export function createCatalogueAuthorEngine() {
  return {
    createCatalogueSkeleton,
    setCatalogueTitle,
    setCatalogueInfoText,
    setCatalogueOrdered,
    addCatalogueEntry,
    removeCatalogueEntry,
    moveCatalogueEntry,
    setCatalogueEntryReason,
    prepareCatalogueDocumentForPublication
  };
}
