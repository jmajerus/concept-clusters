import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import {
  clearD1LargeColumnCache,
  createLargeColumnCachedD1Database
} from "../../modules/d1LargeColumnCache.js";
import { D1ContentDocumentRepository } from "../../modules/contentDocumentRepository.js";
import { D1DraftRepository } from "../../modules/d1DraftRepository.js";
import { createHostedAuthoringContentService } from "../../modules/hostedAuthoringContentService.js";

// The cache's PRAGMA table_info and length() projection, run on real D1.
describe("D1 large-column cache on a D1 binding", () => {
  it("returns what the uncached repositories return, before and after a revision", async () => {
    clearD1LargeColumnCache();
    const actor = { subject: "large-column-author" };
    const content = createHostedAuthoringContentService();
    // The JS repositories' option types are inferred too narrowly for tsc.
    const drafts: any = new D1DraftRepository(env.AUTHORING_DB);
    for (const id of ["large-column-a", "large-column-b"]) {
      await drafts.create({
        draftId: id,
        document: { ...content.getPuzzleDocument("energy-flow"), id, title: `Large column ${id}` },
        actor
      });
    }
    let wholeRowFetches = 0;
    const counted = {
      prepare: (sql: string) => env.AUTHORING_DB.prepare(sql),
      batch: (statements: D1PreparedStatement[]) => {
        wholeRowFetches += statements.length;
        return env.AUTHORING_DB.batch(statements);
      }
    };
    const cachedDatabase = createLargeColumnCachedD1Database(counted, { cacheKey: "worker" });
    const cachedDrafts: any = new D1DraftRepository(cachedDatabase);
    const cachedPublished: any = new D1ContentDocumentRepository(cachedDatabase);
    const published: any = new D1ContentDocumentRepository(env.AUTHORING_DB);

    const compare = async () => {
      expect(await cachedDrafts.list({ actor, includeDocument: true }))
        .toEqual(await drafts.list({ actor, includeDocument: true }));
      expect(await cachedPublished.listPublished({ kind: "puzzle", includeWithdrawn: true }))
        .toEqual(await published.listPublished({ kind: "puzzle", includeWithdrawn: true }));
    };
    await compare();
    expect(wholeRowFetches).toBeGreaterThan(0);
    const afterCold = wholeRowFetches;
    await compare();
    expect(wholeRowFetches).toBe(afterCold);

    const current = await drafts.get({ draftId: "large-column-a", actor });
    await drafts.save({
      draftId: "large-column-a",
      expectedRevision: current.revision,
      document: { ...current.document, title: "Large column revised" },
      actor
    });
    await compare();
    const revised = (await cachedDrafts.list({ actor, includeDocument: true }))
      .find((draft: any) => draft.draftId === "large-column-a");
    expect(revised?.document.title).toBe("Large column revised");
  });
});
