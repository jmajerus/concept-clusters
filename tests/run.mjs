// Minimal test runner — no framework, matching validate.mjs's own
// plain-Node style. Add a new test by writing a module that exports
// `name` and an async `run(page, baseURL)`, then listing it below.
// A module can also export `viewport` ({ width, height }) to run at a
// non-default size — see mobile-layout.mjs for a real example.
//
// Three suites, selected by CLI flag (see package.json). Each tier earns
// its name by its budget, and a tier that blows its budget has to shed a
// test, not keep the name:
//   quick    (`npm run test:quick`) -- under roughly 15 seconds. Node-only:
//            no Chromium, no dev server. Engines, schemas, canonicalization,
//            freeze planning, draft review rendering, MCP tool contracts.
//   standard (`npm test`) -- under roughly 60 seconds. Quick plus the
//            routinely affordable browser tests and the process-spawning
//            local dev checks. The everyday pre-commit run.
//   extended (`npm run test:extended`) -- every test, no budget: corpus-wide
//            browser sweeps, layout-quality searches, broad navigation
//            scenarios, and the JSON-LD interchange tests (JSON-LD is a
//            roadmap item, not an operational feature, so its tests are
//            extended-only by decision, not by cost).
// `npm run test:all` remains a compatibility alias for extended.
//
// Every suite also accepts `--side=play`, `--side=authoring`, or
// `--side=shared`. Play and authoring slices include shared tests; the shared
// slice is available when only cross-cutting infrastructure is relevant.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { startServer, serverURL } from "./lib/server.mjs";
import * as smoke from "./smoke.mjs";
import * as solution from "./solution.mjs";
import * as layoutSanity from "./layout-sanity.mjs";
import * as mobileLayout from "./mobile-layout.mjs";
import * as sharing from "./sharing.mjs";
import * as bridgeOptional from "./bridge-optional.mjs";
import * as contentValidation from "./content-validation.mjs";
import * as nAryBridges from "./n-ary-bridges.mjs";
import * as bridgeDirection from "./bridge-direction.mjs";
import * as canonicalBridgeEndpoints from "./canonical-bridge-endpoints.mjs";
import * as starDetangle from "./star-detangle.mjs";
import * as starPrettyPrint from "./star-pretty-print.mjs";
import * as starLayoutAuthoring from "./star-layout-authoring.mjs";
import * as layoutAuthoringModes from "./layout-authoring-modes.mjs";
import * as starFreeStrip from "./star-free-strip.mjs";
import * as playerSessions from "./player-sessions.mjs";
import * as circlePrettyPrint from "./circle-pretty-print.mjs";
import * as graphPrettyPrint from "./graph-pretty-print.mjs";
import * as disconnectedLayoutQuality from "./disconnected-layout-quality.mjs";
import * as conceptLenses from "./concept-lenses.mjs";
import * as lensEngine from "./lens-engine.mjs";
import * as lensAssignment from "./lens-assignment.mjs";
import * as lensQuiz from "./lens-quiz.mjs";
import * as learningIntroductionEngine from "./learning-introduction-engine.mjs";
import * as learningIntroduction from "./learning-introduction.mjs";
import * as jsonLdEngine from "./jsonld-engine.mjs";
import * as jsonLdCli from "./jsonld-cli.mjs";
import * as simplifiedPuzzleSchema from "./simplified-puzzle-schema.mjs";
import * as puzzleSymmetryFlags from "./puzzle-symmetry-flags.mjs";
import * as nodeCaseAudit from "./node-case-audit.mjs";
import * as learningLevel from "./learning-level.mjs";
import * as domainCatalogues from "./domain-catalogues.mjs";
import * as contentServices from "./content-services.mjs";
import * as authoringBoard from "./authoring-board.mjs";
import * as catalogueAuthorEngine from "./catalogue-author-engine.mjs";
import * as catalogueReviewPage from "./catalogue-review-page.mjs";
import * as authoringAdminIndex from "./authoring-admin-index.mjs";
import * as localCatalogueReview from "./local-catalogue-review.mjs";
import * as contentDocuments from "./content-documents.mjs";
import * as contentDocumentCitations from "./content-document-citations.mjs";
import * as categoryRenamePreviousTitles from "./category-rename-previous-titles.mjs";
import * as categoryRenamePropagation from "./category-rename-propagation.mjs";
import * as categoryReferenceMigration from "./category-reference-migration.mjs";
import * as contentCanonicalization from "./content-canonicalization.mjs";
import * as contentFreezePlan from "./content-freeze-plan.mjs";
import * as contentFreezeApply from "./content-freeze-apply.mjs";
import * as freezePublication from "./freeze-publication.mjs";
import * as githubProductionManifest from "./github-production-manifest.mjs";
import * as authorEngine from "./author-engine.mjs";
import * as draftReviewPage from "./draft-review-page.mjs";
import * as draftReviewDiff from "./draft-review-diff.mjs";
import * as draftReviewEdit from "./draft-review-edit.mjs";
import * as localDraftReview from "./local-draft-review.mjs";
import * as draftIdRename from "./draft-id-rename.mjs";
import * as mcpAuthoring from "./mcp-authoring.mjs";
import * as mcpAuthoringDomains from "./mcp-authoring-domains.mjs";
import * as mcpAuthoringContract from "./mcp-authoring-contract.mjs";
import * as mcpAuthoringAnalytics from "./mcp-authoring-analytics.mjs";
import * as mcpTaxonomy from "./mcp-taxonomy.mjs";
import * as mcpClientIdentity from "./mcp-client-identity.mjs";
import * as mcpCallInvocation from "./mcp-call-invocation.mjs";
import * as authoringProvenance from "./authoring-provenance.mjs";
import * as modelSuggestions from "./model-suggestions.mjs";
import * as authoringPuzzleSearch from "./authoring-puzzle-search.mjs";
import * as authoringInventoryCompleteness from "./authoring-inventory-completeness.mjs";
import * as authoringFitCompleteness from "./authoring-fit-completeness.mjs";
import * as authoringIntegratedCompleteness from "./authoring-integrated-completeness.mjs";
import * as authoringPlanBoards from "./authoring-plan-boards.mjs";
import * as puzzleBoardSize from "./puzzle-board-size.mjs";
import * as authoringSplitBoardPlanner from "./authoring-split-board-planner.mjs";
import * as authoringAssistanceLog from "./authoring-assistance-log.mjs";
import * as authoringChangeScore from "./authoring-change-score.mjs";
import * as authoringDomains from "./authoring-domains.mjs";
import * as authoringFieldOwnership from "./authoring-field-ownership.mjs";
import * as draftDomainColumns from "./draft-domain-columns.mjs";
import * as localGitHubConfig from "./local-github-config.mjs";
import * as localD1Workspace from "./local-d1-workspace.mjs";
import * as loadProjectEnv from "./load-project-env.mjs";
import * as authoringWorkspace from "./authoring-workspace.mjs";
import * as stagingPlayLinks from "./staging-play-links.mjs";
import * as localDevHttp from "./local-dev-http.mjs";
import * as localDevHousekeep from "./local-dev-housekeep.mjs";
import * as boot from "./boot.mjs";
import * as puzzleManifest from "./puzzle-manifest.mjs";
import * as playCorpus from "./play-corpus.mjs";
import * as catalogues from "./catalogues.mjs";
import * as metaCatalogues from "./meta-catalogues.mjs";
import * as multiCategory from "./multi-category.mjs";
import * as subcategories from "./subcategories.mjs";
import * as domains from "./domains.mjs";
import * as infoLinks from "./info-links.mjs";
import * as librarySearch from "./library-search.mjs";
import * as librarySearchEngine from "./library-search-engine.mjs";
import * as geometryVisibleSegment from "./geometry-visible-segment.mjs";
import * as singleClusterLayout from "./single-cluster-layout.mjs";
import * as nonCryptographicHash from "./non-cryptographic-hash.mjs";
import * as skillRevisionStamp from "./skill-revision-stamp.mjs";
import * as wikiLinkCheck from "./wiki-link-check.mjs";

