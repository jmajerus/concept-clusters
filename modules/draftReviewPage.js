// Read-only HTML rendering for the hosted authoring Worker's /admin
// routes -- a human-skimmable view of a draft's actual text content
// (facts, term notes, bridge descriptions, the learning introduction),
// which is where authoring disagreements actually concentrate, as opposed
// to board mechanics the game engine already validates structurally. Not
// an editing surface: corrections still flow back through the authoring
// conversation, this just makes reading fast.

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function badge(label, tone = "neutral") {
  if (label === undefined || label === null || label === "") return "";
  return `<span class="badge badge-${tone}">${escapeHtml(label)}</span>`;
}

// Every info-shaped field (puzzle/cluster/bridge/termInfo entries) accepts
// either a plain string or {text?, link?, extraLink?, seeAlso?, citations?}
// -- matches validateInfo() in modules/contentValidation.js.
function renderInfo(info) {
  if (!info) return "";
  if (typeof info === "string") return `<p class="info-text">${escapeHtml(info)}</p>`;
  const parts = [];
  if (info.text) parts.push(`<p class="info-text">${escapeHtml(info.text)}</p>`);
  if (info.link) parts.push(`<p class="info-link">link: ${escapeHtml(info.link)}</p>`);
  if (info.extraLink) parts.push(`<p class="info-link">extra link: ${escapeHtml(info.extraLink)}</p>`);
  if (info.seeAlso) {
    const seeAlso = Array.isArray(info.seeAlso)
      ? info.seeAlso.map(entry => `${escapeHtml(entry.label)}: ${escapeHtml(entry.href)}`).join("; ")
      : escapeHtml(info.seeAlso);
    parts.push(`<p class="info-link">see also: ${seeAlso}</p>`);
  }
  if (Array.isArray(info.citations)) {
    const citations = info.citations.map(citation => {
      const bits = [citation.title, citation.author, citation.publisher, citation.year]
        .filter(Boolean).map(escapeHtml).join(", ");
      return `<li>${bits}${citation.url ? ` (${escapeHtml(citation.url)})` : ""}</li>`;
    }).join("");
    parts.push(`<ul class="citations">${citations}</ul>`);
  }
  return parts.join("\n");
}

function renderCluster(cluster) {
  const seeds = new Set(cluster.seeds || []);
  const terms = (cluster.terms && cluster.terms.length ? cluster.terms
    : [...(cluster.seeds || []), ...(cluster.floatingTerms || [])]);
  const termList = terms.map(term => {
    const info = cluster.termInfo?.[term];
    return `<li>
      <span class="term ${seeds.has(term) ? "term-seed" : ""}">${escapeHtml(term)}</span>
      ${seeds.has(term) ? badge("seed", "accent") : ""}
      ${info ? `<div class="term-info">${renderInfo(info)}</div>` : ""}
    </li>`;
  }).join("\n");
  return `<section class="cluster" style="border-left-color: var(--color-${escapeHtml(cluster.color || "neutral")}, #999)">
    <h3>${escapeHtml(cluster.name)} ${badge(cluster.color)}</h3>
    <p class="fact">${escapeHtml(cluster.fact)}</p>
    <ul class="terms">${termList}</ul>
    ${renderInfo(cluster.info)}
  </section>`;
}

function renderBridge(bridge, clusterNameById) {
  const connects = (bridge.clusters || []).map(id => escapeHtml(clusterNameById.get(id) || id)).join(" ↔ ");
  const idealTerms = bridge.idealTerms
    ? Object.entries(bridge.idealTerms).filter(([, term]) => term)
      .map(([clusterId, term]) =>
        `<li>${escapeHtml(clusterNameById.get(clusterId) || clusterId)}: <strong>${escapeHtml(term)}</strong></li>`)
      .join("")
    : "";
  return `<section class="bridge">
    <h3>${escapeHtml(bridge.term)}</h3>
    <p class="connects">connects: ${connects}</p>
    <p class="fact">${escapeHtml(bridge.fact)}</p>
    <p class="badges">
      ${badge(bridge.relationKind, "accent")}
      ${badge(bridge.termRole)}
      ${bridge.conceptId ? badge(`concept: ${bridge.conceptId}`) : ""}
      ${bridge.direction ? badge(`direction: ${bridge.direction.kind}`) : ""}
    </p>
    ${idealTerms ? `<p>ideal terms:</p><ul>${idealTerms}</ul>` : ""}
    ${renderInfo(bridge.info)}
  </section>`;
}

