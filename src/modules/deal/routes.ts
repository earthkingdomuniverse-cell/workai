import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { dealService } from './service';
import { authenticate } from '../../lib/auth';
import { successResponse, createdResponse } from '../../lib/response';
import { AppError } from '../../lib/errors';
import {
  createDealSchema,
  fundDealSchema,
  submitWorkSchema,
  releaseFundsSchema,
  createDisputeSchema,
} from './schemas';

const dealRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/deals
  fastify.get(
    '/',
    {
      schema: {
        tags: ['deals'],
        summary: 'Get all deals',
        querystring: {
          type: 'object',
          properties: {
            providerId: { type: 'string' },
            clientId: { type: 'string' },
            status: {
              type: 'string',
              enum: [
                'created',
                'funded',
                'submitted',
                'released',
                'disputed',
                'refunded',
                'under_review',
              ],
            },
            sortBy: { type: 'string', enum: ['createdAt', 'amount', 'status'] },
            sortOrder: { type: 'string', enum: ['asc', 'desc'] },
            page: { type: 'number' },
            limit: { type: 'number' },
          },
        },
      },
    },
    async (request, reply) => {
      const query = request.query as any;
      const filters = {
        providerId: query.providerId,
        clientId: query.clientId,
        status: query.status,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder || 'desc',
        page: query.page || 1,
        limit: query.limit || 20,
      };

      const deals = await dealService.getDeals(filters);
      return successResponse(deals, 'Deals retrieved successfully');
    },
  );

  // POST /api/deals
  fastify.post(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['deals'],
        summary: 'Create a new deal',
        body: {
          type: 'object',
          required: ['title', 'description', 'amount'],
          properties: {
            offerId: { type: 'string' },
            requestId: { type: 'string' },
            proposalId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string', enum: ['USD', 'EUR', 'GBP', 'JPY', 'VND'] },
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  amount: { type: 'number' },
                  dueDate: { type: 'string' },
                },
              },
            },
            attachments: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      const body = request.body as any;

      // Validate input
      const { error } = createDealSchema.safeParse(body);
      if (error) {
        throw new AppError(error.errors[0].message, 'VALIDATION_ERROR', 400);
      }

      const deal = await dealService.createDeal(body, user.id, body.clientId || 'system');
      return createdResponse(deal, 'Deal created successfully');
    },
  );

  // GET /api/deals/:id
  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['deals'],
        summary: 'Get deal by ID',
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
      const deal = await dealService.getDealById(id);
      return successResponse(deal, 'Deal retrieved successfully');
    },
  );

  // POST /api/deals/:id/fund
  fastify.post(
    '/:id/fund',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['deals'],
        summary: 'Fund a deal',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['amount', 'paymentMethodId'],
          properties: {
            amount: { type: 'number' },
            paymentMethodId: { type: 'string' },
            savePaymentMethod: { type: 'boolean' },
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      const { id } = request.params as any;
      const body = request.body as any;

      // Validate input
      const { error } = fundDealSchema.safeParse(body);
      if (error) {
        throw new AppError(error.errors[0].message, 'VALIDATION_ERROR', 400);
      }

      const deal = await dealService.fundDeal(id, body, user.id);
      return successResponse(deal, 'Deal funded successfully');
    },
  );

  // POST /api/deals/:id/submit
  fastify.post(
    '/:id/submit',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['deals'],
        summary: 'Submit work for a deal',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['milestoneId'],
          properties: {
            milestoneId: { type: 'string' },
            attachments: { type: 'array', items: { type: 'string' } },
            notes: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      const { id } = request.params as any;
      const body = request.body as any;

      // Validate input
      const { error } = submitWorkSchema.safeParse(body);
      if (error) {
        throw new AppError(error.errors[0].message, 'VALIDATION_ERROR', 400);
      }

      const deal = await dealService.submitWork(id, body, user.id);
      return successResponse(deal, 'Work submitted successfully');
    },
  );

  // POST /api/deals/:id/release
  fastify.post(
    '/:id/release',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['deals'],
        summary: 'Release funds for a deal',
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
            milestoneId: { type: 'string' },
            amount: { type: 'number' },
            notes: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      const { id } = request.params as any;
      const body = request.body as any;

      // Validate input
      const { error } = releaseFundsSchema.safeParse(body);
      if (error) {
        throw new AppError(error.errors[0].message, 'VALIDATION_ERROR', 400);
      }

      const deal = await dealService.releaseFunds(id, body, user.id);
      return successResponse(deal, 'Funds released successfully');
    },
  );

  // POST /api/deals/:id/dispute
  fastify.post(
    '/:id/dispute',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['deals'],
        summary: 'Create a dispute for a deal',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['reason', 'description'],
          properties: {
            reason: { type: 'string' },
            description: { type: 'string' },
            attachments: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      const { id } = request.params as any;
      const body = request.body as any;

      // Validate input
      const { error } = createDisputeSchema.safeParse(body);
      if (error) {
        throw new AppError(error.errors[0].message, 'VALIDATION_ERROR', 400);
      }

      const deal = await dealService.createDispute(id, body, user.id);
      return successResponse(deal, 'Dispute created successfully');
    },
  );

  // POST /api/deals/:id/resolve
  fastify.post(
    '/:id/resolve',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['deals'],
        summary: 'Resolve a dispute for a deal',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['resolution'],
          properties: {
            resolution: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      const { id } = request.params as any;
      const body = request.body as any;

      const { error } = z.object({ resolution: z.string() }).safeParse(body);
      if (error) {
        throw new AppError(error.errors[0].message, 'VALIDATION_ERROR', 400);
      }

      const deal = await dealService.resolveDispute(id, body.resolution, user.id);
      return successResponse(deal, 'Dispute resolved successfully');
    },
  );
};

export default dealRoutes;
