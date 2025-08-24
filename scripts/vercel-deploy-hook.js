#!/usr/bin/env node
/**
 * Pre-deploy hook for Vercel deployment
 * Validates environment and prepares build
 */

console.log('🚀 Pre-deploy hook started');

// Check environment
if (process.env.NODE_ENV === 'production') {
  console.log('✅ Production environment detected');
} else {
  console.log('⚠️ Non-production environment');
}

// Validate required files
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json'
];

console.log('🔍 Validating required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} missing`);
    process.exit(1);
  }
}

console.log('✅ Pre-deploy hook completed successfully');
process.exit(0);