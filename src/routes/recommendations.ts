import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { recommendationService } from '../services/recommendationService';

const recommendations: FastifyPluginAsync = async (fastify) => {
  // GET /api/recommendations/home
  fastify.get('/recommendations/home', async (request, reply) => {
    const { userId } = request.query as any;

    try {
      const input = {
        userId: userId || 'anonymous',
        // In a real implementation, this would come from user profile
        profile: {},
        skills: [],
        interests: [],
      };

      const result = await recommendationService.getHomeRecommendations(input);
      return reply.send(successResponse(result, 'Home recommendations retrieved successfully'));
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'RECOMMENDATION_ERROR',
          message: 'Failed to generate home recommendations',
        },
      });
    }
  });

  // GET /api/recommendations/explore
  fastify.get('/recommendations/explore', async (request, reply) => {
    const { userId } = request.query as any;

    try {
      const input = {
        userId: userId || 'anonymous',
        // In a real implementation, this would come from user profile
        profile: {},
        skills: [],
        interests: [],
      };

      const result = await recommendationService.getExploreRecommendations(input);
      return reply.send(successResponse(result, 'Explore recommendations retrieved successfully'));
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'RECOMMENDATION_ERROR',
          message: 'Failed to generate explore recommendations',
        },
      });
    }
  });
};

export default recommendations;
