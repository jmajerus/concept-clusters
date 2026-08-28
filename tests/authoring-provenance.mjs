import assert from "node:assert/strict";
import {
  applyProvenanceCollaboration,
  applyGenerativeContributorModel,
  canonicalizeDocumentProvenance,
  formatGenerativeContributorLabel,
  inferCollaboration,
  inferContributorKind,
  listGenerativeContributorsForEdit,
  normalizeGenerativeContributorDisplayName,
  normalizeAuthoringProvenance,
  provenanceFromGenerativeAssistance,
  reconcileCollaboration,
  renderProvenanceL1,
  renderProvenanceL2,
  resolveLessonByline,
  splitGenerativeContributorLabel,
  upsertGenerativeProvenance,
  upsertHumanProvenance,
  validateAuthoringProvenance
} from "../modules/authoringProvenance.js";
import {
  canonicalModelLabel,
  modelToHostSlug
} from "../modules/authoringModelSuggestions.js";
import { canonicalizeAuthoredDocumentFields } from "../modules/authoredPuzzleDocument.js";
import { stampDocumentAssistanceFromMcp } from "../modules/mcpClientIdentity.js";
import { SimplifiedPuzzleInputSchema } from "../modules/simplifiedPuzzleSchema.js";

export const name = "Authoring provenance (two-axis)";

