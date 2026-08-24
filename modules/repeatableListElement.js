// Light-DOM custom element for add/remove rows on /admin/drafts.
// The server already renders a complete POST form (including one empty
// row), so save works without JavaScript. This definition only clones
// the template to add rows and clears or removes a row on Remove.
// Pattern borrowed from the common HTML form-repeater (template + clone);
// we keep light DOM so fields stay in the native form, unlike shadow-DOM
// repeaters such as form-repeatable.

export const REPEATABLE_LIST_TAG = "repeatable-list";

export const REPEATABLE_LIST_ELEMENT_SCRIPT = `(function () {
  class RepeatableList extends HTMLElement {
    connectedCallback() {
      this.addEventListener("click", (event) => {
        const add = event.target.closest("[data-add-row]");
        const remove = event.target.closest("[data-remove-row]");
        if (add && this.contains(add)) {
          event.preventDefault();
          this.addRow();
        } else if (remove && this.contains(remove)) {
          event.preventDefault();
          this.removeRow(remove.closest("[data-row]"));
        }
      });
    }
    addRow() {
      const template = this.querySelector("template");
      const list = this.querySelector("[data-rows]");
      if (!template || !list) return;
      list.appendChild(template.content.cloneNode(true));
      const row = list.querySelector("[data-row]:last-of-type");
      const control = row && row.querySelector("input, textarea");
      if (control) control.focus();
    }
    removeRow(row) {
      if (!row || !this.contains(row)) return;
      const list = this.querySelector("[data-rows]");
      const rows = list ? list.querySelectorAll("[data-row]") : [];
      if (rows.length <= 1) {
        row.querySelectorAll("input, textarea").forEach((el) => { el.value = ""; });
        const control = row.querySelector("input, textarea");
        if (control) control.focus();
        return;
      }
      row.remove();
    }
  }
  if (!customElements.get("${REPEATABLE_LIST_TAG}")) {
    customElements.define("${REPEATABLE_LIST_TAG}", RepeatableList);
  }
})();`;

export default REPEATABLE_LIST_ELEMENT_SCRIPT;
