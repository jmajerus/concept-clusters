import assert from "node:assert/strict";
import {
  AUTHORING_SETTINGS,
  fillAuthoringTemplate,
  lessonCreditFieldDescription,
  preferredLessonCreditExample
} from "../modules/authoringSettings.js";
import {
  formatHostCredit,
  formatDirectedCredit,
  formatSystemsList,
  normalizeLessonCredit,
  parseLessonCredit,
  parseSystemsList,
  renderLessonCredit,
  suggestLessonCredit
} from "../modules/generativeAssistance.js";
import {
  identifyMcpClientViaService,
  isCreditWorthyStamp,
  pendingDeferredStamps,
  stampDocumentAssistanceFromMcp
} from "../modules/mcpClientIdentity.js";
import {
  buildStampFrame,
  createProvenanceStampService,
  provenanceStampServiceFromEnv
} from "../modules/provenanceStampService.js";
import { UNIDENTIFIED_GENERATIVE_SYSTEM } from "../modules/authoringProvenance.js";
import { sweepDeferredStamps } from "../modules/deferredStampSweep.js";
import { D1DraftRepository } from "../modules/d1DraftRepository.js";
import { createSqliteD1 } from "./lib/sqlite-d1.mjs";

export const name = "MCP provenance stamping and lesson credit suggestions";

