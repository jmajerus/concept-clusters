// The published taxonomy as plain JSON, for vocabularies kept outside this
// project (corpus-mcp's Calibre tags, written "Domain.Category.Subcategory").
// A name containing the tag separator fails the export instead of silently
// adding a level to every consumer's hierarchy.

import { DOMAINS } from "../puzzles/domains.js";

const byName = (left, right) => left.name.localeCompare(right.name);

export function taxonomySnapshot(registry) {
  const dotted = [];
  const named = (name, where) => {
    if (String(name).includes(".")) dotted.push(where);
    return name;
  };
  const domains = Object.entries(DOMAINS)
    .map(([slug, domain]) => ({ slug, name: named(domain.title, `domain ${slug}`) }))
    .sort(byName);
  const categories = Object.entries(registry)
    .filter(([, category]) => category.registered)
    .map(([name, category]) => ({
      slug: category.slug,
      name: named(name, `category ${category.slug}`),
      // Trivia and Vocabulary belong to no domain.
      domain: DOMAINS[category.domain] ? category.domain : null,
      subcategories: Object.entries(category.subcategories || {})
        .map(([id, subcategory]) => ({ id, title: named(subcategory.title, `subcategory ${category.slug}/${id}`) }))
        .sort((left, right) => left.title.localeCompare(right.title))
    }))
    .sort(byName);
  if (dotted.length) {
    throw new Error(`Taxonomy names may not contain ".", the tag separator: ${dotted.join(", ")}`);
  }
  return { domains, categories };
}
