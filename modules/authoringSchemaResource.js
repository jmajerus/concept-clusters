import * as z from "zod/v4";
import { SimplifiedPuzzleInputSchema } from "./simplifiedPuzzleSchema.js";

// Bumped whenever the discoverable MCP authoring contract changes. This gives
// reconnecting clients a visible cache-invalidation signal in addition to the
// new tool/resource listing.
export const AUTHORING_MCP_SERVER_VERSION = "1.1.0";
export const SIMPLIFIED_PUZZLE_SCHEMA_VERSION = "1";
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

export function simplifiedPuzzleSchemaResult() {
  return {
    format: "simplified-puzzle",
    version: SIMPLIFIED_PUZZLE_SCHEMA_VERSION,
    resourceUri: SIMPLIFIED_PUZZLE_SCHEMA_RESOURCE_URI,
    schemaId: SIMPLIFIED_PUZZLE_SCHEMA.$id,
    schema: SIMPLIFIED_PUZZLE_SCHEMA
  };
}
