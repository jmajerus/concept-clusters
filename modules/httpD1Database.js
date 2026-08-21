const DEFAULT_API_BASE = "https://api.cloudflare.com/client/v4";

export class HttpD1Error extends Error {
  constructor(message) {
    super(message);
    this.name = "HttpD1Error";
  }
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

export function createHttpD1Database({
  accountId,
  databaseId,
  token,
  apiBase = DEFAULT_API_BASE,
  fetchImpl = globalThis.fetch
} = {}) {
  if (!accountId || !databaseId || !token) {
    throw new HttpD1Error("D1 HTTP client requires accountId, databaseId, and token");
  }
  if (typeof fetchImpl !== "function") {
    throw new HttpD1Error("D1 HTTP client requires fetch");
  }
  const endpoint = `${String(apiBase).replace(/\/+$/, "")}/accounts/${accountId}/d1/database/${databaseId}/query`;

  async function request(body) {
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
      throw new HttpD1Error(
        `D1 request failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      throw new HttpD1Error(
        `D1 HTTP ${response.status}: response was not JSON`
      );
    }
    if (!response.ok || payload.success === false) {
      throw new HttpD1Error(
        errorMessage(payload, `D1 HTTP ${response.status}`)
      );
    }
    const results = Array.isArray(payload.result) ? payload.result.map(normalizeResult) : [];
    const failed = results.find(entry => entry.success === false);
    if (failed) {
      throw new HttpD1Error(errorMessage(payload, "D1 query failed"));
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
