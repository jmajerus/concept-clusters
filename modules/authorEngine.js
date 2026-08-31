// Pure document mutations for the graphical authoring canvas.
// Play's handleTap is not used. Gestures: add term, join cluster, create
// or extend a bridge, rename, delete, toggle seed.

import { nextBridgeTerm, nextClusterId } from "./authoringBoard.js";
import { IDENTITY_COLOR_KEYS } from "./colorPalette.js";
import { slugify } from "../puzzles/categories.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function asClusters(document) {
  return Array.isArray(document.clusters) ? document.clusters : [];
}

function asBridges(document) {
  return Array.isArray(document.bridges) ? document.bridges : [];
}

function asUnplaced(document) {
  return Array.isArray(document.unplacedTerms) ? document.unplacedTerms : [];
}

function termList(cluster) {
  const seeds = Array.isArray(cluster.seeds) ? cluster.seeds : [];
  const floating = Array.isArray(cluster.floatingTerms) ? cluster.floatingTerms : [];
  if (Array.isArray(cluster.terms) && cluster.terms.length) return [...cluster.terms];
  return [...seeds, ...floating.filter(term => !seeds.includes(term))];
}

function findClusterForTerm(document, word) {
  return asClusters(document).find(cluster => termList(cluster).includes(word)) || null;
}

function allTerms(document) {
  const words = new Set(asUnplaced(document));
  for (const cluster of asClusters(document)) {
    for (const term of termList(cluster)) words.add(term);
  }
  for (const bridge of asBridges(document)) {
    if (typeof bridge.term === "string") words.add(bridge.term);
  }
  return words;
}

function rewriteTermInfo(termInfo, from, to) {
  if (!termInfo || typeof termInfo !== "object") return termInfo;
  if (!(from in termInfo)) return termInfo;
  const next = { ...termInfo, [to]: termInfo[from] };
  delete next[from];
  return next;
}

function pruneEmptyClusters(document) {
  const kept = asClusters(document).filter(cluster => termList(cluster).length > 0);
  const keptIds = new Set(kept.map(cluster => cluster.id));
  document.clusters = kept;
  document.bridges = asBridges(document)
    .map(bridge => ({
      ...bridge,
      clusters: (bridge.clusters || []).filter(id => keptIds.has(id))
    }))
    .filter(bridge => (bridge.clusters || []).length >= 2);
}

function removeTermFromCluster(cluster, word) {
  cluster.seeds = (cluster.seeds || []).filter(term => term !== word);
  cluster.floatingTerms = (cluster.floatingTerms || []).filter(term => term !== word);
  if (Array.isArray(cluster.terms)) {
    cluster.terms = cluster.terms.filter(term => term !== word);
  }
  if (cluster.termInfo && word in cluster.termInfo) {
    const termInfo = { ...cluster.termInfo };
    delete termInfo[word];
    cluster.termInfo = Object.keys(termInfo).length ? termInfo : undefined;
  }
  if (!cluster.seeds.length && (cluster.floatingTerms || []).length) {
    cluster.seeds = [cluster.floatingTerms[0]];
    cluster.floatingTerms = cluster.floatingTerms.slice(1);
  }
}

export function prepareDocumentForSave(document) {
  const next = clone(document);
  if (Array.isArray(next.unplacedTerms) && next.unplacedTerms.length === 0) {
    delete next.unplacedTerms;
  }
  return next;
}

export function addTerm(document, rawWord) {
  const word = String(rawWord || "").trim();
  if (!word) throw new Error("Term is required");
  if (allTerms(document).has(word)) throw new Error(`Term "${word}" already exists`);
  const next = clone(document);
  next.clusters = asClusters(next);
  next.bridges = asBridges(next);
  if (!next.clusters.length) {
    next.clusters.push({
      id: nextClusterId(next.clusters),
      name: "Cluster 1",
      color: IDENTITY_COLOR_KEYS[0],
      fact: "",
      seeds: [word],
      floatingTerms: []
    });
    next.unplacedTerms = asUnplaced(next);
    return next;
  }
  next.unplacedTerms = [...asUnplaced(next), word];
  return next;
}

export function addClusterWithTerm(document, rawWord) {
  const word = String(rawWord || "").trim();
  if (!asClusters(document).length) return addTerm(document, word);
  const withTerm = addTerm(document, word);
  return promoteUnplacedToCluster(withTerm, word);
}

