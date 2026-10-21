import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";
import { authoringDatabaseUrl, getAuthoringPool } from "../modules/postgresPool.js";

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "postgres", "migrations");

function sqlStatements(sql) {
  return sql
    .split("\n")
    .filter(line => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map(statement => statement.trim())
    .filter(Boolean);
}

export async function applyPostgresMigrations(pool, { directory = MIGRATIONS_DIR } = {}) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);
  const applied = await pool.query("SELECT filename FROM schema_migrations");
  const seen = new Set(applied.rows.map(row => row.filename));
  const files = (await readdir(directory)).filter(name => name.endsWith(".sql")).sort();
  const ran = [];
  for (const filename of files) {
    if (seen.has(filename)) continue;
    const statements = sqlStatements(await readFile(join(directory, filename), "utf8"));
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const statement of statements) await client.query(statement);
      await client.query(
        "INSERT INTO schema_migrations (filename, applied_at) VALUES ($1, $2)",
        [filename, new Date().toISOString()]
      );
      await client.query("COMMIT");
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch { /* socket already gone */ }
      throw error;
    } finally {
      client.release();
    }
    ran.push(filename);
  }
  return ran;
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  loadProjectEnv();
  const url = authoringDatabaseUrl();
  if (!url) {
    console.error("AUTHORING_DATABASE_URL is required");
    process.exitCode = 1;
  } else {
    const pool = getAuthoringPool(url);
    try {
      const ran = await applyPostgresMigrations(pool);
      console.log(ran.length ? `Applied ${ran.join(", ")}` : "Postgres schema is current");
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  }
}
