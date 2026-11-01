// Where a cc-subjects term sits in Concept Clusters' three layers, from the
// subscriber's term map (id -> { slug, broader, ... }). Pure, with no
// imports, so the Worker-built MCP server can use it too.

// The Concept Clusters keys a term stands for, from its slug and its
// ancestors' slugs. Null when an ancestor is unknown or the chain loops.
export function keyOf(terms, id) {
  const chain = [];
  let current = id;
  while (current) {
    const term = terms[current];
    if (!term || chain.length > 8) return null;
    chain.unshift(term);
    current = term.broader[0];
  }
  const depth = chain.length - 1;
  const [domain, category, sub] = chain.map(term => term.slug);
  if (depth === 0) return { depth, domain };
  if (depth === 1) return { depth, domain, category };
  if (depth === 2) return { depth, domain, category, sub };
  return { depth };
}
