import { FastifyPluginAsync } from 'fastify';

type Lead = {
  name: string;
  email: string;
  company?: string;
  role?: string;
  budget?: string;
  message?: string;
};

const leads: Lead[] = [];

const leadRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/packaging/inquiry', async (request, reply) => {
    const data = request.body as Lead;
    if (!data?.name || !data?.email || !data?.message) {
      return reply.status(400).send({ ok: false, error: 'Missing required fields' });
    }
    leads.push({ ...data });
    const leadId = `lead_${Date.now()}`;
    reply.status(201).send({ ok: true, leadId, totalLeads: leads.length });
  });
};

export default leadRoutes;
