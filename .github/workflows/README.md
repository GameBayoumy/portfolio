# GitHub Actions Workflows

This repository uses clean, focused workflows for CI/CD automation.

## Active Workflows

### 🚀 CI/CD Pipeline (`ci-cd.yml`)
**Main deployment workflow**
- Triggers: Push to `main`, PRs to `main`
- Jobs:
  - `build_and_test`: Lints, type-checks, and builds
  - `deploy_preview`: Deploys PR previews to Vercel
  - `deploy_production`: Deploys main branch to production

### 🔍 Code Quality (`code-quality.yml`)  
**Security and quality checks**
- Triggers: Push to `main`, PRs to `main`
- Jobs:
  - `quality_check`: Security audit and CodeQL analysis

## Environment Variables

Required secrets:
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

## Usage

1. **PR Workflow**: Creates preview deployment and runs quality checks
2. **Main Branch**: Deploys to production after successful build
3. **Quality Gate**: Runs security scans and code analysis

## Troubleshooting

- Check workflow run logs in GitHub Actions tab
- Ensure all required secrets are configured
- Verify Node.js version matches project requirements (Node 22.x)