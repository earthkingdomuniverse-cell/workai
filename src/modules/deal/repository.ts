import { Deal, DealInput, DealFilter } from './types';
import { mockDeals } from '../../mocks/deals';

export interface DealRepository {
  findAll(filters?: DealFilter): Promise<Deal[]>;
  findById(id: string): Promise<Deal | null>;
  findByProviderId(providerId: string): Promise<Deal[]>;
  findByClientId(clientId: string): Promise<Deal[]>;
  create(data: DealInput & { providerId: string; clientId: string }): Promise<Deal>;
  update(id: string, data: Partial<Deal>): Promise<Deal>;
  updateStatus(id: string, status: Deal['status']): Promise<Deal>;
  addTimelineEvent(dealId: string, event: any): Promise<void>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
}

class InMemoryDealRepository implements DealRepository {
  private deals: Deal[] = [...mockDeals];

  async findAll(filters?: DealFilter): Promise<Deal[]> {
    let result = [...this.deals];

    if (filters) {
      const {
        providerId,
        clientId,
        status,
        minAmount,
        maxAmount,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      if (providerId) {
        result = result.filter((d) => d.providerId === providerId);
      }

      if (clientId) {
        result = result.filter((d) => d.clientId === clientId);
      }

      if (status) {
        result = result.filter((d) => d.status === status);
      }

      if (minAmount !== undefined) {
        result = result.filter((d) => d.amount >= minAmount);
      }

      if (maxAmount !== undefined) {
        result = result.filter((d) => d.amount <= maxAmount);
      }

      // Sort
      const sorted = [...result].sort((a, b) => {
        let compare = 0;
        switch (sortBy) {
          case 'amount':
            compare = b.amount - a.amount;
            break;
          case 'status':
            compare = (b.status || '').localeCompare(a.status || '');
            break;
          case 'createdAt':
          default:
            compare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            break;
        }
        return sortOrder === 'asc' ? compare : -compare;
      });

      result = sorted;
    }

    return result;
  }

  async findById(id: string): Promise<Deal | null> {
    return this.deals.find((d) => d.id === id) || null;
  }

  async findByProviderId(providerId: string): Promise<Deal[]> {
    return this.deals.filter((d) => d.providerId === providerId);
  }

  async findByClientId(clientId: string): Promise<Deal[]> {
    return this.deals.filter((d) => d.clientId === clientId);
  }

  async create(data: DealInput & { providerId: string; clientId: string }): Promise<Deal> {
    const deal: Deal = {
      id: `deal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      offerId: data.offerId,
      requestId: data.requestId,
      proposalId: data.proposalId,
      providerId: data.providerId,
      clientId: data.clientId,
      status: 'created',
      title: data.title,
      description: data.description,
      amount: data.amount,
      currency: data.currency || 'USD',
      fundedAmount: 0,
      releasedAmount: 0,
      serviceFee: data.amount * 0.05, // 5% service fee
      milestones: data.milestones || [],
      attachments: data.attachments,
      views: 0,
      timeline: [
        {
          id: `timeline_${Date.now()}`,
          type: 'status_change',
          title: 'Deal Created',
          status: 'created',
          userId: data.clientId,
          userName: 'System',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.deals.push(deal);
    return deal;
  }

  async update(id: string, data: Partial<Deal>): Promise<Deal> {
    const index = this.deals.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Deal ${id} not found`);
    }

    const updated: Deal = {
      ...this.deals[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.deals[index] = updated;
    return updated;
  }

  async updateStatus(id: string, status: Deal['status']): Promise<Deal> {
    const index = this.deals.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Deal ${id} not found`);
    }

    const updated: Deal = {
      ...this.deals[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    this.deals[index] = updated;

    // Add timeline event
    updated.timeline.push({
      id: `timeline_${Date.now()}`,
      type: 'status_change',
      title: `Deal ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      status,
      userId: 'system',
      userName: 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return updated;
  }

  async addTimelineEvent(dealId: string, event: any): Promise<void> {
    const deal = await this.findById(dealId);
    if (deal) {
      deal.timeline.push({
        id: `timeline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        ...event,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.deals.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Deal ${id} not found`);
    }
    this.deals.splice(index, 1);
  }

  async incrementViews(id: string): Promise<void> {
    const deal = await this.findById(id);
    if (deal) {
      deal.views = (deal.views || 0) + 1;
    }
  }
}

export const dealRepository: DealRepository = new InMemoryDealRepository();
