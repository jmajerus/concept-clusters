import assert from "node:assert/strict";
import {
  inferCollaboration,
  provenanceFromGenerativeAssistance,
  reconcileCollaboration,
  renderProvenanceL1,
  renderProvenanceL2,
  upsertGenerativeProvenance,
  upsertHumanProvenance,
  validateAuthoringProvenance
} from "../modules/authoringProvenance.js";
import { stampDocumentAssistanceFromMcp } from "../modules/mcpClientIdentity.js";
import { SimplifiedPuzzleInputSchema } from "../modules/simplifiedPuzzleSchema.js";

export const name = "Authoring provenance (two-axis)";

export async function run() {
  assert.deepEqual(
    validateAuthoringProvenance({
      collaboration: "ai",
      contributors: [{ kind: "generative", name: "Cursor" }]
    }),
    []
  );
  assert.ok(
    validateAuthoringProvenance({
      collaboration: "human",
      contributors: [{ kind: "generative", name: "Cursor" }]
    }).some(msg => /human/.test(msg))
  );
  assert.ok(
    validateAuthoringProvenance({
      collaboration: "humanPrimary",
      contributors: [{ kind: "generative", name: "Cursor" }]
    }).some(msg => /humanPrimary/.test(msg))
  );

  const seeded = upsertGenerativeProvenance(undefined, {
    system: "Cursor",
    provider: "Cursor"
  });
  assert.deepEqual(seeded, {
    collaboration: "ai",
    contributors: [{ kind: "generative", name: "Cursor", provider: "Cursor" }]
  });

  const mixed = upsertHumanProvenance(seeded, { name: "Jane Doe" });
  assert.equal(mixed.collaboration, "humanPrimary");
  assert.equal(renderProvenanceL2(mixed), "humanPrimary: Cursor (generative); Jane Doe (human)");
  assert.equal(
    renderProvenanceL1(mixed),
    "By Cursor, with editorial direction by Jane Doe"
  );
  assert.equal(
    renderProvenanceL1({
      collaboration: "aiPrimary",
      contributors: [
        { kind: "generative", name: "Claude" },
        { kind: "human", name: "Jane Doe" }
      ]
    }),
    "Drafted with Claude; edited by Jane Doe"
  );

  assert.equal(inferCollaboration([{ kind: "human", name: "A" }]), "human");
  assert.equal(
    reconcileCollaboration({
      collaboration: "human",
      contributors: [
        { kind: "human", name: "A" },
        { kind: "generative", name: "Cursor" }
      ]
    }).collaboration,
    "humanPrimary"
  );

  assert.deepEqual(
    provenanceFromGenerativeAssistance([
      { system: "Cursor", scope: "puzzle" },
      { system: "Cursor", scope: "learningIntroduction" },
      { system: "Claude", scope: "puzzle", provider: "Anthropic" }
    ]),
    {
      collaboration: "ai",
      contributors: [
        { kind: "generative", name: "Cursor" },
        { kind: "generative", name: "Claude", provider: "Anthropic" }
      ]
    }
  );

  const stamped = stampDocumentAssistanceFromMcp(
    { id: "demo", title: "Demo" },
    {
      ctx: {
        mcpReq: {
          envelope: {
            "io.modelcontextprotocol/clientInfo": { name: "cursor-vscode" }
          }
        }
      }
    }
  );
  assert.equal(stamped.provenance?.collaboration, "ai");
  assert.equal(stamped.provenance?.contributors?.[0]?.name, "Cursor");
  assert.ok(Array.isArray(stamped.generativeAssistance));

  const parsed = SimplifiedPuzzleInputSchema.safeParse({
    id: "demo-puzzle",
    title: "Demo",
    category: "computer-science",
    clusters: [
      {
        name: "A",
        fact: "Fact A",
        seeds: ["one", "two"],
        floatingTerms: ["three"]
      },
      {
        name: "B",
        fact: "Fact B",
        seeds: ["four", "five"],
        floatingTerms: ["six"]
      }
    ],
    provenance: {
      collaboration: "humanPrimary",
      contributors: [
        { kind: "human", name: "Jane Doe" },
        { kind: "generative", name: "Cursor" }
      ]
    }
  });
  assert.equal(parsed.success, true, parsed.error?.message);
}
