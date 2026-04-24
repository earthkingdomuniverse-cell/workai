import {
  AdminAction,
  AdminOverview,
  Dispute,
  FraudSignal,
  ReviewModeration,
  RiskProfile,
} from '../types/admin';
import { prisma } from '../db/prismaClient';
import { NotFoundError, BadRequestError } from '../lib/errors';

// Inline mock for disputes since it's not in Prisma schema yet
const mockDisputes: Dispute[] = [
  {
    id: 'dispute_1',
    dealId: 'deal_1',
    reporterId: 'user_1',
    reportedUserId: 'user_2',
    reason: 'Quality mismatch',
    description: 'Delivered work did not match agreed scope.',
    status: 'open',
    evidence: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export interface AdminService {
  getOverview(): Promise<AdminOverview>;
  getDisputes(): Promise<Dispute[]>;
  getRiskProfiles(): Promise<RiskProfile[]>;
  getFraudSignals(): Promise<FraudSignal[]>;
  getPendingReviews(): Promise<ReviewModeration[]>;
  resolveDispute(id: string, resolution: string, resolvedBy: string): Promise<Dispute>;
  updateDisputeStatus(
    id: string,
    action: 'resolve' | 'reject',
    resolution: string,
    processedBy: string,
  ): Promise<Dispute>;
  flagReview(reviewId: string, flags: any[], flaggedBy: string): Promise<ReviewModeration>;
  banUser(userId: string, reason: string, bannedBy: string): Promise<AdminAction>;
  refundDeal(dealId: string, reason: string, refundedBy: string): Promise<AdminAction>;
  processReviewAction(
    reviewId: string,
    action: string,
    note: string,
    performedBy: string,
  ): Promise<Record<string, any>>;
  getUserRiskProfile(userId: string): Promise<RiskProfile>;
  getFraudSignalsByUser(userId: string): Promise<FraudSignal[]>;
}

class AdminServiceImpl implements AdminService {
  async getOverview(): Promise<AdminOverview> {
    const totalUsers = await prisma.user.count();
    const totalDeals = await prisma.deal.count();
    const totalOffers = await prisma.offer.count();
    const totalRequests = await prisma.request.count();
    const pendingReviews = await prisma.review.count({ where: { status: 'pending' } });

    return {
      stats: {
        totalUsers,
        totalDeals,
        totalOffers,
        totalRequests,
        totalProposals: 0,
        activeDisputes: mockDisputes.filter(
          (item) => item.status === 'open' || item.status === 'under_review',
        ).length,
        pendingReviews,
        newUsersToday: 12,
        revenueToday: 2450,
        avgDealSize: 3500,
      },
      recentActivity: [
        {
          id: 'activity_1',
          type: 'user_registered',
          title: 'New user registered',
          description: 'A new member joined today.',
          timestamp: new Date().toISOString(),
          severity: 'info',
        },
      ],
      systemHealth: {
        status: 'healthy',
        lastChecked: new Date().toISOString(),
        metrics: { cpu: 42, memory: 63, disk: 71, uptime: 86400 },
        issues: [],
      },
    };
  }

  async getDisputes(): Promise<Dispute[]> {
    return mockDisputes as unknown as Dispute[];
  }

  async getRiskProfiles(): Promise<RiskProfile[]> {
    const users = await prisma.user.findMany();
    return users.map((user) => {
      const riskScore = user.trustScore ? Math.max(0, 100 - user.trustScore) : 50;
      return {
        userId: user.id,
        riskScore,
        riskLevel:
          riskScore > 80 ? 'critical' : riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low',
        flags:
          riskScore > 60
            ? [
                {
                  id: `risk_${user.id}`,
                  type: 'trust_drop',
                  description: 'Trust score requires operator review',
                  severity: 'high',
                  detectedAt: new Date().toISOString(),
                },
              ]
            : [],
        lastAssessed: new Date().toISOString(),
        nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    });
  }

  async getFraudSignals(): Promise<FraudSignal[]> {
    return [
      {
        id: 'fraud_1',
        userId: 'user_1',
        type: 'unusual_activity',
        description: 'Repeated account access from unusual pattern',
        confidence: 78,
        evidence: ['Multiple IP changes', 'Short-interval login pattern'],
        status: 'detected',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async getPendingReviews(): Promise<ReviewModeration[]> {
    const reviews = await prisma.review.findMany({ where: { status: 'pending' } });
    return reviews.map((item) => ({
      id: `moderation_${item.id}`,
      reviewId: item.id,
      reviewerId: item.reviewerId,
      subjectId: item.subjectId,
      content: item.comment,
      rating: item.rating,
      status: 'pending',
      flags: [],
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
    }));
  }

  async resolveDispute(id: string, resolution: string, resolvedBy: string): Promise<Dispute> {
    const dispute = (mockDisputes as any[]).find((item) => item.id === id);
    if (!dispute) throw new NotFoundError('Dispute not found');
    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolvedBy = resolvedBy;
    dispute.resolvedAt = new Date().toISOString();
    return dispute as Dispute;
  }

  async updateDisputeStatus(
    id: string,
    action: 'resolve' | 'reject',
    resolution: string,
    processedBy: string,
  ): Promise<Dispute> {
    const dispute = (mockDisputes as any[]).find((item) => item.id === id);
    if (!dispute) throw new NotFoundError('Dispute not found');
    if (dispute.status !== 'open' && dispute.status !== 'under_review') {
      throw new BadRequestError('Dispute is already closed');
    }

    dispute.status = action === 'resolve' ? 'resolved' : 'rejected';
    dispute.resolution = resolution;
    dispute.resolvedBy = processedBy;
    dispute.resolvedAt = new Date().toISOString();

    if (action === 'resolve') {
      console.log(`[Admin] Disputed Resolved: Hoàn tiền (Refund) cho Client của Deal ${dispute.dealId}`);
    } else {
      console.log(`[Admin] Disputed Rejected: Giải phóng quỹ (Release Funds) cho Provider của Deal ${dispute.dealId}`);
    }

    return dispute as Dispute;
  }

  async flagReview(reviewId: string, flags: any[], _flaggedBy: string): Promise<ReviewModeration> {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status: 'flagged' }
    });
    if (!review) throw new NotFoundError('Review not found');

    return {
      id: `moderation_${review.id}`,
      reviewId: review.id,
      reviewerId: review.reviewerId,
      subjectId: review.subjectId,
      content: review.comment,
      rating: review.rating,
      status: 'flagged',
      flags,
      createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : String(review.createdAt),
    };
  }

  async banUser(userId: string, reason: string, bannedBy: string): Promise<AdminAction> {
    return {
      id: `action_${Date.now()}`,
      type: 'user_ban',
      description: `User ${userId} banned`,
      entityId: userId,
      entity_type: 'user',
      performedBy: bannedBy,
      reason,
      timestamp: new Date().toISOString(),
    };
  }

  async refundDeal(dealId: string, reason: string, refundedBy: string): Promise<AdminAction> {
    return {
      id: `action_${Date.now()}`,
      type: 'deal_refund',
      description: `Deal ${dealId} refunded`,
      entityId: dealId,
      entity_type: 'deal',
      performedBy: refundedBy,
      reason,
      timestamp: new Date().toISOString(),
    };
  }

  async processReviewAction(
    reviewId: string,
    action: string,
    note: string,
    performedBy: string,
  ): Promise<Record<string, any>> {
    const status = action === 'approve_release' ? 'approved' : action === 'refund_client' ? 'refunded' : 'held';
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status }
    });
    if (!review) throw new NotFoundError('Review not found');

    return {
      reviewId,
      action,
      note,
      status: review.status,
      processedBy: performedBy,
      processedAt: new Date().toISOString(),
    };
  }

  async getUserRiskProfile(userId: string): Promise<RiskProfile> {
    const all = await this.getRiskProfiles();
    const profile = all.find((item) => item.userId === userId);
    if (!profile) throw new NotFoundError('User risk profile not found');
    return profile;
  }

  async getFraudSignalsByUser(userId: string): Promise<FraudSignal[]> {
    const items = await this.getFraudSignals();
    return items.filter((item) => item.userId === userId);
  }
}

export const adminService: AdminService = new AdminServiceImpl();
