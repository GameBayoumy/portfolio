# Secrets Configuration Guide

This guide explains how to set up the required secrets for the CI/CD pipeline to work properly with Vercel deployment and security scanning tools.

## Required Secrets

### 🔐 GitHub Repository Secrets

Navigate to your repository: **Settings** → **Secrets and variables** → **Actions**

### Essential Secrets (Required)

| Secret Name | Description | Required | Where to Get |
|-------------|-------------|----------|--------------|
| `VERCEL_TOKEN` | Vercel authentication token | ✅ Yes | [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel organization ID | ✅ Yes | Run `vercel whoami` or check team settings |
| `VERCEL_PROJECT_ID` | Your specific project ID | ✅ Yes | Run `vercel link` or check project settings |

### Optional Secrets (Recommended)

| Secret Name | Description | Required | Where to Get |
|-------------|-------------|----------|--------------|
| `VERCEL_PRODUCTION_DOMAIN` | Your custom domain | ❌ Optional | Your domain registrar |
| `SNYK_TOKEN` | Snyk security scanning token | ❌ Optional | [Snyk Account Settings](https://app.snyk.io/account) |

## Step-by-Step Setup

### 1. Install Vercel CLI

```bash
npm install -g vercel@latest
```

### 2. Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your preferred method (GitHub, GitLab, etc.).

### 3. Get Vercel Token

1. Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Choose appropriate scope:
   - **Name**: `GitHub-Actions-Portfolio`
   - **Scope**: Full Account (recommended for CI/CD)
   - **Expiration**: No expiration (or set based on your security policy)
4. Copy the token immediately (you won't see it again)

### 4. Get Organization ID

```bash
vercel whoami
```

Look for the `id` field in the output:

```json
{
  "user": {
    "id": "team_xxxxxxxxxxxxxxxxxxxxxx",
    "username": "your-username",
    "email": "your-email@example.com"
  }
}
```

Copy the `id` value.

### 5. Get Project ID

Navigate to your project directory and run:

```bash
cd /path/to/your/portfolio
vercel link
```

Follow the prompts:
- **Link to existing project?** Yes
- **What's the name of your existing project?** Select your portfolio project

Then check the project configuration:

```bash
cat .vercel/project.json
```

Copy the `projectId` value:

```json
{
  "projectId": "prj_xxxxxxxxxxxxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxxxxxxxxxxxx"
}
```

### 6. Add Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret:

```
Name: VERCEL_TOKEN
Value: [your-vercel-token]
```

```
Name: VERCEL_ORG_ID  
Value: [your-org-id]
```

```
Name: VERCEL_PROJECT_ID
Value: [your-project-id]
```

### 7. Optional: Custom Domain

If you have a custom domain:

```
Name: VERCEL_PRODUCTION_DOMAIN
Value: your-domain.com
```

## Security Best Practices

### 🔒 Token Security

1. **Principle of Least Privilege**: Use tokens with minimal required permissions
2. **Regular Rotation**: Rotate tokens every 90 days
3. **Monitor Usage**: Check token usage in Vercel dashboard regularly
4. **Revoke Unused Tokens**: Remove tokens that are no longer needed

### 🚨 Emergency Procedures

If you suspect a token has been compromised:

1. **Immediately revoke** the token in Vercel dashboard
2. **Generate a new token** with the same permissions
3. **Update the GitHub secret** with the new token
4. **Monitor deployments** for any suspicious activity
5. **Review recent deployment logs** in Vercel

### 🔍 Verification Steps

After setting up secrets, verify the configuration:

1. **Create a test commit** to trigger the pipeline
2. **Check GitHub Actions** tab for running workflows
3. **Monitor Vercel dashboard** for deployment activity
4. **Verify deployment URL** is accessible

## Troubleshooting

### Common Issues

#### "Invalid token" error:
```bash
# Verify token works locally
vercel whoami --token=YOUR_TOKEN
```

#### "Project not found" error:
```bash
# Re-link your project
vercel link --yes --token=YOUR_TOKEN
```

#### "Organization not found" error:
```bash
# Check your organization ID
vercel teams list --token=YOUR_TOKEN
```

### Debug Commands

```bash
# Test Vercel CLI configuration
vercel env ls --token=YOUR_TOKEN

# Check project settings
vercel project ls --token=YOUR_TOKEN

# Verify deployment capabilities
vercel deploy --dry-run --token=YOUR_TOKEN
```

### GitHub Actions Debugging

Add this step to your workflow for debugging:

```yaml
- name: Debug Vercel Configuration
  run: |
    echo "Vercel CLI version: $(vercel --version)"
    echo "Organization ID: ${{ secrets.VERCEL_ORG_ID }}"
    echo "Project ID: ${{ secrets.VERCEL_PROJECT_ID }}"
    # Note: Never echo the actual token
    echo "Token configured: ${{ secrets.VERCEL_TOKEN != '' }}"
```

## Environment-Specific Configuration

### Development Environment
- No special secrets required
- Uses local Vercel CLI authentication
- Preview deployments for all branches

### Staging Environment (Optional)
```
VERCEL_STAGING_DOMAIN=staging.your-domain.com
```

### Production Environment
```
VERCEL_PRODUCTION_DOMAIN=your-domain.com
```

## Security Scanning Setup (Optional)

### Snyk Integration

1. Sign up at [snyk.io](https://snyk.io)
2. Go to Account Settings → API Token
3. Copy the token
4. Add to GitHub secrets as `SNYK_TOKEN`

### CodeQL (Built-in)
- No additional setup required
- Automatically enabled in security workflow
- Scans for vulnerabilities in code

## Monitoring and Maintenance

### Weekly Checks
- [ ] Review deployment logs
- [ ] Check for failed builds
- [ ] Monitor security alerts
- [ ] Verify preview deployments

### Monthly Tasks
- [ ] Review token usage
- [ ] Update dependencies
- [ ] Check security scan results
- [ ] Verify backup procedures

### Quarterly Reviews
- [ ] Rotate API tokens
- [ ] Review access permissions
- [ ] Update security policies
- [ ] Audit deployment history

## Support and Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel API Reference](https://vercel.com/docs/rest-api)
- [Security Best Practices](https://docs.github.com/en/code-security)

---

For additional help, create an issue in the repository or contact the development team.