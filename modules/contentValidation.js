import { IDENTITY_COLOR_KEY_SET } from "./colorPalette.js";
import { validateGenerativeAssistance } from "./generativeAssistance.js";
import { validatePuzzleLenses } from "./lensValidation.js";

export const VALID_RELATION_KINDS = new Set([
  "dynamic", "foundation", "cross-cutting", "contrast", "continuity", "evaluation"
]);

export const VALID_BRIDGE_DIRECTIONS = new Set([
  "undirected", "through", "bidirectional", "outward", "inward"
]);

function linkErrors(label, value) {
  if (!value || value.startsWith("wiki:") || /^https?:\/\//.test(value)) return [];
  return [`${label}: "${value}" is neither "wiki:Title" nor a full http(s) URL (missing the "wiki:" prefix?)`];
}

// Unlike seeAlso, a citation is always a structured object -- there's
// no bare-string shorthand for a formal footnote -- and always needs
// at least a title. Everything else is optional. Shared by puzzle info
// and learningIntroduction.citations so both surfaces stay in lockstep.
export function validateCitations(raw, label = "citations") {
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.length === 0) {
    return [`${label} must be a non-empty array when present`];
  }
  const errors = [];
  raw.forEach((citation, index) => {
    const citationLabel = `${label}[${index}]`;
    if (!citation || typeof citation !== "object" || Array.isArray(citation)) {
      errors.push(`${citationLabel} must be an object`);
      return;
    }
    if (typeof citation.title !== "string" || !citation.title.trim()) {
      errors.push(`${citationLabel}.title must be a non-empty string`);
    }
    for (const key of ["author", "publisher", "year", "pages"]) {
      if (citation[key] !== undefined &&
          (typeof citation[key] !== "string" || !citation[key].trim())) {
        errors.push(`${citationLabel}.${key} must be a non-empty string when present`);
      }
    }
    if (citation.url !== undefined) {
      if (typeof citation.url !== "string" || !citation.url.trim()) {
        errors.push(`${citationLabel}.url must be a non-empty string when present`);
      } else {
        errors.push(...linkErrors(`${citationLabel}.url`, citation.url));
      }
    }
  });
  return errors;
}

export function validateInfo(raw, label = "info", { requireObject = false } = {}) {
  if (raw === undefined) return [];
  if (!raw || (requireObject && typeof raw === "string") ||
      (typeof raw !== "string" && (typeof raw !== "object" || Array.isArray(raw)))) {
    return [`${label} must use the { text, link, extraLink } shape`];
  }
  if (typeof raw === "string") return [];
  const errors = [];
  if (raw.text !== undefined &&
      (typeof raw.text !== "string" || !raw.text.trim())) {
    errors.push(`${label}.text must be a non-empty string when present`);
  }
  for (const key of ["link", "extraLink"]) {
    if (raw[key] !== undefined &&
        (typeof raw[key] !== "string" || !raw[key].trim())) {
      errors.push(`${label}.${key} must be a non-empty string when present`);
    } else {
      errors.push(...linkErrors(`${label}.${key}`, raw[key]));
    }
  }
  errors.push(...validateCitations(raw.citations, `${label}.citations`));
  return errors;
}

