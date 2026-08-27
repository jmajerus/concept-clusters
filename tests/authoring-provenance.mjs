import assert from "node:assert/strict";
import {
  applyProvenanceCollaboration,
  canonicalizeDocumentProvenance,
  inferCollaboration,
  inferContributorKind,
  normalizeAuthoringProvenance,
  provenanceFromGenerativeAssistance,
  reconcileCollaboration,
  renderProvenanceL1,
  renderProvenanceL2,
  resolveLessonByline,
  upsertGenerativeProvenance,
  upsertHumanProvenance,
  validateAuthoringProvenance
} from "../modules/authoringProvenance.js";
import { canonicalizeAuthoredDocumentFields } from "../modules/authoredPuzzleDocument.js";
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
    }).some(msg => /inconsistent/.test(msg))
  );
  // Incomplete mixed modes heal to the sole-kind mode rather than failing.
  assert.deepEqual(
    validateAuthoringProvenance({
      collaboration: "humanPrimary",
      contributors: [{ kind: "generative", name: "Cursor" }]
    }),
    []
  );
  assert.equal(
    normalizeAuthoringProvenance({
      collaboration: "humanPrimary",
      contributors: [{ kind: "generative", name: "Cursor" }]
    }).collaboration,
    "ai"
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
  assert.equal(mixed.collaboration, "aiPrimary");
  assert.equal(renderProvenanceL2(mixed), "aiPrimary: Cursor (generative); Jane Doe (human)");
  assert.equal(
    renderProvenanceL1(mixed),
    "Drafted with Cursor; edited by Jane Doe"
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
    "aiPrimary"
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
      contributors: ["Cursor", "Jane Doe"]
    }
  });
  assert.equal(parsed.success, true, parsed.error?.message);
  assert.equal(parsed.data.provenance.collaboration, "aiPrimary");
  assert.deepEqual(
    parsed.data.provenance.contributors.map(c => c.kind),
    ["generative", "human"]
  );

  assert.equal(inferContributorKind("Codex (gpt-5.6-sol)"), "generative");
  assert.equal(inferContributorKind("Jane Doe"), "human");
  assert.deepEqual(
    normalizeAuthoringProvenance({ contributors: ["Claude"] }),
    {
      collaboration: "ai",
      contributors: [{ kind: "generative", name: "Claude" }]
    }
  );
  assert.equal(
    normalizeAuthoringProvenance({
      contributors: ["Cursor", "Jane Doe"],
      collaboration: "humanPrimary"
    }).collaboration,
    "humanPrimary"
  );

  const overridden = applyProvenanceCollaboration({
    generativeAssistance: [
      { system: "Codex (gpt-5.6-sol)", provider: "OpenAI", scope: "puzzle" },
      { system: "Cursor", provider: "Cursor", scope: "puzzle" }
    ],
    learningIntroduction: {
      requirement: "optional",
      content: { text: "Body." },
      credit: "Drafted with Codex (gpt-5.6-sol) and Cursor"
    },
    provenance: {
      collaboration: "aiPrimary",
      contributors: [
        { kind: "generative", name: "Codex (gpt-5.6-sol)", provider: "OpenAI" },
        { kind: "generative", name: "Cursor", provider: "Cursor" }
      ]
    }
  }, {
    collaboration: "humanPrimary",
    authorName: "John Majerus"
  });
  assert.equal(overridden.provenance.collaboration, "humanPrimary");
  assert.ok(overridden.provenance.contributors.some(c => c.name === "John Majerus"));
  assert.equal(overridden.learningIntroduction.credit, undefined);
  assert.equal(
    resolveLessonByline({
      introduction: overridden.learningIntroduction,
      provenance: overridden.provenance
    }),
    "By Codex (gpt-5.6-sol) and Cursor, with editorial direction by John Majerus"
  );

  const folded = canonicalizeDocumentProvenance({
    id: "fold-me",
    generativeAssistance: [
      { system: "Cursor", scope: "puzzle", provider: "Cursor" }
    ],
    learningIntroduction: {
      requirement: "optional",
      content: { text: "Hello." },
      credit: "By Cursor, with editorial direction by Jane Doe"
    }
  });
  assert.equal(folded.provenance.collaboration, "humanPrimary");
  assert.ok(folded.provenance.contributors.some(c => c.kind === "human" && c.name === "Jane Doe"));
  assert.equal(folded.learningIntroduction.credit, undefined);
  assert.equal(
    resolveLessonByline({ provenance: folded.provenance }),
    "By Cursor, with editorial direction by Jane Doe"
  );

  const filled = canonicalizeDocumentProvenance({
    id: "fill-credit",
    generativeAssistance: [{ system: "Claude", scope: "puzzle" }],
    learningIntroduction: {
      requirement: "optional",
      content: { text: "Body." }
    }
  });
  assert.equal(filled.provenance.collaboration, "ai");
  assert.equal(filled.learningIntroduction.credit, undefined);
  assert.equal(
    resolveLessonByline({ provenance: filled.provenance }),
    "Drafted with Claude"
  );

  const opaque = canonicalizeDocumentProvenance({
    id: "opaque-credit",
    generativeAssistance: [{ system: "Cursor", scope: "puzzle" }],
    learningIntroduction: {
      requirement: "optional",
      content: { text: "Body." },
      credit: "Custom freeform credit line"
    }
  });
  assert.equal(opaque.learningIntroduction.credit, "Custom freeform credit line");
  assert.equal(opaque.provenance.collaboration, "ai");

  const composed = canonicalizeAuthoredDocumentFields({
    id: "compose",
    info: { text: "Note", link: "wiki:Note" },
    generativeAssistance: [{ system: "Cursor", scope: "puzzle" }]
  });
  assert.deepEqual(composed.info.links, [{ href: "wiki:Note" }]);
  assert.equal(composed.info.link, undefined);
  assert.equal(composed.provenance.collaboration, "ai");
}
