// Local admin entry: ensure the static dev server is up, then open the
// game with &admin so puzzle meta, Stats, and Edit Star layout appear.
// Same server as `npm run dev` (default port 8787). If that port is
// already taken, assume an existing `npm run dev` and only open the tab.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  DEFAULT_HOST,
  localPortInUse,
  parseListenPort
} from "../modules/localDevHttp.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let port;
try {
  port = parseListenPort(process.argv[2]);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

function openBrowser(url) {
  const opener = process.platform === "darwin"
    ? "open"
    : process.platform === "win32"
      ? "cmd"
      : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(opener, args, { stdio: "ignore", detached: true });
  child.unref();
}

async function waitForServer(port, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await localPortInUse(port, DEFAULT_HOST)) return true;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return localPortInUse(port, DEFAULT_HOST);
}

const alreadyUp = await localPortInUse(port, DEFAULT_HOST);
let base;

if (alreadyUp) {
  base = `http://${DEFAULT_HOST}:${port}`;
  console.log(`Using existing server at ${base}`);
} else {
  // Always launch the canonical server entry point.  Running the server in
  // this admin opener made it look foreign to `npm run dev`/`dev:stop`, so
  // a stale admin launch could silently serve old imported modules on 8787.
  const server = spawn(process.execPath, [join(root, "tools", "dev-server.mjs"), String(port)], {
    cwd: root,
    detached: true,
    stdio: "ignore"
  });
  server.unref();
  if (!await waitForServer(port)) {
    console.error(`The development server did not start on port ${port}.`);
    process.exit(1);
  }
  base = `http://${DEFAULT_HOST}:${port}`;
  console.log(`Started current server at ${base}`);
}

const adminURL = `${base}/index.html?admin`;
openBrowser(adminURL);
console.log(`Opened ${adminURL}`);
