import assert from "node:assert/strict";
import { renderDraftListPage, renderDraftPage } from "../modules/draftReviewPage.js";

export const name = "draft review page: content rendering and bundle-freshness badges";

const baseDraft = {
  draftId: "review-fixture",
  puzzleId: "review-fixture",
  title: "Review Fixture",
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
  assert.match(flaggedPage, /1 symmetry flag/);
  assert.match(flaggedPage, /All 4 clusters have exactly 5 terms\./);
  assert.match(flaggedPage, /✓ Last validation passed\./);

  const unflaggedPage = renderDraftPage({
    ...baseDraft,
    validation: { valid: true, errors: [], flags: [] }
  });
  assert.doesNotMatch(unflaggedPage, /symmetry flag/);

  // Local checkout copy: Worker/PR wording stays the hosted default.
  const localList = renderDraftListPage(
    [{ ...baseDraft, status: "installed", inCurrentBundle: true }],
    { variant: "local" }
  );
  assert.match(localList, /same D1 drafts hosted MCP uses/);
  assert.match(localList, /installed in this checkout/);
  assert.match(localList, />Checkout</);
  assert.doesNotMatch(localList, /live in this Worker/);
  assert.doesNotMatch(localList, /asks GitHub/);

  const localPage = renderDraftPage(
    { ...baseDraft, status: "installed", inCurrentBundle: true, validation: { valid: true, errors: [], flags: [] } },
    { variant: "local" }
  );
  assert.match(localPage, /installed in this checkout/);
  assert.match(localPage, /✓ Validation passed\./);
  assert.doesNotMatch(localPage, /live in this Worker/);
  assert.doesNotMatch(localPage, /Last validation passed/);

  const localWorking = renderDraftPage(
    { ...baseDraft, inCurrentBundle: null },
    { variant: "local" }
  );
  assert.doesNotMatch(localWorking, /installed in this checkout/);
  assert.doesNotMatch(localWorking, /not in this checkout/);

  const localMissing = renderDraftPage(
    { ...baseDraft, status: "installed", inCurrentBundle: false },
    { variant: "local" }
  );
  assert.match(localMissing, /not in this checkout/);
  assert.doesNotMatch(localMissing, /✓ installed in this checkout/);

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
}