function renderLens(lens) {
  const targets = lens.targets ? `<p>targets: ${lens.targets.map(escapeHtml).join(", ")}</p>` : "";
  const reasons = lens.reasons
    ? `<ul>${Object.entries(lens.reasons).map(([target, reason]) =>
        `<li><strong>${escapeHtml(target)}</strong>: ${escapeHtml(reason)}</li>`).join("")}</ul>`
    : "";
  const options = lens.options
    ? `<ul>${lens.options.map(option =>
        `<li>${option.correct ? "✓ " : ""}${escapeHtml(option.label)}${
          option.targets ? ` (${option.targets.map(escapeHtml).join(", ")})` : ""}</li>`).join("")}</ul>`
    : "";
  return `<section class="lens">
    <h3>${escapeHtml(lens.prompt)}</h3>
    <p class="fact">${escapeHtml(lens.explanation)}</p>
    ${targets}
    ${reasons}
    ${options}
  </section>`;
}

function renderValidation(validation) {
  if (!validation) {
    return `<p class="validation validation-unknown">Not yet validated -- call validate_puzzle_draft before treating this as final.</p>`;
  }
  if (validation.valid) return `<p class="validation validation-ok">✓ Last validation passed.</p>`;
  const errors = (validation.errors || []).map(error => `<li>${escapeHtml(error)}</li>`).join("");
  return `<div class="validation validation-fail">
    <p>✗ Last validation failed:</p>
    <ul>${errors}</ul>
  </div>`;
}

const PAGE_STYLE = `
  body { font: 16px/1.5 -apple-system, system-ui, sans-serif; max-width: 860px; margin: 0 auto; padding: 24px 16px 64px; color: #1a1a1a; }
  h1 { margin-bottom: 4px; }
  .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 12px; background: #eee; margin-right: 4px; }
  .badge-accent { background: #dbeafe; }
  .badge-ok { background: #dcfce7; }
  .badge-warn { background: #fef9c3; }
  .validation { padding: 10px 14px; border-radius: 6px; margin: 16px 0; }
  .validation-ok { background: #dcfce7; }
  .validation-fail { background: #fee2e2; }
  .validation-unknown { background: #fef9c3; }
  section.cluster, section.bridge, section.lens { border: 1px solid #e5e5e5; border-left: 4px solid #999; border-radius: 6px; padding: 12px 16px; margin: 14px 0; }
  .fact { color: #333; }
  .terms { list-style: none; padding: 0; }
  .terms li { padding: 4px 0; border-bottom: 1px dashed #eee; }
  .term-seed { font-weight: 600; }
  .term-info { color: #555; font-size: 14px; margin: 2px 0 4px 0; }
  .info-text { color: #444; }
  .info-link { color: #666; font-size: 13px; }
  .connects { font-weight: 600; }
  pre.learning-content { white-space: pre-wrap; background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #eee; }
  details.raw { margin-top: 32px; }
  details.raw pre { white-space: pre-wrap; font-size: 12px; background: #fafafa; padding: 12px; border-radius: 6px; overflow-x: auto; }
  a { color: #2563eb; }
  table { border-collapse: collapse; width: 100%; }
  td, th { text-align: left; padding: 6px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
`;

function pageShell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${escapeHtml(title)}</title>
  <style>${PAGE_STYLE}</style>
