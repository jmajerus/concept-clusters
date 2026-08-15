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
  // Not yet published: inCurrentBundle is null (not applicable) and no
  // badge renders at all -- of course an unpublished draft isn't in the
  // Worker's puzzle bundle, that's not a warning worth showing.
  const draftPage = renderDraftPage({ ...baseDraft, inCurrentBundle: null });
  assert.doesNotMatch(draftPage, /live in this Worker/);
  assert.doesNotMatch(draftPage, /published, not deployed yet/);

  // Published and the Worker's bundle has caught up.
  const livePage = renderDraftPage({ ...baseDraft, status: "published", inCurrentBundle: true });
  assert.match(livePage, /live in this Worker/);

  // Published, but the Worker hasn't been redeployed since -- exactly
  // the gap this was built to surface.
  const stalePage = renderDraftPage({ ...baseDraft, status: "published", inCurrentBundle: false });
  assert.match(stalePage, /published, not deployed yet/);
  assert.doesNotMatch(stalePage, /✓ live in this Worker/);

  // The list page carries the same signal per row.
  const listPage = renderDraftListPage([
    { ...baseDraft, inCurrentBundle: null },
    { ...baseDraft, draftId: "review-fixture-2", status: "published", inCurrentBundle: false }
  ]);
  assert.match(listPage, /published, not deployed yet/);

  // Content itself still renders as expected -- the badge logic is
  // additive, not a replacement for the existing formatted view.
  assert.match(draftPage, /Alpha fact\./);
  assert.match(draftPage, /Raw document JSON/);
}
