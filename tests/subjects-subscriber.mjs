import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { DOMAINS } from "../puzzles/domains.js";
import { DOMAINS_SNAPSHOT, replaceDomainsRegistry } from "../modules/domainRegistry.js";
import { PostgresPublishedRepository } from "../modules/postgresPublishedRepository.js";
import {
  CursorMovedError,
  acceptHeldChange,
  applyEdits,
  createSubjectsSyncer,
  createSubscriptionStore,
  planChange,
  reconcilePlan,
  retagPuzzleDocument,
  runSubjectsSync
} from "../modules/subjectsSubscriber.js";
import { TerminologyError } from "../modules/terminologyClient.js";
import { applyPostgresMigrations } from "../tools/postgres-migrate.mjs";

export const name = "Subjects subscriber: cc-subjects changes reach published categories, or hold";

const actor = { subject: "author-1" };

function poolFrom(db) {
  const client = { query: (text, values) => db.query(text, values), release() {} };
  return { async connect() { return client; }, query: (text, values) => db.query(text, values) };
}

const term = (id, slug, label, broader = null, extra = {}) => ({
  id, slug, label, status: "active", broader: broader ? [broader] : [], replacedBy: [], scheme: "cc-subjects", ...extra
});

// life-sciences > biology > { genomics, epigenomics }; humanities > history
const SNAPSHOT = [
  term("d1", "life-sciences", "Life Sciences"),
  term("d2", "humanities", "Humanities"),
  term("c1", "biology", "Biology", "d1"),
  term("c2", "history", "History", "d2"),
  term("s1", "genomics", "Genomics", "c1"),
  term("s2", "epigenomics", "Epigenomics", "c1")
];

function mapOf(terms) {
  return Object.fromEntries(terms.map(t => [t.id, {
    slug: t.slug, label: t.label, status: t.status, broader: t.broader, replacedBy: t.replacedBy
  }]));
}

function fakeClient({ log = "log-1", version = 10, terms = SNAPSHOT } = {}) {
  const changes = [];
  const reports = [];
  return {
    log: changes,
    reports,
    head: () => (changes.length ? changes[changes.length - 1].n : version),
    async state() { return { log, version, head: version, terms }; },
    async changes(since) {
      const head = this.head();
      if (since > head) throw new TerminologyError(400, "since beyond head");
      return { log, version: head, changes: changes.filter(change => change.n > since) };
    },
    async reportProgress(report) {
      reports.push(report);
      return { ok: true };
    }
  };
}

