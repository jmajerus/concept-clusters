// Reference planning matches a topic query word by word, not as one phrase:
// "cell signaling signal transduction" should find a citation titled
// "Signal transduction in the cell", which a whole-phrase substring never
// does. Results rank by how many distinct query words they contain.

const STOPWORDS = new Set([
  "and", "the", "for", "with", "from", "into", "about", "that", "this",
  "what", "how", "why", "are", "was", "its", "their", "between", "versus"
]);

// A query without whitespace (a DOI, URL, citekey, or single word) stays
// whole. Otherwise: lowercase words of three or more letters, stopwords
// dropped, and a word dropped when a shorter query word is inside it
// ("signaling" with "signal"), since substring matching already covers it.
export function queryWords(query) {
  const text = String(query || "").trim().toLowerCase();
  if (!text) return [];
  if (!/\s/.test(text)) return [text];
  const words = [...new Set(text.split(/[^\p{L}\p{N}]+/u)
    .filter(word => word.length >= 3 && !STOPWORDS.has(word)))];
  const kept = words.filter(word =>
    !words.some(other => other !== word && word.includes(other)));
  return kept.length ? kept : [text];
}

export function matchedWords(values, words) {
  const haystack = values.map(value => String(value ?? "").toLowerCase()).join("\n");
  return words.filter(word => haystack.includes(word));
}
