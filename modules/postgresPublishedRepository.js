// Current published rows for the LAN. Publish, unpublish, and layout save
// commit here and enqueue a replica sync. Review stamps and freeze cues
// stay on these rows; they are not part of the public replica.

import {
  ContentDocumentNotFoundError,
  PUBLISHED_DOCUMENT_KINDS,
  PublishedRevisionConflictError,
  preparePublishedWrite,
  publishedRecordFromRow,
  publishedRevisionFromRow
} from "./contentDocumentRepository.js";
import {
  assertDraftId,
  draftContentHash,
  normalizeDraftActor,
  serializeDraftDocument
} from "./draftRepository.js";
import { LayoutConflictError, serializeLayoutDocument } from "./layoutDocument.js";
import { contentRevisedStamp } from "./playerFacingRevision.js";
import { insertReviewEvent } from "./postgresReviewEvents.js";
import { affectedRows, uniqueViolation, withTransaction } from "./postgresPool.js";
import { enqueueDocumentReplica, publicReplicaHash } from "./publishedReplica.js";

function assertKind(kind) {
  if (!PUBLISHED_DOCUMENT_KINDS.includes(kind)) {
    throw new Error(`Unsupported content kind: ${kind}`);
  }
}

function titleOf(document) {
  return typeof document?.title === "string" ? document.title : null;
}

const PUBLISHED_WITH_REPLICA = `
  SELECT d.*, (q.kind IS NOT NULL) AS replica_pending
  FROM published_documents d
  LEFT JOIN published_replica_queue q ON q.kind = d.kind AND q.id = d.id
`;

function recordFrom(row) {
  const record = publishedRecordFromRow(row);
  if (row.replica_pending === true || row.replica_pending === 1 || row.replica_pending === "t") {
    record.replicaPending = true;
  }
  return record;
}

async function readPublished(client, kind, id) {
  const { rows } = await client.query(
    `${PUBLISHED_WITH_REPLICA} WHERE d.kind = $1 AND d.id = $2`,
    [kind, id]
  );
  if (!rows[0]) throw new ContentDocumentNotFoundError(kind, id);
  return recordFrom(rows[0]);
}

function sameLiveSnapshot(existing, { contentHash, layoutJson, contentRevisedAt }) {
  if (!existing || existing.withdrawn_at) return false;
  return publicReplicaHash(existing) === publicReplicaHash({
    content_hash: contentHash,
    layout_json: layoutJson,
    withdrawn_at: null,
    first_published_at: existing.first_published_at,
    published_at: existing.published_at,
    content_revised_at: contentRevisedAt
  });
}

export class PostgresPublishedRepository {
  constructor(pool) {
    if (!pool) throw new Error("A Postgres pool is required");
    this.pool = pool;
  }

  async getPublished({ kind, id }) {
    assertKind(kind);
    assertDraftId(id);
    return readPublished(this.pool, kind, id);
  }

  async getPublishedAtRevision({ kind, id, revision }) {
    assertKind(kind);
    assertDraftId(id);
    if (!Number.isInteger(revision) || revision < 1) {
      throw new Error("revision must be a positive integer");
    }
    const { rows } = await this.pool.query(`
      SELECT revision, document FROM published_document_revisions
      WHERE kind = $1 AND id = $2 AND revision = $3
    `, [kind, id, revision]);
    if (!rows[0]) return null;
    return publishedRevisionFromRow(kind, rows[0]);
  }

  async listPublished({ kind, includeWithdrawn = false } = {}) {
    assertKind(kind);
    const { rows } = await this.pool.query(
      `${PUBLISHED_WITH_REPLICA} WHERE d.kind = $1 ORDER BY d.id`,
      [kind]
    );
    return rows.map(recordFrom)
      .filter(row => includeWithdrawn || !row.withdrawnAt)
      .sort((left, right) =>
        String(left.title || left.id).localeCompare(String(right.title || right.id))
      );
  }

  async seedPublishedIfAbsent({ kind, id, document, layout = null }) {
    await this.seedPublishedManyIfAbsent([{ kind, id, document, layout }]);
    return this.getPublished({ kind, id });
  }

