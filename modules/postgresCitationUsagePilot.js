// Derived, non-authoritative coverage index for the citation pilot. Refreshing
// it never writes a puzzle, changes publication, or contacts Zotero.

import {
  categoryIdFor,
  subcategoryIdForPuzzle
} from "../puzzles/categories.js";
import { nonCryptographicHash } from "./nonCryptographicHash.js";
import { withTransaction } from "./postgresPool.js";

function normalized(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizedUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.href.replace(/\/$/, "").toLowerCase();
  } catch {
    return normalized(value).replace(/\/$/, "");
  }
}

function doiOf(citation) {
  const direct = normalized(citation.doi || citation.DOI).replace(/^doi:/, "");
  if (direct) return direct;
  const url = String(citation.url || "");
  return normalized(url.match(/^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i)?.[1]);
}

function citationList(document) {
  return [
    ...(Array.isArray(document?.info?.citations) ? document.info.citations : []),
    ...(Array.isArray(document?.learningIntroduction?.citations)
      ? document.learningIntroduction.citations : [])
  ].filter(citation => citation && typeof citation === "object" && !Array.isArray(citation));
}

function topicsOf(document) {
  const authored = Array.isArray(document.categories) && document.categories.length
    ? document.categories : [document.category];
  const ids = [...new Set(authored.map(value => categoryIdFor(value)).filter(Boolean))];
  return ids.map((id, index) => ({
    categoryId: id,
    subcategoryId: subcategoryIdForPuzzle(document, id) || null,
    isPrimary: index === 0
  }));
}

function matchSource(citation, sources) {
  const doi = doiOf(citation);
  const url = normalizedUrl(citation.url);
  const title = normalized(citation.title);
  const year = normalized(citation.year);
  const author = normalized(citation.author);
  const tiers = [
    ["doi", source => doi && normalized(source.metadata?.doi) === doi],
    ["url", source => url && normalizedUrl(source.metadata?.url) === url],
    ["title_author_year", source => title && year && author
      && normalized(source.metadata?.title) === title
      && normalized(source.metadata?.year) === year
      && normalized(source.metadata?.author) === author]
  ];
  for (const [basis, predicate] of tiers) {
    const candidates = sources.filter(predicate);
    if (candidates.length === 1) {
      return { status: "inferred", basis, sourceId: candidates[0].id };
    }
    if (candidates.length > 1) return { status: "ambiguous", basis, sourceId: null };
  }
  return { status: "unmatched", basis: null, sourceId: null };
}

