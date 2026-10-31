import assert from "node:assert/strict";
import { Readable, Writable } from "node:stream";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import {
  authenticateAuthoringAccess,
  verifyAccessToken
} from "../modules/accessAuth.js";
import { linkHealthDue } from "../modules/linkHealthSchedule.js";
import {
  authoringMcpHealth,
  summarizeMcpBody
} from "../modules/authoringMcpHealth.js";
import { MAX_MCP_REQUEST_BYTES } from "../modules/authoringMcpHttp.js";
import { handleLocalMcpRequest, nodeRequestToWeb } from "../modules/localMcpHttp.js";

export const name = "LAN authoring access: Access token and Monday link-health slot";

export async function run() {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const jwk = await exportJWK(publicKey);
  jwk.alg = "RS256";
  jwk.kid = "test-key";
  const keys = createLocalJWKSet({ keys: [jwk] });
  const token = await new SignJWT({
    sub: "author-subject",
    email: "author@example.com",
    name: "Author"
  })
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuer("https://team.example")
    .setAudience("policy-aud")
    .setExpirationTime("2h")
    .sign(privateKey);

  const verified = await verifyAccessToken({
    token,
    teamDomain: "https://team.example",
    keys
  });
  assert.equal(verified.actor.subject, "author-subject");
  assert.equal(verified.actor.email, "author@example.com");
  assert.equal(verified.authInfo.clientId, "author-subject");

  const request = new Request("https://authoring.example/mcp", {
    headers: { "cf-access-jwt-assertion": token }
  });
  // A stale POLICY_AUD left in an env file no longer matters.
  const signedIn = await authenticateAuthoringAccess(request, {
    TEAM_DOMAIN: "https://team.example",
    POLICY_AUD: "a-deleted-application"
  }, { keys });
  assert.equal(signedIn.actor.subject, "author-subject");

  const otherTeam = await authenticateAuthoringAccess(request, {
    TEAM_DOMAIN: "https://other-team.example"
  }, { keys });
  assert.equal(otherTeam.error.status, 401);

  const missing = await authenticateAuthoringAccess(
    new Request("https://authoring.example/mcp"),
    { TEAM_DOMAIN: "https://team.example" }
  );
  assert.equal(missing.error.status, 401);

  const local = await authenticateAuthoringAccess(
    new Request("http://localhost/mcp"),
    { AUTHORING_DEV_SUBJECT: "local-author" },
    { peerAddress: "127.0.0.1" }
  );
  assert.equal(local.actor.subject, "local-author");
  assert.equal(local.authInfo.token, "local-development");

  const spoofedHost = await authenticateAuthoringAccess(
    new Request("http://localhost/mcp"),
    { AUTHORING_DEV_SUBJECT: "local-author" },
    { peerAddress: "192.168.1.50" }
  );
  assert.equal(spoofedHost.error.status, 401);

  const mappedLoopback = await authenticateAuthoringAccess(
    new Request("http://localhost/mcp"),
    { AUTHORING_DEV_SUBJECT: "local-author" },
    { peerAddress: "::ffff:127.0.0.1" }
  );
  assert.equal(mappedLoopback.actor.subject, "local-author");

  const mondayMorning = new Date("2026-10-19T06:00:00.000Z");
  const lastWeek = new Date("2026-10-12T06:05:00.000Z");
  assert.equal(linkHealthDue(mondayMorning, lastWeek.getTime()), true);
  assert.equal(linkHealthDue(mondayMorning, mondayMorning.getTime()), false);
  const before = new Date("2026-10-19T05:59:00.000Z");
  assert.equal(linkHealthDue(before, lastWeek.getTime()), false);

  let pulled = false;
  const unread = new Readable({
    read() {
      pulled = true;
      this.push(null);
    }
  });
  unread.method = "POST";
  unread.url = "/mcp";
  unread.headers = { host: "authoring.example", "content-length": "2000000" };
  await assert.rejects(() => nodeRequestToWeb(unread), /exceeds/);
  assert.equal(pulled, false);

  let unauthorizedPulls = 0;
  const anonymous = new Readable({
    read() {
      unauthorizedPulls += 1;
      this.push(Buffer.alloc(64));
    }
  });
  anonymous.method = "POST";
  anonymous.url = "/mcp";
  anonymous.headers = { host: "authoring.example" };
  const chunks = [];
  const res = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.from(chunk));
      callback();
    }
  });
  res.writeHead = status => {
    res.statusCode = status;
  };
  const beforeReject = authoringMcpHealth();
  const handled = await handleLocalMcpRequest(anonymous, res, {
    env: {},
    repositoryRoot: process.cwd()
  });
  assert.equal(handled, true);
  assert.equal(res.statusCode, 401);
  assert.equal(unauthorizedPulls, 0);
  assert.match(Buffer.concat(chunks).toString("utf8"), /Cloudflare Access authentication is required/);
  const afterReject = authoringMcpHealth();
  assert.equal(afterReject.rejected, beforeReject.rejected + 1);
  assert.equal(afterReject.accepted, beforeReject.accepted);
  assert.equal(afterReject.lastRejected.reason, "no token");
  assert.equal(JSON.stringify(afterReject).includes("author@example.com"), false);

  const summary = summarizeMcpBody(JSON.stringify({
    method: "initialize",
    params: {
      clientInfo: { name: "Cursor\n<script>" },
      arguments: { token: "secret" }
    }
  }));
  assert.equal(summary.client, "Cursor<script>");
  assert.equal(summary.method, "initialize");
  assert.deepEqual(
    summarizeMcpBody(JSON.stringify({
      method: "tools/call",
      params: { name: "list_puzzles", arguments: { query: "secret" } }
    })),
    { method: "tools/call list_puzzles", client: null }
  );

  const oversized = new Readable({ read() { this.push(null); } });
  oversized.method = "POST";
  oversized.url = "/mcp";
  oversized.headers = { host: "authoring.example", "content-length": "2000000" };
  const oversizedRes = new Writable({
    write(_chunk, _encoding, callback) { callback(); }
  });
  oversizedRes.writeHead = status => { oversizedRes.statusCode = status; };
  const beforeLarge = authoringMcpHealth();
  assert.equal(await handleLocalMcpRequest(oversized, oversizedRes, { env: {} }), true);
  assert.equal(oversizedRes.statusCode, 413);
  const afterLarge = authoringMcpHealth();
  assert.equal(afterLarge.rejected, beforeLarge.rejected + 1);
  assert.equal(afterLarge.lastRejected.reason, "body too large");

  const chunk = Buffer.alloc(64 * 1024, 1);
  let sent = 0;
  const chunked = new Readable({
    read() {
      if (sent > MAX_MCP_REQUEST_BYTES + chunk.length) return;
      sent += chunk.length;
      this.push(chunk);
    }
  });
  chunked.method = "POST";
  chunked.url = "/mcp";
  chunked.headers = { host: "localhost" };
  chunked.socket = { remoteAddress: "127.0.0.1" };
  const chunkedRes = new Writable({
    write(_chunk, _encoding, callback) { callback(); }
  });
  chunkedRes.writeHead = status => { chunkedRes.statusCode = status; };
  const beforeChunked = authoringMcpHealth();
  assert.equal(await handleLocalMcpRequest(chunked, chunkedRes, {
    env: { AUTHORING_DEV_SUBJECT: "local-author" },
    repositoryRoot: process.cwd()
  }), true);
  assert.equal(chunkedRes.statusCode, 413);
  assert.ok(sent < MAX_MCP_REQUEST_BYTES + chunk.length * 4, "the reader stops once the limit is crossed");
  const afterChunked = authoringMcpHealth();
  assert.equal(afterChunked.rejected, beforeChunked.rejected + 1);
  assert.equal(afterChunked.accepted, beforeChunked.accepted);
  assert.equal(afterChunked.lastRejected.reason, "body too large");
}
