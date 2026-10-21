import pg from "pg";

const pools = new Map();

export function authoringDatabaseUrl(env = process.env) {
  const value = env?.AUTHORING_DATABASE_URL;
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function getAuthoringPool(connectionString = authoringDatabaseUrl()) {
  if (!connectionString) throw new Error("AUTHORING_DATABASE_URL is required");
  let pool = pools.get(connectionString);
  if (!pool) {
    pool = new pg.Pool({ connectionString, max: 10 });
    pools.set(connectionString, pool);
  }
  return pool;
}

export function postgresConnectionDropped(error) {
  const code = String(error?.code || "");
  if ([
    "ECONNRESET",
    "EPIPE",
    "57P01",
    "57P02",
    "57P03",
    "08000",
    "08001",
    "08003",
    "08004",
    "08006",
    "08007",
    "08P01"
  ].includes(code)) return true;
  return /connection (terminated|reset|closed)|Client has encountered a connection error|Connection terminated/i
    .test(String(error?.message || ""));
}

export function affectedRows(result) {
  const count = result?.rowCount;
  return typeof count === "number" ? count : 0;
}

export function uniqueViolation(error) {
  return error?.code === "23505"
    || /duplicate key|unique constraint/i.test(String(error?.message || ""));
}

// One connection, one commit. A dropped socket rolls the transaction back
// with the connection; the caller may reread revision before retrying.
export async function withTransaction(pool, fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // The socket may already be gone.
    }
    throw error;
  } finally {
    client.release();
  }
}
