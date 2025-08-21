# Portfolio CI/CD Documentation

This directory contains comprehensive documentation for the CI/CD pipeline and deployment configuration of the portfolio project.

## 📁 Documentation Structure

### 🚀 [CI-CD-SETUP.md](./CI-CD-SETUP.md)
Complete setup guide for the GitHub Actions CI/CD pipeline including:
- Pipeline architecture overview
- Workflow configurations
- Branch protection setup
- Environment configuration
- Monitoring and troubleshooting

### 🔐 [SECRETS-SETUP.md](./SECRETS-SETUP.md)  
Security configuration guide covering:
- Required GitHub repository secrets
- Vercel authentication setup
- Token management best practices
- Security scanning configuration
- Emergency procedures

## 🏗️ Pipeline Overview

### Workflows Configuration

| Workflow | Purpose | Triggers | Status |
|----------|---------|----------|---------|
| **ci.yml** | Code quality, security, performance checks | Push/PR to main | ✅ Active |
| **vercel-deploy.yml** | Vercel preview/production deployment | Push/PR to main | ✅ Active |
| **security-scan.yml** | Daily security vulnerability scanning | Schedule/Push/PR | ✅ Active |
| **dependency-update.yml** | Weekly automated dependency updates | Schedule/Manual | ✅ Active |
| **lighthouse.yml** | Performance auditing with Lighthouse | Push/PR/Schedule | ✅ Active |
| **code-quality.yml** | Enhanced code quality gate | Push/PR to main | ✅ Active |

### Automation Features

- **🤖 Automated Deployments**: Preview for PRs, production for main branch
- **🔍 Quality Gates**: ESLint, TypeScript, Prettier, accessibility checks
- **🛡️ Security Scanning**: Daily vulnerability scans, secret detection, license compliance
- **📊 Performance Monitoring**: Lighthouse audits, bundle size tracking
- **🔄 Dependency Management**: Automated updates with Dependabot integration
- **📈 Metrics Collection**: Build times, deployment success rates, performance scores

## 🚦 Status Indicators

### Build Status
- **CI Pipeline**: Runs on every push and PR
- **Deployment**: Automatic for main branch, preview for PRs  
- **Security**: Daily automated scans
- **Performance**: Weekly audits + PR checks

### Quality Gates
- ✅ ESLint (no errors, warnings allowed)
- ✅ TypeScript compilation (strict mode)
- ✅ Prettier formatting (enforced)
- ✅ Build success (production mode)
- ✅ Security audit (high/critical vulnerabilities blocked)
- ✅ Accessibility (Pa11y + Lighthouse)

## 🔧 Quick Start

### 1. Initial Setup
```bash
# Clone and setup project
git clone <repository-url>
cd portfolio
npm ci

# Setup Vercel
npm install -g vercel@latest
vercel login
vercel link
```

### 2. Configure Secrets
Follow the [SECRETS-SETUP.md](./SECRETS-SETUP.md) guide to configure:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID` 
- `VERCEL_PROJECT_ID`

### 3. Test Pipeline
```bash
# Create a test branch and push
git checkout -b test/pipeline-setup
git commit --allow-empty -m "test: trigger CI pipeline"
git push origin test/pipeline-setup

# Create PR to see preview deployment
```

## 📋 Development Workflow

### For Feature Development
1. Create feature branch from `main`
2. Make changes and commit
3. Push branch to trigger CI checks
4. Create PR to get preview deployment
5. Review and merge after CI passes

### For Hotfixes
1. Create hotfix branch from `main`
2. Make minimal changes
3. Fast-track through CI (all checks still run)
4. Merge directly to main for immediate production deployment

## 🎯 Performance Targets

### Lighthouse Scores (Minimum)
- **Performance**: 80+ (85+ target)
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 95+

### Build Metrics
- **Build Time**: < 3 minutes
- **Bundle Size**: Monitor for significant increases
- **Deployment Time**: < 2 minutes

## 🔍 Monitoring and Alerts

### What's Monitored
- Build success/failure rates
- Deployment health checks
- Security vulnerability counts
- Performance regression detection
- Dependency update success

### Alert Channels
- GitHub Actions notifications
- PR comments for failures
- Email notifications (configurable)
- Vercel deployment status

## 🆘 Troubleshooting

### Common Issues

1. **Vercel Deployment Fails**:
   - Check secrets configuration
   - Verify Vercel project linking
   - Review build logs in Actions tab

2. **CI Pipeline Fails**:
   - Check ESLint/TypeScript errors locally
   - Verify all dependencies are installed
   - Review specific job logs

3. **Performance Issues**:
   - Check Lighthouse CI reports
   - Review bundle analysis artifacts
   - Monitor Core Web Vitals

### Getting Help

1. Check [GitHub Actions logs](../../actions)
2. Review [Vercel dashboard](https://vercel.com/dashboard)
3. Create an issue with logs and error details
4. Contact development team

## 🔄 Maintenance Schedule

### Daily (Automated)
- Security vulnerability scanning
- Dependency audit checks
- Performance monitoring

### Weekly (Automated)
- Dependency update PRs
- Lighthouse performance audits
- Build pipeline health checks

### Monthly (Manual)
- Review and merge dependency updates
- Security audit review
- Pipeline optimization review
- Documentation updates

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)
- [Next.js CI/CD Best Practices](https://nextjs.org/docs/deployment)
- [Security Scanning Tools](https://github.com/features/security)

---

**Last Updated**: 2025-01-21  
**Pipeline Version**: v1.0.0  
**Maintainer**: Development Team