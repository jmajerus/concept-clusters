// One-way replica of the current public rows, LAN Postgres to D1.
// The queue keeps one pending sync per kind and id. A later edit replaces
// the earlier one. The drain ships a puzzle with the categories it
// references and the catalogues that include it, and a dropped connection
// leaves the queue row in place so the same snapshot can be sent again.

import { randomUUID } from "node:crypto";
import { draftContentHash } from "./draftRepository.js";
import { authoringDatabaseUrl } from "./postgresPool.js";
import { normalizeSiteSettings } from "./siteSettings.js";

export const SITE_SETTINGS_REPLICA_ID = "public";

const QUEUE_UPSERT = `
  INSERT INTO published_replica_queue (
    kind, id, generation, content_hash, enqueued_at
  ) VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (kind, id) DO UPDATE SET
    generation = excluded.generation,
    content_hash = excluded.content_hash,
    enqueued_at = excluded.enqueued_at
`;

export function publicReplicaHash(row) {
  const publishedAt = row.publishedAt || row.published_at || null;
  return draftContentHash(JSON.stringify({
    contentHash: row.contentHash || row.content_hash,
    layoutJson: row.layoutJson ?? row.layout_json ?? null,
    withdrawnAt: row.withdrawnAt || row.withdrawn_at || null,
    firstPublishedAt: row.firstPublishedAt || row.first_published_at || publishedAt,
    publishedAt,
    contentRevisedAt: row.contentRevisedAt || row.content_revised_at || null
  }));
}

export function siteSettingsReplicaHash(settings) {
  return draftContentHash(JSON.stringify(normalizeSiteSettings(settings)));
}

export function categoryReferences(document) {
  const refs = [];
  if (typeof document?.category === "string" && document.category.trim()) {
    refs.push(document.category.trim());
  }
  if (Array.isArray(document?.categories)) {
    for (const value of document.categories) {
      if (typeof value === "string" && value.trim()) refs.push(value.trim());
    }
  }
  return [...new Set(refs)];
}

export function resolveCategoryIds(document, categories = []) {
  const byId = new Set(categories.map(row => row.id));
  const byTitle = new Map();
  for (const row of categories) {
    if (!row.title) continue;
    if (!byTitle.has(row.title)) byTitle.set(row.title, row.id);
    else if (byTitle.get(row.title) !== row.id) byTitle.set(row.title, null);
  }
  const ids = [];
  for (const ref of categoryReferences(document)) {
    if (byId.has(ref)) ids.push(ref);
    else if (byTitle.get(ref)) ids.push(byTitle.get(ref));
    else ids.push(ref);
  }
  return [...new Set(ids)];
}

export function catalogueListsPuzzle(document, puzzleId) {
  return Array.isArray(document?.entries)
    && document.entries.some(entry => entry && entry.id === puzzleId);
}