export async function run() {
  assert.equal(
    fillAuthoringTemplate(AUTHORING_SETTINGS.credit.templates.directed, {
      hosts: "Cursor",
      author: "Jane Doe"
    }),
    "By Cursor, with editorial direction by Jane Doe"
  );
  assert.equal(
    preferredLessonCreditExample(),
    "By Cursor, with editorial direction by Jane Doe"
  );
  assert.match(lessonCreditFieldDescription(), /editorial direction by Jane Doe/);

  assert.deepEqual(
    parseLessonCredit("By Cursor, with editorial direction by John"),
    { hosts: ["Cursor"], author: "John", acceptId: "directed" }
  );
  assert.deepEqual(
    parseLessonCredit("By Jane Doe, with assistance from Cursor"),
    { hosts: ["Cursor"], author: "Jane Doe", acceptId: "legacyAssist" }
  );
  assert.deepEqual(
    parseLessonCredit("Cursor and Claude Code; editor: John"),
    { hosts: ["Cursor", "Claude Code"], author: "John", acceptId: "compact" }
  );
  assert.deepEqual(
    parseLessonCredit("Drafted with Cursor"),
    { hosts: ["Cursor"], author: null, acceptId: "draftedOnly" }
  );
  assert.equal(parseLessonCredit("Custom freeform credit line"), null);

  assert.equal(
    renderLessonCredit({ hosts: ["Cursor"], author: "John" }),
    "By Cursor, with editorial direction by John"
  );
  assert.equal(
    renderLessonCredit(
      { hosts: ["Cursor"], author: "John" },
      {
        ...AUTHORING_SETTINGS,
        credit: { ...AUTHORING_SETTINGS.credit, preferred: "compact" }
      }
    ),
    "Cursor; editor: John"
  );

  assert.equal(formatSystemsList(["Cursor"]), "Cursor");
  assert.equal(formatSystemsList(["Cursor", "Claude Code"]), "Cursor and Claude Code");
  assert.equal(
    formatSystemsList(["Cursor", "Claude Code", "Gemini CLI"]),
    "Cursor, Claude Code, and Gemini CLI"
  );
  assert.deepEqual(parseSystemsList("Cursor and Claude Code"), ["Cursor", "Claude Code"]);
  assert.deepEqual(
    parseSystemsList("Cursor, Claude Code, and Gemini CLI"),
    ["Cursor", "Claude Code", "Gemini CLI"]
  );

  assert.equal(
    formatDirectedCredit(["Cursor"], "John"),
    "By Cursor, with editorial direction by John"
  );
  assert.equal(
    formatDirectedCredit(["Cursor", "Claude Code"], "John"),
    "By Cursor and Claude Code, with editorial direction by John"
  );
  assert.equal(formatDirectedCredit(["Cursor"], null), "Drafted with Cursor");

  const customSettings = {
    ...AUTHORING_SETTINGS,
    credit: {
      ...AUTHORING_SETTINGS.credit,
      maxLength: 160,
      preferred: "directed",
      defaultAuthorName: "Default Editor",
      templates: {
        ...AUTHORING_SETTINGS.credit.templates,
        directed: "Hosts: {hosts}; editor: {author}",
        draftedOnly: "Hosts only: {hosts}",
        humanOnly: "Editor: {author}"
      }
    },
    hosts: {
      ...AUTHORING_SETTINGS.hosts,
      includeModelInLabel: false,
      labels: {
        ...AUTHORING_SETTINGS.hosts.labels,
        cursor: { system: "Cursor IDE", provider: "Cursor" }
      }
    }
  };
  assert.equal(
    formatDirectedCredit(["Cursor"], "John", customSettings),
    "Hosts: Cursor; editor: John"
  );
  assert.equal(
    suggestLessonCredit("", [{ system: "Cursor", scope: "puzzle" }], {
      settings: customSettings
    }),
    "Hosts: Cursor; editor: Default Editor"
  );

  // Preferred rewrite when hosts are already present (no missing systems).
  assert.equal(
    suggestLessonCredit("By Jane Doe, with assistance from Cursor", [
      { system: "Cursor", scope: "puzzle" }
    ]),
    "By Cursor, with editorial direction by Jane Doe"
  );
  assert.equal(
    normalizeLessonCredit("By Cursor, with editorial direction by John", {
      settings: {
        ...AUTHORING_SETTINGS,
        credit: { ...AUTHORING_SETTINGS.credit, preferred: "compact" }
      }
    }),
    "Cursor; editor: John"
  );
  assert.equal(
    normalizeLessonCredit("Cursor; editor: John", {
      hosts: ["Claude Code"],
      settings: {
        ...AUTHORING_SETTINGS,
        credit: { ...AUTHORING_SETTINGS.credit, preferred: "compact" }
      }
    }),
    "Cursor and Claude Code; editor: John"
  );

  assert.equal(
    suggestLessonCredit("", [
      { system: "Cursor", scope: "puzzle" }
    ], { authorName: null, settings: {
      ...AUTHORING_SETTINGS,
      credit: { ...AUTHORING_SETTINGS.credit, defaultAuthorName: null }
    }}),
    "Drafted with Cursor"
  );
  assert.equal(
    suggestLessonCredit("", [
      { system: "Cursor", scope: "puzzle" }
    ], { authorName: "John" }),
    "By Cursor, with editorial direction by John"
  );
  assert.equal(
    suggestLessonCredit("By Cursor, with editorial direction by John", [
      { system: "Cursor", scope: "puzzle" },
      { system: "Claude Code", scope: "puzzle" }
    ]),
    "By Cursor and Claude Code, with editorial direction by John"
  );
  assert.equal(
    suggestLessonCredit("By Jane Doe, with assistance from Cursor", [
      { system: "Cursor", scope: "puzzle" },
      { system: "Claude Code", scope: "learningIntroduction" }
    ]),
    "By Cursor and Claude Code, with editorial direction by Jane Doe"
  );
  assert.equal(
    suggestLessonCredit("By Jane Doe", [
      { system: "Gemini CLI", scope: "puzzle" }
    ]),
    "By Gemini CLI, with editorial direction by Jane Doe"
  );
  assert.equal(
    suggestLessonCredit("By Cursor and Claude Code, with editorial direction by John", [
      { system: "Cursor", scope: "puzzle" },
      { system: "Claude Code", scope: "puzzle" }
    ]),
    null
  );
  assert.equal(
    formatHostCredit([
      { system: "Cursor", scope: "puzzle" },
      { system: "Claude Code", scope: "puzzle" }
    ]),
    "Drafted with Cursor and Claude Code"
  );


  // Client identification and the contributor upsert are provenance-mcp's
  // (its conformance suite pins the match rules). What stays here: the frame
  // sent, the credit policy, the request shape, and deferral when the service
  // cannot be reached.
  const codexCtx = {
    mcpReq: {
      envelope: {
        "io.modelcontextprotocol/clientInfo": { name: "codex-mcp-client", version: "1", extra: "dropped" }
      },
      _meta: {
        progressToken: 7,
        "x-codex-turn-metadata": { model: "gpt-5.6-sol", reasoning_effort: "high" }
      }
    },
    http: { req: { headers: new Headers({ "user-agent": "codex/1.0" }) } }
  };
  const signedIn = {
    subject: "owner-subject",
    email: "owner@example.test",
    oauth: { clientId: "client-123", redirectUri: "https://claude.ai/api/mcp/auth_callback" }
  };
  const codexFrame = buildStampFrame({ ctx: codexCtx, actor: signedIn });
  assert.deepEqual(codexFrame, {
    clientInfo: { name: "codex-mcp-client", version: "1" },
    userAgent: "codex/1.0",
    metaKeys: ["progressToken", "x-codex-turn-metadata"],
    meta: { "x-codex-turn-metadata": { model: "gpt-5.6-sol", reasoning_effort: "high" } },
    oauth: { clientId: "client-123", redirectUri: "https://claude.ai/api/mcp/auth_callback" }
  });
  assert.doesNotMatch(JSON.stringify(codexFrame), /owner-subject|owner@example/,
    "the frame must never carry the Access subject or email");
  // clientVersion is the fallback when the request has no envelope.
  assert.deepEqual(buildStampFrame({
    server: { server: { getClientVersion: () => ({ name: "kilo", version: "7.6.2" }) } }
  }), { clientInfo: { name: "kilo", version: "7.6.2" } });
  assert.deepEqual(buildStampFrame(), {});

  // Only writing the puzzle earns credit: creating it, or a substantial change
  // to its content or pedagogy. Classification and administration never do.
  assert.equal(isCreditWorthyStamp({ role: "drafted" }), true);
  assert.equal(isCreditWorthyStamp({ role: "edited" }), false);
  assert.equal(isCreditWorthyStamp({ role: "edited", substantial: true }), true);
  assert.equal(isCreditWorthyStamp({ role: "edited", substantial: true, domain: "content" }), true);
  assert.equal(isCreditWorthyStamp({ role: "edited", substantial: true, domain: "pedagogy" }), true);
  assert.equal(isCreditWorthyStamp({ role: "edited", substantial: true, domain: "classification" }), false);
  assert.equal(isCreditWorthyStamp({ role: "edited", substantial: true, domain: "administration" }), false);

  // The HTTP client sends CC's fixed options and returns the service's answer.
  const posted = [];
  const httpService = createProvenanceStampService({
    url: "http://stamp.test/api/stamp",
    fetch: async (url, init) => {
      posted.push({ url, body: JSON.parse(init.body), signal: init.signal });
      return Response.json({
        client: { system: "codex", matched: "codex", via: "clientInfo", clientName: "codex-mcp-client" },
        provenance: { collaboration: "ai", contributors: [{ name: "Codex (GPT-5.6 Sol)", reasoning: "high" }] },
        changed: true,
        creditLine: "Drafted with Codex (GPT-5.6 Sol)",
        warnings: []
      });
    }
  });
  await httpService.stamp({ tool: "create_puzzle_draft", creditWorthy: true, provenance: null, frame: codexFrame });
  assert.equal(posted[0].url, "http://stamp.test/api/stamp");
  assert.deepEqual(posted[0].body, {
    app: "concept-clusters",
    tool: "create_puzzle_draft",
    creditWorthy: true,
    mixedDefault: "aiPrimary",
    modelForm: "label",
    provenance: null,
    frame: codexFrame
  });
  assert.ok(posted[0].signal, "the call has a timeout");
  assert.equal(httpService.identifyUrl, "http://stamp.test/api/identify");
  await httpService.identify({ frame: codexFrame });
  assert.equal(posted[1].url, "http://stamp.test/api/identify");
  assert.deepEqual(posted[1].body, { frame: codexFrame });
  await assert.rejects(
    createProvenanceStampService({ fetch: async () => new Response("down", { status: 503 }) })
      .stamp({ creditWorthy: false }),
    /503/
  );
  assert.equal(provenanceStampServiceFromEnv({ PROVENANCE_STAMP_URL: "off" }), null);
  assert.equal(
    provenanceStampServiceFromEnv({}, { fetch: async () => null }).url,
    "http://provenance-mcp.localdomain:8000/api/stamp"
  );

  // A stand-in for the service: credits the frame's client by name on a
  // credit-worthy call, and records what it was asked.
  function fakeService({ fail = false } = {}) {
    const requests = [];
    return {
      requests,
      identified: [],
      fail,
      async identify({ frame }) {
        this.identified.push(structuredClone(frame));
        if (this.fail) throw new Error("connect ECONNREFUSED");
        const name = frame?.clientInfo?.name || null;
        return {
          client: name
            ? { system: name, matched: name, via: "clientInfo", clientName: name, model: "GPT-5.6 Sol" }
            : { unidentified: true, clientName: null }
        };
      },
      async stamp(request) {
        requests.push(structuredClone(request));
        if (this.fail) throw new Error("connect ECONNREFUSED");
        const name = request.frame?.clientInfo?.name || null;
        const contributors = [...(request.provenance?.contributors || [])];
        if (request.creditWorthy && name && !contributors.some(entry => entry.name === name)) {
          contributors.push({ name });
        }
        return {
          client: name
            ? { system: name, matched: name, via: "clientInfo", clientName: name, model: "GPT-5.6 Sol" }
            : { unidentified: true, clientName: null },
          provenance: { ...(request.provenance || {}), collaboration: "ai", contributors },
          changed: true,
          creditLine: null,
          warnings: []
        };
      }
    };
  }
  const frameFor = name => ({
    mcpReq: { envelope: { "io.modelcontextprotocol/clientInfo": { name } } }
  });

  const service = fakeService();
  const drafted = await stampDocumentAssistanceFromMcp({ id: "served-board" }, {
    ctx: frameFor("codex"),
    actor: signedIn,
    role: "drafted",
    stampService: service,
    log: { tool: "create_puzzle_draft", draftId: "served-board", transport: "stdio", actor: signedIn }
  });
  assert.deepEqual(service.requests[0], {
    tool: "create_puzzle_draft",
    creditWorthy: true,
    provenance: null,
    frame: {
      clientInfo: { name: "codex" },
      oauth: { clientId: "client-123", redirectUri: "https://claude.ai/api/mcp/auth_callback" }
    }
  });
  assert.deepEqual(drafted.document.provenance, { collaboration: "ai", contributors: [{ name: "codex" }] });
  assert.equal(drafted.stampRecords.length, 1);
  assert.equal(drafted.stampRecord, drafted.stampRecords[0]);
  assert.deepEqual(drafted.stampRecord.client, {
    system: "codex",
    hostId: "codex",
    via: "clientInfo",
    model: "GPT-5.6 Sol",
    clientName: "codex"
  });
  assert.deepEqual(drafted.stampRecord.actor, { subject: "owner-subject" });
  assert.equal(typeof drafted.stampRecord.stampId, "string");
  assert.equal(drafted.stampRecord.deferred, undefined);

  // A trivial edit and a reshelving are still sent (for the audit and the
  // service's sightings) but marked not credit-worthy.
  await stampDocumentAssistanceFromMcp(drafted.document, {
    ctx: frameFor("codex"), role: "edited", substantial: true, domain: "classification",
    stampService: service
  });
  assert.equal(service.requests.at(-1).creditWorthy, false);

  // Service down: provenance is left exactly as it was -- never "generative
  // assistance" -- and the call is logged as deferred with its frame.
  const down = fakeService({ fail: true });
  const human = {
    id: "deferred-board",
    provenance: { collaboration: "human", contributors: [{ name: "Jane Doe" }] }
  };
  const deferred = await stampDocumentAssistanceFromMcp(human, {
    ctx: frameFor("some-unreleased-agent"),
    role: "drafted",
    stampService: down,
    log: { tool: "create_puzzle_draft", draftId: "deferred-board" }
  });
  assert.deepEqual(deferred.document.provenance, human.provenance);
  assert.doesNotMatch(JSON.stringify(deferred.document), new RegExp(UNIDENTIFIED_GENERATIVE_SYSTEM));
  assert.deepEqual(deferred.stampRecord.client, { unidentified: true, clientName: "some-unreleased-agent" });
  assert.deepEqual(deferred.stampRecord.deferred, {
    creditWorthy: true,
    frame: { clientInfo: { name: "some-unreleased-agent" } }
  });
  // No service configured at all behaves the same, without trying.
  const unconfigured = await stampDocumentAssistanceFromMcp({ id: "offline-board" }, {
    ctx: frameFor("codex"), role: "drafted",
    log: { tool: "create_puzzle_draft", draftId: "offline-board" }
  });
  assert.equal(unconfigured.document.provenance, undefined);
  assert.equal(unconfigured.stampRecord.deferred.creditWorthy, true);
  // Without a log envelope there is nothing to write to.
  assert.deepEqual(
    (await stampDocumentAssistanceFromMcp({ id: "no-log" }, { role: "drafted", stampService: service })).stampRecords,
    []
  );

  // The unnamed contributor is not a host: it must never be offered in the
  // admin host pickers as something selectable.
  assert.equal(
    Object.values(AUTHORING_SETTINGS.hosts?.labels || {}).some(label =>
      label?.system === UNIDENTIFIED_GENERATIVE_SYSTEM
    ),
    false
  );

  // Deferred rows round-trip through the draft's stamp log and are replayed,
  // oldest first, on that draft's next write once the service is back. The
  // replay row names the deferred one, so it is replayed once.
  const repository = new D1DraftRepository(createSqliteD1());
  const actor = { subject: "editor" };
  await repository.create({ draftId: "stamped-board", document: { id: "stamped-board" }, actor });
  const flaky = fakeService({ fail: true });
  const persist = async (records, times) => {
    for (const [index, record] of records.entries()) {
      await repository.recordAssistanceStamp({ record: { ...record, capturedAt: times[index] }, actor });
    }
  };
  const first = await stampDocumentAssistanceFromMcp({ id: "stamped-board" }, {
    ctx: frameFor("claude-code"), role: "drafted", stampService: flaky,
    log: { tool: "create_puzzle_draft", draftId: "stamped-board" }
  });
  await persist(first.stampRecords, ["2026-10-14T02:48:40.189Z"]);
  let pending = pendingDeferredStamps(await repository.listAssistanceStamps({ draftId: "stamped-board", actor }));
  assert.equal(pending.length, 1);
  assert.equal(pending[0].stampId, first.stampRecord.stampId);
  assert.equal(pending[0].role, "drafted");
  assert.equal(pending[0].tool, "create_puzzle_draft");

  flaky.fail = false;
  const second = await stampDocumentAssistanceFromMcp(first.document, {
    ctx: frameFor("Anthropic/ClaudeAI"), role: "edited", stampService: flaky,
    pendingStamps: pending,
    log: { tool: "save_puzzle_draft", draftId: "stamped-board" }
  });
  // The replay credits the original caller; the current trivial save does not.
  assert.deepEqual(flaky.requests.slice(-2).map(request => request.creditWorthy), [true, false]);
  assert.deepEqual(second.document.provenance.contributors, [{ name: "claude-code" }]);
  assert.equal(second.stampRecords.length, 2);
  assert.equal(second.stampRecords[0].replayOf, first.stampRecord.stampId);
  assert.equal(second.stampRecords[0].role, "drafted");
  await persist(second.stampRecords, ["2026-10-15T03:57:18.236Z", "2026-10-15T03:57:18.237Z"]);

  const listed = await repository.listAssistanceStamps({ draftId: "stamped-board", actor });
  assert.equal(pendingDeferredStamps(listed).length, 0);
  assert.deepEqual(listed.map(({ hostId, system, clientName, tool }) => ({ hostId, system, clientName, tool })), [
    { hostId: null, system: null, clientName: "claude-code", tool: "create_puzzle_draft" },
    { hostId: "claude-code", system: "claude-code", clientName: "claude-code", tool: "create_puzzle_draft" },
    { hostId: "Anthropic/ClaudeAI", system: "Anthropic/ClaudeAI", clientName: "Anthropic/ClaudeAI", tool: "save_puzzle_draft" }
  ]);
  assert.deepEqual(
    await repository.listAssistanceStamps({ draftId: "stamped-board", actor: { subject: "someone-else" } }),
    []
  );

  // A replay that fails again stops: nothing is half-replayed, and the
  // current call is deferred too.
  const stillDown = fakeService({ fail: true });
  const again = await stampDocumentAssistanceFromMcp({ id: "stamped-board" }, {
    ctx: frameFor("codex"), role: "drafted", stampService: stillDown,
    pendingStamps: [{ stampId: "old", deferred: { creditWorthy: true, frame: {} } }],
    log: { tool: "save_puzzle_draft", draftId: "stamped-board" }
  });
  assert.equal(stillDown.requests.length, 1);
  assert.equal(again.stampRecords.length, 1);
  assert.ok(again.stampRecord.deferred);

  // Agent reviews ask who called through /api/identify: no provenance, no
  // stamp row on the service.
  const reviewer = fakeService();
  assert.deepEqual(await identifyMcpClientViaService({
    ctx: frameFor("codex"), tool: "record_agent_puzzle_review", stampService: reviewer
  }), { system: "codex", hostId: "codex", via: "clientInfo", model: "GPT-5.6 Sol", clientName: "codex" });
  assert.deepEqual(reviewer.identified, [{ clientInfo: { name: "codex" } }]);
  assert.equal(reviewer.requests.length, 0);
  assert.equal(await identifyMcpClientViaService({ ctx: frameFor("codex") }), null);

  // The sweep replays deferred stamps on drafts nobody writes to again: a
  // board created while the service was down gets its provenance anyway.
  const swept = new D1DraftRepository(createSqliteD1());
  const owner = { subject: "sweep-owner" };
  const offline = fakeService({ fail: true });
  const orphan = await stampDocumentAssistanceFromMcp({ id: "orphan-board", title: "Orphan" }, {
    ctx: frameFor("codex"), role: "drafted", stampService: offline,
    log: { tool: "create_puzzle_draft", draftId: "orphan-board" }
  });
  const created = await swept.create({ draftId: "orphan-board", document: orphan.document, actor: owner });
  for (const record of orphan.stampRecords) await swept.recordAssistanceStamp({ record, actor: owner });
  // A deferred row on a deleted draft is not swept.
  await swept.recordAssistanceStamp({
    record: { ...orphan.stampRecord, stampId: "gone-row", draftId: "deleted-board" },
    actor: owner
  });
  assert.deepEqual(await swept.listDraftsWithDeferredStamps(),
    [{ draftId: "orphan-board", ownerSubject: "sweep-owner" }]);

  // Still down: nothing changes and the draft stays queued.
  assert.deepEqual(await sweepDeferredStamps({ draftRepository: swept, stampService: offline }),
    { drafts: 1, replayed: 0, updated: 0, skipped: 0 });
  assert.equal((await swept.get({ draftId: "orphan-board", actor: owner })).revision, created.revision);

  offline.fail = false;
  assert.deepEqual(await sweepDeferredStamps({ draftRepository: swept, stampService: offline }),
    { drafts: 1, replayed: 1, updated: 1, skipped: 0 });
  const healed = await swept.get({ draftId: "orphan-board", actor: owner });
  assert.deepEqual(healed.document.provenance, { collaboration: "ai", contributors: [{ name: "codex" }] });
  assert.equal(healed.document.title, "Orphan");
  assert.equal(offline.requests.at(-1).creditWorthy, true);
  assert.deepEqual(await swept.listDraftsWithDeferredStamps(), []);
  // A second pass has nothing to do.
  assert.deepEqual(await sweepDeferredStamps({ draftRepository: swept, stampService: offline }),
    { drafts: 0, replayed: 0, updated: 0, skipped: 0 });
  // No service, or a store without the query, sweeps nothing.
  assert.deepEqual(await sweepDeferredStamps({ draftRepository: swept, stampService: null }),
    { drafts: 0, replayed: 0, updated: 0, skipped: 0 });
}
