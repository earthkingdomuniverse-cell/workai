/**
 * Assessment Page Object
 * Task 4.2: E2E Critical Path - Assessment Creation Flow
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

interface QuestionData {
  type: 'multiple_choice' | 'text' | 'code';
  text: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface AssessmentData {
  title: string;
  description: string;
  type: string;
  category: string;
  difficulty: string;
  duration: number;
  passingScore: number;
}

export class AssessmentPage extends BasePage {
  // Create assessment locators
  readonly createButton: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly typeSelect: Locator;
  readonly categorySelect: Locator;
  readonly difficultySelect: Locator;
  readonly durationInput: Locator;
  readonly passingScoreInput: Locator;
  readonly saveDraftButton: Locator;
  readonly publishButton: Locator;
  readonly addQuestionButton: Locator;
  
  // Question builder locators
  readonly questionTextInput: Locator;
  readonly questionTypeSelect: Locator;
  readonly optionInputs: Locator;
  readonly correctAnswerSelect: Locator;
  readonly pointsInput: Locator;
  readonly addOptionButton: Locator;
  readonly saveQuestionButton: Locator;
  
  // List locators
  readonly assessmentList: Locator;
  readonly assessmentItems: Locator;
  readonly searchInput: Locator;
  readonly filterStatus: Locator;

  constructor(page: Page) {
    super(page);
    // Create form
    this.createButton = page.locator('[data-testid="create-assessment-btn"]');
    this.titleInput = page.locator('[data-testid="assessment-title-input"]');
    this.descriptionInput = page.locator('[data-testid="assessment-description-input"]');
    this.typeSelect = page.locator('[data-testid="assessment-type-select"]');
    this.categorySelect = page.locator('[data-testid="assessment-category-select"]');
    this.difficultySelect = page.locator('[data-testid="assessment-difficulty-select"]');
    this.durationInput = page.locator('[data-testid="assessment-duration-input"]');
    this.passingScoreInput = page.locator('[data-testid="assessment-passing-score-input"]');
    this.saveDraftButton = page.locator('[data-testid="save-draft-btn"]');
    this.publishButton = page.locator('[data-testid="publish-btn"]');
    this.addQuestionButton = page.locator('[data-testid="add-question-btn"]');
    
    // Question builder
    this.questionTextInput = page.locator('[data-testid="question-text-input"]');
    this.questionTypeSelect = page.locator('[data-testid="question-type-select"]');
    this.optionInputs = page.locator('[data-testid^="option-input-"]');
    this.correctAnswerSelect = page.locator('[data-testid="correct-answer-select"]');
    this.pointsInput = page.locator('[data-testid="question-points-input"]');
    this.addOptionButton = page.locator('[data-testid="add-option-btn"]');
    this.saveQuestionButton = page.locator('[data-testid="save-question-btn"]');
    
    // List
    this.assessmentList = page.locator('[data-testid="assessment-list"]');
    this.assessmentItems = page.locator('[data-testid="assessment-item"]');
    this.searchInput = page.locator('[data-testid="assessment-search-input"]');
    this.filterStatus = page.locator('[data-testid="filter-status-select"]');
  }

  /**
   * Navigate to assessments page
   */
  async goto(): Promise<void> {
    await this.navigate('/assessments');
    await this.waitForPageLoad();
  }

  /**
   * Click create assessment button
   */
  async clickCreate(): Promise<void> {
    await this.click(this.createButton);
    await this.page.waitForURL('/assessments/new');
  }

  /**
   * Fill assessment basic info
   */
  async fillBasicInfo(data: AssessmentData): Promise<void> {
    await this.fill(this.titleInput, data.title);
    await this.fill(this.descriptionInput, data.description);
    await this.typeSelect.selectOption(data.type);
    await this.categorySelect.selectOption(data.category);
    await this.difficultySelect.selectOption(data.difficulty);
    await this.fill(this.durationInput, data.duration.toString());
    await this.fill(this.passingScoreInput, data.passingScore.toString());
  }

  /**
   * Add a question to assessment
   */
  async addQuestion(question: QuestionData): Promise<void> {
    await this.click(this.addQuestionButton);
    
    // Wait for question form
    await expect(this.questionTextInput).toBeVisible();
    
    // Fill question
    await this.fill(this.questionTextInput, question.text);
    await this.questionTypeSelect.selectOption(question.type);
    
    if (question.type === 'multiple_choice' && question.options) {
      // Fill options
      for (let i = 0; i < question.options.length; i++) {
        if (i >= 2) {
          await this.click(this.addOptionButton);
        }
        const optionInput = this.page.locator(`[data-testid="option-input-${i}"]`);
        await this.fill(optionInput, question.options[i]);
      }
      
      // Select correct answer
      await this.correctAnswerSelect.selectOption(question.correctAnswer || 'A');
    }
    
    await this.fill(this.pointsInput, question.points.toString());
    await this.click(this.saveQuestionButton);
    
    // Wait for question to be saved
    await expect(this.page.locator(`text=${question.text}`)).toBeVisible();
  }

  /**
   * Save as draft
   */
  async saveAsDraft(): Promise<void> {
    await this.click(this.saveDraftButton);
    await expect(this.page.locator('[data-testid="save-success"]')).toBeVisible();
  }

  /**
   * Publish assessment
   */
  async publish(): Promise<void> {
    await this.click(this.publishButton);
    
    // Confirm publish dialog
    const confirmBtn = this.page.locator('[data-testid="confirm-publish-btn"]');
    if (await confirmBtn.isVisible()) {
      await this.click(confirmBtn);
    }
    
    await expect(this.page.locator('[data-testid="publish-success"]')).toBeVisible();
  }

  /**
   * Create complete assessment with questions
   */
  async createAssessment(
    data: AssessmentData,
    questions: QuestionData[]
  ): Promise<string> {
    await this.goto();
    await this.clickCreate();
    await this.fillBasicInfo(data);
    
    for (const question of questions) {
      await this.addQuestion(question);
    }
    
    await this.saveAsDraft();
    
    // Return assessment ID from URL
    const url = this.page.url();
    const match = url.match(/\/assessments\/(\w+)/);
    return match ? match[1] : '';
  }

  /**
   * Search assessments
   */
  async search(query: string): Promise<void> {
    await this.fill(this.searchInput, query);
    await this.page.waitForTimeout(500); // Debounce
  }

  /**
   * Filter by status
   */
  async filterByStatus(status: string): Promise<void> {
    await this.filterStatus.selectOption(status);
  }

  /**
   * Get assessment count
   */
  async getAssessmentCount(): Promise<number> {
    return await this.assessmentItems.count();
  }

  /**
   * Click on assessment
   */
  async clickAssessment(title: string): Promise<void> {
    const assessment = this.page.locator(`[data-testid="assessment-item"]:has-text("${title}")`);
    await this.click(assessment);
  }

  /**
   * Delete assessment
   */
  async deleteAssessment(title: string): Promise<void> {
    const row = this.page.locator(`[data-testid="assessment-item"]:has-text("${title}")`);
    const deleteBtn = row.locator('[data-testid="delete-btn"]');
    await this.click(deleteBtn);
    
    // Confirm deletion
    const confirmBtn = this.page.locator('[data-testid="confirm-delete-btn"]');
    await this.click(confirmBtn);
  }

  /**
   * Duplicate assessment
   */
  async duplicateAssessment(title: string): Promise<void> {
    const row = this.page.locator(`[data-testid="assessment-item"]:has-text("${title}")`);
    const duplicateBtn = row.locator('[data-testid="duplicate-btn"]');
    await this.click(duplicateBtn);
  }

  /**
   * Expect assessment in list
   */
  async expectAssessmentInList(title: string): Promise<void> {
    const assessment = this.page.locator(`[data-testid="assessment-item"]:has-text("${title}")`);
    await expect(assessment).toBeVisible();
  }

  /**
   * Expect assessment status
   */
  async expectAssessmentStatus(title: string, status: string): Promise<void> {
    const row = this.page.locator(`[data-testid="assessment-item"]:has-text("${title}")`);
    const statusBadge = row.locator(`[data-testid="status-badge"]`);
    await expect(statusBadge).toContainText(status);
  }
}
