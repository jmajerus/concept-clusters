// Find and stop this repository's local development servers without ever
// killing an unrelated listener. A dev server records a small, gitignored
// lease after it binds its HTTP port. The lease lets a later `npm run dev`
// identify the exact process (including its PID incarnation), while the
// command/cwd scan remains as a recovery path for servers started before the
// lease was introduced.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  readdirSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createConnection } from "node:net";
import { resolveAuthoringDataDir } from "./authoringWorkspacePaths.js";

const DEFAULT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DEV_SERVER_SCRIPT_NEEDLE = "tools/dev-server.mjs";
export const DEFAULT_DEV_PORT = 8787;
export const DEV_LEASE_VERSION = 1;
const DEV_LEASE_PREFIX = ".dev-server";
const DEV_LEASE_SUFFIX = ".json";
const DEFAULT_TERM_GRACE_MS = 3000;
const DEFAULT_KILL_GRACE_MS = 1000;

function canonicalPath(path) {
  const resolved = resolve(path);
  try {
    return realpathSync(resolved);
  } catch {
    return resolved;
  }
}

function repositoryKey(repositoryRoot) {
  return createHash("sha256")
    .update(canonicalPath(repositoryRoot))
    .digest("hex")
    .slice(0, 16);
}

function assertPort(port) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid development server port: ${port}`);
  }
}

/** Return the gitignored, repository-and-port-specific lease path. */
export function localDevLeasePath({
  repositoryRoot = DEFAULT_ROOT,
  port,
  env = process.env
} = {}) {
  assertPort(port);
  const dataDir = resolveAuthoringDataDir({ repositoryRoot, env });
  return join(
    dataDir,
    `${DEV_LEASE_PREFIX}-${port}-${repositoryKey(repositoryRoot)}${DEV_LEASE_SUFFIX}`
  );
}

function readArgLine(pid) {
  try {
    return execFileSync("ps", ["-p", String(pid), "-o", "args="], {
      encoding: "utf8"
    }).trim();
  } catch {
    return "";
  }
}

function readComm(pid) {
  try {
    return execFileSync("ps", ["-p", String(pid), "-o", "comm="], {
      encoding: "utf8"
    }).trim();
  } catch {
    return "";
  }
}

function readCwd(pid) {
  try {
    return canonicalPath(readlinkSync(`/proc/${pid}/cwd`));
  } catch {
    try {
      const cwd = execFileSync("ps", ["-p", String(pid), "-o", "cwd="], {
        encoding: "utf8"
      }).trim();
      return cwd ? canonicalPath(cwd) : "";
    } catch {
      return "";
    }
  }
}

// Linux's /proc stat field 22 is the process start tick. It distinguishes a
// dead lease's PID from a later process that happens to reuse that PID. The
// `ps` fallback keeps the same protection on hosts without /proc.
function readStartTime(pid) {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
    const closingParen = stat.lastIndexOf(")");
    if (closingParen < 0) return null;
    const fields = stat.slice(closingParen + 2).trim().split(/\s+/);
    return fields[19] || null;
  } catch {
    try {
      return execFileSync("ps", ["-p", String(pid), "-o", "lstart="], {
        encoding: "utf8"
      }).trim() || null;
    } catch {
      return null;
    }
  }
}

function isNodeCommand(comm) {
  const command = String(comm || "").split("/").pop();
  return command === "node" || command === "nodejs";
}

/** Read the process identity fields used by lease and fallback verification. */
export function readProcessSnapshot(pid) {
  const args = readArgLine(pid);
  const comm = readComm(pid);
  if (!args && !comm) return null;
  return {
    pid,
    args,
    comm,
    cwd: readCwd(pid),
    startTime: readStartTime(pid)
  };
}

function scriptPath(repositoryRoot) {
  return join(canonicalPath(repositoryRoot), DEV_SERVER_SCRIPT_NEEDLE);
}

function hasScriptArgument(snapshot, repositoryRoot) {
  const args = String(snapshot.args || "");
  const root = canonicalPath(repositoryRoot);
  const expected = scriptPath(repositoryRoot);
  // The command line alone is not ownership proof: another checkout (or a
  // shell command that merely mentions this path) may contain the same
  // script name. If the OS cannot report cwd, fail closed rather than kill
  // a process we cannot positively associate with this checkout.
  if (!snapshot.cwd || canonicalPath(snapshot.cwd) !== root) return false;
  const absoluteIndex = args.indexOf(expected);
  if (absoluteIndex >= 0) {
    const before = args[absoluteIndex - 1];
    const after = args[absoluteIndex + expected.length];
    if ((!before || /[\s"']/.test(before)) && (!after || /[\s"']/.test(after))) {
      return true;
    }
  }

  // Older launches use `node tools/dev-server.mjs`; cwd was verified above.
  return /(?:^|\s)(?:["']?\.\/)?tools\/dev-server\.mjs(?:["']?)(?:\s|$)/
    .test(args);
}

/** Verify that a process is this repository's Node dev-server entry point. */
export function isOurDevServerProcess(snapshot, repositoryRoot = DEFAULT_ROOT) {
  if (!snapshot || !isNodeCommand(snapshot.comm)) return false;
  return hasScriptArgument(snapshot, repositoryRoot);
}

/** Infer the outer listener port from a dev-server command line. */
export function devServerPortFromArgs(args) {
  const raw = String(args || "");
  const marker = "tools/dev-server.mjs";
  const scriptIndex = raw.indexOf(marker);
  if (scriptIndex < 0) return null;
  const after = raw.slice(scriptIndex + marker.length);
  const tokens = after.trim().split(/\s+/).filter(Boolean);
  const rest = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--" || token === "--worker") continue;
    if (token === "--host") {
      index += 1;
      continue;
    }
    if (token.startsWith("--host=")) continue;
    rest.push(token);
  }
  const first = rest[0] || "";
  return /^\d+$/.test(first) ? Number(first) : DEFAULT_DEV_PORT;
}

function leaseFileNames(repositoryRoot, env) {
  const dataDir = resolveAuthoringDataDir({ repositoryRoot, env });
  const key = repositoryKey(repositoryRoot);
  if (!existsSync(dataDir)) return { dataDir, names: [] };
  const names = readdirSync(dataDir).filter(name =>
    name.startsWith(`${DEV_LEASE_PREFIX}-`) &&
    name.endsWith(`-${key}${DEV_LEASE_SUFFIX}`)
  );
  return { dataDir, names };
}

function parseLease(path) {
  try {
    const lease = JSON.parse(readFileSync(path, "utf8"));
    if (!lease || lease.version !== DEV_LEASE_VERSION) return null;
    if (!Number.isInteger(lease.pid) || lease.pid < 1) return null;
    if (!Number.isInteger(lease.port) || lease.port < 1 || lease.port > 65535) return null;
    if (typeof lease.repositoryRoot !== "string" || !lease.repositoryRoot) return null;
    if (typeof lease.scriptPath !== "string" || !lease.scriptPath) return null;
    return lease;
  } catch {
    return null;
  }
}

function sameProcessStart(lease, snapshot) {
  return !lease.startTime || lease.startTime === snapshot.startTime;
}

function verifyLease(lease, { repositoryRoot = DEFAULT_ROOT, port } = {}) {
  if (!lease) return { ok: false, reason: "missing lease" };
  const root = canonicalPath(repositoryRoot);
  if (canonicalPath(lease.repositoryRoot) !== root) {
    return { ok: false, reason: "repository root mismatch" };
  }
  if (port !== undefined && lease.port !== port) {
    return { ok: false, reason: "port mismatch" };
  }
  const snapshot = readProcessSnapshot(lease.pid);
  if (!snapshot) return { ok: false, reason: "process is not running" };
  if (!sameProcessStart(lease, snapshot)) {
    return { ok: false, reason: "PID was reused" };
  }
  if (!isOurDevServerProcess(snapshot, root)) {
    return { ok: false, reason: "command or cwd mismatch", snapshot };
  }
  if (snapshot.cwd && canonicalPath(snapshot.cwd) !== root) {
    return { ok: false, reason: "cwd mismatch", snapshot };
  }
  if (canonicalPath(lease.scriptPath) !== scriptPath(root)) {
    return { ok: false, reason: "script path mismatch", snapshot };
  }
  return { ok: true, snapshot };
}

function leaseEntry(path, repositoryRoot) {
  const lease = parseLease(path);
  if (!lease) return null;
  const verified = verifyLease(lease, { repositoryRoot });
  if (!verified.ok) return null;
  return {
    ...verified.snapshot,
    port: lease.port,
    host: lease.host || "127.0.0.1",
    mode: lease.mode || "static",
    leasePath: path,
    source: "lease",
    startTime: lease.startTime || verified.snapshot.startTime
  };
}

function removeLeaseFile(path) {
  try {
    unlinkSync(path);
    return true;
  } catch {
    return false;
  }
}

/** Remove a lease only when it still belongs to the specified process. */
export function removeLocalDevLease({
  repositoryRoot = DEFAULT_ROOT,
  port,
  pid = process.pid,
  startTime = readStartTime(pid),
  env = process.env
} = {}) {
  const path = localDevLeasePath({ repositoryRoot, port, env });
  const lease = parseLease(path);
  if (!lease || lease.pid !== pid) return false;
  if (lease.startTime && lease.startTime !== startTime) return false;
  return removeLeaseFile(path);
}

/**
 * Write a lease atomically after the HTTP listener has bound successfully.
 * The lease is deliberately in authoring scratch, never in git.
 */
export function writeLocalDevLease({
  repositoryRoot = DEFAULT_ROOT,
  host = "127.0.0.1",
  port,
  mode = "static",
  pid = process.pid,
  env = process.env
} = {}) {
  assertPort(port);
  const root = canonicalPath(repositoryRoot);
  const path = localDevLeasePath({ repositoryRoot: root, port, env });
  const snapshot = readProcessSnapshot(pid);
  if (!snapshot || !isOurDevServerProcess(snapshot, root)) {
    throw new Error(`Cannot verify dev-server process ${pid} for ${root}.`);
  }
  mkdirSync(dirname(path), { recursive: true });
  const lease = {
    version: DEV_LEASE_VERSION,
    pid,
    startTime: snapshot.startTime,
    repositoryRoot: root,
    scriptPath: scriptPath(root),
    command: snapshot.args,
    cwd: snapshot.cwd || root,
    host,
    port,
    mode,
    startedAt: new Date().toISOString()
  };
  const temporary = `${path}.${pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(lease, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600
  });
  renameSync(temporary, path);
  return { path, lease };
}

