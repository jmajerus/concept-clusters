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
import { dirname, isAbsolute, join, resolve } from "node:path";
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
      // `ps -o cwd` is Linux-specific. `lsof`'s cwd descriptor is available
      // on macOS and the BSDs, and is a safer fallback than guessing from a
      // command line when /proc is unavailable.
      const output = execFileSync("lsof", ["-a", "-p", String(pid), "-d", "cwd", "-Fn"], {
        encoding: "utf8"
      });
      const cwd = output
        .split("\n")
        .find(line => line.startsWith("n"))
        ?.slice(1)
        .trim();
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

function readProcessGroupId(pid) {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
    const closingParen = stat.lastIndexOf(")");
    if (closingParen < 0) return null;
    const fields = stat.slice(closingParen + 2).trim().split(/\s+/);
    const processGroupId = Number(fields[2]);
    return Number.isInteger(processGroupId) && processGroupId > 0
      ? processGroupId
      : null;
  } catch {
    try {
      const processGroupId = Number.parseInt(
        execFileSync("ps", ["-p", String(pid), "-o", "pgid="], {
          encoding: "utf8"
        }).trim(),
        10
      );
      return Number.isInteger(processGroupId) && processGroupId > 0
        ? processGroupId
        : null;
    } catch {
      return null;
    }
  }
}

function isNodeCommand(comm) {
  const command = String(comm || "").split("/").pop();
  return command === "node" || command === "nodejs";
}

function tokenizeCommandLine(command) {
  const tokens = [];
  let token = "";
  let quote = "";
  let escaped = false;
  for (const character of String(command || "")) {
    if (escaped) {
      token += character;
      escaped = false;
      continue;
    }
    if (character === "\\" && !quote) {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) quote = "";
      else token += character;
      continue;
    }
    if (character === "\"" || character === "'") {
      quote = character;
      continue;
    }
    if (/\s/.test(character)) {
      if (token) {
        tokens.push(token);
        token = "";
      }
      continue;
    }
    token += character;
  }
  if (escaped) token += "\\";
  if (token) tokens.push(token);
  return tokens;
}

function readArgv(pid, args) {
  try {
    const raw = readFileSync(`/proc/${pid}/cmdline`, "utf8");
    const argv = raw.split("\0").filter(Boolean);
    if (argv.length) return argv;
  } catch {
    // Fall back to a conservative tokenizer for BSD/macOS `ps` output.
  }
  return tokenizeCommandLine(args);
}

/** Read the process identity fields used by lease and fallback verification. */
export function readProcessSnapshot(pid) {
  const args = readArgLine(pid);
  const comm = readComm(pid);
  if (!args && !comm) return null;
  const numericPid = Number(pid);
  const cwd = numericPid === process.pid
    ? canonicalPath(process.cwd())
    : readCwd(pid);
  return {
    pid,
    args,
    comm,
    argv: readArgv(pid, args),
    cwd,
    startTime: readStartTime(pid),
    processGroupId: readProcessGroupId(pid)
  };
}

function scriptPath(repositoryRoot) {
  return join(canonicalPath(repositoryRoot), DEV_SERVER_SCRIPT_NEEDLE);
}

const NODE_VALUE_OPTIONS = new Set([
  "-r",
  "--require",
  "--import",
  "--loader",
  "--experimental-loader",
  "--conditions",
  "--cpu-prof-dir",
  "--heap-prof-dir",
  "--diagnostic-dir",
  "--redirect-warnings",
  "--watch-path",
  "--inspect-port",
  "--title"
]);
const NODE_EVAL_OPTIONS = new Set(["-e", "--eval", "-p", "--print", "-c", "--check"]);

function firstNodeScriptArgument(argv) {
  if (!Array.isArray(argv) || !argv.length) return null;
  for (let index = 1; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--") return argv[index + 1] || null;
    if (NODE_EVAL_OPTIONS.has(token) ||
      [...NODE_EVAL_OPTIONS].some(option => token.startsWith(`${option}=`))) {
      return null;
    }
    if (token.startsWith("-")) {
      if (NODE_VALUE_OPTIONS.has(token)) index += 1;
      continue;
    }
    return token;
  }
  return null;
}

