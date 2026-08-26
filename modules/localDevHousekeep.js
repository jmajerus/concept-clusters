// Find and stop this repo's `tools/dev-server.mjs` processes so `npm run
// dev` can reclaim 8787 without manual kill. Only matches our script path;
// never kills an unrelated listener on the same port.
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createConnection } from "node:net";

const DEFAULT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DEV_SERVER_SCRIPT_NEEDLE = "tools/dev-server.mjs";

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

function isOurDevServerProcess(args, comm) {
  if (!args.includes(DEV_SERVER_SCRIPT_NEEDLE)) return false;
  // Only the Node process that is actually running the server — not a bash
  // -c wrapper whose command text happens to mention the script path.
  if (comm !== "node" && !/(^|\/)node$/.test(comm)) return false;
  return /(^|[^\w.-])node([^\n]*\s|\s)[^\n]*tools\/dev-server\.mjs\b/.test(args) ||
    args.includes(DEV_SERVER_SCRIPT_NEEDLE);
}

export function listLocalDevServers({
  repositoryRoot = DEFAULT_ROOT,
  selfPid = process.pid
} = {}) {
  let raw = "";
  try {
    raw = execFileSync("pgrep", ["-f", DEV_SERVER_SCRIPT_NEEDLE], {
      encoding: "utf8"
    });
  } catch (error) {
    if (error.status === 1) return [];
    throw error;
  }

  const matches = [];
  for (const line of raw.split("\n")) {
    const pid = Number.parseInt(line.trim(), 10);
    if (!Number.isFinite(pid) || pid === selfPid) continue;
    const args = readArgLine(pid);
    const comm = readComm(pid);
    if (!isOurDevServerProcess(args, comm)) continue;
    matches.push({ pid, args });
  }
  matches.sort((a, b) => a.pid - b.pid);
  return matches;
}

export function stopLocalDevServers({
  repositoryRoot = DEFAULT_ROOT,
  selfPid = process.pid,
  signal = "SIGTERM"
} = {}) {
  const matches = listLocalDevServers({ repositoryRoot, selfPid });
  const stopped = [];
  for (const entry of matches) {
    try {
      process.kill(entry.pid, signal);
      stopped.push(entry);
    } catch {
      // Already gone.
    }
  }
  return { matches, stopped };
}

export function portInUse(port, host = "127.0.0.1") {
  return new Promise(resolve => {
    const socket = createConnection({ host, port }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
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
  selfPid = process.pid
} = {}) {
  if (!(await portInUse(port, host))) {
    return { reclaimed: false, stopped: [], free: true };
  }
  const { matches, stopped } = stopLocalDevServers({ repositoryRoot, selfPid });
  if (!stopped.length) {
    return { reclaimed: false, stopped, matches, free: false };
  }
  const free = await waitForPortFree(port, { host });
  return { reclaimed: true, stopped, matches, free };
}