export async function refreshPublishedCitationUsage(pool, sourceRepository) {
  const sources = await sourceRepository.listAll();
  const indexedAt = new Date().toISOString();
  const published = await pool.query(`
    SELECT id, title, document FROM published_documents
    WHERE kind = 'puzzle' AND withdrawn_at IS NULL
    ORDER BY id
  `);
  let citations = 0;
  let inferred = 0;
  await withTransaction(pool, async client => {
    await client.query("DELETE FROM citation_usage_observations");
    for (const row of published.rows) {
      const document = JSON.parse(row.document);
      const topics = topicsOf(document);
      const entries = citationList(document);
      for (let index = 0; index < entries.length; index++) {
        const citation = entries[index];
        const match = matchSource(citation, sources);
        await client.query(`
          INSERT INTO citation_usage_observations (
            puzzle_id, citation_index, citation_json, citation_hash,
            source_id, match_basis, match_status, puzzle_title,
            citation_title, citation_author, citation_year, citation_url,
            indexed_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          row.id, index, JSON.stringify(citation), nonCryptographicHash(citation),
          match.sourceId, match.basis, match.status, row.title,
          String(citation.title || ""), citation.author || null,
          citation.year || null, citation.url || null, indexedAt
        ]);
        for (const topic of topics) {
          await client.query(`
            INSERT INTO citation_usage_topics (
              puzzle_id, citation_index, category_id, subcategory_id, is_primary
            ) VALUES ($1, $2, $3, $4, $5)
          `, [row.id, index, topic.categoryId, topic.subcategoryId,
            topic.isPrimary ? 1 : 0]);
        }
        citations++;
        if (match.status === "inferred") inferred++;
      }
    }
    await client.query(`
      INSERT INTO citation_usage_index_state (id, indexed_at, puzzle_count, observation_count)
      VALUES (1, $1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET
        indexed_at = EXCLUDED.indexed_at,
        puzzle_count = EXCLUDED.puzzle_count,
        observation_count = EXCLUDED.observation_count
    `, [indexedAt, published.rows.length, citations]);
  });
  return { puzzles: published.rows.length, citations, inferred, indexedAt };
}

export class PostgresCitationUsagePilot {
  constructor(pool) {
    this.pool = pool;
  }

  async status() {
    const result = await this.pool.query(`
      SELECT
        (SELECT indexed_at FROM citation_usage_index_state WHERE id = 1) AS indexed_at,
        (SELECT MAX(updated_at) FROM published_documents
         WHERE kind = 'puzzle' AND withdrawn_at IS NULL) AS latest_puzzle_update,
        (SELECT MAX(updated_at) FROM citation_sources) AS latest_source_update,
        (SELECT observation_count FROM citation_usage_index_state WHERE id = 1) AS observations
    `);
    const row = result.rows[0];
    return {
      indexedAt: row.indexed_at,
      latestPuzzleUpdate: row.latest_puzzle_update,
      latestSourceUpdate: row.latest_source_update,
      observations: row.observations == null ? null : Number(row.observations),
      freshness: !row.indexed_at ? "unknown"
        : row.latest_puzzle_update > row.indexed_at
          || row.latest_source_update > row.indexed_at ? "stale" : "current"
    };
  }

  async search({ query, category = null, subcategory = null, sourceId = null, limit = 25 }) {
    const term = String(query || "").trim();
    if (!term && !sourceId && !category && !subcategory) return [];
    const result = await this.pool.query(`
      SELECT DISTINCT o.* FROM citation_usage_observations o
      LEFT JOIN citation_sources s ON s.id = o.source_id
      WHERE ($1::text IS NULL OR o.source_id = $1)
        AND ($2::text = '' OR o.citation_title ILIKE '%' || $2 || '%'
          OR o.citation_author ILIKE '%' || $2 || '%'
          OR o.citation_url ILIKE '%' || $2 || '%'
          OR s.citekey ILIKE '%' || $2 || '%'
          OR s.doi ILIKE '%' || $2 || '%')
        AND ($3::text IS NULL OR EXISTS (
          SELECT 1 FROM citation_usage_topics t
          WHERE t.puzzle_id = o.puzzle_id
            AND t.citation_index = o.citation_index
            AND t.category_id = $3
            AND ($4::text IS NULL OR t.subcategory_id = $4)
        ))
        AND ($3::text IS NOT NULL OR $4::text IS NULL OR EXISTS (
          SELECT 1 FROM citation_usage_topics t
          WHERE t.puzzle_id = o.puzzle_id
            AND t.citation_index = o.citation_index
            AND t.subcategory_id = $4
        ))
      ORDER BY o.puzzle_id, o.citation_index
      LIMIT $5
    `, [sourceId, term, category, subcategory,
      Math.max(1, Math.min(Number(limit) || 25, 100))]);
    const rows = [];
    for (const row of result.rows) {
      const topics = await this.pool.query(`
        SELECT category_id, subcategory_id, is_primary
        FROM citation_usage_topics
        WHERE puzzle_id = $1 AND citation_index = $2
        ORDER BY is_primary DESC, category_id
      `, [row.puzzle_id, row.citation_index]);
      rows.push({
        puzzleId: row.puzzle_id,
        puzzleTitle: row.puzzle_title,
        citationIndex: row.citation_index,
        citation: JSON.parse(row.citation_json),
        matchStatus: row.match_status,
        matchBasis: row.match_basis,
        sourceId: row.source_id,
        indexedAt: row.indexed_at,
        topics: topics.rows.map(topic => ({
          categoryId: topic.category_id,
          subcategoryId: topic.subcategory_id,
          isPrimary: Number(topic.is_primary) === 1
        }))
      });
    }
    return rows;
  }
}
