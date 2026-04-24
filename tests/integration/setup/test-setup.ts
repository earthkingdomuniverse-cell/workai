/**
 * Jest Setup for Integration Tests
 * Task 1.3: Integration Test Configuration
 */

import { jest, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Extend jest matchers
import '@jest/globals';

// Global test timeout
jest.setTimeout(30000);

// Mock external services
beforeAll(async () => {
  // Any global setup
});

afterAll(async () => {
  // Any global cleanup
});

beforeEach(async () => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(async () => {
  // Cleanup after each test
});
