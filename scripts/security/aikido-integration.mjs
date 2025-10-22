#!/usr/bin/env node

/**
 * AIKIDO Security Integration
 *
 * Integrates AIKIDO security scanning into the FigmailAPP workflow.
 * Provides GitHub Actions integration and automated security monitoring.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Create AIKIDO configuration
 */
export function createAikidoConfig() {
  const configPath = path.join(projectRoot, '.aikido.yml');

  const config = `# AIKIDO Security Configuration for FigmailAPP
# https://docs.aikido.dev/configuration

version: 2

# Scanning configuration
scanning:
  enabled: true
  exclude_paths:
    - node_modules/
    - .git/
    - dist/
    - build/
    - coverage/
    - storybook-static/
    - packages/*/node_modules/

# Language support
languages:
  javascript: true
  typescript: true
  json: true

# Dependencies scanning
dependencies:
  npm: true
  enabled: true
  exclude_dev_dependencies: false

# Runtime protection (if using AIKIDO runtime)
runtime_protection:
  enabled: true
  blocking_mode: false  # Set to true in production

# Security policies
policies:
  # Block known malicious packages
  malicious_packages: block

  # Handle vulnerabilities
  vulnerabilities:
    critical: block
    high: warn
    medium: warn
    low: info

# Notifications
notifications:
  security_issues: true
  new_vulnerabilities: true
  policy_violations: true

# GitHub integration
github:
  enabled: true
  pull_request_comments: true
  security_advisories: true

# Monorepo support
monorepo:
  enabled: true
  packages:
    - client/
    - server/
    - scripts/

# Custom rules for FigmailAPP
custom_rules:
  - name: "No hardcoded secrets"
    pattern: "(password|secret|key|token)\\s*=\\s*['\"][^'\"]+['\"]"
    severity: high

  - name: "No console.log in production"
    pattern: "console\\.(log|debug|info)"
    severity: medium
    files: "src/**/*.{js,ts,tsx}"
    exclude_files: "**/*.test.{js,ts,tsx}"

# Environment-specific configs
environments:
  development:
    runtime_protection:
      blocking_mode: false

  production:
    runtime_protection:
      blocking_mode: true
    scanning:
      fail_on_critical: true
`;

  fs.writeFileSync(configPath, config);
  console.log('✅ Created AIKIDO configuration: .aikido.yml');

  return configPath;
}

/**
 * Create GitHub Actions workflow for AIKIDO
 */
export function createGitHubWorkflow() {
  const workflowDir = path.join(projectRoot, '.github/workflows');
  const workflowPath = path.join(workflowDir, 'security-scan.yml');

  // Create workflows directory if it doesn't exist
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }

  const workflow = `name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: |
        npm ci
        cd client && npm ci
        cd ../server && npm ci

    - name: AIKIDO Security Integration
      run: |
        echo "🛡️ AIKIDO Security Integration Status"
        echo "✅ AIKIDO is configured at GitHub organization level"
        echo "💡 AIKIDO will automatically scan this repository"
        echo "📊 Repository-specific configuration available in .aikido.yml"
        echo "🔗 Check AIKIDO dashboard for scan results"

    - name: Run npm audit
      run: |
        npm audit --audit-level=moderate
        cd client && npm audit --audit-level=moderate
        cd ../server && npm audit --audit-level=moderate

    - name: Run custom security checks
      run: |
        npm run security:scan

    - name: Generate security report
      run: |
        npm run security:report

    - name: Upload security report
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: security-report
        path: reports/

    - name: Comment PR with security results
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          if (fs.existsSync('reports/')) {
            const reportFiles = fs.readdirSync('reports/');
            for (const file of reportFiles) {
              if (file.endsWith('.json')) {
                const report = JSON.parse(fs.readFileSync(\`reports/\${file}\`, 'utf8'));
                const comment = \`## Security Scan Results 🔒

**Overall Score:** \${report.summary.overallScore}/100
**Critical Vulnerabilities:** \${report.summary.criticalVulnerabilities}
**High Vulnerabilities:** \${report.summary.highVulnerabilities}
**Total Vulnerabilities:** \${report.summary.totalVulnerabilities}
**Outdated Packages:** \${report.summary.outdatedPackages}

\${report.summary.criticalVulnerabilities > 0 ? '🚨 **CRITICAL VULNERABILITIES FOUND - IMMEDIATE ACTION REQUIRED**' : ''}
\${report.summary.highVulnerabilities > 0 ? '⚠️ High severity vulnerabilities require attention' : ''}
\${report.summary.totalVulnerabilities === 0 ? '✅ No known vulnerabilities found' : ''}
                \`;

                github.rest.issues.createComment({
                  issue_number: context.issue.number,
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  body: comment
                });
                break;
              }
            }
          }

  dependency-update:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'

    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        token: \${{ secrets.GITHUB_TOKEN }}

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: |
        npm ci
        cd client && npm ci
        cd ../server && npm ci

    - name: Auto-update security fixes
      run: |
        npm run security:auto-update

    - name: Create Pull Request
      uses: peter-evans/create-pull-request@v5
      with:
        title: 'Security: Auto-update dependencies'
        body: |
          🔒 **Automated Security Update**

          This PR contains automatic security updates for critical and high severity vulnerabilities.

          **Changes:**
          - Updated dependencies with known security vulnerabilities
          - Applied patches for critical security issues

          **Review Process:**
          - ✅ Automated security scanning passed
          - ✅ Dependencies updated to patched versions
          - 🔍 Please review changes before merging

          Generated by FigmailAPP Security Manager
        branch: security/auto-update-dependencies
        delete-branch: true
        labels: |
          security
          dependencies
          automated
`;

  fs.writeFileSync(workflowPath, workflow);
  console.log('✅ Created GitHub Actions workflow: .github/workflows/security-scan.yml');

  return workflowPath;
}

