import { FastifyPluginAsync } from 'fastify';
import { getHomeData } from './service';
import { successResponse, errorResponse } from '../../lib';
import { AppError } from '../../lib/errors';

const home: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      let userId = 'user_1'; // Default mock user

      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const { verifyAccessToken } = await import('../auth/token');
          const token = authHeader.split(' ')[1];
          const payload = await verifyAccessToken(token);
          userId = payload.userId;
        } catch (error) {
          // Use default mock user if token is invalid
        }
      }

      const homeData = await getHomeData(userId);
      return successResponse(reply, homeData);
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

  return home;
};

export default home;
