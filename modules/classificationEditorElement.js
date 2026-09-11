// Light-DOM custom element for the classification section on /admin/drafts.
// The server renders a subcategory <select> for every registry category
// that defines subcategories, each tagged with its category name; this
// element shows only the ones whose category is the current primary or a
// ticked secondary, and disables the rest so they do not submit. Without
// JavaScript every selector is visible and the server still rejects a
// subcategory whose category is not one of the puzzle's, so save works
// either way -- same light-DOM stance as repeatableListElement.js.

export const CLASSIFICATION_EDITOR_TAG = "classification-editor";

export const CLASSIFICATION_EDITOR_SCRIPT = `(function () {
  class ClassificationEditor extends HTMLElement {
    connectedCallback() {
      this.addEventListener("change", (event) => {
        if (event.target.matches("[data-primary-category], [data-secondary-category]")) {
          this.sync();
        }
      });
      this.sync();
    }
    selectedCategories() {
      const primary = this.querySelector("[data-primary-category]");
      const chosen = new Set(primary && primary.value ? [primary.value] : []);
      this.querySelectorAll("[data-secondary-category]").forEach((box) => {
        if (box.checked) chosen.add(box.value);
      });
      return chosen;
    }
    sync() {
      const chosen = this.selectedCategories();
      const primary = this.querySelector("[data-primary-category]");
      // The primary cannot also be a secondary: grey that box out so the
      // two controls never disagree about what the save will store.
      this.querySelectorAll("[data-secondary-category]").forEach((box) => {
        const isPrimary = !!primary && box.value === primary.value;
        if (isPrimary) box.checked = false;
        box.disabled = isPrimary;
        box.closest("label").classList.toggle("is-primary", isPrimary);
      });
      let visible = 0;
      this.querySelectorAll("[data-subcategory-for]").forEach((row) => {
        const active = chosen.has(row.getAttribute("data-subcategory-for"));
        row.hidden = !active;
        row.querySelectorAll("select, input").forEach((control) => {
          control.disabled = !active;
        });
        if (active) visible += 1;
      });
      const note = this.querySelector("[data-subcategory-note]");
      if (note) note.hidden = visible === 0;
    }
  }
  if (!customElements.get("${CLASSIFICATION_EDITOR_TAG}")) {
    customElements.define("${CLASSIFICATION_EDITOR_TAG}", ClassificationEditor);
  }
})();`;
