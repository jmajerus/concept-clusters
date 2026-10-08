// Graph mode's color key. Star and Circle name each cluster on the board
// itself; Graph only colors placed terms, so this strip above the board
// maps each color to its cluster name. Every name shows from the start
// (the same names Star and Circle show), and a cluster's chip fills in
// once all its terms are placed. Hovering or focusing a chip dims every
// term outside that cluster, so the mapping doesn't rest on color alone.
export function createClusterLegend({ container, svg, isDone, isBridge }) {
  let builtFor = null;

  function highlight(ci) {
    svg.selectAll("g.node").style("opacity", ci == null
      ? null
      : d => (d.gs || []).includes(ci) ? null : 0.25);
  }

  // The authoring studio edits clusters in place, so rebuild on any
  // change to the names, colors, or bridge presence, not just a new puzzle.
  function signature(state) {
    return JSON.stringify([
      state.puzzle.clusters.map(c => [c.name, c.color]),
      state.nodes.some(isBridge)
    ]);
  }

  function build(state) {
    const { puzzle, nodes } = state;
    const hasBridges = nodes.some(isBridge);
    container.replaceChildren(...puzzle.clusters.map((c, ci) => {
      const chip = document.createElement("li");
      chip.className = `legend-chip c-${c.color || "teal"}`;
      chip.tabIndex = 0;
      chip.dataset.ci = String(ci);
      const swatch = document.createElement("span");
      swatch.className = "legend-swatch";
      swatch.setAttribute("aria-hidden", "true");
      const name = document.createElement("span");
      name.className = "legend-name";
      name.textContent = c.name;
      chip.append(swatch, name);
      chip.addEventListener("mouseenter", () => highlight(ci));
      chip.addEventListener("mouseleave", () => highlight(null));
      chip.addEventListener("focus", () => highlight(ci));
      chip.addEventListener("blur", () => highlight(null));
      return chip;
    }));
    if (hasBridges) {
      const chip = document.createElement("li");
      chip.className = "legend-chip bridge";
      chip.innerHTML = '<span class="legend-swatch" aria-hidden="true"></span><span class="legend-name">Bridge</span>';
      container.append(chip);
    }
    builtFor = signature(state);
  }

  function update(state) {
    if (!state?.puzzle?.clusters?.length) { hide(); return; }
    if (builtFor !== signature(state)) build(state);
    container.hidden = false;
    container.querySelectorAll(".legend-chip[data-ci]").forEach(chip => {
      const ci = Number(chip.dataset.ci);
      const members = state.nodes.filter(n => !isBridge(n) && n.gs[0] === ci);
      const complete = members.length > 0 && members.every(isDone);
      chip.classList.toggle("complete", complete);
      chip.setAttribute("aria-label",
        `${state.puzzle.clusters[ci].name}${complete ? " (complete)" : ""}`);
    });
  }

  function hide() {
    container.hidden = true;
    container.replaceChildren();
    builtFor = null;
  }

  return { update, hide };
}
