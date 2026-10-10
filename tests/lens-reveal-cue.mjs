import assert from "node:assert/strict";
import {
  globalLensRevealCue,
  lensRevealHoverPingEnabled,
  lensRevealTargets,
  puzzleLensRevealCue,
  resolveLensRevealCue
} from "../modules/lensRevealCue.js";
import {
  createD1SiteSettingsStore,
  createMemorySiteSettingsStore,
  normalizeSiteSettings,
  readSiteSettingsOrDefaults,
  siteSettingsPatchErrors
} from "../modules/siteSettings.js";
import { createSqliteD1 } from "./lib/sqlite-d1.mjs";

export const name = "lens reveal cue: which cue plays, on which pills, and the site settings behind it";

export async function run() {
  resolution();
  targets();
  settingsValidation();
  await memoryStore();
  await d1Store();
  await missingTableFallsBack();
}

function resolution() {
  const ripple = { lensRevealCue: "ripple" };
  const spotlightPuzzle = { board: { lensRevealCue: "spotlight" } };
  assert.equal(resolveLensRevealCue(), "none", "nothing set plays nothing");
  assert.equal(resolveLensRevealCue({ settings: ripple }), "ripple");
  assert.equal(resolveLensRevealCue({ puzzle: spotlightPuzzle, settings: ripple }), "spotlight",
    "a puzzle's own choice beats the site setting");
  assert.equal(resolveLensRevealCue({ puzzle: { board: { lensRevealCue: "none" } }, settings: ripple }), "none",
    "a puzzle can turn the site's cue off");
  assert.equal(resolveLensRevealCue({ puzzle: spotlightPuzzle, settings: ripple, playerPreference: "both" }), "both",
    "the player's preference beats both");
  assert.equal(resolveLensRevealCue({
    puzzle: spotlightPuzzle, settings: ripple, playerPreference: "both", reducedMotion: true
  }), "none", "reduced motion beats everything");
  assert.equal(resolveLensRevealCue({ puzzle: { board: { lensRevealCue: "sparkle" } }, settings: ripple }), "ripple",
    "an unknown puzzle value is ignored");
  assert.equal(puzzleLensRevealCue({}), null);
  assert.equal(globalLensRevealCue({ lensRevealCue: "sparkle" }), "none");
  assert.equal(lensRevealHoverPingEnabled({ lensRevealHoverPing: true }), true);
  assert.equal(lensRevealHoverPingEnabled({}), false);
}

function targets() {
  const lens = { targets: ["alpha", "beta", "alpha"] };
  assert.deepEqual(lensRevealTargets(lens, new Set(["alpha", "stray"])), [
    { word: "alpha", rounds: 1 },
    { word: "beta", rounds: 2 }
  ], "a found answer rings once, a missed one twice");
  assert.deepEqual(lensRevealTargets(lens), [
    { word: "alpha", rounds: 2 },
    { word: "beta", rounds: 2 }
  ], "with no selections every answer is one to find");
  const quiz = {
    options: [
      { label: "Wrong", targets: ["gamma"] },
      { label: "Right", correct: true, targets: ["delta"] }
    ]
  };
  assert.deepEqual(lensRevealTargets(quiz), [{ word: "delta", rounds: 2 }],
    "a quiz points at the correct option's evidence only");
  assert.deepEqual(lensRevealTargets(null), []);
}

function settingsValidation() {
  assert.deepEqual(normalizeSiteSettings({
    lensRevealCue: "both",
    lensRevealHoverPing: "yes",
    unknown: 1
  }), { lensRevealCue: "both" });
  assert.deepEqual(normalizeSiteSettings(null), {});
  assert.deepEqual(siteSettingsPatchErrors({ lensRevealCue: null, lensRevealHoverPing: false }), []);
  assert.equal(siteSettingsPatchErrors({ lensRevealCue: "sparkle" }).length, 1);
  assert.match(siteSettingsPatchErrors({ theme: "dark" })[0], /Unknown site setting "theme"/);
  assert.deepEqual(siteSettingsPatchErrors([]), ["settings must be an object"]);
}

async function memoryStore() {
  const store = createMemorySiteSettingsStore({ lensRevealCue: "ripple" });
  assert.deepEqual(await store.update({ lensRevealHoverPing: true }), {
    lensRevealCue: "ripple",
    lensRevealHoverPing: true
  }, "a patch leaves the other settings alone");
  assert.deepEqual(await store.update({ lensRevealCue: null }), { lensRevealHoverPing: true });
  await assert.rejects(store.update({ lensRevealCue: "sparkle" }), /lensRevealCue must be/);
}

async function d1Store() {
  const database = createSqliteD1();
  const store = createD1SiteSettingsStore(database);
  assert.deepEqual(await store.read(), {});
  const actor = { subject: "human" };
  assert.deepEqual(await store.update({ lensRevealCue: "spotlight", lensRevealHoverPing: true }, { actor }), {
    lensRevealCue: "spotlight",
    lensRevealHoverPing: true
  });
  assert.deepEqual(await store.update({ lensRevealCue: "both" }, { actor }), {
    lensRevealCue: "both",
    lensRevealHoverPing: true
  });
  const row = database.sqlite.prepare(
    "SELECT value_json, updated_by FROM site_settings WHERE key = 'lensRevealCue'"
  ).get();
  assert.deepEqual({ ...row }, { value_json: "\"both\"", updated_by: "human" });
  assert.deepEqual(await store.update({ lensRevealHoverPing: null }), { lensRevealCue: "both" },
    "null deletes the row, so the default returns");
  await assert.rejects(store.update({ lensRevealCue: 3 }), /lensRevealCue must be/);
  // A row nothing understands any more reads as its default.
  database.sqlite.prepare(
    "INSERT INTO site_settings (key, value_json, updated_at) VALUES ('lensRevealHoverPing', 'not json', 'now')"
  ).run();
  assert.deepEqual(await store.read(), { lensRevealCue: "both" });
}

async function missingTableFallsBack() {
  const store = createD1SiteSettingsStore(createSqliteD1({ through: 33 }));
  const errors = [];
  const original = console.error;
  console.error = (...args) => errors.push(args);
  try {
    assert.deepEqual(await readSiteSettingsOrDefaults(store), {},
      "play keeps working before migration 0034 is applied");
  } finally {
    console.error = original;
  }
  assert.equal(errors.length, 1);
  assert.deepEqual(await readSiteSettingsOrDefaults(null), {});
}
