// Copy-field save/revert for /admin/drafts. Addresses one field with
// structured form keys (section, id, term, field) rather than a JSONPath
// string. Revert copies from the live published document -- it does not
// trust a hidden "before" value in the form. Human saves leave
// generativeAssistance unchanged.

import { documentForEditor } from "./authoredPuzzleDocument.js";
import { DraftConflictError } from "./draftRepository.js";
import { decodeAuthoredEscapedNewlines } from "./learningIntroduction.js";
import { applyProvenanceCollaboration, applyGenerativeContributorModel, applyProvenanceClientSetting } from "./authoringProvenance.js";
import { authoredLinks, authoredLearningLinks } from "./termInfo.js";
import { VALID_TERM_ROLES } from "./contentValidation.js";

export const SAVE_FIELD_CONFIRM = "save-field";
export const REVERT_FIELD_CONFIRM = "revert-field";
export const SAVE_CANONICAL_CONFIRM = "save-canonical-form";

const SECTIONS = new Set(["puzzle", "cluster", "term", "bridge", "lens", "learning", "provenance"]);

const INFO_LIST_FIELDS = new Set(["info.links", "info.citations"]);
const LEARNING_LIST_FIELDS = new Set(["links"]);
const CITATION_KEYS = ["title", "author", "publisher", "year", "pages", "url"];
const LINK_KEYS = ["label", "href"];
const INFO_LINK_KEYS = ["links", "link", "linkLabel", "extraLink", "seeAlso"];

const FIELDS_BY_SECTION = {
  puzzle: new Set(["title", "info.text", "info.links", "info.citations"]),
  cluster: new Set(["name", "fact", "info.text", "info.links"]),
  term: new Set(["info.text", "info.links"]),
  bridge: new Set(["term", "fact", "info.text", "info.links", "termRole"]),
  lens: new Set(["prompt", "explanation", "reason"]),
  learning: new Set(["title", "summary", "content.text", "credit", "links"]),
  provenance: new Set(["collaboration", "generativeModel", "reasoning", "switch", "editor"])
};

function isListField(field) {
  return INFO_LIST_FIELDS.has(field) || LEARNING_LIST_FIELDS.has(field);
}

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
    return nextValue ? { [part]: nextValue } : undefined;
  }
  if (typeof current === "string") {
    if (!nextValue) return current;
    return pruneInfo({ text: current, [part]: nextValue });
  }
  const next = { ...current };
  if (nextValue) next[part] = nextValue;
  else delete next[part];
  return pruneInfo(next);
}

function writeInfoList(current, listKey, items) {
  if (typeof items === "string") {
    return writeInfoPart(current, listKey, items);
  }
  const nextItems = Array.isArray(items) ? items : [];
  if (current == null || typeof current === "string") {
    if (!nextItems.length) return current == null ? undefined : current;
    return pruneInfo({
      ...(typeof current === "string" && current ? { text: current } : {}),
      [listKey]: nextItems
    });
  }
  const next = { ...current };
  if (nextItems.length) next[listKey] = nextItems;
  else delete next[listKey];
  return pruneInfo(next);
}

function assignInfoList(container, key, listKey, items) {
  const next = writeInfoList(container[key], listKey, items);
  if (next === undefined) delete container[key];
  else container[key] = next;
}

function cloneValue(value) {
  if (value == null || typeof value !== "object") return value ?? (Array.isArray(value) ? [] : value);
  return structuredClone(value);
}

function publishedInfoValue(info, field) {
  if (field === "info.text") return infoPart(info, "text");
  if (field === "info.links") return authoredLinks(info);
  if (field === "info.citations") {
    if (info && typeof info === "object" && Array.isArray(info.citations)) {
      return cloneValue(info.citations);
    }
    return [];
  }
  return undefined;
}

function stripInfoLinkFields(info) {
  const next = { ...info };
  for (const key of INFO_LINK_KEYS) delete next[key];
  return next;
}

function stripConnectorReferenceSurfaces(info) {
  if (info == null || typeof info === "string") return info;
  if (typeof info !== "object" || Array.isArray(info)) return info;
  const next = stripInfoLinkFields(info);
  delete next.citations;
  return pruneInfo(next);
}

