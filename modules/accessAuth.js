// One Cloudflare Access check for the LAN authoring server. The authoring
// Worker used to perform this same TEAM_DOMAIN / POLICY_AUD verification.
// Remote MCP now terminates on the LAN server, so the check lives here.

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
  policyAud,
  keys = null
}) {
  const team = new URL(teamDomain);
  if (team.protocol !== "https:") {
    throw new Error("TEAM_DOMAIN must use https");
  }
  const keySet = keys || createRemoteJWKSet(new URL("/cdn-cgi/access/certs", team));
  const { payload } = await jwtVerify(token, keySet, {
    issuer: team.origin,
    audience: policyAud
  });
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

// Local hostnames may use AUTHORING_DEV_SUBJECT when no token is present, so
// a developer on the box can open /mcp. Any other host, including the tunnel
// hostname cloudflared forwards, requires the Access token. cloudflared
// connects from loopback, so the Host header is the signal, not the socket.
export async function authenticateAuthoringAccess(request, env = process.env, { keys = null } = {}) {
  const hostname = new URL(request.url).hostname;
  const token = request.headers.get("cf-access-jwt-assertion");
  const devSubject = typeof env.AUTHORING_DEV_SUBJECT === "string"
    ? env.AUTHORING_DEV_SUBJECT.trim()
    : "";
  if (!token && LOCAL_ACCESS_HOSTNAMES.has(hostname) && devSubject) {
    return devAccessActor(devSubject);
  }
  if (!token) {
    return { error: { status: 401, message: "Cloudflare Access authentication is required" } };
  }
  if (!env.TEAM_DOMAIN || !env.POLICY_AUD) {
    return { error: { status: 503, message: "Cloudflare Access is not configured" } };
  }
  try {
    return await verifyAccessToken({
      token,
      teamDomain: env.TEAM_DOMAIN,
      policyAud: env.POLICY_AUD,
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
