import { prisma } from '../../lib/prisma';
import { Proposal, ProposalFilter, ProposalInput } from './types';

function toProposal(row: any): Proposal {
  return {
    id: row.id,
    requestId: row.requestId ?? undefined,
    offerId: row.offerId ?? undefined,
    providerId: row.providerId,
    clientId: row.clientId,
    status: row.status,
    title: row.title,
    message: row.message,
    proposedAmount: row.proposedAmount,
    currency: row.currency,
    estimatedDeliveryDays: row.estimatedDeliveryDays,
    revisions: row.revisions,
    attachments: [],
    milestones: [],
    views: 0,
    likedByClient: false,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

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

class PrismaProposalRepository implements ProposalRepository {
  async findAll(filters?: ProposalFilter): Promise<Proposal[]> {
    const where: any = {};

    if (filters?.requestId) where.requestId = filters.requestId;
    if (filters?.offerId) where.offerId = filters.offerId;
    if (filters?.providerId) where.providerId = filters.providerId;
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.status) where.status = filters.status;

    const orderBy =
      filters?.sortBy === 'amount'
        ? { proposedAmount: filters.sortOrder || 'desc' }
        : { createdAt: filters?.sortOrder || 'desc' };

    const rows = await prisma.proposal.findMany({
      where,
      orderBy,
      skip: filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : undefined,
      take: filters?.limit,
    });

    return rows.map(toProposal);
  }

  async findById(id: string): Promise<Proposal | null> {
    const row = await prisma.proposal.findUnique({ where: { id } });
    return row ? toProposal(row) : null;
  }

  async findByRequestId(requestId: string): Promise<Proposal[]> {
    const rows = await prisma.proposal.findMany({ where: { requestId } });
    return rows.map(toProposal);
  }

  async findByOfferId(offerId: string): Promise<Proposal[]> {
    const rows = await prisma.proposal.findMany({ where: { offerId } });
    return rows.map(toProposal);
  }

  async findByProviderId(providerId: string): Promise<Proposal[]> {
    const rows = await prisma.proposal.findMany({ where: { providerId } });
    return rows.map(toProposal);
  }

  async findByClientId(clientId: string): Promise<Proposal[]> {
    const rows = await prisma.proposal.findMany({ where: { clientId } });
    return rows.map(toProposal);
  }

  async create(data: ProposalInput & { providerId: string; clientId: string }): Promise<Proposal> {
    const row = await prisma.proposal.create({
      data: {
        requestId: data.requestId,
        offerId: data.offerId,
        providerId: data.providerId,
        clientId: data.clientId,
        title: data.title,
        message: data.message,
        proposedAmount: data.proposedAmount,
        currency: data.currency || 'USD',
        estimatedDeliveryDays: data.estimatedDeliveryDays,
        revisions: data.revisions || 1,
        status: 'pending',
      },
    });

    return toProposal(row);
  }

  async update(id: string, data: Partial<ProposalInput>): Promise<Proposal> {
    const row = await prisma.proposal.update({
      where: { id },
      data: {
        title: data.title,
        message: data.message,
        proposedAmount: data.proposedAmount,
        currency: data.currency,
        estimatedDeliveryDays: data.estimatedDeliveryDays,
        revisions: data.revisions,
      },
    });

    return toProposal(row);
  }

  async updateStatus(id: string, status: Proposal['status']): Promise<Proposal> {
    const row = await prisma.proposal.update({ where: { id }, data: { status } });
    return toProposal(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.proposal.delete({ where: { id } });
  }

  async incrementViews(_id: string): Promise<void> {
    // Views are not persisted in the first production schema version.
  }
}

export const proposalRepository: ProposalRepository = new PrismaProposalRepository();
