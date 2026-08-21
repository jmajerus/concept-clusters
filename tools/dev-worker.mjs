// Local `npm run dev:worker` entry: Wrangler for Worker routes and
// static assets, Node in front for /admin/drafts so it can use the same
// D1 HTTP client and Access owner as stdio MCP.
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { createServer, request as httpRequest } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import { createDefaultLocalDraftReviewHandler } from "../modules/localDraftReview.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
let publicPort = 8787;
let wranglerPassthrough = argv;
if (argv[0] && /^\d+$/.test(argv[0])) {
  publicPort = Number(argv[0]);
  wranglerPassthrough = argv.slice(1);
}

if (!Number.isInteger(publicPort) || publicPort < 1 || publicPort > 65535) {
  console.error(`Invalid port: ${argv[0]}`);
  process.exit(1);
}

const wranglerPort = publicPort === 8791 ? 8792 : 8791;
const wranglerArgs = [];
for (let i = 0; i < wranglerPassthrough.length; i += 1) {
  const arg = wranglerPassthrough[i];
  if (arg === "--port" || arg === "-p") {
    i += 1;
    continue;
  }
  wranglerArgs.push(arg);
}

const handleRequest = createDefaultLocalDraftReviewHandler({
  repositoryRoot: root,
  contentService: createContentInterchangeService({ repositoryRoot: root })
});

function waitForWrangler(child, port) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`Wrangler did not become ready on port ${port}`));
    }, 30000);
    let buf = "";
    function finish(error) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (error) reject(error);
      else resolve();
    }
    function onChunk(chunk) {
      buf += chunk.toString();
      if (buf.includes(`:${port}`) && /Ready on/i.test(buf)) finish();
    }
    child.stdout.on("data", chunk => {
      process.stdout.write(chunk);
      onChunk(chunk);
    });
    child.stderr.on("data", chunk => {
      process.stderr.write(chunk);
      onChunk(chunk);
    });
    child.once("error", error => finish(error));
    child.once("exit", code => {
      finish(new Error(`wrangler exited before becoming ready (code ${code})`));
    });
  });
}

function proxyHttp(req, res) {
  const headers = { ...req.headers, host: `127.0.0.1:${wranglerPort}` };
  const proxyReq = httpRequest({
    hostname: "127.0.0.1",
    port: wranglerPort,
    path: req.url,
    method: req.method,
    headers
  }, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on("error", error => {
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end(`Worker proxy error: ${error.message}`);
  });
  req.pipe(proxyReq);
}

function proxyUpgrade(req, socket, head) {
  const proxy = createConnection(wranglerPort, "127.0.0.1", () => {
    let header = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    for (const [name, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      header += `${name}: ${Array.isArray(value) ? value.join(", ") : value}\r\n`;
    }
    header += "\r\n";
    proxy.write(header);
    if (head.length) proxy.write(head);
    proxy.pipe(socket);
    socket.pipe(proxy);
  });
  proxy.on("error", () => socket.destroy());
  socket.on("error", () => proxy.destroy());
}

const wrangler = spawn(
  join(root, "node_modules", ".bin", "wrangler"),
  ["dev", "--ip", "127.0.0.1", "--port", String(wranglerPort), ...wranglerArgs],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"] }
);

try {
  await waitForWrangler(wrangler, wranglerPort);
} catch (error) {
  console.error(error.message);
  wrangler.kill("SIGTERM");
  process.exit(1);
}

const server = createServer(async (req, res) => {
  try {
    if (await handleRequest(req, res)) return;
  } catch {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Internal server error");
    }
    return;
  }
  proxyHttp(req, res);
});
server.on("upgrade", proxyUpgrade);

try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(publicPort, "127.0.0.1", resolve);
  });
} catch (error) {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${publicPort} is already in use. Try: npm run dev:worker -- 8788`);
  } else {
    console.error(error);
  }
  wrangler.kill("SIGTERM");
  process.exit(1);
}

const base = `http://127.0.0.1:${publicPort}`;
console.log(`Concept Clusters worker at ${base}`);
console.log(`Draft review: ${base}/admin/drafts`);
console.log("Press Ctrl+C to stop.");

function stop() {
  server.close();
  wrangler.kill("SIGTERM");
}

wrangler.on("exit", code => {
  server.close();
  process.exit(typeof code === "number" ? code : 0);
});
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
