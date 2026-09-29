// One JSON-RPC tools/call against the local authoring stdio server.
// tools/mcp-call.mjs prints text and exits; this returns the structured result
// so a helper can read draft.revision and decide whether to write.
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SERVER_PATH = join(dirname(fileURLToPath(import.meta.url)), "../tools/mcp-server.mjs");

function usefulStderr(stderr) {
  return stderr
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !/ready on stdio/i.test(line) && !/received SIGTERM|received SIGINT|received SIGHUP/.test(line))
    .join("\n");
}

export function callAuthoringMcpTool({
  toolName,
  args,
  clientInfo,
  meta = null,
  timeoutMs = 90000,
  serverPath = SERVER_PATH
}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [serverPath], { stdio: ["pipe", "pipe", "pipe"] });
    let buffer = "";
    let stderr = "";
    let phase = "init";
    let settled = false;

    function finish(fn, value) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(value);
      child.kill();
    }

    const timer = setTimeout(() => {
      finish(reject, new Error(`MCP call ${toolName} timed out`));
    }, timeoutMs);

    function send(id, method, params) {
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    }

    child.stdout.on("data", chunk => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        let msg;
        try { msg = JSON.parse(line); } catch { continue; }
        if (phase === "init" && msg.id === 1) {
          if (msg.error) {
            finish(reject, new Error(msg.error.message || "MCP initialize failed"));
            return;
          }
          phase = "tool";
          send(2, "tools/call", {
            name: toolName,
            arguments: args,
            ...(meta ? { _meta: meta } : {})
          });
        } else if (phase === "tool" && msg.id === 2) {
          phase = "done";
          if (msg.error) {
            finish(resolve, {
              isError: true,
              protocolError: true,
              message: msg.error.message || JSON.stringify(msg.error),
              structured: null,
              stderr: usefulStderr(stderr)
            });
            return;
          }
          const content = msg.result?.content || [];
          finish(resolve, {
            isError: msg.result?.isError === true,
            protocolError: false,
            message: content.map(part => part.text || "").join(""),
            structured: msg.result?.structuredContent ?? null,
            stderr: usefulStderr(stderr)
          });
        }
      }
    });

    child.stderr.on("data", chunk => {
      stderr += chunk.toString();
    });
    child.on("error", error => finish(reject, error));
    child.on("close", () => {
      if (phase !== "done") {
        const detail = usefulStderr(stderr);
        finish(reject, new Error(detail || `MCP server closed before ${toolName} returned`));
      }
    });

    send(1, "initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo
    });
  });
}
