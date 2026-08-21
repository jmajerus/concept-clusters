// Normalizes and links the hover/tap info an author can attach to a
// term or bridge (see docs/INFO-LINKS.md for the authoring-side shape).
// Pure functions over plain data -- no game-state, D3, or DOM dependency.

// Puzzle authors can give termInfo/bridge info either a plain string
// (just the definition) or an object with one primary `link` plus an
// ordered `seeAlso` list. A missing `link` no longer synthesizes a
// Wikipedia search chip.
// `extraLink` remains accepted for backward compatibility and is
// normalized as the first see-also entry. A link value can be a full
// URL, or the shorthand `wiki:Article Title` for a verified Wikipedia
// article. An optional `#Section heading` fragment is preserved as a
// page hash, so a term can land on the heading that applies to it.
export function resolveLink(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;
  if (value.startsWith("wiki:")) {
    const parsed = parseWikiShorthand(value);
    if (!parsed) return null;
    const titlePath = encodeURIComponent(parsed.title.replace(/ /g, "_"));
    const href = `https://en.wikipedia.org/wiki/${titlePath}`;
    if (!parsed.section) return href;
    const fragment = encodeURIComponent(parsed.section.replace(/ /g, "_"));
    return `${href}#${fragment}`;
  }
  return value;
}

// `wiki:Article Title` or `wiki:Article Title#Section heading`. The hash
// is a page fragment, not part of the article title -- encoding it into
// the path would send the player to a missing page named "Title#Section".
export function parseWikiShorthand(raw) {
  if (typeof raw !== "string" || !raw.startsWith("wiki:")) return null;
  const rest = raw.slice(5).trim();
  if (!rest) return null;
  const hash = rest.indexOf("#");
  const title = (hash === -1 ? rest : rest.slice(0, hash)).trim();
  const section = hash === -1 ? "" : rest.slice(hash + 1).trim();
  if (!title) return null;
  return { title, section };
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

// Automatic Wikipedia search as a missing-link fallback is deprecated.
// Authors who have confirmed a genuine multi-hit results page (two or more
// productive paths for this lesson) should author that search URL as `link`.
// Connectors never had this fallback. The helper stays so callers and tests
// have one place that encodes "do not synthesize a search chip."
export function searchLinkForTerm(_word, _termRole = "reference") {
  return null;
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
