import { dealRepository } from './repository';
import {
  CreateDealInput,
  FundDealInput,
  SubmitWorkInput,
  ReleaseFundsInput,
  CreateDisputeInput,
} from './schemas';
import { Deal, DealFilter } from './types';
import { AppError } from '../../lib/errors';

export interface DealService {
  getDeals(filters?: DealFilter): Promise<Deal[]>;
  getDealById(id: string): Promise<Deal>;
  getMyDealsAsProvider(providerId: string): Promise<Deal[]>;
  getDealsAsClient(clientId: string): Promise<Deal[]>;
  createDeal(data: CreateDealInput, providerId: string, clientId: string): Promise<Deal>;
  fundDeal(id: string, data: FundDealInput, userId: string): Promise<Deal>;
  submitWork(id: string, data: SubmitWorkInput, userId: string): Promise<Deal>;
  releaseFunds(id: string, data: ReleaseFundsInput, userId: string): Promise<Deal>;
  createDispute(id: string, data: CreateDisputeInput, userId: string): Promise<Deal>;
  resolveDispute(id: string, resolution: string, userId: string): Promise<Deal>;
  updateDeal(id: string, data: Partial<Deal>): Promise<Deal>;
  deleteDeal(id: string): Promise<void>;
}

class DealServiceImpl implements DealService {
  async getDeals(filters?: DealFilter): Promise<Deal[]> {
    return dealRepository.findAll(filters);
  }

  async getDealById(id: string): Promise<Deal> {
    const deal = await dealRepository.findById(id);
    if (!deal) {
      throw new AppError('Deal not found', 'NOT_FOUND', 404);
    }
    return deal;
  }

  async getMyDealsAsProvider(providerId: string): Promise<Deal[]> {
    return dealRepository.findByProviderId(providerId);
  }

  async getDealsAsClient(clientId: string): Promise<Deal[]> {
    return dealRepository.findByClientId(clientId);
  }

  async createDeal(data: CreateDealInput, providerId: string, clientId: string): Promise<Deal> {
    // Validate that either offerId, requestId, or proposalId is provided
    if (!data.offerId && !data.requestId && !data.proposalId) {
      throw new AppError(
        'Must provide either offerId, requestId, or proposalId',
        'BAD_REQUEST',
        400,
      );
    }

    if (data.amount <= 0) {
      throw new AppError('Amount must be positive', 'BAD_REQUEST', 400);
    }

    const deal = await dealRepository.create({
      ...data,
      providerId,
      clientId,
    });

    return deal;
  }

  async fundDeal(id: string, data: FundDealInput, userId: string): Promise<Deal> {
    const deal = await this.getDealById(id);

    // Only client can fund the deal
    if (deal.clientId !== userId) {
      throw new AppError('Only the client can fund this deal', 'FORBIDDEN', 403);
    }

    // Can only fund deals in 'created' status
    if (deal.status !== 'created') {
      throw new AppError(`Cannot fund deal with status: ${deal.status}`, 'BAD_REQUEST', 400);
    }

    // Update funded amount
    const fundedAmount = Math.min(data.amount, deal.amount);
    const updated = await dealRepository.update(id, {
      fundedAmount,
      status: fundedAmount >= deal.amount ? 'funded' : 'created',
    });

    // Add timeline event
    await dealRepository.addTimelineEvent(id, {
      type: 'payment',
      title: 'Deal Funded',
      description: `Funded $${fundedAmount} of $${deal.amount}`,
      amount: fundedAmount,
      userId,
      userName: 'Client',
    });

    return updated;
  }

  async submitWork(id: string, data: SubmitWorkInput, userId: string): Promise<Deal> {
    const deal = await this.getDealById(id);

    // Only provider can submit work
    if (deal.providerId !== userId) {
      throw new AppError('Only the provider can submit work for this deal', 'FORBIDDEN', 403);
    }

    // Can only submit work for deals in 'funded' or 'submitted' status
    if (deal.status !== 'funded' && deal.status !== 'submitted') {
      throw new AppError(
        `Cannot submit work for deal with status: ${deal.status}`,
        'BAD_REQUEST',
        400,
      );
    }

    // Find the milestone
    const milestone = deal.milestones?.find((m) => m.id === data.milestoneId);
    if (!milestone) {
      throw new AppError('Milestone not found', 'NOT_FOUND', 404);
    }

    // Update milestone status
    milestone.status = 'completed';
    milestone.completedAt = new Date().toISOString();
    milestone.attachments = data.attachments;

    // Update deal status if all milestones are completed
    const allCompleted = deal.milestones?.every((m) => m.status === 'completed');
    const updatedStatus = allCompleted ? 'submitted' : 'submitted';

    const updated = await dealRepository.update(id, {
      milestones: deal.milestones,
      status: updatedStatus,
    });

    // Add timeline event
    await dealRepository.addTimelineEvent(id, {
      type: 'milestone_update',
      title: 'Work Submitted',
      description: data.notes || `Milestone "${milestone.title}" completed`,
      milestoneId: data.milestoneId,
      userId,
      userName: 'Provider',
    });

    return updated;
  }

