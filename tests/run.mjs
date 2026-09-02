// Minimal test runner — no framework, matching validate.mjs's own
// plain-Node style. Add a new test by writing a module that exports
// `name` and an async `run(page, baseURL)`, then listing it below.
// A module can also export `viewport` ({ width, height }) to run at a
// non-default size — see mobile-layout.mjs for a real example.
//
// Two practical suites, selected by CLI flag (`npm test` /
// `npm run test:extended` — see package.json): `quick` is the explicit,
// routinely affordable regression set; `extended` is every test. The quick
// set deliberately excludes corpus-wide browser sweeps, layout-quality
// searches, and broad navigation scenarios. `npm run test:all` remains a
// compatibility alias for the extended suite.
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
import * as learningLevel from "./learning-level.mjs";
import * as contentServices from "./content-services.mjs";
import * as authoringBoard from "./authoring-board.mjs";
import * as catalogueAuthorEngine from "./catalogue-author-engine.mjs";
import * as catalogueReviewPage from "./catalogue-review-page.mjs";
import * as authoringAdminIndex from "./authoring-admin-index.mjs";
import * as localCatalogueReview from "./local-catalogue-review.mjs";
import * as contentDocuments from "./content-documents.mjs";
import * as contentDocumentCitations from "./content-document-citations.mjs";
import * as contentFreezePlan from "./content-freeze-plan.mjs";
import * as contentFreezeApply from "./content-freeze-apply.mjs";
import * as githubProductionManifest from "./github-production-manifest.mjs";
import * as authorEngine from "./author-engine.mjs";
import * as draftReviewPage from "./draft-review-page.mjs";
import * as draftReviewDiff from "./draft-review-diff.mjs";
import * as draftReviewEdit from "./draft-review-edit.mjs";
import * as localDraftReview from "./local-draft-review.mjs";
import * as mcpAuthoring from "./mcp-authoring.mjs";
import * as mcpAuthoringContract from "./mcp-authoring-contract.mjs";
import * as mcpAuthoringAnalytics from "./mcp-authoring-analytics.mjs";
import * as mcpTaxonomy from "./mcp-taxonomy.mjs";
import * as mcpClientIdentity from "./mcp-client-identity.mjs";
import * as authoringProvenance from "./authoring-provenance.mjs";
import * as authoringPuzzleSearch from "./authoring-puzzle-search.mjs";
import * as authoringInventoryCompleteness from "./authoring-inventory-completeness.mjs";
import * as authoringFitCompleteness from "./authoring-fit-completeness.mjs";
import * as authoringPlanBoards from "./authoring-plan-boards.mjs";
import * as puzzleBoardSize from "./puzzle-board-size.mjs";
import * as authoringSplitBoardPlanner from "./authoring-split-board-planner.mjs";
import * as authoringAssistanceLog from "./authoring-assistance-log.mjs";
import * as localGitHubPublication from "./local-github-publication.mjs";
import * as localD1Workspace from "./local-d1-workspace.mjs";
import * as loadProjectEnv from "./load-project-env.mjs";
import * as authoringWorkspace from "./authoring-workspace.mjs";
import * as stagingPlayLinks from "./staging-play-links.mjs";
import * as localDevHttp from "./local-dev-http.mjs";
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

const allTests = [
  smoke, solution, layoutSanity, mobileLayout, sharing, bridgeOptional, contentValidation, nAryBridges, bridgeDirection, canonicalBridgeEndpoints,
  starDetangle, starPrettyPrint, starLayoutAuthoring, starFreeStrip, playerSessions,
  circlePrettyPrint, graphPrettyPrint, disconnectedLayoutQuality,
  conceptLenses, lensEngine, lensAssignment, lensQuiz, catalogues, metaCatalogues,
  learningIntroductionEngine, learningIntroduction,
  jsonLdEngine, jsonLdCli, simplifiedPuzzleSchema, puzzleSymmetryFlags, learningLevel, contentServices, authoringBoard, authorEngine, catalogueAuthorEngine, catalogueReviewPage, authoringAdminIndex, draftReviewPage, draftReviewDiff, draftReviewEdit, localDraftReview, localCatalogueReview, contentDocuments, contentDocumentCitations, contentFreezePlan, contentFreezeApply, githubProductionManifest, mcpAuthoring, mcpAuthoringContract, mcpAuthoringAnalytics, mcpTaxonomy, mcpClientIdentity, authoringProvenance, authoringPuzzleSearch, authoringInventoryCompleteness, authoringFitCompleteness, authoringPlanBoards, puzzleBoardSize, authoringSplitBoardPlanner, authoringAssistanceLog, localGitHubPublication, localD1Workspace, loadProjectEnv, authoringWorkspace, stagingPlayLinks, localDevHttp, boot, puzzleManifest, playCorpus,
  multiCategory, subcategories, domains, infoLinks, librarySearch, librarySearchEngine,
  geometryVisibleSegment
];

// Keep this list intentional rather than making every new test quick by
// default. Adding a test to allTests guarantees extended coverage; add it here
// only when it is both high-signal for routine edits and consistently cheap.
const quickTests = [
  mobileLayout,
  bridgeOptional, nAryBridges, bridgeDirection, canonicalBridgeEndpoints, starFreeStrip,
  lensEngine, learningIntroductionEngine,
  jsonLdEngine, jsonLdCli, simplifiedPuzzleSchema, puzzleSymmetryFlags,
  learningLevel, contentServices, authoringBoard, authorEngine, catalogueAuthorEngine, catalogueReviewPage, authoringAdminIndex, draftReviewPage, draftReviewDiff, draftReviewEdit, localDraftReview, localCatalogueReview, contentDocuments, contentDocumentCitations, contentFreezePlan, contentFreezeApply, githubProductionManifest,
  mcpAuthoring, mcpAuthoringContract, mcpAuthoringAnalytics, mcpTaxonomy, mcpClientIdentity, authoringProvenance, authoringPuzzleSearch, authoringInventoryCompleteness, authoringFitCompleteness, authoringPlanBoards, puzzleBoardSize, authoringSplitBoardPlanner, localGitHubPublication, localD1Workspace, loadProjectEnv, authoringWorkspace, stagingPlayLinks, localDevHttp, boot, puzzleManifest, playCorpus,
  librarySearchEngine, geometryVisibleSegment
];

const flag = process.argv[2];
if (flag && flag !== "--extended" && flag !== "--all") {
  throw new Error(`Unknown test-suite flag: ${flag}`);
}
const which = flag ? "extended" : "quick";
const suite = flag ? allTests : quickTests;
console.log(`Running ${which} suite (${suite.length}/${allTests.length} tests)\n`);

const DEFAULT_VIEWPORT = { width: 1400, height: 900 };
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const server = await startServer(root);
const baseURL = serverURL(server);
const browser = await chromium.launch();

let failed = 0;
for (const test of suite) {
  const page = await browser.newPage({ viewport: test.viewport || DEFAULT_VIEWPORT });
  const start = Date.now();
  try {
    await test.run(page, baseURL);
    console.log(`ok   ${test.name} (${Date.now() - start}ms)`);
  } catch (err) {
    failed++;
    console.log(`FAIL ${test.name} (${Date.now() - start}ms)`);
    console.log(err.message.split("\n").map(l => `     ${l}`).join("\n"));
  } finally {
    await page.close();
  }
}

await browser.close();
server.close();

console.log(`\n${suite.length - failed}/${suite.length} passed`);
process.exit(failed ? 1 : 0);
