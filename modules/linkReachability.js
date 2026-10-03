// Reachability of an authored http(s) URL. This is not a reading of the
// page: a response means the server answered, and a refusal, timeout, or
// non-public address is inconclusive rather than a broken link.
//
// Redirects are followed manually so a hop to a loopback, link-local, or
// private address is never requested. Wikipedia titles stay on the
// Wikipedia checker; this module only probes one URL at a time.

import { WIKIPEDIA_USER_AGENT } from "./wikipediaTitles.js";

const MAX_REDIRECTS = 5;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
// HEAD is often unimplemented or refused where GET works.
const HEAD_RETRY_STATUSES = new Set([401, 403, 404, 405, 501]);

/**
 * @typedef {{
 *   status: "ok" | "redirect" | "missing" | "inconclusive",
 *   finalUrl: string | null,
 *   reason: string | null
 * }} Reachability
 */

/**
 * Why this URL must not be requested, or null when it is a public http(s) URL.
 * @param {string} raw
 * @returns {string | null}
 */
export function publicHttpUrlError(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return "not an absolute http(s) URL";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return "not an http(s) URL";
  if (url.username || url.password) return "URL includes credentials";
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host) return "not an absolute http(s) URL";
  if (
    host === "localhost"
    || host.endsWith(".localhost")
    || host.endsWith(".local")
    || host.endsWith(".internal")
    || host.endsWith(".home.arpa")
  ) {
    return "not a public address";
  }
  if (/^\d+$/.test(host) || /^0x[0-9a-f]+$/i.test(host)) return "not a public address";
  if (isBlockedIp(host)) return "not a public address";
  return null;
}

function isBlockedIp(host) {
  if (host.includes(":")) {
    const mapped = host.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
    if (mapped) return isBlockedIp(mapped[1]);
    if (host === "::" || host === "::1") return true;
    const first = host.split(":")[0];
    if (/^f[cd]/i.test(first)) return true;
    if (/^fe[89ab]/i.test(first)) return true;
    if (/^ff/i.test(first)) return true;
    return false;
  }
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  if (parts.some(part => !/^\d{1,3}$/.test(part))) return false;
  const octets = parts.map(part => Number(part));
  if (octets.some(octet => octet > 255)) return false;
  const [a, b] = octets;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
}

function header(response, name) {
  const headers = response?.headers;
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(name);
  const value = headers[name] ?? headers[name.toLowerCase()];
  return typeof value === "string" ? value : null;
}

function stripHash(raw) {
  const url = new URL(raw);
  url.hash = "";
  return url.href;
}

function sameDestination(left, right) {
  return stripHash(left) === stripHash(right);
}

async function cancelBody(response) {
  try {
    await response?.body?.cancel?.();
  } catch {
    // The status is what this probe needed.
  }
}

function withTimeout(timeoutMs, parent) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onParent = () => controller.abort();
  if (parent) {
    if (parent.aborted) controller.abort();
    else parent.addEventListener("abort", onParent, { once: true });
  }
  return {
    signal: controller.signal,
    done() {
      clearTimeout(timer);
      parent?.removeEventListener("abort", onParent);
    }
  };
}

async function request(url, method, { fetch: fetchImpl, signal, timeoutMs }) {
  const timed = withTimeout(timeoutMs, signal);
  try {
    const response = await fetchImpl(url, {
      method,
      redirect: "manual",
      signal: timed.signal,
      headers: {
        "User-Agent": WIKIPEDIA_USER_AGENT,
        Accept: "*/*"
      }
    });
    await cancelBody(response);
    return response;
  } finally {
    timed.done();
  }
}

function inconclusive(reason) {
  return { status: "inconclusive", finalUrl: null, reason };
}

/**
 * @param {string} url
 * @param {{ fetch?: typeof fetch, timeoutMs?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<Reachability>}
 */
export async function checkUrlReachability(url, {
  fetch: fetchImpl = globalThis.fetch,
  timeoutMs = 8000,
  signal
} = {}) {
  const blocked = publicHttpUrlError(url);
  if (blocked) return inconclusive(blocked);
  if (typeof fetchImpl !== "function") return inconclusive("fetch is not available");

  let current = url;
  let sawRedirect = false;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    let response;
    try {
      response = await request(current, "HEAD", { fetch: fetchImpl, signal, timeoutMs });
      if (HEAD_RETRY_STATUSES.has(response.status)) {
        response = await request(current, "GET", { fetch: fetchImpl, signal, timeoutMs });
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        return inconclusive(`did not answer within ${Math.round(timeoutMs / 1000)}s`);
      }
      try {
        response = await request(current, "GET", { fetch: fetchImpl, signal, timeoutMs });
      } catch (getError) {
        if (getError?.name === "AbortError") {
          return inconclusive(`did not answer within ${Math.round(timeoutMs / 1000)}s`);
        }
        return inconclusive(`could not be reached: ${getError?.message || getError}`);
      }
    }

    if (REDIRECT_STATUSES.has(response.status)) {
      if (hop === MAX_REDIRECTS) return inconclusive("too many redirects");
      const location = header(response, "location");
      if (!location) return inconclusive(`HTTP ${response.status} without a destination`);
      let next;
      try {
        next = new URL(location, current).href;
      } catch {
        return inconclusive("redirected to an unusable URL");
      }
      const nextBlocked = publicHttpUrlError(next);
      if (nextBlocked) return inconclusive("redirected to a non-public address");
      sawRedirect = true;
      current = next;
      continue;
    }

    if (response.status >= 200 && response.status < 300) {
      if (sawRedirect && !sameDestination(url, current)) {
        return { status: "redirect", finalUrl: stripHash(current), reason: null };
      }
      return { status: "ok", finalUrl: null, reason: null };
    }
    if (response.status === 404 || response.status === 410) {
      return { status: "missing", finalUrl: null, reason: `HTTP ${response.status}` };
    }
    return inconclusive(`HTTP ${response.status}`);
  }
  return inconclusive("too many redirects");
}

/**
 * Probe each URL once. Later duplicates share the first result.
 * @param {string[]} urls
 * @param {Parameters<typeof checkUrlReachability>[1] & { concurrency?: number }} [options]
 * @returns {Promise<Map<string, Reachability>>}
 */
export async function checkUrlReachabilityAll(urls, { concurrency = 4, ...options } = {}) {
  const unique = [...new Set(urls.filter(url => typeof url === "string" && url.trim()))];
  const results = new Map();
  let next = 0;
  async function worker() {
    while (next < unique.length) {
      const index = next;
      next += 1;
      const url = unique[index];
      results.set(url, await checkUrlReachability(url, options));
    }
  }
  const workers = Math.min(concurrency, unique.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}
