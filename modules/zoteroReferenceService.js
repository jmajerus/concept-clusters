// LAN-only bridge to the project's Zotero MCP server. The public Worker never
// imports this module. Planning reads Zotero; only fileItem writes membership.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export const DEFAULT_ZOTERO_MCP_URL = "http://zotero-mcp.localdomain:8000/mcp";
export const CONCEPT_CLUSTERS_COLLECTION_KEY = "64GU7Y4Y";

function toolText(result, name) {
  const value = result?.content?.filter(part => part.type === "text")
    .map(part => part.text).join("\n") || "";
  if (result?.isError || !value) {
    throw new Error(`${name} failed: ${value || "empty response"}`);
  }
  return value;
}

function itemKeyFromText(text) {
  const matches = [...text.matchAll(/\*\*Item Key:\*\*\s*`?([A-Z0-9]{8})`?/g)];
  return [...new Set(matches.map(match => match[1]))];
}

function creatorName(creator) {
  if (typeof creator?.name === "string" && creator.name.trim()) return creator.name.trim();
  const family = String(creator?.lastName || "").trim();
  const given = String(creator?.firstName || "").trim();
  return family && given ? `${family}, ${given}` : family || given;
}

function itemMetadata(record) {
  const data = record?.data;
  if (!data || typeof data.title !== "string" || !data.title.trim()) {
    throw new Error("Zotero item has no citable title");
  }
  const author = (data.creators || [])
    .filter(creator => ["author", "editor"].includes(creator.creatorType))
    .map(creatorName).filter(Boolean).join("; ");
  const year = String(data.date || "").match(/\b\d{4}\b/)?.[0] || "";
  return {
    title: data.title.trim(),
    ...(author ? { author } : {}),
    ...(year ? { year } : {}),
    ...(data.publisher ? { publisher: data.publisher } : {}),
    ...(data.url ? { url: data.url } : {}),
    ...(data.DOI ? { doi: data.DOI } : {}),
    ...(data.itemType ? { itemType: data.itemType } : {})
  };
}

function citekeyOf(record) {
  const data = record.data || {};
  return String(data.citationKey || data.extra?.match(/^Citation Key:\s*(\S+)/mi)?.[1] || "").trim();
}

export function libraryOf(record) {
  const library = record.library;
  if (!library?.type || library.id == null) {
    throw new Error("Zotero item has no library identity");
  }
  return `${library.type}:${library.id}`;
}

function sourceSummary(record) {
  return {
    zoteroItemKey: String(record.key || record.data?.key || ""),
    zoteroLibrary: libraryOf(record),
    citation: itemMetadata(record),
    ...(citekeyOf(record) ? { citekey: citekeyOf(record) } : {}),
    collections: Array.isArray(record.data?.collections)
      ? [...record.data.collections] : []
  };
}

export class ZoteroReferenceService {
  constructor({
    url = DEFAULT_ZOTERO_MCP_URL,
    collectionKey = CONCEPT_CLUSTERS_COLLECTION_KEY,
    sourceRepository = null
  } = {}) {
    this.url = url;
    this.collectionKey = collectionKey;
    this.sourceRepository = sourceRepository;
  }

  async withClient(work) {
    const client = new Client({ name: "concept-clusters-reference-pilot", version: "1" });
    const transport = new StreamableHTTPClientTransport(new URL(this.url));
    await client.connect(transport);
    try {
      const call = async (name, args) => toolText(
        await client.callTool({ name, arguments: args }), name
      );
      return await work(call);
    } finally {
      await client.close();
    }
  }

  async getItem(itemKey, call = null) {
    const read = async invoke => JSON.parse(await invoke("zotero_get_item_metadata", {
      item_key: itemKey,
      format: "json",
      include_abstract: false
    }));
    return call ? read(call) : this.withClient(read);
  }

  async search(query, { limit = 5, citekey = false } = {}) {
    const term = String(query || "").trim();
    if (!term) return [];
    return this.withClient(async call => {
      const useCitekey = citekey || (/^[a-z][a-z0-9:_-]+$/i.test(term) && /\d{4}/.test(term));
      const result = useCitekey
        ? await call("zotero_search_by_citation_key", { citekey: term })
        : await call("zotero_search_items", {
          query: term,
          qmode: "titleCreatorYear",
          limit: Math.max(1, Math.min(limit, 10))
        });
      const keys = itemKeyFromText(result).slice(0, limit);
      const items = [];
      for (const key of keys) {
        const record = await this.getItem(key, call);
        items.push(sourceSummary(record));
      }
      return items;
    });
  }

