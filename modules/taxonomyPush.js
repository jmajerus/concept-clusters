// Pushes the published taxonomy to corpus-mcp's vocabulary intake (corpus-mcp
// PLAN.md, "Living taxonomy", stage 1). The intake sits behind its own Access
// application that admits only the cc-vocabulary-push service token, so the
// push is off unless CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET are set.
// Responses: 200 installed, 200 with `unchanged`, 422 with `problems`; any
// other status is auth or config and is retried.

import { listMergedCategoryRegistry } from "./authoringMcpTaxonomy.js";
import { PostgresPublishedRepository } from "./postgresPublishedRepository.js";
import { taxonomyVocabulary } from "./taxonomySnapshot.js";

export const DEFAULT_VOCABULARY_INTAKE_URL = "https://corpus-mcp.majerus.us/api/intake/vocabulary";

// Only published category documents register a term, so the puzzles that
// loadPublishedCorpus also reads would add nothing here.
export async function loadPublishedTaxonomy(pool, options) {
  const categories = await new PostgresPublishedRepository(pool).listPublished({ kind: "category" });
  return taxonomyVocabulary(listMergedCategoryRegistry({
    contentService: null,
    publishedCategories: categories,
    includeGit: false
  }), options);
}

export function vocabularyPushConfig(env = process.env) {
  const clientId = env.CF_ACCESS_CLIENT_ID;
  const clientSecret = env.CF_ACCESS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { url: env.CORPUS_VOCABULARY_INTAKE_URL || DEFAULT_VOCABULARY_INTAKE_URL, clientId, clientSecret };
}

// One POST. Returns { outcome: "installed" | "unchanged" | "rejected" | "failed", ... };
// never throws, and never includes the client secret in what it returns. A
// hung intake times out as a failure, so it cannot stall the drain loop.
export async function pushVocabulary(vocabulary, config, { fetchImpl = fetch, timeoutMs = 10_000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const { signal } = controller;
  let response;
  let body;
  try {
    response = await fetchImpl(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Access-Client-Id": config.clientId,
        "CF-Access-Client-Secret": config.clientSecret
      },
      body: JSON.stringify(vocabulary),
      redirect: "manual",
      signal
    });
    body = await response.json().catch(() => null);
  } catch (error) {
    if (!signal.aborted) return { outcome: "failed", error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
  if (signal.aborted) return { outcome: "failed", error: `no response within ${timeoutMs} ms` };
  if (response.status === 200) {
    return { outcome: body?.unchanged ? "unchanged" : "installed", version: body?.version ?? vocabulary.version };
  }
  if (response.status === 422) {
    return { outcome: "rejected", problems: Array.isArray(body?.problems) ? body.problems : [] };
  }
  return { outcome: "failed", error: `HTTP ${response.status}` };
}

// The drain loop's step: push when the version differs from the last one
// corpus-mcp accepted. A rejected version is not resent until the taxonomy
// changes; a failure retries on the next call. Each distinct message is
// logged once, so a 15 s tick does not repeat the same error.
export function createTaxonomyPusher({
  pool,
  env = process.env,
  fetchImpl = fetch,
  log = console,
  load = () => loadPublishedTaxonomy(pool)
} = {}) {
  const config = vocabularyPushConfig(env);
  let accepted = null;
  let rejected = null;
  let lastMessage = null;
  const note = (level, message) => {
    if (message === lastMessage) return;
    lastMessage = message;
    log[level](message);
  };
  return async function pushIfChanged() {
    if (!config) {
      note("log", "Taxonomy push off: CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET are not set.");
      return { outcome: "skipped" };
    }
    let vocabulary;
    try {
      vocabulary = await load();
    } catch (error) {
      note("error", `Taxonomy push skipped: ${error instanceof Error ? error.message : error}`);
      return { outcome: "invalid" };
    }
    if (vocabulary.version === accepted || vocabulary.version === rejected) return { outcome: "current" };
    const result = await pushVocabulary(vocabulary, config, { fetchImpl });
    if (result.outcome === "installed" || result.outcome === "unchanged") {
      accepted = vocabulary.version;
      rejected = null;
      note("log", `Taxonomy push: corpus-mcp ${result.outcome} vocabulary ${vocabulary.version}.`);
    } else if (result.outcome === "rejected") {
      rejected = vocabulary.version;
      note("error", `Taxonomy push: corpus-mcp rejected vocabulary ${vocabulary.version}:\n${result.problems.join("\n")}`);
    } else {
      note("error", `Taxonomy push failed (retrying): ${result.error}`);
    }
    return result;
  };
}
