// The hosted authoring Worker no longer serves MCP or the weekly link-health
// sweep. Remote MCP terminates on the LAN authoring server behind Cloudflare
// Access, and the Monday sweep runs on that server's timer. This Worker
// answers 410 so a stale bookmark says what happened.
//
// Admin moved earlier, for the same reason: one authoring path. See
// docs/dev-briefs/hosted-worker-scope.md and
// docs/dev-briefs/authoring-postgres-on-the-lan.md.
//
// Gameplay stays on the play Worker, which reads published D1 rows.

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

function retired(message: string): Response {
  return html(`<h1>Moved</h1><p>${message}</p>`, 410);
}

export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const isRetiredAdminRoute = url.pathname === "/admin"
      || url.pathname.startsWith("/admin/");
    if (isRetiredAdminRoute) {
      return retired(
        "Authoring admin runs on the LAN authoring server. This Worker no longer serves it."
      );
    }
    if (url.pathname === "/mcp") {
      return retired(
        "MCP has moved to the LAN authoring server. Connect to that server's /mcp."
      );
    }
    return new Response("Not Found", { status: 404 });
  }
} satisfies ExportedHandler<Env>;
