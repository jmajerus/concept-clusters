import assert from "node:assert/strict";
import { renderDraftListPage, renderDraftPage } from "../modules/draftReviewPage.js";
import { SAVE_TO_CANONICALIZE_FLAG_ID } from "../modules/authoredPuzzleDocument.js";

export const name = "draft review page: content rendering and bundle-freshness badges";

const baseDraft = {
  draftId: "review-fixture",
  puzzleId: "review-fixture",
  title: "Review Fixture",
  revision: 1,
  status: "draft",
  updatedAt: "2026-08-15T00:00:00.000Z",
  validation: null,
  document: {
    id: "review-fixture",
    title: "Review Fixture",
    category: "Science",
    clusters: [
      { id: "alpha", name: "Alpha", color: "teal", fact: "Alpha fact.", terms: ["a", "b", "c"], seeds: ["a", "b"] }
    ],
    bridges: []
  }
};

export async function run() {
  // Never submitted: inCurrentBundle is null (not applicable) and no
  // badge renders at all -- of course a plain draft isn't in the Worker's
  // puzzle bundle, that's not a warning worth showing.
  const draftPage = renderDraftPage({ ...baseDraft, inCurrentBundle: null });
  assert.doesNotMatch(draftPage, /live in this Worker/);
  assert.doesNotMatch(draftPage, /not yet visible in this Worker/);
  assert.match(draftPage, /value="unpublish"/);
  assert.match(draftPage, /value="delete-draft"/);
  const freezePage = renderDraftPage({
    ...baseDraft,
    d1Published: true,
    readyForFreeze: true,
    freezeAdd: true
  });
  assert.match(freezePage, /new on next freeze/);
  assert.match(freezePage, />Hold</);
  const reviewPage = renderDraftPage({ ...baseDraft, d1Published: true, cuedForFreeze: false });
  assert.match(reviewPage, />held</);
  assert.match(reviewPage, />Cue</);

  // Submitted (real drafts sit here indefinitely -- status only advances
  // to "published" when something explicitly asks GitHub) and the
  // Worker's bundle has caught up.
  const livePage = renderDraftPage({ ...baseDraft, status: "submitted", inCurrentBundle: true });
  assert.match(livePage, /live in this Worker/);

  // Submitted, but not yet visible in this Worker's bundle -- either
  // still an open PR, or merged and awaiting redeploy; this check can't
  // (and doesn't claim to) tell those apart.
  const stalePage = renderDraftPage({ ...baseDraft, status: "submitted", inCurrentBundle: false });
  assert.match(stalePage, /not yet visible in this Worker/);
  assert.doesNotMatch(stalePage, /✓ live in this Worker/);

  // The list page carries the same signal per row.
  const listPage = renderDraftListPage([
    { ...baseDraft, inCurrentBundle: null },
    { ...baseDraft, draftId: "review-fixture-2", status: "submitted", inCurrentBundle: false }
  ]);
  assert.match(listPage, /not yet visible in this Worker/);
  const hostedList = renderDraftListPage([baseDraft]);
  assert.doesNotMatch(hostedList, /New puzzle/);
  assert.doesNotMatch(hostedList, /create-draft/);
  assert.match(hostedList, /href="\/admin"/);
  assert.match(hostedList, /href="\/admin\/catalogues"/);
  const freezeList = renderDraftListPage([{
    ...baseDraft,
    d1Published: true,
    readyForFreeze: true,
    freezeAdd: true
  }]);
  assert.match(freezeList, /new on next freeze/);

  // Content itself still renders as expected -- the badge logic is
  // additive, not a replacement for the existing formatted view.
  assert.match(draftPage, /Alpha fact\./);
  assert.match(draftPage, /Raw document JSON/);

  // Symmetry flags render as their own non-blocking section, separate from
  // (and additive to) pass/fail validation -- present only when there's
  // something to flag.
  const flaggedPage = renderDraftPage({
    ...baseDraft,
    validation: {
      valid: true,
      errors: [],
      flags: [{ id: "cluster-term-count", message: "All 4 clusters have exactly 5 terms." }]
    }
  });
  assert.match(flaggedPage, /1 authoring flag/);
  assert.match(flaggedPage, /All 4 clusters have exactly 5 terms\./);
  assert.match(flaggedPage, /✓ Last validation passed\./);
  assert.match(draftPage, /Export to player/);
  assert.match(draftPage, /href="\/admin"/);
  assert.match(draftPage, /value="publish"/);
  assert.match(draftPage, / disabled/);
  assert.match(flaggedPage, /Export to player/);
  assert.doesNotMatch(flaggedPage, / disabled/);
  assert.doesNotMatch(flaggedPage, /Install in this checkout/);
  assert.doesNotMatch(flaggedPage, /class="play-button"/);
  assert.doesNotMatch(flaggedPage, /install-and-play/);
  assert.match(flaggedPage, /no git checkout/);

  const unflaggedPage = renderDraftPage({
    ...baseDraft,
    validation: { valid: true, errors: [], flags: [] }
  });
  assert.doesNotMatch(unflaggedPage, /authoring flag/);

  const canonicalFlagPage = renderDraftPage({
    ...baseDraft,
    validation: {
      valid: true,
      errors: [],
      flags: [{
        id: SAVE_TO_CANONICALIZE_FLAG_ID,
        message: "Save it to persist the current schema."
      }]
    }
  });
  assert.match(canonicalFlagPage, /Save it to persist the current schema/);
  assert.match(canonicalFlagPage, /confirm" value="save-canonical-form"/);
  assert.match(canonicalFlagPage, />Save canonical form</);

  // Local checkout copy: Worker/PR wording stays the hosted default.
  const localList = renderDraftListPage(
    [{ ...baseDraft, status: "installed", inCurrentBundle: true }],
    { variant: "local" }
  );
  assert.match(localList, /same D1 drafts hosted MCP uses/);
  assert.match(localList, /this draft is in this checkout/);
  assert.match(localList, />Checkout</);
  assert.match(localList, />Play</);
  assert.match(localList, /New puzzle/);
  assert.match(localList, /href="\/admin\/catalogues"/);
  assert.match(localList, /confirm" value="create-draft"/);
  assert.match(localList, /href="\/\?draft=review-fixture&amp;view=play"/);
  assert.doesNotMatch(localList, /href="\/\?puzzle=review-fixture"/);
  assert.doesNotMatch(localList, /live in this Worker/);
  assert.doesNotMatch(localList, /asks GitHub/);

  const localPage = renderDraftPage(
    { ...baseDraft, status: "installed", inCurrentBundle: true, validation: { valid: true, errors: [], flags: [] } },
    { variant: "local" }
  );
  assert.match(localPage, /this draft is in this checkout/);
  assert.match(localPage, /✓ Validation passed\./);
  assert.match(localPage, /Install in this checkout/);
  assert.match(localPage, /value="install-checkout"/);
  assert.match(localPage, /Open board/);
  assert.match(localPage, /\/admin\/catalogues/);
  assert.match(localPage, /class="play-button secondary" href="\/\?draft=review-fixture"/);
  assert.match(localPage, /class="play-button" href="\/\?draft=review-fixture&amp;view=play"/);
  assert.doesNotMatch(localPage, /install-and-play/);
  assert.doesNotMatch(localPage, /href="\/\?puzzle=review-fixture"/);
  assert.match(localPage, /value="open-pull-request"/);
  assert.match(localPage, /Export to player/);
  assert.match(localPage, /value="publish"/);
  assert.match(localPage, /value="revert-published"/);
  assert.doesNotMatch(localPage, /Update export/);
  assert.doesNotMatch(localPage, /live in this Worker/);
  assert.doesNotMatch(localPage, /Last validation passed/);
  assert.doesNotMatch(localPage, /no git checkout/);
  assert.doesNotMatch(localPage, /Uninstall from this checkout/);

  const localNeedsInstall = renderDraftPage(
    { ...baseDraft, validation: { valid: true, errors: [], flags: [] } },
    { variant: "local" }
  );
  assert.match(localNeedsInstall, /class="play-button" href="\/\?draft=review-fixture&amp;view=play"/);
  assert.doesNotMatch(localNeedsInstall, /install-and-play/);
  assert.doesNotMatch(localNeedsInstall, /href="\/\?puzzle=review-fixture"/);

  const localUninstall = renderDraftPage(
    {
      ...baseDraft,
      status: "installed",
      inCurrentBundle: true,
      canUninstall: true,
      validation: { valid: false, errors: ["broken"], flags: [] }
    },
    { variant: "local" }
  );
  assert.match(localUninstall, /value="uninstall-checkout"/);
  assert.match(localUninstall, /Uninstall from this checkout/);
  assert.match(localUninstall, /class="play-button" disabled/);
  assert.doesNotMatch(renderDraftPage({
    ...baseDraft,
    canUninstall: true,
    validation: { valid: true, errors: [], flags: [] }
  }), /Uninstall from this checkout/);

  const localWorking = renderDraftPage(
    { ...baseDraft, inCurrentBundle: null },
    { variant: "local" }
  );
  assert.doesNotMatch(localWorking, /this draft is in this checkout/);
  assert.doesNotMatch(localWorking, /this draft is not in this checkout/);

  const localMissing = renderDraftPage(
    { ...baseDraft, status: "installed", inCurrentBundle: false },
    { variant: "local" }
  );
  assert.match(localMissing, /this draft is not in this checkout/);
  assert.doesNotMatch(localMissing, /✓ this draft is in this checkout/);

  // Stored drafts are the simplified format: cluster ids as strings and
  // idealTerms as { clusterId: term }. JSON-LD is interchange-only.
  const simplifiedPage = renderDraftPage({
    ...baseDraft,
    document: {
      id: "rhetorical-appeals",
      title: "Rhetorical appeals",
      category: "Language Arts",
      clusters: [
        { id: "ethos", name: "Ethos", color: "teal", fact: "Ethos fact.", seeds: ["character"], terms: ["character"] },
        { id: "pathos", name: "Pathos", color: "blue", fact: "Pathos fact.", seeds: ["emotion"], terms: ["emotion"] },
        { id: "logos", name: "Logos", color: "amber", fact: "Logos fact.", seeds: ["reasoning"], terms: ["reasoning"] }
      ],
      bridges: [{
        term: "artistic proofs",
        clusters: ["ethos", "pathos", "logos"],
        fact: "The three artistic proofs.",
        relationKind: "foundation",
        termRole: "reference",
        idealTerms: { ethos: "character", pathos: "emotion", logos: "reasoning" }
      }]
    }
  });
  assert.doesNotMatch(simplifiedPage, /\[object Object\]/);
  assert.match(simplifiedPage, /connects: Ethos ↔ Pathos ↔ Logos/);
  assert.match(simplifiedPage, /Ethos: <strong>character<\/strong>/);
  assert.match(simplifiedPage, /Pathos: <strong>emotion<\/strong>/);
  assert.match(simplifiedPage, /Logos: <strong>reasoning<\/strong>/);
  assert.match(simplifiedPage, /name="field" value="termRole"/);
  assert.match(simplifiedPage, /<option value="reference" selected>/);
  assert.match(simplifiedPage, /<option value="connector">/);
  assert.match(simplifiedPage, />Save term role</);

  // A new id has no replace control: Export to player is the GitHub path.
  assert.doesNotMatch(draftPage, /Replace the published puzzle/);
  assert.doesNotMatch(draftPage, /name="replace"/);
  assert.doesNotMatch(draftPage, /already published/);

  // A published id does not add a competing checkbox. The PR button still
  // says Open / Update; copy and a hidden replace field make it an update.
  const publishedPage = renderDraftPage({
    ...baseDraft,
    alreadyPublished: true,
    validation: { valid: true, errors: [], flags: [] }
  });
  assert.match(publishedPage, /already published/);
  assert.match(publishedPage, /Open a pull request to update those\s+files/);
  assert.match(publishedPage, /type="hidden" name="replace" value="1"/);
  assert.match(publishedPage, />Export to player</);
  assert.doesNotMatch(publishedPage, /Replace the published puzzle/);
  assert.doesNotMatch(publishedPage, /type="checkbox" name="replace"/);

  const publishedLocal = renderDraftPage({
    ...baseDraft,
    alreadyPublished: true,
    validation: { valid: true, errors: [], flags: [] }
  }, { variant: "local" });
  assert.match(publishedLocal, /overwrites the working-tree files/);
  assert.match(publishedLocal, /type="hidden" name="replace" value="1"/);

  const publishedSubmitted = renderDraftPage({
    ...baseDraft,
    status: "submitted",
    alreadyPublished: true,
    inCurrentBundle: true,
    validation: { valid: true, errors: [], flags: [] }
  });
  assert.match(publishedSubmitted, /Updating the pull request amends that\s+branch/);
  assert.match(publishedSubmitted, />Update export</);
  assert.match(publishedSubmitted, /type="hidden" name="replace" value="1"/);

  const changedLens = renderDraftPage({
    ...baseDraft,
    alreadyPublished: true,
    publishedDiff: {
      total: 1,
      counts: { changed: 1, added: 0, removed: 0 },
      fields: {},
      clusters: { added: [], removed: [], changed: {} },
      bridges: { added: [], removed: [], changed: {} },
      lenses: {
        added: [],
        removed: [],
        changed: {
          "epic-craft": {
            fields: {
              prompt: {
                before: "Which concepts belong to Homeric epic?",
                after: "Which concepts are specifically about how a classical epic begins?"
              },
              targets: {
                before: ["in medias res", "invocation of the Muse", "dactylic hexameter"],
                after: ["invocation of the Muse", "in medias res"]
              }
            }
          }
        }
      }
    },
    document: {
      ...baseDraft.document,
      lenses: [{
        id: "epic-craft",
        prompt: "Which concepts are specifically about how a classical epic begins?",
        explanation: "An invocation and in medias res.",
        targets: ["invocation of the Muse", "in medias res"]
      }]
    },
    validation: { valid: true, errors: [], flags: [] }
  });
  assert.match(changedLens, /1 change from the published puzzle/);
  assert.match(changedLens, /class="lens diff-changed"/);
  assert.match(changedLens, /was: Which concepts belong to Homeric epic\?/);
  assert.match(changedLens, /was: in medias res, invocation of the Muse, dactylic hexameter/);

  const lensReasons = renderDraftPage({
    ...baseDraft,
    document: {
      ...baseDraft.document,
      lenses: [{
        id: "why-alpha",
        prompt: "Why does Alpha include a?",
        explanation: "Because a is a seed.",
        targets: ["a"],
        reasons: { a: "a is a seed term." }
      }]
    }
  });
  assert.match(
    lensReasons,
    /<li><strong>a<\/strong>: a is a seed term\.\s*<copy-field>[\s\S]*?<\/copy-field>\s*<\/li>/
  );
  assert.doesNotMatch(lensReasons, /<\/li>\s*<copy-field>/);

  const unchangedPublished = renderDraftPage({
    ...baseDraft,
    alreadyPublished: true,
    publishedDiff: {
      total: 0,
      counts: { changed: 0, added: 0, removed: 0 },
      fields: {},
      clusters: { added: [], removed: [], changed: {} },
      bridges: { added: [], removed: [], changed: {} },
      lenses: { added: [], removed: [], changed: {} }
    }
  });
  assert.match(unchangedPublished, /No changes from the published puzzle/);
  assert.doesNotMatch(draftPage, /from the published puzzle/);

  assert.match(draftPage, /<copy-field>/);
  assert.match(draftPage, /<repeatable-list>/);
  assert.match(draftPage, /confirm" value="save-field"/);
  assert.match(draftPage, />Edit cluster name</);
  assert.match(draftPage, />Add term note</);
  assert.match(draftPage, />Add cluster info</);
  assert.match(draftPage, />Add links</);
  assert.match(draftPage, />Add citations</);
  assert.equal(
    (draftPage.match(/name="field" value="info.citations"/g) || []).length,
    1
  );
  assert.doesNotMatch(draftPage, />Edit</);
  assert.match(draftPage, /name="expected_revision" value="1"/);
  assert.match(draftPage, /field" value="fact"/);
  assert.doesNotMatch(draftPage, /Use published wording/);
  assert.match(changedLens, /Use published wording/);
  assert.match(changedLens, /confirm" value="revert-field"/);

  assert.match(draftPage, /links:<\/span> <span class="empty">\(none\)<\/span>/);
  assert.match(draftPage, /citations:<\/span> <span class="empty">\(none\)<\/span>/);

  const citedPage = renderDraftPage({
    ...baseDraft,
    document: {
      ...baseDraft.document,
      info: {
        text: "Puzzle note.",
        extraLink: "https://example.org/extra",
        citations: [{
          title: "A Visible Source",
          author: "Ada",
          year: "2020",
          url: "https://example.org/source"
        }]
      },
      learningIntroduction: {
        requirement: "optional",
        title: "Intro",
        content: { text: "Body." },
        sources: [{ label: "Handout", href: "https://example.org/handout" }],
        citations: [{ title: "Intro Source", year: "2019" }]
      }
    }
  });
  assert.match(citedPage, /A Visible Source/);
  assert.match(citedPage, /https:\/\/example.org\/source/);
  assert.match(citedPage, /https:\/\/example.org\/extra/);
  assert.match(citedPage, /Handout/);
  assert.match(citedPage, /name="field" value="info.citations"/);
  assert.match(citedPage, /name="title" value="A Visible Source"/);
  assert.match(citedPage, /name="field" value="info.links"/);
  assert.match(citedPage, />Edit links</);
  assert.match(citedPage, />Edit citations</);
  assert.match(citedPage, /name="field" value="links"/);
  assert.match(citedPage, /name="label" value="Handout"/);
  assert.match(citedPage, /name="field" value="credit"/);
  assert.match(
    citedPage,
    /Bibliographic references are edited on puzzle info citations/
  );
  assert.doesNotMatch(citedPage, /name="field" value="citations"/);

  const overlappingLinksPage = renderDraftPage({
    ...baseDraft,
    alreadyPublished: true,
    publishedDiff: {
      total: 1,
      counts: { changed: 1, added: 0, removed: 0 },
      fields: {
        "info.links": {
          before: null,
          after: [{ href: "https://example.org/source", label: "Source" }]
        }
      },
      clusters: { added: [], removed: [], changed: {} },
      bridges: { added: [], removed: [], changed: {} },
      lenses: { added: [], removed: [], changed: {} }
    },
    document: {
      ...baseDraft.document,
      info: {
        text: "Puzzle note.",
        links: [{ href: "https://example.org/source", label: "Source" }],
        citations: [{
          title: "A Visible Source",
          author: "Ada",
          url: "https://example.org/source"
        }]
      }
    },
    validation: { valid: true, errors: [], flags: [] }
  });
  assert.match(
    overlappingLinksPage,
    /links:<\/span> <span class="empty">\(none\)<\/span>/
  );
  assert.match(overlappingLinksPage, /citations:[\s\S]*https:\/\/example\.org\/source/);
  assert.doesNotMatch(overlappingLinksPage, /was: Puzzle note\./);
  assert.match(overlappingLinksPage, /Use published wording/);
  assert.equal(
    (overlappingLinksPage.match(/Use published wording/g) || []).length,
    1
  );

  const creditsOnlyPage = renderDraftPage({
    ...baseDraft,
    document: {
      ...baseDraft.document,
      generativeAssistance: [
        { system: "Codex", provider: "OpenAI", role: "edited", scope: "puzzle", date: "2026-08-27" }
      ]
    }
  }, { actor: { name: "Jane Doe", email: "jane@example.com" } });
  assert.match(creditsOnlyPage, /<h2>Credits<\/h2>/);
  assert.match(creditsOnlyPage, /<h2>Provenance<\/h2>/);
  assert.match(creditsOnlyPage, /legacy byline suggestion:/);
  assert.match(creditsOnlyPage, /Legacy byline apply needs a Learning introduction/);
  assert.doesNotMatch(creditsOnlyPage, /Apply legacy byline/);

  const modelEditorPage = renderDraftPage({
    ...baseDraft,
    document: {
      ...baseDraft.document,
      provenance: {
        collaboration: "ai",
        contributors: [{ name: "Codex (GPT-5.6 Sol)" }, { name: "Cursor" }]
      },
      learningIntroduction: {
        requirement: "optional",
        content: { text: "Intro body." }
      }
    }
  }, { actor: { name: "Jane Doe", email: "jane@example.com" } });
  assert.match(modelEditorPage, /Optional model per drafting host/);
  assert.match(modelEditorPage, /name="field" value="editor"/);
  assert.match(modelEditorPage, /name="modelHost" value="Codex"/);
  assert.match(modelEditorPage, /class="provenance-host">Codex</);
  assert.doesNotMatch(modelEditorPage, /class="field-label">Codex</);
  assert.match(modelEditorPage, /class="field-label">Model</);
  assert.match(modelEditorPage, /name="modelValue" value="GPT-5\.6 Sol"/);
  assert.match(modelEditorPage, /placeholder="optional, e\.g\. auto"/);
  assert.match(modelEditorPage, /list="authoring-model-suggestions"/);
  assert.match(modelEditorPage, /autocomplete="off"/);
  assert.match(modelEditorPage, /<option value="Composer 2\.5">/);
  assert.doesNotMatch(modelEditorPage, /By Cursor, with editorial direction/);
  assert.match(modelEditorPage, /name="reasoning"/);
  assert.match(modelEditorPage, /name="switch"/);
  assert.match(modelEditorPage, /name="collaboration"/);
  assert.match(modelEditorPage, />Update provenance</);
  assert.doesNotMatch(modelEditorPage, /Set model/);
  assert.doesNotMatch(modelEditorPage, /Set collaboration/);
  assert.doesNotMatch(modelEditorPage, /Set reasoning/);
  assert.doesNotMatch(modelEditorPage, /name="field" value="generativeModel"/);
  assert.match(modelEditorPage, /<option value="noThinking">No Thinking<\/option>/);
  assert.match(modelEditorPage, /<option value="thinking">Thinking<\/option>/);
  assert.match(modelEditorPage, /Reasoning and an enabled UI switch concatenate into the derived byline/);

  const retargetedBylinePage = renderDraftPage({
    ...baseDraft,
    document: {
      ...baseDraft.document,
      provenance: {
        collaboration: "ai",
        contributors: [{ name: "Cursor (Grok 4.6 High Fast)" }],
        reasoning: "high",
        switch: "thinking"
      },
      learningIntroduction: {
        requirement: "optional",
        content: { text: "Intro body." }
      }
    }
  });
  assert.match(retargetedBylinePage, /byline \(derived\):<\/span> Drafted with Cursor \(Grok 4\.6 High Thinking\)/);
  assert.match(retargetedBylinePage, /name="modelValue" value="Grok 4\.6"/);
  assert.doesNotMatch(retargetedBylinePage, /name="modelValue" value="Grok 4\.6 High Fast"/);

  const connectorBridgePage = renderDraftPage({
    ...baseDraft,
    document: {
      ...baseDraft.document,
      bridges: [{
        id: "local-link",
        term: "local link",
        clusters: ["alpha"],
        fact: "A local mechanism.",
        termRole: "connector",
        info: { text: "Connector note." }
      }]
    }
  });
  assert.match(connectorBridgePage, /id="bridge-term-role-local-link"/);
  assert.match(connectorBridgePage, /<option value="connector" selected>/);
  const connectorSection = connectorBridgePage.match(/<section class="bridge[\s\S]*?<\/section>/)?.[0] || "";
  assert.match(connectorSection, /local link/);
  assert.doesNotMatch(connectorSection, /name="field" value="info.links"/);
}
