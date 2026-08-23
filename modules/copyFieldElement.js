// Light-DOM custom element for in-place copy editing on /admin/drafts.
// The server already renders a complete POST form inside <copy-field>, so
// save works without JavaScript. This definition only focuses and resizes
// the control when Edit is opened.

export const COPY_FIELD_TAG = "copy-field";

export const COPY_FIELD_ELEMENT_SCRIPT = `(function () {
  class CopyField extends HTMLElement {
    connectedCallback() {
      const details = this.querySelector("details");
      const control = this.querySelector("textarea, input[type='text']");
      if (!details || !control) return;
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        if (control.tagName === "TEXTAREA") {
          control.style.height = "auto";
          control.style.height = Math.max(72, control.scrollHeight) + "px";
        }
        control.focus();
      });
    }
  }
  if (!customElements.get("${COPY_FIELD_TAG}")) {
    customElements.define("${COPY_FIELD_TAG}", CopyField);
  }
})();`;

export default COPY_FIELD_ELEMENT_SCRIPT;