export function promoteUnplacedToCluster(document, word) {
  const next = clone(document);
  if (!asUnplaced(next).includes(word)) {
    throw new Error(`"${word}" is not an unplaced term`);
  }
  next.unplacedTerms = asUnplaced(next).filter(term => term !== word);
  const n = asClusters(next).length + 1;
  next.clusters = [
    ...asClusters(next),
    {
      id: nextClusterId(asClusters(next)),
      name: `Cluster ${n}`,
      color: IDENTITY_COLOR_KEYS[(n - 1) % IDENTITY_COLOR_KEYS.length],
      fact: "",
      seeds: [word],
      floatingTerms: []
    }
  ];
  return next;
}

export function joinTermToCluster(document, word, clusterId) {
  const next = clone(document);
  const target = asClusters(next).find(cluster => cluster.id === clusterId);
  if (!target) throw new Error(`Unknown cluster "${clusterId}"`);
  if (termList(target).includes(word)) return next;
  if (asBridges(next).some(bridge => bridge.term === word)) {
    throw new Error(`"${word}" is a bridge, not a cluster term`);
  }
  if (!allTerms(next).has(word)) {
    throw new Error(`Unknown term "${word}"`);
  }
  next.unplacedTerms = asUnplaced(next).filter(term => term !== word);
  for (const cluster of asClusters(next)) {
    if (cluster.id === clusterId) continue;
    removeTermFromCluster(cluster, word);
  }
  const seeds = Array.isArray(target.seeds) ? [...target.seeds] : [];
  const floating = Array.isArray(target.floatingTerms) ? [...target.floatingTerms] : [];
  if (seeds.length < 2) seeds.push(word);
  else if (!floating.includes(word)) floating.push(word);
  target.seeds = seeds;
  target.floatingTerms = floating.filter(term => !seeds.includes(term));
  pruneEmptyClusters(next);
  return next;
}

export function toggleSeed(document, word) {
  const next = clone(document);
  const cluster = findClusterForTerm(next, word);
  if (!cluster) throw new Error(`"${word}" is not in a cluster`);
  const seeds = [...(cluster.seeds || [])];
  const floating = [...(cluster.floatingTerms || [])];
  if (seeds.includes(word)) {
    if (seeds.length < 2) throw new Error("A cluster needs at least one seed");
    cluster.seeds = seeds.filter(term => term !== word);
    if (!floating.includes(word)) cluster.floatingTerms = [...floating, word];
  } else {
    if (seeds.length >= 2) {
      const demoted = seeds[1];
      cluster.seeds = [seeds[0], word];
      cluster.floatingTerms = [
        demoted,
        ...floating.filter(term => term !== word && term !== demoted)
      ];
    } else {
      cluster.seeds = [...seeds, word];
      cluster.floatingTerms = floating.filter(term => term !== word);
    }
  }
  return next;
}

export function renameTerm(document, from, rawTo) {
  const to = String(rawTo || "").trim();
  if (!from || !to) throw new Error("Both names are required");
  if (from === to) return clone(document);
  if (allTerms(document).has(to)) throw new Error(`Term "${to}" already exists`);
  const next = clone(document);
  next.unplacedTerms = asUnplaced(next).map(term => term === from ? to : term);
  for (const cluster of asClusters(next)) {
    cluster.seeds = (cluster.seeds || []).map(term => term === from ? to : term);
    cluster.floatingTerms = (cluster.floatingTerms || []).map(term => term === from ? to : term);
    if (Array.isArray(cluster.terms)) {
      cluster.terms = cluster.terms.map(term => term === from ? to : term);
    }
    if (cluster.termInfo) cluster.termInfo = rewriteTermInfo(cluster.termInfo, from, to);
  }
  for (const bridge of asBridges(next)) {
    if (bridge.term === from) bridge.term = to;
    if (bridge.idealTerms) {
      const idealTerms = {};
      for (const [clusterId, term] of Object.entries(bridge.idealTerms)) {
        idealTerms[clusterId] = term === from ? to : term;
      }
      bridge.idealTerms = idealTerms;
    }
  }
  if (Array.isArray(next.lenses)) {
    next.lenses = next.lenses.map(lens => ({
      ...lens,
      targets: Array.isArray(lens.targets)
        ? lens.targets.map(term => term === from ? to : term)
        : lens.targets,
      reasons: lens.reasons
        ? Object.fromEntries(
          Object.entries(lens.reasons).map(([term, reason]) => [
            term === from ? to : term,
            reason
          ])
        )
        : lens.reasons
    }));
  }
  return next;
}

