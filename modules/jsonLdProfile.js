export const CONCEPT_CLUSTERS_CONTEXT = "https://concept-clusters.org/context/v1";
export const CONTENT_SCHEMA_VERSION = "1.0";
export const JSON_LD_MEDIA_TYPE = "application/ld+json";

export const JSON_LD_TYPES = Object.freeze({
  puzzle: "Puzzle",
  cluster: "Cluster",
  bridge: "Bridge",
  lens: "Lens",
  catalogue: "Catalogue",
  catalogueEntry: "CatalogueEntry",
  catalogueBundle: "CatalogueBundle",
  category: "Category"
});

export function puzzleUrn(id) {
  return `urn:concept-clusters:puzzle:${id}`;
}

export function catalogueUrn(id) {
  return `urn:concept-clusters:catalogue:${id}`;
}

export function categoryUrn(id) {
  return `urn:concept-clusters:category:${id}`;
}

export function referenceId(value) {
  return typeof value === "string" ? value : value?.["@id"];
}

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function nonEmpty(value) {
  return typeof value === "string" && !!value.trim();
}

function validateEnvelope(document, expectedTypes) {
  const errors = [];
  if (!isObject(document)) return ["document must be a JSON object"];
  if (document["@context"] !== CONCEPT_CLUSTERS_CONTEXT) {
    errors.push(`@context must be "${CONCEPT_CLUSTERS_CONTEXT}"`);
  }
  if (document.schemaVersion !== CONTENT_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be "${CONTENT_SCHEMA_VERSION}"`);
  }
  if (!expectedTypes.includes(document["@type"])) {
    errors.push(`@type must be ${expectedTypes.map(type => `"${type}"`).join(" or ")}`);
  }
  if (!nonEmpty(document["@id"])) errors.push("@id must be a non-empty string");
  return errors;
}

export function validatePuzzleJsonLdProfile(document, { envelope = true } = {}) {
  const errors = envelope ? validateEnvelope(document, [JSON_LD_TYPES.puzzle]) : [];
  if (!isObject(document)) return errors;
  if (!nonEmpty(document.id)) errors.push("id must be a non-empty string");
  if (nonEmpty(document.id) && document["@id"] !== puzzleUrn(document.id)) {
    errors.push(`@id must be "${puzzleUrn(document.id)}"`);
  }
  if (!nonEmpty(document.title)) errors.push("title must be a non-empty string");
  if (!nonEmpty(document.category)) errors.push("category must be a non-empty string");
  if (document.subcategories !== undefined) {
    if (!isObject(document.subcategories)) {
      errors.push("subcategories must be an object keyed by category");
    } else {
      for (const [category, id] of Object.entries(document.subcategories)) {
        if (!nonEmpty(category)) errors.push("subcategories keys must be non-empty category names");
        if (!nonEmpty(id)) errors.push(`subcategories.${category || "(empty)"} must be a non-empty string`);
      }
    }
  }
  if (!Array.isArray(document.clusters)) errors.push("clusters must be an ordered array");
  if (!Array.isArray(document.bridges)) errors.push("bridges must be an ordered array");

  const clusterIds = new Set();
  for (const [index, cluster] of (document.clusters || []).entries()) {
    const label = `clusters[${index}]`;
    if (!isObject(cluster)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    const id = referenceId(cluster);
    if (!nonEmpty(id) || !id.startsWith("#")) errors.push(`${label}.@id must be a local fragment identifier`);
    if (clusterIds.has(id)) errors.push(`${label}.@id duplicates "${id}"`);
    clusterIds.add(id);
    if (cluster["@type"] !== JSON_LD_TYPES.cluster) errors.push(`${label}.@type must be "Cluster"`);
    if (!nonEmpty(cluster.id)) {
      errors.push(`${label}.id must be a non-empty string`);
    } else if (nonEmpty(id) && id !== `#${cluster.id}`) {
      // stableLocalIds() in puzzleJsonLd.js prefers an existing cluster.id on
      // every future export -- if it disagrees with @id now, a later
      // round-trip silently mints a different fragment than the one already
      // published and referenced (bridges, idealTerms, direction, any
      // external link into this puzzle). Catch the drift here, not in review.
      errors.push(`${label}.id must match "@id" (got id "${cluster.id}", @id "${id}")`);
    }
    if (!nonEmpty(cluster.name)) errors.push(`${label}.name must be a non-empty string`);
    if (!Array.isArray(cluster.terms)) errors.push(`${label}.terms must be an ordered array`);
    if (!Array.isArray(cluster.seeds)) errors.push(`${label}.seeds must be an ordered array`);
  }

  for (const [index, bridge] of (document.bridges || []).entries()) {
    const label = `bridges[${index}]`;
    if (!isObject(bridge)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    if (bridge["@type"] !== JSON_LD_TYPES.bridge) errors.push(`${label}.@type must be "Bridge"`);
    if (!nonEmpty(bridge["@id"]) || !bridge["@id"].startsWith("#")) {
      errors.push(`${label}.@id must be a local fragment identifier`);
    }
    if (!nonEmpty(bridge.id)) {
      errors.push(`${label}.id must be a non-empty string`);
    } else if (nonEmpty(bridge["@id"]) && bridge["@id"] !== `#${bridge.id}`) {
      errors.push(`${label}.id must match "@id" (got id "${bridge.id}", @id "${bridge["@id"]}")`);
    }
    if (!nonEmpty(bridge.term)) errors.push(`${label}.term must be a non-empty string`);
    if (!Array.isArray(bridge.clusters)) {
      errors.push(`${label}.clusters must be an ordered array of references`);
    } else {
      bridge.clusters.forEach((reference, refIndex) => {
        const id = referenceId(reference);
        if (!clusterIds.has(id)) errors.push(`${label}.clusters[${refIndex}] references unknown cluster "${id}"`);
      });
    }
    if (bridge.direction?.kind === "through") {
      for (const key of ["from", "to"]) {
        const id = referenceId(bridge.direction[key]);
        if (!clusterIds.has(id)) errors.push(`${label}.direction.${key} references unknown cluster "${id}"`);
      }
    }
    if (bridge.idealTerms !== undefined) {
      if (!Array.isArray(bridge.idealTerms)) {
        errors.push(`${label}.idealTerms must be an ordered array`);
      } else {
        bridge.idealTerms.forEach((entry, entryIndex) => {
          const id = referenceId(entry?.cluster);
          if (!clusterIds.has(id)) errors.push(`${label}.idealTerms[${entryIndex}] references unknown cluster "${id}"`);
          if (entry?.term !== null && !nonEmpty(entry?.term)) {
            errors.push(`${label}.idealTerms[${entryIndex}].term must be a string or null`);
          }
        });
      }
    }
  }
  return errors;
}

