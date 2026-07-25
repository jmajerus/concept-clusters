import { PUZZLES } from "./puzzles/index.js";

let ok = true;
const fail = (id, msg) => { console.log(`${id}: ${msg}`); ok = false; };

// A link/extraLink value must be either the "wiki:Title" shorthand or a
// full http(s) URL — anything else is almost certainly a missing
// "wiki:" prefix (the shorthand silently rendering as a broken
// relative link) rather than an intentional value.
function checkLink(id, label, value) {
  if (!value) return;
  if (value.startsWith("wiki:") || /^https?:\/\//.test(value)) return;
  fail(id, `${label}: "${value}" is neither "wiki:Title" nor a full http(s) URL (missing the "wiki:" prefix?)`);
}

function checkInfo(id, label, raw) {
  if (!raw || typeof raw === "string") return;
  checkLink(id, `${label}.link`, raw.link);
  checkLink(id, `${label}.extraLink`, raw.extraLink);
}

function connectedComponents(p) {
  const n = p.clusters.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
  for (const b of p.bridges) union(b.clusters[0], b.clusters[1]);
  const groups = {};
  for (let i = 0; i < n; i++) (groups[find(i)] ??= []).push(p.clusters[i].name);
  return Object.values(groups);
}

const allPuzzleIds = new Set(PUZZLES.map(p => p.id));

for (const p of PUZZLES) {
  if (!p.category) fail(p.id, "missing category");
  if (p.clusters.length < 2 || p.clusters.length > 4) fail(p.id, `bad cluster count (${p.clusters.length})`);

  // relatedPuzzles is shown directly to the player (see the completion
  // screen), so a bad id or a missing reason isn't just a data-modeling
  // slip -- it's either a dead link or a bare, unexplained one. `via` is
  // NOT checked against bridge `conceptId`s below: as authored today it's
  // a loose, human-written list of shared themes, only sometimes matching
  // an actual conceptId (see the `provenance` bridges) -- enforcing a
  // strict match would fail most of the current entries, not catch a bug.
  if (p.relatedPuzzles) {
    const seenIds = new Set();
    p.relatedPuzzles.forEach((r, i) => {
      const label = `relatedPuzzles[${i}]`;
      if (!r.id) { fail(p.id, `${label}: missing id`); return; }
      if (r.id === p.id) fail(p.id, `${label}: lists itself ("${r.id}")`);
      if (seenIds.has(r.id)) fail(p.id, `relatedPuzzles: "${r.id}" listed more than once`);
      seenIds.add(r.id);
      if (!allPuzzleIds.has(r.id)) fail(p.id, `${label}: "${r.id}" is not a real puzzle id`);
      if (!r.reason || !r.reason.trim()) fail(p.id, `${label} ("${r.id}"): missing reason`);
      if (r.via !== undefined && (!Array.isArray(r.via) || r.via.length === 0)) {
        fail(p.id, `${label} ("${r.id}"): via must be a non-empty array when present`);
      }
    });
  }

  const allTerms = new Set();
  p.clusters.forEach((c, ci) => {
    if (c.terms.length < 3 || c.terms.length > 5) fail(p.id, `${c.name}: bad terms count (${c.terms.length})`);
    if (c.seeds.length !== 2) fail(p.id, `${c.name}: bad seeds count (${c.seeds.length})`);
    for (const s of c.seeds) {
      if (!c.terms.includes(s)) fail(p.id, `${c.name}: seed "${s}" not in terms`);
    }
    for (const t of c.terms) {
      if (allTerms.has(t)) fail(p.id, `duplicate term across clusters: "${t}"`);
      allTerms.add(t);
    }
    if (c.termInfo) {
      for (const [term, info] of Object.entries(c.termInfo)) {
        if (!c.terms.includes(term)) fail(p.id, `${c.name}: termInfo key "${term}" is not one of its terms`);
        checkInfo(p.id, `${c.name}.termInfo.${term}`, info);
      }
    }
    checkInfo(p.id, `${c.name}.info`, c.info);
  });

  for (const b of p.bridges) {
    if (allTerms.has(b.term)) fail(p.id, `bridge term duplicates a cluster term: "${b.term}"`);
    checkInfo(p.id, `${b.term}.info`, b.info);
    if (b.conceptId !== undefined && (typeof b.conceptId !== "string" || !b.conceptId.trim())) {
      fail(p.id, `${b.term}: conceptId must be a non-empty string`);
    }
    const [i, j] = b.clusters;
    if (i === j || i < 0 || j < 0 || i >= p.clusters.length || j >= p.clusters.length) {
      fail(p.id, `bad bridge cluster indices: ${JSON.stringify(b.clusters)}`);
    }
    if (b.idealTerms) {
      if (b.idealTerms.length !== 2) fail(p.id, `${b.term}: idealTerms must have exactly 2 entries`);
      b.idealTerms.forEach((term, k) => {
        if (term === null) return;
        const cluster = p.clusters[b.clusters[k]];
        if (!cluster || !cluster.terms.includes(term)) {
          fail(p.id, `${b.term}: idealTerms[${k}] "${term}" is not a term of cluster ${b.clusters[k]}`);
        }
      });
    }
  }

  // The design brief wants bridges to pull the finished graph into one
  // integrated whole, not separate islands — so all clusters should end
  // up in a single connected component once every bridge is counted.
  const comps = connectedComponents(p);
  if (comps.length > 1) {
    fail(p.id, `disconnected clusters (add a bridge to link them): ${JSON.stringify(comps)}`);
  }
}

console.log(ok ? `ALL CHECKS PASSED (${PUZZLES.length} puzzles)` : "CHECKS FAILED");
process.exit(ok ? 0 : 1);