</head>
<body>${body}</body>
</html>`;
}

// `inCurrentBundle` is null for anything not yet published (not
// applicable -- of course it isn't in the bundle), true/false only once
// status is "published". A published draft can still read false: the
// Worker's list_puzzles/get_puzzle read a snapshot frozen at its last
// deploy, not GitHub directly, so a merge doesn't become visible to the
// live MCP server until the next deploy lands.
function renderBundleStatus(inCurrentBundle) {
  if (inCurrentBundle === null || inCurrentBundle === undefined) return "";
  return inCurrentBundle
    ? '<span class="badge badge-ok">✓ live in this Worker</span>'
    : '<span class="badge badge-warn">⚠ published, not deployed yet</span>';
}

export function renderDraftListPage(drafts) {
  const rows = drafts.map(draft => `<tr>
    <td><a href="/admin/drafts/${encodeURIComponent(draft.draftId)}">${escapeHtml(draft.title || draft.draftId)}</a></td>
    <td><code>${escapeHtml(draft.draftId)}</code></td>
    <td>${escapeHtml(draft.status)}</td>
    <td>${renderBundleStatus(draft.inCurrentBundle)}</td>
    <td>${escapeHtml(draft.updatedAt)}</td>
  </tr>`).join("\n");
  const body = drafts.length
    ? `<h1>Your drafts</h1>
       <p class="meta">Most recently updated first. "Live" only applies once
       published -- it checks whether this Worker has actually been
       redeployed since that publish landed, not just whether the PR merged.</p>
       <table>
         <thead><tr><th>Title</th><th>Draft id</th><th>Status</th><th>Live</th><th>Updated</th></tr></thead>
         <tbody>${rows}</tbody>
       </table>`
    : `<h1>Your drafts</h1><p>No drafts yet.</p>`;
  return pageShell("Drafts", body);
}

export function renderDraftPage(draft) {
  const document = draft.document || {};
  const clusters = document.clusters || [];
  const bridges = document.bridges || [];
  const clusterNameById = new Map(clusters.map(cluster => [cluster.id, cluster.name]));
  const intro = document.learningIntroduction;

  const body = `
    <p class="meta"><a href="/admin/drafts">← all drafts</a></p>
    <h1>${escapeHtml(document.title || draft.title || draft.draftId)}</h1>
    <p class="meta">
      <code>${escapeHtml(draft.draftId)}</code>
      ${badge(draft.status)}
      ${renderBundleStatus(draft.inCurrentBundle)}
      updated ${escapeHtml(draft.updatedAt)}
    </p>
    ${renderValidation(draft.validation)}
    <p class="meta">
      ${badge(document.category, "accent")}
      ${(document.categories || []).filter(name => name !== document.category).map(name => badge(name)).join("")}
      ${(document.tags || []).map(tag => badge(tag)).join("")}
      ${document.large ? badge("large") : ""}
    </p>
    ${renderInfo(document.info)}

    <h2>Clusters (${clusters.length})</h2>
    ${clusters.map(renderCluster).join("\n") || "<p>None yet.</p>"}

    <h2>Bridges (${bridges.length})</h2>
    ${bridges.map(bridge => renderBridge(bridge, clusterNameById)).join("\n") || "<p>None yet.</p>"}

    ${document.lenses?.length ? `<h2>Lenses (${document.lensMode || "sequential"})</h2>
      ${document.lenses.map(renderLens).join("\n")}` : ""}

    ${document.relatedPuzzles?.entries?.length ? `<h2>Related puzzles</h2>
      ${renderInfo(document.relatedPuzzles.info)}
      <ul>${document.relatedPuzzles.entries.map(entry =>
        `<li><strong>${escapeHtml(entry.id)}</strong>: ${escapeHtml(entry.reason)}${
          entry.via ? ` <span class="meta">(via ${entry.via.map(escapeHtml).join(", ")})</span>` : ""}</li>`
      ).join("")}</ul>` : ""}

    ${intro ? `<h2>Learning introduction</h2>
      <p class="meta">
        ${badge(intro.requirement, "accent")}
        ${intro.estimatedMinutes ? badge(`${intro.estimatedMinutes} min`) : ""}
      </p>
      ${intro.title ? `<h3>${escapeHtml(intro.title)}</h3>` : ""}
      ${intro.summary ? `<p class="fact">${escapeHtml(intro.summary)}</p>` : ""}
      <pre class="learning-content">${escapeHtml(intro.content?.text || "")}</pre>
      ${intro.sources?.length ? `<p>Sources: ${intro.sources.map(source =>
        `<a href="${escapeHtml(source.href)}">${escapeHtml(source.label)}</a>`).join(", ")}</p>` : ""}
    ` : ""}

    <details class="raw">
      <summary>Raw document JSON</summary>
      <pre>${escapeHtml(JSON.stringify(document, null, 2))}</pre>
    </details>
  `;
  return pageShell(document.title || draft.draftId, body);
}
