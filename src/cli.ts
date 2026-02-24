#!/usr/bin/env node

import { Command } from "commander";
import { requireToken, resolveCommonOptions } from "./config";
import { RepoDb } from "./db";
import { runList } from "./services/list";
import { runPull } from "./services/pull";
import { runSync } from "./services/sync";

interface RawCliOptions {
  token?: string;
  root?: string;
  db?: string;
  repo?: string;
  verbose?: boolean;
}

const program = new Command();

program
  .name("gh-2-local")
  .description("Clone and maintain local backups of GitHub repositories")
  .version("0.1.0");

withSharedOptions(program.command("sync").description("Fetch repositories and clone to local storage")).action(
  handleAction(async (rawOptions) => {
    const options = resolveCommonOptions(rawOptions as RawCliOptions);
    const token = requireToken(options.token);
    const db = new RepoDb(options.db);

    try {
      const summary = await runSync({
        db,
        token,
        root: options.root,
        repo: options.repo,
        verbose: options.verbose,
      });

      console.log(
        `Sync complete: discovered=${summary.discovered} cloned=${summary.cloned} skipped=${summary.skipped} failed=${summary.failed}`,
      );
    } finally {
      db.close();
    }
  }),
);

withSharedOptions(program.command("pull").description("Pull tracked repositories from remotes")).action(
  handleAction(async (rawOptions) => {
    const options = resolveCommonOptions(rawOptions as RawCliOptions);
    const db = new RepoDb(options.db);

    try {
      const summary = await runPull({
        db,
        repo: options.repo,
        verbose: options.verbose,
      });

      console.log(
        `Pull complete: total=${summary.total} ok=${summary.ok} skipped=${summary.skipped} error=${summary.error}`,
      );
    } finally {
      db.close();
    }
  }),
);

withSharedOptions(program.command("list").description("List tracked repositories from local database")).action(
  handleAction(async (rawOptions) => {
    const options = resolveCommonOptions(rawOptions as RawCliOptions);
    const db = new RepoDb(options.db);

    try {
      runList(db, options.repo);
    } finally {
      db.close();
    }
  }),
);

program.parseAsync(process.argv).catch((error: unknown) => {
  reportError(error);
  process.exitCode = 1;
});

function withSharedOptions(command: Command): Command {
  return command
    .option("--token <pat>", "GitHub personal access token")
    .option("--root <path>", "Root directory for repository clones", "./repos")
    .option("--db <path>", "SQLite database file path", "./repos.db")
    .option("--repo <owner/repo>", "Single repository target")
    .option("--verbose", "Enable verbose git command logging", false);
}

function handleAction(
  action: (options: unknown) => Promise<void>,
): (options: unknown) => Promise<void> {
  return async (options: unknown) => {
    try {
      await action(options);
    } catch (error) {
      reportError(error);
      process.exitCode = 1;
    }
  };
}

function reportError(error: unknown): void {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    return;
  }

  console.error(`Error: ${String(error)}`);
}
