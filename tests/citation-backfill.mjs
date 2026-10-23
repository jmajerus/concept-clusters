import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { applyPostgresMigrations } from "../tools/postgres-migrate.mjs";
import { classifyCitation, cslAuthors, splitEdition } from "../modules/citationWorkKey.js";
import { applyBackfill, compareTitleCandidate, crossrefDoi, planBackfill } from "../modules/citationBackfill.js";
import { applyCollectionSync, desiredCollections, planCollectionSync } from "../modules/citationCollectionSync.js";
import { PostgresCitationSourceRepository } from "../modules/postgresCitationSourceRepository.js";
import { refreshPublishedCitationUsage } from "../modules/postgresCitationUsagePilot.js";

export const name = "Citation backfill: work keys, idempotent filing, generated collections";

function poolFrom(db) {
  return {
    query: (text, params) => db.query(text, params),
    connect: async () => ({ query: (text, params) => db.query(text, params), release() {} }),
    end: async () => {}
  };
}

// An in-memory stand-in for the Zotero MCP bridge.
function fakeZotero() {
  const items = new Map();
  const collections = new Map([["CCROOT01", { name: "Concept Clusters", items: new Set() }]]);
  let next = 0;
  const key = prefix => `${prefix}${String(++next).padStart(8 - prefix.length, "0")}`;
  const service = {
    collectionKey: "CCROOT01",
    calls: [],
    withClient: work => work("call"),
    async getItem(itemKey) {
      return { key: itemKey, library: { type: "user", id: 7 }, data: items.get(itemKey) };
    },
    async titleCandidates(title) {
      return [...items].filter(([, data]) => data.title.startsWith(String(title).slice(0, 10)))
        .map(([itemKey, data]) => ({ key: itemKey, data }));
    },
    async addItem({ kind, source }) {
      service.calls.push(["add", kind]);
      const itemKey = key("IT");
      items.set(itemKey, { title: kind === "csl" ? source.title : String(source) });
      collections.get("CCROOT01").items.add(itemKey);
      return { itemKey, reused: false };
    },
    async setItemCollections(itemKeys, { add = [], remove = [] }) {
      for (const collectionKey of add) for (const itemKey of itemKeys) collections.get(collectionKey).items.add(itemKey);
      for (const collectionKey of remove) for (const itemKey of itemKeys) collections.get(collectionKey).items.delete(itemKey);
    },
    async collectionItemKeys(collectionKey) {
      return [...collections.get(collectionKey).items];
    },
    async listCollections() {
      return new Map([...collections].map(([collectionKey, entry]) => [collectionKey, entry.name]));
    },
    async createCollection(collectionName) {
      const collectionKey = key("CO");
      collections.set(collectionKey, { name: collectionName, items: new Set() });
      return collectionKey;
    },
    async renameCollection(collectionKey, collectionName) {
      collections.get(collectionKey).name = collectionName;
    },
    async deleteCollection(collectionKey) {
      collections.delete(collectionKey);
    }
  };
  return { service, items, collections };
}

