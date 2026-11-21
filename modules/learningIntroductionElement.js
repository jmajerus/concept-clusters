import {
  hasEmbeddedLearningContent,
  loadLearningIntroduction,
  normalizedLearningArticle
} from "./learningIntroduction.js";
import { resolveLessonByline } from "./authoringProvenance.js";
import { resolvePuzzleResourceUrl } from "./puzzleManifest.js";
import { renderSafeMarkdown } from "./safeMarkdown.js";
import { authoredLearningLinks, formatCitation, linkLabel, resolveLink } from "./termInfo.js";
import { lessonPublicationLine } from "./playerFacingRevision.js";

const TAG_NAME = "cc-learning-introduction";

function safeExternalUrl(raw) {
  try {
    const url = new URL(raw);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function publicationLine(about) {
  return lessonPublicationLine(about);
}

function aboutEyebrow(about) {
  return [about?.category, ...(about?.catalogues || [])].filter(Boolean).join(" · ");
}

// The About card's summary is the puzzle's own info.text. Without one, a
// purely mechanical line -- never generated prose, and never the cluster
// facts, which are the reveal a completed board earns.
function aboutSummary(puzzle, about) {
  const text = typeof puzzle?.info?.text === "string"
    ? puzzle.info.text.trim()
    : typeof puzzle?.info === "string" ? puzzle.info.trim() : "";
  if (text) return text;
  const count = about?.termCount;
  const category = about?.category ? `${about.category} puzzle` : "puzzle";
  return count ? `A ${category} with ${count} terms.` : `A ${category}.`;
}

class LearningIntroductionElement extends HTMLElement {
  #model = null;
  #loaded = null;
  #loading = null;
  #articleOpened = false;
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
        button, .button-link {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--rule);
          border-radius: 8px;
          padding: 7px 12px;
          color: var(--ink);
          background: var(--panel);
          text-decoration: none;
          cursor: pointer;
        }
        button.primary, .button-link.primary {
          border-color: var(--cyan);
          color: var(--cyan);
          font-weight: 700;
        }
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
        .lesson .lesson-block-epigraph { margin: 4px 0 22px 18%; text-align: right; }
        .lesson .lesson-block-epigraph blockquote {
          margin: 0;
          padding: 0;
          border: 0;
          background: none;
          font-style: italic;
        }
        .lesson .lesson-block-epigraph blockquote p { margin: 0 0 6px; }
        .lesson .lesson-block-epigraph figcaption { font-size: 14px; }
        .lesson aside.lesson-block {
          --block: var(--amber);
          --block-bg: var(--amber-bg);
          margin: 16px 0;
          padding: 9px 14px 4px;
          border-left: 4px solid var(--block);
          border-radius: 0 8px 8px 0;
          background: var(--block-bg);
        }
        .lesson aside.lesson-block-definition {
          --block: var(--success);
          --block-bg: var(--success-bg);
        }
        .lesson aside.lesson-block-example {
          --block: var(--blue);
          --block-bg: var(--blue-bg);
        }
        .lesson .lesson-block-label {
          margin: 0 0 2px;
          color: var(--block);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .lesson aside.lesson-block > :last-child { margin-bottom: 8px; }
        .article-callout {
          margin-top: 18px;
          padding: 13px 15px;
          border: 1px solid var(--cyan-line);
          border-left: 4px solid var(--cyan);
          border-radius: var(--radius);
          background: var(--cyan-bg);
        }
        .article-callout h3 {
          margin: 3px 0 0;
          font-family: var(--font-display);
          font-size: 18px;
          line-height: 1.3;
        }
        .article-callout a {
          color: var(--ink);
          text-decoration: underline;
          text-decoration-color: var(--cyan);
          text-underline-offset: 2px;
        }
        .article-callout p {
          margin: 6px 0 0;
          color: var(--ink-soft);
          font-size: 14px;
          line-height: 1.45;
        }
        .sources { margin-top: 20px; padding-top: 12px; border-top: 1px solid var(--rule); }
        .sources h3 { margin: 0 0 5px; font-size: 14px; }
        .sources ul { margin: 0; padding-left: 20px; }
        .sources a { color: var(--blue); }
        .citations-block {
          margin-top: 20px;
          padding-top: 12px;
          border-top: 1px solid var(--rule);
        }
        .citations-block h3 { margin: 0 0 5px; font-size: 14px; }
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
          <a id="read-article" class="button-link primary" hidden target="_blank" rel="noopener noreferrer">Read essay ↗</a>
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
          <section id="article-callout" class="article-callout" aria-labelledby="article-callout-heading" hidden>
            <div id="article-callout-meta" class="meta"></div>
            <h3 id="article-callout-heading">
              <a id="article-callout-link" target="_blank" rel="noopener noreferrer"></a>
            </h3>
            <p id="article-callout-summary" hidden></p>
          </section>
          <section id="sources" class="sources" aria-labelledby="sources-title">
            <h3 id="sources-title">Further reading</h3>
            <ul id="source-list"></ul>
          </section>
          <section id="citations" class="citations-block" aria-labelledby="citations-title" hidden>
            <h3 id="citations-title">References</h3>
            <ul id="citation-list" class="citations"></ul>
          </section>
          <p id="assistance" class="assistance-credit" hidden></p>
          <p id="published" class="assistance-credit" hidden></p>
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
    root.getElementById("read-article").addEventListener("click", () => {
      this.#articleOpened = true;
      if (this.#model?.introduction) this.#emitStatus("read");
    });
    root.getElementById("article-callout-link").addEventListener("click", () => {
      this.#articleOpened = true;
      if (this.#model?.introduction && !hasEmbeddedLearningContent(this.#model.introduction)) {
        this.#emitStatus("read");
      }
    });
    root.getElementById("skip").addEventListener("click", () =>
      this.#emitStatus("skipped")
    );
    root.getElementById("finish").addEventListener("click", () => {
      const hasEmbedded = hasEmbeddedLearningContent(this.#model?.introduction);
      const status = (hasEmbedded ? this.#loaded : this.#articleOpened) ? "read" : "skipped";
      this.closeLesson();
      if (this.#model?.introduction) this.#emitStatus(status);
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
    this.#render();
    const dialog = this.shadowRoot.getElementById("dialog");
    if (!dialog.open) dialog.showModal();
    if (this.#model.introduction) {
      if (!hasEmbeddedLearningContent(this.#model.introduction)) {
        this.#paintStandaloneArticle();
      } else if (this.#loaded) {
        this.#paintLoaded();
      } else if (!this.#loading) {
        await this.#load();
      }
    }
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
    this.#articleOpened = false;
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

  #metaText(introduction, { articleOnly = false, article = null } = {}) {
    const requirement = introduction.requirement === "required"
      ? "Required"
      : introduction.requirement === "recommended"
        ? "Recommended"
        : "Optional";
    const minutes = introduction.estimatedMinutes ?? (articleOnly ? article?.estimatedMinutes : undefined);
    const parts = [requirement];
    if (articleOnly) parts.push("Essay");
    if (minutes) parts.push(`About ${minutes} min`);
    return parts.join(" · ");
  }

  #render() {
    if (!this.isConnected || !this.#model) return;
    const { introduction, puzzle } = this.#model;
    const root = this.shadowRoot;
    if (introduction) this.#renderLesson();
    else this.#renderAbout();
    const published = publicationLine(this.#model.about);
    const publishedLine = root.getElementById("published");
    publishedLine.textContent = published;
    publishedLine.hidden = !published;
    this.#renderCitations(
      Array.isArray(puzzle?.info?.citations)
        ? puzzle.info.citations
        : (introduction?.citations || [])
    );
    this.#renderAssistance(introduction, puzzle);
  }

  #renderLesson() {
    const { introduction, gate } = this.#model;
    const root = this.shadowRoot;
    const hasEmbedded = hasEmbeddedLearningContent(introduction);
    const article = normalizedLearningArticle(introduction);
    const articleHref = article ? safeExternalUrl(article.url) : null;
    const articleOnly = !hasEmbedded && !!articleHref;
    const meta = this.#metaText(introduction, { articleOnly, article });

    this.toggleAttribute("gated", gate);
    root.getElementById("offer").hidden = !gate;
    root.getElementById("offer-meta").textContent = meta;
    root.getElementById("dialog-meta").textContent = meta;
    root.getElementById("offer-title").textContent = introduction.title;
    root.getElementById("dialog-title").textContent = introduction.title;
    root.getElementById("offer-summary").textContent = introduction.summary ||
      article?.summary ||
      (articleOnly
        ? "Read the companion essay before you begin, or start the puzzle now."
        : "A short orientation before you begin.");

    const readBtn = root.getElementById("read");
    const readArticleLink = root.getElementById("read-article");
    if (articleOnly) {
      readBtn.hidden = true;
      readArticleLink.hidden = false;
      readArticleLink.href = articleHref;
    } else {
      readBtn.hidden = false;
      readArticleLink.hidden = true;
      readArticleLink.removeAttribute("href");
    }

    root.getElementById("skip").hidden = hasEmbedded && introduction.requirement === "required";
    root.getElementById("finish").textContent = gate ? "Start puzzle" : "Return to puzzle";
    root.getElementById("close").setAttribute("aria-label", "Close introduction");
    root.getElementById("lesson-status").hidden = !hasEmbedded || !!this.#loaded;

    this.#renderArticleCallout(introduction, article, articleHref, hasEmbedded);
    this.#renderSources(authoredLearningLinks(introduction), articleHref);
  }

  #renderArticleCallout(introduction, article, articleHref, hasEmbedded) {
    const root = this.shadowRoot;
    const callout = root.getElementById("article-callout");
    if (!article || !articleHref) {
      callout.hidden = true;
      return;
    }
    const metaEl = root.getElementById("article-callout-meta");
    const linkEl = root.getElementById("article-callout-link");
    const summaryEl = root.getElementById("article-callout-summary");
    const labelParts = [hasEmbedded ? "Expanded lesson" : "Full essay"];
    if (article.estimatedMinutes) labelParts.push(`About ${article.estimatedMinutes} min`);
    metaEl.textContent = labelParts.join(" · ");

    const title = article.title ||
      (hasEmbedded ? "Read the full essay" : (introduction.title || linkLabel(articleHref)));
    linkEl.href = articleHref;
    linkEl.textContent = `${title} ↗`;

    const summary = article.summary &&
      (hasEmbedded || article.summary !== introduction.summary)
      ? article.summary
      : "";
    summaryEl.textContent = summary;
    summaryEl.hidden = !summary;
    callout.hidden = false;
  }

  #paintStandaloneArticle() {
    if (!this.shadowRoot || !this.#model?.introduction) return;
    const root = this.shadowRoot;
    const lesson = root.getElementById("lesson");
    const status = root.getElementById("lesson-status");
    const finish = root.getElementById("finish");
    const { introduction } = this.#model;
    lesson.replaceChildren();
    if (introduction.summary) {
      const paragraph = document.createElement("p");
      paragraph.textContent = introduction.summary;
      lesson.appendChild(paragraph);
    }
    status.hidden = true;
    finish.hidden = false;
    finish.textContent = this.#model.gate ? "Start puzzle" : "Return to puzzle";
  }

  // No authored lesson: the same dialog as a catalogue card -- summary,
  // sources, byline, date. Never gates, never loads, and lists nothing the
  // board has not already shown.
  #renderAbout() {
    const { puzzle, about } = this.#model;
    const root = this.shadowRoot;
    this.toggleAttribute("gated", false);
    root.getElementById("offer").hidden = true;
    root.getElementById("article-callout").hidden = true;
    root.getElementById("dialog-meta").textContent = aboutEyebrow(about);
    root.getElementById("dialog-title").textContent = puzzle?.title || "";
    root.getElementById("close").setAttribute("aria-label", "Close");
    root.getElementById("lesson-status").hidden = true;
    const summary = document.createElement("p");
    summary.textContent = aboutSummary(puzzle, about);
    root.getElementById("lesson").replaceChildren(summary);
    const finish = root.getElementById("finish");
    finish.textContent = "Return to puzzle";
    finish.hidden = false;
    this.#renderSources(authoredLearningLinks(puzzle?.info));
  }

  #renderSources(sources, excludeHref = null) {
    const root = this.shadowRoot;
    const section = root.getElementById("sources");
    const list = root.getElementById("source-list");
    list.replaceChildren();
    sources.forEach(source => {
      const href = safeExternalUrl(resolveLink(source.href) || source.href);
      if (!href || href === excludeHref) return;
      const item = document.createElement("li");
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.textContent = source.label || linkLabel(href);
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      item.appendChild(anchor);
      list.appendChild(item);
    });
    section.hidden = !list.childElementCount;
  }

  #renderCitations(citations) {
    const root = this.shadowRoot;
    const section = root.getElementById("citations");
    const list = root.getElementById("citation-list");
    list.replaceChildren();
    if (!citations.length) {
      section.hidden = true;
      return;
    }
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
    section.hidden = !list.childElementCount;
  }

  #renderAssistance(introduction, puzzle) {
    const line = this.shadowRoot.getElementById("assistance");
    const text = resolveLessonByline({
      introduction,
      provenance: puzzle?.provenance
    });
    line.textContent = text || "";
    line.hidden = !text;
  }

  #paintLoaded() {
    if (!this.#loaded || !this.shadowRoot || !this.#model) return;
    const root = this.shadowRoot;
    const lesson = root.getElementById("lesson");
    const status = root.getElementById("lesson-status");
    const finish = root.getElementById("finish");
    const options = {
      baseUrl: this.#loaded.baseUrl,
      resolveAssetUrl: src =>
        resolvePuzzleResourceUrl(this.#model.puzzle, src, this.#loaded.baseUrl).href
    };
    lesson.replaceChildren(renderSafeMarkdown(this.#loaded.markdown, options));
    status.hidden = true;
    finish.hidden = false;
    finish.textContent = this.#model.gate ? "Start puzzle" : "Return to puzzle";
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
      this.#paintLoaded();
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
