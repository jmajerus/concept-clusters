// One @book BibTeX entry, as corpus-mcp builds it from a Calibre book's own
// metadata, read into CSL JSON for zotero_add_item. Persons arrive as
// "Surname, Given" and organizations braced whole ("{Apple Inc.}"), so a
// braced name is never split into given and family names.

const UNESCAPES = {
  "\\textbackslash{}": "\\", "\\textasciitilde{}": "~", "\\textasciicircum{}": "^"
};

function unescapeBibtex(value) {
  return value
    .replace(/\\text(?:backslash|asciitilde|asciicircum)\{\}/g, match => UNESCAPES[match])
    .replace(/\\([{}&%$#_])|[{}]/g, (match, escaped) => escaped || "")
    .replace(/\s+/g, " ")
    .trim();
}

// The value starting at text[start]: {braced}, "quoted", or a bare word.
// Returns the raw value (braces kept) and the index after it.
function readValue(text, start) {
  if (text[start] === "{") {
    let depth = 0;
    for (let index = start; index < text.length; index++) {
      if (text[index] === "\\") index++;
      else if (text[index] === "{") depth++;
      else if (text[index] === "}" && --depth === 0) return { raw: text.slice(start + 1, index), end: index + 1 };
    }
    throw new Error("BibTeX entry has an unclosed brace");
  }
  if (text[start] === "\"") {
    const close = text.indexOf("\"", start + 1);
    if (close < 0) throw new Error("BibTeX entry has an unclosed quote");
    return { raw: text.slice(start + 1, close), end: close + 1 };
  }
  const bare = text.slice(start).match(/^[^\s,}]+/)?.[0];
  if (!bare) throw new Error("BibTeX field has no value");
  return { raw: bare, end: start + bare.length };
}

// Splits on "and" outside braces, so "{Procter and Gamble}" stays one name.
function splitNames(raw) {
  const names = [];
  let depth = 0;
  let from = 0;
  for (let index = 0; index < raw.length; index++) {
    if (raw[index] === "\\") index++;
    else if (raw[index] === "{") depth++;
    else if (raw[index] === "}") depth--;
    else if (depth === 0) {
      const separator = raw.slice(index).match(/^\s+and\s+/i);
      if (separator) {
        names.push(raw.slice(from, index));
        from = index + separator[0].length;
        index = from - 1;
      }
    }
  }
  names.push(raw.slice(from));
  return names.map(name => name.trim()).filter(Boolean);
}

// Whether the brace opening raw closes at its end: "{Apple Inc.}", not "{A} {B}".
function wholeBraced(raw) {
  if (!raw.startsWith("{")) return false;
  let depth = 0;
  for (let index = 0; index < raw.length; index++) {
    if (raw[index] === "\\") index++;
    else if (raw[index] === "{") depth++;
    else if (raw[index] === "}" && --depth === 0) return index === raw.length - 1;
  }
  return false;
}

function cslName(raw) {
  if (wholeBraced(raw)) {
    return { literal: unescapeBibtex(raw.slice(1, -1)) };
  }
  const name = unescapeBibtex(raw);
  const comma = name.indexOf(",");
  if (comma > 0) return { family: name.slice(0, comma).trim(), given: name.slice(comma + 1).trim() };
  const space = name.lastIndexOf(" ");
  return space > 0 ? { family: name.slice(space + 1), given: name.slice(0, space) } : { family: name };
}

export function parseBookBibtex(text) {
  const source = String(text || "").trim();
  const head = source.match(/^@(\w+)\s*\{\s*([^\s,{}]+)\s*,/);
  if (!head) throw new Error("Provide one BibTeX entry: @book{key, ...}");
  if (head[1].toLowerCase() !== "book") throw new Error(`Provide a @book entry, not @${head[1]}`);
  const fields = {};
  let index = head[0].length;
  for (;;) {
    index += source.slice(index).match(/^[\s,]*/)[0].length;
    if (source[index] === "}") break;
    const name = source.slice(index).match(/^([A-Za-z][\w-]*)\s*=\s*/);
    if (!name) throw new Error(`BibTeX entry is malformed near "${source.slice(index, index + 30)}"`);
    const value = readValue(source, index + name[0].length);
    fields[name[1].toLowerCase()] = value.raw;
    index = value.end;
  }
  if (source.slice(index + 1).trim()) throw new Error("Provide exactly one BibTeX entry");
  const title = unescapeBibtex(fields.title || "");
  if (!title) throw new Error("The BibTeX entry has no title");
  const year = Number(unescapeBibtex(fields.year || "").match(/^\d{4}$/)?.[0]) || null;
  return {
    citekey: head[2],
    title,
    author: fields.author ? splitNames(fields.author).map(cslName) : [],
    publisher: fields.publisher ? unescapeBibtex(fields.publisher) : null,
    year,
    isbn: fields.isbn ? unescapeBibtex(fields.isbn) : null,
    note: fields.note ? unescapeBibtex(fields.note) : null
  };
}
