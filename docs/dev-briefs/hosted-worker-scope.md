# Hosted Worker scope: MCP and the cron, not admin

*Status: implemented.*

The hosted authoring Worker serves two things: the `/mcp` endpoint and a
weekly wiki link-health sweep. It has no admin pages. This note records why,
because the obvious reading of the deletion — "we dropped a feature" — is the
wrong one.

## What was removed

`handleAdminRoute`, 830 of the Worker's 1226 lines. It served `/admin`,
`/admin/drafts`, `/admin/catalogues`, `/admin/categories` and
`/admin/link-health`, duplicating the LAN authoring server's request path
against the same D1 rows.

Those paths now answer **410 Gone** rather than 404, so a stale bookmark says
what happened instead of looking like an outage.

## Why

**It was a second implementation of one surface.** Both deployments run the
same rendering, diffing, editing and publication modules — 15 of their 24
imports were already shared. What was duplicated was the request layer and,
critically, the payload each route assembled for `renderDraftPage`.

**That duplication produced bugs, not just cost.** Provenance was added to the
diff on one path and not the other, so a provenance-only edit reported "No
changes from the published puzzle" and had Publish withheld — on the hosted
side only. Neither the page-renderer test nor the local mapping test could see
it; it took a third test written against the hosted route. `deriveDraftComparison`
was added to stop the two paths drifting. With one path, that class of bug is
structurally gone rather than guarded against.

**Nothing was using it.** Of 201 stamped MCP calls, 199 arrived over stdio and
2 over the hosted transport, both on one day from a client that normally runs
stdio. Every client that has ever authored — Claude Code, Muse Code, ZCode,
Kilo Code, Gemini CLI, Codex, Cursor — is a local agent. (Stamps cover writes,
not reads, so this measures authoring traffic rather than all traffic.)

## Why narrow rather than delete the Worker

Retiring it outright would have needed a tunnel and an Access rework to keep
remote MCP reachable, plus a new home for the cron. Narrowing needed neither,
keeps remote MCP available for a hosted client that may yet want it, and is a
revert away if hosted admin is ever wanted back.

## Why admin belongs on the LAN server specifically

Not git hygiene — freeze deliberately tolerates a checkout sitting on a PR
branch, resetting only `puzzles/`, `catalogues/` and `content/` from the base
ref rather than moving HEAD.

The real reasons:

- It is the deployment wired to **production D1 for human edits**, and it
  originates every administrative change. That makes it upstream of git for
  content in the same way `puzzle_drafts` is upstream of `puzzles/`.
- It is **always on and LAN-reachable**, independent of any workstation.
- Code reaches it by `git pull --ff-only` and a service restart, so it can only
  run committed, pushed code. It never pushes code: freeze writes through the
  GitHub API, so the checkout is read-only toward the remote.

A workstation instance is the same software against a local D1 copy. That is a
test rig, not a fallback — same code, different source of truth.

## What the Worker still does

- **`/mcp`** — the full 27-tool authoring surface. Not duplicated: both
  transports already share `hostedMcpAuthoringServer.js`, with stdio wrapped by
  `mcpAuthoringServer.js` for `tools/mcp-server.mjs`.
- **The weekly cron** (`0 6 * * 1`) — `scheduledLinkHealth` over `AUTHORING_DB`.
  Results are read on the LAN server's `/admin/link-health`, which already
  routes it.
- Cloudflare Access authentication and the hostname guard, both still required
  by `/mcp`.

## Consequences worth knowing

**Publishing was never available over MCP** (`submit_puzzle_for_publication`
was removed), so remote agents already could not push anything live. Narrowing
does not move the trust boundary; it moves where the human clicks Publish.

**Provenance is a protected field** that MCP cannot write, so the provenance
editor is inherently an admin-page feature and is now LAN-only by construction.

**One fewer writer to the same rows.** The Worker reached D1 through its
binding and the LAN server reaches it over the HTTP API; they were two admin
surfaces onto one dataset. There is now one.

**Lost:** `/admin` reachable off-LAN behind Cloudflare Access. Deliberate — it
was worth 2 calls a month.

## Incidental

Removing the handler took the project's `tsc` error count from 27 to 3; all 24
others were inside it. The three that remain are in
`tests/worker/model-suggestions.test.ts` and predate this change.