export function deleteTerm(document, word) {
  const next = clone(document);
  next.unplacedTerms = asUnplaced(next).filter(term => term !== word);
  for (const cluster of asClusters(next)) removeTermFromCluster(cluster, word);
  pruneEmptyClusters(next);
  if (Array.isArray(next.lenses)) {
    next.lenses = next.lenses.map(lens => ({
      ...lens,
      targets: Array.isArray(lens.targets)
        ? lens.targets.filter(term => term !== word)
        : lens.targets
    }));
  }
  return next;
}

export function createBridge(document, clusterIds, rawTerm) {
  const ids = [...new Set(clusterIds)].filter(Boolean);
  if (ids.length < 2) throw new Error("A bridge needs two clusters");
  if (ids.length > 3) throw new Error("A bridge can join at most three clusters");
  const next = clone(document);
  const known = new Set(asClusters(next).map(cluster => cluster.id));
  if (ids.some(id => !known.has(id))) throw new Error("Bridge references an unknown cluster");
  const term = String(rawTerm || "").trim() || nextBridgeTerm(asBridges(next));
  if (asBridges(next).some(bridge => bridge.term === term)) {
    throw new Error(`Bridge "${term}" already exists`);
  }
  next.bridges = [
    ...asBridges(next),
    { term, clusters: ids, fact: "", termRole: "reference" }
  ];
  return next;
}

export function extendBridge(document, bridgeTerm, clusterId) {
  const next = clone(document);
  const bridge = asBridges(next).find(item => item.term === bridgeTerm);
  if (!bridge) throw new Error(`Unknown bridge "${bridgeTerm}"`);
  if (!asClusters(next).some(cluster => cluster.id === clusterId)) {
    throw new Error(`Unknown cluster "${clusterId}"`);
  }
  if (bridge.clusters.includes(clusterId)) return next;
  if (bridge.clusters.length >= 3) throw new Error("A bridge can join at most three clusters");
  bridge.clusters = [...bridge.clusters, clusterId];
  return next;
}

export function deleteBridge(document, bridgeTerm) {
  const next = clone(document);
  next.bridges = asBridges(next).filter(bridge => bridge.term !== bridgeTerm);
  return next;
}

export function renameCluster(document, clusterId, rawName) {
  const name = String(rawName || "").trim();
  if (!name) throw new Error("Cluster name is required");
  const next = clone(document);
  const cluster = asClusters(next).find(item => item.id === clusterId);
  if (!cluster) throw new Error(`Unknown cluster "${clusterId}"`);
  cluster.name = name;
  return next;
}

export function setClusterColor(document, clusterId, color) {
  if (!IDENTITY_COLOR_KEYS.includes(color)) throw new Error(`Unknown color "${color}"`);
  const next = clone(document);
  const cluster = asClusters(next).find(item => item.id === clusterId);
  if (!cluster) throw new Error(`Unknown cluster "${clusterId}"`);
  cluster.color = color;
  return next;
}

export function setClusterFact(document, clusterId, fact) {
  const next = clone(document);
  const cluster = asClusters(next).find(item => item.id === clusterId);
  if (!cluster) throw new Error(`Unknown cluster "${clusterId}"`);
  cluster.fact = String(fact || "");
  return next;
}

export function deleteCluster(document, clusterId) {
  const next = clone(document);
  const cluster = asClusters(next).find(item => item.id === clusterId);
  if (!cluster) throw new Error(`Unknown cluster "${clusterId}"`);
  next.unplacedTerms = [...asUnplaced(next), ...termList(cluster)];
  next.clusters = asClusters(next).filter(item => item.id !== clusterId);
  pruneEmptyClusters(next);
  return next;
}

export function setBridgeFact(document, bridgeTerm, fact) {
  const next = clone(document);
  const bridge = asBridges(next).find(item => item.term === bridgeTerm);
  if (!bridge) throw new Error(`Unknown bridge "${bridgeTerm}"`);
  bridge.fact = String(fact || "");
  return next;
}

