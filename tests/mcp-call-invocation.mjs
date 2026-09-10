import assert from "node:assert/strict";
import {
  MCP_CALL_FALLBACK_CLIENT_INFO,
  McpCallInvocationError,
  parseMcpCallInvocation
} from "../modules/mcpCallInvocation.js";
import { identifyMcpAssistanceClient } from "../modules/mcpClientIdentity.js";

export const name = "mcp-call identity forwarding";

function identifyForwarded(invocation) {
  return identifyMcpAssistanceClient({
    ctx: { mcpReq: { _meta: invocation.meta } },
    server: {
      server: { getClientVersion: () => invocation.clientInfo }
    }
  });
}

export async function run() {
  const fallback = parseMcpCallInvocation(["get_authoring_guidance"], {});
  assert.equal(fallback.toolName, "get_authoring_guidance");
  assert.deepEqual(fallback.args, {});
  assert.equal(fallback.clientInfo, MCP_CALL_FALLBACK_CLIENT_INFO);
  assert.equal(fallback.meta, null);
  assert.equal(identifyForwarded(fallback), null, "the wrapper must not claim a caller identity");

  const configuredMuse = parseMcpCallInvocation(
    ["create_puzzle_draft", '{"draft_id":"configured-muse"}'],
    { CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME: "muse-code" }
  );
  assert.deepEqual(configuredMuse.clientInfo, { name: "muse-code", version: "unknown" });
  assert.deepEqual(identifyForwarded(configuredMuse), {
    system: "Muse Code",
    hostId: "muse-code",
    clientName: "muse-code"
  });

  const muse = parseMcpCallInvocation(
    ["create_puzzle_draft", '{"draft_id":"forwarded-muse"}'],
    {
      CONCEPT_CLUSTERS_MCP_CALL_CLIENT_INFO:
        '{"name":"muse-spark-1.3-contributor · high","version":"1"}'
    }
  );
  assert.deepEqual(muse.args, { draft_id: "forwarded-muse" });
  assert.deepEqual(identifyForwarded(muse), {
    system: "Muse Code (Spark 1.3)",
    model: "Spark 1.3",
    reasoning: "high",
    hostId: "muse-code",
    clientName: "muse-spark-1.3-contributor · high"
  });

  const kiloCode = parseMcpCallInvocation(
    ["create_puzzle_draft", '{"draft_id":"configured-kilo"}'],
    {
      CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME: "kilo-code",
      CONCEPT_CLUSTERS_MCP_CALL_CLIENT_MODEL: "GLM 4.7 Flash"
    }
  );
  assert.deepEqual(kiloCode.clientInfo, {
    name: "kilo-code",
    version: "unknown",
    model: "GLM 4.7 Flash"
  });
  assert.deepEqual(identifyForwarded(kiloCode), {
    system: "Kilo Code (GLM 4.7 Flash)",
    model: "GLM 4.7 Flash",
    hostId: "kilo-code",
    clientName: "kilo-code"
  });

  // CLIENT_MODEL alone, with no CLIENT_NAME, has no host to attach to and is
  // dropped -- the call stays anonymous mcp-call, same as no override at all.
  const modelOnly = parseMcpCallInvocation(
    ["get_authoring_guidance"],
    { CONCEPT_CLUSTERS_MCP_CALL_CLIENT_MODEL: "GLM 4.7 Flash" }
  );
  assert.equal(modelOnly.clientInfo, MCP_CALL_FALLBACK_CLIENT_INFO);
  assert.equal(identifyForwarded(modelOnly), null);

  const codex = parseMcpCallInvocation([
    "--client-info", '{"name":"codex-mcp-client","version":"1"}',
    "--meta", '{"x-codex-turn-metadata":{"model":"gpt-5.6-sol","reasoning_effort":"high"}}',
    "get_authoring_schema", '{"phase":"core"}'
  ]);
  assert.deepEqual(codex.args, { phase: "core" });
  assert.deepEqual(identifyForwarded(codex), {
    system: "Codex (GPT-5.6 Sol)",
    model: "gpt-5.6-sol",
    reasoning: "high",
    hostId: "codex",
    clientName: "codex-mcp-client"
  });

  assert.throws(
    () => parseMcpCallInvocation(["--client-info", "not-json", "get_authoring_guidance"]),
    McpCallInvocationError
  );
  assert.throws(
    () => parseMcpCallInvocation(["--unknown", "get_authoring_guidance"]),
    McpCallInvocationError
  );
}
