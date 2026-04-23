import { FastifyPluginAsync } from 'fastify';
import { createdResponse, successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import { createOffer, getOfferById, getOffersByProviderId, mockOffers } from '../mocks/offers';

function requireOfferUser(user: { userId: string }) {
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
}

const offers: FastifyPluginAsync = async (fastify) => {
  fastify.get('/offers', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    let items = [...mockOffers];

    if (query.q) {
      const q = query.q.toLowerCase();
      items = items.filter(
        (offer) =>
          offer.title.toLowerCase().includes(q) || offer.description.toLowerCase().includes(q),
      );
    }

    if (query.pricingType && query.pricingType !== 'all') {
      items = items.filter((offer) => offer.pricingType === query.pricingType);
    }

    return successResponse(reply, { items, total: items.length });
  });

  fastify.get('/offers/mine', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireOfferUser(user);
    const items = getOffersByProviderId(user.userId);
    return successResponse(reply, { items, total: items.length });
  });

  fastify.get('/offers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const offer = getOfferById(id);
    if (!offer) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }
    return successResponse(reply, offer);
  });

  fastify.post('/offers', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireOfferUser(user);
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
    if (!body.price || Number(body.price) <= 0) {
      throw new AppError('Price must be positive', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const offer = createOffer({
      providerId: user.userId,
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      price: Number(body.price),
      currency: body.currency || 'USD',
      pricingType: body.pricingType || 'fixed',
      deliveryTime: body.deliveryTime ? Number(body.deliveryTime) : undefined,
      skills: body.skills || [],
      category: body.category,
    });

    return createdResponse(reply, offer);
  });

  fastify.patch('/offers/:id', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireOfferUser(user);
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, any>;
    const offer = getOfferById(id);
    if (!offer) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }
    if (offer.providerId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'You cannot edit this offer' } });
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
    if (body.price !== undefined && Number(body.price) <= 0) {
      throw new AppError('Price must be positive', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    Object.assign(offer, {
      title: body.title !== undefined ? String(body.title).trim() : offer.title,
      description:
        body.description !== undefined ? String(body.description).trim() : offer.description,
      price: body.price !== undefined ? Number(body.price) : offer.price,
      currency: body.currency || offer.currency,
      pricingType: body.pricingType || offer.pricingType,
      deliveryTime:
        body.deliveryTime !== undefined ? Number(body.deliveryTime) : offer.deliveryTime,
      skills: body.skills || offer.skills,
      status: body.status || offer.status,
      updatedAt: new Date().toISOString(),
    });

    return successResponse(reply, offer);
  });
};

export default offers;
