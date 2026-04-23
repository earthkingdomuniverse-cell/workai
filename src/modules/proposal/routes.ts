import { FastifyPluginAsync } from 'fastify';
import { proposalService } from './service';
import { createProposalSchema, proposalFilterSchema, updateProposalSchema } from './schemas';
import { authenticate } from '../../lib/auth';
import { successResponse, createdResponse } from '../../lib/response';
import { AppError } from '../../lib/errors';
import { getRequestById } from '../../mocks/requests';
import { getOfferById } from '../../mocks/offers';

async function requireProposalUser(request: any, reply: any) {
  const user = await authenticate(request, reply);
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
  return user;
}

const proposalRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: {
        tags: ['proposals'],
        summary: 'Get all proposals',
        querystring: {
          type: 'object',
          properties: {
            requestId: { type: 'string' },
            offerId: { type: 'string' },
            providerId: { type: 'string' },
            clientId: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'expired', 'withdrawn'],
            },
            sortBy: { type: 'string', enum: ['createdAt', 'amount', 'relevance'] },
            sortOrder: { type: 'string', enum: ['asc', 'desc'] },
            page: { type: 'number' },
            limit: { type: 'number' },
          },
        },
      },
    },
    async (request, reply) => {
      const parsed = proposalFilterSchema.safeParse(request.query);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Invalid proposal filters', {
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        });
      }
      const filters = parsed.data;
      const proposals = await proposalService.getProposals(filters);
      return successResponse(reply, proposals, { message: 'Proposals retrieved successfully' });
    },
  );

  fastify.get(
    '/mine',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['proposals'],
        summary: 'Get my proposals',
      },
    },
    async (request, reply) => {
      const user = await requireProposalUser(request, reply);
      const proposals = await proposalService.getMyProposals(user.userId);
      return successResponse(reply, proposals, { message: 'My proposals retrieved successfully' });
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['proposals'],
        summary: 'Get proposal by ID',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as any;
      const proposal = await proposalService.getProposalById(id);
      return successResponse(reply, proposal, { message: 'Proposal retrieved successfully' });
    },
  );

  fastify.post(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['proposals'],
        summary: 'Create a new proposal',
        body: {
          type: 'object',
          required: ['title', 'message', 'proposedAmount', 'estimatedDeliveryDays'],
          properties: {
            requestId: { type: 'string' },
            offerId: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            proposedAmount: { type: 'number' },
            currency: { type: 'string', enum: ['USD', 'EUR', 'GBP', 'JPY', 'VND'] },
            estimatedDeliveryDays: { type: 'number' },
            revisions: { type: 'number' },
            attachments: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await requireProposalUser(request, reply);
      const parsed = createProposalSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Invalid proposal payload', {
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        });
      }
      const body = parsed.data;
      let receiverUserId: string | undefined;

      if (body.requestId) {
        const requestRecord = getRequestById(body.requestId);
        if (!requestRecord) {
          throw new AppError('Request not found for proposal', {
            code: 'NOT_FOUND',
            statusCode: 404,
          });
        }
        receiverUserId = requestRecord.requesterId;
      }

      if (!receiverUserId && body.offerId) {
        const offerRecord = getOfferById(body.offerId);
        if (!offerRecord) {
          throw new AppError('Offer not found for proposal', {
            code: 'NOT_FOUND',
            statusCode: 404,
          });
        }
        receiverUserId = offerRecord.providerId;
      }

      if (!receiverUserId) {
        throw new AppError('Unable to resolve proposal counterparty', {
          code: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      const proposal = await proposalService.createProposal(
        body,
        user.userId,
        receiverUserId,
      );
      return createdResponse(reply, proposal);
    },
  );

  fastify.post(
    '/:id/accept',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['proposals'],
        summary: 'Accept a proposal (client only)',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await requireProposalUser(request, reply);
      const { id } = request.params as any;
      const proposal = await proposalService.acceptProposal(id, user.userId);
      return successResponse(reply, proposal, { message: 'Proposal accepted successfully' });
    },
  );

  fastify.post(
    '/:id/reject',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['proposals'],
        summary: 'Reject a proposal (client only)',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await requireProposalUser(request, reply);
      const { id } = request.params as any;
      const proposal = await proposalService.rejectProposal(id, user.userId);
      return successResponse(reply, proposal, { message: 'Proposal rejected successfully' });
    },
  );

  fastify.post(
    '/:id/withdraw',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['proposals'],
        summary: 'Withdraw a proposal (provider only)',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await requireProposalUser(request, reply);
      const { id } = request.params as any;
      const proposal = await proposalService.withdrawProposal(id, user.userId);
      return successResponse(reply, proposal, { message: 'Proposal withdrawn successfully' });
    },
  );

  fastify.patch(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['proposals'],
        summary: 'Update a proposal',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            message: { type: 'string' },
            proposedAmount: { type: 'number' },
            estimatedDeliveryDays: { type: 'number' },
            revisions: { type: 'number' },
          },
        },
      },
    },
    async (request, reply) => {
      await requireProposalUser(request, reply);
      const { id } = request.params as any;
      const parsed = updateProposalSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Invalid proposal update payload', {
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        });
      }
      const data = parsed.data;
      const proposal = await proposalService.updateProposal(id, data);
      return successResponse(reply, proposal, { message: 'Proposal updated successfully' });
    },
  );

  fastify.delete(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['proposals'],
        summary: 'Delete a proposal',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      await requireProposalUser(request, reply);
      const { id } = request.params as any;
      await proposalService.deleteProposal(id);
      return successResponse(
        reply,
        { deleted: true },
        { message: 'Proposal deleted successfully' },
      );
    },
  );
};

export default proposalRoutes;
