/**
 * User Registration E2E Tests
 * Task 4.1: E2E Critical Path - User Registration Flow
 * 
 * Tests complete user registration journey
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/login-page';
import { RegisterPage } from '../../page-objects/register-page';
import { generateRandomEmail } from '../../utils/test-helpers';

test.describe('User Registration Flow', () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
  });

  test('should navigate to registration page from login', async ({ page }) => {
    await loginPage.goto();
    await loginPage.clickRegister();
    
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('should display registration form with all fields', async () => {
    await registerPage.goto();
    
    await expect(registerPage.firstNameInput).toBeVisible();
    await expect(registerPage.lastNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.termsCheckbox).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
  });

  test('should register successfully with valid data', async ({ page }) => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: generateRandomEmail(),
      password: 'Test@123456',
    };

    await registerPage.goto();
    await registerPage.fillRegistrationForm(userData);
    await registerPage.checkTermsAndConditions();
    await registerPage.clickSubmit();

    // Should redirect to dashboard or verification page
    await expect(page).toHaveURL(/\/(dashboard|verify-email)/);
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async () => {
    await registerPage.goto();
    await registerPage.clickSubmit();

    // Should show required field errors
    await expect(registerPage.getFieldError('firstName')).toBeVisible();
    await expect(registerPage.getFieldError('lastName')).toBeVisible();
    await expect(registerPage.getFieldError('email')).toBeVisible();
    await expect(registerPage.getFieldError('password')).toBeVisible();
    await expect(registerPage.getFieldError('terms')).toBeVisible();
  });

  test('should validate email format', async () => {
    await registerPage.goto();
    
    await registerPage.fillEmail('invalid-email');
    await registerPage.clickSubmit();

    await expect(registerPage.getFieldError('email')).toContainText('valid email');
  });

  test('should validate password strength', async () => {
    await registerPage.goto();
    
    // Test weak password
    await registerPage.fillPassword('weak');
    await registerPage.clickSubmit();

    await expect(registerPage.getFieldError('password')).toBeVisible();
    
    // Test password without uppercase
    await registerPage.fillPassword('password123');
    await expect(registerPage.getPasswordStrength()).toContainText('weak');
    
    // Test strong password
    await registerPage.fillPassword('Strong@123');
    await expect(registerPage.getPasswordStrength()).toContainText('strong');
  });

  test('should validate password confirmation match', async () => {
    await registerPage.goto();
    
    await registerPage.fillPassword('Test@123456');
    await registerPage.fillConfirmPassword('Different@123');
    await registerPage.clickSubmit();

    await expect(registerPage.getFieldError('confirmPassword')).toContainText('match');
  });

  test('should show error for duplicate email', async ({ page }) => {
    const existingEmail = 'candidate_free@example.com';

    await registerPage.goto();
    await registerPage.fillRegistrationForm({
      firstName: 'Test',
      lastName: 'User',
      email: existingEmail,
      password: 'Test@123456',
    });
    await registerPage.checkTermsAndConditions();
    await registerPage.clickSubmit();

    await expect(registerPage.getFormError()).toContainText('already exists');
  });

  test('should require terms acceptance', async () => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: generateRandomEmail(),
      password: 'Test@123456',
    };

    await registerPage.goto();
    await registerPage.fillRegistrationForm(userData);
    // Don't check terms
    await registerPage.clickSubmit();

    await expect(registerPage.getFieldError('terms')).toBeVisible();
  });

  test('should toggle password visibility', async () => {
    await registerPage.goto();
    
    // Password should be hidden by default
    await expect(registerPage.passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle
    await registerPage.togglePasswordVisibility();
    
    // Password should be visible
    await expect(registerPage.passwordInput).toHaveAttribute('type', 'text');
  });

  test('should navigate to login page', async ({ page }) => {
    await registerPage.goto();
    await registerPage.clickLoginLink();
    
    await expect(page).toHaveURL('/login');
  });

  test('should send verification email', async ({ page }) => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: generateRandomEmail(),
      password: 'Test@123456',
    };

    await registerPage.goto();
    await registerPage.fillRegistrationForm(userData);
    await registerPage.checkTermsAndConditions();
    await registerPage.clickSubmit();

    // Should show verification pending message
    await expect(page.locator('[data-testid="verification-pending"]')).toBeVisible();
    await expect(page.locator('[data-testid="verification-email"]')).toContainText(userData.email);
  });

  test('should resend verification email', async ({ page }) => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: generateRandomEmail(),
      password: 'Test@123456',
    };

    await registerPage.goto();
    await registerPage.fillRegistrationForm(userData);
    await registerPage.checkTermsAndConditions();
    await registerPage.clickSubmit();

    // Wait for verification page
    await expect(page.locator('[data-testid="resend-email-btn"]')).toBeVisible();
    
    // Click resend
    await page.locator('[data-testid="resend-email-btn"]').click();
    
    // Should show confirmation
    await expect(page.locator('[data-testid="resend-success"]')).toBeVisible();
  });

  test('should prevent SQL injection in registration fields', async () => {
    const maliciousData = {
      firstName: "<script>alert('xss')</script>",
      lastName: "'; DROP TABLE users; --",
      email: generateRandomEmail(),
      password: 'Test@123456',
    };

    await registerPage.goto();
    await registerPage.fillRegistrationForm(maliciousData);
    await registerPage.checkTermsAndConditions();
    
    // Should sanitize or reject malicious input
    const firstNameValue = await registerPage.firstNameInput.inputValue();
    expect(firstNameValue).not.toContain('<script>');
  });

  test('should rate limit registration attempts', async ({ page }) => {
    await registerPage.goto();
    
    // Make multiple attempts with same data
    for (let i = 0; i < 5; i++) {
      await registerPage.fillRegistrationForm({
        firstName: 'Test',
        lastName: 'User',
        email: `rate-limit-${i}@example.com`,
        password: 'Test@123456',
      });
      await registerPage.checkTermsAndConditions();
      await registerPage.clickSubmit();
      
      if (i < 4) {
        await registerPage.goto();
      }
    }

    // Should show rate limit message
    await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible();
  });

  test('should handle registration with social providers', async ({ page }) => {
    await registerPage.goto();
    
    // Click Google sign up
    await page.locator('[data-testid="google-signup"]').click();
    
    // Should redirect to Google OAuth
    await expect(page).toHaveURL(/accounts\.google\.com/);
  });
});
