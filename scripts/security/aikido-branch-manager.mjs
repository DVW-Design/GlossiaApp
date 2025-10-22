#!/usr/bin/env node

/**
 * Security Branch Manager
 *
 * Helps manage security fix branches from multiple tools:
 * - AIKIDO security fix branches (aikido/*)
 * - GitHub Dependabot branches (dependabot/*)
 * - Manual security updates
 */

import { execSync } from 'child_process';
import readline from 'readline';

const ask = (query) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });

/**
 * List security branches from multiple tools
 */
function listSecurityBranches() {
  console.log('🔍 Checking for security branches from all tools...\n');

  try {
    // Check for remote branches
    const remoteBranches = execSync('git branch -r', { encoding: 'utf8' });
    const securityBranches = remoteBranches
      .split('\n')
      .filter(branch =>
        branch.includes('aikido') ||
        branch.includes('dependabot') ||
        branch.includes('security') ||
        branch.includes('vulnerability')
      )
      .map(branch => branch.trim());

    // Check for local security branches
    const localBranches = execSync('git branch', { encoding: 'utf8' });
    const localSecurityBranches = localBranches
      .split('\n')
      .filter(branch =>
        branch.includes('aikido') ||
        branch.includes('dependabot') ||
        branch.includes('security') ||
        branch.includes('vulnerability')
      )
      .map(branch => branch.trim().replace('* ', ''));

    const allBranches = [...new Set([...securityBranches, ...localSecurityBranches])];

    if (allBranches.length === 0) {
      console.log('✅ No security branches found');
      console.log('💡 This means either:');
      console.log('   • No security issues detected by any tools');
      console.log('   • Security fixes have already been merged');
      console.log('   • Security tools are still analyzing the repository');
      return [];
    }

    // Categorize branches by tool
    const aikidoBranches = allBranches.filter(b => b.includes('aikido'));
    const dependabotBranches = allBranches.filter(b => b.includes('dependabot'));
    const otherSecurityBranches = allBranches.filter(b =>
      !b.includes('aikido') && !b.includes('dependabot')
    );

    console.log(`🔒 Found ${allBranches.length} security branch(es):\n`);

    if (aikidoBranches.length > 0) {
      console.log(`🛡️ AIKIDO Security Branches (${aikidoBranches.length}):`);
      aikidoBranches.forEach((branch, index) => {
        const isLocal = localSecurityBranches.includes(branch);
        const marker = isLocal ? '📍 Local' : '🌐 Remote';
        console.log(`   ${index + 1}. ${marker} ${branch}`);
      });
      console.log();
    }

    if (dependabotBranches.length > 0) {
      console.log(`🤖 Dependabot Branches (${dependabotBranches.length}):`);
      dependabotBranches.forEach((branch, index) => {
        const isLocal = localSecurityBranches.includes(branch);
        const marker = isLocal ? '📍 Local' : '🌐 Remote';
        console.log(`   ${index + 1}. ${marker} ${branch}`);
      });
      console.log();
    }

    if (otherSecurityBranches.length > 0) {
      console.log(`🔧 Other Security Branches (${otherSecurityBranches.length}):`);
      otherSecurityBranches.forEach((branch, index) => {
        const isLocal = localSecurityBranches.includes(branch);
        const marker = isLocal ? '📍 Local' : '🌐 Remote';
        console.log(`   ${index + 1}. ${marker} ${branch}`);
      });
      console.log();
    }

    return allBranches;
  } catch (error) {
    console.error('❌ Error checking branches:', error.message);
    return [];
  }
}

/**
 * Get details about an AIKIDO branch
 */
function getBranchDetails(branchName) {
  try {
    console.log(`\n📋 Details for branch: ${branchName}\n`);

    // Get commit information
    const commits = execSync(`git log --oneline ${branchName} ^main | head -5`, { encoding: 'utf8' });
    if (commits.trim()) {
      console.log('📝 Recent commits:');
      commits.trim().split('\n').forEach(commit => {
        console.log(`   • ${commit}`);
      });
    }

    // Get changed files
    const changedFiles = execSync(`git diff --name-only main...${branchName}`, { encoding: 'utf8' });
    if (changedFiles.trim()) {
      console.log('\n📁 Changed files:');
      changedFiles.trim().split('\n').forEach(file => {
        console.log(`   • ${file}`);
      });
    }

    // Get diff summary
    const diffStat = execSync(`git diff --stat main...${branchName}`, { encoding: 'utf8' });
    if (diffStat.trim()) {
      console.log('\n📊 Changes summary:');
      console.log(diffStat);
    }

  } catch (error) {
    console.error('❌ Error getting branch details:', error.message);
  }
}

