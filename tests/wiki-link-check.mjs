import assert from "node:assert/strict";
import {
  InMemoryTransport,
  LATEST_PROTOCOL_VERSION
} from "@modelcontextprotocol/server";
import { createHostedMcpAuthoringServer } from "../modules/hostedMcpAuthoringServer.js";
import { createHostedAuthoringContentService } from "../modules/hostedAuthoringContentService.js";
import { resolveWikipediaTitles } from "../modules/wikipediaTitles.js";
import {
  checkDocumentWikiLinks,
  collectDocumentWikiLinks,
  loadWikiLinkHealth,
  runWikiLinkHealth,
  wikiLinkFlags,
  WIKI_LINK_FLAG_IDS
} from "../modules/wikiLinkCheck.js";
import { createMemoryWikiLinkCheckStore } from "../modules/wikiLinkCheckStore.js";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { mapDraftDetail } from "../modules/localDraftReview.js";
import { renderDraftPage } from "../modules/draftReviewPage.js";
import { CATEGORIES } from "../puzzles/categories.js";

export const name = "wiki link check: collector, Wikipedia resolution, D1-backed memory, flags, cron run, MCP tool";

// What Wikipedia's query API answers for the fixture below, in its own
// formatversion=2 shape: one normalisation, one redirect, one missing page,
// one disambiguation page.
function wikipediaStub(calls = []) {
  return async (url, init) => {
    calls.push({ url: String(url), init });
    const titles = new URL(url).searchParams.get("titles").split("|");
    const normalized = [];
    const redirects = [];
    const pages = [];
    for (const title of titles) {
      if (title === "porin (protein)") {
        normalized.push({ from: title, to: "Porin (protein)" });
        pages.push({ title: "Porin (protein)", pageid: 1 });
      } else if (title === "Lugol's iodine") {
        redirects.push({ from: title, to: "Lugol's solution" });
        pages.push({ title: "Lugol's solution", pageid: 2 });
      } else if (title === "Teichoic acids of Gram-positives") {
        pages.push({ title, missing: true });
      } else if (title === "ATP") {
        pages.push({ title, pageid: 3, pageprops: { disambiguation: "" } });
      } else {
        pages.push({ title, pageid: 10 + pages.length });
      }
    }
    return {
      ok: true,
      status: 200,
      async json() {
        return { query: { normalized, redirects, pages } };
      }
    };
  };
}

const fixture = {
  id: "gram-stain-fixture",
  title: "Gram stain fixture",
  category: "microbiology",
  info: { text: "Overview.", links: ["wiki:Gram stain"] },
  clusters: [
    {
      id: "gram-negative",
      name: "Gram-negative",
      fact: "Fact.",
      seeds: ["outer membrane", "porins"],
      floatingTerms: ["iodine"],
      info: { text: "Cluster.", links: ["wiki:Gram-negative bacteria#Cell envelope"] },
      termInfo: {
        porins: { text: "Channels.", links: ["wiki:porin (protein)"] },
        iodine: { text: "Mordant.", links: ["wiki:Lugol's iodine"] },
        "outer membrane": "No link here."
      }
    },
    {
      id: "gram-positive",
      name: "Gram-positive",
      fact: "Fact.",
      seeds: ["teichoic acids", "thick wall"],
      floatingTerms: ["ATP"],
      termInfo: {
        "teichoic acids": { text: "Polymers.", links: ["wiki:Teichoic acids of Gram-positives"] },
        ATP: { text: "Energy.", links: ["wiki:ATP"] }
      }
    }
  ],
  bridges: [
    {
      term: "peptidoglycan",
      clusters: ["gram-negative", "gram-positive"],
      fact: "Shared mesh.",
      info: { text: "Mesh.", links: ["wiki:Peptidoglycan", "https://example.org/not-wiki"] }
    }
  ],
  learningIntroduction: {
    requirement: "optional",
    content: { text: "Lesson." },
    links: ["wiki:Hans Christian Gram"]
  }
};