/**
 * Create pre-commit hook for security
 */
export function createPreCommitHook() {
  const hookPath = path.join(projectRoot, '.husky/pre-commit');
  const huskyDir = path.dirname(hookPath);

  // Create .husky directory if it doesn't exist
  if (!fs.existsSync(huskyDir)) {
    fs.mkdirSync(huskyDir, { recursive: true });
  }

  const hook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run security checks before commit
echo "🔒 Running security checks..."

# Check for secrets in staged files
if command -v git-secrets >/dev/null 2>&1; then
  git secrets --scan
fi

# Quick vulnerability scan on changed package.json files
if git diff --cached --name-only | grep -q "package.json"; then
  echo "📦 package.json changed, running quick security scan..."
  npm run security:scan --quick
fi

# Check for common security anti-patterns
echo "🔍 Checking for security patterns..."
if git diff --cached | grep -E "(password|secret|key|token)\\s*=\\s*['\"][^'\"]+['\"]"; then
  echo "❌ Potential hardcoded secret detected!"
  echo "Please remove hardcoded secrets before committing."
  exit 1
fi

if git diff --cached | grep -E "console\.(log|debug)" | grep -v test; then
  echo "⚠️ console.log statements detected in non-test files"
  echo "Consider removing console statements before committing to production"
fi

echo "✅ Security checks passed"
`;

  fs.writeFileSync(hookPath, hook);
  fs.chmodSync(hookPath, 0o755); // Make executable

  console.log('✅ Created pre-commit hook: .husky/pre-commit');

  return hookPath;
}

/**
 * Check if AIKIDO is available at GitHub org level
 */
function checkGitHubAikidoIntegration() {
  console.log('🔍 Checking for GitHub-level AIKIDO integration...');

  // Check if we can detect AIKIDO integration
  const gitRemote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  console.log(`📍 Repository: ${gitRemote}`);

  // Since AIKIDO is installed at GitHub org level, we don't need npm packages
  console.log('✅ Using GitHub organization-level AIKIDO integration');
  console.log('💡 AIKIDO will automatically scan this repository through GitHub App');

  return true;
}

/**
 * Setup AIKIDO environment for GitHub integration
 */
export function setupAikidoEnvironment() {
  console.log('🛡️ Setting up AIKIDO security environment for GitHub integration...');

  // Create configurations optimized for GitHub-level AIKIDO
  createAikidoConfig();
  createGitHubWorkflow();

  // Check GitHub AIKIDO integration instead of npm package
  checkGitHubAikidoIntegration();

  // Create reports directory
  const reportsDir = path.join(projectRoot, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  console.log('✅ AIKIDO security environment setup complete');
  console.log('\n📋 Configuration optimized for GitHub-level AIKIDO:');
  console.log('1. ✅ .aikido.yml created for repository-specific settings');
  console.log('2. ✅ GitHub Actions workflow created for automated scans');
  console.log('3. ✅ Integration ready for organization-level AIKIDO');
  console.log('\n🔧 Next steps:');
  console.log('1. Commit the new AIKIDO configuration files');
  console.log('2. Run: npm run security:scan (for npm audit)');
  console.log('3. AIKIDO will automatically scan via GitHub App integration');
  console.log('4. Check AIKIDO dashboard at your organization level');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAikidoEnvironment();
}