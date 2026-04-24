/**
 * Result API Integration Tests
 * Task 3.4: Result API Test Suite
 * 
 * Tests assessment result CRUD operations
 */

import request from 'supertest';
import { Express } from 'express';
import { beforeAll, beforeEach, describe, it, expect } from '@jest/globals';

let app: Express;
let authToken: string;
let candidateToken: string;
let testAssessmentId: string;
let testResultId: string;

describe('Result API', (): void => {
  beforeAll(async (): Promise<void> => {
    const { createApp } = await import('../../src/app');
    app = await createApp();
  });

  beforeEach(async (): Promise<void> => {
    // Login as admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin@Secure789',
      });
    authToken = adminRes.body.data.token;

    // Login as candidate
    const candidateRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'candidate_free@example.com',
        password: 'Test@123456',
      });
    candidateToken = candidateRes.body.data.token;

    // Create test assessment
    const assessmentRes = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Assessment',
        description: 'For result testing',
        type: 'technical',
        duration: 60,
        questions: [
          {
            type: 'multiple_choice',
            text: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 'B',
            points: 10,
          },
        ],
      });
    testAssessmentId = assessmentRes.body.data.assessment.id;

    // Publish assessment
    await request(app)
      .post(`/api/v1/assessments/${testAssessmentId}/publish`)
      .set('Authorization', `Bearer ${authToken}`);
  });

  describe('POST /api/v1/assessments/:id/start', (): void => {
    it('should start assessment and create result', async (): Promise<void> => {
      const response = await request(app)
        .post(`/api/v1/assessments/${testAssessmentId}/start`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBeDefined();
      expect(response.body.data.result.status).toBe('in_progress');
      expect(response.body.data.result.assessmentId).toBe(testAssessmentId);
      
      testResultId = response.body.data.result.id;
    });

    it('should not allow starting if already in progress', async (): Promise<void> => {
      // Start first time
      await request(app)
        .post(`/api/v1/assessments/${testAssessmentId}/start`)
        .set('Authorization', `Bearer ${candidateToken}`);

      // Try to start again
      const response = await request(app)
        .post(`/api/v1/assessments/${testAssessmentId}/start`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async (): Promise<void> => {
      await request(app)
        .post(`/api/v1/assessments/${testAssessmentId}/start`)
        .expect(401);
    });
  });

  describe('POST /api/v1/results/:id/answers', (): void => {
    beforeEach(async (): Promise<void> => {
      // Start assessment
      const startRes = await request(app)
        .post(`/api/v1/assessments/${testAssessmentId}/start`)
        .set('Authorization', `Bearer ${candidateToken}`);
      
      testResultId = startRes.body.data.result.id;
    });

    it('should submit answer for question', async (): Promise<void> => {
      const response = await request(app)
        .post(`/api/v1/results/${testResultId}/answers`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          questionId: 'question-1',
          selectedOption: 'B',
          timeSpent: 30,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.answer).toBeDefined();
    });

    it('should update existing answer', async (): Promise<void> => {
      // Submit first answer
      await request(app)
        .post(`/api/v1/results/${testResultId}/answers`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          questionId: 'question-1',
          selectedOption: 'A',
          timeSpent: 30,
        });

      // Update answer
      const response = await request(app)
        .post(`/api/v1/results/${testResultId}/answers`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          questionId: 'question-1',
          selectedOption: 'B',
          timeSpent: 45,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.answer.selectedOption).toBe('B');
    });

    it('should return 404 for non-existent result', async (): Promise<void> => {
      await request(app)
        .post('/api/v1/results/non-existent-id/answers')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          questionId: 'question-1',
          selectedOption: 'A',
        })
        .expect(404);
    });
  });

  describe('POST /api/v1/results/:id/submit', (): void => {
    beforeEach(async (): Promise<void> => {
      // Start and answer
      const startRes = await request(app)
        .post(`/api/v1/assessments/${testAssessmentId}/start`)
        .set('Authorization', `Bearer ${candidateToken}`);
      
      testResultId = startRes.body.data.result.id;

      await request(app)
        .post(`/api/v1/results/${testResultId}/answers`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          questionId: 'question-1',
          selectedOption: 'B',
          timeSpent: 30,
        });
    });

    it('should submit completed assessment', async (): Promise<void> => {
      const response = await request(app)
        .post(`/api/v1/results/${testResultId}/submit`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.result.status).toBe('completed');
      expect(response.body.data.result.submittedAt).toBeDefined();
    });

    it('should calculate score on submission', async (): Promise<void> => {
      const response = await request(app)
        .post(`/api/v1/results/${testResultId}/submit`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(response.body.data.result.totalScore).toBeDefined();
      expect(response.body.data.result.maxScore).toBeDefined();
      expect(response.body.data.result.percentage).toBeDefined();
    });

    it('should return 400 if already submitted', async (): Promise<void> => {
      // Submit first time
      await request(app)
        .post(`/api/v1/results/${testResultId}/submit`)
        .set('Authorization', `Bearer ${candidateToken}`);

      // Try to submit again
      const response = await request(app)
        .post(`/api/v1/results/${testResultId}/submit`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/results/:id', (): void => {
    beforeEach(async (): Promise<void> => {
      // Create completed result
      const startRes = await request(app)
        .post(`/api/v1/assessments/${testAssessmentId}/start`)
        .set('Authorization', `Bearer ${candidateToken}`);
      
      testResultId = startRes.body.data.result.id;

      await request(app)
        .post(`/api/v1/results/${testResultId}/answers`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          questionId: 'question-1',
          selectedOption: 'B',
          timeSpent: 30,
        });

      await request(app)
        .post(`/api/v1/results/${testResultId}/submit`)
        .set('Authorization', `Bearer ${candidateToken}`);
    });

    it('should return result details', async (): Promise<void> => {
      const response = await request(app)
        .get(`/api/v1/results/${testResultId}`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBeDefined();
      expect(response.body.data.result.id).toBe(testResultId);
    });

    it('should include answers for owner', async (): Promise<void> => {
      const response = await request(app)
        .get(`/api/v1/results/${testResultId}`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(response.body.data.result.answers).toBeDefined();
      expect(response.body.data.result.answers.length).toBeGreaterThan(0);
    });

    it('should return 403 for other users', async (): Promise<void> => {
      // Login as different user
      const otherUser = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'employer_basic@example.com',
          password: 'Test@123456',
        });

      await request(app)
        .get(`/api/v1/results/${testResultId}`)
        .set('Authorization', `Bearer ${otherUser.body.data.token}`)
        .expect(403);
    });
  });

  describe('GET /api/v1/results', (): void => {
    it('should return user results list', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/results')
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.results)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter by status', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/results?status=completed')
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(response.body.data.results.every((r: any) => r.status === 'completed')).toBe(true);
    });

    it('should filter by assessment', async (): Promise<void> => {
      const response = await request(app)
        .get(`/api/v1/results?assessmentId=${testAssessmentId}`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data.results)).toBe(true);
    });

    it('should allow admin to view all results', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/results?includeAll=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.results)).toBe(true);
    });
  });

  describe('GET /api/v1/results/:id/export', (): void => {
    beforeEach(async (): Promise<void> => {
      // Create and complete result
      const startRes = await request(app)
        .post(`/api/v1/assessments/${testAssessmentId}/start`)
        .set('Authorization', `Bearer ${candidateToken}`);
      
      testResultId = startRes.body.data.result.id;

      await request(app)
        .post(`/api/v1/results/${testResultId}/answers`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          questionId: 'question-1',
          selectedOption: 'B',
          timeSpent: 30,
        });

      await request(app)
        .post(`/api/v1/results/${testResultId}/submit`)
        .set('Authorization', `Bearer ${candidateToken}`);
    });

    it('should export result as PDF', async (): Promise<void> => {
      const response = await request(app)
        .get(`/api/v1/results/${testResultId}/export?format=pdf`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('should export result as CSV', async (): Promise<void> => {
      const response = await request(app)
        .get(`/api/v1/results/${testResultId}/export?format=csv`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv');
    });

    it('should return 400 for invalid format', async (): Promise<void> => {
      await request(app)
        .get(`/api/v1/results/${testResultId}/export?format=invalid`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(400);
    });
  });

  describe('GET /api/v1/results/statistics', (): void => {
    it('should return result statistics', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/results/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics).toBeDefined();
    });

    it('should filter by date range', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/results/statistics?from=2024-01-01&to=2024-12-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