function classification() {
  const doi = classifyCitation({ title: "Paper", url: "https://doi.org/10.1000/ABC.1" });
  assert.equal(doi.workKey, "doi:10.1000/abc.1");
  assert.equal(classifyCitation({ title: "RFC", url: "https://www.rfc-editor.org/rfc/rfc9110.html" }).source,
    "10.17487/rfc9110");
  assert.equal(classifyCitation({ title: "P", url: "https://pubmed.ncbi.nlm.nih.gov/16921475/" }).workKey,
    "pmid:16921475");
  const sectionA = classifyCitation({ title: "1.1 Cells", url: "https://openstax.org/books/biology-2e/pages/1-1" });
  const sectionB = classifyCitation({ title: "4.2 Membranes", url: "https://openstax.org/books/biology-2e/pages/4-2" });
  assert.equal(sectionA.workKey, sectionB.workKey);
  assert.equal(sectionA.source.title, "Biology 2e");
  const book = classifyCitation({
    title: "Guyton and Hall Textbook of Medical Physiology, 14th ed.",
    author: "John E. Hall and Michael E. Hall", publisher: "Elsevier", year: "2021"
  });
  assert.equal(book.workKey, "book:guyton and hall textbook of medical physiology|ed14");
  assert.equal(book.source.edition, "14");
  // A textbook cited through its publisher's shop page is the same work.
  assert.equal(classifyCitation({
    title: "Guyton and Hall Textbook of Medical Physiology, 14th ed., ch. 36", author: "John E. Hall",
    url: "https://eu.elsevierhealth.com/guyton-and-hall-textbook-of-medical-physiology.html"
  }).workKey, book.workKey);
  assert.equal(classifyCitation({ title: "Framing", url: "https://www.annualreviews.org/content/journals/10.1146/annurev.soc.26.1.611" }).workKey,
    "doi:10.1146/annurev.soc.26.1.611");
  assert.equal(classifyCitation({ title: "Quantum Behavior", url: "https://www.feynmanlectures.caltech.edu/I_37.html" }).workKey,
    classifyCitation({ title: "The Feynman Lectures on Physics, Vol. 1", url: "https://www.feynmanlectures.caltech.edu" }).workKey);
  assert.equal(classifyCitation({ title: "Airway resistance", url: "https://en.wikipedia.org/wiki/Airway_resistance" }).scholarly, false);
  assert.equal(classifyCitation({ title: "Just a title" }).scholarly, false);
  assert.deepEqual(splitEdition("Medical Physiology, 3rd ed., ch. 5 Transport"), { title: "Medical Physiology", edition: "3" });
  for (const nye of ["Joseph S. Nye Jr.", "Joseph S. Nye, Jr.", "Nye, Joseph S., Jr."]) {
    assert.deepEqual(cslAuthors(nye), [{ family: "Nye", given: "Joseph S., Jr." }]);
  }
  assert.deepEqual(cslAuthors("Honig, Jan Willem, and Norbert Both"),
    [{ family: "Honig", given: "Jan Willem" }, { family: "Both", given: "Norbert" }]);
  assert.equal(compareTitleCandidate(book, { data: { title: "Guyton and Hall Textbook of Medical Physiology", edition: "13" } }), "edition");
  assert.equal(compareTitleCandidate(book, { data: { title: "Guyton & Hall Textbook of Medical Physiology", edition: "14" } }), "different");
}

async function crossrefGuards() {
  const reply = items => async () => ({ ok: true, json: async () => ({ message: { items } }) });
  const flow = classifyCitation({
    title: "Flow: The Psychology of Optimal Experience", author: "Mihaly Csikszentmihalyi",
    publisher: "Harper & Row", year: "1990"
  });
  const review = {
    DOI: "10.2307/1511458", type: "journal-article", "container-title": ["Journal of Leisure Research"],
    title: ["Flow: The Psychology of Optimal Experience"], author: [{ family: "Csikszentmihalyi" }],
    issued: { "date-parts": [[1991]] }
  };
  assert.equal(await crossrefDoi(flow, reply([review])), null);
  assert.equal((await crossrefDoi(flow, reply([{ ...review, DOI: "10.1/BOOK", type: "monograph" }]))).source, "10.1/book");
  const article = classifyCitation({
    title: "Poverty Impedes Cognitive Function", author: "Anandi Mani", publisher: "Science, 341(6149)", year: "2013"
  });
  assert.equal((await crossrefDoi(article, reply([{
    DOI: "10.1126/science.1238041", type: "journal-article", "container-title": ["Science"],
    title: ["Poverty Impedes Cognitive Function"], author: [{ family: "Mani" }], issued: { "date-parts": [[2013]] }
  }]))).source, "10.1126/science.1238041");
}

function subcategorySplit() {
  const registry = {
    "Physiology & Medicine": {
      id: "physiology-medicine", domain: "health-medicine",
      subcategories: { cardio: { title: "Cardiovascular" } }
    }
  };
  const workItems = new Map();
  const puzzles = [];
  for (let index = 0; index < 4; index++) {
    workItems.set(`pmid:${index}`, { zotero_item_key: `ITEM000${index}` });
    puzzles.push({
      id: `p${index}`,
      document: {
        category: "physiology-medicine",
        subcategories: index < 2 ? { "physiology-medicine": "cardio" } : {},
        info: { citations: [{ title: "P", url: `https://pubmed.ncbi.nlm.nih.gov/${index}/` }] }
      }
    });
  }
  const flat = desiredCollections({ puzzles, registry, workItems, threshold: 10, minCategoryWorks: 1 });
  assert.equal(flat.get("category:physiology-medicine").items.size, 4);
  assert.equal(flat.has("subcategory:physiology-medicine/cardio"), false);
  assert.equal(flat.get("domain:health-medicine").name, "Health & Medicine");
  const split = desiredCollections({ puzzles, registry, workItems, threshold: 3, minCategoryWorks: 1, minSubcategoryWorks: 1,
    registryItemKeys: ["ITEM0000", "UNCITED1"] });
  assert.deepEqual([...split.get("subcategory:physiology-medicine/cardio").items], ["ITEM0000", "ITEM0001"]);
  assert.deepEqual([...split.get("category:physiology-medicine").items], ["ITEM0002", "ITEM0003"]);
  assert.deepEqual([...split.get("uncited").items], ["UNCITED1"]);
  // Below the minimum, a category's works go straight into its domain.
  const folded = desiredCollections({ puzzles, registry, workItems, minCategoryWorks: 5 });
  assert.equal(folded.has("category:physiology-medicine"), false);
  assert.equal(folded.get("domain:health-medicine").items.size, 4);
  // A split category keeps a small subcategory's works in its own folder.
  const kept = desiredCollections({ puzzles, registry, workItems, threshold: 3, minCategoryWorks: 1,
    minSubcategoryWorks: 3 });
  assert.equal(kept.has("subcategory:physiology-medicine/cardio"), false);
  assert.equal(kept.get("category:physiology-medicine").items.size, 4);
}

