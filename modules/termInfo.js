// Normalizes and links the hover/tap info an author can attach to a
// term or bridge (see docs/INFO-LINKS.md for the authoring-side shape).
// Pure functions over plain data -- no game-state, D3, or DOM dependency.

// Puzzle authors can give termInfo/bridge info either a plain string
// (just the definition) or an object with an ordered `links` list.
// Order is pertinence: the first entry is the best starting point.
// A missing list no longer synthesizes a Wikipedia search chip.
// `link`, `linkLabel`, `extraLink`, and `seeAlso` remain accepted and
// are folded into `links` (primary, then extraLink, then seeAlso).
// A link value can be a full URL, or the shorthand `wiki:Article Title`
// for a verified Wikipedia article. An optional `#Section heading`
// fragment is preserved as a page hash.
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

function normalizeLinkEntry(raw, fallbackLabel = null) {
  if (typeof raw === "string") {
    const href = resolveLink(raw);
    return href ? { href, label: normalizedLabel(fallbackLabel) } : null;
  }
  if (!raw || typeof raw !== "object") return null;
  const href = resolveLink(raw.href);
  return href ? { href, label: normalizedLabel(raw.label) || normalizedLabel(fallbackLabel) } : null;
}

// Authored order, unresolved. Draft review uses this so wiki: shorthand
// stays editable. Play resolves each href through normalizeInfo.
export function authoredLinks(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const rows = [];
  const seen = new Set();
  const add = (href, label) => {
    const nextHref = typeof href === "string" ? href.trim() : "";
    if (!nextHref || seen.has(nextHref)) return;
    seen.add(nextHref);
    const nextLabel = typeof label === "string" && label.trim() ? label.trim() : "";
    rows.push(nextLabel ? { href: nextHref, label: nextLabel } : { href: nextHref });
  };
  const addEntry = (entry, fallbackLabel = "") => {
    if (typeof entry === "string") add(entry, fallbackLabel);
    else if (entry && typeof entry === "object") add(entry.href, entry.label || fallbackLabel);
  };
  if (Array.isArray(raw.links)) raw.links.forEach(entry => addEntry(entry));
  add(raw.link, raw.linkLabel);
  add(raw.extraLink);
  if (Array.isArray(raw.seeAlso)) raw.seeAlso.forEach(entry => addEntry(entry));
  else addEntry(raw.seeAlso);
  return rows;
}

// Lesson further-reading: canonical `links`, leftover `sources`. Same
// entry shape as info.links. Identity when neither list is present.
export function authoredLearningLinks(intro) {
  if (!intro || typeof intro !== "object" || Array.isArray(intro)) return [];
  const rows = [];
  const seen = new Set();
  const add = (href, label) => {
    const nextHref = typeof href === "string" ? href.trim() : "";
    if (!nextHref || seen.has(nextHref)) return;
    seen.add(nextHref);
    const nextLabel = typeof label === "string" && label.trim() ? label.trim() : "";
    rows.push(nextLabel ? { href: nextHref, label: nextLabel } : { href: nextHref });
  };
  const addEntry = entry => {
    if (typeof entry === "string") add(entry, "");
    else if (entry && typeof entry === "object") add(entry.href, entry.label);
  };
  if (Array.isArray(intro.links)) intro.links.forEach(addEntry);
  if (Array.isArray(intro.sources)) intro.sources.forEach(addEntry);
  return rows;
}

export function canonicalizeLearningIntroductionLinks(intro) {
  if (!intro || typeof intro !== "object" || Array.isArray(intro)) return intro;
  if (!Array.isArray(intro.sources)) return intro;
  const links = authoredLearningLinks(intro);
  const next = { ...intro };
  delete next.sources;
  if (links.length) next.links = links;
  else delete next.links;
  return next;
}

const LEGACY_INFO_LINK_KEYS = ["link", "linkLabel", "extraLink", "seeAlso"];

