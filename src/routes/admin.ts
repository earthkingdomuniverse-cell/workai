import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { adminService } from '../services/adminService';
import { authenticate, authorize } from '../lib/auth';

const admin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (request, reply) => {
    await authenticate(request, reply);
    await authorize(request, reply, ['operator', 'admin']);
  });

  fastify.get('/admin/overview', async (_request, reply) => {
    try {
      const overview = await adminService.getOverview();
      return successResponse(reply, overview, { message: 'Admin overview retrieved successfully' });
    } catch (_error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve admin overview',
        },
      });
    }
  });

  fastify.get('/admin/disputes', async (_request, reply) => {
    try {
      const disputes = await adminService.getDisputes();
      return successResponse(reply, { items: disputes, total: disputes.length }, { message: 'Disputes retrieved successfully' });
    } catch (_error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve disputes',
        },
      });
    }
  });

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
      return successResponse(reply, dispute, { message: 'Dispute resolved successfully' });
    } catch (error: any) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: error.message || 'Failed to resolve dispute',
        },
      });
    }
  });

  fastify.get('/admin/risk', async (_request, reply) => {
    try {
      const riskProfiles = await adminService.getRiskProfiles();
      return successResponse(
        reply,
        { items: riskProfiles, total: riskProfiles.length },
        { message: 'Risk profiles retrieved successfully' },
      );
    } catch (_error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve risk profiles',
        },
      });
    }
  });

  fastify.get('/admin/risk/:userId', async (request, reply) => {
    const { userId } = request.params as any;

    try {
      const riskProfile = await adminService.getUserRiskProfile(userId);
      return successResponse(reply, riskProfile, { message: 'User risk profile retrieved successfully' });
    } catch (error: any) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: error.message || 'Failed to retrieve user risk profile',
        },
      });
    }
  });

  fastify.get('/admin/fraud', async (_request, reply) => {
    try {
      const fraudSignals = await adminService.getFraudSignals();
      return successResponse(
        reply,
        { items: fraudSignals, total: fraudSignals.length },
        { message: 'Fraud signals retrieved successfully' },
      );
    } catch (_error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve fraud signals',
        },
      });
    }
  });

  fastify.get('/admin/fraud/user/:userId', async (request, reply) => {
    const { userId } = request.params as any;

    try {
      const fraudSignals = await adminService.getFraudSignalsByUser(userId);
      return successResponse(
        reply,
        { items: fraudSignals, total: fraudSignals.length },
        { message: 'User fraud signals retrieved successfully' },
      );
    } catch (_error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve user fraud signals',
        },
      });
    }
  });

  fastify.get('/admin/reviews', async (_request, reply) => {
    try {
      const reviews = await adminService.getPendingReviews();
      return successResponse(
        reply,
        { items: reviews, total: reviews.length },
        { message: 'Pending reviews retrieved successfully' },
      );
    } catch (_error) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: 'Failed to retrieve pending reviews',
        },
      });
    }
  });

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
      return successResponse(reply, result, { message: 'Review action processed successfully' });
    } catch (error: any) {
      return reply.status(500).send({
        error: {
          code: 'ADMIN_ERROR',
          message: error.message || 'Failed to process review action',
        },
      });
    }
  });

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
      return successResponse(reply, result, { message: 'Review flagged successfully' });
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
