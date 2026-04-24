/**
 * Jest Configuration for Integration Tests
 * Task 1.3: Integration Test Configuration
 * 
 * Tests API endpoints, database interactions, and service integration
 */

module.exports = {
  displayName: 'integration',

  // Test environment
  testEnvironment: 'node',

  // Root directory
  roots: ['<rootDir>/tests/integration'],

  // Test patterns
  testMatch: [
    '**/__tests__/**/*.integration.[jt]s?(x)',
    '**/?(*.)+(integration).[jt]s?(x)',
    '**/?(*.)+(api-test).[jt]s?(x)',
  ],

  // File extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Transform TypeScript
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },

  // Module mappings
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@integration/(.*)$': '<rootDir>/tests/integration/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },

  // Setup files
  setupFiles: ['<rootDir>/tests/integration/setup/test-env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup/test-setup.ts'],

  // Global setup/teardown for database
  globalSetup: '<rootDir>/tests/integration/setup/global-setup.ts',
  globalTeardown: '<rootDir>/tests/integration/setup/global-teardown.ts',

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    '!src/server.ts',
    '!src/index.ts',
  ],

  coverageDirectory: '<rootDir>/coverage/integration',
  coverageReporters: ['text', 'lcov', 'html', 'json'],

  // Coverage thresholds for integration tests
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Longer timeout for integration tests
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Clear mocks
  clearMocks: true,
  restoreMocks: true,

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],

  // Workers
  maxWorkers: 1, // Sequential for database tests

  // Detect open handles
  detectOpenHandles: true,

  // Force exit
  forceExit: true,

  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/reports',
      outputName: 'junit-integration.xml',
      suiteName: 'Integration Tests',
    }],
  ],

  // Globals
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
