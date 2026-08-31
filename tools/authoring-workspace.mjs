#!/usr/bin/env node
// Print the resolved authoring data dir and drafts URL for agents and operators.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { localDraftReviewUrl } from "../modules/authoringDesignGuidance.js";
import {
  authoringWorkspaceSnapshot,
  ensureAuthoringWorkspace
} from "../modules/authoringWorkspacePaths.js";
import { loadProjectEnv } from "../modules/loadProjectEnv.js";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
loadProjectEnv({ repositoryRoot });
ensureAuthoringWorkspace({ repositoryRoot });
console.log(JSON.stringify(
  authoringWorkspaceSnapshot({
    repositoryRoot,
    draftReviewUrl: localDraftReviewUrl()
  }),
  null,
  2
));