function planUnits() {
  const terms = mapOf(SNAPSHOT);

  const added = planChange({ n: 11, kind: "added", terms: ["s3"], after: term("s3", "proteomics", "Proteomics", "c1") }, terms);
  assert.equal(added.action, "apply");
  assert.deepEqual(added.edits, [{ op: "subcategory", category: "biology", sub: "proteomics", title: "Proteomics" }]);
  assert.equal(added.terms.s3.slug, "proteomics");

  const category = planChange({ n: 11, kind: "added", terms: ["c3"], after: term("c3", "ecology", "Ecology", "d1") }, terms);
  assert.deepEqual(category.edits, [{ op: "category", id: "ecology", title: "Ecology", domain: "life-sciences" }]);

  const domain = planChange({ n: 11, kind: "added", terms: ["d9"], after: term("d9", "astronomy", "Astronomy") }, terms);
  assert.deepEqual(domain.edits, [{ op: "domain", id: "astronomy", title: "Astronomy" }]);

  const relabel = planChange({
    n: 12, kind: "labelled", terms: ["s1"], after: term("s1", "genomics", "Genome Science", "c1"),
    afterTerms: [term("s1", "genomics", "Genome Science", "c1")]
  }, terms);
  assert.deepEqual(relabel.edits, [{ op: "subcategory", category: "biology", sub: "genomics", title: "Genome Science" }]);

  const domainRename = planChange({
    n: 12, kind: "labelled", terms: ["d2"], after: term("d2", "humanities", "The Humanities"),
    afterTerms: [term("d2", "humanities", "The Humanities")]
  }, terms);
  assert.deepEqual(domainRename.edits, [{ op: "domain", id: "humanities", title: "The Humanities" }]);

  // A domain merged into another takes its categories along.
  const domainMerge = planChange({
    n: 12, kind: "merged", terms: ["d2", "d1", "c2"],
    afterTerms: [
      term("d2", "humanities", "Humanities", null, { status: "retired", replacedBy: ["d1"] }),
      term("d1", "life-sciences", "Life Sciences"),
      term("c2", "history", "History", "d1")
    ]
  }, terms);
  assert.deepEqual(domainMerge.edits, [
    { op: "category", id: "history", domain: "life-sciences" },
    { op: "withdraw-domain", id: "humanities" }
  ]);

  const categoryMove = planChange({
    n: 13, kind: "moved", terms: ["c2"], after: term("c2", "history", "History", "d1"),
    afterTerms: [term("c2", "history", "History", "d1")]
  }, terms);
  assert.deepEqual(categoryMove.edits, [{ op: "category", id: "history", domain: "life-sciences" }]);

  const subMove = planChange({
    n: 13, kind: "moved", terms: ["s1"], after: term("s1", "genomics", "Genomics", "c2"),
    afterTerms: [term("s1", "genomics", "Genomics", "c2")]
  }, terms);
  assert.equal(subMove.code, "subcategory-move");

  const depth = planChange({
    n: 13, kind: "moved", terms: ["s1"], after: term("s1", "genomics", "Genomics", "d1"),
    afterTerms: [term("s1", "genomics", "Genomics", "d1")]
  }, terms);
  assert.equal(depth.code, "depth-change");

  const retire = planChange({
    n: 14, kind: "retired", terms: ["s2"],
    after: term("s2", "epigenomics", "Epigenomics", "c1", { status: "retired", replacedBy: ["s1"] }),
    afterTerms: [term("s2", "epigenomics", "Epigenomics", "c1", { status: "retired", replacedBy: ["s1"] })]
  }, terms);
  assert.equal(retire.action, "apply");
  assert.deepEqual(retire.edits, [
    { op: "retag", from: { category: "biology", sub: "epigenomics" }, to: { category: "biology", sub: "genomics" } },
    { op: "remove-subcategory", category: "biology", sub: "epigenomics" }
  ]);

  const bare = planChange({
    n: 14, kind: "retired", terms: ["s2"],
    afterTerms: [term("s2", "epigenomics", "Epigenomics", "c1", { status: "retired" })]
  }, terms);
  assert.equal(bare.code, "retire-ambiguous");

  // A category merged into another carries its subcategories across.
  const merge = planChange({
    n: 15, kind: "merged", terms: ["c1", "c2", "s1", "s2"],
    afterTerms: [
      term("c1", "biology", "Biology", "d1", { status: "retired", replacedBy: ["c2"] }),
      term("c2", "history", "History", "d2"),
      term("s1", "genomics", "Genomics", "c2"),
      term("s2", "epigenomics", "Epigenomics", "c2")
    ]
  }, terms);
  assert.equal(merge.code, "subcategory-move");

  // A category retired while subcategories are still under it.
  const orphaning = planChange({
    n: 15, kind: "retired", terms: ["c1"],
    afterTerms: [term("c1", "biology", "Biology", "d1", { status: "retired", replacedBy: ["c2"] })]
  }, terms);
  assert.equal(orphaning.code, "depth-change");

  assert.equal(planChange({ n: 16, kind: "slugged", terms: ["s1"], after: term("s1", "genome", "Genomics", "c1") }, terms).code, "slug-change");
  assert.equal(planChange({ n: 16, kind: "split", terms: ["s1"] }, terms).code, "split");
  assert.equal(planChange({ n: 16, kind: "noted", terms: ["s1"], afterTerms: [term("s1", "genomics", "Genomics", "c1")] }, terms).action, "skip");
  assert.equal(planChange({ n: 16, kind: "scheme-changed", terms: [] }, terms).action, "skip");
  assert.equal(planChange({
    n: 16, kind: "updated", terms: ["s1"], afterTerms: [term("s1", "genomics", "Genomics Renamed", "c1")]
  }, terms).code, "unexpected-change");
}

