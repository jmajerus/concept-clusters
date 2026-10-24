// The authoring-side mirror of Zotero's curated Concept Clusters collection.
// Callers verify collection membership and the assigned citekey in Zotero
// before storing a snapshot here. Published puzzles will pin a revision;
// refreshing this mirror never changes an older revision.

import { randomUUID } from "node:crypto";
import { nonCryptographicHash } from "./nonCryptographicHash.js";
import { withTransaction } from "./postgresPool.js";

function nonEmpty(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value.trim();
}

function optionalText(value) {
  if (value == null || value === "") return null;
  return String(value).trim() || null;
}

function sortedJson(value) {
  if (Array.isArray(value)) return value.map(sortedJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map(key => [key, sortedJson(value[key])])
    );
  }
  return value;
}

function snapshotMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("Citation metadata must be an object");
  }
  nonEmpty(metadata.title, "Citation title");
  let copy;
  try {
    copy = JSON.parse(JSON.stringify(sortedJson(metadata)));
  } catch {
    throw new Error("Citation metadata must be JSON-serializable");
  }
  return {
    json: JSON.stringify(copy),
    hash: nonCryptographicHash(copy),
    title: nonEmpty(copy.title, "Citation title"),
    author: optionalText(copy.author),
    year: optionalText(copy.year),
    doi: optionalText(copy.doi || copy.DOI),
    url: optionalText(copy.url)
  };
}

function sourceRecord(row, revisionRow = null) {
  if (!row) return null;
  return {
    id: row.id,
    zoteroLibrary: row.zotero_library,
    zoteroItemKey: row.zotero_item_key,
    zoteroCollectionKey: row.zotero_collection_key,
    citekey: row.citekey,
    currentRevision: Number(row.current_revision),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(revisionRow ? {
      metadata: JSON.parse(revisionRow.metadata_json),
      contentHash: revisionRow.content_hash,
      capturedAt: revisionRow.captured_at
    } : {})
  };
}

async function readRevision(client, row) {
  if (!row) return null;
  const result = await client.query(`
    SELECT metadata_json, content_hash, captured_at
    FROM citation_source_revisions
    WHERE source_id = $1 AND revision = $2
  `, [row.id, row.current_revision]);
  if (!result.rows[0]) throw new Error(`Citation source ${row.id} has no current revision`);
  return sourceRecord(row, result.rows[0]);
}

export class PostgresCitationSourceRepository {
  constructor(pool) {
    if (!pool) throw new Error("A Postgres pool is required");
    this.pool = pool;
  }

  async getByZoteroIdentity({ zoteroLibrary, zoteroItemKey }) {
    const result = await this.pool.query(`
      SELECT * FROM citation_sources
      WHERE zotero_library = $1 AND zotero_item_key = $2
    `, [nonEmpty(zoteroLibrary, "Zotero library"), nonEmpty(zoteroItemKey, "Zotero item key")]);
    return readRevision(this.pool, result.rows[0]);
  }

  async getByCitekey({ zoteroLibrary, citekey }) {
    const result = await this.pool.query(`
      SELECT * FROM citation_sources
      WHERE zotero_library = $1 AND LOWER(citekey) = LOWER($2)
      ORDER BY (citekey = $2) DESC
      LIMIT 1
    `, [nonEmpty(zoteroLibrary, "Zotero library"), nonEmpty(citekey, "Citekey")]);
    return readRevision(this.pool, result.rows[0]);
  }

  async getById({ id }) {
    const result = await this.pool.query(
      "SELECT * FROM citation_sources WHERE id = $1",
      [nonEmpty(id, "Citation source id")]
    );
    return readRevision(this.pool, result.rows[0]);
  }

  async listAll() {
    const result = await this.pool.query("SELECT * FROM citation_sources ORDER BY id");
    const sources = [];
    for (const row of result.rows) sources.push(await readRevision(this.pool, row));
    return sources;
  }