  async fileItem(itemKey) {
    const key = String(itemKey || "").trim();
    if (!/^[A-Z0-9]{8}$/.test(key)) throw new Error("Zotero item key must have eight characters");
    if (!this.sourceRepository) throw new Error("Postgres citation source storage is unavailable");
    return this.withClient(async call => {
      let record = await this.getItem(key, call);
      if (!record.data?.collections?.includes(this.collectionKey)) {
        await call("zotero_set_item_collections", {
          item_keys: [key],
          add_to: [this.collectionKey]
        });
        record = await this.getItem(key, call);
      }
      if (!record.data?.collections?.includes(this.collectionKey)) {
        throw new Error("Zotero did not confirm collection membership");
      }
      const summary = await this.mirrorRecord(record);
      return {
        citation: summary.citation,
        zoteroItemKey: key,
        collectionKey: this.collectionKey
      };
    });
  }

  async fileSource({ doi = null, url = null } = {}) {
    const source = String(doi || url || "").trim();
    if (Boolean(doi) === Boolean(url) || !source) {
      throw new Error("Provide exactly one DOI or URL");
    }
    if (doi && !/^10\.\d{4,9}\/\S+$/i.test(source)) {
      throw new Error("Provide a DOI beginning with 10.");
    }
    if (url && !/^https?:\/\/\S+$/i.test(source)) {
      throw new Error("Provide an HTTP or HTTPS URL");
    }
    if (!this.sourceRepository) throw new Error("Postgres citation source storage is unavailable");
    return this.withClient(async call => {
      const response = await call("zotero_add_item", {
        source,
        source_type: doi ? "doi" : "url",
        collections: [this.collectionKey],
        if_exists: "file",
        attach_mode: "none"
      });
      if (/^Error:/i.test(response.trim())) throw new Error(response.trim());
      const key = response.match(/\bItem key:\s*`?([A-Z0-9]{8})`?/i)?.[1];
      if (!key) throw new Error(`Zotero did not return an item key: ${response.slice(0, 300)}`);
      const record = await this.getItem(key, call);
      const summary = await this.mirrorRecord(record);
      return {
        citation: summary.citation,
        zoteroItemKey: key,
        collectionKey: this.collectionKey,
        ...(response.includes("Note:") ? { zoteroNote: response.slice(response.indexOf("Note:")) } : {})
      };
    });
  }

  async mirrorRecord(record) {
    if (!this.sourceRepository) throw new Error("Postgres citation source storage is unavailable");
    if (!record.data?.collections?.includes(this.collectionKey)) {
      throw new Error("Zotero item is not in the Concept Clusters collection");
    }
    const citekey = citekeyOf(record);
    if (!citekey) throw new Error("Zotero item has no assigned Better BibTeX citekey");
    const summary = sourceSummary(record);
    await this.sourceRepository.upsertFromZotero({
      zoteroLibrary: summary.zoteroLibrary,
      zoteroItemKey: summary.zoteroItemKey,
      zoteroCollectionKey: this.collectionKey,
      citekey,
      metadata: summary.citation
    });
    return summary;
  }

  async syncCollection({ pageSize = 100 } = {}) {
    if (!this.sourceRepository) throw new Error("Postgres citation source storage is unavailable");
    const size = Math.max(1, Math.min(Number(pageSize) || 100, 100));
    return this.withClient(async call => {
      let scanned = 0;
      let mirrored = 0;
      const skipped = [];
      const seen = new Set();
      for (const key of await this.collectionItemKeys(this.collectionKey, call, size)) {
        scanned++;
        seen.add(key);
        try {
          await this.mirrorRecord(await this.getItem(key, call));
          mirrored++;
        } catch (error) {
          skipped.push({ zoteroItemKey: key, reason: error.message });
        }
      }
      const existing = await this.sourceRepository.listAll();
      const missingFromCollection = existing
        .filter(source => source.zoteroCollectionKey === this.collectionKey
          && !seen.has(source.zoteroItemKey))
        .map(source => source.zoteroItemKey);
      return {
        collectionKey: this.collectionKey,
        scanned,
        mirrored,
        skipped,
        missingFromCollection
      };
    });
  }

