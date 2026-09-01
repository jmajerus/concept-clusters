import assert from "node:assert/strict";
import {
  catalogueAuthorQuery,
  renderCatalogueListPage,
  renderCatalogueSubmitResultPage,
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
}
