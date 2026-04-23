import { FastifyPluginAsync } from 'fastify';
import {
  getProfile,
  upsertProfile,
  getProfileSummary,
  addSkill,
  removeSkill,
  addGoal,
  removeGoal,
  getValueProfile,
  upsertValueProfile,
  getProfileStats,
  getVerificationStatus,
} from './service';
import { successResponse, errorResponse } from '../../lib';
import { AppError } from '../../lib/errors';

const profile: FastifyPluginAsync = async (fastify) => {
  // GET /api/profile/me - Get current user's full profile summary
  fastify.get('/me', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const summary = await getProfileSummary(payload.userId);
      return successResponse(reply, summary);
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
      );
    }
  });

  // PATCH /api/profile/me - Update current user's profile
  fastify.patch('/me', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const { displayName, bio, avatarUrl, location, website, headline } = request.body as any;

      const profile = await upsertProfile(payload.userId, {
        displayName,
        bio,
        avatarUrl,
        location,
        website,
        headline,
      });

      return successResponse(reply, { profile });
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
      );
    }
  });

  // GET /api/profile/me/value - Get current user's value profile
  fastify.get('/me/value', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const valueProfile = await getValueProfile(payload.userId);
      return successResponse(reply, { valueProfile });
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
      );
    }
  });

  // POST /api/profile/me/value - Update value profile
  fastify.post('/me/value', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const updateData = request.body as any;
      const valueProfile = await upsertValueProfile(payload.userId, updateData);

      return successResponse(reply, { valueProfile });
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
      );
    }
  });

  // POST /api/profile/me/skills - Add skill
  fastify.post('/me/skills', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const skillData = request.body as any;
      const valueProfile = await addSkill(payload.userId, {
        id: `skill_${Date.now()}`,
        name: skillData.name,
        category: skillData.category,
        level: skillData.level,
        yearsOfExperience: skillData.yearsOfExperience,
      });

      return successResponse(reply, { valueProfile });
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
      );
    }
  });

  // DELETE /api/profile/me/skills/:skillId - Remove skill
  fastify.delete('/me/skills/:skillId', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const { skillId } = request.params as any;
      const valueProfile = await removeSkill(payload.userId, skillId);

      return successResponse(reply, { valueProfile });
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
      );
    }
  });

  // GET /api/profile/:id - Get public profile by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const summary = await getProfileSummary(id);
      return successResponse(reply, summary);
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
      );
    }
  });

  // GET /api/profile/:id/stats - Get profile stats
  fastify.get('/:id/stats', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const stats = await getProfileStats(id);
      return successResponse(reply, { stats });
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
      );
    }
  });

  // GET /api/profile/:id/verifications - Get verification status
  fastify.get('/:id/verifications', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const verifications = await getVerificationStatus(id);
      return successResponse(reply, { verifications });
    } catch (error) {
      const appError = error as AppError;
      return errorResponse(
        reply,
        appError.code || 'INTERNAL_ERROR',
        appError.message,
        appError.statusCode || 500,
      );
    }
  });
};

export default profile;
