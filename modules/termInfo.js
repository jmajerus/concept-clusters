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

// Unlike seeAlso, a citation has no bare-string shorthand -- there's no
// equivalent of `wiki:Title` for a formal footnote, so it's always a
// structured object, and always needs at least a title to mean
// anything. Everything else (author/publisher/year/pages/url) is
// optional; formatCitation below degrades cleanly when they're absent.
function normalizeCitationEntry(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const title = normalizedLabel(raw.title);
  if (!title) return null;
  return {
    title,
    author: normalizedLabel(raw.author),
    publisher: normalizedLabel(raw.publisher),
    year: normalizedLabel(raw.year),
    pages: normalizedLabel(raw.pages),
    url: resolveLink(raw.url)
  };
}

export function normalizeInfo(raw) {
  if (!raw) return null;
  if (typeof raw === "string") {
    return {
      text: raw,
      link: null,
      linkLabel: null,
      extraLink: null,
      seeAlso: [],
      citations: []
    };
  }

  const link = resolveLink(raw.link);
  const seen = new Map(link ? [[link, null]] : []);
  const seeAlso = [];
  const add = entry => {
    const normalized = normalizeSeeAlsoEntry(entry);
    if (!normalized) return;
    if (seen.has(normalized.href)) {
      const existingIndex = seen.get(normalized.href);
      if (existingIndex !== null &&
          !seeAlso[existingIndex].label &&
          normalized.label) {
        seeAlso[existingIndex].label = normalized.label;
      }
      return;
    }
    seen.set(normalized.href, seeAlso.length);
    seeAlso.push(normalized);
  };

  // Preserve the old second-link position before any newly-authored list.
  // If this is already-normalized input, a matching labeled seeAlso entry
  // upgrades the legacy entry rather than being silently discarded.
  add(raw.extraLink);
  if (Array.isArray(raw.seeAlso)) raw.seeAlso.forEach(add);

  const citations = Array.isArray(raw.citations)
    ? raw.citations.map(normalizeCitationEntry).filter(Boolean)
    : [];

  return {
    text: typeof raw.text === "string" ? raw.text : null,
    link,
    linkLabel: normalizedLabel(raw.linkLabel),
    // Kept so older downstream code or imported content can still inspect
    // the historical normalized field while renderers use the full list.
    extraLink: seeAlso[0]?.href || null,
    seeAlso,
    citations
  };
}

export function searchLink(word) {
  return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(word)}&go=Go`;
}

// Connector bridges are not themselves intended objects of learning in the
// puzzle, even when their labels are concrete or independently searchable.
// Connector info is for a clarifying local description, not a reference link;
// semantic validation rejects authored connector links and citations. This
// function controls the zero-authoring automatic fallback. Defaulting to
// `reference` preserves every existing puzzle that omits termRole.
export function searchLinkForTerm(word, termRole = "reference") {
  return termRole === "connector" ? null : searchLink(word);
}

// Renders a normalized citation as a single formal-footnote-style
// string, e.g. "Carse, James P. Finite and Infinite Games. Free Press,
// 1986." Each present field becomes its own sentence-terminated
// segment; an absent optional field just drops its segment rather than
// leaving a dangling comma or period. publisher/year share one segment
// so a citation with only one of the two still reads cleanly.
function terminate(segment) {
  const trimmed = segment.trim();
  if (!trimmed) return trimmed;
  // Don't double up on punctuation an author already supplied --
  // "Carse, James P." (an abbreviated first name) shouldn't become
  // "Carse, James P..".
  return /[.!?"')\]]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

// A bare page number ("45-47") reads ambiguously next to a year --
// label it "pp." unless the author already wrote their own "p."/"pp."
function formattedPages(pages) {
  return /^pp?\.?\s/i.test(pages) ? pages : `pp. ${pages}`;
}

export function formatCitation(citation) {
  const parts = [];
  if (citation.author) parts.push(terminate(citation.author));
  parts.push(terminate(citation.title));
  const publisherYear = [citation.publisher, citation.year].filter(Boolean).join(", ");
  if (publisherYear) parts.push(terminate(publisherYear));
  if (citation.pages) parts.push(terminate(formattedPages(citation.pages)));
  return parts.join(" ");
}

// Derived from where a link actually points, not which field it came
// from. Explicit author labels take precedence in the renderers; this
// remains the useful fallback for shorthand strings and legacy content.
export function linkLabel(href) {
  if (/^https:\/\/[a-z]+\.wikipedia\.org\/wiki\/Special:Search/.test(href)) return "Search";
  if (/^https:\/\/[a-z]+\.wikipedia\.org\/wiki\//.test(href)) return "Wikipedia";
  return "Learn more";
}