function reconcileUnits() {
  const terms = mapOf([
    ...SNAPSHOT,
    term("s9", "palaeogenomics", "Palaeogenomics", "c1", { status: "retired" })
  ]);
  const { edits, problems } = reconcilePlan(terms, [
    { id: "biology", title: "Biology", domain: "life-sciences", subcategories: { genomics: { title: "Genomics" }, palaeogenomics: { title: "Palaeogenomics" } } },
    { id: "chemistry", title: "Chemistry", domain: "life-sciences" },
    { id: "trivia", title: "Trivia" }
  ], { domains: [{ id: "life-sciences", title: "Life Sciences" }] });
  assert.deepEqual(edits, [
    { op: "domain", id: "humanities", title: "Humanities" },
    { op: "category", id: "history", title: "History", domain: "humanities" },
    { op: "subcategory", category: "biology", sub: "epigenomics", title: "Epigenomics" }
  ]);
  assert.deepEqual(problems.map(problem => problem.code).sort(), ["not-in-cc-subjects", "not-in-cc-subjects", "retired-in-terminology"]);
}

function retagUnits() {
  assert.deepEqual(
    retagPuzzleDocument({ id: "p", category: "biology", subcategories: { biology: "epigenomics" } },
      { category: "biology", sub: "epigenomics" }, { category: "biology", sub: "genomics" }),
    { id: "p", category: "biology", subcategories: { biology: "genomics" } }
  );
  assert.deepEqual(
    retagPuzzleDocument({ id: "p", category: "history", categories: ["history", "old", "biology"], subcategories: { old: "x", biology: "genomics" } },
      { category: "old" }, { category: "biology" }),
    { id: "p", category: "history", categories: ["history", "biology"], subcategories: { biology: "genomics" } }
  );
  assert.equal(retagPuzzleDocument({ id: "p", category: "history" }, { category: "old" }, { category: "biology" }), null);
}

async function endToEnd() {
  const db = new PGlite();
  const pool = poolFrom(db);
  await applyPostgresMigrations(pool);
  const repository = new PostgresPublishedRepository(pool);
  await repository.publish({
    kind: "category", id: "biology", actor,
    document: {
      id: "biology", title: "Biology", domain: "life-sciences",
      info: { text: "Living systems." },
      subcategories: { genomics: { title: "Genomics", info: { text: "Whole genomes." } }, epigenomics: { title: "Epigenomics" } }
    }
  });
  await repository.publish({ kind: "puzzle", id: "marks", actor, document: { id: "marks", title: "Marks", category: "biology", subcategories: { biology: "epigenomics" } } });
  const store = createSubscriptionStore(pool);
  const client = fakeClient();

  // Dry run writes nothing.
  const dry = await runSubjectsSync({ client, store, repository, apply: false });
  assert.equal(dry.outcome, "bootstrap");
  assert.deepEqual(dry.planned, [
    "domain life-sciences, title \"Life Sciences\"",
    "domain humanities, title \"Humanities\"",
    "category history, title \"History\", domain humanities"
  ]);
  assert.equal(await store.read(), null);

  const boot = await runSubjectsSync({ client, store, repository });
  assert.equal(boot.outcome, "bootstrapped");
  assert.equal(boot.through, 10);
  assert.equal(boot.reset, true);
  assert.equal((await repository.getPublished({ kind: "category", id: "history" })).document.domain, "humanities");
  // Domains are seeded from cc-subjects with the snapshot's player copy,
  // and the registry follows them.
  const humanities = (await repository.getPublished({ kind: "domain", id: "humanities" })).document;
  assert.deepEqual(humanities, { id: "humanities", title: "Humanities", info: DOMAINS_SNAPSHOT.humanities.info });
  assert.deepEqual(Object.keys(DOMAINS).sort(), ["humanities", "life-sciences"]);

  // A rename keeps player copy and records the old title; an addition lands
  // under its category; a retire re-tags puzzles and removes the old entry.
  client.log.push(
    { n: 11, kind: "labelled", terms: ["c1"], after: term("c1", "biology", "Life Science", "d1"), afterTerms: [term("c1", "biology", "Life Science", "d1")] },
    { n: 12, kind: "added", terms: ["s3"], after: term("s3", "proteomics", "Proteomics", "c1", { status: "provisional" }) },
    { n: 13, kind: "noted", terms: ["s3"], afterTerms: [term("s3", "proteomics", "Proteomics", "c1", { status: "provisional" })] },
    {
      n: 14, kind: "retired", terms: ["s2"],
      after: term("s2", "epigenomics", "Epigenomics", "c1", { status: "retired", replacedBy: ["s1"] }),
      afterTerms: [term("s2", "epigenomics", "Epigenomics", "c1", { status: "retired", replacedBy: ["s1"] })]
    },
    { n: 15, kind: "slugged", terms: ["s1"], after: term("s1", "genome-science", "Genomics", "c1"), afterTerms: [term("s1", "genome-science", "Genomics", "c1")] },
    { n: 16, kind: "labelled", terms: ["c2"], after: term("c2", "history", "World History", "d2"), afterTerms: [term("c2", "history", "World History", "d2")] }
  );
  const run = await runSubjectsSync({ client, store, repository });
  assert.equal(run.outcome, "held");
  assert.equal(run.through, 14);
  assert.deepEqual(run.blocked.at, 15);
  assert.equal(run.blocked.code, "slug-change");
  const biology = (await repository.getPublished({ kind: "category", id: "biology" })).document;
  assert.equal(biology.title, "Life Science");
  assert.deepEqual(biology.previousTitles, ["Biology"]);
  assert.equal(biology.info.text, "Living systems.");
  assert.equal(biology.subcategories.genomics.info.text, "Whole genomes.");
  assert.equal(biology.subcategories.proteomics.title, "Proteomics");
  assert.equal(biology.subcategories.epigenomics, undefined);
  assert.deepEqual((await repository.getPublished({ kind: "puzzle", id: "marks" })).document.subcategories, { biology: "genomics" });

  // Held: the next pass stops at the same change and changes nothing.
  const again = await runSubjectsSync({ client, store, repository });
  assert.equal(again.outcome, "held");
  assert.deepEqual(again.applied, []);

  // A person migrates the slug by hand, then accepts the change.
  await assert.rejects(acceptHeldChange({ client, store, n: 16 }), /held at change 15/);
  await acceptHeldChange({ client, store, n: 15 });
  const after = await runSubjectsSync({ client, store, repository });
  assert.equal(after.outcome, "applied");
  assert.equal(after.through, 16);
  assert.equal((await repository.getPublished({ kind: "category", id: "history" })).document.title, "World History");

  // The drain-loop syncer reports when the cursor or the hold moves, and
  // otherwise once per heartbeat.
  let clock = 0;
  const syncer = createSubjectsSyncer({
    pool, client, env: { SUBJECTS_SYNC: "on" }, now: () => clock, log: { log() {}, error() {} }
  });
  await syncer();
  await syncer();
  assert.equal(client.reports.length, 1);
  assert.deepEqual(client.reports[0], { log: "log-1", through: 16, label: "Concept Clusters", schemes: ["cc-subjects"] });
  client.log.push({ n: 17, kind: "split", terms: ["s1"] });
  await syncer();
  assert.deepEqual(client.reports[1].blocked, { at: 17, code: "split", reason: client.reports[1].blocked.reason });
  clock += 5 * 60_000;
  await syncer();
  assert.equal(client.reports.length, 3);
  assert.equal(syncer.status().state, "held");

  assert.equal((await createSubjectsSyncer({ pool, client, env: {} })()).outcome, "skipped");
}

