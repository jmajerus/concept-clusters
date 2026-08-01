// Normalizes and links the hover/tap info an author can attach to a
// term or bridge (see docs/INFO-LINKS.md for the authoring-side shape).
// Pure functions over plain data -- no game-state, D3, or DOM dependency.

// Puzzle authors can give termInfo/bridge info either a plain string
// (just the definition — an auto-generated search link is enough) or
// an object with one primary `link` plus an ordered `seeAlso` list.
// `extraLink` remains accepted for backward compatibility and is
// normalized as the first see-also entry. A link value can be a full
// URL, or the shorthand `wiki:Article Title` for a verified Wikipedia
// article.
export function resolveLink(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;
  if (value.startsWith("wiki:")) {
    const title = value.slice(5).trim().replace(/ /g, "_");
    return title
      ? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
      : null;
  }
  return value;
}

function normalizedLabel(raw) {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function normalizeSeeAlsoEntry(raw) {
  if (typeof raw === "string") {
    const href = resolveLink(raw);
    return href ? { href, label: null } : null;
  }
  if (!raw || typeof raw !== "object") return null;
  const href = resolveLink(raw.href);
  return href ? { href, label: normalizedLabel(raw.label) } : null;
}

export function normalizeInfo(raw) {
  if (!raw) return null;
  if (typeof raw === "string") {
    return {
      text: raw,
      link: null,
      linkLabel: null,
      extraLink: null,
      seeAlso: []
    };
  }

  const link = resolveLink(raw.link);
  const seen = new Set(link ? [link] : []);
  const seeAlso = [];
  const add = entry => {
    const normalized = normalizeSeeAlsoEntry(entry);
    if (!normalized || seen.has(normalized.href)) return;
    seen.add(normalized.href);
    seeAlso.push(normalized);
  };

  // Preserve the old second-link position before any newly-authored list.
  add(raw.extraLink);
  if (Array.isArray(raw.seeAlso)) raw.seeAlso.forEach(add);

  return {
    text: typeof raw.text === "string" ? raw.text : null,
    link,
    linkLabel: normalizedLabel(raw.linkLabel),
    // Kept so older downstream code or imported content can still inspect
    // the historical normalized field while renderers use the full list.
    extraLink: seeAlso[0]?.href || null,
    seeAlso
  };
}

export function searchLink(word) {
  return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(word)}&go=Go`;
}

// Derived from where a link actually points, not which field it came
// from. Explicit author labels take precedence in the renderers; this
// remains the useful fallback for shorthand strings and legacy content.
export function linkLabel(href) {
  if (/^https:\/\/[a-z]+\.wikipedia\.org\/wiki\/Special:Search/.test(href)) return "Search";
  if (/^https:\/\/[a-z]+\.wikipedia\.org\/wiki\//.test(href)) return "Wikipedia";
  return "Learn more";
}
