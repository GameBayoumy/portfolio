# GitHub Actions Workflows

This repo uses a small set of focused workflows with consistent naming.

## Active Workflows

- CI (`ci.yml`): Lint, format check, type-check, unit tests with coverage, build verification, and security audit.
- Deploy (`deploy.yml`): Vercel preview on PRs, production on main; comments URL on PRs; triggers monitoring.
- Monitor (`monitor.yml`): Post-deploy health, performance, and security header checks; summarizes results.
- Code Scanning (`code-scanning.yml`): CodeQL analysis for JavaScript/TypeScript.
- Branch Protection (`branch-protection-setup.yml`): Optional helper to enforce branch rules and templates.

## Required secrets

- `VERCEL_TOKEN`: Vercel token
- `VERCEL_ORG_ID`: Vercel org ID
- `VERCEL_PROJECT_ID`: Vercel project ID

## Notes

- Legacy workflows were removed to avoid duplication. Repo templates now live statically:
	- CODEOWNERS: `.github/CODEOWNERS`
	- PR template: `.github/pull_request_template.md`
	- Issue templates: `.github/ISSUE_TEMPLATE/`
- CI runs on PRs and pushes; Deploy runs on PRs and main; Monitor can be triggered by Deploy or manually.

## Troubleshooting

- Check Actions logs for step summaries and errors.
- Ensure the Vercel secrets are configured at repo or org level if you intend to deploy.
- Node 22.x and Bun are used; see `package.json` scripts for details.