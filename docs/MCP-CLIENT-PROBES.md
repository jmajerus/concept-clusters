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

**Stdio quirk:** Codex closes the entire MCP transport when two stdio tool
calls start together. Always call `get_authoring_guidance` and
`get_authoring_schema` one after the other, not in parallel. If the transport
dies mid-session, run `npm run mcp:prune` and restart the Codex MCP connection
(reload MCP in Codex settings or start a new session) before resuming a draft.

**Network on draft writes:** Read-only tools (`get_authoring_*`, `list_*`,
`get_*`) need no outbound network. `create_puzzle_draft`, `save_puzzle_draft`,
`validate_puzzle_draft`, and publication tools call Cloudflare D1 at
`api.cloudflare.com` via repo-root `.env` (`CLOUDFLARE_ACCOUNT_ID`,
`CLOUDFLARE_API_TOKEN`, `AUTHORING_OWNER_SUBJECT`). Codex sandboxes that
traffic and will pause for network approval on the first write — approve it
(for the session if offered), then retry the same save with the same document
and `expected_revision`; nothing was persisted until the D1 call succeeds.

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
`.mcp-client-probes.jsonl` file.

## Observed captures (2026-08-26 onward, after `ctx` fix)

| Label | Transport | `clientVersion` | Extra signal | Model? |
|---|---|---|---|---|
| `cursor` | stdio | `cursor-vscode` @ `1.0.0` | `meta.progressToken` | No |
| `codex` | stdio | `codex-mcp-client` / title **Codex** | `x-codex-turn-metadata` (incl. `model`) | **Yes** (`model` in turn metadata) |
| `claude-code` | stdio | `claude-code` / title **Claude Code** | `claudecode/toolUseId` | No |
| `copilot` | stdio | `Visual Studio Code` @ `1.134.0` | `vscode.conversationId`, `vscode.requestId` | No |
| `gemini` | stdio | `gemini-cli-mcp-client` | `progressToken` | No |
| `claude-web` | hosted | `Anthropic/ClaudeAI` @ `1.0.0` | modern envelope `2026-07-28`; `http.user-agent: Claude-User`; Access email on actor/http | No |
| `muse-code` | stdio | `tbh` @ `0.1.0` | Native Muse Code runtime frame; Meta internal codename | No |
| `harness` | stdio | `mcp-call` @ `1` | control from `tools/mcp-call.mjs` | No |

### Hosted Claude Web (verified)

After forwarding `(args, ctx)` through `track` / `safe` and redeploying, Claude
Web returns a full frame: `mcpReq.method` is `tools/call`,
`envelope["io.modelcontextprotocol/clientInfo"]` is `Anthropic/ClaudeAI`,
and `http` includes `user-agent: Claude-User`, `mcp-protocol-version`, and
`cf-access-authenticated-user-email`. Actor includes Access `subject` and
`email`. No model name.

Earlier null `http` / `mcpReq` on this path was our wrappers dropping
`ServerContext`, not the Worker failing to thread the Request.

### Attribution takeaway

Map **host** from `clientVersion.name` (and vendor `_meta` / `http.user-agent`
when needed to disambiguate). The native Muse Code runtime uses Meta's exact
`tbh` codename; match that name, not a broad prefix. Only Codex is known to
expose a **model** in the call frame today.

On draft create/save, the server stamps `generativeAssistance` from that host.

### Recognition doctrine (read before adding rules)

- **Recognition is live-frame only.** The probe log (`.mcp-client-probes.jsonl`)
  is write-only telemetry; nothing reads it back. Identity is decided per call
  from `clientInfo` / `_meta` / HTTP headers against the fingerprint table in
  `modules/mcpClientIdentity.js`. There is no ingestion step, and adding one
  would promote self-declared labels into identity — do not do this.
- **Null frame, null stamp.** An unrecognized frame returns no identity and
  writes no stamp row. That is correct behavior, not a defect: the alternative
  is silent misattribution. Never add a rule that credits an anonymous or
  shared-helper frame to a specific agent, not even "temporarily" — the failure
  mode is invisible by construction (no error, no flag, wrong author).
- **Probe labels name the identified host; they are never matcher input.**
  A label records, in the matcher's own output vocabulary, which agent the
  owner verified on the other end of the captured frame. Frames are matched;
  labels are attached. Nothing may identify a call by its label.
- **Guidance stays universal; records stay author-originated.** Authoring
  guidance tells every drafting client *to* attribute, never *as whom*. Agents
  write their own `generativeAssistance` entries only.

