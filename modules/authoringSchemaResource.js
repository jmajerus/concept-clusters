import * as z from "zod/v4";
import {
  AUTHORING_PHASE_PASSES,
  AUTHORING_PHASES,
  MCP_EXCLUDED_ROOT_FIELDS,
  assertPhasePassesConsistent
} from "./authoringFieldOwnership.js";
import {
  AUTHORING_PROFILES,
  PUZZLE_KINDS,
  authoringProfileDescriptor
} from "./authoringProfiles.js";
import { SimplifiedPuzzleInputSchema } from "./simplifiedPuzzleSchema.js";

// Bumped whenever the discoverable MCP authoring contract changes. This gives
// reconnecting clients a visible cache-invalidation signal in addition to the
// new tool/resource listing.
export const AUTHORING_MCP_SERVER_VERSION = "1.22.0";
export const SIMPLIFIED_PUZZLE_SCHEMA_VERSION = "1";
export { AUTHORING_PHASES };
export { AUTHORING_PROFILES };
export { PUZZLE_KINDS };
export const SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI =
  "concept-clusters://schemas/simplified-puzzle-v1";
export const SIMPLIFIED_PUZZLE_SCHEMA_MIME_TYPE = "application/schema+json";
const CATEGORY_ID_SCHEMA = Object.freeze({
  type: "string",
  pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  description:
    "Stable category id (for example computer-science), not the category display title. " +
    "Legacy titles are accepted only by the server's read-compatibility layer and are converted before storage."
});
const generatedSimplifiedPuzzleSchema = z.toJSONSchema(SimplifiedPuzzleInputSchema, {
  target: "draft-2020-12",
  // Describe what authors may submit, not the post-parse result in which
  // Zod defaults (such as bridges: []) have already been materialized.
  io: "input"
});
// Zod refinements enforce this at runtime but are not expressible in the
// generated schema. Mirror the puzzleKind-specific minimum for MCP clients:
// a vocabulary-context puzzle may have one cluster; other kinds need two.
const CLUSTER_COUNT_BY_KIND = Object.freeze({
  if: {
    properties: { puzzleKind: { const: "vocabulary-context" } },
    required: ["puzzleKind"]
  },
  then: { properties: { clusters: { minItems: 1 } } },
  else: { properties: { clusters: { minItems: 2 } } }
});
// A one-cluster Vocabulary puzzle has no sorting decision: authors provide
// one flat `terms` list, omit preSolve, and cannot add a bridge. Every other
// puzzle keeps the seed/floatingTerms shape. Mirror the root Zod refinement
// here because those cross-field rules are not emitted by z.toJSONSchema().
const SINGLE_VOCABULARY_CLUSTER_SHAPE = Object.freeze({
  if: {
    properties: {
      puzzleKind: { const: "vocabulary-context" },
      clusters: { maxItems: 1 }
    },
    required: ["puzzleKind", "clusters"]
  },
  then: {
    properties: {
      clusters: {
        items: {
          required: ["terms"],
          not: {
            anyOf: [
              { required: ["seeds"] },
              { required: ["floatingTerms"] }
            ]
          }
        }
      },
      bridges: { maxItems: 0 }
    },
    not: { required: ["preSolve"] }
  },
  else: {
    properties: {
      clusters: {
        items: { required: ["seeds", "floatingTerms"] }
      }
    }
  }
});
// `large` remains an internal compatibility field on the storage/runtime
// schema, but its value is derived from node count and is not part of the
// MCP authoring contract. Keep it out of the discoverable complete schema as
// well as the focused phase projections so clients see only the real content
// limit rather than a rendering switch.
const generatedAuthoringProperties = Object.fromEntries(
  Object.entries(generatedSimplifiedPuzzleSchema.properties)
    .filter(([name]) => name !== "large" && !MCP_EXCLUDED_ROOT_FIELDS.has(name))
);
if (generatedAuthoringProperties.learningIntroduction?.properties) {
  generatedAuthoringProperties.learningIntroduction = structuredClone(
    generatedAuthoringProperties.learningIntroduction
  );
  delete generatedAuthoringProperties.learningIntroduction.properties.credit;
}
export const SIMPLIFIED_PUZZLE_SCHEMA = Object.freeze({
  ...generatedSimplifiedPuzzleSchema,
  allOf: [
    ...(generatedSimplifiedPuzzleSchema.allOf || []),
    structuredClone(CLUSTER_COUNT_BY_KIND),
    structuredClone(SINGLE_VOCABULARY_CLUSTER_SHAPE)
  ],
  description:
    "MCP agent authoring contract for puzzle content and pedagogy. A single-cluster vocabulary-context puzzle uses one flat terms list and is automatically pre-solved before its lenses. Protected attribution and human-managed editorial metadata are maintained outside this document; language remains optional authored metadata. Keep total nodes (all cluster terms plus bridges) at or below 25; split into relatedPuzzles above 25.",
  // Zod deliberately keeps these input fields permissive so a legacy title
  // can be canonicalized before parsing. The discoverable authoring contract
  // should nevertheless teach clients to send the new stable-id shape.
  properties: {
    ...generatedAuthoringProperties,
    category: CATEGORY_ID_SCHEMA,
    categories: {
      ...generatedSimplifiedPuzzleSchema.properties.categories,
      items: CATEGORY_ID_SCHEMA
    },
    subcategories: {
      ...generatedSimplifiedPuzzleSchema.properties.subcategories,
      propertyNames: CATEGORY_ID_SCHEMA
    }
  },
  $id: "https://concept-clusters.org/schemas/simplified-puzzle-v1.json"
});
export const SIMPLIFIED_PUZZLE_SCHEMA_TEXT =
  JSON.stringify(SIMPLIFIED_PUZZLE_SCHEMA, null, 2);

