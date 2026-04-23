import { FastifyPluginAsync } from 'fastify';
import { getExploreData, ExploreFilters } from './service';
import { successResponse, errorResponse } from '../../lib';
import { AppError } from '../../lib/errors';

const explore: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    try {
      const query = request.query as any;

      const filters: ExploreFilters = {
        query: query.q,
        category: query.category,
        minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
        skills: query.skills ? query.skills.split(',') : undefined,
        type: (query.type as 'offers' | 'requests' | 'all') || 'all',
        sortBy: (query.sortBy as any) || 'relevance',
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
      };

      const exploreData = await getExploreData(filters);
      return successResponse(reply, exploreData);
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

  return explore;
};

export default explore;
