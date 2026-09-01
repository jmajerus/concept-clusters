import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { createMcpHandler } from "agents/mcp/server";
import fromEvidenceToActionIntroduction from "../puzzles/public-health/from-evidence-to-action.intro.md";
import { D1DraftRepository } from "../modules/d1DraftRepository.js";
import { D1PublicationRepository } from "../modules/d1PublicationRepository.js";
import {
  ContentDocumentNotFoundError,
  D1ContentDocumentRepository,
  publishedRowOrNull
} from "../modules/contentDocumentRepository.js";
import {
  createGitHubPublicationService,
  GitHubRepositoryClient
} from "../modules/githubPublicationService.js";
import { createHostedAuthoringContentService } from "../modules/hostedAuthoringContentService.js";
import { createHostedMcpAuthoringServer } from "../modules/hostedMcpAuthoringServer.js";
import { documentForEditor, withStorageCanonicalizeFlags } from "../modules/authoredPuzzleDocument.js";
import { renderAdminIndexPage } from "../modules/authoringAdminIndex.js";
import { renderDraftListPage, renderDraftPage } from "../modules/draftReviewPage.js";
import { diffPublishedDraft, publishedDocumentFromService } from "../modules/draftReviewDiff.js";
import {
  DraftFieldError,
  draftFieldRedirectPath,
  isDraftConflictError,
  parseFieldEditForm,
  persistDraftFieldEdit,
  persistDraftCanonicalForm,
  renderDraftFieldConflictPage
} from "../modules/draftReviewEdit.js";
import { fetchLocalContentAdmin } from "../modules/localCatalogueReview.js";
import {
  renderContentLifecycleResultPage,
  renderContentPublishResultPage
} from "../modules/catalogueReviewPage.js";
import { seedPublishedPuzzleIfAbsent } from "../modules/contentDocumentSeed.js";
import { freezeFlagsFromPublished, publishedFreezeAddIds } from "../modules/contentFreezePlan.js";
import {
  isSameOriginRequest,
  parseSubmitForm,
  renderDraftSubmitResultPage,
  submitDraftFromReview
} from "../modules/draftReviewSubmit.js";

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

function createHostedPublicationService(env: Env, contentService: ReturnType<typeof createHostedContentService>) {
  return createGitHubPublicationService({
    contentService,
    draftRepository: new D1DraftRepository(env.AUTHORING_DB),
    publicationRepository: new D1PublicationRepository(env.AUTHORING_DB),
    github: new GitHubRepositoryClient({
      owner: env.GITHUB_OWNER,
      repository: env.GITHUB_REPOSITORY,
      baseBranch: env.GITHUB_BASE_BRANCH,
      token: env.GITHUB_TOKEN
    })
  });
}