async function publish(pool, document, kind = "puzzle") {
  await pool.query(`
    INSERT INTO published_documents
      (kind, id, title, document, content_hash, revision, published_by, published_at, updated_at)
    VALUES ($1, $2, $3, $4, 'fixture', 1, 'author-1', '2026-01-01', '2026-01-01')
  `, [kind, document.id, document.title, JSON.stringify(document)]);
}

async function backfillAndSync() {
  const db = new PGlite();
  const pool = poolFrom(db);
  await applyPostgresMigrations(pool);
  await publish(pool, {
    id: "biology", title: "Biology", info: { text: "Living systems." },
    subcategories: {}, domain: "life-sciences"
  }, "category");
  await publish(pool, {
    id: "membranes", title: "Membranes", category: "biology",
    info: { citations: [
      { title: "1.1 Cells", url: "https://openstax.org/books/biology-2e/pages/1-1" },
      { title: "4.2 Membranes", url: "https://openstax.org/books/biology-2e/pages/4-2", pages: "ch. 4" },
      { title: "Cell membrane", url: "https://en.wikipedia.org/wiki/Cell_membrane" }
    ] }
  });
  const { service, collections } = fakeZotero();
  const plan = await planBackfill({ pool, service });
  assert.equal(plan.summary.works, 1);
  assert.equal(plan.summary.create, 1);
  assert.equal(plan.summary.excludedCitations, 1);

  const first = await applyBackfill({ pool, service, plan });
  assert.deepEqual([first.created, first.failed.length], [1, 0]);
  // A rerun of the same plan (after a crash, say) creates nothing new.
  const again = await applyBackfill({ pool, service, plan });
  assert.equal(again.created, 0);
  assert.equal(service.calls.length, 1);
  assert.equal((await planBackfill({ pool, service })).summary.done, 1);

  // Both sections of the book link to its one mirrored source.
  const [itemKey] = collections.get("CCROOT01").items;
  const sources = new PostgresCitationSourceRepository(pool);
  const source = await sources.upsertFromZotero({
    zoteroLibrary: "user:7", zoteroItemKey: itemKey, zoteroCollectionKey: "CCROOT01",
    citekey: "openstax2024biology", metadata: { title: "Biology 2e" }
  });
  await refreshPublishedCitationUsage(pool, sources);
  const { rows } = await pool.query(
    "SELECT source_id, match_basis FROM citation_usage_observations ORDER BY citation_index"
  );
  assert.deepEqual(rows.slice(0, 2).map(row => [row.source_id, row.match_basis]),
    [[source.id, "work_key"], [source.id, "work_key"]]);

  const syncPlan = await planCollectionSync({ pool, service, minCategoryWorks: 1 });
  assert.deepEqual(syncPlan.create.map(entry => entry.pathKey), ["domain:life-sciences", "category:biology"]);
  await applyCollectionSync({ pool, service, plan: syncPlan });
  const byName = name => [...collections.values()].find(entry => entry.name === name);
  assert.deepEqual([...byName("Biology").items], [itemKey]);
  const settled = await planCollectionSync({ pool, service, minCategoryWorks: 1 });
  assert.equal(settled.summary.create + settled.summary.itemsAdded + settled.summary.delete, 0);

  // Withdrawing the only citing puzzle moves the work to "Not yet cited"
  // and removes the now-empty generated collections.
  await pool.query("UPDATE published_documents SET withdrawn_at = '2026-02-01'");
  const after = await planCollectionSync({ pool, service, minCategoryWorks: 1 });
  assert.deepEqual(after.delete.map(entry => entry.pathKey), ["category:biology", "domain:life-sciences"]);
  await applyCollectionSync({ pool, service, plan: after });
  assert.equal(byName("Biology"), undefined);
  assert.deepEqual([...byName("Not yet cited").items], [itemKey]);
  await db.close();
}

export async function run() {
  classification();
  await crossrefGuards();
  subcategorySplit();
  await backfillAndSync();
}