function hasLegacyInfoLinkFields(raw) {
  return LEGACY_INFO_LINK_KEYS.some(key => {
    const value = raw[key];
    if (value == null || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
}

function pruneCanonicalInfo(info) {
  const keys = Object.keys(info).filter(key => {
    const value = info[key];
    if (value == null || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
  if (!keys.length) return undefined;
  if (keys.length === 1 && keys[0] === "text" && typeof info.text === "string") {
    return info.text;
  }
  const out = {};
  for (const key of keys) out[key] = info[key];
  return out;
}

// Draft/editor shape: fold leftover link/extraLink/seeAlso into
// `links` and drop the legacy keys. Play still reads both. Identity when
// the object already has no leftover fields.
export function canonicalizeInfoLinks(raw) {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return raw;
  if (!hasLegacyInfoLinkFields(raw)) return raw;
  const links = authoredLinks(raw);
  const next = { ...raw };
  for (const key of LEGACY_INFO_LINK_KEYS) delete next[key];
  if (links.length) next.links = links;
  else delete next.links;
  return pruneCanonicalInfo(next);
}

export function canonicalizeDocumentInfoLinks(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return document;
  }
  const next = structuredClone(document);
  const apply = (container, key) => {
    if (container[key] === undefined) return;
    const canonical = canonicalizeInfoLinks(container[key]);
    if (canonical === undefined) delete container[key];
    else container[key] = canonical;
  };
  apply(next, "info");
  if (next.relatedPuzzles && typeof next.relatedPuzzles === "object") {
    apply(next.relatedPuzzles, "info");
  }
  for (const cluster of next.clusters || []) {
    apply(cluster, "info");
    if (!cluster.termInfo || typeof cluster.termInfo !== "object") continue;
    for (const term of Object.keys(cluster.termInfo)) {
      apply(cluster.termInfo, term);
      if (cluster.termInfo[term] === undefined) delete cluster.termInfo[term];
    }
    if (!Object.keys(cluster.termInfo).length) delete cluster.termInfo;
  }
  for (const bridge of next.bridges || []) apply(bridge, "info");
  if (next.learningIntroduction !== undefined) {
    next.learningIntroduction = canonicalizeLearningIntroductionLinks(
      next.learningIntroduction
    );
  }
  return next;
}

function citationIdentity(citation) {
  if (!citation || typeof citation !== "object") return "";
  return JSON.stringify({
    title: String(citation.title || "").trim().toLowerCase(),
    author: String(citation.author || "").trim().toLowerCase(),
    year: String(citation.year || "").trim()
  });
}

function listedCitations(info) {
  if (!info || typeof info !== "object" || Array.isArray(info)) return [];
  return Array.isArray(info.citations) ? info.citations.filter(entry => entry?.title) : [];
}

function withoutCitations(info) {
  if (!info || typeof info !== "object" || Array.isArray(info)) return info;
  if (!Object.prototype.hasOwnProperty.call(info, "citations")) return info;
  const next = { ...info };
  delete next.citations;
  return pruneCanonicalInfo(next);
}

// Bibliography lives on puzzle info (and the lesson's own footnotes). Nested
// leftover citations fold up when a document enters the editor so that
// surface is one schema. Play still reads leftover nested citations.
export function hoistDocumentCitations(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return document;
  }
  const next = structuredClone(document);
  const nested = [];
  const takeNested = (container, key) => {
    if (container[key] === undefined) return;
    nested.push(...listedCitations(container[key]));
    const stripped = withoutCitations(container[key]);
    if (stripped === undefined) delete container[key];
    else container[key] = stripped;
  };
  const puzzleCitations = listedCitations(next.info);
  if (next.relatedPuzzles && typeof next.relatedPuzzles === "object") {
    takeNested(next.relatedPuzzles, "info");
  }
  for (const cluster of next.clusters || []) {
    takeNested(cluster, "info");
    if (!cluster.termInfo || typeof cluster.termInfo !== "object") continue;
    for (const term of Object.keys(cluster.termInfo)) {
      takeNested(cluster.termInfo, term);
      if (cluster.termInfo[term] === undefined) delete cluster.termInfo[term];
    }
    if (!Object.keys(cluster.termInfo).length) delete cluster.termInfo;
  }
  for (const bridge of next.bridges || []) takeNested(bridge, "info");
  if (!nested.length) return next;

  const merged = [];
  const seen = new Set();
  for (const citation of [...puzzleCitations, ...nested]) {
    const id = citationIdentity(citation);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    merged.push(citation);
  }
  if (next.info == null || typeof next.info === "string") {
    next.info = next.info ? { text: next.info, citations: merged } : { citations: merged };
  } else {
    next.info = { ...next.info, citations: merged };
  }
  return next;
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
      links: [],
      link: null,
      linkLabel: null,
      extraLink: null,
      seeAlso: [],
      citations: []
    };
  }

  const links = [];
  const seen = new Map();
  for (const entry of authoredLinks(raw)) {
    const normalized = normalizeLinkEntry(entry);
    if (!normalized) continue;
    if (seen.has(normalized.href)) {
      const existing = links[seen.get(normalized.href)];
      if (!existing.label && normalized.label) existing.label = normalized.label;
      continue;
    }
    seen.set(normalized.href, links.length);
    links.push({ href: normalized.href, label: normalized.label });
  }

  const citations = Array.isArray(raw.citations)
    ? raw.citations.map(normalizeCitationEntry).filter(Boolean)
    : [];
  const primary = links[0] || null;
  const rest = links.slice(1);

  return {
    text: typeof raw.text === "string" ? raw.text : null,
    links,
    // Derived so existing hover/overview code can keep reading the old
    // primary / see-also split. New code should use `links`.
    link: primary?.href || null,
    linkLabel: primary?.label || null,
    extraLink: rest[0]?.href || null,
    seeAlso: rest,
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
