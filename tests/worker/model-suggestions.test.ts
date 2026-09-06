import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { D1ModelSuggestionRepository } from "../../modules/d1ModelSuggestionRepository.js";

describe("D1 model suggestions", () => {
  it("adds, lists in insertion order, ignores a repeat add, and removes", async () => {
    const repository = new D1ModelSuggestionRepository(env.AUTHORING_DB);
    await repository.add("Spark 3.0", { createdBy: "test-fixture" });
    await repository.add("Spark 3.1", { createdBy: "test-fixture" });
    // Re-adding an existing label is a no-op, not a duplicate or an error.
    await repository.add("Spark 3.0");

    const listed = await repository.list();
    expect(listed.filter(label => label === "Spark 3.0")).toHaveLength(1);
    const index30 = listed.indexOf("Spark 3.0");
    const index31 = listed.indexOf("Spark 3.1");
    expect(index30).toBeGreaterThanOrEqual(0);
    expect(index31).toBeGreaterThan(index30);

    await repository.remove("Spark 3.0");
    expect(await repository.list()).not.toContain("Spark 3.0");
    expect(await repository.list()).toContain("Spark 3.1");

    await repository.remove("Spark 3.1");
    expect(await repository.list()).not.toContain("Spark 3.1");
  });

  it("rejects a blank label", async () => {
    const repository = new D1ModelSuggestionRepository(env.AUTHORING_DB);
    await expect(repository.add("   ")).rejects.toThrow(/label is required/);
  });
});
