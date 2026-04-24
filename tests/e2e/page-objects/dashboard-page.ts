/**
 * Dashboard Page Object
 * Task 1.5: E2E Test Directory Structure
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  // Locators
  readonly welcomeMessage: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly sidebar: Locator;
  readonly assessmentsLink: Locator;
  readonly resultsLink: Locator;
  readonly settingsLink: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    this.sidebar = page.locator('[data-testid="sidebar"]');
    this.assessmentsLink = page.locator('[data-testid="nav-assessments"]');
    this.resultsLink = page.locator('[data-testid="nav-results"]');
    this.settingsLink = page.locator('[data-testid="nav-settings"]');
  }

  /**
   * Navigate to dashboard
   */
  async goto(): Promise<void> {
    await this.navigate('/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Expect dashboard to be loaded
   */
  async expectDashboardLoaded(): Promise<void> {
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.sidebar).toBeVisible();
  }

  /**
   * Get welcome text
   */
  async getWelcomeText(): Promise<string> {
    return await this.getText(this.welcomeMessage);
  }

  /**
   * Click user menu
   */
  async openUserMenu(): Promise<void> {
    await this.click(this.userMenu);
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.click(this.logoutButton);
    await this.page.waitForURL('/login');
  }

  /**
   * Navigate to assessments
   */
  async gotoAssessments(): Promise<void> {
    await this.click(this.assessmentsLink);
    await this.page.waitForURL('**/assessments');
  }

  /**
   * Navigate to results
   */
  async gotoResults(): Promise<void> {
    await this.click(this.resultsLink);
    await this.page.waitForURL('**/results');
  }

  /**
   * Expect user name in welcome message
   */
  async expectWelcomeMessageContains(name: string): Promise<void> {
    await expect(this.welcomeMessage).toContainText(name);
  }
}
