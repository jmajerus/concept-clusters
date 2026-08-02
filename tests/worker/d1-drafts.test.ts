import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import {
  DraftConflictError,
  DraftNotFoundError
} from "../../modules/draftRepository.js";
import { D1DraftRepository } from "../../modules/d1DraftRepository.js";
import { createHostedAuthoringContentService } from "../../modules/hostedAuthoringContentService.js";

describe("D1 draft repository", () => {
  it("keeps immutable revisions and enforces owner/revision boundaries", async () => {
    const repository = new D1DraftRepository(env.AUTHORING_DB);
    const content = createHostedAuthoringContentService();
    const actor = { subject: "author-1", email: "author@example.com" };
    const original = content.getPuzzleJsonLd("energy-flow");
    const document = {
      ...original,
      "@id": "urn:concept-clusters:puzzle:d1-draft-fixture",
      id: "d1-draft-fixture",
      title: "D1 draft fixture"
    };

    const created = await repository.create({
      draftId: "d1-draft-fixture",
      document,
      actor
    });
    expect(created.revision).toBe(1);
    expect(created.contentHash).toMatch(/^sha256:/);

    const saved = await repository.save({
      draftId: "d1-draft-fixture",
      document: { ...document, title: "D1 draft fixture revised" },
      expectedRevision: 1,
      actor
    });
    expect(saved.revision).toBe(2);
    expect(saved.title).toBe("D1 draft fixture revised");

    await expect(repository.save({
      draftId: "d1-draft-fixture",
      document,
      expectedRevision: 1,
      actor
    })).rejects.toBeInstanceOf(DraftConflictError);

    const first = await repository.get({
      draftId: "d1-draft-fixture",
      revision: 1,
      actor
    });
    expect(first.document.title).toBe("D1 draft fixture");
    expect(await repository.revisions({
      draftId: "d1-draft-fixture",
      actor
    })).toHaveLength(2);

    await expect(repository.get({
      draftId: "d1-draft-fixture",
      actor: { subject: "another-author" }
    })).rejects.toBeInstanceOf(DraftNotFoundError);

    const validation = content.validatePuzzleJsonLd(saved.document);
    expect(validation.valid).toBe(true);
    await repository.recordValidation({
      draftId: "d1-draft-fixture",
      revision: 2,
      validation,
      actor
    });
    const validated = await repository.get({
      draftId: "d1-draft-fixture",
      revision: 2,
      actor
    });
    expect(validated.validation?.valid).toBe(true);
  });
});