const allTests = [
  mcpAuthoringDomains,
  smoke, solution, layoutSanity, mobileLayout, sharing, bridgeOptional, contentValidation, nAryBridges, bridgeDirection, canonicalBridgeEndpoints,
  starDetangle, starPrettyPrint, starLayoutAuthoring, layoutAuthoringModes, starFreeStrip, playerSessions,
  circlePrettyPrint, graphPrettyPrint, disconnectedLayoutQuality,
  conceptLenses, lensEngine, lensAssignment, lensQuiz, catalogues, metaCatalogues,
  learningIntroductionEngine, learningIntroduction,
  jsonLdEngine, jsonLdCli, simplifiedPuzzleSchema, puzzleSymmetryFlags, nodeCaseAudit, learningLevel, contentServices, authoringBoard, authorEngine, catalogueAuthorEngine, catalogueReviewPage, authoringAdminIndex, draftReviewPage, draftReviewDiff, draftReviewEdit, localDraftReview, draftIdRename, localCatalogueReview, contentDocuments, contentDocumentCitations, categoryRenamePreviousTitles, categoryRenamePropagation, contentFreezePlan, contentFreezeApply, freezePublication, githubProductionManifest,   mcpAuthoring, mcpAuthoringContract, mcpAuthoringAnalytics, mcpTaxonomy, mcpClientIdentity, mcpCallInvocation, authoringProvenance, modelSuggestions, authoringPuzzleSearch, authoringInventoryCompleteness, authoringFitCompleteness, authoringIntegratedCompleteness, authoringPlanBoards, puzzleBoardSize, authoringSplitBoardPlanner, authoringAssistanceLog, authoringChangeScore, authoringDomains, authoringFieldOwnership, draftDomainColumns, localGitHubConfig, localD1Workspace, loadProjectEnv, authoringWorkspace, stagingPlayLinks, localDevHttp, localDevHousekeep, boot, puzzleManifest, playCorpus,
  multiCategory, subcategories, domains, infoLinks, librarySearch, librarySearchEngine,
  categoryReferenceMigration,
  contentCanonicalization,
  geometryVisibleSegment, singleClusterLayout,
  nonCryptographicHash,
  skillRevisionStamp,
  wikiLinkCheck
];

