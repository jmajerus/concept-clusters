// Backfill the Concept Clusters Zotero collection from published citations.
// planBackfill only reads (Postgres, Zotero search, NCBI id conversion) and
// returns a plan a person reviews; applyBackfill writes only the plan's
// "file" and "create" entries and records each item as soon as it exists,
// so a rerun after a failure never creates a second copy.

import { listMergedCategoryRegistry } from "./authoringMcpTaxonomy.js";
import { classifyCitation, citationsOf, normalizedText, splitEdition } from "./citationWorkKey.js";
import { PostgresPublishedRepository } from "./postgresPublishedRepository.js";
import { libraryOf } from "./zoteroReferenceService.js";

// Published puzzles plus the live category registry (never the git copy).
export async function loadPublishedCorpus(pool) {
  const published = new PostgresPublishedRepository(pool);
  const [puzzles, categories] = await Promise.all([
    published.listPublished({ kind: "puzzle" }),
    published.listPublished({ kind: "category" })
  ]);
  const documents = puzzles.map(row => row.document).filter(Boolean);
  return {
    puzzles: puzzles.filter(row => row.document),
    registry: listMergedCategoryRegistry({
      contentService: null,
      publishedCategories: categories,
      includeGit: false,
      publishedPuzzles: documents
    })
  };
}

export async function recordedWorkItems(pool) {
  const { rows } = await pool.query("SELECT * FROM citation_work_items");
  return new Map(rows.map(row => [row.work_key, row]));
}

async function recordWorkItem(pool, { workKey, library, itemKey, origin }) {
  await pool.query(`
    INSERT INTO citation_work_items (work_key, zotero_library, zotero_item_key, origin, recorded_at)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (work_key) DO NOTHING
  `, [workKey, library, itemKey, origin, new Date().toISOString()]);
}

// Cited works grouped by work key, plus the excluded citations by host.
export function citedWorks(puzzles) {
  const works = new Map();
  const excluded = new Map();
  for (const puzzle of puzzles) {
    for (const [index, citation] of citationsOf(puzzle.document).entries()) {
      const work = classifyCitation(citation);
      if (!work.scholarly) {
        const key = work.host || work.reason;
        const entry = excluded.get(key) || { host: key, count: 0, examples: [] };
        entry.count++;
        if (entry.examples.length < 3) entry.examples.push(citation.title);
        excluded.set(key, entry);
        continue;
      }
      const entry = works.get(work.workKey)
        || { workKey: work.workKey, kind: work.kind, source: work.source, label: work.label, citations: [] };
      entry.citations.push({ puzzleId: puzzle.id, index, title: citation.title });
      works.set(work.workKey, entry);
    }
  }
  return {
    works: [...works.values()].sort((a, b) => b.citations.length - a.citations.length
      || a.workKey.localeCompare(b.workKey)),
    excluded: [...excluded.values()].sort((a, b) => b.count - a.count)
  };
}

// PMC ids have no Zotero import route; NCBI converts them to a PMID or DOI.
export async function resolvePmcid(pmcid, fetchImpl = fetch) {
  const url = new URL("https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/");
  url.search = new URLSearchParams({ ids: pmcid, format: "json", tool: "concept-clusters" });
  const response = await fetchImpl(url);
  if (!response.ok) throw new Error(`NCBI id conversion returned ${response.status}`);
  const record = (await response.json()).records?.[0];
  if (record?.pmid) return { kind: "pmid", source: String(record.pmid) };
  if (record?.doi) return { kind: "doi", source: String(record.doi).toLowerCase() };
  throw new Error(`NCBI has no PMID or DOI for ${pmcid}`);
}

const CROSSREF_BOOK_TYPES = new Set(["book", "monograph", "edited-book", "reference-book"]);

// A journal record titled like a book is usually a review of it, so a
// journal article counts only when its journal is the inline "publisher"
// (where authors put the journal) or no publisher was given. Chapters never
// count: one titled like the cited work is part of it, not the work.
function crossrefKindAgrees(item, publisher) {
  if (CROSSREF_BOOK_TYPES.has(item.type)) return true;
  if (item.type !== "journal-article") return false;
  const inline = normalizedText(publisher);
  return !inline || (item["container-title"] || []).map(normalizedText)
    .some(journal => journal && (inline.startsWith(journal) || journal.startsWith(inline)));
}