export function setBridgeTermRole(document, bridgeTerm, termRole) {
  if (termRole !== "reference" && termRole !== "connector") {
    throw new Error(`Unknown term role "${termRole}"`);
  }
  const next = clone(document);
  const bridge = asBridges(next).find(item => item.term === bridgeTerm);
  if (!bridge) throw new Error(`Unknown bridge "${bridgeTerm}"`);
  bridge.termRole = termRole;
  return next;
}

export function setPuzzleChrome(document, fields) {
  const next = clone(document);
  if (fields.id != null) {
    const id = String(fields.id).trim();
    if (!id || slugify(id) !== id) throw new Error("Puzzle id must be a lowercase URL-safe slug");
    next.id = id;
  }
  if (fields.title != null) next.title = String(fields.title);
  if (fields.category != null) next.category = String(fields.category);
  if (fields.infoText != null) {
    const text = String(fields.infoText);
    next.info = { ...(next.info || {}) };
    if (text.trim()) next.info.text = text;
    else delete next.info.text;
    if (!Object.keys(next.info).length) delete next.info;
  }
  return next;
}

export function setRelatedPuzzles(document, entries) {
  const next = clone(document);
  const clean = (Array.isArray(entries) ? entries : [])
    .map(entry => ({
      id: String(entry?.id || "").trim(),
      reason: String(entry?.reason || "").trim(),
      ...(Array.isArray(entry?.via) && entry.via.filter(Boolean).length
        ? { via: entry.via.map(item => String(item).trim()).filter(Boolean) }
        : {})
    }))
    .filter(entry => entry.id && entry.reason);
  if (!clean.length) delete next.relatedPuzzles;
  else next.relatedPuzzles = { entries: clean };
  return next;
}

export function setBridgeDirection(document, bridgeTerm, direction) {
  const next = clone(document);
  const bridge = asBridges(next).find(item => item.term === bridgeTerm);
  if (!bridge) throw new Error(`Unknown bridge "${bridgeTerm}"`);
  if (!direction || direction.kind === "undirected") delete bridge.direction;
  else bridge.direction = direction;
  return next;
}

export function setIdealTerm(document, bridgeTerm, clusterId, word) {
  const next = clone(document);
  const bridge = asBridges(next).find(item => item.term === bridgeTerm);
  if (!bridge) throw new Error(`Unknown bridge "${bridgeTerm}"`);
  if (!(bridge.clusters || []).includes(clusterId)) {
    throw new Error(`Bridge "${bridgeTerm}" does not join "${clusterId}"`);
  }
  bridge.idealTerms = { ...(bridge.idealTerms || {}) };
  const label = String(word || "").trim();
  if (label) bridge.idealTerms[clusterId] = label;
  else delete bridge.idealTerms[clusterId];
  if (!Object.keys(bridge.idealTerms).length) delete bridge.idealTerms;
  return next;
}

export function setTermInfoText(document, word, text) {
  const next = clone(document);
  const cluster = findClusterForTerm(next, word);
  if (!cluster) throw new Error(`"${word}" is not in a cluster`);
  cluster.termInfo = { ...(cluster.termInfo || {}) };
  const current = cluster.termInfo[word] && typeof cluster.termInfo[word] === "object"
    ? cluster.termInfo[word]
    : {};
  if (String(text || "").trim()) cluster.termInfo[word] = { ...current, text: String(text) };
  else {
    const { text: _drop, ...rest } = current;
    cluster.termInfo[word] = rest;
    if (!Object.keys(rest).length) delete cluster.termInfo[word];
  }
  return next;
}

export function upsertLens(document, lens) {
  const next = clone(document);
  const id = typeof lens.id === "string" && slugify(lens.id) === lens.id
    ? lens.id
    : slugify(lens.id || lens.prompt || "lens");
  if (!id) throw new Error("Lens id is required");
  const entry = {
    id,
    prompt: String(lens.prompt || "").trim(),
    explanation: String(lens.explanation || "").trim(),
    ...(Array.isArray(lens.targets) ? { targets: lens.targets.filter(Boolean) } : {})
  };
  if (!entry.prompt) throw new Error("Lens prompt is required");
  if (!entry.explanation) throw new Error("Lens explanation is required");
  const lenses = Array.isArray(next.lenses) ? [...next.lenses] : [];
  const index = lenses.findIndex(item => item.id === id);
  if (index >= 0) lenses[index] = { ...lenses[index], ...entry };
  else lenses.push(entry);
  next.lenses = lenses;
  return next;
}

