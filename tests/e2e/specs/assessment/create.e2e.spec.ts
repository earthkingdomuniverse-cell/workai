/**
 * Assessment Creation E2E Tests
 * Task 4.2: E2E Critical Path - Assessment Creation Flow
 * 
 * Tests complete assessment creation journey
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/login-page';
import { AssessmentPage } from '../../page-objects/assessment-page';
import { generateRandomString } from '../../utils/test-helpers';

test.describe('Assessment Creation Flow', () => {
  let loginPage: LoginPage;
  let assessmentPage: AssessmentPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    assessmentPage = new AssessmentPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login('admin@example.com', 'Admin@Secure789');
    await loginPage.expectLoginSuccess();
  });

  test('should navigate to assessment creation', async ({ page }) => {
    await assessmentPage.goto();
    await assessmentPage.clickCreate();
    
    await expect(page).toHaveURL('/assessments/new');
    await expect(page.locator('h1')).toContainText('Create Assessment');
  });

  test('should display assessment creation form', async () => {
    await assessmentPage.goto();
    await assessmentPage.clickCreate();
    
    await expect(assessmentPage.titleInput).toBeVisible();
    await expect(assessmentPage.descriptionInput).toBeVisible();
    await expect(assessmentPage.typeSelect).toBeVisible();
    await expect(assessmentPage.categorySelect).toBeVisible();
    await expect(assessmentPage.difficultySelect).toBeVisible();
    await expect(assessmentPage.durationInput).toBeVisible();
    await expect(assessmentPage.addQuestionButton).toBeVisible();
  });

  test('should create assessment with basic info', async ({ page }) => {
    const assessmentData = {
      title: `Test Assessment ${generateRandomString(5)}`,
      description: 'This is a test assessment description',
      type: 'technical',
      category: 'JavaScript',
      difficulty: 'medium',
      duration: 60,
      passingScore: 70,
    };

    await assessmentPage.goto();
    await assessmentPage.clickCreate();
    await assessmentPage.fillBasicInfo(assessmentData);
    await assessmentPage.saveAsDraft();
    
    // Should save successfully
    await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
    
    // Assessment should appear in list
    await assessmentPage.goto();
    await assessmentPage.expectAssessmentInList(assessmentData.title);
    await assessmentPage.expectAssessmentStatus(assessmentData.title, 'Draft');
  });

  test('should add multiple choice question', async () => {
    const question = {
      type: 'multiple_choice' as const,
      text: 'What is the output of console.log(typeof [])?',
      options: ['array', 'object', 'undefined', 'null'],
      correctAnswer: 'B',
      points: 10,
    };

    await assessmentPage.goto();
    await assessmentPage.clickCreate();
    await assessmentPage.fillBasicInfo({
      title: `Assessment with Question ${generateRandomString(5)}`,
      description: 'Test',
      type: 'technical',
      category: 'JavaScript',
      difficulty: 'easy',
      duration: 30,
      passingScore: 70,
    });
    
    await assessmentPage.addQuestion(question);
    
    // Question should be visible
    await expect(page.locator(`text=${question.text}`)).toBeVisible();
  });

  test('should add text question', async () => {
    const question = {
      type: 'text' as const,
      text: 'Explain the concept of closures in JavaScript.',
      points: 20,
    };

    await assessmentPage.goto();
    await assessmentPage.clickCreate();
    await assessmentPage.fillBasicInfo({
      title: `Assessment with Text Question ${generateRandomString(5)}`,
      description: 'Test',
      type: 'technical',
      category: 'JavaScript',
      difficulty: 'hard',
      duration: 60,
      passingScore: 70,
    });
    
    await assessmentPage.addQuestion(question);
    
    await expect(page.locator(`text=${question.text}`)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await assessmentPage.goto();
    await assessmentPage.clickCreate();
    
    // Try to save without filling required fields
    await assessmentPage.saveAsDraft();
    
    // Should show validation errors
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="description-error"]')).toBeVisible();
  });

  test('should validate minimum questions before publish', async ({ page }) => {
    await assessmentPage.goto();
    await assessmentPage.clickCreate();
    await assessmentPage.fillBasicInfo({
      title: `Empty Assessment ${generateRandomString(5)}`,
      description: 'Test',
      type: 'technical',
      category: 'JavaScript',
      difficulty: 'easy',
      duration: 30,
      passingScore: 70,
    });
    
    // Try to publish without questions
    await assessmentPage.publish();
    
    // Should show error
    await expect(page.locator('[data-testid="publish-error"]')).toContainText('at least one question');
  });

  test('should publish assessment with questions', async ({ page }) => {
    const title = `Publish Test ${generateRandomString(5)}`;
    
    await assessmentPage.createAssessment(
      {
        title,
        description: 'Test assessment for publishing',
        type: 'technical',
        category: 'JavaScript',
        difficulty: 'medium',
        duration: 45,
        passingScore: 70,
      },
      [
        {
          type: 'multiple_choice',
          text: 'What is 2+2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 'B',
          points: 10,
        },
        {
          type: 'text',
          text: 'Explain event loop.',
          points: 20,
        },
      ]
    );
    
    // Publish
    await assessmentPage.publish();
    
    // Should show success
    await expect(page.locator('[data-testid="publish-success"]')).toBeVisible();
    
    // Status should be published
    await assessmentPage.goto();
    await assessmentPage.expectAssessmentStatus(title, 'Published');
  });

  test('should duplicate assessment', async ({ page }) => {
    const originalTitle = `Original ${generateRandomString(5)}`;
    
    // Create original
    await assessmentPage.createAssessment(
      {
        title: originalTitle,
        description: 'Original',
        type: 'technical',
        category: 'JavaScript',
        difficulty: 'easy',
        duration: 30,
        passingScore: 70,
      },
      [
        {
          type: 'multiple_choice',
          text: 'Test question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
          points: 10,
        },
      ]
    );
    
    // Duplicate
    await assessmentPage.duplicateAssessment(originalTitle);
    
    // Should show duplicated assessment
    await expect(page.locator(`text=${originalTitle} (Copy)`)).toBeVisible();
  });

  test('should delete draft assessment', async ({ page }) => {
    const title = `To Delete ${generateRandomString(5)}`;
    
    // Create and save
    await assessmentPage.goto();
    await assessmentPage.clickCreate();
    await assessmentPage.fillBasicInfo({
      title,
      description: 'Will be deleted',
      type: 'technical',
      category: 'JavaScript',
      difficulty: 'easy',
      duration: 30,
      passingScore: 70,
    });
    await assessmentPage.saveAsDraft();
    
    // Delete
    await assessmentPage.deleteAssessment(title);
    
    // Should not be in list
    await assessmentPage.goto();
    await assessmentPage.search(title);
    await expect(page.locator(`text=${title}`)).not.toBeVisible();
  });

  test('should search assessments', async () => {
    const title = `Search Test ${generateRandomString(5)}`;
    
    // Create assessment
    await assessmentPage.createAssessment(
      {
        title,
        description: 'Test',
        type: 'technical',
        category: 'JavaScript',
        difficulty: 'easy',
        duration: 30,
        passingScore: 70,
      },
      []
    );
    
    // Search
    await assessmentPage.goto();
    await assessmentPage.search(title);
    
    // Should find the assessment
    await assessmentPage.expectAssessmentInList(title);
  });

  test('should filter by status', async ({ page }) => {
    await assessmentPage.goto();
    await assessmentPage.filterByStatus('published');
    
    // All visible assessments should be published
    const assessments = await assessmentPage.assessmentItems.all();
    for (const assessment of assessments) {
      const status = await assessment.locator('[data-testid="status-badge"]').textContent();
      expect(status).toContain('Published');
    }
  });

  test('should prevent XSS in assessment fields', async ({ page }) => {
    const xssPayload = '<script>alert("xss")</script>';
    
    await assessmentPage.goto();
    await assessmentPage.clickCreate();
    await assessmentPage.fillBasicInfo({
      title: `XSS Test ${generateRandomString(5)}`,
      description: xssPayload,
      type: 'technical',
      category: 'JavaScript',
      difficulty: 'easy',
      duration: 30,
      passingScore: 70,
    });
    
    await assessmentPage.saveAsDraft();
    
    // XSS should be sanitized
    await expect(page.locator('script')).not.toBeVisible();
  });

  test('should handle unsaved changes warning', async ({ page }) => {
    await assessmentPage.goto();
    await assessmentPage.clickCreate();
    await assessmentPage.titleInput.fill('Unsaved Changes');
    
    // Try to navigate away
    await page.goto('/dashboard');
    
    // Should show confirmation dialog
    await expect(page.locator('[data-testid="unsaved-changes-dialog"]')).toBeVisible();
  });

  test('should auto-save draft periodically', async ({ page }) => {
    await assessmentPage.goto();
    await assessmentPage.clickCreate();
    await assessmentPage.titleInput.fill('Auto Save Test');
    
    // Wait for auto-save
    await page.waitForTimeout(6000);
    
    // Should show auto-save indicator
    await expect(page.locator('[data-testid="auto-saved-indicator"]')).toBeVisible();
  });
});
