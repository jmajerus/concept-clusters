// Local admin entry: ensure the static dev server is up, then open the
// game with &admin so puzzle meta, Stats, and Edit Star layout appear.
// Same server as `npm run dev` (default port 8787). If that port is
// already taken, assume an existing `npm run dev` and only open the tab.
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createDefaultLocalDraftReviewHandler } from "../modules/localDraftReview.js";
import { startServer, serverURL } from "../tests/lib/server.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const portArg = process.argv[2] ?? "8787";
const port = Number(portArg);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid port: ${portArg}`);
  process.exit(1);
}

function portInUse(host, listenPort) {
  return new Promise(resolve => {
    const socket = createConnection({ host, port: listenPort }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });
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

const host = "127.0.0.1";
const alreadyUp = await portInUse(host, port);
let base;

if (alreadyUp) {
  base = `http://${host}:${port}`;
  console.log(`Using existing server at ${base}`);
} else {
  let server;
  try {
    server = await startServer(root, {
      host,
      port,
      handleRequest: createDefaultLocalDraftReviewHandler({ repositoryRoot: root })
    });
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Try: npm run admin -- 8788`);
      process.exit(1);
    }
    throw error;
  }
  base = serverURL(server);
  console.log(`Concept Clusters ready at ${base}`);
  console.log(`Draft review: ${base}/admin/drafts`);
  console.log("Press Ctrl+C to stop.");

  function stop() {
    server.close(() => process.exit(0));
  }
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

const adminURL = `${base}/index.html?admin`;
openBrowser(adminURL);
console.log(`Opened ${adminURL}`);

if (alreadyUp) process.exit(0);
