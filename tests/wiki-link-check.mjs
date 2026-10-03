import assert from "node:assert/strict";
import {
  InMemoryTransport,
  LATEST_PROTOCOL_VERSION
} from "@modelcontextprotocol/server";
import { createHostedMcpAuthoringServer } from "../modules/hostedMcpAuthoringServer.js";
import { createHostedAuthoringContentService } from "../modules/hostedAuthoringContentService.js";
import { resolveWikipediaTitles } from "../modules/wikipediaTitles.js";
import { checkUrlReachability, publicHttpUrlError } from "../modules/linkReachability.js";
import {
  checkDocumentLinks,
  checkDocumentWikiLinks,
  collectDocumentWebLinks,
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
    const href = String(url);
    if (!href.includes("api.php")) {
      return { status: 200, ok: true, headers: new Headers(), body: { async cancel() {} } };
    }
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
  assert.deepEqual(collectDocumentWebLinks(fixture).map(ref => [ref.where, ref.link]), [
    ['bridge "peptidoglycan"', "https://example.org/not-wiki"]
  ]);

  const cited = {
    id: "cited",
    info: {
      links: ["https://en.wikipedia.org/wiki/Gram_stain"],
      citations: [
        { title: "Dodho", url: "https://www.dodho.com/photo" },
        { title: "Already wiki", url: "wiki:Gram stain" }
      ]
    },
    learningIntroduction: {
      links: ["https://spj.org/ethics"],
      citations: [{ title: "SPJ note", url: "https://www.spj.org/ethicscode.asp" }]
    }
  };
  assert.deepEqual(collectDocumentWikiLinks(cited).map(ref => ref.title), ["Gram stain", "Gram stain"]);
  assert.deepEqual(collectDocumentWebLinks(cited).map(ref => [ref.where, ref.link]), [
    ['puzzle citation "Dodho"', "https://www.dodho.com/photo"],
    ["learningIntroduction", "https://spj.org/ethics"],
    ['learningIntroduction citation "SPJ note"', "https://www.spj.org/ethicscode.asp"]
  ]);

  // ---- reachability: public URLs only; refusal is inconclusive, not missing ----
  assert.equal(publicHttpUrlError("https://www.dodho.com/photo"), null);
  assert.equal(publicHttpUrlError("http://127.0.0.1/latest"), "not a public address");
  assert.equal(publicHttpUrlError("http://169.254.169.254/"), "not a public address");
  assert.equal(publicHttpUrlError("http://[::1]/"), "not a public address");
  assert.equal(publicHttpUrlError("mailto:editor@example.org"), "not an http(s) URL");
  const privateProbe = [];
  const blocked = await checkUrlReachability("http://127.0.0.1/latest", {
    fetch: async url => { privateProbe.push(String(url)); return { status: 200, headers: new Headers() }; }
  });
  assert.equal(blocked.status, "inconclusive");
  assert.equal(privateProbe.length, 0);

  const probes = [];
  function scripted(responses) {
    return async (url, init) => {
      probes.push({ url: String(url), method: init.method });
      const next = responses.shift();
      if (next instanceof Error) throw next;
      return { status: next.status, headers: new Headers(next.headers || {}), body: { async cancel() {} } };
    };
  }
  const ok = await checkUrlReachability("https://www.dodho.com/photo", {
    fetch: scripted([{ status: 200 }])
  });
  assert.equal(ok.status, "ok");
  assert.equal(probes[0].method, "HEAD");

  probes.length = 0;
  const headMissing = await checkUrlReachability("https://www.dodho.com/photo", {
    fetch: scripted([{ status: 404 }, { status: 200 }])
  });
  assert.equal(headMissing.status, "ok", "a HEAD 404 is retried with GET");
  assert.deepEqual(probes.map(probe => probe.method), ["HEAD", "GET"]);

  const missing = await checkUrlReachability("https://www.dodho.com/gone", {
    fetch: scripted([{ status: 404 }, { status: 404 }])
  });
  assert.deepEqual(missing, { status: "missing", finalUrl: null, reason: "HTTP 404" });

  const refused = await checkUrlReachability("https://www.spj.org/ethics", {
    fetch: scripted([{ status: 403 }, { status: 403 }])
  });
  assert.equal(refused.status, "inconclusive");
  assert.equal(refused.reason, "HTTP 403");

  const moved = await checkUrlReachability("http://spj.org/ethics", {
    fetch: scripted([
      { status: 301, headers: { location: "https://www.spj.org/ethics" } },
      { status: 200 }
    ])
  });
  assert.equal(moved.status, "redirect");
  assert.equal(moved.finalUrl, "https://www.spj.org/ethics");

  const trap = [];
  const redirectedHome = await checkUrlReachability("https://example.org/start", {
    fetch: async (url, init) => {
      trap.push(String(url));
      if (init.method === "HEAD" && String(url).endsWith("/start")) {
        return { status: 302, headers: new Headers({ location: "http://127.0.0.1/secret" }), body: { async cancel() {} } };
      }
      return { status: 200, headers: new Headers(), body: { async cancel() {} } };
    }
  });
  assert.equal(redirectedHome.status, "inconclusive");
  assert.equal(redirectedHome.reason, "redirected to a non-public address");
  assert.deepEqual(trap, ["https://example.org/start"]);

  const citedReport = await checkDocumentLinks(cited, {
    fetch: async url => {
      const href = String(url);
      if (href.includes("api.php")) return wikipediaStub()(url);
      if (href.includes("dodho")) return { status: 404, headers: new Headers(), body: { async cancel() {} } };
      return { status: 403, headers: new Headers(), body: { async cancel() {} } };
    }
  });
  const dodho = citedReport.results.find(result => result.link === "https://www.dodho.com/photo");
  assert.equal(dodho.status, "missing");
  assert.equal(dodho.kind, "web");
  const spj = citedReport.results.find(result => result.link === "https://www.spj.org/ethicscode.asp");
  assert.equal(spj.status, "inconclusive");
  assert.ok(citedReport.results.some(result => result.kind === "wiki" && result.title === "Gram stain"));
  const citedFlags = wikiLinkFlags(citedReport);
  assert.ok(citedFlags.some(flag => flag.id === "web-link-missing" && flag.message.includes("Dodho")));
  assert.ok(citedFlags.some(flag => flag.id === "web-link-inconclusive" && flag.message.includes("does not mean the link is wrong")));

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
  assert.match(page, /4 links to look at/);
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
    assert.equal(result.checkedDocument, "working-copy");
    assert.equal(result.checked, 9);
    assert.equal(result.wiki.checked, 8);
    assert.equal(result.web.checked, 1);
    assert.equal(result.web.counts.ok, 1);
    assert.deepEqual(result.counts, { ok: 5, redirect: 2, missing: 1, disambiguation: 1, inconclusive: 0 });
    assert.equal(result.problems.length, 4);
    assert.equal(result.unavailable, null);
    const apiCalls = () => mcpCalls.filter(call => String(call.url).includes("api.php"));
    assert.equal(apiCalls().length, 1);
    assert.equal(mcpStore.size(), 8, "the tool writes Wikipedia resolutions to the store");
    await session.call("check_puzzle_links", { draft_id: "gram-stain-fixture" });
    assert.equal(apiCalls().length, 1, "and reads them back next time");
    assert.ok(mcpCalls.length > apiCalls().length, "other URLs are asked again; they are not stored");

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

  // ---- MCP tool: a restored baseline follows the filed review; an edit stays on the working copy ----
  const older = withClusterWikiLink(fixture, { name: "Old cluster", title: "Old cluster page" });
  const filed = withClusterWikiLink(fixture, { name: "Verification methods", title: "Verification methods" });
  const inProgress = withClusterWikiLink(fixture, { name: "In progress", title: "In progress" });
  const otherGeneration = withClusterWikiLink(fixture, { name: "Other generation", title: "Other generation" });
  const quiet = structuredClone(fixture);
  quiet.id = "quiet-puzzle";
  const reviewDocuments = createMemoryContentDocumentRepository();
  const olderEvent = await reviewDocuments.recordPuzzleAgentReview({
    id: "gram-stain-fixture",
    eventType: "proposed",
    proposal: older,
    basePublishedRevision: 1,
    reviewedAt: "2026-10-01T00:00:00.000Z"
  });
  const filedEvent = await reviewDocuments.recordPuzzleAgentReview({
    id: "gram-stain-fixture",
    eventType: "proposed",
    proposal: filed,
    basePublishedRevision: 1,
    reviewedAt: "2026-10-02T00:00:00.000Z"
  });
  await reviewDocuments.recordPuzzleAgentReview({
    id: "gram-stain-fixture",
    eventType: "proposed",
    proposal: otherGeneration,
    basePublishedRevision: 2,
    reviewedAt: "2026-10-02T12:00:00.000Z"
  });
  const reviewDrafts = {
    "filed-review": {
      draftId: "filed-review",
      puzzleId: "gram-stain-fixture",
      revision: 4,
      status: "draft",
      document: fixture,
      hasReviewBaseline: true,
      reviewBasePublishedRevision: 1
    },
    "in-progress": {
      draftId: "in-progress",
      puzzleId: "gram-stain-fixture",
      revision: 5,
      status: "draft",
      document: inProgress,
      hasReviewBaseline: true,
      reviewBasePublishedRevision: 1
    },
    "quiet-review": {
      draftId: "quiet-review",
      puzzleId: "quiet-puzzle",
      revision: 1,
      status: "draft",
      document: quiet,
      hasReviewBaseline: true,
      reviewBasePublishedRevision: 1
    }
  };
  const reviewServer = createHostedMcpAuthoringServer({
    draftRepository: {
      async list() { return []; },
      async get({ draftId }) {
        const record = reviewDrafts[draftId];
        if (!record) throw new Error(`Unknown draft: ${draftId}`);
        return record;
      },
      async readReviewBaseline({ draftId }) {
        return draftId === "quiet-review" ? quiet : fixture;
      }
    },
    contentDocuments: reviewDocuments,
    contentService,
    actor: { subject: "link-check-tests" },
    fetch: wikipediaStub()
  });
  const reviewSession = await connect(reviewServer);
  try {
    const proposal = await reviewSession.call("check_puzzle_links", { draft_id: "filed-review" });
    assert.equal(proposal.checkedDocument, "proposal");
    assert.equal(proposal.eventId, filedEvent.id);
    assert.equal(proposal.checked, 10);
    assert.ok(proposal.results.some(item =>
      item.where === 'cluster "Verification methods"' && item.title === "Verification methods"
    ), "a restored baseline checks the filed review, not the old working copy");
    assert.ok(!proposal.results.some(item => item.title === "Old cluster page"),
      "a stacked filing is the latest open proposal, not the preceding one");
    assert.ok(!proposal.results.some(item => item.title === "Other generation"),
      "a proposal against another published revision is not this review");

    const editing = await reviewSession.call("check_puzzle_links", { draft_id: "in-progress" });
    assert.equal(editing.checkedDocument, "working-copy");
    assert.equal(editing.eventId, undefined);
    assert.ok(editing.results.some(item => item.title === "In progress"));

    const quietCheck = await reviewSession.call("check_puzzle_links", { draft_id: "quiet-review" });
    assert.equal(quietCheck.checkedDocument, "working-copy");
    assert.equal(quietCheck.eventId, undefined, "a baseline with no filed review is the working copy");

    await reviewDocuments.recordPuzzleAgentReview({
      id: "gram-stain-fixture",
      eventType: "rejected",
      proposal: filed,
      sourceEventId: filedEvent.id,
      reviewedAt: "2026-10-03T00:00:00.000Z"
    });
    const preceding = await reviewSession.call("check_puzzle_links", { draft_id: "filed-review" });
    assert.equal(preceding.checkedDocument, "proposal");
    assert.equal(preceding.eventId, olderEvent.id);
    assert.ok(preceding.results.some(item => item.title === "Old cluster page"));
    assert.ok(!preceding.results.some(item => item.title === "Verification methods"));
  } finally {
    await reviewSession.close();
  }
}

function withClusterWikiLink(document, { name, title }) {
  const next = structuredClone(document);
  const cluster = next.clusters[0];
  cluster.name = name;
  cluster.info = { ...cluster.info, links: [...cluster.info.links, `wiki:${title}`] };
  return next;
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
