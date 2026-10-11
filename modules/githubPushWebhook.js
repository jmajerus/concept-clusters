// POST /hooks/github: GitHub's push webhook for the LAN authoring server.
// It sits outside /admin (GitHub cannot log in), so the shared secret is
// the whole gate: every delivery must carry a valid X-Hub-Signature-256
// HMAC of its body. Without AUTHORING_GITHUB_WEBHOOK_SECRET the route does
// not exist. A push only triggers a fetch and a status refresh -- nothing
// in the payload is trusted beyond "something changed".
import { createHmac, timingSafeEqual } from "node:crypto";

export const GITHUB_WEBHOOK_PATH = "/hooks/github";
// GitHub caps push payloads at 25 MB; a push touching that much is still
// only a "something changed" signal, so refuse rather than buffer it all.
const MAX_BODY_BYTES = 5 * 1024 * 1024;

export function githubSignature(secret, body) {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

export function verifyGithubSignature(secret, body, header) {
  if (!secret || typeof header !== "string") return false;
  const expected = Buffer.from(githubSignature(secret, body));
  const actual = Buffer.from(header);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function reply(res, status, text = "") {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
  res.end(text);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** Returns true when it answered the request. */
export async function handleGithubPushWebhook(req, res, { secret, onPush }) {
  if ((req.url || "").split("?")[0] !== GITHUB_WEBHOOK_PATH || !secret) return false;
  if (req.method !== "POST") {
    res.writeHead(405, { Allow: "POST", "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return true;
  }
  const body = await readBody(req);
  if (!body) {
    reply(res, 413, "Payload too large");
    return true;
  }
  if (!verifyGithubSignature(secret, body, req.headers["x-hub-signature-256"])) {
    reply(res, 401, "Bad signature");
    return true;
  }
  const event = req.headers["x-github-event"];
  if (event === "ping") {
    reply(res, 200, "pong");
    return true;
  }
  if (event !== "push") {
    reply(res, 202, `Ignored ${String(event || "unknown")} event`);
    return true;
  }
  // Answer before fetching: GitHub times a delivery out after 10 s.
  reply(res, 202, "Refreshing");
  Promise.resolve()
    .then(() => onPush())
    .catch(() => {});
  return true;
}
