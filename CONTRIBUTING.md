# Contributing to gh-2-local

Thanks for helping improve `gh-2-local`.

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Build and test:

```bash
npm run build
npm test
```

3. Run CLI locally:

```bash
node dist/cli.js --help
```

## Pull Request Guidelines

- Keep changes focused and scoped.
- Add or update tests for behavior changes.
- Update docs (`README.md`, flags, examples) when interfaces change.
- Do not commit secrets (PATs, tokens, or local credential files).

## Coding Standards

- TypeScript strict mode is enabled; avoid `any` unless justified.
- Prefer explicit error handling with actionable messages.
- Keep CLI output concise and script-friendly.

## Commit Suggestions

- `feat:` new functionality
- `fix:` bug fix
- `docs:` documentation changes
- `chore:` build/tooling changes
- `test:` test updates

## Reporting Issues

When filing an issue, include:

- Command executed
- Expected behavior
- Actual behavior and error output
- OS and Node.js version
- Whether running locally, in Nix, or Docker