export function validatePuzzleContent(puzzle, { knownPuzzleIds = null } = {}) {
  const errors = [];
  const fail = message => errors.push(message);
  if (!puzzle || typeof puzzle !== "object" || Array.isArray(puzzle)) {
    return ["puzzle must be an object"];
  }
  if (typeof puzzle.id !== "string" || !puzzle.id.trim()) fail("missing id");
  if (typeof puzzle.title !== "string" || !puzzle.title.trim()) fail("missing title");
  if (typeof puzzle.category !== "string" || !puzzle.category.trim()) fail("missing category");
  if (puzzle.subcategories !== undefined) {
    if (!puzzle.subcategories || typeof puzzle.subcategories !== "object" ||
        Array.isArray(puzzle.subcategories)) {
      fail("subcategories must be an object keyed by category");
    } else {
      for (const [category, id] of Object.entries(puzzle.subcategories)) {
        if (!category.trim()) fail("subcategories keys must be non-empty category names");
        if (typeof id !== "string" || !id.trim()) {
          fail(`subcategories.${category || "(empty)"} must be a non-empty string`);
        }
      }
    }
  }
  // Deliberately informal (no vocabulary/registry, no uniqueness check),
  // mirroring relatedPuzzles.entries[].via -- but unlike via, tags feed
  // directly into search matching (tag.toLowerCase()), so elements must
  // actually be strings or that call throws, not just look untidy.
  if (puzzle.tags !== undefined) {
    if (!Array.isArray(puzzle.tags) || puzzle.tags.length === 0) {
      fail("tags must be a non-empty array when present");
    } else if (puzzle.tags.some(tag => typeof tag !== "string" || !tag.trim())) {
      fail("tags must contain only non-empty strings");
    }
  }
  errors.push(...validateGenerativeAssistance(puzzle.generativeAssistance));
  if (!Array.isArray(puzzle.clusters)) return [...errors, "clusters must be an array"];
  if (!Array.isArray(puzzle.bridges)) return [...errors, "bridges must be an array"];
  if (puzzle.clusters.length < 2 || puzzle.clusters.length > 6) {
    fail(`bad cluster count (${puzzle.clusters.length})`);
  }
  const totalNodes = puzzle.clusters.reduce(
    (sum, cluster) => sum + (Array.isArray(cluster?.terms) ? cluster.terms.length : 0),
    0
  ) + puzzle.bridges.length;
  const nodeCap = puzzle.large ? 24 : 16;
  if (totalNodes > nodeCap) {
    fail(`too many total nodes (${totalNodes}, cap is ${nodeCap}${puzzle.large ? "" : " -- consider `large: true` for more room, or splitting into relatedPuzzles"})`);
  }
  errors.push(...validateInfo(puzzle.info));

  if (puzzle.relatedPuzzles !== undefined) {
    const related = puzzle.relatedPuzzles;
    if (!related || typeof related !== "object" || Array.isArray(related)) {
      fail("relatedPuzzles must be an object");
    } else {
      errors.push(...validateInfo(related.info, "relatedPuzzles.info"));
      const seen = new Set();
      if (!Array.isArray(related.entries)) {
        fail("relatedPuzzles.entries must be an array");
      } else {
        related.entries.forEach((entry, index) => {
          const label = `relatedPuzzles.entries[${index}]`;
          if (!entry?.id) return fail(`${label}: missing id`);
          if (entry.id === puzzle.id) fail(`${label}: lists itself ("${entry.id}")`);
          if (seen.has(entry.id)) fail(`relatedPuzzles: "${entry.id}" listed more than once`);
          seen.add(entry.id);
          if (knownPuzzleIds && !knownPuzzleIds.has(entry.id)) {
            fail(`${label}: "${entry.id}" is not a real puzzle id`);
          }
          if (typeof entry.reason !== "string" || !entry.reason.trim()) {
            fail(`${label} ("${entry.id}"): missing reason`);
          }
          if (entry.via !== undefined &&
              (!Array.isArray(entry.via) || entry.via.length === 0)) {
            fail(`${label} ("${entry.id}"): via must be a non-empty array when present`);
          }
        });
      }
    }
  }

  const allTerms = new Set();
  const usedColors = new Set();
  puzzle.clusters.forEach((cluster, clusterIndex) => {
    const label = cluster?.name || `clusters[${clusterIndex}]`;
    if (!cluster || typeof cluster !== "object" || Array.isArray(cluster)) {
      fail(`${label}: cluster must be an object`);
      return;
    }
    if (typeof cluster.name !== "string" || !cluster.name.trim()) fail(`${label}: missing name`);
    if (!Array.isArray(cluster.terms)) {
      fail(`${label}: terms must be an array`);
      return;
    }
    if (cluster.terms.length < 3 || cluster.terms.length > 6) {
      fail(`${label}: bad terms count (${cluster.terms.length})`);
    }
    if (!Array.isArray(cluster.seeds) || cluster.seeds.length !== 2) {
      fail(`${label}: bad seeds count (${cluster.seeds?.length ?? 0})`);
    }
    if (!IDENTITY_COLOR_KEY_SET.has(cluster.color)) {
      fail(`${label}: unknown cluster color "${cluster.color}"`);
    } else if (usedColors.has(cluster.color)) {
      fail(`${label}: cluster color "${cluster.color}" is already used in this puzzle`);
    }
    usedColors.add(cluster.color);
    for (const seed of cluster.seeds || []) {
      if (!cluster.terms.includes(seed)) fail(`${label}: seed "${seed}" not in terms`);
    }
    for (const term of cluster.terms) {
      if (typeof term !== "string" || !term.trim()) fail(`${label}: terms must be non-empty strings`);
      if (allTerms.has(term)) fail(`duplicate term across clusters: "${term}"`);
      allTerms.add(term);
    }
    if (cluster.termInfo && typeof cluster.termInfo === "object") {
      for (const [term, info] of Object.entries(cluster.termInfo)) {
        if (!cluster.terms.includes(term)) fail(`${label}: termInfo key "${term}" is not one of its terms`);
        errors.push(...validateInfo(info, `${label}.termInfo.${term}`));
      }
    }
    errors.push(...validateInfo(cluster.info, `${label}.info`));
  });

  for (const [bridgeIndex, bridge] of puzzle.bridges.entries()) {
    const label = bridge?.term || `bridges[${bridgeIndex}]`;
    if (!bridge || typeof bridge !== "object" || Array.isArray(bridge)) {
      fail(`${label}: bridge must be an object`);
      continue;
    }
    if (typeof bridge.term !== "string" || !bridge.term.trim()) fail(`${label}: missing term`);
    if (allTerms.has(bridge.term)) fail(`bridge term duplicates a cluster term: "${bridge.term}"`);
    errors.push(...validateInfo(bridge.info, `${label}.info`));
    if (bridge.conceptId !== undefined &&
        (typeof bridge.conceptId !== "string" || !bridge.conceptId.trim())) {
      fail(`${label}: conceptId must be a non-empty string`);
    }
    if (bridge.relationKind !== undefined &&
        !VALID_RELATION_KINDS.has(bridge.relationKind)) {
      fail(`${label}: unknown relationKind "${bridge.relationKind}"`);
    }
    const clusterIndices = Array.isArray(bridge.clusters) ? bridge.clusters : [];
    if (clusterIndices.length < 2 || clusterIndices.length > 3) {
      fail(`${label}: bridges must name 2 or 3 clusters`);
      continue;
    }
    const seen = new Set();
    clusterIndices.forEach(index => {
      if (!Number.isInteger(index) || index < 0 || index >= puzzle.clusters.length) {
        fail(`${label}: bad bridge cluster index ${JSON.stringify(index)}`);
      }
      if (seen.has(index)) fail(`${label}: duplicate bridge cluster index ${index}`);
      seen.add(index);
    });

    if (bridge.direction !== undefined) {
      if (!bridge.direction || typeof bridge.direction !== "object" ||
          Array.isArray(bridge.direction)) {
        fail(`${label}: direction must be an object with a valid kind`);
      } else if (clusterIndices.length !== 2) {
        fail(`${label}: direction is currently supported only for binary bridges`);
      } else {
        const { kind, from, to } = bridge.direction;
        if (!VALID_BRIDGE_DIRECTIONS.has(kind)) {
          fail(`${label}: unknown direction kind "${kind}"`);
        } else if (kind === "through") {
          if (!Number.isInteger(from) || !Number.isInteger(to)) {
            fail(`${label}: through direction requires integer from and to cluster indices`);
          } else {
            if (from === to) fail(`${label}: direction.from and direction.to must differ`);
            if (!clusterIndices.includes(from)) fail(`${label}: direction.from ${from} is not one of its bridge clusters`);
            if (!clusterIndices.includes(to)) fail(`${label}: direction.to ${to} is not one of its bridge clusters`);
          }
        } else if (from !== undefined || to !== undefined) {
          fail(`${label}: only through direction may specify from or to`);
        }
      }
    }

    if (bridge.idealTerms !== undefined) {
      if (!Array.isArray(bridge.idealTerms) ||
          bridge.idealTerms.length !== clusterIndices.length) {
        fail(`${label}: idealTerms must have one entry per bridge cluster`);
        continue;
      }
      bridge.idealTerms.forEach((term, index) => {
        if (term === null) return;
        const cluster = puzzle.clusters[clusterIndices[index]];
        if (!cluster || !cluster.terms?.includes(term)) {
          fail(`${label}: idealTerms[${index}] "${term}" is not a term of cluster ${clusterIndices[index]}`);
        }
      });
    }
  }

  errors.push(...validatePuzzleLenses(puzzle));
  return errors;
}

