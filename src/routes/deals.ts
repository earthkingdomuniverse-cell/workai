import { FastifyPluginAsync } from 'fastify';
import { createdResponse, successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import { mockReceipts, mockTransactions } from '../mocks/transactions';

type DealStatus =
  | 'created'
  | 'funded'
  | 'submitted'
  | 'released'
  | 'disputed'
  | 'refunded'
  | 'under_review';

type LocalDeal = {
  id: string;
  offerId?: string;
  requestId?: string;
  proposalId?: string;
  providerId: string;
  clientId: string;
  status: DealStatus;
  title: string;
  description: string;
  amount: number;
  currency: string;
  fundedAmount: number;
  releasedAmount: number;
  serviceFee: number;
  milestones: Array<{
    id: string;
    title: string;
    description?: string;
    amount: number;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    dueDate?: string;
    completedAt?: string;
  }>;
  timeline: Array<{
    id: string;
    type: 'status_change' | 'milestone_update' | 'payment' | 'dispute';
    title: string;
    description?: string;
    status?: DealStatus;
    milestoneId?: string;
    amount?: number;
    userId: string;
    userName: string;
    createdAt: string;
    updatedAt: string;
  }>;
  dispute?: {
    id: string;
    reason: string;
    description: string;
    status: 'open' | 'under_review' | 'resolved' | 'dismissed';
    createdAt: string;
  };
  views: number;
  createdAt: string;
  updatedAt: string;
};

export const liveMockDeals: LocalDeal[] = [
  {
    id: 'deal_1',
    offerId: 'offer_1',
    providerId: 'user_1',
    clientId: 'user_2',
    status: 'created',
    title: 'E-commerce Website Development',
    description:
      'Build a complete e-commerce website with payment integration and inventory management.',
    amount: 12000,
    currency: 'USD',
    fundedAmount: 0,
    releasedAmount: 0,
    serviceFee: 600,
    milestones: [
      {
        id: 'milestone_1',
        title: 'Project Setup & Design',
        amount: 3000,
        status: 'pending',
        dueDate: '2024-06-15T00:00:00Z',
      },
      {
        id: 'milestone_2',
        title: 'Frontend Development',
        amount: 4000,
        status: 'pending',
        dueDate: '2024-07-15T00:00:00Z',
      },
    ],
    timeline: [
      {
        id: 'timeline_1',
        type: 'status_change',
        title: 'Deal Created',
        status: 'created',
        userId: 'user_2',
        userName: 'Client',
        createdAt: '2024-05-01T10:00:00Z',
        updatedAt: '2024-05-01T10:00:00Z',
      },
    ],
    views: 45,
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z',
  },
  {
    id: 'deal_2',
    requestId: 'request_2',
    providerId: 'user_3',
    clientId: 'user_1',
    status: 'funded',
    title: 'Mobile App UI/UX Design',
    description: 'Create modern UI/UX design for a mobile application with 5 screens.',
    amount: 2500,
    currency: 'USD',
    fundedAmount: 2500,
    releasedAmount: 0,
    serviceFee: 125,
    milestones: [
      {
        id: 'milestone_5',
        title: 'Wireframes & Mockups',
        amount: 1500,
        status: 'completed',
        completedAt: '2024-05-18T10:00:00Z',
      },
      { id: 'milestone_6', title: 'Final Design & Assets', amount: 1000, status: 'pending' },
    ],
    timeline: [
      {
        id: 'timeline_2',
        type: 'status_change',
        title: 'Deal Created',
        status: 'created',
        userId: 'user_1',
        userName: 'Client',
        createdAt: '2024-05-05T10:00:00Z',
        updatedAt: '2024-05-05T10:00:00Z',
      },
      {
        id: 'timeline_3',
        type: 'payment',
        title: 'Deal Funded',
        description: 'Funded $2500 of $2500',
        amount: 2500,
        userId: 'user_1',
        userName: 'Client',
        createdAt: '2024-05-06T10:00:00Z',
        updatedAt: '2024-05-06T10:00:00Z',
      },
    ],
    views: 32,
    createdAt: '2024-05-05T10:00:00Z',
    updatedAt: '2024-05-06T10:00:00Z',
  },
  {
    id: 'deal_3',
    proposalId: 'proposal_3',
    providerId: 'user_2',
    clientId: 'user_3',
    status: 'submitted',
    title: 'Data Analysis & Reporting',
    description: 'Analyze marketing data and provide actionable insights with monthly reports.',
    amount: 1500,
    currency: 'USD',
    fundedAmount: 1500,
    releasedAmount: 0,
    serviceFee: 75,
    milestones: [
      {
        id: 'milestone_7',
        title: 'Initial Data Analysis',
        amount: 750,
        status: 'completed',
        completedAt: '2024-05-09T10:00:00Z',
      },
      {
        id: 'milestone_8',
        title: 'Monthly Report',
        amount: 750,
        status: 'completed',
        completedAt: '2024-06-08T10:00:00Z',
      },
    ],
    timeline: [
      {
        id: 'timeline_4',
        type: 'status_change',
        title: 'Deal Created',
        status: 'created',
        userId: 'user_3',
        userName: 'Client',
        createdAt: '2024-04-25T10:00:00Z',
        updatedAt: '2024-04-25T10:00:00Z',
      },
      {
        id: 'timeline_5',
        type: 'payment',
        title: 'Deal Funded',
        description: 'Funded $1500 of $1500',
        amount: 1500,
        userId: 'user_3',
        userName: 'Client',
        createdAt: '2024-04-26T10:00:00Z',
        updatedAt: '2024-04-26T10:00:00Z',
      },
      {
        id: 'timeline_6',
        type: 'milestone_update',
        title: 'Work Submitted',
        description: 'All milestones completed',
        userId: 'user_2',
        userName: 'Provider',
        createdAt: '2024-06-08T10:00:00Z',
        updatedAt: '2024-06-08T10:00:00Z',
      },
    ],
    views: 18,
    createdAt: '2024-04-25T10:00:00Z',
    updatedAt: '2024-06-08T10:00:00Z',
  },
  {
    id: 'deal_4',
    offerId: 'offer_4',
    providerId: 'user_4',
    clientId: 'user_1',
    status: 'released',
    title: 'Content Writing Services',
    description: 'Write 10 blog posts for technology topics with SEO optimization.',
    amount: 800,
    currency: 'USD',
    fundedAmount: 800,
    releasedAmount: 800,
    serviceFee: 40,
    milestones: [
      {
        id: 'milestone_9',
        title: 'First Batch of Articles',
        amount: 400,
        status: 'completed',
        completedAt: '2024-04-14T10:00:00Z',
      },
      {
        id: 'milestone_10',
        title: 'Final Batch of Articles',
        amount: 400,
        status: 'completed',
        completedAt: '2024-05-14T10:00:00Z',
      },
    ],
    timeline: [
      {
        id: 'timeline_8',
        type: 'status_change',
        title: 'Deal Created',
        status: 'created',
        userId: 'user_1',
        userName: 'Client',
        createdAt: '2024-04-01T10:00:00Z',
        updatedAt: '2024-04-01T10:00:00Z',
      },
      {
        id: 'timeline_9',
        type: 'payment',
        title: 'Deal Funded',
        description: 'Funded $800',
        amount: 800,
        userId: 'user_1',
        userName: 'Client',
        createdAt: '2024-04-02T10:00:00Z',
        updatedAt: '2024-04-02T10:00:00Z',
      },
      {
        id: 'timeline_10',
        type: 'milestone_update',
        title: 'Work Submitted',
        description: 'All milestones completed',
        userId: 'user_4',
        userName: 'Provider',
        createdAt: '2024-05-14T10:00:00Z',
        updatedAt: '2024-05-14T10:00:00Z',
      },
      {
        id: 'timeline_11',
        type: 'payment',
        title: 'Funds Released',
        description: 'Released $800',
        amount: 800,
        userId: 'user_1',
        userName: 'Client',
        createdAt: '2024-05-16T10:00:00Z',
        updatedAt: '2024-05-16T10:00:00Z',
      },
    ],
    views: 22,
    createdAt: '2024-04-01T10:00:00Z',
    updatedAt: '2024-05-16T10:00:00Z',
  },
];

function getDeal(id: string): LocalDeal | undefined {
  return liveMockDeals.find((item) => item.id === id);
}

function pushTimeline(
  deal: LocalDeal,
  event: Omit<LocalDeal['timeline'][number], 'id' | 'createdAt' | 'updatedAt'>,
) {
  deal.timeline.push({
    ...event,
    id: `timeline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

function createTransactionAndReceipt(
  deal: LocalDeal,
  type: 'fund' | 'release',
  amount: number,
  userId: string,
  userName: string,
) {
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  mockTransactions.push({
    id: transactionId,
    dealId: deal.id,
    amount,
    currency: deal.currency,
    type,
    status: 'completed',
    referenceNumber: `${type.toUpperCase()}-${Date.now()}`,
    userId,
    userName,
    receiptId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  mockReceipts.push({
    id: receiptId,
    dealId: deal.id,
    transactionId,
    amount,
    currency: deal.currency,
    items: [
      {
        id: `item_${Date.now()}`,
        description: `${deal.title} - ${type}`,
        quantity: 1,
        unitPrice: amount,
        total: amount,
      },
    ],
    subtotal: amount,
    serviceFee: Math.round(amount * 0.05),
    total: amount + Math.round(amount * 0.05),
    paidAt: new Date().toISOString(),
    receiptNumber: `RCPT-${Date.now()}`,
    status: 'paid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

async function requireDealUser(request: any, reply: any) {
  const user = await authenticate(request, reply);
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
  return user;
}

function ensureTransition(current: DealStatus, next: DealStatus, allowed: DealStatus[]) {
  if (!allowed.includes(current)) {
    throw new AppError(`Cannot transition deal from ${current} to ${next}`, {
      code: 'BAD_REQUEST',
      statusCode: 400,
    });
  }
}

const deals: FastifyPluginAsync = async (fastify) => {
  fastify.get('/deals', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    let items = [...liveMockDeals];

    if (query.status) items = items.filter((item) => item.status === query.status);
    if (query.providerId) items = items.filter((item) => item.providerId === query.providerId);
    if (query.clientId) items = items.filter((item) => item.clientId === query.clientId);

    return successResponse(reply, { items, total: items.length });
  });

  fastify.post('/deals', async (request, reply) => {
    const user = await requireDealUser(request, reply);
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
    if (!body.amount || Number(body.amount) <= 0) {
      throw new AppError('Amount must be positive', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const deal: LocalDeal = {
      id: `deal_${Date.now()}`,
      offerId: body.offerId,
      requestId: body.requestId,
      proposalId: body.proposalId,
      providerId: body.providerId || user.userId,
      clientId: body.clientId || 'user_2',
      status: 'created',
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      amount: Number(body.amount),
      currency: body.currency || 'USD',
      fundedAmount: 0,
      releasedAmount: 0,
      serviceFee: Math.round(Number(body.amount) * 0.05),
      milestones: body.milestones || [],
      timeline: [],
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    pushTimeline(deal, {
      type: 'status_change',
      title: 'Deal Created',
      status: 'created',
      userId: user.userId,
      userName: 'Client',
    });
    liveMockDeals.push(deal);
    return createdResponse(reply, deal);
  });

  fastify.get('/deals/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deal = getDeal(id);
    if (!deal) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    }
    return successResponse(reply, deal);
  });

  fastify.post('/deals/:id/fund', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { amount?: number; paymentMethodId?: string };
    const deal = getDeal(id);
    if (!deal)
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (deal.clientId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'Only the client can fund this deal' } });
    }
    if (!body.amount || body.amount <= 0 || !body.paymentMethodId) {
      throw new AppError('amount and paymentMethodId are required', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }
    ensureTransition(deal.status, 'funded', ['created']);
    deal.status = 'funded';
    deal.fundedAmount = Math.min(body.amount, deal.amount);
    deal.updatedAt = new Date().toISOString();
    createTransactionAndReceipt(deal, 'fund', deal.fundedAmount, user.userId, 'Client');
    pushTimeline(deal, {
      type: 'payment',
      title: 'Deal Funded',
      description: `Funded $${deal.fundedAmount}`,
      amount: deal.fundedAmount,
      status: 'funded',
      userId: user.userId,
      userName: 'Client',
    });
    return successResponse(reply, deal);
  });

  fastify.post('/deals/:id/submit', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { milestoneId?: string; notes?: string };
    const deal = getDeal(id);
    if (!deal)
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (deal.providerId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'Only the provider can submit work' } });
    }
    ensureTransition(deal.status, 'submitted', ['funded']);

    if (body.milestoneId) {
      const milestone = deal.milestones.find((item) => item.id === body.milestoneId);
      if (!milestone) {
        throw new AppError('Milestone not found', { code: 'NOT_FOUND', statusCode: 404 });
      }
      milestone.status = 'completed';
      milestone.completedAt = new Date().toISOString();
    }

    deal.status = 'submitted';
    deal.updatedAt = new Date().toISOString();
    pushTimeline(deal, {
      type: 'milestone_update',
      title: 'Work Submitted',
      description: body.notes || 'Work submitted for review',
      status: 'submitted',
      milestoneId: body.milestoneId,
      userId: user.userId,
      userName: 'Provider',
    });
    return successResponse(reply, deal);
  });

  fastify.post('/deals/:id/release', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { amount?: number; notes?: string };
    const deal = getDeal(id);
    if (!deal)
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (deal.clientId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'Only the client can release funds' } });
    }
    ensureTransition(deal.status, 'released', ['submitted']);
    const amount =
      body.amount && body.amount > 0 ? Math.min(body.amount, deal.amount) : deal.amount;
    deal.releasedAmount = amount;
    deal.status = 'released';
    deal.updatedAt = new Date().toISOString();
    createTransactionAndReceipt(deal, 'release', amount, user.userId, 'Client');
    pushTimeline(deal, {
      type: 'payment',
      title: 'Funds Released',
      description: body.notes || `Released $${amount}`,
      amount,
      status: 'released',
      userId: user.userId,
      userName: 'Client',
    });
    return successResponse(reply, deal);
  });

  fastify.post('/deals/:id/dispute', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { reason?: string; description?: string };
    const deal = getDeal(id);
    if (!deal)
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (![deal.clientId, deal.providerId].includes(user.userId)) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'Only deal participants can dispute' } });
    }
    ensureTransition(deal.status, 'disputed', ['funded', 'submitted', 'released']);
    if (!body.reason || !body.description) {
      throw new AppError('reason and description are required', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }
    deal.status = 'disputed';
    deal.dispute = {
      id: `dispute_${Date.now()}`,
      reason: body.reason,
      description: body.description,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    deal.updatedAt = new Date().toISOString();
    pushTimeline(deal, {
      type: 'dispute',
      title: 'Dispute Opened',
      description: body.reason,
      status: 'disputed',
      userId: user.userId,
      userName: user.userId === deal.clientId ? 'Client' : 'Provider',
    });
    return successResponse(reply, deal);
  });
};

export default deals;
