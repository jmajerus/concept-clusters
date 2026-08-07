import {
  loadLearningIntroduction
} from "./learningIntroduction.js";
import { formatAssistanceCredit } from "./generativeAssistance.js";
import { resolvePuzzleResourceUrl } from "./puzzleManifest.js";
import { renderSafeMarkdown } from "./safeMarkdown.js";
import { formatCitation } from "./termInfo.js";

const TAG_NAME = "cc-learning-introduction";

function safeExternalUrl(raw) {
  try {
    const url = new URL(raw);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

class LearningIntroductionElement extends HTMLElement {
  #model = null;
  #loaded = null;
  #loading = null;
  #abortController = null;
  #returnFocus = null;
  #initialized = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host { display: contents; color: var(--ink); }
        :host([gated]) { display: block; margin: 10px 0 12px; }
        :host([hidden]), [hidden] { display: none !important; }
        * { box-sizing: border-box; }
        button { font: inherit; }
        .offer {
          padding: 16px 18px;
          border: 1px solid var(--cyan-line);
          border-left: 4px solid var(--cyan);
          border-radius: var(--radius);
          background: var(--cyan-bg);
        }
        .meta {
          color: var(--cyan);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .offer h3 {
          margin: 3px 0 3px;
          font-family: var(--font-display);
          font-size: 21px;
        }
        .offer p { margin: 0; color: var(--ink-soft); }
        .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        button {
          border: 1px solid var(--rule);
          border-radius: 8px;
          padding: 7px 12px;
          color: var(--ink);
          background: var(--panel);
          cursor: pointer;
        }
        button.primary { border-color: var(--cyan); color: var(--cyan); font-weight: 700; }
        dialog {
          width: min(720px, calc(100vw - 28px));
          max-height: min(820px, calc(100vh - 28px));
          padding: 0;
          border: 1px solid var(--rule);
          border-radius: var(--radius);
          color: var(--ink);
          background: var(--panel);
          box-shadow: 0 18px 60px rgb(30 36 51 / 0.24);
          font-family: var(--font-body);
        }
        dialog::backdrop { background: rgb(30 36 51 / 0.38); }
        .dialog-shell { padding: 18px 20px 20px; }
        .dialog-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--rule);
        }
        .dialog-heading h2 {
          margin: 1px 0 0;
          font-family: var(--font-display);
          font-size: 25px;
        }
        .close { min-width: 35px; padding: 3px 8px; font-size: 20px; line-height: 1; }
        .lesson-status { padding: 18px 0; color: var(--ink-soft); }
        .lesson { line-height: 1.55; }
        .lesson h2, .lesson h3, .lesson h4 {
          margin: 20px 0 6px;
          font-family: var(--font-display);
          line-height: 1.25;
        }
        .lesson h2 { font-size: 22px; }
        .lesson h3 { font-size: 19px; }
        .lesson h4 { font-size: 17px; }
        .lesson p { margin: 8px 0 12px; }
        .lesson ul, .lesson ol { margin: 8px 0 14px; padding-left: 24px; }
        .lesson blockquote {
          margin: 16px 0;
          padding: 11px 14px;
          border-left: 4px solid var(--cyan);
          border-radius: 0 8px 8px 0;
          color: var(--ink);
          background: var(--cyan-bg);
        }
        .lesson code { padding: 1px 4px; border-radius: 4px; background: #eef0f4; }
        .lesson pre { overflow: auto; padding: 10px; border-radius: 8px; background: #eef0f4; }
        .lesson pre code { padding: 0; }
        .lesson a { color: var(--blue); }
        .lesson figure { margin: 16px 0; text-align: center; }
        .lesson img { display: block; max-width: 100%; height: auto; margin: 0 auto; border-radius: 8px; }
        .lesson figcaption { margin-top: 5px; color: var(--ink-soft); font-size: 13px; }
        .sources { margin-top: 20px; padding-top: 12px; border-top: 1px solid var(--rule); }
        .sources h3 { margin: 0 0 5px; font-size: 14px; }
        .sources ul { margin: 0; padding-left: 20px; }
        .sources a { color: var(--blue); }
        .citations-block {
          margin-top: 20px;
          padding-top: 12px;
          border-top: 1px solid var(--rule);
        }
        .citations {
          list-style: none;
          margin: 0;
          padding: 0;
          font-style: normal;
          text-align: left;
          font-size: 11.5px;
          line-height: 1.5;
          color: var(--ink-soft);
        }
        .citations li + li { margin-top: 3px; }
        .citations a { color: var(--blue); }
        .assistance-credit {
          margin: 14px 0 0;
          font-size: 11.5px;
          line-height: 1.45;
          color: var(--ink-soft);
        }
        .dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
        @media (max-width: 520px) {
          .offer { padding: 13px 14px; }
          .dialog-shell { padding: 14px; }
        }
      </style>
      <section id="offer" class="offer" aria-labelledby="offer-title">
        <div id="offer-meta" class="meta"></div>
        <h3 id="offer-title"></h3>
        <p id="offer-summary"></p>
        <div class="actions">
          <button id="read" class="primary" type="button">Read introduction</button>
          <button id="skip" type="button">Start puzzle</button>
        </div>
      </section>
      <dialog id="dialog" aria-labelledby="dialog-title">
        <div class="dialog-shell">
          <div class="dialog-heading">
            <div>
              <div id="dialog-meta" class="meta"></div>
              <h2 id="dialog-title"></h2>
            </div>
            <button id="close" class="close" type="button" aria-label="Close introduction">×</button>
          </div>
          <div id="lesson-status" class="lesson-status" role="status"></div>
          <article id="lesson" class="lesson"></article>
          <section id="sources" class="sources" aria-labelledby="sources-title">
            <h3 id="sources-title">Sources and further reading</h3>
            <ul id="source-list"></ul>
          </section>
          <section id="citations" class="citations-block" aria-label="References"></section>
          <p id="assistance" class="assistance-credit" hidden></p>
          <div class="dialog-actions">
            <button id="finish" class="primary" type="button">Start puzzle</button>
          </div>
        </div>
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
    root.getElementById("read").addEventListener("click", event =>
      this.openLesson(event.currentTarget)
    );
    root.getElementById("skip").addEventListener("click", () =>
      this.#emitStatus("skipped")
    );
    root.getElementById("finish").addEventListener("click", () => {
      const status = this.#loaded ? "read" : "skipped";
      this.closeLesson();
      this.#emitStatus(status);
    });
    root.getElementById("close").addEventListener("click", () => this.closeLesson());
    root.getElementById("dialog").addEventListener("close", event => {
      if (event.currentTarget.open) return;
      const target = this.#returnFocus;
      this.#returnFocus = null;
      if (target?.isConnected && target.getClientRects().length) target.focus();
    });
    this.#render();
  }

  set model(value) {
    const previousId = this.#model?.puzzle?.id;
    this.#model = value;
    if (previousId && previousId !== value?.puzzle?.id) this.#resetLoadedContent();
    this.#render();
  }

  get model() {
    return this.#model;
  }

  async openLesson(returnFocus = document.activeElement) {
    if (!this.#model) return false;
    this.#returnFocus = returnFocus;
    const dialog = this.shadowRoot.getElementById("dialog");
    if (!dialog.open) dialog.showModal();
    if (!this.#loaded && !this.#loading) await this.#load();
    return true;
  }

  closeLesson() {
    const dialog = this.shadowRoot?.getElementById("dialog");
    if (dialog?.open) dialog.close();
  }

  #resetLoadedContent() {
    this.#abortController?.abort();
    this.#abortController = null;
    this.#loading = null;
    this.#loaded = null;
    this.closeLesson();
    this.shadowRoot?.getElementById("lesson")?.replaceChildren();
  }

  #emitStatus(status) {
    this.dispatchEvent(new CustomEvent("learning-introduction-status", {
      bubbles: true,
      composed: true,
      detail: { status, puzzleId: this.#model?.puzzle?.id }
    }));
  }

  #metaText(introduction) {
    const requirement = introduction.requirement === "required"
      ? "Required"
      : introduction.requirement === "recommended"
        ? "Recommended"
        : "Optional";
    return introduction.estimatedMinutes
      ? `${requirement} · About ${introduction.estimatedMinutes} min`
      : requirement;
  }

  #render() {
    if (!this.isConnected || !this.#model) return;
    const { introduction, gate } = this.#model;
    const root = this.shadowRoot;
    this.toggleAttribute("gated", gate);
    root.getElementById("offer").hidden = !gate;
    root.getElementById("offer-meta").textContent = this.#metaText(introduction);
    root.getElementById("dialog-meta").textContent = this.#metaText(introduction);
    root.getElementById("offer-title").textContent = introduction.title;
    root.getElementById("dialog-title").textContent = introduction.title;
    root.getElementById("offer-summary").textContent = introduction.summary ||
      "Build the background knowledge for this puzzle without revealing its solution.";
    root.getElementById("skip").hidden = introduction.requirement === "required";
    root.getElementById("finish").textContent = gate ? "Start puzzle" : "Return to puzzle";
    this.#renderSources(introduction.sources || []);
    this.#renderCitations(introduction.citations || []);
    this.#renderAssistance(this.#model.puzzle?.generativeAssistance);
  }

  #renderSources(sources) {
    const root = this.shadowRoot;
    const section = root.getElementById("sources");
    const list = root.getElementById("source-list");
    list.replaceChildren();
    sources.forEach(source => {
      const href = safeExternalUrl(source.href);
      if (!href) return;
      const item = document.createElement("li");
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.textContent = source.label;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      item.appendChild(anchor);
      list.appendChild(item);
    });
    section.hidden = !list.childElementCount;
  }

  #renderCitations(citations) {
    const section = this.shadowRoot.getElementById("citations");
    section.replaceChildren();
    if (!citations.length) {
      section.hidden = true;
      return;
    }
    const list = document.createElement("ul");
    list.className = "citations";
    citations.forEach(citation => {
      const item = document.createElement("li");
      const formatted = formatCitation(citation);
      const href = citation.url ? safeExternalUrl(citation.url) : null;
      if (href) {
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = `${formatted} ↗`;
        item.appendChild(anchor);
      } else {
        item.textContent = formatted;
      }
      list.appendChild(item);
    });
    section.appendChild(list);
    section.hidden = !list.childElementCount;
  }

  #renderAssistance(entries) {
    const line = this.shadowRoot.getElementById("assistance");
    const text = formatAssistanceCredit(entries);
    line.textContent = text || "";
    line.hidden = !text;
  }

  async #load() {
    const modelAtStart = this.#model;
    const root = this.shadowRoot;
    const status = root.getElementById("lesson-status");
    const lesson = root.getElementById("lesson");
    const finish = root.getElementById("finish");
    status.hidden = false;
    status.textContent = "Loading introduction…";
    lesson.replaceChildren();
    finish.textContent = modelAtStart.gate ? "Start puzzle" : "Return to puzzle";
    finish.hidden = true;
    this.#abortController = new AbortController();
    this.#loading = loadLearningIntroduction(modelAtStart.puzzle, {
      signal: this.#abortController.signal
    });
    try {
      const loaded = await this.#loading;
      if (this.#model !== modelAtStart) return;
      this.#loaded = loaded;
      lesson.appendChild(renderSafeMarkdown(loaded.markdown, {
        baseUrl: loaded.baseUrl,
        resolveAssetUrl: src =>
          resolvePuzzleResourceUrl(modelAtStart.puzzle, src, loaded.baseUrl).href
      }));
      status.hidden = true;
      finish.hidden = false;
    } catch (error) {
      if (error.name === "AbortError" || this.#model !== modelAtStart) return;
      status.textContent = `This introduction is temporarily unavailable. ${error.message}`;
      finish.hidden = modelAtStart.introduction.requirement === "required";
      if (!finish.hidden) finish.textContent = "Continue without introduction";
    } finally {
      if (this.#model === modelAtStart) {
        this.#loading = null;
        this.#abortController = null;
      }
    }
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, LearningIntroductionElement);
}

export { LearningIntroductionElement };
