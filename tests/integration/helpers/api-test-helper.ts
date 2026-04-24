/**
 * API Test Helper
 * Task 1.3: Integration Test Configuration
 * 
 * Helper functions for API integration testing
 */

import request from 'supertest';
import { Express } from 'express';

interface TestUser {
  email: string;
  password: string;
  token?: string;
}

interface ApiResponse {
  status: number;
  body: any;
  headers: Record<string, string>;
}

/**
 * Create authenticated request
 */
export const createAuthenticatedRequest = (
  app: Express,
  token: string
): request.SuperTest<request.Test> => {
  return request(app)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');
};

/**
 * Login helper
 */
export const loginUser = async (
  app: Express,
  credentials: TestUser
): Promise<string> => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send(credentials);

  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.body.message}`);
  }

  return response.body.data.token;
};

/**
 * Create test user and login
 */
export const createAndLoginUser = async (
  app: Express,
  userData: Partial<TestUser> = {}
): Promise<{ user: any; token: string }> => {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test@123456',
    firstName: 'Test',
    lastName: 'User',
  };

  const userPayload = { ...defaultUser, ...userData };

  // Register user
  const registerResponse = await request(app)
    .post('/api/v1/auth/register')
    .send(userPayload);

  if (registerResponse.status !== 201) {
    throw new Error(`Registration failed: ${registerResponse.body.message}`);
  }

  // Login
  const token = await loginUser(app, {
    email: userPayload.email,
    password: userPayload.password,
  });

  return {
    user: registerResponse.body.data,
    token,
  };
};

/**
 * Clear test data
 */
export const clearTestData = async (): Promise<void> => {
  // Implementation depends on your database setup
  // Typically uses a direct database connection to clean up
};

/**
 * Expect standard API response structure
 */
export const expectApiResponse = (
  response: ApiResponse,
  expectedStatus: number
): void => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success');
  expect(response.body).toHaveProperty('data');
};

/**
 * Generate random test data
 */
export const generateRandomEmail = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `test-${timestamp}-${random}@example.com`;
};
