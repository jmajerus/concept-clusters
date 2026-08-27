// Bootstrap outside game.js's static puzzle/catalogue import graph.
// When a deploy is incomplete (e.g. puzzles/index.js imports a module that
// was not published), the whole game.js graph fails and the HTML shell used
// to sit as an empty board. This module catches that and shows a landing
// message instead.

export function failedModuleHint(error) {
  const text = error instanceof Error
    ? `${error.message}\n${error.stack || ""}`
    : String(error ?? "");
  const match = text.match(
    /(?:Failed to fetch dynamically imported module:\s*|Cannot find module\s+|Error loading\s+)['"]?(\S+\.js)/i
  ) || text.match(/((?:https?:\/\/|\/)[\w./@+-]+\.js)/);
  if (!match) return null;
  try {
    const url = new URL(match[1], "https://example.invalid");
    return url.pathname.replace(/^\/+/, "") || match[1];
  } catch {
    return match[1].replace(/^['"]|['"]$/g, "");
  }
}

export function bootFailureCopy(error) {
  const detail = error instanceof Error ? error.message : String(error ?? "Unknown error");
  const modulePath = failedModuleHint(error);
  return {
    title: "Concept Clusters couldn’t load",
    body:
      "The puzzle app failed to start. This usually means the published site is incomplete — " +
      "for example the puzzle or catalogue registry listing a file that was not deployed with it. " +
      "Try refreshing after a full deploy lands.",
    modulePath,
    detail
  };
}

export function renderBootFailure(copy) {
  const moduleLine = copy.modulePath
    ? `<p class="boot-failure-module">Missing or broken module: <code>${escapeHtml(copy.modulePath)}</code></p>`
    : "";
  return `<div class="boot-failure-card" role="alert">
    <h2>${escapeHtml(copy.title)}</h2>
    <p>${escapeHtml(copy.body)}</p>
    ${moduleLine}
    <details>
      <summary>Technical detail</summary>
      <pre>${escapeHtml(copy.detail)}</pre>
    </details>
  </div>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

export function showBootFailure(doc, error) {
  const root = doc.getElementById("boot-failure");
  if (!root) return;
  root.innerHTML = renderBootFailure(bootFailureCopy(error));
  root.hidden = false;
}

export async function bootGame({
  doc = document,
  importGame = () => import("../game.js")
} = {}) {
  try {
    await importGame();
    doc.body?.classList.remove("booting");
    return { ok: true };
  } catch (error) {
    doc.body?.classList.remove("booting");
    doc.body?.classList.add("boot-failed");
    showBootFailure(doc, error);
    if (!globalThis.__CC_BOOT_TEST__) {
      console.error("[concept-clusters] boot failed", error);
    }
    return { ok: false, error };
  }
}

if (typeof document !== "undefined" && !globalThis.__CC_BOOT_TEST__) {
  await bootGame();
}
