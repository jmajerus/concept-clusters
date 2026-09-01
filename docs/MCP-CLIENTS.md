# Connecting AI clients to the hosted MCP server

> Last verified: August 3, 2026

Concept Clusters provides a remote Model Context Protocol (MCP) server for
AI-assisted puzzle authoring. Its URL is publicly reachable, but access is not
public: Cloudflare Access authenticates every user and admits only identities
allowed by the server's Access policy.

Use this exact Streamable HTTP endpoint:

```text
https://concept-clusters-authoring.jmajerus.workers.dev/mcp
```

Do not enter a GitHub personal access token, Cloudflare service token, or
Worker secret in an MCP client. A compatible client discovers Cloudflare's
OAuth endpoints, opens the Access sign-in page in a browser, and stores its
own OAuth token. The GitHub credential remains an encrypted Worker secret.

Model-provider API keys and MCP credentials are also separate. A provider key
authorizes inference or provider administration; it does not authorize access
to Concept Clusters. An API integration normally needs both:

1. a least-privileged model-inference key for the chosen provider; and
2. a Cloudflare Access OAuth token obtained for the signed-in author.

Never put either credential in this repository, in the MCP URL, or in prompts.
Store provider keys in the client or deployment platform's secret store. Let
an OAuth-capable MCP client acquire and refresh its own Access token.

Client menus, subscription requirements, and MCP support change relatively
quickly. Treat the steps below as a project-specific companion to the linked
vendor documentation rather than a replacement for it.

## Before connecting

You need:

- an identity permitted by the Concept Clusters Cloudflare Access policy;
- an MCP client that supports remote Streamable HTTP servers and OAuth; and
- permission in that client or workspace to add a custom MCP server.

The authentication sequence should be:

1. The client requests the `/mcp` endpoint and receives an HTTP `401` OAuth
   challenge.
2. The client discovers Cloudflare Access's authorization metadata.
3. The client opens a browser for Access sign-in.
4. After a successful policy check, the client reconnects with an OAuth access
   token.
5. Cloudflare supplies the authenticated identity assertion that the Worker
   independently verifies before exposing any tools or drafts.

A normal browser visit to the endpoint is not a useful MCP test. Use one of
the clients below so it can complete protocol negotiation and OAuth.

## Client compatibility

| Client | Suitable for this server | Current qualification |
|---|---|---|
| ChatGPT web | Yes | Full write-capable MCP is currently available to Business and Enterprise/Edu; Pro custom MCP access is limited to read/fetch capabilities. |
| Claude, Claude Desktop, and Cowork | Yes | Remote custom connectors are currently offered on Free, Pro, Max, Team, and Enterprise; Free is limited to one custom connector. |
| Gemini CLI | Yes | Supports remote HTTP MCP and automatic OAuth discovery. This does not imply equivalent support in the consumer Gemini web application. |
| Kimi Code CLI | Yes | Supports remote HTTP MCP, browser OAuth, and Kimi Platform API-key login. |
| OpenAI Responses API | Yes, for an application integration | Has a native remote-MCP tool. Use a normal project API key for inference and supply a separately acquired Access OAuth token; do not use an OpenAI admin key. |
| Anthropic Messages API | Yes, for an application integration | Has a native remote-MCP connector for tools. Use a normal workspace API key and a separately acquired Access OAuth token; do not use an Anthropic Admin API key. |
| ElevenLabs Agents | Expected | Supports Streamable HTTP MCP and OAuth auth connections. Configure through the dashboard where possible; this project has not yet completed an end-to-end test. |
| OpenRouter, DeepSeek, or Venice model API | Through an MCP-capable host or custom adapter | Their model APIs expose function/tool calling, but do not natively register an arbitrary remote MCP server. The host must run MCP and OAuth. |
| Microsoft Copilot Studio | Expected | Supports Streamable HTTP and an OAuth dynamic-discovery onboarding path; this project has not yet completed an end-to-end Copilot Studio test. |
| MCP Inspector | Yes | Best for protocol inspection, OAuth diagnosis, and direct tool testing. |

