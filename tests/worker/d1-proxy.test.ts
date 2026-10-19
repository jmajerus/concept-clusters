import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { handleD1ProxyRequest } from "../../src/d1-proxy-worker";
import { createHttpD1Database } from "../../modules/httpD1Database.js";
import { D1DraftRepository } from "../../modules/d1DraftRepository.js";
import { DraftConflictError } from "../../modules/draftRepository.js";
import { createHostedAuthoringContentService } from "../../modules/hostedAuthoringContentService.js";

const TOKEN = "proxy-test-token";
const proxyEnv = { AUTHORING_DB: env.AUTHORING_DB, D1_PROXY_TOKEN: TOKEN };

function post(body: unknown, { token = TOKEN, path = "/query", method = "POST" } = {}) {
  return handleD1ProxyRequest(new Request(`https://proxy.test${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(method === "POST" ? { body: JSON.stringify(body) } : {})
  }), proxyEnv);
}

function proxiedDatabase() {
  return createHttpD1Database({
    endpoint: "https://proxy.test/query",
    token: TOKEN,
    fetchImpl: (url: RequestInfo | URL, init?: RequestInit) =>
      handleD1ProxyRequest(new Request(url, init), proxyEnv)
  });
}

describe("D1 proxy Worker", () => {
  it("refuses requests without the right token, and refuses all without a configured one", async () => {
    expect((await post({ sql: "SELECT 1" }, { token: "" })).status).toBe(401);
    expect((await post({ sql: "SELECT 1" }, { token: "wrong" })).status).toBe(401);
    expect((await post({ sql: "SELECT 1" }, { path: "/other" })).status).toBe(404);
    expect((await post(null, { method: "GET" })).status).toBe(405);
    const unconfigured = await handleD1ProxyRequest(new Request("https://proxy.test/query", {
      method: "POST",
      headers: { Authorization: "Bearer anything" },
      body: JSON.stringify({ sql: "SELECT 1" })
    }), { AUTHORING_DB: env.AUTHORING_DB });
    expect(unconfigured.status).toBe(503);
  });

  it("answers in the D1 REST API's shapes, for single statements, batches, and errors", async () => {
    const single: any = await (await post({ sql: "SELECT ? AS value", params: [7] })).json();
    expect(single).toMatchObject({ success: true, result: [{ success: true, results: [{ value: 7 }] }] });

    const batch: any = await (await post({ batch: [{ sql: "SELECT 1 AS a" }, { sql: "SELECT 2 AS b" }] })).json();
    expect(batch.result.map((entry: { results: unknown[] }) => entry.results)).toEqual([[{ a: 1 }], [{ b: 2 }]]);

    const malformed = await post({ sql: "" });
    expect(malformed.status).toBe(400);
    for (const body of [null, 7, "SELECT 1", []]) {
      expect((await post(body)).status, JSON.stringify(body)).toBe(400);
    }

    const broken = await post({ sql: "SELECT * FROM no_such_table" });
    expect(broken.status).toBe(400);
    expect(((await broken.json()) as any).errors[0].message).toMatch(/no such table/);
  });

  it("carries repository writes, change counts, and constraint errors through the HTTP client", async () => {
    const repository = new D1DraftRepository(proxiedDatabase());
    const actor = { subject: "proxy-author" };
    const original = createHostedAuthoringContentService().getPuzzleDocument("energy-flow");
    const document = { ...original, id: "d1-proxy-fixture", title: "D1 proxy fixture" };

    const created = await repository.create({ draftId: "d1-proxy-fixture", document, actor });
    expect(created.revision).toBe(1);
    await expect(repository.create({ draftId: "d1-proxy-fixture", document, actor }))
      .rejects.toBeInstanceOf(DraftConflictError);

    const saved = await repository.save({
      draftId: "d1-proxy-fixture",
      expectedRevision: 1,
      document: { ...document, title: "D1 proxy fixture revised" },
      actor
    });
    expect(saved.revision).toBe(2);
    await expect(repository.save({
      draftId: "d1-proxy-fixture",
      expectedRevision: 1,
      document,
      actor
    })).rejects.toBeInstanceOf(DraftConflictError);

    const direct = await new D1DraftRepository(env.AUTHORING_DB).get({ draftId: "d1-proxy-fixture", actor });
    expect(direct.title).toBe("D1 proxy fixture revised");
  });
});
