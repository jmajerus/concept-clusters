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
    identity: {
      system: "Codex (gpt-5.6-sol)",
      provider: "OpenAI",
      model: "gpt-5.6-sol",
      hostId: "codex",
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
  assert.equal(record.client.system, "Codex (gpt-5.6-sol)");
  assert.deepEqual(record.scopes, ["puzzle", "learningIntroduction"]);

  assert.deepEqual(assistanceStampAnalyticsDataPoint(record), {
    blobs: [
      "authoring_assistance_stamp",
      "save_puzzle_draft",
      "Codex (gpt-5.6-sol)",
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

  const { document: stamped, stampRecord } = stampDocumentAssistanceFromMcp(
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
      }
    }
  );
  assert.equal(stamped.provenance?.contributors?.[0]?.name, "Cursor");
  assert.equal(stamped.generativeAssistance, undefined);
  assert.equal(stampRecord.tool, "save_puzzle_draft");
  assert.equal(stampRecord.client.system, "Cursor");

  persistAuthoringAssistanceStamp(
    { ...stampRecord, draftId: "demo-puzzle" },
    {
      analytics: { writeDataPoint: dp => dataPoints.push(dp) },
      recordStamp: async row => {
        persisted.push(row);
      }
    }
  );
  await new Promise(resolve => setImmediate(resolve));
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
