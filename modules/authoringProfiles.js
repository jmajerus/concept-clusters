// Authoring profiles describe a puzzle's instructional shape. They are
// orthogonal to write domains: a profile may span the existing content and
// pedagogy projections without creating another persisted document column.

export const AUTHORING_PROFILES = Object.freeze([
  "vocabulary-context"
]);

export const VOCABULARY_CONTEXT_PROFILE = "vocabulary-context";

const PROFILE_DESCRIPTORS = Object.freeze({
  [VOCABULARY_CONTEXT_PROFILE]: Object.freeze({
    id: VOCABULARY_CONTEXT_PROFILE,
    title: "Vocabulary in context",
    summary:
      "Near-synonym clusters and context-sensitive cloze lenses teach subtle usage distinctions rather than simple matching.",
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