function assignInfoLinks(container, key, items, publishedInfo = undefined) {
  const current = container[key];
  const base = current == null || typeof current === "string"
    ? (typeof current === "string" && current ? { text: current } : {})
    : { ...current };
  const next = stripInfoLinkFields(base);
  if (publishedInfo !== undefined) {
    const links = authoredLinks(publishedInfo);
    if (links.length) next.links = links;
  } else if (Array.isArray(items) && items.length) {
    next.links = items;
  }
  const pruned = pruneInfo(next);
  if (pruned === undefined) delete container[key];
  else container[key] = pruned;
}

function applyInfoField(container, key, field, value) {
  if (field === "info.text") assignInfo(container, key, "text", value);
  else if (field === "info.links") assignInfoLinks(container, key, value);
  else if (field === "info.citations") assignInfoList(container, key, "citations", value);
}

function publishedInfoObject(published, address) {
  const { section, id, term } = address;
  if (section === "puzzle") return published.info;
  if (section === "cluster") return findItem(published.clusters, id, ["id", "name"])?.info;
  if (section === "term") {
    const cluster = findItem(published.clusters, id, ["id", "name"]);
    return cluster?.termInfo?.[term];
  }
  if (section === "bridge") return findItem(published.bridges, id, ["id", "term"])?.info;
  return undefined;
}

function collectRows(params, keys) {
  const columns = Object.fromEntries(keys.map(key => [key, params.getAll(key)]));
  const length = Math.max(0, ...keys.map(key => columns[key].length));
  const rows = [];
  for (let i = 0; i < length; i += 1) {
    const row = {};
    let filled = false;
    for (const key of keys) {
      const value = (columns[key][i] || "").trim();
      if (value) {
        row[key] = value;
        filled = true;
      }
    }
    if (filled) rows.push(row);
  }
  return rows;
}

function parseCitationItems(params) {
  return collectRows(params, CITATION_KEYS).map((row, index) => {
    if (!row.title) {
      throw new DraftFieldError(`Citation ${index + 1} needs a title`);
    }
    return row;
  });
}

function parseInfoLinkItems(params) {
  return collectRows(params, LINK_KEYS).map((row, index) => {
    if (!row.href) {
      throw new DraftFieldError(`Link ${index + 1} needs a URL`);
    }
    return row.label ? { href: row.href, label: row.label } : { href: row.href };
  });
}

function parseListItems(field, params) {
  if (field === "info.citations" || field === "citations") return parseCitationItems(params);
  if (field === "info.links" || field === "links") return parseInfoLinkItems(params);
  return null;
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
  if (section === "provenance" && field === "generativeModel") {
    requireString(id, "id");
  }
  return { section, field, id, term };
}

function parseProvenanceModels(params) {
  const hosts = params.getAll("modelHost");
  const values = params.getAll("modelValue");
  const count = Math.min(hosts.length, values.length);
  const models = [];
  for (let i = 0; i < count; i += 1) {
    const host = hosts[i].trim();
    if (!host) continue;
    models.push({ host, model: values[i] ?? "" });
  }
  return models;
}

function applyProvenanceEditor(document, form) {
  let next = document;
  try {
    for (const { host, model } of form.models || []) {
      next = applyGenerativeContributorModel(next, { host, model });
    }
    if (form.reasoning !== undefined) {
      next = applyProvenanceClientSetting(next, {
        field: "reasoning",
        value: form.reasoning
      });
    }
    if (form.switch !== undefined) {
      next = applyProvenanceClientSetting(next, {
        field: "switch",
        value: form.switch
      });
    }
    if (form.collaboration !== undefined && form.collaboration !== "") {
      next = applyProvenanceCollaboration(next, {
        collaboration: form.collaboration,
        authorName: typeof form.authorName === "string" ? form.authorName : null
      });
    }
  } catch (error) {
    throw new DraftFieldError(error?.message || "Could not update provenance");
  }
  return next;
}

