import Database from "better-sqlite3";
import type { PullStatus, TrackedRepo } from "./types";

interface RepoRow {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  path: string;
  cloned_at: string;
  last_pull_at: string | null;
  last_pull_status: PullStatus | null;
  last_error: string | null;
}

interface UpsertRepoInput {
  owner: string;
  name: string;
  fullName: string;
  path: string;
  clonedAt: string;
  updatedAt: string;
}

export class RepoDb {
  private readonly db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.initialize();
  }

  private initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS repos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner TEXT NOT NULL,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL UNIQUE,
        path TEXT NOT NULL UNIQUE,
        cloned_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_pull_at TEXT NULL,
        last_pull_status TEXT NULL,
        last_error TEXT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_repos_full_name ON repos(full_name);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_repos_path ON repos(path);
    `);
  }

  upsertRepo(input: UpsertRepoInput): void {
    const statement = this.db.prepare(`
      INSERT INTO repos (owner, name, full_name, path, cloned_at, updated_at)
      VALUES (@owner, @name, @fullName, @path, @clonedAt, @updatedAt)
      ON CONFLICT(full_name) DO UPDATE SET
        owner = excluded.owner,
        name = excluded.name,
        path = excluded.path,
        updated_at = excluded.updated_at
    `);

    statement.run(input);
  }

  listRepos(): TrackedRepo[] {
    const statement = this.db.prepare<[], RepoRow>(`
      SELECT id, owner, name, full_name, path, cloned_at, last_pull_at, last_pull_status, last_error
      FROM repos
      ORDER BY full_name ASC
    `);

    return statement.all().map(mapRowToTrackedRepo);
  }

  findRepoByFullName(fullName: string): TrackedRepo | undefined {
    const statement = this.db.prepare<[string], RepoRow>(`
      SELECT id, owner, name, full_name, path, cloned_at, last_pull_at, last_pull_status, last_error
      FROM repos
      WHERE full_name = ?
      LIMIT 1
    `);

    const row = statement.get(fullName);
    return row ? mapRowToTrackedRepo(row) : undefined;
  }

  updatePullResult(
    fullName: string,
    input: { at: string; status: PullStatus; error?: string },
  ): void {
    const statement = this.db.prepare(`
      UPDATE repos
      SET last_pull_at = @at,
          last_pull_status = @status,
          last_error = @error,
          updated_at = @at
      WHERE full_name = @fullName
    `);

    statement.run({
      fullName,
      at: input.at,
      status: input.status,
      error: input.error ?? null,
    });
  }

  close(): void {
    this.db.close();
  }
}

function mapRowToTrackedRepo(row: RepoRow): TrackedRepo {
  return {
    id: row.id,
    owner: row.owner,
    name: row.name,
    fullName: row.full_name,
    path: row.path,
    clonedAt: row.cloned_at,
    lastPullAt: row.last_pull_at ?? undefined,
    lastPullStatus: row.last_pull_status ?? undefined,
    lastError: row.last_error ?? undefined,
  };
}
