import { readFile } from "node:fs/promises";
import { join } from "node:path";

const WRANGLER_AUTHORING = "wrangler.authoring.jsonc";

export class LocalD1ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "LocalD1ConfigError";
  }
}

function trimmed(env, name) {
  const value = env?.[name];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function decodeJwtPayload(token) {
  const parts = String(token || "").split(".");
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(json);
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

function actorFromPayload(payload) {
  const subject = typeof payload.sub === "string" ? payload.sub.trim() : "";
  if (!subject) return null;
  return {
    subject,
    ...(typeof payload.email === "string" && payload.email.trim()
      ? { email: payload.email.trim() }
      : {}),
    ...(typeof payload.name === "string" && payload.name.trim()
      ? { name: payload.name.trim() }
      : {})
  };
}

export function resolveLocalDraftActor({ env = process.env } = {}) {
  const configured = trimmed(env, "AUTHORING_OWNER_SUBJECT");
  const token = trimmed(env, "CF_ACCESS_JWT")
    || trimmed(env, "CLOUDFLARE_ACCESS_TOKEN")
    || trimmed(env, "CF_ACCESS_TOKEN");
  const fromToken = token ? actorFromPayload(decodeJwtPayload(token) || {}) : null;
  if (fromToken && configured && fromToken.subject !== configured) {
    throw new LocalD1ConfigError(
      "AUTHORING_OWNER_SUBJECT does not match the Cloudflare Access token subject. " +
      "Local stdio MCP writes the same D1 owner_subject hosted MCP uses; they must agree."
    );
  }
  if (fromToken) return fromToken;
  if (configured) return { subject: configured };
  throw new LocalD1ConfigError(
    "Local D1 authoring is not configured. Set AUTHORING_OWNER_SUBJECT to the " +
    "Cloudflare Access `sub` claim hosted MCP uses, or supply CF_ACCESS_JWT so " +
    "stdio and hosted drafts are the same owner-scoped rows."
  );
}

async function readAuthoringWrangler(repositoryRoot) {
  if (!repositoryRoot) return null;
  try {
    const text = await readFile(join(repositoryRoot, WRANGLER_AUTHORING), "utf8");
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function resolveLocalD1Config({
  env = process.env,
  repositoryRoot
} = {}) {
  const accountId = trimmed(env, "CLOUDFLARE_ACCOUNT_ID");
  const token = trimmed(env, "CLOUDFLARE_API_TOKEN")
    || trimmed(env, "CLOUDFLARE_D1_TOKEN");
  const wrangler = await readAuthoringWrangler(repositoryRoot);
  const wranglerDatabaseId = wrangler?.d1_databases?.[0]?.database_id;
  const databaseId = trimmed(env, "CLOUDFLARE_D1_DATABASE_ID")
    || trimmed(env, "AUTHORING_D1_DATABASE_ID")
    || (typeof wranglerDatabaseId === "string" ? wranglerDatabaseId : "");
  const apiBase = trimmed(env, "CLOUDFLARE_API_BASE")
    || "https://api.cloudflare.com/client/v4";
  if (!accountId || !databaseId || !token) {
    throw new LocalD1ConfigError(
      "Local D1 authoring is not configured. Set CLOUDFLARE_ACCOUNT_ID, " +
      "CLOUDFLARE_API_TOKEN (D1 edit), and optionally CLOUDFLARE_D1_DATABASE_ID " +
      `(defaults to ${WRANGLER_AUTHORING}'s AUTHORING_DB id). Stdio MCP uses the ` +
      "D1 HTTP API so drafts and publication_requests are the same rows hosted MCP sees."
    );
  }
  return { accountId, databaseId, token, apiBase };
}

export default resolveLocalD1Config;
