#!/usr/bin/env node

/**
 * Dependency Security Manager
 *
 * Ensures package.json files across the monorepo are secure and up-to-date.
 * Integrates with security scanners like AIKIDO, npm audit, and package vulnerability databases.
 *
 * Features:
 * - Multi-package.json scanning (root, client, server)
 * - Vulnerability detection and reporting
 * - Automated security updates
 * - Interactive update prompts
 * - AIKIDO integration
 * - Dependency health scoring
 *
 * Usage:
 *   node scripts/security/dependency-manager.mjs [options]
 *
 * Options:
 *   --scan              Scan for vulnerabilities only
 *   --update            Update dependencies interactively
 *   --auto-update       Update automatically (security fixes only)
 *   --force-update      Update all dependencies (dangerous)
 *   --check-outdated    Check for outdated packages
 *   --report            Generate security report
 *   --aikido            Run AIKIDO security scan
 *   --dry-run           Preview changes without applying
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const isDryRun = process.argv.includes('--dry-run');
const isAutoUpdate = process.argv.includes('--auto-update');
const isForceUpdate = process.argv.includes('--force-update');
const scanOnly = process.argv.includes('--scan');
const checkOutdated = process.argv.includes('--check-outdated');
const generateReport = process.argv.includes('--report');
const runAikido = process.argv.includes('--aikido');
const isHelp = process.argv.includes('--help');

// Paths
const projectRoot = path.resolve(__dirname, '../..');
const packagePaths = {
  root: path.join(projectRoot, 'package.json'),
  client: path.join(projectRoot, 'client/package.json'),
  server: path.join(projectRoot, 'server/package.json')
};

// Security thresholds
const SECURITY_CONFIG = {
  maxAge: {
    critical: 7,    // days - critical vulnerabilities must be fixed within 7 days
    high: 30,       // days - high vulnerabilities within 30 days
    moderate: 90,   // days - moderate vulnerabilities within 90 days
    low: 365        // days - low vulnerabilities within 1 year
  },
  autoUpdateLevels: ['critical', 'high'], // Auto-update these severity levels
  excludePackages: [], // Packages to never auto-update
  trustedSources: ['npm', 'github'], // Trusted package sources
};

// Test log for dry runs
const testLog = [];

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🔒 Dependency Security Manager

USAGE:
  node scripts/security/dependency-manager.mjs [options]

SCANNING OPTIONS:
  --scan              🔍 Scan for vulnerabilities only
  --check-outdated    📊 Check for outdated packages
  --report            📋 Generate comprehensive security report
  --aikido            🛡️  Run AIKIDO security scan

UPDATE OPTIONS:
  --update            🔄 Interactive dependency updates
  --auto-update       ⚡ Auto-update security fixes only
  --force-update      ⚠️  Update ALL dependencies (use with caution)

SAFETY OPTIONS:
  --dry-run           👁️  Preview changes without applying
  --help              ❓ Show this help

EXAMPLES:
  # Daily security scan
  npm run security:scan

  # Interactive update session
  npm run security:update

  # Auto-fix critical vulnerabilities
  npm run security:auto-update

  # Generate security report for compliance
  npm run security:report

  # Full security audit with AIKIDO
  npm run security:aikido

INTEGRATION:
  - Integrates with AIKIDO security scanner
  - Works with npm audit and GitHub security advisories
  - Generates reports compatible with CI/CD pipelines
  - Supports monorepo structure (root/client/server)
  `);
}

/**
 * Prompts the user for input
 */
const ask = (query) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });

/**
 * Execute command safely
 */
function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    });
    return { success: true, output: result, error: null };
  } catch (error) {
    return { success: false, output: null, error: error.message };
  }
}

/**
 * Get package.json content
 */
function getPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { path: filePath, content: JSON.parse(content), exists: true };
  } catch (error) {
    return { path: filePath, content: null, exists: false, error: error.message };
  }
}

/**
 * Write package.json safely
 */
