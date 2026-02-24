import { RepoDb } from "../db";

export function runList(db: RepoDb, repo?: string): void {
  const rows = db.listRepos();
  const filtered = repo
    ? rows.filter((row) => row.fullName === repo)
    : rows;

  if (filtered.length === 0) {
    console.log("No repositories tracked.");
    return;
  }

  console.table(
    filtered.map((row) => ({
      id: row.id,
      full_name: row.fullName,
      path: row.path,
      cloned_at: row.clonedAt,
      last_pull_status: row.lastPullStatus ?? "",
    })),
  );
}
