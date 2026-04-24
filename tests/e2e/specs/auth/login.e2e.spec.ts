/**
 * Login E2E Tests
 * Task 1.5: E2E Test Directory Structure
 * 
 * Critical Path: User Login
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/login-page';
import { DashboardPage } from '../../page-objects/dashboard-page';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test('should display login page', async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should login successfully with valid credentials', async () => {
    await loginPage.login('candidate_free@example.com', 'Test@123456');
    await loginPage.expectLoginSuccess();
    await dashboardPage.expectDashboardLoaded();
  });

  test('should show error for invalid email', async () => {
    await loginPage.fillEmail('invalid-email');
    await loginPage.fillPassword('somepassword');
    await loginPage.clickSubmit();
    
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should show error for wrong password', async () => {
    await loginPage.login('candidate_free@example.com', 'wrongpassword');
    await loginPage.expectLoginError('Invalid credentials');
  });

  test('should show error for non-existent user', async () => {
    await loginPage.login('nonexistent@example.com', 'password123');
    await loginPage.expectLoginError('Invalid credentials');
  });

  test('should navigate to forgot password page', async () => {
    await loginPage.clickForgotPassword();
    await expect(loginPage.page).toHaveURL('/forgot-password');
  });

  test('should navigate to register page', async () => {
    await loginPage.clickRegister();
    await expect(loginPage.page).toHaveURL('/register');
  });
});