function staleLeasePaths({ repositoryRoot = DEFAULT_ROOT, env = process.env } = {}) {
  const { dataDir, names } = leaseFileNames(repositoryRoot, env);
  return names
    .map(name => join(dataDir, name))
    .filter(path => {
      const lease = parseLease(path);
      return !lease || !verifyLease(lease, { repositoryRoot }).ok;
    });
}

/** Remove dead/corrupt leases without touching any process. */
export function pruneLocalDevLeases({
  repositoryRoot = DEFAULT_ROOT,
  env = process.env
} = {}) {
  const removed = [];
  for (const path of staleLeasePaths({ repositoryRoot, env })) {
    if (removeLeaseFile(path)) removed.push(path);
  }
  return removed;
}

function listLeaseEntries({ repositoryRoot, env, port }) {
  const { dataDir, names } = leaseFileNames(repositoryRoot, env);
  const entries = [];
  for (const name of names) {
    const path = join(dataDir, name);
    const entry = leaseEntry(path, repositoryRoot);
    if (!entry || (port !== undefined && entry.port !== port)) continue;
    entries.push(entry);
  }
  return entries;
}

/**
 * List verified servers for this repository. Lease entries are preferred;
 * the process scan finds pre-lease servers and is scoped by exact script path
 * plus cwd, so another checkout cannot be stopped accidentally.
 */
