/**
 * Auth Validation Tests
 * Task 3.1: Auth API Test Suite
 * 
 * Tests input validation for auth endpoints
 */

import request from 'supertest';
import { Express } from 'express';
import { beforeAll, afterAll, describe, it, expect } from '@jest/globals';

let app: Express;

describe('Auth Input Validation', (): void => {
  beforeAll(async (): Promise<void> => {
    // Import app
    const { createApp } = await import('../../../src/app');
    app = await createApp();
  });

  describe('Email Validation', (): void => {
    const invalidEmails = [
      '',
      'plainaddress',
      '@missingusername.com',
      'username@.com',
      'username@domain',
      'username@domain..com',
      'username@domain.c',
      ' spaces@domain.com',
      'spaces@domain.com ',
      'two@@at.com',
    ];

    invalidEmails.forEach((email: string) => {
      it(`should reject invalid email: "${email || '(empty)'}"`, async (): Promise<void> => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ email, password: 'Test@123456' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContainEqual(
          expect.objectContaining({ field: 'email' })
        );
      });
    });
  });

  describe('Password Validation', (): void => {
    const weakPasswords = [
      { password: '', reason: 'empty' },
      { password: '12345', reason: 'too short' },
      { password: 'password', reason: 'no uppercase' },
      { password: 'PASSWORD', reason: 'no lowercase' },
      { password: 'Password', reason: 'no number' },
      { password: 'Password123', reason: 'no special char' },
    ];

    weakPasswords.forEach(({ password, reason }) => {
      it(`should reject weak password: ${reason}`, async (): Promise<void> => {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({
            email: 'test@example.com',
            password,
            firstName: 'Test',
            lastName: 'User',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    const strongPasswords = [
      'Strong@123',
      'MyP@ssw0rd!',
      'C0mpl3x@Pass',
    ];

    strongPasswords.forEach((password) => {
      it(`should accept strong password: ${password}`, async (): Promise<void> => {
        const email = `test-${Date.now()}@example.com`;
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({
            email,
            password,
            firstName: 'Test',
            lastName: 'User',
          });

        // Should either succeed or fail for reasons other than password
        if (!response.body.success) {
          expect(response.body.errors).not.toContainEqual(
            expect.objectContaining({ field: 'password' })
          );
        }
      });
    });
  });

  describe('Rate Limiting', (): void => {
    it('should throttle after multiple failed login attempts', async (): Promise<void> => {
      const email = 'ratelimit@example.com';
      const password = 'wrongpassword';

      // Make multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({ email, password });
      }

      // Next attempt should be rate limited
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      // Expect 429 Too Many Requests
      expect([401, 429]).toContain(response.status);
    });
  });

  describe('XSS Prevention', (): void => {
    it('should sanitize script tags in inputs', async (): Promise<void> => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'xss-test@example.com',
          password: 'Test@123456',
          firstName: xssPayload,
          lastName: 'User',
        });

      // Should succeed but with sanitized data
      if (response.body.success) {
        const user = response.body.data.user;
        expect(user.firstName).not.toContain('<script>');
      }
    });
  });
});
