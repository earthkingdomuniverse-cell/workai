/**
 * Global Setup for Integration Tests
 * Task 1.3: Integration Test Configuration
 * 
 * Runs once before all test suites
 */

import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load test environment
config({ path: '.env.test' });

module.exports = async (): Promise<void> => {
  console.log('🧪 Setting up integration test environment...');

  try {
    // Run database migrations
    console.log('📦 Running database migrations...');
    execSync('npm run db:migrate:test', { stdio: 'inherit' });

    // Seed test data
    console.log('🌱 Seeding test database...');
    execSync('npm run db:seed:test', { stdio: 'inherit' });

    console.log('✅ Integration test environment ready');
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    throw error;
  }
};