  async search({ query, limit = 10 }) {
    const term = nonEmpty(query, "Citation search query");
    const result = await this.pool.query(`
      SELECT * FROM citation_sources
      WHERE LOWER(citekey) = LOWER($1)
         OR LOWER(doi) = LOWER($1)
         OR LOWER(url) = LOWER($1)
         OR title ILIKE '%' || $1 || '%'
         OR author ILIKE '%' || $1 || '%'
      ORDER BY
        CASE WHEN LOWER(citekey) = LOWER($1) OR LOWER(doi) = LOWER($1)
          THEN 0 ELSE 1 END,
        title
      LIMIT $2
    `, [term, Math.max(1, Math.min(Number(limit) || 10, 25))]);
    const sources = [];
    for (const row of result.rows) sources.push(await readRevision(this.pool, row));
    return sources;
  }

  async getRevision({ id, revision }) {
    if (!Number.isInteger(revision) || revision < 1) {
      throw new Error("Citation revision must be a positive integer");
    }
    const result = await this.pool.query(`
      SELECT s.*, r.metadata_json, r.content_hash, r.captured_at
      FROM citation_sources s
      JOIN citation_source_revisions r ON r.source_id = s.id
      WHERE s.id = $1 AND r.revision = $2
    `, [nonEmpty(id, "Citation source id"), revision]);
    const row = result.rows[0];
    return row ? { ...sourceRecord(row, row), revision } : null;
  }

  async upsertFromZotero({
    zoteroLibrary,
    zoteroItemKey,
    zoteroCollectionKey,
    citekey,
    metadata
  }) {
    const library = nonEmpty(zoteroLibrary, "Zotero library");
    const itemKey = nonEmpty(zoteroItemKey, "Zotero item key");
    const collectionKey = nonEmpty(zoteroCollectionKey, "Zotero collection key");
    const assignedCitekey = nonEmpty(citekey, "Zotero-assigned citekey");
    const snapshot = snapshotMetadata(metadata);
    const now = new Date().toISOString();

    return withTransaction(this.pool, async client => {
      const id = randomUUID();
      await client.query(`
        INSERT INTO citation_sources (
          id, zotero_library, zotero_item_key, zotero_collection_key,
          citekey, title, author, year, doi, url, current_revision,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, $11, $11)
        ON CONFLICT (zotero_library, zotero_item_key) DO NOTHING
      `, [
        id, library, itemKey, collectionKey, assignedCitekey,
        snapshot.title, snapshot.author, snapshot.year, snapshot.doi,
        snapshot.url, now
      ]);
      const locked = await client.query(`
        SELECT * FROM citation_sources
        WHERE zotero_library = $1 AND zotero_item_key = $2 FOR UPDATE
      `, [library, itemKey]);
      const current = locked.rows[0];
      if (!current) throw new Error("Citation source disappeared during upsert");
      const existing = await client.query(`
        SELECT content_hash FROM citation_source_revisions
        WHERE source_id = $1 AND revision = $2
      `, [current.id, current.current_revision]);
      const changed = !existing.rows[0]
        || existing.rows[0].content_hash !== snapshot.hash;
      const revision = Number(current.current_revision) + (existing.rows[0] && changed ? 1 : 0);

      if (changed) {
        await client.query(`
          INSERT INTO citation_source_revisions (
            source_id, revision, metadata_json, content_hash, captured_at
          ) VALUES ($1, $2, $3, $4, $5)
        `, [current.id, revision, snapshot.json, snapshot.hash, now]);
      }
      if (changed || current.citekey !== assignedCitekey
          || current.zotero_collection_key !== collectionKey) {
        await client.query(`
          UPDATE citation_sources SET
            zotero_collection_key = $2, citekey = $3, title = $4,
            author = $5, year = $6, doi = $7, url = $8,
            current_revision = $9, updated_at = $10
          WHERE id = $1
        `, [
          current.id, collectionKey, assignedCitekey, snapshot.title,
          snapshot.author, snapshot.year, snapshot.doi, snapshot.url,
          revision, now
        ]);
      }
      const row = await client.query(
        "SELECT * FROM citation_sources WHERE id = $1",
        [current.id]
      );
      return readRevision(client, row.rows[0]);
    });
  }
}
