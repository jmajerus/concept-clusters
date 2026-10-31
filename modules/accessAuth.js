// One Cloudflare Access check for the LAN authoring server: the token must be
// signed by the TEAM_DOMAIN team and carry a subject. The audience (which
// Access application issued it) is not checked. Every application in the team
// admits only the owner, and pinning one audience tag broke sign-in whenever
// an application was recreated.

import { createLocalJWKSet, createRemoteJWKSet, jwtVerify } from "jose";

export const LOCAL_ACCESS_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

const AUTHORING_SCOPES = ["puzzles:read", "drafts:write", "publication:submit"];

function stringClaim(payload, name) {
  const value = payload?.[name];
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function devAccessActor(subject) {
  return {
    actor: { subject },
    authInfo: {
      token: "local-development",
      clientId: subject,
      scopes: AUTHORING_SCOPES
    }
  };
}

export async function verifyAccessToken({
  token,
  teamDomain,
  keys = null
}) {
  const team = new URL(teamDomain);
  if (team.protocol !== "https:") {
    throw new Error("TEAM_DOMAIN must use https");
  }
  const keySet = keys || createRemoteJWKSet(new URL("/cdn-cgi/access/certs", team));
  const { payload } = await jwtVerify(token, keySet, { issuer: team.origin });
  const subject = stringClaim(payload, "sub");
  if (!subject) throw new Error("Access token has no subject");
  return {
    actor: {
      subject,
      ...(stringClaim(payload, "email") ? { email: stringClaim(payload, "email") } : {}),
      ...(stringClaim(payload, "name") ? { name: stringClaim(payload, "name") } : {})
    },
    authInfo: {
      token,
      clientId: subject,
      scopes: AUTHORING_SCOPES,
      ...(typeof payload.exp === "number" ? { expiresAt: payload.exp } : {})
    }
  };
}

export function isLoopbackPeer(address) {
  if (typeof address !== "string" || !address) return false;
  const host = address.toLowerCase().replace(/^::ffff:/, "");
  return host === "127.0.0.1" || host === "::1";
}

// A developer on this machine may open /mcp without a token when the peer
// is loopback, the Host is a local name, and AUTHORING_DEV_SUBJECT is set.
// The public Host still requires the Access token, including when cloudflared
// connects from loopback. A remote caller cannot gain that bypass by sending
// Host: localhost.
export async function authenticateAuthoringAccess(request, env = process.env, {
  keys = null,
  peerAddress = null
} = {}) {
  const hostname = new URL(request.url).hostname;
  const token = request.headers.get("cf-access-jwt-assertion");
  const devSubject = typeof env.AUTHORING_DEV_SUBJECT === "string"
    ? env.AUTHORING_DEV_SUBJECT.trim()
    : "";
  if (!token && LOCAL_ACCESS_HOSTNAMES.has(hostname) && devSubject && isLoopbackPeer(peerAddress)) {
    return devAccessActor(devSubject);
  }
  if (!token) {
    return { error: { status: 401, message: "Cloudflare Access authentication is required" } };
  }
  if (!env.TEAM_DOMAIN) {
    return { error: { status: 503, message: "Cloudflare Access is not configured" } };
  }
  try {
    return await verifyAccessToken({
      token,
      teamDomain: env.TEAM_DOMAIN,
      keys
    });
  } catch (error) {
    console.warn(JSON.stringify({
      message: "Access token validation failed",
      error: error instanceof Error ? error.message : String(error)
    }));
    return { error: { status: 401, message: "Cloudflare Access token is invalid" } };
  }
}

export { createLocalJWKSet };