export function listLocalDevServers({
  repositoryRoot = DEFAULT_ROOT,
  selfPid = process.pid,
  port,
  env = process.env
} = {}) {
  const root = canonicalPath(repositoryRoot);
  const entries = listLeaseEntries({ repositoryRoot: root, env, port });
  const seen = new Set(entries.map(entry => entry.pid));
  let raw = "";
  try {
    raw = execFileSync("pgrep", ["-f", DEV_SERVER_SCRIPT_NEEDLE], {
      encoding: "utf8"
    });
  } catch (error) {
    if (error.status === 1) return entries.sort((a, b) => a.pid - b.pid);
    throw error;
  }

  for (const line of raw.split("\n")) {
    const pid = Number.parseInt(line.trim(), 10);
    if (!Number.isFinite(pid) || pid === selfPid || seen.has(pid)) continue;
    const snapshot = readProcessSnapshot(pid);
    if (!isOurDevServerProcess(snapshot, root)) continue;
    const inferredPort = devServerPortFromArgs(snapshot.args);
    if (port !== undefined && inferredPort !== port) continue;
    seen.add(pid);
    entries.push({
      ...snapshot,
      port: inferredPort,
      host: "127.0.0.1",
      mode: snapshot.args.includes("--worker") ? "worker" : "static",
      leasePath: null,
      source: "process"
    });
  }
  entries.sort((a, b) => a.pid - b.pid);
  return entries;
}