function parseStoredDocument(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} contains invalid JSON: ${error.message}`);
  }
}

async function oneRow(client, kind, id) {
  const { rows } = await client.query(
    "SELECT * FROM published_documents WHERE kind = $1 AND id = $2",
    [kind, id]
  );
  return rows[0] || null;
}

async function rowsOfKind(client, kind) {
  const { rows } = await client.query(
    "SELECT * FROM published_documents WHERE kind = $1 ORDER BY id",
    [kind]
  );
  return rows;
}

async function upsertQueue(client, member, generation, now) {
  await client.query(QUEUE_UPSERT, [
    member.kind,
    member.id,
    generation,
    member.hash,
    now
  ]);
}

// The changed row, plus a pending puzzle's categories and the catalogues
// that include it, so the drain can send them as one generation.
export async function enqueueDocumentReplica(client, { kind, id }) {
  const generation = randomUUID();
  const now = new Date().toISOString();
  const categories = kind === "puzzle" || kind === "category"
    ? await rowsOfKind(client, "category")
    : [];
  const catalogues = kind === "puzzle" || kind === "category"
    ? await rowsOfKind(client, "catalogue")
    : [];
  const members = new Map();

  function add(row) {
    if (!row) return;
    members.set(`${row.kind}:${row.id}`, {
      kind: row.kind,
      id: row.id,
      hash: publicReplicaHash(row)
    });
  }

  async function addPuzzle(puzzleId) {
    const puzzle = await oneRow(client, "puzzle", puzzleId);
    if (!puzzle) return;
    add(puzzle);
    const document = parseStoredDocument(puzzle.document, `Published puzzle ${puzzleId}`);
    for (const categoryId of resolveCategoryIds(document, categories)) {
      add(categories.find(row => row.id === categoryId));
    }
    for (const catalogue of catalogues) {
      const document = parseStoredDocument(catalogue.document, `Published catalogue ${catalogue.id}`);
      if (catalogueListsPuzzle(document, puzzleId)) add(catalogue);
    }
  }

  if (kind === "puzzle") {
    await addPuzzle(id);
  } else if (kind === "category") {
    add(await oneRow(client, "category", id));
    const pending = await client.query(
      "SELECT id FROM published_replica_queue WHERE kind = 'puzzle'"
    );
    for (const row of pending.rows) await addPuzzle(row.id);
  } else if (kind === "catalogue") {
    add(await oneRow(client, "catalogue", id));
  }
  for (const member of members.values()) {
    await upsertQueue(client, member, generation, now);
  }
}

export async function enqueueSiteSettingsReplica(client, settings) {
  const now = new Date().toISOString();
  await upsertQueue(client, {
    kind: "site_settings",
    id: SITE_SETTINGS_REPLICA_ID,
    hash: siteSettingsReplicaHash(settings)
  }, randomUUID(), now);
}

function settingsFromRows(rows) {
  const raw = {};
  for (const row of rows) {
    try {
      raw[row.key] = JSON.parse(row.value_json);
    } catch {
      // An unreadable row falls back to the default like a missing one.
    }
  }
  return normalizeSiteSettings(raw);
}

async function readPostgresSettings(pool) {
  const { rows } = await pool.query("SELECT key, value_json FROM site_settings ORDER BY key");
  return settingsFromRows(rows);
}

async function d1All(d1, sql, params = []) {
  const statement = d1.prepare(sql);
  const bound = params.length ? statement.bind(...params) : statement;
  const { results = [] } = await bound.all();
  return results;
}

async function readD1Documents(d1, members) {
  const found = new Map();
  const byKind = new Map();
  for (const member of members) {
    if (member.kind === "site_settings") continue;
    const ids = byKind.get(member.kind) || [];
    ids.push(member.id);
    byKind.set(member.kind, ids);
  }
  for (const [kind, ids] of byKind) {
    const placeholders = ids.map(() => "?").join(", ");
    const rows = await d1All(
      d1,
      `SELECT kind, id, title, document, content_hash, revision, published_by,
              published_at, first_published_at, content_revised_at, updated_at,
              withdrawn_at, layout_json
       FROM published_documents
       WHERE kind = ? AND id IN (${placeholders})`,
      [kind, ...ids]
    );
    for (const row of rows) found.set(`${row.kind}:${row.id}`, row);
  }
  return found;
}

function documentStatement(row, exists) {
  if (exists) {
    return {
      sql: `UPDATE published_documents
        SET title = ?, document = ?, content_hash = ?, revision = ?,
            published_by = ?, published_at = ?, first_published_at = ?,
            updated_at = ?, withdrawn_at = ?, layout_json = ?,
            content_revised_at = ?
        WHERE kind = ? AND id = ?`,
      params: [
        row.title,
        row.document,
        row.content_hash,
        Number(row.revision),
        row.published_by,
        row.published_at,
        row.first_published_at,
        row.updated_at,
        row.withdrawn_at,
        row.layout_json,
        row.content_revised_at,
        row.kind,
        row.id
      ]
    };
  }
  return {
    sql: `INSERT INTO published_documents (
      kind, id, title, document, content_hash, revision,
      published_by, published_at, first_published_at, updated_at,
      withdrawn_at, layout_json, content_revised_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      row.kind,
      row.id,
      row.title,
      row.document,
      row.content_hash,
      Number(row.revision),
      row.published_by,
      row.published_at,
      row.first_published_at,
      row.updated_at,
      row.withdrawn_at,
      row.layout_json,
      row.content_revised_at
    ]
  };
}

