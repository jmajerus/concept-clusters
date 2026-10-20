import {
  AUTHORING_MODEL_SUGGESTIONS,
  modelToHostSlug,
  sortModelSuggestionLabels
} from "./authoringModelSuggestions.js";

export class PostgresModelSuggestionRepository {
  constructor(pool) {
    if (!pool) throw new Error("A Postgres pool is required");
    this.pool = pool;
  }

  async list() {
    const { rows } = await this.pool.query(`
      SELECT label FROM authoring_model_suggestions
      ORDER BY lower(label) ASC, label ASC
    `);
    return rows.map(row => row.label);
  }

  async hasCompleteCatalog() {
    return false;
  }

  async listForRuntime() {
    const labels = await this.list();
    const merged = new Map(AUTHORING_MODEL_SUGGESTIONS
      .filter(label => !["auto", "custom model"].includes(label.toLowerCase()))
      .map(label => [modelToHostSlug(label), label]));
    for (const label of labels) {
      const slug = modelToHostSlug(label);
      if (slug) merged.set(slug, label);
    }
    return sortModelSuggestionLabels([...merged.values()]);
  }

  async listForFreeze() {
    return null;
  }

  async add(label, { createdBy = null } = {}) {
    const trimmed = typeof label === "string" ? label.trim() : "";
    if (!trimmed) throw new Error("label is required");
    const slug = modelToHostSlug(trimmed);
    if (["auto", "custom-model"].includes(slug)) {
      throw new Error(`"${trimmed}" is a built-in option and cannot be added here`);
    }
    const existing = (await this.list()).find(candidate => modelToHostSlug(candidate) === slug);
    if (existing) {
      if (existing !== trimmed) {
        await this.pool.query(`
          UPDATE authoring_model_suggestions
          SET label = $1, created_by = $2
          WHERE label = $3
        `, [trimmed, createdBy, existing]);
      }
      return trimmed;
    }
    await this.pool.query(`
      INSERT INTO authoring_model_suggestions (label, created_by, created_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (label) DO NOTHING
    `, [trimmed, createdBy, new Date().toISOString()]);
    return trimmed;
  }

  async remove(label) {
    const trimmed = typeof label === "string" ? label.trim() : "";
    if (!trimmed) return;
    await this.pool.query(
      "DELETE FROM authoring_model_suggestions WHERE label = $1",
      [trimmed]
    );
  }
}
