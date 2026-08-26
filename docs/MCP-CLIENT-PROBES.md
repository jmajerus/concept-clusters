# MCP client identity probes

Use this when calibrating authorship attribution: which identity each MCP
host sends in the call frame (`clientInfo`, `_meta`, HTTP headers), not the
language model name.

## Capture workflow

1. Start from a clean stdio slate: `npm run dev` (runs `mcp:prune` first) or
   `npm run mcp:prune` before connecting clients.
2. Connect one client at a time.
3. Ask that client to call **`probe_mcp_client`** with a label:

   ```json
   { "label": "cursor" }
   ```

4. Repeat for each host (labels below).
5. Summarize local captures:

   ```sh
   npm run mcp:probe-report
   ```

Local stdio probes append to gitignored `.mcp-client-probes.jsonl` and also
log one JSON line to stderr (`[mcp-client-probe] …`). Hosted probes return the
same JSON in the tool result; stderr appears in Wrangler logs when applicable.

## Clients to probe

| Label | Transport | Where it connects | Config / entry |
|---|---|---|---|
| `cursor` | stdio | `concept-clusters-local` | [`.cursor/mcp.json`](../.cursor/mcp.json) |
| `codex` | stdio | `concept-clusters` | [`.codex/config.toml`](../.codex/config.toml) |
| `claude-code` | stdio | project or user MCP | Claude Code MCP settings (stdio → `tools/mcp-server.mjs`) |
| `gemini` / `gemini-cli` | stdio | user MCP | Gemini CLI MCP config (stdio → `tools/mcp-server.mjs`) |
| `copilot` | stdio | VS Code Copilot MCP | Copilot MCP settings (stdio → `tools/mcp-server.mjs`) |
| `claude-web` | hosted HTTP | `concept-clusters-authoring` | Claude web custom connector → `https://concept-clusters-authoring.jmajerus.workers.dev/mcp` |

### Cursor

Reload MCP after code changes (**Cursor Settings → MCP → restart** the server).
Then in chat:

> Call `probe_mcp_client` with `{ "label": "cursor" }`.

### Codex

Ensure Codex points at this repo's stdio server (see `.codex/config.toml`).
In a Codex session:

> Call `probe_mcp_client` with `{ "label": "codex" }`.

### Claude Code

Register the same stdio command as Cursor (`node tools/mcp-server.mjs` from
this repo). Then:

> Call `probe_mcp_client` with `{ "label": "claude-code" }`.

### Gemini CLI

Register stdio MCP per [Gemini CLI MCP docs](MCP-CLIENTS.md#gemini-cli).
Then:

> Call `probe_mcp_client` with `{ "label": "gemini" }`.

### GitHub Copilot

Register the same stdio command. Then:

> Call `probe_mcp_client` with `{ "label": "copilot" }`.

### Claude Web (hosted)

Connect the remote custom connector documented in [MCP-CLIENTS.md](MCP-CLIENTS.md).
Complete Cloudflare Access OAuth. Then:

> Call `probe_mcp_client` with `{ "label": "claude-web" }`.

Copy the `probe` object from the tool result; it is not written to the local
`.mcp-client-probes.jsonl` file. After deploying the Worker that forwards the
MCP handler `ctx` (see below), expect `http` and usually `mcpReq.method` to
populate on this path.

## Observed local captures (2026-08-26)

| Label | `clientVersion` | Notes |
|---|---|---|
| `cursor` | `cursor-vscode` @ `1.0.0` | Host identity only |
| `codex` | `codex-mcp-client` / title **Codex** @ `0.149.0-alpha.4.3` | Host identity only |
| `gemini` | `gemini-cli-mcp-client` @ `0.56.0` | Host identity only |
| `claude-code` | `mcp-call` @ `1` | Same as harness — re-probe from the real client |
| `copilot` | `mcp-call` @ `1` | Same as harness — re-probe from the real client |
| `harness` | `mcp-call` @ `1` | Control from `tools/mcp-call.mjs` |

Across those captures, `mcpReq.envelope` / `meta` were null and no model name
appeared. Early probes also had `mcpReq.method` null because of a server bug
(fixed; re-probe after reload/redeploy).

### Hosted `claude-web` null `http` / `mcpReq`

Claude Web correctly reported `http: null` and empty `mcpReq` on the first
hosted capture. That was **not** primarily Cloudflare's stateless lane hiding
headers. Our analytics wrapper (`track`) and error wrapper (`safe`) only
forwarded tool `args` and dropped the SDK's second `ServerContext` argument,
so `probe_mcp_client` never saw `ctx.http.req` or `ctx.mcpReq` on any
transport — including Cursor stdio. `clientVersion` could still populate on
long-lived stdio via `initialize` + `getClientVersion()`.

Fix: forward `(args, ctx)` through `track` / `safe`. Redeploy hosted MCP, then
re-call `probe_mcp_client` with `{ "label": "claude-web" }`.

## What the probe returns

```json
{
  "capturedAt": "2026-08-25T…",
  "transport": "stdio",
  "label": "cursor",
  "actor": { "subject": "…", "email": "…", "name": "…" },
  "clientVersion": { "name": "…", "version": "…", "title": "…" },
  "mcpReq": {
    "method": "tools/call",
    "envelope": { "io.modelcontextprotocol/clientInfo": { … } },
    "meta": { … }
  },
  "http": { "user-agent": "…" }
}
```

- **`clientVersion`** / **`envelope`**: self-reported MCP client (usually the
  host app, not the model).
- **`meta`**: vendor-specific keys the host put on `_meta`.
- **`actor`**: Cloudflare Access identity on hosted MCP; local stdio owner
  from D1 config (`AUTHORING_OWNER_SUBJECT` / `CF_ACCESS_JWT`).
- **`http`**: present on hosted HTTP only (after the `ctx`-forwarding fix).

Expect hosts to identify themselves differently. The goal is to record what
each actually sends before designing automatic assistance metadata.

## Related scripts

| Script | Purpose |
|---|---|
| `npm run mcp:prune` | Stop extra stdio servers; keep newest |
| `npm run mcp:probe-report` | Summarize `.mcp-client-probes.jsonl` |
| `node tools/mcp-call.mjs probe_mcp_client '{"label":"harness"}'` | One-shot stdio probe from terminal |
