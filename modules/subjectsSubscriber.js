// Follows terminology-mcp's `cc-subjects` changelog and writes what it may
// apply into Concept Clusters' published category documents
// (docs/dev-briefs/subjects-from-terminology-mcp.md). terminology-mcp owns
// which domains, categories, and subcategories exist, their labels, slugs,
// and nesting; Concept Clusters keeps keying puzzles on the slugs.
//
// The first run bootstraps from the scheme snapshot and reconciles it with
// the published categories. Later runs read the changes after the cursor in
// order. A change the policy holds stops the cursor there and is reported
// to terminology-mcp as `blocked`, until a person handles it and accepts it
// with `npm run subjects:sync -- --accept <n>`.
//
// The drain loop runs this only when SUBJECTS_SYNC=on; the npm script
// dry-runs by default. Domains are published documents too, so a new,
// renamed, or merged domain is applied like a category.

import { RESERVED_DOMAIN_IDS } from "../puzzles/domains.js";
import { DOMAINS_SNAPSHOT, refreshDomainsRegistry, validateDomainDocument } from "./domainRegistry.js";
import { existingCategoryRecords } from "./authoringMcpTaxonomy.js";
import { validateCategoryDocument } from "./categoryValidation.js";
import { PostgresPublishedRepository } from "./postgresPublishedRepository.js";
import {
  SUBJECTS_SCHEME_ID,
  TerminologyError,
  createTerminologyClient,
  terminologyConfig
} from "./terminologyClient.js";

export const SUBSCRIBER_ACTOR = Object.freeze({ subject: "terminology-mcp", name: "cc-subjects subscriber" });
const SUBSCRIBER_LABEL = "Concept Clusters";
const HEARTBEAT_MS = 5 * 60_000;

// Kinds that never move or rename a term for Concept Clusters: notes,
// links, alternative labels, status (Confirm), scheme settings, and sets.
const IGNORED_KINDS = new Set([
  "scheme-added",
  "scheme-changed",
  "imported",
  "noted",
  "updated",
  "set-added",
  "set-changed",
  "set-deleted"
]);

export function subjectsSyncEnabled(env = process.env) {
  return String(env.SUBJECTS_SYNC || "").trim().toLowerCase() === "on";
}

// What the cursor keeps per term: enough to place it in the tree and name it.
export function termRecord(term) {
  return {
    slug: term.slug,
    label: term.label,
    status: term.status,
    broader: Array.isArray(term.broader) ? [...term.broader] : [],
    replacedBy: Array.isArray(term.replacedBy) ? [...term.replacedBy] : []
  };
}

export function termsFromState(state) {
  const terms = {};
  for (const term of state?.terms || []) {
    if (term?.id && (!term.scheme || term.scheme === SUBJECTS_SCHEME_ID)) terms[term.id] = termRecord(term);
  }
  return terms;
}

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

