# CI/CD Pipeline Setup Guide

## Overview

This portfolio project uses a comprehensive GitHub Actions CI/CD pipeline with Vercel deployment. The pipeline includes automated testing, security scanning, performance monitoring, and deployment to preview and production environments.

## Pipeline Architecture

### 1. Continuous Integration (CI)
- **Workflow**: `.github/workflows/ci.yml`
- **Triggers**: Push to main/develop, Pull Requests
- **Jobs**:
  - Code quality checks (linting, type checking, formatting)
  - Security scanning (CodeQL, dependency audit)
  - Performance analysis (bundle analysis)
  - Accessibility testing
  - Build verification

### 2. Vercel Deployment
- **Workflow**: `.github/workflows/vercel-deploy.yml`
- **Triggers**: Push to main/develop, Pull Requests
- **Jobs**:
  - Preview deployment for PRs
  - Production deployment for main branch
  - Post-deployment validation
  - Automatic rollback capability

### 3. Security Scanning
- **Workflow**: `.github/workflows/security-scan.yml`
- **Triggers**: Daily schedule, Push to main, Manual trigger
- **Jobs**:
  - Dependency vulnerability scanning
  - Secret detection
  - License compliance checking
  - Snyk security analysis

### 4. Dependency Management
- **Workflow**: `.github/workflows/dependency-update.yml`
- **Triggers**: Weekly schedule, Manual trigger
- **Jobs**:
  - Automated dependency updates
  - Security patch application
  - Compatibility testing
  - Auto-generated PRs

## Required Secrets Configuration

### GitHub Repository Secrets

Navigate to your repository → Settings → Secrets and variables → Actions

#### Vercel Integration
```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-vercel-org-id>
VERCEL_PROJECT_ID=<your-vercel-project-id>
VERCEL_PRODUCTION_DOMAIN=<your-domain.com> (optional)
```

#### Security Tools (Optional)
```
SNYK_TOKEN=<your-snyk-token>
```

### How to Get Vercel Credentials

1. **Vercel Token**:
   ```bash
   npx vercel login
   npx vercel whoami
   # Go to https://vercel.com/account/tokens
   # Create new token with appropriate scope
   ```

2. **Organization ID**:
   ```bash
   npx vercel whoami
   # Copy the 'id' from the team/user object
   ```

3. **Project ID**:
   ```bash
   cd your-project
   npx vercel link
   cat .vercel/project.json
   # Copy the 'projectId' value
   ```

## Environment Setup

### 1. Repository Configuration

Enable the following GitHub features:
- Actions (should be enabled by default)
- Dependabot alerts
- Code scanning (CodeQL)
- Secret scanning

### 2. Branch Protection Rules

Set up branch protection for `main`:
```
Settings → Branches → Add rule

Branch name pattern: main
✅ Require a pull request before merging
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging
✅ Include administrators
✅ Allow force pushes (disabled)
✅ Allow deletions (disabled)

Required status checks:
- ci/quality-check
- vercel/production
- security/scan
```

### 3. Environment Configuration

Create environments in repository settings:

#### Preview Environment
```
Environment name: preview
Protection rules: None (for automatic PR deployments)
Environment secrets: None required
```

#### Production Environment
```
Environment name: production
Protection rules:
  ✅ Required reviewers (1-2 people)
  ✅ Wait timer: 0 minutes
Environment secrets: Same as repository secrets
```

## Workflow Details

### CI Pipeline Features

1. **Code Quality**:
   - ESLint linting with Next.js config
   - TypeScript type checking
   - Prettier formatting validation
   - Build verification

2. **Security**:
   - npm audit for vulnerabilities
   - CodeQL static analysis
   - Secret scanning
   - License compliance

3. **Performance**:
   - Bundle size analysis
   - Lighthouse CI for performance metrics
   - Accessibility testing with Pa11y

### Deployment Pipeline Features

1. **Preview Deployments**:
   - Automatic deployment for all PRs
   - Unique preview URLs
   - Lighthouse performance testing
   - PR comments with deployment status

2. **Production Deployments**:
   - Triggered only on main branch pushes
   - Blue-green deployment via Vercel
   - Health checks and validation
   - Automatic domain assignment

3. **Rollback Capability**:
   - Manual workflow trigger
   - Promotes previous stable deployment
   - Zero-downtime rollback

## Monitoring and Observability

### Build Notifications
- Commit status checks
- PR deployment comments
- GitHub Actions summaries
- Artifact uploads (reports, builds)

### Performance Tracking
- Lighthouse CI reports
- Bundle analysis artifacts
- Core Web Vitals monitoring
- Vercel Analytics integration

### Security Monitoring
- Daily dependency scans
- Automated security updates
- License compliance tracking
- Secret leak detection

## Optimization Features

### Caching Strategy
- npm dependency caching
- Next.js build caching
- Docker layer caching (if used)
- Vercel edge caching

### Parallel Execution
- Matrix builds for multiple environments
- Concurrent job execution
- Artifact sharing between jobs
- Conditional job execution

### Resource Optimization
- Node.js version pinning
- Efficient dependency installation
- Build artifact compression
- Smart cache invalidation

## Troubleshooting

### Common Issues

1. **Vercel Deployment Fails**:
   ```bash
   # Check token permissions
   vercel whoami --token=$VERCEL_TOKEN
   
   # Verify project linking
   vercel link --token=$VERCEL_TOKEN
   ```

2. **Build Failures**:
   ```bash
   # Run locally to debug
   npm ci
   npm run lint
   npm run type-check
   npm run build
   ```

3. **Security Scan Failures**:
   ```bash
   # Check vulnerabilities
   npm audit --audit-level=moderate
   
   # Apply automatic fixes
   npm audit fix
   ```

### Debugging Steps

1. Check GitHub Actions logs
2. Verify secret configuration
3. Test locally with same Node.js version
4. Review Vercel deployment logs
5. Check branch protection rules

## Best Practices

### Code Quality
- Always run linting and type checking locally
- Use Prettier for consistent formatting
- Write comprehensive commit messages
- Keep dependencies up to date

### Security
- Regularly review security alerts
- Use Dependabot for automated updates
- Never commit secrets to repository
- Enable all GitHub security features

### Performance
- Monitor bundle size in CI
- Use Lighthouse CI for performance gates
- Optimize images and assets
- Implement proper caching strategies

### Deployment
- Test in preview before production
- Use feature flags for risky changes
- Monitor deployment metrics
- Have rollback plan ready

## Maintenance

### Weekly Tasks
- Review dependency update PRs
- Check security scan results
- Monitor performance metrics
- Update documentation

### Monthly Tasks
- Review and update workflow configurations
- Audit secret usage and rotation
- Performance optimization review
- Security policy updates

### Quarterly Tasks
- Major dependency upgrades
- Workflow optimization
- Security audit
- Documentation review

## Support and Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Security Best Practices](https://docs.github.com/en/code-security)

---

For questions or issues with the CI/CD pipeline, please create an issue in the repository or contact the development team.