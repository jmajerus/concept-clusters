import { describe, expect, it } from "vitest";
import { GitHubRepositoryClient } from "../../modules/githubRepositoryClient.js";

// The per-puzzle GitHub publication service (createGitHubPublicationService)
// that used to own this file's tests was removed once D1 Publish + Cue +
// Freeze fully covered a single puzzle draft's path to production too.
// GitHubRepositoryClient survives as Freeze's own GitHub client
// (modules/freezePublicationService.js); tests/freeze-publication.mjs
// already exercises Freeze's use of it against a fake matching this same
// shape. This file keeps direct coverage of the real class's own request
// plumbing, which a fake can't exercise.
describe("GitHubRepositoryClient", () => {
  it("invokes the supplied fetch function without changing its receiver", async () => {
    let receiver: unknown = "not-called";
    const fetchImpl = function(this: unknown) {
      receiver = this;
      return Promise.resolve(Response.json({
        object: { sha: "a".repeat(40) }
      }));
    };
    const github = new GitHubRepositoryClient({
      owner: "jmajerus",
      repository: "concept-clusters",
      token: "test-token",
      fetchImpl
    });
    await github.request("/fixture");
    expect(receiver).toBeUndefined();
  });
});
