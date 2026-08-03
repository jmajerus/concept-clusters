import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { createMcpHandler } from "agents/mcp/server";
import fromEvidenceToActionIntroduction from "../puzzles/public-health/from-evidence-to-action.intro.md";
import { D1DraftRepository } from "../modules/d1DraftRepository.js";
import { D1PublicationRepository } from "../modules/d1PublicationRepository.js";
import {
  createGitHubPublicationService,
  GitHubRepositoryClient
} from "../modules/githubPublicationService.js";
import { createHostedAuthoringContentService } from "../modules/hostedAuthoringContentService.js";
import { createHostedMcpAuthoringServer } from "../modules/hostedMcpAuthoringServer.js";

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

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
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
      const publicationRepository = new D1PublicationRepository(env.AUTHORING_DB);
      const contentService = createHostedAuthoringContentService({
        learningContentByPuzzle: new Map([
          ["from-evidence-to-action", fromEvidenceToActionIntroduction]
        ])
      });
      const publicationService = createGitHubPublicationService({
        contentService,
        draftRepository: repository,
        publicationRepository,
        github: new GitHubRepositoryClient({
          owner: env.GITHUB_OWNER,
          repository: env.GITHUB_REPOSITORY,
          baseBranch: env.GITHUB_BASE_BRANCH,
          token: env.GITHUB_TOKEN
        })
      });
      const handler = createMcpHandler(
        () => createHostedMcpAuthoringServer({
          draftRepository: repository,
          contentService,
          publicationService,
          actor: authenticated.actor
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
