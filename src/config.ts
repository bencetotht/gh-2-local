import path from "node:path";
import type { CommonOptions } from "./types";

const FULL_NAME_PATTERN = /^[^/]+\/[^/]+$/;

interface RawOptions {
  token?: string;
  root?: string;
  db?: string;
  repo?: string;
  verbose?: boolean;
}

export function resolveCommonOptions(raw: RawOptions): CommonOptions {
  const root = path.resolve(raw.root ?? "./repos");
  const db = path.resolve(raw.db ?? "./repos.db");
  const repo = normalizeRepo(raw.repo);

  return {
    token: raw.token,
    root,
    db,
    repo,
    verbose: Boolean(raw.verbose),
  };
}

export function resolveToken(cliToken?: string): string | undefined {
  return cliToken ?? process.env.GITHUB_TOKEN;
}

export function requireToken(cliToken?: string): string {
  const token = resolveToken(cliToken);

  if (!token) {
    throw new Error(
      "Missing GitHub token. Provide --token <pat> or set GITHUB_TOKEN.",
    );
  }

  return token;
}

export function normalizeRepo(repo?: string): string | undefined {
  if (!repo) {
    return undefined;
  }

  const trimmed = repo.trim();
  if (!FULL_NAME_PATTERN.test(trimmed)) {
    throw new Error(
      `Invalid repository format \"${repo}\". Use owner/repo.`,
    );
  }

  return trimmed;
}

export function splitRepo(fullName: string): { owner: string; repo: string } {
  const normalized = normalizeRepo(fullName);
  if (!normalized) {
    throw new Error("Repository must be provided in owner/repo format.");
  }

  const [owner, repo] = normalized.split("/");
  return { owner, repo };
}
