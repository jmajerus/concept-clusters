// Light-DOM custom element for in-place copy editing on /admin/drafts.
// Fields belong to the page working-copy form (form="draft-working-copy"),
// so Save works without JavaScript. This definition focuses/resizes on
// open, restores published wording into the control, and applies suggested
// credit into the matching input.

export const COPY_FIELD_TAG = "copy-field";

export const COPY_FIELD_ELEMENT_SCRIPT = `(function () {
  function restoreList(field, value) {
    const list = field.querySelector("repeatable-list");
    const template = list && list.querySelector("template");
    const rows = list && list.querySelector("[data-rows]");
    if (!template || !rows) return;
    const items = Array.isArray(value) ? value : [];
    rows.replaceChildren();
    const fill = items.length ? items : [{}];
    for (const item of fill) {
      rows.appendChild(template.content.cloneNode(true));
      const row = rows.querySelector("[data-row]:last-of-type");
      if (!row || !item || typeof item !== "object") continue;
      row.querySelectorAll("[data-row-key]").forEach((input) => {
        const key = input.getAttribute("data-row-key");
        input.value = item[key] == null ? "" : String(item[key]);
      });
    }
  }

  class CopyField extends HTMLElement {
    connectedCallback() {
      const details = this.querySelector("details");
      const control = this.querySelector("[data-copy-control]");
      if (details && control) {
        details.addEventListener("toggle", () => {
          if (!details.open) return;
          if (control.tagName === "TEXTAREA") {
            control.style.height = "auto";
            control.style.height = Math.max(72, control.scrollHeight) + "px";
          }
          control.focus();
        });
      }
      this.addEventListener("click", (event) => {
        const restore = event.target.closest("[data-restore-published]");
        if (!restore || !this.contains(restore)) return;
        event.preventDefault();
        this.restorePublished();
      });
    }
    restorePublished() {
      const raw = this.getAttribute("data-published");
      if (raw == null) return;
      let value;
      try { value = JSON.parse(raw); } catch { return; }
      const kind = this.getAttribute("data-kind") || "text";
      if (kind === "text") {
        const control = this.querySelector("[data-copy-control]");
        if (control) control.value = value == null ? "" : String(value);
        this.querySelector("details")?.setAttribute("open", "");
        return;
      }
      restoreList(this, value);
      this.querySelector("details")?.setAttribute("open", "");
    }
  }
  if (!customElements.get("${COPY_FIELD_TAG}")) {
    customElements.define("${COPY_FIELD_TAG}", CopyField);
  }
  document.addEventListener("click", (event) => {
    const fill = event.target.closest("[data-fill-control]");
    if (!fill) return;
    const el = document.getElementById(fill.getAttribute("data-fill-control"));
    if (!el) return;
    el.value = fill.getAttribute("data-fill-value") || "";
    el.closest("details")?.setAttribute("open", "");
  });
})();`;

export default COPY_FIELD_ELEMENT_SCRIPT;
