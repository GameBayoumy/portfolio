#!/usr/bin/env node

/**
 * Vercel Environment Variable Synchronization Tool
 * Manages environment variables across different Vercel environments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VercelEnvSync {
  constructor() {
    this.projectName = process.env.VERCEL_PROJECT_ID || 'xr-portfolio';
    this.environments = ['production', 'preview', 'development'];
    this.requiredVars = [
      'NEXT_PUBLIC_GITHUB_TOKEN',
      'SENTRY_DSN',
      'SENTRY_ORG',
      'SENTRY_PROJECT',
      'CONTACT_EMAIL',
      'GITHUB_URL',
      'LINKEDIN_URL'
    ];
    this.optionalVars = [
      'VERCEL_ANALYTICS',
      'LIGHTHOUSE_TOKEN',
      'SLACK_WEBHOOK_URL',
      'DISCORD_WEBHOOK_URL',
      'DATADOG_API_KEY',
      'DEPLOYMENT_WEBHOOK_URL'
    ];
  }

  /**
   * List all environment variables for a project
   */
  async listEnvironmentVariables(environment = 'production') {
    console.log(`📋 Listing environment variables for ${environment}...`);
    
    try {
      const command = `vercel env ls --environment=${environment}`;
      const output = execSync(command, { encoding: 'utf8' });
      console.log(output);
      return this.parseEnvList(output);
    } catch (error) {
      console.error(`❌ Failed to list environment variables:`, error.message);
      return [];
    }
  }

  /**
   * Parse vercel env ls output
   */
  parseEnvList(output) {
    const lines = output.split('\n').filter(line => line.trim());
    const vars = [];
    
    for (const line of lines) {
      if (line.includes('│') && !line.includes('Name')) {
        const parts = line.split('│').map(part => part.trim()).filter(Boolean);
        if (parts.length >= 2) {
          vars.push({
            name: parts[0],
            environment: parts[1] || 'unknown'
          });
        }
      }
    }
    
    return vars;
  }

  /**
   * Set environment variable for specific environment
   */
  async setEnvironmentVariable(name, value, environment = 'production') {
    console.log(`🔧 Setting ${name} for ${environment}...`);
    
    try {
      // Use stdin to securely pass the value
      const command = `echo "${value}" | vercel env add ${name} ${environment}`;
      execSync(command, { stdio: 'inherit' });
      console.log(`✅ Set ${name} for ${environment}`);
    } catch (error) {
      console.error(`❌ Failed to set ${name}:`, error.message);
      throw error;
    }
  }

  /**
   * Remove environment variable
   */
  async removeEnvironmentVariable(name, environment = 'production') {
    console.log(`🗑️ Removing ${name} from ${environment}...`);
    
    try {
      const command = `vercel env rm ${name} ${environment} --yes`;
      execSync(command, { stdio: 'inherit' });
      console.log(`✅ Removed ${name} from ${environment}`);
    } catch (error) {
      console.error(`❌ Failed to remove ${name}:`, error.message);
      throw error;
    }
  }

  /**
   * Sync environment variables from .env file
   */
  async syncFromEnvFile(envFile = '.env.local', targetEnvironment = 'development') {
    console.log(`🔄 Syncing environment variables from ${envFile} to ${targetEnvironment}...`);\n    
    try {\n      const envPath = path.join(process.cwd(), envFile);\n      \n      if (!fs.existsSync(envPath)) {\n        console.error(`❌ Environment file not found: ${envFile}`);\n        return;\n      }\n\n      const envContent = fs.readFileSync(envPath, 'utf8');\n      const envVars = this.parseEnvFile(envContent);\n\n      console.log(`📦 Found ${envVars.length} variables in ${envFile}`);\n\n      for (const { key, value } of envVars) {\n        if (this.shouldSyncVariable(key)) {\n          await this.setEnvironmentVariable(key, value, targetEnvironment);\n        } else {\n          console.log(`⏭️ Skipping ${key} (not in sync list)`);\n        }\n      }\n\n      console.log(`✅ Sync completed for ${targetEnvironment}`);\n    } catch (error) {\n      console.error(`❌ Sync failed:`, error.message);\n      throw error;\n    }\n  }\n\n  /**\n   * Parse .env file content\n   */\n  parseEnvFile(content) {\n    const lines = content.split('\\n');\n    const vars = [];\n\n    for (const line of lines) {\n      const trimmedLine = line.trim();\n      \n      // Skip comments and empty lines\n      if (!trimmedLine || trimmedLine.startsWith('#')) {\n        continue;\n      }\n\n      const equalIndex = trimmedLine.indexOf('=');\n      if (equalIndex > 0) {\n        const key = trimmedLine.substring(0, equalIndex).trim();\n        let value = trimmedLine.substring(equalIndex + 1).trim();\n        \n        // Remove quotes if present\n        if ((value.startsWith('\"') && value.endsWith('\"')) || \n            (value.startsWith(\"'\") && value.endsWith(\"'\"))) {\n          value = value.slice(1, -1);\n        }\n\n        vars.push({ key, value });\n      }\n    }\n\n    return vars;\n  }\n\n  /**\n   * Check if variable should be synced\n   */\n  shouldSyncVariable(key) {\n    return this.requiredVars.includes(key) || \n           this.optionalVars.includes(key) ||\n           key.startsWith('NEXT_PUBLIC_');\n  }\n\n  /**\n   * Validate required environment variables\n   */\n  async validateEnvironmentVariables(environment = 'production') {\n    console.log(`🔍 Validating environment variables for ${environment}...`);\n    \n    try {\n      const existingVars = await this.listEnvironmentVariables(environment);\n      const existingNames = existingVars.map(v => v.name);\n      \n      const missing = this.requiredVars.filter(name => !existingNames.includes(name));\n      const present = this.requiredVars.filter(name => existingNames.includes(name));\n      \n      console.log(`\\n📊 Validation Results for ${environment}:`);\n      console.log(`✅ Present (${present.length}): ${present.join(', ')}`);\n      \n      if (missing.length > 0) {\n        console.log(`❌ Missing (${missing.length}): ${missing.join(', ')}`);\n        console.log('\\n🔧 To fix missing variables:');\n        for (const varName of missing) {\n          console.log(`vercel env add ${varName} ${environment}`);\n        }\n        return false;\n      } else {\n        console.log('✅ All required variables are present');\n        return true;\n      }\n    } catch (error) {\n      console.error(`❌ Validation failed:`, error.message);\n      return false;\n    }\n  }\n\n  /**\n   * Generate environment variable template\n   */\n  generateTemplate(outputFile = '.env.template') {\n    console.log(`📝 Generating environment variable template...`);\n    \n    const template = [\n      '# XR Portfolio Environment Variables Template',\n      '# Copy this file to .env.local and fill in your values\\n',\n      '# Required Variables',\n      ...this.requiredVars.map(name => `${name}=your_${name.toLowerCase()}_here`),\n      '\\n# Optional Variables',\n      ...this.optionalVars.map(name => `# ${name}=your_${name.toLowerCase()}_here`),\n      '\\n# Development Settings',\n      'NODE_ENV=development',\n      'NEXT_TELEMETRY_DISABLED=1',\n      'SKIP_ENV_VALIDATION=1'\n    ].join('\\n');\n\n    fs.writeFileSync(outputFile, template);\n    console.log(`✅ Template generated: ${outputFile}`);\n  }\n\n  /**\n   * Backup environment variables\n   */\n  async backupEnvironmentVariables(environment = 'production') {\n    console.log(`💾 Backing up environment variables for ${environment}...`);\n    \n    try {\n      const vars = await this.listEnvironmentVariables(environment);\n      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');\n      const backupFile = `env-backup-${environment}-${timestamp}.json`;\n      \n      const backup = {\n        environment,\n        timestamp: new Date().toISOString(),\n        variables: vars,\n        requiredVars: this.requiredVars,\n        optionalVars: this.optionalVars\n      };\n\n      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));\n      console.log(`✅ Backup saved: ${backupFile}`);\n    } catch (error) {\n      console.error(`❌ Backup failed:`, error.message);\n      throw error;\n    }\n  }\n\n  /**\n   * Clone environment variables between environments\n   */\n  async cloneEnvironment(sourceEnv, targetEnv) {\n    console.log(`🔄 Cloning environment variables from ${sourceEnv} to ${targetEnv}...`);\n    \n    try {\n      // This would require manual steps as Vercel CLI doesn't support direct cloning\n      console.log('⚠️ Environment cloning requires manual steps:');\n      console.log(`1. Export variables from ${sourceEnv}`);\n      console.log(`2. Import variables to ${targetEnv}`);\n      console.log('3. Use the sync command with appropriate .env file');\n      \n      // Generate instructions\n      const vars = await this.listEnvironmentVariables(sourceEnv);\n      console.log('\\n📋 Variables to clone:');\n      vars.forEach(v => console.log(`- ${v.name}`));\n      \n    } catch (error) {\n      console.error(`❌ Clone operation failed:`, error.message);\n      throw error;\n    }\n  }\n}\n\n// CLI Interface\nconst envSync = new VercelEnvSync();\nconst command = process.argv[2];\nconst arg1 = process.argv[3];\nconst arg2 = process.argv[4];\n\nasync function main() {\n  try {\n    switch (command) {\n      case 'list':\n        await envSync.listEnvironmentVariables(arg1 || 'production');\n        break;\n      case 'validate':\n        await envSync.validateEnvironmentVariables(arg1 || 'production');\n        break;\n      case 'sync':\n        await envSync.syncFromEnvFile(arg1 || '.env.local', arg2 || 'development');\n        break;\n      case 'template':\n        envSync.generateTemplate(arg1 || '.env.template');\n        break;\n      case 'backup':\n        await envSync.backupEnvironmentVariables(arg1 || 'production');\n        break;\n      case 'clone':\n        await envSync.cloneEnvironment(arg1 || 'production', arg2 || 'preview');\n        break;\n      default:\n        console.log(`\n🔧 Vercel Environment Variable Sync Tool\n\nUsage:\n  node scripts/vercel-env-sync.js <command> [options]\n\nCommands:\n  list [env]              List environment variables (default: production)\n  validate [env]          Validate required variables (default: production)\n  sync [file] [env]       Sync from .env file (default: .env.local to development)\n  template [output]       Generate .env template (default: .env.template)\n  backup [env]           Backup environment variables (default: production)\n  clone [source] [target] Clone between environments (default: production to preview)\n\nExamples:\n  node scripts/vercel-env-sync.js list production\n  node scripts/vercel-env-sync.js validate preview\n  node scripts/vercel-env-sync.js sync .env.local development\n  node scripts/vercel-env-sync.js template .env.example\n  node scripts/vercel-env-sync.js backup production\n`);\n        process.exit(1);\n    }\n  } catch (error) {\n    console.error('❌ Command failed:', error.message);\n    process.exit(1);\n  }\n}\n\nif (require.main === module) {\n  main();\n}\n\nmodule.exports = VercelEnvSync;