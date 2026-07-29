import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { startServer, serverURL } from "../tests/lib/server.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const portArg = process.argv[2] ?? "8787";
const port = Number(portArg);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid port: ${portArg}`);
  process.exit(1);
}

let server;
try {
  server = await startServer(root, { port });
} catch (error) {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Try: npm run dev -- 8788`);
    process.exit(1);
  }
  throw error;
}

console.log(`Concept Clusters ready at ${serverURL(server)}`);
console.log("Press Ctrl+C to stop.");

function stop() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
