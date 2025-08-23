# Vercel Deployment Checklist

## 🚀 Pre-Deployment

### Environment Setup
- [ ] Copy `.env.example` to `.env.local` and fill in values
- [ ] Verify all required environment variables are set
- [ ] Test environment variable loading locally
- [ ] Run `node scripts/vercel-env-sync.js validate development`

### Code Quality
- [ ] Run `bun run lint` - No linting errors
- [ ] Run `bun run type-check` - No TypeScript errors  
- [ ] Run `bun run test` - All tests passing
- [ ] Run `bun run build` - Build completes successfully

### Performance
- [ ] Run `bun run lighthouse:local` - Scores meet thresholds
- [ ] Check bundle size with `bun run analyze`
- [ ] Verify 3D models and textures are optimized
- [ ] Test loading performance on slow connections

### Security
- [ ] Run `node scripts/security-headers-test.js` locally
- [ ] Verify no sensitive data in environment variables
- [ ] Check that API keys are properly secured
- [ ] Review CSP policy for XSS protection

## 🔧 Vercel Configuration

### Project Setup
- [ ] Vercel project connected to GitHub repository
- [ ] Correct branch configured for production deployments
- [ ] Build and output settings match `vercel.json`
- [ ] Framework preset set to \"Next.js\"

### Environment Variables (Vercel Dashboard)
- [ ] `NEXT_PUBLIC_GITHUB_TOKEN` - GitHub API access
- [ ] `SENTRY_DSN` - Error monitoring  
- [ ] `SENTRY_ORG` - Sentry organization
- [ ] `SENTRY_PROJECT` - Sentry project name
- [ ] `CONTACT_EMAIL` - Contact email address
- [ ] `GITHUB_URL` - GitHub profile URL
- [ ] `LINKEDIN_URL` - LinkedIn profile URL

### Optional Variables
- [ ] `VERCEL_ANALYTICS` - Enable analytics
- [ ] `LIGHTHOUSE_TOKEN` - Performance monitoring
- [ ] `SLACK_WEBHOOK_URL` - Deployment notifications
- [ ] `DATADOG_API_KEY` - Custom metrics

### Domain & SSL
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate valid and auto-renewing
- [ ] HTTPS redirects working
- [ ] HSTS headers properly configured

## 🚀 Deployment Process

### Git Workflow
- [ ] Create feature branch for changes
- [ ] Commit changes with conventional commit messages
- [ ] Push to GitHub repository
- [ ] Create pull request for review

### Vercel Deployment
- [ ] Preview deployment created automatically
- [ ] Preview deployment tests passing
- [ ] Performance metrics acceptable
- [ ] No console errors in preview

### Production Deployment  
- [ ] Merge pull request to main branch
- [ ] Production deployment triggered automatically
- [ ] Deployment completes without errors
- [ ] Post-deployment hooks execute successfully

## ✅ Post-Deployment Validation

### Functionality Testing
- [ ] Homepage loads correctly
- [ ] Navigation works properly
- [ ] 3D visualizations render correctly
- [ ] GitHub API integration working
- [ ] LinkedIn data displays properly
- [ ] Contact form functional (if applicable)

### Performance Validation
- [ ] Lighthouse CI scores meet thresholds
- [ ] Core Web Vitals within acceptable ranges
- [ ] Page load times < 3 seconds
- [ ] First Contentful Paint < 2 seconds
- [ ] Cumulative Layout Shift < 0.1

### API Endpoints
- [ ] `/api/health-check` returns 200 OK
- [ ] `/api/version` shows correct version info
- [ ] `/api/manifest` returns valid PWA manifest
- [ ] All API routes respond correctly

### Security Validation
- [ ] Security headers present and correct
- [ ] CSP policy not blocking legitimate resources
- [ ] HTTPS enforcement working
- [ ] No mixed content warnings

### Error Monitoring
- [ ] Sentry receiving error reports
- [ ] Error boundaries catching React errors
- [ ] API errors properly logged
- [ ] Performance monitoring active

## 🔍 Monitoring Setup

### Health Monitoring
- [ ] Health check endpoint responding
- [ ] Uptime monitoring configured
- [ ] Alert thresholds set appropriately
- [ ] Notification channels working

### Performance Monitoring
- [ ] Lighthouse CI scheduled runs
- [ ] Core Web Vitals tracking
- [ ] API response time monitoring
- [ ] Error rate monitoring

### Analytics
- [ ] Vercel Analytics enabled
- [ ] Custom event tracking (if applicable)
- [ ] User behavior insights configured
- [ ] Performance insights available

## 🚨 Rollback Plan

### Preparation
- [ ] Previous working deployment identified
- [ ] Rollback procedure documented
- [ ] Emergency contacts available
- [ ] Monitoring alerts configured

### Rollback Process
1. [ ] Identify issue requiring rollback
2. [ ] Run `node scripts/vercel-deploy-hook.js rollback`
3. [ ] Verify rollback completed successfully
4. [ ] Test critical functionality
5. [ ] Notify stakeholders of rollback
6. [ ] Document issue for future prevention

## 📊 Success Metrics

### Performance Targets
- [ ] Lighthouse Performance Score: ≥ 80
- [ ] Lighthouse Accessibility Score: ≥ 90
- [ ] Lighthouse Best Practices Score: ≥ 90  
- [ ] Lighthouse SEO Score: ≥ 90
- [ ] First Contentful Paint: < 2s
- [ ] Largest Contentful Paint: < 3s
- [ ] Cumulative Layout Shift: < 0.1

### Uptime Targets
- [ ] Uptime: ≥ 99.9%
- [ ] Response time: < 500ms average
- [ ] Error rate: < 1%
- [ ] Zero critical security vulnerabilities

## 🛠️ Troubleshooting

### Common Issues
- **Build failures**: Check Node.js version, dependencies, and build scripts
- **Environment variables**: Verify all required vars are set in Vercel dashboard
- **Performance issues**: Review bundle size, optimize images, check 3D models
- **Security headers**: Run security test and update vercel.json configuration
- **API failures**: Check external service availability and rate limits

### Debug Commands
```bash
# Local testing
bun run dev
bun run build
bun run start

# Environment validation
node scripts/vercel-env-sync.js validate production
node scripts/vercel-env-sync.js list production

# Security testing  
node scripts/security-headers-test.js https://your-domain.com

# Performance testing
bun run lighthouse:local
```

### Support Resources
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Project Documentation: `/docs/vercel-deployment-optimization.md`
- GitHub Issues: Repository issues page

---

**Note**: This checklist should be followed for every deployment to ensure consistency, reliability, and performance of the XR Portfolio application.