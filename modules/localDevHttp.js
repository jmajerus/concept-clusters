// Shared local HTTP bootstrap for `npm run dev`, optional Worker mode,
// and `npm run admin`. All three used to wire the draft-review handler,
// listen on 8787, and print the same EADDRINUSE copy. Wrangler stays off
// unless `--worker` or DEV_WORKER is set.
import { spawn, spawnSync } from "node:child_process";
import { createServer as createHttpServer, request as httpRequest } from "node:http";
import { createConnection } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { handleAuthoringAdminIndex } from "./authoringAdminIndex.js";
import {
  emptyContentFreezePlan,
  gitIdsFromContentService,
  loadContentFreezePlan
} from "./contentFreezePlan.js";
import { GitHubRepositoryClient } from "./githubPublicationService.js";
import { D1FreezePublicationRepository } from "./d1FreezePublicationRepository.js";
import { createFreezePublicationService } from "./freezePublicationService.js";
import { LocalGitHubConfigError, resolveLocalGitHubConfig } from "./localGitHubConfig.js";
import { refreshGithubProductionManifest, loadGithubProductionManifest } from "./githubProductionManifest.js";
import { createDefaultLocalPlayCorpusHandler } from "./localPlayCorpus.js";
import { localDraftReviewUrl } from "./authoringDesignGuidance.js";
import { ensureAuthoringWorkspace } from "./authoringWorkspacePaths.js";
import { createContentInterchangeService } from "./contentInterchangeService.js";
import { createDefaultLocalDraftReviewHandler } from "./localDraftReview.js";
import { createDefaultLocalCatalogueReviewHandler } from "./localCatalogueReview.js";
import { resolveLocalAuthoringWorkspace } from "./localAuthoringWorkspace.js";
import { loadProjectEnv } from "./loadProjectEnv.js";
import { reclaimLocalDevPort } from "./localDevHousekeep.js";
import { startServer, serverURL } from "../tests/lib/server.mjs";
import { PUZZLE_MANIFEST, PUZZLE_MANIFEST_FAILURES } from "../puzzles/manifest.js";

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

export function parseListenHost(hostArg, fallback = DEFAULT_HOST) {
  const host = String(hostArg ?? fallback).trim();
  if (!host) {
    const error = new Error(`Invalid host: ${hostArg}`);
    error.code = "ERR_INVALID_HOST";
    throw error;
  }
  return host;
}

function takeFlagValue(argv, index, flag) {
  const arg = argv[index];
  if (arg.startsWith(`${flag}=`)) return { value: arg.slice(flag.length + 1), next: index };
  const value = argv[index + 1];
  if (value === undefined) {
    const error = new Error(`${flag} requires a value`);
    error.code = "ERR_INVALID_HOST";
    throw error;
  }
  return { value, next: index + 1 };
}

