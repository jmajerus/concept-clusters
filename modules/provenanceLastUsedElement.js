// Light-DOM custom element around the drafting-client rows on /admin/drafts.
// When the working copy is saved it remembers, per drafting client, the
// model / reasoning / switch (and, for Claude, the Claude Code tick) that
// were set, in this browser's localStorage. On a later draft a row whose
// fields are still blank gets a "use last" button that fills them in one
// click. Nothing is pre-selected: provenance posts with every working-copy
// save, so a remembered guess must never reach the document unless the
// editor chose it. A row whose set values disagree with the memory (e.g. a
// model the MCP probe reported) gets no button -- filling blanks next to a
// conflicting fact would credit a combination that never ran. Without
// JavaScript or storage the rows work exactly as before.
//
// The server tags each row with data-host-key (or a host <select> whose
// options carry one) and each control with data-provenance-field. Claude
// rows share one key, "claude": the MCP frame credits every Claude surface
// as Claude, so keying by surface would never match the next draft's row.

export const PROVENANCE_CLIENTS_TAG = "provenance-clients";

export const PROVENANCE_LAST_USED_STORAGE_KEY = "concept-clusters.provenance.lastUsed";

export const PROVENANCE_LAST_USED_SCRIPT = `(function () {
  const STORAGE_KEY = ${JSON.stringify(PROVENANCE_LAST_USED_STORAGE_KEY)};
  const SELECT_FIELDS = ["model", "reasoning", "switch"];

  function readMemory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) { return {}; }
  }
  function writeMemory(memory) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch (e) {}
  }
  function rowHostKey(row) {
    const hostSelect = row.querySelector("[data-provenance-host-select]");
    if (hostSelect) {
      const option = hostSelect.selectedOptions[0];
      return option ? option.getAttribute("data-host-key") || "" : "";
    }
    return row.getAttribute("data-host-key") || "";
  }
  function control(row, field) {
    return row.querySelector('[data-provenance-field="' + field + '"]');
  }
  function optionFor(select, value) {
    const lower = String(value).toLowerCase();
    return Array.from(select.options).find((option) => option.value.toLowerCase() === lower);
  }

  // What one click would change, or null when the memory has nothing to add
  // or contradicts a value already set on the row.
  function plan(row, remembered) {
    if (!remembered) return null;
    const fills = [];
    for (const field of SELECT_FIELDS) {
      const select = control(row, field);
      const value = remembered[field];
      if (!select || !value) continue;
      const current = select.value;
      if (current) {
        if (current.toLowerCase() !== String(value).toLowerCase()) return null;
        continue;
      }
      const option = optionFor(select, value);
      if (option) fills.push(() => { select.value = option.value; });
    }
    const box = control(row, "claudeCode");
    if (box && typeof remembered.claudeCode === "boolean") {
      if (box.checked && !remembered.claudeCode) return null;
      if (!box.checked && remembered.claudeCode) fills.push(() => { box.checked = true; });
    }
    return fills.length ? fills : null;
  }

  function label(row, remembered) {
    const parts = [];
    if (remembered.claudeCode && control(row, "claudeCode")) parts.push("Claude Code");
    for (const field of SELECT_FIELDS) {
      const select = control(row, field);
      const option = select && remembered[field] && optionFor(select, remembered[field]);
      if (option) parts.push(option.textContent.trim());
    }
    return "use last: " + parts.join(" \\u00b7 ");
  }

  class ProvenanceClients extends HTMLElement {
    connectedCallback() {
      this.addEventListener("change", () => this.sync());
      this.addEventListener("click", (event) => {
        const button = event.target.closest("[data-provenance-use-last]");
        if (!button || !this.contains(button)) return;
        event.preventDefault();
        const row = button.closest("[data-provenance-row]");
        const fills = row && plan(row, readMemory()[rowHostKey(row)]);
        if (fills) fills.forEach((fill) => fill());
        this.sync();
      });
      const formId = this.getAttribute("data-form");
      const form = formId && document.getElementById(formId);
      if (form) form.addEventListener("submit", () => this.remember());
      this.sync();
    }
    rows() {
      return Array.from(this.querySelectorAll("[data-provenance-row]"));
    }
    sync() {
      const memory = readMemory();
      for (const row of this.rows()) {
        const button = row.querySelector("[data-provenance-use-last]");
        if (!button) continue;
        const remembered = memory[rowHostKey(row)];
        const fills = plan(row, remembered);
        button.hidden = !fills;
        if (fills) button.textContent = label(row, remembered);
      }
    }
    // A row with nothing set leaves its memory alone; otherwise every field
    // the row offers is recorded as saved, blank included. Fields the row
    // lacks (the add rows have no reasoning) keep their remembered value.
    // A ticked Claude Code box alone is a real edit on a credited row, but
    // not on an add row, which adds nothing without a model.
    remember() {
      const memory = readMemory();
      for (const row of this.rows()) {
        const key = rowHostKey(row);
        if (!key) continue;
        const values = {};
        for (const field of SELECT_FIELDS) {
          const select = control(row, field);
          if (select) values[field] = select.value;
        }
        const box = control(row, "claudeCode");
        const ticked = box && box.checked && !row.hasAttribute("data-provenance-add");
        if (!ticked && !SELECT_FIELDS.some((field) => values[field])) continue;
        if (box) values.claudeCode = box.checked;
        memory[key] = Object.assign({}, memory[key], values);
      }
      writeMemory(memory);
    }
  }
  if (!customElements.get(${JSON.stringify(PROVENANCE_CLIENTS_TAG)})) {
    customElements.define(${JSON.stringify(PROVENANCE_CLIENTS_TAG)}, ProvenanceClients);
  }
})();`;
