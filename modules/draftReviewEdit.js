// Copy-field save/revert for /admin/drafts. Addresses one field with
// structured form keys (section, id, term, field) rather than a JSONPath
// string. Revert copies from the live published document -- it does not
// trust a hidden "before" value in the form. Human saves leave
// generativeAssistance unchanged.

import { DraftConflictError } from "./draftRepository.js";

export const SAVE_FIELD_CONFIRM = "save-field";
export const REVERT_FIELD_CONFIRM = "revert-field";

const SECTIONS = new Set(["puzzle", "cluster", "term", "bridge", "lens", "learning"]);

const FIELDS_BY_SECTION = {
  puzzle: new Set(["title", "info.text", "info.link"]),
  cluster: new Set(["name", "fact", "info.text", "info.link"]),
  term: new Set(["info.text", "info.link"]),
  bridge: new Set(["term", "fact", "info.text", "info.link"]),
  lens: new Set(["prompt", "explanation", "reason"]),
  learning: new Set(["title", "summary", "content.text"])
};

export class DraftFieldError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "DraftFieldError";
    this.status = status;
  }
}

export function isDraftConflictError(error) {
  if (error instanceof DraftConflictError) return true;
  return /revision conflict/i.test(error?.message || "");
}

function cloneDocument(document) {
  return structuredClone(document);
}

function requireString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new DraftFieldError(`${label} is required`);
  }
  return value;
}

function findItem(list, id, keys) {
  if (!Array.isArray(list) || typeof id !== "string" || !id) return null;
  return list.find(item => keys.some(key => item?.[key] === id)) || null;
}

function requireItem(list, id, keys, label) {
  const item = findItem(list, id, keys);
  if (!item) throw new DraftFieldError(`Unknown ${label}: ${id}`);
  return item;
}

function infoPart(info, part) {
  if (info == null) return "";
  if (typeof info === "string") return part === "text" ? info : "";
  if (typeof info === "object") {
    const value = info[part];
    return typeof value === "string" ? value : "";
  }
  return "";
}

function writeInfoPart(current, part, value) {
  const nextValue = typeof value === "string" ? value : "";
  if (part === "text") {
    if (current == null || typeof current === "string") {
      return nextValue;
    }
    const next = { ...current };
    if (nextValue) next.text = nextValue;
    else delete next.text;
    return pruneInfo(next);
  }
  if (current == null) {
    return nextValue ? { link: nextValue } : undefined;
  }
  if (typeof current === "string") {
    if (!nextValue) return current;
    return pruneInfo({ text: current, link: nextValue });
  }
  const next = { ...current };
  if (nextValue) next.link = nextValue;
  else delete next.link;
  return pruneInfo(next);
}

