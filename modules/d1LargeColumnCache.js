// Large-column cache in front of the local authoring server's D1 client.
//
// The admin pages list the whole published corpus and the working copies on
// almost every load, and most of those bytes are a few large columns
// (documents, domain JSON, layouts) that rarely change between loads. For the
// list queries registered in LISTS, this wrapper:
//
//   1. fetches every column except the large ones, plus the byte length of
//      each large one;
//   2. reuses a row's cached large columns only while its updated_at,
//      content_hash, revision, and every large column's length are unchanged;
//   3. fetches the remaining rows whole (SELECT * by key, one D1 batch), so
//      each returned row is internally consistent;
//
// and returns the rows SELECT * would have. Small columns are always fresh.
// Every write to a large column must also set updated_at; the test in
// tests/d1-large-column-cache.mjs checks that for every UPDATE in modules/,
// tools/, and new migrations. Every other statement goes straight to D1.
// AUTHORING_D1_CACHE=0 turns the cache off; a restart empties it.
//
// The marker can miss one write: a rewrite of a large column to a value of
// the same length within the same millisecond as the previous write, which
// leaves updated_at unchanged (layout saves change neither content_hash nor
// revision). The list then shows the earlier value until the row's next
// write or a restart. D1 is unaffected, and saves, publishes, and freezes read
// single rows or run in their own process, not through this cache. A hard
// guarantee needs a counter bumped by every write, which a trigger cannot
// supply here (D1 counts trigger writes in meta.changes, which breaks the
// repositories' write guards). Cached values are held to a size budget,
// least recently used first out.
import { recordD1CacheReuse } from "./d1RequestTiming.js";

const MARKER_COLUMNS = ["updated_at", "content_hash", "revision"];
const MISS_CHUNK = 50;
// About 64 MB of cached text: several times today's corpus plus 100
// working copies (about 13 MB).
const DEFAULT_MAX_CACHED_CHARS = 64 * 1024 * 1024;

function normalizeSql(sql) {
  return String(sql || "").replace(/\s+/g, " ").trim();
}

// Each entry is one list query, matched by its exact (whitespace-normalized)
// text. `missWhere`/`missParams` select whole rows for keys that missed,
// scoped the same way as the list.
export const LISTS = Object.freeze([
  {
    table: "published_documents",
    sql: "SELECT * FROM published_documents WHERE kind = ? ORDER BY id",
    large: ["document", "layout_json"],
    key: row => `${row.kind}\u0000${row.id}`,
    missWhere: count => `kind = ? AND id IN (${placeholders(count)})`,
    missParams: (params, rows) => [params[0], ...rows.map(row => row.id)]
  },
  {
    table: "puzzle_drafts",
    sql: "SELECT * FROM puzzle_drafts WHERE owner_subject = ? ORDER BY updated_at DESC LIMIT ?",
    large: ["document", "content_json", "pedagogy_json", "layout_json"],
    key: row => row.id,
    missWhere: count => `owner_subject = ? AND id IN (${placeholders(count)})`,
    missParams: (params, rows) => [params[0], ...rows.map(row => row.id)]
  },
  {
    table: "puzzle_drafts",
    sql: "SELECT * FROM puzzle_drafts WHERE owner_subject = ? AND status = ? ORDER BY updated_at DESC LIMIT ?",
    large: ["document", "content_json", "pedagogy_json", "layout_json"],
    key: row => row.id,
    missWhere: count => `owner_subject = ? AND id IN (${placeholders(count)})`,
    missParams: (params, rows) => [params[0], ...rows.map(row => row.id)]
  }
]);

const listsBySql = new Map(LISTS.map(list => [list.sql, list]));
const caches = new Map();

function placeholders(count) {
  return Array.from({ length: count }, () => "?").join(", ");
}

const lengthAlias = column => `__length_${column}`;

export function d1LargeColumnCacheEnabled(env = process.env) {
  return env?.AUTHORING_D1_CACHE !== "0";
}

/** The registered list a statement is, or null. */
export function cachedListFor(sql) {
  return listsBySql.get(normalizeSql(sql)) || null;
}

/** Empty every cache (tests). */
export function clearD1LargeColumnCache() {
  caches.clear();
}

function stateFor(cacheKey) {
  if (!caches.has(cacheKey)) caches.set(cacheKey, { columns: new Map(), rows: new Map(), chars: 0 });
  return caches.get(cacheKey);
}

// Lengths always come from SQLite's length(), on both the list and the
// whole-row fetch, so the two sides count characters the same way.
function marker(row, large) {
  return JSON.stringify([
    ...MARKER_COLUMNS.map(column => row[column] ?? null),
    ...large.map(column => row[lengthAlias(column)] ?? null)
  ]);
}

