import assert from "node:assert/strict";

import {
  portalServerForOrigin,
  portalSyncFailure,
  portalSyncReady
} from "../modules/mcpPortalSync.js";
import { selectPortalSyncRun } from "../tools/dispatch-mcp-portal-sync.mjs";
import { listMcpServers, syncMcpPortalCatalog } from "../tools/sync-mcp-portal.mjs";

export const name = "mcp portal sync: choose the LAN server, list it, and accept a ready catalog";

const lan = {
  id: "srv-lan",
  name: "Authoring",
  hostname: "https://cc-authoring.majerus.us/mcp"
};
const other = {
  id: "srv-other",
  name: "Elsewhere",
  hostname: "https://example.com/mcp"
};

export async function run() {
  assert.equal(portalServerForOrigin([other, lan]).id, "srv-lan");
  assert.equal(
    portalServerForOrigin([
      { id: "root", hostname: "https://cc-authoring.majerus.us/" },
      lan
    ]).id,
    "srv-lan"
  );
  assert.throws(
    () => portalServerForOrigin([other]),
    /No MCP server for cc-authoring\.majerus\.us/
  );
  assert.throws(
    () => portalServerForOrigin([{ id: "root", hostname: "https://cc-authoring.majerus.us/" }]),
    /No \/mcp server for cc-authoring\.majerus\.us/
  );
  assert.throws(
    () => portalServerForOrigin([
      { id: "a", hostname: "https://cc-authoring.majerus.us/mcp" },
      { id: "b", hostname: "https://cc-authoring.majerus.us/other/mcp" }
    ]),
    /Several MCP servers use cc-authoring\.majerus\.us/
  );

  const ready = { success: true, result: { status: "ready" } };
  assert.equal(portalSyncReady(ready), true);
  assert.equal(portalSyncReady({ success: true, result: { status: "waiting" } }), false);
  assert.equal(portalSyncReady({
    success: true,
    result: { status: "ready", error: "still stale" }
  }), false);
  assert.equal(portalSyncReady({ success: false, result: { status: "ready" } }), false);
  assert.equal(
    portalSyncFailure({
      result: { status: "error", error: "upstream", error_details: { cause: "timeout" } }
    }),
    "error: upstream: timeout"
  );

  const older = {
    databaseId: 9,
    event: "workflow_dispatch",
    headBranch: "main",
    displayTitle: "Sync MCP portal earlier-id",
    createdAt: "2026-10-22T02:00:00.000Z"
  };
  const requested = {
    databaseId: 10,
    event: "workflow_dispatch",
    headBranch: "main",
    displayTitle: "Sync MCP portal this-id",
    createdAt: "2026-10-22T02:00:05.000Z"
  };
  assert.equal(selectPortalSyncRun([older, requested], "this-id").databaseId, 10);
  assert.equal(selectPortalSyncRun([older], "this-id"), null);

  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, method: options.method || "GET", authorization: options.headers?.Authorization });
    const page = new URL(url).searchParams.get("page");
    if (page === "1") {
      return jsonResponse({
        success: true,
        result: [lan],
        result_info: { total_pages: 1 }
      });
    }
    if (String(url).endsWith("/sync")) {
      return jsonResponse({ success: true, result: { status: "waiting" } });
    }
    return jsonResponse({ success: true, result: { id: lan.id, status: "ready" } });
  };
  const slept = [];
  const result = await syncMcpPortalCatalog({
    accountId: "account",
    token: "portal-token",
    fetchImpl,
    sleep: async (ms) => { slept.push(ms); },
    pollIntervalMs: 5,
    pollLimit: 3
  });
  assert.equal(result.status, "ready");
  assert.deepEqual(slept, [5]);
  assert.equal(calls[0].method, "GET");
  assert.match(calls[0].url, /\/accounts\/account\/access\/ai-controls\/mcp\/servers\?page=1&per_page=50$/);
  assert.equal(calls[1].method, "POST");
  assert.match(calls[1].url, /\/servers\/srv-lan\/sync$/);
  assert.equal(calls[2].method, "GET");
  assert.match(calls[2].url, /\/servers\/srv-lan$/);
  assert.equal(calls[0].authorization, "Bearer portal-token");

  await assert.rejects(
    () => syncMcpPortalCatalog({
      accountId: "account",
      token: "portal-token",
      fetchImpl: async () => jsonResponse({
        success: false,
        errors: [{ message: "Authentication error" }]
      }, 403),
      sleep: async () => {}
    }),
    /Authentication error/
  );

  await assert.rejects(
    () => syncMcpPortalCatalog({
      accountId: "account",
      token: "portal-token",
      fetchImpl: async (url) => {
        if (new URL(url).searchParams.get("page")) {
          return jsonResponse({ success: true, result: [lan], result_info: { total_pages: 1 } });
        }
        return jsonResponse({ success: true, result: { status: "error", error: "upstream" } });
      },
      sleep: async () => { throw new Error("an error status is not polled"); }
    }),
    /Portal catalog sync failed: error: upstream/
  );

  await assert.rejects(
    () => listMcpServers("account", "portal-token", {
      fetchImpl: async () => jsonResponse({
        success: true,
        result: [],
        result_info: { total_pages: 21 }
      })
    }),
    /past the limit of 20/
  );
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  };
}
