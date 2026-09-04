import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  InMemoryTransport,
  LATEST_PROTOCOL_VERSION
} from "@modelcontextprotocol/server";
import { D1DraftRepository } from "../modules/d1DraftRepository.js";
import { createHttpD1Database, HttpD1Error } from "../modules/httpD1Database.js";
import {
  LocalD1ConfigError,
  resolveLocalD1Config,
  resolveLocalDraftActor
} from "../modules/localD1Config.js";
import { createRepositoryDraftStore } from "../modules/repositoryDraftStore.js";
import { createConceptClustersMcpServer } from "../modules/mcpAuthoringServer.js";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";

export const name = "Local D1 workspace: config, HTTP binding, owner-scoped drafts";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function unsignedJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig`;
}

async function mcpSession(server) {
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
    clientTransport.send({
      jsonrpc: "2.0",
      id,
      method,
      ...(params === undefined ? {} : { params })
    });
  });
  await server.connect(serverTransport);
  await clientTransport.start();
  await request("initialize", {
    protocolVersion: LATEST_PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "local-d1-workspace-tests", version: "1.0.0" }
  });
  await clientTransport.send({
    jsonrpc: "2.0",
    method: "notifications/initialized"
  });
  return {
    request,
    async close() {
      await clientTransport.close();
      await server.close();
    }
  };
}

export async function run() {
  assert.deepEqual(
    resolveLocalDraftActor({ env: { AUTHORING_OWNER_SUBJECT: "access-sub-1" } }),
    { subject: "access-sub-1" }
  );

  const token = unsignedJwt({
    sub: "access-sub-1",
    email: "author@example.com",
    name: "Author"
  });
  assert.deepEqual(
    resolveLocalDraftActor({ env: { CF_ACCESS_JWT: token } }),
    { subject: "access-sub-1", email: "author@example.com", name: "Author" }
  );
  assert.deepEqual(
    resolveLocalDraftActor({
      env: { AUTHORING_OWNER_SUBJECT: "access-sub-1", CF_ACCESS_JWT: token }
    }),
    { subject: "access-sub-1", email: "author@example.com", name: "Author" }
  );
  assert.throws(
    () => resolveLocalDraftActor({
      env: { AUTHORING_OWNER_SUBJECT: "other-sub", CF_ACCESS_JWT: token }
    }),
    LocalD1ConfigError
  );
  assert.throws(() => resolveLocalDraftActor({ env: {} }), LocalD1ConfigError);

  const fromWrangler = await resolveLocalD1Config({
    env: {
      CLOUDFLARE_ACCOUNT_ID: "account-1",
      CLOUDFLARE_API_TOKEN: "d1-token"
    },
    repositoryRoot: process.cwd()
  });
  assert.equal(fromWrangler.accountId, "account-1");
  assert.equal(fromWrangler.token, "d1-token");
  assert.equal(fromWrangler.databaseId, "726254cf-2847-42a0-b061-7900342cfd7c");

  const wranglerDir = await mkdtemp(join(tmpdir(), "concept-clusters-wrangler-"));
  try {
    await writeFile(join(wranglerDir, "wrangler.authoring.jsonc"), `${JSON.stringify({
      d1_databases: [
        { binding: "OTHER_DB", database_id: "other-database-id" },
        { binding: "AUTHORING_DB", database_id: "authoring-database-id" }
      ]
    }, null, 2)}\n`);
    const fromBinding = await resolveLocalD1Config({
      env: {
        CLOUDFLARE_ACCOUNT_ID: "account-1",
        CLOUDFLARE_API_TOKEN: "d1-token"
      },
      repositoryRoot: wranglerDir
    });
    assert.equal(fromBinding.databaseId, "authoring-database-id");
  } finally {
    await rm(wranglerDir, { recursive: true, force: true });
  }

  await assert.rejects(
    () => resolveLocalD1Config({ env: { CLOUDFLARE_ACCOUNT_ID: "account-1" } }),
    LocalD1ConfigError
  );

  const queries = [];
  const row = {
    id: "http-draft",
    puzzle_id: "http-draft",
    owner_subject: "access-sub-1",
    title: "HTTP draft",
    status: "draft",
    document: JSON.stringify({ id: "http-draft", title: "HTTP draft" }),
    content_hash: "sha256:abc",
    base_commit_sha: null,
    validation_json: null,
    created_at: "2026-08-21T00:00:00.000Z",
    updated_at: "2026-08-21T00:00:00.000Z",
    revision: 1
  };
  const database = createHttpD1Database({
    accountId: "account-1",
    databaseId: "db-1",
    token: "d1-token",
    fetchImpl: async (url, init) => {
      assert.match(url, /\/accounts\/account-1\/d1\/database\/db-1\/query$/);
      assert.equal(init.headers.Authorization, "Bearer d1-token");
      const body = JSON.parse(init.body);
      queries.push(body);
      if (body.batch) {
        return jsonResponse({
          success: true,
          result: body.batch.map(() => ({
            success: true,
            results: [],
            meta: { changes: 1 }
          }))
        });
      }
      if (String(body.sql).includes("INSERT INTO puzzle_drafts")) {
        return jsonResponse({
          success: true,
          result: [{ success: true, results: [], meta: { changes: 1 } }]
        });
      }
      if (String(body.sql).includes("SET installed_content_hash = content_hash")) {
        row.installed_content_hash = row.content_hash;
        return jsonResponse({
          success: true,
          result: [{ success: true, results: [], meta: { changes: 1 } }]
        });
      }
      if (String(body.sql).includes("WHERE id = ? AND owner_subject = ?")) {
        assert.deepEqual(body.params.slice(0, 2), ["http-draft", "access-sub-1"]);
        return jsonResponse({
          success: true,
          result: [{ success: true, results: [row], meta: { changes: 0 } }]
        });
      }
      if (String(body.sql).includes("SELECT * FROM puzzle_drafts")) {
        return jsonResponse({
          success: true,
          result: [{ success: true, results: [row], meta: { changes: 0 } }]
        });
      }
      throw new Error(`unexpected SQL: ${body.sql}`);
    }
  });

  const insert = await database.prepare("INSERT INTO puzzle_drafts (id) VALUES (?)")
    .bind("http-draft")
    .run();
  assert.equal(insert.meta.changes, 1);
  const selected = await database.prepare("SELECT * FROM puzzle_drafts WHERE id = ? AND owner_subject = ?")
    .bind("http-draft", "access-sub-1")
    .first();
  assert.equal(selected.id, "http-draft");
  const batched = await database.batch([
    database.prepare("UPDATE puzzle_draft_history SET seq = ?").bind(1),
    database.prepare("UPDATE puzzle_drafts SET status = ?").bind("submitted")
  ]);
  assert.equal(batched.length, 2);
  assert.equal(queries.at(-1).batch.length, 2);

  const uniqueDb = createHttpD1Database({
    accountId: "account-1",
    databaseId: "db-1",
    token: "d1-token",
    fetchImpl: async () => jsonResponse({
      success: false,
      errors: [{ code: 7500, message: "UNIQUE constraint failed: puzzle_drafts.id" }]
    })
  });
  await assert.rejects(
    () => uniqueDb.prepare("INSERT INTO puzzle_drafts (id) VALUES (?)").bind("http-draft").run(),
    error => error instanceof HttpD1Error
      && error.message.includes("UNIQUE constraint failed")
  );

  const actor = { subject: "access-sub-1" };
  const repository = new D1DraftRepository(database);
  const created = await repository.create({
    draftId: "http-draft",
    document: { id: "http-draft", title: "HTTP draft" },
    actor
  });
  assert.equal(created.draftId, "http-draft");
  assert.equal(created.revision, 1);
  assert.equal(created.document.title, "HTTP draft");

  const store = createRepositoryDraftStore({ repository, actor });
  const listed = await store.listDrafts();
  assert.equal(listed[0].draftId, "http-draft");
  const fromStore = await store.getDraft("http-draft");
  assert.equal(fromStore.status, "draft");
  const afterInstall = await store.markInstalled("http-draft");
  assert.equal(afterInstall.status, "draft");
  assert.equal(afterInstall.installedContentHash, "sha256:abc");

  const mcpQueries = [];
  const mcpRow = {
    ...row,
    id: "stdio-d1-fixture",
    puzzle_id: "stdio-d1-fixture",
    document: JSON.stringify({
      id: "stdio-d1-fixture",
      title: "Stdio D1 fixture",
      category: "Science"
    })
  };
  const mcpDatabase = createHttpD1Database({
    accountId: "account-1",
    databaseId: "db-1",
    token: "d1-token",
    fetchImpl: async (_url, init) => {
      const body = JSON.parse(init.body);
      mcpQueries.push(body);
      if (String(body.sql).includes("INSERT INTO puzzle_drafts")) {
        assert.equal(body.params[2], "access-sub-1");
        return jsonResponse({
          success: true,
          result: [{ success: true, results: [], meta: { changes: 1 } }]
        });
      }
      if (String(body.sql).includes("FROM puzzle_drafts") &&
        String(body.sql).includes("WHERE id = ?")) {
        return jsonResponse({
          success: true,
          result: [{ success: true, results: [mcpRow], meta: { changes: 0 } }]
        });
      }
      if (String(body.sql).includes("SELECT * FROM puzzle_drafts")
        && String(body.sql).includes("owner_subject")) {
        return jsonResponse({
          success: true,
          result: [{
            success: true,
            results: [{ ...mcpRow, document: undefined }],
            meta: { changes: 0 }
          }]
        });
      }
      throw new Error(`unexpected MCP SQL: ${body.sql}`);
    }
  });
  const server = createConceptClustersMcpServer({
    contentService: createContentInterchangeService(),
    d1Database: mcpDatabase,
    draftActor: actor
  });
  const session = await mcpSession(server);
  try {
    const createdDraft = await session.request("tools/call", {
      name: "create_puzzle_draft",
      arguments: {
        draft_id: "stdio-d1-fixture",
        document: {
          id: "stdio-d1-fixture",
          title: "Stdio D1 fixture",
          category: "Science"
        }
      }
    });
    assert.equal(createdDraft.result.isError, undefined);
    assert.equal(createdDraft.result.structuredContent.draft.draftId, "stdio-d1-fixture");
    assert.equal(createdDraft.result.structuredContent.draft.revision, 1);
    assert.ok(mcpQueries.some(query => String(query.sql).includes("INSERT INTO puzzle_drafts")));
  } finally {
    await session.close();
  }
}
