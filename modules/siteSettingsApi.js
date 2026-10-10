// Browser client for the authoring server's site settings. Public play has
// no writer: it reads the settings from the publication index.
import { SITE_SETTINGS_PATH } from "./siteSettings.js";

// `settings` names only the settings to change; null restores a default.
// Resolves to every setting after the save.
export async function saveSiteSettings({ settings, fetchImpl = fetch }) {
  const response = await fetchImpl(SITE_SETTINGS_PATH, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ settings })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((body.errors || []).join("; ") || body.error || `Site settings save failed (${response.status})`);
  }
  return body.settings || {};
}