function scriptArgumentMatches(snapshot, repositoryRoot) {
  const root = canonicalPath(repositoryRoot);
  const expected = scriptPath(root);
  const token = firstNodeScriptArgument(
    Array.isArray(snapshot.argv) && snapshot.argv.length
      ? snapshot.argv
      : tokenizeCommandLine(snapshot.args)
  );
  if (!token) return false;
  const script = String(token).replace(/^['"]|['"]$/g, "");
  if (isAbsolute(script)) return canonicalPath(script) === expected;
  if (!snapshot.cwd) return false;
  return canonicalPath(join(snapshot.cwd, script)) === expected;
}

function hasScriptArgument(snapshot, repositoryRoot) {
  const root = canonicalPath(repositoryRoot);
  if (snapshot.cwd && canonicalPath(snapshot.cwd) !== root) return false;
  // An exact absolute entrypoint remains sufficient when a BSD/macOS host
  // cannot expose another process's cwd. Relative launches still require the
  // cwd check above.
  return scriptArgumentMatches(snapshot, root);
}

/** Verify that a process is this repository's Node dev-server entry point. */
export function isOurDevServerProcess(snapshot, repositoryRoot = DEFAULT_ROOT) {
  if (!snapshot || !isNodeCommand(snapshot.comm)) return false;
  return hasScriptArgument(snapshot, repositoryRoot);
}

/** Infer the outer listener port from a dev-server command line. */
export function devServerPortFromArgs(args, argv = null) {
  const marker = "tools/dev-server.mjs";
  const tokens = Array.isArray(argv) && argv.length
    ? argv
    : tokenizeCommandLine(args);
  const scriptIndex = tokens.findIndex(token =>
    String(token).replace(/^['"]|['"]$/g, "").endsWith(marker)
  );
  if (scriptIndex < 0) return null;
  const rest = [];
  for (let index = scriptIndex + 1; index < tokens.length; index += 1) {
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
  if (!/^\d+$/.test(first)) return DEFAULT_DEV_PORT;
  const port = Number(first);
  return port >= 1 && port <= 65535 ? port : null;
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
    children: Array.isArray(lease.children) ? lease.children : [],
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
  children = [],
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
    children: (Array.isArray(children) ? children : [])
      .map(child => {
        const snapshot = child?.pid ? readProcessSnapshot(child.pid) : child;
        if (!snapshot) return null;
        return {
          pid: snapshot.pid,
          startTime: snapshot.startTime,
          processGroupId: snapshot.processGroupId,
          comm: snapshot.comm,
          command: snapshot.args,
          cwd: snapshot.cwd || null
        };
      })
      .filter(Boolean),
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

function listLeaseEntries({ repositoryRoot, env, port, selfPid }) {
  const { dataDir, names } = leaseFileNames(repositoryRoot, env);
  const entries = [];
  for (const name of names) {
    const path = join(dataDir, name);
    const entry = leaseEntry(path, repositoryRoot);
    if (!entry || entry.pid === selfPid || (port !== undefined && entry.port !== port)) continue;
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
  const entries = listLeaseEntries({ repositoryRoot: root, env, port, selfPid });
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
    const inferredPort = devServerPortFromArgs(snapshot.args, snapshot.argv);
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

function childProcessStillMatches(child, repositoryRoot) {
  if (!child || !Number.isInteger(child.pid) || child.pid < 1) return null;
  const snapshot = readProcessSnapshot(child.pid);
  if (!snapshot) return null;
  if (child.startTime && child.startTime !== snapshot.startTime) return null;
  if (child.command && child.command !== snapshot.args) return null;
  if (child.cwd && (!snapshot.cwd || canonicalPath(child.cwd) !== canonicalPath(snapshot.cwd))) {
    return null;
  }
  if (child.processGroupId && child.processGroupId !== snapshot.processGroupId) return null;
  return snapshot;
}

function signalVerifiedChild(child, repositoryRoot, signal) {
  const snapshot = childProcessStillMatches(child, repositoryRoot);
  if (!snapshot) return false;
  const processGroupId = child.processGroupId || snapshot.processGroupId;
  const ownGroupId = readProcessGroupId(process.pid);
  // Worker mode launches the Wrangler wrapper as a detached process-group
  // leader. Signalling that group reaches both the wrapper and Wrangler's
  // actual child. Require the captured group to still be led by this child so
  // a recycled PID can never turn this into an unrelated group kill.
  if (process.platform !== "win32" &&
    processGroupId === child.pid &&
    processGroupId !== ownGroupId) {
    try {
      process.kill(-processGroupId, signal);
      return true;
    } catch {
      // Fall through to the individually verified PID.
    }
  }
  try {
    process.kill(child.pid, signal);
    return true;
  } catch {
    return false;
  }
}

function signalLeaseChildren(entry, repositoryRoot, signal) {
  const signalled = [];
  for (const child of entry.children || []) {
    if (signalVerifiedChild(child, repositoryRoot, signal)) signalled.push(child);
  }
  return signalled;
}

function matchingLeaseChildren(entry, repositoryRoot) {
  return (entry.children || [])
    .filter(child => childProcessStillMatches(child, repositoryRoot));
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
  const childrenStopped = [];
  for (const entry of matches) {
    if (!processStillMatches(entry, root)) continue;
    childrenStopped.push(...signalLeaseChildren(entry, root, signal));
    try {
      process.kill(entry.pid, signal);
      stopped.push(entry);
    } catch {
      // Already gone.
    }
  }

  const remainingAfterTerm = await waitForProcessesGone(stopped, root, termGraceMs);
  const forced = [];
  const forcedChildren = [];
  // Force verified worker children even if their parent exited during the
  // grace window. A detached Wrangler process can outlive a dev-server
  // wrapper, and its lease is still the only safe authority for this cleanup.
  for (const entry of matches) {
    forcedChildren.push(...signalLeaseChildren(entry, root, "SIGKILL"));
  }
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
  const remainingChildren = matches.flatMap(entry =>
    matchingLeaseChildren(entry, root)
  );

  for (const entry of [...stopped, ...forced]) {
    if ((!processExists(entry.pid) || !processStillMatches(entry, root)) &&
      !matchingLeaseChildren(entry, root).length) {
      if (entry.leasePath) removeLeaseFile(entry.leasePath);
    }
  }
  return {
    matches,
    stopped,
    forced,
    remaining,
    childrenStopped,
    forcedChildren,
    remainingChildren
  };
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

function probeHosts(requestedHost, entries = []) {
  return [...new Set([
    requestedHost,
    ...entries.map(entry => entry.host),
    "127.0.0.1",
    "::1"
  ].filter(host => typeof host === "string" && host.trim()))];
}

async function anyPortInUse(port, hosts) {
  const results = await Promise.all(hosts.map(host => portInUse(port, host)));
  return results.some(Boolean);
}

async function waitForPortsFree(port, hosts, options) {
  const deadline = Date.now() + options.timeoutMs;
  while (Date.now() < deadline) {
    if (!(await anyPortInUse(port, hosts))) return true;
    await new Promise(resolve => setTimeout(resolve, options.intervalMs));
  }
  return !(await anyPortInUse(port, hosts));
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
  // Discover owned processes before probing the requested bind address. A
  // server bound to 127.0.0.1 must still be reclaimed when the replacement
  // asks for 0.0.0.0 (and vice versa).
  const matches = listLocalDevServers({ repositoryRoot, selfPid, port, env });
  const hosts = probeHosts(host, matches);
  if (!matches.length && !(await anyPortInUse(port, hosts))) {
    return {
      matches,
      reclaimed: false,
      stopped: [],
      forced: [],
      remaining: [],
      free: true
    };
  }
  const result = await stopLocalDevServersGracefully({
    repositoryRoot,
    selfPid,
    port,
    env,
    termGraceMs,
    killGraceMs
  });
  const free = await waitForPortsFree(port, hosts, {
    timeoutMs: 3000,
    intervalMs: 100
  });
  return { ...result, reclaimed: result.stopped.length > 0, free };
}
