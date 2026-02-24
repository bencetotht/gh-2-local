# Security Policy

## Supported Versions

Security fixes are applied to the latest release branch.

## Reporting a Vulnerability

If you discover a security issue, do not open a public issue first.

Please report privately with:

- A clear description of the issue
- Reproduction steps or proof of concept
- Impact assessment
- Suggested remediation, if available

Until a dedicated security contact is published, open a private channel with maintainers through repository contact options.

## Security Notes

- Never store GitHub PATs in plaintext files committed to the repository.
- Prefer environment variables (`GITHUB_TOKEN`) over shell history visible arguments when possible.
- Review logs before sharing to avoid leaking tokens or sensitive repo details.