/**
 * Merge AIKIDO branch
 */
async function mergeAikidoBranch(branchName) {
  console.log(`\n🔄 Preparing to merge: ${branchName}`);

  // Show current branch
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📍 Current branch: ${currentBranch}`);

  if (currentBranch !== 'main' && currentBranch !== 'develop') {
    const switchToMain = await ask('Switch to main branch first? [y/n]: ');
    if (switchToMain === 'y') {
      try {
        execSync('git checkout main', { stdio: 'inherit' });
        execSync('git pull origin main', { stdio: 'inherit' });
        console.log('✅ Switched to main and pulled latest changes');
      } catch (error) {
        console.error('❌ Error switching to main:', error.message);
        return false;
      }
    }
  }

  // Show merge preview
  console.log('\n🔍 Merge preview:');
  getBranchDetails(branchName);

  const confirmMerge = await ask('\nProceed with merge? [y/n]: ');
  if (confirmMerge !== 'y') {
    console.log('⏭️  Merge cancelled');
    return false;
  }

  try {
    // Perform merge
    execSync(`git merge ${branchName} --no-ff`, { stdio: 'inherit' });
    console.log(`✅ Successfully merged ${branchName}`);

    // Ask about branch cleanup
    const deleteBranch = await ask('Delete the merged branch? [y/n]: ');
    if (deleteBranch === 'y') {
      try {
        execSync(`git branch -d ${branchName.replace('origin/', '')}`, { stdio: 'inherit' });
        console.log(`🗑️  Deleted local branch: ${branchName}`);
      } catch (error) {
        console.log(`ℹ️  Could not delete branch (may be remote-only): ${error.message}`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Merge failed:', error.message);
    console.log('💡 You may need to resolve conflicts manually');
    return false;
  }
}

/**
 * Interactive security branch management
 */
async function manageSecurityBranches() {
  console.log('🔒 Security Branch Manager\n');

  const branches = listSecurityBranches();

  if (branches.length === 0) {
    return;
  }

  console.log('\n🎯 What would you like to do?');
  console.log('1. [v]iew details of a specific branch');
  console.log('2. [m]erge a security fix branch');
  console.log('3. [a]ll details (show info for all branches)');
  console.log('4. [q]uit');

  const action = await ask('\nChoose action [v/m/a/q]: ');

  switch (action) {
    case 'v':
      console.log('\nEnter branch number or name:');
      branches.forEach((branch, index) => {
        console.log(`${index + 1}. ${branch}`);
      });

      const branchChoice = await ask('Branch: ');
      const branchIndex = parseInt(branchChoice) - 1;

      if (branchIndex >= 0 && branchIndex < branches.length) {
        getBranchDetails(branches[branchIndex]);
      } else if (branches.includes(branchChoice)) {
        getBranchDetails(branchChoice);
      } else {
        console.log('❌ Invalid branch selection');
      }
      break;

    case 'm':
      console.log('\nSelect branch to merge:');
      branches.forEach((branch, index) => {
        console.log(`${index + 1}. ${branch}`);
      });

      const mergeChoice = await ask('Branch to merge: ');
      const mergeIndex = parseInt(mergeChoice) - 1;

      if (mergeIndex >= 0 && mergeIndex < branches.length) {
        await mergeAikidoBranch(branches[mergeIndex]);
      } else if (branches.includes(mergeChoice)) {
        await mergeAikidoBranch(mergeChoice);
      } else {
        console.log('❌ Invalid branch selection');
      }
      break;

    case 'a':
      console.log('\n📋 Detailed information for all AIKIDO branches:\n');
      for (const branch of branches) {
        console.log('='.repeat(60));
        getBranchDetails(branch);
      }
      break;

    case 'q':
    default:
      console.log('👋 Goodbye!');
      break;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await manageSecurityBranches();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { listSecurityBranches, getBranchDetails, mergeAikidoBranch };