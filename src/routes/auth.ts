import { FastifyPluginAsync } from 'fastify';
import { createdResponse, successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import {
  getUserById,
  login,
  refreshToken,
  signup,
  updateOnboardingStatus,
} from '../modules/auth/service';
import { loginSchema, refreshTokenSchema, signupSchema } from '../modules/auth/schemas';
import { AppError } from '../lib/errors';

const auth: FastifyPluginAsync = async (fastify) => {
  fastify.post('/auth/signup', async (request, reply) => {
    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message || 'Invalid signup payload', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const result = await signup(parsed.data);
    return createdResponse(reply, result);
  });

  fastify.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message || 'Invalid login payload', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const result = await login(parsed.data);
    return successResponse(reply, result);
  });

  fastify.post('/auth/refresh', async (request, reply) => {
    const parsed = refreshTokenSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message || 'Invalid refresh payload', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const result = await refreshToken(parsed.data.refreshToken);
    return successResponse(reply, result);
  });

  fastify.post('/auth/logout', async (_request, reply) => {
    return successResponse(reply, { success: true, message: 'Logout successful' });
  });

  fastify.get('/auth/me', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (user.userId === 'guest_user') {
      throw new AppError('Authentication required', {
        code: 'AUTHENTICATION_ERROR',
        statusCode: 401,
      });
    }

    const authUser = await getUserById(user.userId);

    return successResponse(reply, {
      user: {
        id: authUser?.id || user.userId,
        email: authUser?.email || user.email,
        role: authUser?.role || user.role,
        onboardingCompleted: authUser?.onboardingCompleted ?? false,
        trustScore: authUser?.trustScore,
      },
    });
  });

  fastify.patch('/auth/me/onboarding', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (user.userId === 'guest_user') {
      throw new AppError('Authentication required', {
        code: 'AUTHENTICATION_ERROR',
        statusCode: 401,
      });
    }

    const { onboardingCompleted } = request.body as { onboardingCompleted?: boolean };
    if (typeof onboardingCompleted !== 'boolean') {
      throw new AppError('onboardingCompleted must be boolean', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const updatedUser = await updateOnboardingStatus(user.userId, onboardingCompleted);
    return successResponse(reply, { user: updatedUser });
  });
};

export default auth;