## ChatGPT

ChatGPT calls custom MCP integrations **apps**. The current full MCP workflow
is available in ChatGPT web and requires developer mode. Workspace policy and
the user's plan determine whether the authoring server's write tools can be
used.

1. Enable developer mode:
   - Business administrators can use **Settings > Apps > Advanced settings >
     Developer mode**, or begin from **Workspace settings > Apps > Create**.
   - Enterprise/Edu administrators first grant the relevant permission under
     **Permissions & Roles > Connected Data**. An authorized user then enables
     developer mode under **Settings > Apps > Advanced Settings**.
2. Open **Settings > Apps > Create**.
3. Name the app `Concept Clusters Authoring` and enter the endpoint above.
4. Choose OAuth authentication when prompted.
5. Select **Scan tools**. Complete the Cloudflare Access browser sign-in and
   wait for the scan to finish.
6. Create the app. For private testing it can remain a developer app; an
   administrator can separately review and publish it to the workspace.
7. Enable the app for a normal chat and run the read-only verification below.

ChatGPT agent mode does not currently use custom apps. Deep research can use
custom apps only for read/fetch actions, so conduct the full draft and
publication workflow in a normal supported chat.

See OpenAI's current [developer mode and MCP apps documentation][chatgpt-mcp].

## Claude

For an individual Claude account:

1. Open **Customize > Connectors**.
2. Select **+**, then **Add custom connector**.
3. Enter `Concept Clusters Authoring` and the endpoint above.
4. Leave the optional OAuth client ID and secret blank so the client can use
   automatic discovery and dynamic registration.
5. Add the connector, select **Connect**, and complete Cloudflare Access
   sign-in.
6. In a conversation, use **+ > Connectors** to enable the connector.
7. Run the read-only verification below.

For Team or Enterprise, an Owner or Primary Owner first adds the connector
under **Organization settings > Connectors**. Members then find it under
**Customize > Connectors** and authenticate individually.

Claude Desktop remote connectors are account-managed connectors. Do not add
this remote URL to `claude_desktop_config.json`, which is a separate mechanism
for locally launched MCP servers.

See Claude's current [remote custom connector documentation][claude-mcp].

## Gemini CLI

Gemini CLI can register the endpoint at user scope:

```sh
gemini mcp add --scope user --transport http \
  concept-clusters-authoring \
  https://concept-clusters-authoring.jmajerus.workers.dev/mcp
```

Start Gemini CLI and inspect or authenticate the connection:

```text
/mcp list
/mcp auth concept-clusters-authoring
```

OAuth opens a browser and returns to a temporary localhost callback. Run this
from a machine that can open a browser and receive that callback. Do not add
`--trust`: the server intentionally exposes draft-writing and pull-request
publication tools whose calls should remain visible for approval.

See the current [Gemini CLI MCP documentation][gemini-mcp].

## Kimi Code CLI

Kimi Code is the most direct supported route for a Moonshot AI/Kimi API key:

1. Start Kimi Code, run `/login`, choose **Kimi Platform**, and paste a
   purpose-specific Kimi API key when prompted. Do not put the key in the MCP
   configuration.
2. Add this user-level entry to `~/.kimi-code/mcp.json`:

   ```json
   {
     "mcpServers": {
       "concept-clusters-authoring": {
         "url": "https://concept-clusters-authoring.jmajerus.workers.dev/mcp"
       }
     }
   }
   ```

3. In Kimi Code, run:

   ```text
   /mcp-config login concept-clusters-authoring
   ```

4. Complete the Cloudflare Access browser sign-in, then use `/mcp` to confirm
   that the server and its tools are available.
5. Retain manual approval for tool calls, especially draft and publication
   actions.

See the official [Kimi Code authentication][kimi-code] and
[Kimi Code MCP configuration][kimi-mcp] documentation.

