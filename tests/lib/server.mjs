// Tiny static file server shared by local development and tests. The
// project has no build step, but it still needs to serve index.html and
// friends over http:// (not file://, which the browser blocks
// script-to-script fetches from for some of what the game does).
// Deliberately hand-rolled instead of an extra dependency: this project
// has exactly one (Playwright, for driving the browser), and a static
// file server is little enough code not to need a second.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

export function startServer(root, { host = "127.0.0.1", port = 0 } = {}) {
  const server = createServer(async (req, res) => {
    const urlPath = req.url.split("?")[0];
    // Mirrors the real Worker's /api/event route (src/worker.js) just
    // enough that game.js's fire-and-forget analytics call doesn't 404
    // during tests — a 404 here still gets logged as a console error by
    // the browser itself regardless of how gracefully the client catches
    // it, which was failing the "zero console errors" assertion.
    if (req.method === "POST" && urlPath === "/api/event") {
      res.writeHead(204);
      res.end();
      return;
    }
    const relative = normalize(urlPath === "/" ? "/index.html" : urlPath);
    if (relative.includes("..")) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      const data = await readFile(join(root, relative));
      res.writeHead(200, { "Content-Type": MIME_TYPES[extname(relative)] || "application/octet-stream" });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(port, host, () => resolve(server));
  });
}

export function serverURL(server) {
  return `http://127.0.0.1:${server.address().port}`;
}
