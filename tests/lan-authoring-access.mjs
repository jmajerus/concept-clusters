import assert from "node:assert/strict";
import { Readable, Writable } from "node:stream";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import {
  authenticateAuthoringAccess,
  verifyAccessToken
} from "../modules/accessAuth.js";
import { linkHealthDue } from "../modules/linkHealthSchedule.js";
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
    policyAud: "policy-aud",
    keys
  });
  assert.equal(verified.actor.subject, "author-subject");
  assert.equal(verified.actor.email, "author@example.com");
  assert.equal(verified.authInfo.clientId, "author-subject");

  const request = new Request("https://authoring.example/mcp", {
    headers: { "cf-access-jwt-assertion": token }
  });
  const signedIn = await authenticateAuthoringAccess(request, {
    TEAM_DOMAIN: "https://team.example",
    POLICY_AUD: "policy-aud"
  }, { keys });
  assert.equal(signedIn.actor.subject, "author-subject");

  const missing = await authenticateAuthoringAccess(
    new Request("https://authoring.example/mcp"),
    { TEAM_DOMAIN: "https://team.example", POLICY_AUD: "policy-aud" }
  );
  assert.equal(missing.error.status, 401);

  const local = await authenticateAuthoringAccess(
    new Request("http://localhost/mcp"),
    { AUTHORING_DEV_SUBJECT: "local-author" }
  );
  assert.equal(local.actor.subject, "local-author");
  assert.equal(local.authInfo.token, "local-development");

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
  const handled = await handleLocalMcpRequest(anonymous, res, {
    env: {},
    repositoryRoot: process.cwd()
  });
  assert.equal(handled, true);
  assert.equal(res.statusCode, 401);
  assert.equal(unauthorizedPulls, 0);
  assert.match(Buffer.concat(chunks).toString("utf8"), /Cloudflare Access authentication is required/);
}
