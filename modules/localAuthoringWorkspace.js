import { D1DraftRepository } from "./d1DraftRepository.js";
import { D1ContentDocumentRepository } from "./contentDocumentRepository.js";
import { D1FreezePublicationRepository } from "./d1FreezePublicationRepository.js";
import { D1ModelSuggestionRepository } from "./d1ModelSuggestionRepository.js";
import { draftContentHash } from "./draftRepository.js";
import { createHttpD1Database } from "./httpD1Database.js";
import { createLargeColumnCachedD1Database, d1LargeColumnCacheEnabled } from "./d1LargeColumnCache.js";
import { resolveLocalD1Config, resolveLocalDraftActor } from "./localD1Config.js";
import { createRepositoryDraftStore } from "./repositoryDraftStore.js";
import { createD1WikiLinkCheckStore, createPostgresWikiLinkCheckStore } from "./wikiLinkCheckStore.js";
import {
  createD1SiteSettingsStore,
  createPostgresSiteSettingsStore
} from "./siteSettings.js";
import { PostgresPublishedRepository } from "./postgresPublishedRepository.js";
import { enqueueSiteSettingsReplica } from "./publishedReplica.js";
import { applyAuthoredDomain } from "./authoringDomains.js";
import { createSplitContentDocuments } from "./authoringContentDocuments.js";
import { PostgresContentDraftRepository } from "./postgresContentDraftRepository.js";
import { PostgresDraftRepository } from "./postgresDraftRepository.js";
import { PostgresFreezePublicationRepository } from "./postgresFreezePublicationRepository.js";
import { PostgresModelSuggestionRepository } from "./postgresModelSuggestionRepository.js";
import { PostgresReviewEventStore } from "./postgresReviewEvents.js";
import { PostgresCitationSourceRepository } from "./postgresCitationSourceRepository.js";
import { PostgresCitationUsagePilot } from "./postgresCitationUsagePilot.js";
import { createCitationSourceStatus } from "./citationSourceStatus.js";
import {
  ZoteroReferenceService,
  DEFAULT_ZOTERO_MCP_URL,
  CONCEPT_CLUSTERS_COLLECTION_KEY
} from "./zoteroReferenceService.js";
import { authoringDatabaseUrl, getAuthoringPool } from "./postgresPool.js";

export const LOCAL_PUBLICATION_ACTOR = Object.freeze({ subject: "local" });

export function createLocalDraftRepository(draftStore) {
  return {
    async create({ draftId, document }) {
      return draftStore.createDraft({ draftId, document });
    },
    async get({ draftId }) {
      const record = await draftStore.getDraft(draftId);
      return {
        ...record,
        id: record.draftId,
        // Keep an installed legacy SHA-256 marker stable until the draft is
        // edited. New or hashless records use the synchronous fingerprint.
        contentHash: record.contentHash || draftContentHash(record.document)
      };
    },
    async save({ draftId, document, expectedRevision }) {
      return draftStore.replaceDraft({
        draftId,
        document,
        expectedRevision
      });
    },
    async saveDomain({ draftId, domain, projection, expectedRevision, provenance }) {
      if (typeof draftStore.replaceDomain === "function") {
        return draftStore.replaceDomain({
          draftId,
          domain,
          projection,
          expectedRevision,
          provenance
        });
      }
      // Remnant stores without column-level updates: merge then full replace.
      const current = await draftStore.getDraft(draftId);
      let nextDocument = applyAuthoredDomain(current.document, domain, projection);
      if (provenance !== undefined) {
        nextDocument = { ...nextDocument, provenance };
      } else if (Object.prototype.hasOwnProperty.call(current.document, "provenance")) {
        nextDocument = {
          ...nextDocument,
          provenance: current.document.provenance
        };
      }
      return draftStore.replaceDraft({
        draftId,
        document: nextDocument,
        expectedRevision
      });
    },
    async requestBoardLimitWaiver(input) {
      if (typeof draftStore.requestBoardLimitWaiver !== "function") {
        throw new Error("This draft store does not support board limit waiver requests");
      }
      return draftStore.requestBoardLimitWaiver(input);
    },
    async listBoardLimitWaiverRequests({ draftId }) {
      if (typeof draftStore.listBoardLimitWaiverRequests !== "function") return [];
      return draftStore.listBoardLimitWaiverRequests(draftId);
    },
    async decideBoardLimitWaiver(input) {
      if (typeof draftStore.decideBoardLimitWaiver !== "function") {
        throw new Error("This draft store does not support board limit waiver decisions");
      }
      return draftStore.decideBoardLimitWaiver(input);
    },
    async grantBoardLimitWaiverDirect(input) {
      if (typeof draftStore.grantBoardLimitWaiverDirect !== "function") {
        throw new Error("This draft store does not support direct board limit waiver grants");
      }
      return draftStore.grantBoardLimitWaiverDirect(input);
    },
    async revokeBoardLimitWaiver(input) {
      if (typeof draftStore.revokeBoardLimitWaiver !== "function") {
        throw new Error("This draft store does not support board limit waiver decisions");
      }
      return draftStore.revokeBoardLimitWaiver(input);
    },
    async materialize({ draftId }) {
      if (typeof draftStore.materializeDraft !== "function") {
        return this.get({ draftId });
      }
      return draftStore.materializeDraft(draftId);
    },
    async supports(method) {
      if (method === "saveDomain" || method === "materialize") return true;
      if (method === "popWorkingCopy") {
        return typeof draftStore.popWorkingCopy === "function";
      }
      return typeof this[method] === "function";
    },
    async list({ status = null, limit = 100, includeDocument = false } = {}) {
      const records = await draftStore.listDrafts({ includeDocument });
      return records
        .filter(record => !status || record.status === status)
        .slice(0, Math.max(1, Math.min(Number(limit) || 100, 200)));
    },
    async delete({ draftId }) {
      return draftStore.deleteDraft(draftId);
    },
    async recordValidation({ draftId, validation }) {
      return draftStore.recordValidation(draftId, validation);
    },
    async recordAssistanceStamp({ record, actor: stampActor }) {
      if (typeof draftStore.recordAssistanceStamp !== "function") return null;
      return draftStore.recordAssistanceStamp({ record, actor: stampActor || actor });
    }
  };
}

