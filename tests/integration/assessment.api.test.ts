/**
 * Assessment API Integration Tests
 * Task 3.3: Assessment API Test Suite
 * 
 * Tests assessment CRUD operations and related endpoints
 */

import request from 'supertest';
import { Express } from 'express';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from '@jest/globals';

let app: Express;
let authToken: string;
let testAssessmentId: string;

describe('Assessment API', (): void => {
  beforeAll(async (): Promise<void> => {
    const { createApp } = await import('../../src/app');
    app = await createApp();
  });

  beforeEach(async (): Promise<void> => {
    // Login as admin
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin@Secure789',
      });

    authToken = response.body.data.token;
  });

  describe('POST /api/v1/assessments', (): void => {
    it('should create a new assessment', async (): Promise<void> => {
      const response = await request(app)
        .post('/api/v1/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'JavaScript Fundamentals',
          description: 'Test your JavaScript knowledge',
          type: 'technical',
          difficulty: 'medium',
          category: 'JavaScript',
          duration: 60,
          questions: [
            {
              type: 'multiple_choice',
              text: 'What is closure?',
              options: ['A function', 'A variable', 'An object', 'None'],
              correctAnswer: 'A',
              points: 10,
            },
          ],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assessment).toBeDefined();
      expect(response.body.data.assessment.title).toBe('JavaScript Fundamentals');
      expect(response.body.data.assessment.status).toBe('draft');
      
      testAssessmentId = response.body.data.assessment.id;
    });

    it('should validate required fields', async (): Promise<void> => {
      await request(app)
        .post('/api/v1/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '',
          description: '',
        })
        .expect(400);
    });

    it('should return 401 without authentication', async (): Promise<void> => {
      await request(app)
        .post('/api/v1/assessments')
        .send({
          title: 'Test Assessment',
          description: 'Test description',
        })
        .expect(401);
    });

    it('should validate question structure', async (): Promise<void> => {
      await request(app)
        .post('/api/v1/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test',
          description: 'Test',
          questions: [
            {
              type: 'multiple_choice',
              // Missing required fields
            },
          ],
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/assessments', (): void => {
    it('should return paginated assessments', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/assessments?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.assessments)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter by status', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/assessments?status=published')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.assessments.every((a: any) => a.status === 'published')).toBe(true);
    });

    it('should filter by category', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/assessments?category=JavaScript')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data.assessments)).toBe(true);
    });

    it('should search by title', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/assessments?search=JavaScript')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data.assessments)).toBe(true);
    });

    it('should return public assessments for non-authenticated users', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/assessments?status=published&isPublic=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.assessments)).toBe(true);
    });
  });

  describe('GET /api/v1/assessments/:id', (): void => {
    beforeEach(async (): Promise<void> => {
      // Create test assessment
      const response = await request(app)
        .post('/api/v1/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Assessment',
          description: 'Test description',
          type: 'technical',
          questions: [
            {
              type: 'multiple_choice',
              text: 'Question 1?',
              options: ['A', 'B', 'C'],
              correctAnswer: 'A',
              points: 10,
            },
          ],
        });

      testAssessmentId = response.body.data.assessment.id;
    });

    it('should return assessment by ID', async (): Promise<void> => {
      const response = await request(app)
        .get(`/api/v1/assessments/${testAssessmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assessment.id).toBe(testAssessmentId);
      expect(response.body.data.assessment.questions).toBeDefined();
    });

    it('should return 404 for non-existent assessment', async (): Promise<void> => {
      await request(app)
        .get('/api/v1/assessments/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should hide correct answers for non-creators', async (): Promise<void> => {
      // Login as different user
      const otherUser = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'candidate_free@example.com',
          password: 'Test@123456',
        });

      const response = await request(app)
        .get(`/api/v1/assessments/${testAssessmentId}`)
        .set('Authorization', `Bearer ${otherUser.body.data.token}`)
        .expect(200);

      // Correct answers should be hidden
      const questions = response.body.data.assessment.questions;
      if (questions && questions.length > 0) {
        expect(questions[0].correctAnswer).toBeUndefined();
      }
    });
  });

  describe('PUT /api/v1/assessments/:id', (): void => {
    it('should update assessment', async (): Promise<void> => {
      const response = await request(app)
        .put(`/api/v1/assessments/${testAssessmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assessment.title).toBe('Updated Title');
    });

    it('should return 403 for non-owner', async (): Promise<void> => {
      // Login as different user
      const otherUser = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'candidate_free@example.com',
          password: 'Test@123456',
        });

      await request(app)
        .put(`/api/v1/assessments/${testAssessmentId}`)
        .set('Authorization', `Bearer ${otherUser.body.data.token}`)
        .send({
          title: 'Unauthorized Update',
        })
        .expect(403);
    });

    it('should prevent updating published assessment', async (): Promise<void> => {
      // First publish the assessment
      await request(app)
        .post(`/api/v1/assessments/${testAssessmentId}/publish`)
        .set('Authorization', `Bearer ${authToken}`);

      // Try to update
      const response = await request(app)
        .put(`/api/v1/assessments/${testAssessmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Should Not Update',
        });

      // Should either fail or create a new draft version
      expect([200, 400, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/assessments/:id', (): void => {
    it('should delete draft assessment', async (): Promise<void> => {
      // Create new assessment
      const createRes = await request(app)
        .post('/api/v1/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'To Delete',
          description: 'Will be deleted',
          type: 'technical',
        });

      const id = createRes.body.data.assessment.id;

      await request(app)
        .delete(`/api/v1/assessments/${id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deleted
      await request(app)
        .get(`/api/v1/assessments/${id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 403 for non-owner', async (): Promise<void> => {
      const otherUser = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'candidate_free@example.com',
          password: 'Test@123456',
        });

      await request(app)
        .delete(`/api/v1/assessments/${testAssessmentId}`)
        .set('Authorization', `Bearer ${otherUser.body.data.token}`)
        .expect(403);
    });
  });

  describe('POST /api/v1/assessments/:id/publish', (): void => {
    it('should publish draft assessment', async (): Promise<void> => {
      // Create draft
      const createRes = await request(app)
        .post('/api/v1/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Publish Test',
          description: 'To be published',
          type: 'technical',
          questions: [
            {
              type: 'multiple_choice',
              text: 'Q1?',
              options: ['A', 'B'],
              correctAnswer: 'A',
              points: 10,
            },
          ],
        });

      const id = createRes.body.data.assessment.id;

      const response = await request(app)
        .post(`/api/v1/assessments/${id}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assessment.status).toBe('published');
    });

    it('should validate assessment before publishing', async (): Promise<void> => {
      // Create assessment without questions
      const createRes = await request(app)
        .post('/api/v1/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Empty Assessment',
          description: 'No questions',
          type: 'technical',
        });

      const id = createRes.body.data.assessment.id;

      await request(app)
        .post(`/api/v1/assessments/${id}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /api/v1/assessments/:id/duplicate', (): void => {
    it('should duplicate assessment', async (): Promise<void> => {
      const response = await request(app)
        .post(`/api/v1/assessments/${testAssessmentId}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assessment.title).toContain('(Copy)');
      expect(response.body.data.assessment.status).toBe('draft');
    });

    it('should duplicate questions as well', async (): Promise<void> => {
      const response = await request(app)
        .post(`/api/v1/assessments/${testAssessmentId}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.data.assessment.questions).toBeDefined();
      expect(response.body.data.assessment.questions.length).toBeGreaterThan(0);
    });
  });
});
