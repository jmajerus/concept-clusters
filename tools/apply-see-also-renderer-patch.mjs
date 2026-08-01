import { readFileSync, writeFileSync } from "node:fs";

function replaceOnce(path, before, after) {
  const source = readFileSync(path, "utf8");
  const count = source.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${path}: expected one replacement target, found ${count}`);
  }
  writeFileSync(path, source.replace(before, after));
}

const oldShowTermInfo = `function showTermInfo(n) {
  clearTimeout(clearInfoTimer);
  termInfoEl.textContent = "";
  const info = n.info || {};
  // A single inline wrapper, not multiple direct children of the flex
  // container — otherwise the text and each link become separate flex
  // items laid out in a row instead of wrapping together as one
  // paragraph (confirmed: the links floated off to the side instead of
  // following the wrapped text).
  const inner = document.createElement("span");
  inner.append(info.text ? \`\${n.word}: \${info.text} \` : \`\${n.word} \`);
  const hrefs = [info.link || searchLink(n.word)];
  if (info.extraLink) hrefs.push(info.extraLink);
  hrefs.forEach(href => {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = \`\${linkLabel(href)} ↗\`;
    inner.append(a, " ");
  });
  termInfoEl.append(inner);
  termInfoEl.classList.add("visible");
}`;

const newShowTermInfo = `function appendInfoAnchor(container, href, label = null) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = \`\${label || linkLabel(href)} ↗\`;
  container.appendChild(anchor);
}

function showTermInfo(n) {
  clearTimeout(clearInfoTimer);
  termInfoEl.textContent = "";
  const info = n.info || {};
  // A single inline wrapper, not multiple direct children of the flex
  // container — otherwise the text and each link become separate flex
  // items laid out in a row instead of wrapping together as one
  // paragraph (confirmed: the links floated off to the side instead of
  // following the wrapped text).
  const inner = document.createElement("span");
  inner.append(info.text ? \`\${n.word}: \${info.text} \` : \`\${n.word} \`);
  const primaryHref = info.link || searchLink(n.word);
  appendInfoAnchor(inner, primaryHref, info.linkLabel);
  if (info.seeAlso?.length) {
    inner.append(" See also: ");
    info.seeAlso.forEach((entry, index) => {
      if (index) inner.append(" · ");
      appendInfoAnchor(inner, entry.href, entry.label);
    });
  }
  termInfoEl.append(inner);
  termInfoEl.classList.add("visible");
}`;

replaceOnce("game.js", oldShowTermInfo, newShowTermInfo);
replaceOnce(
  "game.js",
  `  // Normalized, not the raw puzzle.info -- showTermInfo reads
  // n.info.text/.link/.extraLink directly (every other node reaching it
`,
  `  // Normalized, not the raw puzzle.info -- showTermInfo reads
  // n.info.text/.link/.linkLabel/.seeAlso directly (every other node reaching it
`
);

const oldNodeInfo = `      const seeAlso = info?.seeAlso || [];
      nodes.push({
        id: nodes.length, word: term, gs: [ci],
        connected: c.seeds.includes(term) ? [ci] : [],
        w: pillWidth(term),
        info: {
          text: info?.text || null,
          link: info?.link || clusterInfo?.link || null,
          linkLabel: info?.linkLabel || null,
          extraLink: seeAlso[0]?.href || null,
          seeAlso
        }
      });`;
const newNodeInfo = `      const seeAlso = info?.seeAlso || [];
      const ownLink = info?.link || null;
      const inheritedLink = ownLink ? null : (clusterInfo?.link || null);
      nodes.push({
        id: nodes.length, word: term, gs: [ci],
        connected: c.seeds.includes(term) ? [ci] : [],
        w: pillWidth(term),
        info: {
          text: info?.text || null,
          link: ownLink || inheritedLink,
          linkLabel: ownLink
            ? (info?.linkLabel || null)
            : (clusterInfo?.linkLabel || null),
          extraLink: seeAlso[0]?.href || null,
          seeAlso
        }
      });`;
replaceOnce("modules/puzzleGraph.js", oldNodeInfo, newNodeInfo);

const oldAuthoring = `\`link\` replaces the auto search entirely. \`extraLink\` adds a second
link *alongside* the auto search rather than replacing it — use it
when there's a genuinely better resource worth surfacing but the plain
search result (or the \`link\`) is still a fine fallback on its own.
That "better resource" doesn't have to be Wikipedia — a subject's own
critically-acclaimed source is often more valuable than an encyclopedia
entry: Poynter for media literacy terms, say, since it's a leading
authority on fact-checking and runs the program that popularized
teaching "lateral reading" in the first place:

\`\`\`js
termInfo: {
  "lateral reading": {
    text: "A verification habit of jumping to outside sources to check a site's credibility, rather than staying on the page and evaluating it in isolation.",
    link: "wiki:Media literacy",
    extraLink: "https://www.poynter.org/fact-checking/media-literacy/2023/lateral-reading-the-best-media-literacy-tip-to-vet-credible-sources/"
  }
}
\`\`\`

As with any link, verify a candidate source actually exists and is
genuinely on-topic before adding it (fetch the page, don't rely on a
plausible-looking title or memory) — \`check-wiki-links.mjs\` only
verifies \`wiki:\` targets, so a non-Wikipedia \`extraLink\` gets no
automated safety net at all.

Both \`link\` and \`extraLink\` accept two forms:
`;
const newAuthoring = `\`link\` replaces the auto search entirely and remains the best single
starting point or defining reference. \`linkLabel\` can give that primary
source a specific visible name. Additional references belong in the ordered
\`seeAlso\` list:

\`\`\`js
termInfo: {
  "lateral reading": {
    text: "A verification habit of jumping to outside sources to check a site's credibility, rather than staying on the page and evaluating it in isolation.",
    link: "wiki:Media literacy",
    seeAlso: [
      {
        href: "https://www.poynter.org/fact-checking/media-literacy/2023/lateral-reading-the-best-media-literacy-tip-to-vet-credible-sources/",
        label: "Poynter guide to lateral reading"
      }
    ]
  }
}
\`\`\`

A \`seeAlso\` entry may be a string, which receives an automatic label, or a
\`{ href, label }\` object. Preserve editorial order and add a source only when
it contributes a distinct authority, perspective, example, or level of
analysis. There is no hard maximum, but ordinarily use no more than three.
The legacy \`extraLink\` field remains valid and is normalized as the first
see-also entry; new content should use \`seeAlso\`.

As with any link, verify a candidate source actually exists and is genuinely
on-topic before adding it (fetch the page, don't rely on a plausible-looking
title or memory). \`check-wiki-links.mjs\` verifies \`wiki:\` targets in the
primary and supplementary fields, but non-Wikipedia URLs still require manual
verification. See [INFO-LINKS.md](INFO-LINKS.md) for the complete shape.

\`link\`, string \`seeAlso\` entries, and object \`seeAlso[].href\` values
accept two forms:
`;
replaceOnce("docs/AUTHORING.md", oldAuthoring, newAuthoring);
replaceOnce(
  "docs/AUTHORING.md",
  "`validate.mjs` flags a link that's neither of those — almost always a",
  "`npm run validate` flags a link that's neither of those — almost always a"
);

console.log("Applied see-also renderer and authoring patches.");