// Keep these lists intentional rather than making every new test quick or
// standard by default. Adding a test to allTests guarantees extended
// coverage; add it to standardTests when it is routinely affordable, and to
// quickTests only if it never touches the browser or the dev server.
const quickTests = [
  mcpAuthoringDomains, lensEngine, learningIntroductionEngine, simplifiedPuzzleSchema,
  puzzleSymmetryFlags, nodeCaseAudit, learningLevel, domainCatalogues, contentServices, authoringBoard, authorEngine,
  catalogueAuthorEngine, catalogueReviewPage, draftReviewPage, draftReviewDiff, draftReviewEdit, localDraftReview, draftIdRename,
  contentDocuments, contentDocumentCitations, categoryRenamePreviousTitles, categoryRenamePropagation, contentFreezePlan, contentFreezeApply,
  freezePublication, githubProductionManifest, mcpAuthoring, mcpAuthoringContract, mcpAuthoringAnalytics, mcpTaxonomy,
  mcpClientIdentity, mcpCallInvocation, authoringProvenance, modelSuggestions, authoringPuzzleSearch, authoringInventoryCompleteness,
  authoringFitCompleteness, authoringIntegratedCompleteness, authoringPlanBoards, puzzleBoardSize, authoringSplitBoardPlanner, authoringChangeScore,
  authoringDomains, authoringFieldOwnership, draftDomainColumns, localGitHubConfig, localD1Workspace, loadProjectEnv,
  authoringWorkspace, stagingPlayLinks, boot, puzzleManifest, librarySearchEngine, geometryVisibleSegment,
  singleClusterLayout,
  categoryReferenceMigration, contentCanonicalization, nonCryptographicHash, skillRevisionStamp, wikiLinkCheck
];

const standardTests = [
  ...quickTests,
  mobileLayout, bridgeOptional, nAryBridges, bridgeDirection, canonicalBridgeEndpoints, starFreeStrip,
  authoringAdminIndex, localCatalogueReview, localDevHttp, localDevHousekeep, playCorpus
];

