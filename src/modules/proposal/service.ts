import { proposalRepository } from './repository';
import { CreateProposalInput } from './schemas';
import { Proposal, ProposalFilter, ProposalListResult } from './types';
import { AppError } from '../../lib/errors';
import { notificationService } from '../../services/notificationService';

export interface ProposalService {
  getProposals(filters?: ProposalFilter): Promise<ProposalListResult>;
  getProposalById(id: string): Promise<Proposal>;
  getProposalsByRequest(requestId: string): Promise<ProposalListResult>;
  getProposalsByOffer(offerId: string): Promise<ProposalListResult>;
  getMyProposals(providerId: string): Promise<ProposalListResult>;
  getProposalsForClient(clientId: string): Promise<ProposalListResult>;
  createProposal(
    data: CreateProposalInput,
    providerId: string,
    clientId: string,
  ): Promise<Proposal>;
  acceptProposal(id: string, clientId: string): Promise<Proposal>;
  rejectProposal(id: string, clientId: string): Promise<Proposal>;
  withdrawProposal(id: string, providerId: string): Promise<Proposal>;
  updateProposal(id: string, data: Partial<CreateProposalInput>): Promise<Proposal>;
  deleteProposal(id: string): Promise<void>;
}

function notifyBestEffort(task: Promise<any>) {
  task.catch((error) => {
    console.warn('Notification hook failed:', error?.message || error);
  });
}

class ProposalServiceImpl implements ProposalService {
  async getProposals(filters?: ProposalFilter): Promise<ProposalListResult> {
    const items = await proposalRepository.findAll(filters);
    return { items, total: items.length };
  }

  async getProposalById(id: string): Promise<Proposal> {
    const proposal = await proposalRepository.findById(id);
    if (!proposal) {
      throw new AppError('Proposal not found', { code: 'NOT_FOUND', statusCode: 404 });
    }
    return proposal;
  }

  async getProposalsByRequest(requestId: string): Promise<ProposalListResult> {
    const items = await proposalRepository.findByRequestId(requestId);
    return { items, total: items.length };
  }

  async getProposalsByOffer(offerId: string): Promise<ProposalListResult> {
    const items = await proposalRepository.findByOfferId(offerId);
    return { items, total: items.length };
  }

  async getMyProposals(providerId: string): Promise<ProposalListResult> {
    const items = await proposalRepository.findByProviderId(providerId);
    return { items, total: items.length };
  }

  async getProposalsForClient(clientId: string): Promise<ProposalListResult> {
    const items = await proposalRepository.findByClientId(clientId);
    return { items, total: items.length };
  }

  async createProposal(
    data: CreateProposalInput,
    providerId: string,
    clientId: string,
  ): Promise<Proposal> {
    if (!data.requestId && !data.offerId) {
      throw new AppError('Must provide either requestId or offerId', {
        code: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    const proposal = await proposalRepository.create({
      ...data,
      providerId,
      clientId,
    });

    notifyBestEffort(notificationService.notifyProposalReceived({
      clientId: proposal.clientId,
      providerId: proposal.providerId,
      proposalId: proposal.id,
      title: proposal.title,
      requestId: proposal.requestId,
      offerId: proposal.offerId,
    }));

    return proposal;
  }

  async acceptProposal(id: string, clientId: string): Promise<Proposal> {
    const proposal = await this.getProposalById(id);

    if (proposal.clientId !== clientId) {
      throw new AppError('Only the client can accept this proposal', {
        code: 'FORBIDDEN',
        statusCode: 403,
      });
    }

    if (proposal.status !== 'pending') {
      throw new AppError(`Cannot accept proposal with status: ${proposal.status}`, {
        code: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    const updated = await proposalRepository.updateStatus(id, 'accepted');
    notifyBestEffort(notificationService.notifyProposalAccepted({
      clientId: updated.clientId,
      providerId: updated.providerId,
      proposalId: updated.id,
      title: updated.title,
    }));
    return updated;
  }

  async rejectProposal(id: string, clientId: string): Promise<Proposal> {
    const proposal = await this.getProposalById(id);

    if (proposal.clientId !== clientId) {
      throw new AppError('Only the client can reject this proposal', {
        code: 'FORBIDDEN',
        statusCode: 403,
      });
    }

    if (proposal.status !== 'pending') {
      throw new AppError(`Cannot reject proposal with status: ${proposal.status}`, {
        code: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    const updated = await proposalRepository.updateStatus(id, 'rejected');
    notifyBestEffort(notificationService.notifyProposalRejected({
      clientId: updated.clientId,
      providerId: updated.providerId,
      proposalId: updated.id,
      title: updated.title,
    }));
    return updated;
  }

  async withdrawProposal(id: string, providerId: string): Promise<Proposal> {
    const proposal = await this.getProposalById(id);

    if (proposal.providerId !== providerId) {
      throw new AppError('Only the provider can withdraw this proposal', {
        code: 'FORBIDDEN',
        statusCode: 403,
      });
    }

    if (proposal.status !== 'pending') {
      throw new AppError(`Cannot withdraw proposal with status: ${proposal.status}`, {
        code: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    const updated = await proposalRepository.updateStatus(id, 'withdrawn');
    notifyBestEffort(notificationService.notifyProposalWithdrawn({
      clientId: updated.clientId,
      providerId: updated.providerId,
      proposalId: updated.id,
      title: updated.title,
    }));
    return updated;
  }

  async updateProposal(id: string, data: Partial<CreateProposalInput>): Promise<Proposal> {
    const proposal = await this.getProposalById(id);

    if (proposal.status !== 'pending') {
      throw new AppError(`Cannot update proposal with status: ${proposal.status}`, {
        code: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    const updated = await proposalRepository.update(id, data);
    return updated;
  }

  async deleteProposal(id: string): Promise<void> {
    const proposal = await this.getProposalById(id);

    if (proposal.status !== 'pending') {
      throw new AppError(`Cannot delete proposal with status: ${proposal.status}`, {
        code: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    await proposalRepository.delete(id);
  }
}

export const proposalService: ProposalService = new ProposalServiceImpl();