function sameKey(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function nameOf(terms, id) {
  const term = terms[id];
  const key = keyOf(terms, id);
  const path = key ? [key.domain, key.category, key.sub].filter(Boolean).join("/") : id;
  return term ? `"${term.label}" (${path})` : id;
}

// The term map after a change: every snapshot it carries replaces the local
// record (terminology-mcp docs/following-changes.md, "Applying a change").
export function termsAfter(terms, change) {
  const snapshots = Array.isArray(change.afterTerms)
    ? change.afterTerms
    : change.kind === "added" && change.after?.id ? [change.after] : [];
  if (!snapshots.length) return terms;
  const next = { ...terms };
  for (const snapshot of snapshots) {
    if (snapshot?.id && (!snapshot.scheme || snapshot.scheme === SUBJECTS_SCHEME_ID)) {
      next[snapshot.id] = termRecord(snapshot);
    }
  }
  return next;
}

function touchedIds(change) {
  const ids = new Set(Array.isArray(change.terms) ? change.terms : []);
  for (const snapshot of change.afterTerms || []) if (snapshot?.id) ids.add(snapshot.id);
  if (change.after?.id) ids.add(change.after.id);
  return [...ids];
}

function primaryId(change) {
  return change.after?.id ?? change.terms?.[0] ?? null;
}

// The subscriber policy (dev-brief, "What the subscriber applies"). Returns
// { action: "apply" | "skip" | "hold", edits, code?, reason?, terms }, where
// terms is the map after the change. Whether a domain exists is checked
// when an edit is applied, since an earlier change in the same pass may
// have added it.
export function planChange(change, terms) {
  const after = termsAfter(terms, change);
  const plan = (action, extra = {}) => ({ action, edits: [], ...extra, terms: after });
  const hold = (code, reason) => plan("hold", { code, reason });
  const touched = touchedIds(change);
  const shifted = touched.filter(id =>
    terms[id] && after[id] && !sameKey(keyOf(terms, id), keyOf(after, id))
  );
  const kind = change.kind;

  if (IGNORED_KINDS.has(kind)) {
    const changed = touched.find(id =>
      terms[id] && after[id] && (shifted.includes(id) || terms[id].label !== after[id].label)
    );
    if (changed) return hold("unexpected-change", `A ${kind} change moved or renamed ${nameOf(after, changed)}`);
    return plan("skip");
  }

  switch (kind) {
    case "added": {
      const id = change.after?.id;
      const key = id ? keyOf(after, id) : null;
      if (!key) return hold("unexpected-change", `Added term ${id} has no place in the tree`);
      const title = after[id].label;
      if (key.depth === 0) return plan("apply", { edits: [{ op: "domain", id: key.domain, title }] });
      if (key.depth === 1) {
        return plan("apply", { edits: [{ op: "category", id: key.category, title, domain: key.domain }] });
      }
      if (key.depth === 2) {
        return plan("apply", { edits: [{ op: "subcategory", category: key.category, sub: key.sub, title }] });
      }
      return hold("depth-change", `${nameOf(after, id)} is deeper than Concept Clusters' three levels`);
    }

    case "labelled": {
      const id = primaryId(change);
      const key = id ? keyOf(after, id) : null;
      if (!key || shifted.length) return hold("unexpected-change", `A label change also moved ${nameOf(after, shifted[0] || id)}`);
      const title = after[id].label;
      if (key.depth === 0) return plan("apply", { edits: [{ op: "domain", id: key.domain, title }] });
      if (key.depth === 1) return plan("apply", { edits: [{ op: "category", id: key.category, title }] });
      if (key.depth === 2) return plan("apply", { edits: [{ op: "subcategory", category: key.category, sub: key.sub, title }] });
      return hold("depth-change", `${nameOf(after, id)} is deeper than Concept Clusters' three levels`);
    }

    case "moved": {
      const id = primaryId(change);
      const before = id ? keyOf(terms, id) : null;
      const now = id ? keyOf(after, id) : null;
      if (!before || !now) return hold("unexpected-change", `Moved term ${id} has no place in the tree`);
      if (before.depth !== now.depth) return hold("depth-change", `${nameOf(after, id)} moved to another level`);
      if (now.depth === 1) {
        return plan("apply", { edits: [{ op: "category", id: now.category, domain: now.domain }] });
      }
      if (now.depth === 2) {
        return hold("subcategory-move", `${nameOf(after, id)} moved from ${before.category}: its key ${before.category}--${before.sub} changes`);
      }
      return hold("depth-change", `${nameOf(after, id)} moved`);
    }

    case "retired":
    case "merged": {
      const retiring = touched.filter(id =>
        terms[id] && terms[id].status !== "retired" && after[id]?.status === "retired"
      );
      if (retiring.length !== 1) return hold("retire-ambiguous", `A ${kind} change retired ${retiring.length} terms`);
      const id = retiring[0];
      const replacements = after[id].replacedBy;
      if (replacements.length !== 1) {
        return hold("retire-ambiguous", `${nameOf(terms, id)} retired with ${replacements.length} replacements: a person decides where its puzzles go`);
      }
      const replacement = replacements[0];
      const from = keyOf(terms, id);
      const to = keyOf(after, replacement);
      if (!from || !to || after[replacement].status === "retired") {
        return hold("retire-ambiguous", `${nameOf(terms, id)} retired into a term Concept Clusters cannot place`);
      }
      const carriedAll = shifted.filter(other => other !== id && after[other].status !== "retired");
      if (from.depth === 0 && to.depth === 0) {
        // A domain merged into another: its categories move with it.
        const strays = carriedAll.filter(other => keyOf(after, other).depth !== 1 && !carriedAll.includes(after[other].broader[0]));
        const categories = carriedAll.filter(other => keyOf(after, other).depth === 1);
        if (strays.length || categories.some(other => after[other].broader[0] !== replacement)) {
          return hold("depth-change", `Retiring ${nameOf(terms, id)} also moves terms to another level`);
        }
        return plan("apply", {
          edits: [
            ...categories.map(other => ({ op: "category", id: after[other].slug, domain: to.domain })),
            { op: "withdraw-domain", id: from.domain }
          ]
        });
      }
      const carried = carriedAll[0];
      if (carried) {
        const depthChanged = keyOf(terms, carried).depth !== keyOf(after, carried).depth;
        return hold(
          depthChanged ? "depth-change" : "subcategory-move",
          `Retiring ${nameOf(terms, id)} also moves ${nameOf(after, carried)}`
        );
      }
      if (from.depth !== to.depth) return hold("depth-change", `${nameOf(terms, id)} retired into a term at another level`);
      if (from.depth === 1) {
        const child = Object.keys(after).find(other => after[other].broader[0] === id && after[other].status !== "retired");
        if (child) return hold("depth-change", `${nameOf(terms, id)} retired while ${nameOf(after, child)} is still under it`);
        return plan("apply", {
          edits: [
            { op: "retag", from: { category: from.category }, to: { category: to.category } },
            { op: "withdraw-category", id: from.category }
          ]
        });
      }
      if (from.depth === 2) {
        if (from.category !== to.category) {
          return hold("subcategory-move", `${nameOf(terms, id)} retired into ${nameOf(after, replacement)}, under another category`);
        }
        return plan("apply", {
          edits: [
            { op: "retag", from: { category: from.category, sub: from.sub }, to: { category: to.category, sub: to.sub } },
            { op: "remove-subcategory", category: from.category, sub: from.sub }
          ]
        });
      }
      return hold("depth-change", `${nameOf(terms, id)} is deeper than Concept Clusters' three levels`);
    }

    case "slugged": {
      const id = primaryId(change);
      return hold("slug-change", `Slug of ${nameOf(after, id)} changed: puzzles and player URLs use it`);
    }

    case "split":
      return hold("split", `${nameOf(terms, primaryId(change))} split: a person decides where its puzzles go`);

    default:
      return hold("unknown-change", `Change kind "${kind}" is not one Concept Clusters knows`);
  }
}

// The edits that bring the published domains and categories in line with
// a snapshot, for the bootstrap. It adds and renames; anything it would
// have to delete or cannot place is a problem to report, never an edit.
// `domains` is the published domain documents.
export function reconcilePlan(terms, categories, { domains = [] } = {}) {
  const byId = new Map(categories.map(document => [document.id, document]));
  const domainsById = new Map(domains.map(document => [document.id, document]));
  const domainEdits = [];
  const categoryEdits = [];
  const subcategoryEdits = [];
  const problems = [];
  const liveDomains = new Set();
  const liveCategories = new Set();
  const liveSubcategories = new Set();
  const retired = [];
  for (const [id, term] of Object.entries(terms)) {
    const key = keyOf(terms, id);
    if (!key) {
      problems.push({ code: "unexpected-change", reason: `Term ${id} has no place in the tree` });
      continue;
    }
    if (term.status === "retired") {
      retired.push([id, key]);
      continue;
    }
    if (key.depth === 0) {
      liveDomains.add(key.domain);
      if (domainsById.get(key.domain)?.title !== term.label) {
        domainEdits.push({ op: "domain", id: key.domain, title: term.label });
      }
    } else if (key.depth === 1) {
      liveCategories.add(key.category);
      const document = byId.get(key.category);
      if (!document || document.title !== term.label || document.domain !== key.domain) {
        categoryEdits.push({ op: "category", id: key.category, title: term.label, domain: key.domain });
      }
    } else if (key.depth === 2) {
      liveSubcategories.add(`${key.category}--${key.sub}`);
      const current = byId.get(key.category)?.subcategories?.[key.sub];
      if (current?.title !== term.label) {
        subcategoryEdits.push({ op: "subcategory", category: key.category, sub: key.sub, title: term.label });
      }
    } else {
      problems.push({ code: "depth-change", reason: `${nameOf(terms, id)} is deeper than three levels` });
    }
  }
  for (const [id, key] of retired) {
    const stillPublished = key.depth === 0
      ? domainsById.has(key.domain) && !liveDomains.has(key.domain)
      : key.depth === 1
      ? byId.has(key.category) && !liveCategories.has(key.category)
      : key.depth === 2
        && Boolean(byId.get(key.category)?.subcategories?.[key.sub])
        && !liveSubcategories.has(`${key.category}--${key.sub}`);
    if (stillPublished) {
      problems.push({ code: "retired-in-terminology", reason: `${nameOf(terms, id)} is retired in terminology-mcp but published here` });
    }
  }
  for (const document of domains) {
    if (!liveDomains.has(document.id)) {
      problems.push({ code: "not-in-cc-subjects", reason: `Domain ${document.id} is not in cc-subjects` });
    }
  }
  // Categories without a subject domain (Trivia, Vocabulary, the generated
  // `other`) are Concept Clusters' own.
  for (const document of categories) {
    if (!document.domain || RESERVED_DOMAIN_IDS.has(document.domain)) continue;
    if (!liveCategories.has(document.id)) {
      problems.push({ code: "not-in-cc-subjects", reason: `Category ${document.id} is not in cc-subjects` });
      continue;
    }
    for (const sub of Object.keys(document.subcategories || {})) {
      if (!liveSubcategories.has(`${document.id}--${sub}`)) {
        problems.push({ code: "not-in-cc-subjects", reason: `Subcategory ${document.id}--${sub} is not in cc-subjects` });
      }
    }
  }
  return { edits: [...domainEdits, ...categoryEdits, ...subcategoryEdits], problems };
}

export function describeEdit(edit) {
  switch (edit.op) {
    case "category":
      return [`category ${edit.id}`, edit.title && `title "${edit.title}"`, edit.domain && `domain ${edit.domain}`]
        .filter(Boolean).join(", ");
    case "subcategory":
      return `subcategory ${edit.category}--${edit.sub}, title "${edit.title}"`;
    case "retag":
      return `re-tag puzzles ${[edit.from.category, edit.from.sub].filter(Boolean).join("--")} -> ${[edit.to.category, edit.to.sub].filter(Boolean).join("--")}`;
    case "withdraw-category":
      return `withdraw category ${edit.id}`;
    case "domain":
      return `domain ${edit.id}, title "${edit.title}"`;
    case "withdraw-domain":
      return `withdraw domain ${edit.id}`;
    case "remove-subcategory":
      return `remove subcategory ${edit.category}--${edit.sub}`;
    default:
      return JSON.stringify(edit);
  }
}

// A published puzzle's canonical category references with one category or
// subcategory replaced, or null when the puzzle does not use it. A retired
// category has no live subcategories by then (planChange holds otherwise),
// so its subcategory entry is dropped rather than carried.
export function retagPuzzleDocument(document, from, to) {
  if (!document) return null;
  const next = structuredClone(document);
  let changed = false;
  if (from.sub === undefined) {
    if (next.category === from.category) {
      next.category = to.category;
      changed = true;
    }
    if (Array.isArray(next.categories) && next.categories.includes(from.category)) {
      next.categories = [...new Set(next.categories.map(id => (id === from.category ? to.category : id)))];
      changed = true;
    }
    if (next.subcategories && Object.hasOwn(next.subcategories, from.category)) {
      delete next.subcategories[from.category];
      if (!Object.keys(next.subcategories).length) delete next.subcategories;
      changed = true;
    }
  } else if (next.subcategories?.[from.category] === from.sub) {
    next.subcategories[from.category] = to.sub;
    changed = true;
  }
  return changed ? next : null;
}

function puzzleUses(document, category, sub) {
  if (sub !== undefined) return document?.subcategories?.[category] === sub;
  return document?.category === category
    || (Array.isArray(document?.categories) && document.categories.includes(category))
    || Boolean(document?.subcategories && Object.hasOwn(document.subcategories, category));
}

async function publishCategory(repository, rows, document, mode, actor) {
  const existing = existingCategoryRecords({}, rows.filter(row => !row.withdrawnAt));
  const validation = validateCategoryDocument(document, { existing, mode });
  if (!validation.valid) {
    return { hold: { code: "invalid-category", reason: `${document.id}: ${validation.errors.join("; ")}` } };
  }
  await repository.publish({ kind: "category", id: document.id, document: validation.document, actor });
  return null;
}

// One edit against the published rows. Returns a description of what it
// wrote, null when nothing needed writing, or { hold } when it cannot be
// applied. Every edit compares with the current rows first, so a change
// that stopped part-way is safe to apply again.
async function applyEdit(edit, { repository, actor }) {
  if (edit.op === "retag") {
    const rows = await repository.listPublished({ kind: "puzzle" });
    let count = 0;
    for (const row of rows) {
      const document = retagPuzzleDocument(row.document, edit.from, edit.to);
      if (!document) continue;
      await repository.publish({
        kind: "puzzle",
        id: row.id,
        document,
        actor,
        layout: row.layout,
        expectedRevision: row.revision,
        markRevised: false
      });
      count += 1;
    }
    return count ? `${describeEdit(edit)}: ${count} puzzle${count === 1 ? "" : "s"}` : null;
  }

  if (edit.op === "domain" || edit.op === "withdraw-domain") return applyDomainEdit(edit, { repository, actor });

  const rows = await repository.listPublished({ kind: "category", includeWithdrawn: true });
  const id = edit.op === "category" || edit.op === "withdraw-category" ? edit.id : edit.category;
  const row = rows.find(candidate => candidate.id === id) || null;
  const live = row && !row.withdrawnAt ? row.document : null;

  if (edit.op === "category") {
    // A withdrawn row comes back with its player copy.
    const base = live || row?.document || { id: edit.id };
    const next = {
      ...base,
      ...(edit.title ? { title: edit.title } : {}),
      ...(edit.domain ? { domain: edit.domain } : {})
    };
    if (live && JSON.stringify(live) === JSON.stringify(next)) return null;
    const held = await publishCategory(repository, rows, next, live ? "update" : "create", actor);
    return held || `${live ? "updated" : "published"} ${describeEdit(edit)}`;
  }

  if (!live) {
    if (edit.op === "subcategory") {
      return { hold: { code: "missing-category", reason: `Category ${id} is not published in Concept Clusters` } };
    }
    return null;
  }

  if (edit.op === "subcategory") {
    const current = live.subcategories?.[edit.sub];
    if (current?.title === edit.title) return null;
    const next = {
      ...live,
      subcategories: { ...(live.subcategories || {}), [edit.sub]: { ...(current || {}), title: edit.title } }
    };
    const held = await publishCategory(repository, rows, next, "update", actor);
    return held || `${current ? "updated" : "added"} ${describeEdit(edit)}`;
  }

  const sub = edit.op === "remove-subcategory" ? edit.sub : undefined;
  if (sub !== undefined && !live.subcategories?.[sub]) return null;
  const puzzles = await repository.listPublished({ kind: "puzzle" });
  const users = puzzles.filter(puzzle => puzzleUses(puzzle.document, id, sub)).map(puzzle => puzzle.id);
  if (users.length) {
    return {
      hold: {
        code: "still-referenced",
        reason: `${[id, sub].filter(Boolean).join("--")} is still used by ${users.slice(0, 5).join(", ")}${users.length > 5 ? ` and ${users.length - 5} more` : ""}`
      }
    };
  }
  if (edit.op === "withdraw-category") {
    await repository.unpublish({ kind: "category", id, actor });
    return describeEdit(edit);
  }
  const subcategories = { ...live.subcategories };
  delete subcategories[sub];
  const next = { ...live, subcategories };
  if (!Object.keys(subcategories).length) delete next.subcategories;
  const held = await publishCategory(repository, rows, next, "update", actor);
  return held || describeEdit(edit);
}

// A domain is created (with the snapshot's player copy when there is no row
// yet), renamed, or withdrawn once no live category names it. The registry
// is reloaded after a write so the categories that follow validate against it.
async function applyDomainEdit(edit, { repository, actor }) {
  const rows = await repository.listPublished({ kind: "domain", includeWithdrawn: true });
  const row = rows.find(candidate => candidate.id === edit.id) || null;
  const live = row && !row.withdrawnAt ? row.document : null;
  if (edit.op === "withdraw-domain") {
    if (!live) return null;
    const categories = await repository.listPublished({ kind: "category" });
    const users = categories.filter(category => category.document?.domain === edit.id).map(category => category.id);
    if (users.length) {
      return { hold: { code: "still-referenced", reason: `Domain ${edit.id} is still used by ${users.slice(0, 5).join(", ")}${users.length > 5 ? ` and ${users.length - 5} more` : ""}` } };
    }
    await repository.unpublish({ kind: "domain", id: edit.id, actor });
    await refreshDomainsRegistry(repository);
    return describeEdit(edit);
  }
  const snapshot = DOMAINS_SNAPSHOT[edit.id];
  const base = live || row?.document || { id: edit.id, ...(snapshot?.info ? { info: snapshot.info } : {}) };
  const validation = validateDomainDocument({ ...base, id: edit.id, title: edit.title });
  if (!validation.valid) return { hold: { code: "invalid-domain", reason: validation.errors.join("; ") } };
  if (live && JSON.stringify(live) === JSON.stringify(validation.document)) return null;
  await repository.publish({ kind: "domain", id: edit.id, document: validation.document, actor });
  await refreshDomainsRegistry(repository);
  return `${live ? "updated" : "published"} ${describeEdit(edit)}`;
}

export async function applyEdits(edits, { repository, actor = SUBSCRIBER_ACTOR }) {
  const done = [];
  for (const edit of edits) {
    const result = await applyEdit(edit, { repository, actor });
    if (result?.hold) return { done, hold: result.hold };
    if (result) done.push(result);
  }
  return { done };
}

export class CursorMovedError extends Error {
  constructor() {
    super("The subjects cursor moved during this pass (another run or an --accept); the next pass starts from the new cursor.");
    this.name = "CursorMovedError";
  }
}

// The cursor row (postgres/migrations/0008_subjects_subscription.sql).
export function createSubscriptionStore(pool) {
  return {
    async read(scheme = SUBJECTS_SCHEME_ID) {
      let rows;
      try {
        ({ rows } = await pool.query(
          "SELECT log, through, terms, blocked FROM subjects_subscription WHERE scheme = $1",
          [scheme]
        ));
      } catch (error) {
        // Before the migration: no cursor yet, so a dry run still works.
        if (error?.code === "42P01") return null;
        throw error;
      }
      if (!rows[0]) return null;
      return {
        log: rows[0].log,
        through: Number(rows[0].through),
        terms: JSON.parse(rows[0].terms),
        blocked: rows[0].blocked ? JSON.parse(rows[0].blocked) : null
      };
    },
    // A compare-and-set: `expected` is the `through` this writer read, or
    // null for a bootstrap that found no row. The drain loop and an
    // --accept run in separate processes, so a cursor that moved since the
    // read throws CursorMovedError instead of being overwritten.
    async write({ scheme = SUBJECTS_SCHEME_ID, log, through, terms, blocked = null, expected }) {
      const values = [scheme, log, through, JSON.stringify(terms), blocked ? JSON.stringify(blocked) : null, new Date().toISOString()];
      const result = expected == null
        ? await pool.query(`
            INSERT INTO subjects_subscription (scheme, log, through, terms, blocked, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (scheme) DO NOTHING
          `, values)
        : await pool.query(`
            UPDATE subjects_subscription
            SET log = $2, through = $3, terms = $4, blocked = $5, updated_at = $6
            WHERE scheme = $1 AND log = $2 AND through = $7
          `, [...values, expected]);
      const count = result.rowCount ?? result.affectedRows ?? 0;
      if (count !== 1) throw new CursorMovedError();
    },
    async clear(scheme = SUBJECTS_SCHEME_ID) {
      await pool.query("DELETE FROM subjects_subscription WHERE scheme = $1", [scheme]);
    }
  };
}

async function bootstrap({ client, store, repository, apply }) {
  const state = await client.state();
  const terms = termsFromState(state);
  const categories = (await repository.listPublished({ kind: "category" })).map(row => row.document);
  const domains = (await repository.listPublished({ kind: "domain" })).map(row => row.document);
  const { edits, problems } = reconcilePlan(terms, categories, { domains });
  const base = { log: state.log, through: state.version, head: state.head ?? state.version, problems };
  if (!apply) return { outcome: "bootstrap", ...base, planned: edits.map(describeEdit) };
  const result = await applyEdits(edits, { repository });
  if (result.hold) return { outcome: "bootstrap-held", ...base, applied: result.done, hold: result.hold };
  await store.write({ log: state.log, through: state.version, terms, blocked: null, expected: null });
  return { outcome: "bootstrapped", ...base, applied: result.done, reset: true };
}

// One pass. With apply false nothing is written: the result lists what the
// pass would do (`planned`) and where it would stop (`blocked`).
export async function runSubjectsSync({ client, store, repository, apply = true }) {
  // Category validation reads DOMAINS; this process may not have loaded
  // the published domains yet.
  await refreshDomainsRegistry(repository);
  const cursor = await store.read();
  if (!cursor) return bootstrap({ client, store, repository, apply });
  let response;
  try {
    response = await client.changes(cursor.through);
  } catch (error) {
    // `since` past the head: the store was rebuilt under the same log id.
    if (!(error instanceof TerminologyError && error.status === 400)) throw error;
    response = null;
  }
  if (!response || response.log !== cursor.log) {
    if (apply) await store.clear();
    return { outcome: "rebuilt", log: response?.log ?? null, through: cursor.through };
  }
  let { terms, through } = cursor;
  let blocked = null;
  const applied = [];
  const planned = [];
  for (const change of response.changes || []) {
    const plan = planChange(change, terms);
    if (plan.action === "hold") {
      blocked = { at: change.n, code: plan.code, reason: plan.reason };
      break;
    }
    if (!apply) {
      planned.push(...plan.edits.map(edit => `${change.n} ${change.kind}: ${describeEdit(edit)}`));
    } else if (plan.edits.length) {
      const result = await applyEdits(plan.edits, { repository });
      applied.push(...result.done.map(line => `${change.n} ${change.kind}: ${line}`));
      if (result.hold) {
        blocked = { at: change.n, ...result.hold };
        break;
      }
    }
    if (apply) {
      await store.write({ log: cursor.log, through: change.n, terms: plan.terms, blocked: null, expected: through });
    }
    terms = plan.terms;
    through = change.n;
  }
  const written = through;
  if (!blocked) through = response.version;
  if (apply) await store.write({ log: cursor.log, through, terms, blocked, expected: written });
  return {
    outcome: blocked ? "held" : through > cursor.through ? "applied" : "current",
    log: cursor.log,
    through,
    head: response.version,
    blocked,
    ...(apply ? { applied } : { planned })
  };
}

// Mark a held change as handled by hand: the cursor moves past it with the
// term map it describes. Only the change the cursor is held at qualifies.
export async function acceptHeldChange({ client, store, n }) {
  const cursor = await store.read();
  if (!cursor?.blocked) throw new Error("The subscriber is not held at any change.");
  if (cursor.blocked.at !== n) throw new Error(`The subscriber is held at change ${cursor.blocked.at}, not ${n}.`);
  const response = await client.changes(cursor.through);
  if (response.log !== cursor.log) throw new Error("terminology-mcp's log changed; the next run bootstraps again.");
  const change = (response.changes || []).find(candidate => candidate.n === n);
  if (!change) throw new Error(`Change ${n} is not after the cursor (${cursor.through}).`);
  const terms = termsAfter(cursor.terms, change);
  await store.write({ log: cursor.log, through: n, terms, blocked: null, expected: cursor.through });
  return { log: cursor.log, through: n, change };
}

export function progressReport(result) {
  return {
    log: result.log,
    through: result.through,
    label: SUBSCRIBER_LABEL,
    schemes: [SUBJECTS_SCHEME_ID],
    ...(result.blocked ? { blocked: result.blocked } : {}),
    ...(result.reset ? { reset: true } : {})
  };
}

// Report progress to terminology-mcp. A cursor behind the last report (a
// restored or wiped cursor) is resent with reset.
export async function reportProgress(client, result) {
  const report = progressReport(result);
  try {
    return await client.reportProgress(report);
  } catch (error) {
    if (error instanceof TerminologyError && error.status === 409 && Number.isInteger(error.body?.through)) {
      return client.reportProgress({ ...report, reset: true });
    }
    throw error;
  }
}

// The drain loop's step. Never throws; logs each distinct problem once.
// Reports when the cursor or the hold changes, and every five minutes
// otherwise so terminology-mcp's lastSeen means alive.
export function createSubjectsSyncer({
  pool,
  env = process.env,
  client = null,
  log = console,
  now = () => Date.now()
} = {}) {
  const config = client ? null : terminologyConfig(env);
  const target = client || (config ? createTerminologyClient(config) : null);
  const enabled = subjectsSyncEnabled(env) && Boolean(target) && Boolean(pool);
  const store = pool ? createSubscriptionStore(pool) : null;
  const repository = pool ? new PostgresPublishedRepository(pool) : null;
  let status = { state: enabled ? "pending" : "off" };
  let lastMessage = null;
  const loggedProblems = new Set();
  let lastReport = null;
  let lastReportAt = 0;
  const note = (level, message) => {
    if (message === lastMessage) return;
    lastMessage = message;
    log[level](message);
  };
  async function sync() {
    if (!enabled) return { outcome: "skipped" };
    try {
      const result = await runSubjectsSync({ client: target, store, repository });
      status = {
        state: result.outcome,
        at: new Date(now()).toISOString(),
        through: result.through ?? null,
        head: result.head ?? null,
        blocked: result.blocked || result.hold || null
      };
      for (const line of result.applied || []) log.log(`Subjects sync: ${line}`);
      for (const problem of result.problems || []) {
        const message = `Subjects sync: ${problem.code}: ${problem.reason}`;
        if (loggedProblems.has(message)) continue;
        loggedProblems.add(message);
        log.error(message);
      }
      if (result.outcome === "bootstrap-held") {
        note("error", `Subjects sync bootstrap held (retrying): ${result.hold.code}: ${result.hold.reason}`);
        return result;
      }
      if (result.outcome === "held") {
        note("error", `Subjects sync held at change ${result.blocked.at} (${result.blocked.code}): ${result.blocked.reason}`);
      } else {
        lastMessage = null;
      }
      if (result.outcome === "rebuilt") return result;
      const key = JSON.stringify([result.log, result.through, result.blocked || null]);
      if (key !== lastReport || now() - lastReportAt >= HEARTBEAT_MS) {
        await reportProgress(target, result);
        lastReport = key;
        lastReportAt = now();
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      status = { ...status, state: "failed", at: new Date(now()).toISOString(), error: message };
      note("error", `Subjects sync failed (retrying): ${message}`);
      return { outcome: "failed", error: message };
    }
  }
  sync.status = () => ({ ...status });
  return sync;
}