// Side ownership is intentionally kept here, next to the suite membership,
// so adding a test cannot silently make one side's command incomplete. A
// shared test is included in both play and authoring slices because it checks
// a contract consumed by both surfaces.
const sideTests = {
  play: new Set([
    smoke, solution, layoutSanity, mobileLayout, sharing,
    bridgeOptional, nAryBridges, bridgeDirection, canonicalBridgeEndpoints,
    starDetangle, starPrettyPrint, playerSessions,
    circlePrettyPrint, graphPrettyPrint, disconnectedLayoutQuality,
    conceptLenses, lensEngine, lensAssignment, lensQuiz,
    catalogues, metaCatalogues, learningIntroduction,
    learningIntroductionEngine, learningLevel, domainCatalogues,
    multiCategory, subcategories, domains, infoLinks,
    librarySearch, librarySearchEngine, boot, puzzleManifest,
    starFreeStrip, playCorpus, geometryVisibleSegment, singleClusterLayout
  ]),
  authoring: new Set([
    mcpAuthoringDomains, starLayoutAuthoring, layoutAuthoringModes,
    starFreeStrip, puzzleSymmetryFlags, nodeCaseAudit, contentServices,
    authoringBoard, authorEngine, catalogueAuthorEngine, catalogueReviewPage,
    authoringAdminIndex, draftReviewPage, draftReviewDiff, draftReviewEdit,
    localDraftReview, draftIdRename, localCatalogueReview, contentDocuments,
    contentDocumentCitations, categoryRenamePreviousTitles,
    categoryRenamePropagation, contentFreezePlan, contentFreezeApply,
    freezePublication, githubProductionManifest, mcpAuthoring,
    mcpAuthoringContract, mcpAuthoringAnalytics, mcpTaxonomy,
    mcpClientIdentity, mcpCallInvocation, authoringProvenance,
    modelSuggestions, authoringPuzzleSearch, authoringInventoryCompleteness,
    authoringFitCompleteness, authoringIntegratedCompleteness,
    authoringPlanBoards, puzzleBoardSize, authoringSplitBoardPlanner,
    authoringAssistanceLog, authoringChangeScore, authoringDomains,
    authoringFieldOwnership, draftDomainColumns, localGitHubConfig,
    localD1Workspace, loadProjectEnv, authoringWorkspace, stagingPlayLinks,
    localDevHttp, localDevHousekeep, playCorpus, domains, wikiLinkCheck
  ]),
  shared: new Set([
    contentValidation,
    jsonLdEngine, jsonLdCli, simplifiedPuzzleSchema,
    categoryReferenceMigration, contentCanonicalization,
    nonCryptographicHash, skillRevisionStamp,
    puzzleBoardSize, geometryVisibleSegment, wikiLinkCheck
  ])
};

const classifiedTests = new Set([
  ...sideTests.play,
  ...sideTests.authoring,
  ...sideTests.shared
]);
const unclassifiedTests = allTests.filter(test => !classifiedTests.has(test));
if (unclassifiedTests.length) {
  throw new Error(
    `Missing side classification for: ${unclassifiedTests.map(test => test.name).join(", ")}`
  );
}

const SUITES = {
  "--quick": ["quick", quickTests],
  "--standard": ["standard", standardTests],
  "--extended": ["extended", allTests],
  "--all": ["extended", allTests]
};

