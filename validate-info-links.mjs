import { PUZZLES } from "./puzzles/index.js";
import { CATEGORIES } from "./puzzles/categories.js";
import { CATALOGUES } from "./catalogues/index.js";
import { resolveLink } from "./modules/termInfo.js";

let ok = true;
const fail = (location, message) => {
  console.log(`${location}: ${message}`);
  ok = false;
};

function validateInfo(raw, location) {
  if (raw === undefined || raw === null) return;
  if (typeof raw === "string") {
    if (!raw.trim()) fail(location, "info string must not be empty");
    return;
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    fail(location, "info must be a string or object");
    return;
  }

  if (raw.text !== undefined &&
      (typeof raw.text !== "string" || !raw.text.trim())) {
    fail(location, "text must be a non-empty string when present");
  }

  for (const field of ["link", "extraLink"]) {
    if (raw[field] !== undefined &&
        (typeof raw[field] !== "string" || !raw[field].trim())) {
      fail(location, `${field} must be a non-empty string when present`);
    }
  }

  if (raw.linkLabel !== undefined) {
    if (typeof raw.linkLabel !== "string" || !raw.linkLabel.trim()) {
      fail(location, "linkLabel must be a non-empty string when present");
    }
    const hasPrimary = (typeof raw.link === "string" && raw.link.trim())
      || (Array.isArray(raw.links) && raw.links.length);
    if (!hasPrimary) {
      fail(location, "linkLabel requires link or links");
    }
  }

  if (raw.links !== undefined &&
      (!Array.isArray(raw.links) || raw.links.length === 0)) {
    fail(location, "links must be a non-empty array when present");
  }

  if (raw.seeAlso !== undefined &&
      (!Array.isArray(raw.seeAlso) || raw.seeAlso.length === 0)) {
    fail(location, "seeAlso must be a non-empty array when present");
  }

  const destinations = new Map();
  const addDestination = (rawHref, field) => {
    if (typeof rawHref !== "string" || !rawHref.trim()) return;
    const href = resolveLink(rawHref);
    if (!href) {
      fail(location, `${field} must resolve to a non-empty destination`);
      return;
    }
    const earlier = destinations.get(href);
    if (earlier) {
      fail(location, `${field} duplicates ${earlier}`);
      return;
    }
    destinations.set(href, field);
  };

  const addList = (list, prefix, requireLabel = false) => {
    if (!Array.isArray(list)) return;
    list.forEach((entry, index) => {
      const field = `${prefix}[${index}]`;
      if (typeof entry === "string") {
        if (!entry.trim()) fail(location, `${field} must not be empty`);
        addDestination(entry, field);
        return;
      }
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        fail(location, `${field} must be a string or { href, label? } object`);
        return;
      }
      if (typeof entry.href !== "string" || !entry.href.trim()) {
        fail(location, `${field}.href must be a non-empty string`);
      }
      if (entry.label !== undefined || requireLabel) {
        if (typeof entry.label !== "string" || !entry.label.trim()) {
          fail(location, `${field}.label must be a non-empty string` +
            (requireLabel ? "" : " when present"));
        }
      }
      addDestination(entry.href, `${field}.href`);
    });
  };

  addDestination(raw.link, "link");
  addDestination(raw.extraLink, "extraLink");
  addList(raw.links, "links");

  if (Array.isArray(raw.seeAlso)) {
    raw.seeAlso.forEach((entry, index) => {
      const field = `seeAlso[${index}]`;
      if (typeof entry === "string") {
        if (!entry.trim()) fail(location, `${field} must not be empty`);
        addDestination(entry, field);
        return;
      }
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        fail(location, `${field} must be a string or { href, label } object`);
        return;
      }
      if (typeof entry.href !== "string" || !entry.href.trim()) {
        fail(location, `${field}.href must be a non-empty string`);
      }
      if (typeof entry.label !== "string" || !entry.label.trim()) {
        fail(location, `${field}.label must be a non-empty string`);
      }
      addDestination(entry.href, `${field}.href`);
    });
  }
}

for (const puzzle of PUZZLES) {
  const root = `puzzle:${puzzle.id}`;
  validateInfo(puzzle.info, `${root}.info`);
  validateInfo(puzzle.relatedPuzzles?.info, `${root}.relatedPuzzles.info`);
  puzzle.clusters.forEach((cluster, clusterIndex) => {
    const clusterRoot = `${root}.clusters[${clusterIndex}]`;
    validateInfo(cluster.info, `${clusterRoot}.info`);
    for (const [term, info] of Object.entries(cluster.termInfo || {})) {
      validateInfo(info, `${clusterRoot}.termInfo[${JSON.stringify(term)}]`);
    }
  });
  (puzzle.bridges || []).forEach((bridge, bridgeIndex) => {
    validateInfo(bridge.info, `${root}.bridges[${bridgeIndex}].info`);
  });
}

for (const [name, entry] of Object.entries(CATEGORIES)) {
  validateInfo(entry.info, `category:${name}.info`);
}
for (const catalogue of CATALOGUES) {
  validateInfo(catalogue.info, `catalogue:${catalogue.id}.info`);
}

if (!ok) process.exit(1);
console.log("Validated information links.");
