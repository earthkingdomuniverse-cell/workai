import { FastifyPluginAsync } from 'fastify';
import { signup, login } from './service';
import { signupSchema, loginSchema } from './schemas';
import { successResponse, errorResponse } from '../../lib';
import { AppError } from '../../lib/errors';
import { UserRole } from './types';

const auth: FastifyPluginAsync = async (fastify) => {
  fastify.post('/signup', async (request, reply) => {
    try {
      const result = signupSchema.safeParse(request.body);

      if (!result.success) {
        return errorResponse(
          reply,
          'VALIDATION_ERROR',
          result.error.errors.map((e) => e.message).join(', '),
          400,
        );
      }

      const authResponse = await signup({
        email: result.data.email,
        password: result.data.password,
        role: result.data.role as UserRole,
      });

      return successResponse(reply, authResponse);
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
        appError.details,
      );
    }
  });

  fastify.post('/login', async (request, reply) => {
    try {
      const result = loginSchema.safeParse(request.body);

      if (!result.success) {
        return errorResponse(
          reply,
          'VALIDATION_ERROR',
          result.error.errors.map((e) => e.message).join(', '),
          400,
        );
      }

      const authResponse = await login(result.data);
      return successResponse(reply, authResponse);
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
        appError.details,
      );
    }
  });

  fastify.post('/refresh', async (request, reply) => {
    try {
      const { refreshToken } = await import('./service');
      const { refreshTokenSchema } = await import('./schemas');

      const result = refreshTokenSchema.safeParse(request.body);

      if (!result.success) {
        return errorResponse(
          reply,
          'VALIDATION_ERROR',
          result.error.errors.map((e) => e.message).join(', '),
          400,
        );
      }

      const authResponse = await refreshToken(result.data.refreshToken);
      return successResponse(reply, authResponse);
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
        appError.details,
      );
    }
  });

  fastify.get('/me', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const token = authHeader.split(' ')[1];
      const { verifyAccessToken } = await import('./token');
      const payload = await verifyAccessToken(token);

      const { getUserById } = await import('./service');
      const user = await getUserById(payload.userId);

      if (!user) {
        return errorResponse(reply, 'NOT_FOUND_ERROR', 'User not found', 404);
      }

      return successResponse(reply, { user });
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
        appError.details,
      );
    }
  });
};

export default auth;
