import { prisma } from '../lib/prisma';

type NotificationPriority = 'low' | 'medium' | 'high';

type NotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  imageUrl?: string;
  data?: Record<string, any>;
};

class NotificationService {
  async create(input: NotificationInput) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        priority: input.priority || 'medium',
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl,
        imageUrl: input.imageUrl,
        data: input.data,
      },
    });
  }

  async notifyProposalReceived(input: {
    clientId: string;
    providerId: string;
    proposalId: string;
    title: string;
    requestId?: string;
    offerId?: string;
  }) {
    return this.create({
      userId: input.clientId,
      type: 'proposal_received',
      priority: 'high',
      title: 'New proposal received',
      message: `A provider sent a proposal: ${input.title}`,
      actionUrl: `/proposals/${input.proposalId}`,
      data: input,
    });
  }

  async notifyProposalAccepted(input: {
    clientId: string;
    providerId: string;
    proposalId: string;
    title: string;
  }) {
    return this.create({
      userId: input.providerId,
      type: 'proposal_accepted',
      priority: 'high',
      title: 'Proposal accepted',
      message: `Your proposal was accepted: ${input.title}`,
      actionUrl: `/proposals/${input.proposalId}`,
      data: input,
    });
  }

  async notifyProposalRejected(input: {
    clientId: string;
    providerId: string;
    proposalId: string;
    title: string;
  }) {
    return this.create({
      userId: input.providerId,
      type: 'proposal_received',
      priority: 'medium',
      title: 'Proposal rejected',
      message: `Your proposal was not selected: ${input.title}`,
      actionUrl: `/proposals/${input.proposalId}`,
      data: input,
    });
  }

  async notifyProposalWithdrawn(input: {
    clientId: string;
    providerId: string;
    proposalId: string;
    title: string;
  }) {
    return this.create({
      userId: input.clientId,
      type: 'proposal_received',
      priority: 'medium',
      title: 'Proposal withdrawn',
      message: `A provider withdrew a proposal: ${input.title}`,
      actionUrl: `/proposals/${input.proposalId}`,
      data: input,
    });
  }

  async notifyDealUpdate(input: {
    userId: string;
    dealId: string;
    title: string;
    message: string;
    priority?: NotificationPriority;
  }) {
    return this.create({
      userId: input.userId,
      type: 'deal_update',
      priority: input.priority || 'medium',
      title: input.title,
      message: input.message,
      actionUrl: `/deals/${input.dealId}`,
      data: { dealId: input.dealId },
    });
  }

  async notifyPaymentReceived(input: {
    userId: string;
    dealId?: string;
    amount: number;
    currency: string;
    transactionId?: string;
  }) {
    return this.create({
      userId: input.userId,
      type: 'payment_received',
      priority: 'high',
      title: 'Payment received',
      message: `Payment received: ${input.amount} ${input.currency}`,
      actionUrl: input.dealId ? `/deals/${input.dealId}` : '/(tabs)/profile',
      data: input,
    });
  }

  async notifyReviewReceived(input: {
    userId: string;
    dealId: string;
    reviewId: string;
    rating: number;
  }) {
    return this.create({
      userId: input.userId,
      type: 'review_received',
      priority: 'medium',
      title: 'New review received',
      message: `You received a ${input.rating}-star review.`,
      actionUrl: `/deals/${input.dealId}`,
      data: input,
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
