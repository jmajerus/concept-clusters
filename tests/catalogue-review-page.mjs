import assert from "node:assert/strict";
import {
  catalogueAuthorQuery,
  renderCatalogueListPage,
  renderCatalogueSubmitResultPage,
  renderCategoryEditPage,
  renderCategoryListPage,
  renderContentPublishResultPage
} from "../modules/catalogueReviewPage.js";

export const name = "catalogue review page: list, editor links, export result";

export async function run() {
  assert.equal(
    catalogueAuthorQuery("getting-started"),
    "/?catalogue=getting-started&view=author"
  );

  const list = renderCatalogueListPage([
    { id: "getting-started", title: "Getting Started", published: true, entryCount: 3 }
  ]);
  assert.match(list, /href="\/\?catalogue=getting-started&amp;view=author"/);
  assert.match(list, /href="\/admin"/);
  assert.match(list, /published in D1/);
  assert.match(list, /confirm" value="create-catalogue"/);
  assert.doesNotMatch(list, /holding-it-together/);

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
  assert.match(biology, /<select name="domain">/);
  assert.match(biology, /name="link"/);
}