// A meta catalogue (kind: "meta") is an ordinary catalogue whose entries
// are other catalogues' ids instead of puzzle ids -- pass catalogueIds
// (every non-meta catalogue id currently registered) to resolve those; the
// one-level-deep cap (a meta catalogue's entries must themselves be
// non-meta) and self-reference are checked here too, since both are just
// as much "does this entry resolve to a valid target" as membership is.
// puzzleIds/catalogueIds are both optional the same way -- a caller
// validating shape only, with no registry to check against, gets neither.
export function validateCatalogueContent(catalogue, {
  puzzleIds = null,
  catalogueIds = null,
  metaCatalogueIds = null
} = {}) {
  const errors = [];
  if (!catalogue || typeof catalogue !== "object" || Array.isArray(catalogue)) {
    return ["must be an object"];
  }
  if (typeof catalogue.id !== "string" || !catalogue.id.trim()) {
    errors.push("id must be a non-empty string");
  }
  if (typeof catalogue.title !== "string" || !catalogue.title.trim()) {
    errors.push("title must be a non-empty string");
  }
  const isMeta = catalogue.kind === "meta";
  if (catalogue.kind !== undefined && !isMeta) {
    errors.push('kind must be "meta" when present');
  }
  if (catalogue.showInLibrary !== undefined && typeof catalogue.showInLibrary !== "boolean") {
    errors.push("showInLibrary must be a boolean when present");
  }
  errors.push(...validateInfo(catalogue.info, "info", { requireObject: true }));
  if (!Array.isArray(catalogue.entries) || catalogue.entries.length === 0) {
    errors.push("entries must be a non-empty array");
    return errors;
  }
  const seen = new Set();
  catalogue.entries.forEach((entry, index) => {
    const label = `entries[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry) ||
        typeof entry.id !== "string" || !entry.id.trim()) {
      errors.push(`${label}: id must be a non-empty string`);
      return;
    }
    const noun = isMeta ? "catalogue" : "puzzle";
    if (seen.has(entry.id)) errors.push(`${label}: ${noun} "${entry.id}" is listed more than once`);
    seen.add(entry.id);
    if (isMeta) {
      if (entry.id === catalogue.id) {
        errors.push(`${label}: a meta catalogue cannot list itself`);
      } else if (catalogueIds && !catalogueIds.has(entry.id)) {
        errors.push(`${label}: "${entry.id}" does not resolve to exactly one catalogue`);
      } else if (metaCatalogueIds && metaCatalogueIds.has(entry.id)) {
        errors.push(`${label}: "${entry.id}" is itself a meta catalogue; meta catalogues cannot nest`);
      }
    } else if (puzzleIds && !puzzleIds.has(entry.id)) {
      errors.push(`${label}: "${entry.id}" does not resolve to exactly one puzzle`);
    }
    if (entry.reason !== undefined &&
        (typeof entry.reason !== "string" || !entry.reason.trim())) {
      errors.push(`${label}: reason must be a non-empty string when present`);
    }
  });
  return errors;
}