export function validateCatalogueJsonLdProfile(document) {
  const errors = validateEnvelope(document, [JSON_LD_TYPES.catalogue]);
  if (!isObject(document)) return errors;
  if (!nonEmpty(document.id)) errors.push("id must be a non-empty string");
  if (nonEmpty(document.id) && document["@id"] !== catalogueUrn(document.id)) {
    errors.push(`@id must be "${catalogueUrn(document.id)}"`);
  }
  if (!nonEmpty(document.title)) errors.push("title must be a non-empty string");
  if (!Array.isArray(document.entries) || !document.entries.length) {
    errors.push("entries must be a non-empty ordered array");
  } else {
    document.entries.forEach((entry, index) => {
      if (!isObject(entry) || entry["@type"] !== JSON_LD_TYPES.catalogueEntry) {
        errors.push(`entries[${index}].@type must be "CatalogueEntry"`);
      }
      const puzzleId = referenceId(entry?.puzzle);
      if (!nonEmpty(puzzleId) || !puzzleId.startsWith("urn:concept-clusters:puzzle:")) {
        errors.push(`entries[${index}].puzzle must reference a Concept Clusters puzzle URN`);
      }
    });
  }
  return errors;
}

export function validateBundleJsonLdProfile(document) {
  const errors = validateEnvelope(document, [JSON_LD_TYPES.catalogueBundle]);
  if (!isObject(document)) return errors;
  if (!Array.isArray(document["@graph"])) {
    errors.push("@graph must be an array");
    return errors;
  }
  const catalogues = document["@graph"].filter(node => node?.["@type"] === JSON_LD_TYPES.catalogue);
  if (catalogues.length !== 1) errors.push("@graph must contain exactly one Catalogue");
  for (const puzzle of document["@graph"].filter(node => node?.["@type"] === JSON_LD_TYPES.puzzle)) {
    errors.push(...validatePuzzleJsonLdProfile(puzzle, { envelope: false }).map(error => `${puzzle.id || puzzle["@id"]}: ${error}`));
  }
  return errors;
}

export function validateJsonLdProfile(document) {
  switch (document?.["@type"]) {
    case JSON_LD_TYPES.puzzle:
      return validatePuzzleJsonLdProfile(document);
    case JSON_LD_TYPES.catalogue:
      return validateCatalogueJsonLdProfile(document);
    case JSON_LD_TYPES.catalogueBundle:
      return validateBundleJsonLdProfile(document);
    default:
      return validateEnvelope(document, Object.values(JSON_LD_TYPES).filter(type =>
        [JSON_LD_TYPES.puzzle, JSON_LD_TYPES.catalogue, JSON_LD_TYPES.catalogueBundle].includes(type)
      ));
  }
}
