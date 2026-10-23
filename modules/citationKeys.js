// Citekeys in the shape of the project's Better BibTeX rule,
// auth.lower + year + title.skipwords.select(1, 1).lower, with fallbacks for
// what that rule handles badly: an institution as author ("U.S. Senate
// Committee on Armed Services" -> "ussenate"), no author at all (publisher
// instead), and a first title word that repeats the author ("The Feynman
// Lectures" by Feynman -> "lectures"). Better BibTeX pins a key when an item
// is created and cannot refresh it, so the backfill writes these itself.

// Better BibTeX's default skipwords, so title words match the keys it makes.
const SKIP_WORDS = new Set((
  "a,ab,aboard,about,above,across,after,against,al,along,amid,among,an,and,anti,around,as,at,"
  + "before,behind,below,beneath,beside,besides,between,beyond,but,by,d,da,das,de,del,dell,dello,"
  + "dei,degli,della,dell,delle,dem,den,der,des,despite,die,do,down,du,during,ein,eine,einem,einen,"
  + "einer,eines,el,en,et,except,for,from,gli,i,il,in,inside,into,is,l,la,las,le,les,like,lo,los,"
  + "near,nor,of,off,on,onto,or,over,past,per,plus,round,save,since,so,some,sur,than,the,through,"
  + "to,toward,towards,un,una,unas,uno,unos,under,underneath,une,unlike,until,up,upon,versus,via,"
  + "von,while,with,within,without,yet,zu,zum"
).split(","));
const INSTITUTION_SKIP_WORDS = new Set([...SKIP_WORDS, "committee", "department", "office"]);

function ascii(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function letters(value) {
  return ascii(value).replace(/[^a-z]/g, "");
}

// First two significant words: "U.S. Senate Committee on Armed Services" ->
// "ussenate", "National Research Council" -> "nationalresearch".
export function institutionKey(name) {
  return ascii(name).split(/\s+/)
    .map(word => word.replace(/[^a-z]/g, ""))
    .filter(word => word && !INSTITUTION_SKIP_WORDS.has(word))
    .slice(0, 2).join("");
}

export function authorPart(data) {
  const creators = data.creators || [];
  const first = creators.find(creator => creator.creatorType === "author")
    || creators.find(creator => creator.creatorType === "editor")
    || creators[0];
  if (first?.lastName) {
    // "Gennep, Arnold van" files under Gennep; "Kets de Vries" keeps its
    // words; "Koefoed-Johnsen" keeps its hyphen, as Better BibTeX does.
    return ascii(first.lastName).replace(/[^a-z-]/g, "");
  }
  if (first?.name) return institutionKey(first.name);
  return data.publisher ? institutionKey(data.publisher).replace(/(?<=.)(university|press)$/, "") : "";
}

export function proposedCitationKey(data) {
  const auth = authorPart(data);
  const year = String(data.date || "").match(/\b(\d{4})\b/)?.[1] || "";
  const word = String(data.title || "").split(/[\s\-–—/:]+/)
    .map(letters)
    .find(candidate => candidate && !SKIP_WORDS.has(candidate) && candidate !== auth) || "";
  return `${auth}${year}${word}`;
}

// The shape every key in the collection should have: author, then a year
// when the work has one, then a title word.
export function citationKeyWellFormed(key, data) {
  const hasYear = /\b\d{4}\b/.test(String(data.date || ""));
  return hasYear ? /^[a-z][a-z-]*\d{4}[a-z]+$/.test(key) : /^[a-z][a-z-]*$/.test(key);
}

// Missing, misshapen, or not led by the item's author ("2018biology",
// "jr.2011future", "anatomy" for an OpenStax book). A well-formed key that
// differs from proposedCitationKey is left alone.
export function citationKeyNeedsRepair(key, data) {
  return !key || !citationKeyWellFormed(key, data) || !key.startsWith(authorPart(data));
}

// key, keya, keyb, … skipping any taken.
export async function uniqueCitationKey(base, isTaken) {
  for (const suffix of ["", ..."abcdefghijklmnopqrstuvwxyz"]) {
    if (!await isTaken(`${base}${suffix}`)) return `${base}${suffix}`;
  }
  throw new Error(`No free citekey for ${base}`);
}
