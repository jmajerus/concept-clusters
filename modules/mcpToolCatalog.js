import * as z from "zod/v4";
import { nonCryptographicHash } from "./nonCryptographicHash.js";

// The chat freezes this tool's description, then the call runs live. The
// description quotes the catalog id computed from every other tool. A later
// edit to one of those tools moves the id the server returns, and the chat
// still passes the id it was shown.
export const MCP_TOOL_CATALOG_TOOL = "get_tool_catalog";

const JSON_SCHEMA_TARGET = "draft-2020-12";
const EMPTY_INPUT_SCHEMA = Object.freeze({ type: "object", properties: {} });

function advertisedInputSchema(schema) {
  if (!schema) return EMPTY_INPUT_SCHEMA;
  // Same conversion as the simplified-puzzle schema resource.
  const result = z.toJSONSchema(schema, {
    target: JSON_SCHEMA_TARGET,
    io: "input"
  });
  if (result.type !== undefined && result.type !== "object") {
    throw new Error("MCP tool input schema must be an object");
  }
  return { type: "object", ...result };
}

function contractEntry(tool) {
  const entry = {
    annotations: tool.annotations ?? null,
    description: tool.description ?? "",
    inputSchema: tool.inputSchema ?? EMPTY_INPUT_SCHEMA,
    name: tool.name,
    title: tool.title ?? null
  };
  if (tool.outputSchema) entry.outputSchema = tool.outputSchema;
  return entry;
}

export function toolCatalogId(tools) {
  const entries = tools
    .filter(tool => tool.name !== MCP_TOOL_CATALOG_TOOL)
    .map(contractEntry)
    .sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
  return nonCryptographicHash(entries);
}

// `registeredTools` is the SDK registry `tools/list` reads. This tool is
// registered after the id is computed, so its own description is not part of
// the hash.
export function toolCatalogIdFromRegistry(registeredTools) {
  return toolCatalogId(Object.entries(registeredTools)
    .filter(([, tool]) => tool.enabled !== false)
    .map(([name, tool]) => contractEntry({
      name,
      title: tool.title,
      description: tool.description,
      inputSchema: advertisedInputSchema(tool.inputSchema),
      annotations: tool.annotations,
      ...(tool.outputSchema
        ? { outputSchema: advertisedInputSchema(tool.outputSchema) }
        : {})
    })));
}

export function toolCatalogDescription(catalogId) {
  return "Report whether this chat's tool list matches the server. " +
    `This description was published with catalogId "${catalogId}". ` +
    "Call this before authoring and pass that catalogId. " +
    "interfaceCurrent true means the list matches. " +
    "interfaceCurrent false means this chat is bound to an older tool list: stop, and tell the user to sync the portal if its tool page is old, refresh the connector tool list, then start a new chat.";
}

export function catalogIdFromDescription(description) {
  const match = String(description ?? "").match(/catalogId "([^"]+)"/);
  return match ? match[1] : null;
}

export function toolCatalogReport(claimedId, currentId) {
  const interfaceCurrent = claimedId === currentId;
  return {
    summary: interfaceCurrent
      ? "This chat's tool list matches the server."
      : "This chat is bound to an older tool list. Stop. Sync the portal if its tool page is old, refresh the connector tool list, then start a new chat.",
    output: {
      catalogId: currentId,
      interfaceCurrent
    }
  };
}
