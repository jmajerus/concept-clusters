import assert from "node:assert/strict";

globalThis.__CC_BOOT_TEST__ = true;

const {
  bootFailureCopy,
  bootGame,
  failedModuleHint,
  renderBootFailure,
  showBootFailure
} = await import("../modules/boot.js");

export const name = "boot: load-failure landing copy instead of empty board";

function fakeDocument() {
  const body = {
    classList: {
      _set: new Set(["booting"]),
      add(name) { this._set.add(name); },
      remove(name) { this._set.delete(name); },
      contains(name) { return this._set.has(name); }
    }
  };
  const bootFailure = {
    hidden: true,
    innerHTML: "",
    textContent: ""
  };
  Object.defineProperty(bootFailure, "innerHTML", {
    get() { return this._html || ""; },
    set(value) {
      this._html = String(value);
      this.textContent = this._html.replace(/<[^>]+>/g, " ");
    }
  });
  return {
    body,
    getElementById(id) {
      return id === "boot-failure" ? bootFailure : null;
    },
    _bootFailure: bootFailure
  };
}

export async function run() {
  assert.equal(
    failedModuleHint(new Error(
      "Failed to fetch dynamically imported module: https://example.com/puzzles/physics/new-thing.js"
    )),
    "puzzles/physics/new-thing.js"
  );
  assert.equal(failedModuleHint(new Error("boom")), null);

  const copy = bootFailureCopy(new Error(
    "Failed to fetch dynamically imported module: /puzzles/index.js"
  ));
  assert.match(copy.title, /couldn’t load|couldn't load/i);
  assert.match(copy.body, /incomplete|deploy/i);
  assert.equal(copy.modulePath, "puzzles/index.js");

  const html = renderBootFailure(copy);
  assert.match(html, /role="alert"/);
  assert.match(html, /Missing or broken module/);
  assert.match(html, /puzzles\/index\.js/);
  assert.match(html, /Technical detail/);

  const doc = fakeDocument();
  const failed = await bootGame({
    doc,
    importGame: async () => {
      throw new Error(
        "Failed to fetch dynamically imported module: https://x.test/catalogues/missing.js"
      );
    }
  });
  assert.equal(failed.ok, false);
  assert.equal(doc.body.classList.contains("booting"), false);
  assert.equal(doc.body.classList.contains("boot-failed"), true);
  assert.equal(doc._bootFailure.hidden, false);
  assert.match(doc._bootFailure.textContent, /catalogues\/missing\.js/);

  const okDoc = fakeDocument();
  const ok = await bootGame({
    doc: okDoc,
    importGame: async () => ({})
  });
  assert.equal(ok.ok, true);
  assert.equal(okDoc.body.classList.contains("booting"), false);
  assert.equal(okDoc.body.classList.contains("boot-failed"), false);
  assert.equal(okDoc._bootFailure.hidden, true);

  showBootFailure(doc, new Error("plain failure"));
  assert.match(doc._bootFailure.innerHTML, /plain failure/);
}
