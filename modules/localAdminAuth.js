// Session-cookie gate for /admin and /admin/* on the plain-Node local dev
// server, used only when it's listening on all interfaces (the LAN/tunnel
// deployment -- see isAllInterfacesHost in localDevHttp.js). A loopback-only
// `npm run dev` never calls this, so day-to-day solo development stays
// frictionless.
//
// Mirrors src/admin.js's ADMIN_KEY + HttpOnly cookie pattern (same cookie
// name, same "the key itself is the cookie value" shape), adapted for
// node:http instead of a Cloudflare Worker:
//   - crypto.subtle.timingSafeEqual is a Workers-only extension, so this
//     uses node:crypto's timingSafeEqual instead.
//   - The cookie is NOT marked Secure: this same process also answers over
//     plain HTTP on the LAN (authoring.localdomain:8787), where a Secure
//     cookie would never be stored by the browser.
//
// The login page's inline script additionally caches the entered key in
// localStorage and auto-submits it on a later visit -- convenience only,
// not enforcement; the cookie is what the server actually checks on every
// request. A rejected auto-submit clears the cached value so a rotated or
// mistyped key doesn't loop silently.

import { timingSafeEqual as nodeTimingSafeEqual } from "node:crypto";
import { readNodeUrlEncoded } from "./draftReviewSubmit.js";

const COOKIE_NAME = "cc_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days -- convenience is the point
const LOCALSTORAGE_KEY_NAME = "ccAdminKey"; // read by the inline script in loginPage()

function timingSafeEqual(a, b) {
  const aBuf = Buffer.from(String(a ?? ""), "utf8");
  const bBuf = Buffer.from(String(b ?? ""), "utf8");
  if (aBuf.length !== bBuf.length) {
    // Still run a same-length comparison so a length mismatch doesn't
    // return early and leak timing.
    nodeTimingSafeEqual(aBuf, Buffer.alloc(aBuf.length));
    return false;
  }
  return nodeTimingSafeEqual(aBuf, bBuf);
}

function parseCookies(cookieHeader) {
  const cookies = {};
  for (const pair of (cookieHeader || "").split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (key) cookies[key.trim()] = decodeURIComponent(rest.join("=").trim());
  }
  return cookies;
}

function sessionCookieHeader(value, maxAge = COOKIE_MAX_AGE) {
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax`;
}

function clearedCookieHeader() {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`;
}

function isAuthenticated(req, adminKey) {
  const cookies = parseCookies(req.headers.cookie);
  return timingSafeEqual(cookies[COOKIE_NAME] || "", adminKey);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}

// Same-path redirect only -- never forwards to another host, so a crafted
// `next` can't be used to bounce a visitor off this login page.
function safeNext(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/admin/drafts";
  return value;
}

function loginPage({ next, badKey = false }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Admin login</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 360px; margin: 15vh auto; color: #1e293b; }
  input { font-size: 16px; padding: 8px; width: 100%; box-sizing: border-box; margin: 8px 0; }
  button { font-size: 15px; padding: 8px 16px; }
  .error { color: #b91c1c; font-size: 14px; }
</style></head>
<body>
  <h1>Admin login</h1>
  ${badKey ? '<p class="error">Incorrect key.</p>' : ""}
  <form method="post" action="/admin/login" id="admin-login-form">
    <input type="hidden" name="next" value="${escapeHtml(next)}">
    <input id="key" name="key" type="password" autofocus autocomplete="current-password" placeholder="Admin key">
    <button type="submit">Continue</button>
  </form>
  <script>
    (function () {
      var STORAGE_KEY = ${JSON.stringify(LOCALSTORAGE_KEY_NAME)};
      var badKey = ${JSON.stringify(Boolean(badKey))};
      var form = document.getElementById("admin-login-form");
      var keyInput = document.getElementById("key");
      var saved = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
      if (badKey) {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      } else if (saved) {
        keyInput.value = saved;
        form.submit();
        return;
      }
      form.addEventListener("submit", function () {
        try { localStorage.setItem(STORAGE_KEY, keyInput.value); } catch (e) {}
      });
    })();
  </script>
</body></html>`;
}

function html(res, status, body) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(body);
}

/**
 * Gate for every request under /admin. Returns true once it has written a
 * response (a login page, a login redirect, or a 503 for a missing
 * ADMIN_KEY) -- the caller must stop routing in that case. Returns false
 * to mean "not an /admin path" or "authenticated, keep routing".
 */
export async function guardLocalAdmin(req, res, { env = process.env } = {}) {
  const urlPath = (req.url || "").split("?")[0];
  if (urlPath !== "/admin" && !urlPath.startsWith("/admin/")) return false;

  if (!env.ADMIN_KEY) {
    html(res, 503, "ADMIN_KEY is not configured on this server.");
    return true;
  }

  if (req.method === "POST" && urlPath === "/admin/login") {
    const form = await readNodeUrlEncoded(req);
    const next = safeNext(form.get("next"));
    const valid = timingSafeEqual(form.get("key") || "", env.ADMIN_KEY);
    if (!valid) {
      res.writeHead(302, { Location: `/admin/login?next=${encodeURIComponent(next)}&badkey=1` });
      res.end();
      return true;
    }
    res.writeHead(302, { Location: next, "Set-Cookie": sessionCookieHeader(env.ADMIN_KEY) });
    res.end();
    return true;
  }

  if (req.method === "POST" && urlPath === "/admin/logout") {
    res.writeHead(302, { Location: "/admin/login", "Set-Cookie": clearedCookieHeader() });
    res.end();
    return true;
  }

  if (isAuthenticated(req, env.ADMIN_KEY)) return false;

  const params = new URLSearchParams((req.url || "").split("?")[1] || "");
  html(res, 401, loginPage({
    next: safeNext(urlPath === "/admin/login" ? params.get("next") : urlPath),
    badKey: params.get("badkey") === "1"
  }));
  return true;
}
