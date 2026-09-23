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
  identifyMcpAssistanceClient,
  stampDocumentAssistanceFromMcp
} from "../modules/mcpClientIdentity.js";
import {
  renderProvenanceL1,
  UNIDENTIFIED_GENERATIVE_SYSTEM
} from "../modules/authoringProvenance.js";

export const name = "MCP client identity and lesson credit suggestions";

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

  const cursor = identifyMcpAssistanceClient({
    server: {
      server: {
        getClientVersion: () => ({ name: "cursor-vscode", version: "1.0.0" })
      }
    }
  });
  assert.equal(cursor.system, "Cursor");

  const cursorRelabeled = identifyMcpAssistanceClient({
    server: {
      server: {
        getClientVersion: () => ({ name: "cursor-vscode", version: "1.0.0" })
      }
    },
    settings: customSettings
  });
  assert.equal(cursorRelabeled.system, "Cursor IDE");

  const claudeWeb = identifyMcpAssistanceClient({
    ctx: {
      mcpReq: {
        envelope: {
          "io.modelcontextprotocol/clientInfo": {
            name: "Anthropic/ClaudeAI",
            version: "1.0.0"
          }
        }
      },
      http: {
        req: { headers: { get: name => name === "user-agent" ? "Claude-User" : null } }
      }
    }
  });
  assert.equal(claudeWeb.system, "Claude");

  const museCode = identifyMcpAssistanceClient({
    server: {
      server: {
        getClientVersion: () => ({ name: "muse-spark-1.3-contributor · high" })
      }
    }
  });
  assert.deepEqual(museCode, {
    system: "Muse Code (Spark 1.3)",
    model: "Spark 1.3",
    reasoning: "high",
    hostId: "muse-code",
    clientName: "muse-spark-1.3-contributor · high"
  });
  const { document: museDraft } = stampDocumentAssistanceFromMcp(
    { id: "muse-demo" },
    {
      role: "drafted",
      server: {
        server: {
          getClientVersion: () => ({ name: "muse-spark-1.3-contributor · high" })
        }
      }
    }
  );
  assert.deepEqual(museDraft.provenance, {
    collaboration: "ai",
    contributors: [{ name: "Muse Code (Spark 1.3)", reasoning: "high" }]
  });

  // The native Muse Code server connection reports Meta's internal runtime
  // name. Match its exact name, independent of runtime version.
  const nativeMuseCode = identifyMcpAssistanceClient({
    server: {
      server: {
        getClientVersion: () => ({ name: "tbh", version: "0.1.0" })
      }
    }
  });
  assert.deepEqual(nativeMuseCode, {
    system: "Muse Code",
    hostId: "muse-code",
    clientName: "tbh"
  });
  assert.equal(
    identifyMcpAssistanceClient({
      server: {
        server: {
          getClientVersion: () => ({ name: "tbh", version: "0.1.1" })
        }
      }
    }).system,
    "Muse Code",
    "the native Muse runtime version must not affect its client-surface identity"
  );

  // ZCode's native client identity lives in the namespaced request envelope,
  // not the flattened clientVersion probe field.
  assert.deepEqual(identifyMcpAssistanceClient({
    ctx: {
      mcpReq: {
        envelope: {
          "io.modelcontextprotocol/clientInfo": { name: "zcode", version: "0.16.5" }
        }
      }
    }
  }), {
    system: "ZCode",
    hostId: "zcode",
    clientName: "zcode"
  });

  // Kilo Code's native stdio client reports exactly "kilo" with its release
  // version (probed 2026-09-14). Same exact-name doctrine as the native Muse
  // runtime: match "kilo" itself, never a broader "kilo*" prefix.
  const nativeKilo = identifyMcpAssistanceClient({
    server: {
      server: {
        getClientVersion: () => ({ name: "kilo", version: "7.6.2" })
      }
    }
  });
  assert.deepEqual(nativeKilo, {
    system: "Kilo Code",
    hostId: "kilo-code",
    clientName: "kilo"
  });
  assert.equal(
    identifyMcpAssistanceClient({
      server: {
        server: {
          getClientVersion: () => ({ name: "kilo", version: "8.0.0" })
        }
      }
    }).system,
    "Kilo Code",
    "the native Kilo client version must not affect its client-surface identity"
  );
  assert.equal(
    identifyMcpAssistanceClient({
      server: {
        server: {
          getClientVersion: () => ({ name: "kilogram", version: "1.0.0" })
        }
      }
    }),
    null,
    "an unrelated kilo-prefixed client name must not be attributed to Kilo Code"
  );

  const codex = identifyMcpAssistanceClient({
    ctx: {
      mcpReq: {
        _meta: {
          "x-codex-turn-metadata": {
            model: "gpt-5.6-sol",
            reasoning_effort: "high"
          }
        }
      }
    },
    server: {
      server: {
        getClientVersion: () => ({
          name: "codex-mcp-client",
          title: "Codex",
          version: "1"
        })
      }
    }
  });
  assert.equal(codex.system, "Codex (GPT-5.6 Sol)");
  assert.equal(codex.hostId, "codex");
  assert.equal(codex.reasoning, "high");
  assert.equal(
    identifyMcpAssistanceClient({
      ctx: {
        mcpReq: {
          _meta: {
            "x-codex-turn-metadata": { reasoning_effort: "xhigh" }
          }
        }
      },
      server: {
        server: {
          getClientVersion: () => ({ name: "codex-mcp-client", title: "Codex", version: "1" })
        }
      }
    }).reasoning,
    undefined,
    "unrecognized Codex reasoning tiers must not be guessed"
  );
  assert.equal(
    identifyMcpAssistanceClient({
      ctx: {
        mcpReq: {
          _meta: {
            "x-codex-turn-metadata": { model: "gpt-5.6-sol" }
          }
        }
      },
      server: {
        server: {
          getClientVersion: () => ({
            name: "codex-mcp-client",
            title: "Codex",
            version: "1"
          })
        }
      },
      settings: customSettings
    }).system,
    "Codex"
  );

  // role "edited" (save_puzzle_draft) must not auto-credit the calling MCP
  // client -- a
  // later save is functionally the same act as a human editing the working
  // copy on /admin/drafts, which never auto-credits a contributor either.
  const { document: stamped } = stampDocumentAssistanceFromMcp(
    {
      id: "demo",
      learningIntroduction: { requirement: "optional", content: { text: "Hi" } },
      provenance: { collaboration: "ai", contributors: [{ name: "Cursor" }] }
    },
    {
      role: "edited",
      date: "2026-08-26",
      server: {
        server: {
          getClientVersion: () => ({ name: "claude-code", version: "2.1.245" })
        }
      }
    }
  );
  assert.equal(stamped.provenance.collaboration, "ai");
  assert.deepEqual(
    stamped.provenance.contributors.map(entry => entry.name).sort(),
    ["Cursor"]
  );

  const { document: againDoc } = stampDocumentAssistanceFromMcp(stamped, {
    role: "edited",
    date: "2026-08-27",
    server: {
      server: {
        getClientVersion: () => ({ name: "claude-code", version: "2.1.245" })
      }
    }
  });
  assert.equal(againDoc.provenance.collaboration, "ai");
  assert.deepEqual(
    againDoc.provenance.contributors.map(entry => entry.name).sort(),
    ["Cursor"]
  );

  // role "edited" with substantial:true (a real drafting pass through
  // save_puzzle_draft, per an upstream computeChangeScore/isSubstantialChange
  // check) DOES auto-credit, same as "drafted" -- an agent doing real
  // authoring through save_puzzle_draft should never need to hand-write its
  // own provenance entry just to get credit.
  const { document: substantialEdit } = stampDocumentAssistanceFromMcp(stamped, {
    role: "edited",
    substantial: true,
    date: "2026-08-27",
    server: {
      server: {
        getClientVersion: () => ({ name: "claude-code", version: "2.1.245" })
      }
    }
  });
  // The exact Claude Code client surface remains contributor-visible.
  assert.equal(substantialEdit.provenance.collaboration, "ai");
  assert.deepEqual(
    substantialEdit.provenance.contributors.map(entry => entry.name).sort(),
    ["Claude Code", "Cursor"]
  );

  // role "drafted" (create_puzzle_draft) is the one moment that does
  // auto-credit the calling MCP client.
  const { document: draftedDoc } = stampDocumentAssistanceFromMcp(
    { id: "demo-2", learningIntroduction: { requirement: "optional", content: { text: "Hi" } } },
    {
      role: "drafted",
      date: "2026-08-26",
      server: {
        server: {
          getClientVersion: () => ({ name: "claude-code", version: "2.1.245" })
        }
      }
    }
  );
  assert.equal(draftedDoc.provenance.collaboration, "ai");
  assert.deepEqual(
    draftedDoc.provenance.contributors.map(entry => entry.name),
    ["Claude Code"]
  );

  // Claude web and Claude Code are distinct client surfaces, so a later
  // substantial Claude Code pass appends its own contributor row.
  const { document: claudeWebDrafted } = stampDocumentAssistanceFromMcp(
    { id: "demo-3", learningIntroduction: { requirement: "optional", content: { text: "Hi" } } },
    {
      role: "drafted",
      ctx: {
        mcpReq: {
          envelope: {
            "io.modelcontextprotocol/clientInfo": { name: "Anthropic/ClaudeAI" }
          }
        }
      }
    }
  );
  const { document: claudeCodeFollowUp } = stampDocumentAssistanceFromMcp(claudeWebDrafted, {
    role: "edited",
    substantial: true,
    server: {
      server: {
        getClientVersion: () => ({ name: "claude-code", version: "2.1.245" })
      }
    }
  });
  assert.deepEqual(
    claudeCodeFollowUp.provenance.contributors.map(entry => entry.name),
    ["Claude", "Claude Code"]
  );

  // Reaching an authoring tool over MCP is itself the evidence of generative
  // authorship -- a human does not hand-call create_puzzle_draft -- so an
  // unrecognized client is still recorded as AI, just unnamed. It gets no
  // named contributor (there is no product to name in a byline) but it does
  // get the unnamed one, so the board never asserts human authorship by
  // default, and the audit row marks the call unattributed.
  const unknownFrame = {
    role: "drafted",
    log: { tool: "create_puzzle_draft", draftId: "mystery-board", transport: "stdio" },
    server: {
      server: {
        getClientVersion: () => ({ name: "some-unreleased-agent", version: "0.0.1" })
      }
    }
  };
  assert.equal(identifyMcpAssistanceClient(unknownFrame), null);
  const unidentified = stampDocumentAssistanceFromMcp({ id: "mystery-board" }, unknownFrame);
  assert.deepEqual(unidentified.document.provenance, {
    collaboration: "ai",
    contributors: [{ name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" }]
  });
  assert.equal(
    renderProvenanceL1(unidentified.document.provenance),
    "Drafted with generative assistance"
  );
  assert.equal(unidentified.stampRecord.client.unidentified, true);
  assert.equal(unidentified.stampRecord.client.system, undefined);
  assert.equal(unidentified.stampRecord.client.clientName, "some-unreleased-agent");
  assert.equal(unidentified.stampRecord.tool, "create_puzzle_draft");
  assert.equal(unidentified.stampRecord.draftId, "mystery-board");
  assert.equal(unidentified.stampRecord.puzzleId, "mystery-board");
  assert.equal(unidentified.stampRecord.role, "drafted");

  // A recognized client is unaffected: it still credits and still stamps.
  const known = stampDocumentAssistanceFromMcp({ id: "known-board" }, {
    role: "drafted",
    log: { tool: "create_puzzle_draft", draftId: "known-board" },
    server: { server: { getClientVersion: () => ({ name: "claude-code" }) } }
  });
  assert.equal(known.stampRecord.client.system, "Claude Code");
  assert.equal(known.stampRecord.client.unidentified, undefined);
  assert.deepEqual(known.document.provenance.contributors.map(entry => entry.name), ["Claude Code"]);

  // Without a log envelope there is nothing to write to, identified or not.
  assert.equal(
    stampDocumentAssistanceFromMcp({ id: "no-log" }, {
      role: "drafted",
      server: { server: { getClientVersion: () => ({ name: "some-unreleased-agent" }) } }
    }).stampRecord,
    null
  );

  // The unnamed contributor follows the same credit-worthiness rule as a named
  // one: a trivial edited save is the same act as a human tweaking a field on
  // the drafts page, and credits nobody. It is still audited.
  const trivialUnknown = stampDocumentAssistanceFromMcp({ id: "trivial-board" }, {
    role: "edited",
    substantial: false,
    log: { tool: "save_puzzle_draft", draftId: "trivial-board" },
    server: { server: { getClientVersion: () => ({ name: "some-unreleased-agent" }) } }
  });
  assert.equal(trivialUnknown.document.provenance, undefined);
  assert.equal(trivialUnknown.stampRecord.client.unidentified, true);

  // An unidentified pass over a human-authored board reads as mixed, and the
  // human is never displaced.
  const mixed = stampDocumentAssistanceFromMcp({
    id: "mixed-board",
    provenance: { collaboration: "human", contributors: [{ name: "Jane Doe", kind: "human" }] }
  }, {
    role: "drafted",
    log: { tool: "create_puzzle_draft", draftId: "mixed-board" },
    server: { server: { getClientVersion: () => ({ name: "some-unreleased-agent" }) } }
  });
  assert.equal(mixed.document.provenance.collaboration, "aiPrimary");
  assert.deepEqual(
    mixed.document.provenance.contributors.map(entry => entry.name),
    ["Jane Doe", UNIDENTIFIED_GENERATIVE_SYSTEM]
  );

  // A board that already credits a named system does not also collect the
  // unnamed one: the AI-authorship fact is already on record, and a second
  // entry would invent a collaborator -- most likely a phantom of that same
  // system reconnecting through an unrecognized frame.
  const alreadyCredited = stampDocumentAssistanceFromMcp({
    id: "already-credited",
    provenance: { collaboration: "ai", contributors: [{ name: "Claude Code" }] }
  }, {
    role: "drafted",
    log: { tool: "save_puzzle_draft", draftId: "already-credited" },
    server: { server: { getClientVersion: () => ({ name: "some-unreleased-agent" }) } }
  });
  assert.deepEqual(
    alreadyCredited.document.provenance.contributors.map(entry => entry.name),
    ["Claude Code"]
  );
  assert.equal(alreadyCredited.stampRecord.client.unidentified, true);

  // The unnamed contributor is not a host: it must never be offered in the
  // admin host pickers as something selectable.
  assert.equal(
    Object.values(AUTHORING_SETTINGS.hosts?.labels || {}).some(label =>
      label?.system === UNIDENTIFIED_GENERATIVE_SYSTEM
    ),
    false
  );
}
