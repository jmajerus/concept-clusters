import { d1CommitOutcomeUnknown } from "./d1CommitOutcome.js";
import { recordD1Query } from "./d1RequestTiming.js";

const DEFAULT_API_BASE = "https://api.cloudflare.com/client/v4";

export class HttpD1Error extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "HttpD1Error";
    if (options.outcomeUnknown) this.outcomeUnknown = true;
  }
}

function httpD1Error(message) {
  return new HttpD1Error(message, {
    outcomeUnknown: d1CommitOutcomeUnknown(message)
  });
}

function queryPayload(body) {
  if (body && Array.isArray(body.batch)) {
    return {
      batch: body.batch.map(item => ({
        sql: item.sql,
        ...(item.params?.length ? { params: item.params } : {})
      }))
    };
  }
  return {
    sql: body.sql,
    ...(body.params?.length ? { params: body.params } : {})
  };
}

function errorMessage(payload, fallback) {
  const parts = (payload?.errors || [])
    .map(entry => entry?.message)
    .filter(Boolean);
  return parts.length ? parts.join("; ") : fallback;
}

function normalizeResult(entry) {
  return {
    success: entry?.success !== false,
    results: Array.isArray(entry?.results) ? entry.results : [],
    meta: entry?.meta || {}
  };
}

/**
 * @param {{
 *   accountId?: string,
 *   databaseId?: string,
 *   token?: string,
 *   apiBase?: string,
 *   endpoint?: string,
 *   fetchImpl?: typeof fetch
 * }} [options]
 */
export function createHttpD1Database({
  accountId,
  databaseId,
  token,
  apiBase = DEFAULT_API_BASE,
  endpoint: endpointOverride = "",
  fetchImpl = globalThis.fetch
} = {}) {
  if (!token || (!endpointOverride && (!accountId || !databaseId))) {
    throw new HttpD1Error("D1 HTTP client requires a token and either an endpoint or accountId and databaseId");
  }
  if (typeof fetchImpl !== "function") {
    throw new HttpD1Error("D1 HTTP client requires fetch");
  }
  // An endpoint override is the D1 proxy Worker (src/d1-proxy-worker.ts),
  // which speaks the REST API's /query request and response shapes.
  const endpoint = endpointOverride || `${String(apiBase).replace(/\/+$/, "")}/accounts/${accountId}/d1/database/${databaseId}/query`;

  async function request(body) {
    const startedAt = performance.now();
    const received = { bytes: 0 };
    try {
      return await send(body, received);
    } finally {
      recordD1Query(body, startedAt, performance.now(), received.bytes);
    }
  }

  async function send(body, received) {
    let response;
    try {
      response = await fetchImpl(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(queryPayload(body))
      });
    } catch (error) {
      // No response at all: the statement may already have committed.
      throw new HttpD1Error(
        `D1 request failed: ${error instanceof Error ? error.message : String(error)}`,
        { outcomeUnknown: true }
      );
    }
    let text;
    try {
      text = await response.text();
    } catch (error) {
      // The statement was sent. A body that never arrives can follow a commit.
      throw new HttpD1Error(
        `D1 request failed: ${error instanceof Error ? error.message : String(error)}`,
        { outcomeUnknown: true }
      );
    }
    received.bytes = Buffer.byteLength(text, "utf8");
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      throw new HttpD1Error(
        `D1 HTTP ${response.status}: response was not JSON`,
        { outcomeUnknown: true }
      );
    }
    if (!response.ok || payload.success === false) {
      throw httpD1Error(errorMessage(payload, `D1 HTTP ${response.status}`));
    }
    const results = Array.isArray(payload.result) ? payload.result.map(normalizeResult) : [];
    const failed = results.find(entry => entry.success === false);
    if (failed) {
      throw httpD1Error(errorMessage(payload, "D1 query failed"));
    }
    return results;
  }

  function statement(sql, params = []) {
    const bound = {
      sql,
      params,
      bind(...nextParams) {
        return statement(sql, nextParams);
      },
      async all() {
        const [result] = await request({ sql, params });
        return result || { success: true, results: [], meta: {} };
      },
      async first(column) {
        const row = (await bound.all()).results[0] ?? null;
        if (!row) return null;
        return column ? row[column] ?? null : row;
      },
      async run() {
        return bound.all();
      }
    };
    return bound;
  }

  return {
    prepare(sql) {
      return statement(sql);
    },
    async batch(statements) {
      const results = await request({
        batch: statements.map(item => ({
          sql: item.sql,
          params: item.params || []
        }))
      });
      return results;
    }
  };
}

export default createHttpD1Database;
