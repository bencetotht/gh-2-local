import { execFile } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

interface RunGitOptions {
  cwd?: string;
  verbose?: boolean;
}

interface GitResult {
  stdout: string;
  stderr: string;
}

export class GitCommandError extends Error {
  readonly code: number | null;
  readonly stderr: string;

  constructor(message: string, code: number | null, stderr: string) {
    super(message);
    this.name = "GitCommandError";
    this.code = code;
    this.stderr = stderr;
  }
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function isGitRepo(repoPath: string): Promise<boolean> {
  try {
    const result = await runGit(["-C", repoPath, "rev-parse", "--is-inside-work-tree"]);
    return result.stdout.trim() === "true";
  } catch {
    return false;
  }
}

export async function cloneRepo(
  cloneUrl: string,
  targetPath: string,
  verbose = false,
): Promise<void> {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await runGit(["clone", cloneUrl, targetPath], { verbose });
}

export async function isDirty(repoPath: string): Promise<boolean> {
  const result = await runGit(["-C", repoPath, "status", "--porcelain"]);
  return result.stdout.trim().length > 0;
}

export async function pullRepo(repoPath: string, verbose = false): Promise<void> {
  await runGit(["-C", repoPath, "pull", "--ff-only"], { verbose });
}

async function runGit(args: string[], options: RunGitOptions = {}): Promise<GitResult> {
  const { cwd, verbose = false } = options;

  if (verbose) {
    const command = ["git", ...args].join(" ");
    console.log(`$ ${command}`);
  }

  return await new Promise<GitResult>((resolve, reject) => {
    execFile("git", args, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(
          new GitCommandError(
            `Git command failed: git ${args.join(" ")}`,
            typeof error.code === "number" ? error.code : null,
            stderr,
          ),
        );
        return;
      }

      resolve({
        stdout: stdout.toString(),
        stderr: stderr.toString(),
      });
    });
  });
}
