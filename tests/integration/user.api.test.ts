/**
 * User API Integration Tests
 * Task 3.2: User API Test Suite
 * 
 * Tests user management endpoints
 */

import request from 'supertest';
import { Express } from 'express';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from '@jest/globals';

let app: Express;
let authToken: string;
let testUserId: string;

describe('User API', (): void => {
  beforeAll(async (): Promise<void> => {
    const { createApp } = await import('../../src/app');
    app = await createApp();
  });

  beforeEach(async (): Promise<void> => {
    // Login to get token
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin@Secure789',
      });

    authToken = response.body.data.token;
    testUserId = response.body.data.user.id;
  });

  describe('GET /api/v1/users/me', (): void => {
    it('should return current user profile', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(testUserId);
      expect(response.body.data.user.email).toBeDefined();
    });

    it('should return 401 without token', async (): Promise<void> => {
      await request(app)
        .get('/api/v1/users/me')
        .expect(401);
    });
  });

  describe('PUT /api/v1/users/me', (): void => {
    it('should update user profile', async (): Promise<void> => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.user.lastName).toBe('Name');
    });

    it('should validate email format', async (): Promise<void> => {
      await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 409 for duplicate email', async (): Promise<void> => {
      await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'existing@example.com',
        })
        .expect(409);
    });
  });

  describe('PUT /api/v1/users/me/password', (): void => {
    it('should change password with correct current password', async (): Promise<void> => {
      const response = await request(app)
        .put('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'Admin@Secure789',
          newPassword: 'NewSecure@123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject wrong current password', async (): Promise<void> => {
      await request(app)
        .put('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewSecure@123',
        })
        .expect(401);
    });

    it('should validate new password strength', async (): Promise<void> => {
      await request(app)
        .put('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'Admin@Secure789',
          newPassword: 'weak',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/users/:id', (): void => {
    it('should return user by ID', async (): Promise<void> => {
      const response = await request(app)
        .get(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(testUserId);
    });

    it('should return 404 for non-existent user', async (): Promise<void> => {
      await request(app)
        .get('/api/v1/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', async (): Promise<void> => {
      await request(app)
        .get(`/api/v1/users/${testUserId}`)
        .expect(401);
    });
  });

  describe('GET /api/v1/users', (): void => {
    it('should return paginated user list', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.users)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter by role', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/users?role=admin')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.users.every((u: any) => u.role === 'admin')).toBe(true);
    });

    it('should search by name or email', async (): Promise<void> => {
      const response = await request(app)
        .get('/api/v1/users?search=admin')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data.users)).toBe(true);
    });
  });

  describe('DELETE /api/v1/users/me', (): void => {
    it('should delete current user', async (): Promise<void> => {
      const response = await request(app)
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'Admin@Secure789',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should require password confirmation', async (): Promise<void> => {
      await request(app)
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it('should reject wrong password', async (): Promise<void> => {
      await request(app)
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