async function categoryRetireAndRebuild() {
  const db = new PGlite();
  const pool = poolFrom(db);
  await applyPostgresMigrations(pool);
  const repository = new PostgresPublishedRepository(pool);
  await repository.publish({ kind: "category", id: "biology", actor, document: { id: "biology", title: "Biology", domain: "life-sciences" } });
  await repository.publish({ kind: "category", id: "history", actor, document: { id: "history", title: "History", domain: "humanities" } });
  await repository.publish({ kind: "category", id: "ecology", actor, document: { id: "ecology", title: "Ecology", domain: "life-sciences" } });
  await repository.publish({ kind: "puzzle", id: "food-webs", actor, document: { id: "food-webs", title: "Food Webs", category: "ecology", categories: ["ecology", "history"] } });
  const store = createSubscriptionStore(pool);
  const client = fakeClient({
    terms: [term("d1", "life-sciences", "Life Sciences"), term("d2", "humanities", "Humanities"),
      term("c1", "biology", "Biology", "d1"), term("c2", "history", "History", "d2"), term("c3", "ecology", "Ecology", "d1")]
  });
  assert.equal((await runSubjectsSync({ client, store, repository })).outcome, "bootstrapped");

  // Withdrawing a category a live puzzle still uses holds.
  const refused = await applyEdits([{ op: "withdraw-category", id: "ecology" }], { repository });
  assert.equal(refused.hold.code, "still-referenced");
  assert.match(refused.hold.reason, /food-webs/);

  client.log.push({
    n: 11, kind: "retired", terms: ["c3"],
    after: term("c3", "ecology", "Ecology", "d1", { status: "retired", replacedBy: ["c1"] }),
    afterTerms: [term("c3", "ecology", "Ecology", "d1", { status: "retired", replacedBy: ["c1"] })]
  });
  const retired = await runSubjectsSync({ client, store, repository });
  assert.equal(retired.outcome, "applied");
  const puzzle = (await repository.getPublished({ kind: "puzzle", id: "food-webs" })).document;
  assert.equal(puzzle.category, "biology");
  assert.deepEqual(puzzle.categories, ["biology", "history"]);
  assert.ok((await repository.getPublished({ kind: "category", id: "ecology" })).withdrawnAt);

  // A cursor that moved since it was read is not overwritten.
  const cursor = await store.read();
  await store.write({ ...cursor, expected: cursor.through });
  await assert.rejects(store.write({ ...cursor, through: cursor.through, expected: cursor.through - 1 }), CursorMovedError);
  await assert.rejects(store.write({ ...cursor, expected: null }), CursorMovedError);

  // A new log id clears the cursor, and the next pass bootstraps.
  const relogged = { ...client, changes: async () => ({ log: "log-2", version: 3, changes: [] }) };
  const moved = await runSubjectsSync({ client: relogged, store, repository });
  assert.equal(moved.outcome, "rebuilt");
  assert.equal(await store.read(), null);
  assert.equal((await runSubjectsSync({ client, store, repository })).outcome, "bootstrapped");

  // So does a cursor past the head (400) under the same log id.
  const behind = { ...client, changes: async () => { throw new TerminologyError(400, "since beyond head"); } };
  assert.equal((await runSubjectsSync({ client: behind, store, repository })).outcome, "rebuilt");
  assert.equal(await store.read(), null);
  assert.equal((await runSubjectsSync({ client, store, repository })).outcome, "bootstrapped");
}

