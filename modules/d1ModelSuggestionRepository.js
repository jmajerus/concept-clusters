// Human-curated additions to the drafts-page model dropdown (see
// authoringModelSuggestions.js for the built-in seed list this is additive
// to). One row per label; adding an already-known label is a no-op.

export class D1ModelSuggestionRepository {
  constructor(database) {
    if (!database) throw new Error("A D1 database binding is required");
    this.database = database;
  }

  async list() {
    const { results } = await this.database.prepare(
      "SELECT label FROM authoring_model_suggestions ORDER BY created_at ASC"
    ).all();
    return (results || []).map(row => row.label);
  }

  async add(label, { createdBy = null } = {}) {
    const trimmed = typeof label === "string" ? label.trim() : "";
    if (!trimmed) throw new Error("label is required");
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