  async releaseFunds(id: string, data: ReleaseFundsInput, userId: string): Promise<Deal> {
    const deal = await this.getDealById(id);

    // Only client can release funds
    if (deal.clientId !== userId) {
      throw new AppError('Only the client can release funds for this deal', 'FORBIDDEN', 403);
    }

    // Can only release funds for deals in 'submitted' status
    if (deal.status !== 'submitted') {
      throw new AppError(
        `Cannot release funds for deal with status: ${deal.status}`,
        'BAD_REQUEST',
        400,
      );
    }

    // Update released amount
    const releaseAmount = data.amount || deal.amount;
    const newReleasedAmount = Math.min(deal.releasedAmount + releaseAmount, deal.amount);

    const updated = await dealRepository.update(id, {
      releasedAmount: newReleasedAmount,
      status: newReleasedAmount >= deal.amount ? 'released' : 'submitted',
    });

    // Add timeline event
    await dealRepository.addTimelineEvent(id, {
      type: 'payment',
      title: 'Funds Released',
      description: data.notes || `Released $${releaseAmount}`,
      amount: releaseAmount,
      userId,
      userName: 'Client',
    });

    return updated;
  }

  async createDispute(id: string, data: CreateDisputeInput, userId: string): Promise<Deal> {
    const deal = await this.getDealById(id);

    // Either client or provider can create dispute
    if (deal.clientId !== userId && deal.providerId !== userId) {
      throw new AppError(
        'Only the client or provider can create a dispute for this deal',
        'FORBIDDEN',
        403,
      );
    }

    // Can only dispute deals in 'funded', 'submitted', or 'released' status
    if (!['funded', 'submitted', 'released'].includes(deal.status)) {
      throw new AppError(`Cannot dispute deal with status: ${deal.status}`, 'BAD_REQUEST', 400);
    }

    const updated = await dealRepository.update(id, {
      status: 'disputed',
      dispute: {
        id: `dispute_${Date.now()}`,
        reason: data.reason,
        description: data.description,
        status: 'open',
        createdAt: new Date().toISOString(),
      },
    });

    // Add timeline event
    await dealRepository.addTimelineEvent(id, {
      type: 'dispute',
      title: 'Dispute Created',
      description: data.reason,
      userId,
      userName: userId === deal.clientId ? 'Client' : 'Provider',
    });

    return updated;
  }

  async resolveDispute(id: string, resolution: string, userId: string): Promise<Deal> {
    const deal = await this.getDealById(id);

    // Only admin/operator can resolve disputes
    // For now, we'll allow either party to resolve with mutual agreement
    if (deal.clientId !== userId && deal.providerId !== userId) {
      throw new AppError('Only the client or provider can resolve this dispute', 'FORBIDDEN', 403);
    }

    if (!deal.dispute) {
      throw new AppError('No dispute found for this deal', 'BAD_REQUEST', 400);
    }

    if (deal.dispute.status !== 'open') {
      throw new AppError(
        `Cannot resolve dispute with status: ${deal.dispute.status}`,
        'BAD_REQUEST',
        400,
      );
    }

    const updated = await dealRepository.update(id, {
      dispute: {
        ...deal.dispute,
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        resolution,
      },
      status: 'released', // Return to previous active status after dispute resolved
    });

    // Add timeline event
    await dealRepository.addTimelineEvent(id, {
      type: 'dispute',
      title: 'Dispute Resolved',
      description: resolution,
      userId,
      userName: userId === deal.clientId ? 'Client' : 'Provider',
    });

    return updated;
  }

  async updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
    // Only update allowed fields
    const allowedFields = ['title', 'description', 'milestones'];
    const updateData: any = {};

    for (const key of allowedFields) {
      if (key in data) {
        updateData[key] = (data as any)[key];
      }
    }

    const updated = await dealRepository.update(id, updateData);
    return updated;
  }

  async deleteDeal(id: string): Promise<void> {
    const deal = await this.getDealById(id);

    // Can only delete deals in 'created' status
    if (deal.status !== 'created') {
      throw new AppError(`Cannot delete deal with status: ${deal.status}`, 'BAD_REQUEST', 400);
    }

    await dealRepository.delete(id);
  }
}

export const dealService: DealService = new DealServiceImpl();
