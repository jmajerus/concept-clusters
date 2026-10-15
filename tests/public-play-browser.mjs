import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import { handlePublicPlayRequest, htmlWithPublicPlayMeta } from "../modules/publicPlayService.js";
import { startServer, serverURL } from "./lib/server.mjs";

export const name = "public D1 deep links and static fallback in browser";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const actor = { subject: "test-publisher" };

async function waitForTitle(page, title) {
  await page.waitForFunction(expected =>
    document.getElementById("puzzle-title")?.textContent?.includes(expected),
  title);
}

export async function run(page) {
  const repository = createMemoryContentDocumentRepository();
  const source = JSON.parse(await readFile(join(root, "content/puzzles/energy-flow.ccpuzzle.json")));
  await repository.publish({ kind: "category", id: "science", document: {
    id: "science", title: "Science", domain: "sciences-mathematics"
  }, actor });
  await repository.publish({ kind: "puzzle", id: source.id, document: source, actor });
  await repository.publish({ kind: "puzzle", id: "new-from-d1", document: {
    ...source, id: "new-from-d1", title: "New from D1"
  }, actor });
  let boardRequests = 0;
  let indexUnavailable = false;
  const server = await startServer(root, { handleRequest: async (req, res) => {
    const pathname = (req.url || "").split("?")[0];
    if (pathname === "/" || pathname === "/index.html") {
      const html = await readFile(join(root, "index.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(htmlWithPublicPlayMeta(html));
      return true;
    }
    if (pathname === "/api/publications" || pathname.startsWith("/api/puzzles/")) {
      if (pathname === "/api/publications" && indexUnavailable) {
        res.writeHead(503, { "Cache-Control": "no-store" });
        res.end("Publication index unavailable");
        return true;
      }
      if (pathname.startsWith("/api/puzzles/")) boardRequests += 1;
      const response = await handlePublicPlayRequest(
        new Request(`http://local.test${req.url}`), {}, { repository }
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
      return true;
    }
    return false;
  } });
  try {
    const base = serverURL(server);
    await page.goto(`${base}/?puzzle=energy-flow`);
    await waitForTitle(page, "Energy flow in living systems");
    assert.equal(boardRequests, 0, "matching frozen puzzle should load its static module");
    assert.match(
      await page.textContent("#learning-introduction #published"),
      /^First published /
    );

    await page.goto(`${base}/?puzzle=new-from-d1`);
    await waitForTitle(page, "New from D1");
    assert.equal(boardRequests, 1, "new puzzle should load its D1 board");

    await repository.publish({ kind: "puzzle", id: source.id, document: {
      ...source, title: "Corrected in D1"
    }, actor });
    await page.evaluate(() => {
      const now = Date.now();
      Date.now = () => now + 31_000;
    });
    await Promise.all([page.waitForEvent("load"), page.locator("#browse-puzzles").click()]);
    await page.waitForFunction(() => window.CC?.PUZZLES?.some(puzzle => puzzle.title === "Corrected in D1"));
    await page.goto(`${base}/?puzzle=energy-flow`);
    await waitForTitle(page, "Corrected in D1");
    assert.equal(boardRequests, 2, "corrected frozen puzzle should load its D1 board");

    await repository.unpublish({ kind: "puzzle", id: source.id, actor });
    await page.goto(`${base}/?puzzle=energy-flow`);
    await page.waitForFunction(() => !document.body.classList.contains("booting"));
    assert.notEqual(await page.locator("#puzzle-title").textContent(), "Corrected in D1");

    // With the index unreachable, play falls back to the deploy's static
    // copy and says so. That copy is as of the last freeze, so a puzzle
    // withdrawn since is still in it: the accepted cost of having a backup.
    indexUnavailable = true;
    await page.evaluate(() => {
      const now = Date.now();
      Date.now = () => now + 31_000;
    });
    await Promise.all([page.waitForEvent("load"), page.locator("#browse-puzzles").click()]);
    await page.locator("#snapshot-notice").waitFor({ state: "visible" });
    assert.match(await page.textContent("#snapshot-notice"), /last site update/);
    assert.equal(await page.locator("#boot-failure").isHidden(), true);
    await page.goto(`${base}/?puzzle=energy-flow`);
    await waitForTitle(page, "Energy flow in living systems");
    assert.equal(await page.evaluate(() => window.CC.PUZZLES.some(puzzle => puzzle.id === "new-from-d1")), false,
      "the snapshot carries only frozen puzzles");

    // While the index is down, navigation keeps the snapshot and starts one
    // background check, not one per navigation.
    let indexRequests = 0;
    page.on("request", request => {
      if (new URL(request.url()).pathname === "/api/publications") indexRequests += 1;
    });
    await page.evaluate(() => {
      const now = Date.now();
      Date.now = () => now + 31_000;
    });
    await Promise.all([
      page.waitForResponse(response => new URL(response.url()).pathname === "/api/publications"),
      page.locator("#browse-puzzles").click()
    ]);
    await page.evaluate(() => history.back());
    await page.locator("#snapshot-notice").waitFor({ state: "visible" });
    assert.equal(indexRequests, 1, "navigations inside 30 seconds share one check");

    // Once a check finds the index answering, the next navigation reloads
    // into live play.
    indexUnavailable = false;
    await page.evaluate(() => {
      const now = Date.now();
      Date.now = () => now + 62_000;
    });
    await Promise.all([
      page.waitForResponse(response => new URL(response.url()).pathname === "/api/publications" && response.ok()),
      page.evaluate(() => history.forward())
    ]);
    await page.waitForFunction(() => window.CC?.publicIndexAnswered === true);
    await Promise.all([page.waitForEvent("load"), page.evaluate(() => history.back())]);
    await page.waitForFunction(() => window.CC?.PUZZLES?.some(puzzle => puzzle.id === "new-from-d1"));
    assert.equal(await page.locator("#snapshot-notice").isHidden(), true);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}
