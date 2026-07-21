import { readFileSync } from "fs";

const src = readFileSync("puzzles.js", "utf8");
eval(src.replace("const PUZZLES", "globalThis.PUZZLES"));

let ok = true;
const fail = (id, msg) => { console.log(`${id}: ${msg}`); ok = false; };

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

for (const p of PUZZLES) {
  if (!p.category) fail(p.id, "missing category");
  if (p.clusters.length < 2 || p.clusters.length > 4) fail(p.id, `bad cluster count (${p.clusters.length})`);

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
  });

  for (const b of p.bridges) {
    if (allTerms.has(b.term)) fail(p.id, `bridge term duplicates a cluster term: "${b.term}"`);
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
