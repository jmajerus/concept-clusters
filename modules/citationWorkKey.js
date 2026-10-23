// Which inline citations name a scholarly work, and which work. The work key
// groups citations of one work (all OpenStax pages of one book, every
// citation of one DOI) so that work becomes one Zotero item, while the page
// or chapter stays a locator on the puzzle. Pure: no network, no database.
//
// Only positive picks become Zotero items: an identifier (DOI, PubMed, PMC,
// RFC), an open-textbook host, a listed scholarly host, or a book cited
// without a URL. Everything else -- encyclopedias, dictionaries, general web
// pages -- stays an inline citation. To widen the scope, add a host below.

// Hosts whose pages are scholarly documents even without an identifier.
export const SCHOLARLY_HOSTS = Object.freeze([
  "arxiv.org",
  "cambridge.org",
  "academic.oup.com",
  "link.springer.com",
  "nature.com",
  "science.org",
  "jstor.org",
  "nvlpubs.nist.gov",
  "pubs.usgs.gov",
  "feynmanlectures.caltech.edu"
]);

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function onHost(host, domain) {
  return host === domain || host?.endsWith(`.${domain}`);
}

export function normalizedText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const EDITION = /,?\s*\(?(\d+)(?:st|nd|rd|th)\s+(?:ed\.?|edition)\)?/i;

// "Guyton and Hall Textbook of Medical Physiology, 14th ed." -> title + "14".
// Text after the edition ("…, 3rd ed., ch. 5 Transport") is a locator.
export function splitEdition(title) {
  const text = String(title || "").trim();
  const match = text.match(EDITION);
  return match && match.index > 0
    ? { title: text.slice(0, match.index).replace(/[,\s]+$/, ""), edition: match[1] }
    : { title: text, edition: null };
}

