/**
 * Auth Setup for E2E Tests
 * Task 1.5: E2E Test Directory Structure
 * 
 * Setup file to create authenticated state
 */

import { test as setup } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';

const authFile = 'tests/e2e/fixtures/.auth/user.json';

/**
 * Setup authenticated state for tests
 */
setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('candidate_free@example.com', 'Test@123456');
  
  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard');
  
  // Save auth state
  await page.context().storageState({ path: authFile });
});
