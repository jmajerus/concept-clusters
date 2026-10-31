// Thin client for the shared LAN Oxigraph server: SPARQL SELECT/ASK on
// /query and Graph Store PUT/DELETE on /store. Writes name a graph and pass
// assertOwnedGraph, so this client cannot touch the default graph or another
// tool's graphs. Runtime-neutral: fetch only.

import { assertOwnedGraph } from "./ontologyGraph.js";

export const DEFAULT_ONTOLOGY_SPARQL_BASE = "http://oxigraph.localdomain:7878";
export const ONTOLOGY_ROW_CAP = 200;

// ONTOLOGY_SPARQL_BASE=off turns the store off; unset means the LAN server.
export function ontologyStoreConfig(env = {}) {
  const raw = typeof env.ONTOLOGY_SPARQL_BASE === "string" ? env.ONTOLOGY_SPARQL_BASE.trim() : "";
  if (raw.toLowerCase() === "off") return null;
  const timeout = Number(env.ONTOLOGY_TIMEOUT_MS);
  return {
    baseUrl: (raw || DEFAULT_ONTOLOGY_SPARQL_BASE).replace(/\/+$/, ""),
    timeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : 10_000
  };
}

export class OntologyStoreError extends Error {
  constructor(kind, message) {
    super(message);
    this.name = "OntologyStoreError";
    this.kind = kind;
  }
}

function bindingValue(binding) {
  if (!binding) return null;
  const { value, datatype } = binding;
  if (datatype && /#(integer|int|long|decimal|double|float)$/.test(datatype)) return Number(value);
  return value;
}

export function createOntologyStore({ baseUrl, timeoutMs = 10_000, fetchImpl = globalThis.fetch } = {}) {
  if (!baseUrl) throw new Error("An Oxigraph base URL is required");

  async function call(path, init, accept) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    let body;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        ...init,
        headers: { ...(init.headers || {}), ...(accept ? { Accept: accept } : {}) },
        signal: controller.signal
      });
      body = await response.text();
    } catch (error) {
      if (controller.signal.aborted) {
        throw new OntologyStoreError("unreachable", `Oxigraph at ${baseUrl} did not answer within ${timeoutMs} ms.`);
      }
      throw new OntologyStoreError("unreachable", `Oxigraph at ${baseUrl} is unreachable: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      clearTimeout(timer);
    }
    return { status: response.status, body };
  }

  // A dataset fixes what the query can see through the SPARQL protocol's
  // default-graph-uri and named-graph-uri, which override any FROM or FROM
  // NAMED in the query text.
  async function sparql(query, dataset = null) {
    const form = new URLSearchParams({ query });
    for (const graph of dataset?.defaultGraphs || []) form.append("default-graph-uri", graph);
    for (const graph of dataset?.namedGraphs || []) form.append("named-graph-uri", graph);
    const { status, body } = await call("/query", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString()
    }, "application/sparql-results+json");
    if (status !== 200) {
      throw new OntologyStoreError("bad-response", `Oxigraph rejected the query (HTTP ${status}): ${body.slice(0, 500)}`);
    }
    try {
      return JSON.parse(body);
    } catch {
      throw new OntologyStoreError("bad-response", "Oxigraph returned a non-JSON query result.");
    }
  }

  // Rows come back as plain { variable: value } objects, numbers parsed.
  async function select(query, { cap = ONTOLOGY_ROW_CAP, dataset = null } = {}) {
    const result = await sparql(query, dataset);
    if (typeof result.boolean === "boolean") return { vars: [], rows: [], truncated: false, boolean: result.boolean };
    const vars = result.head?.vars || [];
    const bindings = result.results?.bindings || [];
    const rows = bindings.slice(0, cap).map(binding =>
      Object.fromEntries(vars.map(name => [name, bindingValue(binding[name])]))
    );
    return { vars, rows, truncated: bindings.length > cap };
  }

  async function putGraph(graph, ntriples) {
    assertOwnedGraph(graph);
    const { status, body } = await call(`/store?graph=${encodeURIComponent(graph)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/n-triples" },
      body: ntriples
    });
    if (status < 200 || status >= 300) {
      throw new OntologyStoreError("bad-response", `Oxigraph refused graph ${graph} (HTTP ${status}): ${body.slice(0, 500)}`);
    }
  }

  async function deleteGraph(graph) {
    assertOwnedGraph(graph);
    const { status, body } = await call(`/store?graph=${encodeURIComponent(graph)}`, { method: "DELETE" });
    if (status === 404) return;
    if (status < 200 || status >= 300) {
      throw new OntologyStoreError("bad-response", `Oxigraph refused to drop graph ${graph} (HTTP ${status}): ${body.slice(0, 500)}`);
    }
  }

  return { baseUrl, select, putGraph, deleteGraph };
}