function settingsStatements(desired, d1Rows) {
  const current = settingsFromRows(d1Rows);
  if (siteSettingsReplicaHash(current) === siteSettingsReplicaHash(desired)) return [];
  const entries = Object.entries(desired);
  if (!entries.length) return [{ sql: "DELETE FROM site_settings", params: [] }];
  const now = new Date().toISOString();
  const statements = entries.map(([key, value]) => ({
    sql: `INSERT INTO site_settings (key, value_json, updated_at, updated_by)
      VALUES (?, ?, ?, NULL)
      ON CONFLICT(key) DO UPDATE SET
        value_json = excluded.value_json,
        updated_at = excluded.updated_at,
        updated_by = excluded.updated_by`,
    params: [key, JSON.stringify(value), now]
  }));
  const keep = new Set(entries.map(([key]) => key));
  const extras = d1Rows.map(row => row.key).filter(key => !keep.has(key));
  if (extras.length) {
    statements.push({
      sql: `DELETE FROM site_settings WHERE key IN (${extras.map(() => "?").join(", ")})`,
      params: extras
    });
  }
  return statements;
}

// Categories first, then a puzzle that is still public, then catalogues,
// then withdrawals. A failed later statement leaves the category in place
// and the puzzle unsent. A catalogue that drops a puzzle is written before
// that puzzle is withdrawn.
export function replicaWriteOrder(rows) {
  const rank = row => {
    if (row.kind === "category") return 0;
    if (row.kind === "puzzle" && !row.withdrawn_at) return 1;
    if (row.kind === "catalogue") return 2;
    if (row.kind === "puzzle") return 3;
    return 4;
  };
  return [...rows].sort((left, right) => rank(left) - rank(right)
    || String(left.kind).localeCompare(String(right.kind))
    || String(left.id).localeCompare(String(right.id)));
}

async function clearShipped(pool, shipped) {
  for (const member of shipped) {
    await pool.query(`
      DELETE FROM published_replica_queue
      WHERE kind = $1 AND id = $2 AND content_hash = $3
    `, [member.kind, member.id, member.hash]);
  }
}

async function applyReplicaBatch(d1, statements) {
  if (!statements.length) return;
  await d1.batch(statements.map(statement => {
    const prepared = d1.prepare(statement.sql);
    return statement.params.length ? prepared.bind(...statement.params) : prepared;
  }));
}

async function listPending(pool) {
  const { rows } = await pool.query(`
    SELECT kind, id, generation, content_hash, enqueued_at
    FROM published_replica_queue
    ORDER BY enqueued_at, kind, id
  `);
  return rows;
}

// What /admin shows for the public replica: one row per queued kind and
// id, plus live puzzles the drain will not ship until a category exists.
export async function loadPublishedReplicaStatus(pool) {
  const { rows } = await pool.query(`
    SELECT q.kind, q.id, q.enqueued_at, d.title, d.document, d.withdrawn_at
    FROM published_replica_queue q
    LEFT JOIN published_documents d ON d.kind = q.kind AND d.id = q.id
    ORDER BY q.enqueued_at, q.kind, q.id
  `);
  const { rows: categories } = await pool.query(`
    SELECT id, title FROM published_documents WHERE kind = 'category' ORDER BY id
  `);
  const pending = rows.map(row => ({
    kind: row.kind,
    id: row.id,
    title: row.kind === "site_settings" ? "Site settings" : (row.title || row.id),
    enqueuedAt: row.enqueued_at
  }));
  const held = [];
  for (const row of rows) {
    if (row.kind !== "puzzle" || row.withdrawn_at || !row.document) continue;
    let document;
    try {
      document = JSON.parse(row.document);
    } catch {
      continue;
    }
    const missing = resolveCategoryIds(document, categories)
      .filter(id => !categories.some(category => category.id === id));
    if (!missing.length) continue;
    held.push({ id: row.id, title: row.title || row.id, missing });
  }
  return { pending, held };
}

function catalogueDocument(row) {
  return parseStoredDocument(row.document, `Published catalogue ${row.id}`);
}

function puzzleDocument(row) {
  return parseStoredDocument(row.document, `Published puzzle ${row.id}`);
}

async function shipDocuments(pool, d1, rows) {
  const current = replicaWriteOrder(rows);
  const remote = await readD1Documents(d1, current);
  const statements = [];
  const shipped = current.map(row => ({
    kind: row.kind,
    id: row.id,
    hash: publicReplicaHash(row)
  }));
  for (const row of current) {
    const existing = remote.get(`${row.kind}:${row.id}`);
    if (existing && publicReplicaHash(existing) === publicReplicaHash(row)) continue;
    statements.push(documentStatement(row, Boolean(existing)));
  }
  await applyReplicaBatch(d1, statements);
  await clearShipped(pool, shipped);
  return shipped.length;
}

