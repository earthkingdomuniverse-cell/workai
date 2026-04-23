import { FastifyPluginAsync } from 'fastify';
import { createdResponse, successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import {
  createRequest,
  getRequestById,
  getRequestsByRequesterId,
  mockRequests,
} from '../mocks/requests';

function requireRequestUser(user: { userId: string }) {
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
}

const requests: FastifyPluginAsync = async (fastify) => {
  fastify.get('/requests', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    let items = [...mockRequests];

    if (query.q) {
      const q = query.q.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
      );
    }

    if (query.urgency && query.urgency !== 'all') {
      items = items.filter((item: any) => item.urgency === query.urgency);
    }

    if (query.location && query.location !== 'all') {
      items = items.filter((item) => item.location?.type === query.location);
    }

    return successResponse(reply, { items, total: items.length });
  });

  fastify.get('/requests/mine', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireRequestUser(user);
    const items = getRequestsByRequesterId(user.userId);
    return successResponse(reply, { items, total: items.length });
  });

  fastify.get('/requests/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = getRequestById(id);
    if (!item) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }
    return successResponse(reply, item);
  });

  fastify.post('/requests', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireRequestUser(user);
    const body = request.body as Record<string, any>;

    if (!body.title || String(body.title).trim().length < 5) {
      throw new AppError('Title must be at least 5 characters', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }
    if (!body.description || String(body.description).trim().length < 20) {
      throw new AppError('Description must be at least 20 characters', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const budget = body.budget || undefined;
    if (
      budget &&
      budget.min !== undefined &&
      budget.max !== undefined &&
      Number(budget.min) > Number(budget.max)
    ) {
      throw new AppError('Minimum budget cannot exceed maximum budget', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const created = createRequest({
      requesterId: user.userId,
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      budget,
      category: body.category,
      skills: body.skills || [],
      experienceLevel: body.experienceLevel,
      location: body.location,
      deadline: body.deadline,
      status: 'open',
      urgency: body.urgency,
    } as any);

    return createdResponse(reply, created);
  });

  fastify.patch('/requests/:id', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireRequestUser(user);
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, any>;
    const existing = getRequestById(id) as any;
    if (!existing) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }
    if (existing.requesterId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'You cannot edit this request' } });
    }

    if (body.title !== undefined && String(body.title).trim().length < 5) {
      throw new AppError('Title must be at least 5 characters', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }
    if (body.description !== undefined && String(body.description).trim().length < 20) {
      throw new AppError('Description must be at least 20 characters', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }
    if (
      body.budget &&
      body.budget.min !== undefined &&
      body.budget.max !== undefined &&
      Number(body.budget.min) > Number(body.budget.max)
    ) {
      throw new AppError('Minimum budget cannot exceed maximum budget', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    Object.assign(existing, {
      title: body.title !== undefined ? String(body.title).trim() : existing.title,
      description:
        body.description !== undefined ? String(body.description).trim() : existing.description,
      budget: body.budget || existing.budget,
      category: body.category || existing.category,
      skills: body.skills || existing.skills,
      experienceLevel: body.experienceLevel || existing.experienceLevel,
      location: body.location || existing.location,
      deadline: body.deadline || existing.deadline,
      urgency: body.urgency || existing.urgency,
      status: body.status || existing.status,
      updatedAt: new Date().toISOString(),
    });

    return successResponse(reply, existing);
  });

  fastify.delete('/requests/:id', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireRequestUser(user);
    const { id } = request.params as { id: string };
    const index = mockRequests.findIndex((item) => item.id === id);
    if (index === -1) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }
    if (mockRequests[index].requesterId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'You cannot delete this request' } });
    }
    mockRequests.splice(index, 1);
    return successResponse(reply, { deleted: true });
  });
};

export default requests;
