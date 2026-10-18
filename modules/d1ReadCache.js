// A read cache in front of the local authoring server's D1 HTTP client.
//
// D1 stays the only store. A cached result is reused only while every table
// the query read from still has the version it had when the result was
// fetched; migration 0035 bumps a table's version in content_versions on
// every write, from any writer. Checking costs one small query, and within a
// request the check is reused (for at most VERSION_REUSE_MS) until this
// process writes anything, which makes the next read check again.
//
// Only plain SELECTs are cached: every FROM names one watched table with no
// alias, comma list, JOIN, or CTE. Anything else, and every write, goes
// straight to D1. If content_versions is missing (migration not applied),
// every query goes straight to D1 and the check is retried after a minute.
import { currentD1RequestScope } from "./d1RequestScope.js";

export const WATCHED_TABLES = Object.freeze([
  "published_documents",
  "puzzle_drafts",
  "content_drafts",
  "wiki_link_checks"
]);

const VERSION_REUSE_MS = 5_000;
const UNAVAILABLE_RETRY_MS = 60_000;
const MAX_ENTRIES = 1_000;

const watched = new Set(WATCHED_TABLES);
const caches = new Map();

export function d1ReadCacheEnabled(env = process.env) {
  return env?.AUTHORING_D1_CACHE !== "0";
}

/** The watched tables a SELECT reads from, or null when it is not cacheable. */
export function cacheableTables(sql) {
  const text = String(sql || "").replace(/\s+/g, " ").trim();
  if (!/^SELECT\b/i.test(text) || /\bJOIN\b/i.test(text)) return null;
  const tables = new Set();
  const from = /\bFROM\s+([A-Za-z_][A-Za-z0-9_]*)\s*([^\s]*)/gi;
  let match;
  while ((match = from.exec(text))) {
    const [, table, next] = match;
    if (!watched.has(table)) return null;
    if (next && !/^(WHERE|ORDER|GROUP|LIMIT|\)|;)/i.test(next)) return null;
    tables.add(table);
  }
  return tables.size ? [...tables].sort() : null;
}

function isRead(sql) {
  return /^\s*SELECT\b/i.test(String(sql || ""));
}

function copyResult(result) {
  return {
    ...result,
    results: result.results.map(row => ({ ...row })),
    meta: { ...(result.meta || {}) }
  };
}

function cacheStateFor(key) {
  if (!caches.has(key)) {
    caches.set(key, { entries: new Map(), unavailableUntil: 0, versions: null });
  }
  return caches.get(key);
}

/** Drop every cached result (tests, and a manual reset). */
export function clearD1ReadCache() {
  caches.clear();
}

export function createCachedD1Database(database, {
  cacheKey = "default",
  now = () => Date.now()
} = {}) {
  const state = cacheStateFor(cacheKey);

  function forgetVersions() {
    const scope = currentD1RequestScope();
    if (scope) scope.versions = null;
  }

  async function currentVersions() {
    const scope = currentD1RequestScope();
    const memo = scope?.versions;
    if (memo && now() - memo.checkedAt < VERSION_REUSE_MS) return memo.byTable;
    if (now() < state.unavailableUntil) return null;
    let rows;
    try {
      rows = (await database.prepare(
        "SELECT table_name, version FROM content_versions"
      ).all()).results;
    } catch {
      state.unavailableUntil = now() + UNAVAILABLE_RETRY_MS;
      return null;
    }
    const byTable = new Map(rows.map(row => [row.table_name, Number(row.version)]));
    if (!WATCHED_TABLES.every(table => byTable.has(table))) {
      state.unavailableUntil = now() + UNAVAILABLE_RETRY_MS;
      return null;
    }
    if (scope) scope.versions = { byTable, checkedAt: now() };
    return byTable;
  }

  async function cachedAll(sql, params, inner) {
    const tables = cacheableTables(sql);
    if (!tables) return inner.all();
    const versions = await currentVersions();
    if (!versions) return inner.all();
    const stamp = tables.map(table => `${table}:${versions.get(table)}`).join(",");
    const key = `${sql}\u0000${JSON.stringify(params)}`;
    const hit = state.entries.get(key);
    if (hit && hit.stamp === stamp) {
      const scope = currentD1RequestScope();
      if (scope) scope.cacheHits = (scope.cacheHits || 0) + 1;
      return copyResult(hit.result);
    }
    const result = await inner.all();
    state.entries.delete(key);
    state.entries.set(key, { stamp, result: copyResult(result) });
    if (state.entries.size > MAX_ENTRIES) {
      state.entries.delete(state.entries.keys().next().value);
    }
    return result;
  }

  function statement(inner, sql, params = []) {
    const bound = {
      inner,
      sql,
      params,
      bind(...nextParams) {
        return statement(inner.bind(...nextParams), sql, nextParams);
      },
      async all() {
        if (!isRead(sql)) {
          try {
            return await inner.all();
          } finally {
            forgetVersions();
          }
        }
        return cachedAll(sql, params, inner);
      },
      async first(column) {
        const row = (await bound.all()).results[0] ?? null;
        if (!row) return null;
        return column ? row[column] ?? null : row;
      },
      async run() {
        if (isRead(sql)) return bound.all();
        try {
          return await inner.run();
        } finally {
          forgetVersions();
        }
      }
    };
    return bound;
  }

  return {
    /** False while content_versions is missing or unreadable. */
    cacheAvailable() {
      return now() >= state.unavailableUntil;
    },
    prepare(sql) {
      return statement(database.prepare(sql), sql);
    },
    async batch(statements) {
      try {
        return await database.batch(statements.map(item => item.inner || item));
      } finally {
        forgetVersions();
      }
    }
  };
}

export default createCachedD1Database;
