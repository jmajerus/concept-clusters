import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  formatDevTimestamp,
  parseListenPort,
  parseLocalDevOptions,
  portBusyMessage,
  suggestedBusyCommand
} from "../modules/localDevHttp.js";
import { PUZZLE_MANIFEST } from "../puzzles/manifest.js";

export const name = "local HTTP bootstrap: one npm run dev entry, optional Worker";

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(error => error ? reject(error) : resolve(port));
    });
    server.on("error", reject);
  });
}

function waitForReady(child, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
      reject(new Error(`dev server did not become ready\n${output}`));
    }, timeoutMs);
    function onChunk(chunk) {
      output += chunk.toString();
      if (output.includes("Concept Clusters ready at")) {
        clearTimeout(timeout);
        child.stdout.off("data", onChunk);
        child.stderr.off("data", onChunk);
        resolve(output);
      }
    }
    child.stdout.on("data", onChunk);
    child.stderr.on("data", onChunk);
    child.once("error", error => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", code => {
      clearTimeout(timeout);
      reject(new Error(`dev server exited before ready (code ${code})\n${output}`));
    });
  });
}

async function spawnDev(args, env = {}) {
  const child = spawn(process.execPath, ["tools/dev-server.mjs", ...args], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DEV_WORKER: "0",
      AUTHORING_LISTEN_HOST: "127.0.0.1",
      AUTHORING_DRAFT_REVIEW_URL: "",
      ...env
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  try {
    const output = await waitForReady(child);
    return { child, output };
  } catch (error) {
    child.kill("SIGTERM");
    throw error;
  }
}

function stopDev(child) {
  return new Promise(resolve => {
    child.once("exit", resolve);
    child.kill("SIGTERM");
    setTimeout(() => child.kill("SIGKILL"), 2000);
  });
}

export async function run() {
  const pkg = JSON.parse(await readFile(join(process.cwd(), "package.json"), "utf8"));
  assert.match(pkg.scripts.dev, /tools\/dev-server\.mjs/);
  assert.match(pkg.scripts["dev:worker"], /tools\/dev-server\.mjs/);
  assert.equal(pkg.scripts["dev:stop"], "node tools/dev-housekeep.mjs --kill");

  assert.match(
    formatDevTimestamp(new Date("2026-08-27T08:42:21.000Z")),
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{4}$/
  );

  const defaults = parseLocalDevOptions([], {});
  assert.equal(defaults.worker, false);
  assert.equal(defaults.host, "127.0.0.1");
  assert.equal(defaults.port, 8787);
  assert.deepEqual(defaults.wranglerArgs, []);

  assert.equal(parseLocalDevOptions(["--worker"]).worker, true);
  assert.equal(parseLocalDevOptions(["8788", "--worker"]).port, 8788);
  assert.equal(parseLocalDevOptions(["8788", "--worker"]).worker, true);
  assert.deepEqual(
    parseLocalDevOptions(["--worker", "8788", "--log-level", "debug"]).wranglerArgs,
    ["--log-level", "debug"]
  );
  assert.deepEqual(
    parseLocalDevOptions(["--worker", "--port", "9000", "--inspector"]).wranglerArgs,
    ["--inspector"]
  );
  assert.equal(parseLocalDevOptions([], { DEV_WORKER: "1" }).worker, true);
  assert.equal(parseLocalDevOptions([], { DEV_WORKER: "true" }).worker, true);
  assert.equal(parseLocalDevOptions([], { DEV_WORKER: "0" }).worker, false);
  assert.equal(parseLocalDevOptions(["--worker"], { DEV_WORKER: "0" }).worker, true);
  assert.equal(parseListenPort("8790"), 8790);
  assert.throws(() => parseListenPort("nope"), { code: "ERR_INVALID_PORT" });
  assert.throws(() => parseLocalDevOptions(["nope"]), { code: "ERR_INVALID_PORT" });
  assert.match(
    portBusyMessage(8787, suggestedBusyCommand()),
    /Port 8787 is already in use \(not this repo's tools\/dev-server\.mjs\)/
  );
  assert.match(portBusyMessage(8787, suggestedBusyCommand()), /npm run dev:stop/);
  assert.equal(
    suggestedBusyCommand({ worker: true }),
    "npm run dev -- --worker 8788"
  );

  const invalid = spawn(process.execPath, ["tools/dev-server.mjs", "nope"], {
    cwd: process.cwd(),
    env: { ...process.env, DEV_WORKER: "0" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  invalid.stdout.resume();
  const invalidStderr = [];
  invalid.stderr.on("data", chunk => invalidStderr.push(chunk));
  const invalidCode = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      invalid.kill("SIGKILL");
      reject(new Error("invalid-port process did not exit"));
    }, 20000);
    invalid.once("exit", code => {
      clearTimeout(timeout);
      resolve(code);
    });
  });
  assert.equal(invalidCode, 1);
  assert.match(Buffer.concat(invalidStderr).toString(), /Invalid port: nope/);

  const port = await freePort();
  const { child, output } = await spawnDev([String(port)]);
  try {
    assert.match(output, /^Started at \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{4}$/m);
    assert.match(output, new RegExp(`Concept Clusters ready at http://127\\.0\\.0\\.1:${port}`));
    assert.match(output, new RegExp(`Admin: http://127\\.0\\.0\\.1:${port}/admin`));
    assert.match(output, new RegExp(`Catalogue editor: http://127\\.0\\.0\\.1:${port}/admin/catalogues`));
    assert.match(output, new RegExp(`Categories: http://127\\.0\\.0\\.1:${port}/admin/categories`));
    assert.match(
      output,
      new RegExp(`${PUZZLE_MANIFEST.length} puzzles in manifest`)
    );
    assert.doesNotMatch(output, /Worker mode/);
    const response = await fetch(`http://127.0.0.1:${port}/index.html`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /<html/i);
    const admin = await fetch(`http://127.0.0.1:${port}/admin`);
    assert.equal(admin.status, 200);
    const adminBody = await admin.text();
    assert.match(adminBody, /Puzzles/);
    assert.match(adminBody, /value="refresh-github-production"/);

    // Second start on the same port should reclaim the first process.
    const second = await spawnDev([String(port)]);
    try {
      assert.match(second.output, /Stopped \d+ previous tools\/dev-server\.mjs/);
      assert.match(
        second.output,
        new RegExp(`Concept Clusters ready at http://127\\.0\\.0\\.1:${port}`)
      );
      const again = await fetch(`http://127.0.0.1:${port}/index.html`);
      assert.equal(again.status, 200);
    } finally {
      await stopDev(second.child);
    }
  } finally {
    // First child may already be gone after reclaim.
    if (child.exitCode == null && child.signalCode == null) {
      await stopDev(child);
    }
  }
}
