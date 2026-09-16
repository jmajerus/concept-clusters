import assert from "node:assert/strict";
import {
  catalogueAdminPath,
  catalogueAuthorQuery,
  contentPublicationNoticePath,
  renderCatalogueListPage,
  renderCategoryEditPage,
  renderCategoryListPage,
  renderContentPublishResultPage,
  renderMetaCatalogueEditPage
} from "../modules/catalogueReviewPage.js";

export const name = "catalogue review page: list, editor links, D1 publishing";

export async function run() {
  assert.equal(
    catalogueAuthorQuery("getting-started"),
    "/?catalogue=getting-started&view=author"
  );
  assert.equal(
    contentPublicationNoticePath("/admin/categories", {
      kind: "category",
      id: "biology",
      revision: 2,
      cued: true
    }),
    "/admin/categories?notice=published&category_id=biology&revision=2&cued=1"
  );
  assert.equal(
    contentPublicationNoticePath("/admin/categories", {
      kind: "category",
      id: "biology",
      revision: 2,
      notice: "cued",
      cued: true
    }),
    "/admin/categories?notice=cued&category_id=biology&revision=2&cued=1"
  );

  const list = renderCatalogueListPage([
    { id: "getting-started", title: "Getting Started", published: true, entryCount: 3, kind: "leaf" },
    { id: "holding-it-together", title: "Holding It Together", published: true, entryCount: 4, kind: "meta" },
    { id: "lab-only", title: "Lab only", published: true, entryCount: 0, kind: "leaf", freezeAdd: true, readyForFreeze: true }
  ]);
  assert.match(list, /href="\/\?catalogue=getting-started&amp;view=author"/);
  assert.match(list, /href="\/admin\/catalogues\/holding-it-together"/);
  assert.match(list, /href="\/admin"/);
  assert.match(list, /published in D1/);
  assert.match(list, /new on next freeze/);
  const reviewList = renderCatalogueListPage([
    { id: "in-review", title: "In review", published: true, entryCount: 0, kind: "leaf", readyForFreeze: false }
  ]);
  assert.match(reviewList, /held/);
  assert.match(list, /lab-only/);
  assert.match(list, /Remove from play/);
  assert.match(list, /confirm" value="create-catalogue"/);
  assert.match(list, /Meta catalogue/);
  assert.doesNotMatch(list, /Export to player/);
  assert.doesNotMatch(list, /meta catalogues stay out/);
  const publishedCatalogueList = renderCatalogueListPage([
    { id: "published-catalogue", title: "Published catalogue", published: true, entryCount: 2, kind: "leaf" }
  ], {
    notice: { kind: "catalogue", id: "published-catalogue", revision: 2, cued: true }
  });
  assert.match(publishedCatalogueList, /<h1>Catalogues<\/h1>/);
  assert.match(publishedCatalogueList, /role="status"/);
  assert.match(publishedCatalogueList, /Published[\s\S]*published-catalogue[\s\S]*D1 revision 2/);
  assert.match(publishedCatalogueList, /Cued for the next freeze/);
  assert.doesNotMatch(publishedCatalogueList, /<h1>Published<\/h1>/);
  const cuedCatalogueList = renderCatalogueListPage([
    { id: "cued-catalogue", title: "Cued catalogue", published: true, entryCount: 1, kind: "leaf" }
  ], {
    notice: { kind: "catalogue", id: "cued-catalogue", revision: 4, action: "cued", cued: true }
  });
  assert.match(cuedCatalogueList, /Cued[\s\S]*cued-catalogue[\s\S]*D1 revision 4/);
  assert.doesNotMatch(cuedCatalogueList, /<strong>Published<\/strong>/);

  const metaPage = renderMetaCatalogueEditPage({
    id: "holding-it-together",
    revision: 1,
    published: true,
    document: {
      id: "holding-it-together",
      title: "Holding It Together",
      kind: "meta",
      info: { text: "Four catalogues." },
      entries: [{ id: "arrangements-that-hold", reason: "Start at the mechanism." }]
    },
    leafCatalogues: [{ id: "getting-started", title: "Getting Started" }]
  });
  assert.match(metaPage, /name="new_entry_id"/);
  assert.match(metaPage, /arrangements-that-hold/);
  assert.match(metaPage, /relatedCatalogues/);
  assert.match(metaPage, /Remove from authoring play/);
  assert.match(metaPage, /Freeze on/);
  assert.match(metaPage, /This working copy is already the published D1 snapshot/);
  assert.match(metaPage, /name="confirm" value="publish" disabled>Publish<\/button>/);
  assert.match(metaPage, /value="publish-and-cue" class="secondary" disabled[\s\S]*>Publish &amp; Cue<\/button>/);
  assert.doesNotMatch(metaPage, /value="revert-published"/);

  const changedMetaPage = renderMetaCatalogueEditPage({
    id: "holding-it-together",
    revision: 2,
    published: true,
    differsFromPublished: true,
    document: {
      id: "holding-it-together",
      title: "Holding It Together",
      kind: "meta",
      entries: []
    }
  });
  assert.match(changedMetaPage, /This working copy has unpublished changes/);
  assert.match(changedMetaPage, /name="confirm" value="publish">Publish<\/button>/);
  assert.match(changedMetaPage, /value="publish-and-cue" class="secondary"[\s\S]*>Publish &amp; Cue<\/button>/);
  assert.match(changedMetaPage, /value="revert-published"/);

  const withdrawnMetaPage = renderMetaCatalogueEditPage({
    id: "holding-it-together",
    revision: 2,
    published: false,
    withdrawn: true,
    document: {
      id: "holding-it-together",
      title: "Holding It Together",
      kind: "meta",
      entries: []
    }
  });
  assert.match(withdrawnMetaPage, /withdrawn.*Republish this working copy/s);
  assert.match(withdrawnMetaPage, /name="confirm" value="publish">Republish<\/button>/);
  assert.match(withdrawnMetaPage, /value="publish-and-cue" class="secondary"[\s\S]*>Republish &amp; Cue<\/button>/);
  assert.doesNotMatch(withdrawnMetaPage, /value="revert-published"/);

  const published = renderContentPublishResultPage({
    kind: "catalogue",
    id: "getting-started",
    published: { revision: 2 },
    backHref: catalogueAuthorQuery("getting-started")
  });
  assert.match(published, /D1 revision 2/);
  assert.match(published, /player bundle not updated|git-bundled production player is unchanged/);

  const categories = renderCategoryListPage([
    {
      id: "biology", title: "Biology", published: true, puzzleCount: 14,
      subcategories: [
        { id: "foundations", title: "Foundations", puzzleCount: 6 },
        { id: "genomics", title: "Genomics", puzzleCount: 3 },
        { id: "ecology", title: "Ecology", puzzleCount: 0 },
        { id: "cell-biology", title: "Cell Biology", puzzleCount: 5 }
      ]
    },
    { id: "math", title: "Math", published: true, puzzleCount: null, subcategories: [] }
  ]);
  assert.match(categories, /href="\/admin\/categories\/biology"/);
  assert.match(categories, /<th>Puzzles<\/th>/);
  assert.match(categories, /Subcategories/);
  assert.match(categories, />14</, "category-level puzzle count");
  assert.match(categories, /Foundations \(6\) · Genomics \(3\)/);
  assert.match(categories, /<strong class="zero-count">Ecology \(0\)<\/strong>/,
    "a subcategory with zero puzzles is flagged, not just numbered");
  assert.match(categories, />—</, "a category with no puzzleCount data (null) shows an em dash, not 0");
  assert.match(categories, /confirm" value="create-category"/);
  assert.match(categories, /registered subcategories/);
  const publishedCategoryList = renderCategoryListPage([
    { id: "published-category", title: "Published category", published: true, puzzleCount: 1, subcategories: [] }
  ], {
    notice: { kind: "category", id: "published-category", revision: 3, cued: true }
  });
  assert.match(publishedCategoryList, /<h1>Categories<\/h1>/);
  assert.match(publishedCategoryList, /role="status"/);
  assert.match(publishedCategoryList, /Published[\s\S]*published-category[\s\S]*D1 revision 3/);
  assert.match(publishedCategoryList, /Cued for the next freeze/);
  const cuedCategoryList = renderCategoryListPage([
    { id: "cued-category", title: "Cued category", published: true, puzzleCount: 0, subcategories: [] }
  ], {
    notice: { kind: "category", id: "cued-category", revision: 5, action: "cued", cued: true }
  });
  assert.match(cuedCategoryList, /Cued[\s\S]*cued-category[\s\S]*D1 revision 5/);
  assert.doesNotMatch(cuedCategoryList, /<strong>Published<\/strong>/);

  // Domain column, and the same grouping/order the live "all" page uses:
  // domains alphabetical by title, domain-less categories last under
  // "Other subjects" rather than first.
  const domainGrouped = renderCategoryListPage([
    { id: "biology", title: "Biology", domain: "health-medicine", published: true, puzzleCount: 1, subcategories: [{ id: "foundations", title: "Foundations", puzzleCount: 1 }] },
    { id: "algebra", title: "Algebra", domain: "sciences-mathematics", published: true, puzzleCount: 0, subcategories: [] },
    { id: "misc", title: "Misc", published: true, puzzleCount: 0, subcategories: [] }
  ]);
  assert.match(domainGrouped, /<th>Domain<\/th>/);
  assert.match(domainGrouped, /Health &amp; Medicine/);
  // Scoped to <tbody> -- the create-form's domain <select> lists every
  // domain too, in DOMAINS' declared (non-alphabetical) order, ahead of
  // the table and easily confused with the divider rows' order otherwise.
  const tbody = domainGrouped.slice(domainGrouped.indexOf("<tbody>"));
  const healthIndex = tbody.indexOf("Health &amp; Medicine");
  const sciencesIndex = tbody.indexOf("Sciences &amp; Mathematics");
  const otherIndex = tbody.indexOf("Other subjects");
  assert.ok(healthIndex >= 0 && sciencesIndex > healthIndex && otherIndex > sciencesIndex,
    "expected domains alphabetical by title, with Other subjects last");
  assert.match(domainGrouped, />—</, "a category with no domain shows an em dash, not a blank cell");

  const biology = renderCategoryEditPage({
    id: "biology",
    revision: 1,
    published: true,
    document: {
      id: "biology",
      title: "Biology",
      domain: "sciences-mathematics",
      info: { text: "Living systems." },
      subcategories: {
        foundations: { title: "Foundations", info: { text: "Cells and variation." } }
      }
    }
  });
  assert.match(biology, /name="subcategory.foundations.title"/);
  assert.match(biology, /Foundations/);
  assert.match(biology, /Cells and variation/);
  assert.match(biology, /Registered browse partitions/);
  assert.match(biology, /name="new_subcategory_id"/);
  assert.match(biology, /name="remove_subcategory"/);
  assert.match(biology, /Remove on save/);
  assert.match(biology, /Remove from authoring play/);
  assert.match(biology, /Delete working copy/);
  assert.match(biology, /<select name="domain">/);
  assert.match(biology, /name="link"/);
  assert.match(biology, /stable join used by puzzle/);
  assert.match(biology, /name="confirm" value="publish">Publish<\/button>/);
  assert.match(biology, /value="publish-and-cue" class="secondary"[\s\S]*>Publish &amp; Cue<\/button>/);
  const biologyNew = renderCategoryEditPage({
    id: "lab-subject",
    revision: 1,
    published: true,
    freezeAdd: true,
    readyForFreeze: true,
    document: { id: "lab-subject", title: "Lab Subject" }
  });
  assert.match(biologyNew, /new on next freeze/);
}
