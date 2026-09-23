import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import {
  DraftConflictError,
  DraftNotFoundError,
  PublishedIdConflictError
} from "../../modules/draftRepository.js";
import { D1DraftRepository } from "../../modules/d1DraftRepository.js";
import { D1ContentDocumentRepository } from "../../modules/contentDocumentRepository.js";
import { createHostedAuthoringContentService } from "../../modules/hostedAuthoringContentService.js";
import { layoutDocumentForMode } from "../../modules/layoutDocument.js";

describe("D1 draft repository", () => {
  it("holds one mutable document per draft and enforces owner boundaries", async () => {
    const repository = new D1DraftRepository(env.AUTHORING_DB);
    const content = createHostedAuthoringContentService();
    const actor = { subject: "author-1", email: "author@example.com" };
    const original = content.getPuzzleDocument("energy-flow");
    const document = {
      ...original,
      id: "d1-draft-fixture",
      title: "D1 draft fixture"
    };

    const created = await repository.create({
      draftId: "d1-draft-fixture",
      document,
      actor
    });
    expect(created.contentHash).toMatch(/^fnv1a64:/);
    expect(created.title).toBe("D1 draft fixture");
    expect(created.revision).toBe(1);

    await expect(repository.create({
      draftId: "d1-draft-fixture",
      document,
      actor
    })).rejects.toBeInstanceOf(DraftConflictError);

    const saved = await repository.save({
      draftId: "d1-draft-fixture",
      expectedRevision: 1,
      document: { ...document, title: "D1 draft fixture revised" },
      actor
    });
    expect(saved.title).toBe("D1 draft fixture revised");
    expect(saved.document.title).toBe("D1 draft fixture revised");
    expect(saved.revision).toBe(2);

    const unchanged = await repository.save({
      draftId: "d1-draft-fixture",
      expectedRevision: 2,
      document: saved.document,
      actor
    });
    expect(unchanged.revision).toBe(2);
    expect(unchanged.workingCopyHistoryCount).toBe(1);

    await expect(repository.save({
      draftId: "d1-draft-fixture",
      expectedRevision: 1,
      document: { ...document, title: "stale write" },
      actor
    })).rejects.toBeInstanceOf(DraftConflictError);

    const fetched = await repository.get({
      draftId: "d1-draft-fixture",
      actor
    });
    expect(fetched.document.title).toBe("D1 draft fixture revised");
    expect(fetched.revision).toBe(2);

    const layout = {
      schemaVersion: 1,
      puzzleId: "d1-draft-fixture",
      puzzleRevision: "fnv1a32:test",
      board: { width: 1000, height: 500 },
      nodes: { "cluster:0": { x: 40, y: 40 } },
      metrics: { lineCrossings: 0, edgeNodeIntersections: 0, overlaps: 0 }
    };
    const layoutDocument = layoutDocumentForMode("star", layout);
    const withLayout = await repository.saveLayout({
      draftId: "d1-draft-fixture",
      layout: layoutDocument,
      actor
    });
    expect(withLayout.layout).toEqual(layoutDocument);
    expect(withLayout.revision).toBe(2);
    const clearedLayout = await repository.clearLayout({
      draftId: "d1-draft-fixture",
      actor
    });
    expect(clearedLayout.layout).toBeNull();

    const contentDocuments = new D1ContentDocumentRepository(env.AUTHORING_DB);
    const publishedWithLayout = await contentDocuments.publish({
      kind: "puzzle",
      id: "d1-draft-fixture",
      document: fetched.document,
      actor,
      layout: layoutDocument
    });
    expect(publishedWithLayout.layout).toEqual(layoutDocument);
    const republished = await contentDocuments.publish({
      kind: "puzzle",
      id: "d1-draft-fixture",
      document: { ...fetched.document, title: "D1 draft fixture published again" },
      actor
    });
    expect(republished.layout).toEqual(layoutDocument);

    await expect(repository.get({
      draftId: "d1-draft-fixture",
      actor: { subject: "another-author" }
    })).rejects.toBeInstanceOf(DraftNotFoundError);

    const validation = content.validatePuzzleDraft(saved.document);
    expect(validation.valid).toBe(true);
    await repository.recordValidation({
      draftId: "d1-draft-fixture",
      validation,
      actor
    });
    const validated = await repository.get({
      draftId: "d1-draft-fixture",
      actor
    });
    expect(validated.validation?.valid).toBe(true);
    expect(validated.revision).toBe(2);

    const resaved = await repository.save({
      draftId: "d1-draft-fixture",
      expectedRevision: 2,
      document: { ...document, title: "D1 draft fixture revised again" },
      actor
    });
    expect(resaved.validation).toBeNull();
    expect(resaved.revision).toBe(3);
    expect(resaved.workingCopyHistoryCount).toBe(2);

    const popped = await repository.popWorkingCopy({
      draftId: "d1-draft-fixture",
      expectedRevision: 3,
      actor
    });
    expect(popped.title).toBe("D1 draft fixture revised");
    expect(popped.revision).toBe(4);
    expect(popped.workingCopyHistoryCount).toBe(1);

    const poppedAgain = await repository.popWorkingCopy({
      draftId: "d1-draft-fixture",
      expectedRevision: 4,
      actor
    });
    expect(poppedAgain.title).toBe("D1 draft fixture");
    expect(poppedAgain.workingCopyHistoryCount).toBe(0);

    await expect(repository.popWorkingCopy({
      draftId: "d1-draft-fixture",
      expectedRevision: 5,
      actor
    })).rejects.toThrow(/no previous working copy/);
  });

  it("records checkout install against the current content hash without changing status", async () => {
    const repository = new D1DraftRepository(env.AUTHORING_DB);
    const content = createHostedAuthoringContentService();
    const actor = { subject: "author-install" };
    const original = content.getPuzzleDocument("energy-flow");
    await repository.create({
      draftId: "d1-checkout-install-fixture",
      document: {
        ...original,
        id: "d1-checkout-install-fixture",
        title: "D1 checkout install fixture"
      },
      actor
    });
    const installed = await repository.recordCheckoutInstall({
      draftId: "d1-checkout-install-fixture",
      actor
    });
    expect(installed.status).toBe("draft");
    expect(installed.installedContentHash).toBe(installed.contentHash);
    const saved = await repository.save({
      draftId: "d1-checkout-install-fixture",
      expectedRevision: 1,
      document: {
        ...original,
        id: "d1-checkout-install-fixture",
        title: "D1 checkout install fixture edited"
      },
      actor
    });
    expect(saved.installedContentHash).toBe(installed.contentHash);
    expect(saved.contentHash).not.toBe(installed.contentHash);
    const cleared = await repository.clearCheckoutInstall({
      draftId: "d1-checkout-install-fixture",
      actor
    });
    expect(cleared.installedContentHash).toBeNull();
    expect(cleared.status).toBe("draft");
  });

  it("deletes a draft, and a second delete reports it already gone", async () => {
    const repository = new D1DraftRepository(env.AUTHORING_DB);
    const content = createHostedAuthoringContentService();
    const actor = { subject: "author-2" };
    const original = content.getPuzzleDocument("energy-flow");

    await repository.create({
      draftId: "d1-delete-fixture",
      document: {
        ...original,
        "@id": "urn:concept-clusters:puzzle:d1-delete-fixture",
        id: "d1-delete-fixture"
      },
      actor
    });
    await repository.delete({ draftId: "d1-delete-fixture", actor });
    await expect(repository.get({
      draftId: "d1-delete-fixture",
      actor
    })).rejects.toBeInstanceOf(DraftNotFoundError);
    await expect(repository.delete({
      draftId: "d1-delete-fixture",
      actor
    })).rejects.toBeInstanceOf(DraftNotFoundError);
  });

  // The shadow gate lives in the insert itself, not in a check before it, so
  // there is no window in which a concurrent Publish turns a free id into a
  // live one between looking and writing. Every caller of the repository is
  // covered by it, including ones that forget to ask first.
  it("refuses a fresh draft under a published id, and exempts the seeded route", async () => {
    const repository = new D1DraftRepository(env.AUTHORING_DB);
    const contentDocuments = new D1ContentDocumentRepository(env.AUTHORING_DB);
    const content = createHostedAuthoringContentService();
    const actor = { subject: "shadow-gate-author" };
    const published = content.getPuzzleDocument("energy-flow");

    await contentDocuments.publish({
      kind: "puzzle",
      id: "gated-live-puzzle",
      document: { ...published, id: "gated-live-puzzle", title: "Gated live puzzle" },
      actor
    });

    // Written from scratch under the live id: refused by the write itself.
    await expect(repository.create({
      draftId: "gated-live-puzzle",
      document: {
        ...published,
        id: "gated-live-puzzle",
        title: "An unrelated board under a live id"
      },
      actor
    })).rejects.toBeInstanceOf(PublishedIdConflictError);
    await expect(repository.get({
      draftId: "gated-live-puzzle",
      actor
    })).rejects.toBeInstanceOf(DraftNotFoundError);

    // The document id is gated too, not just the row id: a Publish follows
    // document.id, so a draft filed under a free row id still shadows.
    await expect(repository.create({
      draftId: "free-row-id",
      document: { ...published, id: "gated-live-puzzle" },
      actor
    })).rejects.toBeInstanceOf(PublishedIdConflictError);

    // The working copy opened from that board is the one legitimate draft
    // over a live id, and is marked as such by the seeding helper.
    const seeded = await repository.create({
      draftId: "gated-live-puzzle",
      document: { ...published, id: "gated-live-puzzle", title: "Gated live puzzle" },
      actor,
      seededFromPublished: true
    });
    expect(seeded.draftId).toBe("gated-live-puzzle");
    expect(seeded.revision).toBe(1);

    // An unpublished id is still free to create from scratch.
    const free = await repository.create({
      draftId: "never-gated-puzzle",
      document: { ...published, id: "never-gated-puzzle", title: "Never gated" },
      actor
    });
    expect(free.draftId).toBe("never-gated-puzzle");
  });
});
