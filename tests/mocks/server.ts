/**
 * MSW Server Setup
 * Task 2.3: Mock Data Generator
 * 
 * Configures Mock Service Worker for API mocking
 */

import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth.handlers';
import { assessmentHandlers } from './handlers/assessment.handlers';

/**
 * Create mock server with all handlers
 */
export const server = setupServer(
  ...authHandlers,
  ...assessmentHandlers,
);

/**
 * Start mock server
 */
export function startMockServer(): void {
  server.listen({
    onUnhandledRequest: 'warn',
  });
  console.log('✅ Mock server started');
}

/**
 * Stop mock server
 */
export function stopMockServer(): void {
  server.close();
  console.log('✅ Mock server stopped');
}

/**
 * Reset handlers (for test isolation)
 */
export function resetMockHandlers(): void {
  server.resetHandlers();
}

export { authHandlers, assessmentHandlers };
export default server;
