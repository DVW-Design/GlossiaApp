#!/usr/bin/env node

/**
 * Interactive Aikido Security Manager
 * Provides CLI interface for managing Aikido security fixes and actions
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Console formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const icons = {
  critical: '🚨',
  high: '⚠️',
  medium: '🟡',
  low: '🟢',
  info: 'ℹ️',
  success: '✅',
  error: '❌',
  question: '❓',
  arrow: '➤',
  check: '✓',
  cross: '✗'
};

class InteractiveAikidoManager {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.pendingFixes = [];
    this.securityBranches = [];
  }

  /**
   * Main interactive dashboard
   */
  async runInteractiveDashboard() {
    console.clear();
    this.printHeader();

    try {
      await this.loadSecurityData();
      await this.showMainMenu();
    } catch (error) {
      console.error(`${icons.error} Error running dashboard:`, error.message);
    } finally {
      this.rl.close();
    }
  }

  /**
   * Print application header
   */
  printHeader() {
    console.log(`${colors.cyan}${colors.bold}`);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                🛡️  AIKIDO SECURITY MANAGER                  ║');
    console.log('║                   Interactive Dashboard                      ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`${colors.reset}\n`);
  }

  /**
   * Load security data from various sources
   */
  async loadSecurityData() {
    console.log(`${icons.info} Loading security data...\n`);

    // Load pending fixes from GitHub branches
    await this.loadSecurityBranches();

    // Load Aikido scan results if available
    await this.loadAikidoResults();

    // Load npm audit results
    await this.loadNpmAuditResults();

    console.log(`${icons.success} Security data loaded\n`);
  }

  /**
   * Load security branches (aikido/*, dependabot/*, security/*)
   */
  async loadSecurityBranches() {
    try {
      const branches = execSync('git branch -r', { encoding: 'utf8', cwd: projectRoot })
        .split('\n')
        .filter(branch => branch.includes('security/') || branch.includes('aikido/') || branch.includes('dependabot/'))
        .map(branch => branch.trim().replace('origin/', ''));

      this.securityBranches = branches.map(branch => ({
        name: branch,
        type: branch.includes('aikido/') ? 'aikido' :
              branch.includes('dependabot/') ? 'dependabot' : 'security',
        status: 'pending'
      }));

      console.log(`${icons.info} Found ${this.securityBranches.length} security branches`);
    } catch (error) {
      console.log(`${icons.error} Could not load security branches: ${error.message}`);
      this.securityBranches = [];
    }
  }

  /**
   * Load Aikido scan results
   */
  async loadAikidoResults() {
    try {
      // Check for Aikido reports in reports directory
      const reportsDir = path.join(projectRoot, 'reports');
      if (fs.existsSync(reportsDir)) {
        const files = fs.readdirSync(reportsDir)
          .filter(file => file.includes('aikido') && file.endsWith('.json'))
          .sort()
          .reverse();

        if (files.length > 0) {
          const latestReport = JSON.parse(fs.readFileSync(path.join(reportsDir, files[0]), 'utf8'));
          this.processAikidoReport(latestReport);
        }
      }
    } catch (error) {
      console.log(`${icons.error} Could not load Aikido results: ${error.message}`);
    }
  }

  /**
   * Load npm audit results
   */
  async loadNpmAuditResults() {
    try {
      const auditOutput = execSync('npm audit --json', {
        encoding: 'utf8',
        cwd: projectRoot,
        stdio: 'pipe'
      });
      const auditData = JSON.parse(auditOutput);
      this.processNpmAuditData(auditData);
    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities found
      try {
        const auditData = JSON.parse(error.stdout || '{}');
        this.processNpmAuditData(auditData);
      } catch (parseError) {
        console.log(`${icons.error} Could not parse npm audit results`);
      }
    }
  }

  /**
   * Process Aikido report data
   */
  processAikidoReport(report) {
    if (report.vulnerabilities) {
      report.vulnerabilities.forEach(vuln => {
        this.pendingFixes.push({
          type: 'aikido',
          severity: vuln.severity,
          title: vuln.title,
          package: vuln.package,
          fixAvailable: vuln.fix_available,
          source: 'aikido'
        });
      });
    }
  }

  /**
   * Process npm audit data
   */
  processNpmAuditData(auditData) {
    if (auditData.vulnerabilities) {
      Object.entries(auditData.vulnerabilities).forEach(([pkg, data]) => {
        this.pendingFixes.push({
          type: 'npm',
          severity: data.severity,
          title: data.via?.[0]?.title || 'Vulnerability in package',
          package: pkg,
          fixAvailable: data.fixAvailable,
          source: 'npm'
        });
      });
    }
  }

  /**
   * Show main menu
   */
  async showMainMenu() {
    while (true) {
      this.printSecuritySummary();
      this.printMainMenuOptions();

      const choice = await this.prompt(`${icons.question} Select option: `);

      switch (choice.toLowerCase()) {
        case '1':
        case 'v':
          await this.showVulnerabilities();
          break;
        case '2':
        case 'b':
          await this.manageBranches();
          break;
        case '3':
        case 'a':
          await this.performActions();
          break;
        case '4':
        case 's':
          await this.runSecurityScan();
          break;
        case '5':
        case 'n':
          await this.configureNotifications();
          break;
        case '6':
        case 'e':
          await this.emergencyResponse();
          break;
        case 'q':
        case 'quit':
        case 'exit':
          console.log(`${icons.success} Goodbye!`);
          return;
        case 'r':
        case 'refresh':
          await this.loadSecurityData();
          break;
        default:
          console.log(`${icons.error} Invalid option. Please try again.\n`);
      }
    }
  }

  /**
   * Print security summary
   */
  printSecuritySummary() {
    console.clear();
    this.printHeader();

    // Vulnerability summary
    const criticalCount = this.pendingFixes.filter(f => f.severity === 'critical').length;
    const highCount = this.pendingFixes.filter(f => f.severity === 'high').length;
    const mediumCount = this.pendingFixes.filter(f => f.severity === 'medium').length;
    const lowCount = this.pendingFixes.filter(f => f.severity === 'low').length;

    console.log(`${colors.bold}📊 Security Status Overview${colors.reset}`);
    console.log('─'.repeat(50));
    console.log(`${icons.critical} Critical: ${colors.red}${criticalCount}${colors.reset}`);
    console.log(`${icons.high} High:     ${colors.yellow}${highCount}${colors.reset}`);
    console.log(`${icons.medium} Medium:   ${colors.blue}${mediumCount}${colors.reset}`);
    console.log(`${icons.low} Low:      ${colors.green}${lowCount}${colors.reset}`);
    console.log(`🔧 Security Branches: ${this.securityBranches.length}\n`);

    if (criticalCount > 0) {
      console.log(`${colors.red}${icons.critical} CRITICAL VULNERABILITIES REQUIRE IMMEDIATE ATTENTION!${colors.reset}\n`);
    }
  }

  /**
   * Print main menu options
   */
  printMainMenuOptions() {
    console.log(`${colors.bold}🎯 Available Actions${colors.reset}`);
    console.log('─'.repeat(30));
    console.log(`[1/v] View Vulnerabilities`);
    console.log(`[2/b] Manage Branches`);
    console.log(`[3/a] Perform Actions`);
    console.log(`[4/s] Run Security Scan`);
    console.log(`[5/n] Configure Notifications`);
    console.log(`[6/e] Emergency Response`);
    console.log(`[r]   Refresh Data`);
    console.log(`[q]   Quit\n`);
  }

  /**
   * Show vulnerabilities detail view
   */
  async showVulnerabilities() {
    console.clear();
    console.log(`${colors.bold}🔍 Vulnerability Details${colors.reset}\n`);

    if (this.pendingFixes.length === 0) {
      console.log(`${icons.success} No vulnerabilities found!\n`);
      await this.prompt('Press Enter to continue...');
      return;
    }

    this.pendingFixes
      .sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity))
      .forEach((fix, index) => {
        const severityIcon = this.getSeverityIcon(fix.severity);
        const severityColor = this.getSeverityColor(fix.severity);

        console.log(`${index + 1}. ${severityIcon} ${severityColor}${fix.severity.toUpperCase()}${colors.reset} - ${fix.package}`);
        console.log(`   ${fix.title}`);
        console.log(`   Source: ${fix.source} | Fix Available: ${fix.fixAvailable ? '✅' : '❌'}`);
        console.log('');
      });

    const choice = await this.prompt(`${icons.question} Enter vulnerability number to act on (or 'back'): `);

    if (choice.toLowerCase() === 'back') return;

    const index = parseInt(choice) - 1;
    if (index >= 0 && index < this.pendingFixes.length) {
      await this.handleVulnerabilityAction(this.pendingFixes[index]);
    }
  }

  /**
   * Handle action on specific vulnerability
   */
  async handleVulnerabilityAction(vulnerability) {
    console.log(`\n${colors.bold}🔧 Actions for ${vulnerability.package}${colors.reset}\n`);
    console.log(`[1] Accept Fix (if available)`);
    console.log(`[2] Ignore for now`);
    console.log(`[3] Mark as false positive`);
    console.log(`[4] Get more information`);
    console.log(`[5] Create custom fix`);

    const action = await this.prompt(`${icons.question} Select action: `);

    switch (action) {
      case '1':
        await this.acceptFix(vulnerability);
        break;
      case '2':
        console.log(`${icons.info} Vulnerability ignored for this session`);
        break;
      case '3':
        console.log(`${icons.info} Marked as false positive`);
        break;
      case '4':
        await this.showVulnerabilityDetails(vulnerability);
        break;
      case '5':
        await this.createCustomFix(vulnerability);
        break;
    }
  }

  /**
   * Accept and apply fix for vulnerability
   */
  async acceptFix(vulnerability) {
    if (!vulnerability.fixAvailable) {
      console.log(`${icons.error} No automatic fix available for this vulnerability`);
      return;
    }

    console.log(`${icons.info} Applying fix for ${vulnerability.package}...`);

    try {
      if (vulnerability.source === 'npm') {
        execSync(`npm audit fix --package-lock-only`, { cwd: projectRoot });
        console.log(`${icons.success} Fix applied successfully`);
      } else if (vulnerability.source === 'aikido') {
        console.log(`${icons.info} Aikido fixes are typically applied via branch merges`);
        console.log(`${icons.info} Check security branches for available fixes`);
      }
    } catch (error) {
      console.log(`${icons.error} Fix failed: ${error.message}`);
    }

    await this.prompt('Press Enter to continue...');
  }

  /**
   * Manage security branches
   */
  async manageBranches() {
    console.clear();
    console.log(`${colors.bold}🌿 Security Branch Management${colors.reset}\n`);

    if (this.securityBranches.length === 0) {
      console.log(`${icons.info} No security branches found\n`);
      await this.prompt('Press Enter to continue...');
      return;
    }

    this.securityBranches.forEach((branch, index) => {
      const typeIcon = branch.type === 'aikido' ? '🛡️' :
                      branch.type === 'dependabot' ? '🤖' : '🔧';
      console.log(`${index + 1}. ${typeIcon} ${branch.name} (${branch.type})`);
    });

    console.log(`\n[a] Auto-merge safe branches`);
    console.log(`[m] Merge specific branch`);
    console.log(`[d] Delete merged branches`);
    console.log(`[c] Create new security branch`);

    const choice = await this.prompt(`${icons.question} Select action: `);

    switch (choice.toLowerCase()) {
      case 'a':
        await this.autoMergeSafeBranches();
        break;
      case 'm':
        await this.mergeSpecificBranch();
        break;
      case 'd':
        await this.deleteMergedBranches();
        break;
      case 'c':
        await this.createSecurityBranch();
        break;
    }
  }

  /**
   * Auto-merge safe security branches
   */
  async autoMergeSafeBranches() {
    console.log(`${icons.info} Auto-merging safe security branches...`);

    const safeBranches = this.securityBranches.filter(branch =>
      branch.type === 'dependabot' || branch.name.includes('patch')
    );

    if (safeBranches.length === 0) {
      console.log(`${icons.info} No safe branches to auto-merge`);
      return;
    }

    for (const branch of safeBranches) {
      try {
        console.log(`${icons.info} Merging ${branch.name}...`);
        execSync(`git merge origin/${branch.name}`, { cwd: projectRoot });
        console.log(`${icons.success} Merged ${branch.name}`);
      } catch (error) {
        console.log(`${icons.error} Failed to merge ${branch.name}: ${error.message}`);
      }
    }

    await this.prompt('Press Enter to continue...');
  }

  /**
   * Emergency response menu
   */
  async emergencyResponse() {
    console.clear();
    console.log(`${colors.red}${colors.bold}🚨 EMERGENCY RESPONSE${colors.reset}\n`);

    console.log(`[1] Auto-fix all critical vulnerabilities`);
    console.log(`[2] Send emergency notifications`);
    console.log(`[3] Create emergency security branch`);
    console.log(`[4] Emergency rollback`);
    console.log(`[5] Generate emergency report`);

    const choice = await this.prompt(`${icons.question} Select emergency action: `);

    switch (choice) {
      case '1':
        await this.emergencyAutoFix();
        break;
      case '2':
        await this.sendEmergencyNotifications();
        break;
      case '3':
        await this.createEmergencyBranch();
        break;
      case '4':
        await this.emergencyRollback();
        break;
      case '5':
        await this.generateEmergencyReport();
        break;
    }
  }

  /**
   * Emergency auto-fix critical vulnerabilities
   */
  async emergencyAutoFix() {
    const criticalFixes = this.pendingFixes.filter(f => f.severity === 'critical');

    if (criticalFixes.length === 0) {
      console.log(`${icons.success} No critical vulnerabilities to fix`);
      return;
    }

    console.log(`${icons.critical} Found ${criticalFixes.length} critical vulnerabilities`);
    const confirm = await this.prompt(`${icons.question} Auto-fix all? (y/N): `);

    if (confirm.toLowerCase() === 'y') {
      try {
        console.log(`${icons.info} Running emergency security update...`);
        execSync('npm run security:auto-update', { cwd: projectRoot });
        console.log(`${icons.success} Emergency fixes applied`);
      } catch (error) {
        console.log(`${icons.error} Emergency fix failed: ${error.message}`);
      }
    }

    await this.prompt('Press Enter to continue...');
  }

  /**
   * Send emergency notifications
   */
  async sendEmergencyNotifications() {
    try {
      console.log(`${icons.info} Sending emergency security notifications...`);
      execSync('node scripts/security/notification-manager.mjs send \'{"severity":"critical","title":"Emergency Security Alert","description":"Critical security vulnerabilities detected - immediate action required"}\'', { cwd: projectRoot });
      console.log(`${icons.success} Emergency notifications sent`);
    } catch (error) {
      console.log(`${icons.error} Failed to send notifications: ${error.message}`);
    }

    await this.prompt('Press Enter to continue...');
  }

  /**
   * Helper methods
   */
  getSeverityWeight(severity) {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[severity] || 0;
  }

  getSeverityIcon(severity) {
    const iconMap = { critical: icons.critical, high: icons.high, medium: icons.medium, low: icons.low };
    return iconMap[severity] || icons.info;
  }

  getSeverityColor(severity) {
    const colorMap = { critical: colors.red, high: colors.yellow, medium: colors.blue, low: colors.green };
    return colorMap[severity] || colors.reset;
  }

  /**
   * Prompt helper
   */
  prompt(question) {
    return new Promise(resolve => {
      this.rl.question(question, resolve);
    });
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new InteractiveAikidoManager();
  const command = process.argv[2];

  switch (command) {
    case 'dashboard':
    case 'interactive':
    default:
      await manager.runInteractiveDashboard();
      break;
  }
}

export default InteractiveAikidoManager;