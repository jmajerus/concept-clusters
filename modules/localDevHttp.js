// Shared local HTTP bootstrap for `npm run dev`, optional Worker mode,
// and `npm run admin`. All three used to wire the draft-review handler,
// listen on 8787, and print the same EADDRINUSE copy. Wrangler stays off
// unless `--worker` or DEV_WORKER is set.
import { spawn } from "node:child_process";
import { createServer as createHttpServer, request as httpRequest } from "node:http";
import { createConnection } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createContentInterchangeService } from "./contentInterchangeService.js";
import { createDefaultLocalDraftReviewHandler } from "./localDraftReview.js";
import { loadProjectEnv } from "./loadProjectEnv.js";
import { reclaimLocalDevPort } from "./localDevHousekeep.js";
import { startServer, serverURL } from "../tests/lib/server.mjs";

const DEFAULT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8787;
const SUGGESTED_PORT = 8788;

function envFlag(value) {
  if (value == null) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export function parseListenPort(portArg, fallback = DEFAULT_PORT) {
  const raw = portArg ?? String(fallback);
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    const error = new Error(`Invalid port: ${raw}`);
    error.code = "ERR_INVALID_PORT";
    throw error;
  }
  return port;
}

export function parseLocalDevOptions(argv = [], env = process.env) {
  let worker = envFlag(env.DEV_WORKER);
  const rest = [];
  for (const arg of argv) {
    if (arg === "--" || arg === "") continue;
    if (arg === "--worker") {
      worker = true;
      continue;
    }
    rest.push(arg);
  }
  let port = DEFAULT_PORT;
  let wranglerPassthrough = rest;
  if (rest[0] !== undefined) {
    if (/^\d+$/.test(rest[0])) {
      port = parseListenPort(rest[0]);
      wranglerPassthrough = rest.slice(1);
    } else if (!worker) {
      parseListenPort(rest[0]);
    }
  }
  const wranglerArgs = [];
  for (let i = 0; i < wranglerPassthrough.length; i += 1) {
    const arg = wranglerPassthrough[i];
    if (arg === "--port" || arg === "-p") {
      i += 1;
      continue;
    }
    wranglerArgs.push(arg);
  }
  return { worker, host: DEFAULT_HOST, port, wranglerArgs };
}

export function portBusyMessage(port, tryCommand) {
  return `Port ${port} is already in use (not this repo's tools/dev-server.mjs). ` +
    `Stop that listener, or try: ${tryCommand}. ` +
    `To stop only this project's draft-review server: npm run dev:stop`;
}

export function suggestedBusyCommand({ worker = false, command = "npm run dev" } = {}) {
  if (command === "npm run admin") return `npm run admin -- ${SUGGESTED_PORT}`;
  if (worker) return `npm run dev -- --worker ${SUGGESTED_PORT}`;
  return `npm run dev -- ${SUGGESTED_PORT}`;
}

export function createLocalDevDraftHandler(repositoryRoot = DEFAULT_ROOT) {
  return createDefaultLocalDraftReviewHandler({
    repositoryRoot,
    contentService: createContentInterchangeService({ repositoryRoot })
  });
}

