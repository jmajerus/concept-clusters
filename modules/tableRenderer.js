// A stable membership matrix over the same nodes and connections used by
// the diagrams. No coordinates or separate answer state belong to this view.
import { canonicalBridgeNames, canonicalNodeAriaLabel } from "./idealTarget.js";
import { lensAssignmentBadge, lensNodeAriaLabel, withLensClass } from "./lensEngine.js";
import { normalizeInfo } from "./termInfo.js";

export function createTableRenderer({
  container, svg, getState, getSim, isDone, isBridge,
  connectToCluster, handleTap, showTermInfo, clearTermInfo,
  focusTermInfo, blurTermInfo, updateSolutionHint, countEl,
  onClusterContextMenu
}) {
  function buildTable() {
    const state = getState();
    const { puzzle, nodes } = state;
    getSim()?.stop();
    svg.selectAll("*").remove();
    container.replaceChildren();
    state.selected = null;

    const help = document.createElement("p");
    help.className = "table-help";
    help.textContent = "One check per cluster connection. Seeds are already checked.";
    const scroll = document.createElement("div");
    scroll.className = "table-scroll";
    scroll.setAttribute("role", "region");
    scroll.setAttribute("aria-label", "Term and cluster memberships");
    scroll.tabIndex = 0;
    const sheet = document.createElement("div");
    sheet.className = "table-sheet";
    sheet.style.setProperty("--table-members-width", `${puzzle.clusters.length * 44}px`);
    const table = document.createElement("table");
    table.className = "membership-table";
    const caption = table.createCaption();
    caption.className = "visually-hidden";
    caption.textContent = `${puzzle.title}: check a term's membership in each cluster. Use arrow keys to move between cells and Space to check.`;
    const colgroup = document.createElement("colgroup");
    colgroup.append(document.createElement("col"));
    puzzle.clusters.forEach(() => colgroup.append(document.createElement("col")));
    table.append(colgroup);
    const head = table.createTHead().insertRow();
    const corner = document.createElement("th");
    corner.scope = "col";
    corner.textContent = "Term";
    head.append(corner);
    const headings = puzzle.clusters.map((cluster, ci) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.id = `table-cluster-${ci}`;
      cell.className = "table-cluster-heading";
      cell.style.setProperty("--table-color", `var(--${cluster.color})`);
      const label = document.createElement("button");
      label.type = "button";
      label.textContent = cluster.name;
      label.title = cluster.name;
      label.addEventListener("click", () => showTermInfo({ word: cluster.name, info: normalizeInfo(cluster.info) }));
      cell.addEventListener("contextmenu", event => onClusterContextMenu(ci, event, label));
      cell.append(label);
      head.append(cell);
      return cell;
    });

    const details = document.createElement("p");
    details.id = "table-details";
    details.className = "table-details";
    let detailNode = null;
    function annotation(node) {
      const parts = [];
      if (isBridge(node) && node.connected.length) {
        parts.push(isDone(node)
          ? `Bridge: ${node.connected.length} clusters connected.`
          : `Bridge: ${node.connected.length} of ${node.gs.length} clusters connected.`);
        if (isDone(node) && node.fact) parts.push(node.fact);
        // Match the diagrams' reveal rule: neither the annotation nor its
        // accessible name may disclose an unplaced endpoint's membership.
        node.connected.forEach(ci => {
          const word = node.idealTerms?.[node.gs.indexOf(ci)];
          const target = word && nodes.find(candidate => candidate.word === word);
          if (target && isDone(target)) parts.push(`${puzzle.clusters[ci].name}: ${word}.`);
        });
      }
      const names = canonicalBridgeNames(node, puzzle, nodes);
      if (names.length) parts.push(`Ideal endpoint for ${names.join(", ")}.`);
      return parts.join(" ");
    }
    function showDetails(node) {
      detailNode = node;
      details.textContent = annotation(node);
      showTermInfo(node);
    }

    const body = table.createTBody();
    // Alphabetical order mixes authored clusters and stays fixed as cells
    // are checked. Grouping by the source arrays would give answers away.
    const rows = [...nodes].sort((a, b) => a.word.localeCompare(b.word)).map((node, ri) => {
      const row = body.insertRow();
      row.dataset.term = node.word;
      const termCell = document.createElement("th");
      termCell.scope = "row";
      termCell.id = `table-term-${node.id}`;
      const term = document.createElement("button");
      term.type = "button";
      term.className = "table-term";
      const word = document.createElement("span");
      word.textContent = node.word;
      const status = document.createElement("span");
      status.className = "table-term-status";
      term.append(word, status);
      term.setAttribute("aria-describedby", details.id);
      term.addEventListener("click", () => {
        showDetails(node);
        if (state.phase !== "assembling") handleTap(node);
      });
      termCell.append(term);
      row.append(termCell);
      const cells = puzzle.clusters.map((cluster, ci) => {
        const cell = row.insertCell();
        cell.style.setProperty("--table-color", `var(--${cluster.color})`);
        cell.style.setProperty("--table-bg", `var(--${cluster.color}-bg)`);
        const label = document.createElement("label");
        label.className = "table-check";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.dataset.cluster = String(ci);
        input.setAttribute("aria-labelledby", `${termCell.id} table-cluster-${ci}`);
        // Checked cells stay focusable for inspection and arrow navigation.
        // Their value, like a placed node in a diagram, cannot be undone by
        // activating it again; Reset cluster remains in the heading menu.
        input.addEventListener("change", () => {
          input.checked = node.connected.includes(ci);
          connectToCluster(node, ci);
          showDetails(node);
          paint();
        });
        input.addEventListener("keydown", event => {
          const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
          const move = moves[event.key];
          if (!move) return;
          event.preventDefault();
          const nextRow = Math.max(0, Math.min(rows.length - 1, ri + move[0]));
          const nextColumn = Math.max(0, Math.min(puzzle.clusters.length - 1, ci + move[1]));
          rows[nextRow].cells[nextColumn].input.focus();
        });
        label.append(input);
        cell.append(label);
        cell.addEventListener("mouseenter", () => highlight(ri, ci));
        input.addEventListener("focus", () => highlight(ri, ci));
        return { cell, input };
      });
      row.addEventListener("mouseenter", () => showDetails(node));
      row.addEventListener("focusin", () => { focusTermInfo(node); showDetails(node); });
      row.addEventListener("focusout", event => {
        if (!row.contains(event.relatedTarget)) blurTermInfo(node);
      });
      return { node, row, term, status, cells };
    });

    function highlight(ri = -1, ci = -1) {
      rows.forEach((entry, i) => {
        entry.row.classList.toggle("table-active-row", i === ri);
        entry.cells.forEach(({ cell }, j) => cell.classList.toggle("table-active-column", j === ci));
      });
      headings.forEach((heading, i) => heading.classList.toggle("table-active-column", i === ci));
    }
    scroll.addEventListener("mouseleave", () => {
      if (!scroll.contains(document.activeElement)) { highlight(); clearTermInfo(); }
    });
    scroll.addEventListener("focusout", event => {
      if (!scroll.contains(event.relatedTarget)) highlight();
    });
    sheet.append(table);
    scroll.append(sheet);
    container.append(help, scroll, details);

    // Measure actual labels: long names need more height and right-side
    // overhang, rather than wider checkbox columns or clipped headings.
    function sizeHeadings() {
      const width = Math.max(0, ...headings.map(heading => heading.firstChild.offsetWidth));
      if (!width) return; // The lesson introduction can initially hide the board.
      sheet.style.setProperty("--table-heading-height", `${Math.ceil(width * Math.sin(Math.PI / 3)) + 48}px`);
      sheet.style.setProperty("--table-heading-overhang", `${Math.ceil(width / 2) + 18}px`);
    }
    sizeHeadings();
    const resizeObserver = new ResizeObserver(sizeHeadings);
    resizeObserver.observe(scroll);
    document.fonts?.ready.then(() => { if (getState() === state && container.contains(sheet)) sizeHeadings(); });

    function paint() {
      if (getState() !== state) return;
      rows.forEach(({ node, row, term, status, cells }) => {
        const connected = node.connected.length > 0;
        const bridge = isBridge(node) && connected;
        const seed = !isBridge(node) && puzzle.clusters[node.gs[0]].seeds.includes(node.word);
        const active = row.classList.contains("table-active-row");
        row.className = withLensClass(`table-row${active ? " table-active-row" : ""}${bridge ? " table-bridge" : ""}${connected && !isDone(node) ? " table-partial" : ""}`, node, state);
        term.setAttribute("aria-label", lensNodeAriaLabel(node, state,
          canonicalNodeAriaLabel(node, puzzle, nodes, node.word)));
        term.title = annotation(node) || node.word;
        if (state.phase === "lens-selecting") term.setAttribute("aria-pressed", String(state.lensSelections.has(node.word)));
        else term.removeAttribute("aria-pressed");
        const badge = lensAssignmentBadge(node, state);
        status.className = `table-term-status${badge?.tone ? ` lens-tone-${badge.tone}` : ""}`;
        status.textContent = badge
          ? `Lens ${badge.text}${state.phase === "complete" ? badge.correct ? " ✓" : badge.unanswered ? " · unanswered" : " · review" : ""}`
          : seed ? "Seed" : bridge ? isDone(node) ? "Bridge" : `${node.connected.length}/${node.gs.length} clusters` : "";
        cells.forEach(({ cell, input }, ci) => {
          input.checked = node.connected.includes(ci);
          const locked = input.checked || isDone(node) || state.phase !== "assembling";
          input.setAttribute("aria-readonly", String(locked));
          cell.classList.toggle("table-connected", input.checked);
          cell.classList.toggle("table-locked", locked);
          input.title = input.checked ? seed ? "Starting clue" : "Connected" : locked ? "No connection" : "Connect to this cluster";
        });
      });
      if (detailNode) details.textContent = annotation(detailNode);
      if (state.made === state.need) state.solutionLayout = "pretty";
      countEl.textContent = state.progressLabel || `${state.made} of ${state.need} links`;
      updateSolutionHint();
    }

    // Replace every renderer hook that could retain diagram DOM, simulation,
    // or an in-flight geometry pass from the previous mode.
    state.paint = paint;
    state.drawLinks = () => {};
    state.onLinkAdded = () => {};
    state.captureManualOffset = () => null;
    state.reconcileManualOffset = () => {};
    state.prepareCanonicalResolution = null;
    state.bridgeArmSegment = () => null;
    state.freezeForLenses = () => {};
    state.onPuzzleSolved = () => { state.solutionLayout = "pretty"; };
    state.detangle = state.prettyPrint = () => {
      state.solutionLayout = "pretty";
      return Promise.resolve({ cancelled: false });
    };
    state.detanglePromise = state.prettyPrintPromise = null;
    state.repairPlayerLayout = null;
    state.layoutAdapter = { mode: "table" };
    state.stopRenderer = () => { resizeObserver.disconnect(); container.replaceChildren(); };
    paint();
  }

  return { buildTable };
}
