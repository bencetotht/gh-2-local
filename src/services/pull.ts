import { RepoDb } from "../db";
import { isDirty, isGitRepo, pathExists, pullRepo } from "../git";
import type { TrackedRepo } from "../types";

export interface PullOptions {
  db: RepoDb;
  repo?: string;
  verbose?: boolean;
}

export interface PullSummary {
  total: number;
  ok: number;
  skipped: number;
  error: number;
}

export async function runPull(options: PullOptions): Promise<PullSummary> {
  const repos = resolveTargets(options.db, options.repo);
  const summary: PullSummary = {
    total: repos.length,
    ok: 0,
    skipped: 0,
    error: 0,
  };

  for (const repo of repos) {
    const at = new Date().toISOString();

    try {
      const exists = await pathExists(repo.path);
      if (!exists) {
        throw new Error(`Repository path does not exist: ${repo.path}`);
      }

      const gitRepo = await isGitRepo(repo.path);
      if (!gitRepo) {
        throw new Error(`Directory is not a git repository: ${repo.path}`);
      }

      const dirty = await isDirty(repo.path);
      if (dirty) {
        options.db.updatePullResult(repo.fullName, {
          at,
          status: "skipped-dirty",
          error: "Working tree has local changes.",
        });

        summary.skipped += 1;
        console.warn(`[pull] ${repo.fullName}: skipped (working tree dirty)`);
        continue;
      }

      await pullRepo(repo.path, options.verbose);
      options.db.updatePullResult(repo.fullName, { at, status: "ok" });
      summary.ok += 1;
    } catch (error) {
      summary.error += 1;
      const message = errorMessage(error);
      options.db.updatePullResult(repo.fullName, {
        at,
        status: "error",
        error: message,
      });
      console.error(`[pull] ${repo.fullName}: ${message}`);
    }
  }

  return summary;
}

function resolveTargets(db: RepoDb, fullName?: string): TrackedRepo[] {
  if (!fullName) {
    return db.listRepos();
  }

  const repo = db.findRepoByFullName(fullName);
  if (!repo) {
    throw new Error(`Repository ${fullName} is not tracked in the local database.`);
  }

  return [repo];
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
