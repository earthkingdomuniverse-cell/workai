/**
 * Test IDs Registry
 * Task 1.5: E2E Test Directory Structure
 * 
 * Central registry of data-testid attributes
 */

export const TestIds = {
  // Auth
  auth: {
    emailInput: 'email-input',
    passwordInput: 'password-input',
    submitButton: 'login-submit',
    errorMessage: 'login-error',
    forgotPasswordLink: 'forgot-password-link',
    registerLink: 'register-link',
  },

  // Navigation
  nav: {
    sidebar: 'sidebar',
    userMenu: 'user-menu',
    logoutButton: 'logout-button',
    assessments: 'nav-assessments',
    results: 'nav-results',
    settings: 'nav-settings',
  },

  // Dashboard
  dashboard: {
    welcomeMessage: 'welcome-message',
    statsCards: 'stats-cards',
    recentActivity: 'recent-activity',
  },

  // Assessments
  assessments: {
    createButton: 'create-assessment-btn',
    listContainer: 'assessments-list',
    item: 'assessment-item',
  },

  // Common
  common: {
    loadingSpinner: 'loading-spinner',
    errorBoundary: 'error-boundary',
    toastMessage: 'toast-message',
    modal: 'modal',
    confirmButton: 'confirm-btn',
    cancelButton: 'cancel-btn',
  },
} as const;

export type TestIdType = typeof TestIds;
