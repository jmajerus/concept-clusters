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
  parseListenPort,
  startLocalStaticDev,
  suggestedBusyCommand
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

const alreadyUp = await localPortInUse(port, DEFAULT_HOST);
let base;

if (alreadyUp) {
  base = `http://${DEFAULT_HOST}:${port}`;
  console.log(`Using existing server at ${base}`);
} else {
  try {
    const started = await startLocalStaticDev({
      repositoryRoot: root,
      host: DEFAULT_HOST,
      port,
      tryCommand: suggestedBusyCommand({ command: "npm run admin" })
    });
    base = started.base;
  } catch (error) {
    if (error.code === "EADDRINUSE") process.exit(1);
    throw error;
  }
}

const adminURL = `${base}/index.html?admin`;
openBrowser(adminURL);
console.log(`Opened ${adminURL}`);

if (alreadyUp) process.exit(0);