**Host registry:** `modules/authoringHosts.js` — add a label entry here, then
add a matching fingerprint in `modules/mcpClientIdentity.js` (same `id` key).

**Credit/byline policy:** `modules/authoringSettings.js` — templates, max
length, default author, preferred render (`directed` / `compact`), and accept
patterns for known bylines (authoring-only; not ops/deploy).
The drafts page can **suggest** `learningIntroduction.credit` from those
templates (append hosts or rewrite a known variant), e.g.:

`By Cursor, with editorial direction by Jane Doe`

Corpus dry-run / apply on canonical files:

`npm run content:normalize-credits` (add `-- --write` to apply).

That names the drafting tool first and keeps the human as accountable editor
(COPE/CASRAI: AI tools are not legal authors). A second host is appended into
the host list (`By Cursor and Claude Code, with editorial direction by …`).
Humans still own and apply the field; agents must not write it.

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

On `create_puzzle_draft` / `save_puzzle_draft`, the server upserts the MCP
host into puzzle-level `provenance` (Codex may include model in the contributor
name). Scope/role/date detail that used to live in `generativeAssistance` is
stored in D1 (`draft_assistance_stamps`) on create/save when MCP identity is
recognized. Hosted MCP also writes a summary row to the authoring Analytics
Engine dataset. The drafts page
can **suggest** a `learningIntroduction.credit` line such as `By Cursor,
with editorial direction by Jane Doe`, appending another host when one is
missing. Humans still own and apply credit; the lesson byline is derived from
`provenance` when possible.

## Assistance stamp audit (D1)

Each successful MCP identity stamp on `create_puzzle_draft` / `save_puzzle_draft`
appends one row to D1 table `draft_assistance_stamps` (`record_json` holds
draft id, tool name, role, date, scopes, client system, collaboration mode).
This is audit telemetry only — not stored on the draft document itself.

Prefer a host's registered native authoring MCP server: direct tool calls retain
the host's real `clientInfo` and call metadata. `tools/mcp-call.mjs` is the
fallback for clients that cannot make those direct calls. It launches a
separate stdio client, whose default identity is deliberately generic
`mcp-call`, so it cannot receive a caller-specific stamp by itself. A calling
agent that knows its actual envelope can forward it with `--client-info` /
`--meta` or the matching
`CONCEPT_CLUSTERS_MCP_CALL_CLIENT_INFO` /
`CONCEPT_CLUSTERS_MCP_CALL_META` environment variables. The helper warns on an
unstamped create/save call; it never guesses or impersonates a client.

For isolated scripts or CI that need stable surface attribution but cannot
expose a full envelope, configure
`CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME=muse-code` outside the checkout. Do not
put this in the checkout's `.env`: any other client using that checkout would
then be misattributed as Muse Code. This form attributes the surface only;
forward the full envelope when model or reasoning metadata is available.

A host with a fixed model but no per-call model in its own protocol frame
(e.g. Kilo Code always running one configured model) can pair that with
`CONCEPT_CLUSTERS_MCP_CALL_CLIENT_MODEL=GLM 4.7 Flash`. This is the lowest
trust tier: it is the caller declaring its own model, not an observed one, so
a host's own live-frame model (Codex's turn metadata, Muse's contributor
name) always takes precedence when present. `CLIENT_MODEL` is ignored unless
`CLIENT_NAME` (or `--client-info`, where the caller can just include `model`
in that JSON) is also set — there is no host to attach a bare model claim to
otherwise. Update the environment variable when the host's model changes;
nothing here is observed or re-verified per call.

Apply migration `0008_draft_assistance_stamps` locally with
`npm run mcp:hosted:migrate:dev` (and remotely before deploy).

## Related scripts

| Script | Purpose |
|---|---|
| `npm run mcp:prune` | Stop extra stdio servers; keep newest |
| `npm run mcp:probe-report` | Summarize `.mcp-client-probes.jsonl` |
| `node tools/mcp-call.mjs probe_mcp_client '{"label":"harness"}'` | One-shot stdio probe from terminal |
| `node .agents/skills/author-puzzle/scripts/plan-split-boards.mjs --plan plans/<id>-split-plan.json --pass fit` | Emit one-board-at-a-time contract; default transport `mcp-call` |

For **split boards**, never fit or complete two boards in one MCP burst. Run the
planner once per board; obey its JSON (`steps`, `forbidden`, `stopAfter`). After
board 1 validates, re-run with `--continue --board <board-1-id>` for board 2.