function withoutLengths(row, large) {
  const copy = { ...row };
  for (const column of large) delete copy[lengthAlias(column)];
  return copy;
}

function sizeOf(values) {
  return Object.values(values).reduce((total, value) => total + (value == null ? 0 : String(value).length), 0);
}

export function createLargeColumnCachedD1Database(database, {
  cacheKey = "default",
  maxCachedChars = DEFAULT_MAX_CACHED_CHARS
} = {}) {
  const state = stateFor(cacheKey);
  const entryKey = (list, row) => `${list.table}\u0000${list.key(row)}`;

  // Map order is recency: a use moves the entry to the end.
  function remember(key, entry) {
    const previous = state.rows.get(key);
    if (previous) {
      state.rows.delete(key);
      state.chars -= previous.size;
    }
    state.rows.set(key, entry);
    state.chars += entry.size;
  }

  function evict() {
    for (const [key, entry] of state.rows) {
      if (state.chars <= maxCachedChars) break;
      state.rows.delete(key);
      state.chars -= entry.size;
    }
  }

  async function columnsOf(table) {
    if (!state.columns.has(table)) {
      const pending = database.prepare(`PRAGMA table_info(${table})`).all()
        .then(result => result.results.map(row => row.name));
      state.columns.set(table, pending);
      pending.catch(() => state.columns.delete(table));
    }
    return state.columns.get(table);
  }

  async function listAll(list, sql, params) {
    const columns = await columnsOf(list.table);
    const usable = [...MARKER_COLUMNS, ...list.large].every(column => columns.includes(column));
    if (!usable) return database.prepare(sql).bind(...params).all();

    const small = columns.filter(column => !list.large.includes(column));
    const lengths = list.large.map(column => `length(${column}) AS ${lengthAlias(column)}`);
    const projection = [...small, ...lengths].join(", ");
    const listed = await database.prepare(
      `SELECT ${projection} ${list.sql.slice(list.sql.indexOf("FROM "))}`
    ).bind(...params).all();

    const missed = listed.results.filter(row =>
      state.rows.get(entryKey(list, row))?.marker !== marker(row, list.large)
    );
    const missedKeys = new Set(missed.map(list.key));

    const fetched = new Map();
    if (missed.length) {
      const chunks = [];
      for (let start = 0; start < missed.length; start += MISS_CHUNK) {
        chunks.push(missed.slice(start, start + MISS_CHUNK));
      }
      const results = await database.batch(chunks.map(chunk =>
        database.prepare(
          `SELECT *, ${lengths.join(", ")} FROM ${list.table} WHERE ${list.missWhere(chunk.length)}`
        ).bind(...list.missParams(params, chunk))
      ));
      for (const result of results) {
        for (const row of result.results || []) {
          fetched.set(list.key(row), withoutLengths(row, list.large));
          const values = Object.fromEntries(list.large.map(column => [column, row[column]]));
          remember(entryKey(list, row), { marker: marker(row, list.large), values, size: sizeOf(values) });
        }
      }
    }

    const results = [];
    for (const row of listed.results) {
      const key = list.key(row);
      if (fetched.has(key)) {
        results.push(fetched.get(key));
        continue;
      }
      // A row deleted between the list and the fetch is simply absent.
      if (missedKeys.has(key)) continue;
      const entry = state.rows.get(entryKey(list, row));
      remember(entryKey(list, row), entry);
      results.push({ ...withoutLengths(row, list.large), ...entry.values });
    }
    evict();
    recordD1CacheReuse(listed.results.length - missed.length);
    return { success: true, results, meta: listed.meta || {} };
  }

  function listStatement(list, sql, params = []) {
    const bound = {
      sql,
      params,
      bind: (...nextParams) => listStatement(list, sql, nextParams),
      all: () => listAll(list, sql, params),
      async first(column) {
        const row = (await bound.all()).results[0] ?? null;
        if (!row) return null;
        return column ? row[column] ?? null : row;
      },
      run: () => bound.all()
    };
    return bound;
  }

  return {
    prepare(sql) {
      const list = cachedListFor(sql);
      return list ? listStatement(list, sql) : database.prepare(sql);
    },
    batch(statements) {
      return database.batch(statements.map(statement =>
        statement && cachedListFor(statement.sql) && typeof statement.bind === "function"
          ? database.prepare(statement.sql).bind(...(statement.params || []))
          : statement
      ));
    }
  };
}

export default createLargeColumnCachedD1Database;