export function doiOf(citation) {
  const direct = String(citation.doi || citation.DOI || "").trim()
    .replace(/^doi:\s*/i, "").replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "");
  if (/^10\.\d{4,9}\/\S+$/.test(direct)) return direct.toLowerCase();
  // doi.org/10.x/y, …/doi/abs/10.x/y, …/content/journals/10.x/y
  const fromUrl = String(citation.url || "")
    .match(/(?:doi\.org\/|\/)(10\.\d{4,9}\/[^?#\s]+)/i)?.[1]
    ?.replace(/\/(?:full|abs|pdf|epdf)$/i, "");
  return fromUrl ? decodeURIComponent(fromUrl).toLowerCase() : null;
}

const MINOR_WORDS = new Set(["a", "an", "and", "at", "for", "in", "of", "on", "the", "to"]);

// A URL slug is the best title available for an open textbook; the inline
// citation title is usually the section. Review corrects it in Zotero.
function titleCaseSlug(slug) {
  return decodeURIComponent(slug)
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word, index) => index > 0 && MINOR_WORDS.has(word.toLowerCase())
      ? word.toLowerCase()
      : /^\d+e$/i.test(word) ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function personName(name) {
  if (name.includes(",")) {
    const [family, given] = name.split(",").map(piece => piece.trim());
    return given ? { family, given } : { literal: family };
  }
  const words = name.split(/\s+/);
  if (words.length < 2 || words.length > 4) return { literal: name };
  return { family: words.at(-1), given: words.slice(0, -1).join(" ") };
}

// Inline authors are free text: "John E. Hall and Michael E. Hall",
// "Dettmer, Katja; Aronov, Pavel", "Machiavelli, Niccolò", "Longinus",
// "Honig, Jan Willem, and Norbert Both". A comma is "Family, Given" when
// the part before it is one word, and a list separator otherwise.
export function cslAuthors(author) {
  const text = String(author || "").trim();
  if (!text) return [];
  const chunks = text.split(/\s*;\s*|,?\s+and\s+|\s*&\s*/).filter(Boolean);
  const names = [];
  for (const chunk of chunks) {
    const pieces = chunk.split(/\s*,\s*/).filter(Boolean);
    for (let index = 0; index < pieces.length; index++) {
      const single = !/\s/.test(pieces[index]);
      if (single && pieces[index + 1]) {
        names.push(`${pieces[index]}, ${pieces[index + 1]}`);
        index++;
      } else {
        names.push(pieces[index]);
      }
    }
  }
  return names.map(personName);
}

function yearOf(citation) {
  return String(citation.year || "").match(/^\d{4}$/)?.[0] || null;
}

// Authors put a journal in "publisher": "Psychological Science 17(3)",
// "Journal of Management, 13(1)", "Administrative Science Quarterly".
const JOURNAL = /^(.*?)(?:,?\s*(\d+)\s*\((\d+)\))?\s*$/;
const JOURNAL_WORDS = /\b(journal|review|quarterly|proceedings|annals|bulletin|letters|transactions)\b/i;

function journalOf(publisher) {
  const text = String(publisher || "").trim();
  const [, name, volume, issue] = text.match(JOURNAL) || [];
  if (!volume && !JOURNAL_WORDS.test(text)) return null;
  return { name: name.trim(), volume, issue };
}

function articleCsl({ title, citation, journal }) {
  const year = yearOf(citation);
  const authors = cslAuthors(citation.author);
  return {
    type: "article-journal",
    title,
    ...(authors.length ? { author: authors } : {}),
    "container-title": journal.name,
    ...(journal.volume ? { volume: journal.volume } : {}),
    ...(journal.issue ? { issue: journal.issue } : {}),
    ...(citation.pages ? { page: citation.pages } : {}),
    ...(year ? { issued: { "date-parts": [[Number(year)]] } } : {})
  };
}

function bookCsl({ title, edition = null, citation, publisher = null, url = null }) {
  const year = yearOf(citation);
  const authors = cslAuthors(citation.author);
  return {
    type: "book",
    title,
    ...(edition ? { edition } : {}),
    ...(authors.length ? { author: authors } : {}),
    ...((publisher || citation.publisher) ? { publisher: publisher || citation.publisher } : {}),
    ...(year ? { issued: { "date-parts": [[Number(year)]] } } : {}),
    ...(url ? { URL: url } : {})
  };
}

/**
 * @returns {{ scholarly: true, workKey: string, kind: string, source: any, label: string }
 *   | { scholarly: false, reason: string, host: string | null }}
 */
export function classifyCitation(citation) {
  if (!citation || typeof citation !== "object" || !String(citation.title || "").trim()) {
    return { scholarly: false, reason: "no title", host: null };
  }
  const url = String(citation.url || "").trim();
  const host = url ? hostOf(url) : null;

  const rfc = url.match(/(?:rfc-editor\.org\/(?:rfc|info)\/|datatracker\.ietf\.org\/doc\/(?:html\/)?)rfc(\d+)/i)?.[1];
  if (rfc) {
    const doi = `10.17487/rfc${rfc}`;
    return { scholarly: true, workKey: `doi:${doi}`, kind: "doi", source: doi, label: `RFC ${rfc}` };
  }
  const doi = doiOf(citation);
  if (doi) return { scholarly: true, workKey: `doi:${doi}`, kind: "doi", source: doi, label: citation.title };

  const pmid = url.match(/(?:pubmed\.ncbi\.nlm\.nih\.gov|ncbi\.nlm\.nih\.gov\/pubmed)\/(\d+)/i)?.[1];
  if (pmid) return { scholarly: true, workKey: `pmid:${pmid}`, kind: "pmid", source: pmid, label: citation.title };
  const pmcid = url.match(/\/(PMC\d+)/i)?.[1];
  if (pmcid && onHost(host, "nih.gov")) {
    const id = pmcid.toUpperCase();
    return { scholarly: true, workKey: `pmcid:${id}`, kind: "pmcid", source: id, label: citation.title };
  }

  const openstax = url.match(/openstax\.org\/(?:details\/)?books\/([^/?#]+)/i)?.[1];
  if (openstax) {
    const slug = openstax.toLowerCase();
    const title = titleCaseSlug(slug);
    return {
      scholarly: true, workKey: `openstax:${slug}`, kind: "csl", label: title,
      source: bookCsl({
        title, citation: { year: citation.year }, publisher: "OpenStax",
        url: `https://openstax.org/books/${slug}`
      })
    };
  }
  if (onHost(host, "libretexts.org")) {
    // /Bookshelves/<shelf>/<book>/... or /Courses/<institution>/<course>/...
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    const name = parts[2];
    if (name && ["Bookshelves", "Courses"].includes(parts[0])) {
      const title = titleCaseSlug(name);
      return {
        scholarly: true, workKey: `libretexts:${host}/${normalizedText(name).replace(/ /g, "-")}`,
        kind: "csl", label: title,
        source: bookCsl({
          title, citation: {}, publisher: "LibreTexts",
          url: `https://${host}/${parts.slice(0, 3).join("/")}`
        })
      };
    }
  }

  if (onHost(host, "opentextbc.ca")) {
    const slug = new URL(url).pathname.split("/").filter(Boolean)[0];
    if (slug) {
      const title = titleCaseSlug(slug);
      return {
        scholarly: true, workKey: `pressbooks:opentextbc.ca/${slug.toLowerCase()}`, kind: "csl", label: title,
        source: bookCsl({ title, citation: {}, publisher: "BCcampus", url: `https://opentextbc.ca/${slug}/` })
      };
    }
  }
  if (onHost(host, "feynmanlectures.caltech.edu")) {
    const roman = { 1: "I", 2: "II", 3: "III" };
    const volume = url.match(/\/(I{1,3})_\d+/)?.[1]
      || String(citation.title).match(/\bVol\.?\s*(I{1,3}|[123])\b/i)?.[1]?.toUpperCase().replace(/^[123]$/, digit => roman[digit]);
    if (volume) {
      const title = `The Feynman Lectures on Physics, Vol. ${volume}`;
      return {
        scholarly: true, workKey: `feynman:${volume}`, kind: "csl", label: title,
        source: bookCsl({ title, citation: { author: "Richard P. Feynman, Robert B. Leighton, and Matthew Sands" },
          publisher: "California Institute of Technology", url: "https://www.feynmanlectures.caltech.edu/" })
      };
    }
  }

  // A book cited without a URL, or with an edition ("14th ed.") whatever
  // its URL -- textbooks are often cited through a publisher's shop page.
  const { title: bookTitle, edition } = splitEdition(citation.title);
  if (!url || edition) {
    if (!String(citation.author || "").trim() && !String(citation.publisher || "").trim()) {
      return { scholarly: false, reason: "title only, no author or publisher", host };
    }
    const journal = edition ? null : journalOf(citation.publisher);
    if (journal) {
      return {
        scholarly: true, workKey: `book:${normalizedText(bookTitle)}`, kind: "csl", label: bookTitle,
        source: articleCsl({ title: bookTitle, citation, journal })
      };
    }
    return {
      scholarly: true,
      workKey: `book:${normalizedText(bookTitle)}${edition ? `|ed${edition}` : ""}`,
      kind: "csl", label: edition ? `${bookTitle} (${edition} ed.)` : bookTitle,
      source: bookCsl({ title: bookTitle, edition, citation })
    };
  }

  if (SCHOLARLY_HOSTS.some(domain => onHost(host, domain))) {
    if (onHost(host, "arxiv.org")) {
      return { scholarly: true, workKey: `url:${url.toLowerCase()}`, kind: "url", source: url, label: citation.title };
    }
    const year = yearOf(citation);
    const authors = cslAuthors(citation.author);
    return {
      scholarly: true, workKey: `url:${url.replace(/#.*$/, "").replace(/\/$/, "")}`, kind: "csl",
      label: citation.title,
      source: {
        type: "document",
        title: citation.title,
        ...(authors.length ? { author: authors } : {}),
        ...(citation.publisher ? { publisher: citation.publisher } : {}),
        ...(year ? { issued: { "date-parts": [[Number(year)]] } } : {}),
        URL: url
      }
    };
  }
  return { scholarly: false, reason: "not a listed scholarly host", host };
}

export function citationsOf(document) {
  return [
    ...(Array.isArray(document?.info?.citations) ? document.info.citations : []),
    ...(Array.isArray(document?.learningIntroduction?.citations)
      ? document.learningIntroduction.citations : [])
  ].filter(citation => citation && typeof citation === "object" && !Array.isArray(citation));
}
