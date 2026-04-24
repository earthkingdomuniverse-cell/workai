/**
 * Test Helpers
 * Task 1.2: Unit Test Directory Structure
 */

import { jest } from '@jest/globals';

/**
 * Mock date for consistent testing
 */
export const mockDate = (date: Date | string | number): void => {
  const mockedDate = new Date(date);
  jest.spyOn(global, 'Date').mockImplementation(() => mockedDate);
};

/**
 * Restore date mocking
 */
export const restoreDate = (): void => {
  jest.restoreAllMocks();
};

/**
 * Create a mock async function
 */
export const createMockAsync = <T>(value: T, delay = 0): jest.MockedFunction<any> => {
  return jest.fn().mockImplementation(() =>
    new Promise((resolve) => setTimeout(() => resolve(value), delay))
  );
};

/**
 * Create a mock rejection
 */
export const createMockRejection = <T>(error: T): jest.MockedFunction<any> => {
  return jest.fn().mockRejectedValue(error);
};

/**
 * Wait for async operations
 */
export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Suppress console output during tests
 */
export const suppressConsole = (): void => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
};

/**
 * Restore console output
 */
export const restoreConsole = (): void => {
  jest.restoreAllMocks();
};
