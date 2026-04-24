/**
 * Global Teardown for Integration Tests
 * Task 1.3: Integration Test Configuration
 * 
 * Runs once after all test suites complete
 */

import { execSync } from 'child_process';

module.exports = async (): Promise<void> => {
  console.log('🧹 Cleaning up integration test environment...');

  try {
    // Clean up test database
    console.log('🗑️  Cleaning test database...');
    execSync('npm run db:reset:test', { stdio: 'inherit' });

    console.log('✅ Integration test environment cleaned up');
  } catch (error) {
    console.error('⚠️  Warning: Cleanup error (non-fatal):', error);
  }
};
