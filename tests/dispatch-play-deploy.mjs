import assert from "node:assert/strict";
import { selectDispatchedRun } from "../tools/dispatch-play-deploy.mjs";

export const name = "play deploy dispatch: watch the main workflow run just requested";

export async function run() {
  const startedAt = new Date("2026-10-22T02:00:00.000Z");
  const runs = [
    {
      databaseId: 1,
      event: "push",
      headBranch: "main",
      createdAt: "2026-10-22T02:00:05.000Z"
    },
    {
      databaseId: 2,
      event: "workflow_dispatch",
      headBranch: "feature",
      createdAt: "2026-10-22T02:00:06.000Z"
    },
    {
      databaseId: 3,
      event: "workflow_dispatch",
      headBranch: "main",
      createdAt: "2026-10-22T01:00:00.000Z"
    },
    {
      databaseId: 4,
      event: "workflow_dispatch",
      headBranch: "main",
      createdAt: "2026-10-22T02:00:02.000Z"
    }
  ];
  assert.equal(selectDispatchedRun(runs, { startedAt }).databaseId, 4);
  assert.equal(selectDispatchedRun([], { startedAt }), null);
}
