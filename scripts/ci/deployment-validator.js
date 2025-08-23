#!/usr/bin/env bun
/**
 * Deployment Validator - Comprehensive deployment testing and validation
 * Tests production deployment health, performance, and functionality
 */

import { execSync } from 'child_process';

const DEPLOYMENT_TESTS = {
  health: {
    name: 'Health Check',
    endpoint: '/api/health-check',
    timeout: 5000,
    retries: 3
  },
  performance: {
    name: 'Performance Test',
    thresholds: {
      loadTime: 3000, // 3 seconds
      ttfb: 500,      // 500ms
      fcp: 2000       // 2 seconds
    }
  },
  functionality: {
    name: 'Functionality Test',
    endpoints: [
      '/',
      '/api/version',
      '/api/manifest'
    ]
  },
  linkedin: {
    name: 'LinkedIn Features',
    endpoints: [
      '/', // Should contain LinkedIn visualizers
    ],
    selectors: [
      '[data-testid="linkedin-experience"]',
      '[data-testid="linkedin-skills"]',
      '[data-testid="linkedin-education"]'
    ]
  }
};

class DeploymentValidator {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.options = {
      timeout: 10000,
      retries: 3,
      verbose: false,
      ...options
    };
    this.results = {
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async validateDeployment() {
    console.log(`🚀 Starting deployment validation for: ${this.baseUrl}`);
    console.log('=====================================\n');

    try {
      await this.runHealthChecks();
      await this.runPerformanceTests();
      await this.runFunctionalityTests();
      await this.runLinkedInFeatureTests();
      
      this.generateReport();
      return this.results.summary.failed === 0;
      
    } catch (error) {
      console.error('❌ Deployment validation failed:', error.message);
      return false;
    }
  }

  async runHealthChecks() {
    const test = DEPLOYMENT_TESTS.health;
    console.log(`🏥 ${test.name}...`);
    
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${test.endpoint}`,
        { timeout: test.timeout },
        test.retries
      );
      
      const data = await response.json();
      
      if (response.ok && data.status === 'healthy') {
        this.addResult('health', 'PASS', '✅ Health check passed', data);
        console.log('  ✅ Application is healthy');
        console.log(`  📊 Response time: ${data.responseTime}ms`);
        console.log(`  🔧 Services: ${Object.keys(data.checks).length} checked`);
      } else {
        this.addResult('health', 'FAIL', '❌ Health check failed', { response: response.status, data });
        console.log('  ❌ Health check failed');
      }
    } catch (error) {
      this.addResult('health', 'FAIL', `❌ Health check error: ${error.message}`);
      console.log(`  ❌ Health check error: ${error.message}`);
    }
    
    console.log('');
  }

  async runPerformanceTests() {
    const test = DEPLOYMENT_TESTS.performance;
    console.log(`⚡ ${test.name}...`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(this.baseUrl, { 
        method: 'HEAD',
        headers: { 'User-Agent': 'DeploymentValidator/1.0' }
      });
      const loadTime = Date.now() - startTime;
      
      const ttfb = response.headers.get('server-timing') || loadTime;
      
      console.log(`  📊 Load time: ${loadTime}ms`);
      console.log(`  ⚡ TTFB: ${ttfb}ms`);
      
      let status = 'PASS';
      let message = '✅ Performance within acceptable limits';
      
      if (loadTime > test.thresholds.loadTime) {
        status = 'WARNING';
        message = `⚠️ Load time (${loadTime}ms) exceeds threshold (${test.thresholds.loadTime}ms)`;
      }
      
      this.addResult('performance', status, message, {
        loadTime,
        ttfb,
        thresholds: test.thresholds
      });
      
      console.log(`  ${message}`);
      
    } catch (error) {
      this.addResult('performance', 'FAIL', `❌ Performance test error: ${error.message}`);
      console.log(`  ❌ Performance test error: ${error.message}`);
    }
    
    console.log('');
  }

  async runFunctionalityTests() {
    const test = DEPLOYMENT_TESTS.functionality;
    console.log(`🔧 ${test.name}...`);
    
    let passedEndpoints = 0;
    
    for (const endpoint of test.endpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        
        if (response.ok) {
          console.log(`  ✅ ${endpoint} - OK (${response.status})`);
          passedEndpoints++;
        } else {
          console.log(`  ❌ ${endpoint} - Failed (${response.status})`);
          this.addResult('functionality', 'FAIL', `❌ ${endpoint} returned ${response.status}`);
        }
      } catch (error) {
        console.log(`  ❌ ${endpoint} - Error: ${error.message}`);
        this.addResult('functionality', 'FAIL', `❌ ${endpoint} error: ${error.message}`);
      }
    }
    
    if (passedEndpoints === test.endpoints.length) {
      this.addResult('functionality', 'PASS', '✅ All functionality tests passed');
      console.log(`  ✅ All ${passedEndpoints} endpoints working`);
    } else {
      console.log(`  ⚠️ ${passedEndpoints}/${test.endpoints.length} endpoints working`);
    }
    
    console.log('');
  }

  async runLinkedInFeatureTests() {
    const test = DEPLOYMENT_TESTS.linkedin;
    console.log(`💼 ${test.name}...`);
    
    try {
      const response = await fetch(this.baseUrl);
      const html = await response.text();
      
      let featuresFound = 0;
      
      // Check for LinkedIn-related content
      const linkedinKeywords = [
        'linkedin-experience',
        'linkedin-skills', 
        'linkedin-education',
        'professional-timeline',
        'experience-card'
      ];
      
      linkedinKeywords.forEach(keyword => {
        if (html.includes(keyword)) {
          featuresFound++;
          console.log(`  ✅ Found ${keyword}`);
        } else {
          console.log(`  ❌ Missing ${keyword}`);
        }
      });
      
      if (featuresFound >= linkedinKeywords.length * 0.7) { // 70% threshold
        this.addResult('linkedin', 'PASS', '✅ LinkedIn features deployed successfully');
        console.log(`  ✅ LinkedIn features deployed (${featuresFound}/${linkedinKeywords.length})`);
      } else {
        this.addResult('linkedin', 'WARNING', `⚠️ Some LinkedIn features missing (${featuresFound}/${linkedinKeywords.length})`);
        console.log(`  ⚠️ Some LinkedIn features missing`);
      }
      
    } catch (error) {
      this.addResult('linkedin', 'FAIL', `❌ LinkedIn feature test error: ${error.message}`);
      console.log(`  ❌ LinkedIn feature test error: ${error.message}`);
    }
    
    console.log('');
  }

  async fetchWithRetry(url, options = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          timeout: this.options.timeout,
          ...options
        });
        return response;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        console.log(`  🔄 Retry ${attempt}/${retries} for ${url}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  addResult(category, status, message, data = null) {
    this.results.tests.push({
      category,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    });
    
    this.results.summary.total++;
    if (status === 'PASS') this.results.summary.passed++;
    else if (status === 'FAIL') this.results.summary.failed++;
    else if (status === 'WARNING') this.results.summary.warnings++;
  }

  generateReport() {
    const { summary } = this.results;
    
    console.log('📊 DEPLOYMENT VALIDATION REPORT');
    console.log('=====================================');
    console.log(`📈 Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⚠️ Warnings: ${summary.warnings}`);
    console.log('');
    
    const successRate = ((summary.passed / summary.total) * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (summary.failed === 0) {
      console.log('🎉 DEPLOYMENT VALIDATION PASSED!');
    } else {
      console.log('💥 DEPLOYMENT VALIDATION FAILED!');
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => console.log(`  - ${test.message}`));
    }
    
    if (summary.warnings > 0) {
      console.log('\n⚠️ Warnings:');
      this.results.tests
        .filter(test => test.status === 'WARNING')
        .forEach(test => console.log(`  - ${test.message}`));
    }
    
    // Save detailed results
    const reportFile = `deployment-validation-${Date.now()}.json`;
    require('fs').writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportFile}`);
  }
}

// CLI usage
async function main() {
  const baseUrl = process.argv[2];
  
  if (!baseUrl) {
    console.error('Usage: deployment-validator.js <base-url>');
    console.error('Example: deployment-validator.js https://your-app.vercel.app');
    process.exit(1);
  }
  
  const validator = new DeploymentValidator(baseUrl, {
    verbose: process.argv.includes('--verbose'),
    timeout: process.argv.includes('--timeout') ? 
      parseInt(process.argv[process.argv.indexOf('--timeout') + 1]) : 10000
  });
  
  const success = await validator.validateDeployment();
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.main) {
  main().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

export { DeploymentValidator };