## OpenAI Responses API

An application using the Responses API can include Concept Clusters as a
native remote MCP tool. Configure the tool with the endpoint above and pass
the author's Cloudflare OAuth access token in the tool's `authorization`
field. The application—not the OpenAI API—must perform the OAuth authorization
flow, store tokens securely, and refresh them.

Use an ordinary, project-scoped OpenAI API key for the Responses API request.
An **OpenAI admin key is not appropriate**: admin keys manage organization
users, projects, and API-key lifecycles and carry substantially broader
privileges. Keep approval enabled for write-capable MCP tools.

See OpenAI's [remote MCP tool reference][openai-remote-mcp] and
[Admin API key reference][openai-admin-keys].

## Anthropic Messages API

An application using Anthropic's Messages API can declare this endpoint in
`mcp_servers` and provide the author's Cloudflare OAuth token as the server's
`authorization_token`. The application remains responsible for the OAuth
flow and token refresh. Anthropic's API connector currently exposes MCP tools,
not every possible MCP primitive.

Use an ordinary Anthropic workspace API key for the Messages API request. An
**Anthropic Admin API key is not appropriate**: it is intended for
organization-level administration and reporting rather than model inference.

See Anthropic's [MCP connector documentation][anthropic-mcp-connector] and
[Admin API documentation][anthropic-admin-api].

## ElevenLabs Agents

ElevenLabs Agents can connect to Streamable HTTP MCP servers. The preferred
setup is through the dashboard:

1. Open **MCP server integrations** and select **Add Custom MCP Server**.
2. Enter `Concept Clusters Authoring` and the endpoint above.
3. Select or create an OAuth authorization-code auth connection for the
   server, then complete Cloudflare Access sign-in.
4. Test the connection so ElevenLabs lists the tools, and attach it to the
   intended agent.
5. Use **Always Ask** initially. If desired, later auto-approve only the
   read-only discovery tools while retaining approval for draft and
   publication tools.

An ElevenLabs API key is unnecessary when configuring the integration in the
dashboard. If configuration is automated through the ElevenLabs API, a
read-only key cannot create or update an MCP integration; use the narrowest
key scope that grants the required Agents/MCP configuration writes. Do not
use an unrestricted key merely for convenience.

ElevenLabs supports the required transport and documents OAuth auth
connections, but this particular server remains an end-to-end test item. See
the [ElevenLabs MCP guide][elevenlabs-mcp] and
[OAuth support changelog][elevenlabs-mcp-oauth], plus its
[API-key security guidance][elevenlabs-api-keys].

## OpenRouter, DeepSeek, and Venice

These providers can supply the model for an agent host, but their model APIs
currently expose function/tool calling rather than a native arbitrary remote
MCP connector. Consequently, an API key alone cannot connect the provider to
Concept Clusters. Use one of these architectures:

- select the provider in an MCP-capable client that also handles Cloudflare's
  browser OAuth flow; or
- build a small application that acts as both MCP client and model tool-call
  dispatcher.

The two credentials stay separate in either design: the host uses the
provider key for inference and an author-specific OAuth token for Concept
Clusters. It must also preserve human approval for state-changing tools.

Provider-specific guidance:

- **OpenRouter:** use a normal API key. OpenRouter's server tools and its own
  MCP server are different features; neither registers this external MCP
  endpoint automatically.
- **DeepSeek:** use a normal API key with a host that supports DeepSeek's
  OpenAI-compatible API. DeepSeek function calls are returned to the host for
  execution; the host must translate those calls to MCP.
- **Venice:** use an **Inference Only** key with a spending limit and expiry.
  An Admin key can create and delete other API keys and is unnecessary for
  model inference or MCP tool use.

See the official [OpenRouter tool-calling guide][openrouter-tools],
[DeepSeek tool-call guide][deepseek-tools], and
[Venice API-key guide][venice-api-keys].

## Microsoft Copilot Studio

The expected Copilot Studio setup uses its MCP onboarding wizard:

1. Open the agent's **Tools** page.
2. Select **Add a tool > New tool > Model Context Protocol**.
3. Supply a clear name and description plus the endpoint above.
4. Choose **OAuth 2.0**, then **Dynamic discovery**.
5. Create the MCP definition, create a connection, complete Cloudflare Access
   sign-in, and select **Add to agent**.
6. Confirm the server's tools appear before publishing or sharing the agent.

Concept Clusters uses the Streamable HTTP transport supported by Copilot
Studio, and its deployed Access configuration publishes OAuth discovery and
dynamic-registration endpoints. This path should nevertheless be treated as
provisional until it has been tested from the intended Power Platform tenant,
where administrator permissions and data policies may also apply.

See Microsoft's current [Copilot Studio MCP onboarding documentation][copilot-mcp].

## MCP Inspector

Use the reference MCP Inspector when a chatbot reports only a generic
connection or authentication error. The current Inspector requires Node.js
22.19 or newer.

```sh
npx @modelcontextprotocol/inspector \
  --server-url https://concept-clusters-authoring.jmajerus.workers.dev/mcp \
  --transport http
```

Open the one-time local URL printed by the command. Connect to the server,
complete OAuth in the browser, inspect `tools/list`, and call a read-only tool
such as `list_categories`.

See the official [MCP Inspector documentation][mcp-inspector].

## Read-only connection verification

Start with these requests, whether entered as client tool calls or expressed
as natural-language prompts:

1. “Use `list_categories` and report how many categories are available.”
2. “Use `get_authoring_guidance` and summarize the authoring workflow without
   creating or changing a draft.”
3. “Use `list_puzzles` to list the published Art puzzles.”

If these work, transport negotiation, OAuth, identity propagation, and tool
discovery are all functioning. Prefer a read-only check like the ones above
over creating a disposable draft merely to test connectivity — `delete_puzzle_draft`
can clean one up afterward, but it refuses to delete a draft that was ever
submitted for publication (see `MCP-REMOTE.md`), so it isn't a guaranteed undo.

## Starting an authoring session

`get_authoring_guidance` carries design judgment — what makes a puzzle good,
not just schema-valid — that the tool list and schema validation alone don't
convey. Both MCP servers' `instructions` already tell a connecting model to
call it before drafting, but not every client surfaces that field with the
same weight it gives the tool list itself, so it's worth reinforcing
directly at the start of an authoring conversation:

> Before drafting anything, call `get_authoring_guidance` and follow its
> design judgment throughout this session.

When the work later enters pull-request review, call
`get_workflow_guidance` with that topic. Catalogue membership on the LAN
authoring server is a page (`/admin/catalogues`, then
`/?catalogue=<id>&view=author`); call `get_workflow_guidance` with
`topic: "catalogue"` only when using the MCP create/update tools. This
keeps operational instructions out of the initial context until that
workflow is actually in use. Local stdio and hosted MCP expose the same
guidance and workflow tools; only local stdio adds checkout preview and
installation.

If the client offers persistent custom or system instructions — Claude.ai's
Custom Instructions or Project instructions, a custom GPT's instructions,
Gemini's system prompt — put that line there instead of retyping it per
session. It then applies automatically to every future authoring
conversation with that client, rather than depending on remembering to add
it each time.

## Understand tool effects

| Tool family | Effect |
|---|---|
| Published-content discovery and authoring guidance | Read-only |
| Draft creation and saving | Writes private draft state to D1; `save_puzzle_draft` requires `expected_revision` |
| Draft deletion | Permanently removes a draft row; refused if the draft has any publication history |
| Draft validation | Reads draft state and returns analysis |
| Publication preview | Optional. Reads GitHub and computes exact proposed file changes; does not modify the repository |
| Publication submission | After the human reviews `/admin/drafts/<id>`, **Publish** writes the shared D1 row. **Export to player** (or `submit_puzzle_for_publication`) validates the draft and creates a GitHub branch, commit, and pull request for the git-bundled player. `preview_repository_import` is optional. Merging stays a separate human action. Hosted authoring has no git checkout and does not write `main`; the player-facing Worker is not auto-deployed on push |
| Pull-request merge | Not exposed by this server; merging remains a separate human review action in GitHub |

