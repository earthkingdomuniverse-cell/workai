#!/usr/bin/env node
/**
 * Trust / Verification Consistency Check Script
 * Run: node qa/scripts/trust-consistency-check.js
 *
 * This script validates trust data consistency without TypeScript imports
 * by reading and analyzing the source files directly.
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${colors.reset}${msg}`),
  pass: (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`),
  fail: (msg) => console.log(`${colors.red}✗ ${colors.reset}${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`),
  section: (msg) => console.log(`\n${colors.blue}═══ ${msg} ═══${colors.reset}`),
  data: (label, value) => console.log(`  ${colors.gray}${label}:${colors.reset} ${value}`),
};

const workspaceRoot = path.resolve(__dirname, '../..');

// Results tracking
const results = {
  passed: 0,
  failed: 0,
  bugs: [],
  inconsistencies: [],
};

function addBug(id, severity, location, issue, fix) {
  results.bugs.push({ id, severity, location, issue, fix });
}

function addInconsistency(source, expected, actual, screens) {
  results.inconsistencies.push({ source, expected, actual, screens });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

log.section('MOCK DATA EXTRACTION');

// Extract mock trust profiles from src/mocks/trust.ts
const mockTrustPath = path.join(workspaceRoot, 'src/mocks/trust.ts');
let mockTrustContent = '';

try {
  mockTrustContent = fs.readFileSync(mockTrustPath, 'utf-8');
  log.pass('Loaded mock trust data');
} catch (e) {
  log.fail('Failed to load mock trust data');
  process.exit(1);
}

// Parse mock data using regex
const profileRegex = /\{\s*userId:\s*['"]([^'"]+)['"][\s\S]*?trustScore:\s*(\d+)[\s\S]*?verificationLevel:\s*['"]([^'"]+)['"][\s\S]*?completedDeals:\s*(\d+)[\s\S]*?reviewCount:\s*(\d+)[\s\S]*?disputeRatio:\s*([\d.]+)/g;

const trustProfiles = [];
let match;

while ((match = profileRegex.exec(mockTrustContent)) !== null) {
  trustProfiles.push({
    userId: match[1],
    trustScore: parseInt(match[2]),
    verificationLevel: match[3],
    completedDeals: parseInt(match[4]),
    reviewCount: parseInt(match[5]),
    disputeRatio: parseFloat(match[6]),
  });
}

// Reset regex lastIndex
profileRegex.lastIndex = 0;

log.info(`Found ${trustProfiles.length} trust profiles:`);
trustProfiles.forEach(p => {
  log.data(p.userId, `score=${p.trustScore}, level=${p.verificationLevel}, deals=${p.completedDeals}, reviews=${p.reviewCount}, disputes=${p.disputeRatio}`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

log.section('VALIDATION TESTS');

// Test 1: Trust Score Range
log.info('Test: Trust Score Range (0-100)');
let allScoresValid = true;
trustProfiles.forEach(p => {
  if (p.trustScore < 0 || p.trustScore > 100) {
    log.fail(`${p.userId}: trustScore=${p.trustScore} is out of range`);
    allScoresValid = false;
  }
});

if (allScoresValid) {
  log.pass('All trust scores within 0-100 range');
  results.passed++;
} else {
  results.failed++;
}

// Test 2: Verification Level Validity
log.info('Test: Verification Level Validity');
const validLevels = ['unverified', 'basic', 'verified', 'premium_verified'];
let allLevelsValid = true;

trustProfiles.forEach(p => {
  if (!validLevels.includes(p.verificationLevel)) {
    log.fail(`${p.userId}: invalid verificationLevel="${p.verificationLevel}"`);
    allLevelsValid = false;
  }
});

if (allLevelsValid) {
  log.pass('All verification levels valid');
  results.passed++;
} else {
  results.failed++;
}

// Test 3: Dispute Ratio Range
log.info('Test: Dispute Ratio Range (0-1)');
let allRatiosValid = true;

trustProfiles.forEach(p => {
  if (p.disputeRatio < 0 || p.disputeRatio > 1) {
    log.fail(`${p.userId}: disputeRatio=${p.disputeRatio} is out of range`);
    allRatiosValid = false;
  }
});

if (allRatiosValid) {
  log.pass('All dispute ratios within 0-1 range');
  results.passed++;
} else {
  results.failed++;
}

// Test 4: Non-negative counts
log.info('Test: Non-negative Counts');
let allCountsValid = true;

trustProfiles.forEach(p => {
  if (p.completedDeals < 0) {
    log.fail(`${p.userId}: completedDeals=${p.completedDeals} is negative`);
    allCountsValid = false;
  }
  if (p.reviewCount < 0) {
    log.fail(`${p.userId}: reviewCount=${p.reviewCount} is negative`);
    allCountsValid = false;
  }
});

if (allCountsValid) {
  log.pass('All counts are non-negative');
  results.passed++;
} else {
  results.failed++;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS-SCREEN CONSISTENCY CHECK
// ═══════════════════════════════════════════════════════════════════════════════

log.section('CROSS-SCREEN CONSISTENCY CHECK');

// Read mobile service files
const offerServicePath = path.join(workspaceRoot, 'mobile/src/services/offerService.ts');
const requestServicePath = path.join(workspaceRoot, 'mobile/src/services/requestService.ts');

let offerServiceContent = '';
let requestServiceContent = '';

try {
  offerServiceContent = fs.readFileSync(offerServicePath, 'utf-8');
  requestServiceContent = fs.readFileSync(requestServicePath, 'utf-8');
  log.pass('Loaded mobile service files');
} catch (e) {
  log.fail('Failed to load mobile service files');
}

// Extract trust data from offer service
const offerTrustRegex = /trustScore:\s*(\d+)/g;
const offerTrustScores = [];
while ((match = offerTrustRegex.exec(offerServiceContent)) !== null) {
  offerTrustScores.push(parseInt(match[1]));
}

// Extract trust data from request service
const requestTrustRegex = /trustScore:\s*(\d+)/g;
const requestTrustScores = [];
while ((match = requestTrustRegex.exec(requestServiceContent)) !== null) {
  requestTrustScores.push(parseInt(match[1]));
}

log.info('Trust Score Sources:');
log.data('Backend (trust API)', trustProfiles.map(p => `${p.userId}=${p.trustScore}`).join(', '));
log.data('Offer Service', offerTrustScores.length > 0 ? offerTrustScores.join(', ') : 'none found');
log.data('Request Service', requestTrustScores.length > 0 ? requestTrustScores.join(', ') : 'none found');

// Check for consistency
const expectedTrustScore = trustProfiles.find(p => p.userId === 'user_1')?.trustScore;
const offerTrustScore = offerTrustScores[0];
const requestTrustScore = requestTrustScores[0];

if (expectedTrustScore !== undefined) {
  if (offerTrustScore !== expectedTrustScore) {
    log.warn(`Trust Score mismatch: Offer shows ${offerTrustScore}, expected ${expectedTrustScore}`);
    addInconsistency('trustScore', expectedTrustScore, offerTrustScore, ['Offer Detail']);
  } else {
    log.pass('Offer Detail trustScore matches trust API');
  }

  if (requestTrustScore !== expectedTrustScore) {
    log.warn(`Trust Score mismatch: Request shows ${requestTrustScore}, expected ${expectedTrustScore}`);
    addInconsistency('trustScore', expectedTrustScore, requestTrustScore, ['Request Detail']);
  } else {
    log.pass('Request Detail trustScore matches trust API');
  }
}

// Check completedDeals
const offerDealsRegex = /completedDeals:\s*(\d+)/g;
const requestDealsRegex = /completedDeals:\s*(\d+)/g;

const offerDeals = [];
while ((match = offerDealsRegex.exec(offerServiceContent)) !== null) {
  offerDeals.push(parseInt(match[1]));
}

const requestDeals = [];
while ((match = requestDealsRegex.exec(requestServiceContent)) !== null) {
  requestDeals.push(parseInt(match[1]));
}

log.info('Completed Deals Sources:');
log.data('Backend (trust API)', trustProfiles.map(p => `${p.userId}=${p.completedDeals}`).join(', '));
log.data('Offer Service', offerDeals.length > 0 ? offerDeals.join(', ') : 'not found');
log.data('Request Service', requestDeals.length > 0 ? requestDeals.join(', ') : 'not found');

const expectedDeals = trustProfiles.find(p => p.userId === 'user_1')?.completedDeals;
if (expectedDeals !== undefined) {
  if (offerDeals[0] !== expectedDeals) {
    log.warn(`CompletedDeals mismatch: Offer shows ${offerDeals[0]}, expected ${expectedDeals}`);
  } else {
    log.pass('Offer Detail completedDeals matches trust API');
  }

  if (requestDeals[0] !== expectedDeals) {
    log.warn(`CompletedDeals mismatch: Request shows ${requestDeals[0]}, expected ${expectedDeals}`);
  } else {
    log.pass('Request Detail completedDeals matches trust API');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKEND VALIDATION CHECK
// ═══════════════════════════════════════════════════════════════════════════════

log.section('BACKEND VALIDATION CHECK');

const trustServicePath = path.join(workspaceRoot, 'src/services/trustService.ts');
let trustServiceContent = '';

try {
  trustServiceContent = fs.readFileSync(trustServicePath, 'utf-8');
} catch (e) {
  log.fail('Failed to load trust service');
}

// Check for validation logic
const hasTrustScoreValidation = trustServiceContent.includes('trustScore') &&
  (trustServiceContent.includes('Math.min') || trustServiceContent.includes('Math.max') ||
   trustServiceContent.includes('> 100') || trustServiceContent.includes('< 0'));

const hasDisputeRatioValidation = trustServiceContent.includes('disputeRatio') &&
  (trustServiceContent.includes('Math.min') || trustServiceContent.includes('Math.max') ||
   trustServiceContent.includes('> 1') || trustServiceContent.includes('< 0'));

if (hasTrustScoreValidation) {
  log.pass('trustScore has range validation');
} else {
  log.fail('trustScore lacks range validation');
  addBug('TRUST-001', 'MEDIUM', 'src/services/trustService.ts', 'trustScore accepts any value without 0-100 clamp', 'Add Math.min(100, Math.max(0, data.trustScore || 0))');
}

if (hasDisputeRatioValidation) {
  log.pass('disputeRatio has range validation');
} else {
  log.fail('disputeRatio lacks range validation');
  addBug('TRUST-004', 'LOW', 'src/services/trustService.ts', 'disputeRatio accepts any value without 0-1 clamp', 'Add Math.min(1, Math.max(0, data.disputeRatio || 0))');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE SCREEN ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

log.section('MOBILE SCREEN ANALYSIS');

// Check offer detail for verificationLevel display
const offerDetailPath = path.join(workspaceRoot, 'mobile/app/offers/[id].tsx');
let offerDetailContent = '';

try {
  offerDetailContent = fs.readFileSync(offerDetailPath, 'utf-8');
} catch (e) {
  log.warn('Could not read offer detail screen');
}

const hasVerificationInOffer = offerDetailContent.includes('verificationLevel') &&
  (offerDetailContent.includes('VerificationBadge') || offerDetailContent.includes('verification'));

if (hasVerificationInOffer) {
  log.pass('Offer Detail displays verificationLevel');
} else {
  log.fail('Offer Detail does NOT display verificationLevel');
  addBug('TRUST-002', 'LOW', 'mobile/app/offers/[id].tsx', 'verificationLevel not displayed in offer detail', 'Add <VerificationBadge level={offer.provider.verificationLevel} />');
}

// Check request detail for trust API usage
const requestDetailPath = path.join(workspaceRoot, 'mobile/app/requests/[id].tsx');
let requestDetailContent = '';

try {
  requestDetailContent = fs.readFileSync(requestDetailPath, 'utf-8');
} catch (e) {
  log.warn('Could not read request detail screen');
}

const usesTrustServiceInRequest = requestDetailContent.includes('trustService');

if (usesTrustServiceInRequest) {
  log.pass('Request Detail uses trustService');
} else {
  log.warn('Request Detail does NOT use trustService - uses embedded request.requester data');
  addBug('TRUST-003', 'MEDIUM', 'mobile/app/requests/[id].tsx', 'completedDeals from request.requester instead of trust API', 'Fetch trust data from trustService.getTrustProfile()');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENUM CONSISTENCY CHECK
// ═══════════════════════════════════════════════════════════════════════════════

log.section('ENUM CONSISTENCY CHECK');

const backendTypesPath = path.join(workspaceRoot, 'src/types/trust.ts');
const mobileTrustPath = path.join(workspaceRoot, 'mobile/src/services/trustService.ts');

let backendTypesContent = '';
let mobileTrustContent = '';

try {
  backendTypesContent = fs.readFileSync(backendTypesPath, 'utf-8');
  mobileTrustContent = fs.readFileSync(mobileTrustPath, 'utf-8');
} catch (e) {
  log.fail('Failed to load type files');
}

// Extract VerificationLevel enum
const backendEnumMatch = backendTypesContent.match(/VerificationLevel\s*=\s*([^;]+)/);
const mobileEnumMatch = mobileTrustContent.match(/verificationLevel:\s*([^;]+)/);

if (backendEnumMatch && mobileEnumMatch) {
  const backendEnum = backendEnumMatch[1].replace(/['"`]/g, '').replace(/\s+/g, '').split('|').sort().join(',');
  const mobileEnum = mobileEnumMatch[1].replace(/['"`]/g, '').replace(/\s+/g, '').split('|').sort().join(',');

  if (backendEnum === mobileEnum) {
    log.pass('VerificationLevel enum matches between backend and mobile');
  } else {
    log.fail('VerificationLevel enum mismatch!');
    log.data('Backend', backendEnum);
    log.data('Mobile', mobileEnum);
  }
} else {
  log.warn('Could not extract enums for comparison');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

log.section('QA SUMMARY');

console.log(`\n${colors.green}Checks Passed:${colors.reset} ${results.passed}`);
console.log(`${colors.red}Checks Failed:${colors.reset} ${results.failed}`);

if (results.bugs.length > 0) {
  console.log(`\n${colors.red}Bugs Found: ${results.bugs.length}${colors.reset}`);
  results.bugs.forEach((bug, i) => {
    console.log(`\n${colors.yellow}${i + 1}. ${bug.id} [${bug.severity}]${colors.reset}`);
    console.log(`   Location: ${bug.location}`);
    console.log(`   Issue: ${bug.issue}`);
    console.log(`   Fix: ${bug.fix}`);
  });
}

if (results.inconsistencies.length > 0) {
  console.log(`\n${colors.yellow}Inconsistencies Found: ${results.inconsistencies.length}${colors.reset}`);
  results.inconsistencies.forEach((inc, i) => {
    console.log(`\n  ${i + 1}. ${inc.source}`);
    console.log(`     Expected: ${inc.expected}, Actual: ${inc.actual}`);
    console.log(`     Screens: ${inc.screens.join(', ')}`);
  });
}

// Trust Data Matrix
log.section('TRUST DATA MATRIX');

console.log(`\n${colors.gray}┌──────────┬─────────────┬──────────────────┬────────────┬─────────────┬──────────────┐
│ User ID  │ Trust Score │ Verification     │ Completed  │ Review      │ Dispute      │
│          │             │ Level            │ Deals      │ Count       │ Ratio        │
├──────────┼─────────────┼──────────────────┼────────────┼─────────────┼──────────────┤${colors.reset}`);

trustProfiles.forEach(p => {
  const scoreColor = p.trustScore >= 80 ? colors.green : p.trustScore >= 60 ? colors.yellow : colors.red;
  console.log(
    `${colors.gray}│${colors.reset} ${p.userId.padEnd(8)} ${colors.gray}│${colors.reset} ` +
    `${scoreColor}${p.trustScore.toString().padStart(11)}${colors.reset} ${colors.gray}│${colors.reset} ` +
    `${p.verificationLevel.padStart(16)} ${colors.gray}│${colors.reset} ` +
    `${p.completedDeals.toString().padStart(10)} ${colors.gray}│${colors.reset} ` +
    `${p.reviewCount.toString().padStart(11)} ${colors.gray}│${colors.reset} ` +
    `${(p.disputeRatio * 100).toFixed(0).padStart(10)}% ${colors.gray}│${colors.reset}`
  );
});

console.log(`${colors.gray}└──────────┴─────────────┴──────────────────┴────────────┴─────────────┴──────────────┘${colors.reset}`);

// Cross-screen source matrix
log.section('CROSS-SCREEN SOURCE MATRIX');

console.log(`\n${colors.gray}┌───────────────────┬─────────────────────┬────────────────────┬─────────────────────┐
│ Field             │ Profile Screen      │ Offer Detail       │ Request Detail      │
├───────────────────┼─────────────────────┼────────────────────┼─────────────────────┤${colors.reset}`);
console.log(`${colors.gray}│${colors.reset} trustScore        ${colors.gray}│${colors.reset} /trust/me API       ${colors.gray}│${colors.reset} trust API → fallback ${colors.gray}│${colors.reset} request.requester   ${colors.gray}│${colors.reset}`);
console.log(`${colors.gray}│${colors.reset} verificationLevel ${colors.gray}│${colors.reset} /trust/me API       ${colors.gray}│${colors.reset} ${colors.red}NOT DISPLAYED${colors.reset}      ${colors.gray}│${colors.reset} N/A                 ${colors.gray}│${colors.reset}`);
console.log(`${colors.gray}│${colors.reset} completedDeals    ${colors.gray}│${colors.reset} /trust/me API       ${colors.gray}│${colors.reset} trust API → fallback ${colors.gray}│${colors.reset} request.requester   ${colors.gray}│${colors.reset}`);
console.log(`${colors.gray}└───────────────────┴─────────────────────┴────────────────────┴─────────────────────┘${colors.reset}`);

// Final status
console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
if (results.bugs.length === 0) {
  console.log(`${colors.green}  ✅ ALL CHECKS PASSED - No bugs found${colors.reset}`);
} else {
  console.log(`${colors.red}  ⚠️  ${results.bugs.length} BUG(S) FOUND - See details above${colors.reset}`);
}
console.log(`${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

// Exit with appropriate code
process.exit(results.bugs.length > 0 ? 1 : 0);