async function shipSettings(pool, d1, queued) {
  const desired = await readPostgresSettings(pool);
  const hash = siteSettingsReplicaHash(desired);
  const remote = await d1All(d1, "SELECT key, value_json FROM site_settings");
  await applyReplicaBatch(d1, settingsStatements(desired, remote));
  await clearShipped(pool, [{ kind: queued.kind, id: queued.id, hash }]);
  return 1;
}

function listsPendingPuzzle(catalogue, pendingPuzzleIds) {
  const document = catalogueDocument(catalogue);
  return [...pendingPuzzleIds].some(id => catalogueListsPuzzle(document, id));
}

// Direct publishes, seeds, and content:canonicalize --apply-d1 would
// overwrite the replica the drain is responsible for.
export function refuseDirectPublishedD1Write(env = process.env) {
  if (!authoringDatabaseUrl(env)) return;
  throw new Error(
    "D1 published rows are a replica of the LAN Postgres corpus. " +
    "Write Postgres and let the replica drain copy them. " +
    "A direct D1 publish, seed, or --apply-d1 would fight that drain."
  );
}

async function shipQueuedDocument(pool, d1, queued) {
  const row = await oneRow(pool, queued.kind, queued.id);
  if (!row) {
    await clearShipped(pool, [{
      kind: queued.kind,
      id: queued.id,
      hash: queued.content_hash
    }]);
    return 0;
  }
  return shipDocuments(pool, d1, [row]);
}

export async function drainPublishedReplica({ pool, d1 } = {}) {
  if (!pool || !d1) return { shipped: 0, held: 0, failed: false };
  let shipped = 0;
  const heldPuzzles = new Set();
  while (true) {
    const pending = await listPending(pool);
    if (!pending.length) break;
    const livePuzzleIds = new Set();
    for (const queued of pending.filter(row => row.kind === "puzzle")) {
      const row = await oneRow(pool, "puzzle", queued.id);
      if (row && !row.withdrawn_at) livePuzzleIds.add(row.id);
    }
    const category = pending.find(row => row.kind === "category");
    if (category) {
      shipped += await shipQueuedDocument(pool, d1, category);
      heldPuzzles.clear();
      continue;
    }
    const catalogue = pending.find(row => row.kind === "catalogue");
    const catalogueRow = catalogue ? await oneRow(pool, "catalogue", catalogue.id) : null;
    if (catalogue && !catalogueRow) {
      await clearShipped(pool, [{
        kind: catalogue.kind,
        id: catalogue.id,
        hash: catalogue.content_hash
      }]);
      continue;
    }
    if (catalogue && !listsPendingPuzzle(catalogueRow, livePuzzleIds)) {
      shipped += await shipDocuments(pool, d1, [catalogueRow]);
      continue;
    }
    const puzzle = pending.find(row => row.kind === "puzzle" && !heldPuzzles.has(row.id));
    if (puzzle) {
      const row = await oneRow(pool, "puzzle", puzzle.id);
      if (!row) {
        await clearShipped(pool, [{
          kind: puzzle.kind,
          id: puzzle.id,
          hash: puzzle.content_hash
        }]);
        continue;
      }
      const categories = await rowsOfKind(pool, "category");
      const catalogues = await rowsOfKind(pool, "catalogue");
      const document = puzzleDocument(row);
      if (!row.withdrawn_at) {
        const missing = resolveCategoryIds(document, categories)
          .filter(id => !categories.some(category => category.id === id));
        if (missing.length) {
          heldPuzzles.add(puzzle.id);
          if (!pending.some(item => item.kind !== "puzzle")) break;
          continue;
        }
      }
      const members = [row];
      if (!row.withdrawn_at) {
        for (const categoryId of resolveCategoryIds(document, categories)) {
          const category = categories.find(item => item.id === categoryId);
          if (category) members.push(category);
        }
      }
      for (const catalogue of catalogues) {
        if (catalogueListsPuzzle(catalogueDocument(catalogue), puzzle.id)) {
          members.push(catalogue);
        }
      }
      shipped += await shipDocuments(pool, d1, members);
      heldPuzzles.clear();
      continue;
    }
    const settings = pending.find(row => row.kind === "site_settings");
    if (settings) {
      shipped += await shipSettings(pool, d1, settings);
      continue;
    }
    break;
  }
  const stillPending = await listPending(pool);
  return {
    shipped,
    held: stillPending.filter(row => row.kind === "puzzle" && heldPuzzles.has(row.id)).length,
    failed: false
  };
}
