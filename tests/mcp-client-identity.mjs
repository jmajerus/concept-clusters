import assert from "node:assert/strict";
import {
  AUTHORING_SETTINGS,
  fillAuthoringTemplate,
  lessonCreditFieldDescription,
  preferredLessonCreditExample
} from "../modules/authoringSettings.js";
import {
  formatAssistanceCredit,
  formatDirectedCredit,
  formatSystemsList,
  normalizeLessonCredit,
  parseLessonCredit,
  parseSystemsList,
  renderLessonCredit,
  suggestLessonCredit,
  upsertGenerativeAssistance
} from "../modules/generativeAssistance.js";
import {
  identifyMcpAssistanceClient,
  stampDocumentAssistanceFromMcp
} from "../modules/mcpClientIdentity.js";

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
    formatAssistanceCredit([
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
    contributors: [{ name: "Muse Code (Spark 1.3)" }],
    reasoning: "high"
  });

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

  // role "edited" (save_puzzle_draft) must fold existing generativeAssistance
  // into provenance but must NOT auto-credit the calling MCP client -- a
  // later save is functionally the same act as a human editing the working
  // copy on /admin/drafts, which never auto-credits a contributor either.
  const { document: stamped } = stampDocumentAssistanceFromMcp(
    {
      id: "demo",
      learningIntroduction: { requirement: "optional", content: { text: "Hi" } },
      generativeAssistance: [
        { system: "Cursor", scope: "puzzle", role: "drafted", date: "2026-08-01" }
      ]
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
  assert.equal(stamped.generativeAssistance, undefined);

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
  assert.equal(againDoc.generativeAssistance, undefined);

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

  const merged = upsertGenerativeAssistance(
    [{ system: "Cursor", scope: "puzzle", role: "drafted" }],
    { system: "Cursor", scope: "puzzle", role: "edited", date: "2026-08-26" }
  );
  assert.equal(merged.length, 1);
  assert.equal(merged[0].role, "edited");
}