  // The methods below take the `call` of an open withClient session, so a
  // backfill or collection sync reuses one connection for many requests.

  // Every item key filed directly in a collection, paging through it.
  async collectionItemKeys(collectionKey, call, pageSize = 100) {
    const keys = [];
    for (let offset = 0; ; offset += pageSize) {
      const page = await call("zotero_get_collection_items", {
        collection_key: collectionKey,
        detail: "summary",
        limit: pageSize,
        offset
      });
      if (/^No items found in collection:/i.test(page.trim())) break;
      const found = itemKeyFromText(page);
      if (!found.length) throw new Error("Could not parse Zotero collection item keys");
      keys.push(...found);
      if (found.length < pageSize) break;
    }
    return keys;
  }

  // Library items whose title or creators contain the first words of title.
  // Search falls back to looser matching, so callers compare titles strictly.
  async titleCandidates(title, call, limit = 5) {
    const query = String(title || "").split(/[:.,;(]/)[0].trim().split(/\s+/).slice(0, 6).join(" ");
    if (!query) return [];
    const result = await call("zotero_search_items", { query, qmode: "titleCreatorYear", limit });
    if (/^No items found/i.test(result.trim())) return [];
    const records = [];
    for (const key of itemKeyFromText(result).slice(0, limit)) {
      records.push(await this.getItem(key, call));
    }
    return records;
  }

  // Creates the item (or, for a DOI/PMID already in the library, reuses it)
  // filed in the Concept Clusters collection, and returns its item key.
  async addItem({ kind, source }, call) {
    const sourceType = { doi: "doi", pmid: "pmid", url: "url", csl: "csl_json" }[kind];
    if (!sourceType) throw new Error(`Cannot add a Zotero item of kind ${kind}`);
    const response = await call("zotero_add_item", {
      source: kind === "csl" ? JSON.stringify(source) : String(source),
      source_type: sourceType,
      collections: [this.collectionKey],
      if_exists: "file",
      attach_mode: "none"
    });
    const key = response.match(/\bItem key:\s*`?([A-Z0-9]{8})`?/i)?.[1];
    if (!key || /^(Error|Failed)/im.test(response)) {
      throw new Error(`Zotero did not add the item: ${response.slice(0, 300)}`);
    }
    return { itemKey: key, reused: /Already in library|reused/i.test(response) };
  }

  async setItemCollections(itemKeys, { add = [], remove = [] }, call) {
    if (!itemKeys.length || (!add.length && !remove.length)) return;
    const response = await call("zotero_set_item_collections", {
      item_keys: itemKeys,
      ...(add.length ? { add_to: add } : {}),
      ...(remove.length ? { remove_from: remove } : {})
    });
    if (/^(Error|Input error|Failed)/im.test(response)) {
      throw new Error(`Zotero collection change failed: ${response.slice(0, 300)}`);
    }
  }

  // Collection key -> name for every collection in the library.
  async listCollections(call) {
    const text = await call("zotero_get_collections", { limit: 5000 });
    return new Map([...text.matchAll(/\*\*(.+?)\*\* \(Key: ([A-Z0-9]{8})\)/g)]
      .map(match => [match[2], match[1]]));
  }

  async createCollection(name, parentKey, call) {
    const response = await call("zotero_create_collection", {
      name,
      parent_collection: parentKey
    });
    const key = response.match(/Collection key:\s*`([A-Z0-9]{8})`/)?.[1];
    if (!key) throw new Error(`Zotero did not create collection ${name}: ${response.slice(0, 300)}`);
    return key;
  }

  async renameCollection(collectionKey, name, call) {
    const response = await call("zotero_update_collection", { collection_key: collectionKey, name });
    if (!/^(Updated|No change)/.test(response.trim())) {
      throw new Error(`Zotero did not rename collection ${collectionKey}: ${response.slice(0, 300)}`);
    }
  }

  async deleteCollection(collectionKey, call) {
    const response = await call("zotero_delete_collection", { collection_key: collectionKey });
    if (!/^Deleted collection/.test(response.trim())) {
      throw new Error(`Zotero did not delete collection ${collectionKey}: ${response.slice(0, 300)}`);
    }
  }
}
