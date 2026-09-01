import assert from "node:assert/strict";
import {
  catalogueAdminPath,
  catalogueAuthorQuery,
  renderCatalogueListPage,
  renderCatalogueSubmitResultPage,
  renderCategoryEditPage,
  renderCategoryListPage,
  renderContentPublishResultPage,
  renderMetaCatalogueEditPage
} from "../modules/catalogueReviewPage.js";

export const name = "catalogue review page: list, editor links, export result";

export async function run() {
  assert.equal(
    catalogueAuthorQuery("getting-started"),
    "/?catalogue=getting-started&view=author"
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
  assert.doesNotMatch(list, /meta catalogues stay out/);

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

  const opened = renderCatalogueSubmitResultPage({
    catalogueId: "getting-started",
    publication: { githubPrUrl: "https://github.com/example/pr/1", githubPrNumber: 1 }
  });
  assert.match(opened, /PR #1/);
  assert.match(opened, /view=author/);
  assert.match(opened, /Export to player/);

  const published = renderContentPublishResultPage({
    kind: "catalogue",
    id: "getting-started",
    published: { revision: 2 },
    backHref: catalogueAuthorQuery("getting-started")
  });
  assert.match(published, /D1 revision 2/);
  assert.match(published, /player bundle not updated|git-bundled production player is unchanged/);

  const failed = renderCatalogueSubmitResultPage({
    catalogueId: "getting-started",
    error: "Local GitHub publication is not configured."
  });
  assert.match(failed, /Could not export to player/);

  const categories = renderCategoryListPage([
    { id: "biology", title: "Biology", published: true, subcategoryCount: 4 },
    { id: "math", title: "Math", published: true, subcategoryCount: 0 }
  ]);
  assert.match(categories, /href="\/admin\/categories\/biology"/);
  assert.match(categories, /Subcategories/);
  assert.match(categories, />4</);
  assert.match(categories, /confirm" value="create-category"/);
  assert.match(categories, /registered subcategories/);

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
  assert.match(biology, /Remove from authoring play/);
  assert.match(biology, /Delete working copy/);
  assert.match(biology, /<select name="domain">/);
  assert.match(biology, /name="link"/);
  assert.match(biology, /join string puzzles store/);
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
