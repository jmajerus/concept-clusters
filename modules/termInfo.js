// Normalizes and links the hover/tap info an author can attach to a
// term or bridge (see AUTHORING.md for the authoring-side shape). Pure
// functions over plain data -- no game-state, D3, or DOM dependency.

// Puzzle authors can give termInfo/bridge info either a plain string
// (just the definition — an auto-generated search link is enough) or
// an object with `link`/`extraLink` for the cases that need more:
// `link` replaces the auto search (it would land on the wrong page),
// `extraLink` adds a second, curated link alongside it. Normalizing
// here means every downstream reader can assume the same shape.
// A `link`/`extraLink` value can be a full URL, or the shorthand
// `wiki:Article Title` for a verified Wikipedia article — the common
// case, since that's the same site the auto-generated search already
// points at, and spares an author from hand-typing (and underscoring,
// and encoding) a full URL for it.
export function resolveLink(raw) {
  if (!raw) return null;
  if (raw.startsWith("wiki:")) {
    const title = raw.slice(5).trim().replace(/ /g, "_");
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  }
  return raw;
}

export function normalizeInfo(raw) {
  if (!raw) return null;
  if (typeof raw === "string") return { text: raw, link: null, extraLink: null };
  return { text: raw.text, link: resolveLink(raw.link), extraLink: resolveLink(raw.extraLink) };
}

export function searchLink(word) {
  return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(word)}&go=Go`;
}

// Derived from where a link actually points, not which field it came
// from — link and extraLink used to both just say "Learn more", which
// meant a term with both set (a curated override plus a further
// resource on top of it — a real, documented combination) rendered as
// two indistinguishable "Learn more ↗" links with no way to tell them
// apart. A specific "Wikipedia" label covers the common case (any
// language edition, not just en, in case a full URL is ever authored
// directly instead of the wiki: shorthand) without needing to know
// which field produced it.
export function linkLabel(href) {
  if (/^https:\/\/[a-z]+\.wikipedia\.org\/wiki\/Special:Search/.test(href)) return "Search";
  if (/^https:\/\/[a-z]+\.wikipedia\.org\/wiki\//.test(href)) return "Wikipedia";
  return "Learn more";
}
