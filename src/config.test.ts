import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRepo, requireToken, resolveCommonOptions, resolveToken, splitRepo } from "./config";

test("resolveToken prioritizes CLI token", () => {
  process.env.GITHUB_TOKEN = "env-token";
  assert.equal(resolveToken("cli-token"), "cli-token");
});

test("requireToken throws when token missing", () => {
  const previous = process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_TOKEN;

  assert.throws(() => requireToken(undefined), /Missing GitHub token/);
  if (previous === undefined) {
    delete process.env.GITHUB_TOKEN;
  } else {
    process.env.GITHUB_TOKEN = previous;
  }
});

test("normalizeRepo enforces owner/repo format", () => {
  assert.equal(normalizeRepo("octocat/hello-world"), "octocat/hello-world");
  assert.throws(() => normalizeRepo("hello-world"), /owner\/repo/);
});

test("splitRepo parses owner and repo", () => {
  assert.deepEqual(splitRepo("octocat/hello-world"), {
    owner: "octocat",
    repo: "hello-world",
  });
});

test("resolveCommonOptions resolves defaults", () => {
  const resolved = resolveCommonOptions({ verbose: true });
  assert.equal(resolved.verbose, true);
  assert.ok(resolved.root.endsWith("/repos"));
  assert.ok(resolved.db.endsWith("/repos.db"));
});