Drafts are isolated by the authenticated Cloudflare Access subject. A client
connected as a different identity cannot see another author's drafts.

Treat the pull request as a production ship candidate, not a play preview.
Play unpublished boards on the LAN authoring checkout
(`/?draft=<id>&view=play`).
Install is optional when you want git-shaped files. Cloudflare serves production after merge. If the puzzle
needs substantial rework, close the pull request, optionally delete its
branch, revise the D1 draft, Play again on LAN, and submit again when
ready to ship.

## Troubleshooting

### The client opens a normal Access page but never completes OAuth

Confirm that Managed OAuth remains enabled for the Access application under
**Zero Trust > Access controls > Applications > Edit > Advanced settings**.
With Managed OAuth enabled, an unauthenticated MCP request receives `401` plus
OAuth discovery metadata rather than an ordinary browser-cookie redirect.

### Access reports that the identity is not allowed

The OAuth exchange does not bypass Access policy. Ask the server administrator
to confirm that the signing-in identity matches an Allow policy for the MCP
application.

### Authentication succeeds but no tools appear

- Confirm the URL ends in `/mcp`.
- Disconnect and reconnect the integration, then rescan or reload its tools.
- In ChatGPT, verify developer mode and workspace permission are still active.
- In Claude, remove and re-add the connector if its definition has become
  stale.
- Use MCP Inspector to distinguish OAuth failure from `tools/list` failure.

### The client sees tools but cannot author or publish

Check whether the client plan or conversation surface permits write-capable
custom MCP tools. In particular, ChatGPT Pro's current custom MCP support is
limited to read/fetch behavior, and ChatGPT deep research does not invoke
write actions.

## Maintainer check

When updating this guide, verify the endpoint still returns an OAuth challenge
and advertises protected-resource metadata:

```sh
curl --silent --show-error --dump-header - --output /dev/null \
  https://concept-clusters-authoring.jmajerus.workers.dev/mcp
```

The response should be HTTP `401` with a `WWW-Authenticate` header containing
a `resource_metadata` URL. Do not weaken Access merely to make a client
connection test pass.

Cloudflare explains this flow in its [Managed OAuth documentation][cloudflare-oauth].

[chatgpt-mcp]: https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta
[claude-mcp]: https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp
[gemini-mcp]: https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md
[kimi-code]: https://platform.kimi.ai/docs/guide/kimi-code-cli
[kimi-mcp]: https://www.kimi.com/code/docs/en/kimi-code-cli/customization/mcp.html
[openai-remote-mcp]: https://developers.openai.com/api/docs/guides/tools-connectors-mcp
[openai-admin-keys]: https://platform.openai.com/docs/api-reference/admin-api-keys
[anthropic-mcp-connector]: https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector
[anthropic-admin-api]: https://platform.claude.com/docs/en/manage-claude/overview
[elevenlabs-mcp]: https://elevenlabs.io/docs/eleven-agents/customization/tools/mcp
[elevenlabs-mcp-oauth]: https://elevenlabs.io/docs/changelog/2026/3/23
[elevenlabs-api-keys]: https://elevenlabs.io/docs/overview/administration/workspaces/api-keys
[openrouter-tools]: https://openrouter.ai/docs/guides/features/tool-calling
[deepseek-tools]: https://api-docs.deepseek.com/guides/tool_calls
[venice-api-keys]: https://docs.venice.ai/guides/getting-started/generating-api-key
[copilot-mcp]: https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-existing-server-to-agent
[mcp-inspector]: https://modelcontextprotocol.io/docs/tools/inspector
[cloudflare-oauth]: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/managed-oauth/
