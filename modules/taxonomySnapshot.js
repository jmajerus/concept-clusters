// The published taxonomy as a corpus-vocabulary/1 file, the tag vocabulary
// corpus-mcp loads (its README, "Categories"). Term ids nest with ".":
// domain, domain.category, domain.category.subcategory. Domains only group,
// except one that is also a domainless category of the same slug
// (interdisciplinary-studies): that is a single assignable term whose
// children are its domain's categories and its own subcategories.

import { DOMAINS } from "../puzzles/domains.js";
import { nonCryptographicHash } from "./nonCryptographicHash.js";

const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function taxonomyVocabulary(registry, { generatedAt = new Date().toISOString() } = {}) {
  const problems = [];
  const terms = new Map();
  const add = (segment, label, parent, extra = {}) => {
    const id = parent ? `${parent}.${segment}` : segment;
    if (!SEGMENT.test(String(segment))) problems.push(`${id}: id segment must be lowercase letters, digits, and single hyphens`);
    if (/[.›]/.test(String(label))) problems.push(`${id}: label "${label}" may not contain "." or "›"`);
    if (terms.has(id)) problems.push(`${id}: two terms share this id`);
    terms.set(id, { id, label, ...(parent ? { parent } : {}), ...extra });
    return id;
  };
  const categories = Object.entries(registry)
    .filter(([, category]) => category.registered)
    .sort(([left], [right]) => left.localeCompare(right));
  const domainless = new Map(categories
    .filter(([, category]) => !DOMAINS[category.domain])
    .map(([name, category]) => [category.slug, { name, category }]));
  const addSubcategories = (category, parent) => {
    Object.entries(category.subcategories || {})
      .sort(([, left], [, right]) => left.title.localeCompare(right.title))
      .forEach(([id, subcategory]) => add(id, subcategory.title, parent));
  };
  for (const [slug, domain] of Object.entries(DOMAINS).sort(([, left], [, right]) => left.title.localeCompare(right.title))) {
    const merged = domainless.get(slug);
    add(slug, domain.title, null, merged ? {} : { assignable: false });
    if (merged) {
      addSubcategories(merged.category, slug);
      domainless.delete(slug);
    }
  }
  for (const [name, category] of categories) {
    if (domainless.has(category.slug)) {
      addSubcategories(category, add(category.slug, name, null));
    } else if (DOMAINS[category.domain]) {
      addSubcategories(category, add(category.slug, name, category.domain));
    }
  }
  if (problems.length) throw new Error(`The taxonomy is not a valid vocabulary:\n${problems.join("\n")}`);
  const list = [...terms.values()];
  return {
    format: "corpus-vocabulary/1",
    // Changes exactly when a term does, so an unchanged taxonomy re-exports as the same version.
    version: nonCryptographicHash(JSON.stringify(list)),
    generatedAt,
    terms: list,
    // Kept by hand until Concept Clusters records subcategory id changes.
    retired: []
  };
}
