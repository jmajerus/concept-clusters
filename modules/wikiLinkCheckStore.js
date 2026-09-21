// Durable store of Wikipedia title resolutions (d1/migrations/0025). D1 is
// the cache: the local stdio server, the hosted worker, the weekly cron, and
// the CLI all read and write the same rows, so a title the cron checked on
// Monday is not asked again by a draft page on Tuesday. Freshness is one
// comparison on checked_at; there is no invalidation logic to get wrong.

const SELECT_CHUNK = 100;

function rowToResolution(row) {
  return {
    exists: Number(row.page_exists) === 1,
    disambiguation: Number(row.disambiguation) === 1,
    resolvedTitle: row.resolved_title || null
  };
}

/**
 * @typedef {{
 *   readFresh: (titles: string[], options: { maxAgeMs: number, now: number }) => Promise<Map<string, import("./wikipediaTitles.js").TitleResolution>>,
 *   write: (resolutions: Map<string, import("./wikipediaTitles.js").TitleResolution>, options: { now: number }) => Promise<void>,
 *   readAll: () => Promise<Map<string, import("./wikipediaTitles.js").TitleResolution & { checkedAt: string }>>
 * }} WikiLinkCheckStore
 */

/** @returns {WikiLinkCheckStore} */
export function createD1WikiLinkCheckStore(database) {
  if (!database || typeof database.prepare !== "function") {
    throw new Error("createD1WikiLinkCheckStore requires a D1 database binding");
  }
  return {
    async readFresh(titles, { maxAgeMs, now }) {
      const unique = [...new Set(titles.filter(title => typeof title === "string" && title.trim()))];
      const fresh = new Map();
      if (!unique.length) return fresh;
      const since = new Date(now - maxAgeMs).toISOString();
      for (let i = 0; i < unique.length; i += SELECT_CHUNK) {
        const chunk = unique.slice(i, i + SELECT_CHUNK);
        const placeholders = chunk.map(() => "?").join(", ");
        const { results } = await database.prepare(`
          SELECT title, page_exists, disambiguation, resolved_title
          FROM wiki_link_checks
          WHERE checked_at >= ? AND title IN (${placeholders})
        `).bind(since, ...chunk).all();
        for (const row of results || []) fresh.set(row.title, rowToResolution(row));
      }
      return fresh;
    },
    async write(resolutions, { now }) {
      if (!resolutions.size) return;
      const checkedAt = new Date(now).toISOString();
      const statements = [];
      for (const [title, resolution] of resolutions) {
        statements.push(database.prepare(`
          INSERT INTO wiki_link_checks (title, page_exists, disambiguation, resolved_title, checked_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(title) DO UPDATE SET
            page_exists = excluded.page_exists,
            disambiguation = excluded.disambiguation,
            resolved_title = excluded.resolved_title,
            checked_at = excluded.checked_at
        `).bind(
          title,
          resolution.exists ? 1 : 0,
          resolution.disambiguation ? 1 : 0,
          resolution.resolvedTitle || null,
          checkedAt
        ));
      }
      await database.batch(statements);
    },
    async readAll() {
      const { results } = await database.prepare(`
        SELECT title, page_exists, disambiguation, resolved_title, checked_at
        FROM wiki_link_checks
      `).all();
      const all = new Map();
      for (const row of results || []) {
        all.set(row.title, { ...rowToResolution(row), checkedAt: row.checked_at });
      }
      return all;
    }
  };
}

/** In-memory store with the same contract, for tests and D1-less runs. */
export function createMemoryWikiLinkCheckStore() {
  const rows = new Map();
  return {
    async readFresh(titles, { maxAgeMs, now }) {
      const fresh = new Map();
      for (const title of new Set(titles)) {
        const row = rows.get(title);
        if (row && now - row.checkedAt < maxAgeMs) fresh.set(title, { ...row.resolution });
      }
      return fresh;
    },
    async write(resolutions, { now }) {
      for (const [title, resolution] of resolutions) {
        rows.set(title, { resolution: { ...resolution }, checkedAt: now });
      }
    },
    async readAll() {
      const all = new Map();
      for (const [title, row] of rows) {
        all.set(title, { ...row.resolution, checkedAt: new Date(row.checkedAt).toISOString() });
      }
      return all;
    },
    /** Test seam. */
    size() {
      return rows.size;
    }
  };
}
