# gh-2-local

`gh-2-local` is a CLI tool that mirrors GitHub repositories to your local machine and keeps them up to date.

It uses a GitHub Personal Access Token (PAT) for GitHub API discovery, clones repositories to disk, and tracks local state in SQLite.

## Features

- Sync all accessible repositories (or one specific `owner/repo`) from GitHub.
- Clone into deterministic paths: `<root>/<owner>/<repo>`.
- Store local tracking metadata in SQLite (`id`, `full_name`, `path`, `cloned_at`, pull status fields).
- Pull updates for all tracked repositories or one repository.
- Skip dirty working trees safely during pull.

## Install

### npm (local project)

```bash
npm install
npm run build
npm link
```

Command:

```bash
gh-2-local --help
```

### Nix

Build package:

```bash
nix build .#gh-2-local
```

Run directly:

```bash
nix run .#gh-2-local -- --help
```

Install into profile:

```bash
nix profile install .#gh-2-local
```

## Configuration

### Authentication

`sync` requires a PAT from either:

- `--token <pat>`
- `GITHUB_TOKEN` env var

Resolution order: `--token` first, then `GITHUB_TOKEN`.

### Paths

Defaults:

- `--root ./repos`
- `--db ./repos.db`

## CLI Usage

### Sync all accessible repositories

```bash
gh-2-local sync --root ./repos --db ./repos.db
```

### Sync one repository

```bash
gh-2-local sync --repo octocat/hello-world --root ./repos --db ./repos.db
```

### Pull all tracked repositories

```bash
gh-2-local pull --db ./repos.db
```

### Pull one tracked repository

```bash
gh-2-local pull --repo octocat/hello-world --db ./repos.db
```

### List tracked repositories

```bash
gh-2-local list --db ./repos.db
```

## Docker

Build image:

```bash
docker build -t gh-2-local:latest .
```

Run with persistent volume mount (recommended):

```bash
docker run --rm -it \
  -e GITHUB_TOKEN="$GITHUB_TOKEN" \
  -v "$(pwd)/data:/data" \
  gh-2-local:latest sync
```

Pull all tracked repositories:

```bash
docker run --rm -it \
  -e GITHUB_TOKEN="$GITHUB_TOKEN" \
  -v "$(pwd)/data:/data" \
  gh-2-local:latest pull
```

Container defaults (auto-applied when omitted):

- `--root /data/repos`
- `--db /data/repos.db`

Environment variables:

- `GH_2_LOCAL_ROOT` and `GH_2_LOCAL_DB` (preferred)
- `GH_REPO_SYNC_ROOT` and `GH_REPO_SYNC_DB` (legacy compatibility)

Compose example:

```bash
docker compose run --rm gh-2-local sync
```

## Nix Package Files

- `flake.nix`
- `nix/package.nix`

## Development

```bash
npm run build
npm test
```

## Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [SECURITY.md](./SECURITY.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [LICENSE](./LICENSE)

## License

MIT - see [LICENSE](./LICENSE).
