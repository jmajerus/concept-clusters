import assert from "node:assert/strict";
import {
  UNIDENTIFIED_GENERATIVE_SYSTEM,
  applyProvenanceCollaboration,
  applyGenerativeContributorModel,
  applyProvenanceClientSetting,
  applyReviewedBy,
  canonicalizeDocumentProvenance,
  formatGenerativeContributorLabel,
  inferCollaboration,
  inferContributorKind,
  identifyUnnamedGenerativeContributor,
  listGenerativeContributorsForEdit,
  normalizeGenerativeContributorDisplayName,
  normalizeAuthoringProvenance,
  normalizeReasoningLevel,
  reconcileCollaboration,
  renderProvenanceL1,
  renderProvenanceL2,
  resolveLessonByline,
  soleUnidentifiedGenerativeContributor,
  unidentifiedGenerativeContributor,
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
  assert.equal(normalizeReasoningLevel("Default"), "default");
  assert.equal(normalizeReasoningLevel("max"), "max");

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
  assert.deepEqual(
    normalizeAuthoringProvenance({
      contributors: [{ kind: "generative", name: "Unlisted Assistant", provider: "Example Provider" }]
    }),
    {
      collaboration: "ai",
      contributors: [{ kind: "generative", name: "Unlisted Assistant" }]
    },
    "provider must be discarded rather than persisted for unknown hosts"
  );

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
  // The exact client surface remains visible in both L1 (byline) and L2
  // (admin/review).
  assert.equal(
    renderProvenanceL1({
      collaboration: "aiPrimary",
      contributors: [
        { name: "Claude Code (Claude Sonnet 5)", reasoning: "high" },
        { name: "John Majerus" }
      ],
      reviewedBy: "Jane Expertsmith"
    }),
    "Drafted with Claude Code (Claude Sonnet 5 High); edited by John Majerus; reviewed by Jane Expertsmith"
  );
  assert.equal(
    renderProvenanceL2({
      collaboration: "aiPrimary",
      contributors: [
        { name: "Claude Code (Claude Sonnet 5)" },
        { name: "John Majerus" }
      ],
      reviewedBy: "Jane Expertsmith"
    }),
    "aiPrimary: Claude Code (Claude Sonnet 5) (generative); John Majerus (human); reviewed by Jane Expertsmith"
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

  const { document: stamped } = stampDocumentAssistanceFromMcp(
    { id: "demo", title: "Demo" },
    {
      // "drafted" (create_puzzle_draft) is the one role that auto-credits
      // the calling MCP client; "edited" (save_puzzle_draft) does not.
      role: "drafted",
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

  const { document: zcodeStamped } = stampDocumentAssistanceFromMcp(
    { id: "zcode-demo", title: "ZCode demo" },
    {
      role: "drafted",
      ctx: {
        mcpReq: {
          envelope: {
            "io.modelcontextprotocol/clientInfo": { name: "zcode", version: "0.16.5" }
          }
        }
      }
    }
  );
  assert.deepEqual(zcodeStamped.provenance, {
    collaboration: "ai",
    contributors: [{ name: "ZCode" }]
  });

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

  const withReviewer = normalizeAuthoringProvenance({
    collaboration: "aiPrimary",
    contributors: [{ name: "Cursor" }, { name: "Jane Doe" }],
    reviewedBy: "  Jane Expertsmith  "
  });
  assert.equal(withReviewer.reviewedBy, "Jane Expertsmith");
  assert.equal(withReviewer.collaboration, "aiPrimary");
  assert.equal(
    reconcileCollaboration({
      collaboration: "aiPrimary",
      contributors: withReviewer.contributors,
      reviewedBy: "Jane Expertsmith"
    }).reviewedBy,
    "Jane Expertsmith"
  );
  assert.deepEqual(
    normalizeAuthoringProvenance({
      collaboration: "ai",
      contributors: [{ name: "Cursor" }],
      reviewedBy: ""
    }),
    { collaboration: "ai", contributors: [{ name: "Cursor" }] }
  );
  assert.deepEqual(
    validateAuthoringProvenance({
      collaboration: "ai",
      contributors: [{ name: "Cursor" }],
      reviewedBy: "x".repeat(81)
    }),
    ["provenance.reviewedBy must be at most 80 characters"]
  );

  const named = applyReviewedBy({
    provenance: { collaboration: "ai", contributors: [{ name: "Cursor" }] }
  }, { reviewedBy: "Jane Expertsmith" });
  assert.equal(named.provenance.reviewedBy, "Jane Expertsmith");
  assert.equal(
    resolveLessonByline({ provenance: named.provenance }),
    "Drafted with Cursor; reviewed by Jane Expertsmith"
  );
  const unnamed = applyReviewedBy(named, { reviewedBy: "  " });
  assert.equal(unnamed.provenance.reviewedBy, undefined);

  const parsedReviewer = SimplifiedPuzzleInputSchema.safeParse({
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
      contributors: ["Cursor", "Jane Doe"],
      reviewedBy: "Jane Expertsmith"
    }
  });
  assert.equal(parsedReviewer.success, true, parsedReviewer.error?.message);
  assert.equal(parsedReviewer.data.provenance.reviewedBy, "Jane Expertsmith");

  assert.equal(inferContributorKind("Codex (gpt-5.6-sol)"), "generative");
  assert.equal(inferContributorKind("Muse Code (Spark 1.3)"), "generative");
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
  assert.equal(
    renderProvenanceL1({
      collaboration: "ai",
      contributors: [{ name: "Cursor (Grok 4.6)", reasoning: "high", switch: "fast" }]
    }),
    "Drafted with Cursor (Grok 4.6 High Fast)"
  );
  assert.equal(
    renderProvenanceL1({
      collaboration: "ai",
      contributors: [{ name: "Cursor", reasoning: "high" }]
    }),
    "Drafted with Cursor (High)"
  );
  assert.equal(
    renderProvenanceL1({
      collaboration: "ai",
      contributors: [{ name: "Cursor (Grok 4.6 High Fast)", reasoning: "high", switch: "fast" }]
    }),
    "Drafted with Cursor (Grok 4.6 High Fast)"
  );
  assert.equal(
    renderProvenanceL1({
      collaboration: "ai",
      contributors: [{ name: "Cursor (Grok 4.6 High Fast)", reasoning: "high", switch: "thinking" }]
    }),
    "Drafted with Cursor (Grok 4.6 High Thinking)"
  );
  assert.equal(
    renderProvenanceL1({
      collaboration: "ai",
      contributors: [{ name: "Cursor (Grok 4.6 Extra High Fast)", reasoning: "extraHigh", switch: "fast" }]
    }),
    "Drafted with Cursor (Grok 4.6 Extra High Fast)"
  );
  assert.equal(
    renderProvenanceL1({
      collaboration: "ai",
      contributors: [{ name: "Cursor (Grok 4.6 High Fast)" }]
    }),
    "Drafted with Cursor (Grok 4.6)"
  );

  assert.deepEqual(
    listGenerativeContributorsForEdit({
      provenance: {
        collaboration: "ai",
        contributors: [{ name: "Cursor (Grok 4.6 High Fast)", model: "Grok 4.6 High Fast" }]
      }
    }),
    [{ host: "Cursor", model: "Grok 4.6", reasoning: "", switch: "" }]
  );

  const strippedModel = applyGenerativeContributorModel({
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Cursor (Grok 4.6 High Fast)" }]
    }
  }, { host: "Cursor", model: "Grok 4.6 High Fast" });
  assert.deepEqual(strippedModel.provenance.contributors, [{ name: "Cursor (Grok 4.6)" }]);

  const switchChanged = applyProvenanceClientSetting({
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Cursor (Grok 4.6)", reasoning: "high", switch: "fast" }]
    }
  }, { host: "Cursor", field: "switch", value: "thinking" });
  assert.equal(switchChanged.provenance.contributors[0].switch, "thinking");
  assert.equal(switchChanged.provenance.contributors[0].speed, undefined);
  assert.equal(
    renderProvenanceL1(switchChanged.provenance),
    "Drafted with Cursor (Grok 4.6 High Thinking)"
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
  const modelKept = upsertGenerativeProvenance(
    { collaboration: "ai", contributors: [{ name: "Cursor (Grok 4.6)" }] },
    { system: "Cursor" }
  );
  assert.deepEqual(modelKept.contributors, [{ name: "Cursor (Grok 4.6)" }]);

  const withModel = applyGenerativeContributorModel({
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Cursor" }]
    },
    learningIntroduction: {
      requirement: "optional",
      content: { text: "Body." }
    }
  }, { host: "Cursor", model: "auto" });
  assert.deepEqual(withModel.provenance.contributors, [{ name: "Cursor (auto)" }]);
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
  const folded = canonicalizeDocumentProvenance({
    id: "fold-me",
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

  const keptReviewer = canonicalizeDocumentProvenance({
    id: "keep-reviewer",
    provenance: {
      collaboration: "aiPrimary",
      contributors: [{ name: "Cursor" }, { name: "Jane Doe" }],
      reviewedBy: "Jane Expertsmith"
    }
  });
  assert.equal(keptReviewer.provenance.reviewedBy, "Jane Expertsmith");
  assert.equal(
    resolveLessonByline({ provenance: keptReviewer.provenance }),
    "Drafted with Cursor; edited by Jane Doe; reviewed by Jane Expertsmith"
  );

  const filled = canonicalizeDocumentProvenance({
    id: "fill-credit",
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Claude" }]
    },
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
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Cursor" }]
    },
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
    provenance: { collaboration: "ai", contributors: [{ name: "Cursor" }] }
  });
  assert.deepEqual(composed.info.links, [{ href: "wiki:Note" }]);
  assert.equal(composed.info.link, undefined);
  assert.equal(composed.provenance.collaboration, "ai");

  const { puzzleForCanonicalPublication } = await import("../modules/puzzleSimplified.js");
  const published = puzzleForCanonicalPublication({
    id: "publish-strip",
    title: "Publish strip",
    category: "Science",
    provenance: {
      collaboration: "ai",
      contributors: [{ name: "Cursor" }]
    },
    clusters: [
      {
        name: "A",
        fact: "F",
        seeds: ["a", "b"],
        floatingTerms: ["c"],
        terms: ["a", "b", "c"]
      },
      {
        name: "B",
        fact: "G",
        seeds: ["d", "e"],
        floatingTerms: ["f"],
        terms: ["d", "e", "f"]
      }
    ],
    bridges: []
  });
  assert.equal(published.simplified.provenance?.collaboration, "ai");

  // Legacy document-wide reasoning/switch (pre-per-client) fold onto the
  // sole generative contributor -- the only case where "whose was this" is
  // unambiguous -- and the top-level fields do not survive normalize.
  const withClientSettings = normalizeAuthoringProvenance({
    collaboration: "ai",
    contributors: [{ name: "Cursor" }],
    reasoning: "high",
    switch: "fast"
  });
  assert.equal(withClientSettings.contributors[0].reasoning, "high");
  assert.equal(withClientSettings.contributors[0].switch, "fast");
  assert.equal(withClientSettings.reasoning, undefined);
  assert.equal(withClientSettings.switch, undefined);
  assert.deepEqual(
    normalizeAuthoringProvenance({
      collaboration: "ai",
      contributors: [{ name: "Cursor" }],
      speed: "fast"
    }),
    {
      collaboration: "ai",
      contributors: [{ name: "Cursor", switch: "fast" }]
    }
  );
  assert.deepEqual(
    validateAuthoringProvenance({
      collaboration: "ai",
      contributors: [{ name: "Cursor", reasoning: "nope" }]
    }),
    ['provenance.contributors[0].reasoning must be one of default, light, medium, high, extra, extraHigh, ultra, max, noThinking']
  );

  const clientSet = applyProvenanceClientSetting({
    provenance: { collaboration: "ai", contributors: [{ name: "Cursor" }] }
  }, { host: "Cursor", field: "reasoning", value: "Ultra" });
  assert.equal(clientSet.provenance.contributors[0].reasoning, "ultra");
  const cleared = applyProvenanceClientSetting(clientSet, { host: "Cursor", field: "reasoning", value: "" });
  assert.equal(cleared.provenance.contributors[0].reasoning, undefined);

  // All four collaboration modes report an impossible choice rather than
  // quietly substituting one that fits. humanPrimary and aiPrimary used to
  // fall past the consistency check and get rewritten by inference, which
  // silently replaced an editor's explicit statement about how a board was
  // made -- and, for aiPrimary, replaced it with the claim of human
  // authorship, which is the claim that most needs evidence.
  const humanOnly = {
    id: "mode-fixture",
    provenance: { collaboration: "human", contributors: [{ name: "John Majerus", kind: "human" }] }
  };
  assert.throws(
    () => applyProvenanceCollaboration(humanOnly, { collaboration: "aiPrimary" }),
    /needs a generative contributor/
  );
  assert.throws(
    () => applyProvenanceCollaboration(humanOnly, {
      collaboration: "aiPrimary",
      authorName: "John Majerus"
    }),
    /needs a generative contributor/,
    "an author name supplies a human, never the missing generative side"
  );
  assert.throws(
    () => applyProvenanceCollaboration(humanOnly, { collaboration: "ai" }),
    /needs a generative contributor/
  );

  const generativeOnly = {
    id: "mode-fixture",
    provenance: { collaboration: "ai", contributors: [{ name: "Cursor" }] }
  };
  assert.throws(
    () => applyProvenanceCollaboration(generativeOnly, { collaboration: "humanPrimary" }),
    /needs a human contributor/
  );
  // Supplying the missing human is still the sanctioned route, and works.
  assert.equal(
    applyProvenanceCollaboration(generativeOnly, {
      collaboration: "humanPrimary",
      authorName: "John Majerus"
    }).provenance.collaboration,
    "humanPrimary"
  );

  // An unnamed generative contributor satisfies the AI side exactly as a named
  // one does, so an MCP-written board whose client was never recognized can
  // still be set to ai or aiPrimary by hand.
  assert.equal(
    applyProvenanceCollaboration({
      id: "mode-fixture",
      provenance: {
        collaboration: "human",
        contributors: [
          { name: "John Majerus", kind: "human" },
          { name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" }
        ]
      }
    }, { collaboration: "aiPrimary" }).provenance.collaboration,
    "aiPrimary"
  );

  // Naming the unnamed generative placeholder.
  //
  // "generative assistance" is not a contributor -- it is an unfilled blank
  // about an agent that certainly ran, since reaching an authoring tool over
  // MCP is itself the evidence. So naming it replaces in place rather than
  // adding a second entry beside it. Suppressing the blank at render time
  // instead would leave storage genuinely holding two generative contributors,
  // and every consumer -- L1, L2, JSON-LD -- would have to know to hide one.
  const unnamedBoard = () => ({
    id: "unnamed-board",
    provenance: {
      collaboration: "ai",
      contributors: [{ name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" }]
    }
  });

  const filledIn = identifyUnnamedGenerativeContributor(unnamedBoard(), {
    host: "Claude",
    model: "Sonnet 5"
  });
  assert.equal(filledIn.provenance.contributors.length, 1);
  assert.equal(renderProvenanceL1(filledIn.provenance), "Drafted with Claude (Sonnet 5)");
  // Identical to reaching the same contributor through the model editor.
  assert.deepEqual(
    filledIn.provenance.contributors,
    applyGenerativeContributorModel({ id: "unnamed-board" }, {
      host: "Claude",
      model: "Sonnet 5"
    }).provenance.contributors
  );

  // Position, mode, and a human editor all survive being filled in.
  const filledInMixed = identifyUnnamedGenerativeContributor({
    id: "mixed-board",
    provenance: {
      collaboration: "aiPrimary",
      contributors: [
        { name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" },
        { name: "John Majerus", kind: "human" }
      ]
    }
  }, { host: "Cursor" });
  assert.equal(filledInMixed.provenance.collaboration, "aiPrimary");
  assert.deepEqual(
    filledInMixed.provenance.contributors.map(entry => entry.name),
    ["Cursor", "John Majerus"]
  );

  // Reasoning/switch tuned on the blank describe the run that is now named.
  assert.equal(
    identifyUnnamedGenerativeContributor({
      id: "tuned-board",
      provenance: {
        collaboration: "ai",
        contributors: [
          { name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative", reasoning: "high" }
        ]
      }
    }, { host: "Codex" }).provenance.contributors[0].reasoning,
    "high"
  );

  // A host a client actually presented is an observation. A human must not be
  // able to type over one; correcting a stamp is remove-then-add, which
  // records it as the claim it is.
  assert.throws(
    () => identifyUnnamedGenerativeContributor({
      id: "stamped-board",
      provenance: { collaboration: "ai", contributors: [{ name: "Claude Code" }] }
    }, { host: "Cursor" }),
    /no unnamed generative contributor/
  );

  // An unrecognized system must never reach a player-facing byline -- the same
  // rule the MCP boundary applies to a client it cannot name.
  assert.throws(
    () => identifyUnnamedGenerativeContributor(unnamedBoard(), { host: "SomeNewBot" }),
    /not a known drafting client/
  );
  assert.throws(
    () => identifyUnnamedGenerativeContributor(unnamedBoard(), {
      host: UNIDENTIFIED_GENERATIVE_SYSTEM
    }),
    /cannot be named as itself/
  );

  // Naming a client already credited would duplicate it, not add a collaborator.
  assert.throws(
    () => identifyUnnamedGenerativeContributor({
      id: "dup-board",
      provenance: {
        collaboration: "ai",
        contributors: [
          { name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" },
          { name: "Codex" }
        ]
      }
    }, { host: "Codex" }),
    /already a contributor/
  );

  assert.equal(
    soleUnidentifiedGenerativeContributor(unnamedBoard().provenance)?.name,
    UNIDENTIFIED_GENERATIVE_SYSTEM
  );
  // Not "sole" once a named agent is on record, so the blank is no longer the
  // thing an add row should fill.
  assert.equal(
    soleUnidentifiedGenerativeContributor({
      contributors: [{ name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" }, { name: "Codex" }]
    }),
    null
  );
  // ...but the blank is still findable, and still fillable, in that state.
  assert.equal(
    unidentifiedGenerativeContributor({
      contributors: [{ name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" }, { name: "Codex" }]
    })?.name,
    UNIDENTIFIED_GENERATIVE_SYSTEM
  );
  assert.deepEqual(
    identifyUnnamedGenerativeContributor({
      id: "two-agent-board",
      provenance: {
        collaboration: "ai",
        contributors: [{ name: "Codex" }, { name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" }]
      }
    }, { host: "Cursor" }).provenance.contributors.map(entry => entry.name),
    ["Codex", "Cursor"]
  );

  // A human contributor whose name matches the agent being named.
  //
  // normalizeAuthoringProvenance deduplicates by name across kinds, so naming
  // the blank "Claude" beside a *human* named "Claude" merged the two and kept
  // only the human: collaboration fell to "human" and the byline became "By
  // Claude" -- an AI-drafted puzzle asserting sole human authorship, which is
  // exactly what the placeholder exists to prevent. Refused, not normalized.
  assert.throws(
    () => identifyUnnamedGenerativeContributor({
      id: "namesake-board",
      provenance: {
        collaboration: "aiPrimary",
        contributors: [
          { name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" },
          { name: "Claude", kind: "human" }
        ]
      }
    }, { host: "Claude" }),
    /already has a human contributor named "Claude"/
  );
  // The same name with a model suffix does not collide, and is allowed.
  assert.deepEqual(
    identifyUnnamedGenerativeContributor({
      id: "namesake-board",
      provenance: {
        collaboration: "aiPrimary",
        contributors: [
          { name: UNIDENTIFIED_GENERATIVE_SYSTEM, kind: "generative" },
          { name: "Claude", kind: "human" }
        ]
      }
    }, { host: "Claude", model: "Sonnet 5" }).provenance.contributors.map(entry => entry.name),
    ["Claude (Sonnet 5)", "Claude"]
  );
}
