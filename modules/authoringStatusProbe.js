// One-line status-bar summary of the LAN authoring server, in the JSON shape
// the vscode-status-probe extension renders: { text, tooltip, level, open }.
// tools/authoring-status.mjs fetches /admin/server-revision.json and prints
// this; the /admin Authoring server section is the long form.

const ICON = "$(server)";
const MAX_BRANCH_LABEL = 16;

function shortCommit(commit) {
  return String(commit || "").slice(0, 7);
}

function branchLabel(branch, { baseBranch, prNumber }) {
  if (!branch) return "detached";
  if (branch === baseBranch) return branch;
  if (prNumber) return `#${prNumber}`;
  // "feature/" and similar prefixes cost space without telling branches apart.
  const name = branch.slice(branch.lastIndexOf("/") + 1);
  return name.length > MAX_BRANCH_LABEL
    ? `${name.slice(0, MAX_BRANCH_LABEL - 1)}…`
    : name;
}

function escapeMarkdown(value) {
  return String(value ?? "").replace(/[\\`*_{}[\]()#+\-.!|<>]/g, "\\$&");
}

export function probeError(text, detail, { open = null } = {}) {
  return {
    text: `${ICON} ${text}`,
    tooltip: `**Authoring server**\n\n${escapeMarkdown(detail)}`,
    level: "error",
    ...(open ? { open } : {})
  };
}

/**
 * @param {object} status  /admin/server-revision.json (loadServerRevisionStatus)
 * @param {{ adminUrl: string, prNumber?: number | null, checkedAt?: Date }} options
 */
export function formatAuthoringStatusProbe(status, {
  adminUrl,
  prNumber = null,
  checkedAt = new Date()
} = {}) {
  const { running } = status;
  const baseBranch = String(status.baseRef || "origin/main").replace(/^origin\//, "");
  const ownRef = status.upstreamRef || status.baseRef;
  const behindOwn = status.upstreamRef ? status.behindUpstream : status.behindBase;
  const missingBase = status.upstreamRef ? status.behindBase : 0;
  const marks = [];
  if (behindOwn > 0) marks.push(`↓${behindOwn}`);
  if (missingBase > 0) marks.push(`✗${baseBranch}`);
  if (status.checkoutMoved) marks.push("⟳");
  const label = branchLabel(running.branch, { baseBranch, prNumber });
  const rows = [
    ["Running", `${running.branch || "detached HEAD"}${prNumber ? ` (PR #${prNumber})` : ""}`],
    ["Commit", `${shortCommit(running.commit)} ${running.subject || ""}`.trim()],
    [`Behind ${ownRef}`, behindOwn == null ? "unknown" : String(behindOwn)]
  ];
  if (status.upstreamRef) {
    rows.push([`Missing from ${status.baseRef}`, status.behindBase == null ? "unknown" : String(status.behindBase)]);
  }
  if (status.checkoutMoved) {
    rows.push(["Checkout now", `${status.checkout?.branch || "detached HEAD"} @ ${shortCommit(status.checkout?.commit)} (restart to serve it)`]);
  }
  if (status.fetchError) rows.push(["Fetch", `failed; compared with the last fetched refs`]);
  rows.push(["Checked", checkedAt.toLocaleTimeString()]);
  const table = [
    "| | |",
    "|---|---|",
    ...rows.map(([key, value]) => `| ${escapeMarkdown(key)} | ${escapeMarkdown(value)} |`)
  ].join("\n");
  const fix = marks.length
    ? "\n\nRedeploy: `npm run authoring:deploy` (or the Deploy Authoring button)."
    : "";
  return {
    text: [`${ICON} ${label}`, ...marks].join(" "),
    tooltip: `**Authoring server**\n\n${table}${fix}`,
    level: marks.length || status.fetchError ? "warn" : "ok",
    open: adminUrl
  };
}
