import { FastifyPluginAsync } from 'fastify';
import {
  getOffers,
  getOfferById,
  getOffersByProviderId,
  createOffer,
  updateOffer,
  deleteOffer,
  updateOfferStatus,
  getOfferStats,
} from './service';
import { createOfferSchema, offerFilterSchema } from './schemas';
import { successResponse, errorResponse } from '../../lib';
import { AppError } from '../../lib/errors';

const offer: FastifyPluginAsync = async (fastify) => {
  // GET /api/offers - List offers with filters
  fastify.get('/', async (request, reply) => {
    try {
      const query = request.query as any;

      const result = offerFilterSchema.safeParse({
        ...query,
        minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
      });

      if (!result.success) {
        return errorResponse(
          reply,
          'VALIDATION_ERROR',
          result.error.errors.map((e) => e.message).join(', '),
          400,
        );
      }

      const offers = await getOffers(result.data);
      return successResponse(reply, { offers });
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

  // POST /api/offers - Create offer
  fastify.post('/', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const result = createOfferSchema.safeParse(request.body);
      if (!result.success) {
        return errorResponse(
          reply,
          'VALIDATION_ERROR',
          result.error.errors.map((e) => e.message).join(', '),
          400,
        );
      }

      const offer = await createOffer(payload.userId, result.data);
      return successResponse(reply, { offer }, {}, 201);
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

  // GET /api/offers/mine - Get current user's offers
  fastify.get('/mine', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const offers = await getOffersByProviderId(payload.userId);
      return successResponse(reply, { offers });
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

  // GET /api/offers/stats - Get offer statistics
  fastify.get('/stats', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      let providerId: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const { verifyAccessToken } = await import('../auth/token');
          const token = authHeader.split(' ')[1];
          const payload = await verifyAccessToken(token);
          providerId = payload.userId;
        } catch (error) {
          // Use undefined providerId for public stats
        }
      }

      const stats = await getOfferStats(providerId);
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

  // GET /api/offers/:id - Get offer by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const offer = await getOfferById(id);
      return successResponse(reply, { offer });
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

  // PATCH /api/offers/:id - Update offer
  fastify.patch('/:id', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const { id } = request.params as any;
      const offer = await updateOffer(id, payload.userId, request.body as any);
      return successResponse(reply, { offer });
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

  // DELETE /api/offers/:id - Delete offer
  fastify.delete('/:id', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const { id } = request.params as any;
      await deleteOffer(id, payload.userId);
      return successResponse(reply, { message: 'Offer deleted successfully' });
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

  // PATCH /api/offers/:id/status - Update offer status
  fastify.patch('/:id/status', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const { id } = request.params as any;
      const { status } = request.body as any;

      if (!status || !['active', 'inactive', 'archived', 'completed'].includes(status)) {
        return errorResponse(reply, 'VALIDATION_ERROR', 'Invalid status', 400);
      }

      const offer = await updateOfferStatus(id, payload.userId, status);
      return successResponse(reply, { offer });
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

  return offer;
};

export default offer;