  // Git fills a row the corpus does not have yet. It does not enqueue the
  // replica: the one-time copy from D1 is the upstream fill, and a later
  // publish is what players wait on.
  async seedPublishedManyIfAbsent(items = []) {
    if (!items.length) return;
    const now = new Date().toISOString();
    let inserted = 0;
    await withTransaction(this.pool, async client => {
      for (const item of items) {
        assertKind(item.kind);
        assertDraftId(item.id);
        const prepared = preparePublishedWrite(
          item.kind,
          item.document,
          item.kind === "puzzle" ? serializeLayoutDocument(item.layout) : null
        );
        const documentJson = serializeDraftDocument({ ...prepared.document, id: item.id });
        const contentHash = draftContentHash(documentJson);
        const result = await client.query(`
          INSERT INTO published_documents (
            kind, id, title, document, content_hash, revision,
            published_by, published_at, first_published_at, updated_at,
            cued_for_freeze_at, cued_for_freeze_by, layout_json
          ) VALUES (
            $1, $2, $3, $4, $5, 1,
            'git-seed', $6, $6, $6,
            $6, 'git-seed', $7
          )
          ON CONFLICT (kind, id) DO NOTHING
        `, [
          item.kind,
          item.id,
          titleOf(prepared.document),
          documentJson,
          contentHash,
          now,
          prepared.layoutJson
        ]);
        if (!affectedRows(result)) continue;
        inserted += 1;
        await client.query(`
          INSERT INTO published_document_revisions (
            kind, id, revision, document, content_hash, published_by, published_at
          ) VALUES ($1, $2, 1, $3, $4, 'git-seed', $5)
          ON CONFLICT (kind, id, revision) DO NOTHING
        `, [item.kind, item.id, documentJson, contentHash, now]);
      }
    });
    if (inserted > 0) {
      console.warn(
        `Seeded ${inserted} published row(s) into Postgres. ` +
        "That does not copy D1 and does not enqueue the public replica. " +
        "Run npm run authoring:postgres:copy once before serving, so the live D1 corpus stays upstream."
      );
    }
  }

