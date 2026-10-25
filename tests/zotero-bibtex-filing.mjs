import assert from "node:assert/strict";
import { parseBookBibtex } from "../modules/bibtexBook.js";
import { ZoteroReferenceService } from "../modules/zoteroReferenceService.js";

export const name = "Zotero BibTeX filing: a Calibre @book entry, deduplicated, with its own citekey";

// The shape corpus-mcp's bookBibtex writes.
const ENTRY = `@book{gough2020secure,
  title = {Secure Design \\& Practice},
  author = {Gough, James and {Apple Inc.} and Ortiz, Ana María},
  publisher = {O'Reilly Media},
  year = {2020},
  isbn = {978-0-306-40615-7},
  note = {Calibre UUID: 6f1c2d3e-0000-4000-8000-000000000001},
}`;

function parsing() {
  assert.deepEqual(parseBookBibtex(ENTRY), {
    citekey: "gough2020secure",
    title: "Secure Design & Practice",
    author: [
      { family: "Gough", given: "James" },
      { literal: "Apple Inc." },
      { family: "Ortiz", given: "Ana María" }
    ],
    publisher: "O'Reilly Media",
    year: 2020,
    isbn: "978-0-306-40615-7",
    note: "Calibre UUID: 6f1c2d3e-0000-4000-8000-000000000001"
  });
  // A braced organization containing "and" stays one name.
  assert.deepEqual(parseBookBibtex("@book{x, title = {T}, author = {{Procter and Gamble}}}").author,
    [{ literal: "Procter and Gamble" }]);
  assert.throws(() => parseBookBibtex("@article{x, title = {T}}"), /@book entry/);
  assert.throws(() => parseBookBibtex("@book{x, title = {T}}\n@book{y, title = {U}}"), /exactly one/);
  assert.throws(() => parseBookBibtex("@book{x, year = {2020}}"), /no title/);
}

// A Zotero bridge whose library starts with the given items.
function service(items, { takenKeys = {} } = {}) {
  const zotero = new ZoteroReferenceService({
    collectionKey: "CCROOT01",
    sourceRepository: { upsertFromZotero: async () => {} }
  });
  const library = new Map(items.map(item => [item.key, item.data]));
  const log = [];
  const owners = { ...takenKeys };
  let next = 0;
  Object.assign(zotero, {
    log,
    withClient: work => work("call"),
    async titleCandidates() {
      return [...library].map(([key, data]) => ({ key, library: { type: "user", id: 7 }, data }));
    },
    async getItem(key) {
      return { key, library: { type: "user", id: 7 }, data: structuredClone(library.get(key)) };
    },
    async addItem(target) {
      log.push(["add", target.source]);
      const key = `NEWITEM${++next}`;
      // Better BibTeX pins its own key on the new item.
      library.set(key, { title: target.source.title, collections: ["CCROOT01"],
        extra: target.source.note, citationKey: "gough2020secure" });
      owners.gough2020secure ??= key;
      return { itemKey: key, reused: false };
    },
    async citationKeyOwner(key) {
      return owners[key] || null;
    },
    async updateItem(key, { fields }) {
      log.push(["update", key, fields]);
      const data = library.get(key);
      if (fields.extra) data.extra = fields.extra;
      if (fields.citation_key) data.citationKey = fields.citation_key;
    }
  });
  return zotero;
}

async function filing() {
  // A new book gets the entry's key, or the next free one when it is taken.
  const fresh = service([], { takenKeys: { gough2020secure: "OTHER001" } });
  const created = await fresh.fileBibtex(ENTRY);
  assert.equal(created.citekey, "gough2020securea");
  assert.equal(created.created, true);
  const [[, csl], [, , fields]] = fresh.log;
  assert.deepEqual(csl.author[1], { literal: "Apple Inc." });
  assert.equal(csl.ISBN, "9780306406157");
  assert.equal(csl.note, "Calibre UUID: 6f1c2d3e-0000-4000-8000-000000000001");
  assert.deepEqual(fields, { citation_key: "gough2020securea" });

  // The same book by ISBN-10 is reused with its key; only the Calibre UUID is added.
  const byIsbn = service([{ key: "OLDBOOK1", data: { title: "Secure Design and Practice, 2nd ed.",
    ISBN: "0-306-40615-2", collections: ["CCROOT01"], extra: "Citation Key: gough2020secure" } }]);
  const reused = await byIsbn.fileBibtex(ENTRY);
  assert.deepEqual([reused.citekey, reused.created, reused.matchedBy], ["gough2020secure", false, "ISBN"]);
  assert.deepEqual(byIsbn.log, [["update", "OLDBOOK1", {
    extra: "Citation Key: gough2020secure\nCalibre UUID: 6f1c2d3e-0000-4000-8000-000000000001" }]]);

  // Without an ISBN, title, first author, and year decide; a different
  // edition's ISBN, or an item outside the collection, does not match.
  const book = { title: "Secure Design & Practice", date: "2020", collections: ["CCROOT01"], citationKey: "gough2020secure",
    creators: [{ creatorType: "author", lastName: "Gough", firstName: "James" }] };
  const noIsbn = ENTRY.replace(/\n {2}isbn = .*/, "");
  assert.equal((await service([{ key: "OLDBOOK2", data: book }]).fileBibtex(noIsbn)).matchedBy, "title, author, and year");
  assert.equal((await service([{ key: "OLDBOOK3", data: { ...book, ISBN: "9781234567897" } }]).fileBibtex(ENTRY)).created, true);
  assert.equal((await service([{ key: "OLDBOOK4", data: { ...book, collections: [] } }]).fileBibtex(noIsbn)).created, true);
  assert.equal((await service([{ key: "OLDBOOK5", data: { ...book, date: "2014" } }]).fileBibtex(noIsbn)).created, true);

  await assert.rejects(service([]).fileBibtex(ENTRY.replace("40615-7", "40615-8")), /valid ISBN/);
}

export async function run() {
  parsing();
  await filing();
}
