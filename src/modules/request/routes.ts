import { FastifyPluginAsync } from 'fastify';
import {
  getRequests,
  getRequestById,
  getRequestsByRequesterId,
  createRequest,
  updateRequest,
  deleteRequest,
  updateRequestStatus,
  getRequestStats,
  getUrgentRequests,
} from './service';
import { createRequestSchema, requestFilterSchema } from './schemas';
import { successResponse, errorResponse } from '../../lib';
import { AppError } from '../../lib/errors';

const request: FastifyPluginAsync = async (fastify) => {
  // GET /api/requests - List requests with filters
  fastify.get('/', async (request, reply) => {
    try {
      const query = request.query as any;

      const result = requestFilterSchema.safeParse({
        ...query,
        minBudget: query.minBudget ? parseFloat(query.minBudget) : undefined,
        maxBudget: query.maxBudget ? parseFloat(query.maxBudget) : undefined,
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

      const requests = await getRequests(result.data);
      return successResponse(reply, { requests });
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

  // POST /api/requests - Create request
  fastify.post('/', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const result = createRequestSchema.safeParse(request.body);
      if (!result.success) {
        return errorResponse(
          reply,
          'VALIDATION_ERROR',
          result.error.errors.map((e) => e.message).join(', '),
          400,
        );
      }

      const req = await createRequest(payload.userId, result.data);
      return successResponse(reply, { request: req }, {}, 201);
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

  // GET /api/requests/mine - Get current user's requests
  fastify.get('/mine', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(reply, 'AUTHENTICATION_ERROR', 'No token provided', 401);
      }

      const { verifyAccessToken } = await import('../auth/token');
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const requests = await getRequestsByRequesterId(payload.userId);
      return successResponse(reply, { requests });
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

  // GET /api/requests/urgent - Get urgent requests
  fastify.get('/urgent', async (request, reply) => {
    try {
      const requests = await getUrgentRequests();
      return successResponse(reply, { requests });
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

  // GET /api/requests/stats - Get request statistics
  fastify.get('/stats', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      let requesterId: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const { verifyAccessToken } = await import('../auth/token');
          const token = authHeader.split(' ')[1];
          const payload = await verifyAccessToken(token);
          requesterId = payload.userId;
        } catch (error) {
          // Use undefined for public stats
        }
      }

      const stats = await getRequestStats(requesterId);
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

  // GET /api/requests/:id - Get request by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const req = await getRequestById(id);

      if (!req) {
        return errorResponse(reply, 'NOT_FOUND_ERROR', 'Request not found', 404);
      }

      return successResponse(reply, { request: req });
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

  // PATCH /api/requests/:id - Update request
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
      const req = await updateRequest(id, payload.userId, request.body as any);
      return successResponse(reply, { request: req });
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

  // DELETE /api/requests/:id - Delete request
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
      await deleteRequest(id, payload.userId);
      return successResponse(reply, { message: 'Request deleted successfully' });
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

  // PATCH /api/requests/:id/status - Update request status
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

      if (!status || !['open', 'in_progress', 'completed', 'archived'].includes(status)) {
        return errorResponse(reply, 'VALIDATION_ERROR', 'Invalid status', 400);
      }

      const req = await updateRequestStatus(id, payload.userId, status);
      return successResponse(reply, { request: req });
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

  return request;
};

export default request;
