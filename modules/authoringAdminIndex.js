const PAGE_STYLE = `
  body { font: 16px/1.5 -apple-system, system-ui, sans-serif; max-width: 920px; margin: 0 auto; padding: 24px 16px 64px; color: #1a1a1a; }
  .meta { color: #666; font-size: 14px; }
  a { color: #2563eb; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 8px 10px 8px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
`;

export function isAuthoringAdminIndexPath(pathname) {
  return pathname === "/admin" || pathname === "/admin/";
}

export function authoringAdminNav() {
  return `<a href="/admin">Admin</a>
    · <a href="/admin/drafts">Puzzle drafts</a>
    · <a href="/admin/catalogues">Catalogues</a>
    · <a href="/admin/categories">Categories</a>`;
}

export function renderAdminIndexPage() {
  const body = `<h1>Admin</h1>
    <p class="meta">Authoring documents in D1. Publish writes the shared live
    row. Export to player is the optional GitHub pull request for the
    git-bundled player. ${authoringAdminNav()}</p>
    <table>
      <thead><tr><th>Page</th><th>What it is</th></tr></thead>
      <tbody>
        <tr>
          <td><a href="/admin/drafts">Puzzle drafts</a></td>
          <td>Your working copies. Design-copy review, Publish, optional
          Export to player. LAN Open board is <code>/?draft=</code>.</td>
        </tr>
        <tr>
          <td><a href="/admin/catalogues">Catalogues</a></td>
          <td>Leaf catalogues. Edit as Library cards
          (<code>/?catalogue=&amp;view=author</code>).</td>
        </tr>
        <tr>
          <td><a href="/admin/categories">Categories</a></td>
          <td>Taxonomy documents: title, domain, blurb. Membership stays
          derived from puzzles.</td>
        </tr>
      </tbody>
    </table>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Admin</title>
  <style>${PAGE_STYLE}</style>
</head>
<body>${body}</body>
</html>`;
}

export function handleAuthoringAdminIndex(req, res) {
  const urlPath = (req.url || "").split("?")[0];
  if (!isAuthoringAdminIndexPath(urlPath)) return false;
  if (urlPath === "/admin/") {
    res.writeHead(302, {
      Location: "/admin",
      "Cache-Control": "no-store"
    });
    res.end();
    return true;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, {
      Allow: "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end("Method Not Allowed");
    return true;
  }
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(req.method === "HEAD" ? "" : renderAdminIndexPage());
  return true;
}

export default renderAdminIndexPage;
