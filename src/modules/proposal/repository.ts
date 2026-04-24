import { Proposal, ProposalFilter, ProposalInput } from './types';
import { prisma } from '../../db/prismaClient';

function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

function formatProposal(row: any): Proposal {
  return {
    ...row,
    attachments: parseJsonArray(row.attachments),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
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
    let orderBy: any = { createdAt: 'desc' };

    if (filters) {
      if (filters.requestId) where.requestId = filters.requestId;
      if (filters.offerId) where.offerId = filters.offerId;
      if (filters.providerId) where.providerId = filters.providerId;
      if (filters.clientId) where.clientId = filters.clientId;
      if (filters.status) where.status = filters.status;

      if (filters.sortBy === 'amount') {
        orderBy = { proposedAmount: filters.sortOrder || 'desc' };
      } else {
        orderBy = { createdAt: filters.sortOrder || 'desc' };
      }
    }

    const results = await prisma.marketProposal.findMany({ where, orderBy });
    return results.map(formatProposal);
  }

  async findById(id: string): Promise<Proposal | null> {
    const row = await prisma.marketProposal.findUnique({ where: { id } });
    return row ? formatProposal(row) : null;
  }

  async findByRequestId(requestId: string): Promise<Proposal[]> {
    const results = await prisma.marketProposal.findMany({ where: { requestId } });
    return results.map(formatProposal);
  }

  async findByOfferId(offerId: string): Promise<Proposal[]> {
    const results = await prisma.marketProposal.findMany({ where: { offerId } });
    return results.map(formatProposal);
  }

  async findByProviderId(providerId: string): Promise<Proposal[]> {
    const results = await prisma.marketProposal.findMany({ where: { providerId } });
    return results.map(formatProposal);
  }

  async findByClientId(clientId: string): Promise<Proposal[]> {
    const results = await prisma.marketProposal.findMany({ where: { clientId } });
    return results.map(formatProposal);
  }

  async create(data: ProposalInput & { providerId: string; clientId: string }): Promise<Proposal> {
    const row = await prisma.marketProposal.create({
      data: {
        requestId: data.requestId || null,
        offerId: data.offerId || null,
        providerId: data.providerId,
        clientId: data.clientId,
        status: 'pending',
        title: data.title,
        message: data.message,
        proposedAmount: data.proposedAmount,
        currency: data.currency || 'USD',
        estimatedDeliveryDays: data.estimatedDeliveryDays,
        revisions: data.revisions || null,
        attachments: data.attachments ? JSON.stringify(data.attachments) : null,
      },
    });
    return formatProposal(row);
  }

  async update(id: string, data: Partial<ProposalInput>): Promise<Proposal> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.message !== undefined) updateData.message = data.message;
    if (data.proposedAmount !== undefined) updateData.proposedAmount = data.proposedAmount;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.estimatedDeliveryDays !== undefined)
      updateData.estimatedDeliveryDays = data.estimatedDeliveryDays;
    if (data.revisions !== undefined) updateData.revisions = data.revisions;
    if (data.attachments !== undefined) updateData.attachments = JSON.stringify(data.attachments);

    const row = await prisma.marketProposal.update({ where: { id }, data: updateData });
    return formatProposal(row);
  }

  async updateStatus(id: string, status: Proposal['status']): Promise<Proposal> {
    const row = await prisma.marketProposal.update({
      where: { id },
      data: { status },
    });
    return formatProposal(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.marketProposal.delete({ where: { id } });
  }

  async incrementViews(id: string): Promise<void> {
    await prisma.marketProposal.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }
}

export const proposalRepository: ProposalRepository = new PrismaProposalRepository();