export async function run() {
  // ---- collector: every authored wiki: link, located, section stripped ----
  const refs = collectDocumentWikiLinks(fixture);
  assert.deepEqual(refs.map(ref => [ref.where, ref.title]), [
    ["puzzle", "Gram stain"],
    ['cluster "Gram-negative"', "Gram-negative bacteria"],
    ['term "porins"', "porin (protein)"],
    ['term "iodine"', "Lugol's iodine"],
    ['term "teichoic acids"', "Teichoic acids of Gram-positives"],
    ['term "ATP"', "ATP"],
    ['bridge "peptidoglycan"', "Peptidoglycan"],
    ["learningIntroduction", "Hans Christian Gram"]
  ]);
  assert.equal(refs[1].link, "wiki:Gram-negative bacteria#Cell envelope",
    "the authored link is kept verbatim for the report; only the title is stripped of its section");

  // ---- shared resolver: normalisation and redirect both surface as resolvedTitle ----
  const calls = [];
  const resolved = await resolveWikipediaTitles(
    ["porin (protein)", "Lugol's iodine", "Teichoic acids of Gram-positives", "ATP", "Gram stain"],
    { fetch: wikipediaStub(calls) }
  );
  assert.equal(calls.length, 1, "one batched request");
  assert.match(calls[0].init.headers["User-Agent"], /concept-clusters/);
  assert.deepEqual(resolved.get("porin (protein)"), { exists: true, disambiguation: false, resolvedTitle: "Porin (protein)" });
  assert.deepEqual(resolved.get("Lugol's iodine"), { exists: true, disambiguation: false, resolvedTitle: "Lugol's solution" });
  assert.deepEqual(resolved.get("Teichoic acids of Gram-positives"), { exists: false, disambiguation: false, resolvedTitle: null });
  assert.deepEqual(resolved.get("ATP"), { exists: true, disambiguation: true, resolvedTitle: null });
  assert.deepEqual(resolved.get("Gram stain"), { exists: true, disambiguation: false, resolvedTitle: null });

  // ---- document check: statuses per link; no store means every call asks ----
  const checkCalls = [];
  const report = await checkDocumentWikiLinks(fixture, { fetch: wikipediaStub(checkCalls) });
  assert.equal(report.unavailable, null);
  assert.equal(report.checked, 8);
  const byTitle = Object.fromEntries(report.results.map(r => [r.title, r]));
  assert.equal(byTitle["Gram stain"].status, "ok");
  assert.equal(byTitle["porin (protein)"].status, "redirect");
  assert.equal(byTitle["porin (protein)"].resolvedTitle, "Porin (protein)");
  assert.equal(byTitle["Lugol's iodine"].status, "redirect");
  assert.equal(byTitle["Teichoic acids of Gram-positives"].status, "missing");
  assert.equal(byTitle.ATP.status, "disambiguation");
  assert.equal(checkCalls.length, 1);
  await checkDocumentWikiLinks(fixture, { fetch: wikipediaStub(checkCalls) });
  assert.equal(checkCalls.length, 2, "without a store there is nothing to remember by");

  // ---- store: fresh rows are trusted, stale ones re-asked, results written back ----
  const store = createMemoryWikiLinkCheckStore();
  const storeCalls = [];
  const t0 = Date.parse("2026-09-22T10:00:00Z");
  const first = await checkDocumentWikiLinks(fixture, { fetch: wikipediaStub(storeCalls), store, now: () => t0 });
  assert.equal(storeCalls.length, 1);
  assert.equal(store.size(), 8, "every resolved title is remembered");
  const second = await checkDocumentWikiLinks(fixture, { fetch: wikipediaStub(storeCalls), store, now: () => t0 + 60_000 });
  assert.equal(storeCalls.length, 1, "a minute later nothing is asked again");
  assert.deepEqual(second.results, first.results);
  const partial = { ...fixture, info: { text: "x", links: ["wiki:Gram stain", "wiki:Bacteria"] } };
  await checkDocumentWikiLinks(partial, { fetch: wikipediaStub(storeCalls), store, now: () => t0 + 60_000 });
  assert.equal(storeCalls.length, 2);
  assert.deepEqual(new URL(storeCalls[1].url).searchParams.get("titles").split("|"), ["Bacteria"],
    "only the title the store had never seen is asked");
  const stale = await checkDocumentWikiLinks(fixture, {
    fetch: wikipediaStub(storeCalls), store, now: () => t0 + 25 * 60 * 60 * 1000
  });
  assert.equal(storeCalls.length, 3, "a day later the rows are stale and are re-asked");
  assert.equal(stale.checked, 8);
  const offlineWithStore = await checkDocumentWikiLinks(fixture, {
    fetch: async () => { throw new Error("offline"); }, store, now: () => t0 + 25 * 60 * 60 * 1000 + 1000
  });
  assert.equal(offlineWithStore.unavailable, null, "fresh rows answer without the network");
  assert.equal(offlineWithStore.checked, 8);

  // ---- unavailable network: one honest flag, no fabricated results ----
  const offline = await checkDocumentWikiLinks(fixture, {
    fetch: async () => { throw new Error("getaddrinfo ENOTFOUND en.wikipedia.org"); }
  });
  assert.equal(offline.checked, 0);
  assert.match(offline.unavailable, /could not be reached/);
  const offlineFlags = wikiLinkFlags(offline);
  assert.equal(offlineFlags.length, 1);
  assert.equal(offlineFlags[0].id, WIKI_LINK_FLAG_IDS.unavailable);

  // ---- flags: one per problem, ok links silent, redirect names the target ----
  const flags = wikiLinkFlags(report);
  assert.deepEqual(flags.map(flag => flag.id), [
    WIKI_LINK_FLAG_IDS.redirect,
    WIKI_LINK_FLAG_IDS.redirect,
    WIKI_LINK_FLAG_IDS.missing,
    WIKI_LINK_FLAG_IDS.disambiguation
  ]);
  assert.match(flags[0].message, /term "porins": wiki:porin \(protein\) — redirects to "Porin \(protein\)"/);
  assert.match(flags[2].message, /no Wikipedia article at that title/);
  assert.match(flags[3].message, /disambiguation page/);

  // ---- cron run: every live published puzzle, issues grouped by title ----
  const contentDocuments = createMemoryContentDocumentRepository();
  const actor = { subject: "link-check-tests" };
  await contentDocuments.publish({ kind: "puzzle", id: "gram-stain-fixture", document: fixture, actor });
  await contentDocuments.publish({
    kind: "puzzle", id: "second-board", actor,
    document: { ...fixture, id: "second-board", title: "Second", learningIntroduction: undefined,
      clusters: [{ id: "c", name: "C", fact: "f", seeds: ["a", "b"], floatingTerms: ["c"],
        termInfo: { a: { text: "t", links: ["wiki:ATP"] } } }], bridges: [] }
  });
  await contentDocuments.publish({
    kind: "puzzle", id: "withdrawn-board", actor,
    document: { ...fixture, id: "withdrawn-board", title: "Gone",
      clusters: [{ id: "c", name: "C", fact: "f", seeds: ["a", "b"], floatingTerms: ["c"],
        termInfo: { a: { text: "t", links: ["wiki:Withdrawn Only Title"] } } }], bridges: [], learningIntroduction: undefined }
  });
  await contentDocuments.unpublish({ kind: "puzzle", id: "withdrawn-board", actor });
  const cronStore = createMemoryWikiLinkCheckStore();
  // Stamped in the future, as clock skew between the cron and a laptop can
  // produce: a refresh run must still re-ask rather than trust it.
  await cronStore.write(new Map([["Gram stain", { exists: true, disambiguation: false, resolvedTitle: null }]]), { now: t0 + 7 * 24 * 60 * 60 * 1000 });
  const cronCalls = [];
  const health = await runWikiLinkHealth({
    contentDocuments, store: cronStore, fetch: wikipediaStub(cronCalls), now: () => t0 + 1000
  });
  assert.equal(health.puzzles, 2, "withdrawn boards are not part of the corpus");
  assert.equal(health.unavailable, null);
  const asked = new URL(cronCalls[0].url).searchParams.get("titles").split("|");
  assert.ok(asked.includes("Gram stain"), "the weekly run refreshes even titles the store already has");
  assert.ok(!asked.includes("Withdrawn Only Title"));
  assert.equal(health.checked, 8);
  assert.deepEqual(health.counts, { ok: 4, redirect: 2, missing: 1, disambiguation: 1 },
    "the run reports the breakdown the dashboard heartbeat carries");
  assert.deepEqual(health.issues.map(issue => [issue.status, issue.title, issue.puzzles]), [
    ["disambiguation", "ATP", ["gram-stain-fixture", "second-board"]],
    ["missing", "Teichoic acids of Gram-positives", ["gram-stain-fixture"]],
    ["redirect", "Lugol's iodine", ["gram-stain-fixture"]],
    ["redirect", "porin (protein)", ["gram-stain-fixture"]]
  ]);
  assert.equal(cronStore.size(), 8);

  // ---- admin loader: joins the corpus against the store, no network ----
  await cronStore.write(new Map([["Never Referenced", { exists: false, disambiguation: false, resolvedTitle: null }]]), { now: t0 });
  const loaded = await loadWikiLinkHealth({ contentDocuments, store: cronStore });
  assert.equal(loaded.puzzles, 2);
  assert.equal(loaded.titles, 8);
  assert.equal(loaded.checked, 8);
  assert.equal(loaded.unchecked, 0);
  assert.deepEqual(loaded.counts, { ok: 4, redirect: 2, missing: 1, disambiguation: 1 });
  assert.equal(loaded.affectedPuzzles, 2);
  assert.deepEqual(loaded.issues.map(issue => issue.title), [
    "Teichoic acids of Gram-positives", "ATP", "Lugol's iodine", "porin (protein)"
  ], "missing, then disambiguation, then redirects; titles the corpus does not reference are ignored");
  assert.deepEqual(loaded.issues[1].references.map(ref => [ref.puzzleId, ref.where]), [
    ["gram-stain-fixture", 'term "ATP"'],
    ["second-board", 'term "a"']
  ]);
  const partlyChecked = await loadWikiLinkHealth({ contentDocuments, store: createMemoryWikiLinkCheckStore() });
  assert.equal(partlyChecked.checked, 0);
  assert.equal(partlyChecked.unchecked, 8);
  assert.equal(partlyChecked.latestCheckedAt, null);

  // ---- draft page: link flags are page-only and rendered in their own block ----
  const contentService = createHostedAuthoringContentService();
  const detail = await mapDraftDetail({
    draftId: "gram-stain-fixture",
    puzzleId: "gram-stain-fixture",
    revision: 1,
    status: "draft",
    document: fixture
  }, {
    contentService,
    checkWikiLinks: document => checkDocumentWikiLinks(document, { fetch: wikipediaStub() })
  });
  const pageFlags = detail.validation.flags.filter(flag => flag.id.startsWith("wiki-link-"));
  assert.equal(pageFlags.length, 4);
  assert.ok(pageFlags.every(flag => flag.pageOnly), "link flags never enter MCP validation output");
  const page = renderDraftPage(detail, { variant: "local", categoryRegistry: CATEGORIES });
  assert.match(page, /4 Wikipedia links to look at/);
  assert.match(page, /redirects to &quot;Lugol&#39;s solution&quot;/);
  assert.doesNotMatch(page, /Structural note[^<]*<\/summary>\s*<ul>[^]*?Lugol/,
    "link flags are not folded into the collapsed structural notes");

  const offlineDetail = await mapDraftDetail({
    draftId: "gram-stain-fixture",
    puzzleId: "gram-stain-fixture",
    revision: 1,
    status: "draft",
    document: fixture
  }, { contentService, checkWikiLinks: null });
  assert.ok(!offlineDetail.validation.flags?.some(flag => flag.id.startsWith("wiki-link-")),
    "no checker, no link flags, no network");

  // ---- MCP tool: draft_id and puzzle_id, exactly one required; store honoured ----
  const mcpCalls = [];
  const mcpStore = createMemoryWikiLinkCheckStore();
  const server = createHostedMcpAuthoringServer({
    draftRepository: {
      async list() { return []; },
      async get({ draftId }) {
        if (draftId !== "gram-stain-fixture") throw new Error(`Unknown draft: ${draftId}`);
        return { draftId, puzzleId: draftId, revision: 1, status: "draft", document: fixture };
      }
    },
    contentService,
    actor: { subject: "link-check-tests" },
    fetch: wikipediaStub(mcpCalls),
    wikiLinkStore: mcpStore
  });
  const session = await connect(server);
  try {
    const result = await session.call("check_puzzle_links", { draft_id: "gram-stain-fixture" });
    assert.equal(result.draftId, "gram-stain-fixture");
    assert.equal(result.checked, 8);
    assert.deepEqual(result.counts, { ok: 4, redirect: 2, missing: 1, disambiguation: 1 });
    assert.equal(result.problems.length, 4);
    assert.equal(result.unavailable, null);
    assert.equal(mcpCalls.length, 1);
    assert.equal(mcpStore.size(), 8, "the tool writes what it learned to the store");
    await session.call("check_puzzle_links", { draft_id: "gram-stain-fixture" });
    assert.equal(mcpCalls.length, 1, "and reads it back next time");

    const both = await session.request("tools/call", {
      name: "check_puzzle_links",
      arguments: { draft_id: "gram-stain-fixture", puzzle_id: "gram-stain-fixture" }
    });
    assert.ok(both.error || both.result?.isError, "draft_id and puzzle_id together are rejected");
    const neither = await session.request("tools/call", { name: "check_puzzle_links", arguments: {} });
    assert.ok(neither.error || neither.result?.isError, "one of draft_id or puzzle_id is required");
  } finally {
    await session.close();
  }
}

async function connect(server) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  let nextId = 1;
  const pending = new Map();
  clientTransport.onmessage = message => {
    if (message.id !== undefined && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };
  const request = (method, params = undefined) => new Promise(resolve => {
    const id = nextId++;
    pending.set(id, resolve);
    clientTransport.send({ jsonrpc: "2.0", id, method, ...(params === undefined ? {} : { params }) });
  });
  await server.connect(serverTransport);
  await clientTransport.start();
  await request("initialize", {
    protocolVersion: LATEST_PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "wiki-link-check-tests", version: "1.0.0" }
  });
  await clientTransport.send({ jsonrpc: "2.0", method: "notifications/initialized" });
  return {
    request,
    call: async (toolName, args = {}) => {
      const response = await request("tools/call", { name: toolName, arguments: args });
      return response.result.structuredContent;
    },
    close: () => clientTransport.close()
  };
}