function publishedAddressValue(published, address) {
  if (!published || typeof published !== "object") {
    throw new DraftFieldError("There is no published wording for this field");
  }
  const { section, field, id, term } = address;
  if (section === "puzzle") {
    if (field === "title") return published.title ?? "";
    const infoValue = publishedInfoValue(published.info, field);
    if (infoValue !== undefined) return infoValue;
  }
  if (section === "cluster") {
    const cluster = findItem(published.clusters, id, ["id", "name"]);
    if (!cluster) throw new DraftFieldError("There is no published wording for this field");
    if (field === "name") return cluster.name ?? "";
    if (field === "fact") return cluster.fact ?? "";
    const infoValue = publishedInfoValue(cluster.info, field);
    if (infoValue !== undefined) return infoValue;
  }
  if (section === "term") {
    const cluster = findItem(published.clusters, id, ["id", "name"]);
    const info = cluster?.termInfo?.[term];
    if (info == null) {
      if (INFO_LIST_FIELDS.has(field)) return [];
      throw new DraftFieldError("There is no published wording for this field");
    }
    const infoValue = publishedInfoValue(info, field);
    if (infoValue !== undefined) return infoValue;
  }
  if (section === "bridge") {
    const bridge = findItem(published.bridges, id, ["id", "term"]);
    if (!bridge) throw new DraftFieldError("There is no published wording for this field");
    if (field === "term") return bridge.term ?? "";
    if (field === "fact") return bridge.fact ?? "";
    if (field === "termRole") return bridge.termRole ?? "";
    const infoValue = publishedInfoValue(bridge.info, field);
    if (infoValue !== undefined) return infoValue;
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
    if (field === "credit") return intro.credit ?? "";
    if (field === "links") return authoredLearningLinks(intro);
  }
  if (section === "provenance") {
    if (field === "collaboration") return published.provenance?.collaboration ?? "";
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
    else applyInfoField(next, "info", field, value);
    return next;
  }

  if (section === "cluster") {
    const cluster = requireItem(next.clusters, id, ["id", "name"], "cluster");
    if (field === "name") cluster.name = value;
    else if (field === "fact") cluster.fact = value;
    else applyInfoField(cluster, "info", field, value);
    return next;
  }

  if (section === "term") {
    const cluster = requireItem(next.clusters, id, ["id", "name"], "cluster");
    if (!cluster.termInfo || typeof cluster.termInfo !== "object") cluster.termInfo = {};
    applyInfoField(cluster.termInfo, term, field, value);
    if (cluster.termInfo[term] === undefined) delete cluster.termInfo[term];
    if (!Object.keys(cluster.termInfo).length) delete cluster.termInfo;
    return next;
  }

  if (section === "bridge") {
    const bridge = requireItem(next.bridges, id, ["id", "term"], "bridge");
    if (field === "term") bridge.term = value;
    else if (field === "fact") bridge.fact = value;
    else if (field === "termRole") {
      const role = typeof value === "string" ? value.trim() : "";
      if (!role) {
        delete bridge.termRole;
      } else if (!VALID_TERM_ROLES.has(role)) {
        throw new DraftFieldError(`termRole must be ${[...VALID_TERM_ROLES].join(" or ")}`);
      } else {
        bridge.termRole = role;
        if (role === "connector") {
          const stripped = stripConnectorReferenceSurfaces(bridge.info);
          if (stripped === undefined) delete bridge.info;
          else bridge.info = stripped;
        }
      }
    }
    else applyInfoField(bridge, "info", field, value);
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

  if (section === "provenance") {
    if (field === "editor") {
      return applyProvenanceEditor(next, form);
    }
    if (field === "collaboration") {
      try {
        return applyProvenanceCollaboration(next, {
          collaboration: value,
          authorName: typeof form.authorName === "string" ? form.authorName : null
        });
      } catch (error) {
        throw new DraftFieldError(error?.message || "Could not set collaboration");
      }
    }
    if (field === "generativeModel") {
      try {
        return applyGenerativeContributorModel(next, {
          host: id,
          model: typeof value === "string" ? value : ""
        });
      } catch (error) {
        throw new DraftFieldError(error?.message || "Could not set generative model");
      }
    }
    if (field === "reasoning" || field === "switch") {
      try {
        return applyProvenanceClientSetting(next, {
          field,
          value: typeof value === "string" ? value : ""
        });
      } catch (error) {
        throw new DraftFieldError(error?.message || `Could not set ${field}`);
      }
    }
    return next;
  }

  const intro = ensureLearningIntro(next);
  if (field === "title") intro.title = value;
  else if (field === "summary") intro.summary = value;
  else if (field === "credit") {
    if (value) intro.credit = value;
    else delete intro.credit;
  } else if (field === "content.text") {
    if (!intro.content || typeof intro.content !== "object") intro.content = {};
    intro.content.text = decodeAuthoredEscapedNewlines(value);
  } else if (field === "links") {
    if (Array.isArray(value) && value.length) intro.links = value;
    else delete intro.links;
    delete intro.sources;
  }
  return next;
}

export function applyDraftFieldEdit(document, form, { publishedDocument = null } = {}) {
  const address = parseAddress(form);
  if (form.isRevertField || form.isRevert || form.confirm === REVERT_FIELD_CONFIRM) {
    if (address.field === "info.links") {
      if (!publishedDocument || typeof publishedDocument !== "object") {
        throw new DraftFieldError("There is no published wording for this field");
      }
      const next = cloneDocument(document);
      const publishedInfo = publishedInfoObject(publishedDocument, address);
      if (address.section === "puzzle") {
        assignInfoLinks(next, "info", null, publishedInfo);
      } else if (address.section === "cluster") {
        assignInfoLinks(
          requireItem(next.clusters, address.id, ["id", "name"], "cluster"),
          "info", null, publishedInfo
        );
      } else if (address.section === "term") {
        const cluster = requireItem(next.clusters, address.id, ["id", "name"], "cluster");
        if (!cluster.termInfo || typeof cluster.termInfo !== "object") cluster.termInfo = {};
        assignInfoLinks(cluster.termInfo, address.term, null, publishedInfo);
        if (cluster.termInfo[address.term] === undefined) delete cluster.termInfo[address.term];
        if (!Object.keys(cluster.termInfo).length) delete cluster.termInfo;
      } else if (address.section === "bridge") {
        assignInfoLinks(
          requireItem(next.bridges, address.id, ["id", "term"], "bridge"),
          "info", null, publishedInfo
        );
      }
      return next;
    }
    const value = publishedAddressValue(publishedDocument, address);
    return applyDraftFieldValue(document, form, value);
  }
  if (isListField(form.field) && Array.isArray(form.items)) {
    return applyDraftFieldValue(document, form, form.items);
  }
  return applyDraftFieldValue(document, form, typeof form.value === "string" ? form.value : "");
}

export function parseFieldEditForm(params) {
  const confirm = params.get("confirm");
  const expectedRevision = Number.parseInt(params.get("expected_revision"), 10);
  const field = params.get("field") || "";
  return {
    confirm,
    isSaveField: confirm === SAVE_FIELD_CONFIRM,
    isRevertField: confirm === REVERT_FIELD_CONFIRM,
    expectedRevision: Number.isInteger(expectedRevision) ? expectedRevision : null,
    section: params.get("section") || "",
    id: params.get("id") || "",
    term: params.get("term") || "",
    field,
    value: params.get("value") ?? "",
    authorName: params.get("authorName") || "",
    collaboration: params.has("collaboration") ? (params.get("collaboration") || "") : undefined,
    reasoning: params.has("reasoning") ? (params.get("reasoning") || "") : undefined,
    switch: params.has("switch")
      ? (params.get("switch") || "")
      : params.has("speed")
        ? (params.get("speed") === "fast" ? "fast" : "")
        : undefined,
    models: parseProvenanceModels(params),
    items: isListField(field) ? parseListItems(field, params) : null
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
  const document = applyDraftFieldEdit(
    documentForEditor(draft.document),
    form,
    { publishedDocument }
  );
  return saveDraft({
    document,
    expectedRevision: form.expectedRevision
  });
}

/**
 * @param {{
 *   draft: { document: object, revision?: number },
 *   expectedRevision: number,
 *   saveDraft: (args: { document: object, expectedRevision: number }) => unknown
 * }} args
 */
export async function persistDraftCanonicalForm({
  draft,
  expectedRevision,
  saveDraft
}) {
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
    throw new DraftFieldError("expected_revision must be a positive integer");
  }
  if (!draft?.document) throw new DraftFieldError("Draft has no document");
  const document = documentForEditor(draft.document);
  if (JSON.stringify(document) === JSON.stringify(draft.document)) {
    return { unchanged: true };
  }
  const saved = await saveDraft({ document, expectedRevision });
  return { unchanged: false, saved };
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
