import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export class LocalGitHubConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "LocalGitHubConfigError";
  }
}

export function parseGitHubRemote(url) {
  if (typeof url !== "string" || !url.trim()) return null;
  const trimmed = url.trim().replace(/\.git$/i, "");
  const ssh = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+)$/i);
  if (ssh) return { owner: ssh[1], repository: ssh[2] };
  const sshUrl = trimmed.match(/^ssh:\/\/git@github\.com\/([^/]+)\/([^/]+)$/i);
  if (sshUrl) return { owner: sshUrl[1], repository: sshUrl[2] };
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === "github.com" || parsed.hostname === "www.github.com") {
      const parts = parsed.pathname.replace(/^\/+|\/+$/g, "").split("/");
      if (parts.length >= 2 && parts[0] && parts[1]) {
        return { owner: parts[0], repository: parts[1] };
      }
    }
  } catch {
    return null;
  }
  return null;
}

function envOwnerAndRepository(env) {
  const owner = typeof env.GITHUB_OWNER === "string" ? env.GITHUB_OWNER.trim() : "";
  const repository = typeof env.GITHUB_REPOSITORY === "string"
    ? env.GITHUB_REPOSITORY.trim()
    : "";
  if (repository.includes("/")) {
    const parts = repository.split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return { owner, repository: "" };
    }
    return {
      owner: owner || parts[0],
      repository: parts[1]
    };
  }
  return { owner, repository };
}

async function readOriginUrl(repositoryRoot, command = execFileAsync) {
  try {
    const { stdout } = await command("git", ["remote", "get-url", "origin"], {
      cwd: repositoryRoot,
      timeout: 5000
    });
    return String(stdout || "").trim();
  } catch {
    return "";
  }
}

async function readGhAuthToken(command = execFileAsync) {
  try {
    const { stdout } = await command("gh", ["auth", "token"], { timeout: 5000 });
    return String(stdout || "").trim();
  } catch {
    return "";
  }
}

export async function resolveLocalGitHubConfig({
  env = process.env,
  repositoryRoot,
  command = execFileAsync
} = {}) {
  const fromEnv = envOwnerAndRepository(env);
  const remote = fromEnv.owner && fromEnv.repository
    ? null
    : parseGitHubRemote(await readOriginUrl(repositoryRoot, command));
  const owner = fromEnv.owner || remote?.owner || "";
  const repository = fromEnv.repository || remote?.repository || "";
  const token = (typeof env.GITHUB_TOKEN === "string" && env.GITHUB_TOKEN.trim())
    || (typeof env.GH_TOKEN === "string" && env.GH_TOKEN.trim())
    || await readGhAuthToken(command);
  const baseBranch = (typeof env.GITHUB_BASE_BRANCH === "string"
    && env.GITHUB_BASE_BRANCH.trim())
    || "main";
  if (!owner || !repository || !token) {
    throw new LocalGitHubConfigError(
      "Local GitHub publication is not configured. Set GITHUB_TOKEN (or GH_TOKEN) " +
      "and GITHUB_OWNER/GITHUB_REPOSITORY, or authenticate with `gh` against a " +
      "GitHub origin remote. Opening a pull request for a draft goes through " +
      "the GitHub API and does not write this checkout."
    );
  }
  return { owner, repository, token, baseBranch };
}

export default resolveLocalGitHubConfig;
