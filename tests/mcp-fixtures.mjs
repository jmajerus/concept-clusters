import { createMemoryContentDocumentRepository } from "../modules/contentDocumentRepository.js";
import {
  seedPublishedCatalogues,
  seedPublishedCategories,
  seedPublishedPuzzles
} from "../modules/contentDocumentSeed.js";

// Tests must bootstrap D1 explicitly. The MCP server deliberately does not
// turn the Git fixture into an implicit read fallback.
export async function seededMcpContentDocuments(contentService, {
  puzzleIds = null
} = {}) {
  const repository = createMemoryContentDocumentRepository();
  await seedPublishedCatalogues(repository, contentService.catalogues || []);
  await seedPublishedCategories(repository, contentService.categories || {});
  await seedPublishedPuzzles(
    repository,
    contentService,
    puzzleIds || (contentService.puzzles || []).map(puzzle => puzzle.id)
  );
  return repository;
}
