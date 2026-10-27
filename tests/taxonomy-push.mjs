import assert from "node:assert/strict";
import { createTaxonomyPusher, pushVocabulary, vocabularyPushConfig } from "../modules/taxonomyPush.js";

export const name = "Taxonomy push: the published taxonomy reaches corpus-mcp's vocabulary intake";

const env = { CF_ACCESS_CLIENT_ID: "client-id", CF_ACCESS_CLIENT_SECRET: "client-secret" };

function respond(status, body) {
  return { status, json: async () => body };
}

export async function run() {
  assert.equal(vocabularyPushConfig({}), null);
  assert.equal(vocabularyPushConfig({ CF_ACCESS_CLIENT_ID: "client-id" }), null);
  assert.equal(vocabularyPushConfig(env).url, "https://corpus-mcp.majerus.us/api/intake/vocabulary");

  // One POST carries the service token headers and the vocabulary as its body.
  const requests = [];
  const vocabulary = { format: "corpus-vocabulary/1", version: "v1", terms: [] };
  const installed = await pushVocabulary(vocabulary, vocabularyPushConfig(env), {
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      return respond(200, { version: "v1", terms: [] });
    }
  });
  assert.deepEqual(installed, { outcome: "installed", version: "v1" });
  assert.equal(requests[0].init.method, "POST");
  assert.equal(requests[0].init.headers["CF-Access-Client-Id"], "client-id");
  assert.equal(requests[0].init.headers["CF-Access-Client-Secret"], "client-secret");
  assert.deepEqual(JSON.parse(requests[0].init.body), vocabulary);
  const network = await pushVocabulary(vocabulary, vocabularyPushConfig(env), {
    fetchImpl: async () => { throw new Error("connect ECONNREFUSED"); }
  });
  assert.deepEqual(network, { outcome: "failed", error: "connect ECONNREFUSED" });
  // A hung intake fails instead of holding the drain loop's tick.
  const hung = await pushVocabulary(vocabulary, vocabularyPushConfig(env), {
    timeoutMs: 20,
    fetchImpl: (url, init) => new Promise((resolve, reject) => {
      init.signal.addEventListener("abort", () => reject(init.signal.reason));
    })
  });
  assert.equal(hung.outcome, "failed");

  // The pusher sends only a version corpus-mcp has not already settled.
  let version = "v1";
  const replies = [];
  const sent = [];
  const logged = [];
  const log = { log: message => logged.push(message), error: message => logged.push(message) };
  const pushIfChanged = createTaxonomyPusher({
    env,
    log,
    load: async () => ({ format: "corpus-vocabulary/1", version, terms: [] }),
    fetchImpl: async (url, init) => {
      sent.push(JSON.parse(init.body).version);
      return replies.shift();
    }
  });
  replies.push(respond(401, null), respond(401, null));
  assert.equal((await pushIfChanged()).outcome, "failed");
  assert.equal((await pushIfChanged()).outcome, "failed");
  assert.equal(logged.length, 1, "a repeated failure is logged once");
  replies.push(respond(200, { version: "v1", terms: [], unchanged: true }));
  assert.equal((await pushIfChanged()).outcome, "unchanged");
  assert.equal((await pushIfChanged()).outcome, "current");
  assert.deepEqual(sent, ["v1", "v1", "v1"]);

  version = "v2";
  replies.push(respond(422, { problems: ["a.b: label may not contain \".\""] }));
  assert.deepEqual(await pushIfChanged(), { outcome: "rejected", problems: ["a.b: label may not contain \".\""] });
  assert.equal((await pushIfChanged()).outcome, "current", "a rejected version waits for a change");
  version = "v3";
  replies.push(respond(200, { version: "v3", terms: [] }));
  assert.equal((await pushIfChanged()).outcome, "installed");
  assert.deepEqual(sent, ["v1", "v1", "v1", "v2", "v3"]);
  assert.ok(logged.every(message => !message.includes("client-secret")));

  // Without the service token the push is off, says so once, and loads nothing.
  let loads = 0;
  const offLog = [];
  const off = createTaxonomyPusher({ env: {}, log: { log: message => offLog.push(message) }, load: async () => { loads += 1; } });
  assert.deepEqual(await off(), { outcome: "skipped" });
  assert.deepEqual(await off(), { outcome: "skipped" });
  assert.equal(loads, 0);
  assert.equal(offLog.length, 1);
  assert.match(offLog[0], /Taxonomy push off/);
}