// A DOI for a work cited without one, when CrossRef has a record whose title,
// first-author surname, year (within one), and kind all agree. A citation
// without a year is skipped (a book DOI names one edition, and an undated
// "Macbeth" would match any of them), as is an edition-bearing book, since
// CrossRef rarely distinguishes editions.
export async function crossrefDoi(work, fetchImpl = fetch) {
  const { title, author = [], issued, edition } = work.source;
  const family = author.find(person => person.family)?.family;
  const year = issued?.["date-parts"]?.[0]?.[0] || null;
  if (edition || !family || !title || !year) return null;
  const url = new URL("https://api.crossref.org/works");
  url.search = new URLSearchParams({
    "query.bibliographic": `${title} ${year}`,
    "query.author": family,
    rows: "5",
    select: "DOI,title,subtitle,author,issued,type,container-title"
  });
  const response = await fetchImpl(url, { headers: { "User-Agent": "concept-clusters-citation-backfill" } });
  if (!response.ok) throw new Error(`CrossRef returned ${response.status}`);
  const wanted = normalizedText(title);
  const match = ((await response.json()).message?.items || []).find(item => {
    const main = item.title?.[0] || "";
    const titles = [main, `${main} ${item.subtitle?.[0] || ""}`].map(normalizedText);
    const found = item.issued?.["date-parts"]?.[0]?.[0];
    return titles.includes(wanted)
      && (item.author || []).some(person => normalizedText(person.family) === normalizedText(family))
      && found && Math.abs(found - year) <= 1
      && crossrefKindAgrees(item, work.source.publisher);
  });
  return match ? { kind: "doi", source: match.DOI.toLowerCase(), note: `CrossRef ${match.type}` } : null;
}

function editionOf(value) {
  return String(value || "").match(/\d+/)?.[0] || null;
}

// A library item is the same work when its title matches exactly (case,
// punctuation, and accents aside) and the editions agree. A cited edition
// the library item does not state is left for a person to decide.
export function compareTitleCandidate(work, record) {
  const wanted = splitEdition(work.source.title);
  const wantedEdition = work.source.edition || wanted.edition;
  const found = splitEdition(record?.data?.title);
  if (normalizedText(found.title) !== normalizedText(wanted.title)) return "different";
  const foundEdition = editionOf(record.data.edition) || found.edition;
  if (!wantedEdition || wantedEdition === foundEdition) return "same";
  return "edition";
}

function candidateSummary(record) {
  return {
    zoteroItemKey: record.key || record.data?.key,
    title: record.data?.title,
    edition: record.data?.edition || null,
    date: record.data?.date || null,
    itemType: record.data?.itemType || null
  };
}

export async function planBackfill({ pool, service, fetchImpl = fetch, onProgress = () => {} }) {
  const { puzzles } = await loadPublishedCorpus(pool);
  const { works, excluded } = citedWorks(puzzles);
  const recorded = await recordedWorkItems(pool);
  const planned = await service.withClient(async call => {
    const entries = [];
    for (const [position, work] of works.entries()) {
      onProgress(position + 1, works.length, work.workKey);
      const entry = { ...work, action: "create" };
      if (recorded.has(work.workKey)) {
        entry.action = "done";
        entry.zoteroItemKey = recorded.get(work.workKey).zotero_item_key;
      } else if (work.kind === "pmcid") {
        try {
          entry.resolved = await resolvePmcid(work.source, fetchImpl);
        } catch (error) {
          entry.action = "review";
          entry.note = error.message;
        }
      } else if (work.kind === "csl") {
        const candidates = await service.titleCandidates(work.source.title, call);
        const same = candidates.filter(record => compareTitleCandidate(work, record) === "same");
        const edition = candidates.filter(record => compareTitleCandidate(work, record) === "edition");
        if (same.length === 1 && !edition.length) {
          entry.action = "file";
          entry.zoteroItemKey = candidateSummary(same[0]).zoteroItemKey;
        } else if (same.length || edition.length) {
          entry.action = "review";
          entry.note = edition.length
            ? "A library item has this title with a different or missing edition."
            : "Several library items have this title.";
          entry.candidates = [...same, ...edition].map(candidateSummary);
        } else if (/^(book|url):/.test(work.workKey)) {
          try {
            const resolved = await crossrefDoi(work, fetchImpl);
            if (resolved) entry.resolved = resolved;
          } catch (error) {
            entry.note = `CrossRef lookup failed: ${error.message}`;
          }
        }
      }
      entries.push(entry);
    }
    return entries;
  });
  const count = action => planned.filter(work => work.action === action).length;
  return {
    generatedAt: new Date().toISOString(),
    collectionKey: service.collectionKey,
    summary: {
      puzzles: puzzles.length,
      works: planned.length,
      create: count("create"),
      file: count("file"),
      review: count("review"),
      done: count("done"),
      excludedCitations: excluded.reduce((sum, entry) => sum + entry.count, 0)
    },
    works: planned,
    excluded
  };
}

