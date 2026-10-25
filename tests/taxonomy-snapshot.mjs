import assert from "node:assert/strict";
import { taxonomyVocabulary } from "../modules/taxonomySnapshot.js";

export const name = "Taxonomy vocabulary: the published taxonomy as a corpus-vocabulary/1 file";

export async function run() {
  const registry = {
    Psychology: { slug: "psychology", domain: "social-sciences", registered: true, subcategories: {
      "social-psychology": { title: "Social Psychology" },
      cognition: { title: "Cognition" }
    } },
    "Science, Technology & Society": { slug: "science-technology-society", domain: "interdisciplinary-studies", registered: true },
    Trivia: { slug: "trivia", domain: "", registered: true },
    "Draft Only": { slug: "draft-only", domain: "humanities", registered: false }
  };
  const vocabulary = taxonomyVocabulary(registry, { generatedAt: "2026-10-25T12:00:00Z" });
  assert.equal(vocabulary.format, "corpus-vocabulary/1");
  assert.deepEqual(vocabulary.retired, []);
  const term = id => vocabulary.terms.find(entry => entry.id === id);
  // Domains only group; labels may hold commas, since tags are ids.
  assert.deepEqual(term("social-sciences"), { id: "social-sciences", label: "Social Sciences", assignable: false });
  assert.deepEqual(vocabulary.terms.filter(entry => entry.id.startsWith("social-sciences.")), [
    { id: "social-sciences.psychology", label: "Psychology", parent: "social-sciences" },
    { id: "social-sciences.psychology.cognition", label: "Cognition", parent: "social-sciences.psychology" },
    { id: "social-sciences.psychology.social-psychology", label: "Social Psychology", parent: "social-sciences.psychology" }
  ]);
  assert.deepEqual(vocabulary.terms.filter(entry => entry.id.startsWith("interdisciplinary-studies")), [
    { id: "interdisciplinary-studies", label: "Interdisciplinary Studies", assignable: false },
    { id: "interdisciplinary-studies.science-technology-society", label: "Science, Technology & Society",
      parent: "interdisciplinary-studies" }
  ]);
  assert.deepEqual(term("trivia"), { id: "trivia", label: "Trivia" });
  assert.equal(term("humanities.draft-only"), undefined);
  // The version follows the terms, not the export time.
  assert.equal(taxonomyVocabulary(registry, { generatedAt: "2027-01-01T00:00:00Z" }).version, vocabulary.version);

  assert.throws(() => taxonomyVocabulary({ ...registry, "U.S. History": { slug: "us-history", domain: "humanities", registered: true } }),
    /humanities\.us-history: label "U\.S\. History" may not contain/);
  // A domainless category named like its domain is a leftover, not a second term.
  assert.throws(() => taxonomyVocabulary({ ...registry, "Interdisciplinary Studies": {
    slug: "interdisciplinary-studies", domain: "", registered: true } }), /interdisciplinary-studies: two terms share this id/);
  assert.throws(() => taxonomyVocabulary({ ...registry, Odd: { slug: "Odd_Slug", domain: "humanities", registered: true } }),
    /humanities\.Odd_Slug: id segment/);
}