// Human review of a draft's actual content, plus POST to open a GitHub
// pull request after that reading pass. Requires the same Cloudflare
// Access authentication as /mcp; a draft is only ever visible to the
// owner who created it (D1DraftRepository scopes both list() and get()
// to the authenticated actor).
async function handleAdminRoute(
  request: Request,
  env: Env,
  actor: DraftActor
): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname === "/admin" || pathname === "/admin/") {
    if (pathname === "/admin/") {
      return new Response(null, {
        status: 302,
        headers: { Location: "/admin", "Cache-Control": "no-store" }
      });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" }
      });
    }
    return html(renderAdminIndexPage());
  }
  if (pathname === "/admin/catalogues" || pathname.startsWith("/admin/catalogues/")
    || pathname === "/admin/categories" || pathname.startsWith("/admin/categories/")) {
    return fetchLocalContentAdmin(request, {
      contentDocuments: new D1ContentDocumentRepository(env.AUTHORING_DB),
      actor,
      contentService: createHostedContentService(),
      repositoryRoot: ".",
      env,
      exportCatalogue: async (document, { existsOnGit }) => {
        const service = createHostedPublicationService(env, createHostedContentService());
        return existsOnGit
          ? service.updateCatalogue(document, { actor })
          : service.createCatalogue(document, { actor });
      }
    });
  }
  const repository = new D1DraftRepository(env.AUTHORING_DB);
  const contentService = createHostedContentService();
  // null means "not applicable / can't tell". Two cases fall into that:
  //  - status === "draft": never submitted, so of course it isn't in the
  //    bundle -- not worth a badge.
  //  - a null puzzleId despite having been submitted: d1DraftRepository.js
  //    recomputes puzzle_id from the current document on every save,
  //    independent of status, so a later edit with a document missing a
  //    valid string `id` can leave puzzle_id null while status is still
  //    whatever it was before. Set.has(null) wouldn't throw, but it would
  //    render a misleading badge for what's actually a different problem
  //    (a malformed draft), so this is checked explicitly.
  //
  // Deliberately NOT gated on status === "published": that transition is
  // lazy (d1PublicationRepository.js's reconcile() only runs when
  // get_publication_status is actually called) and nothing calls it
  // automatically when a PR merges on GitHub, so in practice almost every
  // real draft sits at "submitted" indefinitely even long after merging.
  // The bundle check itself doesn't depend on that staleness -- it's a
  // live query against this Worker's actual data -- so any draft that's
  // ever been submitted gets a real answer regardless of whether its own
  // stored status caught up.
  const normalizedPuzzleId = (puzzleId: unknown) =>
    typeof puzzleId === "string" && puzzleId.trim()
      ? puzzleId.trim()
      : null;
  const bundleStatusFor = (status: string, puzzleId: unknown) => {
    const normalized = normalizedPuzzleId(puzzleId);
    return status !== "draft" && normalized
      ? contentService.knownPuzzleIds.has(normalized)
      : null;
  };
  if (pathname === "/admin/drafts") {
    if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
    // d1DraftRepository.js's list() destructures { actor, status = null,
    // limit = 100 } -- TypeScript's JS-inference only picks up the two
    // properties that have defaults, so it infers a parameter type
    // without `actor` at all and rejects passing it. The real runtime
    // signature does accept (and requires) actor; cast around the
    // inference gap rather than the actual contract.
    const drafts = await repository.list({ actor } as Parameters<typeof repository.list>[0]);
    const contentDocuments = new D1ContentDocumentRepository(env.AUTHORING_DB);
    const gitPuzzleIds = [...contentService.knownPuzzleIds];
    const publishedRows = await contentDocuments.listPublished({
      kind: "puzzle",
      includeWithdrawn: true
    });
    const publishedById = new Map(publishedRows.map(row => [row.id, row]));
    const freezeAdds = await publishedFreezeAddIds(
      contentDocuments,
      "puzzle",
      gitPuzzleIds
    );
    const withBundleStatus = drafts.map((draft: {
      status: string;
      puzzleId: string | null;
      document?: { id?: string };
    }) => {
      const puzzleId = normalizedPuzzleId(draft.document?.id) || draft.puzzleId;
      return {
        ...draft,
        inCurrentBundle: bundleStatusFor(draft.status, draft.puzzleId),
        freezeAdd: Boolean(puzzleId && freezeAdds.has(puzzleId)),
        ...freezeFlagsFromPublished(publishedById.get(puzzleId ?? ""), gitPuzzleIds)
      };
    });
    return html(renderDraftListPage(withBundleStatus));
  }
  const draftMatch = pathname.match(/^\/admin\/drafts\/([^/]+)$/);
  if (!draftMatch) return null;
  const draftId = decodeURIComponent(draftMatch[1]);

  if (request.method === "POST") {
    if (!isSameOriginRequest({
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
      host: url.host
    })) {
      return html("<p>Cross-origin submit is not allowed.</p>", 403);
    }
    const params = await request.formData();
    const form = parseSubmitForm(params);
    if (form.isSaveField || form.isRevertField) {
      try {
        const draft = await repository.get({ draftId, actor });
        const puzzleId = normalizedPuzzleId(draft.document?.id) || draft.puzzleId;
        const published = publishedDocumentFromService(contentService, puzzleId);
        await persistDraftFieldEdit({
          draft,
          publishedDocument: published,
          form: parseFieldEditForm(params),
          saveDraft: ({ document, expectedRevision }) =>
            repository.save({ draftId, document, actor, expectedRevision })
        });
        return new Response(null, {
          status: 303,
          headers: { Location: draftFieldRedirectPath(draftId) }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/not found|Unknown draft/i.test(message)) {
          return html(`<p>Draft not found: ${escapeHtml(message)}</p>`, 404);
        }
        if (isDraftConflictError(error)) {
          return html(renderDraftFieldConflictPage({ draftId, error: message }), 409);
        }
        if (error instanceof DraftFieldError) {
          return html(`<p>${escapeHtml(message)}</p>`, error.status || 400);
        }
        return html(`<p>${escapeHtml(message)}</p>`, 400);
      }
    }
    if (form.isSaveCanonical) {
      try {
        const draft = await repository.get({ draftId, actor });
        const expectedRevision = Number.parseInt(String(params.get("expected_revision") ?? ""), 10);
        await persistDraftCanonicalForm({
          draft,
          expectedRevision,
          saveDraft: ({ document, expectedRevision: revision }) =>
            repository.save({ draftId, document, actor, expectedRevision: revision })
        });
        return new Response(null, {
          status: 303,
          headers: { Location: draftFieldRedirectPath(draftId) }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/not found|Unknown draft/i.test(message)) {
          return html(`<p>Draft not found: ${escapeHtml(message)}</p>`, 404);
        }
        if (isDraftConflictError(error)) {
          return html(renderDraftFieldConflictPage({ draftId, error: message }), 409);
        }
        if (error instanceof DraftFieldError) {
          return html(`<p>${escapeHtml(message)}</p>`, error.status || 400);
        }
        return html(`<p>${escapeHtml(message)}</p>`, 400);
      }
    }
    if (form.isPublish || form.isRevertPublished) {
      try {
        const draft = await repository.get({ draftId, actor });
        const puzzleId = normalizedPuzzleId(draft.document?.id) || draft.puzzleId;
        if (!puzzleId) {
          return html("<p>This draft has no puzzle id to publish.</p>", 400);
        }
        const contentDocuments = new D1ContentDocumentRepository(env.AUTHORING_DB);
        if (form.isRevertPublished) {
          await seedPublishedPuzzleIfAbsent(contentDocuments, contentService, puzzleId);
          const published = await contentDocuments.getPublished({ kind: "puzzle", id: puzzleId });
          await repository.save({
            draftId,
            document: published.document,
            actor,
            expectedRevision: draft.revision
          });
          return new Response(null, {
            status: 303,
            headers: { Location: `/admin/drafts/${encodeURIComponent(draftId)}` }
          });
        }
        const validation = contentService.validatePuzzleDraft(draft.document);
        if (validation && validation.valid === false) {
          return html(renderContentPublishResultPage({
            kind: "puzzle",
            id: puzzleId,
            error: (validation.errors || []).join("\n") || "Draft is not valid.",
            backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
          }), 400);
        }
        const published = await contentDocuments.publish({
          kind: "puzzle",
          id: puzzleId,
          document: draft.document,
          actor
        });
        return html(renderContentPublishResultPage({
          kind: "puzzle",
          id: puzzleId,
          published,
          backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return html(renderContentPublishResultPage({
          kind: "puzzle",
          id: draftId,
          error: message,
          backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
        }), 400);
      }
    }
    if (form.isUnpublish) {
      try {
        const draft = await repository.get({ draftId, actor });
        const puzzleId = normalizedPuzzleId(draft.document?.id) || draft.puzzleId;
        if (!puzzleId) {
          return html("<p>This draft has no puzzle id to unpublish.</p>", 400);
        }
        const contentDocuments = new D1ContentDocumentRepository(env.AUTHORING_DB);
        await contentDocuments.unpublish({
          kind: "puzzle",
          id: puzzleId,
          actor
        });
        return html(renderContentLifecycleResultPage({
          title: "Removed from authoring play",
          message: `Withdrew ${puzzleId}. Publish again to restore it.`,
          backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (
          error instanceof ContentDocumentNotFoundError
          || /not found|Unknown/i.test(message)
        ) {
          return html(`<p>${escapeHtml(message)}</p>`, 404);
        }
        return html(renderContentLifecycleResultPage({
          title: "Could not unpublish",
          error: message,
          backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
        }), 400);
      }
    }
    if (form.isCueForFreeze || form.isHoldFromFreeze) {
      try {
        const draft = await repository.get({ draftId, actor });
        const puzzleId = normalizedPuzzleId(draft.document?.id) || draft.puzzleId;
        if (!puzzleId) {
          return html("<p>This draft has no puzzle id to mark.</p>", 400);
        }
        const contentDocuments = new D1ContentDocumentRepository(env.AUTHORING_DB);
        await contentDocuments.setFreezeCue({
          kind: "puzzle",
          id: puzzleId,
          actor,
          cued: form.isCueForFreeze
        });
        return new Response(null, {
          status: 303,
          headers: { Location: `/admin/drafts/${encodeURIComponent(draftId)}` }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (
          error instanceof ContentDocumentNotFoundError
          || /not found|Unknown/i.test(message)
        ) {
          return html(`<p>${escapeHtml(message)}</p>`, 404);
        }
        return html(renderContentLifecycleResultPage({
          title: "Could not update freeze cue",
          error: message,
          backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
        }), 400);
      }
    }
    if (form.isDeleteDraft) {
      try {
        await repository.delete({ draftId, actor });
        return html(renderContentLifecycleResultPage({
          title: "Working copy deleted",
          message: `Deleted draft ${draftId}.`,
          backHref: "/admin/drafts"
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/not found|Unknown draft/i.test(message)) {
          return html(`<p>Draft not found: ${escapeHtml(message)}</p>`, 404);
        }
        return html(renderContentLifecycleResultPage({
          title: "Could not delete draft",
          error: message,
          backHref: `/admin/drafts/${encodeURIComponent(draftId)}`
        }), 400);
      }
    }
    if (form.isInstall || form.isUninstall) {
      return html(
        "<p>Hosted authoring has no git checkout and does not write the base branch. Open a pull request instead; merging and deploying the player-facing Worker remain separate.</p>",
        400
      );
    }
    if (!form.isSubmit) {
      return html("<p>Missing submit confirmation.</p>", 400);
    }
    try {
      const publicationService = createHostedPublicationService(env, contentService);
      const publication = await submitDraftFromReview({
        submitDraft: args => publicationService.submit(args),
        draftId,
        actor,
        replace: form.replace
      });
      return html(renderDraftSubmitResultPage({ draftId, publication }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/not found|Unknown draft/i.test(message)) {
        return html(`<p>Draft not found: ${escapeHtml(message)}</p>`, 404);
      }
      return html(renderDraftSubmitResultPage({ draftId, error: message }), 400);
    }
  }

  if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
  try {
    const draft = await repository.get({ draftId, actor });
    const puzzleId = normalizedPuzzleId(draft.document?.id) || draft.puzzleId;
    // Bundle freshness is repository metadata: a null persisted puzzle_id
    // means there is no stable identity to compare, even if malformed or
    // inconsistent row data still happens to contain document.id.
    const inCurrentBundle = bundleStatusFor(draft.status, draft.puzzleId);
    const alreadyPublished = typeof puzzleId === "string"
      && contentService.knownPuzzleIds.has(puzzleId);
    const document = documentForEditor(draft.document);
    const publishedDiff = alreadyPublished
      ? diffPublishedDraft(contentService.getPuzzleDocument(puzzleId), document)
      : null;
    const validation = withStorageCanonicalizeFlags(
      draft.document,
      contentService.validatePuzzleDraft(draft.document)
    );
    const freezeAdds = await publishedFreezeAddIds(
      new D1ContentDocumentRepository(env.AUTHORING_DB),
      "puzzle",
      [...contentService.knownPuzzleIds]
    );
    const publishedRow = await publishedRowOrNull(
      new D1ContentDocumentRepository(env.AUTHORING_DB),
      "puzzle",
      puzzleId
    );
    return html(renderDraftPage({
      ...draft,
      document,
      inCurrentBundle,
      alreadyPublished,
      publishedDiff,
      validation,
      freezeAdd: Boolean(puzzleId && freezeAdds.has(puzzleId)),
      ...freezeFlagsFromPublished(publishedRow, [...contentService.knownPuzzleIds])
    }, { actor }));
  } catch (error) {
    return html(`<p>Draft not found: ${escapeHtml(error instanceof Error ? error.message : String(error))}</p>`, 404);
  }
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const isAdminRoute = url.pathname === "/admin"
      || url.pathname === "/admin/"
      || url.pathname === "/admin/drafts"
      || url.pathname.startsWith("/admin/drafts/")
      || url.pathname === "/admin/catalogues"
      || url.pathname.startsWith("/admin/catalogues/")
      || url.pathname === "/admin/categories"
      || url.pathname.startsWith("/admin/categories/");
    if (url.pathname !== "/mcp" && !isAdminRoute) return new Response("Not Found", { status: 404 });
    if (!expectedHostname(request, env)) {
      return jsonError(421, "Request hostname is not configured for this Worker");
    }

    if (isAdminRoute) {
      const authenticated = await authenticateAccess(request, env);
      if (authenticated instanceof Response) return authenticated;
      const response = await handleAdminRoute(request, env, authenticated.actor);
      return response || new Response("Not Found", { status: 404 });
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
      const publicationService = createHostedPublicationService(env, contentService);
      const handler = createMcpHandler(
        () => createHostedMcpAuthoringServer({
          draftRepository: repository,
          contentDocuments: new D1ContentDocumentRepository(env.AUTHORING_DB),
          contentService,
          publicationService,
          actor: authenticated.actor,
          analytics: env.ANALYTICS
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
