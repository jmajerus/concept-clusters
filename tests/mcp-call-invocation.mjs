import assert from "node:assert/strict";
import {
  MCP_CALL_FALLBACK_CLIENT_INFO,
  McpCallInvocationError,
  isCodexEnvironment,
  isKiloCodeEnvironment,
  parseMcpCallInvocation
} from "../modules/mcpCallInvocation.js";
import { buildStampFrame } from "../modules/provenanceStampService.js";

export const name = "mcp-call identity forwarding";

// The wrapper's job ends at the frame: provenance-mcp identifies the client
// from what is forwarded here (its conformance suite pins the matches).
function forwardedFrame(invocation) {
  return buildStampFrame({
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
  assert.deepEqual(forwardedFrame(fallback), { clientInfo: { name: "mcp-call", version: "1" } },
    "the wrapper must not claim a caller identity");

  const configuredMuse = parseMcpCallInvocation(
    ["create_puzzle_draft", '{"draft_id":"configured-muse"}'],
    { CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME: "muse-code" }
  );
  assert.deepEqual(configuredMuse.clientInfo, { name: "muse-code", version: "unknown" });
  assert.deepEqual(forwardedFrame(configuredMuse), {
    clientInfo: { name: "muse-code", version: "unknown" }
  });

  const muse = parseMcpCallInvocation(
    ["create_puzzle_draft", '{"draft_id":"forwarded-muse"}'],
    {
      CONCEPT_CLUSTERS_MCP_CALL_CLIENT_INFO:
        '{"name":"muse-spark-1.3-contributor · high","version":"1"}'
    }
  );
  assert.deepEqual(muse.args, { draft_id: "forwarded-muse" });
  assert.deepEqual(forwardedFrame(muse), {
    clientInfo: { name: "muse-spark-1.3-contributor · high", version: "1" }
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
  assert.deepEqual(forwardedFrame(kiloCode), {
    clientInfo: { name: "kilo-code", version: "unknown", model: "GLM 4.7 Flash" }
  });

  // Kilo's VS Code backend supplies stable product markers to shell commands.
  // They are a narrowly scoped fallback for the one-shot helper: native MCP
  // calls still carry the live protocol envelope and remain preferred.
  const kiloHostFallback = parseMcpCallInvocation(
    ["save_puzzle_draft", '{"draft_id":"host-kilo"}'],
    {
      KILO_APP_NAME: "kilo-code",
      KILO_APP_VERSION: "7.6.2",
      KILOCODE_FEATURE: "vscode-extension"
    }
  );
  assert.deepEqual(kiloHostFallback.clientInfo, {
    name: "kilo",
    version: "7.6.2"
  });
  assert.equal(isKiloCodeEnvironment({
    KILO_APP_NAME: "kilo-code",
    KILO_APP_VERSION: "7.6.2",
    KILOCODE_FEATURE: "vscode-extension"
  }), true);
  assert.deepEqual(forwardedFrame(kiloHostFallback), {
    clientInfo: { name: "kilo", version: "7.6.2" }
  });

  const kiloHostWithoutVersion = parseMcpCallInvocation(
    ["get_authoring_guidance"],
    { KILO_APP_NAME: "kilo-code", KILO_CLIENT: "vscode" }
  );
  assert.deepEqual(kiloHostWithoutVersion.clientInfo, {
    name: "kilo",
    version: "unknown"
  });

  const spoofedKilo = parseMcpCallInvocation(
    ["get_authoring_guidance"],
    { KILO_APP_NAME: "kilo-code" }
  );
  assert.equal(spoofedKilo.clientInfo, MCP_CALL_FALLBACK_CLIENT_INFO);
  assert.equal(isKiloCodeEnvironment({ KILO_APP_NAME: "kilo-code" }), false);

  const explicitOverrideWins = parseMcpCallInvocation(
    ["get_authoring_guidance"],
    {
      KILO_APP_NAME: "kilo-code",
      KILOCODE_FEATURE: "vscode-extension",
      CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME: "test-harness"
    }
  );
  assert.deepEqual(explicitOverrideWins.clientInfo, {
    name: "test-harness",
    version: "unknown"
  });

  // CLIENT_MODEL alone, with no CLIENT_NAME, has no host to attach to and is
  // dropped -- the call stays anonymous mcp-call, same as no override at all.
  const modelOnly = parseMcpCallInvocation(
    ["get_authoring_guidance"],
    { CONCEPT_CLUSTERS_MCP_CALL_CLIENT_MODEL: "GLM 4.7 Flash" }
  );
  assert.equal(modelOnly.clientInfo, MCP_CALL_FALLBACK_CLIENT_INFO);
  assert.deepEqual(forwardedFrame(modelOnly), { clientInfo: { name: "mcp-call", version: "1" } });

  const CODEX_THREAD = "01a0effb-98bb-7b72-adee-4f6bf38c720d";
  const codexHostFallback = parseMcpCallInvocation(
    ["create_puzzle_draft", '{"draft_id":"host-codex"}'],
    { CODEX_THREAD_ID: CODEX_THREAD }
  );
  assert.equal(isCodexEnvironment({ CODEX_THREAD_ID: CODEX_THREAD }), true);
  assert.deepEqual(codexHostFallback.clientInfo, {
    name: "codex-mcp-client",
    title: "Codex",
    version: "unknown"
  });
  assert.equal(codexHostFallback.meta, null);
  assert.deepEqual(forwardedFrame(codexHostFallback), {
    clientInfo: { name: "codex-mcp-client", title: "Codex", version: "unknown" }
  });
  assert.equal(isCodexEnvironment({ CODEX_THREAD_ID: "not-a-thread" }), false);
  assert.equal(
    parseMcpCallInvocation(["get_authoring_guidance"], { CODEX_THREAD_ID: "not-a-thread" }).clientInfo,
    MCP_CALL_FALLBACK_CLIENT_INFO
  );
  const codexExplicitWins = parseMcpCallInvocation(
    ["get_authoring_guidance"],
    {
      CODEX_THREAD_ID: CODEX_THREAD,
      CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME: "test-harness"
    }
  );
  assert.deepEqual(codexExplicitWins.clientInfo, {
    name: "test-harness",
    version: "unknown"
  });

  const codex = parseMcpCallInvocation([
    "--client-info", '{"name":"codex-mcp-client","version":"1"}',
    "--meta", '{"x-codex-turn-metadata":{"model":"gpt-5.6-sol","reasoning_effort":"high"}}',
    "get_authoring_schema", '{"phase":"core"}'
  ]);
  assert.deepEqual(codex.args, { phase: "core" });
  assert.deepEqual(forwardedFrame(codex), {
    clientInfo: { name: "codex-mcp-client", version: "1" },
    metaKeys: ["x-codex-turn-metadata"],
    meta: { "x-codex-turn-metadata": { model: "gpt-5.6-sol", reasoning_effort: "high" } }
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
