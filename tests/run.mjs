// Minimal test runner — no framework, matching validate.mjs's own
// plain-Node style. Add a new test by writing a module that exports
// `name` and an async `run(page, baseURL)`, then listing it below.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { startServer, serverURL } from "./lib/server.mjs";
import * as smoke from "./smoke.mjs";
import * as solution from "./solution.mjs";
import * as layoutSanity from "./layout-sanity.mjs";

const suite = [smoke, solution, layoutSanity];
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const server = await startServer(root);
const baseURL = serverURL(server);
const browser = await chromium.launch();

let failed = 0;
for (const test of suite) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
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
