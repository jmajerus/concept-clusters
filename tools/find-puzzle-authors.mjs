#!/usr/bin/env node
// Forensic search across git history and every local AI-agent session store
// this machine has, for mentions of a puzzle (id, slug, or title fragment).
//
// Why this exists: modules/authoringProvenance.js records collaboration/
// contributor info going forward, but puzzles authored before that field (or
// before an agent bothered to fill it in) have no provenance on the document
// itself. This script reconstructs "who touched this" from raw session
// history instead.
//
// Coverage is driven by modules/authoringHosts.js -- the same registry the
// MCP server's auto-stamp uses (see modules/mcpClientIdentity.js) -- so every
// known agent/host is at least *listed*, even ones with no wired-up local
// search yet or no local session store on this machine (web-hosted clients).
//
// Usage:
//   node tools/find-puzzle-authors.mjs <term> [term2 ...]
// Terms are OR'd, case-insensitive substrings (pass a puzzle id AND a title
// fragment -- older puzzles are more likely findable by title than id).
//
// This only reads files under $HOME; it never writes or deletes anything.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { AUTHORING_HOSTS } from "../modules/authoringHosts.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOME = homedir();

// node:sqlite is stable enough here to use unflagged, but still emits a
// one-time ExperimentalWarning per process -- suppress it, it's just noise.
process.removeAllListeners("warning");

const terms = process.argv.slice(2).filter(a => a && !a.startsWith("--"));
if (!terms.length) {
  console.error("Usage: node tools/find-puzzle-authors.mjs <puzzle id | slug | title fragment> [more terms...]");
  console.error("Terms are OR'd. Try both the puzzle id and a distinctive title fragment.");
  process.exit(1);
}
const needles = terms.map(t => t.toLowerCase());

function matchesAny(text) {
  if (!text) return false;
  const hay = String(text).toLowerCase();
  return needles.some(n => hay.includes(n));
}

function firstMatchTerm(text) {
  const hay = String(text).toLowerCase();
  return needles.find(n => hay.includes(n)) || needles[0];
}

function snippet(text, radius = 90) {
  const str = String(text).replace(/\s+/g, " ").trim();
  const term = firstMatchTerm(str);
  const idx = str.toLowerCase().indexOf(term);
  if (idx === -1) return str.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(str.length, idx + term.length + radius);
  return `${start > 0 ? "…" : ""}${str.slice(start, end)}${end < str.length ? "…" : ""}`;
}

