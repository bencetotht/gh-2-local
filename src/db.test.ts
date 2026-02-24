import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { RepoDb } from "./db";

test("RepoDb upsert is idempotent and preserves cloned_at", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "gh-2-local-test-"));
  const dbPath = path.join(tempDir, "repos.db");
  const db = new RepoDb(dbPath);

  try {
    db.upsertRepo({
      owner: "octocat",
      name: "hello-world",
      fullName: "octocat/hello-world",
      path: "/tmp/repos/octocat/hello-world",
      clonedAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    db.upsertRepo({
      owner: "octocat",
      name: "hello-world",
      fullName: "octocat/hello-world",
      path: "/tmp/repos/octocat/hello-world",
      clonedAt: "2030-01-01T00:00:00.000Z",
      updatedAt: "2030-01-01T00:00:00.000Z",
    });

    const repos = db.listRepos();
    assert.equal(repos.length, 1);
    assert.equal(repos[0]?.clonedAt, "2026-01-01T00:00:00.000Z");

    db.updatePullResult("octocat/hello-world", {
      at: "2030-01-01T00:00:00.000Z",
      status: "ok",
    });

    const updated = db.findRepoByFullName("octocat/hello-world");
    assert.equal(updated?.lastPullStatus, "ok");
    assert.equal(updated?.lastPullAt, "2030-01-01T00:00:00.000Z");
  } finally {
    db.close();
    await rm(tempDir, { recursive: true, force: true });
  }
});
