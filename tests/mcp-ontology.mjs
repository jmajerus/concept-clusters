import assert from "node:assert/strict";
import {
  InMemoryTransport,
  LATEST_PROTOCOL_VERSION
} from "@modelcontextprotocol/server";
import { createHostedMcpAuthoringServer } from "../modules/hostedMcpAuthoringServer.js";
import { ONTOLOGY_SYNC_GRAPH, ONTOLOGY_SYNC_SUBJECT, ONTOLOGY_TAXONOMY_GRAPH, puzzleGraphIri } from "../modules/ontologyGraph.js";
import { OntologyStoreError } from "../modules/ontologyStore.js";

export const name = "MCP ontology tools: read-only joins across puzzles from the LAN graph";

const CC = "https://concept-clusters.org/vocab#";
const ONTOLOGY_TOOLS = ["ontology_shared_terms", "ontology_related_puzzles", "ontology_query", "ontology_status"];

async function connect(server) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  let nextId = 1;
  const pending = new Map();
  clientTransport.onmessage = message => {
    if (message.id !== undefined && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };
  const request = (method, params) => new Promise(resolve => {
    const id = nextId++;
    pending.set(id, resolve);
    clientTransport.send({ jsonrpc: "2.0", id, method, ...(params === undefined ? {} : { params }) });
  });
  await server.connect(serverTransport);
  await clientTransport.start();
  await request("initialize", {
    protocolVersion: LATEST_PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "ontology-test", version: "1.0.0" }
  });
  await clientTransport.send({ jsonrpc: "2.0", method: "notifications/initialized" });
  return {
    request,
    call: async (name, args = {}) => (await request("tools/call", { name, arguments: args })).result,
    close: async () => {
      await clientTransport.close();
      await server.close();
    }
  };
}

function server(ontology) {
  return createHostedMcpAuthoringServer({
    draftRepository: {},
    contentService: {},
    actor: { subject: "ontology-test" },
    contentDocumentsConfigured: false,
    ontology
  });
}

// Canned answers keyed by what each curated query asks for.
function stubStore(queries, datasets = []) {
  return {
    baseUrl: "http://stub",
    async select(query, options = {}) {
      queries.push(query);
      datasets.push(options.dataset ?? null);
      if (query.includes(`GRAPH <${ONTOLOGY_SYNC_GRAPH}>`)) {
        return {
          vars: ["s", "p", "o"],
          rows: [
            { s: ONTOLOGY_SYNC_SUBJECT, p: `${CC}syncedAt`, o: "2026-10-31T12:00:00Z" },
            { s: "urn:concept-clusters:puzzle:cell-energy", p: `${CC}syncedHash`, o: "v1:h" },
            { s: "urn:concept-clusters:puzzle:energy-flow", p: `${CC}syncedHash`, o: "v1:h" }
          ],
          truncated: false
        };
      }
      if (query.includes("?puzzleCount")) {
        return {
          vars: ["key", "anyLabel", "puzzleCount", "puzzles"],
          rows: [{ key: "atp", anyLabel: "ATP", puzzleCount: 2, puzzles: "urn:concept-clusters:puzzle:energy-flow|urn:concept-clusters:puzzle:cell-energy" }],
          truncated: false
        };
      }
      if (query.includes("COUNT(*) AS ?triples")) return { vars: ["triples"], rows: [{ triples: 120 }], truncated: false };
      if (query.includes("?terms")) return { vars: ["terms", "labels"], rows: [{ terms: 9, labels: 8 }], truncated: false };
      if (query.includes("SELECT ?n")) return { vars: ["n"], rows: [{ n: 1 }], truncated: false };
      // ontology_related_puzzles: the puzzle exists, links one published and
      // one missing puzzle, and shares labels with two others.
      if (query.includes("SELECT ?title WHERE")) return { vars: ["title"], rows: [{ title: "Cell energy" }], truncated: false };
      if (query.includes("cc:relatedPuzzle ?other")) {
        return {
          vars: ["other", "title"],
          rows: [
            { other: "urn:concept-clusters:puzzle:energy-flow", title: "Energy flow" },
            { other: "urn:concept-clusters:puzzle:gone", title: null }
          ],
          truncated: false
        };
      }
      if (query.includes("AS ?shared")) {
        return {
          vars: ["other", "title", "shared", "labels"],
          rows: [
            { other: "urn:concept-clusters:puzzle:energy-flow", title: "Energy flow", shared: 3, labels: "oxygen|ATP|glucose" },
            { other: "urn:concept-clusters:puzzle:breathing", title: "Breathing", shared: 1, labels: "oxygen" }
          ],
          truncated: false
        };
      }
      throw new Error(`unexpected query: ${query}`);
    }
  };
}

