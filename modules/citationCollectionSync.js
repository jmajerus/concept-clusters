// Generated browse subcollections under the Concept Clusters collection:
// Domain -> Category -> Subcategory. The Subcategory level exists only for a
// category citing more than SUBCATEGORY_SPLIT_THRESHOLD works. A category or
// subcategory citing fewer than MIN_COLLECTION_WORKS works is folded into its
// parent rather than getting a near-empty folder of its own, so a work can
// sit directly in a domain or category. Membership comes from
// published puzzles' citations and their current classification, so a
// reclassification moves works on the next sync. The sync owns these
// collections: it adds, removes, renames, and deletes them to match, but
// never touches the Concept Clusters collection itself or deletes an item.

import { DOMAINS } from "../puzzles/domains.js";
import {
  categoryIdsForPuzzle,
  categoryTitleFor,
  domainForCategory,
  subcategoryById,
  subcategoryIdForPuzzle
} from "../puzzles/categories.js";
import { loadPublishedCorpus, recordedWorkItems } from "./citationBackfill.js";
import { citationsOf, classifyCitation } from "./citationWorkKey.js";

export const SUBCATEGORY_SPLIT_THRESHOLD = 30;
export const MIN_COLLECTION_WORKS = 7;
export const UNCITED_COLLECTION_NAME = "Not yet cited";

const DEPTH = { domain: 0, category: 1, subcategory: 2, uncited: 0 };

function depthOf(pathKey) {
  return DEPTH[pathKey.split(":")[0]];
}

// pathKey -> { pathKey, name, parentPathKey, items: Set<itemKey> }
export function desiredCollections({ puzzles, registry, workItems, registryItemKeys = [],
  threshold = SUBCATEGORY_SPLIT_THRESHOLD, minCategoryWorks = MIN_COLLECTION_WORKS,
  minSubcategoryWorks = MIN_COLLECTION_WORKS }) {
  const byCategory = new Map();
  const cited = new Set();
  for (const puzzle of puzzles) {
    const itemKeys = citationsOf(puzzle.document)
      .map(citation => classifyCitation(citation))
      .filter(work => work.scholarly && workItems.has(work.workKey))
      .map(work => workItems.get(work.workKey).zotero_item_key);
    if (!itemKeys.length) continue;
    for (const categoryId of categoryIdsForPuzzle(puzzle.document, registry)) {
      const subcategoryId = subcategoryIdForPuzzle(puzzle.document, categoryId, registry) || null;
      const entry = byCategory.get(categoryId) || { all: new Set(), bySubcategory: new Map() };
      for (const itemKey of itemKeys) {
        cited.add(itemKey);
        entry.all.add(itemKey);
        const bucket = entry.bySubcategory.get(subcategoryId) || new Set();
        bucket.add(itemKey);
        entry.bySubcategory.set(subcategoryId, bucket);
      }
      byCategory.set(categoryId, entry);
    }
  }

  const nodes = new Map();
  const node = (pathKey, name, parentPathKey) => {
    if (!nodes.has(pathKey)) nodes.set(pathKey, { pathKey, name, parentPathKey, items: new Set() });
    return nodes.get(pathKey);
  };
  for (const [categoryId, entry] of byCategory) {
    const domainId = domainForCategory(categoryId, registry) || "other";
    const domainKey = `domain:${domainId}`;
    const domain = node(domainKey, DOMAINS[domainId]?.title || "Other subjects", null);
    if (entry.all.size < minCategoryWorks) {
      for (const itemKey of entry.all) domain.items.add(itemKey);
      continue;
    }
    const categoryKey = `category:${categoryId}`;
    const category = node(categoryKey, categoryTitleFor(categoryId, registry) || categoryId, domainKey);
    const split = entry.all.size > threshold
      && [...entry.bySubcategory.keys()].some(subcategoryId => subcategoryId);
    for (const [subcategoryId, items] of entry.bySubcategory) {
      const target = split && subcategoryId && items.size >= minSubcategoryWorks
        ? node(`subcategory:${categoryId}/${subcategoryId}`,
          subcategoryById(categoryId, subcategoryId, registry)?.title || subcategoryId, categoryKey)
        : category;
      for (const itemKey of items) target.items.add(itemKey);
    }
  }
  const uncited = registryItemKeys.filter(itemKey => !cited.has(itemKey));
  if (uncited.length) {
    const entry = node("uncited", UNCITED_COLLECTION_NAME, null);
    for (const itemKey of uncited) entry.items.add(itemKey);
  }
  return nodes;
}

async function mappedCollections(pool) {
  const { rows } = await pool.query("SELECT * FROM citation_zotero_collections");
  return new Map(rows.map(row => [row.path_key, row]));
}

