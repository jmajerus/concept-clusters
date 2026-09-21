import { createExecutionContext, createScheduledController, waitOnExecutionContext } from "cloudflare:test";
import { env } from "cloudflare:workers";
import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../../src/authoring-worker";
import { D1ContentDocumentRepository } from "../../modules/contentDocumentRepository.js";
import { createD1WikiLinkCheckStore } from "../../modules/wikiLinkCheckStore.js";
import { checkDocumentWikiLinks } from "../../modules/wikiLinkCheck.js";

// Wikipedia's query API, formatversion=2 shape, for whatever titles it is
// asked: one redirect, one missing, the rest exist.
function wikipediaStub(calls: string[][] = []) {
  return async (input: RequestInfo | URL) => {
    const titles = new URL(String(input)).searchParams.get("titles")!.split("|");
    calls.push(titles);
    const redirects: object[] = [];
    const pages: object[] = [];
    for (const title of titles) {
      if (title === "Lugol's iodine") {
        redirects.push({ from: title, to: "Lugol's solution" });
        pages.push({ title: "Lugol's solution", pageid: 2 });
      } else if (title === "No Such Article Xyz") {
        pages.push({ title, missing: true });
      } else {
        pages.push({ title, pageid: 10 + pages.length });
      }
    }
    return new Response(JSON.stringify({ query: { normalized: [], redirects, pages } }), {
      headers: { "Content-Type": "application/json" }
    });
  };
}

const document = {
  id: "wiki-link-checks-fixture",
  title: "Link fixture",
  category: "microbiology",
  info: { text: "x", links: ["wiki:Gram stain"] },
  clusters: [{
    id: "c",
    name: "C",
    fact: "f",
    seeds: ["a", "b"],
    floatingTerms: ["c"],
    termInfo: {
      a: { text: "t", links: ["wiki:Lugol's iodine"] },
      b: { text: "t", links: ["wiki:No Such Article Xyz"] }
    }
  }],
  bridges: []
};

describe("wiki_link_checks in D1", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores resolutions and serves fresh ones without the network", async () => {
    const store = createD1WikiLinkCheckStore(env.AUTHORING_DB);
    const now = Date.parse("2026-09-22T09:00:00Z");
    const calls: string[][] = [];
    const first = await checkDocumentWikiLinks(document, { store, fetch: wikipediaStub(calls) as typeof fetch, now: () => now });
    expect(first.unavailable).toBeNull();
    expect(first.results.map(r => [r.title, r.status, r.resolvedTitle])).toEqual([
      ["Gram stain", "ok", null],
      ["Lugol's iodine", "redirect", "Lugol's solution"],
      ["No Such Article Xyz", "missing", null]
    ]);
    expect(calls).toHaveLength(1);

    const stored = await store.readAll();
    expect(stored.get("Lugol's iodine")).toMatchObject({
      exists: true, disambiguation: false, resolvedTitle: "Lugol's solution", checkedAt: "2026-09-22T09:00:00.000Z"
    });
    expect(stored.get("No Such Article Xyz")).toMatchObject({ exists: false });

    // Upsert: re-checking rewrites the row instead of failing on the key.
    const later = now + 60 * 60 * 1000;
    const second = await checkDocumentWikiLinks(document, {
      store,
      fetch: (async () => { throw new Error("must not be called"); }) as typeof fetch,
      now: () => later
    });
    expect(second.unavailable).toBeNull();
    expect(second.checked).toBe(3);

    const stale = await checkDocumentWikiLinks(document, {
      store, fetch: wikipediaStub(calls) as typeof fetch, now: () => now + 2 * 24 * 60 * 60 * 1000
    });
    expect(calls).toHaveLength(2);
    expect(stale.checked).toBe(3);
    expect((await store.readAll()).get("Gram stain")?.checkedAt).toBe("2026-09-24T09:00:00.000Z");
  });

  it("scheduled(): resolves every wiki: link in the published corpus into the table", async () => {
    const contentDocuments = new D1ContentDocumentRepository(env.AUTHORING_DB);
    await contentDocuments.publish({
      kind: "puzzle",
      id: "wiki-link-checks-fixture",
      document,
      actor: { subject: "wiki-link-checks-test" }
    });
    const calls: string[][] = [];
    vi.stubGlobal("fetch", wikipediaStub(calls));

    const ctx = createExecutionContext();
    await worker.scheduled!(createScheduledController({ cron: "0 6 * * 1" }), env, ctx);
    await waitOnExecutionContext(ctx);

    expect(calls.length).toBeGreaterThanOrEqual(1);
    const asked = new Set(calls.flat());
    expect(asked.has("Gram stain")).toBe(true);
    expect(asked.has("No Such Article Xyz")).toBe(true);
    const stored = await createD1WikiLinkCheckStore(env.AUTHORING_DB).readAll();
    expect(stored.get("Lugol's iodine")?.resolvedTitle).toBe("Lugol's solution");
    expect(stored.get("No Such Article Xyz")?.exists).toBe(false);
  });
});
