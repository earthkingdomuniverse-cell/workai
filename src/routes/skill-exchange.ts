import { FastifyPluginAsync } from 'fastify';
import { skillExchangeDbService } from '../services/skillExchangeDbService';

const isNotFoundError = (error: unknown): boolean =>
  error instanceof Error && error.message.toLowerCase().includes('not found');

const router: FastifyPluginAsync = async (fastify) => {
  // Create thread
  fastify.post('/skill-exchange/threads', async (request, reply) => {
    const { creatorId, topic } = request.body as { creatorId: string; topic: string };
    if (!creatorId || !topic) return reply.status(400).send({ ok: false, error: 'Missing fields' });

    const thread = await skillExchangeDbService.createThread(creatorId, topic);
    reply.status(201).send(thread);
  });

  // List threads
  fastify.get('/skill-exchange/threads', async (_request, reply) => {
    const threads = await skillExchangeDbService.getThreads();
    reply.send(threads);
  });

  // Get thread detail
  fastify.get('/skill-exchange/threads/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const thread = await skillExchangeDbService.getThread(id);
    if (!thread) return reply.status(404).send({ error: 'Thread not found' });
    reply.send(thread);
  });

  // Post message
  fastify.post('/skill-exchange/threads/:id/messages', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { senderId, text } = request.body as { senderId: string; text: string };
    if (!senderId || !text) return reply.status(400).send({ ok: false, error: 'Missing fields' });

    try {
      const message = await skillExchangeDbService.postMessage(id, senderId, text);
      reply.status(201).send(message);
    } catch (error) {
      const statusCode = isNotFoundError(error) ? 404 : 500;
      const message = error instanceof Error ? error.message : 'Failed to post message';
      reply.status(statusCode).send({ ok: false, error: message });
    }
  });

  // Propose
  fastify.post('/skill-exchange/threads/:id/proposals', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { mentorId, plan, price, durationDays } = request.body as {
      mentorId: string;
      plan: string;
      price?: number;
      durationDays?: number;
    };
    if (!mentorId || !plan) {
      return reply.status(400).send({ ok: false, error: 'Missing mentorId or plan' });
    }

    try {
      const proposal = await skillExchangeDbService.propose(
        id,
        mentorId,
        plan,
        price,
        durationDays,
      );
      reply.status(201).send(proposal);
    } catch (error) {
      const statusCode = isNotFoundError(error) ? 404 : 500;
      const message = error instanceof Error ? error.message : 'Failed to create proposal';
      reply.status(statusCode).send({ ok: false, error: message });
    }
  });

  // Accept / Reject
  fastify.post(
    '/skill-exchange/threads/:threadId/proposals/:proposalId/accept',
    async (request, reply) => {
      const { threadId, proposalId } = request.params as { threadId: string; proposalId: string };
      try {
        const proposal = await skillExchangeDbService.acceptProposal(threadId, proposalId);
        reply.send(proposal);
      } catch (error) {
        const statusCode = isNotFoundError(error) ? 404 : 500;
        const message = error instanceof Error ? error.message : 'Failed to accept proposal';
        reply.status(statusCode).send({ ok: false, error: message });
      }
    },
  );

  fastify.post(
    '/skill-exchange/threads/:threadId/proposals/:proposalId/reject',
    async (request, reply) => {
      const { threadId, proposalId } = request.params as { threadId: string; proposalId: string };
      try {
        const proposal = await skillExchangeDbService.rejectProposal(threadId, proposalId);
        reply.send(proposal);
      } catch (error) {
        const statusCode = isNotFoundError(error) ? 404 : 500;
        const message = error instanceof Error ? error.message : 'Failed to reject proposal';
        reply.status(statusCode).send({ ok: false, error: message });
      }
    },
  );

  // Close thread
  fastify.post('/skill-exchange/threads/:id/close', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await skillExchangeDbService.closeThread(id);
      reply.send({ ok: true, threadId: id, status: 'closed' });
    } catch (error) {
      const statusCode = isNotFoundError(error) ? 404 : 500;
      const message = error instanceof Error ? error.message : 'Failed to close thread';
      reply.status(statusCode).send({ ok: false, error: message });
    }
  });
};

export default router;