// The large-column cache is process-wide and keyed by endpoint, so the
// workspaces the server resolves per request all share it.
async function createLocalD1Database({ env, repositoryRoot }) {
  const config = await resolveLocalD1Config({ env, repositoryRoot });
  const http = createHttpD1Database(config);
  if (!d1LargeColumnCacheEnabled(env)) return http;
  return createLargeColumnCachedD1Database(http, {
    cacheKey: config.endpoint || `${config.accountId}/${config.databaseId}`
  });
}

export async function resolveLocalAuthoringWorkspace({
  env = process.env,
  repositoryRoot,
  draftStore = null,
  database = null,
  actor = null
} = {}) {
  if (draftStore) {
    const remnantActor = actor || LOCAL_PUBLICATION_ACTOR;
    return {
      actor: remnantActor,
      draftStore,
      draftRepository: createLocalDraftRepository(draftStore),
      contentDocuments: null,
      wikiLinkStore: null
    };
  }
  const resolvedActor = actor || resolveLocalDraftActor({ env });
  const databaseUrl = authoringDatabaseUrl(env);
  if (!databaseUrl) {
    const d1 = database || await createLocalD1Database({ env, repositoryRoot });
    const repository = new D1DraftRepository(d1);
    const contentDocuments = new D1ContentDocumentRepository(d1);
    contentDocuments.modelSuggestions = new D1ModelSuggestionRepository(d1);
    contentDocuments.freezeRepository = new D1FreezePublicationRepository(d1);
    return {
      actor: resolvedActor,
      draftStore: createRepositoryDraftStore({ repository, actor: resolvedActor }),
      draftRepository: repository,
      contentDocuments,
      wikiLinkStore: createD1WikiLinkCheckStore(d1),
      siteSettings: createD1SiteSettingsStore(d1),
      freezeRepository: contentDocuments.freezeRepository,
      modelSuggestions: contentDocuments.modelSuggestions
    };
  }
  const pool = getAuthoringPool(databaseUrl);
  // Published rows are Postgres. D1 is optional here: the replica drain
  // writes it when the network is up, and the server still boots without it.
  const published = new PostgresPublishedRepository(pool);
  const contentDocuments = createSplitContentDocuments({
    drafts: new PostgresContentDraftRepository(pool),
    published,
    reviewEvents: new PostgresReviewEventStore(pool),
    modelSuggestions: new PostgresModelSuggestionRepository(pool),
    freezeRepository: new PostgresFreezePublicationRepository(pool)
  });
  const repository = new PostgresDraftRepository({
    pool,
    publishedDocuments: published
  });
  const citationSources = new PostgresCitationSourceRepository(pool);
  return {
    actor: resolvedActor,
    draftStore: createRepositoryDraftStore({ repository, actor: resolvedActor }),
    draftRepository: repository,
    contentDocuments,
    wikiLinkStore: createPostgresWikiLinkCheckStore(pool),
    siteSettings: createPostgresSiteSettingsStore(pool, {
      replicate: enqueueSiteSettingsReplica
    }),
    freezeRepository: contentDocuments.freezeRepository,
    modelSuggestions: contentDocuments.modelSuggestions,
    citationSources,
    citationUsage: new PostgresCitationUsagePilot(pool),
    citationSourceStatus: createCitationSourceStatus(pool),
    zoteroReferences: new ZoteroReferenceService({
      url: env.ZOTERO_MCP_URL || DEFAULT_ZOTERO_MCP_URL,
      collectionKey: env.CONCEPT_CLUSTERS_ZOTERO_COLLECTION_KEY || CONCEPT_CLUSTERS_COLLECTION_KEY,
      sourceRepository: citationSources
    })
  };
}

// The optional Zotero reference pilot, shared by the stdio and HTTP (tunnel)
// MCP entries. Only a Postgres workspace carries the citation stores, so
// callers register the pilot tools only when this returns non-null.
export function createReferencePilot(resolveWorkspace) {
  async function zotero() {
    const service = (await resolveWorkspace()).zoteroReferences;
    if (!service) throw new Error("Zotero filing requires the Postgres LAN workspace");
    return service;
  }
  return {
    async searchSources(args) {
      const store = (await resolveWorkspace()).citationSources;
      return store ? store.search(args) : [];
    },
    async searchUsage(args) {
      const store = (await resolveWorkspace()).citationUsage;
      return store ? store.search(args) : [];
    },
    async usageStatus() {
      const store = (await resolveWorkspace()).citationUsage;
      return store ? store.status() : { freshness: "unavailable" };
    },
    async searchZotero(query, options) {
      const service = (await resolveWorkspace()).zoteroReferences;
      return service ? service.search(query, options) : [];
    },
    async fileItem(itemKey) {
      return (await zotero()).fileItem(itemKey);
    },
    async fileSource(args) {
      return (await zotero()).fileSource(args);
    }
  };
}

export default resolveLocalAuthoringWorkspace;