export async function run() {
  // Unconfigured: the tools are still listed, so the catalog is the same
  // everywhere, and each one says why it cannot answer.
  const bare = await connect(server(null));
  try {
    const listed = await bare.request("tools/list", {});
    const tools = new Map(listed.result.tools.map(tool => [tool.name, tool]));
    for (const name of ONTOLOGY_TOOLS) {
      assert.ok(tools.has(name), name);
      assert.equal(tools.get(name).annotations.readOnlyHint, true, name);
    }
    const unavailable = await bare.call("ontology_shared_terms");
    assert.equal(unavailable.isError, true);
    assert.match(unavailable.structuredContent.error, /LAN Oxigraph server/);
    const status = await bare.call("ontology_status");
    assert.equal(status.structuredContent.configured, false);
  } finally {
    await bare.close();
  }

  const queries = [];
  const datasets = [];
  const live = await connect(server({ store: stubStore(queries, datasets), pending: async () => 1 }));
  try {
    const shared = await live.call("ontology_shared_terms", { category: "biology" });
    assert.equal(shared.isError, undefined);
    assert.equal(shared.structuredContent.sync.syncedAt, "2026-10-31T12:00:00Z");
    assert.deepEqual(shared.structuredContent.terms, [
      { label: "ATP", labelKey: "atp", puzzleCount: 2, puzzles: ["cell-energy", "energy-flow"] }
    ]);
    assert.match(shared.content[0].text, /graph synced 2026-10-31T12:00:00Z/);
    const curated = queries.find(query => query.includes("?puzzleCount"));
    assert.match(curated, /urn:concept-clusters:category:biology/);
    assert.match(curated, /STRSTARTS\(STR\(\?g\), "urn:concept-clusters:graph:puzzle:"\)/);

    // Ids land inside IRIs, so anything but a slug is refused.
    const injected = await live.call("ontology_shared_terms", { category: "x> } DROP ALL #" });
    assert.equal(injected.isError, true);
    assert.match(injected.structuredContent.error, /lowercase slug/);

    const status = await live.call("ontology_status");
    assert.deepEqual(
      { ...status.structuredContent },
      {
        configured: true,
        reachable: true,
        baseUrl: "http://stub",
        syncedAt: "2026-10-31T12:00:00Z",
        puzzleGraphs: 2,
        triples: 120,
        terms: 9,
        distinctLabels: 8,
        pendingGraphUpdates: 1
      }
    );

    const related = await live.call("ontology_related_puzzles", { puzzle_id: "cell-energy" });
    assert.equal(related.isError, undefined);
    assert.deepEqual(related.structuredContent.authored, [
      { id: "energy-flow", title: "Energy flow", published: true, sharedLabelCount: 3, sharedLabels: ["ATP", "glucose", "oxygen"] },
      { id: "gone", title: null, published: false, sharedLabelCount: 0, sharedLabels: [] }
    ]);
    // An authored neighbor is not offered again as a candidate.
    assert.deepEqual(related.structuredContent.candidates, [
      { id: "breathing", title: "Breathing", sharedLabelCount: 1, sharedLabels: ["oxygen"] }
    ]);

    // The passthrough's dataset is pinned to the graphs the sync recorded.
    const select = await live.call("ontology_query", { query: "SELECT ?n WHERE { ?s ?p ?n }" });
    assert.deepEqual(select.structuredContent.rows, [{ n: 1 }]);
    const scoped = datasets[queries.findIndex(query => query === "SELECT ?n WHERE { ?s ?p ?n }")];
    const expected = [puzzleGraphIri("cell-energy"), puzzleGraphIri("energy-flow"), ONTOLOGY_TAXONOMY_GRAPH, ONTOLOGY_SYNC_GRAPH];
    assert.deepEqual(scoped, { defaultGraphs: expected, namedGraphs: expected });
    const construct = await live.call("ontology_query", { query: "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }" });
    assert.equal(construct.isError, true);
  } finally {
    await live.close();
  }

  // An outage is a status, not a tool error.
  const down = await connect(server({
    store: {
      baseUrl: "http://down",
      select: async () => { throw new OntologyStoreError("unreachable", "Oxigraph at http://down is unreachable: connect ECONNREFUSED"); }
    },
    pending: async () => 0
  }));
  try {
    const status = await down.call("ontology_status");
    assert.equal(status.isError, undefined);
    assert.equal(status.structuredContent.configured, true);
    assert.equal(status.structuredContent.reachable, false);
    assert.match(status.structuredContent.error, /ECONNREFUSED/);
    assert.equal(status.structuredContent.triples, null);
    assert.equal(status.structuredContent.pendingGraphUpdates, null);
  } finally {
    await down.close();
  }
}
