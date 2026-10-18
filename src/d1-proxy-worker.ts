// D1 proxy for the local authoring server (wrangler.d1-proxy.jsonc).
//
// The local server reaches D1 over the network. Through the D1 REST API every
// query costs a full round trip into Cloudflare's API (about 140ms at
// minimum); through this Worker's binding it costs one hop to the nearest
// Cloudflare location. The proxy accepts the REST API's own /query request
// shape and answers in its response shape, so modules/httpD1Database.js only
// changes its endpoint and token (AUTHORING_D1_PROXY_URL and
// AUTHORING_D1_PROXY_TOKEN in modules/localD1Config.js).
//
// It executes any SQL it is given, so the bearer token is as powerful as a
// D1-edit API token. Without D1_PROXY_TOKEN set, every request is refused.

type Statement = { sql: string; params?: unknown[] };
type QueryBody = Statement | { batch: Statement[] };

export interface D1ProxyEnv {
  AUTHORING_DB: D1Database;
  D1_PROXY_TOKEN?: string;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

function failure(message: string, status: number): Response {
  return json({ success: false, errors: [{ message }], result: [] }, status);
}

async function digest(value: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
}

async function authorized(request: Request, expected: string): Promise<boolean> {
  const header = request.headers.get("Authorization") || "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!presented) return false;
  // Equal-length digests let timingSafeEqual compare without leaking length.
  const [left, right] = await Promise.all([digest(presented), digest(expected)]);
  // A Workers extension of SubtleCrypto, missing from the generated types.
  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean;
  };
  return subtle.timingSafeEqual(left, right);
}

function isStatement(value: unknown): value is Statement {
  const statement = value as Statement;
  return Boolean(statement)
    && typeof statement.sql === "string"
    && statement.sql.trim().length > 0
    && (statement.params === undefined || Array.isArray(statement.params));
}

function prepared(database: D1Database, statement: Statement): D1PreparedStatement {
  const query = database.prepare(statement.sql);
  return statement.params?.length ? query.bind(...statement.params) : query;
}

function restResult(result: D1Result) {
  return { success: result.success, results: result.results ?? [], meta: result.meta ?? {} };
}

export async function handleD1ProxyRequest(request: Request, env: D1ProxyEnv): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== "/query") return failure("Not found", 404);
  if (request.method !== "POST") return failure("Method not allowed", 405);
  if (!env.D1_PROXY_TOKEN) return failure("D1 proxy token is not configured", 503);
  if (!(await authorized(request, env.D1_PROXY_TOKEN))) return failure("Unauthorized", 401);

  let body: QueryBody;
  try {
    body = await request.json();
  } catch {
    return failure("Request body must be JSON", 400);
  }

  const batch = (body as { batch?: unknown }).batch;
  const statements = Array.isArray(batch) ? batch : [body];
  if (!statements.length || !statements.every(isStatement)) {
    return failure("Expected { sql, params? } or { batch: [{ sql, params? }] }", 400);
  }

  try {
    const results = Array.isArray(batch)
      ? await env.AUTHORING_DB.batch(statements.map(item => prepared(env.AUTHORING_DB, item)))
      : [await prepared(env.AUTHORING_DB, statements[0]).all()];
    return json({ success: true, errors: [], result: results.map(restResult) });
  } catch (error) {
    // The message reaches the repositories unchanged: they recognise
    // constraint and missing-column errors by its text.
    return failure(error instanceof Error ? error.message : String(error), 400);
  }
}

export default {
  fetch: (request: Request, env: D1ProxyEnv) => handleD1ProxyRequest(request, env)
} satisfies ExportedHandler<D1ProxyEnv>;
