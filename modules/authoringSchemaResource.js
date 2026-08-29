import * as z from "zod/v4";
import { SimplifiedPuzzleInputSchema } from "./simplifiedPuzzleSchema.js";

// Bumped whenever the discoverable MCP authoring contract changes. This gives
// reconnecting clients a visible cache-invalidation signal in addition to the
// new tool/resource listing.
export const AUTHORING_MCP_SERVER_VERSION = "1.8.6";
export const SIMPLIFIED_PUZZLE_SCHEMA_VERSION = "1";
export const AUTHORING_PHASES = Object.freeze([
  "complete",
  "core",
  "review",
  "pedagogy",
  "publication"
]);
export const SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI =
  "concept-clusters://schemas/simplified-puzzle-v1";
export const SIMPLIFIED_PUZZLE_SCHEMA_MIME_TYPE = "application/schema+json";
export const SIMPLIFIED_PUZZLE_SCHEMA = Object.freeze({
  ...z.toJSONSchema(SimplifiedPuzzleInputSchema, {
    target: "draft-2020-12",
    // Describe what authors may submit, not the post-parse result in which
    // Zod defaults (such as bridges: []) have already been materialized.
    io: "input"
  }),
  $id: "https://concept-clusters.org/schemas/simplified-puzzle-v1.json"
});
export const SIMPLIFIED_PUZZLE_SCHEMA_TEXT =
  JSON.stringify(SIMPLIFIED_PUZZLE_SCHEMA, null, 2);

const PHASE_FIELDS = Object.freeze({
  core: Object.freeze({
    root: ["id", "title", "category", "info", "clusters", "bridges"],
    clusters: ["id", "name", "fact", "seeds", "floatingTerms", "terms", "termInfo", "info"],
    bridges: ["id", "term", "clusters", "fact", "info", "termRole"]
  }),
  review: Object.freeze({
    root: ["clusters", "bridges"],
    clusters: ["id", "name", "fact", "seeds", "floatingTerms", "terms", "termInfo", "info"],
    bridges: [
      "id", "term", "clusters", "fact", "info", "conceptId", "termRole",
      "relationKind", "direction", "idealTerms"
    ]
  }),
  pedagogy: Object.freeze({
    root: ["lenses", "lensMode", "preSolve", "learningIntroduction"]
  }),
  publication: Object.freeze({
    root: [
      "categories", "subcategories", "tags", "level", "relatedPuzzles",
      "generativeAssistance", "provenance", "creator", "license", "derivedFrom",
      "dateCreated", "dateModified", "language", "version"
    ]
  })
});

function pickProperties(properties, names) {
  return Object.fromEntries(names
    .filter(name => Object.hasOwn(properties, name))
    .map(name => [name, structuredClone(properties[name])]));
}

function phaseSchema(phase) {
  const fields = PHASE_FIELDS[phase];
  const schema = structuredClone(SIMPLIFIED_PUZZLE_SCHEMA);
  schema.title = `Simplified puzzle ${phase} authoring projection`;
  schema.description =
    "A field projection for one authoring phase, not a standalone puzzle schema. " +
    "Apply these fields to the current accumulated draft and preserve all other fields. " +
    `Use ${SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI} or phase=complete for final validation.`;
  schema.properties = pickProperties(schema.properties, fields.root);
  schema.required = phase === "core"
    ? schema.required.filter(name => fields.root.includes(name))
    : [];
  // Fields owned by other phases remain valid in the accumulated document and
  // must never be removed merely because this focused view omits them.
  schema.additionalProperties = true;

  for (const collection of ["clusters", "bridges"]) {
    if (!fields[collection] || !schema.properties[collection]?.items?.properties) continue;
    const itemSchema = schema.properties[collection].items;
    itemSchema.properties = pickProperties(itemSchema.properties, fields[collection]);
    itemSchema.required = itemSchema.required.filter(name => fields[collection].includes(name));
    itemSchema.additionalProperties = true;
  }

  return schema;
}

export function simplifiedPuzzleSchemaResult(phase = "complete") {
  if (phase !== "complete") {
    return {
      format: "simplified-puzzle",
      version: SIMPLIFIED_PUZZLE_SCHEMA_VERSION,
      phase,
      complete: false,
      preserveExisting: true,
      resourceUri: SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI,
      schemaId: SIMPLIFIED_PUZZLE_SCHEMA.$id,
      schema: phaseSchema(phase)
    };
  }
  return {
    format: "simplified-puzzle",
    version: SIMPLIFIED_PUZZLE_SCHEMA_VERSION,
    resourceUri: SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI,
    schemaId: SIMPLIFIED_PUZZLE_SCHEMA.$id,
    schema: SIMPLIFIED_PUZZLE_SCHEMA
  };
}
