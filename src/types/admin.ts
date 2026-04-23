export interface AdminOverview {
  stats: {
    totalUsers: number;
    totalDeals: number;
    totalOffers: number;
    totalRequests: number;
    totalProposals: number;
    activeDisputes: number;
    pendingReviews: number;
    newUsersToday: number;
    revenueToday: number;
    avgDealSize: number;
  };
  recentActivity: AdminActivity[];
  systemHealth: SystemHealth;
}

export interface AdminActivity {
  id: string;
  type:
    | 'user_registered'
    | 'deal_created'
    | 'dispute_opened'
    | 'review_submitted'
    | 'fraud_detected';
  title: string;
  description: string;
  userId?: string;
  entityId?: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastChecked: string;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: number;
  };
  issues: SystemIssue[];
}

export interface SystemIssue {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  createdAt: string;
}

export interface Dispute {
  id: string;
  dealId: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  resolution?: string;
  evidence: DisputeEvidence[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface DisputeEvidence {
  id: string;
  type: 'message' | 'screenshot' | 'document' | 'other';
  url?: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface RiskProfile {
  userId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: RiskFlag[];
  lastAssessed: string;
  nextReview: string;
}

export interface RiskFlag {
  id: string;
  type: 'high_dispute_rate' | 'suspicious_activity' | 'payment_failures' | 'trust_drop' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
}

export interface FraudSignal {
  id: string;
  userId: string;
  type: 'multiple_accounts' | 'suspicious_ip' | 'unusual_activity' | 'payment_fraud' | 'other';
  description: string;
  confidence: number; // 0-100
  evidence: string[];
  status: 'detected' | 'under_review' | 'confirmed' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewModeration {
  id: string;
  reviewId: string;
  reviewerId: string;
  subjectId: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'flagged' | 'removed';
  flags: ReviewFlag[];
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ReviewFlag {
  id: string;
  type: 'inappropriate' | 'spam' | 'fake' | 'other';
  description: string;
  reportedBy: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface AdminAction {
  id: string;
  type: 'user_ban' | 'deal_refund' | 'review_remove' | 'dispute_resolve' | 'other';
  description: string;
  entityId: string;
  entity_type: 'user' | 'deal' | 'review' | 'dispute' | 'other';
  performedBy: string;
  reason: string;
  timestamp: string;
}

export interface AdminFilter {
  role?: 'operator' | 'admin';
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewQueueItem extends ReviewModeration {}
export interface DisputeCase extends Dispute {}
export interface FraudReport extends FraudSignal {}
export interface RiskSignal extends RiskFlag {}
