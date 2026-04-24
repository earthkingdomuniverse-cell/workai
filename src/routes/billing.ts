import { FastifyPluginAsync } from 'fastify';
import { billingService } from '../services/billing';
import { aiAgentService } from '../services/aiAgent';
import type { Plan, PlanId } from '../types/billing';

type SubscribeBody = { userId: string; planId: PlanId };
type UserQuery = { userId?: string };
type RegisterAgentBody = { id: string; name: string };
type AgentCreditBody = { agentId: string; amount: number };
type PayInvoiceBody = { invoiceId: string };

const billingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/billing/plans', async (_req, reply) => {
    const plans: Plan[] = billingService.getPlans();
    reply.send(plans);
  });

  fastify.post('/billing/subscribe', async (request, reply) => {
    const body = request.body as SubscribeBody;
    if (!body?.userId || !body?.planId) {
      return reply.status(400).send({ ok: false, error: 'Missing userId or planId' });
    }
    const sub = billingService.subscribe(body.userId, body.planId);
    reply.send({ ok: true, subscription: sub });
  });

  fastify.get('/billing/invoices', async (request, reply) => {
    const { userId } = request.query as UserQuery;
    if (!userId) return reply.status(400).send({ ok: false, error: 'Missing userId' });
    reply.send(billingService.getInvoices(userId));
  });

  fastify.get('/billing/transactions', async (request, reply) => {
    const { userId } = request.query as UserQuery;
    if (!userId) return reply.status(400).send({ ok: false, error: 'Missing userId' });
    reply.send(billingService.getTransactions(userId));
  });

  // AI Agents management (monetization)
  fastify.post('/billing/ai/register', async (request, reply) => {
    const { id, name } = request.body as RegisterAgentBody;
    if (!id || !name) {
      return reply.status(400).send({ ok: false, error: 'Missing agent id or name' });
    }
    const agent = aiAgentService.registerAgent(id, name);
    reply.send({ ok: true, agent });
  });

  fastify.get('/billing/ai/agents', async (_req, reply) => {
    const agents = aiAgentService.getAgents();
    reply.send(agents);
  });

  fastify.post('/billing/ai/credit', async (request, reply) => {
    const { agentId, amount } = request.body as AgentCreditBody;
    if (!agentId || amount == null) {
      return reply.status(400).send({ ok: false, error: 'Missing agentId or amount' });
    }
    try {
      aiAgentService.addCredits(agentId, amount);
      reply.send({ ok: true, balance: aiAgentService.getBalance(agentId) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Credit update failed';
      reply.status(400).send({ ok: false, error: message });
    }
  });

  fastify.post('/billing/ai/consume', async (request, reply) => {
    const { agentId, amount } = request.body as AgentCreditBody;
    if (!agentId || amount == null) {
      return reply.status(400).send({ ok: false, error: 'Missing agentId or amount' });
    }
    try {
      aiAgentService.consumeCredits(agentId, amount);
      reply.send({ ok: true, balance: aiAgentService.getBalance(agentId) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Credit consumption failed';
      reply.status(400).send({ ok: false, error: message });
    }
  });

  // Pay an invoice (mock payment gateway)
  fastify.post('/billing/pay', async (request, reply) => {
    const { invoiceId } = request.body as PayInvoiceBody;
    if (!invoiceId) {
      return reply.status(400).send({ ok: false, error: 'Missing invoiceId' });
    }
    const res = billingService.payInvoice(invoiceId);
    if (res?.success) {
      reply.send({ ok: true, invoice: res.invoice, transaction: res.transaction });
    } else {
      reply.status(400).send({ ok: false, error: res?.error ?? 'Payment failed' });
    }
  });
};

export default billingRoutes;
