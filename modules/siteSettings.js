// Site settings: play settings a person sets once for every puzzle. Public
// play reads them from the publication index and the authoring server from
// its play corpus. The layout view's Site settings card writes them. A
// puzzle's own board flags override them, and a missing row is the
// built-in default.
//
// D1 keeps one row per setting (d1/migrations/0034_site_settings.sql).

import { isLensRevealCue } from "./lensRevealCue.js";

export const SITE_SETTINGS_PATH = "/admin/site-settings.json";

const SITE_SETTINGS = {
  lensRevealCue: {
    valid: isLensRevealCue,
    expected: "none, ripple, spotlight, or both"
  },
  lensRevealHoverPing: {
    valid: value => typeof value === "boolean",
    expected: "true or false"
  }
};

// Keeps only known settings with valid values.
export function normalizeSiteSettings(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(SITE_SETTINGS)
    .filter(([key, { valid }]) => Object.hasOwn(raw, key) && valid(raw[key]))
    .map(([key]) => [key, raw[key]]));
}

// A patch names only the settings it changes; null removes one, so it
// returns to the built-in default.
export function siteSettingsPatchErrors(patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return ["settings must be an object"];
  }
  return Object.entries(patch).flatMap(([key, value]) => {
    const setting = SITE_SETTINGS[key];
    if (!setting) return [`Unknown site setting "${key}"`];
    if (value === null || setting.valid(value)) return [];
    return [`${key} must be ${setting.expected}, or null`];
  });
}

function assertPatch(patch) {
  const errors = siteSettingsPatchErrors(patch);
  if (errors.length) throw new Error(errors.join("; "));
}

export function createD1SiteSettingsStore(database) {
  if (!database) throw new Error("A D1 database binding is required");
  return {
    async read() {
      const { results = [] } = await database.prepare(
        "SELECT key, value_json FROM site_settings"
      ).all();
      const raw = {};
      for (const row of results) {
        try {
          raw[row.key] = JSON.parse(row.value_json);
        } catch {
          // An unreadable row falls back to the default like a missing one.
        }
      }
      return normalizeSiteSettings(raw);
    },
    async update(patch, { actor = null } = {}) {
      assertPatch(patch);
      const now = new Date().toISOString();
      const statements = Object.entries(patch).map(([key, value]) => value === null
        ? database.prepare("DELETE FROM site_settings WHERE key = ?").bind(key)
        : database.prepare(`
            INSERT INTO site_settings (key, value_json, updated_at, updated_by)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
              value_json = excluded.value_json,
              updated_at = excluded.updated_at,
              updated_by = excluded.updated_by
          `).bind(key, JSON.stringify(value), now, actor?.subject || null));
      if (statements.length) await database.batch(statements);
      return this.read();
    }
  };
}

export function createMemorySiteSettingsStore(initial = {}) {
  let settings = normalizeSiteSettings(initial);
  return {
    async read() {
      return { ...settings };
    },
    async update(patch) {
      assertPatch(patch);
      const next = { ...settings };
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) delete next[key];
        else next[key] = value;
      }
      settings = normalizeSiteSettings(next);
      return { ...settings };
    }
  };
}

// Play must never fail over a setting. Before the table exists, or when
// D1 has a hiccup, every setting takes its default.
export async function readSiteSettingsOrDefaults(store) {
  if (!store) return {};
  try {
    return await store.read();
  } catch (error) {
    console.error("Site settings unavailable; using defaults", error);
    return {};
  }
}