  async publish({
    kind, id, document, actor, layout = undefined, expectedRevision = null,
    markRevised = false
  }) {
    assertKind(kind);
    assertDraftId(id);
    if (expectedRevision != null && (!Number.isInteger(expectedRevision) || expectedRevision < 1)) {
      throw new Error("expectedRevision must be a positive integer");
    }
    const publishedBy = normalizeDraftActor(actor).subject;
    const now = new Date().toISOString();
    try {
      return await withTransaction(this.pool, async client => {
        const locked = await client.query(
          "SELECT * FROM published_documents WHERE kind = $1 AND id = $2 FOR UPDATE",
          [kind, id]
        );
        const existing = locked.rows[0] || null;
        if (expectedRevision != null && Number(existing?.revision) !== expectedRevision) {
          throw new PublishedRevisionConflictError(kind, id);
        }
        const prepared = preparePublishedWrite(
          kind,
          document,
          kind === "puzzle"
            ? layout === undefined
              ? existing?.layout_json || null
              : serializeLayoutDocument(layout)
            : null
        );
        const documentJson = serializeDraftDocument({ ...prepared.document, id });
        const contentHash = draftContentHash(documentJson);
        const previousDocument = existing?.document ? JSON.parse(existing.document) : null;
        const revised = contentRevisedStamp({
          kind,
          previousDocument,
          nextDocument: prepared.document,
          markRevised,
          now,
          previousStamp: existing?.content_revised_at || null
        });
        if (sameLiveSnapshot(existing, {
          contentHash,
          layoutJson: prepared.layoutJson,
          contentRevisedAt: revised.live
        })) {
          return readPublished(client, kind, id);
        }
        if (!existing) {
          await client.query(`
            INSERT INTO published_documents (
              kind, id, title, document, content_hash, revision,
              published_by, published_at, first_published_at, updated_at,
              layout_json, content_revised_at
            ) VALUES ($1, $2, $3, $4, $5, 1, $6, $7, $7, $7, $8, NULL)
          `, [
            kind, id, titleOf(prepared.document), documentJson, contentHash,
            publishedBy, now, prepared.layoutJson
          ]);
          await client.query(`
            INSERT INTO published_document_revisions (
              kind, id, revision, document, content_hash, published_by, published_at,
              content_revised_at
            ) VALUES ($1, $2, 1, $3, $4, $5, $6, NULL)
          `, [kind, id, documentJson, contentHash, publishedBy, now]);
        } else {
          const nextRevision = Number(existing.revision) + 1;
          const updated = await client.query(`
            UPDATE published_documents
            SET title = $1, document = $2, content_hash = $3, revision = $4,
                published_by = $5, published_at = $6, updated_at = $6,
                withdrawn_at = NULL, cued_for_freeze_at = NULL, cued_for_freeze_by = NULL,
                layout_json = $7, content_revised_at = $8
            WHERE kind = $9 AND id = $10 AND revision = $11
          `, [
            titleOf(prepared.document), documentJson, contentHash, nextRevision,
            publishedBy, now, prepared.layoutJson, revised.live,
            kind, id, Number(existing.revision)
          ]);
          if (affectedRows(updated) !== 1) throw new PublishedRevisionConflictError(kind, id);
          await client.query(`
            INSERT INTO published_document_revisions (
              kind, id, revision, document, content_hash, published_by, published_at,
              content_revised_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            kind, id, nextRevision, documentJson, contentHash, publishedBy, now,
            revised.marked ? now : null
          ]);
        }
        await enqueueDocumentReplica(client, { kind, id });
        return readPublished(client, kind, id);
      });
    } catch (error) {
      if (uniqueViolation(error)) throw new PublishedRevisionConflictError(kind, id);
      throw error;
    }
  }

  async saveLayout({ id, layout, expectedUpdatedAt = null }) {
    assertDraftId(id);
    const layoutJson = serializeLayoutDocument(layout);
    const now = new Date().toISOString();
    return withTransaction(this.pool, async client => {
      const current = await client.query(
        "SELECT withdrawn_at FROM published_documents WHERE kind = 'puzzle' AND id = $1 FOR UPDATE",
        [id]
      );
      if (!current.rows[0]) throw new ContentDocumentNotFoundError("puzzle", id);
      if (current.rows[0].withdrawn_at) {
        throw new Error(`Cannot save a layout for withdrawn puzzle "${id}"`);
      }
      const updated = await client.query(`
        UPDATE published_documents
        SET layout_json = $1, updated_at = $2
        WHERE kind = 'puzzle' AND id = $3 AND withdrawn_at IS NULL
          AND ($4::text IS NULL OR updated_at = $4::text)
      `, [layoutJson, now, id, expectedUpdatedAt]);
      if (affectedRows(updated) !== 1) {
        if (expectedUpdatedAt != null) throw new LayoutConflictError(id);
        throw new ContentDocumentNotFoundError("puzzle", id);
      }
      await enqueueDocumentReplica(client, { kind: "puzzle", id });
      return readPublished(client, "puzzle", id);
    });
  }

  async clearLayout({ id }) {
    assertDraftId(id);
    const now = new Date().toISOString();
    return withTransaction(this.pool, async client => {
      const updated = await client.query(`
        UPDATE published_documents
        SET layout_json = NULL, updated_at = $1
        WHERE kind = 'puzzle' AND id = $2
      `, [now, id]);
      if (affectedRows(updated) !== 1) throw new ContentDocumentNotFoundError("puzzle", id);
      await enqueueDocumentReplica(client, { kind: "puzzle", id });
      return readPublished(client, "puzzle", id);
    });
  }

  async unpublish({ kind, id, actor }) {
    assertKind(kind);
    assertDraftId(id);
    const publishedBy = normalizeDraftActor(actor).subject;
    const now = new Date().toISOString();
    return withTransaction(this.pool, async client => {
      const updated = await client.query(`
        UPDATE published_documents
        SET withdrawn_at = $1, published_by = $2, updated_at = $1,
            cued_for_freeze_at = NULL, cued_for_freeze_by = NULL
        WHERE kind = $3 AND id = $4
      `, [now, publishedBy, kind, id]);
      if (affectedRows(updated) !== 1) throw new ContentDocumentNotFoundError(kind, id);
      await enqueueDocumentReplica(client, { kind, id });
      return readPublished(client, kind, id);
    });
  }

  async setFreezeCue({ kind, id, actor, cued }) {
    assertKind(kind);
    assertDraftId(id);
    return withTransaction(this.pool, async client => {
      const current = await readPublished(client, kind, id);
      if (current.withdrawnAt) throw new Error(`Cannot cue a withdrawn ${kind} for freeze`);
      const publishedBy = normalizeDraftActor(actor).subject;
      const now = new Date().toISOString();
      const updated = await client.query(`
        UPDATE published_documents
        SET cued_for_freeze_at = $1, cued_for_freeze_by = $2, updated_at = $3
        WHERE kind = $4 AND id = $5
      `, [cued ? now : null, cued ? publishedBy : null, now, kind, id]);
      if (affectedRows(updated) !== 1) throw new ContentDocumentNotFoundError(kind, id);
      return readPublished(client, kind, id);
    });
  }

  // The event and the stamp commit together. A failed attempt leaves neither.
  async recordReview(input) {
    assertDraftId(input.id);
    const reviewerKind = input.reviewerKind;
    if (reviewerKind !== "agent" && reviewerKind !== "human") {
      throw new Error("reviewerKind must be agent or human");
    }
    return withTransaction(this.pool, async client => {
      const existing = await client.query(`
        SELECT withdrawn_at FROM published_documents
        WHERE kind = 'puzzle' AND id = $1
        FOR UPDATE
      `, [input.id]);
      if (!existing.rows[0]) throw new ContentDocumentNotFoundError("puzzle", input.id);
      const event = await insertReviewEvent(client, { ...input, eventType: "review" });
      if (!existing.rows[0].withdrawn_at) {
        const column = reviewerKind === "agent"
          ? "last_agent_reviewed_at"
          : "last_human_reviewed_at";
        await client.query(
          `UPDATE published_documents SET ${column} = $1 WHERE kind = 'puzzle' AND id = $2`,
          [event.reviewedAt, input.id]
        );
      }
      return event;
    });
  }
}
