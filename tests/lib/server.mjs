// Tiny static file server for tests — the project has no build step and
// no server of its own, so tests need somewhere to serve index.html and
// friends from over http:// (not file://, which the browser blocks
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
  ".json": "application/json; charset=utf-8"
};

export function startServer(root) {
  const server = createServer(async (req, res) => {
    const urlPath = req.url.split("?")[0];
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
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

export function serverURL(server) {
  return `http://127.0.0.1:${server.address().port}`;
}
