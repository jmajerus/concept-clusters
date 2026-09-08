// Mechanical case-style audit for displayed puzzle nodes. A single
// capitalized word ("Democracy") cannot honestly be distinguished as title
// or sentence case, and acronyms ("BSCT") are neither; leave both out of
// those two buckets instead of turning an ambiguous label into a verdict.

const MINOR_TITLE_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into",
  "nor", "of", "on", "or", "over", "per", "the", "to", "via", "with", "yet"
]);

function wordsOf(value) {
  return String(value || "").match(/[\p{L}][\p{L}'’.-]*/gu) || [];
}

function lettersOf(value) {
  return String(value || "").match(/\p{L}/gu) || [];
}

function startsUpper(word) {
  const letters = lettersOf(word);
  return letters.length > 0 && letters[0] === letters[0].toLocaleUpperCase() &&
    letters[0] !== letters[0].toLocaleLowerCase();
}

function allLower(word) {
  const letters = lettersOf(word);
  return letters.length > 0 && letters.every(letter =>
    letter === letter.toLocaleLowerCase() && letter !== letter.toLocaleUpperCase()
  );
}

/** Returns lower, sentence, title, or null for a stylistically ambiguous label. */
export function classifyNodeCase(label) {
  const words = wordsOf(label);
  const letters = lettersOf(label);
  if (!letters.length) return null;
  if (letters.every(letter =>
    letter === letter.toLocaleLowerCase() && letter !== letter.toLocaleUpperCase()
  )) return "lower";

  // A one-word capitalized label has no observable distinction between title
  // and sentence case. Acronyms and mixed-case technical spellings land here
  // too unless they satisfy one of the multi-word patterns below.
  if (words.length < 2 || !startsUpper(words[0])) return null;

  const laterContent = words.slice(1).filter(word =>
    !MINOR_TITLE_WORDS.has(word.toLocaleLowerCase())
  );
  if (!laterContent.length) return null;

  if (laterContent.every(startsUpper) && words.every((word, index) =>
    index === 0 || startsUpper(word) || MINOR_TITLE_WORDS.has(word.toLocaleLowerCase())
  )) return "title";

  // Sentence case may contain a proper name or acronym later in the label;
  // the decisive signal is at least one later content word written lowercase.
  if (laterContent.some(allLower)) return "sentence";
  return null;
}

export function puzzleNodeLabels(puzzle) {
  return [
    ...(puzzle?.clusters || []).flatMap(cluster => cluster?.terms || []),
    ...(puzzle?.bridges || []).map(bridge => bridge?.term)
  ].filter(term => typeof term === "string" && term.trim());
}

export function puzzleClusterLabels(puzzle) {
  return (puzzle?.clusters || []).map(cluster => cluster?.name)
    .filter(name => typeof name === "string" && name.trim());
}

export function auditLabelCase({ id = "", category = "Uncategorized", labels = [] } = {}) {
  const counts = { lower: 0, sentence: 0, title: 0, ambiguous: 0 };
  labels.forEach(label => {
    const style = classifyNodeCase(label);
    if (style) counts[style]++;
    else counts.ambiguous++;
  });
  const matches = Object.fromEntries(
    ["lower", "sentence", "title"].map(style => [style, counts[style] > labels.length / 2])
  );
  return { id, category, total: labels.length, counts, matches };
}

export function auditPuzzleNodeCase(puzzle) {
  return auditLabelCase({
    id: puzzle?.id || "",
    category: puzzle?.category || "Uncategorized",
    labels: puzzleNodeLabels(puzzle)
  });
}

export function auditPuzzleClusterCase(puzzle) {
  return auditLabelCase({
    id: puzzle?.id || "",
    category: puzzle?.category || "Uncategorized",
    labels: puzzleClusterLabels(puzzle)
  });
}

export function auditCorpusNodeCase(puzzles = []) {
  return puzzles.map(auditPuzzleNodeCase).filter(result => result.total > 0);
}

export function auditCorpusClusterCase(puzzles = []) {
  return puzzles.map(auditPuzzleClusterCase).filter(result => result.total > 0);
}
