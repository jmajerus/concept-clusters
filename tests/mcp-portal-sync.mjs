import assert from "node:assert/strict";

import {
  portalServerForOrigin,
  portalSyncFailure,
  portalSyncReady
} from "../modules/mcpPortalSync.js";

export const name = "mcp portal sync: choose the LAN server and accept a ready catalog";

const lan = {
  id: "srv-lan",
  name: "Authoring",
  hostname: "https://authoring.majerus.us/mcp"
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
      { id: "root", hostname: "https://authoring.majerus.us/" },
      lan
    ]).id,
    "srv-lan"
  );
  assert.throws(
    () => portalServerForOrigin([other]),
    /No MCP server for authoring\.majerus\.us/
  );
  assert.throws(
    () => portalServerForOrigin([
      { id: "a", hostname: "https://authoring.majerus.us/mcp" },
      { id: "b", hostname: "https://authoring.majerus.us/other/mcp" }
    ]),
    /Several MCP servers use authoring\.majerus\.us/
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
}