export async function run() {
  assert.equal(modelToHostSlug("GPT-5.6 Sol"), "gpt-5.6-sol");
  assert.equal(modelToHostSlug("Claude Opus 5"), "claude-opus-5");
  assert.equal(canonicalModelLabel("gpt-5.6-sol"), "GPT-5.6 Sol");
  assert.equal(canonicalModelLabel("GPT-5.6 Sol"), "GPT-5.6 Sol");

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
    contributors: [{ name: "Cursor" }]
  });

  const mixed = upsertHumanProvenance(seeded, { name: "Jane Doe" });
  assert.equal(mixed.collaboration, "aiPrimary");
  assert.deepEqual(mixed.contributors, [
    { name: "Cursor" },
    { name: "Jane Doe" }
  ]);
  assert.equal(renderProvenanceL2(mixed), "aiPrimary: Cursor (generative); Jane Doe (human)");
  assert.equal(
    renderProvenanceL1(mixed),
    "Drafted with Cursor; edited by Jane Doe"
  );
  assert.equal(
    renderProvenanceL1({
      collaboration: "aiPrimary",
      contributors: [
        { name: "Claude" },
        { name: "Jane Doe" }
      ]
    }),
    "Drafted with Claude; edited by Jane Doe"
  );

  assert.equal(inferCollaboration([{ name: "A" }]), "human");
  assert.equal(
    reconcileCollaboration({
      collaboration: "human",
      contributors: [
        { name: "A" },
        { name: "Cursor" }
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
        { name: "Cursor" },
        { name: "Claude" }
      ]
    }
  );

  const { document: stamped } = stampDocumentAssistanceFromMcp(
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
  assert.deepEqual(stamped.provenance?.contributors, [{ name: "Cursor" }]);
  assert.equal(stamped.generativeAssistance, undefined);

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
    parsed.data.provenance.contributors,
    [{ name: "Cursor" }, { name: "Jane Doe" }]
  );

  assert.equal(inferContributorKind("Codex (gpt-5.6-sol)"), "generative");
  assert.equal(inferContributorKind("Gemini"), "generative");
  assert.equal(inferContributorKind("Gemini AI"), "generative");
  assert.equal(inferContributorKind("Jane Doe"), "human");
  assert.deepEqual(
    splitGenerativeContributorLabel("Codex (gpt-5.6-sol)"),
    { host: "Codex", model: "gpt-5.6-sol" }
  );
  assert.deepEqual(splitGenerativeContributorLabel("Cursor"), { host: "Cursor", model: "" });
  assert.equal(
    formatGenerativeContributorLabel("Cursor", "auto"),
    "Cursor (auto)"
  );
  assert.equal(formatGenerativeContributorLabel("Cursor", ""), "Cursor");
  assert.equal(
    formatGenerativeContributorLabel("Cursor", "Cursor Grok 4.6"),
    "Cursor (Grok 4.6)"
  );
  assert.equal(
    formatGenerativeContributorLabel("Codex", "gpt-5.6-sol"),
    "Codex (GPT-5.6 Sol)"
  );
  assert.equal(
    formatGenerativeContributorLabel("Cursor", "GPT-5.6 Sol"),
    "Cursor (GPT-5.6 Sol)"
  );
  assert.equal(
    formatGenerativeContributorLabel("Cursor", "claude-opus-5"),
    "Cursor (Claude Opus 5)"
  );
  assert.equal(
    formatGenerativeContributorLabel("Claude", "Claude Opus 5"),
    "Claude (Opus 5)"
  );
  assert.equal(
    normalizeGenerativeContributorDisplayName("Cursor (Cursor Grok 4.6)"),
    "Cursor (Grok 4.6)"
  );
  assert.equal(
    normalizeGenerativeContributorDisplayName("Codex (gpt-5.6-sol)"),
    "Codex (GPT-5.6 Sol)"
  );
  assert.equal(
    renderProvenanceL1({
      collaboration: "ai",
      contributors: [
        { name: "Codex (GPT-5.6 Sol)" },
        { name: "Cursor (GPT-5.6 Sol)" }
      ]
    }),
    "Drafted with Codex (GPT-5.6 Sol) and Cursor (GPT-5.6 Sol)"
  );
  assert.equal(
    renderProvenanceL1({
      collaboration: "ai",
      contributors: [{ name: "Cursor (Cursor Grok 4.6)" }]
    }),
    "Drafted with Cursor (Grok 4.6)"
  );

  const modelUpdated = upsertGenerativeProvenance(
    { collaboration: "ai", contributors: [{ name: "Cursor" }] },
    { system: "Cursor", model: "auto" }
  );
  assert.deepEqual(modelUpdated.contributors, [{ name: "Cursor (auto)" }]);
  assert.equal(
    renderProvenanceL1(modelUpdated),
    "Drafted with Cursor (auto)"
  );

  const modelCleared = upsertGenerativeProvenance(modelUpdated, { system: "Cursor", model: "" });
  assert.deepEqual(modelCleared.contributors, [{ name: "Cursor" }]);

  assert.deepEqual(
    listGenerativeContributorsForEdit({
      generativeAssistance: [{ system: "Cursor", provider: "Cursor" }]
    }),
    [{ host: "Cursor", model: "" }]
  );

  const withModel = applyGenerativeContributorModel({
    generativeAssistance: [{ system: "Cursor", provider: "Cursor", scope: "puzzle" }],
    learningIntroduction: {
      requirement: "optional",
      content: { text: "Body." }
    }
  }, { host: "Cursor", model: "auto" });
  assert.deepEqual(withModel.provenance.contributors, [{ name: "Cursor (auto)" }]);
  assert.equal(withModel.generativeAssistance, undefined);
  assert.equal(
    resolveLessonByline({ provenance: withModel.provenance }),
    "Drafted with Cursor (auto)"
  );

  assert.deepEqual(
    normalizeAuthoringProvenance({ contributors: ["Claude"] }),
    {
      collaboration: "ai",
      contributors: [{ name: "Claude" }]
    }
  );
  assert.equal(
    normalizeAuthoringProvenance({
      contributors: ["Cursor", "Jane Doe"],
      collaboration: "humanPrimary"
    }).collaboration,
    "humanPrimary"
  );

  // Explicit kind override survives when it disagrees with host inference.
  assert.deepEqual(
    normalizeAuthoringProvenance({
      contributors: [{ name: "Cursor", kind: "human" }]
    }),
    {
      collaboration: "human",
      contributors: [{ name: "Cursor", kind: "human" }]
    }
  );

  const overridden = applyProvenanceCollaboration({
    generativeAssistance: [
      { system: "Codex (GPT-5.6 Sol)", provider: "OpenAI", scope: "puzzle" },
      { system: "Cursor", provider: "Cursor", scope: "puzzle" }
    ],
    learningIntroduction: {
      requirement: "optional",
      content: { text: "Body." },
      credit: "Drafted with Codex (GPT-5.6 Sol) and Cursor"
    },
    provenance: {
      collaboration: "aiPrimary",
      contributors: [
        { name: "Codex (GPT-5.6 Sol)" },
        { name: "Cursor" }
      ]
    }
  }, {
    collaboration: "humanPrimary",
    authorName: "John Majerus"
  });
  assert.equal(overridden.provenance.collaboration, "humanPrimary");
  assert.deepEqual(overridden.provenance.contributors, [
    { name: "Codex (GPT-5.6 Sol)" },
    { name: "Cursor" },
    { name: "John Majerus" }
  ]);
  assert.equal(overridden.learningIntroduction.credit, undefined);
  assert.equal(
    resolveLessonByline({
      introduction: overridden.learningIntroduction,
      provenance: overridden.provenance
    }),
    "By Codex (GPT-5.6 Sol) and Cursor, with editorial direction by John Majerus"
  );
  assert.equal(overridden.generativeAssistance, undefined);

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
  assert.ok(folded.provenance.contributors.some(c => c.name === "Jane Doe" && !c.kind));
  assert.equal(folded.learningIntroduction.credit, undefined);
  assert.equal(
    resolveLessonByline({ provenance: folded.provenance }),
    "By Cursor, with editorial direction by Jane Doe"
  );
  assert.equal(folded.generativeAssistance, undefined);

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
  assert.equal(filled.generativeAssistance, undefined);

  const geminiCredit = canonicalizeDocumentProvenance({
    id: "how-art-represents-space",
    learningIntroduction: {
      requirement: "recommended",
      content: { text: "Body." },
      credit: "by Gemini AI"
    }
  });
  assert.equal(geminiCredit.provenance.collaboration, "ai");
  assert.deepEqual(geminiCredit.provenance.contributors, [{ name: "Gemini" }]);
  assert.equal(geminiCredit.learningIntroduction.credit, undefined);
  assert.equal(
    resolveLessonByline({ provenance: geminiCredit.provenance }),
    "Drafted with Gemini"
  );

  const healed = normalizeAuthoringProvenance({
    collaboration: "human",
    contributors: [{ name: "Gemini AI" }]
  });
  assert.equal(healed.collaboration, "ai");
  assert.deepEqual(healed.contributors, [{ name: "Gemini" }]);
  assert.equal(
    renderProvenanceL2(healed),
    "ai: Gemini (generative)"
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
  assert.equal(opaque.generativeAssistance, undefined);

  const composed = canonicalizeAuthoredDocumentFields({
    id: "compose",
    info: { text: "Note", link: "wiki:Note" },
    generativeAssistance: [{ system: "Cursor", scope: "puzzle" }]
  });
  assert.deepEqual(composed.info.links, [{ href: "wiki:Note" }]);
  assert.equal(composed.info.link, undefined);
  assert.equal(composed.provenance.collaboration, "ai");
  assert.equal(composed.generativeAssistance, undefined);

  const { puzzleForCanonicalPublication } = await import("../modules/puzzleSimplified.js");
  const published = puzzleForCanonicalPublication({
    id: "publish-strip",
    title: "Publish strip",
    category: "Science",
    generativeAssistance: [
      { system: "Cursor", scope: "puzzle", role: "edited", date: "2026-08-27" }
    ],
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Cursor" }]
    },
    clusters: [
      { name: "A", fact: "F", seeds: ["a", "b"], floatingTerms: ["c"] },
      { name: "B", fact: "G", seeds: ["d", "e"], floatingTerms: ["f"] }
    ]
  });
  assert.equal(published.simplified.provenance?.collaboration, "ai");
  assert.equal(published.simplified.generativeAssistance, undefined);
}
