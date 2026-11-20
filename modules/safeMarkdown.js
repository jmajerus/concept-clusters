import { fenceClasses, fenceCloseIndex, fenceOpenSpec, lessonBlockFor } from "./lessonBlocks.js";

function element(name, text) {
  const node = document.createElement(name);
  if (text !== undefined) node.textContent = text;
  return node;
}

function safeLinkUrl(raw, baseUrl) {
  try {
    const url = new URL(raw, baseUrl);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function appendInline(container, text, { baseUrl, resolveAssetUrl }) {
  const pattern = /(!?\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    container.appendChild(document.createTextNode(text.slice(cursor, match.index)));
    const token = match[0];
    if (token.startsWith("![")) {
      try {
        const image = element("img");
        image.src = resolveAssetUrl(match[3]);
        image.alt = match[2];
        image.loading = "lazy";
        if (match[4]) image.title = match[4];
        container.appendChild(image);
      } catch {
        container.appendChild(document.createTextNode(`[Image unavailable: ${match[2]}]`));
      }
    } else if (token.startsWith("[")) {
      const href = safeLinkUrl(match[3], baseUrl);
      if (href) {
        const anchor = element("a", match[2]);
        anchor.href = href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        container.appendChild(anchor);
      } else {
        container.appendChild(document.createTextNode(match[2]));
      }
    } else if (match[5] !== undefined) {
      container.appendChild(element("strong", match[5]));
    } else if (match[6] !== undefined) {
      container.appendChild(element("code", match[6]));
    } else {
      container.appendChild(element("em", match[7]));
    }
    cursor = match.index + token.length;
  }
  container.appendChild(document.createTextNode(text.slice(cursor)));
}

function startsBlock(line) {
  return /^(#{1,3})\s+|^>\s?|^```|^[-*]\s+|^\d+\.\s+|^---+$|^:::|^<!--/.test(line);
}

const ATTRIBUTION = /^(?:\u2014|\u2015|--)\s*/;

// An IASP epigraph: the quotation in a blockquote, a closing "— Author,
// *Work*" paragraph as its caption.
function renderEpigraph(body, options) {
  const figure = element("figure");
  let end = body.length;
  while (end > 0 && !body[end - 1].trim()) end--;
  let start = end;
  while (start > 0 && body[start - 1].trim()) start--;
  const attribution = start < end && ATTRIBUTION.test(body[start].trim())
    ? body.slice(start, end).map(line => line.trim()).join(" ").replace(ATTRIBUTION, "")
    : null;
  const quote = element("blockquote");
  quote.appendChild(renderLines(attribution ? body.slice(0, start) : body, options));
  figure.appendChild(quote);
  if (attribution) {
    const caption = element("figcaption");
    appendInline(caption, `\u2014 ${attribution}`, options);
    figure.appendChild(caption);
  }
  return figure;
}

function renderLessonBlock(spec, body, options) {
  const block = lessonBlockFor(fenceClasses(spec));
  if (!block) return renderLines(body, options);
  const node = block.kind === "epigraph" ? renderEpigraph(body, options) : element("aside");
  node.className = `lesson-block lesson-block-${block.kind}`;
  if (block.label) {
    node.setAttribute("aria-label", block.label);
    const label = element("p", block.label);
    label.className = "lesson-block-label";
    node.appendChild(label);
    node.appendChild(renderLines(body, options));
  }
  return node;
}

export function renderSafeMarkdown(markdown, options) {
  return renderLines(String(markdown || "").replace(/\r\n?/g, "\n").split("\n"), options);
}

function renderLines(lines, options) {
  const fragment = document.createDocumentFragment();
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index++;
      continue;
    }

    // HTML comments (IASP `<!-- quote <id> -->` provenance markers) are
    // source annotations, never shown.
    if (/^<!--/.test(line.trim())) {
      while (index < lines.length && !lines[index].includes("-->")) index++;
      index++;
      continue;
    }

    const spec = fenceOpenSpec(line);
    if (spec !== null) {
      const close = fenceCloseIndex(lines, index);
      const bodyEnd = close === -1 ? lines.length : close;
      fragment.appendChild(renderLessonBlock(spec, lines.slice(index + 1, bodyEnd), options));
      index = bodyEnd + 1;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const node = element(`h${Math.min(heading[1].length + 1, 4)}`);
      appendInline(node, heading[2], options);
      fragment.appendChild(node);
      index++;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.slice(3).trim();
      const body = [];
      index++;
      while (index < lines.length && !/^```/.test(lines[index])) {
        body.push(lines[index++]);
      }
      if (index < lines.length) index++;
      const pre = element("pre");
      const code = element("code", body.join("\n"));
      if (language) code.dataset.language = language;
      pre.appendChild(code);
      fragment.appendChild(pre);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = element("blockquote");
      const body = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        body.push(lines[index++].replace(/^>\s?/, ""));
      }
      appendInline(quote, body.join(" "), options);
      fragment.appendChild(quote);
      continue;
    }

    const listMatch = /^([-*]|\d+\.)\s+(.+)$/.exec(line);
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[1]);
      const list = element(ordered ? "ol" : "ul");
      const itemPattern = ordered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/;
      while (index < lines.length) {
        const itemMatch = itemPattern.exec(lines[index]);
        if (!itemMatch) break;
        const item = element("li");
        appendInline(item, itemMatch[1], options);
        list.appendChild(item);
        index++;
      }
      fragment.appendChild(list);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      fragment.appendChild(element("hr"));
      index++;
      continue;
    }

    const standaloneImage = /^!\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(line.trim());
    if (standaloneImage) {
      const figure = element("figure");
      appendInline(figure, line.trim(), options);
      if (standaloneImage[3]) figure.appendChild(element("figcaption", standaloneImage[3]));
      fragment.appendChild(figure);
      index++;
      continue;
    }

    const paragraphLines = [line.trim()];
    index++;
    while (index < lines.length && lines[index].trim() && !startsBlock(lines[index])) {
      paragraphLines.push(lines[index++].trim());
    }
    const paragraph = element("p");
    appendInline(paragraph, paragraphLines.join(" "), options);
    fragment.appendChild(paragraph);
  }

  return fragment;
}