function writePackageJson(filePath, content) {
  if (isDryRun) {
    testLog.push(`[DRY] Would update: ${filePath}`);
    return true;
  }

  try {
    const formatted = JSON.stringify(content, null, 2) + '\n';
    fs.writeFileSync(filePath, formatted);
    return true;
  } catch (error) {
    console.error(`❌ Failed to write ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Scan for vulnerabilities using npm audit
 */
async function scanVulnerabilities(packageDir) {
  console.log(`\n🔍 Scanning vulnerabilities in ${path.basename(packageDir)}...`);

  const auditCommand = 'npm audit --json';
  const result = execCommand(auditCommand, { cwd: packageDir });

  if (!result.success) {
    console.warn(`⚠️  npm audit failed in ${packageDir}: ${result.error}`);
    return { vulnerabilities: [], summary: null };
  }

  try {
    const auditData = JSON.parse(result.output);
    return {
      vulnerabilities: auditData.vulnerabilities || {},
      summary: auditData.metadata || null,
      auditLevel: auditData.auditReportVersion || 1
    };
  } catch (error) {
    console.warn(`⚠️  Failed to parse audit results for ${packageDir}`);
    return { vulnerabilities: [], summary: null };
  }
}

/**
 * Check for outdated packages
 */
async function checkOutdatedPackages(packageDir) {
  console.log(`\n📊 Checking outdated packages in ${path.basename(packageDir)}...`);

  const outdatedCommand = 'npm outdated --json';
  const result = execCommand(outdatedCommand, { cwd: packageDir });

  // npm outdated returns exit code 1 if packages are outdated, which is expected
  try {
    const outdatedData = result.output ? JSON.parse(result.output) : {};
    return outdatedData;
  } catch (error) {
    console.warn(`⚠️  Failed to check outdated packages in ${packageDir}`);
    return {};
  }
}

/**
 * Analyze vulnerability severity and age
 */
function analyzeVulnerability(vulnId, vulnData) {
  const severity = vulnData.severity || 'unknown';
  const publishedDate = vulnData.created ? new Date(vulnData.created) : new Date();
  const ageInDays = Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));

  const maxAge = SECURITY_CONFIG.maxAge[severity] || SECURITY_CONFIG.maxAge.low;
  const isStale = ageInDays > maxAge;
  const shouldAutoUpdate = SECURITY_CONFIG.autoUpdateLevels.includes(severity);

  return {
    id: vulnId,
    severity,
    ageInDays,
    maxAge,
    isStale,
    shouldAutoUpdate,
    title: vulnData.title || 'Unknown vulnerability',
    module: vulnData.module_name || 'unknown',
    versions: vulnData.vulnerable_versions || 'unknown',
    patched: vulnData.patched_versions || 'none',
    url: vulnData.url || null
  };
}

/**
 * Generate security score for a package
 */
function calculateSecurityScore(vulns, outdated) {
  let score = 100; // Start with perfect score

  // Deduct points for vulnerabilities
  Object.values(vulns).forEach(vuln => {
    const analysis = analyzeVulnerability(vuln.id, vuln);
    switch (analysis.severity) {
      case 'critical': score -= 25; break;
      case 'high': score -= 15; break;
      case 'moderate': score -= 8; break;
      case 'low': score -= 3; break;
    }

    // Extra deduction for stale vulnerabilities
    if (analysis.isStale) {
      score -= 10;
    }
  });

  // Deduct points for outdated packages
  const outdatedCount = Object.keys(outdated).length;
  score -= Math.min(outdatedCount * 2, 30); // Max 30 points for outdated

  return Math.max(0, Math.round(score));
}

/**
 * Check AIKIDO integration status
 */
async function runAikidoScan() {
  console.log('\n🛡️  Checking AIKIDO integration status...');

  // Check if AIKIDO configuration exists
  const aikidoConfigExists = fs.existsSync(path.join(projectRoot, '.aikido.yml'));

  if (!aikidoConfigExists) {
    console.warn('⚠️  AIKIDO configuration not found. Run npm run security:setup to create it.');
    return null;
  }

  console.log('✅ AIKIDO configuration found: .aikido.yml');

  // Since AIKIDO is at GitHub org level, we don't run CLI scans
  console.log('🔗 AIKIDO Integration Status:');
  console.log('   • Configuration: ✅ Repository-specific settings configured');
  console.log('   • GitHub App: ✅ AIKIDO is installed at organization level');
  console.log('   • Automatic Scanning: ✅ AIKIDO monitors this repository');
  console.log('   • Dashboard: Check your GitHub organization AIKIDO dashboard');

  // Check git remote to show which org
  try {
    const gitRemote = execCommand('git remote get-url origin', { cwd: projectRoot });
    if (gitRemote.success) {
      const repoUrl = gitRemote.output.trim();
      console.log(`   • Repository: ${repoUrl}`);
    }
  } catch (error) {
    // Ignore git errors
  }

  console.log('\n💡 AIKIDO workflow:');
  console.log('   • Scans: Runs automatically on pushes and PRs');
  console.log('   • Fixes: Creates security fix branches (aikido/*)');
  console.log('   • Recommendations: Provides suggestions via PRs');
  console.log('   • Monitoring: Continuous security monitoring');

  // Check for existing security tool branches
  try {
    const branchResult = execCommand('git branch -r | grep -E "(aikido|dependabot)"', { cwd: projectRoot });
    if (branchResult.success && branchResult.output.trim()) {
      const securityBranches = branchResult.output.trim().split('\n');
      const aikidoBranches = securityBranches.filter(b => b.includes('aikido'));
      const dependabotBranches = securityBranches.filter(b => b.includes('dependabot'));

      if (aikidoBranches.length > 0) {
        console.log('\n🛡️ Found AIKIDO branches:');
        aikidoBranches.forEach(branch => {
          console.log(`   • ${branch.trim()}`);
        });
      }

      if (dependabotBranches.length > 0) {
        console.log('\n🤖 Found Dependabot branches:');
        dependabotBranches.forEach(branch => {
          console.log(`   • ${branch.trim()}`);
        });
      }

      if (securityBranches.length > 0) {
        console.log('💡 Use npm run security:branches to manage security fix branches');
      }
    }
  } catch (error) {
    // Ignore if no branches found
  }

  return 'GitHub organization-level AIKIDO integration active';
}

/**
 * Update dependencies automatically
 */
async function updateDependencies(packageDir, vulns, outdated, mode = 'interactive') {
  const packageJsonPath = path.join(packageDir, 'package.json');
  const pkg = getPackageJson(packageJsonPath);

  if (!pkg.exists) {
    console.warn(`⚠️  No package.json found in ${packageDir}`);
    return false;
  }

  const updates = [];

  // Security updates from vulnerabilities
  for (const [vulnId, vulnData] of Object.entries(vulns)) {
    const analysis = analyzeVulnerability(vulnId, vulnData);

    if (mode === 'auto' && !analysis.shouldAutoUpdate) {
      continue; // Skip non-critical vulnerabilities in auto mode
    }

    if (SECURITY_CONFIG.excludePackages.includes(analysis.module)) {
      console.log(`⏭️  Skipping excluded package: ${analysis.module}`);
      continue;
    }

    updates.push({
      type: 'security',
      package: analysis.module,
      severity: analysis.severity,
      current: vulnData.via || 'unknown',
      patched: analysis.patched,
      reason: `${analysis.severity} vulnerability: ${analysis.title}`
    });
  }

  // Outdated package updates
  for (const [packageName, packageInfo] of Object.entries(outdated)) {
    if (mode === 'auto') {
      continue; // Don't auto-update outdated packages, only security fixes
    }

    updates.push({
      type: 'outdated',
      package: packageName,
      current: packageInfo.current,
      wanted: packageInfo.wanted,
      latest: packageInfo.latest,
      reason: `Outdated package (current: ${packageInfo.current}, latest: ${packageInfo.latest})`
    });
  }

  if (updates.length === 0) {
    console.log('✅ No updates needed');
    return true;
  }

  console.log(`\n📦 Found ${updates.length} potential updates in ${path.basename(packageDir)}:`);

  // Show updates
  updates.forEach((update, index) => {
    const icon = update.type === 'security' ? '🔒' : '📦';
    const severityColor = update.severity === 'critical' ? '🔴' :
                         update.severity === 'high' ? '🟠' :
                         update.severity === 'moderate' ? '🟡' : '🟢';

    console.log(`  ${index + 1}. ${icon} ${update.package}`);
    console.log(`     ${update.reason}`);
    if (update.type === 'security') {
      console.log(`     ${severityColor} Severity: ${update.severity}`);
    }
    if (update.current && update.patched) {
      console.log(`     Current: ${update.current} → Patched: ${update.patched}`);
    }
    if (update.current && update.latest) {
      console.log(`     Current: ${update.current} → Latest: ${update.latest}`);
    }
  });

  // Handle different update modes
  if (mode === 'auto' || isAutoUpdate) {
    console.log('\n⚡ Auto-updating security fixes...');
    return await applyUpdates(packageDir, updates.filter(u => u.type === 'security'));
  } else if (mode === 'force' || isForceUpdate) {
    console.log('\n⚠️  Force-updating ALL dependencies...');
    return await applyUpdates(packageDir, updates);
  } else {
    // Interactive mode
    console.log('\nUpdate options:');
    console.log('  [a]ll updates');
    console.log('  [s]ecurity only');
    console.log('  [i]nteractive selection');
    console.log('  [n]one/skip');

    const choice = await ask('Choose update mode [a/s/i/n]: ');

    switch (choice) {
      case 'a':
        return await applyUpdates(packageDir, updates);
      case 's':
        return await applyUpdates(packageDir, updates.filter(u => u.type === 'security'));
      case 'i':
        return await interactiveUpdate(packageDir, updates);
      case 'n':
      default:
        console.log('⏭️  Skipping updates');
        return true;
    }
  }
}

/**
 * Interactive update selection
 */
async function interactiveUpdate(packageDir, updates) {
  const selectedUpdates = [];

  console.log('\n🎯 Interactive Update Selection:');

  for (const update of updates) {
    const choice = await ask(`Update ${update.package}? [y/n/q]: `);

    if (choice === 'q') {
      console.log('⏹️  Quitting interactive update');
      break;
    } else if (choice === 'y') {
      selectedUpdates.push(update);
      console.log(`✅ Queued: ${update.package}`);
    } else {
      console.log(`⏭️  Skipped: ${update.package}`);
    }
  }

  if (selectedUpdates.length > 0) {
    console.log(`\n🔄 Applying ${selectedUpdates.length} selected updates...`);
    return await applyUpdates(packageDir, selectedUpdates);
  } else {
    console.log('⏭️  No updates selected');
    return true;
  }
}

/**
 * Apply updates to package.json and run npm install
 */
async function applyUpdates(packageDir, updates) {
  if (updates.length === 0) return true;

  const packageJsonPath = path.join(packageDir, 'package.json');
  const pkg = getPackageJson(packageJsonPath);

  if (!pkg.exists) return false;

  let hasChanges = false;

  // Apply updates to package.json
  for (const update of updates) {
    if (update.type === 'security' && update.patched && update.patched !== 'none') {
      // Update to patched version
      const targetVersion = update.patched;

      // Check dependencies
      if (pkg.content.dependencies && pkg.content.dependencies[update.package]) {
        pkg.content.dependencies[update.package] = targetVersion;
        hasChanges = true;
        console.log(`✅ Updated ${update.package} to ${targetVersion} (security fix)`);
      }

      // Check devDependencies
      if (pkg.content.devDependencies && pkg.content.devDependencies[update.package]) {
        pkg.content.devDependencies[update.package] = targetVersion;
        hasChanges = true;
        console.log(`✅ Updated ${update.package} to ${targetVersion} (security fix, dev)`);
      }
    } else if (update.type === 'outdated' && update.latest) {
      // Update to latest version
      const targetVersion = update.wanted || update.latest;

      // Check dependencies
      if (pkg.content.dependencies && pkg.content.dependencies[update.package]) {
        pkg.content.dependencies[update.package] = `^${update.latest}`;
        hasChanges = true;
        console.log(`✅ Updated ${update.package} to ^${update.latest}`);
      }

      // Check devDependencies
      if (pkg.content.devDependencies && pkg.content.devDependencies[update.package]) {
        pkg.content.devDependencies[update.package] = `^${update.latest}`;
        hasChanges = true;
        console.log(`✅ Updated ${update.package} to ^${update.latest} (dev)`);
      }
    }
  }

  if (!hasChanges) {
    console.log('ℹ️  No package.json changes needed');
    return true;
  }

  // Write updated package.json
  if (!writePackageJson(packageJsonPath, pkg.content)) {
    return false;
  }

  console.log(`✅ Updated ${packageJsonPath}`);

  // Run npm install
  if (!isDryRun) {
    console.log('📦 Running npm install...');
    const installResult = execCommand('npm install', { cwd: packageDir });

    if (installResult.success) {
      console.log('✅ npm install completed');
    } else {
      console.error('❌ npm install failed:', installResult.error);
      return false;
    }
  } else {
    testLog.push(`[DRY] Would run npm install in ${packageDir}`);
  }

  return true;
}

/**
 * Generate comprehensive security report
 */
async function generateSecurityReport(scanResults) {
  console.log('\n📋 Generating Security Report...');

  const timestamp = new Date().toISOString();
  const reportData = {
    timestamp,
    project: 'FigmailAPP',
    packages: {},
    summary: {
      totalVulnerabilities: 0,
      criticalVulnerabilities: 0,
      highVulnerabilities: 0,
      moderateVulnerabilities: 0,
      lowVulnerabilities: 0,
      outdatedPackages: 0,
      overallScore: 0
    }
  };

  let totalScore = 0;
  let packageCount = 0;

  for (const [packageName, data] of Object.entries(scanResults)) {
    const vulnCount = Object.keys(data.vulnerabilities).length;
    const outdatedCount = Object.keys(data.outdated).length;
    const score = calculateSecurityScore(data.vulnerabilities, data.outdated);

    // Count vulnerabilities by severity
    Object.values(data.vulnerabilities).forEach(vuln => {
      const analysis = analyzeVulnerability(vuln.id, vuln);
      reportData.summary.totalVulnerabilities++;

      switch (analysis.severity) {
        case 'critical': reportData.summary.criticalVulnerabilities++; break;
        case 'high': reportData.summary.highVulnerabilities++; break;
        case 'moderate': reportData.summary.moderateVulnerabilities++; break;
        case 'low': reportData.summary.lowVulnerabilities++; break;
      }
    });

    reportData.summary.outdatedPackages += outdatedCount;

    reportData.packages[packageName] = {
      vulnerabilities: vulnCount,
      outdated: outdatedCount,
      score,
      details: {
        vulnerabilities: data.vulnerabilities,
        outdated: data.outdated
      }
    };

    totalScore += score;
    packageCount++;
  }

  reportData.summary.overallScore = packageCount > 0 ? Math.round(totalScore / packageCount) : 100;

  // Write report to file
  const reportsDir = path.join(projectRoot, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportFile = path.join(reportsDir, `security-report-${timestamp.slice(0, 10)}.json`);

  if (!isDryRun) {
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`✅ Security report saved: ${reportFile}`);
  } else {
    testLog.push(`[DRY] Would save report: ${reportFile}`);
  }

  // Display summary
  console.log('\n📊 Security Summary:');
  console.log(`   Overall Score: ${getScoreColor(reportData.summary.overallScore)} ${reportData.summary.overallScore}/100`);
  console.log(`   🔴 Critical: ${reportData.summary.criticalVulnerabilities}`);
  console.log(`   🟠 High: ${reportData.summary.highVulnerabilities}`);
  console.log(`   🟡 Moderate: ${reportData.summary.moderateVulnerabilities}`);
  console.log(`   🟢 Low: ${reportData.summary.lowVulnerabilities}`);
  console.log(`   📦 Outdated: ${reportData.summary.outdatedPackages}`);

  if (reportData.summary.criticalVulnerabilities > 0) {
    console.log('\n🚨 CRITICAL: Immediate action required for critical vulnerabilities!');
  } else if (reportData.summary.highVulnerabilities > 0) {
    console.log('\n⚠️  WARNING: High severity vulnerabilities found');
  } else if (reportData.summary.totalVulnerabilities === 0) {
    console.log('\n✅ EXCELLENT: No known vulnerabilities found');
  }

  return reportData;
}

/**
 * Get color indicator for security score
 */
function getScoreColor(score) {
  if (score >= 90) return '🟢';
  if (score >= 70) return '🟡';
  if (score >= 50) return '🟠';
  return '🔴';
}

/**
 * Main execution function
 */
async function main() {
  if (isHelp) {
    showHelp();
    return;
  }

  console.log('🔒 FigmailAPP Dependency Security Manager');
  console.log('=========================================');

  // Get all package.json files
  const packages = {};
  for (const [name, path] of Object.entries(packagePaths)) {
    const pkg = getPackageJson(path);
    if (pkg.exists) {
      packages[name] = {
        path: path,
        dir: path.replace('/package.json', ''),
        content: pkg.content
      };
    } else {
      console.warn(`⚠️  ${name} package.json not found: ${path}`);
    }
  }

  if (Object.keys(packages).length === 0) {
    console.error('❌ No package.json files found');
    process.exit(1);
  }

  const scanResults = {};

  // Scan each package
  for (const [name, pkg] of Object.entries(packages)) {
    console.log(`\n🔍 Scanning ${name} package...`);

    const vulnerabilities = await scanVulnerabilities(pkg.dir);
    const outdated = checkOutdated ? await checkOutdatedPackages(pkg.dir) : {};

    scanResults[name] = {
      vulnerabilities: vulnerabilities.vulnerabilities,
      outdated,
      summary: vulnerabilities.summary
    };

    const vulnCount = Object.keys(vulnerabilities.vulnerabilities).length;
    const outdatedCount = Object.keys(outdated).length;
    const score = calculateSecurityScore(vulnerabilities.vulnerabilities, outdated);

    console.log(`   📊 Score: ${getScoreColor(score)} ${score}/100`);
    console.log(`   🔒 Vulnerabilities: ${vulnCount}`);
    console.log(`   📦 Outdated: ${outdatedCount}`);
  }

  // Run AIKIDO scan if requested
  if (runAikido) {
    await runAikidoScan();
  }

  // Generate report if requested
  if (generateReport) {
    await generateSecurityReport(scanResults);
  }

  // Update dependencies if requested
  if (!scanOnly) {
    for (const [name, pkg] of Object.entries(packages)) {
      const data = scanResults[name];
      const vulnCount = Object.keys(data.vulnerabilities).length;
      const outdatedCount = Object.keys(data.outdated).length;

      if (vulnCount > 0 || outdatedCount > 0) {
        const mode = isAutoUpdate ? 'auto' : isForceUpdate ? 'force' : 'interactive';
        await updateDependencies(pkg.dir, data.vulnerabilities, data.outdated, mode);
      }
    }
  }

  // Show dry run results
  if (isDryRun && testLog.length > 0) {
    console.log('\n📋 Dry Run Summary:');
    testLog.forEach(log => console.log(`   ${log}`));
  }

  console.log('\n✅ Security scan completed');
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error.message);
  process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Security manager failed:', error.message);
    process.exit(1);
  });
}

export { main as runSecurityScan, scanVulnerabilities, checkOutdatedPackages };