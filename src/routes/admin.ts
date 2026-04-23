import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { adminService } from '../services/adminService';
import { authenticate, authorize } from '../lib/auth';

const admin: FastifyPluginAsync = async (fastify) => {
  // Add admin authorization middleware
  fastify.addHook('preHandler', async (request, reply) => {
    await authenticate(request, reply);
    await authorize(request, reply, ['operator', 'admin']);
  });

  // GET /api/admin/overview
  fastify.get('/admin/overview', async (_request, reply) => {
    try {
      const overview = await adminService.getOverview();
      return reply.send(successResponse(overview, 'Admin overview retrieved successfully'));
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve admin overview',
        },
      });
    }
  });

  // GET /api/admin/disputes
  fastify.get('/admin/disputes', async (_request, reply) => {
    try {
      const disputes = await adminService.getDisputes();
      return reply.send(successResponse({ items: disputes }, 'Disputes retrieved successfully'));
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve disputes',
        },
      });
    }
  });

  // POST /api/admin/disputes/:id/resolve
  fastify.post('/admin/disputes/:id/resolve', async (request, reply) => {
    const { id } = request.params as any;
    const { resolution } = request.body as any;
    const user = (request as any).user as { userId?: string; id?: string };

    try {
      const dispute = await adminService.resolveDispute(
        id,
        resolution,
        user.userId || user.id || 'system',
      );
      return reply.send(successResponse(dispute, 'Dispute resolved successfully'));
    } catch (error: any) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: error.message || 'Failed to resolve dispute',
        },
      });
    }
  });

  // GET /api/admin/risk
  fastify.get('/admin/risk', async (_request, reply) => {
    try {
      const riskProfiles = await adminService.getRiskProfiles();
      return reply.send(
        successResponse({ items: riskProfiles }, 'Risk profiles retrieved successfully'),
      );
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve risk profiles',
        },
      });
    }
  });

  // GET /api/admin/risk/:userId
  fastify.get('/admin/risk/:userId', async (request, reply) => {
    const { userId } = request.params as any;

    try {
      const riskProfile = await adminService.getUserRiskProfile(userId);
      return reply.send(successResponse(riskProfile, 'User risk profile retrieved successfully'));
    } catch (error: any) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: error.message || 'Failed to retrieve user risk profile',
        },
      });
    }
  });

  // GET /api/admin/fraud
  fastify.get('/admin/fraud', async (_request, reply) => {
    try {
      const fraudSignals = await adminService.getFraudSignals();
      return reply.send(
        successResponse({ items: fraudSignals }, 'Fraud signals retrieved successfully'),
      );
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve fraud signals',
        },
      });
    }
  });

  // GET /api/admin/fraud/user/:userId
  fastify.get('/admin/fraud/user/:userId', async (request, reply) => {
    const { userId } = request.params as any;

    try {
      const fraudSignals = await adminService.getFraudSignalsByUser(userId);
      return reply.send(
        successResponse({ items: fraudSignals }, 'User fraud signals retrieved successfully'),
      );
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve user fraud signals',
        },
      });
    }
  });

  // GET /api/admin/reviews
  fastify.get('/admin/reviews', async (_request, reply) => {
    try {
      const reviews = await adminService.getPendingReviews();
      return reply.send(
        successResponse({ items: reviews }, 'Pending reviews retrieved successfully'),
      );
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve pending reviews',
        },
      });
    }
  });

  // POST /api/admin/review
  fastify.post('/admin/review', async (request, reply) => {
    const { reviewId, action, note } = request.body as any;
    const user = (request as any).user as { userId?: string; id?: string };

    try {
      const result = await adminService.processReviewAction(
        reviewId,
        action,
        note,
        user.userId || user.id || 'system',
      );
      return reply.send(successResponse(result, 'Review action processed successfully'));
    } catch (error: any) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: error.message || 'Failed to process review action',
        },
      });
    }
  });

  // POST /api/admin/review/:reviewId/flag
  fastify.post('/admin/review/:reviewId/flag', async (request, reply) => {
    const { reviewId } = request.params as any;
    const { flags } = request.body as any;
    const user = (request as any).user as { userId?: string; id?: string };

    try {
      const result = await adminService.flagReview(
        reviewId,
        flags,
        user.userId || user.id || 'system',
      );
      return reply.send(successResponse(result, 'Review flagged successfully'));
    } catch (error: any) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: error.message || 'Failed to flag review',
        },
      });
    }
  });
};

export default admin;
