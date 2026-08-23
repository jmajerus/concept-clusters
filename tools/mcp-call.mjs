#!/usr/bin/env node
// One-shot helper: call a single MCP tool over stdio and print the result.
// Usage: node tools/mcp-call.mjs <toolName> [jsonArgs]
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const toolName = process.argv[2];
const args = process.argv[3] ? JSON.parse(process.argv[3]) : {};

if (!toolName) {
  console.error("Usage: node tools/mcp-call.mjs <toolName> [jsonArgs]");
  process.exit(1);
}

const serverPath = join(dirname(fileURLToPath(import.meta.url)), "mcp-server.mjs");
const child = spawn(process.execPath, [serverPath], { stdio: ["pipe", "pipe", "inherit"] });

let buffer = "";
let phase = "init"; // init -> tool -> done

function send(id, method, params) {
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
}

child.stdout.on("data", chunk => {
  buffer += chunk.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop();
  for (const line of lines) {
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (phase === "init" && msg.id === 1 && msg.result) {
      phase = "tool";
      send(2, "tools/call", { name: toolName, arguments: args });
    } else if (phase === "tool" && msg.id === 2) {
      const content = msg.result?.content;
      if (content) {
        for (const c of content) process.stdout.write(c.text || "");
      } else if (msg.error) {
        console.error("MCP error:", JSON.stringify(msg.error, null, 2));
        process.exitCode = 1;
      }
      phase = "done";
      child.kill();
    }
  }
});

child.on("close", () => process.exit(process.exitCode || 0));

send(1, "initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "mcp-call", version: "1" } });
