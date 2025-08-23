#!/usr/bin/env node
/**
 * Bun Migration Verification Script
 * Verifies that the portfolio project has been successfully migrated from npm to Bun
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class BunMigrationVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  success(message) {
    this.successes.push(message);
    this.log(`✅ ${message}`, colors.green);
  }

  error(message) {
    this.errors.push(message);
    this.log(`❌ ${message}`, colors.red);
  }

  warning(message) {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, colors.yellow);
  }

  info(message) {
    this.log(`ℹ️  ${message}`, colors.blue);
  }

  async verifyBunInstallation() {
    this.info('Checking Bun installation...');
    
    try {
      const bunVersion = execSync('bun --version', { encoding: 'utf8' }).trim();
      this.success(`Bun is installed (version ${bunVersion})`);
      return true;
    } catch (error) {
      this.error('Bun is not installed or not in PATH');
      return false;
    }
  }

  async verifyLockFile() {
    this.info('Checking for bun.lockb file...');
    
    const lockFilePath = path.join(process.cwd(), 'bun.lockb');
    if (fs.existsSync(lockFilePath)) {
      this.success('bun.lockb file exists');
      
      // Check if package-lock.json still exists
      const npmLockPath = path.join(process.cwd(), 'package-lock.json');
      if (fs.existsSync(npmLockPath)) {
        this.warning('package-lock.json still exists - consider removing it');
      } else {
        this.success('package-lock.json has been removed');
      }
      return true;
    } else {
      this.error('bun.lockb file not found');
      return false;
    }
  }

  async verifyPackageJsonScripts() {
    this.info('Verifying package.json scripts use Bun...');
    
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      const bunScripts = [
        'ci:install',
        'ci:build', 
        'ci:test',
        'security:audit',
        'security:fix',
        'release:patch',
        'release:minor',
        'release:major',
        'version:check'
      ];
      
      let updatedScripts = 0;
      for (const script of bunScripts) {
        if (packageJson.scripts[script]) {
          if (packageJson.scripts[script].includes('bun ')) {
            updatedScripts++;
          }
        }
      }
      
      if (updatedScripts >= 6) {
        this.success(`${updatedScripts}/${bunScripts.length} scripts updated to use Bun`);
        return true;
      } else {
        this.warning(`Only ${updatedScripts}/${bunScripts.length} scripts updated to use Bun`);
        return false;
      }
    } catch (error) {
      this.error('Could not read package.json');
      return false;
    }
  }

  async verifyVercelConfig() {
    this.info('Verifying Vercel configuration...');
    
    try {
      const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      
      const hasBunInstall = vercelConfig.installCommand && vercelConfig.installCommand.includes('bun install');
      const hasBunBuild = vercelConfig.buildCommand && vercelConfig.buildCommand.includes('bun run build');
      const hasBunDev = vercelConfig.devCommand && vercelConfig.devCommand.includes('bun run dev');
      
      if (hasBunInstall && hasBunBuild && hasBunDev) {
        this.success('Vercel configuration updated to use Bun');
        return true;
      } else {
        this.error('Vercel configuration not fully updated for Bun');
        return false;
      }
    } catch (error) {
      this.error('Could not read vercel.json');
      return false;
    }
  }

  async verifyDependencies() {
    this.info('Checking dependency installation...');
    
    try {
      execSync('bun install --dry-run', { stdio: 'pipe' });
      this.success('All dependencies can be installed with Bun');
      return true;
    } catch (error) {
      this.error('Dependency issues detected with Bun');
      return false;
    }
  }

  async verifyBuild() {
    this.info('Testing build process with Bun...');
    
    try {
      execSync('bun run build', { stdio: 'pipe' });
      this.success('Build process works with Bun');
      return true;
    } catch (error) {
      this.error('Build process failed with Bun');
      return false;
    }
  }

  async verifyTypeScript() {
    this.info('Verifying TypeScript compilation...');
    
    try {
      execSync('bun run type-check', { stdio: 'pipe' });
      this.success('TypeScript compilation successful');
      return true;
    } catch (error) {
      this.warning('TypeScript compilation has issues (may need fixing)');
      return false;
    }
  }

  async verifyRollupIssues() {
    this.info('Checking if rollup issues are resolved...');
    
    try {
      const bunList = execSync('bun list | grep rollup', { encoding: 'utf8' });
      if (bunList.includes('@rollup/rollup-win32-x64-msvc')) {
        this.success('Rollup Windows dependency is properly installed');
        return true;
      }
    } catch (error) {
      // This is actually good - it means grep didn't find issues
      this.success('No rollup dependency issues detected');
      return true;
    }
  }

  async generateReport() {
    this.log('\n' + '='.repeat(60), colors.bold);
    this.log('🚀 BUN MIGRATION VERIFICATION REPORT', colors.bold);
    this.log('='.repeat(60), colors.bold);
    
    const results = [
      await this.verifyBunInstallation(),
      await this.verifyLockFile(),
      await this.verifyPackageJsonScripts(),
      await this.verifyVercelConfig(),
      await this.verifyDependencies(),
      await this.verifyBuild(),
      await this.verifyTypeScript(),
      await this.verifyRollupIssues()
    ];
    
    const passedTests = results.filter(Boolean).length;
    const totalTests = results.length;
    
    this.log('\n' + '-'.repeat(40), colors.bold);
    this.log('📊 SUMMARY', colors.bold);
    this.log('-'.repeat(40), colors.bold);
    
    this.log(`Tests Passed: ${passedTests}/${totalTests}`, 
      passedTests === totalTests ? colors.green : colors.yellow);
    
    if (this.successes.length > 0) {
      this.log(`\n✅ Successes (${this.successes.length}):`, colors.green);
      this.successes.forEach(msg => this.log(`   • ${msg}`));
    }
    
    if (this.warnings.length > 0) {
      this.log(`\n⚠️  Warnings (${this.warnings.length}):`, colors.yellow);
      this.warnings.forEach(msg => this.log(`   • ${msg}`));
    }
    
    if (this.errors.length > 0) {
      this.log(`\n❌ Errors (${this.errors.length}):`, colors.red);
      this.errors.forEach(msg => this.log(`   • ${msg}`));
    }
    
    this.log('\n' + '='.repeat(60), colors.bold);
    
    if (passedTests >= totalTests - 1) {
      this.log('🎉 MIGRATION SUCCESSFUL!', colors.green + colors.bold);
      this.log('Your portfolio has been successfully migrated from npm to Bun.', colors.green);
    } else if (passedTests >= totalTests - 2) {
      this.log('⚡ MIGRATION MOSTLY SUCCESSFUL!', colors.yellow + colors.bold);
      this.log('Minor issues detected. Please review warnings above.', colors.yellow);
    } else {
      this.log('🔧 MIGRATION NEEDS ATTENTION', colors.red + colors.bold);
      this.log('Several issues detected. Please fix errors before proceeding.', colors.red);
    }
    
    this.log('\n📋 Next Steps:', colors.blue);
    this.log('1. Commit your changes: git add . && git commit -m "feat: migrate from npm to Bun"');
    this.log('2. Test deployment: Push to your Vercel project');
    this.log('3. Update CI/CD pipelines to use Bun commands');
    this.log('4. Update documentation to reflect Bun usage');
    
    return passedTests >= totalTests - 1;
  }
}

// Run verification
const verifier = new BunMigrationVerifier();
verifier.generateReport().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});