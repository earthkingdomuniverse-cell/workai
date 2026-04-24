import { randomUUID } from 'node:crypto';
import { prisma } from '../db/prismaClient';
import { Message, Proposal, Thread } from '../types/skillExchange';

class SkillExchangeDbService {
  private db = prisma;
  private readyPromise: Promise<void> | null = null;

  private toIsoString(value: unknown): string {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return new Date(value as string | number).toISOString();
  }

  private normalizeMessage(message: any): Message {
    return {
      id: message.id,
      threadId: message.threadId,
      senderId: message.senderId,
      text: message.text,
      timestamp: this.toIsoString(message.timestamp),
    };
  }

  private normalizeProposal(proposal: any): Proposal {
    return {
      id: proposal.id,
      threadId: proposal.threadId,
      mentorId: proposal.mentorId,
      plan: proposal.plan,
      price: proposal.price ?? undefined,
      durationDays: proposal.durationDays ?? undefined,
      status: proposal.status,
      createdAt: this.toIsoString(proposal.createdAt),
      updatedAt: this.toIsoString(proposal.updatedAt),
    };
  }

  private normalizeThread(thread: any): Thread {
    return {
      id: thread.id,
      topic: thread.topic,
      status: thread.status,
      createdAt: this.toIsoString(thread.createdAt),
      updatedAt: this.toIsoString(thread.updatedAt),
      messages: Array.isArray(thread.messages)
        ? thread.messages.map((message: any) => this.normalizeMessage(message))
        : undefined,
      proposals: Array.isArray(thread.proposals)
        ? thread.proposals.map((proposal: any) => this.normalizeProposal(proposal))
        : undefined,
    };
  }

  private async ensureReady(): Promise<void> {
    if (!this.readyPromise) {
      this.readyPromise = (async () => {
        await this.db.$connect();
        await this.db.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
      })();
    }

    await this.readyPromise;
  }

  async createThread(creatorId: string, topic: string): Promise<Thread> {
    void creatorId;
    await this.ensureReady();
    const now = new Date();
    const thread = await this.db.thread.create({
      data: {
        id: randomUUID(),
        topic,
        status: 'open',
        createdAt: now,
        updatedAt: now,
      },
    });

    return this.normalizeThread(thread);
  }

  async getThreads(): Promise<Thread[]> {
    await this.ensureReady();
    const threads = await this.db.thread.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return threads.map((thread: any) => this.normalizeThread(thread));
  }

  async getThread(id: string): Promise<Thread | undefined> {
    await this.ensureReady();
    const thread = await this.db.thread.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { timestamp: 'asc' } },
        proposals: { orderBy: { createdAt: 'desc' } },
      },
    });

    return thread ? this.normalizeThread(thread) : undefined;
  }

  async postMessage(threadId: string, senderId: string, text: string): Promise<Message> {
    await this.ensureReady();
    const thread = await this.db.thread.findUnique({ where: { id: threadId } });
    if (!thread) throw new Error('Thread not found');

    const now = new Date();
    const message = await this.db.message.create({
      data: {
        id: randomUUID(),
        threadId,
        senderId,
        text,
        timestamp: now,
      },
    });

    await this.db.thread.update({
      where: { id: threadId },
      data: { updatedAt: now },
    });

    return this.normalizeMessage(message);
  }

  async propose(
    threadId: string,
    mentorId: string,
    plan: string,
    price?: number,
    durationDays?: number,
  ): Promise<Proposal> {
    await this.ensureReady();
    const thread = await this.db.thread.findUnique({ where: { id: threadId } });
    if (!thread) throw new Error('Thread not found');

    const now = new Date();
    const proposal = await this.db.legacyProposal.create({
      data: {
        id: randomUUID(),
        threadId,
        mentorId,
        plan,
        price,
        durationDays,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      },
    });

    await this.db.thread.update({
      where: { id: threadId },
      data: { updatedAt: now },
    });

    return this.normalizeProposal(proposal);
  }

  async acceptProposal(threadId: string, proposalId: string): Promise<Proposal> {
    await this.ensureReady();
    const thread = await this.db.thread.findUnique({ where: { id: threadId } });
    if (!thread) throw new Error('Thread not found');

    const existing = await this.db.legacyProposal.findUnique({ where: { id: proposalId } });
    if (!existing || existing.threadId !== threadId) {
      throw new Error('Proposal not found');
    }

    const now = new Date();
    const proposal = await this.db.legacyProposal.update({
      where: { id: proposalId },
      data: { status: 'accepted', updatedAt: now },
    });

    await this.db.thread.update({
      where: { id: threadId },
      data: { status: 'in_progress', updatedAt: now },
    });

    return this.normalizeProposal(proposal);
  }

  async rejectProposal(threadId: string, proposalId: string): Promise<Proposal> {
    await this.ensureReady();
    const thread = await this.db.thread.findUnique({ where: { id: threadId } });
    if (!thread) throw new Error('Thread not found');

    const existing = await this.db.legacyProposal.findUnique({ where: { id: proposalId } });
    if (!existing || existing.threadId !== threadId) {
      throw new Error('Proposal not found');
    }

    const proposal = await this.db.legacyProposal.update({
      where: { id: proposalId },
      data: { status: 'rejected', updatedAt: new Date() },
    });

    return this.normalizeProposal(proposal);
  }

  async closeThread(threadId: string): Promise<void> {
    await this.ensureReady();
    const thread = await this.db.thread.findUnique({ where: { id: threadId } });
    if (!thread) {
      throw new Error('Thread not found');
    }

    await this.db.thread.update({
      where: { id: threadId },
      data: { status: 'closed', updatedAt: new Date() },
    });
  }
}

export const skillExchangeDbService = new SkillExchangeDbService();
export default skillExchangeDbService;
