import { TOWARD_BRIDGE } from "./bridgeDirection.js";
import { lensAnswerWords, LENS_FLOW_TRACE_TIMING } from "./lensFlowTrace.js";
import { isLensRevealCue } from "./lensRevealCue.js";

// DOM counterparts of the SVG effects. Each run owns its animations,
// timers, observer, and classes; disposal never completes a cancelled cue.
export function createTableLensEffects({ container, getRows, getState }) {
  const runs = new Map();
  function clear(kind) {
    const run = runs.get(kind);
    if (!run) return;
    runs.delete(kind);
    run.observer?.disconnect();
    run.timers.forEach(clearTimeout);
    run.animations.forEach(animation => animation.cancel());
    run.classes.forEach(([element, name]) => element.classList.remove(name));
  }
  function begin(kind) {
    clear(kind);
    const run = { kind, timers: new Set(), animations: new Set(), classes: [], observer: null };
    runs.set(kind, run);
    return run;
  }
  function later(run, callback, ms) {
    const timer = setTimeout(() => {
      run.timers.delete(timer);
      if (runs.get(run.kind) === run) callback();
    }, ms);
    run.timers.add(timer);
  }
  function mark(run, element, name) {
    element.classList.add(name);
    run.classes.push([element, name]);
  }
  function animate(run, element, frames, options) {
    if (typeof element.animate !== "function") return;
    const animation = element.animate(frames, options);
    run.animations.add(animation);
    animation.finished.then(() => run.animations.delete(animation), () => {});
  }
  function pulse(run, element, { delay = 0, duration = 700, flow = false } = {}) {
    const color = getComputedStyle(element).getPropertyValue(flow ? "--bridge" : "--success").trim();
    animate(run, element, [
      { boxShadow: `inset 0 0 0 0 ${color}`, outlineOffset: "0px" },
      { boxShadow: `inset 0 0 0 3px ${color}`, outlineOffset: "3px", offset: 0.4 },
      { boxShadow: `inset 0 0 0 0 ${color}`, outlineOffset: "0px" }
    ], { duration, delay, easing: "ease-in-out" });
  }
  function whenVisible(run, elements, start) {
    const Observer = globalThis.IntersectionObserver;
    if (typeof Observer !== "function") { start(); return; }
    run.observer = new Observer(entries => {
      if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5)) return;
      run.observer.disconnect();
      run.observer = null;
      if (runs.get(run.kind) === run) start();
    }, { threshold: [0.5] });
    elements.forEach(element => run.observer.observe(element));
  }
  function terms(word) {
    return getRows().filter(entry => entry.node.word === word).map(entry => entry.term);
  }
  function reveal({ cue, targets = [], reducedMotion = false, onDone } = {}) {
    clear("cue");
    clear("trace");
    const answers = targets.map(target => ({ ...target, elements: terms(target.word) })).filter(target => target.elements.length);
    if (!isLensRevealCue(cue) || cue === "none" || !answers.length) { onDone?.(); return; }
    const run = begin("cue");
    whenVisible(run, answers.flatMap(answer => answer.elements), () => {
      const words = new Set(answers.map(answer => answer.word));
      let duration = reducedMotion ? 1200 : 0;
      answers.forEach(answer => answer.elements.forEach(element => mark(run, element, "table-lens-cue-answer")));
      if (cue === "spotlight" || cue === "both") {
        getRows().filter(entry => !words.has(entry.node.word)).forEach(({ row }) => {
          mark(run, row, "table-lens-cue-dimmed");
          if (!reducedMotion) animate(run, row, [{ opacity: 1 }, { opacity: 0.25, offset: 0.12 },
            { opacity: 0.25, offset: 0.7 }, { opacity: 1 }], { duration: 1530 });
        });
        duration = Math.max(duration, 1530);
      }
      if (cue === "ripple" || cue === "both") {
        answers.forEach((answer, index) => answer.elements.forEach(element => {
          if (reducedMotion) { mark(run, element, "table-lens-cue-still"); return; }
          const lead = cue === "both" ? 120 : 0;
          const delay = lead + index * Math.min(70, 560 / Math.max(1, answers.length - 1));
          for (let round = 0; round < (answer.rounds || 1); round++) {
            pulse(run, element, { delay: delay + round * 380 });
          }
          duration = Math.max(duration, delay + ((answer.rounds || 1) - 1) * 380 + 700);
        }));
      }
      later(run, () => { clear("cue"); onDone?.(); }, duration);
    });
  }
  function ping(word, { reducedMotion = false } = {}) {
    const elements = terms(word);
    const run = begin("ping");
    elements.forEach(element => {
      mark(run, element, "table-lens-ping");
      if (reducedMotion) mark(run, element, "table-lens-ping-still");
      else pulse(run, element, { duration: 1200 });
    });
    later(run, () => clear("ping"), 1200);
  }
  function endpoint(bridge, ci) {
    const state = getState();
    const word = bridge.idealTerms?.[(bridge.gs || bridge.clusters).indexOf(ci)];
    const node = state.nodes.find(node => node.word === word && node.connected.includes(ci));
    if (node && node.connected.length === node.gs.length) {
      const entries = getRows().filter(entry => entry.node === node);
      const inCluster = entries.filter(entry => entry.row.closest("tbody").dataset.cluster === String(ci));
      if (entries.length) return (inCluster.length ? inCluster : entries).map(entry => entry.term);
    }
    // A bridge without an authored ideal term points at its cluster title.
    // No undiscovered membership or arbitrary concept is substituted.
    return [...container.querySelectorAll(`tbody[data-cluster="${ci}"] .table-completed-cluster, #table-cluster-${ci} button`)]
      .filter(element => element.getClientRects().length);
  }
  function trace({ legs = [], puzzle, lens, reducedMotion = false, repeats = LENS_FLOW_TRACE_TIMING.repeats } = {}) {
    clear("trace");
    const events = [];
    const { beat, travel, pause } = LENS_FLOW_TRACE_TIMING;
    const bridges = puzzle?.bridges || [];
    legs.forEach(leg => {
      const bridge = bridges.find(bridge => bridge.term === leg.term);
      if (!bridge) return;
      const toward = leg.direction === TOWARD_BRIDGE;
      endpoint(bridge, leg.clusterIndex).forEach(element => events.push({ element, at: leg.beat * beat + (toward ? 0 : travel / 2), sweep: false }));
      terms(leg.term).forEach(element => events.push({ element, at: leg.beat * beat + (toward ? travel / 2 : 0), sweep: true }));
    });
    const answers = new Set(lensAnswerWords(lens));
    bridges.filter(bridge => answers.has(bridge.term) &&
      (!bridge.direction || ["undirected", "bidirectional"].includes(bridge.direction.kind))).forEach(bridge => {
      // Undirected/bidirectional relationships have no one-way sweep.
      const elements = [...terms(bridge.term), ...(bridge.gs || bridge.clusters).flatMap(ci => endpoint(bridge, ci))];
      elements.forEach(element => events.push({ element, at: 0, sweep: false }));
    });
    if (!events.length) return;
    const run = begin("trace");
    const unique = events.filter((event, index) => !events.slice(0, index).some(other =>
      other.element === event.element && other.at === event.at && other.sweep === event.sweep));
    const elements = [...new Set(unique.map(event => event.element))];
    if (reducedMotion) {
      elements.forEach(element => mark(run, element, "table-lens-trace-still"));
      return;
    }
    whenVisible(run, elements, () => {
      const roundMs = (Math.max(0, ...legs.map(leg => leg.beat)) + 1) * beat + pause;
      unique.forEach(event => {
        for (let round = 0; round < repeats; round++) {
          later(run, () => {
            mark(run, event.element, "table-lens-trace-active");
            pulse(run, event.element, { duration: travel, flow: true });
            if (event.sweep) {
              // The background moves under the label without moving its text.
              animate(run, event.element, [{ backgroundPosition: "100% 100%" }, { backgroundPosition: "0% 100%" }],
                { duration: travel, easing: "ease-in-out" });
              mark(run, event.element, "table-lens-trace-sweep");
            }
          }, round * roundMs + event.at);
        }
      });
      later(run, () => clear("trace"), (repeats - 1) * roundMs + Math.max(...unique.map(event => event.at)) + travel);
    });
  }
  return { reveal, ping, trace, clear: () => ["cue", "ping", "trace"].forEach(clear),
    clearTrace: () => clear("trace"), clearCue: () => clear("cue") };
}
