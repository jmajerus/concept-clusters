import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload
} from "jose";
import { createMcpHandler } from "agents/mcp/server";
import fromEvidenceToActionIntroduction from "../puzzles/public-health/from-evidence-to-action.intro.md";
import { D1DraftRepository } from "../modules/d1DraftRepository.js";
import { D1ContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { GitHubRepositoryClient } from "../modules/githubRepositoryClient.js";
import { createHostedAuthoringContentService } from "../modules/hostedAuthoringContentService.js";
import { createHostedMcpAuthoringServer } from "../modules/hostedMcpAuthoringServer.js";
import { runWikiLinkHealth } from "../modules/wikiLinkCheck.js";
import { createD1WikiLinkCheckStore } from "../modules/wikiLinkCheckStore.js";
import {
  snapshotGithubProductionManifestFromClient
} from "../modules/githubProductionManifestCore.js";

const MAX_MCP_REQUEST_BYTES = 1_600_000;
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

type DraftActor = {
  subject: string;
  email?: string;
  name?: string;
};

type AuthenticatedRequest = {
  actor: DraftActor;
  authInfo: {
    token: string;
    clientId: string;
    scopes: string[];
    expiresAt?: number;
  };
};

function jsonError(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

function expectedHostname(request: Request, env: Env): boolean {
  const hostname = new URL(request.url).hostname;
  return LOCAL_HOSTNAMES.has(hostname) ||
    hostname === env.AUTHORING_HOSTNAME;
}

function stringClaim(payload: JWTPayload, name: string): string | undefined {
  const value = payload[name];
  return typeof value === "string" && value.trim() ? value : undefined;
}

async function authenticateAccess(
  request: Request,
  env: Env
): Promise<AuthenticatedRequest | Response> {
  const hostname = new URL(request.url).hostname;
  const token = request.headers.get("cf-access-jwt-assertion");

  if (!token && LOCAL_HOSTNAMES.has(hostname) && env.AUTHORING_DEV_SUBJECT) {
    return {
      actor: { subject: env.AUTHORING_DEV_SUBJECT },
      authInfo: {
        token: "local-development",
        clientId: env.AUTHORING_DEV_SUBJECT,
        scopes: ["puzzles:read", "drafts:write", "publication:submit"]
      }
    };
  }
  if (!token) return jsonError(401, "Cloudflare Access authentication is required");
  if (!env.TEAM_DOMAIN || !env.POLICY_AUD) {
    return jsonError(503, "Cloudflare Access is not configured");
  }

  try {
    const teamDomain = new URL(env.TEAM_DOMAIN);
    if (teamDomain.protocol !== "https:") {
      throw new Error("TEAM_DOMAIN must use https");
    }
    const keys = createRemoteJWKSet(
      new URL("/cdn-cgi/access/certs", teamDomain)
    );
    const { payload } = await jwtVerify(token, keys, {
      issuer: teamDomain.origin,
      audience: env.POLICY_AUD
    });
    const subject = stringClaim(payload, "sub");
    if (!subject) throw new Error("Access token has no subject");
    return {
      actor: {
        subject,
        ...(stringClaim(payload, "email")
          ? { email: stringClaim(payload, "email") }
          : {}),
        ...(stringClaim(payload, "name")
          ? { name: stringClaim(payload, "name") }
          : {})
      },
      authInfo: {
        token,
        clientId: subject,
        scopes: ["puzzles:read", "drafts:write", "publication:submit"],
        ...(typeof payload.exp === "number" ? { expiresAt: payload.exp } : {})
      }
    };
  } catch (error) {
    console.warn(JSON.stringify({
      message: "Access token validation failed",
      error: error instanceof Error ? error.message : String(error)
    }));
    return jsonError(401, "Cloudflare Access token is invalid");
  }
}

async function readBoundedJson(request: Request): Promise<unknown> {
  if (!request.body) throw new Error("MCP POST request has no body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_MCP_REQUEST_BYTES) {
      await reader.cancel("request too large");
      throw new RangeError(`MCP request exceeds ${MAX_MCP_REQUEST_BYTES} bytes`);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[char]!));
}

function createHostedContentService() {
  return createHostedAuthoringContentService({
    learningContentByPuzzle: new Map([
      ["from-evidence-to-action", fromEvidenceToActionIntroduction]
    ])
  });
}

// Isolate-level cache of GitHub base-branch puzzles/manifest.js. Hosted
// authoring has no Freeze; this is the equivalent of the LAN snapshot.
// A failed fetch stays null for this isolate so list/detail omit the badge.
let hostedGithubProductionSnapshot:
  | Awaited<ReturnType<typeof snapshotGithubProductionManifestFromClient>>
  | null
  | undefined;

async function hostedGithubProduction(env: Env) {
  if (hostedGithubProductionSnapshot !== undefined) {
    return hostedGithubProductionSnapshot;
  }
  const token = typeof env.GITHUB_TOKEN === "string" ? env.GITHUB_TOKEN.trim() : "";
  const owner = typeof env.GITHUB_OWNER === "string" ? env.GITHUB_OWNER.trim() : "";
  const repository = typeof env.GITHUB_REPOSITORY === "string"
    ? env.GITHUB_REPOSITORY.trim()
    : "";
  if (!token || !owner || !repository) {
    hostedGithubProductionSnapshot = null;
    return null;
  }
  try {
    const github = new GitHubRepositoryClient({
      owner,
      repository,
      baseBranch: env.GITHUB_BASE_BRANCH || "main",
      token
    });
    hostedGithubProductionSnapshot = await snapshotGithubProductionManifestFromClient(github);
    return hostedGithubProductionSnapshot;
  } catch {
    hostedGithubProductionSnapshot = null;
    return null;
  }
}

// Human review of a draft's actual content, plus POST to open a GitHub
// pull request after that reading pass. Requires the same Cloudflare
// Access authentication as /mcp; a draft is only ever visible to the
// owner who created it (D1DraftRepository scopes both list() and get()
// to the authenticated actor).
// The hosted Worker serves MCP and the weekly link-health sweep. It has no
// admin pages: those lived here as a second implementation of the LAN
// authoring server's request path, assembling their own renderDraftPage
// payload from the same D1 rows. Keeping two of them meant a flag added to
// one route silently missed the other, which is how a provenance-only edit
// came to report "No changes" and have Publish withheld on one side only.
//
// Admin now lives solely on the LAN authoring server (modules/localDraftReview.js),
// which is the deployment wired to production D1 for human edits and the
// origin of every administrative change. See
// docs/dev-briefs/hosted-worker-scope.md.

// Weekly Wikipedia link health over the published corpus. The trigger is
// wrangler.authoring.jsonc triggers.crons, Monday 06:00 UTC: weekly is
// plenty, since article renames and merges are rare and daily would just
// burn quota. (That file is read with plain JSON.parse by
// modules/localD1Config.js, so it carries no comments; this is where the
// schedule is explained.) Titles come from D1's published puzzles, so the set can
// never go stale the way the old bundled manifest did; results land in
// wiki_link_checks for the draft page and check_puzzle_links to reuse, and a
// heartbeat plus per-issue data points go to Analytics Engine so "no issues"
// and "the cron stopped firing" stay distinguishable on the dashboard.
async function scheduledLinkHealth(env: Env): Promise<void> {
  const write = (dataPoint: AnalyticsEngineDataPoint) => {
    try {
      env.ANALYTICS?.writeDataPoint(dataPoint);
    } catch {
      // Analytics is observability, never a reason to fail the run.
    }
  };
  try {
    const report = await runWikiLinkHealth({
      contentDocuments: new D1ContentDocumentRepository(env.AUTHORING_DB),
      store: createD1WikiLinkCheckStore(env.AUTHORING_DB)
    });
    for (const issue of report.issues) {
      write({
        blobs: ["link_health_issue", issue.title.slice(0, 200), issue.status, issue.puzzles.join(",").slice(0, 200)],
        doubles: [issue.puzzles.length],
        indexes: [issue.title.slice(0, 96)]
      });
    }
    // doubles: checked, issues, puzzles, then the per-status breakdown the
    // dashboard's "last run" line shows (ok, redirect, missing, disambiguation).
    write({
      blobs: ["link_health_run", report.unavailable || ""],
      doubles: [
        report.checked, report.issues.length, report.puzzles,
        report.counts.ok, report.counts.redirect, report.counts.missing, report.counts.disambiguation
      ],
      indexes: ["link_health"]
    });
  } catch (error) {
    write({
      blobs: ["link_health_error", String(error instanceof Error ? error.message : error).slice(0, 200)],
      doubles: [0],
      indexes: ["link_health"]
    });
  }
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(scheduledLinkHealth(env));
  },

  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // Admin moved to the LAN authoring server. These paths answer 410 rather
    // than 404 so a stale bookmark says what happened instead of looking like
    // an outage, and so the Worker never silently half-serves an admin URL.
    const isRetiredAdminRoute = url.pathname === "/admin"
      || url.pathname.startsWith("/admin/");
    if (isRetiredAdminRoute) {
      return html(
        "<h1>Admin has moved</h1>" +
        "<p>Authoring admin runs on the LAN authoring server. This Worker " +
        "serves the MCP endpoint and the weekly link-health sweep only.</p>",
        410
      );
    }
    if (url.pathname !== "/mcp") return new Response("Not Found", { status: 404 });
    if (!expectedHostname(request, env)) {
      return jsonError(421, "Request hostname is not configured for this Worker");
    }

    const authenticated = request.method === "OPTIONS"
      ? {
          actor: { subject: "cors-preflight" },
          authInfo: {
            token: "cors-preflight",
            clientId: "cors-preflight",
            scopes: []
          }
        }
      : await authenticateAccess(request, env);
    if (authenticated instanceof Response) return authenticated;

    try {
      const repository = new D1DraftRepository(env.AUTHORING_DB);
      const contentService = createHostedContentService();
      const handler = createMcpHandler(
        () => createHostedMcpAuthoringServer({
          draftRepository: repository,
          contentDocuments: new D1ContentDocumentRepository(env.AUTHORING_DB),
          contentService,
          actor: authenticated.actor,
          analytics: env.ANALYTICS,
          wikiLinkStore: createD1WikiLinkCheckStore(env.AUTHORING_DB)
        }),
        {
          route: "/mcp",
          // The server is stateless in both lanes. Compatibility keeps current
          // 2025-era clients working while newer request envelopes roll out.
          legacy: "stateless",
          allowedHostnames: [url.hostname],
          allowedOriginHostnames: [
            url.hostname,
            "localhost",
            "127.0.0.1"
          ],
          onerror: error => console.error(JSON.stringify({
            message: "MCP handler error",
            error: error instanceof Error ? error.message : String(error)
          }))
        }
      );
      const parsedBody = request.method === "POST"
        ? await readBoundedJson(request)
        : undefined;
      return handler.fetch(request, {
        authInfo: authenticated.authInfo,
        ...(parsedBody === undefined ? {} : { parsedBody })
      });
    } catch (error) {
      const tooLarge = error instanceof RangeError;
      console.error(JSON.stringify({
        message: "Authoring request failed",
        error: error instanceof Error ? error.message : String(error),
        path: url.pathname
      }));
      return jsonError(tooLarge ? 413 : 400, tooLarge
        ? "MCP request is too large"
        : "Invalid MCP request");
    }
  }
} satisfies ExportedHandler<Env>;