// Fail closed if a phase pass drifts from the ownership map.
assertPhasePassesConsistent();

function pickProperties(properties, names) {
  return Object.fromEntries(names
    .filter(name => Object.hasOwn(properties, name))
    .map(name => [name, structuredClone(properties[name])]));
}

function phaseDescription(phase, pass) {
  const base =
    "A field projection for one authoring phase, not a standalone puzzle schema. " +
    "Apply these fields to the current accumulated draft and preserve all other fields. " +
    `Use ${SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI} or phase=complete for final validation.`;
  if (pass.writeDomain) {
    return (
      `${base} This pass binds to write domain "${pass.writeDomain}": retrieve ` +
      `get_puzzle_draft with domain=${pass.writeDomain}, edit, and save that same ` +
      "domain. Do not send this phase-shaped object as a whole-domain replacement " +
      "unless it already contains every field that domain projection currently holds."
    );
  }
  return (
    `${base} The review pass is cross-domain for inspection: content fields are ` +
    "read context; bridge relationship annotations (conceptId, relationKind, " +
    "direction, idealTerms) belong to the pedagogy domain and must be saved with " +
    "domain=pedagogy after retrieving that projection. Do not save this phase " +
    "shape as a content or pedagogy domain replacement."
  );
}

function phaseSchema(phase) {
  const pass = AUTHORING_PHASE_PASSES[phase];
  if (!pass) throw new Error(`Unknown authoring phase: ${phase}`);
  const schema = structuredClone(SIMPLIFIED_PUZZLE_SCHEMA);
  schema.title = `Simplified puzzle ${phase} authoring projection`;
  schema.description = phaseDescription(phase, pass);
  schema.properties = pickProperties(schema.properties, pass.root);
  schema.required = phase === "core"
    ? schema.required.filter(name => pass.root.includes(name))
    : [];
  // Fields owned by other phases remain valid in the accumulated document and
  // must never be removed merely because this focused view omits them.
  schema.additionalProperties = true;

  for (const collection of ["clusters", "bridges"]) {
    if (!pass[collection] || !schema.properties[collection]?.items?.properties) continue;
    const itemSchema = schema.properties[collection].items;
    itemSchema.properties = pickProperties(itemSchema.properties, pass[collection]);
    itemSchema.required = itemSchema.required.filter(name => pass[collection].includes(name));
    itemSchema.additionalProperties = true;
  }

  return schema;
}

function withProfile(result, profile) {
  if (!profile) return result;
  const descriptor = authoringProfileDescriptor(profile);
  return {
    ...result,
    profile: descriptor.id,
    profileSummary: descriptor.summary,
    profileMode: descriptor.mode,
    profileStorageDomains: descriptor.storageDomains
  };
}

export function simplifiedPuzzleSchemaResult(phase = "complete", profile = null) {
  if (phase !== "complete") {
    const pass = AUTHORING_PHASE_PASSES[phase];
    if (!pass) throw new Error(`Unknown authoring phase: ${phase}`);
    return withProfile({
      format: "simplified-puzzle",
      version: SIMPLIFIED_PUZZLE_SCHEMA_VERSION,
      phase,
      complete: false,
      preserveExisting: true,
      ...(pass.writeDomain ? { domain: pass.writeDomain } : {}),
      resourceUri: SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI,
      schemaId: SIMPLIFIED_PUZZLE_SCHEMA.$id,
      schema: phaseSchema(phase)
    }, profile);
  }
  return withProfile({
    format: "simplified-puzzle",
    version: SIMPLIFIED_PUZZLE_SCHEMA_VERSION,
    resourceUri: SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI,
    schemaId: SIMPLIFIED_PUZZLE_SCHEMA.$id,
    schema: SIMPLIFIED_PUZZLE_SCHEMA
  }, profile);
}
