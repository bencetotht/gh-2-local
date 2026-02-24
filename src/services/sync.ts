import path from "node:path";
import { RepoDb } from "../db";
import { fetchAllAccessibleRepos, fetchSingleRepo } from "../github";
import { cloneRepo, isGitRepo, pathExists } from "../git";
import type { RemoteRepo } from "../types";

export interface SyncOptions {
  db: RepoDb;
  token: string;
  root: string;
  repo?: string;
  verbose?: boolean;
}

export interface SyncSummary {
  discovered: number;
  cloned: number;
  skipped: number;
  failed: number;
}

export async function runSync(options: SyncOptions): Promise<SyncSummary> {
  const repos = await resolveRepos(options.token, options.repo);
  const summary: SyncSummary = {
    discovered: repos.length,
    cloned: 0,
    skipped: 0,
    failed: 0,
  };

  for (const remoteRepo of repos) {
    const targetPath = path.join(options.root, remoteRepo.owner, remoteRepo.name);
    const timestamp = new Date().toISOString();

    try {
      const exists = await pathExists(targetPath);
      if (exists) {
        const gitRepo = await isGitRepo(targetPath);
        if (!gitRepo) {
          throw new Error(`Target path exists but is not a git repo: ${targetPath}`);
        }
        summary.skipped += 1;
      } else {
        await cloneRepo(remoteRepo.cloneUrl, targetPath, options.verbose);
        summary.cloned += 1;
      }

      options.db.upsertRepo({
        owner: remoteRepo.owner,
        name: remoteRepo.name,
        fullName: remoteRepo.fullName,
        path: targetPath,
        clonedAt: timestamp,
        updatedAt: timestamp,
      });
    } catch (error) {
      summary.failed += 1;
      console.error(
        `[sync] ${remoteRepo.fullName}: ${errorMessage(error)}`,
      );
    }
  }

  return summary;
}

async function resolveRepos(token: string, fullName?: string): Promise<RemoteRepo[]> {
  if (fullName) {
    const repo = await fetchSingleRepo(token, fullName);
    return [repo];
  }

  return await fetchAllAccessibleRepos(token);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
