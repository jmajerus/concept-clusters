// One cluster's whole picture in a dialog, opened from its label's menu
// (clusterMenu.js): the cluster's info and fact, every term with its
// info and whether it's placed yet, and every bridge into the cluster
// with its relation, direction, fact, and link status. Everything shows
// whether or not the cluster is finished; the menu item says so. Nowhere
// else on the board puts this together.
import { RELATION_KINDS } from "./puzzleGraph.js";
import { bridgeDirectionText } from "./bridgeDirection.js";
import { normalizeInfo } from "./termInfo.js";

export function createClusterSummary({ appendInfoAnchor }) {
  const dialog = document.createElement("dialog");
  dialog.className = "cluster-summary";
  dialog.setAttribute("aria-labelledby", "cluster-summary-title");
  document.body.append(dialog);
  // A click on the backdrop lands on the dialog element itself.
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  // The same text-then-links run the info panel under the board shows.
  function infoRun(info) {
    const run = el("span", "cluster-summary-info");
    if (!info) return run;
    if (info.text) run.append(`${info.text} `);
    const links = Array.isArray(info.links) && info.links.length
      ? info.links
      : info.link ? [{ href: info.link, label: info.linkLabel || null }] : [];
    const more = Array.isArray(info.links) && info.links.length ? [] : (info.seeAlso || []);
    [...links, ...more].forEach((entry, index) => {
      if (index) run.append(" · ");
      appendInfoAnchor(run, entry.href, entry.label);
    });
    return run;
  }

  function status(placed, placedText, pendingText) {
    const mark = el("span", `cluster-summary-mark${placed ? " placed" : ""}`, placed ? "✓" : "○");
    mark.setAttribute("aria-label", placed ? placedText : pendingText);
    mark.title = placed ? placedText : pendingText;
    return mark;
  }

  function open({ puzzle, nodes }, ci, { isDone, isBridge }) {
    const cluster = puzzle.clusters[ci];
    const members = cluster.terms
      .map(term => nodes.find(n => !isBridge(n) && n.gs[0] === ci && n.word === term))
      .filter(Boolean);
    const bridges = nodes.filter(n => isBridge(n) && n.gs.includes(ci));
    const placedCount = members.filter(isDone).length;

    const shell = el("div", "cluster-summary-shell");
    const heading = el("div", "cluster-summary-heading");
    const titleBlock = el("div");
    const title = el("h2", `c-${cluster.color || "teal"}`, cluster.name);
    title.id = "cluster-summary-title";
    titleBlock.append(
      title,
      el("div", "cluster-summary-count", `${placedCount} of ${members.length} terms placed`)
    );
    const closeButton = el("button", "cluster-summary-close", "×");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close cluster summary");
    closeButton.addEventListener("click", () => dialog.close());
    heading.append(titleBlock, closeButton);
    shell.append(heading);

    const clusterInfo = normalizeInfo(cluster.info);
    if (clusterInfo?.text || clusterInfo?.link || clusterInfo?.links?.length) {
      const about = el("p", "cluster-summary-about");
      about.append(infoRun(clusterInfo));
      shell.append(about);
    }
    if (cluster.fact) {
      const fact = el("p", "cluster-summary-fact");
      fact.append(el("strong", null, "Fact. "), cluster.fact);
      shell.append(fact);
    }

    shell.append(el("h3", null, "Terms"));
    const termList = el("ul", "cluster-summary-list");
    members.forEach(node => {
      const item = el("li");
      item.append(status(isDone(node), "Placed", "Not placed yet"), el("strong", null, node.word));
      if (node.info?.text || node.info?.link || node.info?.links?.length) {
        item.append(" — ", infoRun(node.info));
      }
      termList.append(item);
    });
    shell.append(termList);

    if (bridges.length) {
      shell.append(el("h3", null, "Bridges"));
      const bridgeList = el("ul", "cluster-summary-list");
      bridges.forEach(node => {
        const item = el("li");
        const others = node.gs.filter(g => g !== ci).map(g => puzzle.clusters[g]?.name).filter(Boolean);
        item.append(
          status(node.connected.includes(ci), "Linked here", "Not linked here yet"),
          el("strong", null, node.word),
          el("span", "cluster-summary-also", ` — also in ${others.join(" and ")}`)
        );
        const relation = RELATION_KINDS[node.relationKind];
        const direction = bridgeDirectionText(node, puzzle);
        const details = [
          node.fact && el("span", null, node.fact),
          relation && el("span", null, `${relation.label}: ${relation.description}`),
          direction && el("span", null, `Direction: ${direction}`),
          (node.info?.text || node.info?.link || node.info?.links?.length) && infoRun(node.info)
        ].filter(Boolean);
        if (details.length) {
          const block = el("div", "cluster-summary-details");
          block.append(...details);
          item.append(block);
        }
        bridgeList.append(item);
      });
      shell.append(bridgeList);
    }

    dialog.replaceChildren(shell);
    if (!dialog.open) dialog.showModal();
    closeButton.focus();
  }

  return { open, close: () => dialog.open && dialog.close() };
}
