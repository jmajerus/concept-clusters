// The right-click (or long-press, or Menu-key) menu on a cluster's label:
// a Star title, a Graph legend chip, or a Circle cluster. It only appears
// for a player who goes looking, so the board itself carries no cue.
// game.js decides which items apply; this module only shows them, keeps
// focus inside while open, and closes on Escape, an outside press,
// scroll, or resize.

export function createClusterMenu({ items }) {
  const menu = document.createElement("div");
  menu.className = "cluster-menu";
  menu.setAttribute("role", "menu");
  menu.tabIndex = -1;
  menu.hidden = true;
  document.body.append(menu);

  let returnFocus = null;

  function buttons() {
    return [...menu.querySelectorAll("button:not(:disabled)")];
  }

  function close({ restoreFocus = false } = {}) {
    if (menu.hidden) return;
    menu.hidden = true;
    menu.replaceChildren();
    document.removeEventListener("pointerdown", onOutsidePress, true);
    window.removeEventListener("scroll", onDismiss, true);
    window.removeEventListener("resize", onDismiss);
    if (restoreFocus) returnFocus?.focus?.();
    returnFocus = null;
  }

  const onDismiss = () => close();
  function onOutsidePress(event) {
    if (!menu.contains(event.target)) close();
  }

  menu.addEventListener("keydown", event => {
    const list = buttons();
    const at = list.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      close({ restoreFocus: true });
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!list.length) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      list[(at + step + list.length) % list.length].focus();
    } else if (event.key === "Tab") {
      close({ restoreFocus: true });
    }
  });

  // `context` is whatever game.js needs to act on (the cluster index);
  // each item's `enabled(context)` decides whether it can be chosen now.
  function open(context, event, anchor) {
    close();
    returnFocus = anchor || null;
    items.forEach(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "menuitem");
      button.disabled = !item.enabled(context);
      const label = document.createElement("span");
      label.textContent = item.label;
      button.append(label);
      if (item.hint) {
        const hint = document.createElement("span");
        hint.className = "cluster-menu-hint";
        hint.textContent = item.hint;
        button.append(hint);
      }
      button.addEventListener("click", () => {
        close({ restoreFocus: !item.keepsFocus });
        item.run(context);
      });
      menu.append(button);
    });
    menu.hidden = false;

    // A keyboard-opened menu has no pointer position; sit it under the label.
    const rect = anchor?.getBoundingClientRect?.();
    const fromPointer = event && (event.clientX || event.clientY);
    let x = fromPointer ? event.clientX : rect ? rect.left : 0;
    let y = fromPointer ? event.clientY : rect ? rect.bottom : 0;
    const { width, height } = menu.getBoundingClientRect();
    x = Math.max(8, Math.min(x, window.innerWidth - width - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - height - 8));
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    document.addEventListener("pointerdown", onOutsidePress, true);
    window.addEventListener("scroll", onDismiss, true);
    window.addEventListener("resize", onDismiss);
    (buttons()[0] || menu).focus();
  }

  return { open, close };
}
