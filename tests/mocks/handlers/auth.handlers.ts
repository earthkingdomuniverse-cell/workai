/**
 * Auth API Handlers (MSW)
 * Task 2.3: Mock Data Generator
 * 
 * Mock handlers for authentication endpoints
 */

import { http, HttpResponse } from 'msw';
import { generateMockUser, generateMockApiResponse, generateMockApiError } from '../generate-mock-data';

const API_BASE = 'http://localhost:3000/api/v1';

export const authHandlers = [
  // Login
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    if (!body.email || !body.password) {
      return HttpResponse.json(
        generateMockApiError('Email and password are required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return HttpResponse.json(
        generateMockApiError('Invalid credentials', 'AUTH_ERROR'),
        { status: 401 }
      );
    }

    const user = generateMockUser({ email: body.email });

    return HttpResponse.json(
      generateMockApiResponse({
        user,
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresIn: 3600,
      }),
      { status: 200 }
    );
  }),

  // Register
  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string; firstName: string; lastName: string };

    if (!body.email || !body.password) {
      return HttpResponse.json(
        generateMockApiError('All fields are required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const user = generateMockUser({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
    });

    return HttpResponse.json(
      generateMockApiResponse({
        user,
        token: 'mock-jwt-token-' + Date.now(),
      }),
      { status: 201 }
    );
  }),

  // Refresh Token
  http.post(`${API_BASE}/auth/refresh`, async ({ request }) => {
    const body = await request.json() as { refreshToken: string };

    if (!body.refreshToken) {
      return HttpResponse.json(
        generateMockApiError('Refresh token required', 'AUTH_ERROR'),
        { status: 401 }
      );
    }

    return HttpResponse.json(
      generateMockApiResponse({
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresIn: 3600,
      }),
      { status: 200 }
    );
  }),

  // Logout
  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json(
      generateMockApiResponse({ message: 'Logged out successfully' }),
      { status: 200 }
    );
  }),

  // Me
  http.get(`${API_BASE}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        generateMockApiError('Unauthorized', 'AUTH_ERROR'),
        { status: 401 }
      );
    }

    const user = generateMockUser({
      email: 'user@example.com',
      role: 'candidate',
    });

    return HttpResponse.json(
      generateMockApiResponse({ user }),
      { status: 200 }
    );
  }),

  // Forgot Password
  http.post(`${API_BASE}/auth/forgot-password`, async () => {
    return HttpResponse.json(
      generateMockApiResponse({
        message: 'Password reset email sent',
      }),
      { status: 200 }
    );
  }),

  // Reset Password
  http.post(`${API_BASE}/auth/reset-password`, async ({ request }) => {
    const body = await request.json() as { token: string; password: string };

    if (!body.token || !body.password) {
      return HttpResponse.json(
        generateMockApiError('Token and password required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    return HttpResponse.json(
      generateMockApiResponse({
        message: 'Password reset successfully',
      }),
      { status: 200 }
    );
  }),
];

export default authHandlers;
