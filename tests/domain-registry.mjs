import assert from "node:assert/strict";
import { DOMAINS } from "../puzzles/domains.js";
import {
  DOMAINS_SNAPSHOT,
  domainsRegistryFromDocuments,
  replaceDomainsRegistry,
  validateDomainDocument
} from "../modules/domainRegistry.js";
import { renderDomainsSource } from "../modules/domainsSnapshot.js";
import { assemblePlayCorpus } from "../modules/playCorpus.js";
import { replicaWriteOrder } from "../modules/publishedReplica.js";

export const name = "Domain registry: published domains replace the snapshot in place";

export async function run() {
  try {
    const live = domainsRegistryFromDocuments([
      { id: "astronomy", title: "Astronomy", info: { text: "Stars." } },
      { id: "other", title: "Other" },
      { id: "untitled" }
    ]);
    assert.deepEqual(live, { astronomy: { title: "Astronomy", info: { text: "Stars." } } });

    // No rows keeps the snapshot; rows replace it in place, so readers that
    // imported DOMAINS see them.
    assert.equal(replaceDomainsRegistry({}), DOMAINS);
    assert.equal(Object.keys(DOMAINS).length, Object.keys(DOMAINS_SNAPSHOT).length);
    replaceDomainsRegistry(live);
    assert.deepEqual(Object.keys(DOMAINS), ["astronomy"]);
    assert.ok(DOMAINS_SNAPSHOT.humanities, "the snapshot copy survives");

    assert.equal(validateDomainDocument({ id: "astronomy", title: " Astronomy " }).document.title, "Astronomy");
    assert.equal(validateDomainDocument({ id: "other", title: "Other" }).valid, false);
    assert.equal(validateDomainDocument({ id: "Bad Id", title: "Bad" }).valid, false);
    assert.equal(validateDomainDocument({ id: "x", title: "X", info: {} }).valid, false);

    // The corpus carries domains only once some are published.
    const rows = [{ document: { id: "astronomy", title: "Astronomy" } }];
    assert.deepEqual(assemblePlayCorpus({ domainRows: rows }).domains, { astronomy: { title: "Astronomy" } });
    assert.equal("domains" in assemblePlayCorpus({}), false);

    assert.deepEqual(
      replicaWriteOrder([{ kind: "category", id: "a" }, { kind: "domain", id: "z" }, { kind: "puzzle", id: "p" }]).map(row => row.kind),
      ["domain", "category", "puzzle"]
    );

    // The snapshot is sorted by title and imports as a module.
    const source = renderDomainsSource({ zoology: { title: "Animals" }, astronomy: { title: "Stars" } });
    const module = await import(`data:text/javascript,${encodeURIComponent(source.replace(
      'import { GENERATED_DOMAIN_IDS } from "../puzzles/domains.js";', ""
    ))}`);
    assert.deepEqual(Object.keys(module.DOMAINS), ["zoology", "astronomy"]);
    assert.deepEqual([...module.RESERVED_DOMAIN_IDS], ["other"]);
  } finally {
    replaceDomainsRegistry(JSON.parse(JSON.stringify(DOMAINS_SNAPSHOT)));
  }
}