function pruneInfo(info) {
  if (!info || typeof info !== "object") return info;
  const keys = Object.keys(info).filter(key => {
    const value = info[key];
    if (value == null || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
  if (!keys.length) return undefined;
  if (keys.length === 1 && keys[0] === "text" && typeof info.text === "string") {
    return info.text;
  }
  const out = {};
  for (const key of keys) out[key] = info[key];
  return out;
}

function assignInfo(container, key, part, value) {
  const next = writeInfoPart(container[key], part, value);
  if (next === undefined) delete container[key];
  else container[key] = next;
}

function ensureLearningIntro(document) {
  if (!document.learningIntroduction || typeof document.learningIntroduction !== "object") {
    document.learningIntroduction = {};
  }
  return document.learningIntroduction;
}

function parseAddress(form) {
  const section = requireString(form.section, "section");
  if (!SECTIONS.has(section)) {
    throw new DraftFieldError(`Unknown section: ${section}`);
  }
  const field = requireString(form.field, "field");
  if (!FIELDS_BY_SECTION[section].has(field)) {
    throw new DraftFieldError(`Unknown field "${field}" for section "${section}"`);
  }
  const id = typeof form.id === "string" ? form.id : "";
  const term = typeof form.term === "string" ? form.term : "";
  if (section === "cluster" || section === "bridge" || section === "lens") {
    requireString(id, "id");
  }
  if (section === "term") {
    requireString(id, "id");
    requireString(term, "term");
  }
  if (section === "lens" && field === "reason") {
    requireString(term, "term");
  }
  return { section, field, id, term };
}

function publishedAddressValue(published, address) {
  if (!published || typeof published !== "object") {
    throw new DraftFieldError("There is no published wording for this field");
  }
  const { section, field, id, term } = address;
  if (section === "puzzle") {
    if (field === "title") return published.title ?? "";
    if (field === "info.text") return infoPart(published.info, "text");
    if (field === "info.link") return infoPart(published.info, "link");
  }
  if (section === "cluster") {
    const cluster = findItem(published.clusters, id, ["id", "name"]);
    if (!cluster) throw new DraftFieldError("There is no published wording for this field");
    if (field === "name") return cluster.name ?? "";
    if (field === "fact") return cluster.fact ?? "";
    if (field === "info.text") return infoPart(cluster.info, "text");
    if (field === "info.link") return infoPart(cluster.info, "link");
  }
  if (section === "term") {
    const cluster = findItem(published.clusters, id, ["id", "name"]);
    const info = cluster?.termInfo?.[term];
    if (info == null) throw new DraftFieldError("There is no published wording for this field");
    if (field === "info.text") return infoPart(info, "text");
    if (field === "info.link") return infoPart(info, "link");
  }
  if (section === "bridge") {
    const bridge = findItem(published.bridges, id, ["id", "term"]);
    if (!bridge) throw new DraftFieldError("There is no published wording for this field");
    if (field === "term") return bridge.term ?? "";
    if (field === "fact") return bridge.fact ?? "";
    if (field === "info.text") return infoPart(bridge.info, "text");
    if (field === "info.link") return infoPart(bridge.info, "link");
  }
  if (section === "lens") {
    const lens = findItem(published.lenses, id, ["id", "prompt"]);
    if (!lens) throw new DraftFieldError("There is no published wording for this field");
    if (field === "prompt") return lens.prompt ?? "";
    if (field === "explanation") return lens.explanation ?? "";
    if (field === "reason") {
      const reason = lens.reasons?.[term];
      if (typeof reason !== "string") {
        throw new DraftFieldError("There is no published wording for this field");
      }
      return reason;
    }
  }
  if (section === "learning") {
    const intro = published.learningIntroduction;
    if (!intro) throw new DraftFieldError("There is no published wording for this field");
    if (field === "title") return intro.title ?? "";
    if (field === "summary") return intro.summary ?? "";
    if (field === "content.text") return intro.content?.text ?? "";
  }
  throw new DraftFieldError("There is no published wording for this field");
}

export function applyDraftFieldValue(document, form, value) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    throw new DraftFieldError("Draft document must be a JSON object");
  }
  const address = parseAddress(form);
  const next = cloneDocument(document);
  const { section, field, id, term } = address;

  if (section === "puzzle") {
    if (field === "title") next.title = value;
    else if (field === "info.text") assignInfo(next, "info", "text", value);
    else if (field === "info.link") assignInfo(next, "info", "link", value);
    return next;
  }

  if (section === "cluster") {
    const cluster = requireItem(next.clusters, id, ["id", "name"], "cluster");
    if (field === "name") cluster.name = value;
    else if (field === "fact") cluster.fact = value;
    else if (field === "info.text") assignInfo(cluster, "info", "text", value);
    else if (field === "info.link") assignInfo(cluster, "info", "link", value);
    return next;
  }

  if (section === "term") {
    const cluster = requireItem(next.clusters, id, ["id", "name"], "cluster");
    if (!cluster.termInfo || typeof cluster.termInfo !== "object") cluster.termInfo = {};
    if (field === "info.text") assignInfo(cluster.termInfo, term, "text", value);
    else if (field === "info.link") assignInfo(cluster.termInfo, term, "link", value);
    if (cluster.termInfo[term] === undefined) delete cluster.termInfo[term];
    if (!Object.keys(cluster.termInfo).length) delete cluster.termInfo;
    return next;
  }

  if (section === "bridge") {
    const bridge = requireItem(next.bridges, id, ["id", "term"], "bridge");
    if (field === "term") bridge.term = value;
    else if (field === "fact") bridge.fact = value;
    else if (field === "info.text") assignInfo(bridge, "info", "text", value);
    else if (field === "info.link") assignInfo(bridge, "info", "link", value);
    return next;
  }

  if (section === "lens") {
    const lens = requireItem(next.lenses, id, ["id", "prompt"], "lens");
    if (field === "prompt") lens.prompt = value;
    else if (field === "explanation") lens.explanation = value;
    else if (field === "reason") {
      if (!lens.reasons || typeof lens.reasons !== "object") lens.reasons = {};
      if (value) lens.reasons[term] = value;
      else delete lens.reasons[term];
      if (!Object.keys(lens.reasons).length) delete lens.reasons;
    }
    return next;
  }

  const intro = ensureLearningIntro(next);
  if (field === "title") intro.title = value;
  else if (field === "summary") intro.summary = value;
  else if (field === "content.text") {
    if (!intro.content || typeof intro.content !== "object") intro.content = {};
    intro.content.text = value;
  }
  return next;
}

export function applyDraftFieldEdit(document, form, { publishedDocument = null } = {}) {
  const address = parseAddress(form);
  if (form.isRevertField || form.isRevert || form.confirm === REVERT_FIELD_CONFIRM) {
    const value = publishedAddressValue(publishedDocument, address);
    return applyDraftFieldValue(document, form, value);
  }
  return applyDraftFieldValue(document, form, typeof form.value === "string" ? form.value : "");
}

export function parseFieldEditForm(params) {
  const confirm = params.get("confirm");
  const expectedRevision = Number.parseInt(params.get("expected_revision"), 10);
  return {
    confirm,
    isSaveField: confirm === SAVE_FIELD_CONFIRM,
    isRevertField: confirm === REVERT_FIELD_CONFIRM,
    expectedRevision: Number.isInteger(expectedRevision) ? expectedRevision : null,
    section: params.get("section") || "",
    id: params.get("id") || "",
    term: params.get("term") || "",
    field: params.get("field") || "",
    value: params.get("value") ?? ""
  };
}

/**
 * @param {{
 *   draft: { document: object },
 *   publishedDocument?: object | null,
 *   form: object,
 *   saveDraft: (args: { document: object, expectedRevision: number }) => unknown
 * }} args
 */
export async function persistDraftFieldEdit({
  draft,
  publishedDocument = null,
  form,
  saveDraft
}) {
  if (!form?.isSaveField && !form?.isRevertField) {
    throw new DraftFieldError("Missing field-edit confirmation");
  }
  if (!Number.isInteger(form.expectedRevision) || form.expectedRevision < 1) {
    throw new DraftFieldError("expected_revision must be a positive integer");
  }
  if (!draft?.document) throw new DraftFieldError("Draft has no document");
  const document = applyDraftFieldEdit(draft.document, form, { publishedDocument });
  return saveDraft({
    document,
    expectedRevision: form.expectedRevision
  });
}

export function draftFieldRedirectPath(draftId) {
  return `/admin/drafts/${encodeURIComponent(draftId)}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

/** @param {{ draftId?: string, error?: string | null }} [opts] */
export function renderDraftFieldConflictPage({ draftId, error = null } = {}) {
  const message = error || "The draft was updated elsewhere. Reload and try again.";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Draft was updated elsewhere</title>
  <style>
    body { font: 16px/1.5 -apple-system, system-ui, sans-serif; max-width: 860px; margin: 0 auto; padding: 24px 16px 64px; color: #1a1a1a; }
    .validation { padding: 10px 14px; border-radius: 6px; margin: 16px 0; background: #fee2e2; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <h1>Draft was updated elsewhere</h1>
  <p class="validation">${escapeHtml(message)}</p>
  <p><a href="${escapeHtml(draftFieldRedirectPath(draftId))}">← back to draft</a></p>
</body>
</html>`;
}

export default persistDraftFieldEdit;
