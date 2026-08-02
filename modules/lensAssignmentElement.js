import {
  assignmentTargetMap,
  lensAssignmentSummary,
  lensLabel
} from "./lensEngine.js";
import { lensColorMap } from "./colorPalette.js";

const TAG_NAME = "cc-lens-assignment";

function element(name, className, text) {
  const node = document.createElement(name);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

class LensAssignmentElement extends HTMLElement {
  #model = null;
  #returnFocus = null;
  #activeWord = null;
  #initialized = false;

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host { display: block; margin-top: 12px; color: var(--ink); }
        :host([hidden]) { display: none; }
        * { box-sizing: border-box; }
        button { font: inherit; }
        .panel {
          padding: 12px 14px;
          border: 1px solid var(--rule);
          border-left: 4px solid var(--bridge);
          border-radius: var(--radius);
          background: var(--panel);
        }
        .progress {
          color: var(--bridge);
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .prompt {
          margin: 4px 0 0;
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 600;
        }
        .list { display: grid; gap: 6px; margin-top: 10px; }
        .list[hidden], .actions[hidden] { display: none; }
        .row {
          display: grid;
          grid-template-columns: 24px minmax(0, 1fr) auto;
          align-items: center;
          gap: 8px;
          padding: 6px 7px;
          border-radius: 8px;
          background: #f7f8fa;
        }
        .label { display: block; font-weight: 700; }
        .definition {
          display: block;
          margin-top: 1px;
          color: var(--ink-soft);
          font-size: 12.5px;
          font-weight: 400;
          line-height: 1.3;
        }
        .count {
          color: var(--ink-soft);
          font-size: 12.5px;
          white-space: nowrap;
        }
        .number {
          --lens-tone: var(--ink-soft);
          --lens-tone-bg: #eef0f4;
          display: inline-flex;
          width: 22px;
          height: 22px;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border: 1.5px solid var(--lens-tone);
          border-radius: 50%;
          color: var(--lens-tone);
          background: var(--lens-tone-bg);
          font-size: 12px;
          font-weight: 800;
        }
        .tone-teal { --lens-tone: var(--lens-teal); --lens-tone-bg: var(--lens-teal-bg); }
        .tone-blue { --lens-tone: var(--lens-blue); --lens-tone-bg: var(--lens-blue-bg); }
        .tone-amber { --lens-tone: var(--lens-amber); --lens-tone-bg: var(--lens-amber-bg); }
        .tone-magenta { --lens-tone: var(--lens-magenta); --lens-tone-bg: var(--lens-magenta-bg); }
        .tone-olive { --lens-tone: var(--lens-olive); --lens-tone-bg: var(--lens-olive-bg); }
        .tone-brown { --lens-tone: var(--lens-brown); --lens-tone-bg: var(--lens-brown-bg); }
        .tone-cyan { --lens-tone: var(--lens-cyan); --lens-tone-bg: var(--lens-cyan-bg); }
        .actions { display: flex; gap: 8px; margin-top: 10px; }
        .actions button, dialog button {
          border: 1px solid var(--rule);
          border-radius: 7px;
          padding: 7px 12px;
          color: var(--ink);
          background: var(--panel);
          cursor: pointer;
        }
        .result {
          margin-top: 9px;
          color: var(--ink-soft);
          font-weight: 700;
        }
        .explanation { margin-top: 6px; color: var(--ink-soft); }
        .diagnostics { margin: 8px 0 12px; padding-left: 20px; }
        .explanations { display: grid; gap: 8px; margin-top: 10px; }
        .explanations section {
          padding-left: 10px;
          border-left: 3px solid var(--rule);
        }
        .explanations p { margin: 2px 0 0; }
        .explanations details { margin-top: 5px; }
        .explanations summary {
          color: var(--ink-soft);
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }
        .explanations details ul { margin-top: 5px; padding-left: 20px; }
        dialog {
          width: min(460px, calc(100vw - 28px));
          max-height: min(680px, calc(100vh - 28px));
          padding: 0;
          border: 1px solid var(--rule);
          border-radius: var(--radius);
          color: var(--ink);
          background: var(--panel);
          box-shadow: 0 18px 60px rgb(30 36 51 / 0.22);
          font-family: var(--font-body);
        }
        dialog::backdrop { background: rgb(30 36 51 / 0.34); }
        dialog form { padding: 16px; }
        .dialog-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .dialog-heading h3 {
          margin: 0;
          font-family: var(--font-display);
          font-size: 19px;
        }
        .dialog-heading button {
          min-width: 34px;
          padding: 3px 8px;
          font-size: 20px;
          line-height: 1;
        }
        .context { margin: 5px 0 12px; color: var(--ink-soft); }
        .options { display: grid; gap: 7px; }
        .option {
          display: grid;
          width: 100%;
          grid-template-columns: 24px minmax(0, 1fr);
          align-items: center;
          gap: 9px;
          padding: 8px 10px;
          text-align: left;
        }
        .option[aria-pressed="true"] {
          border-color: var(--ink-soft);
          box-shadow: inset 0 0 0 1px var(--ink-soft);
        }
        .clear { margin-top: 10px; color: var(--ink-soft); background: transparent; }
        @media (max-width: 420px) {
          .row { grid-template-columns: 24px minmax(0, 1fr); }
          .count { grid-column: 2; }
        }
      </style>
      <section class="panel" aria-labelledby="prompt">
        <div id="progress" class="progress"></div>
        <p id="prompt" class="prompt"></p>
        <div id="list" class="list"></div>
        <div id="result" class="result" aria-live="polite"></div>
        <div id="explanation" class="explanation"></div>
        <div id="actions" class="actions">
          <button id="check" type="button">Check assignments</button>
        </div>
      </section>
      <dialog id="dialog" aria-labelledby="dialog-title">
        <form method="dialog">
          <div class="dialog-heading">
            <h3 id="dialog-title">Choose a lens</h3>
            <button value="cancel" aria-label="Close lens chooser">×</button>
          </div>
          <p id="context" class="context"></p>
          <div id="options" class="options"></div>
          <button id="clear" class="clear" type="button">Leave unassigned</button>
        </form>
      </dialog>
    `;
  }

  connectedCallback() {
    if (this.#initialized) {
      this.#render();
      return;
    }
    this.#initialized = true;
    const root = this.shadowRoot;
    root.getElementById("check").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("lens-assignment-check", {
        bubbles: true,
        composed: true
      }));
    });
    root.getElementById("clear").addEventListener("click", () => {
      this.#commitAssignment(null);
    });
    root.getElementById("dialog").addEventListener("close", event => {
      // A rapid reopen can occur before the previous close event reaches
      // this task. Do not let that stale event clear the new choice context
      // or restore focus out from under the newly opened dialog.
      if (event.currentTarget.open) return;
      const target = this.#returnFocus;
      this.#returnFocus = null;
      this.#activeWord = null;
      if (target?.isConnected) target.focus();
    });
    this.#render();
  }

  set model(value) {
    this.#model = value;
    if (value?.phase === "complete") this.closeChooser();
    this.#render();
  }

  get model() {
    return this.#model;
  }

  openChooser(word, returnFocus = document.activeElement) {
    const model = this.#model;
    if (!model || model.phase !== "lens-assigning" ||
        !assignmentTargetMap(model.puzzle).has(word)) {
      return false;
    }
    const root = this.shadowRoot;
    const currentLens = model.puzzle.lenses.find(
      lens => lens.id === model.assignments.get(word)
    );
    this.#activeWord = word;
    this.#returnFocus = returnFocus;
    root.getElementById("dialog-title").textContent = `Choose a lens for “${word}”`;
    root.getElementById("context").textContent = currentLens
      ? `Currently assigned to ${lensLabel(currentLens)}.`
      : "This concept is currently unassigned.";
    const options = root.getElementById("options");
    options.replaceChildren();
    const colors = lensColorMap(model.puzzle);
    model.puzzle.lenses.forEach((lens, index) => {
      const option = element("button", "option");
      option.type = "button";
      option.setAttribute("aria-pressed", String(lens.id === currentLens?.id));
      const number = element("span", `number tone-${colors.get(lens.id)}`, String(index + 1));
      const copy = element("span");
      copy.appendChild(element("span", "label", lensLabel(lens)));
      if (lens.definition) {
        copy.appendChild(element("span", "definition", lens.definition));
      }
      option.append(number, copy);
      option.addEventListener("click", () => this.#commitAssignment(lens.id));
      options.appendChild(option);
    });
    root.getElementById("clear").hidden = !currentLens;
    root.getElementById("dialog").showModal();
    return true;
  }

  closeChooser() {
    const dialog = this.shadowRoot?.getElementById("dialog");
    if (dialog?.open) dialog.close();
  }

  #commitAssignment(lensId) {
    if (!this.#activeWord) return;
    const word = this.#activeWord;
    this.closeChooser();
    this.dispatchEvent(new CustomEvent("lens-assignment-change", {
      bubbles: true,
      composed: true,
      detail: { word, lensId }
    }));
  }

  #render() {
    if (!this.isConnected || !this.#model) return;
    const { puzzle, assignments, phase, result } = this.#model;
    const root = this.shadowRoot;
    const progress = root.getElementById("progress");
    const prompt = root.getElementById("prompt");
    const list = root.getElementById("list");
    const resultEl = root.getElementById("result");
    const explanation = root.getElementById("explanation");
    const actions = root.getElementById("actions");
    list.replaceChildren();
    resultEl.textContent = "";
    explanation.replaceChildren();

    if (phase === "lens-preparing") {
      progress.textContent = "Lens assignment";
      prompt.textContent = "Preparing the completed map…";
      list.hidden = true;
      actions.hidden = true;
      return;
    }

    const revealed = phase === "complete";
    const targetCount = assignmentTargetMap(puzzle).size;
    progress.textContent = revealed
      ? "Lens assignment complete"
      : `${assignments.size} of ${targetCount} concepts assigned`;
    prompt.textContent = revealed
      ? "Review the authored classification and your choices."
      : "Assign any badged concepts you recognize. You may check your work at any time.";
    list.hidden = false;
    actions.hidden = revealed;
    this.#renderLegend(list, revealed);
    if (revealed && result) {
      resultEl.textContent = lensAssignmentSummary(result);
      this.#renderExplanation(explanation, result);
    }
  }

  #renderLegend(container, revealed) {
    const { puzzle, assignments } = this.#model;
    const colors = lensColorMap(puzzle);
    const counts = new Map(puzzle.lenses.map(lens => [lens.id, 0]));
    if (revealed) {
      puzzle.lenses.forEach(lens => counts.set(lens.id, lens.targets.length));
    } else {
      assignments.forEach(lensId => {
        if (counts.has(lensId)) counts.set(lensId, counts.get(lensId) + 1);
      });
    }
    puzzle.lenses.forEach((lens, index) => {
      const row = element("div", "row");
      const number = element("span", `number tone-${colors.get(lens.id)}`, String(index + 1));
      const copy = element("span");
      copy.appendChild(element("span", "label", lensLabel(lens)));
      if (lens.definition) {
        copy.appendChild(element("span", "definition", lens.definition));
      }
      const count = counts.get(lens.id);
      row.append(
        number,
        copy,
        element(
          "span",
          "count",
          revealed
            ? `${count} ${count === 1 ? "concept" : "concepts"}`
            : `${count} assigned`
        )
      );
      container.appendChild(row);
    });
  }

  #renderExplanation(container, result) {
    const { puzzle } = this.#model;
    const lensById = id => puzzle.lenses.find(lens => lens.id === id);
    if (result.incorrect.length || result.unassigned.length) {
      const diagnostics = element("ul", "diagnostics");
      result.incorrect.forEach(item => {
        const selectedLens = lensById(item.selectedLensId);
        const correctLens = lensById(item.correctLensId);
        const reason = correctLens?.reasons?.[item.word];
        const entry = element("li");
        entry.append(
          element("strong", null, `${item.word}: `),
          `you chose ${lensLabel(selectedLens)}; the authored best fit is ${lensLabel(correctLens)}.`,
          ...(reason ? [` ${reason}`] : [])
        );
        diagnostics.appendChild(entry);
      });
      result.unassigned.forEach(item => {
        const correctLens = lensById(item.correctLensId);
        const reason = correctLens?.reasons?.[item.word];
        const entry = element("li");
        entry.append(
          element("strong", null, `${item.word}: `),
          `left unanswered; the authored best fit is ${lensLabel(correctLens)}.`,
          ...(reason ? [` ${reason}`] : [])
        );
        diagnostics.appendChild(entry);
      });
      container.appendChild(diagnostics);
    }

    const explanations = element("div", "explanations");
    puzzle.lenses.forEach((lens, index) => {
      const section = element("section");
      section.append(
        element("strong", null, `${index + 1}. ${lensLabel(lens)}`),
        element("p", null, lens.explanation)
      );
      if (lens.reasons && Object.keys(lens.reasons).length) {
        const details = element("details");
        const summary = element("summary", null, "Why these concepts fit");
        const reasons = element("ul");
        lens.targets.forEach(word => {
          if (!lens.reasons[word]) return;
          const item = element("li");
          item.append(element("strong", null, `${word}: `), lens.reasons[word]);
          reasons.appendChild(item);
        });
        details.append(summary, reasons);
        section.appendChild(details);
      }
      explanations.appendChild(section);
    });
    container.appendChild(explanations);
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, LensAssignmentElement);
}

export { LensAssignmentElement };
