#!/usr/bin/env node

// One-off recovery for puzzle PRs that were opened without going through
// the MCP authoring pipeline (e.g. hand-authored via another tool), so
// they never got a puzzle_drafts / publication_requests row in D1. This
// reconstructs both rows from the PR itself so the drafts admin page and
// the review-loop MCP tools can pick the PR up as if it had been
// submitted normally -- further edits then append to the same open PR.
//
// Requires the PR to already carry its canonical content/puzzles/<id>.ccpuzzle.json
// (true for anything authored with the puzzle-authoring skill/schema); if
// a PR only has a hand-written puzzles/**/*.js module with no canonical
// file, generate one first (see tools/backfill-canonical-content.mjs)
// before feeding it in here.
//
// Usage: node tools/backfill-draft-from-pr.mjs <PR number> [<PR number> ...]

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { draftContentHash, serializeDraftDocument, assertDraftId } from "../modules/draftRepository.js";

const WRANGLER_CONFIG = "wrangler.authoring.jsonc";
const DATABASE = "concept-clusters-authoring";

function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8" });
}

function d1Query(sql) {
  const out = execFileSync("npx", [
    "wrangler", "d1", "execute", DATABASE, "--remote",
    "-c", WRANGLER_CONFIG, "--json", "--command", sql
  ], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  // wrangler prints progress lines before the JSON array on some versions;
  // isolate the JSON by finding the first '['.
  const start = out.indexOf("[");
  return JSON.parse(out.slice(start));
}

function d1Exec(sqlStatements) {
  const dir = mkdtempSync(join(tmpdir(), "backfill-draft-"));
  const file = join(dir, "backfill.sql");
  writeFileSync(file, sqlStatements.join("\n"), "utf8");
  try {
    execFileSync("npx", [
      "wrangler", "d1", "execute", DATABASE, "--remote",
      "-c", WRANGLER_CONFIG, "--file", file
    ], { encoding: "utf8", stdio: "inherit" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function findCanonicalPath(prNumber) {
  const files = JSON.parse(gh(["pr", "view", String(prNumber), "--json", "files"])).files;
  const added = files.filter(
    f => f.changeType === "ADDED" && /^content\/puzzles\/[a-z0-9-]+\.ccpuzzle\.json$/.test(f.path)
  );
  if (added.length !== 1) {
    throw new Error(
      `PR #${prNumber}: expected exactly one added content/puzzles/*.ccpuzzle.json, found ${added.length}`
    );
  }
  return added[0].path;
}

async function backfillOne(prNumber) {
  const pr = JSON.parse(gh([
    "pr", "view", String(prNumber), "--json",
    "number,url,baseRefOid,headRefOid,headRefName,state"
  ]));
  if (pr.state !== "OPEN") {
    throw new Error(`PR #${prNumber} is not open (state=${pr.state}); refusing to backfill`);
  }
  const path = await findCanonicalPath(prNumber);
  const raw = gh(["api", `repos/{owner}/{repo}/contents/${path}?ref=${pr.headRefOid}`, "--jq", ".content"]);
  const documentJson = Buffer.from(raw.trim(), "base64").toString("utf8");
  const document = JSON.parse(documentJson);
  const draftId = document.id;
  assertDraftId(draftId);

  const owners = d1Query("SELECT DISTINCT owner_subject FROM puzzle_drafts")[0].results;
  if (owners.length !== 1) {
    throw new Error(
      `Expected exactly one existing owner_subject in puzzle_drafts to reuse, found ${owners.length}: ` +
      JSON.stringify(owners)
    );
  }
  const ownerSubject = owners[0].owner_subject;

  const existingDraft = d1Query(`SELECT id FROM puzzle_drafts WHERE id = ${sqlString(draftId)}`)[0].results;
  if (existingDraft.length) {
    throw new Error(`puzzle_drafts row already exists for "${draftId}" -- refusing to overwrite`);
  }
  const existingPub = d1Query(
    `SELECT id FROM publication_requests WHERE github_pr_number = ${prNumber}`
  )[0].results;
  if (existingPub.length) {
    throw new Error(`publication_requests row already exists for PR #${prNumber} -- refusing to overwrite`);
  }

  const normalizedJson = serializeDraftDocument(document);
  const contentHash = await draftContentHash(normalizedJson);
  const now = new Date().toISOString();
  const requestId = crypto.randomUUID();

  const statements = [
    `INSERT INTO puzzle_drafts (
      id, puzzle_id, owner_subject, title, status,
      document, content_hash, base_commit_sha,
      created_at, updated_at, revision
    ) VALUES (
      ${sqlString(draftId)}, ${sqlString(draftId)}, ${sqlString(ownerSubject)},
      ${sqlString(document.title || null)}, 'submitted',
      ${sqlString(normalizedJson)}, ${sqlString(contentHash)}, ${sqlString(pr.baseRefOid)},
      ${sqlString(now)}, ${sqlString(now)}, 1
    );`,
    `INSERT INTO publication_requests (
      id, draft_id, status, content_hash, base_commit_sha,
      github_branch, github_commit_sha, draft_commit_sha,
      github_pr_number, github_pr_url,
      requested_by, requested_at, updated_at
    ) VALUES (
      ${sqlString(requestId)}, ${sqlString(draftId)}, 'pull-request-open',
      ${sqlString(contentHash)}, ${sqlString(pr.baseRefOid)},
      ${sqlString(pr.headRefName)}, ${sqlString(pr.headRefOid)}, ${sqlString(pr.headRefOid)},
      ${prNumber}, ${sqlString(pr.url)},
      ${sqlString(ownerSubject)}, ${sqlString(now)}, ${sqlString(now)}
    );`
  ];

  console.log(`PR #${prNumber}: backfilling draft "${draftId}" (owner ${ownerSubject})`);
  d1Exec(statements);
  console.log(`PR #${prNumber}: done -- publication_requests id ${requestId}`);
}

const prNumbers = process.argv.slice(2);
if (!prNumbers.length) {
  console.error("Usage: node tools/backfill-draft-from-pr.mjs <PR number> [<PR number> ...]");
  process.exit(1);
}

for (const prNumber of prNumbers) {
  await backfillOne(Number(prNumber));
}
