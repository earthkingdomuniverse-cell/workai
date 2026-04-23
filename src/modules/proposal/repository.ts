import { Proposal, ProposalFilter, ProposalInput } from './types';
import { mockProposals } from '../../mocks/proposals';

export interface ProposalRepository {
  findAll(filters?: ProposalFilter): Promise<Proposal[]>;
  findById(id: string): Promise<Proposal | null>;
  findByRequestId(requestId: string): Promise<Proposal[]>;
  findByOfferId(offerId: string): Promise<Proposal[]>;
  findByProviderId(providerId: string): Promise<Proposal[]>;
  findByClientId(clientId: string): Promise<Proposal[]>;
  create(data: ProposalInput & { providerId: string; clientId: string }): Promise<Proposal>;
  update(id: string, data: Partial<ProposalInput>): Promise<Proposal>;
  updateStatus(id: string, status: Proposal['status']): Promise<Proposal>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
}

class InMemoryProposalRepository implements ProposalRepository {
  private proposals: Proposal[] = [...mockProposals];

  async findAll(filters?: ProposalFilter): Promise<Proposal[]> {
    let result = [...this.proposals];

    if (filters) {
      const {
        requestId,
        offerId,
        providerId,
        clientId,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      if (requestId) {
        result = result.filter((p) => p.requestId === requestId);
      }

      if (offerId) {
        result = result.filter((p) => p.offerId === offerId);
      }

      if (providerId) {
        result = result.filter((p) => p.providerId === providerId);
      }

      if (clientId) {
        result = result.filter((p) => p.clientId === clientId);
      }

      if (status) {
        result = result.filter((p) => p.status === status);
      }

      // Sort
      const sorted = [...result].sort((a, b) => {
        let compare = 0;
        switch (sortBy) {
          case 'amount':
            compare = a.proposedAmount - b.proposedAmount;
            break;
          case 'createdAt':
          default:
            compare = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }
        return sortOrder === 'asc' ? compare : -compare;
      });

      result = sorted;
    }

    return result;
  }

  async findById(id: string): Promise<Proposal | null> {
    return this.proposals.find((p) => p.id === id) || null;
  }

  async findByRequestId(requestId: string): Promise<Proposal[]> {
    return this.proposals.filter((p) => p.requestId === requestId);
  }

  async findByOfferId(offerId: string): Promise<Proposal[]> {
    return this.proposals.filter((p) => p.offerId === offerId);
  }

  async findByProviderId(providerId: string): Promise<Proposal[]> {
    return this.proposals.filter((p) => p.providerId === providerId);
  }

  async findByClientId(clientId: string): Promise<Proposal[]> {
    return this.proposals.filter((p) => p.clientId === clientId);
  }

  async create(data: ProposalInput & { providerId: string; clientId: string }): Promise<Proposal> {
    const proposal: Proposal = {
      id: `proposal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      requestId: data.requestId,
      offerId: data.offerId,
      providerId: data.providerId,
      clientId: data.clientId,
      status: 'pending',
      title: data.title,
      message: data.message,
      proposedAmount: data.proposedAmount,
      currency: data.currency || 'USD',
      estimatedDeliveryDays: data.estimatedDeliveryDays,
      revisions: data.revisions,
      attachments: data.attachments,
      milestones: data.milestones,
      views: 0,
      likedByClient: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.proposals.push(proposal);
    return proposal;
  }

  async update(id: string, data: Partial<ProposalInput>): Promise<Proposal> {
    const index = this.proposals.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Proposal ${id} not found`);
    }

    const updated: Proposal = {
      ...this.proposals[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.proposals[index] = updated;
    return updated;
  }

  async updateStatus(id: string, status: Proposal['status']): Promise<Proposal> {
    const index = this.proposals.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Proposal ${id} not found`);
    }

    const updated: Proposal = {
      ...this.proposals[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    this.proposals[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = this.proposals.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Proposal ${id} not found`);
    }
    this.proposals.splice(index, 1);
  }

  async incrementViews(id: string): Promise<void> {
    const proposal = await this.findById(id);
    if (!proposal) return;
    proposal.views += 1;
    proposal.updatedAt = new Date().toISOString();
  }
}

export const proposalRepository: ProposalRepository = new InMemoryProposalRepository();
