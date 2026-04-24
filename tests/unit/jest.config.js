/**
 * Jest Configuration for Unit Tests
 * Task 1.1: Testing Framework Setup
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Root directory for tests
  roots: ['<rootDir>/tests/unit'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // File extensions Jest will look for
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      diagnostics: {
        ignoreCodes: [151001],
      },
    }],
    '^.+\\.jsx?$': 'babel-jest',
  },

  // Module name mapping
  moduleNameMapper: {
    // Path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@unit/(.*)$': '<rootDir>/tests/unit/$1',

    // Mock assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/unit/__mocks__/fileMock.js',
  },

  // Setup files
  setupFiles: [
    '<rootDir>/tests/unit/setup/env.setup.js',
  ],

  setupFilesAfterEnv: [
    '<rootDir>/tests/unit/setup/jest.setup.ts',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/index.ts',
    '!src/server.ts',
  ],

  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'cobertura',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mock calls between tests
  clearMocks: true,

  // Restore mock state between tests
  restoreMocks: true,

  // Fail on console errors
  errorOnDeprecated: true,

  // Detect open handles
  detectOpenHandles: true,

  // Force exit after all tests
  forceExit: true,

  // Workers for parallel execution
  maxWorkers: '50%',

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/.git/',
  ],

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Globals
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },

  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/reports',
        outputName: 'junit-unit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
    [
      '<rootDir>/tests/unit/utils/custom-reporter.js',
      {
        outputPath: '<rootDir>/reports/unit-test-report.json',
      },
    ],
  ],

  // Snapshot configuration
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },

  // Fail the test suite on first failure (CI mode)
  bail: process.env.CI ? 1 : 0,
};