const TIMESTAMP_FIELD = "timestamp|created_at|created_at_ms|createdAt|startTime|start_time|completedAt|started_at|updated_at|updatedAt|lastUpdated|date|creationDate";
const TIMESTAMP_QUOTED_RE = new RegExp(`"(?:${TIMESTAMP_FIELD})"\\s*:\\s*"([^"]+)"`, "i");
const TIMESTAMP_EPOCH_RE = new RegExp(`"(?:${TIMESTAMP_FIELD})"\\s*:\\s*(\\d{10,13})(?![\\d"])`, "i");
function guessTimestamp(line) {
  const quoted = TIMESTAMP_QUOTED_RE.exec(line);
  if (quoted) {
    const d = new Date(quoted[1]);
    return Number.isNaN(d.getTime()) ? quoted[1] : d.toISOString();
  }
  const epoch = TIMESTAMP_EPOCH_RE.exec(line);
  if (epoch) {
    const raw = epoch[1];
    const ms = raw.length === 13 ? Number(raw) : Number(raw) * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

function safeReaddir(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

/** Recursively collect files matching one of `exts` under `dir`, bounded depth. */
function walkFiles(dir, exts, maxDepth = 6) {
  const out = [];
  (function walk(cur, depth) {
    if (depth > maxDepth) return;
    for (const name of safeReaddir(cur)) {
      const p = join(cur, name);
      if (isDir(p)) walk(p, depth + 1);
      else if (exts.some(ext => name.endsWith(ext))) out.push(p);
    }
  })(dir, 0);
  return out;
}

/** Generic line-oriented scan: works for any JSONL/log file since we match
 * against the raw serialized line rather than parsing per-schema fields. */
function scanLinesFile(filePath, agent, source) {
  const hits = [];
  let content;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    return hits;
  }
  const lines = content.split("\n");
  for (const line of lines) {
    if (!line || !matchesAny(line)) continue;
    hits.push({
      agent,
      source,
      file: filePath,
      when: guessTimestamp(line),
      snippet: snippet(line)
    });
  }
  return hits;
}

// ---------------------------------------------------------------------------
// git history (Freeze commits + any direct commits; does NOT see pre-Freeze
// D1 draft content per feedback_puzzle_content_edits_via_mcp_only.md)
// ---------------------------------------------------------------------------
function searchGit() {
  const hashes = new Set();
  for (const term of terms) {
    for (const args of [
      ["log", "--all", "-i", `--grep=${term}`, "--format=%H"],
      ["log", "--all", "-i", `-S${term}`, "--format=%H"]
    ]) {
      try {
        const out = execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" });
        out.split("\n").filter(Boolean).forEach(h => hashes.add(h));
      } catch {
        // ignore -- e.g. term has regex-special chars git chokes on
      }
    }
  }
  const commits = [];
  for (const hash of hashes) {
    try {
      const raw = execFileSync(
        "git",
        ["show", "-s", "--format=%H%x1f%aI%x1f%an%x1f%s%x1f%b", hash],
        { cwd: repoRoot, encoding: "utf8" }
      );
      const [h, date, author, subject, ...bodyParts] = raw.split("\x1f");
      const body = bodyParts.join("\x1f");
      const coAuthors = [...body.matchAll(/Co-Authored-By:\s*(.+)/gi)].map(m => m[1].trim());
      commits.push({ hash: h, date, author, subject: subject.trim(), coAuthors });
    } catch {
      // ignore
    }
  }
  commits.sort((a, b) => (a.date < b.date ? 1 : -1));
  return commits;
}

// ---------------------------------------------------------------------------
// Per-host local session-history handlers.
// Keyed by the same host `id` used in modules/authoringHosts.js /
// modules/mcpClientIdentity.js, so coverage can be diffed against that list.
// ---------------------------------------------------------------------------

function searchClaudeCode() {
  const root = join(HOME, ".claude", "projects");
  if (!existsSync(root)) return { hits: [], note: "no ~/.claude/projects directory found" };
  const hits = [];
  for (const file of walkFiles(root, [".jsonl"])) {
    hits.push(...scanLinesFile(file, "claude-code", file));
  }
  return { hits };
}

function searchCodex() {
  const base = join(HOME, ".codex");
  if (!existsSync(base)) return { hits: [], note: "no ~/.codex directory found" };
  const hits = [];
  for (const dir of [join(base, "sessions"), join(base, "archived_sessions")]) {
    for (const file of walkFiles(dir, [".jsonl"])) {
      hits.push(...scanLinesFile(file, "codex", file));
    }
  }
  // Rollout files are the primary record above; the sqlite projection is a
  // secondary index over the same data plus item_json for compacted turns.
  const dbPath = join(base, "thread_history_1.sqlite");
  if (existsSync(dbPath)) {
    hits.push(searchSqliteLike(dbPath, "codex", [
      { table: "thread_items", cols: ["item_json"], extra: "thread_id, turn_id, created_at_ms" }
    ]));
  }
  return { hits };
}

function searchGeminiCli() {
  const base = join(HOME, ".gemini");
  if (!existsSync(base)) return { hits: [], note: "no ~/.gemini directory found" };
  const hits = [];
  for (const projectDir of safeReaddir(join(base, "tmp"))) {
    const chatsDir = join(base, "tmp", projectDir, "chats");
    for (const file of walkFiles(chatsDir, [".jsonl"])) {
      hits.push(...scanLinesFile(file, "gemini-cli", file));
    }
    const logsJson = join(base, "tmp", projectDir, "logs.json");
    if (isFile(logsJson)) hits.push(...scanLinesFile(logsJson, "gemini-cli", logsJson));
  }
  return { hits };
}

function searchZcode() {
  const base = join(HOME, ".zcode");
  if (!existsSync(base)) return { hits: [], note: "no ~/.zcode directory found" };
  const hits = [];
  for (const dir of [join(base, "cli", "rollout"), join(base, "cli", "log")]) {
    for (const file of walkFiles(dir, [".jsonl"])) {
      hits.push(...scanLinesFile(file, "zcode", file));
    }
  }
  const dbPath = join(base, "v2", "tasks-index.sqlite");
  if (existsSync(dbPath)) {
    hits.push(searchSqliteLike(dbPath, "zcode", [
      { table: "tasks", cols: ["title", "searchable_text", "meta_json"], extra: "task_id, workspace_path, updated_at" }
    ]));
  }
  return { hits };
}

/** Cursor's chat/composer data lives in a global sqlite KV store, not per
 * workspace -- composerData:<uuid> values are plain JSON text. */
function searchCursor() {
  const dbPath = join(HOME, ".config", "Cursor", "User", "globalStorage", "state.vscdb");
  if (!existsSync(dbPath)) return { hits: [], note: "no Cursor globalStorage/state.vscdb found" };
  return {
    hits: [searchSqliteLike(dbPath, "cursor", [
      { table: "cursorDiskKV", cols: ["value"], where: "key LIKE 'composerData:%'", extra: "key" }
    ])]
  };
}

/** GitHub Copilot Chat: per-workspace chatSessions/*.jsonl (plain JSON lines)
 * plus the cross-workspace session-store.db (sessions/turns tables). Scoped
 * to workspaces whose workspace.json folder mentions this repo. */
function searchCopilot() {
  const hits = [];
  const codeUsers = join(HOME, ".config", "Code", "User");
  if (!existsSync(codeUsers)) return { hits: [], note: "no ~/.config/Code/User directory found" };
  const wsRoot = join(codeUsers, "workspaceStorage");
  let scopedWorkspaces = 0;
  for (const wsId of safeReaddir(wsRoot)) {
    const wsPath = join(wsRoot, wsId);
    const wsJsonPath = join(wsPath, "workspace.json");
    let folder = "";
    if (isFile(wsJsonPath)) {
      try {
        folder = JSON.parse(readFileSync(wsJsonPath, "utf8")).folder || "";
      } catch { /* ignore */ }
    }
    if (!folder.toLowerCase().includes("concept-clusters")) continue;
    scopedWorkspaces++;
    for (const file of walkFiles(join(wsPath, "chatSessions"), [".jsonl"], 1)) {
      hits.push(...scanLinesFile(file, "copilot", file));
    }
  }
  const sessionDb = join(codeUsers, "globalStorage", "github.copilot-chat", "session-store.db");
  if (existsSync(sessionDb)) {
    hits.push(searchSqliteLike(sessionDb, "copilot", [
      { table: "turns", cols: ["user_message", "assistant_response"], extra: "session_id, turn_index, timestamp" }
    ]));
  }
  return { hits, note: scopedWorkspaces ? undefined : "no workspaceStorage entry maps to this repo" };
}

/** kilo-code has no confirmed native local store on this machine yet -- probe
 * the plausible extension globalStorage locations and say so either way. */
function searchKiloCode() {
  const candidates = [
    join(HOME, ".config", "Code", "User", "globalStorage", "kilocode.kilo-code"),
    join(HOME, ".config", "Cursor", "User", "globalStorage", "kilocode.kilo-code")
  ];
  const hits = [];
  let foundAny = false;
  for (const dir of candidates) {
    if (!existsSync(dir)) continue;
    foundAny = true;
    for (const file of walkFiles(dir, [".json", ".jsonl"])) {
      hits.push(...scanLinesFile(file, "kilo-code", file));
    }
  }
  return { hits, note: foundAny ? undefined : "kilo-code extension storage not found on this machine" };
}

// Generic sqlite substring search using node's built-in driver. Never
// throws -- open/query failures (locked WAL file, missing node:sqlite,
// unexpected schema) come back as a single explanatory hit instead, so
// callers can push the returned promise straight into a hits array and let
// main() await + flatten it uniformly.
async function searchSqliteLike(dbPath, agent, queries) {
  let DatabaseSync;
  try {
    ({ DatabaseSync } = await import("node:sqlite"));
  } catch (e) {
    return [{ agent, source: dbPath, when: null, snippet: `(node:sqlite unavailable: ${e.message})` }];
  }
  let db;
  try {
    db = new DatabaseSync(dbPath, { readOnly: true });
  } catch (e) {
    return [{ agent, source: dbPath, when: null, snippet: `(could not open db, possibly locked by a running app: ${e.message})` }];
  }
  const hits = [];
  try {
    for (const q of queries) {
      const likeClause = q.cols.map(c => `${c} LIKE ?`).join(" OR ");
      const whereClause = q.where ? `(${q.where}) AND (${likeClause})` : likeClause;
      const selectCols = [q.extra, ...q.cols].filter(Boolean).join(", ");
      const source = `${dbPath} :: ${q.table}`;
      let stmt;
      try {
        stmt = db.prepare(`SELECT ${selectCols} FROM ${q.table} WHERE ${whereClause}`);
      } catch (e) {
        hits.push({ agent, source, when: null, snippet: `(query failed: ${e.message})` });
        continue;
      }
      const seen = new Set();
      for (const needle of needles) {
        let rows;
        try {
          rows = stmt.all(...q.cols.map(() => `%${needle}%`));
        } catch (e) {
          hits.push({ agent, source, when: null, snippet: `(query failed: ${e.message})` });
          continue;
        }
        for (const row of rows) {
          const text = JSON.stringify(row);
          if (!matchesAny(text) || seen.has(text)) continue;
          seen.add(text);
          hits.push({ agent, source, when: guessTimestamp(text), snippet: snippet(text) });
        }
      }
    }
  } finally {
    db.close();
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Host registry coverage: every id in modules/authoringHosts.js gets either a
// handler above, or an explicit reason it has none, so a newly-added host
// can't silently fall through unnoticed.
// ---------------------------------------------------------------------------
const HOST_SEARCHERS = {
  "claude-code": searchClaudeCode,
  cursor: searchCursor,
  copilot: searchCopilot,
  codex: searchCodex,
  "gemini-cli": searchGeminiCli,
  zcode: searchZcode,
  "kilo-code": searchKiloCode
};

const NO_LOCAL_STORE_HOSTS = {
  claude: "web-hosted (claude.ai); no local session transcript on this machine",
  chatgpt: "web-hosted; no local session transcript on this machine",
  gemini: "web-hosted Gemini (non-CLI); no local session transcript -- see gemini-cli for the CLI variant",
  muse: "no local session-history location known yet; only ~/.config/muse (auth/settings, no chat data) found",
  "muse-code": "no local session-history location known yet on this machine"
};

async function main() {
  console.log(`Searching for: ${terms.map(t => JSON.stringify(t)).join(" OR ")}\n`);

  const results = []; // { agentLabel, hits: [...] , note }

  console.log("== git history (Freeze commits only; pre-Freeze D1 drafts aren't in git) ==");
  const commits = searchGit();
  if (!commits.length) {
    console.log("  no matching commits\n");
  } else {
    for (const c of commits) {
      console.log(`  ${c.date}  ${c.hash.slice(0, 10)}  ${c.author}  ${c.subject}`);
      for (const co of c.coAuthors) console.log(`      co-authored-by: ${co}`);
    }
    console.log();
  }

  for (const [hostId, label] of Object.entries(AUTHORING_HOSTS.labels)) {
    const system = label.system;
    if (HOST_SEARCHERS[hostId]) {
      let result;
      try {
        result = await HOST_SEARCHERS[hostId]();
      } catch (e) {
        result = { hits: [], note: `handler error: ${e.message}` };
      }
      // await any sqlite hit-arrays that were pushed in as pending promises
      const flatHits = [];
      for (const h of result.hits) {
        if (h instanceof Promise) flatHits.push(...(await h));
        else flatHits.push(h);
      }
      console.log(`== ${system} (${hostId}) ==`);
      if (result.note) console.log(`  note: ${result.note}`);
      if (!flatHits.length) {
        console.log("  no matches\n");
        continue;
      }
      flatHits.sort((a, b) => (b.when || "").localeCompare(a.when || ""));
      for (const h of flatHits) {
        console.log(`  ${h.when || "(no timestamp)"}  ${h.file || h.source}`);
        console.log(`      ${h.snippet}`);
      }
      console.log();
    } else if (NO_LOCAL_STORE_HOSTS[hostId]) {
      console.log(`== ${system} (${hostId}) ==`);
      console.log(`  not searched: ${NO_LOCAL_STORE_HOSTS[hostId]}\n`);
    } else {
      console.log(`== ${system} (${hostId}) ==`);
      console.log("  not searched: no handler wired up for this host yet in tools/find-puzzle-authors.mjs -- add one\n");
    }
  }

  console.log("Reminder: check the puzzle's own provenance first --");
  console.log("get_puzzle_draft / get_puzzle returns a provenance.contributors list with");
  console.log("model/host already attached for anything authored since the auto-stamp shipped.");
  console.log("Everything above is for puzzles that predate that, or where an agent never filled it in.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