export async function planCollectionSync({ pool, service, threshold = SUBCATEGORY_SPLIT_THRESHOLD,
  minCategoryWorks = MIN_COLLECTION_WORKS, minSubcategoryWorks = MIN_COLLECTION_WORKS }) {
  const [{ puzzles, registry }, workItems, mapped] = await Promise.all([
    loadPublishedCorpus(pool),
    recordedWorkItems(pool),
    mappedCollections(pool)
  ]);
  return service.withClient(async call => {
    const registryItemKeys = await service.collectionItemKeys(service.collectionKey, call);
    const desired = desiredCollections({
      puzzles, registry, workItems, registryItemKeys, threshold, minCategoryWorks, minSubcategoryWorks
    });
    const existing = await service.listCollections(call);
    const plan = { create: [], rename: [], add: [], remove: [], delete: [] };
    const recreated = new Set();
    const ordered = [...desired].sort(([a], [b]) => depthOf(a) - depthOf(b));
    for (const [pathKey, want] of ordered) {
      const row = mapped.get(pathKey);
      const alive = row && existing.has(row.zotero_collection_key);
      // A moved collection is recreated under its new parent, and its
      // children with it, since they were nested in the deleted one.
      if (!alive || row.parent_path_key !== want.parentPathKey || recreated.has(want.parentPathKey)) {
        recreated.add(pathKey);
        if (alive) plan.delete.push({ pathKey, collectionKey: row.zotero_collection_key, name: row.name, moved: true });
        plan.create.push({ pathKey, name: want.name, parentPathKey: want.parentPathKey, items: [...want.items] });
        continue;
      }
      if (existing.get(row.zotero_collection_key) !== want.name) {
        plan.rename.push({ pathKey, collectionKey: row.zotero_collection_key, from: existing.get(row.zotero_collection_key), name: want.name });
      }
      const current = new Set(await service.collectionItemKeys(row.zotero_collection_key, call));
      const add = [...want.items].filter(itemKey => !current.has(itemKey));
      const remove = [...current].filter(itemKey => !want.items.has(itemKey));
      if (add.length) plan.add.push({ pathKey, collectionKey: row.zotero_collection_key, name: want.name, items: add });
      if (remove.length) plan.remove.push({ pathKey, collectionKey: row.zotero_collection_key, name: want.name, items: remove });
    }
    for (const [pathKey, row] of mapped) {
      if (desired.has(pathKey)) continue;
      plan.delete.push({ pathKey, collectionKey: row.zotero_collection_key, name: row.name,
        stale: !existing.has(row.zotero_collection_key) });
    }
    plan.create.sort((a, b) => depthOf(a.pathKey) - depthOf(b.pathKey) || a.pathKey.localeCompare(b.pathKey));
    // Children before parents, so a parent is never deleted with live children.
    plan.delete.sort((a, b) => depthOf(b.pathKey) - depthOf(a.pathKey));
    plan.summary = {
      collections: desired.size,
      works: workItems.size,
      create: plan.create.length,
      rename: plan.rename.length,
      itemsAdded: [...plan.create, ...plan.add].reduce((sum, entry) => sum + entry.items.length, 0),
      itemsRemoved: plan.remove.reduce((sum, entry) => sum + entry.items.length, 0),
      delete: plan.delete.length
    };
    return plan;
  });
}

export function collectionSyncReport(plan) {
  const lines = [
    `${plan.summary.collections} generated collections for ${plan.summary.works} recorded works.`,
    `Create ${plan.summary.create}, rename ${plan.summary.rename}, delete ${plan.summary.delete};`
      + ` file ${plan.summary.itemsAdded} and unfile ${plan.summary.itemsRemoved} item placements.`
  ];
  for (const entry of plan.create) lines.push(`  + ${entry.pathKey} "${entry.name}" (${entry.items.length} items)`);
  for (const entry of plan.rename) lines.push(`  ~ ${entry.pathKey} "${entry.from}" -> "${entry.name}"`);
  for (const entry of plan.add) lines.push(`  > ${entry.pathKey} +${entry.items.length} items`);
  for (const entry of plan.remove) lines.push(`  < ${entry.pathKey} -${entry.items.length} items`);
  for (const entry of plan.delete) {
    lines.push(`  - ${entry.pathKey} "${entry.name}"${entry.moved ? " (moved; recreated)" : ""}${entry.stale ? " (already gone)" : ""}`);
  }
  return lines.join("\n");
}

export async function applyCollectionSync({ pool, service, plan }) {
  const mapped = await mappedCollections(pool);
  const keyFor = pathKey => pathKey ? mapped.get(pathKey)?.zotero_collection_key : service.collectionKey;
  const now = () => new Date().toISOString();
  await service.withClient(async call => {
    for (const entry of plan.delete) {
      if (!entry.stale) await service.deleteCollection(entry.collectionKey, call);
      await pool.query("DELETE FROM citation_zotero_collections WHERE path_key = $1", [entry.pathKey]);
      mapped.delete(entry.pathKey);
    }
    for (const entry of plan.create) {
      const parentKey = keyFor(entry.parentPathKey);
      if (!parentKey) throw new Error(`No parent collection for ${entry.pathKey}`);
      const collectionKey = await service.createCollection(entry.name, parentKey, call);
      const row = {
        path_key: entry.pathKey, zotero_collection_key: collectionKey,
        name: entry.name, parent_path_key: entry.parentPathKey
      };
      await pool.query(`
        INSERT INTO citation_zotero_collections
          (path_key, zotero_collection_key, name, parent_path_key, recorded_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [row.path_key, row.zotero_collection_key, row.name, row.parent_path_key, now()]);
      mapped.set(entry.pathKey, row);
      await service.setItemCollections(entry.items, { add: [collectionKey] }, call);
    }
    for (const entry of plan.rename) {
      await service.renameCollection(entry.collectionKey, entry.name, call);
      await pool.query(
        "UPDATE citation_zotero_collections SET name = $2, recorded_at = $3 WHERE path_key = $1",
        [entry.pathKey, entry.name, now()]
      );
    }
    for (const entry of plan.add) {
      await service.setItemCollections(entry.items, { add: [entry.collectionKey] }, call);
    }
    for (const entry of plan.remove) {
      await service.setItemCollections(entry.items, { remove: [entry.collectionKey] }, call);
    }
  });
}