export function parseLocalDevOptions(argv = [], env = process.env) {
  let worker = envFlag(env.DEV_WORKER);
  let host = parseListenHost(env.AUTHORING_LISTEN_HOST, DEFAULT_HOST);
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--" || arg === "") continue;
    if (arg === "--worker") {
      worker = true;
      continue;
    }
    if (arg === "--host" || arg.startsWith("--host=")) {
      const taken = takeFlagValue(argv, i, "--host");
      host = parseListenHost(taken.value);
      i = taken.next;
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
  return { worker, host, port, wranglerArgs };
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
  const contentService = createContentInterchangeService({ repositoryRoot });
  const drafts = createDefaultLocalDraftReviewHandler({
    repositoryRoot,
    contentService
  });
  const catalogues = createDefaultLocalCatalogueReviewHandler({
    repositoryRoot,
    contentService
  });
  const play = createDefaultLocalPlayCorpusHandler({
    repositoryRoot,
    contentService
  });
  return async function handleLocalDevRequest(req, res) {
    const admin = await handleAuthoringAdminIndex(req, res, {
      canApplyFreeze: true,
      loadFreezePlan: async () => {
        try {
          const resolved = await resolveLocalAuthoringWorkspace({ repositoryRoot });
          if (!resolved.contentDocuments) return emptyContentFreezePlan();
          try {
            const github = new GitHubRepositoryClient(
              await resolveLocalGitHubConfig({ repositoryRoot })
            );
            await createFreezePublicationService({
              github,
              repository: new D1FreezePublicationRepository(resolved.contentDocuments.database)
            }).reconcile({ contentDocuments: resolved.contentDocuments });
          } catch {
            // A release-status refresh must not hide the local D1 plan when
            // GitHub is temporarily unavailable or has not been configured.
          }
          return loadContentFreezePlan({
            contentDocuments: resolved.contentDocuments,
            gitIds: gitIdsFromContentService(contentService)
          });
        } catch {
          return emptyContentFreezePlan();
        }
      },
      applyFreeze: async ({ additionalContext = "" } = {}) => {
        // Runs as its own process (tools/apply-freeze.mjs) rather than
        // inline here, so it can hard-reset this checkout to origin/main
        // before importing anything that reads puzzle/catalogue content.
        // That removes both the "forgot to git pull" failure mode and a
        // subtler one: this server's own module cache never reflects a
        // disk change to an already-imported file without a restart, so
        // even a manual pull wouldn't have been enough on its own.
        const child = spawnSync(
          process.execPath,
          [join(repositoryRoot, "tools", "apply-freeze.mjs"), additionalContext],
          { cwd: repositoryRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
        );
        let parsed = null;
        try {
          parsed = JSON.parse(child.stdout);
        } catch {
          // fall through to the raw-output error below
        }
        if (child.status !== 0 || parsed?.error) {
          const message = parsed?.error
            || child.stderr
            || child.stdout
            || `apply-freeze.mjs exited with status ${child.status}`;
          const error = new Error(message);
          if (parsed?.code) error.code = parsed.code;
          throw error;
        }
        return parsed;
      },
      loadGithubProduction: () => loadGithubProductionManifest({ repositoryRoot }),
      refreshGithubProduction: async () => {
        let github = null;
        try {
          github = new GitHubRepositoryClient(
            await resolveLocalGitHubConfig({ repositoryRoot })
          );
        } catch (error) {
          if (!(error instanceof LocalGitHubConfigError)) throw error;
        }
        return refreshGithubProductionManifest({
          repositoryRoot,
          fetchRemote: true,
          github
        });
      }
    });
    if (admin) return true;
    if (await play(req, res)) return true;
    if (await catalogues(req, res)) return true;
    return drafts(req, res);
  };
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

function formatManifestCorpusLine() {
  const count = PUZZLE_MANIFEST.length;
  const skipped = PUZZLE_MANIFEST_FAILURES.length;
  const skippedNote = skipped
    ? `; ${skipped} omitted from manifest at build`
    : "";
  return `${count} puzzle${count === 1 ? "" : "s"} in manifest${skippedNote}`;
}

function displayBaseUrl({ host, port, env = process.env, fallbackBase }) {
  const review = localDraftReviewUrl(env);
  if (env.AUTHORING_DRAFT_REVIEW_URL?.trim()) {
    return review.replace(/\/admin\/drafts$/, "");
  }
  if (host === "0.0.0.0" || host === "::" || host === "[::]") {
    return `http://127.0.0.1:${port}`;
  }
  if (host !== DEFAULT_HOST) {
    const bracket = host.includes(":") && !host.startsWith("[") ? `[${host}]` : host;
    return `http://${bracket}:${port}`;
  }
  return fallbackBase || `http://${host}:${port}`;
}

function printReady(base, extras = []) {
  const lines = [
    `Started at ${formatDevTimestamp()}`,
    `Concept Clusters ready at ${base}`,
    `Play (D1 published documents): ${base}/`,
    formatManifestCorpusLine(),
    `Admin: ${base}/admin`,
    `Draft review: ${base}/admin/drafts`,
    `Catalogue editor: ${base}/admin/catalogues`,
    `Categories: ${base}/admin/categories`,
    ...extras,
    "Press Ctrl+C to stop."
  ];
  console.log(lines.join("\n"));
}

function authoringReadyExtras({ host, port, repositoryRoot, env = process.env }) {
  const workspace = ensureAuthoringWorkspace({ repositoryRoot, env });
  const extras = [`Authoring data: ${workspace.root}`];
  if (host === "0.0.0.0" || host === "::" || host === "[::]") {
    extras.push(`Listening on ${host}:${port} (all interfaces; no auth on /admin)`);
    if (!env.AUTHORING_DRAFT_REVIEW_URL?.trim()) {
      extras.push("Set AUTHORING_DRAFT_REVIEW_URL to the LAN drafts URL MCP should print.");
    }
  }
  return extras;
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
  const fallbackBase = serverURL(server);
  const base = displayBaseUrl({ host, port, fallbackBase });
  printReady(base, authoringReadyExtras({ host, port, repositoryRoot }));
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

  const base = displayBaseUrl({ host, port, fallbackBase: `http://${host}:${port}` });
  printReady(base, [
    `Worker mode: Wrangler on ${DEFAULT_HOST}:${wranglerPort}`,
    ...authoringReadyExtras({ host, port, repositoryRoot })
  ]);

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
    if (error.code === "ERR_INVALID_PORT" || error.code === "ERR_INVALID_HOST") {
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
