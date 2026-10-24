// What happened to each inline citation in the Zotero pilot, for the draft
// review page: linked to a Zotero item (through the backfill's work record),
// a scholarly work not yet in Zotero, or a citation that stays inline by
// rule (citationWorkKey.js). Read-only: Postgres only, never Zotero.

import { classifyCitation } from "./citationWorkKey.js";

// "user:827407" -> links to the item in the desktop app and the web library.
export function zoteroItemLinks(library, itemKey) {
  const [type, id] = String(library || "").split(":");
  if (!itemKey || !id) return null;
  return type === "group"
    ? { desktop: `zotero://select/groups/${id}/items/${itemKey}`, web: `https://www.zotero.org/groups/${id}/items/${itemKey}` }
    : { desktop: `zotero://select/library/items/${itemKey}`, web: `https://www.zotero.org/users/${id}/items/${itemKey}` };
}

/**
 * @returns {Array<{ state: "zotero", itemKey: string, citekey: string | null, itemType: string | null,
 *     links: { desktop: string, web: string } | null }
 *   | { state: "unfiled" } | { state: "inline", reason: string }>}
 */
export function citationStatusesFrom(citations, { workItems, sources }) {
  return (Array.isArray(citations) ? citations : []).map(citation => {
    const work = classifyCitation(citation);
    if (!work.scholarly) {
      return { state: "inline", reason: work.host ? `${work.host}: ${work.reason}` : work.reason };
    }
    const row = workItems.get(work.workKey);
    if (!row) return { state: "unfiled" };
    const source = sources.get(`${row.zotero_library}/${row.zotero_item_key}`);
    return {
      state: "zotero",
      itemKey: row.zotero_item_key,
      citekey: source?.citekey || null,
      itemType: source?.itemType || null,
      links: zoteroItemLinks(row.zotero_library, row.zotero_item_key)
    };
  });
}

export function createCitationSourceStatus(pool) {
  return {
    async statusesFor(citations) {
      const keys = (Array.isArray(citations) ? citations : [])
        .map(citation => classifyCitation(citation))
        .filter(work => work.scholarly)
        .map(work => work.workKey);
      const workItems = new Map();
      const sources = new Map();
      if (keys.length) {
        const works = await pool.query(
          "SELECT * FROM citation_work_items WHERE work_key = ANY($1::text[])", [keys]
        );
        for (const row of works.rows) workItems.set(row.work_key, row);
        const itemKeys = works.rows.map(row => row.zotero_item_key);
        if (itemKeys.length) {
          // The mirror is filled by authoring:citations:sync-zotero once
          // Better BibTeX has assigned citekeys; until then items show
          // without a citekey.
          const mirrored = await pool.query(`
            SELECT s.zotero_library, s.zotero_item_key, s.citekey, r.metadata_json
            FROM citation_sources s
            JOIN citation_source_revisions r ON r.source_id = s.id AND r.revision = s.current_revision
            WHERE s.zotero_item_key = ANY($1::text[])
          `, [itemKeys]);
          for (const row of mirrored.rows) {
            sources.set(`${row.zotero_library}/${row.zotero_item_key}`, {
              citekey: row.citekey,
              itemType: JSON.parse(row.metadata_json).itemType || null
            });
          }
        }
      }
      return citationStatusesFrom(citations, { workItems, sources });
    }
  };
}
