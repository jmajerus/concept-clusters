import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createContentInterchangeService } from "../modules/contentInterchangeService.js";
import { createDefaultLocalDraftReviewHandler } from "../modules/localDraftReview.js";
import { startServer, serverURL } from "../tests/lib/server.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const portArg = process.argv[2] ?? "8787";
const port = Number(portArg);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid port: ${portArg}`);
  process.exit(1);
}

const handleRequest = createDefaultLocalDraftReviewHandler({
  repositoryRoot: root,
  contentService: createContentInterchangeService({ repositoryRoot: root })
});
let server;
try {
  server = await startServer(root, { port, handleRequest });
} catch (error) {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Try: npm run dev -- 8788`);
    process.exit(1);
  }
  throw error;
}

const base = serverURL(server);
console.log(`Concept Clusters ready at ${base}`);
console.log(`Draft review: ${base}/admin/drafts`);
console.log("Press Ctrl+C to stop.");

function stop() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
