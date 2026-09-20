// Authoring profiles select focused design guidance; the profile selector is
// not stored on the puzzle. The authored kind is recorded separately in
// puzzleKind, owned by content. A profile may span content and pedagogy.

export const AUTHORING_PROFILES = Object.freeze([
  "vocabulary-context",
  "trivia-quiz"
]);

// Ordinary topic-led puzzles use the baseline kind without a focused profile.
// Specialized authored kinds intentionally share their identifiers with the
// corresponding MCP authoring profile.
export const PUZZLE_KINDS = Object.freeze([
  "topic-based",
  "vocabulary-context",
  "trivia-quiz"
]);

export const VOCABULARY_CONTEXT_PROFILE = "vocabulary-context";
export const TRIVIA_QUIZ_PROFILE = "trivia-quiz";

const PROFILE_DESCRIPTORS = Object.freeze({
  [VOCABULARY_CONTEXT_PROFILE]: Object.freeze({
    id: VOCABULARY_CONTEXT_PROFILE,
    title: "Vocabulary in context",
    summary:
      "Near-synonym clusters and context-sensitive cloze lenses teach subtle usage distinctions rather than simple matching.",
    mode: "advisory",
    storageDomains: Object.freeze(["content", "pedagogy"])
  }),
  [TRIVIA_QUIZ_PROFILE]: Object.freeze({
    id: TRIVIA_QUIZ_PROFILE,
    title: "Trivia quiz",
    summary:
      "Co-designed clusters and board terms give factual quiz lenses meaningful evidence and comparison frames.",
    mode: "advisory",
    storageDomains: Object.freeze(["content", "pedagogy"])
  })
});

export function authoringProfileDescriptor(profile) {
  if (!profile) return null;
  const descriptor = PROFILE_DESCRIPTORS[profile];
  if (!descriptor) throw new Error(`Unknown authoring profile: ${profile}`);
  return {
    ...descriptor,
    storageDomains: [...descriptor.storageDomains]
  };
}