async function domainChanges() {
  const db = new PGlite();
  const pool = poolFrom(db);
  await applyPostgresMigrations(pool);
  const repository = new PostgresPublishedRepository(pool);
  const store = createSubscriptionStore(pool);
  const client = fakeClient({
    terms: [term("d1", "life-sciences", "Life Sciences"), term("d2", "humanities", "Humanities"),
      term("c1", "biology", "Biology", "d1"), term("c2", "history", "History", "d2")]
  });
  assert.equal((await runSubjectsSync({ client, store, repository })).outcome, "bootstrapped");
  client.log.push(
    // A new domain and a category under it in the same pass.
    { n: 11, kind: "added", terms: ["d3"], after: term("d3", "astronomy", "Astronomy") },
    { n: 12, kind: "added", terms: ["c3"], after: term("c3", "cosmology", "Cosmology", "d3") },
    { n: 13, kind: "labelled", terms: ["d2"], after: term("d2", "humanities", "The Humanities"), afterTerms: [term("d2", "humanities", "The Humanities")] },
    {
      n: 14, kind: "merged", terms: ["d2", "d1", "c2"],
      afterTerms: [
        term("d2", "humanities", "The Humanities", null, { status: "retired", replacedBy: ["d1"] }),
        term("d1", "life-sciences", "Life Sciences"),
        term("c2", "history", "History", "d1")
      ]
    }
  );
  const run = await runSubjectsSync({ client, store, repository });
  assert.equal(run.outcome, "applied", JSON.stringify(run.blocked));
  assert.equal((await repository.getPublished({ kind: "domain", id: "astronomy" })).document.title, "Astronomy");
  assert.equal((await repository.getPublished({ kind: "category", id: "cosmology" })).document.domain, "astronomy");
  assert.equal((await repository.getPublished({ kind: "category", id: "history" })).document.domain, "life-sciences");
  const humanities = await repository.getPublished({ kind: "domain", id: "humanities" });
  assert.equal(humanities.document.title, "The Humanities");
  assert.ok(humanities.withdrawnAt);
  assert.deepEqual(Object.keys(DOMAINS).sort(), ["astronomy", "life-sciences"]);
}

export async function run() {
  try {
    planUnits();
    reconcileUnits();
    retagUnits();
    await endToEnd();
    await categoryRetireAndRebuild();
    await domainChanges();
  } finally {
    // The runs install their domain rows in DOMAINS; later tests expect the snapshot.
    replaceDomainsRegistry(JSON.parse(JSON.stringify(DOMAINS_SNAPSHOT)));
  }
}
