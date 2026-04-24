/**
 * E2E Test Helpers
 * Task 4.1: E2E Critical Path Tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Generate random email for testing
 */
export function generateRandomEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Generate random password
 */
export function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  // Ensure at least one of each required type
  password += 'A'; // uppercase
  password += 'a'; // lowercase
  password += '1'; // number
  password += '@'; // special
  // Fill remaining
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Clear cookies and local storage
 */
export async function clearBrowserData(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  url: string,
  response: object,
  status = 200
): Promise<void> {
  await page.route(url, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Wait for element to have text
 */
export async function waitForText(
  page: Page,
  selector: string,
  text: string,
  timeout = 5000
): Promise<void> {
  await expect(page.locator(selector)).toContainText(text, { timeout });
}

/**
 * Take screenshot on failure
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `./test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Fill form fields from object
 */
export async function fillForm(page: Page, data: Record<string, string>): Promise<void> {
  for (const [field, value] of Object.entries(data)) {
    const input = page.locator(`[data-testid="${field}-input"]`);
    await input.fill(value);
  }
}

/**
 * Get validation errors from form
 */
export async function getValidationErrors(page: Page): Promise<string[]> {
  const errors = page.locator('[data-testid*="error"]');
  const count = await errors.count();
  const messages: string[] = [];
  
  for (let i = 0; i < count; i++) {
    messages.push(await errors.nth(i).textContent() || '');
  }
  
  return messages;
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).count() > 0;
}

/**
 * Wait for toast notification
 */
export async function waitForToast(
  page: Page,
  message?: string,
  timeout = 5000
): Promise<void> {
  const toast = page.locator('[data-testid="toast-message"]');
  await expect(toast).toBeVisible({ timeout });
  if (message) {
    await expect(toast).toContainText(message);
  }
}

/**
 * Dismiss toast notification
 */
export async function dismissToast(page: Page): Promise<void> {
  const closeBtn = page.locator('[data-testid="toast-close"]');
  if (await elementExists(page, '[data-testid="toast-close"]')) {
    await closeBtn.click();
  }
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Get table data
 */
export async function getTableData(page: Page, tableSelector: string): Promise<string[][]> {
  const rows = await page.locator(`${tableSelector} tbody tr`).all();
  const data: string[][] = [];
  
  for (const row of rows) {
    const cells = await row.locator('td').allTextContents();
    data.push(cells);
  }
  
  return data;
}

/**
 * Select dropdown option
 */
export async function selectOption(
  page: Page,
  selector: string,
  option: string
): Promise<void> {
  await page.locator(selector).selectOption(option);
}

/**
 * Upload file
 */
export async function uploadFile(
  page: Page,
  selector: string,
  filePath: string
): Promise<void> {
  await page.locator(selector).setInputFiles(filePath);
}

/**
 * Drag and drop
 */
export async function dragAndDrop(
  page: Page,
  sourceSelector: string,
  targetSelector: string
): Promise<void> {
  const source = page.locator(sourceSelector);
  const target = page.locator(targetSelector);
  await source.dragTo(target);
}

/**
 * Press key combination
 */
export async function pressKeyCombo(page: Page, keys: string[]): Promise<void> {
  await page.keyboard.press(keys.join('+'));
}

/**
 * Wait for download
 */
export async function waitForDownload(
  page: Page,
  triggerFn: () => Promise<void>
): Promise<string> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    triggerFn(),
  ]);
  
  return download.suggestedFilename();
}

/**
 * Verify URL contains path
 */
export async function expectUrlContains(page: Page, path: string): Promise<void> {
  await expect(page).toHaveURL(new RegExp(path));
}

/**
 * Test user credentials
 */
export const TEST_CREDENTIALS = {
  candidate: {
    email: 'candidate_free@example.com',
    password: 'Test@123456',
  },
  candidatePremium: {
    email: 'candidate_premium@example.com',
    password: 'Test@123456',
  },
  employer: {
    email: 'employer_basic@example.com',
    password: 'Test@123456',
  },
  admin: {
    email: 'admin@example.com',
    password: 'Admin@Secure789',
  },
} as const;

/**
 * Login as specific user type
 */
export async function loginAs(
  page: Page,
  userType: keyof typeof TEST_CREDENTIALS
): Promise<void> {
  const credentials = TEST_CREDENTIALS[userType];
  
  await page.goto('/login');
  await page.locator('[data-testid="email-input"]').fill(credentials.email);
  await page.locator('[data-testid="password-input"]').fill(credentials.password);
  await page.locator('[data-testid="login-submit"]').click();
  
  await expect(page).toHaveURL('/dashboard');
}