function cell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function backfillReport(plan, planPath) {
  const lines = [
    "# Concept Clusters Zotero backfill plan",
    "",
    `Generated ${plan.generatedAt} for collection \`${plan.collectionKey}\`.`,
    "",
    `${plan.summary.works} cited works from ${plan.summary.puzzles} published puzzles:`,
    `${plan.summary.create} to create, ${plan.summary.file} to file from the library,`,
    `${plan.summary.review} to review, ${plan.summary.done} already recorded.`,
    `${plan.summary.excludedCitations} citations stay inline (not scholarly by the current rules).`,
    "",
    "Nothing has been written. To resolve a review entry, edit its `action` in",
    `\`${planPath}\`: \`"file"\` with a \`zoteroItemKey\` from its candidates,`,
    "`\"create\"` for a new item, or `\"skip\"`. Then run",
    `\`npm run authoring:citations:backfill -- apply ${planPath}\`.`,
    ""
  ];
  const section = (title, works, columns) => {
    if (!works.length) return;
    lines.push(`## ${title} (${works.length})`, "", `| ${columns.map(([name]) => name).join(" | ")} |`,
      `|${columns.map(() => "---").join("|")}|`);
    for (const work of works) lines.push(`| ${columns.map(([, value]) => cell(value(work))).join(" | ")} |`);
    lines.push("");
  };
  const cites = work => work.citations.length;
  const puzzlesOf = work => [...new Set(work.citations.map(citation => citation.puzzleId))].join(", ");
  section("Needs review", plan.works.filter(work => work.action === "review"), [
    ["Work", work => work.label], ["Cites", cites], ["Why", work => work.note],
    ["Candidates", work => (work.candidates || [])
      .map(candidate => `\`${candidate.zoteroItemKey}\` ${candidate.title}${candidate.edition ? ` (${candidate.edition} ed.)` : ""}`)
      .join("; ")]
  ]);
  section("File existing library items", plan.works.filter(work => work.action === "file"), [
    ["Work", work => work.label], ["Item", work => `\`${work.zoteroItemKey}\``], ["Cites", cites]
  ]);
  section("Create", plan.works.filter(work => work.action === "create"), [
    ["Work", work => work.label],
    ["Via", work => work.resolved ? `${work.kind} → ${work.resolved.kind} ${work.resolved.source}` : work.kind],
    ["Cites", cites], ["Puzzles", puzzlesOf]
  ]);
  if (plan.excluded.length) {
    lines.push(`## Staying inline (${plan.summary.excludedCitations} citations)`, "",
      "Add a host to `SCHOLARLY_HOSTS` in `modules/citationWorkKey.js` to include it.", "",
      "| Host or reason | Citations | Examples |", "|---|---|---|");
    for (const entry of plan.excluded) {
      lines.push(`| ${cell(entry.host)} | ${entry.count} | ${cell(entry.examples.join("; "))} |`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function applyBackfill({ pool, service, plan, fetchImpl = fetch, onProgress = () => {} }) {
  const recorded = await recordedWorkItems(pool);
  const pending = plan.works.filter(work =>
    ["file", "create"].includes(work.action) && !recorded.has(work.workKey));
  const result = { filed: 0, created: 0, reused: 0, failed: [] };
  let library = null;
  await service.withClient(async call => {
    for (const [position, work] of pending.entries()) {
      onProgress(position + 1, pending.length, work.workKey);
      try {
        let itemKey;
        let origin = "matched";
        if (work.action === "file") {
          if (!/^[A-Z0-9]{8}$/.test(String(work.zoteroItemKey || ""))) {
            throw new Error("A file entry needs an eight-character zoteroItemKey");
          }
          itemKey = work.zoteroItemKey;
          await service.setItemCollections([itemKey], { add: [service.collectionKey] }, call);
          result.filed++;
        } else {
          const target = work.resolved
            || (work.kind === "pmcid" ? await resolvePmcid(work.source, fetchImpl) : null)
            || { kind: work.kind, source: work.source };
          const added = await service.addItem(target, call);
          itemKey = added.itemKey;
          if (added.reused) result.reused++;
          else {
            result.created++;
            origin = "created";
          }
        }
        library ??= libraryOf(await service.getItem(itemKey, call));
        await recordWorkItem(pool, { workKey: work.workKey, library, itemKey, origin });
      } catch (error) {
        result.failed.push({ workKey: work.workKey, label: work.label, reason: error.message });
      }
    }
  });
  return result;
}
