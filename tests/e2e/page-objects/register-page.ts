/**
 * Register Page Object
 * Task 4.1: E2E Critical Path - User Registration Flow
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class RegisterPage extends BasePage {
  // Locators
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly passwordToggle: Locator;
  readonly passwordStrengthIndicator: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('[data-testid="first-name-input"]');
    this.lastNameInput = page.locator('[data-testid="last-name-input"]');
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.confirmPasswordInput = page.locator('[data-testid="confirm-password-input"]');
    this.termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
    this.submitButton = page.locator('[data-testid="register-submit"]');
    this.loginLink = page.locator('[data-testid="login-link"]');
    this.passwordToggle = page.locator('[data-testid="password-toggle"]');
    this.passwordStrengthIndicator = page.locator('[data-testid="password-strength"]');
  }

  /**
   * Navigate to register page
   */
  async goto(): Promise<void> {
    await this.navigate('/register');
    await this.waitForPageLoad();
    await expect(this.page.locator('h1')).toContainText(/Create Account|Register|Sign Up/i);
  }

  /**
   * Fill first name
   */
  async fillFirstName(firstName: string): Promise<void> {
    await this.fill(this.firstNameInput, firstName);
  }

  /**
   * Fill last name
   */
  async fillLastName(lastName: string): Promise<void> {
    await this.fill(this.lastNameInput, lastName);
  }

  /**
   * Fill email
   */
  async fillEmail(email: string): Promise<void> {
    await this.fill(this.emailInput, email);
  }

  /**
   * Fill password
   */
  async fillPassword(password: string): Promise<void> {
    await this.fill(this.passwordInput, password);
  }

  /**
   * Fill confirm password
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.fill(this.confirmPasswordInput, password);
  }

  /**
   * Check terms and conditions
   */
  async checkTermsAndConditions(): Promise<void> {
    await this.click(this.termsCheckbox);
  }

  /**
   * Click submit button
   */
  async clickSubmit(): Promise<void> {
    await this.click(this.submitButton);
  }

  /**
   * Fill complete registration form
   */
  async fillRegistrationForm(data: RegistrationData): Promise<void> {
    await this.fillFirstName(data.firstName);
    await this.fillLastName(data.lastName);
    await this.fillEmail(data.email);
    await this.fillPassword(data.password);
    await this.fillConfirmPassword(data.password);
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    await this.click(this.passwordToggle);
  }

  /**
   * Click login link
   */
  async clickLoginLink(): Promise<void> {
    await this.click(this.loginLink);
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): Locator {
    return this.page.locator(`[data-testid="${fieldName}-error"]`);
  }

  /**
   * Get form error message
   */
  getFormError(): Locator {
    return this.page.locator('[data-testid="form-error"]');
  }

  /**
   * Get password strength text
   */
  async getPasswordStrength(): Promise<string> {
    return await this.getText(this.passwordStrengthIndicator);
  }

  /**
   * Expect registration success
   */
  async expectRegistrationSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/\/(dashboard|verify-email)/);
  }

  /**
   * Expect field to have error
   */
  async expectFieldError(fieldName: string, message?: string): Promise<void> {
    const error = this.getFieldError(fieldName);
    await expect(error).toBeVisible();
    if (message) {
      await expect(error).toContainText(message);
    }
  }
}