let suiteFlag = "--standard";
let side = null;
// Browser and process-spawning tests mostly wait on I/O, so several can be
// in flight at once in this one Node process; each gets its own page in its
// own context, the static server is stateless, and the spawning tests pick
// free ports and kill only their own children. `--lanes=1` (or TEST_LANES=1)
// restores the old one-at-a-time order when chasing a suspected
// cross-test interaction.
let lanes = Number(process.env.TEST_LANES) || 4;
const args = process.argv.slice(2);
for (let index = 0; index < args.length; index++) {
  const arg = args[index];
  if (Object.hasOwn(SUITES, arg)) {
    if (suiteFlag !== "--standard" && suiteFlag !== arg) {
      throw new Error(`Choose only one test suite: ${args.join(" ")}`);
    }
    suiteFlag = arg;
    continue;
  }
  if (arg === "--side") {
    if (side !== null) throw new Error("Specify --side only once");
    side = args[++index];
    if (!side) throw new Error("--side requires play, authoring, or shared");
    continue;
  }
  if (arg.startsWith("--side=")) {
    if (side !== null) throw new Error("Specify --side only once");
    side = arg.slice("--side=".length);
    continue;
  }
  if (arg.startsWith("--lanes=")) {
    lanes = Number(arg.slice("--lanes=".length));
    if (!Number.isInteger(lanes) || lanes < 1) throw new Error("--lanes needs a positive integer");
    continue;
  }
  throw new Error(`Unknown test-runner argument: ${arg}`);
}

if (side !== null && !Object.hasOwn(sideTests, side)) {
  throw new Error(`Unknown test side: ${side}; use play, authoring, or shared`);
}

const [which, suite] = SUITES[suiteFlag];
const selectedTests = side === null
  ? suite
  : suite.filter(test => sideTests[side].has(test) ||
      (side !== "shared" && sideTests.shared.has(test)));
if (!selectedTests.length) {
  throw new Error(`${which} suite has no tests for the ${side} side`);
}
console.log(`Running ${which}${side ? ` (${side} side)` : ""} suite (${selectedTests.length}/${suite.length} tests)\n`);

const DEFAULT_VIEWPORT = { width: 1400, height: 900 };
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// The quick suite is node-only: no server, no browser. A quick test that
// reaches for the page gets a clear failure, not a hang or a null error.
const headless = which === "quick";
const noBrowserPage = new Proxy({}, {
  get(_target, property) {
    if (property === "then") return undefined;
    throw new Error(
      `quick suite has no browser (page.${String(property)} was used); move this test to standardTests`
    );
  }
});

// Node-only tests run first, one at a time, while the server and Chromium
// come up behind them; the rest drain from one queue across the lanes,
// heaviest first (a test exports `heavy = true`) so the longest one is not
// the last to start.
const nodeOnly = new Set(quickTests);
const phaseOne = selectedTests.filter(test => nodeOnly.has(test));
const phaseTwo = selectedTests.filter(test => !nodeOnly.has(test))
  .sort((left, right) => Number(Boolean(right.heavy)) - Number(Boolean(left.heavy)));

const suiteStart = Date.now();
let failed = 0;
async function runOne(test, page, baseURL) {
  const start = Date.now();
  try {
    await test.run(page, baseURL);
    console.log(`ok   ${test.name} (${Date.now() - start}ms)`);
  } catch (err) {
    failed++;
    console.log(`FAIL ${test.name} (${Date.now() - start}ms)`);
    console.log(err.message.split("\n").map(l => `     ${l}`).join("\n"));
  }
}

const browserReady = headless || !phaseTwo.length
  ? null
  : Promise.all([startServer(root), chromium.launch()]);

for (const test of phaseOne) await runOne(test, noBrowserPage, null);

let server = null;
let browser = null;
if (browserReady) {
  [server, browser] = await browserReady;
  const baseURL = serverURL(server);
  const queue = [...phaseTwo];
  const laneCount = Math.min(lanes, queue.length);
  await Promise.all(Array.from({ length: laneCount }, async () => {
    while (queue.length) {
      const test = queue.shift();
      const page = await browser.newPage({ viewport: test.viewport || DEFAULT_VIEWPORT });
      try {
        await runOne(test, page, baseURL);
      } finally {
        await page.close();
      }
    }
  }));
}

if (browser) await browser.close();
if (server) server.close();

const seconds = ((Date.now() - suiteStart) / 1000).toFixed(1);
console.log(`\n${selectedTests.length - failed}/${selectedTests.length} passed in ${seconds}s${
  browserReady ? ` (${Math.min(lanes, phaseTwo.length)} lane${lanes === 1 ? "" : "s"})` : ""}`);
process.exit(failed ? 1 : 0);
