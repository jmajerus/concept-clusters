import assert from "node:assert/strict";
import {
  assistanceStampAnalyticsDataPoint,
  assistanceStampScopes,
  buildAssistanceStampRecord,
  createMcpStampContext,
  persistAuthoringAssistanceStamp
} from "../modules/authoringAssistanceLog.js";
import { stampDocumentAssistanceFromMcp } from "../modules/mcpClientIdentity.js";

export const name = "Authoring assistance stamp log (D1 + Analytics Engine)";

export async function run() {
  assert.deepEqual(
    assistanceStampScopes({ learningIntroduction: { requirement: "optional" } }),
    ["puzzle", "learningIntroduction"]
  );
  assert.deepEqual(assistanceStampScopes({ id: "demo" }), ["puzzle"]);

  const record = buildAssistanceStampRecord({
    client: {
      system: "codex",
      provider: "OpenAI",
      model: "GPT-5.6 Sol",
      hostId: "codex",
      via: "clientInfo",
      clientName: "codex-mcp-client"
    },
    role: "edited",
    date: "2026-08-27",
    draftId: "light-wave-and-particle-evidence",
    puzzleId: "light-wave-and-particle-evidence",
    tool: "save_puzzle_draft",
    transport: "stdio",
    actor: { subject: "owner-subject" },
    provenance: { collaboration: "aiPrimary" },
    scopes: ["puzzle", "learningIntroduction"]
  });
  assert.equal(record.event, "authoring_assistance_stamp");
  assert.equal(record.client.system, "codex");
  assert.equal(record.client.via, "clientInfo");
  assert.equal(record.client.provider, undefined);
  assert.deepEqual(record.scopes, ["puzzle", "learningIntroduction"]);

  assert.deepEqual(assistanceStampAnalyticsDataPoint(record), {
    blobs: [
      "authoring_assistance_stamp",
      "save_puzzle_draft",
      "codex",
      "edited",
      "puzzle,learningIntroduction",
      "2026-08-27"
    ],
    doubles: [1],
    indexes: ["light-wave-and-particle-evidence"]
  });

  const dataPoints = [];
  const persisted = [];
  const stampLog = createMcpStampContext({
    analytics: { writeDataPoint: dp => dataPoints.push(dp) },
    transport: "stdio",
    actor: { subject: "owner-subject" }
  });

  const { document: stamped, stampRecord } = await stampDocumentAssistanceFromMcp(
    {
      id: "demo-puzzle",
      title: "Demo",
      learningIntroduction: { requirement: "optional", content: { text: "Hi" } }
    },
    {
      role: "edited",
      date: "2026-08-27",
      log: stampLog("save_puzzle_draft", "demo-puzzle", {
        id: "demo-puzzle",
        learningIntroduction: { requirement: "optional", content: { text: "Hi" } }
      }),
      server: {
        server: {
          getClientVersion: () => ({ name: "cursor-vscode", version: "1.0.0" })
        }
      },
      // Stands in for provenance-mcp: identifies, credits nothing on a
      // trivial edit, and returns the provenance it was given.
      stampService: {
        async stamp({ creditWorthy, provenance }) {
          assert.equal(creditWorthy, false);
          return {
            client: { system: "cursor", matched: "cursor", via: "clientInfo", clientName: "cursor-vscode" },
            provenance: provenance || {},
            changed: false
          };
        }
      }
    }
  );
  // role "edited" is logged for audit purposes (stampRecord below) but must
  // not auto-credit the calling MCP client as a puzzle contributor.
  assert.equal(stamped.provenance, undefined);
  assert.equal(stampRecord.tool, "save_puzzle_draft");
  assert.equal(stampRecord.client.system, "cursor");

  await persistAuthoringAssistanceStamp(
    { ...stampRecord, draftId: "demo-puzzle" },
    {
      analytics: { writeDataPoint: dp => dataPoints.push(dp) },
      recordStamp: async row => {
        persisted.push(row);
      }
    }
  );
  assert.equal(dataPoints.length, 1);
  assert.equal(dataPoints[0].blobs[0], "authoring_assistance_stamp");
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0].draftId, "demo-puzzle");

  persistAuthoringAssistanceStamp(null, {
    recordStamp: async () => {
      throw new Error("must not run");
    }
  });
}
