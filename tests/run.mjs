// Minimal test runner — no framework, matching validate.mjs's own
// plain-Node style. Add a new test by writing a module that exports
// `name` and an async `run(page, baseURL)`, then listing it below.
// A module can also export `viewport` ({ width, height }) to run at a
// non-default size — see mobile-layout.mjs for a real example.
//
// Two tiers, selected by CLI flag (`npm test` / `npm run test:extended`
// / `npm run test:all` — see package.json): `standard` (the default —
// fast correctness/regression checks, meant to be cheap enough to run
// routinely) and `extended` (the layout-quality searches — Star/Graph/
// Circle pretty-print, the Star detangler — plus `solution`, which is
// standard in *purpose* but triggers those same searches 56 puzzles x
// 3 modes over, making it by far the single slowest file here even
// though what it's actually asserting is unrelated to layout quality).
// A module defaults to "standard" if it doesn't export `tier`.
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
import * as nAryBridges from "./n-ary-bridges.mjs";
import * as bridgeDirection from "./bridge-direction.mjs";
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
import * as contentServices from "./content-services.mjs";
import * as draftReviewPage from "./draft-review-page.mjs";
import * as mcpAuthoring from "./mcp-authoring.mjs";
import * as mcpAuthoringAnalytics from "./mcp-authoring-analytics.mjs";
import * as catalogues from "./catalogues.mjs";
import * as metaCatalogues from "./meta-catalogues.mjs";
import * as multiCategory from "./multi-category.mjs";
import * as subcategories from "./subcategories.mjs";
import * as domains from "./domains.mjs";
import * as infoLinks from "./info-links.mjs";
import * as librarySearch from "./library-search.mjs";
import * as geometryVisibleSegment from "./geometry-visible-segment.mjs";

const allTests = [
  smoke, solution, layoutSanity, mobileLayout, sharing, bridgeOptional, nAryBridges, bridgeDirection,
  starDetangle, starPrettyPrint, starLayoutAuthoring, starFreeStrip, playerSessions,
  circlePrettyPrint, graphPrettyPrint, disconnectedLayoutQuality,
  conceptLenses, lensEngine, lensAssignment, lensQuiz, catalogues, metaCatalogues,
  learningIntroductionEngine, learningIntroduction,
  jsonLdEngine, jsonLdCli, simplifiedPuzzleSchema, puzzleSymmetryFlags, contentServices, draftReviewPage, mcpAuthoring, mcpAuthoringAnalytics,
  multiCategory, subcategories, domains, infoLinks, librarySearch,
  geometryVisibleSegment
];

// --extended runs only the layout-search suite; --all runs everything;
// the default (no flag, what a bare `npm test` invokes) runs only
// `standard`-tier tests, so routine iteration doesn't pay for the
// slow layout-quality searches every time.
const flag = process.argv[2];
const which = flag === "--extended" ? "extended" : flag === "--all" ? "all" : "standard";
const suite = which === "all"
  ? allTests
  : allTests.filter(test => (test.tier || "standard") === which);
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