export function deleteLens(document, lensId) {
  const next = clone(document);
  next.lenses = (Array.isArray(next.lenses) ? next.lenses : [])
    .filter(lens => lens.id !== lensId);
  if (!next.lenses.length) delete next.lenses;
  return next;
}

export function setLearningIntroduction(document, { requirement, title, summary, text }) {
  const next = clone(document);
  const body = String(text || "");
  if (!body.trim() && !title && !summary) {
    delete next.learningIntroduction;
    return next;
  }
  next.learningIntroduction = {
    requirement: requirement === "optional" ? "optional" : "required",
    ...(title ? { title: String(title) } : {}),
    ...(summary ? { summary: String(summary) } : {}),
    content: { text: body }
  };
  return next;
}

export function describeNode(document, node) {
  if (!node) return { kind: "none" };
  if (node.unplaced || (!node.gs?.length && asUnplaced(document).includes(node.word))) {
    return { kind: "unplaced", word: node.word };
  }
  if ((node.gs || []).length > 1 || asBridges(document).some(bridge => bridge.term === node.word)) {
    const bridge = asBridges(document).find(item => item.term === node.word);
    return { kind: "bridge", word: node.word, bridge };
  }
  const cluster = findClusterForTerm(document, node.word);
  return {
    kind: "term",
    word: node.word,
    cluster,
    seed: Boolean(cluster?.seeds?.includes(node.word))
  };
}

export function interpretAuthorTap(document, selected, tapped) {
  if (!tapped) return { document, selected, message: "" };
  if (selected && selected.word === tapped.word) {
    return { document, selected: null, message: "" };
  }
  const selectedKind = selected ? describeNode(document, selected).kind : "none";
  const tappedKind = describeNode(document, tapped).kind;
  const tappedCluster = findClusterForTerm(document, tapped.word);

  if (selectedKind === "unplaced" && tappedKind === "term" && tappedCluster) {
    return {
      document: joinTermToCluster(document, selected.word, tappedCluster.id),
      selected: null,
      message: `Joined "${selected.word}" to ${tappedCluster.name}.`
    };
  }
  if (selectedKind === "bridge" && tappedKind === "term" && tappedCluster) {
    return {
      document: extendBridge(document, selected.word, tappedCluster.id),
      selected: null,
      message: `Extended "${selected.word}" to ${tappedCluster.name}.`
    };
  }
  if (selectedKind === "term" && tappedKind === "term") {
    const fromCluster = findClusterForTerm(document, selected.word);
    if (fromCluster && tappedCluster && fromCluster.id !== tappedCluster.id) {
      const existing = asBridges(document).find(bridge => {
        const ids = new Set(bridge.clusters || []);
        return ids.has(fromCluster.id) && ids.has(tappedCluster.id);
      });
      if (existing) {
        return {
          document,
          selected: null,
          message: `"${existing.term}" already joins those clusters.`
        };
      }
      return {
        document: createBridge(document, [fromCluster.id, tappedCluster.id]),
        selected: null,
        message: `Added a bridge between ${fromCluster.name} and ${tappedCluster.name}.`
      };
    }
  }
  return {
    document,
    selected: tapped,
    message: selectedKind === "unplaced"
      ? `Now tap a placed term to join "${selected.word}" to that cluster.`
      : `Selected "${tapped.word}".`
  };
}

export function createAuthorEngine() {
  return {
    addTerm,
    addClusterWithTerm,
    promoteUnplacedToCluster,
    joinTermToCluster,
    toggleSeed,
    renameTerm,
    deleteTerm,
    createBridge,
    extendBridge,
    deleteBridge,
    renameCluster,
    setClusterColor,
    setClusterFact,
    deleteCluster,
    setBridgeFact,
    setBridgeTermRole,
    setBridgeDirection,
    setIdealTerm,
    setPuzzleChrome,
    setRelatedPuzzles,
    setTermInfoText,
    upsertLens,
    deleteLens,
    setLearningIntroduction,
    describeNode,
    interpretAuthorTap,
    prepareDocumentForSave
  };
}
