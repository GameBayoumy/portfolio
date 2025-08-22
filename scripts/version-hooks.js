#!/usr/bin/env node

/**
 * Version Management Hooks
 * Portfolio-specific versioning automation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_PATH = path.join(__dirname, '../package.json');
const CHANGELOG_PATH = path.join(__dirname, '../CHANGELOG.md');

class VersionHooks {
  constructor() {
    this.packageJson = this.readPackageJson();
  }

  readPackageJson() {
    return JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  }

  writePackageJson(data) {
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(data, null, 2) + '\n');
  }

  /**
   * Pre-version hook: Validate environment and run checks
   */
  async preVersion() {
    console.log('🔍 Running pre-version checks...');

    try {
      // Run quality checks
      execSync('npm run lint', { stdio: 'inherit' });
      execSync('npm run type-check', { stdio: 'inherit' });
      execSync('npm run test', { stdio: 'inherit' });
      
      console.log('✅ All pre-version checks passed');
    } catch (error) {
      console.error('❌ Pre-version checks failed');
      process.exit(1);
    }
  }

  /**
   * Post-version hook: Update portfolio-specific version info
   */
  async postVersion() {
    console.log('🔄 Running post-version updates...');

    const newVersion = this.packageJson.version;
    
    // Update version info in portfolio components
    await this.updatePortfolioVersion(newVersion);
    
    // Update API version tracking
    await this.updateApiVersions(newVersion);
    
    // Generate performance baseline
    await this.generatePerformanceBaseline();
    
    console.log(`✅ Post-version updates completed for v${newVersion}`);
  }

  /**
   * Update portfolio components with new version info
   */
  async updatePortfolioVersion(version) {
    const versionInfo = {
      version,
      buildDate: new Date().toISOString(),
      commitHash: this.getCommitHash(),
      features: {
        linkedin: this.hasLinkedInIntegration(),
        github: this.hasGitHubIntegration(),
        threejs: this.hasThreeJSIntegration(),
      },
    };

    // Create version info file
    const versionPath = path.join(__dirname, '../src/config/version.json');
    fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));

    console.log(`📝 Updated version info: ${version}`);
  }

  /**
   * Update API version tracking
   */
  async updateApiVersions(version) {
    const apiVersions = {
      portfolio: version,
      linkedin: this.getLinkedInApiVersion(),
      github: this.getGitHubApiVersion(),
      vercel: this.getVercelApiVersion(),
    };

    const apiPath = path.join(__dirname, '../src/config/api-versions.json');
    fs.writeFileSync(apiPath, JSON.stringify(apiVersions, null, 2));

    console.log('🔗 Updated API version tracking');
  }

  /**
   * Generate performance baseline for new version
   */
  async generatePerformanceBaseline() {
    const baseline = {
      version: this.packageJson.version,
      timestamp: new Date().toISOString(),
      metrics: {
        buildTime: this.measureBuildTime(),
        bundleSize: this.measureBundleSize(),
        dependencies: Object.keys(this.packageJson.dependencies).length,
        devDependencies: Object.keys(this.packageJson.devDependencies || {}).length,
      },
    };

    const baselinePath = path.join(__dirname, '../docs/performance-baseline.json');
    let baselines = [];
    
    if (fs.existsSync(baselinePath)) {
      baselines = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    }
    
    baselines.push(baseline);
    
    // Keep only last 10 baselines
    if (baselines.length > 10) {
      baselines = baselines.slice(-10);
    }
    
    fs.writeFileSync(baselinePath, JSON.stringify(baselines, null, 2));
    console.log('📊 Generated performance baseline');
  }

  /**
   * Portfolio feature detection
   */
  hasLinkedInIntegration() {
    return fs.existsSync(path.join(__dirname, '../src/components/linkedin-visualizers'));
  }

  hasGitHubIntegration() {
    return fs.existsSync(path.join(__dirname, '../src/components/github-visualizers'));
  }

  hasThreeJSIntegration() {
    return this.packageJson.dependencies.hasOwnProperty('@react-three/fiber');
  }

  /**
   * API version detection
   */
  getLinkedInApiVersion() {
    // Extract from LinkedIn API service
    try {
      const apiFile = path.join(__dirname, '../src/services/linkedin-api.ts');
      if (fs.existsSync(apiFile)) {
        const content = fs.readFileSync(apiFile, 'utf8');
        const versionMatch = content.match(/API_VERSION.*['"](.+)['"]/);
        return versionMatch ? versionMatch[1] : 'v1';
      }
    } catch (error) {
      console.warn('Could not detect LinkedIn API version');
    }
    return 'v1';
  }

  getGitHubApiVersion() {
    // GitHub API v4 (GraphQL) is standard
    return 'v4';
  }

  getVercelApiVersion() {
    // Extract from vercel.json or default
    return 'v1';
  }

  /**
   * Utility methods
   */
  getCommitHash() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7);
    } catch (error) {
      return 'unknown';
    }
  }

  measureBuildTime() {
    // This would be implemented with actual timing in CI/CD
    return null;
  }

  measureBundleSize() {
    try {
      const buildPath = path.join(__dirname, '../.next');
      if (fs.existsSync(buildPath)) {
        // Rough estimation - would use proper bundle analyzer in practice
        const stats = fs.statSync(buildPath);
        return Math.round(stats.size / 1024); // KB
      }
    } catch (error) {
      console.warn('Could not measure bundle size');
    }
    return null;
  }

  /**
   * Generate custom changelog content
   */
  async generateCustomChangelog(version, changes) {
    const portfolioChanges = this.categorizePortfolioChanges(changes);
    
    let changelogContent = `\n## [${version}] - ${new Date().toISOString().split('T')[0]}\n\n`;
    
    // Portfolio-specific categorization
    if (portfolioChanges.linkedin.length > 0) {
      changelogContent += `### 💼 LinkedIn Integration\n`;
      portfolioChanges.linkedin.forEach(change => {
        changelogContent += `- ${change}\n`;
      });
      changelogContent += '\n';
    }

    if (portfolioChanges.github.length > 0) {
      changelogContent += `### 🐙 GitHub Visualizers\n`;
      portfolioChanges.github.forEach(change => {
        changelogContent += `- ${change}\n`;
      });
      changelogContent += '\n';
    }

    if (portfolioChanges.threejs.length > 0) {
      changelogContent += `### 🎮 3D/XR Features\n`;
      portfolioChanges.threejs.forEach(change => {
        changelogContent += `- ${change}\n`;
      });
      changelogContent += '\n';
    }

    if (portfolioChanges.performance.length > 0) {
      changelogContent += `### ⚡ Performance\n`;
      portfolioChanges.performance.forEach(change => {
        changelogContent += `- ${change}\n`;
      });
      changelogContent += '\n';
    }

    return changelogContent;
  }

  categorizePortfolioChanges(changes) {
    return {
      linkedin: changes.filter(change => 
        change.includes('linkedin') || change.includes('LinkedIn')
      ),
      github: changes.filter(change => 
        change.includes('github') || change.includes('GitHub')
      ),
      threejs: changes.filter(change => 
        change.includes('3d') || change.includes('three') || change.includes('xr')
      ),
      performance: changes.filter(change => 
        change.includes('perf') || change.includes('performance') || 
        change.includes('optimize') || change.includes('speed')
      ),
    };
  }
}

// CLI Interface
const hooks = new VersionHooks();
const command = process.argv[2];

async function main() {
  switch (command) {
    case 'pre':
      await hooks.preVersion();
      break;
    case 'post':
      await hooks.postVersion();
      break;
    default:
      console.log('Usage: node version-hooks.js [pre|post]');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Version hook failed:', error);
    process.exit(1);
  });
}

module.exports = VersionHooks;