function processStillMatches(entry, repositoryRoot) {
  const snapshot = readProcessSnapshot(entry.pid);
  if (!snapshot || !isOurDevServerProcess(snapshot, repositoryRoot)) return null;
  if (entry.startTime && entry.startTime !== snapshot.startTime) return null;
  if (entry.cwd && snapshot.cwd && canonicalPath(entry.cwd) !== canonicalPath(snapshot.cwd)) return null;
  return snapshot;
}

/** Send one signal to an already-verified dev-server process. */
export function stopLocalDevServers({
  repositoryRoot = DEFAULT_ROOT,
  selfPid = process.pid,
  signal = "SIGTERM",
  port,
  env = process.env
} = {}) {
  const root = canonicalPath(repositoryRoot);
  const matches = listLocalDevServers({ repositoryRoot: root, selfPid, port, env });
  const stopped = [];
  for (const entry of matches) {
    if (!processStillMatches(entry, root)) continue;
    try {
      process.kill(entry.pid, signal);
      stopped.push(entry);
    } catch {
      // Already gone.
    }
  }
  return { matches, stopped };
}

function processExists(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitForProcessesGone(entries, repositoryRoot, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  const remaining = () => entries.filter(entry => processStillMatches(entry, repositoryRoot));
  let live = remaining();
  while (live.length && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 100));
    live = remaining();
  }
  return live;
}

/**
 * Gracefully stop verified servers, escalating only to those same verified
 * processes after the term grace period. A PID reuse or command/cwd change
 * removes a process from escalation rather than risking an unrelated kill.
 */
export async function stopLocalDevServersGracefully({
  repositoryRoot = DEFAULT_ROOT,
  selfPid = process.pid,
  signal = "SIGTERM",
  port,
  env = process.env,
  termGraceMs = DEFAULT_TERM_GRACE_MS,
  killGraceMs = DEFAULT_KILL_GRACE_MS
} = {}) {
  const root = canonicalPath(repositoryRoot);
  const matches = listLocalDevServers({ repositoryRoot: root, selfPid, port, env });
  const stopped = [];
  for (const entry of matches) {
    if (!processStillMatches(entry, root)) continue;
    try {
      process.kill(entry.pid, signal);
      stopped.push(entry);
    } catch {
      // Already gone.
    }
  }

  const remainingAfterTerm = await waitForProcessesGone(stopped, root, termGraceMs);
  const forced = [];
  for (const entry of remainingAfterTerm) {
    if (!processStillMatches(entry, root)) continue;
    try {
      process.kill(entry.pid, "SIGKILL");
      forced.push(entry);
    } catch {
      // Already gone.
    }
  }
  const remaining = await waitForProcessesGone(forced, root, killGraceMs);

  for (const entry of [...stopped, ...forced]) {
    if (!processExists(entry.pid) || !processStillMatches(entry, root)) {
      if (entry.leasePath) removeLeaseFile(entry.leasePath);
    }
  }
  return { matches, stopped, forced, remaining };
}

export function portInUse(port, host = "127.0.0.1", timeoutMs = 250) {
  return new Promise(resolve => {
    let settled = false;
    let socket;
    const finish = inUse => {
      if (settled) return;
      settled = true;
      if (!inUse) socket.destroy();
      resolve(inUse);
    };
    socket = createConnection({ host, port }, () => {
      socket.end();
      finish(true);
    });
    socket.setTimeout(timeoutMs, () => finish(false));
    socket.on("error", () => finish(false));
  });
}

export async function waitForPortFree(port, {
  host = "127.0.0.1",
  timeoutMs = 3000,
  intervalMs = 100
} = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!(await portInUse(port, host))) return true;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return !(await portInUse(port, host));
}

export async function reclaimLocalDevPort(port, {
  host = "127.0.0.1",
  repositoryRoot = DEFAULT_ROOT,
  selfPid = process.pid,
  env = process.env,
  termGraceMs = DEFAULT_TERM_GRACE_MS,
  killGraceMs = DEFAULT_KILL_GRACE_MS
} = {}) {
  assertPort(port);
  pruneLocalDevLeases({ repositoryRoot, env });
  if (!(await portInUse(port, host))) {
    return { reclaimed: false, stopped: [], forced: [], remaining: [], free: true };
  }
  const result = await stopLocalDevServersGracefully({
    repositoryRoot,
    selfPid,
    port,
    env,
    termGraceMs,
    killGraceMs
  });
  const free = await waitForPortFree(port, { host });
  return { ...result, reclaimed: result.stopped.length > 0, free };
}
