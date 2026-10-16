// A stable membership matrix over the same nodes and connections used by
// the diagrams. No coordinates or separate answer state belong to this view.
import { canonicalBridgeNames, canonicalNodeAriaLabel } from "./idealTarget.js";
import { lensAssignmentBadge, lensNodeAriaLabel, withLensClass } from "./lensEngine.js";
import { normalizeInfo } from "./termInfo.js";

export function createTableRenderer({
  container, svg, getState, getSim, isDone, isBridge,
  connectToCluster, handleTap, showTermInfo, clearTermInfo,
  focusTermInfo, blurTermInfo, updateSolutionHint, countEl,
  onClusterContextMenu, storage = null
}) {
  function buildTable() {
    const state = getState();
    const { puzzle, nodes } = state;
    getSim()?.stop();
    svg.selectAll("*").remove();
    container.replaceChildren();
    state.selected = null;
    state.tableFeedback ||= { rememberWrongChoices: false, wrongChoices: [] };
    if (state.tableShowTermInfo == null) {
      try { state.tableShowTermInfo = storage?.getItem("ccTableShowTermInfo") === "true"; }
      catch { state.tableShowTermInfo = false; }
    }
    const cellPulses = new Map();
    const choiceKey = (node, ci) => JSON.stringify([node.word, ci]);

    function pulseCell(node, ci, tone) {
      const key = choiceKey(node, ci);
      clearTimeout(cellPulses.get(key)?.timer);
      const timer = setTimeout(() => {
        cellPulses.delete(key);
        paint();
      }, 650);
      cellPulses.set(key, { tone, timer });
    }

    function rememberIncorrectChoice(node, ci) {
      const feedback = state.tableFeedback;
      if (feedback.rememberWrongChoices && !feedback.wrongChoices.some(choice =>
        choice.term === node.word && choice.clusterIndex === ci
      )) {
        feedback.wrongChoices.push({ term: node.word, clusterIndex: ci });
        state.onProgressChanged?.();
      }
    }

    const help = document.createElement("p");
    help.className = "table-help";
    help.textContent = "One check per cluster connection. Seeds are already checked.";
    // Keep the view choice across diagram switches during this visit. It
    // changes only presentation, never connection history or saved answers.
    let order = state.tableOrder || { kind: "alphabetical" };
    if (order.kind === "grouped" && state.made !== state.need) order = { kind: "alphabetical" };
    const toolbar = document.createElement("div");
    toolbar.className = "table-toolbar";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-label", "Table options");
    const alphabetical = document.createElement("button");
    alphabetical.id = "table-alphabetical";
    alphabetical.type = "button";
    alphabetical.textContent = "Alphabetical";
    alphabetical.addEventListener("click", () => setOrder({ kind: "alphabetical" }));
    const grouped = document.createElement("button");
    grouped.id = "table-group-clusters";
    grouped.type = "button";
    grouped.textContent = "Group by cluster";
    grouped.addEventListener("click", () => {
      if (state.made === state.need) setOrder({ kind: "grouped" });
    });
    const rememberLabel = document.createElement("label");
    rememberLabel.className = "table-option";
    rememberLabel.title = "Keep gray × markers for incorrect choices in this puzzle. Start over clears them.";
    const remember = document.createElement("input");
    remember.id = "table-remember-wrong";
    remember.type = "checkbox";
    remember.addEventListener("change", () => {
      state.tableFeedback.rememberWrongChoices = remember.checked;
      paint();
      state.onProgressChanged?.();
    });
    rememberLabel.append(remember, "Remember incorrect choices");
    const infoLabel = document.createElement("label");
    infoLabel.className = "table-option";
    const showInfo = document.createElement("input");
    showInfo.id = "table-show-info";
    showInfo.type = "checkbox";
    showInfo.addEventListener("change", () => {
      state.tableShowTermInfo = showInfo.checked;
      try { storage?.setItem("ccTableShowTermInfo", String(showInfo.checked)); }
      catch { /* The view still works when preferences cannot be saved. */ }
      paint();
    });
    infoLabel.append(showInfo, "Show term info");
    toolbar.append(alphabetical, grouped, rememberLabel, infoLabel);
    const orderStatus = document.createElement("p");
    orderStatus.id = "table-order-status";
    orderStatus.className = "table-help";
    orderStatus.setAttribute("role", "status");
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
    const infoColumn = document.createElement("col");
    infoColumn.className = "table-info-column";
    infoColumn.hidden = !state.tableShowTermInfo;
    colgroup.append(infoColumn);
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
      label.title = `Bring connected terms for ${cluster.name} to the top`;
      label.addEventListener("click", () => {
        setOrder({ kind: "cluster", ci });
        showTermInfo({ word: cluster.name, info: normalizeInfo(cluster.info) });
      });
      cell.addEventListener("contextmenu", event => onClusterContextMenu(ci, event, label));
      cell.append(label);
      head.append(cell);
      return cell;
    });
    const infoHeading = document.createElement("th");
    infoHeading.scope = "col";
    infoHeading.className = "table-info-heading";
    infoHeading.textContent = "Term info";
    infoHeading.hidden = !state.tableShowTermInfo;
    head.append(infoHeading);

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

    const sortedNodes = [...nodes].sort((a, b) => a.word.localeCompare(b.word));
    const rowCache = new Map();
    let rows = [];
    let rowSignature = "";
    function createRow(node, groupKey) {
      const row = document.createElement("tr");
      row.dataset.term = node.word;
      const entry = { node, row };
      const termCell = document.createElement("th");
      termCell.scope = "row";
      termCell.id = `table-term-${node.id}-${groupKey}`;
      const term = document.createElement("button");
      term.type = "button";
      term.className = "table-term";
      const word = document.createElement("span");
      word.textContent = node.word;
      const status = document.createElement("span");
      status.className = "table-term-status";
      const indent = document.createElement("span");
      indent.className = "table-bridge-indent";
      indent.textContent = "↳";
      indent.setAttribute("aria-hidden", "true");
      indent.hidden = true;
      term.append(word, status, indent);
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
        const wrongMark = document.createElement("span");
        wrongMark.className = "table-wrong-mark";
        wrongMark.textContent = "×";
        wrongMark.setAttribute("aria-hidden", "true");
        wrongMark.hidden = true;
        const wrongNote = document.createElement("span");
        wrongNote.id = `${termCell.id}-wrong-${ci}`;
        wrongNote.className = "visually-hidden";
        wrongNote.textContent = "Previously tried: this term does not belong to this cluster.";
        wrongNote.hidden = true;
        // Checked cells stay focusable for inspection and arrow navigation.
        // Their value, like a placed node in a diagram, cannot be undone by
        // activating it again; Reset cluster remains in the heading menu.
        input.addEventListener("change", () => {
          input.checked = node.connected.includes(ci);
          if (input.checked) {
            pulseCell(node, ci, "connected");
          } else {
            const result = connectToCluster(node, ci);
            if (result !== "connected") pulseCell(node, ci, "incorrect");
            if (result === "incorrect") rememberIncorrectChoice(node, ci);
          }
          showDetails(node);
          paint();
        });
        input.addEventListener("keydown", event => {
          const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
          const move = moves[event.key];
          if (!move) return;
          event.preventDefault();
          const ri = rows.indexOf(entry);
          const nextRow = Math.max(0, Math.min(rows.length - 1, ri + move[0]));
          const nextColumn = Math.max(0, Math.min(puzzle.clusters.length - 1, ci + move[1]));
          rows[nextRow].cells[nextColumn].input.focus();
        });
        label.append(input, wrongMark, wrongNote);
        cell.append(label);
        cell.addEventListener("mouseenter", () => highlight(rows.indexOf(entry), ci));
        input.addEventListener("focus", () => highlight(rows.indexOf(entry), ci));
        return { cell, input, wrongMark, wrongNote };
      });
      const infoCell = row.insertCell();
      infoCell.className = "table-term-info";
      infoCell.hidden = !state.tableShowTermInfo;
      // This is the ordinary authored description, available on hover
      // already. Revealed bridge facts and endpoints stay in annotations.
      infoCell.textContent = node.info?.text || "";
      row.addEventListener("mouseenter", () => showDetails(node));
      row.addEventListener("focusin", () => { focusTermInfo(node); showDetails(node); });
      row.addEventListener("focusout", event => {
        if (!row.contains(event.relatedTarget)) blurTermInfo(node);
      });
      return Object.assign(entry, { term, status, cells, indent, infoCell });
    }

    function clusterGroup(ci) {
      // Use only confirmed memberships. An unplaced authored endpoint
      // cannot affect ordering, indentation, labels, or accessible names.
      const confirmed = sortedNodes.filter(node => node.connected.includes(ci));
      const concepts = confirmed.filter(node => !isBridge(node));
      const connections = confirmed.filter(isBridge);
      const endpoints = new Map();
      const children = new Map();
      const unattached = [];
      connections.forEach(bridge => {
        const word = bridge.idealTerms?.[bridge.gs.indexOf(ci)];
        const endpoint = concepts.find(node => node.word === word && isDone(node));
        if (!endpoint) { unattached.push(bridge); return; }
        endpoints.set(bridge.id, endpoint.word);
        if (!children.has(endpoint.word)) children.set(endpoint.word, []);
        children.get(endpoint.word).push(bridge);
      });
      return {
        key: `cluster-${ci}`, ci,
        endpoints,
        unattachedStart: unattached[0]?.id,
        members: [
          ...concepts.flatMap(node => [node, ...(children.get(node.word) || [])]),
          ...unattached
        ]
      };
    }

    function renderRows() {
      const groups = order.kind === "grouped"
        ? puzzle.clusters.map((_, ci) => clusterGroup(ci))
        : order.kind === "cluster"
          ? [clusterGroup(order.ci), {
            key: "others", members: sortedNodes.filter(node => !node.connected.includes(order.ci))
          }]
          : [{ key: "all", members: sortedNodes }];
      const signature = JSON.stringify([order.kind, state.tableShowTermInfo, groups.map(group => [
        group.key, group.members.map(node => [node.id, group.endpoints?.get(node.id) || null])
      ])]);
      if (signature === rowSignature) return;
      rowSignature = signature;
      const focused = document.activeElement;
      const restoreFocus = table.contains(focused) && !!focused.closest("tbody");
      const focusedRow = restoreFocus && rows.find(entry => entry.row.contains(focused));
      const focusedColumn = focusedRow ? focusedRow.cells.findIndex(cell => cell.input === focused) : -1;
      const bodies = groups.map(group => {
        const body = document.createElement("tbody");
        if (group.ci != null) {
          body.className = "table-cluster-group";
          body.dataset.cluster = String(group.ci);
          body.style.setProperty("--table-group-color", `var(--${puzzle.clusters[group.ci].color})`);
          body.style.setProperty("--table-group-bg", `var(--${puzzle.clusters[group.ci].color}-bg)`);
        }
        if (order.kind !== "alphabetical") {
          const heading = body.insertRow();
          heading.className = "table-group-heading";
          const cell = document.createElement("th");
          cell.colSpan = puzzle.clusters.length + 1 + Number(state.tableShowTermInfo);
          cell.scope = "rowgroup";
          cell.id = `table-group-${group.key}`;
          const text = document.createElement("span");
          text.textContent = group.ci == null
            ? `Other terms · ${group.members.length}`
            : `${puzzle.clusters[group.ci].name} · ${group.members.length} connected`;
          cell.append(text);
          heading.append(cell);
          body.setAttribute("aria-labelledby", cell.id);
        }
        group.members.forEach(node => {
          if (node.id === group.unattachedStart) {
            const divider = body.insertRow();
            divider.className = "table-connections-heading";
            const cell = divider.insertCell();
            cell.colSpan = puzzle.clusters.length + 1 + Number(state.tableShowTermInfo);
            const text = document.createElement("span");
            text.textContent = "Shared connections";
            cell.append(text);
          }
          const key = `${group.key}:${node.id}`;
          if (!rowCache.has(key)) rowCache.set(key, createRow(node, group.key));
          const entry = rowCache.get(key);
          entry.parentWord = group.endpoints?.get(node.id) || null;
          body.append(entry.row);
        });
        return body;
      });
      // Reuse row objects and their listeners. Rebuilding only row groups
      // preserves shared bridge behavior and keyboard focus after a sort.
      [...table.tBodies].forEach(body => body.remove());
      table.append(...bodies);
      rows = groups.flatMap(group => group.members.map(node => rowCache.get(`${group.key}:${node.id}`)));
      if (restoreFocus) {
        const replacement = rows.find(entry => entry.node === focusedRow?.node);
        const target = table.contains(focused) ? focused
          : focusedColumn >= 0 ? replacement?.cells[focusedColumn].input : replacement?.term;
        target?.focus({ preventScroll: true });
      }
    }

    function setOrder(next) {
      order = next;
      state.tableOrder = order;
      paint();
      scroll.scrollTop = 0;
    }

    function updateOrderControls() {
      const complete = state.made === state.need;
      alphabetical.setAttribute("aria-pressed", String(order.kind === "alphabetical"));
      grouped.setAttribute("aria-pressed", String(order.kind === "grouped"));
      grouped.disabled = !complete;
      grouped.title = complete ? "Show each cluster as a labeled group" : "Available when every term is connected";
      corner.setAttribute("aria-sort", order.kind === "alphabetical" ? "ascending" : "none");
      headings.forEach((heading, ci) => {
        const selected = order.kind === "cluster" && order.ci === ci;
        heading.firstChild.setAttribute("aria-pressed", String(selected));
        heading.classList.toggle("table-sorted-column", selected);
        heading.setAttribute("aria-sort", selected ? "other" : "none");
      });
      const text = order.kind === "grouped"
        ? "Grouped by cluster. Bridges follow their revealed ideal terms; other bridges appear under Shared connections."
        : order.kind === "cluster"
          ? `${puzzle.clusters[order.ci].name} · ${clusterGroup(order.ci).members.length} connected. Other terms follow alphabetically.`
          : "Alphabetical order. Click a cluster heading to bring its connected terms to the top.";
      if (orderStatus.textContent !== text) orderStatus.textContent = text;
    }

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
    container.append(help, toolbar, orderStatus, scroll, details);

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
      showInfo.checked = state.tableShowTermInfo;
      infoColumn.hidden = infoHeading.hidden = !showInfo.checked;
      sheet.classList.toggle("table-show-info", showInfo.checked);
      renderRows();
      updateOrderControls();
      remember.checked = state.tableFeedback.rememberWrongChoices;
      const remembered = new Set(state.tableFeedback.wrongChoices.map(choice => JSON.stringify([choice.term, choice.clusterIndex])));
      rows.forEach(({ node, row, term, status, cells, indent, parentWord, infoCell }) => {
        infoCell.hidden = !showInfo.checked;
        const connected = node.connected.length > 0;
        const bridge = isBridge(node) && connected;
        const shared = order.kind === "grouped" && bridge;
        const seed = !isBridge(node) && puzzle.clusters[node.gs[0]].seeds.includes(node.word);
        const active = row.classList.contains("table-active-row");
        row.className = withLensClass(`table-row${active ? " table-active-row" : ""}${bridge ? " table-bridge" : ""}${parentWord ? " table-nested-bridge" : ""}${connected && !isDone(node) ? " table-partial" : ""}`, node, state);
        indent.hidden = !parentWord;
        if (parentWord) row.dataset.idealEndpoint = parentWord;
        else delete row.dataset.idealEndpoint;
        const relationship = parentWord ? `Shared connection through ${parentWord}.` : "";
        const name = lensNodeAriaLabel(node, state, canonicalNodeAriaLabel(node, puzzle, nodes, node.word));
        term.setAttribute("aria-label", [name, relationship, shared ? "Shared bridge; repeated in each connected cluster." : ""].filter(Boolean).join(" "));
        term.title = [relationship, shared ? "Shared bridge; repeated in each connected cluster." : "", annotation(node)].filter(Boolean).join(" ") || node.word;
        if (state.phase === "lens-selecting") term.setAttribute("aria-pressed", String(state.lensSelections.has(node.word)));
        else term.removeAttribute("aria-pressed");
        const badge = lensAssignmentBadge(node, state);
        status.className = `table-term-status${shared && !badge ? " table-shared-status" : ""}${badge?.tone ? ` lens-tone-${badge.tone}` : ""}`;
        status.textContent = badge
          ? `Lens ${badge.text}${state.phase === "complete" ? badge.correct ? " ✓" : badge.unanswered ? " · unanswered" : " · review" : ""}${shared ? " · shared" : ""}`
          : seed ? "Seed" : bridge ? shared ? "Shared bridge" : isDone(node) ? "Bridge" : `${node.connected.length}/${node.gs.length} clusters` : "";
        cells.forEach(({ cell, input, wrongMark, wrongNote }, ci) => {
          input.checked = node.connected.includes(ci);
          const locked = input.checked || isDone(node) || state.phase !== "assembling";
          input.setAttribute("aria-readonly", String(locked));
          cell.classList.toggle("table-connected", input.checked);
          cell.classList.toggle("table-locked", locked);
          const key = choiceKey(node, ci);
          const incorrect = cellPulses.get(key)?.tone === "incorrect";
          const marked = !input.checked && remember.checked && remembered.has(key);
          cell.classList.toggle("table-cell-incorrect", incorrect);
          cell.classList.toggle("table-cell-connected-pulse", cellPulses.get(key)?.tone === "connected");
          cell.classList.toggle("table-tried-wrong", marked);
          wrongMark.hidden = !marked || incorrect;
          wrongNote.hidden = !marked;
          if (marked) input.setAttribute("aria-describedby", wrongNote.id);
          else input.removeAttribute("aria-describedby");
          input.title = input.checked ? seed ? "Starting clue" : "Connected"
            : marked ? "Previously tried: this term does not belong to this cluster"
              : locked ? "No connection" : "Connect to this cluster";
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
    state.stopRenderer = () => {
      resizeObserver.disconnect();
      cellPulses.forEach(({ timer }) => clearTimeout(timer));
      cellPulses.clear();
      container.replaceChildren();
    };
    paint();
  }

  return { buildTable };
}
