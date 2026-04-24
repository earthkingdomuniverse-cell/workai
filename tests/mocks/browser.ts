/**
 * MSW Browser Setup
 * Task 2.3: Mock Data Generator
 * 
 * For client-side mocking in browser
 */

import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth.handlers';
import { assessmentHandlers } from './handlers/assessment.handlers';

/**
 * Create mock worker for browser
 */
export const worker = setupWorker(
  ...authHandlers,
  ...assessmentHandlers,
);

/**
 * Start mock worker in browser
 */
export function startMockWorker(): Promise<ServiceWorkerRegistration | undefined> {
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
}

export { authHandlers, assessmentHandlers };
export default worker;
