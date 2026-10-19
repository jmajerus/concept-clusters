// The editable model vocabulary used by authoring attribution. Freeze projects
// this D1 list into authoringModelSuggestions.js for local/offline use.

import {
  AUTHORING_MODEL_SUGGESTIONS,
  modelToHostSlug
} from "./authoringModelSuggestions.js";

export class D1ModelSuggestionRepository {
  constructor(database) {
    if (!database) throw new Error("A D1 database binding is required");
    this.database = database;
  }

  async list() {
    const { results } = await this.database.prepare(
      "SELECT label FROM authoring_model_suggestions ORDER BY created_at ASC, label ASC"
    ).all();
    return (results || []).map(row => row.label);
  }

  async hasCompleteCatalog() {
    try {
      const row = await this.database.prepare(`
        SELECT version
        FROM authoring_model_suggestion_catalog
        WHERE id = 1
      `).first();
      return Number(row?.version) >= 1;
    } catch (error) {
      if (/no such table/i.test(error instanceof Error ? error.message : String(error))) {
        return false;
      }
      throw error;
    }
  }

  async listForRuntime() {
    const labels = await this.list();
    if (await this.hasCompleteCatalog()) return labels;

    // Compatibility for databases that have the original additive-only
    // table but have not applied the migration that seeds the full catalog.
    const merged = new Map(AUTHORING_MODEL_SUGGESTIONS
      .filter(label => !["auto", "custom model"].includes(label.toLowerCase()))
      .map(label => [modelToHostSlug(label), label]));
    for (const label of labels) {
      const slug = modelToHostSlug(label);
      if (slug) merged.set(slug, label);
    }
    return [...merged.values()];
  }

  async listForFreeze() {
    if (!await this.hasCompleteCatalog()) return null;
    return this.list();
  }

  async add(label, { createdBy = null } = {}) {
    const trimmed = typeof label === "string" ? label.trim() : "";
    if (!trimmed) throw new Error("label is required");
    const slug = modelToHostSlug(trimmed);
    if (["auto", "custom-model"].includes(slug)) {
      throw new Error(`"${trimmed}" is a built-in option and cannot be added here`);
    }
    const existing = (await this.list()).find(candidate =>
      modelToHostSlug(candidate) === slug
    );
    if (existing) {
      if (existing !== trimmed) {
        await this.database.prepare(`
          UPDATE authoring_model_suggestions
          SET label = ?, created_by = ?
          WHERE label = ?
        `).bind(trimmed, createdBy, existing).run();
      }
      return trimmed;
    }
    await this.database.prepare(`
      INSERT INTO authoring_model_suggestions (label, created_by, created_at)
      VALUES (?, ?, ?)
      ON CONFLICT(label) DO NOTHING
    `).bind(trimmed, createdBy, new Date().toISOString()).run();
    return trimmed;
  }

  async remove(label) {
    const trimmed = typeof label === "string" ? label.trim() : "";
    if (!trimmed) return;
    await this.database.prepare(
      "DELETE FROM authoring_model_suggestions WHERE label = ?"
    ).bind(trimmed).run();
  }
}