export function localPortInUse(port, host = DEFAULT_HOST) {
  return new Promise(resolve => {
    const socket = createConnection({ host, port }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });
}

/** Local wall-clock stamp for correlating Dev restarts with module edits. */
export function formatDevTimestamp(when = new Date()) {
  const pad = value => String(value).padStart(2, "0");
  const offsetMin = -when.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  return `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())} ` +
    `${pad(when.getHours())}:${pad(when.getMinutes())}:${pad(when.getSeconds())} ` +
    `${sign}${pad(Math.floor(abs / 60))}${pad(abs % 60)}`;
}

function printReady(base, extras = []) {
  console.log(`Started at ${formatDevTimestamp()}`);
  console.log(`Concept Clusters ready at ${base}`);
  console.log(`Draft review: ${base}/admin/drafts`);
  for (const line of extras) console.log(line);
  console.log("Press Ctrl+C to stop.");
}

function installShutdown(stop) {
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

async function listen(server, { host, port }) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
}

function rethrowBusy(error, { port, tryCommand }) {
  if (error.code === "EADDRINUSE") {
    console.error(portBusyMessage(port, tryCommand));
  }
  throw error;
}

export async function startLocalStaticDev({
  repositoryRoot = DEFAULT_ROOT,
  host = DEFAULT_HOST,
  port = DEFAULT_PORT,
  handleRequest = null,
  tryCommand = suggestedBusyCommand(),
  loadEnv = true,
  installSignals = true
} = {}) {
  if (loadEnv) loadProjectEnv({ repositoryRoot });
  const handler = handleRequest || createLocalDevDraftHandler(repositoryRoot);
  let server;
  try {
    server = await startServer(repositoryRoot, { host, port, handleRequest: handler });
  } catch (error) {
    rethrowBusy(error, { port, tryCommand });
  }
  const base = serverURL(server);
  printReady(base);
  if (installSignals) {
    installShutdown(() => server.close(() => process.exit(0)));
  }
  return { server, base, handleRequest: handler };
}

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

function proxyHttp(req, res, wranglerPort) {
  const headers = { ...req.headers, host: `${DEFAULT_HOST}:${wranglerPort}` };
  const proxyReq = httpRequest({
    hostname: DEFAULT_HOST,
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

function proxyUpgrade(req, socket, head, wranglerPort) {
  const proxy = createConnection(wranglerPort, DEFAULT_HOST, () => {
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

export async function startLocalWorkerDev({
  repositoryRoot = DEFAULT_ROOT,
  host = DEFAULT_HOST,
  port = DEFAULT_PORT,
  wranglerArgs = [],
  handleRequest = null,
  tryCommand = suggestedBusyCommand({ worker: true }),
  loadEnv = true,
  installSignals = true
} = {}) {
  if (loadEnv) loadProjectEnv({ repositoryRoot });
  const handler = handleRequest || createLocalDevDraftHandler(repositoryRoot);
  const wranglerPort = port === 8791 ? 8792 : 8791;
  const wrangler = spawn(
    join(repositoryRoot, "node_modules", ".bin", "wrangler"),
    ["dev", "--ip", DEFAULT_HOST, "--port", String(wranglerPort), ...wranglerArgs],
    { cwd: repositoryRoot, stdio: ["ignore", "pipe", "pipe"] }
  );

  try {
    await waitForWrangler(wrangler, wranglerPort);
  } catch (error) {
    console.error(error.message);
    wrangler.kill("SIGTERM");
    process.exit(1);
  }

  const server = createHttpServer(async (req, res) => {
    try {
      if (await handler(req, res)) return;
    } catch {
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Internal server error");
      }
      return;
    }
    proxyHttp(req, res, wranglerPort);
  });
  server.on("upgrade", (req, socket, head) => {
    proxyUpgrade(req, socket, head, wranglerPort);
  });

  try {
    await listen(server, { host, port });
  } catch (error) {
    wrangler.kill("SIGTERM");
    if (error.code === "EADDRINUSE") {
      console.error(portBusyMessage(port, tryCommand));
      process.exit(1);
    }
    console.error(error);
    process.exit(1);
  }

  const base = `http://${host}:${port}`;
  printReady(base, [`Worker mode: Wrangler on ${DEFAULT_HOST}:${wranglerPort}`]);

  function stop() {
    server.close();
    wrangler.kill("SIGTERM");
  }
  wrangler.on("exit", code => {
    server.close();
    process.exit(typeof code === "number" ? code : 0);
  });
  if (installSignals) installShutdown(stop);
  return { server, base, wrangler, wranglerPort, handleRequest: handler, stop };
}

export async function runLocalDev({
  argv = process.argv.slice(2),
  env = process.env,
  repositoryRoot = DEFAULT_ROOT
} = {}) {
  loadProjectEnv({ repositoryRoot });
  let options;
  try {
    options = parseLocalDevOptions(argv, env);
  } catch (error) {
    if (error.code === "ERR_INVALID_PORT") {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
  const shared = {
    repositoryRoot,
    host: options.host,
    port: options.port,
    loadEnv: false
  };

  // Cursor "npm run dev" tasks often leave the previous listener up. Reclaim
  // only when the holder is this repo's tools/dev-server.mjs — never a
  // foreign process on the same port.
  const reclaim = await reclaimLocalDevPort(options.port, {
    host: options.host,
    repositoryRoot
  });
  if (reclaim.reclaimed) {
    console.log(
      `${formatDevTimestamp()} Stopped ${reclaim.stopped.length} previous ` +
      `tools/dev-server.mjs process(es) to free port ${options.port}.`
    );
  }
  if (reclaim.matches?.length && !reclaim.free) {
    console.error(
      portBusyMessage(options.port, suggestedBusyCommand({ worker: options.worker }))
    );
    process.exit(1);
  }

  try {
    if (options.worker) {
      return await startLocalWorkerDev({
        ...shared,
        wranglerArgs: options.wranglerArgs,
        tryCommand: suggestedBusyCommand({ worker: true })
      });
    }
    return await startLocalStaticDev({
      ...shared,
      tryCommand: suggestedBusyCommand()
    });
  } catch (error) {
    if (error.code === "EADDRINUSE") process.exit(1);
    throw error;
  }
}

export default runLocalDev;
