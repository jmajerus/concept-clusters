import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { D1ContentDocumentRepository } from "../../modules/contentDocumentRepository.js";
import { createCatalogueSkeleton } from "../../modules/catalogueAuthorEngine.js";

describe("D1 content documents", () => {
  it("publishes a catalogue working copy and keeps owner-scoped drafts", async () => {
    const repository = new D1ContentDocumentRepository(env.AUTHORING_DB);
    const actor = { subject: "catalogue-author" };
    const document = createCatalogueSkeleton({
      id: "d1-catalogue-fixture",
      title: "D1 catalogue fixture"
    });
    const created = await repository.createDraft({
      kind: "catalogue",
      id: "d1-catalogue-fixture",
      document,
      actor
    });
    expect(created.revision).toBe(1);

    const published = await repository.publish({
      kind: "catalogue",
      id: "d1-catalogue-fixture",
      document: { ...document, title: "Published title" },
      actor
    });
    expect(published.revision).toBe(1);
    expect(published.document.title).toBe("Published title");

    await expect(repository.getDraft({
      kind: "catalogue",
      id: "d1-catalogue-fixture",
      actor: { subject: "someone-else" }
    })).rejects.toMatchObject({ name: "DraftNotFoundError" });

    const live = await repository.getPublished({
      kind: "catalogue",
      id: "d1-catalogue-fixture"
    });
    expect(live.document.title).toBe("Published title");
  });
});
