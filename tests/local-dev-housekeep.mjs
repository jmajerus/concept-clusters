import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_DEV_PORT,
  devServerPortFromArgs,
  isOurDevServerProcess,
  localDevLeasePath,
  reclaimLocalDevPort,
  pruneLocalDevLeases
} from "../modules/localDevHousekeep.js";

export const name = "local dev housekeeping: leases and process ownership";

export async function run() {
  const repositoryRoot = process.cwd();
  const otherRoot = join(repositoryRoot, "another-checkout");
  const leaseRoot = mkdtempSync(join(tmpdir(), "cc-dev-lease-"));
  try {
    assert.notEqual(
      localDevLeasePath({ repositoryRoot, port: DEFAULT_DEV_PORT }),
      localDevLeasePath({ repositoryRoot: otherRoot, port: DEFAULT_DEV_PORT }),
      "lease paths must be repository-specific"
    );
    assert.notEqual(
      localDevLeasePath({ repositoryRoot, port: DEFAULT_DEV_PORT }),
      localDevLeasePath({ repositoryRoot, port: DEFAULT_DEV_PORT + 1 }),
      "lease paths must be port-specific"
    );

    const absolute = {
      comm: "node",
      args: `/usr/bin/node ${join(repositoryRoot, "tools/dev-server.mjs")} 8788`,
      cwd: repositoryRoot,
      startTime: "one"
    };
    assert.equal(isOurDevServerProcess(absolute, repositoryRoot), true);
    assert.equal(isOurDevServerProcess(absolute, otherRoot), false);
    const absoluteScript = join(repositoryRoot, "tools/dev-server.mjs");
    assert.equal(
      isOurDevServerProcess({
        ...absolute,
        args: `node -e ${absolute.args}`,
        argv: ["/usr/bin/node", "-e", absolute.args]
      }, repositoryRoot),
      false,
      "a script path embedded in eval source must not claim the process"
    );
    assert.equal(
      isOurDevServerProcess({
        ...absolute,
        args: `node ${absoluteScript} 8788 --worker`,
        argv: ["/usr/bin/node", absoluteScript, "8788", "--worker"]
      }, repositoryRoot),
      true,
      "the actual script argv may be absolute"
    );
    assert.equal(
      isOurDevServerProcess({ ...absolute, comm: "bash" }, repositoryRoot),
      false,
      "a shell wrapper must not be treated as the server"
    );

    assert.equal(
      devServerPortFromArgs(absolute.args),
      8788,
      "absolute server launches must retain their explicit port"
    );
    assert.equal(
      devServerPortFromArgs("node tools/dev-server.mjs --worker --port 9000"),
      DEFAULT_DEV_PORT,
      "Wrangler's --port must not be confused with the outer listener port"
    );

    const env = { AUTHORING_DATA_DIR: leaseRoot };
    const leasePath = localDevLeasePath({ repositoryRoot, port: DEFAULT_DEV_PORT, env });
    mkdirSync(leaseRoot, { recursive: true });
    writeFileSync(leasePath, "not json\n");
    assert.equal(readFileSync(leasePath, "utf8"), "not json\n");
    assert.deepEqual(pruneLocalDevLeases({ repositoryRoot, env }), [leasePath]);

    // A listener that is not this checkout's verified server must remain
    // untouched; the caller gets a busy result and can decide what to do.
    const foreign = createServer();
    await new Promise((resolve, reject) => {
      foreign.once("error", reject);
      foreign.listen(0, "127.0.0.1", resolve);
    });
    const foreignPort = foreign.address().port;
    try {
      const reclaim = await reclaimLocalDevPort(foreignPort, {
        repositoryRoot,
        env
      });
      assert.equal(reclaim.stopped.length, 0);
      assert.equal(reclaim.free, false);
      assert.equal(foreign.listening, true);
    } finally {
      await new Promise(resolve => foreign.close(resolve));
    }
  } finally {
    rmSync(leaseRoot, { recursive: true, force: true });
  }
}
